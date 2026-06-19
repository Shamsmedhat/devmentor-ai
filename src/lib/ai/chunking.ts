import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkText(
  text: string,
  chunkSize = 500,
  chunkOverlap = 50,
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: [" "],
  });
  return splitter.splitText(text);
}
