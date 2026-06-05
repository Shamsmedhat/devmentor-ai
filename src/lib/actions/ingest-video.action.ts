"use server";

import { generateEmbeddingsMany } from "@/lib/ai/embeddings";
import { chunkTranscriptWithTimestamps } from "@/lib/ai/video-chunker";
import { AI_LIMITS } from "@/lib/constants/ai.constant";
import { ingestVideoInputSchema } from "@/lib/schemas/video-ingestion.schema";
import {
  AssemblyAITranscribeError,
  transcribeAudio,
} from "@/lib/services/assemblyai-transcribe.service";
import { getServerSupabaseAuth } from "@/lib/utils/auth/auth-server-guard";
import { createAdminClient } from "@/lib/utils/supabase/admin";

export type IngestVideoResponse =
  | { success: true; videoTitle: string; chunksCreated: number }
  | { success: false; error: string };

export async function ingestVideoAction(
  formData: FormData,
): Promise<IngestVideoResponse> {
  const { user } = await getServerSupabaseAuth();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No audio file provided." };
  }

  const rawDriveUrl = formData.get("drive_url");
  const parsed = ingestVideoInputSchema.safeParse({
    video_title: formData.get("video_title"),
    drive_url:
      typeof rawDriveUrl === "string" && rawDriveUrl.trim().length > 0
        ? rawDriveUrl
        : undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join("; "),
    };
  }

  const { video_title, drive_url } = parsed.data;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const { words } = await transcribeAudio(buffer);

    const chunks = chunkTranscriptWithTimestamps(words, {
      chunkSize: AI_LIMITS.VIDEO_CHUNK_SIZE,
      overlapWords: AI_LIMITS.VIDEO_CHUNK_OVERLAP_WORDS,
    });

    if (chunks.length === 0) {
      return {
        success: false,
        error: "Transcription produced no chunkable content.",
      };
    }

    const {
      embeddings,
      usage: embeddingUsage,
      providerMetadata,
    } = await generateEmbeddingsMany(chunks.map((c) => c.content));

    const adminSupabase = createAdminClient();

    // Overwrite: same semantics as URL ingestion — document_id is the video_title.
    const { error: deleteError } = await adminSupabase
      .from("knowledge_base")
      .delete()
      .eq("metadata->>document_id", video_title);

    if (deleteError) {
      throw new Error(`Delete prior chunks failed: ${deleteError.message}`);
    }

    const records = chunks.map((chunk, index) => ({
      content: chunk.content,
      embedding: embeddings[index],
      metadata: {
        document_id: video_title,
        source_type: "video",
        video_title,
        start_seconds: chunk.startSeconds,
        end_seconds: chunk.endSeconds,
        ...(drive_url ? { drive_url } : {}),
        embedding_usage: embeddingUsage,
        provider_metadata: providerMetadata,
      },
    }));

    const { error: insertError } = await adminSupabase
      .from("knowledge_base")
      .insert(records);

    if (insertError) {
      throw new Error(`Insert failed: ${insertError.message}`);
    }

    return {
      success: true,
      videoTitle: video_title,
      chunksCreated: chunks.length,
    };
  } catch (error: unknown) {
    const message =
      error instanceof AssemblyAITranscribeError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown error";
    console.error(`Ingest failed for video "${video_title}":`, message);
    return { success: false, error: message };
  }
}
