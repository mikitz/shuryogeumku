import Link from "next/link";
import { getItemsByType, itemNameToSlug } from "@/lib/utils/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return [
    { type: 'light' },
    { type: 'medium' },
    { type: 'heavy' },
  ];
}

export default async function ArmorTypePage({ params }: PageProps) {
  const { type } = await params;
  const typeLower = type.toLowerCase();
  
  if (!['light', 'medium', 'heavy'].includes(typeLower)) {
    notFound();
  }
  
  const items = getItemsByType(typeLower);
  const sortedItems = [...items].sort((a: any, b: any) => 
    a.name.localeCompare(b.name)
  );
  
  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Armor`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/items/armor"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Armor
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    AC
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
                      {item.ac || '-'}
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


