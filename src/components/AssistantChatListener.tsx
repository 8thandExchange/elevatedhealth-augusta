import { useEffect } from "react";
import { OPEN_ASSISTANT_CHAT_EVENT, openAssistantChat } from "@/lib/openAssistantChat";

/** Bridges legacy CustomEvent dispatches to the GHL chat launcher. */
export default function AssistantChatListener() {
  useEffect(() => {
    const handler = () => openAssistantChat();
    document.addEventListener(OPEN_ASSISTANT_CHAT_EVENT, handler);
    return () => document.removeEventListener(OPEN_ASSISTANT_CHAT_EVENT, handler);
  }, []);

  return null;
}
