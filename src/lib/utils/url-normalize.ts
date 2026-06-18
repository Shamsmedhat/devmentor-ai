/**
 * Deterministic URL normalization for stable knowledge_base `document_id`s.
 *
 * The UI ingest path (`ingest-url.action.ts`) keys `document_id` on Firecrawl's
 * resolved `sourceURL`, which drifts on redirects / trailing-slash differences
 * and so produces duplicate rows under two ids when a URL is re-ingested. The
 * bulk crawl tool (`kb:map` / `kb:ingest`) instead keys on the normalized INPUT
 * url, so re-runs overwrite the same id cleanly.
 *
 * Because the two paths key differently, the SAME page must not be ingested
 * through BOTH the UI and this tool - it would land under two ids (Firecrawl
 * sourceURL vs normalized input). Pick one path per source.
 *
 * Rules (per approved plan):
 * - lowercase scheme + host (the URL constructor already does this; we keep it
 *   explicit to document intent)
 * - drop the #fragment
 * - strip the query string entirely
 * - strip a trailing slash (the root "/" is preserved)
 * - the pathname case is left UNTOUCHED (some sites are path-case-sensitive)
 *
 * Later (not built): a per-site `keepQuery?: boolean` escape hatch in
 * SiteConfig could opt a lib out of query stripping if it turns out to use
 * content-bearing query params. Add it only if per-lib validation surfaces one.
 */
export function normalizeUrl(input: string): string {
  const url = new URL(input);

  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";
  url.search = "";

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}
