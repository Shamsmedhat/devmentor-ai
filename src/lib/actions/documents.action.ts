"use server";

import { PDFParse } from "pdf-parse";

import { chunkText } from "@/lib/ai/chunking";
import { getServerSupabaseAuth } from "@/lib/utils/auth/auth-server-guard";
import { isOwner } from "@/lib/utils/require-owner";
import { createAdminClient } from "@/lib/utils/supabase/admin";
import { generateEmbeddingsMany } from "../ai/embeddings";

export async function processPdfFileAction(formData: FormData) {
  try {
    // Auth: fail fast before doing any expensive work (parsing/embedding)
    const { user } = await getServerSupabaseAuth();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Owner-only: ingestion bypasses RLS via createAdminClient - restrict to owner.
    if (!isOwner(user)) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    // get the file
    const file = formData.get("file") as File;

    // convert the file to an array of bytes
    const bytes = await file.arrayBuffer();

    // parse the PDF file
    const parser = new PDFParse({ data: bytes });

    // get the text from the PDF file
    const data = await parser.getText();

    // destroy the parser
    await parser.destroy();

    // if the text is empty, return an error
    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        error: "Invalid PDF file",
      };
    }

    // chunk the text
    const chunks = await chunkText(data.text);

    // generate embeddings for the chunks
    const {
      embeddings,
      usage: embeddingUsage,
      providerMetadata,
    } = await generateEmbeddingsMany(chunks);

    const records = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      metadata: {
        document_id: file.name,
        embedding_usage: embeddingUsage,
        provider_metadata: providerMetadata,
      },
    }));

    // use a server-only client that can bypass RLS for ingestion
    const adminSupabase = createAdminClient();

    // bulk insert the records into the knowledge_base table
    const { error } = await adminSupabase
      .from("knowledge_base")
      .insert(records);
    // if there is an error, return an error
    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: `${chunks.length} chunks added to the database`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process PDF",
    };
  }
}
