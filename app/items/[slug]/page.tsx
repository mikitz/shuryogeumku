import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  getAllItems,
  getItemBySlug,
  getItemsByType,
  itemNameToSlug
} from "@/lib/utils/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = getAllItems();
  const itemSlugs = items.map((item: any) => ({
    slug: itemNameToSlug(item.name),
  }));
  
  // Add filter routes
  const filterSlugs = [
    'weapons', 'weapon',
    'melee',
    'ranged',
    'armor',
    'light',
    'medium',
    'heavy',
    'poisons',
    'potions',
    'rings',
    'rods',
    'wands'
  ].map(f => ({ slug: f }));
  
  return [...itemSlugs, ...filterSlugs];
}

export default async function ItemPage({ params }: PageProps) {
  const { slug } = await params;
  // Normalize slug - handle potential URL encoding issues with +
  // Next.js might pass + as-is or as %2B
  const normalizedSlug = slug.includes('%2B') ? decodeURIComponent(slug) : slug;
  const slugLower = normalizedSlug.toLowerCase();
  
  // Check if it's a filter
  const filterMap: Record<string, string> = {
    'weapons': 'weapon',
    'weapon': 'weapon',
    'melee': 'melee',
    'ranged': 'ranged',
    'armor': 'armor',
    'light': 'light',
    'medium': 'medium',
    'heavy': 'heavy',
    'poisons': 'poisons',
    'potions': 'potions',
    'rings': 'rings',
    'rods': 'rods',
    'wands': 'wands',
  };
  
  const filterType = filterMap[slugLower];
  
  if (filterType) {
    const filteredItems = getItemsByType(filterType);
    const sortedItems = [...filteredItems].sort((a: any, b: any) => 
      a.name.localeCompare(b.name)
    );
    
    let title = slugLower;
    if (slugLower === 'weapons' || slugLower === 'weapon') {
      title = 'Weapons';
    } else if (slugLower === 'melee') {
      title = 'Melee Weapons';
    } else if (slugLower === 'ranged') {
      title = 'Ranged Weapons';
    } else if (slugLower === 'armor') {
      title = 'Armor';
    } else if (slugLower === 'light') {
      title = 'Light Armor';
    } else if (slugLower === 'medium') {
      title = 'Medium Armor';
    } else if (slugLower === 'heavy') {
      title = 'Heavy Armor';
    } else if (slugLower === 'poisons') {
      title = 'Poisons';
    } else if (slugLower === 'potions') {
      title = 'Potions';
    } else if (slugLower === 'rings') {
      title = 'Rings';
    } else if (slugLower === 'rods') {
      title = 'Rods';
    } else if (slugLower === 'wands') {
      title = 'Wands';
    }
    
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/items"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Items
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50 capitalize">
              {title}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Total: {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
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
                      Rarity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {sortedItems.map((item: any) => (
                    <tr key={item.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/items/${itemNameToSlug(item.name)}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {item.type || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {item.rarity || 'none'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {item.source}
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
  
  // Check for armor sub-routes: /items/armor/light, etc.
  // This would require a different route structure, but let's handle it here
  // Actually, Next.js will handle /items/armor/light differently, so we need separate routes
  
  // Otherwise, try to find as an item
  // Try with the original slug first (Next.js should preserve + in route params)
  let item = getItemBySlug(slug);
  
  // If not found, try normalized version
  if (!item && slug !== normalizedSlug) {
    item = getItemBySlug(normalizedSlug);
  }
  
  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/items"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Items
          </Link>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 mb-6">
          <h1 className="text-4xl font-bold mb-4 text-black dark:text-zinc-50">
            {item.name}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
            {item.type && (
              <div>
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Type:</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100">{item.type}</span>
              </div>
            )}
            {item.rarity && (
              <div>
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Rarity:</span>{' '}
                <span className="text-zinc-900 dark:text-zinc-100 capitalize">{item.rarity}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">Source:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">{item.source}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-zinc-50">
            Full Data
          </h2>
          <div className="font-mono text-sm overflow-x-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

