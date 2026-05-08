import { embed, embedMany, type EmbedResult, type EmbedManyResult } from "ai";
import { google } from "@ai-sdk/google";

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
  const result = await embedMany({
    model: google.embeddingModel("gemini-embedding-001"),
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    },
    values: texts,
  });

  return result;
}
