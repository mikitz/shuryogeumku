'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface SearchBoxProps {
  items: Array<{
    name: string;
    href: string;
    type: string;
    metadata?: string;
  }>;
  placeholder?: string;
  onResultClick?: () => void;
}

export default function SearchBox({ items, placeholder = "Search...", onResultClick }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return items
      .filter(item => 
        item.name.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10); // Limit to 10 results
  }, [query, items]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {isFocused && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {filteredItems.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              onClick={() => {
                setQuery('');
                setIsFocused(false);
                onResultClick?.();
              }}
              className="block px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0"
            >
              <div className="font-medium text-black dark:text-zinc-100">{item.name}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {item.type}
                {item.metadata && ` • ${item.metadata}`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

