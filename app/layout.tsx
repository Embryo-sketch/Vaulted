import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexMono.variable} ${inter.variable}`}>
      <body className="bg-ink text-paper font-sans">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}