export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface RarityDef {
    name: RarityTier;
    color: string; // Tailwind class equivalent for text/border usually
    hex: string;
    chance: number; // 0-1
    value: number; // Bits value for dupe
}

export const RARITY_TIERS: Record<RarityTier, RarityDef> = {
    Common: { name: 'Common', color: 'slate-500', hex: '#64748b', chance: 0.60, value: 1 },
    Uncommon: { name: 'Uncommon', color: 'emerald-500', hex: '#10b981', chance: 0.25, value: 5 },
    Rare: { name: 'Rare', color: 'cyan-500', hex: '#06b6d4', chance: 0.10, value: 25 },
    Epic: { name: 'Epic', color: 'purple-500', hex: '#a855f7', chance: 0.04, value: 100 },
    Legendary: { name: 'Legendary', color: 'amber-400', hex: '#fbbf24', chance: 0.01, value: 500 },
};

// Deterministic hash function
function stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function getRarity(slug: string): RarityDef {
    const hash = stringToHash(slug);
    const mod = hash % 100; // 0-99

    // To make it deterministic but weighted based on our tiers:
    // This is "Static Rarity" - a specific item is ALWAYS this rarity.
    // We map the mod 0-99 to tiers.
    // Common: 0-59 (60%)
    // Uncommon: 60-84 (25%)
    // Rare: 85-94 (10%)
    // Epic: 95-98 (4%)
    // Legendary: 99 (1%)

    if (mod >= 99) return RARITY_TIERS.Legendary;
    if (mod >= 95) return RARITY_TIERS.Epic;
    if (mod >= 85) return RARITY_TIERS.Rare;
    if (mod >= 60) return RARITY_TIERS.Uncommon;
    return RARITY_TIERS.Common;
}
