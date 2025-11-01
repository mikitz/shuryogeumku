/** @format */

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <button className="p-2 rounded-md w-9 h-9" aria-label="Loading theme">
                    <Sun className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md transition-colors ${
                    theme === 'light'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                aria-label="Light mode"
            >
                <Sun className="h-4 w-4" />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md transition-colors ${
                    theme === 'dark'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                aria-label="Dark mode"
            >
                <Moon className="h-4 w-4" />
            </button>
        </div>
    );
}

