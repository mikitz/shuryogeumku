import Link from "next/link";
import { getItemsByType, itemNameToSlug } from "@/lib/utils/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ tier: string }>;
}

export async function generateStaticParams() {
  return [
    { tier: 'none' },
    { tier: 'minor' },
    { tier: 'major' },
  ];
}

export default async function WondrousTierPage({ params }: PageProps) {
  const { tier } = await params;
  const tierLower = tier.toLowerCase();
  
  if (!['none', 'minor', 'major'].includes(tierLower)) {
    notFound();
  }
  
  const items = getItemsByType(`wondrous-${tierLower}`);
  const sortedItems = [...items].sort((a: any, b: any) => 
    a.name.localeCompare(b.name)
  );
  
  const title = `Wondrous Items (${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier)`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/items/wondrous"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Wondrous Items
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-8 text-black dark:text-zinc-50">
          {title}
        </h1>
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-100 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Rarity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Tier
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
                      {item.rarity || 'none'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                      {item.tier || tierLower}
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

