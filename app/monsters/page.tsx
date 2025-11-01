import Link from "next/link";
import SearchBox from "../components/SearchBox";
import { getAllMonsters, monsterNameToSlug, getCRValue, getTypeValue } from "@/lib/utils/data";

export default function MonstersPage() {
  const monsters = getAllMonsters();
  
  // Prepare search data
  const searchItems = monsters.map((monster: any) => ({
    name: monster.name,
    href: `/monsters/${monsterNameToSlug(monster.name)}`,
    type: 'Monster',
    metadata: monster.cr ? `CR: ${typeof monster.cr === 'string' ? monster.cr : monster.cr.cr || '-'}` : undefined
  }));
  
  // Sort monsters by name
  const sortedMonsters = [...monsters].sort((a: any, b: any) => 
    a.name.localeCompare(b.name)
  );

  // Get unique monster types
  const types = new Set<string>();
  monsters.forEach((monster: any) => {
    if (monster.type) {
      const monsterType = typeof monster.type === 'string' ? monster.type : (monster.type.type || monster.type);
      if (monsterType && typeof monsterType === 'string') {
        types.add(monsterType.toLowerCase());
      }
    }
  });
  const monsterTypes = Array.from(types).sort();
  
  // Get unique CR values (use URL-safe format with hyphens)
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
  const monsterCRs = Array.from(crs).sort((a, b) => {
    // Sort CRs: convert to numbers for sorting, handle fractions
    // a and b are in URL format with hyphens, need to convert for comparison
    const aFrac = a.replace(/-/g, '/');
    const bFrac = b.replace(/-/g, '/');
    const aNum = aFrac === '1/8' ? 0.125 : aFrac === '1/4' ? 0.25 : aFrac === '1/2' ? 0.5 : aFrac === '3/4' ? 0.75 : parseFloat(aFrac) || 0;
    const bNum = bFrac === '1/8' ? 0.125 : bFrac === '1/4' ? 0.25 : bFrac === '1/2' ? 0.5 : bFrac === '3/4' ? 0.75 : parseFloat(bFrac) || 0;
    return aNum - bNum;
  });

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
            Monsters
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Total: {monsters.length} {monsters.length === 1 ? 'monster' : 'monsters'}
          </p>
        </div>
        
        {/* Search Box */}
        <div className="mb-6">
          <SearchBox 
            items={searchItems} 
            placeholder="Search monsters..."
          />
        </div>

        {/* Filter Links */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Types:</span>
            {monsterTypes.map((type) => (
              <Link
                key={type}
                href={`/monsters/${type}`}
                className="px-3 py-1 text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors capitalize"
              >
                {type}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">CR:</span>
            {monsterCRs.map((cr) => (
              <Link
                key={cr}
                href={`/monsters/cr-${cr}`}
                className="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
              >
                CR {cr.replace(/-/g, '/').toUpperCase()}
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

