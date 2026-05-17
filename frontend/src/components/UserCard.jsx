import {
  STATUS_LABELS,
} from "../constants/statusOptions.js";
import StatusBadge from "./StatusBadge.jsx";
import StatusSelect from "./StatusSelect.jsx";

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
            <StatusSelect
              userName={user.name}
              value={user.status}
              onChange={(nextStatus) => onStatusChange(user.id, nextStatus)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
