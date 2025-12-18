import { Play } from "lucide-react";
import { useGame } from "@/context/GameContext";

interface ExpeditionConsoleProps {
    isActive: boolean;
    timeLeft: number;
    totalDuration: number;
    onStart: () => void;
    onOpenShop: () => void;
}

export default function ExpeditionConsole({ isActive, timeLeft, totalDuration, onStart, onOpenShop }: ExpeditionConsoleProps) {
    const { playerName } = useGame();
    const progress = isActive
        ? ((totalDuration - timeLeft) / totalDuration) * 100
        : 0;

    return (
        <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6">
            {/* Instructions & Greeting */}
            <div className="text-center space-y-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
                        Sprite Scavenger
                    </h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mt-1">
                        Welcome back, {playerName}
                    </p>
                </div>

                <div className="text-sm text-slate-400 space-y-1 border border-slate-800 bg-slate-900/50 p-6 rounded-xl">
                    <p>1. Start an Expedition to find data fragments.</p>
                    <p>2. Collect items and earn Bits.</p>
                    <p>3. Upgrade your hardware in the Lab.</p>
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
