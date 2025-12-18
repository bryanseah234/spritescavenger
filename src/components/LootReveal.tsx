"use client";

import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRarity } from "@/utils/rarity";
import { useGame } from "@/context/GameContext";
import Image from "next/image";
import { getCategory } from "@/utils/lookup";

interface LootRevealProps {
    loot: string[] | null;
    onClaim: () => void;
}

export default function LootReveal({ loot, onClaim }: LootRevealProps) {
    const { inventory } = useGame();

    // Need to process loot to determine New vs Dupe state for UI
    // Note: actual logic happens in claim(), but we need to show PREVIEW here.
    // We assume inventory doesn't change until claim is clicked.

    return (
        <AnimatePresence>
            {loot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <div className="relative z-10 max-w-4xl w-full flex flex-col items-center">
                        <motion.h2
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-3xl font-bold text-slate-100 mb-12 tracking-wider flex flex-col items-center"
                        >
                            EXPEDITION COMPLETE
                            <span className="text-sm font-mono text-emerald-500 mt-2">DATA RETRIEVED</span>
                        </motion.h2>

                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            {loot.map((slug, idx) => {
                                const isOwned = inventory.includes(slug);
                                const rarity = getRarity(slug);

                                return (
                                    <motion.div
                                        key={`${slug}-${idx}`}
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: idx * 0.2, type: "spring", bounce: 0.5 }}
                                        className={`
                                    relative group
                                    w-32 h-40 bg-slate-800 rounded-xl border-2 flex flex-col items-center p-3
                                    ${'border-' + rarity.color}
                                    shadow-[0_0_15px_rgba(0,0,0,0.5)]
                                    ${rarity.name === 'Legendary' ? 'animate-pulse shadow-amber-500/20' : ''}
                                `}
                                        style={{ borderColor: rarity.hex }}
                                    >
                                        {isOwned ? (
                                            <div className="absolute top-2 right-2 bg-slate-900/80 text-amber-400 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono border border-slate-700">
                                                <Copy className="w-3 h-3" />
                                                +{rarity.value}
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow-lg shadow-emerald-500/20">
                                                NEW!
                                            </div>
                                        )}

                                        <div className="w-16 h-16 mt-4 mb-3 relative">
                                            <LootImage slug={slug} />
                                        </div>

                                        <span
                                            className="text-xs font-bold text-center w-full truncate px-1"
                                            style={{ color: rarity.hex }}
                                        >
                                            {slug.replace(/-/g, ' ')}
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase mt-auto">
                                            {rarity.name}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.button
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: loot.length * 0.2 + 0.3 }}
                            onClick={onClaim}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-12 rounded-full shadow-2xl shadow-emerald-900/50 hover:scale-105 active:scale-95 transition-all text-lg flex items-center gap-2"
                        >
                            <Check className="w-6 h-6" />
                            COLLECT RESOURCES
                        </motion.button>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}


function LootImage({ slug }: { slug: string }) {
    const category = getCategory(slug);

    return (
        <div className="relative w-full h-full">
            <Image
                src={`/icons/${category}/${slug}.png`}
                alt={slug}
                fill
                className="object-contain pixelated rendering-pixelated"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    )
}
