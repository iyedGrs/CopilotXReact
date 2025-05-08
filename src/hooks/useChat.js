/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import useLocalStorage from "./useLocalStorage";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
const MessageStatus = {
  SENDING: "sending",
  SENT: "sent",
  ERROR: "error",
};

const LOCAL_STORAGE_KEY = "chat_app_data";

import {
  useCoAgent,
  useCopilotContext,
  useCopilotChat,
} from "@copilotkit/react-core";
import { v4 as uuidv4 } from "uuid";
const useChat = () => {
  const {
    state,
    setState,
    run: RunAgent,
    stop: stopAgent,
    start,
  } = useCoAgent({
    initialState: {},
    name: "simple_agent",
  });
  const { appendMessage, visibleMessages, reset } = useCopilotChat();
  const { threadId, setThreadId } = useCopilotContext();
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
  // derive currentChat from chats
  const currentChat = chats.find((c) => c.id === currentChatId) || null;
  const [inputMessage, setInputMessage] = useState("");

  // track last processed visible message index to avoid re-processing
  const lastVisibleMessages = useRef([]);
  useEffect(() => {
    if (!currentChatId || !visibleMessages.length) return;

    // Get current chat messages
    setChats((prevChats) => {
      const updatedChats = [...prevChats];
      const currentChatIndex = updatedChats.findIndex(
        (chat) => chat.id === currentChatId
      );

      if (currentChatIndex === -1) return prevChats;

      const currentChat = updatedChats[currentChatIndex];
      // Create a map of existing messages for faster lookup
      const existingMessagesMap = new Map(
        (currentChat.messages || []).map((msg) => [msg.id, msg])
      );

      // Process all visible messages
      let hasChanges = false;
      const updatedMessages = [];

      // Process all assistant and user messages
      visibleMessages.forEach((msg) => {
        if (!msg || (!msg.content && !msg.text)) return;

        const existingMsg = existingMessagesMap.get(msg.id);

        // Case 1: New message
        if (!existingMsg) {
          const newMsg = {
            id: msg.id || uuidv4(),
            text: msg.content || msg.text,
            content: msg.content || msg.text,
            sender: msg.role === "user" ? "user" : "bot",
            role: msg.role === "user" ? "user" : "bot",
            status: MessageStatus.SENT,
            timestamp: msg.timestamp || Date.now(),
          };
          updatedMessages.push(newMsg);
          hasChanges = true;
        }
        // Case 2: Existing message with updated content
        else if (
          (msg.content && msg.content !== existingMsg.content) ||
          (msg.text && msg.text !== existingMsg.text)
        ) {
          const updatedMsg = {
            ...existingMsg,
            content: msg.content || existingMsg.content,
            text: msg.text || existingMsg.text,
          };
          updatedMessages.push(updatedMsg);
          hasChanges = true;
        }
        // Case 3: No changes
        else {
          updatedMessages.push(existingMsg);
        }

        // Remove from map to track processed messages
        existingMessagesMap.delete(msg.id);
      });

      // Add remaining messages that weren't in visibleMessages
      existingMessagesMap.forEach((msg) => {
        updatedMessages.push(msg);
      });

      // Only update if changes detected
      if (hasChanges) {
        // Sort by timestamp
        updatedMessages.sort((a, b) => {
          const aTime = a.timestamp || 0;
          const bTime = b.timestamp || 0;
          return aTime - bTime;
        });

        // Update the current chat with the new messages
        const updatedChat = {
          ...currentChat,
          messages: updatedMessages,
        };

        updatedChats[currentChatIndex] = updatedChat;
        lastVisibleMessages.current = [...visibleMessages];
        return updatedChats;
      }

      return prevChats;
    });
  }, [visibleMessages, currentChatId]);

  const handleSendMessage = (e) => {
    start();
    e.preventDefault();
    if (!inputMessage.trim() || !currentChatId) return;
    setInputMessage("");
    appendMessage(new TextMessage({ content: inputMessage, role: Role.User }), {
      followUp: true,
    });
    stopAgent();
  };

  console.log("these are the chats", chats);
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
    setInputMessage("");
  };

  const selectChat = (chatId) => {
    setCurrentChatId(chatId);
  };
  const deleteChat = (chatId) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setInputMessage("");
    }
  };
  console.log("this is visible messages", visibleMessages);

  useEffect(() => {
    setStoredData({ chats, currentChatId });
  }, [chats, currentChatId]);

  return {
    chats,
    currentChat,
    inputMessage,
    setInputMessage,
    createNewChat,
    handleSendMessage,
    selectChat,
    deleteChat,
    MessageStatus,
  };
};

export default useChat;
