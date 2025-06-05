"use client";
import { createContext, useCallback, useContext, useState } from "react";

const LoaderContext = createContext({
  isLoading: false,
  loadingStart: () => {},
  loadingEnd: () => {},
});

type LoadingHooks = {
  loadingStart: () => void;
  loadingEnd: () => void;
};

export function withLoading<Args extends unknown[], R>(hooks: LoadingHooks) {
  return function (
    targetFn: (...args: Args) => R | Promise<R>
  ): (...args: Args) => Promise<R> {
    return async (...args: Args): Promise<R> => {
      hooks.loadingStart();
      try {
        return await Promise.resolve(targetFn(...args));
      } finally {
        hooks.loadingEnd();
      }
    };
  };
}

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider
      value={{
        isLoading,
        loadingStart: useCallback(() => setLoading(true), []),
        loadingEnd: useCallback(() => setLoading(false), []),
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};
