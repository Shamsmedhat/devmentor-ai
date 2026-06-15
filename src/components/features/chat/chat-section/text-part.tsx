import { Fragment } from "react";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { ChatUIMessage } from "@/lib/types/chat";
import type { TextUIPart } from "ai";

import CopyButton from "./copy-button";
import { MessageBlockquote } from "./message-blockquote";

const responseComponents = { blockquote: MessageBlockquote };

// Brand-tinted assistant bubble - copied verbatim from the landing live-preview
// mock (live-preview.tsx:50) so the real chat matches it. Assistant role only;
// the user bubble keeps the vendored styling.
const ASSISTANT_BUBBLE =
  "rounded-2xl rounded-ss-sm border border-brand/25 bg-brand/5 px-4 py-3 leading-relaxed text-foreground/90";

export default function TextPart({
  message,
  part,
}: {
  message: ChatUIMessage;
  part: TextUIPart;
}) {
  // Variables
  const isAssistant = message.role === "assistant";

  return (
    <Fragment>
      <Message from={message.role}>
        <MessageContent className={isAssistant ? ASSISTANT_BUBBLE : undefined}>
          <MessageResponse mode="streaming" components={responseComponents}>
            {part.text}
          </MessageResponse>
        </MessageContent>

        {isAssistant && part.text.length > 0 && (
          <MessageActions>
            <CopyButton text={part.text} />
          </MessageActions>
        )}
      </Message>
    </Fragment>
  );
}
