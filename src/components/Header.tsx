import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
    return (
        <header className="app-header relative z-40 h-16 border-b flex items-center justify-between px-4 md:px-6 shrink-0">
            <div className="flex items-center gap-3">
                <div className="app-brand-mark flex h-10 w-10 items-center justify-center rounded-2xl">
                    <span className="app-brand-mark-dot h-4 w-4 rounded-full" />
                </div>
                <div>
                    <h1 className="app-title text-lg leading-tight font-semibold">
                        Local LLM Client
                    </h1>
                    <p className="app-subtitle text-xs leading-tight">
                        Chat with local models in a cleaner workspace
                    </p>
                </div>
            </div>
            <ThemeToggle />
        </header>
    );
};
