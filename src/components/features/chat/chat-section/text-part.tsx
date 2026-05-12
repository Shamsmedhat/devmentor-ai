import { Fragment } from "react";
import { Message } from "@/components/ai-elements/message";
import { MessageContent } from "@/components/ai-elements/message";
import { MessageResponse } from "@/components/ai-elements/message";
import type { ChatUIMessage } from "@/lib/types/chat";
import type { TextUIPart } from "ai";

export default function TextPart({
  message,
  part,
}: {
  message: ChatUIMessage;
  part: TextUIPart;
}) {
  return (
    <Fragment>
      <Message from={message.role}>
        <MessageContent>
          <MessageResponse mode="streaming">{part.text}</MessageResponse>
        </MessageContent>
      </Message>
    </Fragment>
  );
}
