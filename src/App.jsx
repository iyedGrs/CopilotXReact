/* eslint-disable no-unused-vars */
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
    displayMessages,
    clearStorage,
    isTransitioning,
  } = useChat();
  console.log("App isTransitioning state:", isTransitioning); // Debug log

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        activeChat={currentChat}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onClearStorage={clearStorage}
        isTransitioning={isTransitioning} // Pass the new prop
      />
      <ChatContainer
        messages={displayMessages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={handleSendMessage}
        disabled={!currentChat}
        activeChat={currentChat}
      />
    </div>
  );
}

export default App;
