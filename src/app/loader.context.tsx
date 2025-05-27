"use client";
import { createContext, useContext, useState } from "react";

const LoaderContext = createContext({
  isLoading: false,
  loadingStart: () => {},
  loadingEnd: () => {},
});

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider
      value={{
        isLoading,
        loadingStart: () => setLoading(true),
        loadingEnd: () => setLoading(false),
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};
