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
        <div className="w-full max-w-4xl mx-auto px-4 mb-8">
            <h2 className="text-slate-400 text-sm font-bold uppercase mb-4">Range Calibration</h2>
            <div className="flex flex-wrap gap-4">
                {BIOMES.map((biome) => {
                    const isUnlocked = unlockedBiomes.includes(biome.id);
                    const isActive = activeBiome === biome.id;
                    const canAfford = bits >= biome.cost;
                    const Icon = ICONS[biome.icon] || MapIcon;

                    return (
                        <div // Removed motion.div for simple layout fix first, can add back if needed but complexity risk
                            key={biome.id}
                            className={`
                        relative w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.7rem)] h-64 rounded-xl border-2 p-4 flex flex-col justify-between
                        transition-all duration-200
                        ${isActive ? `bg-indigo-900/20 border-indigo-500 scale-[1.02]` : ''}
                        ${!isActive && isUnlocked ? 'bg-slate-900 border-slate-800 hover:border-slate-600 cursor-pointer' : ''}
                        ${!isUnlocked ? 'bg-slate-950 border-slate-900 opacity-60' : ''}
                    `}
                            onClick={() => {
                                if (isUnlocked && !isActive) setActiveBiome(biome.id);
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {isActive && <div className="bg-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold text-white">ACTIVE</div>}
                                {!isUnlocked && <Lock className="w-5 h-5 text-slate-700" />}
                            </div>

                            <div>
                                <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
                                    {biome.name}
                                </h3>
                                <p className={`text-xs leading-tight ${isActive ? 'text-indigo-200/60' : 'text-slate-600'}`}>
                                    {biome.description}
                                </p>
                            </div>

                            {!isUnlocked && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        unlockBiome(biome.id, biome.cost);
                                    }}
                                    disabled={!canAfford}
                                    className={`
                                w-full mt-2 py-2 rounded font-bold text-xs flex items-center justify-center gap-1
                                ${canAfford
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        }
                            `}
                                >
                                    UNLOCK {biome.cost}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
