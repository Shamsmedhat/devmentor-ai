/**
 * What a chat model accepts as native `file` parts on user messages (after
 * `convertToModelMessages`). If false, the API normalizes those parts into
 * plain `text` before calling the model.
 *
 * Each entry in the provider chain declares its own capabilities - see
 * `src/lib/ai/providers.ts`.
 */
export type ModelAttachmentCapabilities = {
  supportsImageFileParts: boolean;
  supportsNonImageFileParts: boolean;
};
