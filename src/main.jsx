import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CopilotKit } from "@copilotkit/react-core";
import { ThreadProvider, useThread } from "./context/threadContext.jsx";

// Create a wrapper component to manage the threadId persistence
const CopilotWrapper = ({ children }) => {
  const api_key = import.meta.env.VITE_COPILOT_API_KEY;
  const { currentThreadId } = useThread();

  if (!currentThreadId) {
    // This should be brief, while ThreadProvider initializes the threadId
    // You might want to show a loading indicator here
    console.log("Waiting for ThreadProvider to initialize threadId...");
    return <div>Loading Copilot session...</div>;
  }

  if (!api_key) {
    console.error(
      "API key is not defined. Please set VITE_COPILOT_API_KEY in your .env file."
    );
  }

  return (
    <CopilotKit
      threadId={currentThreadId}
      publicApiKey={api_key}
      agent="simple_agent"
    >
      {children}
    </CopilotKit>
  );
};

// Render the application outside of any component
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThreadProvider>
      <CopilotWrapper>
        <App />
      </CopilotWrapper>
    </ThreadProvider>
  </StrictMode>
);
