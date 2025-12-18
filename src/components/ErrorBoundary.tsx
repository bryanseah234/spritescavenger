"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

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
        localStorage.clear();
        window.location.reload();
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
