"use client";

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
    const { isDark, toggleTheme, mounted } = useTheme();

    if (!mounted) {
        return (
            <div className={`w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-[#1a1d21] animate-pulse ${className}`} />
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                isDark
                    ? 'bg-[#1a1d21] border-[#2e3238] text-[#e5e7eb] hover:bg-[#22262c] hover:border-[#3a3f47]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
            } ${className}`}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className="relative w-4 h-4 flex items-center justify-center">
                <Sun
                    size={15}
                    className={`absolute transition-all duration-300 transform text-amber-500 ${
                        isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                    }`}
                />
                <Moon
                    size={15}
                    className={`absolute transition-all duration-300 transform text-indigo-400 ${
                        isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                    }`}
                />
            </div>
            {showLabel && (
                <span className="select-none">
                    {isDark ? 'Dark' : 'Light'}
                </span>
            )}
        </button>
    );
};