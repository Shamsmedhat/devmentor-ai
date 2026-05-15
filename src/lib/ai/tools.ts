import { google } from "@ai-sdk/google";
import { InferUITools, streamText, tool } from "ai";
import z from "zod";
import { searchKnowledgeBase } from "./search";

export const uiTools = {
  knowledge_base_search: tool({
    description: "Search the knowledge base for information",
    inputSchema: z.object({
      query: z.string().describe("The query to search the knowledge base for"),
    }),
    execute: async ({ query }) => {
      try {
        const results = await searchKnowledgeBase(query, 10, 0.5);
        if (results.length === 0) {
          return "No results found";
        }
        const formattedResults = results
          .map((r, i) => `Result ${i + 1}: ${r.content}`)
          .join("\n\n");
        return formattedResults;
      } catch (error) {
        console.error(error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  }),
};

type StreamTextTools = NonNullable<Parameters<typeof streamText>[0]["tools"]>;

export const modelTools = {
  ...uiTools,
  browser_search: google.tools.googleSearch({
    apiKey: process.env.GOOGLE_API_KEY!,
  }),
} as StreamTextTools;

export type ChatTools = InferUITools<typeof uiTools>;
