'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsibleSection } from "../../components/Collapsible";
import React from "react";

interface LevelDetailsClientProps {
  classFeatures: any[];
  classFeature: any[];
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

// Collapsible level section component
function CollapsibleLevelSection({ level, features }: { level: number; features: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (features.length === 0) return null;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {level === 1 ? '1st' : level === 2 ? '2nd' : level === 3 ? '3rd' : `${level}th`} Level
        </span>
        <div className="transition-transform duration-200" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          <ChevronDown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          <div className="space-y-4">
            {features.map((feature: any, idx: number) => (
              <div key={idx} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
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
      )}
    </div>
  );
}

export function LevelDetailsClient({ classFeatures, classFeature }: LevelDetailsClientProps) {
  // Group features by level from classFeature array
  const featuresByLevel: Record<number, any[]> = {};
  
  classFeature.forEach((feature: any) => {
    const level = feature.level || 1;
    if (!featuresByLevel[level]) {
      featuresByLevel[level] = [];
    }
    featuresByLevel[level].push(feature);
  });

  // Also check classFeatures array for feature references
  if (classFeatures && classFeatures.length > 0) {
    classFeatures.forEach((ref: any, idx: number) => {
      let refLevel: number | null = null;
      let featureName = '';
      
      if (typeof ref === 'string') {
        // Format: "FeatureName|ClassName|Source|Level"
        const parts = ref.split('|');
        featureName = parts[0];
        refLevel = parseInt(parts[3] || String(idx + 1));
      } else if (ref && typeof ref === 'object' && ref.classFeature) {
        const parts = ref.classFeature.split('|');
        featureName = parts[0];
        refLevel = parseInt(parts[3] || String(idx + 1));
      }
      
      // Only add if we don't already have a feature with this name at this level from classFeature
      if (refLevel && featureName) {
        const existingFeature = classFeature.find((f: any) => f.level === refLevel && f.name === featureName);
        if (!existingFeature) {
          if (!featuresByLevel[refLevel]) {
            featuresByLevel[refLevel] = [];
          }
          // Add a placeholder entry for referenced features that don't have full details
          featuresByLevel[refLevel].push({
            name: featureName,
            level: refLevel,
            entries: [`Feature details for ${featureName} are referenced but not fully detailed in the class data.`]
          });
        }
      }
    });
  }

  const levels = Object.keys(featuresByLevel).map(Number).sort((a, b) => a - b);

  if (levels.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection title="Level-by-Level Details" defaultOpen={true}>
      <div className="space-y-2">
        {levels.map((level) => (
          <CollapsibleLevelSection
            key={level}
            level={level}
            features={featuresByLevel[level]}
          />
        ))}
      </div>
    </CollapsibleSection>
  );
}

