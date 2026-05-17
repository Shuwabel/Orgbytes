import { useEffect, useState } from "react";
import { ENDPOINTS } from "../constants/api.js";
import { STATUS } from "../constants/statusOptions.js";
import { filterUsers } from "../utils/filterUsers.js";

/**
 * Owns user data fetching, updates, and filter state.
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(STATUS.ALL);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(ENDPOINTS.getUsers);
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Unable to load users");
      }

      setUsers(json.data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId, newStatus) => {
    try {
      const response = await fetch(ENDPOINTS.updateStatus(userId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Unable to update user status");
      }

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === json.data.id ? json.data : user
        )
      );
    } catch (updateError) {
      console.error(updateError.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    visibleUsers: filterUsers(users, activeFilter, searchQuery),
    loading,
    error,
    activeFilter,
    searchQuery,
    setActiveFilter,
    setSearchQuery,
    updateStatus,
    retryFetch: fetchUsers,
  };
}
