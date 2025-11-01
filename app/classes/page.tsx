import Link from "next/link";
import SearchBox from "../components/SearchBox";
import { getAllClasses, classNameToSlug } from "@/lib/utils/data";

export default function ClassesPage() {
  const classes = getAllClasses();
  
  // Prepare search data
  const searchItems = classes.map((classItem: any) => ({
    name: classItem.name,
    href: `/classes/${classNameToSlug(classItem.name)}`,
    type: 'Class',
    metadata: classItem.source || undefined
  }));
  
  // Sort classes by name
  const sortedClasses = [...classes].sort((a: any, b: any) => 
    a.name.localeCompare(b.name)
  );

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
            Classes
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Total: {classes.length} {classes.length === 1 ? 'class' : 'classes'}
          </p>
        </div>
        
        {/* Search Box */}
        <div className="mb-6">
          <SearchBox 
            items={searchItems} 
            placeholder="Search classes..."
          />
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
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {sortedClasses.length > 0 ? (
                  sortedClasses.map((classItem: any) => (
                    <tr key={classItem.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/classes/${classNameToSlug(classItem.name)}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {classItem.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                        {classItem.source}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                      No classes found. Class data files need to be added to lib/data/classes/
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

