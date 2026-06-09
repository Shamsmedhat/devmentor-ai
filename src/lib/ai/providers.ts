import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel, streamText } from "ai";

import type { ModelAttachmentCapabilities } from "@/lib/ai/model-capabilities";

/**
 * Chat provider catalog.
 *
 * To switch the active chat model: change `ACTIVE_CHAT_PROVIDER_ID` below and
 * restart dev. No automatic fallback - intentional. If the active provider
 * fails, the request fails and we see it instead of silently retrying.
 */

export type ChatProviderTools = NonNullable<
  Parameters<typeof streamText>[0]["tools"]
>;

export type ChatProviderStreamOptions = Pick<
  Parameters<typeof streamText>[0],
  "providerOptions"
>;

export type ChatProvider = {
  id: string;
  apiKeyEnv: string;
  capabilities: ModelAttachmentCapabilities;
  createModel: () => LanguageModel;
  createTools: () => ChatProviderTools;
  streamOptions: ChatProviderStreamOptions;
};

const groqBrowserTools = (): ChatProviderTools =>
  ({
    browser_search: groq.tools.browserSearch({}),
  }) as ChatProviderTools;

const googleSearchTools = (): ChatProviderTools =>
  ({
    browser_search: google.tools.googleSearch({}),
  }) as ChatProviderTools;

const emptyTools = (): ChatProviderTools => ({}) as ChatProviderTools;

export const geminiMultimodal: ModelAttachmentCapabilities = {
  supportsImageFileParts: true,
  supportsNonImageFileParts: true,
};

export const groqTextOnly: ModelAttachmentCapabilities = {
  supportsImageFileParts: false,
  supportsNonImageFileParts: false,
};

// Groq's built-in `browser_search` is incompatible with `structuredOutputs`
// (which the SDK defaults to true). Leaving it on makes Groq drop native tools
// from the request while gpt-oss still emits `browser_search` → validation
// error. `reasoningEffort: "low"` keeps gpt-oss responsive; Llama doesn't
// accept it, so this option block is gpt-oss-only by design.
const groqGptOssStreamOptions: ChatProviderStreamOptions = {
  providerOptions: {
    groq: {
      structuredOutputs: false,
      reasoningEffort: "low",
    },
  },
};

// Gemini 2.5 streams a "thinking" block by default. Zero the budget and
// suppress thoughts so reasoning never reaches the wire - `sendReasoning:false`
// on the response is the second line of defence.
const googleNoThinkingStreamOptions: ChatProviderStreamOptions = {
  providerOptions: {
    google: {
      thinkingConfig: {
        thinkingBudget: 0,
        includeThoughts: false,
      },
    },
  },
};

export const CHAT_PROVIDERS: readonly ChatProvider[] = [
  {
    id: "groq:openai/gpt-oss-20b",
    apiKeyEnv: "GROQ_API_KEY",
    capabilities: groqTextOnly,
    createModel: () => groq("openai/gpt-oss-20b"),
    createTools: groqBrowserTools,
    streamOptions: groqGptOssStreamOptions,
  },
  {
    id: "groq:llama-3.3-70b-versatile",
    apiKeyEnv: "GROQ_API_KEY",
    capabilities: groqTextOnly,
    createModel: () => groq("llama-3.3-70b-versatile"),
    createTools: emptyTools,
    streamOptions: {},
  },
  {
    id: "google:gemini-2.5-flash",
    apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
    capabilities: geminiMultimodal,
    createModel: () => google.chat("gemini-2.5-flash"),
    createTools: googleSearchTools,
    streamOptions: googleNoThinkingStreamOptions,
  },
];

export const ACTIVE_CHAT_PROVIDER_ID = "google:gemini-2.5-flash";

export function getActiveChatProvider(): ChatProvider {
  const provider = CHAT_PROVIDERS.find((p) => p.id === ACTIVE_CHAT_PROVIDER_ID);
  if (!provider) {
    throw new Error(
      `ACTIVE_CHAT_PROVIDER_ID "${ACTIVE_CHAT_PROVIDER_ID}" is not in CHAT_PROVIDERS`,
    );
  }
  return provider;
}
