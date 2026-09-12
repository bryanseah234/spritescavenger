import { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Copy, Check, Upload, Save, AlertTriangle, User, Hash, Tag, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import { defaultSave, downloadSaveFile, importSaveString } from "@/utils/gameSave";

export default function SettingsView() {
    const {
        playerName,
        playerTitle,
        setPlayerProfile,
        exportSave,
        importSave,
        level,
        xp,
        resetSave,
        saveError,
        recoverySave,
    } = useGame();

    const [nameInput, setNameInput] = useState(playerName);
    const [titleInput, setTitleInput] = useState(playerTitle);

    // Save/Load States
    const [importString, setImportString] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);
    const [copyError, setCopyError] = useState(false);
    const [backupString, setBackupString] = useState("");
    const [importError, setImportError] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    useEffect(() => {
        // Keep imported profile values visible without changing unsaved text on other game updates.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNameInput(playerName);
        setTitleInput(playerTitle);
    }, [playerName, playerTitle]);

    // Profile Handling
    const handleSaveProfile = () => {
        setPlayerProfile(nameInput, titleInput);
    };

    // Export Handling
    const handleCopy = async () => {
        const saveString = exportSave();
        setBackupString(saveString);
        setCopySuccess(false);
        setCopyError(false);
        try {
            await navigator.clipboard.writeText(saveString);
            setCopySuccess(true);
        } catch {
            setCopyError(true);
        }
    };

    // Import Handling
    const handleImport = () => {
        setImportError(false);
        setImportSuccess(false);
        const success = importSave(importString);
        if (success) {
            const imported = importSaveString(importString);
            setNameInput(imported.playerName);
            setTitleInput(imported.playerTitle);
            setImportSuccess(true);
            setTimeout(() => {
                setImportSuccess(false);
                setImportString("");
            }, 2000);
        } else {
            setImportError(true);
            setTimeout(() => setImportError(false), 3000);
        }
    };

    const handleReset = () => {
        setIsResetModalOpen(true);
    };

    const confirmReset = () => {
        if (resetSave()) {
            const fresh = defaultSave();
            setNameInput(fresh.playerName);
            setTitleInput(fresh.playerTitle);
            setIsResetModalOpen(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-6 pb-32 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center gap-4 py-8 justify-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <Save className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">System</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Profile Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-sm">
                        <User className="w-4 h-4" />
                        <span>Identity Module</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        {/* ID Badge Preview */}
                        <div className="flex items-start gap-6 mb-8 relative z-10">
                            <div className="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20 overflow-hidden border border-slate-700">
                                {/* Use sprite image instead of initial */}
                                <img
                                    src="/assets/player_sprite.png"
                                    alt="Avatar"
                                    className="w-20 h-20 object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="text-xs text-slate-500 font-mono mb-1">ID_CARD_V1.0</div>
                                <div className="text-2xl font-bold text-white tracking-tight">{nameInput || "UNKNOWN"}</div>
                                <div className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold uppercase border border-amber-500/30">
                                    {titleInput || "NO_DATA"}
                                </div>
                                <div className="pt-2 text-xs text-slate-500 flex gap-4">
                                    <span>LVL.{level}</span>
                                    <span>XP: {xp}</span>
                                </div>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4 relative z-10">
                            <div className="space-y-1">
                                <label htmlFor="player-name" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Hash className="w-3 h-3" /> Callsign (Name)
                                </label>
                                <input
                                    id="player-name"
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    maxLength={20}
                                    className="w-full bg-[#222522] border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="Enter Name..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="player-title" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> Designation (Title)
                                </label>
                                <input
                                    id="player-title"
                                    type="text"
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    maxLength={30}
                                    className="w-full bg-[#222522] border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="Enter Title..."
                                />
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                className="w-full bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white font-bold py-3 rounded-lg border border-slate-700 hover:border-amber-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                UPDATE IDENTITY
                            </button>
                        </div>
                    </div>
                </section>


                {/* Save Management Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-sm">
                        <Upload className="w-4 h-4" />
                        <span>Data Core</span>
                    </div>

                    <div className="space-y-4">
                        {/* Export */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="font-bold text-slate-200 mb-2">Backup Progress</h3>
                            <p className="text-sm text-slate-400 mb-4">Copy or download a backup of your current progress. Keep it somewhere safe.</p>
                            <button
                                onClick={handleCopy}
                                className={`
                                    w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                                    ${copySuccess
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }
                                `}
                            >
                                {copySuccess ? <><Check className="w-4 h-4" /> Copied to Clipboard</> : <><Copy className="w-4 h-4" /> Copy Save String</>}
                            </button>
                            {copyError && <p role="status" className="mt-3 text-sm text-amber-300">Clipboard access failed. Download the backup or copy the string below.</p>}
                            {backupString && <label className="mt-3 block text-sm text-slate-300">Backup string<textarea readOnly value={backupString} className="mt-2 h-24 w-full rounded border border-slate-700 bg-slate-950 p-3 font-mono text-xs" /></label>}
                            <button onClick={() => downloadSaveFile(exportSave(), "sprite-scavenger-backup.txt")} className="mt-3 w-full rounded-lg border border-slate-600 px-4 py-3 text-sm text-slate-200">Download Backup</button>
                            {recoverySave !== null && <button onClick={() => downloadSaveFile(recoverySave, "sprite-scavenger-stored-save.json")} className="mt-3 w-full rounded-lg border border-amber-500 px-4 py-3 text-sm text-amber-200">Download Preserved Save</button>}
                        </div>

                        {/* Import */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="font-bold text-slate-200 mb-2">Restore Backup</h3>
                            <p className="text-sm text-amber-500/80 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Warning: Overwrites current progress!
                            </p>
                            <textarea
                                value={importString}
                                onChange={(e) => setImportString(e.target.value)}
                                placeholder="Paste save string here..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 h-24 mb-4 focus:outline-none focus:border-amber-500 resize-none"
                            />
                            {importError && <p role="status" className="text-xs text-red-400 mb-2 text-center font-bold">{saveError ? "RESTORE COULD NOT BE SAVED. CURRENT PROGRESS WAS NOT REPLACED." : "INVALID DATA CORE STRING. CURRENT PROGRESS WAS NOT REPLACED."}</p>}
                            <button
                                onClick={handleImport}
                                disabled={!importString}
                                className={`
                                    w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all
                                    ${importSuccess
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white'
                                    }
                                    ${!importString ? 'opacity-50 cursor-not-allowed hover:bg-slate-800 hover:text-slate-300' : ''}
                                `}
                            >
                                {importSuccess ? "RESTORE SUCCESSFUL" : "IMPORT DATA"}
                            </button>
                        </div>


                    </div>
                </section>

            </div>

            {/* Danger Zone */}
            <div className="pt-0">
                <button
                    onClick={handleReset}
                    className="w-full py-4 rounded-xl border border-red-900/30 hover:border-red-500 bg-red-950/10 hover:bg-red-900/20 text-red-700 hover:text-red-400 font-bold transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                    <Trash2 className="w-4 h-4" />
                    Initiate Factory Reset
                </button>
            </div>

            <ConfirmationModal
                isOpen={isResetModalOpen}
                title="FACTORY RESET"
                message="Reset only your Sprite Scavenger progress? Download a backup first if you want to keep it. Other browser data will be preserved."
                confirmLabel="WIPE DATA"
                onConfirm={confirmReset}
                onCancel={() => setIsResetModalOpen(false)}
                isDanger={true}
            />
        </div >
    );
}
