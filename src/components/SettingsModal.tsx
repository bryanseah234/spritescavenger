import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { X, Save, Upload, Check, Copy, AlertTriangle } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { exportSave, importSave } = useGame();
    const [importString, setImportString] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);
    const [importError, setImportError] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        const saveString = exportSave();
        navigator.clipboard.writeText(saveString);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleImport = () => {
        setImportError(false);
        setImportSuccess(false);
        const success = importSave(importString);
        if (success) {
            setImportSuccess(true);
            setTimeout(() => {
                setImportSuccess(false);
                setImportString("");
                onClose();
            }, 1000);
        } else {
            setImportError(true);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>

                <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <Save className="w-5 h-5 text-slate-400" />
                    Save Management
                </h2>

                <div className="space-y-8">
                    {/* Export Section */}
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-slate-200 font-bold text-sm mb-2 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-emerald-500" />
                            Backup Progress (Export)
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Copy your save string to the clipboard. Paste it somewhere safe to load later.
                        </p>
                        <button
                            onClick={handleCopy}
                            className={`
                                w-full py-2 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all
                                ${copySuccess
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }
                            `}
                        >
                            {copySuccess ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Save String</>}
                        </button>
                    </div>

                    {/* Import Section */}
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-slate-200 font-bold text-sm mb-2 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-amber-500 rotate-180" />
                            Restore Progress (Import)
                        </h3>
                        <p className="text-xs text-amber-500/80 mb-4 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Warning: This will overwrite your current progress!
                        </p>
                        <textarea
                            value={importString}
                            onChange={(e) => setImportString(e.target.value)}
                            placeholder="Paste save string here..."
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-xs font-mono text-slate-300 h-24 mb-3 focus:outline-none focus:border-indigo-500"
                        />

                        {importError && <p className="text-xs text-red-400 mb-2">Invalid save string.</p>}

                        <button
                            onClick={handleImport}
                            disabled={!importString}
                            className={`
                                w-full py-2 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all
                                ${importSuccess
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                }
                                ${!importString ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {importSuccess ? "Restored!" : "Import Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
