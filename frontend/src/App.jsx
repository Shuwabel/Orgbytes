import EmptyState from "./components/EmptyState.jsx";
import ErrorState from "./components/ErrorState.jsx";
import FilterBar from "./components/FilterBar.jsx";
import LoadingState from "./components/LoadingState.jsx";
import SearchInput from "./components/SearchInput.jsx";
import UserCard from "./components/UserCard.jsx";
import { STATUS } from "./constants/statusOptions.js";
import { useUsers } from "./hooks/useUsers.js";

function getStatusCounts(users) {
  return users.reduce(
    (counts, user) => {
      counts.total += 1;
      counts[user.status] += 1;
      return counts;
    },
    {
      total: 0,
      verified: 0,
      pending: 0,
      unverified: 0,
    }
  );
}

/**
 * Renders the OrgByte verification dashboard.
 */
export default function App() {
  const {
    users,
    visibleUsers,
    loading,
    error,
    activeFilter,
    searchQuery,
    setActiveFilter,
    setSearchQuery,
    updateStatus,
    retryFetch,
  } = useUsers();

  const counts = getStatusCounts(users);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="flex h-[60px] items-center justify-between bg-primary px-6 text-white shadow-sm shadow-primary-dark/20">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">OrgByte</span>
          <span className="h-6 w-px bg-white/30" />
          <span className="text-base text-white/90">Verification Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-white/90 sm:inline">Admin</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/20">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4 text-white"
            >
              <path
                d="M10 3.25a3.25 3.25 0 1 1 0 6.5a3.25 3.25 0 0 1 0-6.5Zm0 8c-3.176 0-5.75 2.127-5.75 4.75c0 .414.336.75.75.75h10c.414 0 .75-.336.75-.75c0-2.623-2.574-4.75-5.75-4.75Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </div>
      </header>

      <section className="flex h-10 items-center gap-6 bg-gray-100 px-6 text-[13px] text-gray-500">
        <span>
          Total: <strong className="text-primary">{counts.total}</strong>
        </span>
        <span>
          Verified: <strong className="text-secondary">{counts.verified}</strong>
        </span>
        <span>
          Pending: <strong className="text-status-pending">{counts.pending}</strong>
        </span>
        <span>
          Unverified:{" "}
          <strong className="text-status-unverified">{counts.unverified}</strong>
        </span>
      </section>

      <main>
        <section className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4 md:flex-row md:items-center">
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <SearchInput searchQuery={searchQuery} onSearch={setSearchQuery} />
        </section>

        <section className="py-6">
          {loading && <LoadingState />}
          {!loading && error && (
            <ErrorState message={error} onRetry={retryFetch} />
          )}
          {!loading && !error && visibleUsers.length === 0 && <EmptyState />}
          {!loading && !error && visibleUsers.length > 0 && (
            <div className="grid grid-cols-1 gap-6 px-6 pb-8 md:grid-cols-2 lg:grid-cols-3">
              {visibleUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onStatusChange={updateStatus}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
