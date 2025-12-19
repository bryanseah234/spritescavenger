import { Play } from "lucide-react";
import { useGame } from "@/context/GameContext";

interface ExpeditionConsoleProps {
    isActive: boolean;
    timeLeft: number;
    totalDuration: number;
    onStart: () => void;
    onOpenShop: () => void;
    customTitle?: string;
    customDesc?: string;
    isAutoMode?: boolean;
    onToggleMode?: () => void;
}

export default function ExpeditionConsole({
    isActive,
    timeLeft,
    totalDuration,
    onStart,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onOpenShop,
    customTitle,
    customDesc,
    isAutoMode,
    onToggleMode
}: ExpeditionConsoleProps) {
    const { playerName } = useGame(); // We can still use this if needed, or override

    // Calculate progress percentage
    const progress = Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100));

    return (
        <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Scanlines Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[url('/assets/scanlines.png')] opacity-10 mix-blend-overlay z-20"></div>

            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-start relative z-10">
                <div className="flex flex-col items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
                            {customTitle || "EXPEDITION CONSOLE"}
                        </h1>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1">
                            {customDesc || `Ref: ${playerName}`}
                        </p>
                    </div>

                    {onToggleMode && (
                        <button
                            onClick={onToggleMode}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-indigo-400 rounded-md border border-slate-700 transition-colors uppercase tracking-wider"
                        >
                            {isAutoMode ? "Disable Auto-Hunt" : "Enable Auto-Hunt"}
                        </button>
                    )}
                </div>
                {/* The original instructions block is moved here, assuming it's part of the new header structure */}
                <div className="text-sm text-slate-400 space-y-1 border border-slate-800 bg-slate-900/50 p-6 rounded-xl">
                    <p>1. Start an Expedition to find data fragments.</p>
                    <p>2. Finding <span className="text-indigo-400">duplicate</span> items earns you <span className="text-amber-400">Bits</span>.</p>
                    <p>3. Use the <strong className="text-slate-200">Forge</strong> to recycle common items into upgrades.</p>
                    <p>4. Upgrade your hardware in the Lab to go deeper.</p>
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                {isActive ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end text-slate-300">
                            <span className="text-xs uppercase tracking-widest animate-pulse text-emerald-500">Scanning Sector...</span>
                            <span className="font-mono text-lg text-emerald-400">{timeLeft}s</span>
                        </div>

                        <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-600">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-200 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-1 mt-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={`h-1 rounded-sm ${i / 4 < progress / 100 ? 'bg-emerald-500/50' : 'bg-slate-700'}`} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-slate-100 font-bold text-lg">System Idle</h2>
                            <p className="text-slate-400 text-sm">Ready to initialize storage retrieval sequence.</p>
                        </div>

                        <button
                            onClick={onStart}
                            className="w-full bg-slate-200 hover:bg-white text-slate-900 font-bold py-4 rounded-lg shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                            START EXPEDITION
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
