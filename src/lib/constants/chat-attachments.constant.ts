/** Max size per image attachment (bytes). PromptInput enforces this via maxFileSize. */
export const CHAT_ATTACHMENT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

/** Max number of files per message. PromptInput enforces this via maxFiles. */
export const CHAT_ATTACHMENT_MAX_FILES = 6;

/** `accept` attribute for the file input (code, text, images). */
export const CHAT_ATTACHMENT_ACCEPT = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".txt",
  ".css",
  ".scss",
  ".html",
  ".htm",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".env",
  ".sh",
  ".bash",
  ".zsh",
  ".sql",
  ".graphql",
  ".gql",
  ".vue",
  ".svelte",
  ".astro",
  ".rs",
  ".go",
  ".py",
  ".java",
  ".kt",
  ".swift",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".cs",
  ".rb",
  ".php",
  ".pl",
  ".dockerfile",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".bmp",
  ".ico",
  "image/*",
].join(",");

export type ChatAttachmentAddErrorCode =
  | "too_many"
  | "too_large"
  | "type_not_allowed";
