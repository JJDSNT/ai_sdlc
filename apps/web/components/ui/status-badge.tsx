//apps/web/src/components/ui/status-badge.tsx
"use client";

type TaskStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

type TaskResult = "success" | "error" | "neutral";

function getStatusPalette(status: TaskStatus, result?: TaskResult) {
  if (status === "completed") {
    switch (result) {
      case "success":
        return {
          fg: "#16a34a",
          bg: "#f0fdf4",
          border: "#bbf7d0",
          label: "succeeded",
        };
      case "error":
        return {
          fg: "#dc2626",
          bg: "#fef2f2",
          border: "#fecaca",
          label: "failed",
        };
      case "neutral":
      default:
        return {
          fg: "#7c3aed",
          bg: "#f5f3ff",
          border: "#ddd6fe",
          label: "completed",
        };
    }
  }

  switch (status) {
    case "queued":
      return {
        fg: "#64748b",
        bg: "#f8fafc",
        border: "#cbd5e1",
        label: "queued",
      };
    case "running":
      return {
        fg: "#2563eb",
        bg: "#eff6ff",
        border: "#bfdbfe",
        label: "running",
      };
    case "failed":
      return {
        fg: "#dc2626",
        bg: "#fef2f2",
        border: "#fecaca",
        label: "failed",
      };
    case "cancelled":
      return {
        fg: "#d97706",
        bg: "#fffbeb",
        border: "#fef3c7",
        label: "cancelled",
      };
    default:
      return {
        fg: "#64748b",
        bg: "#f8fafc",
        border: "#cbd5e1",
        label: status,
      };
  }
}

function normalizeStatus(status: string): TaskStatus {
  switch (status) {
    case "queued":
    case "running":
    case "completed":
    case "failed":
    case "cancelled":
      return status;
    case "succeeded":
      return "completed";
    default:
      return "queued";
  }
}

function normalizeResult(
  status: string,
  result?: string | null,
): TaskResult | undefined {
  if (result === "success" || result === "error" || result === "neutral") {
    return result;
  }

  if (status === "succeeded") {
    return "success";
  }

  if (status === "failed") {
    return "error";
  }

  if (status === "completed") {
    return "neutral";
  }

  return undefined;
}

export function StatusBadge({
  status,
  result,
}: Readonly<{
  status: string;
  result?: string | null;
}>) {
  const normalizedStatus = normalizeStatus(status);
  const normalizedResult = normalizeResult(status, result);
  const palette = getStatusPalette(normalizedStatus, normalizedResult);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: palette.fg,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        textTransform: "capitalize",
        lineHeight: 1,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: palette.fg,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {palette.label}
    </span>
  );
}