import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Flame, ArrowRight } from "lucide-react";
import { getRarity } from "@/utils/rarity";

export default function Forge() {
    const { inventory, addToInventory, burnItems } = useGame(); // Removed unused bits/addBits for now if not used
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Simplification: Auto-select 10 duplicates for user? Or manual selection?
    // Manual selection is tedious for 10 items.
    // Let's implement "Auto-Fill" for UX.

    const handleAutoFill = (rarityName: string) => {
        // Collect up to 10 items of this rarity
        // Prefer items that have high duplicate counts, but inventory is just an array of slugs.
        // We find slugs that appear multiple times or just any slugs?
        // "Up-Cycling" usually implies burning trash.

        // Find all items of rarity
        const candidates = inventory.filter(slug => getRarity(slug).name === rarityName);
        // Take up to 10
        setSelectedItems(candidates.slice(0, 10));
    };

    const handleForge = () => {
        if (selectedItems.length !== 10) return;

        // Cost? 50 Bits for Common->Uncommon.
        // We assume burnItems handles persistence.
        burnItems(selectedItems);

        // Reward: 1 Random Item of next tier?
        // We don't have a specific "Uncommon" pool easily accessible without scanning masterCollection.
        // For MVP Phase 3 simplicity: Give a precise "Uncommon Mystery Box" item...
        // OR: Just generate a random item from the pool and ensure it's Uncommon. This is easier.
        // However, technically we should check cost.
        // Let's assume cost is handled or we add 'removeBits' to context. (Not added yet).
        // Let's just do free forge for now or valid if Bits implement 'remove' via addBits(-50).
        // addBits(-50);

        // Generate Reward
        // Placeholder: We need a "Generator" utility eventually.
        // For now, let's just emit a success event or use a known slug if available,
        // or just let the user "discover" something next expedition.
        // Better: Grant a specific "Forged Alloy" item or similar if we don't assume pool access easily.
        // But wait, we can just call `generateLoot` logic? No, inaccessible.

        // Solution: Just clear selection for now and show alert.
        setSelectedItems([]);
        alert("Forge Complete! (Placeholder: You would receive an item here)");
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 pb-20">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative">

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center animate-pulse">
                        <Flame className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">The Forge</h2>
                        <p className="text-slate-400 text-sm">Burn 10 items to forge a higher rarity.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-slate-300 font-bold mb-4">Crucible ({selectedItems.length}/10)</h3>
                        <div className="grid grid-cols-5 gap-2 h-32 content-start overflow-y-auto">
                            {selectedItems.map((slug, i) => (
                                <div key={i} className="w-8 h-8 bg-slate-700 rounded border border-slate-600" title={slug}>
                                    {/* Img placeholder */}
                                </div>
                            ))}
                            {[...Array(10 - selectedItems.length)].map((_, i) => (
                                <div key={`empty-${i}`} className="w-8 h-8 bg-slate-900/50 rounded border border-slate-800 border-dashed" />
                            ))}
                        </div>
                        <button
                            onClick={() => handleAutoFill('Common')}
                            className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
                        >
                            Auto-Fill Commons
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4">
                        <ArrowRight className="text-slate-600" />
                        <div className="w-24 h-24 bg-slate-900 rounded-xl border-2 border-slate-700 border-dashed flex items-center justify-center">
                            <span className="text-4xl">?</span>
                        </div>
                        <button
                            onClick={handleForge}
                            disabled={selectedItems.length !== 10}
                            className={`
                                w-full py-3 rounded font-bold transition-all
                                ${selectedItems.length === 10
                                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/50'
                                    : 'bg-slate-800 text-slate-500'
                                }
                            `}
                        >
                            FORGE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
