import React from "react";
import "../App.css";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { useCoAgent } from "@copilotkit/react-core";
const ChatInput = ({
  inputMessage,
  setInputMessage,
  onSendMessage,
  disabled,
}) => {
  const { state, run: RunAgent } = useCoAgent({
    initialState: {},
    name: "simple_agent",
  });

  // Use the onSendMessage prop directly rather than creating our own handleSubmit
  // This ensures we use the complete message handling flow from useChat

  return (
    <div className="chat-input">
      <form onSubmit={onSendMessage}>
        <input
          type="text"
          placeholder={
            disabled
              ? "Select a chat to start messaging..."
              : "Type your message here..."
          }
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || !inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
