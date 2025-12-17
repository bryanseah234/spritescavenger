"use client";

import { useState, useEffect } from "react";

import { useExpedition } from "@/hooks/useExpedition";
import Header from "@/components/Header";
import ExpeditionConsole from "@/components/ExpeditionConsole";
import LootReveal from "@/components/LootReveal";
import CollectionGrid from "@/components/CollectionGrid";
import Shop from "@/components/Shop";
import { useGame } from "@/context/GameContext";

export default function Home() {
  const { isActive, timeLeft, totalDuration, start, claim, loot } = useExpedition();
  const { isLoading } = useGame();

  const [shopOpen, setShopOpen] = useState(false);

  // Fix hydration mismatch by using mounted check
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-emerald-500 font-mono animate-pulse">INITIALIZING SYSTEM...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-20 pb-10">
      <Header />

      <div className="flex flex-col gap-8">
        <ExpeditionConsole
          isActive={isActive}
          timeLeft={timeLeft}
          totalDuration={totalDuration}
          onStart={start}
          onOpenShop={() => setShopOpen(true)}
        />

        <CollectionGrid />
      </div>

      <LootReveal loot={loot} onClaim={claim} />
      <Shop isOpen={shopOpen} onClose={() => setShopOpen(false)} />
    </main>
  );
}
