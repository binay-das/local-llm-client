"use client";
import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
    return (
        <header className="relative z-40 h-16 border-b border-[#e0dacd] dark:border-[#313438] flex items-center justify-between px-4 md:px-6 shrink-0 bg-[#fffaf4]/60 dark:bg-[#101218]/60 backdrop-blur-lg">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#222831] to-[#576c8a] dark:from-[#6a7884] dark:to-[#373d42] shadow-lg dark:shadow-xl">
                    <span className="h-4 w-4 rounded-full bg-[#fff8ef] dark:bg-[#ebe3d6]" />
                </div>
                <div>
                    <h1 className="text-lg leading-tight font-semibold text-[#161c25] dark:text-[#f5efe8]">
                        Local LLM Client
                    </h1>
                    <p className="text-xs leading-tight text-[#68676e] dark:text-[#9a9a9c]">
                        Chat with local models in a cleaner workspace
                    </p>
                </div>
            </div>
            <ThemeToggle />
        </header>
    );
};