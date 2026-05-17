import { STATUS } from "../constants/statusOptions.js";

/**
 * Returns users matching the current status filter and name query.
 */
export function filterUsers(users, activeFilter, searchQuery) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return users
    .filter((user) => activeFilter === STATUS.ALL || user.status === activeFilter)
    .filter((user) => user.name.toLowerCase().includes(normalizedQuery));
}
