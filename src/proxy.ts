import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { safeNextPath } from "./lib/utils/auth/safe-next-path";

// protected routes
const PROTECTED_ROUTES = ["chat"];

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // handle locale
  const response = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      // keeps Supabase session cookies synchronized between the incoming request and outgoing response
      cookies: {
        // reads incoming cookies
        getAll() {
          return request.cookies.getAll();
        },
        // writes updated cookies
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // handle protected routes

  // split pathname into segments
  const { pathname } = request.nextUrl;

  const ownerEmail = process.env.OWNER_EMAIL;

  if (pathname === "/upload" && user?.email !== ownerEmail) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // remove any empty value
  const segments = pathname.split("/").filter(Boolean);

  // get first segment
  const first = segments[0] ?? "";

  // check if first segment is a locale
  const isLocale = routing.locales.includes(
    first as (typeof routing.locales)[number],
  );

  // get locale
  const locale = isLocale ? first : routing.defaultLocale;

  // get root
  const root = isLocale ? (segments[1] ?? "") : first;

  // check if root is a protected route
  const isProtected = PROTECTED_ROUTES.includes(root);

  if (isProtected && !user) {
    // clone request url
    const url = request.nextUrl.clone();

    // set pathname to login
    url.pathname = `/${locale}/login`;

    // set search to empty
    url.search = "";

    // set next parameter
    const nextTarget = pathname + (request.nextUrl.search ?? "");
    url.searchParams.set("callbackUrl", nextTarget);

    // redirect to login
    return NextResponse.redirect(url);
  }

  // handle login
  if (root === "login" && user) {
    // get next parameter
    const nextParam = request.nextUrl.searchParams.get("callbackUrl");

    // sanitize next parameter
    const dest = safeNextPath(nextParam, locale);

    // redirect to destination
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // return response
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
