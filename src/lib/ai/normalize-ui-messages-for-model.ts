import type { UIMessage } from "ai";

import type { ModelAttachmentCapabilities } from "@/lib/ai/model-capabilities";

type UIPart = UIMessage["parts"][number];

function isFilePart(part: UIPart): part is Extract<UIPart, { type: "file" }> {
  return part.type === "file";
}

function mergeAdjacentTextParts(parts: UIPart[]): UIPart[] {
  const out: UIPart[] = [];
  for (const part of parts) {
    if (part.type !== "text") {
      out.push(part);
      continue;
    }
    const prev = out[out.length - 1];
    if (prev && prev.type === "text") {
      (prev as { type: "text"; text: string }).text =
        (prev as { text?: string }).text + (part.text ?? "");
    } else {
      out.push({ type: "text", text: part.text ?? "" });
    }
  }
  return out;
}

function decodeDataUrlToUtf8(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:")) return null;
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return null;
  const header = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  const isBase64 = /;\s*base64\s*$/i.test(header) || header.includes(";base64");

  try {
    if (isBase64) {
      return Buffer.from(payload, "base64").toString("utf8");
    }
    return decodeURIComponent(payload.replace(/\+/g, " "));
  } catch {
    return null;
  }
}

async function filePartToInlinedText(
  part: Extract<UIPart, { type: "file" }>,
): Promise<string> {
  const name = part.filename ?? "attachment";
  const isImage = part.mediaType.startsWith("image/");

  if (isImage) {
    return `\n\n--- Image: ${name} (${part.mediaType}) ---\n[This model cannot view images. Describe the image in text or switch ACTIVE_CHAT_PROVIDER_ID in src/lib/ai/providers.ts to a vision-capable model (e.g. google:gemini-2.5-flash).]`;
  }

  // Non-image: try to inline UTF-8 from data URL
  const decoded = decodeDataUrlToUtf8(part.url);
  if (decoded !== null) {
    return `\n\n--- File: ${name} ---\n${decoded}`;
  }

  if (part.url.startsWith("http://") || part.url.startsWith("https://")) {
    try {
      const res = await fetch(part.url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) {
        return `\n\n--- File: ${name} ---\n[Could not fetch file content for inlining.]`;
      }
      const text = await res.text();
      return `\n\n--- File: ${name} ---\n${text}`;
    } catch {
      return `\n\n--- File: ${name} ---\n[Could not fetch file content for inlining.]`;
    }
  }

  return `\n\n--- File: ${name} ---\n[Could not inline file (unsupported URL).]`;
}

/**
 * Rewrites user `file` parts so `convertToModelMessages` only sees parts the
 * active model supports; everything else becomes `text`.
 */
export async function normalizeUiMessagesForAttachmentCapabilities<
  M extends UIMessage,
>(messages: M[], caps: ModelAttachmentCapabilities): Promise<M[]> {
  const out: M[] = [];

  for (const msg of messages) {
    if (msg.role !== "user" || !Array.isArray(msg.parts)) {
      out.push(msg);
      continue;
    }

    const rebuilt: UIPart[] = [];

    for (const part of msg.parts) {
      if (!isFilePart(part)) {
        rebuilt.push(part);
        continue;
      }

      const isImage = part.mediaType.startsWith("image/");
      const keepNative =
        (isImage && caps.supportsImageFileParts) ||
        (!isImage && caps.supportsNonImageFileParts);

      if (keepNative) {
        rebuilt.push(part);
        continue;
      }

      const text = await filePartToInlinedText(part);
      if (text.length > 0) {
        rebuilt.push({ type: "text", text });
      }
    }

    out.push({ ...msg, parts: mergeAdjacentTextParts(rebuilt) } as M);
  }

  return out;
}
