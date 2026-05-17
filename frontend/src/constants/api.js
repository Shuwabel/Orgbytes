export const API_BASE_URL = "http://localhost:5000";

export const ENDPOINTS = {
  getUsers: `${API_BASE_URL}/users`,
  updateStatus: (userId) => `${API_BASE_URL}/users/${userId}/status`,
};

