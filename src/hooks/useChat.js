/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useCoAgent, useCopilotChat } from "@copilotkit/react-core";
import { useThread } from "../context/threadContext.jsx";

// Import our custom hooks
import useChatCore from "./useChatCore";
import useChatActions from "./useChatActions";
import useMessageProcessor from "./useMessageProcessor";

// Message status constants
export const MessageStatus = {
  SENDING: "sending",
  SENT: "sent",
  ERROR: "error",
};

/**
 * Main chat hook that composes smaller hooks for a complete chat experience
 * Acts as the facade for all chat-related functionality
 */
const useChat = () => {
  // Agent and core APIs
  const {
    run: RunAgent,
    stop: stopAgent,
    start,
  } = useCoAgent({
    initialState: {},
    name: "simple_agent",
  });

  const { appendMessage, visibleMessages, reset } = useCopilotChat();
  const { currentThreadId, createNewThread } = useThread();

  // Chat state management through useChatCore
  const chatCore = useChatCore();
  const { currentChat } = chatCore;

  // Input state management
  const [inputMessage, setInputMessage] = useState("");

  // Chat actions through useChatActions
  const { createNewChat, selectChat, deleteChat, isTransitioning } =
    useChatActions(chatCore);

  // Message processing through useMessageProcessor
  const { displayMessages } = useMessageProcessor(
    chatCore,
    visibleMessages,
    currentThreadId
  );

  // Message sending handler
  const handleSendMessage = (e) => {
    start();
    e.preventDefault();
    if (!inputMessage.trim() || !chatCore.currentChatId) return;
    setInputMessage("");
    appendMessage(new TextMessage({ content: inputMessage, role: Role.User }), {
      followUp: true,
    });
    stopAgent();
  };

  // Function to clear all localStorage data
  const clearStorage = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all chat data? This action cannot be undone."
      )
    ) {
      // Clear all localStorage items
      localStorage.clear();

      // Reset the chat state
      chatCore.setChats([]);
      chatCore.setCurrentChatId(null);

      // Create a new thread for fresh start
      createNewThread();

      // Reset CopilotKit chat
      // reset();

      // Provide feedback
      alert("All chat data has been cleared. The page will refresh now.");

      // Reload the page to ensure all components update correctly
      window.location.reload();
    }
  };

  return {
    chats: chatCore.chats,
    currentChat,
    inputMessage,
    setInputMessage,
    createNewChat,
    handleSendMessage,
    selectChat,
    deleteChat,
    MessageStatus,
    displayMessages,
    clearStorage,
    isTransitioning,
  };
};

export default useChat;
