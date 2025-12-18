"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SettingsView from "@/views/SettingsView";
import CommandPalette from "@/components/CommandPalette";
import { Terminal, Cpu, Hammer, Database, Settings } from "lucide-react";

export default function Home() {
  const { isLoading } = useGame();

  const [activeTab, setActiveTab] = useState('terminal');
  const [commandOpen, setCommandOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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
      if (e.key === '1') setActiveTab('terminal');
      if (e.key === '2') setActiveTab('lab');
      if (e.key === '3') setActiveTab('forge');
      if (e.key === '4') setActiveTab('database');
      if (e.key === '5') setActiveTab('settings');
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [commandOpen]);

  const handleNav = (tab?: string) => {
    if (tab) {
      setActiveTab(tab);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-emerald-500 font-mono animate-pulse">INITIALIZING SYSTEM...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pt-20 pb-0 overflow-x-hidden">
      <Header
        onSettingsClick={handleNav}
        onOpenPalette={() => setCommandOpen(true)}
        activeTab={activeTab}
      />

      <div className="w-full">
        {activeTab === 'terminal' && <ExpeditionView />}
        {activeTab === 'lab' && <LabView />}
        {activeTab === 'forge' && <ForgeView />}
        {activeTab === 'database' && <CollectionView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* Mobile Nav Bar - Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 flex justify-around z-50 pb-safe">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex flex-col items-center p-2 rounded w-16 ${activeTab === 'terminal' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Terminal className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold">TERM</span>
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`flex flex-col items-center p-2 rounded w-16 ${activeTab === 'lab' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Cpu className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold">LAB</span>
        </button>
        <button
          onClick={() => setActiveTab('forge')}
          className={`flex flex-col items-center p-2 rounded w-16 ${activeTab === 'forge' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Hammer className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold">FORGE</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex flex-col items-center p-2 rounded w-16 ${activeTab === 'database' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Database className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold">DB</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center p-2 rounded w-16 ${activeTab === 'settings' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-bold">SYS</span>
        </button>
      </div>
    </main>
  );
}
