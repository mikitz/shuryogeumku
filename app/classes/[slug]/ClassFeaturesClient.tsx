'use client';

import { CollapsibleSection } from "../../components/Collapsible";
import React from "react";

interface ClassFeaturesClientProps {
  classFeatures: any[];
}

// Clean text by removing {@...} tags
function cleanText(text: string): string {
  if (typeof text !== 'string') return String(text);
  return text
    .replace(/\{@damage\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1 damage')
    .replace(/\{@dice\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@spell\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@item\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@condition\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@skill\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@book\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@dc\s+([^}|]+)(?:\|[^}]+)?\}/gi, 'DC $1')
    .replace(/\{@hit\s+([^}|]+)(?:\|[^}]+)?\}/gi, '+$1')
    .replace(/\{@h\}/gi, '')
    .replace(/\{@atkr\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1 attack')
    .replace(/\{@variantrule\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@feat\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@filter\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@5etools\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1');
}

// Helper function to render class entries (handles nested structures)
function renderEntries(entries: any): React.ReactNode {
  if (!entries) return null;
  if (typeof entries === 'string') {
    return <p className="mb-2">{cleanText(entries)}</p>;
  }
  if (Array.isArray(entries)) {
    return entries.map((entry, idx) => {
      if (typeof entry === 'string') {
        return <p key={idx} className="mb-2">{cleanText(entry)}</p>;
      }
      if (typeof entry === 'object' && entry.type === 'list') {
        return (
          <ul key={idx} className="ml-4 my-2 list-disc list-inside">
            {entry.items && Array.isArray(entry.items) && entry.items.map((item: any, itemIdx: number) => (
              <li key={itemIdx} className="mb-1">
                {typeof item === 'string' ? cleanText(item) : renderEntries(item)}
              </li>
            ))}
          </ul>
        );
      }
      if (typeof entry === 'object' && entry.type === 'entries') {
        return (
          <div key={idx} className="my-2">
            {entry.name && <h4 className="font-semibold mb-1">{entry.name}</h4>}
            {entry.entries && renderEntries(entry.entries)}
          </div>
        );
      }
      if (typeof entry === 'object' && entry.name && entry.entry) {
        return (
          <div key={idx} className="my-2">
            <h4 className="font-semibold mb-1">{entry.name}</h4>
            {renderEntries(entry.entry)}
          </div>
        );
      }
      return <p key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">{JSON.stringify(entry)}</p>;
    });
  }
  return <p>{JSON.stringify(entries)}</p>;
}

export function ClassFeaturesClient({ classFeatures }: ClassFeaturesClientProps) {
  if (!classFeatures || classFeatures.length === 0) {
    return null;
  }

  // Group features by level
  const featuresByLevel: Record<number, any[]> = {};
  classFeatures.forEach((feature: any) => {
    const level = feature.level || 1;
    if (!featuresByLevel[level]) {
      featuresByLevel[level] = [];
    }
    featuresByLevel[level].push(feature);
  });

  const levels = Object.keys(featuresByLevel).map(Number).sort((a, b) => a - b);

  return (
    <CollapsibleSection title="Class Features" defaultOpen={true}>
      <div className="space-y-6">
        {levels.map((level) => (
          <div key={level} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
            <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
              Level {level} Features
            </h3>
            <div className="space-y-4">
              {featuresByLevel[level].map((feature: any, idx: number) => (
                <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    {feature.name}
                  </h4>
                  {feature.entries && (
                    <div className="text-zinc-700 dark:text-zinc-300">
                      {renderEntries(feature.entries)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}

