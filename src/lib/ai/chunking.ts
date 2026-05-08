import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
  separators: [" "],
});

export async function chunkText(text: string): Promise<string[]> {
  const chunks = await splitter.splitText(text);
  return chunks;
}
