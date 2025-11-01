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
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-zinc-50">
            Full Data
          </h2>
          <div className="font-mono text-sm overflow-x-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(spell, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

