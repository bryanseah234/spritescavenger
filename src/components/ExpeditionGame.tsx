"use client";

import { useEffect, useRef, useState } from "react";
import masterCollection from "@/data/master-collection.json";
import { getRarity } from "@/utils/rarity";

interface ExpeditionGameProps {
    onComplete: (loot: string[]) => void;
    biomeId: string;
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

export default function ExpeditionGame({ onComplete, biomeId }: ExpeditionGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const dimensionsRef = useRef(dimensions); // Ref to track dimensions in loop

    // Update Ref when State changes
    useEffect(() => {
        dimensionsRef.current = dimensions;
    }, [dimensions]);

    // Game Constants
    const SCALE = 3; // Scale up for visibility
    const TILE_SIZE = 32 * SCALE;
    const PLAYER_SIZE = 32 * SCALE;

    // Physics Constants
    const PLAYER_SPEED = 4 * SCALE; // Speed needs to scale too
    const TOUCH_DIST = 30 * SCALE; // Hitbox scales

    // State Refs
    const playerPos = useRef<Point>({ x: 400, y: 300 });
    const keys = useRef<Record<string, boolean>>({});
    const items = useRef<GameItem[]>([]);
    const frameId = useRef<number>(0);

    // Assets
    const playerSprite = useRef<HTMLCanvasElement | null>(null); // Processed sprite is a canvas
    const mapSprite = useRef<HTMLImageElement | null>(null);

    // Helper: Remove Black Background (Chroma Key)
    const processSprite = (img: HTMLImageElement): HTMLCanvasElement => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        if (!ctx) return c;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, c.width, c.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // If pixel is black (allowing slight noise), make transparent
            if (r < 10 && g < 10 && b < 10) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return c;
    };

    // Responsive Canvas
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Initialize Game
    useEffect(() => {
        // Load Assets
        const pImg = new Image();
        pImg.src = "/assets/player_sprite.png";
        pImg.onload = () => {
            playerSprite.current = processSprite(pImg);
        };

        const mImg = new Image();
        const mapName = `map_${biomeId.toLowerCase()}`;
        mImg.src = `/assets/${mapName}.png`;
        mapSprite.current = mImg;

        // Spawn Items logic...
        const newItems: GameItem[] = [];
        const allSlugs = Object.values(masterCollection).flat() as string[];

        // Spawn based on current dimensions or default
        // Use ref for immediate access, though strictly items init matters less since it's one-time
        const w = dimensionsRef.current.width || 800;
        const h = dimensionsRef.current.height || 600;

        for (let i = 0; i < 5; i++) {
            const randomSlug = allSlugs[Math.floor(Math.random() * allSlugs.length)];
            newItems.push({
                id: i,
                pos: {
                    x: 50 + Math.random() * (w - 100),
                    y: 50 + Math.random() * (h - 100)
                },
                slug: randomSlug,
                collected: false,
                floatOffset: Math.random() * Math.PI * 2
            });
        }
        items.current = newItems;
        playerPos.current = { x: w / 2, y: h / 2 }; // Center player

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [biomeId]); // Only restart on biome change. Dimensions are tracked via ref.

    const update = () => {
        if (gameOver) return;

        // Movement
        let dx = 0;
        let dy = 0;
        if (keys.current['KeyW'] || keys.current['ArrowUp']) dy -= PLAYER_SPEED;
        if (keys.current['KeyS'] || keys.current['ArrowDown']) dy += PLAYER_SPEED;
        if (keys.current['KeyA'] || keys.current['ArrowLeft']) dx -= PLAYER_SPEED;
        if (keys.current['KeyD'] || keys.current['ArrowRight']) dx += PLAYER_SPEED;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        const W = dimensionsRef.current.width;
        const H = dimensionsRef.current.height;

        playerPos.current.x = Math.max(PLAYER_SIZE / 2, Math.min(W - PLAYER_SIZE / 2, playerPos.current.x + dx));
        playerPos.current.y = Math.max(PLAYER_SIZE / 2, Math.min(H - PLAYER_SIZE / 2, playerPos.current.y + dy));

        // Collision
        let collectedCount = 0;
        items.current.forEach(item => {
            if (item.collected) {
                collectedCount++;
                return;
            }
            const dist = Math.hypot(playerPos.current.x - item.pos.x, playerPos.current.y - item.pos.y);
            if (dist < TOUCH_DIST) {
                item.collected = true;
                setScore(prev => prev + 1);
            }
        });

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

        // Disable smoothing for pixel art
        ctx.imageSmoothingEnabled = false;

        // Clear
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, dimensionsRef.current.width, dimensionsRef.current.height);

        // Draw Map Pattern (Scaled)
        if (mapSprite.current && mapSprite.current.complete) {
            // To scale pattern, we need a scaled version or transform
            ctx.save();
            ctx.scale(SCALE, SCALE);
            const pattern = ctx.createPattern(mapSprite.current, 'repeat');
            if (pattern) {
                ctx.fillStyle = pattern;
                // Fill using coordinates relative to scale
                ctx.fillRect(0, 0, dimensionsRef.current.width / SCALE, dimensionsRef.current.height / SCALE);
            }
            ctx.restore();
        }

        // Draw Player (Scaled)
        // Shadow
        ctx.beginPath();
        ctx.ellipse(playerPos.current.x, playerPos.current.y + (12 * SCALE), 12 * SCALE, 6 * SCALE, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        if (playerSprite.current) {
            // Draw centered
            ctx.drawImage(
                playerSprite.current,
                playerPos.current.x - (16 * SCALE),
                playerPos.current.y - (16 * SCALE),
                32 * SCALE, 32 * SCALE
            );
        } else {
            ctx.fillStyle = "cyan";
            ctx.fillRect(playerPos.current.x - 10, playerPos.current.y - 10, 20, 20);
        }

        // Draw Items (Scaled)
        const time = Date.now() / 500;
        items.current.forEach(item => {
            if (item.collected) return;

            const bob = Math.sin(time + item.floatOffset) * 5;
            const itemY = item.pos.y + bob;

            const rarity = getRarity(item.slug);
            ctx.save();
            ctx.shadowColor = rarity.hex;
            ctx.shadowBlur = 15;
            ctx.fillStyle = rarity.hex;

            // Gem Size scaled
            const S = SCALE;
            ctx.beginPath();
            ctx.moveTo(item.pos.x, itemY - (10 * S));
            ctx.lineTo(item.pos.x + (8 * S), itemY);
            ctx.lineTo(item.pos.x, itemY + (10 * S));
            ctx.lineTo(item.pos.x - (8 * S), itemY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        // UI
        ctx.font = `bold ${20 * SCALE}px monospace`;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.strokeText(`LOOT: ${score}/5`, 20, 30 * SCALE);
        ctx.fillText(`LOOT: ${score}/5`, 20, 30 * SCALE);
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
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="block"
            />

            {/* Mobile Controls Overlay */}
            <div className="absolute bottom-10 left-10 md:hidden grid grid-cols-3 gap-2 opacity-80 z-10">
                <div />
                <button
                    className="w-16 h-16 bg-slate-800/80 rounded-full border border-slate-600 active:bg-indigo-500 text-white text-2xl"
                    onTouchStart={() => handleTouchMove(0, -1)} onTouchEnd={handleTouchEnd}
                >▲</button>
                <div />
                <button
                    className="w-16 h-16 bg-slate-800/80 rounded-full border border-slate-600 active:bg-indigo-500 text-white text-2xl"
                    onTouchStart={() => handleTouchMove(-1, 0)} onTouchEnd={handleTouchEnd}
                >◀</button>
                <button
                    className="w-16 h-16 bg-slate-800/80 rounded-full border border-slate-600 active:bg-indigo-500 text-white text-2xl"
                    onTouchStart={() => handleTouchMove(0, 1)} onTouchEnd={handleTouchEnd}
                >▼</button>
                <button
                    className="w-16 h-16 bg-slate-800/80 rounded-full border border-slate-600 active:bg-indigo-500 text-white text-2xl"
                    onTouchStart={() => handleTouchMove(1, 0)} onTouchEnd={handleTouchEnd}
                >▶</button>
            </div>

            <div className="absolute top-4 right-4 text-xs text-slate-500 font-mono hidden md:block">
                WASD to Move
            </div>
        </div>
    );
}
