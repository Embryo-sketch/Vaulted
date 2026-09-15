"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";

type Profile = { id: string; full_name: string; email: string; status: string; portfolio_value: number; available_cash: number; created_at: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { async function loadUsers() { const { data, error } = await createClient().from("profiles").select("id, full_name, email, status, portfolio_value, available_cash, created_at").order("created_at", { ascending: false }); if (error) setError(error.message); else setUsers(data ?? []); } void loadUsers(); }, []);
  const visible = users.filter((user) => `${user.full_name} ${user.email}`.toLowerCase().includes(query.toLowerCase()));
  return <div><div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"><div><h1 className="font-serif text-[22px] md:text-[26px] font-medium">Users</h1><p className="text-paper-dim text-[13.5px] mt-1">{users.length} total accounts</p></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email..." className="bg-slate border border-line text-paper px-4 py-2.5 text-[14px] md:w-[240px]" /></div>{error ? <p className="text-rust">{error}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[720px]"><thead><tr>{["User", "Status", "Portfolio", "Available cash", "Joined", ""].map((heading) => <th key={heading} className="text-left font-mono text-[12px] text-paper-dim font-normal pb-3 border-b border-line">{heading}</th>)}</tr></thead><tbody>{visible.map((user) => <tr key={user.id}><td className="py-4 border-b border-line"><div>{user.full_name || "Unnamed user"}</div><div className="text-[12px] text-paper-dim">{user.email}</div></td><td className="py-4 border-b border-line">{user.status}</td><td className="py-4 border-b border-line font-mono">{formatCurrency(user.portfolio_value)}</td><td className="py-4 border-b border-line font-mono">{formatCurrency(user.available_cash)}</td><td className="py-4 border-b border-line text-paper-dim">{new Date(user.created_at).toLocaleDateString()}</td><td className="py-4 border-b border-line text-right"><Link href={`/admin/users/${user.id}`} className="bg-gold text-ink text-[12px] px-3 py-1.5">Manage</Link></td></tr>)}</tbody></table></div>}</div>;
}
