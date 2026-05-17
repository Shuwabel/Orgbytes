# OrgByte Verification Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not skip phases. The backend must work before frontend integration begins.

**Goal:** Build a full-stack OrgByte verification management dashboard where an admin can view users, filter by status, search by name, and update verification status without reloading the page.

**Architecture:** Use a decoupled monorepo with independent `backend/` and `frontend/` packages. The backend is the source of truth through an in-memory Express API; the frontend fetches once, derives visible users client-side, and performs pessimistic status updates through `PATCH`.

**Tech Stack:** Node.js 18+, npm 9+, Express 4, cors, nodemon, React 18, Vite 5, Tailwind CSS 3, native `fetch`.

**Source Documents Used:**
- `plan/orgbyte-dashboard-PRD.md`
- `plan/orgbyte-dashboard-TRD.md`
- `plan/orgbyte-dashboard-backend-schema.md`
- `plan/orgbyte-dashboard-UI-UX-brief.md`
- `plan/orgbyte_dashboard_app_flow.svg`

---

## Non-Negotiable Build Rules

- Build backend first. Do not scaffold or wire frontend API calls until `GET /users` and `PATCH /users/:userId/status` are manually verified.
- Keep `/backend` and `/frontend` independent. Each has its own `package.json` and `node_modules`.
- Use npm only. Do not use yarn, pnpm, axios, Redux, React Query, UI libraries, or a database.
- Keep business logic out of route files and `server.js`.
- Keep fetch calls out of React components. All frontend API calls live in `frontend/src/hooks/useUsers.js`.
- Keep filtering/searching in `frontend/src/utils/filterUsers.js`.
- Use constants for status strings and API URLs.
- Preserve the exact seed data from the backend schema.
- Use pessimistic updates: call the API first, update UI only after a successful response.
- No page reloads, no full refetch after status update.

---

## Target File Map

Create this final structure:

```text
orgbyte-dashboard/
  backend/
    package.json
    src/
      server.js
      controllers/
        userController.js
      data/
        mockData.js
      routes/
        userRoutes.js
  frontend/
    package.json
    index.html
    postcss.config.js
    tailwind.config.js
    vite.config.js
    src/
      App.jsx
      index.css
      main.jsx
      components/
        EmptyState.jsx
        ErrorState.jsx
        FilterBar.jsx
        LoadingState.jsx
        SearchInput.jsx
        StatusBadge.jsx
        UserCard.jsx
      constants/
        api.js
        statusOptions.js
      hooks/
        useUsers.js
      utils/
        filterUsers.js
  .gitignore
  README.md
```

---

## Phase 0: Repository Baseline

**Why this comes first:** The project is a two-package monorepo. The root must be clean before package-specific setup begins.

### Task 0.1: Create root ignore rules

**Files:**
- Create: `.gitignore`

- [ ] Add root `.gitignore`:

```gitignore
node_modules/
.env
.DS_Store
dist/
```

- [ ] Completion check:

```bash
git status --short
```

Expected: `.gitignore` appears as a new file.

---

## Phase 1: Backend Foundation

**Why this phase comes before frontend:** The frontend must consume live API data. Building UI before these endpoints exist invites hardcoded data and broken integration assumptions.

### Task 1.1: Initialize backend package

**Files:**
- Create: `backend/package.json`

- [ ] Create `backend/`.
- [ ] From inside `backend/`, initialize npm:

```bash
npm init -y
```

- [ ] Install runtime dependencies:

```bash
npm install express@^4.18.2 cors@^2.8.5
```

- [ ] Install dev dependency:

```bash
npm install -D nodemon@^3.0.1
```

- [ ] Update `backend/package.json` to include ESM and scripts:

```json
{
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

- [ ] Completion check:

```bash
npm run start
```

Expected at this point: it may fail because `src/server.js` does not exist yet. That is acceptable for this task.

### Task 1.2: Add canonical seed data

**Files:**
- Create: `backend/src/data/mockData.js`

- [ ] Create `backend/src/data/mockData.js` with exactly this data:

```js
export const users = [
  {
    id: "user-1",
    name: "Amara Osei",
    status: "verified",
    categories: ["Passport", "Bank Statement"],
    updatedAt: "2026-05-01T09:00:00Z",
  },
  {
    id: "user-2",
    name: "Emeka Nwosu",
    status: "pending",
    categories: ["ID", "Utility Bill"],
    updatedAt: "2026-05-03T11:30:00Z",
  },
  {
    id: "user-3",
    name: "Fatima Al-Hassan",
    status: "unverified",
    categories: ["ID"],
    updatedAt: "2026-05-05T08:15:00Z",
  },
  {
    id: "user-4",
    name: "Chidi Okeke",
    status: "verified",
    categories: ["Business Reg", "Tax Certificate"],
    updatedAt: "2026-05-06T14:00:00Z",
  },
  {
    id: "user-5",
    name: "Ngozi Adeyemi",
    status: "pending",
    categories: ["Passport"],
    updatedAt: "2026-05-08T10:45:00Z",
  },
  {
    id: "user-6",
    name: "Kwame Mensah",
    status: "unverified",
    categories: ["Utility Bill", "Bank Statement"],
    updatedAt: "2026-05-09T16:20:00Z",
  },
  {
    id: "user-7",
    name: "Zainab Bello",
    status: "verified",
    categories: ["ID", "Passport", "Bank Statement"],
    updatedAt: "2026-05-10T13:00:00Z",
  },
  {
    id: "user-8",
    name: "Tunde Fashola",
    status: "pending",
    categories: ["Tax Certificate"],
    updatedAt: "2026-05-11T09:30:00Z",
  },
  {
    id: "user-9",
    name: "Adaeze Eze",
    status: "verified",
    categories: ["Business Reg", "Utility Bill"],
    updatedAt: "2026-05-12T12:00:00Z",
  },
  {
    id: "user-10",
    name: "Seun Kuti",
    status: "unverified",
    categories: ["ID", "Tax Certificate"],
    updatedAt: "2026-05-13T15:45:00Z",
  },
];
```

- [ ] Completion check:

```bash
node -e "import('./src/data/mockData.js').then(({users}) => console.log(users.length, users.filter(u => u.status === 'verified').length, users.filter(u => u.status === 'pending').length, users.filter(u => u.status === 'unverified').length))"
```

Expected: `10 4 3 3`.

### Task 1.3: Implement backend controllers

**Files:**
- Create: `backend/src/controllers/userController.js`

- [ ] Add controller code:

```js
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
```

- [ ] Completion check:

```bash
node -e "import('./src/controllers/userController.js').then((module) => console.log(typeof module.getUsers, typeof module.updateUserStatus))"
```

Expected: `function function`.

### Task 1.4: Implement backend routes

**Files:**
- Create: `backend/src/routes/userRoutes.js`

- [ ] Add route definitions:

```js
import { Router } from "express";
import { getUsers, updateUserStatus } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.patch("/:userId/status", updateUserStatus);

export default router;
```

- [ ] Completion check:

```bash
node -e "import('./src/routes/userRoutes.js').then((module) => console.log(typeof module.default))"
```

Expected: `function`.

### Task 1.5: Implement Express server

**Files:**
- Create: `backend/src/server.js`

- [ ] Add server wiring:

```js
import cors from "cors";
import express from "express";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "PATCH"],
  })
);
app.use(express.json());
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] Start the backend:

```bash
cd backend
npm run dev
```

Expected: `Server running on port 5000`.

### Task 1.6: Verify backend API manually

**Files:**
- No file changes.

- [ ] Verify `GET /users`:

```bash
curl http://localhost:5000/users
```

Expected:
- HTTP 200.
- JSON includes `"success":true`.
- `data` contains 10 users.

- [ ] Verify successful status update:

```bash
curl -X PATCH http://localhost:5000/users/user-3/status -H "Content-Type: application/json" -d "{\"status\":\"verified\"}"
```

Expected:
- HTTP 200.
- JSON includes `"success":true`.
- `data.id` is `"user-3"`.
- `data.status` is `"verified"`.
- `data.updatedAt` is a fresh ISO timestamp.

- [ ] Verify invalid status:

```bash
curl -X PATCH http://localhost:5000/users/user-3/status -H "Content-Type: application/json" -d "{\"status\":\"approved\"}"
```

Expected:
- HTTP 400.
- JSON message is `Invalid status value. Must be one of: verified, pending, unverified`.

- [ ] Verify unknown user:

```bash
curl -X PATCH http://localhost:5000/users/user-999/status -H "Content-Type: application/json" -d "{\"status\":\"verified\"}"
```

Expected:
- HTTP 404.
- JSON message is `User not found`.

- [ ] Milestone commit:

```bash
git add .gitignore backend
git commit -m "feat: implement verification API"
```

---

## Phase 2: Frontend Foundation

**Why this comes after backend:** Now the UI can be wired against a verified local API instead of static card data.

### Task 2.1: Initialize Vite React app

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/index.html`
- Create: `frontend/vite.config.js`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`

- [ ] Create the frontend package:

```bash
npm create vite@latest frontend -- --template react
```

- [ ] Install frontend dependencies:

```bash
cd frontend
npm install
```

- [ ] Confirm scripts in `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

- [ ] Replace `frontend/vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

- [ ] Completion check:

```bash
npm run build
```

Expected: Vite build succeeds with default scaffold.

### Task 2.2: Install and configure Tailwind

**Files:**
- Create or modify: `frontend/tailwind.config.js`
- Create or modify: `frontend/postcss.config.js`
- Modify: `frontend/src/index.css`

- [ ] Install Tailwind dependencies:

```bash
cd frontend
npm install -D tailwindcss@^3.4.0 postcss@^8.4.32 autoprefixer@^10.4.16
```

- [ ] Initialize Tailwind config:

```bash
npx tailwindcss init -p
```

- [ ] Replace `frontend/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1D4ED8",
          light: "#DBEAFE",
          dark: "#1E3A8A",
        },
        secondary: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        status: {
          verified: "#16A34A",
          verifiedBg: "#DCFCE7",
          pending: "#D97706",
          pendingBg: "#FEF3C7",
          unverified: "#6B7280",
          unverifiedBg: "#F3F4F6",
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] Replace `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] Replace `frontend/src/main.jsx`:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] Completion check:

```bash
npm run build
```

Expected: build succeeds.

---

## Phase 3: Frontend Data Layer

**Why this comes before UI components:** The UI should be a rendering layer over tested state and utility behavior.

### Task 3.1: Add frontend constants

**Files:**
- Create: `frontend/src/constants/statusOptions.js`
- Create: `frontend/src/constants/api.js`

- [ ] Add `frontend/src/constants/statusOptions.js`:

```js
export const STATUS = {
  ALL: "all",
  VERIFIED: "verified",
  PENDING: "pending",
  UNVERIFIED: "unverified",
};

export const STATUS_LABELS = {
  all: "All",
  verified: "Verified",
  pending: "Pending",
  unverified: "Unverified",
};

export const FILTER_OPTIONS = [
  STATUS.ALL,
  STATUS.VERIFIED,
  STATUS.PENDING,
  STATUS.UNVERIFIED,
];
```

- [ ] Add `frontend/src/constants/api.js`:

```js
export const API_BASE_URL = "http://localhost:5000";

export const ENDPOINTS = {
  getUsers: `${API_BASE_URL}/users`,
  updateStatus: (userId) => `${API_BASE_URL}/users/${userId}/status`,
};
```

### Task 3.2: Implement pure filtering utility

**Files:**
- Create: `frontend/src/utils/filterUsers.js`

- [ ] Add utility:

```js
import { STATUS } from "../constants/statusOptions";

/**
 * Returns the subset of users matching the active status filter and search query.
 */
export function filterUsers(users, activeFilter, searchQuery) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return users
    .filter((user) => activeFilter === STATUS.ALL || user.status === activeFilter)
    .filter((user) => user.name.toLowerCase().includes(normalizedQuery));
}
```

- [ ] Completion check:

```bash
node --input-type=module -e "import('./src/utils/filterUsers.js').then(({filterUsers}) => { const users = [{name:'Emeka Nwosu', status:'pending'}, {name:'Kwame Mensah', status:'unverified'}]; console.log(filterUsers(users, 'all', 'em').length); console.log(filterUsers(users, 'pending', 'em')[0].name); })"
```

Expected:

```text
2
Emeka Nwosu
```

### Task 3.3: Implement `useUsers` hook

**Files:**
- Create: `frontend/src/hooks/useUsers.js`

- [ ] Add hook:

```js
import { useEffect, useState } from "react";
import { ENDPOINTS } from "../constants/api";
import { STATUS } from "../constants/statusOptions";
import { filterUsers } from "../utils/filterUsers";

/**
 * Owns user fetching, status updates, and filter/search state.
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
    } catch (err) {
      setError(err.message);
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

      const updatedUser = json.data;

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const visibleUsers = filterUsers(users, activeFilter, searchQuery);

  return {
    visibleUsers,
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
```

- [ ] Completion check:

```bash
npm run build
```

Expected: build may fail only if `App.jsx` still imports deleted scaffold assets. Fix scaffold imports before continuing.

---

## Phase 4: Frontend Components

**Why this comes after the hook:** Components can stay simple when they receive state and callbacks through props.

### Task 4.1: Build status badge

**Files:**
- Create: `frontend/src/components/StatusBadge.jsx`

- [ ] Add component:

```jsx
import { STATUS_LABELS } from "../constants/statusOptions";

const BADGE_STYLES = {
  verified: "bg-status-verifiedBg text-status-verified",
  pending: "bg-status-pendingBg text-status-pending",
  unverified: "bg-status-unverifiedBg text-status-unverified",
};

/**
 * Renders a colored verification status pill.
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
```

### Task 4.2: Build filter bar

**Files:**
- Create: `frontend/src/components/FilterBar.jsx`

- [ ] Add component:

```jsx
import { FILTER_OPTIONS, STATUS_LABELS } from "../constants/statusOptions";

/**
 * Renders status filter tabs and reports selection changes.
 */
export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((filterOption) => {
        const isActive = activeFilter === filterOption;
        const className = isActive
          ? "bg-primary text-white"
          : "bg-primary-light text-primary hover:bg-blue-200";

        return (
          <button
            key={filterOption}
            type="button"
            onClick={() => onFilterChange(filterOption)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition ${className}`}
          >
            {STATUS_LABELS[filterOption]}
          </button>
        );
      })}
    </div>
  );
}
```

### Task 4.3: Build search input

**Files:**
- Create: `frontend/src/components/SearchInput.jsx`

- [ ] Add component:

```jsx
/**
 * Renders a controlled name search input.
 */
export default function SearchInput({ searchQuery, onSearch }) {
  return (
    <label className="relative block w-full md:w-64">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
        Search
      </span>
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search by name..."
        className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-16 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
      />
    </label>
  );
}
```

### Task 4.4: Build user card

**Files:**
- Create: `frontend/src/components/UserCard.jsx`

- [ ] Add component:

```jsx
import { FILTER_OPTIONS, STATUS, STATUS_LABELS } from "../constants/statusOptions";
import StatusBadge from "./StatusBadge";

/**
 * Renders a single user and exposes status changes through a callback.
 */
export default function UserCard({ user, onStatusChange }) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
          {initials}
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">{user.name}</h2>
          <p className="text-[13px] text-gray-500">Verification Member</p>
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[13px] text-gray-500">Status</span>
          <StatusBadge status={user.status} />
        </div>

        <label className="block">
          <span className="mb-1 block text-[13px] text-gray-500">Update to</span>
          <select
            value={user.status}
            onChange={(event) => onStatusChange(user.id, event.target.value)}
            className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {FILTER_OPTIONS.filter((option) => option !== STATUS.ALL).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </article>
  );
}
```

### Task 4.5: Build loading, empty, and error states

**Files:**
- Create: `frontend/src/components/LoadingState.jsx`
- Create: `frontend/src/components/EmptyState.jsx`
- Create: `frontend/src/components/ErrorState.jsx`

- [ ] Add `LoadingState.jsx`:

```jsx
/**
 * Renders skeleton cards while the initial user fetch is in progress.
 */
export default function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-6 px-6 pb-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="mb-5 flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
            <div className="h-6 w-28 animate-pulse rounded-full bg-gray-100" />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <div className="mb-4 h-6 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] Add `EmptyState.jsx`:

```jsx
/**
 * Renders the no-results state for active filters and search terms.
 */
export default function EmptyState() {
  return (
    <section className="mx-6 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-400">
        ?
      </div>
      <h2 className="text-base font-semibold text-gray-700">No users found</h2>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your filters or search term.
      </p>
    </section>
  );
}
```

- [ ] Add `ErrorState.jsx`:

```jsx
/**
 * Renders the initial load failure state with a retry action.
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <section className="mx-6 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-400">
        !
      </div>
      <h2 className="text-base font-semibold text-gray-700">Unable to load users</h2>
      <p className="mt-1 text-sm text-gray-500">
        {message || "Check your connection and try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        Retry
      </button>
    </section>
  );
}
```

### Task 4.6: Wire the dashboard in `App.jsx`

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] Replace `App.jsx`:

```jsx
import EmptyState from "./components/EmptyState";
import ErrorState from "./components/ErrorState";
import FilterBar from "./components/FilterBar";
import LoadingState from "./components/LoadingState";
import SearchInput from "./components/SearchInput";
import UserCard from "./components/UserCard";
import { STATUS } from "./constants/statusOptions";
import { useUsers } from "./hooks/useUsers";

/**
 * Renders the OrgByte verification dashboard shell and user grid.
 */
export default function App() {
  const {
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

  const verifiedCount = visibleUsers.filter(
    (user) => user.status === STATUS.VERIFIED
  ).length;
  const pendingCount = visibleUsers.filter(
    (user) => user.status === STATUS.PENDING
  ).length;
  const unverifiedCount = visibleUsers.filter(
    (user) => user.status === STATUS.UNVERIFIED
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="flex h-[60px] items-center justify-between bg-primary px-6 text-white shadow-sm shadow-primary-dark/20">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">OrgByte</span>
          <span className="h-6 w-px bg-white/30" />
          <span className="text-base font-normal text-white/90">
            Verification Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-white/90 sm:inline">Admin</span>
          <span className="h-8 w-8 rounded-full border border-white/70 bg-white/20" />
        </div>
      </header>

      <section className="flex h-10 items-center gap-6 bg-gray-100 px-6 text-[13px] text-gray-500">
        <span>
          Total: <strong className="text-primary">{visibleUsers.length}</strong>
        </span>
        <span>
          Verified: <strong className="text-secondary">{verifiedCount}</strong>
        </span>
        <span>
          Pending: <strong className="text-status-pending">{pendingCount}</strong>
        </span>
        <span>
          Unverified:{" "}
          <strong className="text-status-unverified">{unverifiedCount}</strong>
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
```

- [ ] Completion check:

```bash
npm run build
```

Expected: production build succeeds.

- [ ] Milestone commit:

```bash
git add frontend
git commit -m "feat: build verification dashboard UI"
```

---

## Phase 5: End-to-End Verification

**Why this phase exists:** The product is only done when backend behavior, frontend data flow, and UI states work together.

### Task 5.1: Run both services

**Files:**
- No file changes.

- [ ] Terminal 1:

```bash
cd backend
npm run dev
```

Expected: backend runs at `http://localhost:5000`.

- [ ] Terminal 2:

```bash
cd frontend
npm run dev
```

Expected: frontend runs at `http://localhost:5173`.

### Task 5.2: Verify dashboard default state

- [ ] Open `http://localhost:5173`.
- [ ] Confirm header says `OrgByte` and `Verification Dashboard`.
- [ ] Confirm the `All` filter is active.
- [ ] Confirm 10 cards render.
- [ ] Confirm status distribution from seed data:
  - 4 verified.
  - 3 pending.
  - 3 unverified.
- [ ] Confirm cards show names, category tags, status badges, and controlled dropdowns.

### Task 5.3: Verify filters

- [ ] Click `Verified`.
  - Expected: Amara Osei, Chidi Okeke, Zainab Bello, Adaeze Eze.
- [ ] Click `Pending`.
  - Expected: Emeka Nwosu, Ngozi Adeyemi, Tunde Fashola.
- [ ] Click `Unverified`.
  - Expected: Fatima Al-Hassan, Kwame Mensah, Seun Kuti.
- [ ] Click `All`.
  - Expected: all 10 users.

### Task 5.4: Verify search and composed filtering

- [ ] With `All` active, type `em`.
  - Expected: Emeka Nwosu and Kwame Mensah.
- [ ] With `Pending` active, type `xyz`.
  - Expected: empty state appears.
- [ ] Clear the search.
  - Expected: pending users return.

### Task 5.5: Verify status update flow

- [ ] Change Fatima Al-Hassan from `Unverified` to `Verified`.
- [ ] Confirm the card updates without page reload.
- [ ] Confirm the badge changes to green `Verified`.
- [ ] Confirm a follow-up backend call returns the updated record:

```bash
curl http://localhost:5000/users
```

Expected: `user-3` has `"status":"verified"` until the backend process restarts.

### Task 5.6: Verify error state

- [ ] Stop the backend.
- [ ] Refresh the frontend.
- [ ] Confirm error state appears with `Unable to load users`.
- [ ] Restart backend.
- [ ] Click `Retry`.
- [ ] Confirm users load.

### Task 5.7: Verify responsive layout

- [ ] At mobile width below 768px, confirm grid uses 1 column.
- [ ] At tablet width 768px+, confirm grid uses 2 columns.
- [ ] At desktop width 1024px+, confirm grid uses 3 columns.
- [ ] Confirm controls stack on smaller widths and sit in one row on desktop.

---

## Phase 6: README and Final Polish

**Why this is last:** README content should describe the actual implemented system, not an intended one.

### Task 6.1: Write root README

**Files:**
- Create: `README.md`

- [ ] Include this structure:

````md
# OrgByte Verification Management Dashboard

## Summary

This project is a full-stack verification management dashboard for OrgByte administrators. It includes an Express API and a React dashboard for viewing, filtering, searching, and updating user verification status.

## Prerequisites

- Node.js 18.x or newer
- npm 9.x or newer

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard runs at `http://localhost:5173`.

## Architecture

The repository is a decoupled monorepo with separate `backend/` and `frontend/` packages. The backend owns the in-memory user store and exposes REST endpoints. The frontend fetches from the API, keeps filter and search state locally, and updates one user at a time after successful API responses.

## API Reference

- `GET /users` returns all verification users.
- `PATCH /users/:userId/status` updates one user's verification status.

## Key Decisions

- Data is stored in memory, so changes reset when the backend restarts.
- Status updates are pessimistic: the UI updates only after the API confirms success.
- Filtering and search are client-side after one initial fetch.
- The frontend uses native `fetch`, React state, and Tailwind CSS with no additional state or UI libraries.
````

### Task 6.2: Final validation checklist

- [ ] Run backend API checks from Phase 1.6.
- [ ] Run frontend build:

```bash
cd frontend
npm run build
```

Expected: build succeeds.

- [ ] Run browser checks from Phase 5.
- [ ] Confirm no hardcoded user data exists in frontend components.
- [ ] Confirm no `fetch` calls exist outside `frontend/src/hooks/useUsers.js`.
- [ ] Confirm no route/controller/server responsibility leaks:
  - `server.js` only wires middleware and routes.
  - `userRoutes.js` only maps paths to controllers.
  - `userController.js` owns validation and data mutation.
- [ ] Confirm README documents in-memory reset behavior.

- [ ] Final commit:

```bash
git add .
git commit -m "docs: add project setup and verification guide"
```

---

## Done Criteria

The build is complete only when every item below is true:

- `GET /users` returns 10 users in the expected response envelope.
- `PATCH /users/:userId/status` updates `status` and `updatedAt`.
- Invalid status returns 400 with the required message.
- Unknown user returns 404 with `User not found`.
- Frontend loads all data from the backend, not hardcoded arrays.
- Filter tabs work independently.
- Search works in real time.
- Filter and search compose simultaneously.
- Status dropdown updates the UI after API success with no page reload.
- Loading, empty, and error states are visible under the right conditions.
- Layout matches the OrgByte UI brief: blue header, white controls row, gray page background, responsive card grid, brand color status badges.
- Root README lets a reviewer run both services with clear commands.

---

## Suggested Agent Execution Strategy

Use one task checkpoint per phase:

1. Implement and verify backend.
2. Commit backend.
3. Scaffold and configure frontend.
4. Implement data layer before UI components.
5. Implement UI components and wire `App.jsx`.
6. Run end-to-end verification.
7. Write README and final commit.

Do not continue to the next phase until the current phase's completion checks pass.
