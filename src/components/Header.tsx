import { useGame } from "@/context/GameContext";
import { Trophy, Coins, Zap } from "lucide-react";
import masterCollection from "@/data/master-collection.json";

export default function Header() {
    const { inventory, bits } = useGame();

    // Calculate total possible items
    const totalItems = Object.values(masterCollection).flat().length;

    // Calculate level based on unique items (simple logic for now)
    const uniqueItems = new Set(inventory).size;
    const level = Math.floor(uniqueItems / 5) + 1;

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center">
                    <Zap className="text-white w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-slate-100 font-bold text-sm tracking-widest uppercase">Sprite Scavenger</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>LVL {level}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span className="font-mono">VER 0.2</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-emerald-400">
                        <Trophy className="w-3 h-3" />
                        <span className="font-mono text-sm leading-none">{uniqueItems} / {totalItems}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Collection</span>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-amber-400">
                        <Coins className="w-3 h-3" />
                        <span className="font-mono text-sm leading-none">{bits}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Bits</span>
                </div>
            </div>
        </header>
    );
}
