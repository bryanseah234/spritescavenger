"use client";

import Image from "next/image";
import { useState } from "react";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import { Flame, ArrowRight } from "lucide-react";
import { getRarity, RARITY_TIERS, RarityTier } from "@/utils/rarity";
import LootReveal from "./LootReveal";

// ... existing imports

export default function Forge() {
    const { inventory, burnItems, addToInventory } = useGame();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [forgeResult, setForgeResult] = useState<string[] | null>(null);

    // Helper to find category for an item slug
    const findCategory = (slug: string) => {
        const entry = Object.entries(masterCollection).find(([_, items]) => (items as string[]).includes(slug));
        return entry ? entry[0] : 'Misc';
    };

    const handleAutoFill = (rarityName: string) => {
        // Smart Autofill: Prioritize duplicates, preserve single copies if possible.

        // 1. Get all items of rarity
        const candidates = inventory.filter(slug => getRarity(slug).name === rarityName);

        // 2. Count frequencies
        const counts: Record<string, number> = {};
        candidates.forEach(slug => counts[slug] = (counts[slug] || 0) + 1);

        // 3. Sort candidates: Items with >1 copies come first
        // We want to burn duplicate instances.
        // Actually, 'candidates' is a flat list of instances.
        // We just need to pick 10 instances.
        // Ideally, we pick distinct items that have duplicates?
        // No, we pick accurate instances from the inventory array.

        // Let's sort the candidate list such that slugs with high counts are at the start.
        candidates.sort((a, b) => {
            const countA = counts[a];
            const countB = counts[b];
            if (countA === countB) return 0;
            return countB - countA; // Higher count first
        });

        setSelectedItems(candidates.slice(0, 10));
    };

    const handleForge = () => {
        if (selectedItems.length !== 10) return;

        // Determine input rarity (assume all same for now, or take average/majority)
        const inputRarityName = getRarity(selectedItems[0]).name;

        let outputRarity: RarityTier = 'Common';
        const tierKeys = Object.keys(RARITY_TIERS) as RarityTier[];
        const currentIndex = tierKeys.indexOf(inputRarityName);

        if (currentIndex < tierKeys.length - 1) {
            outputRarity = tierKeys[currentIndex + 1];
        } else {
            // Max rarity? maybe give multiple of same or just return 'Legendary'
            outputRarity = 'Legendary';
        }

        // Find an item of that output rarity
        // For simplicity, pick a random item from Master Collection that matches the rarity
        // In a real game, this might use a specific loot table.
        const allItems = Object.values(masterCollection).flat() as string[];
        const candidates = allItems.filter(slug => getRarity(slug).name === outputRarity);

        const reward = candidates[Math.floor(Math.random() * candidates.length)] || candidates[0]; // Fallback

        // Burn Items
        burnItems(selectedItems);
        // Add Reward
        addToInventory([reward]);

        // Clear Selection & Show Reveal
        setSelectedItems([]);
        setForgeResult([reward]);
    };

    const handleClaim = () => {
        setForgeResult(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Input Selection */}
            <section className="w-full space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                        <Flame className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Crucible</h2>
                        <p className="text-xs text-slate-500">Select materials for dissolution.</p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Slots</span>
                        <span className={`text-xs font-bold ${selectedItems.length === 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {selectedItems.length} / 10
                        </span>
                    </div>

                    <div className="grid grid-cols-5 gap-3 mb-6">
                        {selectedItems.map((slug, i) => (
                            <div key={i} className="aspect-square bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center relative group overflow-hidden" title={slug}>
                                <Image
                                    src={`/icons/${encodeURIComponent(findCategory(slug))}/${slug}.png`}
                                    alt={slug}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-contain p-2"
                                />
                                <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                        {[...Array(10 - selectedItems.length)].map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square bg-slate-950/50 rounded-lg border border-slate-800 border-dashed flex items-center justify-center">
                                <span className="text-slate-700 text-xs">+</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <button
                            onClick={() => handleAutoFill('Common')}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors"
                        >
                            AUTO-FILL (COMMON)
                        </button>
                        <p className="text-[10px] text-slate-500 text-center mt-2">
                            *Auto-fill prioritizes duplicates.
                        </p>
                    </div>
                </div>
            </section>

            {/* Right: Output/Action */}
            <section className="w-full space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Synthesis</h2>
                        <p className="text-xs text-slate-500">Forge new items from raw matter.</p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="relative mb-8 group cursor-help">
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 bg-orange-500/20 blur-3xl rounded-full transition-opacity duration-500 ${selectedItems.length === 10 ? 'opacity-100' : 'opacity-0'}`} />

                        <div className={`w-32 h-32 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 relative z-10
                            ${selectedItems.length === 10 ? 'bg-slate-900 border-orange-500/50 shadow-xl shadow-orange-900/20' : 'bg-[#222522] border-slate-800 border-dashed'}
                        `}>
                            <span className={`text-4xl transition-colors ${selectedItems.length === 10 ? 'text-orange-400 animate-pulse' : 'text-slate-700'}`}>?</span>
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                        <div className="flex justify-between text-xs px-2">
                            <span className="text-slate-500">Success Rate</span>
                            <span className="text-emerald-400 font-bold">100%</span>
                        </div>
                        <div className="flex justify-between text-xs px-2">
                            <span className="text-slate-500">Cost</span>
                            <span className="text-slate-300 font-bold">50 B</span>
                        </div>

                        <button
                            onClick={handleForge}
                            disabled={selectedItems.length !== 10}
                            className={`
                                w-full py-4 rounded-xl font-bold tracking-wider transition-all
                                ${selectedItems.length === 10
                                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20 active:translate-y-0.5'
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }
                            `}
                        >
                            INITIATE FORGE
                        </button>
                    </div>
                </div>
            </section>

            {
                forgeResult && (
                    <LootReveal loot={forgeResult} onClaim={handleClaim} />
                )
            }
        </div >
    );
}
