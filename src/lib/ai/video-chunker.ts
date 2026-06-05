import type { TranscribedWord } from "@/lib/services/assemblyai-transcribe.service";

export type TimestampedChunk = {
  content: string;
  /** Chunk start in seconds (from the first word's `start` / 1000). */
  startSeconds: number;
  /** Chunk end in seconds (from the last word's `end` / 1000). */
  endSeconds: number;
};

type ChunkOptions = {
  /** Target character length for `content` (space-joined words). */
  chunkSize: number;
  /** Number of trailing words carried forward into the next chunk. */
  overlapWords: number;
};

/**
 * Greedy timestamp-preserving chunker.
 *
 * Accumulates words into ~`chunkSize`-char chunks (space-joined). When closing
 * a chunk, the next chunk re-uses the last `overlapWords` words so cross-chunk
 * context is preserved. `i` always advances by at least 1, so an overlap value
 * larger than the chunk can't cause an infinite loop.
 */
export function chunkTranscriptWithTimestamps(
  words: TranscribedWord[],
  { chunkSize, overlapWords }: ChunkOptions,
): TimestampedChunk[] {
  if (words.length === 0) return [];

  const chunks: TimestampedChunk[] = [];
  let i = 0;

  while (i < words.length) {
    let j = i;
    let length = 0;

    while (j < words.length) {
      const wordLen = words[j].text.length + (j > i ? 1 : 0); // +1 for joining space
      if (length + wordLen > chunkSize && j > i) break;
      length += wordLen;
      j++;
    }

    chunks.push({
      content: words
        .slice(i, j)
        .map((w) => w.text)
        .join(" "),
      startSeconds: words[i].start / 1000,
      endSeconds: words[j - 1].end / 1000,
    });

    if (j >= words.length) break;
    i = Math.max(i + 1, j - overlapWords);
  }

  return chunks;
}
