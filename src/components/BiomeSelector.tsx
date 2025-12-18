import { useGame } from "@/context/GameContext";
import { BIOMES } from "@/data/biomes";
import { Lock, Map as MapIcon, Utensils, Trees, Hammer, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import React from "react";

const ICONS: Record<string, React.ElementType> = {
    Map: MapIcon,
    Utensils: Utensils,
    Trees: Trees,
    Hammer: Hammer,
    ShoppingBag: ShoppingBag
};

export default function BiomeSelector() {
    const { unlockedBiomes, activeBiome, bits, unlockBiome, setActiveBiome } = useGame();

    return (
        <div className="w-full mx-auto px-0 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BIOMES.map((biome) => {
                    const isUnlocked = unlockedBiomes.includes(biome.id);
                    const isActive = activeBiome === biome.id;
                    const canAfford = bits >= biome.cost;
                    const Icon = ICONS[biome.icon] || MapIcon;

                    return (
                        <div // Removed motion.div for simple layout fix first, can add back if needed but complexity risk
                            key={biome.id}
                            className={`
                        relative w-full p-4 rounded-xl border flex flex-col gap-4 group transition-all duration-200
                        ${isActive ? `bg-indigo-900/20 border-indigo-500 shadow-lg shadow-indigo-900/20` : ''}
                        ${!isActive && isUnlocked ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/30 cursor-pointer' : ''}
                        ${!isUnlocked ? 'bg-slate-950 border-slate-800' : ''}
                    `}
                            onClick={() => {
                                if (isUnlocked && !isActive) setActiveBiome(biome.id);
                            }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                                    ${isActive ? 'bg-indigo-600 text-white' : ''}
                                    ${!isActive && isUnlocked ? 'bg-slate-950 text-slate-500 group-hover:text-indigo-400' : ''}
                                    ${!isUnlocked ? 'bg-slate-900/50 text-slate-700' : ''}
                                `}>
                                    {isActive ? <Icon className="w-6 h-6 animate-pulse" /> : <Icon className="w-6 h-6" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-bold text-sm truncate pr-2 ${isActive ? 'text-indigo-200' : 'text-slate-200'} ${!isUnlocked ? 'text-slate-600' : ''}`}>
                                            {biome.name}
                                        </h3>
                                        {isActive && <span className="text-[10px] font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>}
                                        {!isUnlocked && <Lock className="w-4 h-4 text-slate-700 shrink-0" />}
                                    </div>
                                    <p className={`text-xs mt-1 leading-snug ${isActive ? 'text-indigo-300/70' : 'text-slate-500'} ${!isUnlocked ? 'text-slate-700' : ''}`}>
                                        {biome.description}
                                    </p>
                                </div>
                            </div>

                            {/* Actions (Unlock Button) */}
                            {!isUnlocked && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        unlockBiome(biome.id, biome.cost);
                                    }}
                                    disabled={!canAfford}
                                    className={`
                                w-full h-9 rounded font-mono text-[10px] font-bold transition-all flex items-center justify-center gap-2
                                ${canAfford
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:translate-y-0.5'
                                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        }
                            `}
                                >
                                    <span>UNLOCK {biome.cost}</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
