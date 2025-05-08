/* eslint-disable no-unused-vars */
import "./App.css";
import Sidebar from "./components/Sidebar";
import ChatContainer from "./components/ChatContainer";
import useChat from "./hooks/useChat";

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
  } = useChat();

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
        disabled={!currentChat}
      />
    </div>
  );
}

export default App;
