/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import useChat from "./hooks/useChat";
import { useCopilotChat } from "@copilotkit/react-core";

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
  const [toolMessages, setToolMessages] = useState([]);
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
  console.log("this is the tool messages", toolMessages);
  // Only convert assistant messages to avoid duplicating user entries
  const visibleConverted = visibleMessages
    .filter((vm) => vm.role === "assistant" && vm.content)
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
  const toolMessagesArray = Object.values(toolMessages);
  const displayMessages = [
    ...existingMsgs,
    ...streamingMsgs,
    ...toolMessagesArray,
  ];

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
