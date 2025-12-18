"use client";

import { useEffect, useRef, useState } from "react";
import masterCollection from "@/data/master-collection.json";
import { getRarity } from "@/utils/rarity";

interface ExpeditionGameProps {
    onComplete: (loot: string[]) => void;
}

interface Point {
    x: number;
    y: number;
}

interface GameItem {
    id: number;
    pos: Point;
    slug: string;
    collected: boolean;
    floatOffset: number;
}

export default function ExpeditionGame({ onComplete }: ExpeditionGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Game Constants
    const TILE_SIZE = 32;
    const MAP_WIDTH = 800;
    const MAP_HEIGHT = 600;
    const PLAYER_SPEED = 4;
    const ITEM_RADIUS = 20;

    // State Refs (for loop performance)
    const playerPos = useRef<Point>({ x: 400, y: 300 });
    const keys = useRef<Record<string, boolean>>({});
    const items = useRef<GameItem[]>([]);
    const frameId = useRef<number>(0);

    // Assets
    const playerSprite = useRef<HTMLImageElement | null>(null);
    const mapSprite = useRef<HTMLImageElement | null>(null);
    const itemSprite = useRef<HTMLImageElement | null>(null); // We might just draw colored circles fallback or load generic chest

    // Initialize Game
    useEffect(() => {
        // Load Assets
        const pImg = new Image();
        pImg.src = "/assets/player_sprite.png";
        playerSprite.current = pImg;

        const mImg = new Image();
        mImg.src = "/assets/map_depths.png";
        mapSprite.current = mImg;

        // Spawn Items
        const newItems: GameItem[] = [];
        const allSlugs = Object.values(masterCollection).flat() as string[];

        for (let i = 0; i < 5; i++) {
            // Pick random item (weighted common)
            const randomSlug = allSlugs[Math.floor(Math.random() * allSlugs.length)];

            newItems.push({
                id: i,
                pos: {
                    x: 50 + Math.random() * (MAP_WIDTH - 100),
                    y: 50 + Math.random() * (MAP_HEIGHT - 100)
                },
                slug: randomSlug,
                collected: false,
                floatOffset: Math.random() * Math.PI * 2
            });
        }
        items.current = newItems;

        // Inputs
        const handleDown = (e: KeyboardEvent) => keys.current[e.code] = true;
        const handleUp = (e: KeyboardEvent) => keys.current[e.code] = false;
        window.addEventListener("keydown", handleDown);
        window.addEventListener("keyup", handleUp);

        // Game Loop
        const loop = () => {
            update();
            draw();
            frameId.current = requestAnimationFrame(loop);
        };
        frameId.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("keydown", handleDown);
            window.removeEventListener("keyup", handleUp);
            cancelAnimationFrame(frameId.current);
        };
    }, []);

    const update = () => {
        if (gameOver) return;

        // Movement
        let dx = 0;
        let dy = 0;
        if (keys.current['KeyW'] || keys.current['ArrowUp']) dy -= PLAYER_SPEED;
        if (keys.current['KeyS'] || keys.current['ArrowDown']) dy += PLAYER_SPEED;
        if (keys.current['KeyA'] || keys.current['ArrowLeft']) dx -= PLAYER_SPEED;
        if (keys.current['KeyD'] || keys.current['ArrowRight']) dx += PLAYER_SPEED;

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Apply Position & Bounds
        playerPos.current.x = Math.max(16, Math.min(MAP_WIDTH - 16, playerPos.current.x + dx));
        playerPos.current.y = Math.max(16, Math.min(MAP_HEIGHT - 16, playerPos.current.y + dy));

        // Collision Check
        let collectedCount = 0;
        items.current.forEach(item => {
            if (item.collected) {
                collectedCount++;
                return;
            }

            // Simple distance check
            const dist = Math.hypot(playerPos.current.x - item.pos.x, playerPos.current.y - item.pos.y);
            if (dist < 30) {
                item.collected = true;
                setScore(prev => prev + 1);
            }
        });

        // Win Condition
        if (collectedCount === 5) {
            setGameOver(true);
            setTimeout(() => {
                onComplete(items.current.map(i => i.slug));
            }, 500);
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

        // Draw Map Pattern
        if (mapSprite.current && mapSprite.current.complete) {
            const pattern = ctx.createPattern(mapSprite.current, 'repeat');
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
            }
        }

        // Draw Player Shadow
        ctx.beginPath();
        ctx.ellipse(playerPos.current.x, playerPos.current.y + 12, 12, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        // Draw Player Sprite
        if (playerSprite.current && playerSprite.current.complete) {
            // Draw centered
            ctx.drawImage(playerSprite.current, playerPos.current.x - 16, playerPos.current.y - 16, 32, 32);
        } else {
            // Fallback
            ctx.fillStyle = "cyan";
            ctx.fillRect(playerPos.current.x - 10, playerPos.current.y - 10, 20, 20);
        }

        // Draw Items
        const time = Date.now() / 500;
        items.current.forEach(item => {
            if (item.collected) return;

            const bob = Math.sin(time + item.floatOffset) * 5;
            const itemY = item.pos.y + bob;

            // Rarity Color
            const rarity = getRarity(item.slug);

            ctx.save();
            ctx.shadowColor = rarity.hex;
            ctx.shadowBlur = 10;
            ctx.fillStyle = rarity.hex;

            // Draw simple gem shape for now
            ctx.beginPath();
            ctx.moveTo(item.pos.x, itemY - 10);
            ctx.lineTo(item.pos.x + 8, itemY);
            ctx.lineTo(item.pos.x, itemY + 10);
            ctx.lineTo(item.pos.x - 8, itemY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        // Overlay UI
        ctx.font = "20px monospace";
        ctx.fillStyle = "white";
        ctx.fillText(`LOOT: ${score}/5`, 20, 30);
    };

    // Mobile Controls Handlers (Simple)
    const handleTouchMove = (dx: number, dy: number) => {
        keys.current['KeyW'] = dy < 0;
        keys.current['KeyS'] = dy > 0;
        keys.current['KeyA'] = dx < 0;
        keys.current['KeyD'] = dx > 0;
    };

    const handleTouchEnd = () => {
        keys.current['KeyW'] = false;
        keys.current['KeyS'] = false;
        keys.current['KeyA'] = false;
        keys.current['KeyD'] = false;
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
            <canvas
                ref={canvasRef}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                className="max-w-full max-h-full object-contain border border-slate-700 bg-[#111]"
            />

            {/* Mobile Controls Overlay */}
            <div className="absolute bottom-10 left-10 md:hidden grid grid-cols-3 gap-2 opacity-80">
                <div />
                <button
                    className="w-16 h-16 bg-slate-800/80 rounded-full border border-slate-600 active:bg-indigo-500"
                    onTouchStart={() => handleTouchMove(0, -1)} onTouchEnd={handleTouchEnd}
                >▲</button>
                <div />
                <button
                    className="w-16 h-16 bg-slate-800/80 rounded-full border border-slate-600 active:bg-indigo-500"
                    onTouchStart={() => handleTouchMove(-1, 0)} onTouchEnd={handleTouchEnd}
                >◀</button>
                <button
                    className="w-16 h-16 bg-slate-800/80 rounded-full border border-slate-600 active:bg-indigo-500"
                    onTouchStart={() => handleTouchMove(0, 1)} onTouchEnd={handleTouchEnd}
                >▼</button>
                <button
                    className="w-16 h-16 bg-slate-800/80 rounded-full border border-slate-600 active:bg-indigo-500"
                    onTouchStart={() => handleTouchMove(1, 0)} onTouchEnd={handleTouchEnd}
                >▶</button>
            </div>

            {/* Hint */}
            <div className="absolute top-4 right-4 text-xs text-slate-500 font-mono hidden md:block">
                WASD to Move
            </div>
        </div>
    );
}
