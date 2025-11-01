export default function ClassesLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

