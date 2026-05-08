/**
 * What the active chat model accepts as native `file` parts on user messages
 * (after `convertToModelMessages`). If false, the API normalizes those parts
 * into plain `text` before calling the model.
 */
export type ModelAttachmentCapabilities = {
  supportsImageFileParts: boolean;
  supportsNonImageFileParts: boolean;
};

/**
 * Resolve attachment capabilities for the chat model.
 *
 * Set `CHAT_MODEL_CAPABILITY_KEY` to align with the model you wire in
 * `/api/chat` (e.g. `google:gemini-2.5-flash`, `openai:gpt-4o`).
 * Defaults to Groq Llama-style text chat (no native file parts).
 */
export function getModelAttachmentCapabilities(
  modelCapabilityKey: string,
): ModelAttachmentCapabilities {
  const key = modelCapabilityKey.trim().toLowerCase();

  if (key.startsWith("google:") || key.includes("gemini")) {
    return { supportsImageFileParts: true, supportsNonImageFileParts: true };
  }

  if (
    key.includes("gpt-4o") ||
    key.includes("gpt-4-turbo") ||
    key.includes("claude-3")
  ) {
    return { supportsImageFileParts: true, supportsNonImageFileParts: true };
  }

  return { supportsImageFileParts: false, supportsNonImageFileParts: false };
}
