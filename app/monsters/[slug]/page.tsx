import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  getAllMonsters,
  getMonsterBySlug,
  getMonstersByType,
  getMonstersByCR,
  monsterNameToSlug,
  getCRValue,
  getTypeValue,
  getSizeValue
} from "@/lib/utils/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const monsters = getAllMonsters();
  const monsterSlugs = monsters.map((monster: any) => ({
    slug: monsterNameToSlug(monster.name),
  }));
  
  // Get unique monster types
  const types = new Set<string>();
  monsters.forEach((monster: any) => {
    if (monster.type) {
      const monsterType = typeof monster.type === 'string' ? monster.type : (monster.type.type || monster.type);
      if (monsterType) {
        types.add(String(monsterType).toLowerCase());
      }
    }
  });
  
  const typeSlugs = Array.from(types).map(type => ({
    slug: type,
  }));
  
  // Get unique CR values
  const crs = new Set<string>();
  monsters.forEach((monster: any) => {
    if (monster.cr) {
      const crValue = getCRValue(monster.cr);
      if (crValue && crValue !== '-') {
        // Store in URL-safe format (use hyphens for fractions)
        const crSlug = String(crValue).toLowerCase().replace(/\//g, '-');
        crs.add(crSlug);
      }
    }
  });
  
  const crSlugs = Array.from(crs).map(cr => ({
    slug: `cr-${cr}`,
  }));
  
  return [...monsterSlugs, ...typeSlugs, ...crSlugs];
}

export default async function MonsterPage({ params }: PageProps) {
  const { slug } = await params;
  const slugLower = slug.toLowerCase();
  
  // First try to find as a monster (prioritize exact name matches)
  const monster = getMonsterBySlug(slug);
  
  // If we found a monster, show it
  if (monster) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/monsters"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Monsters
            </Link>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 mb-6">
            <h1 className="text-4xl font-bold mb-4 text-black dark:text-zinc-50">
              {monster.name}
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
              {monster.type && (
                <div>
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Type:</span>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100 capitalize">{getTypeValue(monster.type)}</span>
                </div>
              )}
              {'cr' in monster && monster.cr && (
                <div>
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">CR:</span>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100">{getCRValue(monster.cr)}</span>
                </div>
              )}
              {monster.size && (
                <div>
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Size:</span>{' '}
                  <span className="text-zinc-900 dark:text-zinc-100">{getSizeValue(monster.size)}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Source:</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100">{monster.source}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-zinc-50">
              Full Data
            </h2>
            <div className="font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(monster, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if it's a CR filter (format: cr-1, cr-2, etc.)
  if (slugLower.startsWith('cr-')) {
    const crValue = slugLower.replace('cr-', '');
    const crMonsters = getMonstersByCR(crValue);
    
    if (crMonsters.length > 0) {
      const sortedMonsters = [...crMonsters].sort((a: any, b: any) => 
        a.name.localeCompare(b.name)
      );
      
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Link 
                href="/monsters"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to Monsters
              </Link>
            </div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
                CR {crValue.replace(/-/g, '/').toUpperCase()} Monsters
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Total: {crMonsters.length} {crMonsters.length === 1 ? 'monster' : 'monsters'}
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
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        CR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                    {sortedMonsters.map((monster: any) => (
                      <tr key={monster.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/monsters/${monsterNameToSlug(monster.name)}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {monster.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 capitalize">
                          {getTypeValue(monster.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {getCRValue(monster.cr)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {monster.source}
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
  }
  
  // Check if it's a type filter
  const typeMonsters = getMonstersByType(slugLower);
  
  if (typeMonsters.length > 0) {
    const sortedMonsters = [...typeMonsters].sort((a: any, b: any) => 
      a.name.localeCompare(b.name)
    );
    
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/monsters"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Monsters
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50 capitalize">
              {slugLower} Monsters
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Total: {typeMonsters.length} {typeMonsters.length === 1 ? 'monster' : 'monsters'}
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
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      CR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {sortedMonsters.map((monster: any) => (
                    <tr key={monster.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/monsters/${monsterNameToSlug(monster.name)}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {monster.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100 capitalize">
                        {getTypeValue(monster.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {getCRValue(monster.cr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {monster.source}
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
  
  // Not a monster and not a type filter
  notFound();
}

