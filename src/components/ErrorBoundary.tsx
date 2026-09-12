"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { downloadSaveFile, SAVE_KEY } from "@/utils/gameSave";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        if (!window.confirm("Reset only Sprite Scavenger progress? Download your stored save first if you want to keep it.")) return;
        try {
            localStorage.removeItem(SAVE_KEY);
            window.location.reload();
        } catch {
            window.alert("Browser storage is unavailable. Your stored save was not changed.");
        }
    };

    private downloadStoredSave = () => {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw !== null) downloadSaveFile(raw, "sprite-scavenger-stored-save.json");
            else window.alert("No stored Sprite Scavenger save was found.");
        } catch {
            window.alert("Browser storage is unavailable. Your stored save was not changed.");
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#222522] flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Application Error</h1>
                    <p className="text-slate-400 mb-4 max-w-md">
                        Something went wrong. It might be due to a corrupted save file or an unexpected state.
                    </p>
                    <div className="bg-slate-900 p-4 rounded-lg mb-6 max-w-md overflow-x-auto text-left w-full">
                        <p className="text-xs font-mono text-red-400 whitespace-pre-wrap">
                            {this.state.error?.toString()}
                        </p>
                    </div>
                    <button onClick={() => window.location.reload()} className="mb-4 rounded border border-slate-500 px-6 py-2 text-slate-100">Reload Without Resetting</button>
                    <button onClick={this.downloadStoredSave} className="mb-4 rounded border border-slate-500 px-6 py-2 text-slate-100">Download Stored Save</button>
                    <button
                        onClick={this.handleReset}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors"
                    >
                        Reset Data & Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
