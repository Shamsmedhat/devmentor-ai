import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
const r = await ai.models.embedContent({
  model: "text-embedding-004", // confirm against embeddings.ts
  contents: ["t1", "t2", "t3"],
});
console.log(
  "count:",
  r.embeddings?.length,
  "dim:",
  r.embeddings?.[0]?.values?.length,
);
