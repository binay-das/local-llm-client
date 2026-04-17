"use client";

import { useTheme } from './ThemeProvider';

export const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative z-50 h-11 w-20 rounded-full cursor-pointer overflow-hidden transition-all duration-300 border border-[#ddd6cc] dark:border-[#3f4146] bg-gradient-to-br from-white to-[#e8e3db] dark:from-[#23272d] dark:to-[#141619] shadow-lg dark:shadow-xl hover:-translate-y-0.5 hover:shadow-xl dark:hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Toggle theme"
            aria-pressed={isDark}
        >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#faf8f4] to-[#e9e5dc] dark:from-[#171a1f] dark:to-[#0c0e11]" aria-hidden="true" />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 text-[#3d434b] dark:text-[#e3dfd7]" aria-hidden="true">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                    <path strokeLinecap="round" d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3" />
                </svg>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
                </svg>
            </span>
            <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 bg-white dark:bg-[#2f2a26] border border-[#dbd3c5] dark:border-[#5b5248] shadow-md dark:shadow-lg ${isDark ? 'translate-x-9' : 'translate-x-0'}`}>
                {isDark ? (
                    <svg className="h-4.5 w-4.5 text-[#a58d6e]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
                    </svg>
                ) : (
                    <svg className="h-4.5 w-4.5 text-[#3d434b]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="4" />
                        <path strokeLinecap="round" d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9L5.3 5.3" />
                    </svg>
                )}
            </span>
        </button>
    );
};