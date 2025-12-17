import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";

export const metadata: Metadata = {
  title: "Sprite Scavenger",
  description: "Idle Collection RPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-200 antialiased">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
