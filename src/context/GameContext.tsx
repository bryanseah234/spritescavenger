"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface GameState {
  inventory: string[];
  wallet: number; // Legacy
  bits: number;
  xp: number;
  level: number;
  upgrades: {
    speed: number;
    multithread: number;
    luck: number;
  };
  unlockedBiomes: string[];
  activeBiome: string;
  expeditionStartTime: number | null;
  playerName: string;
  playerTitle: string;
}

interface GameContextType extends GameState {
  addToInventory: (items: string[]) => void;
  addBits: (amount: number) => void;
  addXp: (amount: number) => void;
  buyUpgrade: (type: 'speed' | 'multithread' | 'luck', cost: number) => boolean;
  unlockBiome: (biomeId: string, cost: number) => boolean;
  setActiveBiome: (biomeId: string) => void;
  burnItems: (slugs: string[]) => void; // Core for Forge
  startExpedition: () => void;
  endExpedition: () => void;
  setPlayerProfile: (name: string, title: string) => void;
  exportSave: () => string;

  importSave: (base64: string) => boolean;
  isLoading: boolean;
  pendingLoot: string[] | null;
  setPendingLoot: React.Dispatch<React.SetStateAction<string[] | null>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const SAVE_KEY = "sprite_scavenger_save";
const DEFAULT_UPGRADES = { speed: 1, multithread: 1, luck: 1 };
const DEFAULT_BIOMES = ['Depths'];
const DEFAULT_ACTIVE_BIOME = 'Depths';
const DEFAULT_PLAYER_NAME = "Scavenger";
const DEFAULT_PLAYER_TITLE = "Novice";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<string[]>([]);
  const [wallet, setWallet] = useState<number>(0);
  const [bits, setBits] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [upgrades, setUpgrades] = useState(DEFAULT_UPGRADES);

  const [unlockedBiomes, setUnlockedBiomes] = useState<string[]>(DEFAULT_BIOMES);
  const [activeBiome, setActiveBiome] = useState<string>(DEFAULT_ACTIVE_BIOME);

  const [expeditionStartTime, setExpeditionStartTime] = useState<number | null>(
    null
  );
  const [playerName, setPlayerName] = useState<string>(DEFAULT_PLAYER_NAME);
  const [playerTitle, setPlayerTitle] = useState<string>(DEFAULT_PLAYER_TITLE);
  const [pendingLoot, setPendingLoot] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived Level: Level = floor(sqrt(xp / 100)) + 1
  // XP 0 = Lvl 1. XP 100 = Lvl 2. XP 400 = Lvl 3.
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log("[GameContext] Save loaded successfully.", parsed);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setInventory(parsed.inventory || []);
          setWallet(parsed.wallet || 0);
          setBits(parsed.bits || 0);
          setXp(parsed.xp || 0);
          setUpgrades(parsed.upgrades || DEFAULT_UPGRADES);
          setUnlockedBiomes(parsed.unlockedBiomes || DEFAULT_BIOMES);
          setActiveBiome(parsed.activeBiome || DEFAULT_ACTIVE_BIOME);
          setExpeditionStartTime(parsed.expeditionStartTime || null);
          setPlayerName(parsed.playerName || DEFAULT_PLAYER_NAME);
          setPlayerTitle(parsed.playerTitle || DEFAULT_PLAYER_TITLE);
        } catch (e) {
          console.error("[GameContext] Failed to parse save file. Data might be corrupted.", e);
          console.error("Raw data:", saved);
        }
      } else {
        console.log("[GameContext] No save found. Starting fresh.");
      }
    } catch (err) {
      console.error("[GameContext] Critical error accessing localStorage:", err);
    }
    setIsLoading(false);
  }, []);

  // Save to LocalStorage
  // Ref to hold latest state for the interval (avoids resetting timer)
  const stateRef = React.useRef<Partial<GameState>>({});

  useEffect(() => {
    stateRef.current = {
      inventory,
      wallet,
      bits,
      xp,
      upgrades,
      unlockedBiomes,
      activeBiome,
      expeditionStartTime,
      playerName,
      playerTitle,
    };
  }, [inventory, wallet, bits, xp, upgrades, unlockedBiomes, activeBiome, expeditionStartTime, playerName, playerTitle]);

  // Save to LocalStorage periodically (Debounced/Throttled)
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
    }, 2000); // Save every 2 seconds max

    return () => clearInterval(interval);
  }, [isLoading]);

  const addToInventory = (items: string[]) => {
    setInventory((prev) => [...prev, ...items]);
  };

  const addBits = (amount: number) => {
    setBits((prev) => prev + amount);
  };

  const addXp = (amount: number) => {
    setXp((prev) => prev + amount);
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

  const unlockBiome = (biomeId: string, cost: number) => {
    if (bits >= cost && !unlockedBiomes.includes(biomeId)) {
      setBits(prev => prev - cost);
      setUnlockedBiomes(prev => [...prev, biomeId]);
      return true;
    }
    return false;
  };

  const burnItems = (slugs: string[]) => {
    setInventory(prev => {
      const newInv = [...prev];
      slugs.forEach(slug => {
        const idx = newInv.indexOf(slug);
        if (idx > -1) newInv.splice(idx, 1);
      });
      return newInv;
    });
  };

  const startExpedition = () => {
    setExpeditionStartTime(Date.now());
  };

  const endExpedition = () => {
    setExpeditionStartTime(null);
  };

  const setPlayerProfile = (name: string, title: string) => {
    setPlayerName(name);
    setPlayerTitle(title);
  };

  const exportSave = () => {
    const state: GameState = {
      inventory,
      wallet,
      bits,
      xp,
      level,
      upgrades,
      unlockedBiomes,
      activeBiome,
      expeditionStartTime,
      playerName,
      playerTitle
    };
    return btoa(JSON.stringify(state));
  };

  const importSave = (base64: string) => {
    try {
      const json = atob(base64);
      const parsed = JSON.parse(json);

      if (!parsed.inventory || !parsed.upgrades) return false;

      setInventory(parsed.inventory);
      setWallet(parsed.wallet || 0);
      setBits(parsed.bits || 0);
      setXp(parsed.xp || 0);
      setUpgrades(parsed.upgrades);
      setUnlockedBiomes(parsed.unlockedBiomes || DEFAULT_BIOMES);
      setActiveBiome(parsed.activeBiome || DEFAULT_ACTIVE_BIOME);
      setExpeditionStartTime(parsed.expeditionStartTime || null);
      setPlayerName(parsed.playerName || DEFAULT_PLAYER_NAME);
      setPlayerTitle(parsed.playerTitle || DEFAULT_PLAYER_TITLE);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };



  return (
    <GameContext.Provider
      value={{
        inventory,
        wallet,
        bits,
        xp,
        level,
        upgrades,
        unlockedBiomes,
        activeBiome,
        expeditionStartTime,
        playerName,
        playerTitle,
        addToInventory,
        addBits,
        addXp,
        buyUpgrade,
        unlockBiome,
        setActiveBiome,
        burnItems,
        startExpedition,
        endExpedition,
        setPlayerProfile,
        exportSave,
        importSave,
        isLoading,
        pendingLoot,
        setPendingLoot,
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
