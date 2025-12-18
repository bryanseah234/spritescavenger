import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Hash, ArrowRight, Database, Hammer, Cpu, Map } from "lucide-react";
import { useGame } from "@/context/GameContext";
import masterCollection from "@/data/master-collection.json";
import { getRarity } from "@/utils/rarity";

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (tab: string) => void;
}

// Define Item Interface
interface PaletteItem {
    id: string;
    label: string;
    type: 'NAV' | 'ITEM';
    value: string;
    icon: React.ElementType;
    isOwned?: boolean;
    rarity?: { name: string; hex: string; value: number };
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
    const { inventory } = useGame();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // --- Search Logic ---
    // 1. Navigation Commands
    const navCommands: PaletteItem[] = [
        { id: 'nav-map', label: 'Go to Map', type: 'NAV', value: 'map', icon: Map },
        { id: 'nav-lab', label: 'Go to Lab', type: 'NAV', value: 'lab', icon: Cpu },
        { id: 'nav-forge', label: 'Go to Forge', type: 'NAV', value: 'forge', icon: Hammer },
        { id: 'nav-db', label: 'Go to Database', type: 'NAV', value: 'database', icon: Database },
    ];

    // 2. Item Search
    // Flatten master collection
    const allItems: PaletteItem[] = Object.entries(masterCollection).flatMap(([cat, slugs]) =>
        (slugs as string[]).map(slug => ({
            id: slug,
            label: slug.split('-').pop() || slug,
            type: 'ITEM',
            value: slug,
            cat,
            icon: Hash,
            isOwned: inventory.includes(slug),
            rarity: getRarity(slug)
        }))
    );

    // Filter
    const results = [
        ...navCommands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())),
        ...allItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()) || i.value.toLowerCase().includes(query.toLowerCase()))
    ].slice(0, 10); // Limit to 10

    const handleSelect = useCallback((item: PaletteItem) => {
        if (item.type === 'NAV') {
            onNavigate(item.value);
        } else if (item.type === 'ITEM') {
            onNavigate('database');
        }
        onClose();
    }, [onNavigate, onClose]);

    // Handle Closing and Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "Escape") {
                onClose();
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            }
            if (e.key === "Enter") {
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, results, selectedIndex, onClose, onNavigate, handleSelect]); // We include dependencies here

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
                <div className="flex items-center gap-3 p-4 border-b border-slate-800">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 flex-1 font-mono text-sm"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <div className="flex gap-1">
                        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 font-sans">ESC</kbd>
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto p-2">
                    {results.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-xs font-mono">No results found.</div>
                    ) : (
                        results.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className={`
                                    w-full text-left px-3 py-2 rounded flex items-center justify-between group
                                    ${index === selectedIndex ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800/50'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-4 h-4 ${index === selectedIndex ? 'text-indigo-400' : 'text-slate-600'}`} />
                                    <span className={`text-sm ${item.type === 'ITEM' && 'font-mono'}`}>
                                        {item.label}
                                    </span>
                                </div>

                                {item.type === 'ITEM' && (
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-950"
                                            style={{ color: item.rarity?.hex }}
                                        >
                                            {item.rarity?.name}
                                        </span>
                                        {item.isOwned ? (
                                            <span className="text-[10px] text-emerald-500">OWNED</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-600">LOCKED</span>
                                        )}
                                    </div>
                                )}
                                {item.type === 'NAV' && (
                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
