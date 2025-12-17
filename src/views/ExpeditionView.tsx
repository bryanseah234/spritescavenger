import { useExpedition } from "@/hooks/useExpedition";
import ExpeditionConsole from "@/components/ExpeditionConsole";
import LootReveal from "@/components/LootReveal";

export default function ExpeditionView() {
    const { isActive, timeLeft, totalDuration, start, claim, loot } = useExpedition();

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-4 justify-center min-h-[60vh]">
            <ExpeditionConsole
                isActive={isActive}
                timeLeft={timeLeft}
                totalDuration={totalDuration}
                onStart={start}
                onOpenShop={() => { }} // No-op, shop is now separate tab
            />

            <LootReveal loot={loot} onClaim={claim} />
        </div>
    );
}
