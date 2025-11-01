import { notFound } from "next/navigation";
import Link from "next/link";
import { CollapsibleSection } from "../../components/Collapsible";
import { ClassTableClient } from "./ClassTableClient";
import { ClassFeaturesClient } from "./ClassFeaturesClient";
import { LevelDetailsClient } from "./LevelDetailsClient";
import { 
  getAllClasses,
  getClassBySlug,
  classNameToSlug,
} from "@/lib/utils/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const classes = getAllClasses();
  return classes.map((classItem: any) => ({
    slug: classNameToSlug(classItem.name),
  }));
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

// Helper to format proficiency bonus
function getProficiencyBonus(level: number): string {
  if (level < 5) return '+2';
  if (level < 9) return '+3';
  if (level < 13) return '+4';
  if (level < 17) return '+5';
  return '+6';
}

// Helper to format cell value
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object') {
    if (value.type === 'bonus') return `+${value.value}`;
    if (value.type === 'dice') return value.value || value.displayText || '—';
    return JSON.stringify(value);
  }
  return '—';
}

export default async function ClassPage({ params }: PageProps) {
  const { slug } = await params;
  const classData = getClassBySlug(slug);
  
  if (!classData) {
    notFound();
  }

  // Extract data
  const hd = classData.hd || {};
  const proficiency = classData.proficiency || [];
  const startingProficiencies = classData.startingProficiencies || {};
  const startingEquipment = classData.startingEquipment || {};
  const multiclassing = classData.multiclassing || {};
  const classTableGroups = classData.classTableGroups || [];
  const classFeatures = classData.classFeatures || [];
  const classFeature = classData.classFeature || [];
  const entries = classData.entries || [];
  const spellcastingAbility = classData.spellcastingAbility;
  const casterProgression = classData.casterProgression;
  const preparedSpells = classData.preparedSpells || classData.preparedSpellsProgression;
  const cantripProgression = classData.cantripProgression;
  const spellsKnownProgressionFixed = classData.spellsKnownProgressionFixed;
  const subclassTitle = classData.subclassTitle;
  const primaryAbility = classData.primaryAbility;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/classes"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Classes
          </Link>
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
            {classData.name}
          </h1>
          {classData.source && (
            <p className="text-zinc-600 dark:text-zinc-400">
              Source: {classData.source}
            </p>
          )}
        </div>

        {/* Class Table - AT THE TOP */}
        {classTableGroups && classTableGroups.length > 0 && (
          <div className="mb-6">
            <ClassTableClient 
              classTableGroups={classTableGroups}
              classFeatures={classFeatures}
              classFeature={classFeature}
            />
          </div>
        )}

        {/* Statsprof Section - Cards */}
        <div className="mb-6 space-y-4">
          {/* Core Traits Card */}
          <CollapsibleSection title="Core Traits" defaultOpen={true}>
            <div className="space-y-3">
              {hd && hd.faces && (
                <>
                  <div>
                    <strong className="text-zinc-700 dark:text-zinc-300">Hit Point Die:</strong>{' '}
                    <span className="text-zinc-900 dark:text-zinc-100">
                      D{hd.faces} per {classData.name} level
                    </span>
                  </div>
                  <div>
                    <strong className="text-zinc-700 dark:text-zinc-300">Hit Points at Level 1:</strong>{' '}
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {hd.faces} + Con. modifier
                    </span>
                  </div>
                  <div>
                    <strong className="text-zinc-700 dark:text-zinc-300">Hit Points per additional {classData.name} Level:</strong>{' '}
                    <span className="text-zinc-900 dark:text-zinc-100">
                      D{hd.faces} + your Con. modifier, or, {Math.floor(hd.faces / 2) + 1} + your Con. modifier
                    </span>
                  </div>
                </>
              )}
              
              {/* Saving Throw Proficiencies */}
              {proficiency && Array.isArray(proficiency) && (
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Saving Throw Proficiencies:</strong>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {proficiency
                      .filter((p: any) => typeof p === 'string')
                      .map((p: string) => {
                        const abbrMap: Record<string, string> = {
                          str: 'Strength',
                          dex: 'Dexterity',
                          con: 'Constitution',
                          int: 'Intelligence',
                          wis: 'Wisdom',
                          cha: 'Charisma'
                        };
                        return abbrMap[p.toLowerCase()] || p;
                      })
                      .join(', ')}
                  </span>
                </div>
              )}

              {/* Skill Proficiencies */}
              {startingProficiencies.skills && (
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Skill Proficiencies:</strong>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {Array.isArray(startingProficiencies.skills) && startingProficiencies.skills.map((skill: any, idx: number) => {
                      if (skill && typeof skill === 'object' && skill.choose) {
                        return `Choose ${skill.choose.count || 1}: ${Array.isArray(skill.choose.from) ? skill.choose.from.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') : 'Various'}`;
                      }
                      return null;
                    }).filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {/* Weapon Proficiencies */}
              {startingProficiencies.weapons && (
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Weapon Proficiencies:</strong>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {Array.isArray(startingProficiencies.weapons) 
                      ? startingProficiencies.weapons.map((w: any) => typeof w === 'string' ? cleanText(w) : w).join(', ')
                      : typeof startingProficiencies.weapons === 'string' 
                        ? startingProficiencies.weapons 
                        : '—'}
                  </span>
                </div>
              )}

              {/* Armor Proficiencies */}
              {startingProficiencies.armor && (
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Armor Training:</strong>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {Array.isArray(startingProficiencies.armor) 
                      ? startingProficiencies.armor.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
                      : typeof startingProficiencies.armor === 'string' 
                        ? startingProficiencies.armor 
                        : '—'}
                  </span>
                </div>
              )}

              {/* Tool Proficiencies */}
              {startingProficiencies.tools && (
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Tool Proficiencies:</strong>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {Array.isArray(startingProficiencies.tools) 
                      ? startingProficiencies.tools.map((t: any) => {
                          if (typeof t === 'object' && t.choose) {
                            return `Choose ${t.choose.count || 1}: ${Array.isArray(t.choose.from) ? t.choose.from.map((s: string) => cleanText(s)).join(', ') : 'Various'}`;
                          }
                          return cleanText(t);
                        }).join(', ')
                      : typeof startingProficiencies.tools === 'string' 
                        ? startingProficiencies.tools 
                        : '—'}
                  </span>
                </div>
              )}
              
              {/* Starting Equipment */}
              {startingEquipment && (startingEquipment.default || startingEquipment.entries || startingEquipment.defaultData) && (
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Starting Equipment:</strong>
                  <div className="mt-1 text-zinc-900 dark:text-zinc-100">
                    {startingEquipment.entries && renderEntries(startingEquipment.entries)}
                    {startingEquipment.default && !startingEquipment.entries && renderEntries(startingEquipment.default)}
                  </div>
                </div>
              )}

              {/* Multiclassing */}
              {multiclassing && Object.keys(multiclassing).length > 0 && (
                <>
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Multiclassing</h4>
                    
                    {multiclassing.requirements && (
                      <div className="mb-3">
                        <strong className="text-zinc-700 dark:text-zinc-300">Ability Score Minimum:</strong>{' '}
                        <span className="text-zinc-900 dark:text-zinc-100">
                          {typeof multiclassing.requirements === 'object' 
                            ? Object.entries(multiclassing.requirements)
                                .map(([ability, min]: [string, any]) => {
                                  const abbrMap: Record<string, string> = {
                                    str: 'Strength',
                                    dex: 'Dexterity',
                                    con: 'Constitution',
                                    int: 'Intelligence',
                                    wis: 'Wisdom',
                                    cha: 'Charisma'
                                  };
                                  return `${abbrMap[ability.toLowerCase()] || ability} ${min}`;
                                }).join(', ')
                            : '—'}
                        </span>
                      </div>
                    )}
                    
                    {multiclassing.proficienciesGained && (
                      <div>
                        <strong className="text-zinc-700 dark:text-zinc-300">Proficiencies Gained:</strong>
                        <div className="mt-1 text-zinc-900 dark:text-zinc-100 space-y-2">
                          {multiclassing.proficienciesGained.armor && Array.isArray(multiclassing.proficienciesGained.armor) && (
                            <div>
                              <span className="font-medium">Armor: </span>
                              {multiclassing.proficienciesGained.armor.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                            </div>
                          )}
                          {multiclassing.proficienciesGained.weapons && Array.isArray(multiclassing.proficienciesGained.weapons) && (
                            <div>
                              <span className="font-medium">Weapons: </span>
                              {multiclassing.proficienciesGained.weapons.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(', ')}
                            </div>
                          )}
                          {multiclassing.proficienciesGained.tools && (
                            <div>
                              <span className="font-medium">Tools: </span>
                              {Array.isArray(multiclassing.proficienciesGained.tools) 
                                ? multiclassing.proficienciesGained.tools.map((t: any) => {
                                    if (typeof t === 'string') {
                                      return cleanText(t);
                                    }
                                    return cleanText(String(t));
                                  }).join(', ')
                                : cleanText(String(multiclassing.proficienciesGained.tools))}
                            </div>
                          )}
                          {multiclassing.proficienciesGained.toolProficiencies && (
                            <div>
                              <span className="font-medium">Tool Proficiencies: </span>
                              {Array.isArray(multiclassing.proficienciesGained.toolProficiencies) 
                                ? multiclassing.proficienciesGained.toolProficiencies.map((tp: any, idx: number) => {
                                    if (typeof tp === 'object' && tp.anyMusicalInstrument) {
                                      return `Choose ${tp.anyMusicalInstrument} musical instrument${tp.anyMusicalInstrument > 1 ? 's' : ''}`;
                                    }
                                    if (typeof tp === 'string') {
                                      return cleanText(tp);
                                    }
                                    return cleanText(String(tp));
                                  }).join(', ')
                                : cleanText(String(multiclassing.proficienciesGained.toolProficiencies))}
                            </div>
                          )}
                          {multiclassing.proficienciesGained.skills && (
                            <div>
                              <span className="font-medium">Skills: </span>
                              {Array.isArray(multiclassing.proficienciesGained.skills) 
                                ? multiclassing.proficienciesGained.skills.map((skill: any, idx: number) => {
                                    if (typeof skill === 'object' && skill.choose) {
                                      const choices = skill.choose.from || [];
                                      const count = skill.choose.count || 1;
                                      return `Choose ${count}: ${choices.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`;
                                    }
                                    if (typeof skill === 'string') {
                                      return skill.charAt(0).toUpperCase() + skill.slice(1);
                                    }
                                    return cleanText(String(skill));
                                  }).join(', ')
                                : cleanText(String(multiclassing.proficienciesGained.skills))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CollapsibleSection>

          {/* Primary Ability Card */}
          {primaryAbility && Array.isArray(primaryAbility) && primaryAbility.length > 0 && (
            <CollapsibleSection title="Primary Ability" defaultOpen={false}>
              <div className="space-y-3">
                {primaryAbility.map((ability: any, idx: number) => (
                  <div key={idx}>
                    {typeof ability === 'object' && Object.keys(ability).map((key: string) => {
                      const abbrMap: Record<string, string> = {
                        str: 'Strength',
                        dex: 'Dexterity',
                        con: 'Constitution',
                        int: 'Intelligence',
                        wis: 'Wisdom',
                        cha: 'Charisma'
                      };
                      return (
                        <span key={key} className="text-zinc-900 dark:text-zinc-100">
                          {abbrMap[key.toLowerCase()] || key}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Spellcasting Card */}
          {spellcastingAbility && (
            <CollapsibleSection title="Spellcasting" defaultOpen={false}>
              <div className="space-y-3">
                <div>
                  <strong className="text-zinc-700 dark:text-zinc-300">Spellcasting Ability:</strong>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100 capitalize">
                    {spellcastingAbility === 'int' ? 'Intelligence' :
                     spellcastingAbility === 'wis' ? 'Wisdom' :
                     spellcastingAbility === 'cha' ? 'Charisma' :
                     spellcastingAbility}
                  </span>
                </div>
                {casterProgression && (
                  <div>
                    <strong className="text-zinc-700 dark:text-zinc-300">Caster Progression:</strong>{' '}
                    <span className="text-zinc-900 dark:text-zinc-100 capitalize">
                      {casterProgression}
                    </span>
                  </div>
                )}
                {preparedSpells && typeof preparedSpells === 'string' && (
                  <div>
                    <strong className="text-zinc-700 dark:text-zinc-300">Prepared Spells:</strong>{' '}
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {preparedSpells}
                    </span>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Level-by-Level Details */}
        {(classFeature.length > 0 || classFeatures.length > 0) && (
          <div className="mb-6">
            <LevelDetailsClient 
              classFeatures={classFeatures}
              classFeature={classFeature}
            />
          </div>
        )}

        {/* Class Features */}
        {classFeature && classFeature.length > 0 && (
          <div className="mb-6">
            <ClassFeaturesClient 
              classFeatures={classFeature}
            />
          </div>
        )}

        {/* Class Description/Entries */}
        {entries && entries.length > 0 && (
          <div className="mb-6">
            <CollapsibleSection title="Class Description" defaultOpen={true}>
              <div className="text-zinc-800 dark:text-zinc-200 space-y-4">
                {renderEntries(entries)}
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
}
