// apps/web/features/definition/lib/spec-sections.ts

// O corpo de uma Spec real (apps/agent/src/ai-context/templates.ts ->
// SPEC_TEMPLATE) é markdown com headings de nível 1 ("# Heading"). Esta
// página edita por seção em vez de exigir um editor de markdown genérico —
// parseSpecSections/stringifySpecSections fazem esse round-trip sem
// depender de nenhuma lib de markdown (mesma filosofia de
// apps/agent/src/ai-context/frontmatter.ts: formato simples e fixo o
// suficiente para não justificar uma dependência nova).

export type SpecSection = {
  heading: string;
  content: string;
};

const HEADING_LINE = /^# (.+)$/;

export function parseSpecSections(body: string): SpecSection[] {
  const lines = body.split(/\r?\n/);
  const sections: SpecSection[] = [];

  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (currentHeading !== null) {
      sections.push({ heading: currentHeading, content: currentLines.join("\n").trim() });
    }
  };

  for (const line of lines) {
    const match = line.match(HEADING_LINE);

    if (match) {
      flush();
      currentHeading = match[1].trim();
      currentLines = [];
    } else if (currentHeading !== null) {
      currentLines.push(line);
    }
  }

  flush();

  return sections;
}

export function stringifySpecSections(sections: SpecSection[]): string {
  return sections.map((section) => `# ${section.heading}\n\n${section.content}\n`).join("\n");
}
