import { useState } from "react";
import useLocalStorage from "./useLocalStorage";

const LOCAL_STORAGE_KEY = "chat_app_data";

/**
 * Core hook for chat state management
 * Handles the basic chat state and persistence
 */
const useChatCore = () => {
  // Use our custom localStorage hook to persist data
  const [storedData, setStoredData] = useLocalStorage(LOCAL_STORAGE_KEY, {
    chats: [],
    currentChatId: null,
  });

  // Set up state from localStorage or initial values
  const [chats, setChats] = useState(storedData.chats || []);
  const [currentChatId, setCurrentChatId] = useState(
    storedData.currentChatId || null
  );

  // Derive currentChat from chats
  const currentChat = chats.find((c) => c.id === currentChatId) || null;

  // Persistence function
  const persistChats = () => {
    setStoredData({ chats, currentChatId });
  };

  return {
    chats,
    setChats,
    currentChat,
    currentChatId,
    setCurrentChatId,
    persistChats,
  };
};

export default useChatCore;
