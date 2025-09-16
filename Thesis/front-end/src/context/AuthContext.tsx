// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { users as initialUsers } from "../data/users";
import type { UserType } from "../data/users";

// Role mapping inside context only
const roleMap: Record<number, "DOCTOR" | "STAFF" | "ADMIN"> = {
  1: "DOCTOR",
  2: "STAFF",
  3: "ADMIN",
};

export type Role = "ADMIN" | "DOCTOR" | "STAFF" | null;

// interface User {
//   username: string;
//   password: string;
//   role: Role;
//   roleId: number;
// }

interface User extends UserType {}

interface AuthContextType {
  user: string | null;
  role: Role;
  roleId: number | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createUser: (
    username: string,
    password: string,
    name: string,
    email: string,
    contactNo: string,
    roleId: 1 | 2 | 3
  ) => void;
  updateUser: (index: number, updated: Partial<User>) => void;
  deleteUser: (index: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem("users");
    return stored ? JSON.parse(stored) : initialUsers;
  });

  const [user, setUser] = useState<string | null>(() => localStorage.getItem("user"));
  const [role, setRole] = useState<Role>(() => (localStorage.getItem("role") as Role) || null);
  const [roleId, setRoleId] = useState<number | null>(() => {
    const stored = localStorage.getItem("roleId");
    return stored ? parseInt(stored, 10) : null;
  });

  useEffect(() => localStorage.setItem("users", JSON.stringify(users)), [users]);
  useEffect(() => user ? localStorage.setItem("user", user) : localStorage.removeItem("user"), [user]);
  useEffect(() => role ? localStorage.setItem("role", role) : localStorage.removeItem("role"), [role]);
  useEffect(() => roleId ? localStorage.setItem("roleId", String(roleId)) : localStorage.removeItem("roleId"), [roleId]);

  const login = (username: string, password: string) => {
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      setUser(found.username);
      setRole(found.role);
      setRoleId(found.roleId);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setRoleId(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("roleId");
  };

  const createUser = (
    username: string,
    password: string,
    name: string,
    email: string,
    contactNo: string,
    roleId: 1 | 2 | 3
  ) => {
  const roleName = roleMap[roleId];
  setUsers(prev => [
    ...prev,
    {
      id: prev.length + 1, // fake ID for frontend
      username,
      password,
      name,
      email,
      contactNo,
      roleId,
      role: roleName,
      isActive: true,
    },
  ]);
  };

  const updateUser = (
    index: number,
    updated: Partial<UserType> // partial allows optional fields
  ) => {
  setUsers(prev =>
    prev.map((u, i) => (i === index ? { ...u, ...updated } : u))
  );
  };


  const deleteUser = (index: number) => setUsers(prev => prev.filter((_, i) => i !== index));

  return (
    <AuthContext.Provider value={{ user, role, roleId, users, login, logout, createUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};
