"use client";
import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Bot, PanelLeft } from 'lucide-react';

interface HeaderProps {
    onToggleSidebar?: () => void;
    selectedModel?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, selectedModel }) => {
    return (
        <header className="relative z-30 h-14 border-b border-slate-200 dark:border-[#2a2d31] flex items-center justify-between px-4 md:px-6 shrink-0 bg-white/80 dark:bg-[#111315]/80 backdrop-blur-md transition-colors duration-200">
            <div className="flex items-center gap-3">
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-[#9ca3af] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1d21] transition-colors md:hidden"
                        aria-label="Toggle sidebar"
                    >
                        <PanelLeft size={18} />
                    </button>
                )}
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                        <Bot size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                            Local LLM Client
                        </h1>
                        {selectedModel && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium leading-tight mt-0.5">
                                {selectedModel}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle showLabel />
            </div>
        </header>
    );
};