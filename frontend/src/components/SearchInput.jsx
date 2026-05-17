/**
 * Displays the controlled name search field.
 */
export default function SearchInput({ searchQuery, onSearch }) {
  return (
    <label className="relative block w-full md:w-64">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      >
        <path
          d="M8.5 3.5a5 5 0 1 0 3.123 8.905l3.486 3.486 1.061-1.061-3.486-3.486A5 5 0 0 0 8.5 3.5Zm0 1.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7Z"
          fill="currentColor"
        />
      </svg>
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search by name..."
        className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
      />
    </label>
  );
}

