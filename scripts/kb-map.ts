/**
 * Phase 1 - DISCOVERY (`yarn kb:map <lib>`).
 *
 * Reads kb-urls/sites.config.ts, runs Firecrawl /map for the requested lib,
 * applies the lib's include/exclude path scope (in `mapUrls`), normalizes +
 * dedupes, and writes two files for HUMAN REVIEW:
 *   - kb-urls/<lib>.txt       filtered URL list, one per line, sorted
 *   - kb-urls/<lib>.raw.json  every link /map returned, PRE-filter (audit)
 *
 * Discovery ONLY - no scrape, no embed, no DB writes. Review <lib>.txt before
 * running the (Phase 2) ingest.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { mapUrls } from "@/lib/services/firecrawl.service";

import { SITES } from "../kb-urls/sites.config";

const OUT_DIR = resolve(process.cwd(), "kb-urls");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main(): Promise<void> {
  // Args
  const lib = process.argv[2];
  if (!lib) {
    fail(
      `Usage: yarn kb:map <lib>\nAvailable: ${SITES.map((s) => s.lib).join(", ")}`,
    );
  }

  const site = SITES.find((s) => s.lib === lib);
  if (!site) {
    fail(
      `Unknown lib "${lib}".\nAvailable: ${SITES.map((s) => s.lib).join(", ")}`,
    );
  }

  // Discover
  console.log(`Mapping "${site.lib}" from ${site.root} ...`);
  const result = await mapUrls(site.root, {
    includePaths: site.includePaths,
    excludePaths: site.excludePaths,
    limit: site.limit,
  });

  // Write outputs
  const txtPath = resolve(OUT_DIR, `${site.lib}.txt`);
  const rawPath = resolve(OUT_DIR, `${site.lib}.raw.json`);

  writeFileSync(txtPath, result.urls.join("\n") + "\n", "utf8");
  writeFileSync(
    rawPath,
    JSON.stringify(
      {
        lib: site.lib,
        root: site.root,
        mappedAt: new Date().toISOString(),
        appliedIncludes: result.appliedIncludes,
        appliedExcludes: result.appliedExcludes,
        discoveredCount: result.discovered.length,
        keptCount: result.urls.length,
        links: result.discovered,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  // Summary
  const dropped = result.discovered.length - result.urls.length;
  console.log("\n=== kb:map summary ===");
  console.log(`Lib:               ${site.lib}`);
  console.log(`Root:              ${site.root}`);
  console.log(`Include scope:     ${result.appliedIncludes.join(", ")}`);
  console.log(
    `Exclude scope:     ${result.appliedExcludes.length ? result.appliedExcludes.join(", ") : "(none)"}`,
  );
  console.log(`Discovered:        ${result.discovered.length}`);
  console.log(`Kept (filtered):   ${result.urls.length}`);
  console.log(`Dropped:           ${dropped}`);
  console.log(`\nWrote: ${txtPath}`);
  console.log(`Wrote: ${rawPath}`);
  console.log(
    `\nReview ${site.lib}.txt before ingesting. Discovery only - nothing was scraped or embedded.`,
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
