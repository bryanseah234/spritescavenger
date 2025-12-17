"use client";

import { useEffect, useState, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import { getRarity } from "@/utils/rarity";
import { BIOMES } from "@/data/biomes";

const BASE_DURATION = 30; // seconds
const BASE_ITEMS = 3;

export function useExpedition() {
    const {
        expeditionStartTime,
        startExpedition: startContextExpedition,
        endExpedition: endContextExpedition,
        addToInventory,
        addBits,
        addXp,
        inventory,
        upgrades,
        activeBiome
    } = useGame();

    // Calculate duration based on Overclock speed
    const duration = Math.floor(BASE_DURATION * Math.pow(0.9, upgrades.speed - 1));

    // Initialize timeLeft lazily
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!expeditionStartTime) return 0;
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - expeditionStartTime) / 1000);
        return Math.max(0, duration - elapsedSeconds);
    });

    const [loot, setLoot] = useState<string[] | null>(null);


    const generateLoot = useCallback(() => {
        // Phase 3: Filter categories by Active Biome
        const currentBiomeDef = BIOMES.find(b => b.id === activeBiome) || BIOMES[0];
        const allowedCategories = currentBiomeDef.categories;

        // Multithreading affects loot count
        const numItems = BASE_ITEMS + (upgrades.multithread - 1);

        const newLoot: string[] = [];

        // Safety check if biome categories don't exist in masterCollection
        const validCategories = allowedCategories.filter(cat => Object.keys(masterCollection).includes(cat));

        // If fallback needed (e.g. data missing), default to all
        const categoriesToUse = validCategories.length > 0 ? validCategories : Object.keys(masterCollection);

        for (let i = 0; i < numItems; i++) {
            const randomCategory = categoriesToUse[Math.floor(Math.random() * categoriesToUse.length)];
            // @ts-expect-error JSON typing
            const items = masterCollection[randomCategory] as string[];
            if (items && items.length > 0) {
                let pickedItem = items[Math.floor(Math.random() * items.length)];

                // Lucky CPU Logic
                if (upgrades.luck > 1) {
                    const rarity = getRarity(pickedItem);
                    if (rarity.name === 'Common') {
                        if (Math.random() < 0.2 * (upgrades.luck - 1)) {
                            const retryItem = items[Math.floor(Math.random() * items.length)];
                            pickedItem = retryItem;
                        }
                    }
                }
                newLoot.push(pickedItem);
            }
        }
        return newLoot;
    }, [upgrades.multithread, upgrades.luck, activeBiome]);

    // Reset timeLeft when expedition stops
    useEffect(() => {
        if (!expeditionStartTime) {
            setTimeLeft(0);
        }
    }, [expeditionStartTime]);

    // Timer Logic
    useEffect(() => {
        if (!expeditionStartTime) return;


        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - expeditionStartTime) / 1000);
            const remaining = Math.max(0, duration - elapsedSeconds);

            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                setLoot(prev => prev || generateLoot());
            }
        }, 200);

        return () => clearInterval(interval);
    }, [expeditionStartTime, duration, generateLoot]);

    const isActive = expeditionStartTime !== null && timeLeft > 0;
    const isFinished = expeditionStartTime !== null && timeLeft === 0;

    const start = () => {
        setLoot(null);
        startContextExpedition();
    };

    const claim = () => {
        if (loot) {
            const newItems: string[] = [];
            let totalBits = 0;
            let totalXp = 0;

            loot.forEach(slug => {
                const rarity = getRarity(slug);

                // XP Logic: 10/50/500 based on rarity tiers?
                // Tiers: Common(1), Uncommon(5), Rare(25), Epic(100), Legendary(500) - based on Value.
                // Let's use specific XP values as requested: Common=10, Rare=50, Legendary=500.
                // Mapping: Common=10, Uncommon=25, Rare=50, Epic=200, Legendary=500.
                let xpValue = 10;
                if (rarity.name === 'Uncommon') xpValue = 25;
                if (rarity.name === 'Rare') xpValue = 50;
                if (rarity.name === 'Epic') xpValue = 200;
                if (rarity.name === 'Legendary') xpValue = 500;

                totalXp += xpValue;

                if (inventory.includes(slug) || newItems.includes(slug)) {
                    // Duplicate!
                    totalBits += rarity.value;
                } else {
                    newItems.push(slug);
                }
            });

            if (newItems.length > 0) addToInventory(newItems);
            if (totalBits > 0) addBits(totalBits);
            if (totalXp > 0) addXp(totalXp);

            // Level Up Care Package logic could be handled in Context or useEffect, 
            // but simple additive XP here is fine. The UI will reflect level change.

            setLoot(null);
            endContextExpedition();
        }
    };

    return {
        timeLeft,
        isActive,
        isFinished,
        loot,
        start,
        claim,
        totalDuration: duration
    };
}
