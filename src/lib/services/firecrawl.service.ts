import Firecrawl from "@mendable/firecrawl-js";

export type ScrapedPage = {
  markdown: string;
  sourceUrl: string;
  title?: string;
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
