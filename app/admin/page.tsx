"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminUsers } from "@/components/AdminUsersProvider";
import { formatCurrency } from "@/lib/format";

const statusColor: Record<string, string> = {
  Verified: "text-moss border-moss",
  Pending: "text-gold border-gold",
  Suspended: "text-rust border-rust",
};

export default function AdminUsersPage() {
  const { users, addUser, deleteUser, updateUser } = useAdminUsers();
  const [query, setQuery] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const visible = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  function handleAddUser() {
    if (!newName.trim() || !newEmail.trim()) return;
    addUser(newName.trim(), newEmail.trim());
    setNewName("");
    setNewEmail("");
    setShowAddForm(false);
  }

  function handleDeleteClick(id: string) {
    if (confirmingDelete === id) {
      deleteUser(id);
      setConfirmingDelete(null);
    } else {
      setConfirmingDelete(id);
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[22px] md:text-[26px] font-medium">
            Users
          </h1>
          <p className="text-paper-dim text-[13.5px] mt-1">
            {users.length} total accounts
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-slate border border-line text-paper placeholder:text-paper-dim px-4 py-2.5 text-[14px] w-full md:w-[240px] focus:outline-none focus:border-gold"
          />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gold text-ink text-[13.5px] font-medium px-4 py-2.5 shrink-0"
          >
            {showAddForm ? "Cancel" : "Add user"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-slate border border-line px-6 py-5 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-[12.5px] text-paper-dim mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full bg-slate-2 border border-line text-paper placeholder:text-paper-dim px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12.5px] text-paper-dim mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full bg-slate-2 border border-line text-paper placeholder:text-paper-dim px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-gold"
            />
          </div>
          <button
            onClick={handleAddUser}
            disabled={!newName.trim() || !newEmail.trim()}
            className="bg-gold text-ink text-[13.5px] font-medium px-5 py-2.5 disabled:opacity-40 shrink-0"
          >
            Create user
          </button>
        </div>
      )}

      <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <table className="w-full border-collapse min-w-[720px]">
          <thead>
            <tr>
              <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                User
              </th>
              <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                Status
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                Portfolio value
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                Available cash
              </th>
              <th className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">
                Joined
              </th>
              <th className="text-right font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line" />
            </tr>
          </thead>
          <tbody>
            {visible.map((u) => (
              <tr key={u.id} className="hover:bg-slate/40 transition-colors">
                <td className="py-4 border-b border-line text-[14.5px]">
                  <div>{u.name}</div>
                  <div className="text-[12px] text-paper-dim font-mono mt-0.5">
                    {u.email}
                  </div>
                </td>
                <td className="py-4 border-b border-line">
                  <span
                    className={`text-[11.5px] font-mono px-2 py-1 border ${statusColor[u.status]}`}
                  >
                    {u.status.toUpperCase()}
                  </span>
                </td>
                <td className="text-right py-4 border-b border-line font-mono text-[14px]">
                  {formatCurrency(u.portfolioValue)}
                </td>
                <td className="text-right py-4 border-b border-line font-mono text-[14px]">
                  {formatCurrency(u.availableCash)}
                </td>
                <td className="py-4 border-b border-line font-mono text-[12.5px] text-paper-dim">
                  {u.joined}
                </td>
                <td className="text-right py-4 border-b border-line">
                  <div className="flex items-center justify-end gap-2">
                    {u.status !== "Verified" && (
                      <button
                        onClick={() => updateUser(u.id, { status: "Verified" })}
                        className="text-[12px] text-moss border border-moss px-2.5 py-1.5"
                      >
                        Verify
                      </button>
                    )}
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="text-[12.5px] text-ink bg-gold px-3 py-1.5 font-medium"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(u.id)}
                      onBlur={() => setConfirmingDelete(null)}
                      className={`text-[12px] px-2.5 py-1.5 ${
                        confirmingDelete === u.id
                          ? "bg-rust text-paper border border-rust"
                          : "border border-line text-paper-dim"
                      }`}
                    >
                      {confirmingDelete === u.id ? "Confirm" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="border border-line border-dashed px-6 py-10 text-center mt-4">
            <div className="text-[14.5px] text-paper-dim">
              No users match &quot;{query}&quot;.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}