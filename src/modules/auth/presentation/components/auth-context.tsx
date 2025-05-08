"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface User {
  email: string;
  avatar: {
    url: string;
  };
}

interface AuthContextProps {
  user?: User;
  setUser: (user?: User) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: User;
}) => {
  const [user, setUser] = useState<User | undefined>(initialUser);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
