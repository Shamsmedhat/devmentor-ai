import { routing } from "@/i18n/routing";

function isLocale(value: string): value is (typeof routing.locales)[number] {
  return routing.locales.includes(value as (typeof routing.locales)[number]);
}

function defaultChatPath(locale: string): string {
  const loc = isLocale(locale) ? locale : routing.defaultLocale;
  return `/${loc}/chat`;
}

/**
 * Returns a safe internal path for post-login redirects.
 * Allows only /{locale}/... with known locale; rejects open redirects and /.../login.
 */
export function safeNextPath(
  next: string | null | undefined,
  locale: string,
): string {
  // get fallback
  const fallback = defaultChatPath(locale);

  // check if next is null or undefined
  if (next == null || typeof next !== "string") return fallback;

  // trim next
  const trimmed = next.trim();

  // check if trimmed starts with / or //
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;

  // get query string
  const q = trimmed.indexOf("?");
  const pathname = q === -1 ? trimmed : trimmed.slice(0, q);
  const search = q === -1 ? "" : trimmed.slice(q);

  // get segments
  const segments = pathname.split("/").filter(Boolean);

  // check if segments length is less than 2
  if (segments.length < 2) return fallback;

  // check if first segment is not a locale
  if (!isLocale(segments[0])) return fallback;

  // check if any segment contains .. or \
  if (segments.some((p) => p === ".." || p.includes("\\"))) return fallback;

  // check if second segment is login
  if (segments[1] === "login") return fallback;

  // return pathname and search
  return pathname + search;
}

export function localeFromNextParam(
  next: string | null | undefined,
): (typeof routing.locales)[number] {
  if (next == null || typeof next !== "string") return routing.defaultLocale;
  const pathname = next.split("?")[0] ?? "";
  const first = pathname.split("/").filter(Boolean)[0] ?? "";

  return isLocale(first) ? first : routing.defaultLocale;
}
