"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";
import { useTranslations } from "next-intl";

type Options = {
  /** Safe internal path after OAuth (e.g. /en/chat). Passed to /api/auth/callback?next= */
  callbackUrlPath?: string;
};

export function useGoogleLogin(options?: Options): {
  signInWithGoogle: () => Promise<void>;
  isPending: boolean;
} {
  // Translations
  const t = useTranslations();

  // State
  const [isPending, setIsPending] = useState(false);

  // Variables
  // Next Path
  const callbackUrlPath = options?.callbackUrlPath;

  // Functions
  const signInWithGoogle = useCallback(async () => {
    // Set Pending
    setIsPending(true);
    try {
      // Create Supabase Client
      const supabase = createClient();

      // Create callbackUrl
      const callbackUrl = new URL(
        `${window.location.origin}/api/auth/callback`,
      );

      // Set Next Path
      if (callbackUrlPath) {
        callbackUrl.searchParams.set("callbackUrl", callbackUrlPath);
      }

      // Sign In With Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        toast.error(t("login-auth-error"));
        setIsPending(false);
      }
    } catch {
      toast.error(t("login-auth-error"));
      setIsPending(false);
    }
  }, [callbackUrlPath, t]);

  return { signInWithGoogle, isPending };
}
