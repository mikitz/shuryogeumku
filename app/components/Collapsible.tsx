'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true,
  className = '' 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
        <div className="transition-transform duration-200" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          {children}
        </div>
      )}
    </div>
  );
}

interface CollapsibleRowProps {
  level: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleRow({ level, children, defaultOpen = false }: CollapsibleRowProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <>
      <tr className="border-b border-zinc-200 dark:border-zinc-800">
        <td colSpan={10} className="p-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
          >
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Level {level}</span>
            <div className="transition-transform duration-200" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
              <ChevronDown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={10} className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            {children}
          </td>
        </tr>
      )}
    </>
  );
}

