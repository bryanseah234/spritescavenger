import { Trophy, Coins, Zap, Settings } from "lucide-react";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";

interface HeaderProps {
    onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
    const { inventory, bits, xp, level } = useGame();

    const totalItems = Object.values(masterCollection).flat().length;
    const uniqueItems = new Set(inventory).size;

    // XP Progress Calculation
    // Level N requires 100 * N^2 XP.
    // Next Level (N+1) requires 100 * (N+1)^2.
    // Current progress = (xp - currentLevelBase) / (nextLevelBase - currentLevelBase)
    const currentLevelBase = 100 * Math.pow(level - 1, 2);
    const nextLevelBase = 100 * Math.pow(level, 2);
    const progressPercent = Math.min(100, Math.max(0, ((xp - currentLevelBase) / (nextLevelBase - currentLevelBase)) * 100));

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 bg-indigo-500 rounded flex items-center justify-center">
                    <Zap className="text-white w-5 h-5 relative z-10" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/20 h-full">
                        <div className="bg-indigo-300 w-full absolute bottom-0 left-0 transition-all" style={{ height: `${progressPercent}%`, opacity: 0.3 }} />
                    </div>
                </div>
                <div>
                    <h1 className="text-slate-100 font-bold text-sm tracking-widest uppercase">Sprite Scavenger</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-indigo-400 font-bold">LVL {level}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span className="font-mono">{Math.floor(xp)} XP</span>
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

                <button
                    onClick={onSettingsClick}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
