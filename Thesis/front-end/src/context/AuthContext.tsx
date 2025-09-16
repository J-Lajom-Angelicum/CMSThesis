// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { users as initialUsers, type UserType } from "../data/users";

// Role mapping helper
const roleMap: Record<number, "DOCTOR" | "STAFF" | "ADMIN"> = {
  1: "DOCTOR",
  2: "STAFF",
  3: "ADMIN",
};

export type Role = "ADMIN" | "DOCTOR" | "STAFF" | null;

interface AuthContextType {
  user: string | null;
  role: Role;
  roleId: number | null;
  users: UserType[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createUser: (newUser: UserType) => void;
  updateUser: (index: number, updated: Partial<UserType>) => void;
  deleteUser: (index: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize users safely from localStorage or default
  const [users, setUsers] = useState<UserType[]>(() => {
    const stored = localStorage.getItem("users");
    const parsed: UserType[] = stored ? JSON.parse(stored) : initialUsers;

    // Ensure every user has a valid roleId and role
    return parsed.map(u => ({
      ...u,
      roleId: u.roleId ?? (u.role === "ADMIN" ? 3 : u.role === "DOCTOR" ? 1 : 2),
      role: u.roleId ? roleMap[u.roleId] : u.role
    }));
  });

  const [user, setUser] = useState<string | null>(() => localStorage.getItem("user"));
  const [role, setRole] = useState<Role>(() => (localStorage.getItem("role") as Role) || null);
  const [roleId, setRoleId] = useState<number | null>(() => {
    const stored = localStorage.getItem("roleId");
    return stored ? parseInt(stored, 10) : null;
  });

  // Persist changes to localStorage
  useEffect(() => localStorage.setItem("users", JSON.stringify(users)), [users]);
  useEffect(() => user ? localStorage.setItem("user", user) : localStorage.removeItem("user"), [user]);
  useEffect(() => role ? localStorage.setItem("role", role) : localStorage.removeItem("role"), [role]);
  useEffect(() => roleId !== null ? localStorage.setItem("roleId", String(roleId)) : localStorage.removeItem("roleId"), [roleId]);

  // Login function
  const login = (username: string, password: string) => {
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      setUser(found.username);
      const safeRoleId = found.roleId ?? (found.role === "ADMIN" ? 3 : found.role === "DOCTOR" ? 1 : 2);
      setRoleId(safeRoleId);
      setRole(roleMap[safeRoleId]);
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

  // Create a new user
  const createUser = (newUser: UserType) => {
    const roleName = roleMap[newUser.roleId];
    setUsers(prev => [
      ...prev,
      { ...newUser, id: prev.length + 1, role: roleName, isActive: true }
    ]);
  };

  // Update an existing user
  const updateUser = (index: number, updated: Partial<UserType>) => {
    setUsers(prev =>
      prev.map((u, i) => (i === index ? { ...u, ...updated, role: updated.roleId ? roleMap[updated.roleId] : u.role } : u))
    );
  };

  // Delete a user
  const deleteUser = (index: number) => setUsers(prev => prev.filter((_, i) => i !== index));

  return (
    <AuthContext.Provider value={{ user, role, roleId, users, login, logout, createUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};
