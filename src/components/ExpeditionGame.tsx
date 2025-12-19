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
    const dimensionsRef = useRef(dimensions);

    // Update Ref
    useEffect(() => {
        dimensionsRef.current = dimensions;
    }, [dimensions]);

    // Game Constants
    const SCALE = 3;
    const PLAYER_SIZE = 32 * SCALE;
    const WORLD_SIZE = 3000; // Large world

    // Physics Constants
    const PLAYER_SPEED = 5 * SCALE;
    const TOUCH_DIST = 40 * SCALE; // Picking range

    // State Refs
    const playerPos = useRef<Point>({ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 });
    const camera = useRef<Point>({ x: 0, y: 0 });
    const facing = useRef<1 | -1>(1); // 1 = Right, -1 = Left

    const keys = useRef<Record<string, boolean>>({});
    const items = useRef<GameItem[]>([]);
    const obstacles = useRef<Point[]>([]);
    const frameId = useRef<number>(0);

    // Assets
    const playerSprite = useRef<HTMLCanvasElement | null>(null);
    const mapSprite = useRef<HTMLImageElement | null>(null);

    // Helper: Chroma Key
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
            // Black (0,0,0) -> Transparent
            if (r < 10 && g < 10 && b < 10) data[i + 3] = 0;
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
        // Assets
        const pImg = new Image();
        pImg.src = "/assets/player_sprite.png";
        pImg.onload = () => { playerSprite.current = processSprite(pImg); };

        const mImg = new Image();
        // Use new clean gravel map
        mImg.src = `/assets/map_gravel.png`;
        mapSprite.current = mImg;

        // Spawn Items
        const newItems: GameItem[] = [];
        const allSlugs = Object.values(masterCollection).flat() as string[];

        for (let i = 0; i < 5; i++) {
            newItems.push({
                id: i,
                pos: {
                    x: Math.random() * WORLD_SIZE,
                    y: Math.random() * WORLD_SIZE
                },
                slug: allSlugs[Math.floor(Math.random() * allSlugs.length)],
                collected: false,
                floatOffset: Math.random() * Math.PI * 2
            });
        }
        items.current = newItems;

        // Spawn Obstacles (Rocks)
        const obs: Point[] = [];
        for (let i = 0; i < 150; i++) {
            obs.push({
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE
            });
        }
        obstacles.current = obs;

        // Reset Player
        playerPos.current = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };

        // Inputs
        const handleDown = (e: KeyboardEvent) => keys.current[e.code] = true;
        const handleUp = (e: KeyboardEvent) => keys.current[e.code] = false;
        window.addEventListener("keydown", handleDown);
        window.addEventListener("keyup", handleUp);

        // Loop
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
    }, [biomeId]);

    const update = () => {
        if (gameOver) return;

        // Movement Input
        let dx = 0;
        let dy = 0;
        if (keys.current['KeyW'] || keys.current['ArrowUp']) dy -= PLAYER_SPEED;
        if (keys.current['KeyS'] || keys.current['ArrowDown']) dy += PLAYER_SPEED;
        if (keys.current['KeyA'] || keys.current['ArrowLeft']) dx -= PLAYER_SPEED;
        if (keys.current['KeyD'] || keys.current['ArrowRight']) dx += PLAYER_SPEED;

        // Normalize
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Facing Direction (Flip)
        if (dx > 0) facing.current = 1;
        if (dx < 0) facing.current = -1;

        // Proposed New Position
        const nextX = Math.max(0, Math.min(WORLD_SIZE, playerPos.current.x + dx));
        const nextY = Math.max(0, Math.min(WORLD_SIZE, playerPos.current.y + dy));

        // Obstacle Collision
        const hitObstacle = obstacles.current.some(obs => {
            const dist = Math.hypot(nextX - obs.x, nextY - obs.y);
            return dist < (30 * SCALE); // Basic circle collision
        });

        if (!hitObstacle) {
            playerPos.current.x = nextX;
            playerPos.current.y = nextY;
        }

        // Update Camera to center player
        const viewW = dimensionsRef.current.width;
        const viewH = dimensionsRef.current.height;
        camera.current.x = playerPos.current.x - viewW / 2;
        camera.current.y = playerPos.current.y - viewH / 2;

        // Item Collection
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

        const viewW = dimensionsRef.current.width;
        const viewH = dimensionsRef.current.height;
        const cam = camera.current;

        ctx.imageSmoothingEnabled = false;

        // Clear Background (Fill with dark color incase map missing)
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, viewW, viewH);

        ctx.save();
        // Shift entire world by camera
        ctx.translate(-cam.x, -cam.y);

        // Draw Map Pattern (Tiled)
        if (mapSprite.current && mapSprite.current.complete) {
            const ptrn = ctx.createPattern(mapSprite.current, 'repeat');
            if (ptrn) {
                ctx.fillStyle = ptrn;
                ctx.save();
                // We need to scale the PATTERN, not the rect
                ctx.scale(SCALE, SCALE);
                // Inverse scale coords
                ctx.fillRect(cam.x / SCALE, cam.y / SCALE, viewW / SCALE, viewH / SCALE);
                ctx.restore();
            }
        }

        // Draw Obstacles
        ctx.fillStyle = "#2d2d2d"; // Dark grey rocks
        obstacles.current.forEach(obs => {
            // Cull off-screen
            if (obs.x < cam.x - 100 || obs.x > cam.x + viewW + 100 ||
                obs.y < cam.y - 100 || obs.y > cam.y + viewH + 100) return;

            ctx.beginPath();
            ctx.arc(obs.x, obs.y, 20 * SCALE, 0, Math.PI * 2);
            ctx.fill();
            // Highlight
            ctx.fillStyle = "#3d3d3d";
            ctx.beginPath();
            ctx.arc(obs.x - 5, obs.y - 5, 10 * SCALE, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#2d2d2d"; // Reset
        });

        // Draw Items (Shadow + Gem)
        const time = Date.now() / 500;
        items.current.forEach(item => {
            if (item.collected) return;
            // Culling
            if (item.pos.x < cam.x - 100 || item.pos.x > cam.x + viewW + 100 ||
                item.pos.y < cam.y - 100 || item.pos.y > cam.y + viewH + 100) return;

            const bob = Math.sin(time + item.floatOffset) * 10;
            const itemY = item.pos.y + bob;
            const rarity = getRarity(item.slug);

            // Glow
            ctx.save();
            ctx.shadowColor = rarity.hex;
            ctx.shadowBlur = 20;
            ctx.fillStyle = rarity.hex;

            // Diamond Shape
            const S = SCALE * 0.8;
            ctx.beginPath();
            ctx.moveTo(item.pos.x, itemY - (15 * S));
            ctx.lineTo(item.pos.x + (12 * S), itemY);
            ctx.lineTo(item.pos.x, itemY + (15 * S));
            ctx.lineTo(item.pos.x - (12 * S), itemY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        // Draw Player
        ctx.save();
        ctx.translate(playerPos.current.x, playerPos.current.y);

        // Shadow
        ctx.beginPath();
        ctx.ellipse(0, 12 * SCALE, 12 * SCALE, 6 * SCALE, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        // Sprite Flip Logic
        ctx.scale(facing.current, 1);

        if (playerSprite.current) {
            // Draw centered
            ctx.drawImage(
                playerSprite.current,
                -16 * SCALE, // Centered X
                -16 * SCALE, // Centered Y
                32 * SCALE, 32 * SCALE
            );
        } else {
            // Fallback
            ctx.fillStyle = "cyan";
            ctx.fillRect(-10, -20, 20, 40);
        }
        ctx.restore(); // Restore Translation/Scale

        ctx.restore(); // Restore Camera

        // Overlay UI (Removed Loot Text per request)
    };

    // Mobile Control Adapters
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
            <div className="absolute top-4 right-4 text-xs text-slate-500 font-mono hidden md:block opacity-50">
                WASD | Explore
            </div>
        </div>
    );
}
