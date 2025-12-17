"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface GameState {
  inventory: string[];
  wallet: number; // Prestige points (Phase 1 legacy/future)
  bits: number; // New Phase 2 Currency
  upgrades: {
    speed: number;
    multithread: number;
    luck: number;
  };
  expeditionStartTime: number | null;
}

interface GameContextType extends GameState {
  addToInventory: (items: string[]) => void;
  // addPrestige: (amount: number) => void; // Deprecated or kept for future
  addBits: (amount: number) => void;
  buyUpgrade: (type: 'speed' | 'multithread' | 'luck', cost: number) => boolean;
  startExpedition: () => void;
  endExpedition: () => void;
  isLoading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SAVE_KEY = "sprite_scavenger_save";

const DEFAULT_UPGRADES = { speed: 1, multithread: 1, luck: 1 };

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<string[]>([]);
  const [wallet, setWallet] = useState<number>(0);
  const [bits, setBits] = useState<number>(0);
  const [upgrades, setUpgrades] = useState(DEFAULT_UPGRADES);

  const [expeditionStartTime, setExpeditionStartTime] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInventory(parsed.inventory || []);
        setWallet(parsed.wallet || 0);
        setBits(parsed.bits || 0);
        setUpgrades(parsed.upgrades || DEFAULT_UPGRADES);
        setExpeditionStartTime(parsed.expeditionStartTime || null);
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoading) return;
    const state: GameState = {
      inventory,
      wallet,
      bits,
      upgrades,
      expeditionStartTime,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }, [inventory, wallet, bits, upgrades, expeditionStartTime, isLoading]);

  const addToInventory = (items: string[]) => {
    setInventory((prev) => [...prev, ...items]);
  };

  const addBits = (amount: number) => {
    setBits((prev) => prev + amount);
  };

  const buyUpgrade = (type: 'speed' | 'multithread' | 'luck', cost: number) => {
    if (bits >= cost) {
      setBits(prev => prev - cost);
      setUpgrades(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
      return true;
    }
    return false;
  };

  const startExpedition = () => {
    setExpeditionStartTime(Date.now());
  };

  const endExpedition = () => {
    setExpeditionStartTime(null);
  };

  return (
    <GameContext.Provider
      value={{
        inventory,
        wallet,
        bits,
        upgrades,
        expeditionStartTime,
        addToInventory,
        addBits,
        buyUpgrade,
        startExpedition,
        endExpedition,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
