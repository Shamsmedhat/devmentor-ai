/**
 * Sites for the bulk URL-ingestion tool (`kb:map` discovery / `kb:ingest`).
 *
 * `includePaths` / `excludePaths` are applied IN OUR CODE (see `mapUrls` in
 * firecrawl.service.ts) over the links Firecrawl /map returns - the v2 map
 * endpoint has no server-side path filtering and is domain-wide. When
 * `includePaths` is omitted, `mapUrls` defaults the include to the root URL's
 * pathname, scoping /map's domain-wide output down to the docs subtree.
 *
 * `limit` is a SAFETY CAP forwarded to /map, NOT a scope tool - a low value
 * silently drops pages. Scope comes from `includePaths`.
 *
 * Later (not built): a per-site `keepQuery?: boolean` escape hatch could be
 * added if a lib turns out to use content-bearing query params - `normalizeUrl`
 * strips the query string for every site today. Add it only if per-lib
 * validation surfaces a real case.
 */
export type SiteConfig = {
  /** Slug used for filenames: kb-urls/<lib>.txt, .progress/<lib>.json, etc. */
  lib: string;
  /** Map root, e.g. "https://nextjs.org/docs". */
  root: string;
  /** Keep URLs whose pathname starts with ANY of these. Omit = root's pathname. */
  includePaths?: string[];
  /** Drop URLs whose pathname contains ANY of these. */
  excludePaths?: string[];
  /** Safety cap forwarded to Firecrawl /map (not a scope tool). */
  limit?: number;
};

export const SITES: SiteConfig[] = [
  // ✅ done
  {
    lib: "zod",
    root: "https://zod.dev",
    excludePaths: ["/blog", "/CHANGELOG", "/ecosystem", "/library-authors"],
  },

  {
    lib: "tailwind",
    root: "https://tailwindcss.com/docs",
    excludePaths: [
      "/blog",
      "/sveltekit",
      "/tanstack-start",
      "/gatsby",
      "/nuxt",
      "/angular",
      "/solidjs",
      "/ruby-on-rails",
      "/laravel",
      "/symfony",
    ],
  },
  {
    lib: "shadcn",
    root: "https://ui.shadcn.com/docs",
    excludePaths: [
      "/changelog",
      "/registry",
      "/_blocks",
      "/legacy",
      "/astro",
      "/gatsby",
      "/laravel",
      "/remix",
    ],
  },
  { lib: "react-hook-form", root: "https://react-hook-form.com/docs" },
  {
    lib: "next-intl",
    root: "https://next-intl.dev/docs",
    excludePaths: ["/blog"],
  },
  {
    lib: "tanstack-query",
    root: "https://tanstack.com/query/latest/docs",
    excludePaths: [
      "/vue",
      "/svelte",
      "/angular",
      "/solid",
      "/lit",
      "/preact",
      "/blog",
      "/community-resources",
      "/contributors",
      "/npm-stats",
      "/react-form",
      "/my-api",
    ],
  },
  {
    lib: "typescript",
    root: "https://www.typescriptlang.org/docs/handbook",
    excludePaths: [
      "/release-notes",
      "/angular",
      "/asp-net-core",
      "/gulp",
      "/babel",
    ],
  },
  {
    lib: "nextauth",
    root: "https://next-auth.js.org",
    excludePaths: ["/blog", "/v3", "/search", "/seo", "/contributors"],
  },
];
