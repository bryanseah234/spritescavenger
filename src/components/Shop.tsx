import { useGame } from "@/context/GameContext";
import { X, Cpu, Zap, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShopProps {
    isOpen: boolean;
    onClose: () => void;
}

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

export default function Shop({ isOpen, onClose }: ShopProps) {
    const { bits, upgrades, buyUpgrade } = useGame();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative z-10"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                                    <Cpu className="text-indigo-500" />
                                    Hardware Lab
                                </h2>
                                <p className="text-slate-400 text-sm">Upgrade system components using Bits.</p>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(Object.keys(UPGRADES) as Array<keyof typeof UPGRADES>).map((type) => {
                                const info = UPGRADES[type];
                                const level = upgrades[type];
                                const cost = Math.floor(info.baseCost * Math.pow(1.5, level - 1));
                                const canAfford = bits >= cost;

                                return (
                                    <div key={type} className="bg-slate-800 p-4 rounded-lg flex items-center justify-between group hover:border-slate-600 border border-transparent transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                                                <info.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-200">{info.name} <span className="text-xs text-indigo-400 ml-1">LVL {level}</span></h3>
                                                <p className="text-xs text-slate-500">{info.description}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => buyUpgrade(type, cost)}
                                            disabled={!canAfford}
                                            className={`
                                    px-4 py-2 rounded font-mono text-sm font-bold transition-all
                                    ${canAfford
                                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 active:translate-y-0.5'
                                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                                                }
                                `}
                                        >
                                            {cost} Bits
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center text-slate-400 text-xs">
                            <span>WALLET BALANCE</span>
                            <span className="text-amber-400 font-mono text-base">{bits} BITS</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
