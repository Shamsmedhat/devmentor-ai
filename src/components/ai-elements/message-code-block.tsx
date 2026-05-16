"use client";

import { cn } from "@/lib/utils";
import type { BundledLanguage } from "shiki";
import { isValidElement, type ComponentProps, type ComponentType } from "react";
import type { ExtraProps } from "streamdown";

import {
  CODE_BLOCK_LTR_CLASS,
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./code-block";

const LANGUAGE_CLASS = /language-(\S+)/;

type MessageCodeBlockProps = ComponentProps<"code"> & { "data-block"?: boolean };

function extractCode(children: ComponentProps<"code">["children"]): string {
  if (typeof children === "string") {
    return children;
  }

  if (
    isValidElement(children) &&
    typeof children.props === "object" &&
    children.props !== null &&
    "children" in children.props &&
    typeof children.props.children === "string"
  ) {
    return children.props.children;
  }

  return "";
}

export const MessageCodeBlock: ComponentType<
  Record<string, unknown> & ExtraProps
> = (rawProps) => {
  const { className, children, ...props } = rawProps as MessageCodeBlockProps;
  const isBlock = "data-block" in props;

  if (!isBlock) {
    return (
      <code
        dir="ltr"
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 font-mono text-sm",
          CODE_BLOCK_LTR_CLASS,
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  }

  const languageMatch = className?.match(LANGUAGE_CLASS);
  const language = (languageMatch?.[1] ?? "text") as BundledLanguage;
  const code = extractCode(children);

  return (
    <CodeBlock
      code={code}
      dir="ltr"
      language={language}
      showLineNumbers
      className={CODE_BLOCK_LTR_CLASS}
    >
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>{language}</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  );
};
