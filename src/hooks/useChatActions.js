/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useCopilotContext } from "@copilotkit/react-core";

/**
 * Hook for chat actions like creating, selecting, and deleting chats
 * Separates action logic from state management
 */
const useChatActions = (chatCore) => {
  const { threadId, setThreadId } = useCopilotContext();
  const { chats, setChats, currentChatId, setCurrentChatId, persistChats } =
    chatCore;

  // Create a new chat
  const createNewChat = () => {
    const newThreadId = uuidv4();
    setThreadId(newThreadId);
    const newChat = {
      id: uuidv4(),
      title: `Chat ${chats.length + 1}`,
      messages: [],
      threadId: newThreadId,
    };
    setChats((prevChats) => [...prevChats, newChat]);
    setCurrentChatId(newChat.id);
    return newChat;
  };

  // Select an existing chat
  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  // Delete a chat
  const deleteChat = (chatId) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  // Persist changes when chats or currentChatId change
  useEffect(() => {
    persistChats();
  }, [chats, currentChatId]);

  return {
    createNewChat,
    selectChat,
    deleteChat,
  };
};

export default useChatActions;
