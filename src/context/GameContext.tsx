"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { defaultSave, exportSaveString, GameSave, importSaveString, parseSave, SAVE_KEY, serializeSave } from "@/utils/gameSave";

interface GameContextType extends GameSave {
  level: number;
  addToInventory: (items: string[]) => void;
  addBits: (amount: number) => void;
  addXp: (amount: number) => void;
  buyUpgrade: (type: "speed" | "multithread" | "luck", cost: number) => boolean;
  unlockBiome: (biomeId: string, cost: number) => boolean;
  setActiveBiome: (biomeId: string) => void;
  burnItems: (slugs: string[]) => void;
  startExpedition: () => void;
  endExpedition: () => void;
  setPlayerProfile: (name: string, title: string) => void;
  exportSave: () => string;
  importSave: (base64: string) => boolean;
  resetSave: () => boolean;
  saveError: string | null;
  recoverySave: string | null;
  isLoading: boolean;
  setPendingLoot: React.Dispatch<React.SetStateAction<string[] | null>>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameSave>(defaultSave);
  const current = useRef<GameSave>(defaultSave());
  const loaded = useRef(false);
  const lastStored = useRef<string | null>(null);
  const paused = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recoverySave, setRecoverySave] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      lastStored.current = raw;
      if (raw !== null) {
        try {
          const saved = parseSave(raw);
          current.current = saved;
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState(saved);
        } catch {
          paused.current = true;
          setRecoverySave(raw);
          setSaveError("Your stored save could not be read and has been preserved. Download it in Settings before restoring a backup or resetting. New progress stays in this tab.");
        }
      }
    } catch {
      paused.current = true;
      setSaveError("Saving is unavailable in this browser. Export your progress before closing this tab.");
    }
    loaded.current = true;
    setIsLoading(false);

    const changedElsewhere = (event: StorageEvent) => {
      if ((event.key === SAVE_KEY || event.key === null) && event.newValue !== lastStored.current) {
        paused.current = true;
        setRecoverySave(event.newValue);
        setSaveError("Another tab changed your saved progress. Export this tab's progress if needed, then reload to use the newer save.");
      }
    };
    window.addEventListener("storage", changedElsewhere);
    return () => window.removeEventListener("storage", changedElsewhere);
  }, []);

  const persist = useCallback((next: GameSave, replace = false): boolean => {
    if (!loaded.current || (paused.current && !replace)) return false;
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (!replace && stored !== lastStored.current) {
        paused.current = true;
        setRecoverySave(stored);
        setSaveError("Another tab changed your saved progress. Export this tab's progress if needed, then reload to use the newer save.");
        return false;
      }
      const encoded = serializeSave(next);
      if (encoded !== stored) localStorage.setItem(SAVE_KEY, encoded);
      lastStored.current = encoded;
      paused.current = false;
      setSaveError(null);
      setRecoverySave(null);
      return true;
    } catch {
      setSaveError("Your latest changes could not be saved. Export your progress before closing this tab.");
      return false;
    }
  }, []);

  const update = useCallback((change: (previous: GameSave) => GameSave) => {
    const next = change(current.current);
    if (next === current.current) return;
    current.current = next;
    setState(next);
    persist(next);
  }, [persist]);

  const setPendingLoot = useCallback<React.Dispatch<React.SetStateAction<string[] | null>>>((value) => {
    update(previous => {
      const pendingLoot = typeof value === "function" ? value(previous.pendingLoot) : value;
      return pendingLoot === previous.pendingLoot ? previous : { ...previous, pendingLoot };
    });
  }, [update]);

  const importSave = (encoded: string) => {
    try {
      const imported = importSaveString(encoded);
      if (!persist(imported, true)) return false;
      current.current = imported;
      setState(imported);
      return true;
    } catch {
      return false;
    }
  };

  const resetSave = () => {
    const fresh = defaultSave();
    if (!persist(fresh, true)) return false;
    current.current = fresh;
    setState(fresh);
    return true;
  };

  const buyUpgrade = (type: "speed" | "multithread" | "luck", cost: number) => {
    if (current.current.bits < cost) return false;
    update(previous => ({ ...previous, bits: previous.bits - cost, upgrades: { ...previous.upgrades, [type]: previous.upgrades[type] + 1 } }));
    return true;
  };
  const unlockBiome = (biomeId: string, cost: number) => {
    if (current.current.bits < cost || current.current.unlockedBiomes.includes(biomeId)) return false;
    update(previous => ({ ...previous, bits: previous.bits - cost, unlockedBiomes: [...previous.unlockedBiomes, biomeId] }));
    return true;
  };

  return <GameContext.Provider value={{
    ...state,
    level: Math.floor(Math.sqrt(state.xp / 100)) + 1,
    isLoading, saveError, recoverySave,
    addToInventory: items => update(previous => ({ ...previous, inventory: [...previous.inventory, ...items] })),
    addBits: amount => update(previous => ({ ...previous, bits: previous.bits + amount })),
    addXp: amount => update(previous => ({ ...previous, xp: previous.xp + amount })),
    buyUpgrade, unlockBiome,
    setActiveBiome: activeBiome => update(previous => ({ ...previous, activeBiome })),
    burnItems: slugs => update(previous => {
      const inventory = [...previous.inventory];
      for (const slug of slugs) {
        const index = inventory.indexOf(slug);
        if (index !== -1) inventory.splice(index, 1);
      }
      return { ...previous, inventory };
    }),
    startExpedition: () => update(previous => ({ ...previous, expeditionStartTime: Date.now() })),
    endExpedition: () => update(previous => ({ ...previous, expeditionStartTime: null })),
    setPlayerProfile: (playerName, playerTitle) => update(previous => ({ ...previous, playerName, playerTitle })),
    exportSave: () => exportSaveString(current.current),
    importSave, resetSave, setPendingLoot,
  }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error("useGame must be used within a GameProvider");
  return context;
}
