"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SettingsModal from "@/components/SettingsModal";
import { useGame } from "@/context/GameContext";
import ExpeditionView from "@/views/ExpeditionView";
import CollectionView from "@/views/CollectionView";
import ForgeView from "@/views/ForgeView";

export default function Home() {
  const { isLoading } = useGame();

  const [activeTab, setActiveTab] = useState('explore');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNav = (tab?: string) => {
    if (tab === 'settings') {
      setSettingsOpen(true);
    } else if (tab) {
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
      <Header onSettingsClick={handleNav} activeTab={activeTab} />

      <div className="w-full">
        {activeTab === 'explore' && <ExpeditionView />}
        {activeTab === 'collection' && <CollectionView />}
        {activeTab === 'forge' && <ForgeView />}
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Mobile Nav Bar - Fixed Bottom (Optional enhancement for Mobile First) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 flex justify-around z-50 pb-safe">
        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center p-2 rounded ${activeTab === 'explore' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <span className="text-[10px] font-bold">EXPLORE</span>
        </button>
        <button
          onClick={() => setActiveTab('collection')}
          className={`flex flex-col items-center p-2 rounded ${activeTab === 'collection' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <span className="text-[10px] font-bold">COLLECTION</span>
        </button>
        <button
          onClick={() => setActiveTab('forge')}
          className={`flex flex-col items-center p-2 rounded ${activeTab === 'forge' ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <span className="text-[10px] font-bold">FORGE</span>
        </button>
      </div>
    </main>
  );
}
