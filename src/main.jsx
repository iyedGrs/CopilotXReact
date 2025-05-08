import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CopilotKit } from "@copilotkit/react-core";
import useLocalStorage from "./hooks/useLocalStorage";

// Create a wrapper component to manage the threadId persistence
const CopilotWrapper = ({ children }) => {
  const [threadId] = useLocalStorage("copilotThreadId", "");
  const api_key = import.meta.env.VITE_COPILOT_API_KEY;
  
  if (!api_key) {
    console.error("API key is not defined. Please set VITE_COPILOT_API_KEY in your .env file.");
  }
  if (!threadId) {
    console.error("Thread ID is not defined. Please set it in your local storage.");
  }
  else{
    console.log("Thread ID loaded from local storage:", threadId);
  }
  
  return (
    <CopilotKit 
      threadId={threadId} 
      publicApiKey={api_key} 
      agent="simple_agent"
    >
      {children}
    </CopilotKit>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CopilotWrapper>
      <App />
    </CopilotWrapper>
  </StrictMode>
);
