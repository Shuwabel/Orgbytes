import { STATUS_LABELS } from "../constants/statusOptions.js";

const BADGE_STYLES = {
  verified: "bg-status-verifiedBg text-status-verified",
  pending: "bg-status-pendingBg text-status-pending",
  unverified: "bg-status-unverifiedBg text-status-unverified",
};

/**
 * Displays the current verification status.
 */
export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${BADGE_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
