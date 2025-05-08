import React from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const ChatContainer = ({
  messages,
  inputMessage,
  setInputMessage,
  onSendMessage,
  disabled,
}) => {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
      </div>
      <ChatMessages messages={messages} />
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={onSendMessage}
        disabled={disabled}
      />
    </div>
  );
};

export default ChatContainer;
