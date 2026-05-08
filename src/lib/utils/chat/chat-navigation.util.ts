import type { useRouter } from "@/i18n/navigation";

export function buildChatPath(sessionId: string | null): string {
  if (sessionId) return `/chat/${sessionId}`;
  return "/chat";
}

export function normalizePathname(pathname: string): string {
  return pathname.replace(/\/$/, "") || pathname;
}

export function isOnSessionPath({
  pathname,
  sessionId,
}: {
  pathname: string;
  sessionId: string;
}): boolean {
  const suffix = `/chat/${sessionId}`;
  const normalized = normalizePathname(pathname);
  return normalized === suffix || normalized.endsWith(suffix);
}

export function navigateToChatPath({
  sessionId,
  router,
}: {
  sessionId: string | null;
  router: ReturnType<typeof useRouter>;
}): void {
  router.replace(buildChatPath(sessionId));
}

export function syncChatSessionUrl({
  sessionId,
  pathname,
  router,
}: {
  sessionId: string;
  pathname: string;
  router: ReturnType<typeof useRouter>;
}): void {
  if (isOnSessionPath({ pathname, sessionId })) {
    return;
  }

  navigateToChatPath({ sessionId, router });
}
