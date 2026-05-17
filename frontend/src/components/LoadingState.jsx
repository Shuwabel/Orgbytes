/**
 * Displays placeholder cards while user data is loading.
 */
export default function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 px-6 pb-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-card"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="mb-5 flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-gray-100" />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <div className="mb-4 h-6 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

