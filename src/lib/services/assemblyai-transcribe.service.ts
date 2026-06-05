import { AssemblyAI } from "assemblyai";

export type TranscribedWord = {
  text: string;
  /** Word start in milliseconds. */
  start: number;
  /** Word end in milliseconds. */
  end: number;
};

export type TranscribedAudio = {
  text: string;
  words: TranscribedWord[];
};

export class AssemblyAITranscribeError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AssemblyAITranscribeError";
  }
}

let cachedClient: AssemblyAI | null = null;

function getClient(): AssemblyAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    throw new AssemblyAITranscribeError(
      "ASSEMBLYAI_API_KEY is not set in the environment.",
    );
  }

  cachedClient = new AssemblyAI({ apiKey });
  return cachedClient;
}

export async function transcribeAudio(
  audio: Buffer,
): Promise<TranscribedAudio> {
  try {
    const client = getClient();

    // language_code:"ar" is deterministic — language_detection risks misdetecting
    // heavy English code-switching and transcribing in the wrong language.
    const transcript = await client.transcripts.transcribe({
      audio,
      language_code: "ar",
      speaker_labels: false,
    });

    if (transcript.status === "error") {
      throw new AssemblyAITranscribeError(
        transcript.error ?? "AssemblyAI returned an error status.",
      );
    }

    const words = transcript.words ?? [];
    if (words.length === 0) {
      throw new AssemblyAITranscribeError(
        "AssemblyAI returned no word-level timestamps.",
      );
    }

    return {
      text: transcript.text ?? "",
      words: words.map((w) => ({ text: w.text, start: w.start, end: w.end })),
    };
  } catch (error: unknown) {
    if (error instanceof AssemblyAITranscribeError) throw error;
    const message =
      error instanceof Error ? error.message : "Unknown transcription failure";
    throw new AssemblyAITranscribeError(message, error);
  }
}
