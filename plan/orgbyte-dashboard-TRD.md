# Technical Requirements Document
## OrgByte Verification Management Dashboard
**Derived from:** PRD v1.0
**Version:** 1.0
**Status:** Ready for Implementation

---

## Table of Contents

1. [Environment and Tooling Requirements](#1-environment-and-tooling-requirements)
2. [Repository Initialisation](#2-repository-initialisation)
3. [Backend Technical Requirements](#3-backend-technical-requirements)
4. [Frontend Technical Requirements](#4-frontend-technical-requirements)
5. [Constants and Shared Values](#5-constants-and-shared-values)
6. [Component Contracts](#6-component-contracts)
7. [Hook Specification — useUsers](#7-hook-specification--useusers)
8. [Utility Specification — filterUsers](#8-utility-specification--filterusers)
9. [Seed Data](#9-seed-data)
10. [HTTP and CORS Configuration](#10-http-and-cors-configuration)
11. [Error Handling Requirements](#11-error-handling-requirements)
12. [Styling Implementation](#12-styling-implementation)
13. [Implementation Order](#13-implementation-order)
14. [Definition of Done](#14-definition-of-done)

---

## 1. Environment and Tooling Requirements

### 1.1 Runtime

| Requirement | Value |
|---|---|
| Node.js minimum version | 18.x LTS |
| npm minimum version | 9.x |
| Package manager | npm (no yarn, no pnpm) |

### 1.2 Backend Packages

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 1.3 Frontend Packages

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

No additional libraries. No axios, no React Query, no Redux, no UI component libraries. Native `fetch` and React `useState`/`useEffect` are sufficient and expected.

### 1.4 npm Scripts

**backend/package.json**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

**frontend/package.json**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 1.5 Ports

| Service | Port |
|---|---|
| Backend API | `5000` |
| Frontend dev server | `5173` (Vite default) |

Both ports are fixed. Neither should require manual configuration to run locally.

---

## 2. Repository Initialisation

### 2.1 .gitignore (root level)

```
node_modules/
.env
.DS_Store
dist/
```

### 2.2 Tailwind Configuration

After running `npx tailwindcss init -p` inside `/frontend`, the generated `tailwind.config.js` must be updated to include custom OrgByte colours:

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

### 2.3 Vite Configuration

```js
// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

---

## 3. Backend Technical Requirements

### 3.1 File: `backend/src/server.js`

Permitted operations:
- Import `express`, `cors`, and the user router
- Configure `express.json()` middleware
- Configure `cors` middleware (see Section 10)
- Mount the user router at `/users`
- Call `app.listen()`

Not permitted:
- Any business logic
- Any data access
- Any `if/else` branching

```js
// Expected shape of server.js
import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3.2 File: `backend/src/routes/userRoutes.js`

Permitted operations:
- Import `express.Router()`
- Import controller functions
- Define route paths and map to controllers

Not permitted:
- Any logic, conditionals, or data access

```js
// Expected shape of userRoutes.js
import { Router } from "express";
import { getUsers, updateUserStatus } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);
router.patch("/:userId/status", updateUserStatus);

export default router;
```

### 3.3 File: `backend/src/controllers/userController.js`

**Function: `getUsers(req, res)`**

Requirements:
- Import `users` from `mockData.js`
- Return `res.status(200).json({ success: true, data: users })`
- No filtering, no transformation

**Function: `updateUserStatus(req, res)`**

Requirements:
- Extract `userId` from `req.params.userId`
- Extract `status` from `req.body.status`
- Run validation in this exact order:
  1. If `status` is not in `["verified", "pending", "unverified"]`, return 400
  2. Find user by `id` in the `users` array
  3. If no user found, return 404
  4. Update `user.status` to new value
  5. Update `user.updatedAt` to `new Date().toISOString()`
  6. Return 200 with full updated user object

Validation order matters. Status must be validated before the array lookup so the error message is accurate.

```js
// Validation check — runs first
const VALID_STATUSES = ["verified", "pending", "unverified"];

if (!VALID_STATUSES.includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Invalid status value. Must be one of: verified, pending, unverified",
  });
}
```

The `users` array imported from `mockData.js` is held in memory. Mutations to individual user objects in that array persist for the lifetime of the server process.

### 3.4 File: `backend/src/data/mockData.js`

- Exported as a named export: `export const users = [...]`
- Must contain exactly 10 user objects (2 extra over the required 8 for a stronger demo)
- Status distribution: 4 verified, 3 pending, 3 unverified
- No two users share the same `id`
- Every user has between 1 and 3 categories

---

## 4. Frontend Technical Requirements

### 4.1 File: `frontend/src/main.jsx`

Standard Vite + React entry point. Must import `./index.css` for Tailwind directives.

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

### 4.2 File: `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Nothing else in this file.

### 4.3 File: `frontend/src/App.jsx`

Responsibilities (complete list):
- Call `useUsers()` and destructure all returned values
- Render the page layout: header, controls row, user grid area
- Conditionally render `<LoadingState />` when `loading === true`
- Conditionally render `<EmptyState />` when `loading === false && visibleUsers.length === 0`
- Render `<FilterBar />`, `<SearchInput />`, and `<UserCard />` components with correct props
- Pass `onStatusChange` down to each `<UserCard />`

Not permitted:
- Any `fetch` calls
- Any `useState` or `useEffect` declarations
- Any filtering logic

```jsx
// Expected structure of App.jsx
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
  } = useUsers();

  return (
    <div>
      <header> ... </header>
      <main>
        <div> {/* controls row */}
          <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <SearchInput searchQuery={searchQuery} onSearch={setSearchQuery} />
        </div>

        {loading && <LoadingState />}
        {!loading && visibleUsers.length === 0 && <EmptyState />}
        {!loading && visibleUsers.length > 0 && (
          <div> {/* grid */}
            {visibleUsers.map((user) => (
              <UserCard key={user.id} user={user} onStatusChange={updateStatus} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 5. Constants and Shared Values

### 5.1 `frontend/src/constants/statusOptions.js`

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

### 5.2 `frontend/src/constants/api.js`

```js
export const API_BASE_URL = "http://localhost:5000";

export const ENDPOINTS = {
  getUsers: `${API_BASE_URL}/users`,
  updateStatus: (userId) => `${API_BASE_URL}/users/${userId}/status`,
};
```

All fetch calls must use `ENDPOINTS.*`. No URL strings may be constructed inline inside hook or component files.

---

## 6. Component Contracts

Each component is defined by its props. These are the authoritative interfaces. Do not pass props that are not listed here.

### 6.1 `UserCard.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `user` | object | Yes | Full user object from state |
| `onStatusChange` | function | Yes | Called with `(userId, newStatus)` when dropdown changes |

Internal behaviour:
- Renders: `user.name`, `user.categories` (as individual tags), `<StatusBadge status={user.status} />`, a `<select>` dropdown
- The dropdown's current value must be controlled: `value={user.status}`
- On `onChange`, calls `onStatusChange(user.id, event.target.value)`
- Must not hold internal state for the status value — the source of truth is the `user` object from props

### 6.2 `StatusBadge.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `status` | string | Yes | One of: `"verified"`, `"pending"`, `"unverified"` |

Internal behaviour:
- Maps each status to a Tailwind class pair (background + text colour)
- Uses a lookup object, not a chain of `if/else` or `switch`:

```js
const BADGE_STYLES = {
  verified: "bg-status-verifiedBg text-status-verified",
  pending: "bg-status-pendingBg text-status-pending",
  unverified: "bg-status-unverifiedBg text-status-unverified",
};
```

- Renders a `<span>` with the appropriate classes and the capitalised status label

### 6.3 `FilterBar.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `activeFilter` | string | Yes | Currently active filter value |
| `onFilterChange` | function | Yes | Called with the filter string when a tab is clicked |

Internal behaviour:
- Iterates over `FILTER_OPTIONS` from constants to render buttons (no hardcoded button list)
- Active button: `bg-primary text-white`
- Inactive button: `bg-primary-light text-primary`

### 6.4 `SearchInput.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `searchQuery` | string | Yes | Controlled input value |
| `onSearch` | function | Yes | Called with the input string on every `onChange` event |

Internal behaviour:
- A single controlled `<input type="text" />`
- Placeholder: `"Search by name..."`
- No debouncing — filters on every keystroke

### 6.5 `LoadingState.jsx`

No props. Renders a centred loading indicator. Implementation is at developer discretion (spinner, skeleton cards, or pulsing placeholder). Must not render any real user data.

### 6.6 `EmptyState.jsx`

No props. Renders a centred message: `"No users match your current filters."` Must include a supporting icon or illustration to avoid looking like a layout bug.

---

## 7. Hook Specification — useUsers

**File:** `frontend/src/hooks/useUsers.js`

### 7.1 State Variables

| Variable | Initial Value | Type | Description |
|---|---|---|---|
| `users` | `[]` | array | Master user list. Never mutated directly — always replaced via setter. |
| `loading` | `true` | boolean | True while the initial fetch is in flight |
| `error` | `null` | string or null | Holds error message string on fetch failure |
| `activeFilter` | `"all"` | string | Currently selected status filter |
| `searchQuery` | `""` | string | Current search input value |

### 7.2 Derived Value

`visibleUsers` is not stored in state. It is computed inline from `users`, `activeFilter`, and `searchQuery` using `filterUsers()` and returned from the hook on every render:

```js
const visibleUsers = filterUsers(users, activeFilter, searchQuery);
```

This means it is always in sync with the current state without requiring a separate `useEffect`.

### 7.3 `fetchUsers` (internal async function)

- Calls `ENDPOINTS.getUsers` with `fetch()`
- Wraps the call in `try/catch`
- Sets `loading: true` before the call
- On success: sets `users` to `response.data`
- On failure: sets `error` to the caught error message
- Sets `loading: false` in the `finally` block (not in try or catch)
- Called once inside `useEffect` with an empty dependency array `[]`

### 7.4 `updateStatus` (returned function)

Signature: `updateStatus(userId, newStatus)`

Steps:
1. Call `fetch(ENDPOINTS.updateStatus(userId), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) })`
2. Wrap in `try/catch`
3. On success: update the matching user in `users` state using `.map()`
4. On failure: log the error (no UI error state required for PATCH failures at MVP)

The state update must use the user object returned from the API response, not a locally constructed object:

```js
// Correct — uses server-returned object as source of truth
setUsers((prev) =>
  prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
);
```

### 7.5 Return Value

The hook returns a single object:

```js
return {
  visibleUsers,   // derived — what gets rendered
  loading,
  error,
  activeFilter,
  searchQuery,
  setActiveFilter,
  setSearchQuery,
  updateStatus,
};
```

---

## 8. Utility Specification — filterUsers

**File:** `frontend/src/utils/filterUsers.js`

### Signature

```js
/**
 * Returns the subset of users matching the active status filter and search query.
 * Both conditions apply simultaneously. Safe to call with empty arrays or empty strings.
 *
 * @param {Array} users - The master user list
 * @param {string} activeFilter - One of: "all", "verified", "pending", "unverified"
 * @param {string} searchQuery - Partial or full name to match against
 * @returns {Array} Filtered array of user objects
 */
export function filterUsers(users, activeFilter, searchQuery) { ... }
```

### Logic Requirements

1. If `activeFilter` is not `"all"`, filter the array to users whose `status === activeFilter`
2. If `searchQuery` is not empty, further filter to users whose `name.toLowerCase()` includes `searchQuery.toLowerCase().trim()`
3. Both filters compose — both conditions must be true simultaneously
4. Return the filtered array. Return an empty array `[]`, not `null`, when no results match.
5. Must not mutate the original `users` array — use chained `.filter()` calls only

This function must have zero side effects and zero React dependencies. It is a pure function.

---

## 9. Seed Data

The following 10 users must be seeded in `backend/src/data/mockData.js`. This exact data is required so filtering can be verified predictably during review.

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

---

## 10. HTTP and CORS Configuration

### 10.1 CORS

The backend must allow requests from `http://localhost:5173` only. Do not use `cors()` with no options — that allows all origins, which is too permissive even for development.

```js
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "PATCH"],
}));
```

### 10.2 Request Headers

All `PATCH` requests from the frontend must include:

```
Content-Type: application/json
```

### 10.3 Response Headers

Express with `res.json()` sets `Content-Type: application/json` automatically. No manual header configuration required.

### 10.4 HTTP Status Codes Used

| Status | When |
|---|---|
| `200` | Successful GET or PATCH |
| `400` | Invalid status value in PATCH body |
| `404` | User ID not found on PATCH |

No other status codes are used in this application.

---

## 11. Error Handling Requirements

### 11.1 Backend Error Rules

- Every controller function must return a response in all code paths. No hanging requests.
- Error responses must always include `{ success: false, message: "..." }`
- Never `throw` an unhandled error from a controller — always catch and return a JSON response
- `console.error` is acceptable for logging unexpected errors on the server side

### 11.2 Frontend Error Rules

- The initial `GET /users` fetch must catch network errors and set `error` state
- If `error` is non-null after the fetch, `App.jsx` must render the error message rather than the empty state or loading spinner
- The `PATCH` fetch must be wrapped in `try/catch`. On failure, log to console. Do not leave the promise unhandled.
- The `loading` flag must be set to `false` in the `finally` block — never only in `try` or only in `catch`. This prevents a permanent loading spinner if the fetch fails.

```js
// Correct pattern — finally always runs
try {
  setLoading(true);
  const res = await fetch(ENDPOINTS.getUsers);
  const json = await res.json();
  setUsers(json.data);
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);  // guaranteed to run
}
```

---

## 12. Styling Implementation

### 12.1 Header

```
bg-primary text-white px-6 py-4
```
- Contains the dashboard title: `"OrgByte — Verification Dashboard"`
- Full viewport width

### 12.2 Controls Row

```
flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-4
```

### 12.3 User Grid

```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-8
```

### 12.4 User Card

```
bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-3
```

### 12.5 Category Tag

```
text-xs font-medium bg-primary-light text-primary px-2 py-1 rounded-full
```

### 12.6 Status Dropdown

```
mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-primary
```

### 12.7 Filter Buttons

Active:
```
px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white
```
Inactive:
```
px-4 py-2 rounded-lg text-sm font-medium bg-primary-light text-primary
```

### 12.8 Search Input

```
border border-gray-300 rounded-lg px-4 py-2 text-sm w-full md:w-64
focus:outline-none focus:ring-2 focus:ring-primary
```

---

## 13. Implementation Order

Follow this order strictly. Do not start the frontend before the backend API is returning data.

**Phase 1 — Backend**
1. Initialise `backend/` with `npm init` and install dependencies
2. Create `mockData.js` with all 10 seed users
3. Create `userController.js` — implement `getUsers` first, `updateUserStatus` second
4. Create `userRoutes.js`
5. Create `server.js`
6. Test with a REST client (curl, Postman, or Thunder Client):
   - `GET http://localhost:5000/users` returns all 10 users
   - `PATCH http://localhost:5000/users/user-3/status` with body `{ "status": "verified" }` returns updated user
   - `PATCH` with invalid status returns 400
   - `PATCH` with unknown userId returns 404

**Phase 2 — Frontend Foundation**

7. Initialise `frontend/` with `npm create vite@latest . -- --template react`
8. Install and configure Tailwind CSS
9. Add `tailwind.config.js` with OrgByte custom colours
10. Clear default Vite boilerplate from `App.jsx`

**Phase 3 — Frontend Features**

11. Create `constants/api.js` and `constants/statusOptions.js`
12. Create `utils/filterUsers.js` and verify the pure function logic manually
13. Create `hooks/useUsers.js` — implement fetch and state
14. Create `StatusBadge.jsx`
15. Create `UserCard.jsx`
16. Create `FilterBar.jsx`
17. Create `SearchInput.jsx`
18. Create `LoadingState.jsx` and `EmptyState.jsx`
19. Wire everything together in `App.jsx`

**Phase 4 — Polish**

20. Verify filter + search compose correctly with active data
21. Verify status update reflects without page reload
22. Verify responsive layout at mobile, tablet, and desktop widths
23. Write the README

---

## 14. Definition of Done

A feature is complete only when all of the following are true:

| Checkpoint | Requirement |
|---|---|
| `GET /users` | Returns all 10 users with correct shape |
| `PATCH /users/:id/status` | Returns updated user, mutates in-memory array |
| `PATCH` invalid status | Returns 400 with descriptive message |
| `PATCH` unknown userId | Returns 404 with descriptive message |
| Filter — All | Shows all 10 users |
| Filter — Verified | Shows only users with status `"verified"` |
| Filter — Pending | Shows only users with status `"pending"` |
| Filter — Unverified | Shows only users with status `"unverified"` |
| Filter + Search | Both active simultaneously, results update in real time |
| Status update | Dropdown change fires PATCH; card reflects new status on success without reload |
| Loading state | Visible during initial fetch; disappears after data loads |
| Empty state | Appears when no users match current filter/search; never on initial load |
| Error state | Appears if `GET /users` network request fails |
| Responsive layout | 1 column on mobile, 2 on tablet, 3 on desktop |
| Code structure | No fetch calls in components; no JSX in hooks; no logic in route files |
| Constants | No status strings or URLs written inline anywhere |
| README | Clone → two commands → both services running |

---

*This document is the implementation source of truth. The PRD answers what to build and why. This document answers how to build it. Any ambiguity during implementation should be resolved by referring to the PRD first, then this document.*
