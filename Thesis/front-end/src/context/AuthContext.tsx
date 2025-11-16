// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";

const roleMap: Record<number, "DOCTOR" | "STAFF" | "ADMIN"> = {
  1: "DOCTOR",
  2: "STAFF",
  3: "ADMIN",
};

export type Role = "ADMIN" | "DOCTOR" | "STAFF" | null;

interface AuthContextType {
  userId: number | null; //recently added
  user: string | null;
  role: Role;
  roleId: number | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem("userId");
    return stored ? parseInt(stored, 10) : null;
  }); // recently added
  const [user, setUser] = useState<string | null>(() => localStorage.getItem("user"));
  const [role, setRole] = useState<Role>(() => (localStorage.getItem("role") as Role) || null);
  const [roleId, setRoleId] = useState<number | null>(() => {
    const stored = localStorage.getItem("roleId");
    return stored ? parseInt(stored, 10) : null;
  });

  // Persist login info
  useEffect(() => (userId !== null ? localStorage.setItem("userId", String(userId)) : localStorage.removeItem("userId")), [userId]); //recently added
  useEffect(() => (user ? localStorage.setItem("user", user) : localStorage.removeItem("user")), [user]);
  useEffect(() => (role ? localStorage.setItem("role", role) : localStorage.removeItem("role")), [role]);
  useEffect(() => (roleId !== null ? localStorage.setItem("roleId", String(roleId)) : localStorage.removeItem("roleId")), [roleId]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/Users/login", {
        username: username, // must match backend JSON keys
        password: password, // must match backend JSON keys
      });

      const userData = response.data; // { userId, username, email, roleId, isActive }

      if (!userData.isActive) return false; // block inactive accounts

      // Set frontend state
      setUserId(userData.userId); // recently added
      setUser(userData.username);
      setRoleId(userData.roleId);
      setRole(roleMap[userData.roleId]);

      return true;
    } catch (err: any) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    setUserId(null); // recently added
    setUser(null);
    setRole(null);
    setRoleId(null);
    localStorage.removeItem("userId"); // recently added
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("roleId");
  };

  return (
    <AuthContext.Provider value={{ userId// recently added//
    , user, role, roleId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
