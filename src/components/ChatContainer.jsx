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
