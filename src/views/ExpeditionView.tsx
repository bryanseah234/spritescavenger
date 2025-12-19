import { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import ExpeditionConsole from "@/components/ExpeditionConsole";
import LootReveal from "@/components/LootReveal";
import ExpeditionGame from "@/components/ExpeditionGame";
import masterCollection from "@/data/master-collection.json";

export default function ExpeditionView() {
    const { addToInventory, activeBiome } = useGame();
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'REVEAL'>('IDLE');
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [loot, setLoot] = useState<string[] | null>(null);

    // Auto Mode State (Simple Timer simulation)
    const [autoTimeLeft, setAutoTimeLeft] = useState(0);
    const [isAutoActive, setIsAutoActive] = useState(false);
    const AUTO_DURATION = 30;

    // Auto Mode Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAutoActive && autoTimeLeft > 0) {
            interval = setInterval(() => {
                setAutoTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (isAutoActive && autoTimeLeft === 0) {
            // Auto finish
            setIsAutoActive(false);

            // Generate Real Loot
            const allSlugs = Object.values(masterCollection).flat() as string[];
            const earnedLoot: string[] = [];
            for (let i = 0; i < 3; i++) {
                const randomSlug = allSlugs[Math.floor(Math.random() * allSlugs.length)];
                earnedLoot.push(randomSlug);
            }

            handleGameComplete(earnedLoot);
        }
        return () => clearInterval(interval);
    }, [isAutoActive, autoTimeLeft]);

    const handleStart = () => {
        if (isAutoMode) {
            setIsAutoActive(true);
            setAutoTimeLeft(AUTO_DURATION);
            setGameState('PLAYING');
        } else {
            setGameState('PLAYING');
        }
    };

    const handleGameComplete = (earnedLoot: string[]) => {
        addToInventory(earnedLoot);
        setLoot(earnedLoot);
        setGameState('REVEAL');
    };

    const handleClaim = () => {
        setLoot(null);
        setGameState('IDLE');
    };

    return (
        <div className="flex flex-col gap-6 w-full h-[calc(100vh-80px)]">

            {/* Mode Toggle (Only visible in IDLE) */}
            {gameState === 'IDLE' && (
                <div className="flex justify-end px-4">
                    <button
                        onClick={() => setIsAutoMode(!isAutoMode)}
                        className="text-xs font-mono text-slate-500 hover:text-indigo-400 underline"
                    >
                        {isAutoMode ? "SWITCH TO MANUAL CONTROL" : "SWITCH TO AUTO-HUNT"}
                    </button>
                </div>
            )}

            {gameState === 'IDLE' && (
                <div className="flex-1 flex items-center justify-center p-4">
                    <ExpeditionConsole
                        isActive={isAutoActive}
                        timeLeft={autoTimeLeft}
                        totalDuration={AUTO_DURATION}
                        onStart={handleStart}
                        onOpenShop={() => { }}
                        // Pass auto mode hint
                        customTitle={isAutoMode ? "AUTO-HUNT PROTOCOL" : "EXPEDITION CONSOLE"}
                        customDesc={isAutoMode ? "Drone will automatically scavenge area." : "Manual control required."}
                    />
                </div>
            )}

            {gameState === 'PLAYING' && !isAutoMode && (
                <div className="flex-1 bg-black relative w-full h-full">
                    <ExpeditionGame onComplete={handleGameComplete} biomeId={activeBiome} />
                </div>
            )}

            {gameState === 'PLAYING' && isAutoMode && (
                <div className="flex-1 flex items-center justify-center p-4">
                    <ExpeditionConsole
                        isActive={true}
                        timeLeft={autoTimeLeft}
                        totalDuration={AUTO_DURATION}
                        onStart={() => { }}
                        onOpenShop={() => { }}
                        customTitle="AUTO-HUNT IN PROGRESS"
                        customDesc="Units are scavenging..."
                    />
                </div>
            )}

            {gameState === 'REVEAL' && loot && (
                <LootReveal loot={loot} onClaim={handleClaim} />
            )}
        </div>
    );
}
