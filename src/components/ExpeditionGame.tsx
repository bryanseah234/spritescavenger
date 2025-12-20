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

interface Obstacle {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
}

export default function ExpeditionGame({ onComplete, biomeId }: ExpeditionGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const dimensionsRef = useRef(dimensions);

    // Refs to avoid stale closures in game loop
    const isLoadingRef = useRef(true);
    const gameOverRef = useRef(false);

    // Keep refs in sync with state (for game loop to read current values)
    useEffect(() => {
        dimensionsRef.current = dimensions;
    }, [dimensions]);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    useEffect(() => {
        gameOverRef.current = gameOver;
    }, [gameOver]);

    // Game Constants
    const SCALE = 3;
    const WORLD_SIZE = 3000;

    // Physics Constants
    const PLAYER_SPEED = 5 * SCALE;
    const PLAYER_RADIUS = 12 * SCALE; // Hitbox radius
    const TOUCH_DIST = 40 * SCALE;

    // State Refs
    const playerPos = useRef<Point>({ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 });
    const camera = useRef<Point>({ x: 0, y: 0 });
    const facing = useRef<1 | -1>(1);

    const keys = useRef<Record<string, boolean>>({});
    const items = useRef<GameItem[]>([]);
    const obstacles = useRef<Obstacle[]>([]);
    const frameId = useRef<number>(0);

    // Assets
    const playerSprite = useRef<HTMLCanvasElement | null>(null);
    // Remove raw map image ref, strictly use pattern
    const mapPattern = useRef<CanvasPattern | null>(null);

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
            // Black -> Transparent
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
        // Reset State
        setIsLoading(true);
        setGameOver(false);

        // Assets Loading
        let assetsLoaded = 0;
        const totalAssets = 2;

        const checkLoaded = () => {
            assetsLoaded++;
            if (assetsLoaded === totalAssets) {
                setIsLoading(false);
            }
        };

        // 1. Player Sprite
        const pImg = new Image();
        pImg.src = "/assets/player_sprite.png";
        pImg.onload = () => {
            playerSprite.current = processSprite(pImg);
            checkLoaded();
        };

        // 2. Map Sprite -> Pattern
        const mImg = new Image();
        mImg.src = `/assets/map_gravel.png`;
        mImg.onload = () => {
            // Create pattern once here
            const tempCanvas = document.createElement('canvas');
            const tCtx = tempCanvas.getContext('2d');
            if (tCtx) {
                const pattern = tCtx.createPattern(mImg, 'repeat');
                mapPattern.current = pattern;
            }
            checkLoaded();
        };

        // Spawn Items
        const newItems: GameItem[] = [];
        const allSlugs = Object.values(masterCollection).flat() as string[];

        for (let i = 0; i < 5; i++) {
            newItems.push({
                id: i,
                pos: {
                    x: 200 + Math.random() * (WORLD_SIZE - 400),
                    y: 200 + Math.random() * (WORLD_SIZE - 400)
                },
                slug: allSlugs[Math.floor(Math.random() * allSlugs.length)],
                collected: false,
                floatOffset: Math.random() * Math.PI * 2
            });
        }
        items.current = newItems;

        // Spawn Obstacles (Pillars/Trunks)
        const obs: Obstacle[] = [];
        const COLORS = ["#8b5cf6", "#10b981", "#6366f1"]; // Purple, Green, Indigo

        for (let i = 0; i < 60; i++) {
            // Random rects
            const w = (20 + Math.random() * 40) * SCALE;
            const h = (40 + Math.random() * 80) * SCALE;
            obs.push({
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
                w,
                h,
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
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

        // Loop - use refs to get current state values (avoids stale closures)
        const loop = () => {
            if (!isLoadingRef.current) {
                update();
                draw();
            }
            frameId.current = requestAnimationFrame(loop);
        };
        frameId.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("keydown", handleDown);
            window.removeEventListener("keyup", handleUp);
            cancelAnimationFrame(frameId.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [biomeId]); // Restart heavily on biome change is fine

    const update = () => {
        if (gameOverRef.current || isLoadingRef.current) return;

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

        // Obstacle Collision (Circle vs AABB)
        // Player is approx a circle at feet
        const pRadius = PLAYER_RADIUS;

        const hitObstacle = obstacles.current.some(obs => {
            // Find closest point on rect to circle center
            const closestX = Math.max(obs.x, Math.min(nextX, obs.x + obs.w));
            const closestY = Math.max(obs.y, Math.min(nextY, obs.y + obs.h)); // use 'y' as top? usually y is top-left in canvas

            const distanceX = nextX - closestX;
            const distanceY = nextY - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

            return distanceSquared < (pRadius * pRadius);
        });

        if (!hitObstacle) {
            playerPos.current.x = nextX;
            playerPos.current.y = nextY;
        }

        // Update Camera
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
                // Score removed (unused)
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

        // Clear Background
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, viewW, viewH);

        ctx.save();
        // Shift world
        ctx.translate(-cam.x, -cam.y);

        // Draw Map Pattern (Cached)
        if (mapPattern.current) {
            ctx.fillStyle = mapPattern.current;
            ctx.save();
            ctx.scale(SCALE, SCALE);
            ctx.fillRect(cam.x / SCALE, cam.y / SCALE, viewW / SCALE, viewH / SCALE);
            ctx.restore();
        }

        // Draw Obstacles (Pillars) - Single pass for performance
        for (let i = 0; i < obstacles.current.length; i++) {
            const obs = obstacles.current[i];
            // Culling - skip if off-screen
            if (obs.x + obs.w < cam.x || obs.x > cam.x + viewW ||
                obs.y + obs.h < cam.y || obs.y > cam.y + viewH) continue;

            // Shadow
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(obs.x + 10, obs.y + obs.h - 10, obs.w, 10);

            // Body
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

            // Top highlight
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(obs.x, obs.y, obs.w, 4);

            // Side shadow
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(obs.x + obs.w - 4, obs.y, 4, obs.h);
        }

        // Draw Items - Optimized: simple circle glow instead of radial gradient
        const time = Date.now() / 500;
        for (let i = 0; i < items.current.length; i++) {
            const item = items.current[i];
            if (item.collected) continue;
            // Culling
            if (item.pos.x < cam.x - 100 || item.pos.x > cam.x + viewW + 100 ||
                item.pos.y < cam.y - 100 || item.pos.y > cam.y + viewH + 100) continue;

            const bob = Math.sin(time + item.floatOffset) * 10;
            const itemY = item.pos.y + bob;
            const rarity = getRarity(item.slug);

            // Simple glow circle (faster than radial gradient per frame)
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = rarity.hex;
            ctx.beginPath();
            ctx.arc(item.pos.x, itemY, 45, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Diamond
            ctx.fillStyle = rarity.hex;
            const S = SCALE * 0.8;
            ctx.beginPath();
            ctx.moveTo(item.pos.x, itemY - (15 * S));
            ctx.lineTo(item.pos.x + (12 * S), itemY);
            ctx.lineTo(item.pos.x, itemY + (15 * S));
            ctx.lineTo(item.pos.x - (12 * S), itemY);
            ctx.closePath();
            ctx.fill();
        }

        // Draw Player
        ctx.save();
        ctx.translate(playerPos.current.x, playerPos.current.y);

        // Shadow
        ctx.beginPath();
        ctx.ellipse(0, 12 * SCALE, 12 * SCALE, 6 * SCALE, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        ctx.scale(facing.current, 1);

        if (playerSprite.current) {
            ctx.drawImage(
                playerSprite.current,
                -16 * SCALE,
                -16 * SCALE,
                32 * SCALE, 32 * SCALE
            );
        } else {
            ctx.fillStyle = "cyan";
            ctx.fillRect(-10, -20, 20, 40);
        }
        ctx.restore();

        ctx.restore(); // End Camera transform

        // --- HUD / OVERLAYS ---

        // Compass Arrow
        // Find nearest item
        let nearestDist = Infinity;
        let targetItem = null;
        for (const item of items.current) {
            if (!item.collected) {
                const dist = Math.hypot(item.pos.x - playerPos.current.x, item.pos.y - playerPos.current.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    targetItem = item;
                }
            }
        }

        if (targetItem) {
            // Check if off-screen
            // If item is within camera view, maybe don't show arrow? 
            // Or always show it to be helpful. User asked for arrow overlay at edge.

            const dx = targetItem.pos.x - playerPos.current.x;
            const dy = targetItem.pos.y - playerPos.current.y;
            const angle = Math.atan2(dy, dx);

            const cx = viewW / 2;
            const cy = viewH / 2;

            // Calculate edge position (Ellipse or Box projection)
            // Lets do an ellipse slightly smaller than screen
            const padding = 60;
            const rx = (viewW / 2) - padding;
            const ry = (viewH / 2) - padding;

            // Simple projection
            const px = cx + rx * Math.cos(angle);
            const py = cy + ry * Math.sin(angle);

            // Draw Arrow
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(10, 0);   // Tip
            ctx.lineTo(-10, 10); // Back Right
            ctx.lineTo(-10, -10); // Back Left
            ctx.closePath();

            ctx.fillStyle = "#10b981"; // Bright Green
            ctx.shadowColor = "#10b981";
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
        }
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
            {isLoading && (
                <div className="absolute inset-0 bg-black z-50 flex items-center justify-center flex-col gap-4">
                    <div className="text-emerald-500 font-mono text-xl animate-pulse">DEPLOYING DRONE...</div>
                    <div className="w-32 h-1 bg-green-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[width_1s_ease-out_infinite]" style={{ width: '50%' }} />
                    </div>
                </div>
            )}

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
                WASD | Follow Arrow
            </div>
        </div>
    );
}
