"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SettingsView from "@/views/SettingsView";
import { useGame } from "@/context/GameContext";
import ExpeditionView from "@/views/ExpeditionView";
import CollectionView from "@/views/CollectionView";
import ForgeView from "@/views/ForgeView";
import LabView from "@/views/LabView";
import CommandPalette from "@/components/CommandPalette";
import { Terminal, Cpu, Hammer, Database, Settings } from "lucide-react";

interface GameInterfaceProps {
    currentTab: string;
}

export default function GameInterface({ currentTab }: GameInterfaceProps) {
    const { isLoading } = useGame();
    const router = useRouter();

    const [commandOpen, setCommandOpen] = useState(false);
    // Removed strict mounted check to avoid flash on navigation since Provider persists.
    // However, for consistency with hydration, we might want it.
    // If we use 'use client', we are safe from hydration mismatch if we render same on server?
    // Start with mounted check for safety if needed, but 'isLoading' from context is usually enough.

    // Keyboard Shortcuts
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Toggle Command Palette: Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCommandOpen(prev => !prev);
            }

            // Close on Escape
            if (e.key === 'Escape') {
                if (commandOpen) setCommandOpen(false);
            }

            // Ignore other shortcuts if inputs or modals are open
            if (commandOpen) return;

            // Tab Switching
            if (e.key === '1') router.push('/terminal');
            if (e.key === '2') router.push('/lab');
            if (e.key === '3') router.push('/forge');
            if (e.key === '4') router.push('/database');
            if (e.key === '5') router.push('/settings');
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [commandOpen, router]);

    const handleNav = (tab?: string) => {
        if (tab) {
            // Map generic tab names to routes if needed, but they match 1:1 currently
            router.push(`/${tab}`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <span className="text-emerald-500 font-mono animate-pulse">INITIALIZING SYSTEM...</span>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 pt-20 pb-0 overflow-x-hidden">
            <Header
                onSettingsClick={(t) => handleNav(t)}
                onOpenPalette={() => setCommandOpen(true)}
                activeTab={currentTab}
            />

            <div className="w-full">
                {currentTab === 'terminal' && <ExpeditionView />}
                {currentTab === 'lab' && <LabView />}
                {currentTab === 'forge' && <ForgeView />}
                {currentTab === 'database' && <CollectionView />}
                {currentTab === 'settings' && <SettingsView />}
            </div>

            <CommandPalette
                isOpen={commandOpen}
                onClose={() => setCommandOpen(false)}
                onNavigate={(tab) => {
                    handleNav(tab);
                }}
            />

            {/* Mobile Nav Bar - Fixed Bottom */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 flex justify-around z-50 pb-safe">
                <button
                    onClick={() => router.push('/terminal')}
                    className={`flex flex-col items-center p-2 rounded w-16 ${currentTab === 'terminal' ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                    <Terminal className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">TERM</span>
                </button>
                <button
                    onClick={() => router.push('/lab')}
                    className={`flex flex-col items-center p-2 rounded w-16 ${currentTab === 'lab' ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                    <Cpu className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">LAB</span>
                </button>
                <button
                    onClick={() => router.push('/forge')}
                    className={`flex flex-col items-center p-2 rounded w-16 ${currentTab === 'forge' ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                    <Hammer className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">FORGE</span>
                </button>
                <button
                    onClick={() => router.push('/database')}
                    className={`flex flex-col items-center p-2 rounded w-16 ${currentTab === 'database' ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                    <Database className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">DB</span>
                </button>
                <button
                    onClick={() => router.push('/settings')}
                    className={`flex flex-col items-center p-2 rounded w-16 ${currentTab === 'settings' ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                    <Settings className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">SYS</span>
                </button>
            </div>
        </main>
    );
}
