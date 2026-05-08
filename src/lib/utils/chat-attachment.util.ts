import type { FileUIPart } from "ai";

/**
 * Builds a single string to persist a user turn (plain text + inlined text files).
 * Images are recorded as placeholders (no base64 in DB).
 */
export async function formatUserMessageForPersistence(
  text: string,
  files: FileUIPart[],
): Promise<string> {
  const chunks: string[] = [];
  const trimmed = text.trim();
  if (trimmed) chunks.push(trimmed);

  for (const file of files) {
    const filename = file.filename ?? "file";
    const mediaType = file.mediaType ?? "application/octet-stream";

    if (mediaType.startsWith("image/")) {
      chunks.push(
        `\n\n--- Image: ${filename} (${mediaType}) ---\n[Image not stored in transcript.]`,
      );
      continue;
    }

    const body =
      decodeDataUrlToUtf8(file.url) ?? "[Could not decode attachment]";
    chunks.push(`\n\n--- File: ${filename} ---\n${body}`);
  }

  return chunks.join("").trim();
}

function decodeDataUrlToUtf8(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:")) return null;
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return null;
  const header = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  const isBase64 = /;\s*base64/i.test(header);

  try {
    if (isBase64) {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    }
    return decodeURIComponent(payload.replace(/\+/g, " "));
  } catch {
    return null;
  }
}
