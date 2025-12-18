import { useState } from "react";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import { Lock } from "lucide-react";
import { getRarity } from "@/utils/rarity";

export default function CollectionGrid() {
    const { inventory } = useGame();
    const categories = Object.keys(masterCollection);
    const [activeCategory, setActiveCategory] = useState(categories[0]);

    return (
        <div className="w-full max-w-6xl mx-auto p-4 pb-32 flex flex-col gap-6">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors
                            ${activeCategory === cat
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid Area */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 min-h-[50vh]">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {/* @ts-expect-error JSON typing */}
                    {masterCollection[activeCategory]?.map((slug: string) => {
                        const isOwned = inventory.includes(slug);
                        const rarity = getRarity(slug);

                        return (
                            <div
                                key={slug}
                                className={`
                                    aspect-square rounded border flex items-center justify-center relative group
                                    transition-colors
                                    ${isOwned
                                        ? `bg-slate-800 border-slate-700`
                                        : 'bg-slate-950 border-slate-800'
                                    }
                                `}
                                style={isOwned ? { borderColor: rarity.hex } : {}}
                            >
                                {isOwned ? (
                                    <>
                                        <div className="w-full h-full p-2 relative">
                                            <Image
                                                src={`/icons/${activeCategory}/${slug}.png`}
                                                alt={slug}
                                                fill
                                                className="object-contain pixelated rendering-pixelated"
                                                sizes="100px"
                                            />
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded p-1 z-10 pointer-events-none">
                                            <span
                                                className="text-[8px] font-mono text-center px-1 break-all font-bold mb-1 leading-tight"
                                                style={{ color: rarity.hex }}
                                            >
                                                {slug.split('-').pop()}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <Lock className="w-4 h-4 text-slate-800" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
