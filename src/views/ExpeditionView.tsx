import { useState } from "react";
import { useGame } from "@/context/GameContext";
import ExpeditionConsole from "@/components/ExpeditionConsole";
import LootReveal from "@/components/LootReveal";
import ExpeditionGame from "@/components/ExpeditionGame";

export default function ExpeditionView() {
    const { addToInventory, activeBiome } = useGame();
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'REVEAL'>('IDLE');
    const [loot, setLoot] = useState<string[] | null>(null);

    const handleStart = () => {
        setGameState('PLAYING');
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
            {gameState === 'IDLE' && (
                <div className="flex-1 flex items-center justify-center p-4">
                    <ExpeditionConsole
                        isActive={false} // Always false now, no timer
                        timeLeft={0}
                        totalDuration={100}
                        onStart={handleStart}
                        onOpenShop={() => { }}
                    />
                </div>
            )}

            {gameState === 'PLAYING' && (
                <div className="flex-1 bg-black relative">
                    <ExpeditionGame onComplete={handleGameComplete} biomeId={activeBiome} />
                </div>
            )}

            {gameState === 'REVEAL' && loot && (
                <LootReveal loot={loot} onClaim={handleClaim} />
            )}
        </div>
    );
}
