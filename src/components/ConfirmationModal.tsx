"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isDanger = false
}: ConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className={`
                            relative z-10 w-full max-w-md bg-slate-900 border-2 rounded-2xl p-6 shadow-2xl flex flex-col gap-6
                            ${isDanger ? 'border-red-500/50 shadow-red-900/20' : 'border-slate-700 shadow-black/50'}
                        `}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`
                                shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border
                                ${isDanger ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-slate-800 border-slate-700 text-slate-400'}
                            `}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-100">{title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 rounded-lg font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`
                                    px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-transform active:translate-y-0.5 flex items-center gap-2
                                    ${isDanger
                                        ? 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
                                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'
                                    }
                                `}
                            >
                                <Check className="w-4 h-4" />
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
