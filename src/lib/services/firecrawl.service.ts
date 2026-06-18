import Firecrawl from "@mendable/firecrawl-js";

import { normalizeUrl } from "@/lib/utils/url-normalize";

export type ScrapedPage = {
  markdown: string;
  sourceUrl: string;
  title?: string;
};

export type MappedLink = {
  url: string;
  title?: string;
  description?: string;
};

export type MapUrlsOptions = {
  /** Keep URLs whose pathname starts with ANY of these. Omit = root's pathname. */
  includePaths?: string[];
  /** Drop URLs whose pathname contains ANY of these. */
  excludePaths?: string[];
  /** Safety cap forwarded to Firecrawl /map. NOT a scope tool (see below). */
  limit?: number;
};

export type MapUrlsResult = {
  /** Include prefixes actually applied (defaults to [root pathname]). */
  appliedIncludes: string[];
  /** Exclude substrings actually applied. */
  appliedExcludes: string[];
  /** Raw links Firecrawl returned, PRE-filter (for the <lib>.raw.json audit). */
  discovered: MappedLink[];
  /** Filtered + normalized + deduped + sorted URLs (for <lib>.txt). */
  urls: string[];
};

export class FirecrawlScrapeError extends Error {
  constructor(
    public readonly url: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "FirecrawlScrapeError";
  }
}

let cachedClient: Firecrawl | null = null;

function getClient(): Firecrawl {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new FirecrawlScrapeError(
      "",
      "FIRECRAWL_API_KEY is not set in the environment.",
    );
  }

  cachedClient = new Firecrawl({ apiKey });
  return cachedClient;
}

export async function scrapeUrl(url: string): Promise<ScrapedPage> {
  try {
    const client = getClient();

    const doc = await client.scrape(url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });

    const markdown = doc.markdown?.trim() ?? "";

    if (!markdown) {
      throw new FirecrawlScrapeError(
        url,
        "Firecrawl returned an empty markdown body.",
      );
    }

    return {
      markdown,
      sourceUrl: doc.metadata?.sourceURL ?? url,
      title: doc.metadata?.title,
    };
  } catch (error: unknown) {
    if (error instanceof FirecrawlScrapeError) throw error;
    const message =
      error instanceof Error ? error.message : "Unknown scrape failure";
    throw new FirecrawlScrapeError(url, message, error);
  }
}

/**
 * Phase 1 discovery: map a docs site to a reviewable URL list.
 *
 * Firecrawl /map is sitemap-aware and DOMAIN-wide - it returns links across the
 * whole host, not just under `root`'s path (verified against the v2 SDK: the
 * /v2/map payload carries no path filters). So include/exclude filtering runs
 * HERE, in our code, over the returned links:
 * - `includePaths` omitted -> default to the root URL's pathname, so a root of
 *   "https://nextjs.org/docs" keeps only "/docs/*" and drops "/blog", etc.
 * - `includePaths` provided -> overrides the default entirely.
 *
 * NOTE: `limit` is a SAFETY CAP forwarded to /map (cuts the run short), NOT a
 * scope tool - a low value silently drops pages. Scope comes from includePaths.
 */
export async function mapUrls(
  root: string,
  options: MapUrlsOptions = {},
): Promise<MapUrlsResult> {
  try {
    const client = getClient();

    const data = await client.map(root, {
      sitemap: "include",
      // Keep map-time and ingest-time consistent: normalizeUrl() strips the
      // query string, so we dedupe query variants at discovery too.
      ignoreQueryParameters: true,
      ...(options.limit != null ? { limit: options.limit } : {}),
    });

    const discovered: MappedLink[] = (data.links ?? []).map((link) => ({
      url: link.url,
      title: link.title,
      description: link.description,
    }));

    const rootUrl = new URL(root);
    const appliedIncludes =
      options.includePaths && options.includePaths.length > 0
        ? options.includePaths
        : [rootUrl.pathname];
    const appliedExcludes = options.excludePaths ?? [];

    // Same-host guard ALWAYS applies (even with explicit includePaths): /map is
    // domain-wide and surfaces sibling hosts like v3.zod.dev, which a pathname
    // prefix alone would let through. Include is a plain pathname prefix match
    // (note: "/docs" also matches "/docsfoo" - tighten to a segment match if a
    // specific site ever needs it).
    const kept = new Set<string>();
    for (const link of discovered) {
      let linkUrl: URL;
      try {
        linkUrl = new URL(link.url);
      } catch {
        continue; // skip unparseable links
      }

      if (linkUrl.host !== rootUrl.host) continue;

      const pathname = linkUrl.pathname;
      const included = appliedIncludes.some((p) => pathname.startsWith(p));
      if (!included) continue;

      const excluded = appliedExcludes.some((p) => pathname.includes(p));
      if (excluded) continue;

      kept.add(normalizeUrl(link.url));
    }

    return {
      appliedIncludes,
      appliedExcludes,
      discovered,
      urls: [...kept].sort(),
    };
  } catch (error: unknown) {
    if (error instanceof FirecrawlScrapeError) throw error;
    const message =
      error instanceof Error ? error.message : "Unknown map failure";
    throw new FirecrawlScrapeError(root, message, error);
  }
}
