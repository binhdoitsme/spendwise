"use client";

import { UserBasicDto } from "@/modules/users/application/dto/dtos.types";
import { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextProps {
  user?: UserBasicDto;
  setUser: (user?: UserBasicDto) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: UserBasicDto;
}) => {
  const [user, setUser] = useState<UserBasicDto | undefined>(initialUser);

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
