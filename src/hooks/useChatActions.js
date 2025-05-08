/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
// Import useThread instead of useCopilotContext
import { useThread } from "../context/threadContext.jsx";
import { useCopilotChat } from "@copilotkit/react-core";

/**
 * Hook for chat actions like creating, selecting, and deleting chats
 * Separates action logic from state management
 */
const useChatActions = (chatCore) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use the custom ThreadContext instead of CopilotKit's context
  const { currentThreadId, selectThread, createNewThread } = useThread();
  const { reset } = useCopilotChat();
  const { chats, setChats, currentChatId, setCurrentChatId, persistChats } =
    chatCore;

  // Create a new chat
  const createNewChat = () => {
    // Reset CopilotKit chat state to clear previous messages

    if (isTransitioning) return;
    reset();
    setIsTransitioning(true);
    // Use our custom context's createNewThread to generate a new thread ID
    const newThreadId = createNewThread();
    console.log(`Created new thread ID using ThreadContext: ${newThreadId}`);

    // Create the new chat object with the same thread ID
    const newChat = {
      id: uuidv4(),
      title: `Chat ${chats.length + 1}`,
      messages: [],
      threadId: newThreadId, // Store the thread ID in the chat object
      threadActivatedAt: Date.now(), // Store the activation time
    };

    // Add the new chat to the chats array
    setChats((prevChats) => [...prevChats, newChat]);

    // Set the new chat as the current chat
    setCurrentChatId(newChat.id);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
    return newChat;
  };

  // Select an existing chat
  const selectChat = (chatId) => {
    // Don't do anything if the chat is already selected
    if (chatId === currentChatId) return;
    setIsTransitioning(true);

    // Find the selected chat to get its thread ID
    const selectedChat = chats.find((chat) => chat.id === chatId);

    if (selectedChat && selectedChat.threadId) {
      // Use our custom context's selectThread to update the current thread ID
      console.log(
        `Updating thread ID using ThreadContext to: ${selectedChat.threadId}`
      );
      selectThread(selectedChat.threadId);
    }
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            threadActivatedAt: Date.now(),
          };
        }
        return chat;
      })
    );

    setCurrentChatId(chatId);
    setTimeout(() => {
      console.log("Setting transition state to FALSE"); // Add debug logging
      setIsTransitioning(false);
    }, 1000);
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
    isTransitioning,
  };
};

export default useChatActions;
