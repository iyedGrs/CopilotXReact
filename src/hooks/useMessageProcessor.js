/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * Hook for processing messages from different sources
 * Handles filtering, sorting, and processing of messages
 */
const useMessageProcessor = (chatCore, visibleMessages, currentThreadId) => {
  const { currentChat, chats, setChats, currentChatId } = chatCore;
  const [toolMessages, setToolMessages] = useState({});
  const lastVisibleMessages = useRef([]);

  // Process tool messages from visibleMessages
  useEffect(() => {
    if (!visibleMessages || !visibleMessages.length) return;

    // Create a single state object to track all updates
    const updatedToolMessages = { ...toolMessages };

    // First pass: Process all tool calls
    visibleMessages.forEach((msg) => {
      if (msg.name && msg.parentMessageId) {
        const toolId = msg.id;
        updatedToolMessages[toolId] = {
          ...msg,
          sender: "bot",
          isPending: true,
          timestamp: new Date(msg.createdAt).getTime(),
          type: "ActionExecutionMessage",
        };
      }
    });

    // Second pass: Process all results to update the status of corresponding tools
    visibleMessages.forEach((msg) => {
      if (msg.type === "ResultMessage" && msg.actionExecutionId) {
        const associatedToolId = msg.actionExecutionId;

        if (updatedToolMessages[associatedToolId]) {
          updatedToolMessages[associatedToolId] = {
            ...updatedToolMessages[associatedToolId],
            isPending: false,
            result: msg.result,
            status: msg.status,
          };
        }
      }
    });

    setToolMessages(updatedToolMessages);
  }, [visibleMessages]);

  // Process and update chat messages
  useEffect(() => {
    if (!currentChatId || !visibleMessages.length) return;
    const currentChat = chats.find((chat) => chat.id === currentChatId);

    const threadActivatedAt = currentChat?.threadActivatedAt || 0;

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
        const msgTime = new Date(msg.createdAt).getTime();
        if (msgTime < threadActivatedAt) return;
        const existingMsg = existingMessagesMap.get(msg.id);

        // Case 1: New message
        if (!existingMsg) {
          const newMsg = {
            id: msg.id || uuidv4(),
            text: msg.content || msg.text,
            content: msg.content || msg.text,
            sender: msg.role === "user" ? "user" : "bot",
            role: msg.role === "user" ? "user" : "bot",
            status: "sent",
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

  // Get display messages by processing and merging all message sources
  const getDisplayMessages = () => {
    // Only show messages from the current chat
    if (!currentChat || !currentThreadId) {
      return [];
    }

    // Get messages already stored in the current chat
    const existingMsgs = (currentChat && currentChat.messages) || [];

    // Get current chat's thread ID for filtering
    const chatThreadId = currentChat.threadId;

    // Only convert assistant messages from the current thread
    const visibleConverted = visibleMessages
      .filter((vm) => {
        // Only include assistant messages from the current thread
        return (
          vm.role === "assistant" &&
          vm.content &&
          // Either there's no threadId (backward compatibility) or it matches current thread
          vm.threadId === chatThreadId
        );
      })
      .map((vm) => ({
        id: vm.id,
        content: vm.content,
        text: vm.content,
        role: vm.role,
        sender: vm.role === "assistant" ? "bot" : "user",
        status: "sent",
        timestamp: new Date(vm.createdAt).getTime(),
        threadId: chatThreadId,
      }));

    // Merge confirmed chat messages with real-time streaming messages
    // but only include messages we don't already have
    const streamingMsgs = visibleConverted.filter(
      (vm) => !existingMsgs.some((m) => m.id === vm.id)
    );

    // Get tool messages for the current thread only
    const currentThreadToolMessages = Object.values(toolMessages).filter(
      (msg) => msg.threadId === chatThreadId || !msg.threadId
    );

    // Combine all message sources
    const allMessages = [
      ...existingMsgs,
      ...streamingMsgs,
      ...currentThreadToolMessages,
    ];

    // Filter out empty messages and messages from other threads
    const validMessages = allMessages.filter(
      (message) =>
        message &&
        // Only show messages from current thread
        (!message.threadId || message.threadId === chatThreadId) &&
        // Make sure message has content
        ((message.content && message.content.trim() !== "") ||
          (message.text && message.text.trim() !== "") ||
          message.type === "ActionExecutionMessage")
    );

    // Sort messages by timestamp
    return validMessages.sort((a, b) => {
      const aTime = a.timestamp || a.createdAt || 0;
      const bTime = b.timestamp || b.createdAt || 0;
      return aTime - bTime;
    });
  };

  return {
    toolMessages,
    displayMessages: getDisplayMessages(),
  };
};

export default useMessageProcessor;
