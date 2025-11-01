import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  getAllSpells,
  getSpellBySlug,
  getSpellsByClass,
  getSpellsBySchool,
  spellNameToSlug,
  SPELL_SCHOOLS,
  sourcesData 
} from "@/lib/utils/data";

import React from 'react';

// Helper function to render spell entries (handles nested structures)
function renderEntries(entries: any): React.ReactNode {
  if (!entries) return null;
  if (typeof entries === 'string') {
    return <p>{cleanText(entries)}</p>;
  }
  if (Array.isArray(entries)) {
    return entries.map((entry, idx) => {
      if (typeof entry === 'string') {
        return <p key={idx}>{cleanText(entry)}</p>;
      }
      if (typeof entry === 'object' && entry.type === 'list') {
        return (
          <div key={idx} className="ml-4 my-2">
            {entry.items && Array.isArray(entry.items) && entry.items.map((item: any, itemIdx: number) => (
              <div key={itemIdx} className="mb-2">
                {item.name && <strong className="font-semibold">{item.name}: </strong>}
                {item.entries && renderEntries(item.entries)}
              </div>
            ))}
          </div>
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
      return <p key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">{JSON.stringify(entry)}</p>;
    });
  }
  return <p>{JSON.stringify(entries)}</p>;
}

// Clean text by removing {@...} tags and converting to readable format
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
    .replace(/\{@variantrule\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@dc\s+([^}|]+)(?:\|[^}]+)?\}/gi, 'DC $1')
    .replace(/\{@hit\s+([^}|]+)(?:\|[^}]+)?\}/gi, '+$1')
    .replace(/\{@h\}/gi, '')
    .replace(/\{@atkr\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1 attack')
    .replace(/\{@actSave\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1 saving throw')
    .replace(/\{@actSaveFail\s+([^}|]+)(?:\|[^}]+)?\}/gi, 'On a failed save, $1')
    .replace(/\{@filter\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@chance\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1% chance')
    .replace(/\{@recharge\s+([^}|]+)(?:\|[^}]+)?\}/gi, 'Recharge $1')
    .replace(/\{@rechargeLegendary\}/gi, 'Legendary Action')
    .replace(/\{@scale\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1')
    .replace(/\{@scaledamage\s+([^}|]+)(?:\|[^}]+)?\}/gi, '$1 damage');
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const spells = getAllSpells();
  const spellSlugs = spells.map((spell: any) => ({
    slug: spellNameToSlug(spell.name),
  }));
  
  // Add class filters
  const classSlugs = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard', 'artificer'].map(c => ({ slug: c }));
  
  // Add school filters
  const schoolSlugs = Object.values(SPELL_SCHOOLS)
    .filter((school): school is string => typeof school === 'string')
    .map(school => ({
      slug: school.toLowerCase(),
    }));
  
  return [...spellSlugs, ...classSlugs, ...schoolSlugs];
}

export default async function SpellPage({ params }: PageProps) {
  const { slug } = await params;
  const slugLower = slug.toLowerCase();
  
  // Check if it's a class filter
  const validClasses = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard', 'artificer'];
  if (validClasses.includes(slugLower)) {
    const classSpells = getSpellsByClass(slugLower);
    const sortedSpells = [...classSpells].sort((a: any, b: any) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.name.localeCompare(b.name);
    });
    
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/spells"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Spells
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50 capitalize">
              {slugLower} Spells
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Total: {classSpells.length} {classSpells.length === 1 ? 'spell' : 'spells'}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-100 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {sortedSpells.map((spell: any) => (
                    <tr key={spell.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/spells/${spellNameToSlug(spell.name)}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {spell.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {spell.level === 0 ? 'Cantrip' : spell.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {SPELL_SCHOOLS[spell.school] || spell.school}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {spell.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if it's a school filter
  const schoolKey = Object.entries(SPELL_SCHOOLS).find(
    ([_, name]) => name.toLowerCase() === slugLower
  )?.[0];
  
  if (schoolKey) {
    const schoolSpells = getSpellsBySchool(schoolKey);
    const sortedSpells = [...schoolSpells].sort((a: any, b: any) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.name.localeCompare(b.name);
    });
    
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/spells"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Spells
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
              {SPELL_SCHOOLS[schoolKey]} Spells
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Total: {schoolSpells.length} {schoolSpells.length === 1 ? 'spell' : 'spells'}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-100 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {sortedSpells.map((spell: any) => (
                    <tr key={spell.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/spells/${spellNameToSlug(spell.name)}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {spell.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {spell.level === 0 ? 'Cantrip' : spell.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {SPELL_SCHOOLS[spell.school] || spell.school}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {spell.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Otherwise, try to find as a spell
  const spell = getSpellBySlug(slug);
  
  if (!spell) {
    notFound();
  }
  
  // Get class information from sources.json
  const xphbSources = sourcesData.XPHB || {};
  const spellSourceData = (xphbSources as any)[spell.name] || {};
  const classes = Array.isArray(spellSourceData.class) ? spellSourceData.class : [];
  const classVariants = Array.isArray(spellSourceData.classVariant) ? spellSourceData.classVariant : [];
  const allClasses = [
    ...classes.filter((c: any) => c && typeof c === 'object' && (c.source === 'XPHB' || c.source === 'PHB')),
    ...classVariants.filter((c: any) => c && typeof c === 'object' && (c.source === 'XPHB' || c.source === 'PHB')),
  ].filter((c: any) => c && typeof c === 'object' && c.name && typeof c.name === 'string').map((c: any) => String(c.name));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/spells"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Spells
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 mb-6">
          <h1 className="text-4xl font-bold mb-4 text-black dark:text-zinc-50">
            {spell.name}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Level:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                {spell.level === 0 ? 'Cantrip' : spell.level}
              </span>
            </div>
            <div>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">School:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                {SPELL_SCHOOLS[spell.school] || spell.school}
              </span>
            </div>
            <div>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Source:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">{spell.source}</span>
            </div>
            {allClasses.length > 0 && (
              <div>
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Classes:</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100">
                  {[...new Set(allClasses)].join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 space-y-6">
          {/* Casting Time */}
          {spell.time && (
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Casting Time:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                {Array.isArray(spell.time) ? spell.time.map((t: any) => {
                  if (typeof t === 'string') return t;
                  if (typeof t === 'object' && t.number && t.unit) {
                    return `${t.number} ${t.unit}${t.number > 1 ? 's' : ''}`;
                  }
                  return JSON.stringify(t);
                }).join(', ') : JSON.stringify(spell.time)}
              </span>
            </div>
          )}

          {/* Range */}
          {spell.range && (
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Range:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                {typeof spell.range === 'string' 
                  ? spell.range 
                  : spell.range.type === 'point' && spell.range.distance
                    ? `${spell.range.distance.amount} ${spell.range.distance.type}`
                    : spell.range.type === 'self' 
                      ? 'Self' 
                      : spell.range.type === 'sight'
                        ? 'Sight'
                        : spell.range.type === 'unlimited'
                          ? 'Unlimited'
                          : JSON.stringify(spell.range)}
              </span>
            </div>
          )}

          {/* Components */}
          {spell.components && (
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Components:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                {[
                  spell.components.v && 'V',
                  spell.components.s && 'S',
                  spell.components.m && `M${typeof spell.components.m === 'string' ? ` (${spell.components.m})` : ''}`
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Duration */}
          {spell.duration && (
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Duration:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                {Array.isArray(spell.duration) ? spell.duration.map((d: any) => {
                  if (typeof d === 'string') return d;
                  if (typeof d === 'object') {
                    if (d.type === 'instant') return 'Instantaneous';
                    if (d.type === 'timed' && d.duration) {
                      return `${d.duration.amount} ${d.duration.type}${d.duration.amount > 1 ? 's' : ''}${d.concentration ? ' (Concentration)' : ''}`;
                    }
                    if (d.concentration) return 'Concentration';
                    return JSON.stringify(d);
                  }
                  return JSON.stringify(d);
                }).join(', ') : JSON.stringify(spell.duration)}
                {spell.meta?.ritual && ' (Ritual)'}
              </span>
            </div>
          )}

          {/* Spell Description */}
          {spell.entries && (
            <div>
              <h3 className="text-xl font-semibold mb-3 text-black dark:text-zinc-50">Description</h3>
              <div className="text-zinc-800 dark:text-zinc-200 space-y-3 prose prose-zinc dark:prose-invert max-w-none">
                {renderEntries(spell.entries)}
              </div>
            </div>
          )}

          {/* Higher Level */}
          {spell.entriesHigherLevel && (
            <div>
              <h3 className="text-xl font-semibold mb-3 text-black dark:text-zinc-50">At Higher Levels</h3>
              <div className="text-zinc-800 dark:text-zinc-200 space-y-3 prose prose-zinc dark:prose-invert max-w-none">
                {renderEntries(spell.entriesHigherLevel)}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(spell.damageInflict || spell.savingThrow || (spell as any).attackType) && (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-black dark:text-zinc-50">Details</h3>
              <div className="space-y-2 text-sm">
                {spell.damageInflict && (
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Damage Type:</span>{' '}
                    <span className="text-zinc-900 dark:text-zinc-100 capitalize">
                      {Array.isArray(spell.damageInflict) ? spell.damageInflict.join(', ') : spell.damageInflict}
                    </span>
                  </div>
                )}
                {spell.savingThrow && (
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Saving Throw:</span>{' '}
                    <span className="text-zinc-900 dark:text-zinc-100 capitalize">
                      {Array.isArray(spell.savingThrow) ? spell.savingThrow.join(', ') : spell.savingThrow}
                    </span>
                  </div>
                )}
                {(spell as any).attackType && (
                  <div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Attack Type:</span>{' '}
                    <span className="text-zinc-900 dark:text-zinc-100 capitalize">
                      {(spell as any).attackType}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

