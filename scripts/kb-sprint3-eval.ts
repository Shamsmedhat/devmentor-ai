/**
 * Sprint 3 answer-readiness check.
 *
 * Same retrieval path as chat (rewrite, then search). A question passes only
 * when the right document is in the results AND the retrieved text of that
 * document contains every fact the answer needs. That is the context the
 * mentor is allowed to answer from.
 *
 * Usage: yarn kb:eval:sprint3
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { rewriteToStandaloneQuery } from "@/lib/ai/query-rewrite";
import { searchKnowledgeBase } from "@/lib/ai/search";
import { AI_LIMITS } from "@/lib/constants/ai.constant";
import type { ChatUIMessage } from "@/lib/types/chat";

type QuestionLang = "en" | "ar";

type Sprint3Question = {
  id: string;
  question: string;
  lang: QuestionLang;
  /** document_ids that hold the answer. At least one must be retrieved. */
  expected: string[];
  /** Substrings that must appear in the retrieved text of those documents. */
  includes: string[];
};

type Flag = "PASS" | "WRONG-DOC" | "MISSING-FACT";

type Result = {
  question: Sprint3Question;
  flag: Flag;
  topSim: number;
  missing: string[];
};

const QUESTIONS_PATH = resolve(process.cwd(), "scripts/kb-eval-sprint3.json");

async function main(): Promise<void> {
  const questions = JSON.parse(await readFile(QUESTIONS_PATH, "utf8")) as Sprint3Question[];
  const results: Result[] = [];

  for (const q of questions) {
    const result = await checkQuestion(q);
    results.push(result);
    const missing =
      result.missing.length > 0 ? ` missing: ${result.missing.join(" | ")}` : "";
    console.log(
      `[${q.lang}] ${result.flag} ${q.id} (${result.topSim.toFixed(3)})${missing}`,
    );
    console.log(`  ${q.question}`);
  }

  const passed = results.filter((r) => r.flag === "PASS").length;
  console.log(`\nSprint 3: ${passed}/${results.length} passed`);

  if (passed !== results.length) {
    process.exitCode = 1;
  }
}

async function checkQuestion(q: Sprint3Question): Promise<Result> {
  const query = await rewriteToStandaloneQuery([toUserMessage(q)]);
  const chunks = await searchKnowledgeBase(
    query,
    AI_LIMITS.RAG_MAX_RESULTS,
    AI_LIMITS.RAG_SIMILARITY_THRESHOLD,
  );

  const matched = chunks.filter((chunk) =>
    q.expected.includes(String(chunk.metadata?.document_id ?? "")),
  );
  const topSim = chunks[0]?.similarity ?? 0;

  if (matched.length === 0) {
    return { question: q, flag: "WRONG-DOC", topSim, missing: q.includes };
  }

  const haystack = matched.map((chunk) => chunk.content).join("\n").toLowerCase();
  const missing = q.includes.filter((fact) => !haystack.includes(fact.toLowerCase()));

  return {
    question: q,
    flag: missing.length === 0 ? "PASS" : "MISSING-FACT",
    topSim,
    missing,
  };
}

function toUserMessage(q: Sprint3Question): ChatUIMessage {
  return {
    id: q.id,
    role: "user",
    parts: [{ type: "text", text: q.question }],
  };
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
