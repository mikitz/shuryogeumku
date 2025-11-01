import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-xl font-bold text-black dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              D&D 2024 Reference
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                href="/spells"
                className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Spells
              </Link>
              <Link
                href="/items"
                className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Items
              </Link>
              <Link
                href="/monsters"
                className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Monsters
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

