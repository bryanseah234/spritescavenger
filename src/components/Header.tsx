import { Trophy, Coins, Settings } from "lucide-react";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import Image from "next/image";

interface HeaderProps {
    onSettingsClick: (tab?: string) => void;
    onOpenPalette: () => void;
    activeTab: string;
}

export default function Header({ onSettingsClick, onOpenPalette, activeTab }: HeaderProps) {
    const { inventory, bits, xp, level } = useGame();

    const totalItems = Object.values(masterCollection).flat().length;
    const uniqueItems = new Set(inventory).size;

    // XP Progress
    const currentLevelBase = 100 * Math.pow(level - 1, 2);
    const nextLevelBase = 100 * Math.pow(level, 2);
    const progress = Math.min(100, Math.max(0, ((xp - currentLevelBase) / (nextLevelBase - currentLevelBase)) * 100));
    const nextLevelXp = nextLevelBase;

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-50">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Image
                        src="/icon.png"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="object-contain" // Simplified: No bg, no borders
                    />
                    <div className="hidden lg:block">
                        <h1 className="font-bold text-slate-100 leading-tight tracking-tight">SPRITE<span className="text-indigo-500">SCAVENGER</span></h1>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-1">
                    {['terminal', 'lab', 'forge', 'database'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => onSettingsClick(tab)}
                            className={`
                                px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all
                                ${activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-4">
                <button
                    onClick={onOpenPalette}
                    className="w-full bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-full h-10 px-4 flex items-center gap-3 group transition-colors"
                >
                    <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                    <span className="text-sm text-slate-500 font-medium">Search...</span>
                    <span className="ml-auto text-[10px] font-mono text-slate-600 border border-slate-800 rounded px-1.5 py-0.5 group-hover:border-slate-700">CMD+K</span>
                </button>
            </div>

            {/* Right: Stats & Settings */}
            <div className="flex items-center gap-6">

                {/* Stats (Monochrome/Primary Theme) */}
                <div className="hidden sm:flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-200">{uniqueItems} / {totalItems}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Items</span>
                    </div>
                    <div className="w-px h-6 bg-slate-800" />
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-indigo-400">{bits}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Bits</span>
                    </div>
                    <div className="w-px h-6 bg-slate-800" />
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-200">Lvl.{level}</span>
                        <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>

                <div className="w-px h-6 bg-slate-800 hidden sm:block" />

                <button
                    onClick={() => onSettingsClick('settings')}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}

// Helper icon import
import { Search } from "lucide-react";
