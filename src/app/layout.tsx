import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Sprite Scavenger",
  description: "Idle Collection RPG",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#222522] text-slate-200 antialiased">
        <ErrorBoundary>
          <GameProvider>
            {children}
          </GameProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
