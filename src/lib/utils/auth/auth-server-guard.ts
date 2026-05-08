import type { User } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/server";

export type ServerSupabaseAuth = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
};

export type AuthenticatedServerSupabaseAuth = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
};

/**
 * Single server Supabase client + `getUser()` for the current request.
 * Returns `user: null` when there is no session — callers decide redirect, empty UI, or 401.
 */
export async function getServerSupabaseAuth(): Promise<ServerSupabaseAuth> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(error.message);
  }

  return { supabase, user: user ?? null };
}

/**
 * Same as {@link getServerSupabaseAuth}, but throws if there is no session user.
 * Use in server actions and other code paths that must hard-fail when anonymous.
 */
export async function requireServerAuthUser(): Promise<AuthenticatedServerSupabaseAuth> {
  const { supabase, user } = await getServerSupabaseAuth();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

