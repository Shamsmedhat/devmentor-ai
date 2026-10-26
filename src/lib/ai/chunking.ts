import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkText(
  text: string,
  chunkSize = 500,
  chunkOverlap = 50,
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: [" "],
  });
  return splitter.splitText(text);
}

/**
 * Splits markdown on `## ` headings and prefixes every chunk with the text
 * before the first `## ` (title + summary), so each chunk still says which
 * document it belongs to. Neighbouring sections are merged up to `maxChars`.
 * A section longer than that is split on its `### ` subheadings (each piece
 * keeps the `## ` heading), and only then falls back to `chunkText`.
 */
export async function chunkMarkdownBySection(
  text: string,
  maxChars = 3000,
): Promise<string[]> {
  const parts = text.split(/\n(?=## )/).map((part) => part.trim());
  const hasPrefix = parts.length > 0 && !parts[0].startsWith("## ");
  const prefix = hasPrefix ? parts[0] : "";
  const sections = (hasPrefix ? parts.slice(1) : parts).filter(Boolean);

  if (sections.length === 0) return prefix ? [prefix] : [];

  const budget = Math.max(500, maxChars - prefix.length);
  const groups = await mergeUpTo(sections, budget, splitLongSection);

  return groups.map((group) => (prefix ? `${prefix}\n\n${group}` : group));
}

async function splitLongSection(
  section: string,
  budget: number,
): Promise<string[]> {
  const [head, ...subsections] = section.split(/\n(?=### )/);
  if (subsections.length === 0) return chunkText(section, budget, 100);

  const heading = head.split("\n")[0];
  const pieceBudget = Math.max(500, budget - heading.length - 2);
  const groups = await mergeUpTo(
    [head.trim(), ...subsections.map((sub) => sub.trim())],
    pieceBudget,
    (piece) => chunkText(piece, pieceBudget, 100),
  );

  return groups.map((group) =>
    group.startsWith(heading) ? group : `${heading}\n\n${group}`,
  );
}

/** Greedily joins pieces up to `budget` chars; oversized pieces go to `splitOversized`. */
async function mergeUpTo(
  pieces: string[],
  budget: number,
  splitOversized: (piece: string, budget: number) => Promise<string[]>,
): Promise<string[]> {
  const groups: string[] = [];
  let current = "";

  for (const piece of pieces) {
    if (piece.length > budget) {
      if (current) groups.push(current);
      current = "";
      groups.push(...(await splitOversized(piece, budget)));
      continue;
    }

    if (current && current.length + piece.length + 2 > budget) {
      groups.push(current);
      current = piece;
      continue;
    }

    current = current ? `${current}\n\n${piece}` : piece;
  }

  if (current) groups.push(current);

  return groups;
}
