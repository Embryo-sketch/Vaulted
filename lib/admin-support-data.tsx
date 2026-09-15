export type SupportMessage = {
  id: string;
  from: "user" | "admin";
  text: string;
  time: string;
};

export type SupportConversation = {
  userId: string;
  userName: string;
  userEmail: string;
  messages: SupportMessage[];
};

// Seeded support inbox. Once the backend is wired up, this becomes a
// real conversations table, and replies sent here actually reach the
// user's chat widget instead of only living in this admin session.
export const SUPPORT_CONVERSATIONS: SupportConversation[] = [
  {
    userId: "u1",
    userName: "Jane Doe",
    userEmail: "jane@example.com",
    messages: [
      { id: "m1", from: "user", text: "Hi, I sent BTC about an hour ago and it's not showing in my balance yet — is that normal?", time: "10:14 AM" },
      { id: "m2", from: "user", text: "Just want to make sure it wasn't sent to the wrong address.", time: "10:15 AM" },
    ],
  },
  {
    userId: "u4",
    userName: "Tomás Alvarez",
    userEmail: "tomas.alvarez@example.com",
    messages: [
      { id: "m1", from: "user", text: "What's the difference between the Growth and Advanced tiers again?", time: "Yesterday" },
      { id: "m2", from: "admin", text: "Growth covers $1,000–$4,999 at 6.2% APR, Advanced covers $5,000–$9,999 at 8.1% APR.", time: "Yesterday" },
      { id: "m3", from: "user", text: "Got it, thank you! One more thing — can I move funds between tiers later?", time: "Yesterday" },
    ],
  },
  {
    userId: "u6",
    userName: "Amara Obi",
    userEmail: "amara.obi@example.com",
    messages: [
      { id: "m1", from: "user", text: "My growth adjustment from today shows as pending — how long does that usually take?", time: "9:02 AM" },
    ],
  },
];