"use client";

import { useState, useEffect } from "react";

import { useExpedition } from "@/hooks/useExpedition";
import Header from "@/components/Header";
import ExpeditionConsole from "@/components/ExpeditionConsole";
import LootReveal from "@/components/LootReveal";
import CollectionGrid from "@/components/CollectionGrid";
import Shop from "@/components/Shop";
import BiomeSelector from "@/components/BiomeSelector";
import Forge from "@/components/Forge";
import SettingsModal from "@/components/SettingsModal";
import { useGame } from "@/context/GameContext";

export default function Home() {
  const { isActive, timeLeft, totalDuration, start, claim, loot } = useExpedition();
  const { isLoading } = useGame();

  const [shopOpen, setShopOpen] = useState(false);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fix hydration mismatch
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
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <div className="flex flex-col gap-6">
        <BiomeSelector />

        <ExpeditionConsole
          isActive={isActive}
          timeLeft={timeLeft}
          totalDuration={totalDuration}
          onStart={start}
          onOpenShop={() => setShopOpen(true)}
        />

        {/* Helper to open Forge (Temporary until Console has button or separate Tab) */}
        <div className="text-center">
          <button
            onClick={() => setForgeOpen(true)}
            className="text-xs text-orange-500 hover:text-orange-400 underline font-mono"
          >
            OPEN FORGE
          </button>
        </div>

        <CollectionGrid />
      </div>

      <LootReveal loot={loot} onClaim={claim} />
      <Shop isOpen={shopOpen} onClose={() => setShopOpen(false)} />
      <Forge isOpen={forgeOpen} onClose={() => setForgeOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
