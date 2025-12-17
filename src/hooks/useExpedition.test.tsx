import { renderHook, act } from "@testing-library/react";
import { useExpedition } from "@/hooks/useExpedition";
import { GameProvider } from "@/context/GameContext";
import { describe, it, expect, vi, beforeEach } from "vitest";

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GameProvider>{children}</GameProvider>
);

describe("useExpedition", () => {
    beforeEach(() => {
        vi.useFakeTimers();

        // Mock localStorage
        const store: Record<string, string> = {};
        const localStorageMock = {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => {
                store[key] = value.toString();
            },
            clear: () => {
                for (const key in store) delete store[key];
            },
            removeItem: (key: string) => {
                delete store[key];
            }
        };
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
            writable: true
        });

        window.localStorage.clear();
    });

    it("should initialize with default state", () => {
        const { result } = renderHook(() => useExpedition(), { wrapper });
        expect(result.current.timeLeft).toBe(0);
        expect(result.current.isActive).toBe(false);
        expect(result.current.loot).toBeNull();
    });

    it("should start expedition and count down", async () => {
        const { result } = renderHook(() => useExpedition(), { wrapper });

        act(() => {
            result.current.start();
        });

        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        expect(result.current.isActive).toBe(true);

        // Advance time by 1 second
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.timeLeft).toBeLessThanOrEqual(30);
        expect(result.current.timeLeft).toBeGreaterThan(0);
    });

    it("should finish expedition and generate loot", async () => {
        const { result } = renderHook(() => useExpedition(), { wrapper });

        act(() => {
            result.current.start();
        });

        await act(async () => {
            vi.advanceTimersByTime(31000);
        });

        expect(result.current.timeLeft).toBe(0);
        expect(result.current.isFinished).toBe(true);
        expect(result.current.isActive).toBe(false);
        expect(result.current.loot).not.toBeNull();
        expect(result.current.loot?.length).toBeGreaterThanOrEqual(3);
    });
});
