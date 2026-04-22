"use client";

import { useState } from "react";

import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/chat/use-chat";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return <UserBubble content={message.content} />;
  }

  return <AssistantBubble content={message.content} />;
}

// ——— User bubble ———

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div
        className={cn(
          "max-w-[75%] rounded-2xl rounded-te-sm px-4 py-3",
          "border border-cyan-500/15 bg-cyan-500/10",
          "text-sm leading-relaxed text-white/90",
          "whitespace-pre-wrap wrap-break-word",
        )}
      >
        {content}
      </div>
    </div>
  );
}

// ——— Assistant bubble ———

function AssistantBubble({ content }: { content: string }) {
  const markdownComponents: Components = {
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className ?? "");
      const codeContent = String(children).replace(/\n$/, "");

      if (match) {
        return <CodeBlock language={match[1]}>{codeContent}</CodeBlock>;
      }

      return (
        <code className="rounded bg-white/6 px-1.5 py-0.5 font-mono text-[0.8em] text-cyan-300">
          {children}
        </code>
      );
    },
    pre({ children }) {
      return <div className="my-3">{children}</div>;
    },
    p({ children }) {
      return <p className="mb-3 last:mb-0">{children}</p>;
    },
    ul({ children }) {
      return <ul className="mb-3 list-disc ps-5 last:mb-0">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="mb-3 list-decimal ps-5 last:mb-0">{children}</ol>;
    },
    li({ children }) {
      return <li className="mb-1">{children}</li>;
    },
    h1({ children }) {
      return <h1 className="mb-3 text-xl font-semibold text-white">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="mb-2 text-lg font-semibold text-white">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="mb-2 text-base font-semibold text-white">{children}</h3>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="mb-3 border-s-2 border-cyan-500/40 ps-4 text-white/60">
          {children}
        </blockquote>
      );
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="flex items-start gap-3 justify-start">
      {/* AI avatar */}
      <div className="mt-1 shrink-0">
        <HexIcon className="h-7 w-7 text-secondary" />
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl rounded-ts-sm px-5 py-4",
          "border border-white/6 bg-[#0D1117]",
          "text-sm leading-relaxed text-white/85",
          "wrap-break-word",
        )}
      >
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

// ——— Code block with copy button ———

function CodeBlock({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  // State
  const [copied, setCopied] = useState(false);

  // Functions
  function handleCopy() {
    navigator.clipboard.writeText(children).catch(console.error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
      <div className="relative overflow-hidden rounded-lg border border-white/8">
      {/* Language label + copy button */}
      <div className="flex items-center justify-between bg-[#0A0A0A] px-4 py-2">
        <span className="font-mono text-[11px] text-white/30">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-white/30 transition-colors hover:text-white/60"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3 w-3 text-cyan-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Syntax highlighted code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark as { [key: string]: CSSProperties }}
        customStyle={{
          margin: 0,
          padding: "12px 16px",
          background: "#0A0A0A",
          fontSize: "0.75rem",
          lineHeight: "1.6",
        }}
        codeTagProps={{
          style: { color: "rgba(0,212,255,0.8)", fontFamily: "var(--font-geist-mono)" },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

// ——— Hex icon ———

function HexIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2L21.196 7V17L12 22L2.804 17V7L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 6L17.598 9.25V15.75L12 19L6.402 15.75V9.25L12 6Z"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}

// ——— Streaming indicator (typing dots) ———

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 justify-start">
      <div className="mt-1 shrink-0">
        <HexIcon className="h-7 w-7 text-secondary" />
      </div>
      <div
        className={cn(
          "rounded-2xl rounded-ts-sm px-5 py-4",
          "border border-white/6 bg-[#0D1117]",
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
