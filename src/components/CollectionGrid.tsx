import Image from "next/image";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import { Lock } from "lucide-react";
import { getRarity } from "@/utils/rarity";

export default function CollectionGrid() {
    const { inventory } = useGame();
    const categories = Object.keys(masterCollection);

    return (
        <div className="w-full max-w-6xl mx-auto p-4 pb-32 flex flex-col gap-6">
            {categories.map((cat) => (
                <div key={cat} className="flex bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden min-h-[150px]">
                    {/* Left: Category Label */}
                    <div className="w-12 bg-slate-800 border-r border-slate-700 flex items-center justify-center shrink-0">
                        <span
                            className="text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap"
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                            {cat}
                        </span>
                    </div>

                    {/* Right: Grid */}
                    <div className="p-4 flex-1">
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                            {/* @ts-expect-error JSON typing */}
                            {masterCollection[cat]?.map((slug: string) => {
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
                                                : 'bg-slate-900 border-slate-800'
                                            }
                                        `}
                                        style={isOwned ? { borderColor: rarity.hex } : {}}
                                    >
                                        {isOwned ? (
                                            <>
                                                <div className="w-full h-full p-2 relative">
                                                    <Image
                                                        src={`/icons/${cat}/${slug}.png`}
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
            ))}
        </div>
    );
}
