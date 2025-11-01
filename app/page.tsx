import Link from "next/link";
import SearchBox from "./components/SearchBox";
import { getAllSpells, getAllItems, getAllMonsters, spellNameToSlug, itemNameToSlug, monsterNameToSlug, SPELL_SCHOOLS } from "@/lib/utils/data";

export default function Home() {
  // Prepare search data
  const spells = getAllSpells();
  const items = getAllItems();
  const monsters = getAllMonsters();
  
  const searchItems = [
    ...spells.map((spell: any) => ({
      name: spell.name,
      href: `/spells/${spellNameToSlug(spell.name)}`,
      type: 'Spell',
      metadata: `Level ${spell.level === 0 ? 'Cantrip' : spell.level} • ${SPELL_SCHOOLS[spell.school] || spell.school}`
    })),
    ...items.map((item: any) => ({
      name: item.name,
      href: `/items/${itemNameToSlug(item.name)}`,
      type: 'Item',
      metadata: item.type ? `Type: ${item.type}` : undefined
    })),
    ...monsters.map((monster: any) => ({
      name: monster.name,
      href: `/monsters/${monsterNameToSlug(monster.name)}`,
      type: 'Monster',
      metadata: monster.cr ? `CR: ${typeof monster.cr === 'string' ? monster.cr : monster.cr.cr || '-'}` : undefined
    }))
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <h1 className="mb-12 text-4xl font-bold text-black dark:text-zinc-50">
          D&D 2024 Reference
        </h1>
        <div className="w-full mb-12">
          <SearchBox 
            items={searchItems} 
            placeholder="Search spells, items, monsters..."
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full">
          <Link
            href="/spells"
            className="flex flex-col p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800"
          >
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
              Spells
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Browse all spells from the 2024 Player&apos;s Handbook
            </p>
          </Link>
          <Link
            href="/items"
            className="flex flex-col p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800"
          >
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
              Items
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Browse all items including weapons, armor, and magic items
            </p>
          </Link>
          <Link
            href="/monsters"
            className="flex flex-col p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-zinc-200 dark:border-zinc-800"
          >
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
              Monsters
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Browse all monsters and creatures
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
