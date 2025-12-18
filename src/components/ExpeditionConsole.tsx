import { Play } from "lucide-react";

interface ExpeditionConsoleProps {
    isActive: boolean;
    timeLeft: number;
    totalDuration: number;
    onStart: () => void;
    onOpenShop: () => void;
}

export default function ExpeditionConsole({ isActive, timeLeft, totalDuration, onStart, onOpenShop }: ExpeditionConsoleProps) {
    const progress = isActive
        ? ((totalDuration - timeLeft) / totalDuration) * 100
        : 0;

    return (
        <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6">
            {/* Instructions */}
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400">
                    Sprite Scavenger
                </h1>
                <div className="text-sm text-slate-400 space-y-1">
                    <p>1. Start an Expedition to find data fragments.</p>
                    <p>2. Collect items and earn Bits.</p>
                    <p>3. Upgrade your hardware in the Lab.</p>
                </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 shadow-xl relative overflow-hidden">
                {isActive ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end text-slate-300">
                            <span className="text-xs uppercase tracking-widest animate-pulse">Scanning Sector...</span>
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
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded shadow-lg shadow-indigo-900/20 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
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
