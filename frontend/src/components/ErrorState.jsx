/**
 * Displays the initial load error state with a retry action.
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <section className="mx-6 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-6 w-6">
          <path
            d="M10 2.5 18 17.5H2L10 2.5Zm0 4.244L4.588 16h10.824L10 6.744Zm-.75 2.006h1.5v3.75h-1.5V8.75Zm0 4.75h1.5V15h-1.5v-1.5Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-gray-700">Unable to load users</h2>
      <p className="mt-1 text-sm text-gray-500">
        {message || "Check your connection and try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
      >
        Retry
      </button>
    </section>
  );
}

