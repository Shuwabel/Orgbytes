/**
 * Displays the no-results state for the current filter/search combination.
 */
export default function EmptyState() {
  return (
    <section className="mx-6 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-6 w-6">
          <path
            d="M8.5 3.5a5 5 0 1 0 3.123 8.905l3.486 3.486 1.061-1.061-3.486-3.486A5 5 0 0 0 8.5 3.5Zm0 1.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-gray-700">No users found</h2>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your filters or search term.
      </p>
    </section>
  );
}

