import { useGame } from "@/context/GameContext";
import BiomeSelector from "@/components/BiomeSelector";
import { Cpu, Zap, Layers } from "lucide-react";

const UPGRADES = {
    speed: {
        name: "Overclock",
        description: "Reduces expedition time by 10%.",
        icon: Zap,
        baseCost: 10
    },
    multithread: {
        name: "Multithreading",
        description: "Increases Items found per run by 1.",
        icon: Layers,
        baseCost: 50
    },
    luck: {
        name: "Lucky CPU",
        description: "Increases chance to re-roll low rarity items.",
        icon: Cpu,
        baseCost: 25
    }
};

export default function LabView() {
    const { bits, upgrades, buyUpgrade } = useGame();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-2 lg:items-start gap-8">
            {/* Biome Section */}
            <section className="w-full">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Range</h2>
                        <p className="text-xs text-slate-500">Unlock and select target biomes.</p>
                    </div>
                </div>
                <BiomeSelector />
            </section>

            {/* Hardware Section */}
            <section className="w-full">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">Hardware</h2>
                        <p className="text-xs text-slate-500">Upgrade internal components.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(Object.keys(UPGRADES) as Array<keyof typeof UPGRADES>).map((type) => {
                        const info = UPGRADES[type];
                        const level = upgrades[type];
                        const cost = Math.floor(info.baseCost * Math.pow(1.5, level - 1));
                        const canAfford = bits >= cost;

                        return (
                            <div key={type} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-4 group hover:border-amber-500/30 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 w-12 h-12 bg-[#222522] rounded-lg flex items-center justify-center text-slate-500 group-hover:text-amber-400 transition-colors">
                                        <info.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-200">{info.name} <span className="text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded ml-1">LVL {level}</span></h3>
                                        <p className="text-xs text-slate-500 mt-1">{info.description}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => buyUpgrade(type, cost)}
                                    disabled={!canAfford}
                                    className={`
                                        flex flex-col items-center justify-center w-full h-10 rounded font-mono text-xs font-bold transition-all
                                        ${canAfford
                                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 active:translate-y-0.5'
                                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <span>UPGRADE {cost} B</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

