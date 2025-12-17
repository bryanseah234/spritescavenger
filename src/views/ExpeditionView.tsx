import { useExpedition } from "@/hooks/useExpedition";
import BiomeSelector from "@/components/BiomeSelector";
import ExpeditionConsole from "@/components/ExpeditionConsole";
import LootReveal from "@/components/LootReveal";
import Shop from "@/components/Shop";
import { useState } from "react";

export default function ExpeditionView() {
    const { isActive, timeLeft, totalDuration, start, claim, loot } = useExpedition();
    const [shopOpen, setShopOpen] = useState(false);

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-4">
            <BiomeSelector />

            <ExpeditionConsole
                isActive={isActive}
                timeLeft={timeLeft}
                totalDuration={totalDuration}
                onStart={start}
                onOpenShop={() => setShopOpen(true)}
            />

            <LootReveal loot={loot} onClaim={claim} />
            <Shop isOpen={shopOpen} onClose={() => setShopOpen(false)} />
        </div>
    );
}
