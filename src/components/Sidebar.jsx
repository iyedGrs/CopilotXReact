import React from "react";
import "../App.css";

const Sidebar = ({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onClearStorage,
  isTransitioning, // Add this new prop
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button
          className="new-chat-btn"
          onClick={onNewChat}
          disabled={isTransitioning}
        >
          {isTransitioning ? "Loading..." : "+ New Chat"}
        </button>
      </div>
      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="no-chats-message">
            No chats yet. Click "New Chat" to start.
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === activeChat?.id ? "active" : ""} ${isTransitioning ? "disabled" : ""}`}
              onClick={() => !isTransitioning && onSelectChat(chat.id)}
              style={{ opacity: isTransitioning ? 0.6 : 1 }}
            >
              <span className="chat-title">
                {chat.id === activeChat?.id && <span>● </span>}
                {chat.title || "New Chat"}
                {isTransitioning &&
                  chat.id === activeChat?.id &&
                  " (loading...)"}
              </span>
              <button
                className="delete-chat-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isTransitioning) onDeleteChat(chat.id);
                }}
                disabled={isTransitioning}
                aria-label="Delete chat"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
      <div className="sidebar-footer">
        <button
          className="clear-storage-btn"
          onClick={onClearStorage}
          disabled={isTransitioning}
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
