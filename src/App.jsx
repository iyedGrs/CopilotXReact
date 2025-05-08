/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import useChat from "./hooks/useChat";
import { useCoAgent, useCopilotChat } from "@copilotkit/react-core";

function App() {
  const {
    chats,
    currentChat,
    inputMessage,
    setInputMessage,
    createNewChat,
    handleSendMessage,
    selectChat,
    deleteChat,
  } = useChat();

  const { visibleMessages } = useCopilotChat();
  // Only convert assistant messages to avoid duplicating user entries
  const visibleConverted = visibleMessages
    .filter((vm) => vm.role === "assistant")
    .map((vm) => ({
      id: vm.id,
      content: vm.content,
      text: vm.content,
      role: vm.role,
      sender: vm.role === "assistant" ? "bot" : "user",
      status: "sent",
      timestamp: new Date(vm.createdAt).getTime(),
    }));
  // Merge confirmed chat messages with real-time streaming messages
  const existingMsgs = (currentChat && currentChat.messages) || [];
  const streamingMsgs = visibleConverted.filter(
    (vm) => !existingMsgs.some((m) => m.id === vm.id)
  );
  const displayMessages = [...existingMsgs, ...streamingMsgs];

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        currentChat={currentChat}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
      />
      <ChatContainer
        messages={displayMessages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={handleSendMessage}
        disabled={false}
      />
    </div>
  );
}

export default App;
