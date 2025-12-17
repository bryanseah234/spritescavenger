"use client";

import { useEffect, useState, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import { getRarity } from "@/utils/rarity";

const BASE_DURATION = 30; // seconds
const BASE_ITEMS = 3;

export function useExpedition() {
    const {
        expeditionStartTime,
        startExpedition: startContextExpedition,
        endExpedition: endContextExpedition,
        addToInventory,
        addBits,
        inventory,
        upgrades
    } = useGame();

    // Calculate duration based on Overclock speed
    const duration = Math.floor(BASE_DURATION * Math.pow(0.9, upgrades.speed - 1));

    // Initialize timeLeft lazily to avoid effect sync issues
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!expeditionStartTime) return 0;
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - expeditionStartTime) / 1000);
        return Math.max(0, duration - elapsedSeconds);
    });

    const [loot, setLoot] = useState<string[] | null>(null);


    const generateLoot = useCallback(() => {
        const categories = Object.keys(masterCollection);

        // Multithreading affects loot count
        const numItems = BASE_ITEMS + (upgrades.multithread - 1);

        const newLoot: string[] = [];

        for (let i = 0; i < numItems; i++) {
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            // @ts-expect-error JSON typing is simple object
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
    }, [upgrades.multithread, upgrades.luck]);

    useEffect(() => {
        if (!expeditionStartTime) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            if (timeLeft !== 0) setTimeLeft(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - expeditionStartTime) / 1000);
            const remaining = Math.max(0, duration - elapsedSeconds);

            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                // Only generate loot if we haven't already
                setLoot(prev => prev || generateLoot());
            }
        }, 200);

        return () => clearInterval(interval);
    }, [expeditionStartTime, duration, generateLoot, timeLeft]);

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

            loot.forEach(slug => {
                if (inventory.includes(slug) || newItems.includes(slug)) {
                    // Duplicate!
                    const rarity = getRarity(slug);
                    totalBits += rarity.value;
                } else {
                    newItems.push(slug);
                }
            });

            if (newItems.length > 0) addToInventory(newItems);
            if (totalBits > 0) addBits(totalBits);

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
