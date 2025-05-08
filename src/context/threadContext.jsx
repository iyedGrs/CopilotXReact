import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "../hooks/useLocalStorage"; // Ensure this path is correct

const ThreadContext = createContext(undefined);

export const ThreadProvider = ({ children }) => {
  const [currentThreadId, setCurrentThreadIdInStorage] = useLocalStorage(
    "copilotActiveThreadId",
    ""
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      let initialThreadIdToSet = currentThreadId; // Value from useLocalStorage("copilotActiveThreadId")

      if (initialThreadIdToSet === "") {
        // console.log("No active threadId in 'copilotActiveThreadId'. Attempting to find one from chats...");
        try {
          const chatAppDataString = localStorage.getItem("chat_app_data");
          if (chatAppDataString) {
            const chatAppData = JSON.parse(chatAppDataString);
            // Ensure chatAppData and chatAppData.chats are valid and chats array is not empty
            if (
              chatAppData &&
              Array.isArray(chatAppData.chats) &&
              chatAppData.chats.length > 0
            ) {
              const lastChat = chatAppData.chats[chatAppData.chats.length - 1];
              if (
                lastChat &&
                lastChat.threadId &&
                typeof lastChat.threadId === "string" &&
                lastChat.threadId.trim() !== ""
              ) {
                initialThreadIdToSet = lastChat.threadId;
                // console.log("Using threadId from the most recent chat:", initialThreadIdToSet);
              } else {
                // console.log("Most recent chat has no valid threadId or threadId is empty.");
              }
            } else {
              // console.log("No chats found in 'chat_app_data' or chats array is empty.");
            }
          } else {
            // console.log("'chat_app_data' not found in localStorage.");
          }
        } catch (error) {
          console.error(
            "Error reading or parsing 'chat_app_data' from localStorage:",
            error
          );
          // Fallback to creating a new threadId if there's an error
        }
      }

      if (
        initialThreadIdToSet === "" ||
        typeof initialThreadIdToSet !== "string" ||
        initialThreadIdToSet.trim() === ""
      ) {
        // If no threadId found from "copilotActiveThreadId" or from chats, create a new one.
        initialThreadIdToSet = uuidv4();
        // console.log("Creating a new threadId as no suitable existing one was found:", initialThreadIdToSet);
      }

      // Only update storage if the determined ID is different from what useLocalStorage initially provided,
      // or if useLocalStorage provided an empty string and we've now determined a non-empty one.
      if (
        initialThreadIdToSet !== currentThreadId ||
        (currentThreadId === "" && initialThreadIdToSet !== "")
      ) {
        setCurrentThreadIdInStorage(initialThreadIdToSet);
      }
      setIsInitialized(true);
    }
  }, [currentThreadId, setCurrentThreadIdInStorage, isInitialized]);

  // Fallback: If currentThreadId somehow becomes empty *after* initialization, generate a new one.
  useEffect(() => {
    if (
      isInitialized &&
      (currentThreadId === "" ||
        typeof currentThreadId !== "string" ||
        currentThreadId.trim() === "")
    ) {
      console.warn(
        "Current active thread ID was invalid or empty after initialization. Generating a new one."
      );
      const newId = uuidv4();
      setCurrentThreadIdInStorage(newId);
    }
  }, [currentThreadId, isInitialized, setCurrentThreadIdInStorage]);

  const selectThread = useCallback(
    (threadId) => {
      if (threadId && typeof threadId === "string" && threadId.trim() !== "") {
        setCurrentThreadIdInStorage(threadId);
      } else {
        console.warn(
          "Attempted to select an invalid or empty threadId. Creating and selecting a new one instead."
        );
        const newId = uuidv4();
        setCurrentThreadIdInStorage(newId);
      }
    },
    [setCurrentThreadIdInStorage]
  );

  const createNewThread = useCallback(() => {
    const newThreadId = uuidv4();
    setCurrentThreadIdInStorage(newThreadId);
    return newThreadId;
  }, [setCurrentThreadIdInStorage]);

  if (
    !isInitialized ||
    !currentThreadId ||
    typeof currentThreadId !== "string" ||
    currentThreadId.trim() === ""
  ) {
    // Wait until the useEffect has run and currentThreadId is guaranteed to be a non-empty valid string.
    return null; // Or a loading spinner/message
  }

  return (
    <ThreadContext.Provider
      value={{ currentThreadId, selectThread, createNewThread }}
    >
      {children}
    </ThreadContext.Provider>
  );
};

export const useThread = () => {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThread must be used within a ThreadProvider");
  }
  return context;
};
