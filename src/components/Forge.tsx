import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Flame, ArrowRight } from "lucide-react";
import { getRarity } from "@/utils/rarity";

export default function Forge() {
    const { inventory, burnItems } = useGame(); // Removed unused bits/addBits for now if not used
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
                            <div key={i} className="aspect-square bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center relative group" title={slug}>
                                {/* Placeholder Item Icon */}
                                <div className="w-full h-full p-2 opacity-50"><div className="w-full h-full rounded-full bg-slate-700" /></div>
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
                            ${selectedItems.length === 10 ? 'bg-slate-900 border-orange-500/50 shadow-xl shadow-orange-900/20' : 'bg-slate-950 border-slate-800 border-dashed'}
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
        </div>
    );
}
