export const SAVE_KEY = "sprite_scavenger_save";

export interface GameSave {
  [field: string]: unknown;
  inventory: string[];
  wallet: number;
  bits: number;
  xp: number;
  upgrades: { speed: number; multithread: number; luck: number };
  unlockedBiomes: string[];
  activeBiome: string;
  expeditionStartTime: number | null;
  playerName: string;
  playerTitle: string;
  pendingLoot: string[] | null;
}

export function defaultSave(): GameSave {
  return { inventory: [], wallet: 0, bits: 0, xp: 0, upgrades: { speed: 1, multithread: 1, luck: 1 }, unlockedBiomes: ["Depths"], activeBiome: "Depths", expeditionStartTime: null, playerName: "Scavenger", playerTitle: "Novice", pendingLoot: null };
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === "string");
const number = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;

export function parseSave(json: string): GameSave {
  const raw: unknown = JSON.parse(json);
  if (!record(raw) || !strings(raw.inventory) || !record(raw.upgrades)) throw new Error("Unsupported game save");
  const defaults = defaultSave();
  for (const field of ["wallet", "bits", "xp", "expeditionStartTime"] as const) {
    const value = raw[field];
    if (value !== undefined && !(field === "expeditionStartTime" && value === null) && !number(value)) throw new Error("Invalid saved number");
  }
  for (const field of ["speed", "multithread", "luck"] as const) {
    const value = raw.upgrades[field];
    if (value !== undefined && (!number(value) || !Number.isSafeInteger(value) || value < 1)) throw new Error("Invalid saved upgrade");
  }
  for (const field of ["playerName", "playerTitle", "activeBiome"] as const) {
    if (raw[field] !== undefined && typeof raw[field] !== "string") throw new Error("Invalid saved text");
  }
  if (raw.unlockedBiomes !== undefined && (!strings(raw.unlockedBiomes) || raw.unlockedBiomes.length === 0)) throw new Error("Invalid saved biomes");
  if (raw.pendingLoot !== undefined && raw.pendingLoot !== null && !strings(raw.pendingLoot)) throw new Error("Invalid saved loot");
  return { ...defaults, ...raw, upgrades: { ...defaults.upgrades, ...raw.upgrades } } as GameSave;
}

export function serializeSave(save: GameSave): string {
  return JSON.stringify({ ...save, level: Math.floor(Math.sqrt(save.xp / 100)) + 1 });
}

export function exportSaveString(save: GameSave): string {
  const bytes = new TextEncoder().encode(serializeSave(save));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function importSaveString(encoded: string): GameSave {
  const binary = atob(encoded.trim());
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  let json: string;
  try { json = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { json = binary; } // Preserve earlier exports containing Latin-1 text.
  return parseSave(json);
}

export function downloadSaveFile(content: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
