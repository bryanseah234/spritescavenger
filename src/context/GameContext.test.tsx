import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameProvider, useGame } from "./GameContext";

const key = "sprite_scavenger_save";
const wrapper = ({ children }: { children: React.ReactNode }) => <GameProvider>{children}</GameProvider>;
const saved = () => ({ inventory: ["first", "first", "second"], wallet: 9, bits: 42, xp: 100, upgrades: { speed: 1, multithread: 1, luck: 1 }, unlockedBiomes: ["Depths"], activeBiome: "Depths", expeditionStartTime: null, playerName: "Synthetic", playerTitle: "Test", futureMetadata: { retained: true } });

beforeEach(() => {
  vi.useFakeTimers();
  const values = new Map<string, string>();
  Object.defineProperty(window, "localStorage", { configurable: true, value: {
    getItem: (name: string) => values.get(name) ?? null,
    setItem: (name: string, value: string) => { values.set(name, value); },
    removeItem: (name: string) => { values.delete(name); },
    clear: () => values.clear(),
  } });
  localStorage.setItem(key, JSON.stringify(saved()));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe("game save preservation", () => {
  it("retains the stored file and exportable changes when storage is full", () => {
    const original = localStorage.getItem(key);
    const { result } = renderHook(() => useGame(), { wrapper });
    vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new DOMException("full", "QuotaExceededError"); });
    expect(() => act(() => { result.current.addBits(5); })).not.toThrow();
    expect(localStorage.getItem(key)).toBe(original);
    expect(result.current.bits).toBe(47);
    expect(result.current.saveError).toBeTruthy();
    expect(result.current.exportSave()).toBeTruthy();
  });

  it("reports an unavailable store while keeping gameplay usable", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => { throw new DOMException("blocked", "SecurityError"); });
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.addBits(5); });
    expect(result.current.bits).toBe(5);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.saveError).toBeTruthy();
  });

  it("does not replace current state when an import cannot be persisted", () => {
    const original = localStorage.getItem(key);
    const { result } = renderHook(() => useGame(), { wrapper });
    vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new DOMException("full", "QuotaExceededError"); });
    let accepted = true;
    act(() => { accepted = result.current.importSave(btoa(JSON.stringify({ ...saved(), bits: 999 }))); });
    expect(accepted).toBe(false);
    expect(result.current.bits).toBe(42);
    expect(localStorage.getItem(key)).toBe(original);
  });

  it("resets only this game and leaves unrelated browser data intact", () => {
    localStorage.setItem("unrelated:app", "preserve");
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { expect(result.current.resetSave()).toBe(true); });
    expect(result.current.inventory).toEqual([]);
    expect(result.current.bits).toBe(0);
    expect(localStorage.getItem("unrelated:app")).toBe("preserve");
  });

  it("imports older Latin-1 exports without changing accented names", () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { expect(result.current.importSave(btoa(JSON.stringify({ ...saved(), playerName: "René" })))).toBe(true); });
    expect(result.current.playerName).toBe("René");
  });

  it("retains generated loot when the provider remounts", () => {
    const first = renderHook(() => useGame(), { wrapper });
    act(() => { first.result.current.setPendingLoot(["first", "second"]); });
    first.unmount();
    const second = renderHook(() => useGame(), { wrapper });
    expect(second.result.current.pendingLoot).toEqual(["first", "second"]);
  });

  it("performs no repeated writes while the game is idle", () => {
    const writes = vi.spyOn(localStorage, "setItem");
    renderHook(() => useGame(), { wrapper });
    act(() => { vi.advanceTimersByTime(60000); });
    expect(writes).not.toHaveBeenCalled();
  });
  it("keeps an unreadable stored blob intact after the old autosave interval", () => {
    localStorage.setItem(key, "{synthetic-invalid");
    renderHook(() => useGame(), { wrapper });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(localStorage.getItem(key)).toBe("{synthetic-invalid");
  });

  it("retains inventory duplicates and unknown saved fields after an update", () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.addBits(1); vi.advanceTimersByTime(3000); });
    act(() => { vi.advanceTimersByTime(3000); });
    const value = JSON.parse(localStorage.getItem(key)!);
    expect(value.inventory).toEqual(saved().inventory);
    expect(value.futureMetadata).toEqual({ retained: true });
    expect(value.bits).toBe(43);
  });

  it("persists a completed user change without waiting for a polling interval", () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.addBits(1); });
    expect(JSON.parse(localStorage.getItem(key)!).bits).toBe(43);
  });

  it("exports and imports Unicode profile text without throwing", () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => { result.current.setPlayerProfile("虾🦐", "探索者"); });
    const exported = result.current.exportSave();
    expect(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(exported), c => c.charCodeAt(0)))).playerName).toBe("虾🦐");
    let accepted = false;
    act(() => { accepted = result.current.importSave(exported); });
    expect(accepted).toBe(true);
    expect(result.current.playerTitle).toBe("探索者");
  });

  it("rejects structurally invalid imports without replacing existing progress", () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    let accepted = true;
    act(() => { accepted = result.current.importSave(btoa(JSON.stringify({ inventory: "invalid", upgrades: {} }))); });
    expect(accepted).toBe(false);
    expect(result.current.inventory).toEqual(saved().inventory);
    expect(result.current.bits).toBe(42);
  });

  it("does not overwrite a changed save from another tab", () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    const newer = JSON.stringify({ ...saved(), bits: 100 });
    localStorage.setItem(key, newer);
    act(() => { result.current.addBits(1); });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(localStorage.getItem(key)).toBe(newer);
  });
});
