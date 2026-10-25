import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { rewriteToStandaloneQuery } from "@/lib/ai/query-rewrite";
import { searchKnowledgeBase } from "@/lib/ai/search";
import { AI_LIMITS } from "@/lib/constants/ai.constant";
import type { ChatUIMessage } from "@/lib/types/chat";

type QuestionLang = "en" | "ar";
type QuestionType = "covered" | "control";

type EvalQuestion = {
  id: string;
  question: string;
  lang: QuestionLang;
  topic: string;
  type: QuestionType;
  /** document_ids that count as a correct retrieval (covered questions only). */
  expected?: string[];
};

type Flag = "PASS" | "WRONG-DOC" | "REVIEW" | "GOOD-CONTROL" | "BAD-CONTROL";

type EvalResult = {
  question: EvalQuestion;
  topSim: number;
  hitCount: number;
  flag: Flag;
};

const QUESTIONS_PATH = resolve(process.cwd(), "scripts/kb-eval-questions.json");
const PREVIEW_CHARS = 100;

async function main(): Promise<void> {
  const raw = await readFile(QUESTIONS_PATH, "utf8");
  const questions = JSON.parse(raw) as EvalQuestion[];

  const results: EvalResult[] = [];

  for (const q of questions) {
    console.log(`\n[${q.lang}] [${q.type}] (${q.topic}) ${q.question}`);

    // Same path as production: the rewriter anchors the query before search.
    const query = await rewriteToStandaloneQuery([toUserMessage(q)]);
    if (query !== q.question) console.log(`  rewritten: ${query}`);

    const chunks = await searchKnowledgeBase(
      query,
      AI_LIMITS.RAG_MAX_RESULTS,
      AI_LIMITS.RAG_SIMILARITY_THRESHOLD,
    );

    if (chunks.length === 0) {
      console.log("  (no chunks above threshold)");
    } else {
      for (const c of chunks) {
        const source =
          (c.metadata?.document_id as string | undefined) ?? "<unknown>";
        const preview = c.content.replace(/\s+/g, " ").slice(0, PREVIEW_CHARS);
        console.log(`  [${c.similarity.toFixed(3)}] ${source} - ${preview}`);
      }
    }

    const topSim = chunks[0]?.similarity ?? 0;
    const cleared =
      chunks.length > 0 && topSim >= AI_LIMITS.RAG_SIMILARITY_THRESHOLD;
    const hitExpected = chunks.some((c) =>
      (q.expected ?? []).includes(String(c.metadata?.document_id)),
    );
    const flag = flagFor(q, cleared, hitExpected);

    console.log(`  -> ${flag} (top sim = ${topSim.toFixed(3)})`);
    results.push({ question: q, topSim, hitCount: chunks.length, flag });
  }

  printAggregate(results);
}

function toUserMessage(q: EvalQuestion): ChatUIMessage {
  return { id: q.id, role: "user", parts: [{ type: "text", text: q.question }] };
}

function flagFor(q: EvalQuestion, cleared: boolean, hitExpected: boolean): Flag {
  if (q.type === "control") return cleared ? "BAD-CONTROL" : "GOOD-CONTROL";
  if (!cleared) return "REVIEW";
  return hitExpected ? "PASS" : "WRONG-DOC";
}

function printAggregate(results: EvalResult[]): void {
  const enCovered = results.filter(
    (r) => r.question.lang === "en" && r.question.type === "covered",
  );
  const arCovered = results.filter(
    (r) => r.question.lang === "ar" && r.question.type === "covered",
  );
  const controls = results.filter((r) => r.question.type === "control");
  const misses = results.filter(
    (r) => r.flag === "REVIEW" || r.flag === "WRONG-DOC",
  );
  const badControls = results.filter((r) => r.flag === "BAD-CONTROL");
  const goodControls = controls.filter((r) => r.flag === "GOOD-CONTROL");

  console.log("\n=== Aggregate ===");
  console.log(formatRate("EN covered pass rate", enCovered));
  console.log(formatRate("AR covered pass rate", arCovered));
  console.log(
    `Avg top similarity     EN: ${avgSim(enCovered).toFixed(3)}   AR: ${avgSim(arCovered).toFixed(3)}`,
  );
  console.log(
    `Controls correctly rejected: ${goodControls.length}/${controls.length}`,
  );

  if (misses.length > 0) {
    console.log("\nMISSES (REVIEW = nothing above threshold, WRONG-DOC = expected doc not retrieved):");
    for (const r of misses) {
      console.log(
        `  [${r.question.lang}] ${r.flag} ${r.question.id} (top sim ${r.topSim.toFixed(3)}): ${r.question.question}`,
      );
    }
  }
  if (badControls.length > 0) {
    console.log("\nBAD-CONTROL (false positive - control matched something):");
    for (const r of badControls) {
      console.log(
        `  [${r.question.lang}] ${r.question.id} (top sim ${r.topSim.toFixed(3)}): ${r.question.question}`,
      );
    }
  }
  console.log();
}

function formatRate(label: string, rs: EvalResult[]): string {
  if (rs.length === 0) return `${label}:  n/a`;
  const passed = rs.filter((r) => r.flag === "PASS").length;
  const pct = (passed / rs.length) * 100;
  return `${label}:  ${pct.toFixed(1)}% (${passed}/${rs.length})`;
}

function avgSim(rs: EvalResult[]): number {
  if (rs.length === 0) return 0;
  return rs.reduce((s, r) => s + r.topSim, 0) / rs.length;
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
