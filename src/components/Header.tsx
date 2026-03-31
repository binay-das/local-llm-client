import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
    return (
        <header className="app-header relative z-40 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                llm-local-client
            </h1>
            <ThemeToggle />
        </header>
    );
};
