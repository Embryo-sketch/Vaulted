"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ADMIN_USERS, type AdminUser } from "@/lib/admin-users-data";

type AdminUsersContextValue = {
  users: AdminUser[];
  getUser: (id: string) => AdminUser | undefined;
  addUser: (name: string, email: string) => void;
  deleteUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => void;
};

const AdminUsersContext = createContext<AdminUsersContextValue | null>(null);

export function AdminUsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);

  function getUser(id: string) {
    return users.find((u) => u.id === id);
  }

  function addUser(name: string, email: string) {
    const newUser: AdminUser = {
      id: `u${Date.now()}`,
      name,
      email,
      status: "Pending",
      joined: "Just now",
      portfolioValue: 0,
      availableCash: 0,
    };
    setUsers((prev) => [newUser, ...prev]);
  }

  function deleteUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function updateUser(id: string, updates: Partial<AdminUser>) {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  }

  return (
    <AdminUsersContext.Provider
      value={{ users, getUser, addUser, deleteUser, updateUser }}
    >
      {children}
    </AdminUsersContext.Provider>
  );
}

export function useAdminUsers() {
  const ctx = useContext(AdminUsersContext);
  if (!ctx) {
    throw new Error("useAdminUsers must be used within AdminUsersProvider");
  }
  return ctx;
}