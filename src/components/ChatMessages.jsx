import React, { useEffect, useRef } from "react";

const MessageStatus = {
  SENDING: "sending",
  SENT: "sent",
  ERROR: "error",
};

// const STORAGE_KEY = "chat_app_data";

const ChatMessages = ({ messages = [] }) => {
  const messagesEndRef = useRef(null);
  // const [preservedMessages, setPreservedMessages] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // Scroll to bottom when preserved messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // // Message preservation logic
  // useEffect(() => {
  //   // Create a map of existing messages for easier lookup and updates
  //   const existingMessagesMap = new Map(
  //     preservedMessages.map((msg) => [msg.id, msg])
  //   );

  //   // Process new and updated messages
  //   const updatedMessages = [];
  //   let hasChanges = false;

  //   messages.forEach((msg) => {
  //     // Skip messages without content or text
  //     if (!msg || (!msg.content && !msg.text)) return;

  //     const existingMsg = existingMessagesMap.get(msg.id);

  //     // Case 1: New message - add it
  //     if (!existingMsg) {
  //       const newMsg = {
  //         ...JSON.parse(JSON.stringify(msg)),
  //         timestamp: msg.timestamp || Date.now(),
  //       };
  //       updatedMessages.push(newMsg);
  //       hasChanges = true;
  //     }
  //     // Case 2: Existing message but with updated content - update it
  //     else if (
  //       (msg.content && msg.content !== existingMsg.content) ||
  //       (msg.text && msg.text !== existingMsg.text)
  //     ) {
  //       const updatedMsg = {
  //         ...existingMsg,
  //         content: msg.content || existingMsg.content,
  //         text: msg.text || existingMsg.text,
  //       };
  //       updatedMessages.push(updatedMsg);
  //       hasChanges = true;
  //     }
  //     // Case 3: No changes - keep existing message
  //     else {
  //       updatedMessages.push(existingMsg);
  //     }

  //     // Remove from map to track processed messages
  //     existingMessagesMap.delete(msg.id);
  //   });

  //   // Add any remaining preserved messages that weren't in the new messages array
  //   existingMessagesMap.forEach((msg) => {
  //     updatedMessages.push(msg);
  //   });

  //   // Only update state if there are actual changes
  //   if (hasChanges) {
  //     console.log("Updating preserved messages:", updatedMessages);
  //     setPreservedMessages(updatedMessages);
  //   }
  // }, [messages]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Filter out empty messages, support content or text
  const validMessages = messages.filter(
    (message) =>
      message &&
      ((message.content && message.content.trim() !== "") ||
        (message.text && message.text.trim() !== ""))
  );

  // Sort messages by timestamp
  const sortedMessages = [...validMessages].sort((a, b) => {
    const aTime = a.timestamp || a.createdAt || 0;
    const bTime = b.timestamp || b.createdAt || 0;
    return aTime - bTime;
  });

  // If there are no messages, show an empty state
  if (validMessages.length === 0) {
    return (
      <div className="chat-messages">
        <div className="empty-chat-state">
          <h2>Start a conversation</h2>
          <p>Type a message below to begin chatting</p>
        </div>
      </div>
    );
  }
  console.log("this is the sorted messages", sortedMessages);

  return (
    <div className="chat-messages">
      {sortedMessages.map((message, index) => {
        const isAssistant =
          message.role === "assistant" || message.sender === "bot";

        return (
          <div
            key={message.id || index}
            className={`message ${message.role || message.sender} ${
              message.status === MessageStatus.ERROR ? "error" : ""
            }`}
          >
            {isAssistant && (
              <div className="assistant-avatar">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                  />
                </svg>
              </div>
            )}

            <div
              className={`message-content ${isAssistant ? "assistant-content" : ""}`}
            >
              <div className="message-text">
                {message.content || message.text}
              </div>
              {message.timestamp && (
                <div className="message-timestamp">
                  {formatTime(message.timestamp)}
                </div>
              )}
            </div>

            {message.status === MessageStatus.SENDING && (
              <div className="message-status">
                <span className="sending-indicator">•••</span>
              </div>
            )}
            {message.status === MessageStatus.ERROR && (
              <div className="message-status error">
                Failed to send. Try again?
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
