import {
  embed,
  embedMany,
  type EmbedResult,
  type EmbedManyResult,
  type Embedding,
  type Warning,
} from "ai";
import { google } from "@ai-sdk/google";

import { AI_LIMITS } from "@/lib/constants/ai.constant";

const EMBEDDING_DIMENSIONS = 768;

export async function generateEmbeddings(
  text: string,
): Promise<EmbedResult> {
  const value = text.replace(/[\r\n]+/g, " ");

  const result = await embed({
    model: google.embeddingModel("gemini-embedding-001"),
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    },
    value,
  });

  return result;
}

export async function generateEmbeddingsMany(
  texts: string[],
): Promise<EmbedManyResult> {
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const embeddings: Embedding[] = [];
  const warnings: Warning[] = [];
  let totalTokens = 0;
  let lastProviderMetadata: EmbedManyResult["providerMetadata"];

  for (let i = 0; i < texts.length; i += AI_LIMITS.EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + AI_LIMITS.EMBEDDING_BATCH_SIZE);

    const result = await embedMany({
      model: google.embeddingModel("gemini-embedding-001"),
      providerOptions: {
        google: {
          outputDimensionality: EMBEDDING_DIMENSIONS,
        },
      },
      values: batch,
    });

    embeddings.push(...result.embeddings);
    warnings.push(...result.warnings);
    totalTokens += result.usage.tokens;
    lastProviderMetadata = result.providerMetadata;

    if (i + AI_LIMITS.EMBEDDING_BATCH_SIZE < texts.length) {
      await sleep(AI_LIMITS.EMBEDDING_BATCH_DELAY_MS);
    }
  }

  return {
    values: texts,
    embeddings,
    usage: { tokens: totalTokens },
    warnings,
    providerMetadata: lastProviderMetadata,
  };
}
