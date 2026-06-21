//apps/agent/src/ai-context/frontmatter.ts

export type FrontmatterValue = string | string[];
export type FrontmatterRecord = Record<string, FrontmatterValue>;

export type ParsedMarkdown = {
  frontmatter: FrontmatterRecord;
  body: string;
};

const FRONTMATTER_BLOCK = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const KEY_LINE = /^([\w-]+):\s*(.*)$/;
const LIST_ITEM_LINE = /^\s*-\s*(.+)$/;

// Hand-rolled parser: the AI_context frontmatter schema is intentionally
// flat (scalars or single-level string lists), so a full YAML parser would
// be overkill and this repo has no yaml dependency declared anywhere.
export function parseFrontmatter(raw: string): ParsedMarkdown {
  const match = raw.match(FRONTMATTER_BLOCK);

  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const [, block, body] = match;
  const frontmatter: FrontmatterRecord = {};

  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  const flushList = () => {
    if (currentKey && currentList) {
      frontmatter[currentKey] = currentList;
    }
    currentKey = null;
    currentList = null;
  };

  for (const line of block.split(/\r?\n/)) {
    const listItem = line.match(LIST_ITEM_LINE);

    if (listItem && currentKey) {
      currentList = currentList ?? [];
      currentList.push(listItem[1].trim());
      continue;
    }

    const keyLine = line.match(KEY_LINE);

    if (keyLine) {
      flushList();

      const [, key, value] = keyLine;
      const trimmedValue = value.trim();

      if (trimmedValue === "[]") {
        frontmatter[key] = [];
        currentKey = null;
      } else if (trimmedValue.length > 0) {
        frontmatter[key] = trimmedValue;
        currentKey = null;
      } else {
        currentKey = key;
        currentList = null;
      }
    }
  }

  flushList();

  return { frontmatter, body: body ?? "" };
}

export function stringifyFrontmatter(fm: FrontmatterRecord): string {
  const lines: string[] = ["---"];

  for (const [key, value] of Object.entries(fm)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
        continue;
      }

      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${item}`);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push("---");

  return lines.join("\n");
}
