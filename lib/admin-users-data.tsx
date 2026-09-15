export type AdminUser = {
  id: string;
  name: string;
  email: string;
  status: "Verified" | "Pending" | "Suspended";
  joined: string;
  portfolioValue: number;
  availableCash: number;
};

// Mock user records for the admin panel. Once the backend is wired up,
// this array is replaced by a real fetch from the users table — the
// AdminUser type and every page below can stay the same.
export const ADMIN_USERS: AdminUser[] = [
  { id: "u1", name: "Jane Doe", email: "jane@example.com", status: "Verified", joined: "Aug 12, 2026", portfolioValue: 88984.74, availableCash: 12204.0 },
  { id: "u2", name: "Marcus Reid", email: "marcus.reid@example.com", status: "Verified", joined: "Aug 20, 2026", portfolioValue: 24310.5, availableCash: 3400.0 },
  { id: "u3", name: "Priya Nair", email: "priya.nair@example.com", status: "Pending", joined: "Sep 1, 2026", portfolioValue: 0, availableCash: 0 },
  { id: "u4", name: "Tomás Alvarez", email: "tomas.alvarez@example.com", status: "Verified", joined: "Sep 3, 2026", portfolioValue: 152800.2, availableCash: 8100.0 },
  { id: "u5", name: "Wei Chen", email: "wei.chen@example.com", status: "Suspended", joined: "Jul 28, 2026", portfolioValue: 5600.0, availableCash: 0 },
  { id: "u6", name: "Amara Obi", email: "amara.obi@example.com", status: "Verified", joined: "Sep 8, 2026", portfolioValue: 41250.0, availableCash: 5000.0 },
  { id: "u7", name: "Liam Fitzgerald", email: "liam.fitz@example.com", status: "Pending", joined: "Sep 10, 2026", portfolioValue: 0, availableCash: 0 },
];

export function getAdminUser(id: string): AdminUser | undefined {
  return ADMIN_USERS.find((u) => u.id === id);
}