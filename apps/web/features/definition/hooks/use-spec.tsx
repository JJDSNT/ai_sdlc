"use client";

import { useCallback, useEffect, useState } from "react";
import { parseSpecSections, stringifySpecSections, type SpecSection } from "@/features/definition/lib/spec-sections";

export type SpecStatus = "draft" | "validated" | "active" | "deprecated";

type SpecFrontmatterPayload = {
  id: string;
  title: string;
  status: SpecStatus;
  owner: string;
  tags?: string[];
};

export function useSpec() {
  const [specId, setSpecId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [status, setStatus] = useState<SpecStatus>("draft");
  const [sections, setSections] = useState<SpecSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSpec = useCallback(async (id: string) => {
    const res = await fetch(`/api/ai-context/specs/${id}`, { cache: "no-store" });
    const text = await res.text();
    const data = text ? JSON.parse(text) : { ok: false };

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || "Failed to load spec");
    }

    const frontmatter = data.frontmatter as SpecFrontmatterPayload;
    setSpecId(frontmatter.id);
    setTitle(frontmatter.title);
    setStatus(frontmatter.status);
    setSections(parseSpecSections(data.body ?? ""));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-context/specs", { cache: "no-store" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : { ok: true, specs: [] };

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to fetch specs");
      }

      const specs = (Array.isArray(data.specs) ? data.specs : []) as SpecFrontmatterPayload[];

      if (specs.length === 0) {
        setSpecId(null);
        setSections([]);
        return;
      }

      await loadSpec(specs[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch specs");
    } finally {
      setLoading(false);
    }
  }, [loadSpec]);

  const createInitialSpec = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-context/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Spec sem título", owner: "user" }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : { ok: false };

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to create spec");
      }

      await loadSpec(data.frontmatter.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create spec");
    } finally {
      setSaving(false);
    }
  }, [loadSpec]);

  const updateSectionContent = useCallback((heading: string, content: string) => {
    setSections((current) =>
      current.map((section) => (section.heading === heading ? { ...section, content } : section))
    );
  }, []);

  const saveSections = useCallback(async () => {
    if (!specId) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/ai-context/specs/${specId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: stringifySpecSections(sections) }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : { ok: false };

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to save spec");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save spec");
    } finally {
      setSaving(false);
    }
  }, [specId, sections]);

  const moveStatus = useCallback(
    async (nextStatus: SpecStatus) => {
      if (!specId) return;

      setSaving(true);
      setError(null);

      try {
        const res = await fetch(`/api/ai-context/specs/${specId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : { ok: false };

        if (!res.ok || !data.ok) {
          throw new Error(data?.error || "Failed to move spec status");
        }

        setStatus(data.frontmatter.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to move spec status");
      } finally {
        setSaving(false);
      }
    },
    [specId]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    specId,
    title,
    status,
    sections,
    loading,
    saving,
    error,
    createInitialSpec,
    updateSectionContent,
    saveSections,
    moveStatus,
  };
}
