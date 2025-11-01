'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsibleSection } from "../../components/Collapsible";

interface ClassPageClientProps {
  classData: any;
  renderEntries: (entries: any) => React.ReactNode;
}

// Collapsible level row component
function CollapsibleLevelRow({ level, levelData, renderEntries }: { level: number; levelData: any; renderEntries: (entries: any) => React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract level data
  const levelNum = levelData.level || level;
  const profBonus = levelData.prof || levelData.proficiency || '—';
  const features = levelData.features || levelData.feature || '—';
  const entries = levelData.entries || levelData.entry || null;

  return (
    <>
      <tr 
        className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{levelNum}</td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">{profBonus}</td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          {Array.isArray(features) 
            ? features.map((f: any, idx: number) => (
                <span key={idx}>
                  {typeof f === 'string' ? f : f.name || JSON.stringify(f)}
                  {idx < features.length - 1 ? ', ' : ''}
                </span>
              ))
            : features}
        </td>
        <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
          <div className="flex items-center justify-end">
            <ChevronDown 
              className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </td>
      </tr>
      {isOpen && entries && (
        <tr>
          <td colSpan={4} className="px-4 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
              {renderEntries(entries)}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ClassPageClient({ classData, renderEntries }: ClassPageClientProps) {
  const classTable = classData.classTable || [];
  
  // If classTable is an object with rows, extract the rows
  const rows = Array.isArray(classTable) 
    ? classTable 
    : classTable.rows || [];

  return (
    <CollapsibleSection title="Level Progression" defaultOpen={true}>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.length > 0 ? (
              rows.map((levelData: any, idx: number) => (
                <CollapsibleLevelRow 
                  key={idx} 
                  level={idx + 1} 
                  levelData={levelData}
                  renderEntries={renderEntries}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No level progression data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}

