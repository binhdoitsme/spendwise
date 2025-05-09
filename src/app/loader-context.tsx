"use client";
import { FullScreenLoader } from "@/components/ui/spinner";
import { createContext, useContext, useState } from "react";

const FullScreenLoaderContext = createContext({
  showLoader: () => {},
  hideLoader: () => {},
});

export const useFullScreenLoader = () => useContext(FullScreenLoaderContext);

export const FullScreenLoaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showLoader = () => setIsVisible(true);
  const hideLoader = () => setIsVisible(false);

  return (
    <FullScreenLoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {isVisible && <FullScreenLoader />}
    </FullScreenLoaderContext.Provider>
  );
};
