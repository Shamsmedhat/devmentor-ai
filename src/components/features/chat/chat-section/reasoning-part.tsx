import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useTranslations } from "next-intl";
import { Fragment } from "react/jsx-runtime";
import type { ChatUIMessage } from "@/lib/types/chat";
import type { ReasoningUIPart } from "ai";

export default function ReasoningPart({
  message,
  part,
}: {
  message: ChatUIMessage;
  part: ReasoningUIPart;
}) {
  // Translations
  const t = useTranslations();

  // Variables
  const reasoningStreaming = part.state === "streaming";

  return (
    <Fragment>
      <Message from={message.role}>
        <MessageContent className="w-full max-w-full">
          <Reasoning
            isStreaming={reasoningStreaming}
            defaultOpen={false}
          >
            <ReasoningTrigger
              getThinkingMessage={(isStreaming, duration) => {
                if (isStreaming || duration === 0) {
                  return (
                    <Shimmer duration={1}>
                      {t("chat-reasoning-streaming")}
                    </Shimmer>
                  );
                }
                if (duration === undefined) {
                  return <p>{t("chat-reasoning-brief")}</p>;
                }
                return (
                  <p>
                    {t("chat-reasoning-seconds", {
                      seconds: duration,
                    })}
                  </p>
                );
              }}
            />
            <ReasoningContent>{part.text}</ReasoningContent>
          </Reasoning>
        </MessageContent>
      </Message>
    </Fragment>
  );
}
