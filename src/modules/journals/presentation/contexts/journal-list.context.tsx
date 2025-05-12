"use client";
import { createContext, useContext, useState } from "react";
import {
  JournalBasicDto
} from "../../application/dto/dtos.types";

// Define the type for the context state
interface JournalListContextState {
  journals: JournalBasicDto[];
  setJournals: (journals: JournalBasicDto[]) => void;
}

// Create the context with an initial state
const JournalListContext = createContext<JournalListContextState | undefined>(
  undefined
);

// Create a custom hook to use the JournalContext
export const useJournalListContext = () => {
  const context = useContext(JournalListContext);
  if (!context) {
    throw new Error("useJournalContext must be used within a JournalProvider");
  }
  return context;
};

// Create a provider component
export const JournalListProvider: React.FC<{
  initialState: JournalBasicDto[];
  children: React.ReactNode;
}> = ({ initialState, children }) => {
  const [journals, setJournals] = useState(initialState);

  return (
    <JournalListContext.Provider value={{ journals, setJournals }}>
      {children}
    </JournalListContext.Provider>
  );
};
