import { users } from "../data/mockData.js";

const VALID_STATUSES = ["verified", "pending", "unverified"];
const INVALID_STATUS_MESSAGE =
  "Invalid status value. Must be one of: verified, pending, unverified";

/**
 * Returns the full user list from the in-memory store.
 */
export const getUsers = (req, res) => {
  return res.status(200).json({ success: true, data: users });
};

/**
 * Updates a user's verification status in the in-memory store.
 */
export const updateUserStatus = (req, res) => {
  const { status } = req.body;
  const { userId } = req.params;

  if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: INVALID_STATUS_MESSAGE,
    });
  }

  const user = users.find((currentUser) => currentUser.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();

  return res.status(200).json({ success: true, data: user });
};

