import Link from "next/link";
import SearchBox from "../components/SearchBox";
import { getAllItems, itemNameToSlug } from "@/lib/utils/data";

export default function ItemsPage() {
  const items = getAllItems();
  
  // Prepare search data
  const searchItems = items.map((item: any) => ({
    name: item.name,
    href: `/items/${itemNameToSlug(item.name)}`,
    type: 'Item',
    metadata: item.type ? `Type: ${item.type}` : undefined
  }));
  
  // Sort items by name
  const sortedItems = [...items].sort((a: any, b: any) => 
    a.name.localeCompare(b.name)
  );

  const itemTypes = [
    { slug: 'weapon', label: 'Weapons' },
    { slug: 'melee', label: 'Melee Weapons' },
    { slug: 'ranged', label: 'Ranged Weapons' },
    { slug: 'armor', label: 'Armor' },
    { slug: 'light', label: 'Light Armor' },
    { slug: 'medium', label: 'Medium Armor' },
    { slug: 'heavy', label: 'Heavy Armor' },
    { slug: 'poisons', label: 'Poisons' },
    { slug: 'potions', label: 'Potions' },
    { slug: 'rings', label: 'Rings' },
    { slug: 'rods', label: 'Rods' },
    { slug: 'wands', label: 'Wands' }
  ];

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
            Items
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Total: {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        
        {/* Search Box */}
        <div className="mb-6">
          <SearchBox 
            items={searchItems} 
            placeholder="Search items..."
          />
        </div>

        {/* Filter Links */}
        <div className="mb-6 flex flex-wrap gap-2">
          {itemTypes.map((type) => (
            <Link
              key={type.slug}
              href={`/items/${type.slug}`}
              className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
              {type.label}
            </Link>
          ))}
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

