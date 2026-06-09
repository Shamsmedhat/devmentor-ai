import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  localeFromNextParam,
  safeNextPath,
} from "@/lib/utils/auth/safe-next-path";

export async function GET(request: Request) {
  // Navigation
  const { searchParams, origin } = new URL(request.url);
  // come from supabase
  const code = searchParams.get("code");
  // come from login page
  const callbackUrlPath = searchParams.get("callbackUrl");

  // Variables
  // code
  if (code) {
    // Get Cookie
    const cookieStore = await cookies();

    // Create Supabase Client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    // Exchange Code for Session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Get Locale
      const locale = localeFromNextParam(callbackUrlPath);

      // Get Destination
      const dest = safeNextPath(callbackUrlPath, locale);

      // Redirect to Destination
      return NextResponse.redirect(new URL(dest, origin));
    }
  }

  // Get Fail Locale
  const failLocale = localeFromNextParam(callbackUrlPath);

  // Get Login Path
  const loginPath = `/${failLocale}/login?error=auth_failed`;

  // Redirect to Login Path
  return NextResponse.redirect(new URL(loginPath, origin));
}
