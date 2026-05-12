import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { ChatUIMessage } from "@/lib/types/chat";
import {
  type DynamicToolUIPart,
  type ToolUIPart,
  getToolName,
} from "ai";
import { useTranslations } from "next-intl";
import { Fragment } from "react/jsx-runtime";

const CHAT_TOOL_TITLE_KEYS: Record<string, string> = {
  knowledge_base_search: "chat-tool-knowledge_base_search",
  browser_search: "chat-tool-browser_search",
};

function chatToolActivityTitle(
  t: ReturnType<typeof useTranslations>,
  toolName: string,
): string {
  const key = CHAT_TOOL_TITLE_KEYS[toolName];
  return key ? t(key) : toolName.replace(/_/g, " ");
}

export default function ToolPart({
  message,
  part,
}: {
  message: ChatUIMessage;
  part: ToolUIPart | DynamicToolUIPart;
}) {
  // Translations
  const t = useTranslations();

  // Variables
  const toolName = getToolName(part);
  const title = chatToolActivityTitle(t, toolName);
  const defaultOpen =
    part.state === "input-streaming" || part.state === "input-available";

  return (
    <Fragment>
      <Message from={message.role}>
        <MessageContent className="w-full max-w-full">
          <Tool defaultOpen={defaultOpen}>
            {part.type === "dynamic-tool" ? (
              <ToolHeader
                type={part.type}
                state={part.state}
                toolName={part.toolName}
                title={title}
              />
            ) : (
              <ToolHeader
                type={part.type}
                state={part.state}
                title={title}
              />
            )}
            <ToolContent>
              {"input" in part && part.input !== undefined ? (
                <ToolInput input={part.input} />
              ) : null}
              <ToolOutput
                output={"output" in part ? part.output : undefined}
                errorText={"errorText" in part ? part.errorText : undefined}
              />
            </ToolContent>
          </Tool>
        </MessageContent>
      </Message>
    </Fragment>
  );
}
