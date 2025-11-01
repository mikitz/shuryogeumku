'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import React from "react";

interface ClassTableClientProps {
  classTableGroups: any[];
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

// Helper to format cell value
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object') {
    if (value.type === 'bonus') return `+${value.value}`;
    if (value.type === 'dice') {
      if (value.toRoll && Array.isArray(value.toRoll) && value.toRoll.length > 0) {
        const dice = value.toRoll[0];
        return `1d${dice.faces || 6}`;
      }
      return value.displayText || value.value || '1d6';
    }
    return JSON.stringify(value);
  }
  return '—';
}

// Helper to format dice values
function formatDiceValue(value: any): string {
  return formatCellValue(value);
}

// Helper to get proficiency bonus
function getProficiencyBonus(level: number): string {
  if (level < 5) return '+2';
  if (level < 9) return '+3';
  if (level < 13) return '+4';
  if (level < 17) return '+5';
  return '+6';
}

// Helper to clean column labels
function cleanLabel(label: string): string {
  if (!label) return '';
  return label
    .replace(/\{@filter\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@[^}]+\}/gi, '')
    .trim();
}

// Collapsible level row component
function CollapsibleLevelRow({ 
  level, 
  rowData, 
  allColumns, 
  classFeatures,
  classFeature
}: { 
  level: number; 
  rowData: any[]; 
  allColumns: string[];
  classFeatures: any[];
  classFeature: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Find features for this level from classFeature array
  const featuresForLevel = classFeature.filter((f: any) => f.level === level);
  
  // Also check classFeatures array for feature references - group by level
  const featureRefs: string[] = [];
  if (classFeatures && classFeatures.length > 0) {
    classFeatures.forEach((ref: any) => {
      let refLevel: number | null = null;
      let featureName = '';
      
      if (typeof ref === 'string') {
        // Format: "FeatureName|ClassName|Source|Level"
        const parts = ref.split('|');
        featureName = parts[0];
        refLevel = parseInt(parts[3] || '0');
      } else if (ref && typeof ref === 'object' && ref.classFeature) {
        const parts = ref.classFeature.split('|');
        featureName = parts[0];
        refLevel = parseInt(parts[3] || '0');
      }
      
      if (refLevel === level && featureName) {
        featureRefs.push(featureName);
      }
    });
  }
  
  // Combine feature names
  const featureNames = featuresForLevel.map((f: any) => f.name).filter(Boolean);
  const allFeatureNames = [...new Set([...featureNames, ...featureRefs])];
  const featureDisplay = allFeatureNames.length > 0 ? allFeatureNames.join(', ') : '—';

  return (
    <>
      <tr 
        className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
          {level}{level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th'}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          {getProficiencyBonus(level)}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          {featureDisplay || '—'}
        </td>
        {rowData.map((cell, idx) => (
          <td key={idx} className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 text-center">
            {formatDiceValue(cell)}
          </td>
        ))}
      </tr>
      {isOpen && featuresForLevel.length > 0 && (
        <tr>
          <td colSpan={allColumns.length + 3} className="px-4 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="text-sm text-zinc-700 dark:text-zinc-300 space-y-4">
              {featuresForLevel.map((feature: any, idx: number) => (
                <div key={idx} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    Level {level}: {feature.name}
                  </h4>
                  {feature.entries && renderEntries(feature.entries)}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ClassTableClient({ 
  classTableGroups, 
  classFeatures,
  classFeature
}: ClassTableClientProps) {
  if (!classTableGroups || classTableGroups.length === 0) {
    return null;
  }

  // Build combined table structure
  // First group is usually the main features table
  const mainGroup = classTableGroups[0];
  const spellSlotsGroup = classTableGroups.find((g: any) => 
    g.title === 'Spell Slots per Spell Level' || 
    g.title?.includes('Spell Slots') ||
    g.rowsSpellProgression
  );
  
  // Get all column labels
  const baseColumns = mainGroup.colLabels || [];
  const spellColumns = spellSlotsGroup?.colLabels || [];
  
  // Combine rows - use rowsSpellProgression if available, otherwise use rows
  const spellRows = spellSlotsGroup?.rowsSpellProgression || spellSlotsGroup?.rows || [];
  const baseRows = mainGroup.rows || [];
  
  // Combine rows - zip base rows with spell rows
  // Ensure we have 20 rows (levels 1-20)
  const maxRows = Math.max(baseRows.length, spellRows.length, 20);
  const combinedRows = Array.from({ length: maxRows }, (_, idx) => {
    const baseRow = baseRows[idx] || [];
    const spellRow = spellRows[idx] || [];
    return [...baseRow, ...spellRow];
  });

  // All column headers
  const allColumns = [
    ...baseColumns.map(cleanLabel),
    ...spellColumns.map(cleanLabel)
  ].filter(Boolean);

  return (
    <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Level
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Proficiency Bonus
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Features
              </th>
              {allColumns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
            {combinedRows.length > 0 ? (
              combinedRows.map((rowData: any[], idx: number) => (
                <CollapsibleLevelRow 
                  key={idx} 
                  level={idx + 1} 
                  rowData={rowData}
                  allColumns={allColumns}
                  classFeatures={classFeatures}
                  classFeature={classFeature}
                />
              ))
            ) : (
              <tr>
                <td colSpan={allColumns.length + 3} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No level progression data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

