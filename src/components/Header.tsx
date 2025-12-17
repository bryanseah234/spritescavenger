import { Trophy, Coins, Settings } from "lucide-react";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import Image from "next/image";

interface HeaderProps {
    onSettingsClick: (tab?: string) => void;
    activeTab: string;
}

export default function Header({ onSettingsClick, activeTab }: HeaderProps) {
    const { inventory, bits, xp, level } = useGame();

    const totalItems = Object.values(masterCollection).flat().length;
    const uniqueItems = new Set(inventory).size;

    // XP Progress Calculation
    const currentLevelBase = 100 * Math.pow(level - 1, 2);
    const nextLevelBase = 100 * Math.pow(level, 2);
    const progress = Math.min(100, Math.max(0, ((xp - currentLevelBase) / (nextLevelBase - currentLevelBase)) * 100));
    const nextLevelXp = nextLevelBase; // For display

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
            <div className="flex items-center gap-4">
                {/* Identity / Level */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center relative overflow-hidden group border border-indigo-400/30">
                        {/* Progress Fill */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-teal-400/20 transition-all duration-1000 ease-out"
                            style={{ height: `${progress}%` }}
                        />
                        <Image
                            src="/icon.png"
                            alt="Logo"
                            width={24}
                            height={24}
                            className="relative z-10 rounded-sm"
                        />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-100 leading-tight">SPRITE<span className="text-indigo-500">SCAVENGER</span></h1>
                        <p className="text-[10px] text-slate-400 font-mono">Lvl.{level} <span className="text-slate-600">|</span> {Math.floor(xp)}/{nextLevelXp} XP</p>
                    </div>
                </div>

                {/* Desktop/Tablet Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <button
                        onClick={() => onSettingsClick('terminal')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'terminal' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        TERMINAL
                    </button>
                    <button
                        onClick={() => onSettingsClick('lab')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'lab' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        LAB
                    </button>
                    <button
                        onClick={() => onSettingsClick('forge')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'forge' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        FORGE
                    </button>
                    <button
                        onClick={() => onSettingsClick('database')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeTab === 'database' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        DATABASE
                    </button>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
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

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {/* Trigger palette? We need prop for this. Shortcuts work for now. */ }}
                        className="hidden md:flex items-center gap-2 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-500 hover:text-slate-300 transition-colors pointer-events-none"
                    >
                        <span className="text-[10px] font-mono">CMD+K</span>
                    </button>
                    <button
                        onClick={() => onSettingsClick('settings')}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
