import Link from "next/link";
import SearchBox from "../components/SearchBox";
import { getAllSpells, spellNameToSlug, SPELL_SCHOOLS } from "@/lib/utils/data";

export default function SpellsPage() {
  const spells = getAllSpells();
  
  // Prepare search data
  const searchItems = spells.map((spell: any) => ({
    name: spell.name,
    href: `/spells/${spellNameToSlug(spell.name)}`,
    type: 'Spell',
    metadata: `Level ${spell.level === 0 ? 'Cantrip' : spell.level} • ${SPELL_SCHOOLS[spell.school] || spell.school}`
  }));
  
  // Sort spells by level, then by name
  const sortedSpells = [...spells].sort((a: any, b: any) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.name.localeCompare(b.name);
  });

  const classes = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard', 'artificer'];
  const schools = Object.values(SPELL_SCHOOLS).filter((school): school is string => typeof school === 'string');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
            Spells
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Total: {spells.length} {spells.length === 1 ? 'spell' : 'spells'}
          </p>
        </div>
        
        {/* Search Box */}
        <div className="mb-6">
          <SearchBox 
            items={searchItems} 
            placeholder="Search spells..."
          />
        </div>

        {/* Filter Links */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Classes:</span>
            {classes.map((className) => (
              <Link
                key={className}
                href={`/spells/${className}`}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors capitalize"
              >
                {className}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Schools:</span>
            {schools.map((school) => (
              <Link
                key={school}
                href={`/spells/${school.toLowerCase()}`}
                className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                {school}
              </Link>
            ))}
          </div>
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

