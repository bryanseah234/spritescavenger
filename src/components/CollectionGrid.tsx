import { useState } from "react";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import { Lock } from "lucide-react";
import { getRarity } from "@/utils/rarity";

export default function CollectionGrid() {
    const { inventory } = useGame();
    const categories = Object.keys(masterCollection);
    const [activeTab, setActiveTab] = useState(categories[0]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 mt-8 pb-32">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                {/* Tabs */}
                <div className="flex overflow-x-auto border-b border-slate-800 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`
                        px-4 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors
                        ${activeTab === cat
                                    ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }
                    `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="p-4 bg-slate-900 min-h-[300px]">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {/* @ts-expect-error JSON typing is simple object */}
                        {masterCollection[activeTab]?.map((slug: string) => {
                            const isOwned = inventory.includes(slug);
                            const rarity = getRarity(slug);

                            return (
                                <div
                                    key={slug}
                                    className={`
                                aspect-square rounded border flex items-center justify-center relative group
                                transition-colors
                                ${isOwned
                                            ? `bg-slate-800 border-slate-700` // Border color applied via style for dynamic rarity
                                            : 'bg-slate-900 border-slate-800'
                                        }
                            `}
                                    style={isOwned ? { borderColor: rarity.hex } : {}}
                                >
                                    {isOwned ? (
                                        <>
                                            <div className="w-full h-full p-2">
                                                <img
                                                    src={`/icons/${activeTab}/${slug}.png`}
                                                    alt={slug}
                                                    className="w-full h-full object-contain pixelated rendering-pixelated"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded p-1">
                                                <span
                                                    className="text-[8px] font-mono text-center px-1 break-all font-bold mb-1"
                                                    style={{ color: rarity.hex }}
                                                >
                                                    {slug.split('-').pop()}
                                                </span>
                                                <span className="text-[6px] uppercase tracking-wider text-slate-400">
                                                    {rarity.name}
                                                </span>
                                            </div>

                                            {/* Rarity Dot or Corner Indicator can be nice too */}
                                            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rarity.hex }} />
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
        </div>
    );
}
