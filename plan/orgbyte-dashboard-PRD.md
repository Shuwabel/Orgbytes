# Product Requirements Document
## OrgByte Verification Management Dashboard
**Program:** OrgByte Builders Program — Cohort 1
**Track:** Full-Stack
**Version:** 1.0
**Status:** Ready for Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals and Success Criteria](#2-goals-and-success-criteria)
3. [Repository Structure](#3-repository-structure)
4. [Code Standards and Team Conventions](#4-code-standards-and-team-conventions)
5. [Backend Specification](#5-backend-specification)
6. [Frontend Specification](#6-frontend-specification)
7. [Data Schema](#7-data-schema)
8. [API Contract](#8-api-contract)
9. [State Management and Data Flow](#9-state-management-and-data-flow)
10. [UI and Branding](#10-ui-and-branding)
11. [Bonus Features](#11-bonus-features)
12. [README Requirements](#12-readme-requirements)
13. [Architectural Decisions Log](#13-architectural-decisions-log)

---

## 1. Project Overview

Build a mini verification management dashboard consisting of a Node.js/Express REST API and a React frontend. Both must work together as a single cohesive product within one repository.

The dashboard allows an administrator to:
- View all users and their current verification status
- Filter users by status
- Search users by name in real time
- Update any user's verification status, with changes reflecting immediately in the UI without a full page reload

---

## 2. Goals and Success Criteria

| Goal | How We Measure It |
|---|---|
| API communicates cleanly with the frontend | No hardcoded data on the frontend; all user data comes from `GET /users` |
| Status updates reflect without page reload | UI state updates on successful `PATCH` response; no `window.location.reload()` |
| Filter and search work correctly | Both can be active simultaneously; derived from a single client-side fetch |
| Code is team-readable and scalable | Any developer can open a file and immediately understand its purpose and scope |
| Project is easy to run | A reviewer can clone and spin up both services with two commands |

---

## 3. Repository Structure

The project uses a **decoupled monorepo**: one repository, two fully independent packages (`/backend` and `/frontend`). Each has its own `package.json`. Neither depends on the other's node_modules.

```
orgbyte-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── userController.js     # Request/response logic only
│   │   ├── routes/
│   │   │   └── userRoutes.js         # Route definitions only
│   │   ├── data/
│   │   │   └── mockData.js           # Seed data — 8+ users
│   │   └── server.js                 # Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserCard.jsx          # Single user card display
│   │   │   ├── StatusBadge.jsx       # Coloured status indicator
│   │   │   ├── FilterBar.jsx         # All / Verified / Pending / Unverified tabs
│   │   │   ├── SearchInput.jsx       # Name search input
│   │   │   ├── LoadingState.jsx      # Spinner shown during initial fetch
│   │   │   └── EmptyState.jsx        # Message shown when no results match
│   │   ├── hooks/
│   │   │   └── useUsers.js           # Fetch logic and state management
│   │   ├── utils/
│   │   │   └── filterUsers.js        # Pure filtering/search utility function
│   │   ├── constants/
│   │   │   └── statusOptions.js      # ["all", "verified", "pending", "unverified"]
│   │   ├── App.jsx                   # Root component, layout, state wiring
│   │   └── main.jsx                  # Vite entry point
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

### Why this structure

Each file has a single, named responsibility. A developer unfamiliar with this project can open any file and know exactly what it does and what it must not do. Route files do not contain logic. Controller files do not define routes. Components do not fetch data. Fetch logic does not render JSX.

---

## 4. Code Standards and Team Conventions

These rules apply to every file in this project. They are not optional.

### 4.1 Naming

| Thing | Convention | Example |
|---|---|---|
| Files (JS/JSX) | camelCase | `userController.js`, `useUsers.js` |
| Components | PascalCase | `UserCard.jsx`, `StatusBadge.jsx` |
| Functions | camelCase, verb-first | `getUsers`, `updateUserStatus`, `filterUsers` |
| Constants | UPPER_SNAKE_CASE | `STATUS_OPTIONS`, `API_BASE_URL` |
| CSS classes | kebab-case (Tailwind utility classes only) | `user-card`, `status-badge` |

### 4.2 Function and File Length

- **One function = one job.** If you find yourself writing "and" when describing what a function does, split it.
- **Functions must not exceed 30 lines.** If they do, extract a helper.
- **Components must not exceed 80 lines.** Logic belongs in hooks or utils, not inside component bodies.

### 4.3 Comments

- Comment *why*, not *what*. The code already says what it does.
- Every function must have a one-line JSDoc comment describing its purpose.

```js
// BAD
// Loop through users and return filtered array
const filtered = users.filter(u => u.status === activeFilter);

// GOOD
/**
 * Returns users whose status matches the active filter tab.
 * Returns all users when activeFilter is "all".
 */
export function filterByStatus(users, activeFilter) { ... }
```

### 4.4 No Magic Values

All repeated values must live in constants files.

```js
// BAD
if (status === "pending") { ... }

// GOOD
import { STATUS } from "../constants/statusOptions";
if (status === STATUS.PENDING) { ... }
```

### 4.5 Error Handling

- Every `fetch` call must have a `.catch` or a `try/catch`.
- The API must return consistent JSON error shapes:

```json
{
  "success": false,
  "message": "User not found"
}
```

- The frontend must handle API errors gracefully — no unhandled promise rejections, no silent failures.

### 4.6 No Inline Styles

All styling goes through Tailwind utility classes. No `style={{}}` props on JSX elements except for dynamically computed values (e.g., percentage widths).

---

## 5. Backend Specification

### 5.1 Stack

| Tool | Purpose |
|---|---|
| Node.js | Runtime |
| Express | HTTP server and routing |
| cors | Allow cross-origin requests from the frontend dev server |
| nodemon | Hot reload during development |

### 5.2 Entry Point — `server.js`

Responsibilities:
- Import and mount routes
- Configure CORS (allow `http://localhost:5173` in development)
- Set `express.json()` middleware
- Start the server on port `5000` (or `process.env.PORT`)

`server.js` must contain no business logic. It is wiring only.

### 5.3 Routes — `userRoutes.js`

```
GET   /users                  → userController.getUsers
PATCH /users/:userId/status   → userController.updateUserStatus
```

Route files define paths and map them to controller functions. No logic lives here.

### 5.4 Controllers — `userController.js`

**`getUsers`**
- Returns the full user array as JSON
- Response shape:
```json
{
  "success": true,
  "data": [ ...users ]
}
```

**`updateUserStatus`**
- Receives `userId` from `req.params`
- Receives `{ "status": "verified" }` from `req.body`
- Validates that the new status is one of: `verified`, `pending`, `unverified`
- Finds the matching user in the data array
- Returns the full updated user object
- Response shape (success):
```json
{
  "success": true,
  "data": { ...updatedUser }
}
```
- Response shape (error — user not found):
```json
{
  "success": false,
  "message": "User not found"
}
```
- Response shape (error — invalid status):
```json
{
  "success": false,
  "message": "Invalid status value"
}
```

### 5.5 Data Layer — `mockData.js`

An exported array of user objects loaded into memory when the server starts. This is the single source of truth for all user data. Mutations (PATCH) happen directly on this array.

No database. No file writes. Data resets on server restart. This decision is documented in the README.

---

## 6. Frontend Specification

### 6.1 Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Dev server and bundler |
| Tailwind CSS | Styling |

### 6.2 Component Responsibilities

**`App.jsx`**
- Calls `useUsers` hook to get state and handlers
- Renders layout: header, filter bar, search input, user grid
- Passes data and callbacks down to children via props
- Contains no fetching logic and no direct state declarations

**`useUsers.js` (custom hook)**
- Owns all state: `users`, `loading`, `error`, `activeFilter`, `searchQuery`
- Performs the initial `GET /users` fetch on mount
- Exposes `updateStatus(userId, newStatus)` which fires `PATCH` and updates state on success
- Exposes `setActiveFilter` and `setSearchQuery`
- Exposes `visibleUsers` — the derived list after filter and search are applied
- No JSX. No rendering. Data logic only.

**`filterUsers.js` (utility)**
- A pure function that takes `(users, activeFilter, searchQuery)` and returns the filtered array
- Fully testable with no React dependencies

```js
/**
 * Returns the subset of users matching the active status filter and search query.
 * Both filters apply simultaneously.
 */
export function filterUsers(users, activeFilter, searchQuery) { ... }
```

**`FilterBar.jsx`**
- Renders four tab buttons: All, Verified, Pending, Unverified
- Highlights the active tab in Blue (primary)
- Calls `onFilterChange(status)` when a tab is clicked
- Receives: `activeFilter`, `onFilterChange`

**`SearchInput.jsx`**
- Controlled input component
- Calls `onSearch(value)` on every keystroke
- Receives: `searchQuery`, `onSearch`

**`UserCard.jsx`**
- Displays one user: name, categories (as tags), status badge, and status dropdown
- Calls `onStatusChange(userId, newStatus)` when a new status is selected
- Receives: `user`, `onStatusChange`
- Must not manage its own loading or status state — delegates upward

**`StatusBadge.jsx`**
- Renders a coloured pill based on status value
- Receives: `status`
- Maps `verified` → green, `pending` → amber, `unverified` → gray

**`LoadingState.jsx`**
- Rendered by `App.jsx` when `loading === true`
- A simple centered spinner or skeleton

**`EmptyState.jsx`**
- Rendered by `App.jsx` when `visibleUsers.length === 0` and `loading === false`
- Message: "No users match your current filters."

### 6.3 API Communication

All `fetch` calls live exclusively inside `useUsers.js`. No component makes a direct API call.

The base URL is stored in a single constant:

```js
// frontend/src/constants/api.js
export const API_BASE_URL = "http://localhost:5000";
```

---

## 7. Data Schema

### User Object

```json
{
  "id": "user-1",
  "name": "Amara Osei",
  "status": "verified",
  "categories": ["Passport", "Bank Statement"],
  "updatedAt": "2026-05-17T10:00:00Z"
}
```

| Field | Type | Values |
|---|---|---|
| `id` | string | Unique. Format: `"user-N"` |
| `name` | string | Full name |
| `status` | string | `"verified"` / `"pending"` / `"unverified"` |
| `categories` | string[] | Drawn from: ID, Passport, Utility Bill, Tax Certificate, Business Reg, Bank Statement |
| `updatedAt` | ISO 8601 string | Set on creation; updated on every PATCH |

### Seed Data Requirements

- Minimum 8 users
- Deliberate status spread: at least 3 verified, 3 pending, 2 unverified
- Each user should have 1–3 categories
- Names should reflect realistic diversity

---

## 8. API Contract

### GET /users

**Request:** No body. No query params.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "name": "Amara Osei",
      "status": "verified",
      "categories": ["Passport", "Bank Statement"],
      "updatedAt": "2026-05-17T10:00:00Z"
    }
  ]
}
```

---

### PATCH /users/:userId/status

**Request body:**
```json
{ "status": "verified" }
```

**Response 200 (success):**
```json
{
  "success": true,
  "data": {
    "id": "user-3",
    "name": "Emeka Nwosu",
    "status": "verified",
    "categories": ["ID", "Utility Bill"],
    "updatedAt": "2026-05-17T11:45:00Z"
  }
}
```

**Response 400 (invalid status):**
```json
{
  "success": false,
  "message": "Invalid status value. Must be one of: verified, pending, unverified"
}
```

**Response 404 (user not found):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 9. State Management and Data Flow

### 9.1 Single Fetch, Client-Side Filtering

The full user list is fetched **once** on component mount. The frontend never calls `GET /users` again during a session. Both the filter bar and search input operate on the master array in memory using JavaScript's `.filter()`.

This avoids unnecessary network traffic and keeps the filtering logic fast and testable.

```
Initial Mount
    │
    ▼
GET /users → store in usersData (master state)
    │
    ├── activeFilter  ┐
    │                 ├── filterUsers(usersData, activeFilter, searchQuery) → visibleUsers
    └── searchQuery   ┘
                            │
                            ▼
                      Rendered in UserCard grid
```

### 9.2 Status Update Flow (Pessimistic)

Status updates use a pessimistic update strategy: the API is called first, and the UI only updates after a confirmed success response. This is appropriate for an admin tool where incorrect UI state is more damaging than a short delay.

```
User selects new status from dropdown
    │
    ▼
PATCH /users/:id/status { status: "verified" }
    │
    ├── On success (200) → update that user's entry in usersData → UI re-renders
    │
    └── On failure → show error message → UI remains unchanged
```

The state update on success:

```js
// In useUsers.js
setUsers(prev =>
  prev.map(user => (user.id === updatedUser.id ? updatedUser : user))
);
```

No page reload. No full refetch. Only the one record changes.

### 9.3 Props Flow

```
useUsers hook (state owner)
    │
    └── App.jsx (layout, receives all state and handlers)
            │
            ├── FilterBar.jsx (receives activeFilter, onFilterChange)
            ├── SearchInput.jsx (receives searchQuery, onSearch)
            ├── LoadingState.jsx (rendered when loading === true)
            ├── EmptyState.jsx (rendered when visibleUsers is empty)
            └── UserCard.jsx × N (receives user, onStatusChange)
                    └── StatusBadge.jsx (receives status)
```

State only flows down. Events only flow up via callbacks. No sibling-to-sibling communication.

---

## 10. UI and Branding

### 10.1 OrgByte Color System

| Token | Hex | Usage |
|---|---|---|
| Blue (Primary) | `#1D4ED8` | Header background, active filter tab, primary buttons |
| Blue Light | `#DBEAFE` | Inactive filter tab background |
| Green (Secondary) | `#16A34A` | Verified badge, confirm actions |
| Green Light | `#DCFCE7` | Verified badge background |
| Amber | `#D97706` | Pending badge text |
| Amber Light | `#FEF3C7` | Pending badge background |
| Gray | `#6B7280` | Unverified badge text |
| Gray Light | `#F3F4F6` | Unverified badge background, card backgrounds |

### 10.2 Layout

- **Header:** Full-width blue bar with dashboard title
- **Controls row:** Filter tabs on the left, search input on the right
- **User grid:** Responsive — 1 column on mobile, 2 on tablet, 3 on desktop
- **User card:** White card with subtle shadow. Displays name, category tags, status badge, and status dropdown

### 10.3 Responsive Breakpoints (Tailwind)

| Breakpoint | Columns |
|---|---|
| Default (mobile) | 1 |
| `md` (768px+) | 2 |
| `lg` (1024px+) | 3 |

---

## 11. Bonus Features

Both bonus features are included in this build.

### 11.1 Real-Time Name Search

- A controlled text input above the grid
- Filters `usersData` by `name` on every keystroke using `.toLowerCase().includes()`
- Composes with the active status filter — both can be active simultaneously
- Implemented entirely in `filterUsers.js` and `useUsers.js`. `SearchInput.jsx` is a pure controlled input.

### 11.2 Loading State

- `useUsers` sets `loading: true` before the initial `GET /users` call
- Sets `loading: false` in the `finally` block (runs whether the fetch succeeds or fails)
- `App.jsx` renders `<LoadingState />` when `loading === true`

### 11.3 Empty State

- `App.jsx` renders `<EmptyState />` when `loading === false` and `visibleUsers.length === 0`
- Message: "No users match your current filters."
- Prevents a blank-looking screen that reads as a bug

---

## 12. README Requirements

The README at the root of the repository must cover:

1. **Project summary** — what this is and what it does (2–3 sentences)
2. **Prerequisites** — Node.js version, no other global dependencies required
3. **Setup instructions:**
   ```bash
   # Backend
   cd backend && npm install && npm run dev

   # Frontend (new terminal)
   cd frontend && npm install && npm run dev
   ```
4. **Architecture overview** — brief description of the monorepo structure, why the decoupled approach was chosen
5. **API reference** — list both endpoints with method, path, and a one-line description
6. **Key decisions** — a short section explaining the major trade-offs made (in-memory data, pessimistic updates, client-side filtering)

---

## 13. Architectural Decisions Log

This section documents the key trade-offs made during planning. These justifications belong in the README.

| Decision | Choice | Reason |
|---|---|---|
| Frontend framework | React + Vite | Component model handles real-time card updates cleanly. Next.js is overkill with Express already handling the API layer. |
| Styling | Tailwind CSS | Fast, responsive by default. No custom CSS files to maintain. |
| Data layer | In-memory array | No database is specified. Simpler setup for reviewers. Data loss on restart is acceptable and documented. |
| Categories | Verification document types | The brief mentions categories without defining them. Document types (Passport, ID, etc.) are the most domain-appropriate interpretation. |
| Status update UX | Dropdown select per card | More appropriate for an admin tool than a cycle button. Intentional selection reduces accidental misclicks. |
| Update strategy | Pessimistic | Confirmed API success before updating UI. Cleaner, safer, no rollback logic needed. Appropriate for admin tooling. |
| Filtering | Client-side, single fetch | Avoids repeated API calls. Filter and search compose cleanly. Fast and testable with a pure utility function. |
| Folder depth | Flat components folder | Only 6 components. Sub-folders add overhead with no benefit at this scale. Revisit if component count grows past 15. |

---

*Document prepared for OrgByte Builders Program — Cohort 1 Screening Task.*
*All decisions are intentional and justified. Any deviation during implementation must be noted in the README.*
