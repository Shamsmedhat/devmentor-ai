"use client";

import { useEffect } from "react";

import { useChatUi } from "@/lib/context/chat-ui.context";

interface ChatTitleSyncProps {
  title: string;
}

// The title provider lives in the persistent chat layout, so each navigation
// pushes the freshly loaded session title back into context on mount.
export default function ChatTitleSync({ title }: ChatTitleSyncProps) {
  // Context
  const { setCurrentTitle } = useChatUi();

  // Effects
  useEffect(() => {
    setCurrentTitle(title);
  }, [title, setCurrentTitle]);

  return null;
}
