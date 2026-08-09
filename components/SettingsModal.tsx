"use client";

import React from 'react';
import { X, Moon, Sun, Monitor } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs transition-opacity duration-200"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white dark:bg-[#181a1e] border border-slate-200 dark:border-[#2e3238] rounded-2xl p-6 shadow-2xl z-10 transition-all duration-200 text-slate-900 dark:text-white">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#272a2f]">
                    <h3 className="text-base font-semibold">Settings</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#25282e] transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="py-5 space-y-4">
                    {/* Theme Option */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1f2227] border border-slate-100 dark:border-[#2b2e34]">
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Appearance</p>
                            <p className="text-xs text-slate-400 dark:text-[#717885]">Switch between light and dark themes</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#272a2f] dark:hover:bg-[#32363d] text-slate-700 dark:text-slate-200 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
