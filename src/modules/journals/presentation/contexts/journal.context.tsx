"use client";
import { createContext, useContext, useState } from "react";
import { JournalDetailedDto } from "../../application/dto/dtos.types";

// Define the type for the context state
interface JournalContextState {
  journal: JournalDetailedDto;
  setJournal: (journal: JournalDetailedDto) => void;
}

// Create the context with an initial state
const JournalContext = createContext<JournalContextState | undefined>(
  undefined
);

// Create a custom hook to use the JournalContext
export const useJournalContext = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error("useJournalContext must be used within a JournalProvider");
  }
  return context;
};

// Create a provider component
export const JournalProvider: React.FC<{
  initialState: JournalDetailedDto;
  children: React.ReactNode;
}> = ({ initialState, children }) => {
  const [journal, setJournal] = useState(initialState);

  return (
    <JournalContext.Provider value={{ journal, setJournal }}>
      {children}
    </JournalContext.Provider>
  );
};
