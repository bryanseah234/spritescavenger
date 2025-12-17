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
        <div className="w-full max-w-4xl mx-auto px-4 mb-4">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {BIOMES.map((biome) => {
                    const isUnlocked = unlockedBiomes.includes(biome.id);
                    const isActive = activeBiome === biome.id;
                    const canAfford = bits >= biome.cost;
                    const Icon = ICONS[biome.icon] || MapIcon;

                    return (
                        <motion.div
                            key={biome.id}
                            layoutId={biome.id}
                            className={`
                        relative shrink-0 w-48 h-64 rounded-xl border-2 p-4 flex flex-col justify-between
                        transition-all duration-300 snap-center
                        ${isActive ? `bg-${biome.color} border-${biome.color} ring-4 ring-${biome.color}/30 scale-105` : ''}
                        ${!isActive && isUnlocked ? 'bg-slate-800 border-slate-700 hover:border-slate-500 cursor-pointer' : ''}
                        ${!isUnlocked ? 'bg-slate-900 border-slate-800 opacity-70 grayscale' : ''}
                    `}
                            onClick={() => {
                                if (isUnlocked && !isActive) setActiveBiome(biome.id);
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-black/20 text-white' : 'bg-slate-900 text-slate-400'}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {isActive && <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold text-white">ACTIVE</div>}
                                {!isUnlocked && <Lock className="w-5 h-5 text-slate-600" />}
                            </div>

                            <div>
                                <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                    {biome.name}
                                </h3>
                                <p className={`text-xs leading-tight ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
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
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }
                            `}
                                >
                                    UNLOCK {biome.cost}
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
