"use client";

import { useState } from "react";

import type { User } from "@supabase/supabase-js";

import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";

interface ChatShellProps {
  user: User | null;
}

export function ChatShell({ user }: ChatShellProps) {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("DevMentor AI");

  return (
    <div className="relative flex h-screen overflow-hidden bg-primary">
      {/* Dot grid subtle background */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatArea
          currentTitle={currentTitle}
          onTitleChange={setCurrentTitle}
          onSidebarToggle={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  );
}
