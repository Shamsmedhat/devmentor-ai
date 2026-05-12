export function buildChatPath(sessionId: string | null): string {
  if (sessionId) return `/chat/${sessionId}`;
  return "/chat";
}
