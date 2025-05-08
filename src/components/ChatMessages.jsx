import React, { useEffect, useRef } from "react";

const MessageStatus = {
  SENDING: "sending",
  SENT: "sent",
  ERROR: "error",
};
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

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // If there are no messages, show an empty state
  if (messages.length === 0) {
    return (
      <div className="chat-messages">
        <div className="empty-chat-state">
          <h2>Start a conversation</h2>
          <p>Type a message below to begin chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages">
      {messages.map((message, index) => {
        const isAssistant =
          message.role === "assistant" || message.sender === "bot";
        const isToolExecution = message.type === "ActionExecutionMessage";

        // Special handling for tool execution messages
        if (isToolExecution) {
          const isPending = message.isPending;

          // Skip rendering completed tool execution messages
          if (!isPending) {
            return null; // Don't display anything for completed tool calls
          }

          // Only render pending tool executions
          return (
            <div
              key={message.id || index}
              className="message tool-execution pending"
            >
              <div className="assistant-avatar tool-avatar">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M22 9V7h-2V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2h2v-2h-2v-2h2v-2h-2V9zm-4 10H4V5h14zM6 13h5v4H6zm6-6h4v3h-4zm0 4h4v6h-4z"
                  />
                </svg>
              </div>

              <div className="message-content tool-content">
                <div className="message-text">
                  <div className="tool-header pending">
                    <span className="tool-spinner"></span>
                    <span>Calling {message.name} tool...</span>
                  </div>

                  {message.arguments && (
                    <div className="tool-arguments">
                      <div className="tool-section-label">Arguments:</div>
                      <pre className="tool-data">
                        {JSON.stringify(message.arguments, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        }

        // Regular message handling (unchanged)
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
