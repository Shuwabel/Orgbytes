import {
  FILTER_OPTIONS,
  STATUS,
  STATUS_LABELS,
} from "../constants/statusOptions.js";
import StatusBadge from "./StatusBadge.jsx";

/**
 * Displays a single user record and status update control.
 */
export default function UserCard({ user, onStatusChange }) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
          {initials}
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">{user.name}</h2>
          <p className="text-[13px] text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {user.categories.map((category) => (
          <span
            key={category}
            className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary"
          >
            {category}
          </span>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-gray-500">Status</span>
          <div className="flex items-center gap-3">
            <StatusBadge status={user.status} />
            <label className="relative block">
              <select
                value={user.status}
                onChange={(event) => onStatusChange(user.id, event.target.value)}
                aria-label={`Update ${user.name} status`}
                className="peer absolute inset-0 z-10 h-9 w-10 cursor-pointer appearance-none opacity-0"
              >
                {FILTER_OPTIONS.filter((option) => option !== STATUS.ALL).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none flex h-9 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 peer-focus:ring-2 peer-focus:ring-primary">
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
                  <path
                    d="M5.47 7.97a.75.75 0 0 1 1.06 0L10 11.44l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}
