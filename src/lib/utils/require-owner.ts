import type { User } from "@supabase/supabase-js";

/**
 * Owner gate for the ingestion surface. The upload page + ingestion actions use
 * `createAdminClient()` (bypasses RLS, can delete KB chunks), so they must be
 * restricted to the single owner - auth alone (any logged-in student) is not
 * enough. Fails CLOSED: if OWNER_EMAIL is unset, nobody is the owner.
 */
export function isOwner(user: User | null): boolean {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return false;
  return user?.email === ownerEmail;
}
