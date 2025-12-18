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
    const [sortMode, setSortMode] = useState<'owned' | 'alpha'>('owned');

    const handleCategoryClick = (cat: string) => {
        if (activeCategory === cat) {
            // Toggle sort
            setSortMode(prev => prev === 'owned' ? 'alpha' : 'owned');
        } else {
            // New category, default to owned
            setActiveCategory(cat);
            setSortMode('owned');
        }
    };

    const formatName = (slug: string) => {
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getSortedItems = () => {
        // @ts-expect-error JSON key access
        const items = (masterCollection[activeCategory] as string[]) || [];

        // Create a shallow copy to sort
        const sorted = [...items];

        if (sortMode === 'alpha') {
            // Already mostly sorted in JSON, but ensure A-Z
            sorted.sort();
        } else {
            // Owned First
            sorted.sort((a, b) => {
                const ownedA = inventory.includes(a);
                const ownedB = inventory.includes(b);
                if (ownedA === ownedB) return a.localeCompare(b); // Alphabetical tie-break
                return ownedA ? -1 : 1; // Owned comes first
            });
        }
        return sorted;
    };

    const sortedItems = getSortedItems();

    return (
        <div className="w-full max-w-6xl mx-auto p-4 pb-32 flex flex-col gap-6">
            {/* Category Grid (3x3) */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`
                            px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border flex flex-col items-center justify-center gap-1
                            ${activeCategory === cat
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600'
                            }
                        `}
                    >
                        <span>{cat}</span>
                        <span className={`text-[10px] ${activeCategory === cat ? 'text-indigo-200' : 'text-slate-600'}`}>
                            ({getCategoryCount(cat).owned}/{getCategoryCount(cat).total})
                        </span>
                    </button>
                ))}
            </div>

            {/* Grid Area */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 min-h-[50vh]">
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {sortMode === 'owned' ? 'Sorted by: Discovered' : 'Sorted by: Alphabetical'}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono">
                        {activeCategory.toUpperCase()} // {sortedItems.length} ITEMS
                    </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {sortedItems.map((slug: string) => {
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
                                                src={`/icons/${encodeURIComponent(activeCategory)}/${slug}.png`}
                                                alt={slug}
                                                fill
                                                className="object-contain pixelated rendering-pixelated"
                                                sizes="100px"
                                                onError={(e) => {
                                                    // Fallback if image fails?
                                                    console.warn(`Failed to load icon: ${slug}`);
                                                }}
                                            />
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded p-1 z-10 pointer-events-none border border-slate-700">
                                            <span
                                                className="text-[8px] font-mono text-center px-1 break-all font-bold mb-1 leading-tight"
                                                style={{ color: rarity.hex }}
                                            >
                                                {formatName(slug)}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    // Locked State
                                    <div className="flex flex-col items-center justify-center gap-1 opacity-40">
                                        <Lock className="w-4 h-4 text-slate-600" />
                                        <span className="text-[8px] font-bold text-center text-slate-600 px-1 leading-tight hidden sm:block">
                                            {formatName(slug)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
