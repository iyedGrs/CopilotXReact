import { useState } from "react";

/**
 * Custom hook for managing state that persists in localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if nothing exists in localStorage
 * @returns {[any, Function]} - State value and setter function
 */
const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      console.log(`Loading data from localStorage with key: ${key}...`);
      // Get from localStorage by key
      const item = localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to localStorage
      console.log(`Saving to localStorage with key: ${key}:`, valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
