# Backend Schema Document
## OrgByte Verification Management Dashboard
**Derived from:** PRD v1.0 · TRD v1.0
**Version:** 1.0
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Data Model](#2-data-model)
3. [In-Memory Store Behaviour](#3-in-memory-store-behaviour)
4. [Seed Data — Complete Record Set](#4-seed-data--complete-record-set)
5. [API Endpoint Specifications](#5-api-endpoint-specifications)
6. [Validation Rules](#6-validation-rules)
7. [Response Envelope](#7-response-envelope)
8. [Error Catalogue](#8-error-catalogue)
9. [Middleware Chain](#9-middleware-chain)
10. [Module Dependency Map](#10-module-dependency-map)
11. [Field-Level Rules Reference](#11-field-level-rules-reference)

---

## 1. Overview

The backend is a Node.js/Express REST API. It holds all user data in a single in-memory array that is seeded at server start. No database, no file writes, no external services. All data resets when the server process restarts.

The API exposes exactly two endpoints:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/users` | Return the full user list |
| `PATCH` | `/users/:userId/status` | Update one user's verification status |

Both endpoints return JSON. Both follow the same response envelope shape. No other endpoints exist or should be added during this build.

---

## 2. Data Model

### 2.1 User Object

This is the canonical shape of a single user record. Every record in the in-memory store must conform to this shape exactly. No extra fields. No missing fields.

```
User {
  id:         string   — unique identifier, format "user-N"
  name:       string   — full display name
  status:     string   — one of three enum values (see 2.2)
  categories: string[] — one to three document type labels (see 2.3)
  updatedAt:  string   — ISO 8601 timestamp, UTC
}
```

### 2.2 Status Enum

The `status` field is a closed enum. Only these three values are valid anywhere in the system — in seed data, in PATCH request bodies, and in all responses.

| Value | Meaning |
|---|---|
| `"verified"` | User's identity documents have been reviewed and confirmed |
| `"pending"` | User has submitted documents; review is in progress |
| `"unverified"` | User has not submitted documents or has failed review |

Any value outside this set must be rejected with a `400` error. Case is significant — `"Verified"` and `"VERIFIED"` are invalid.

### 2.3 Categories Enum

The `categories` field is an array of strings. Each string must be drawn from this set:

| Value |
|---|
| `"ID"` |
| `"Passport"` |
| `"Utility Bill"` |
| `"Tax Certificate"` |
| `"Business Reg"` |
| `"Bank Statement"` |

Rules:
- Minimum 1 category per user
- Maximum 3 categories per user
- No duplicate categories on the same user
- Categories are read-only — the PATCH endpoint does not modify them

### 2.4 Field Specifications

| Field | Type | Required | Mutable | Format | Notes |
|---|---|---|---|---|---|
| `id` | `string` | Yes | No | `"user-{N}"` where N is 1–10 | Set at seed time, never changes |
| `name` | `string` | Yes | No | Full name, title case | Set at seed time, never changes |
| `status` | `string` | Yes | Yes (via PATCH) | Lowercase enum string | Only field the API modifies |
| `categories` | `string[]` | Yes | No | Array of 1–3 enum strings | Set at seed time, never changes |
| `updatedAt` | `string` | Yes | Yes (via PATCH) | `new Date().toISOString()` | Updated automatically on every PATCH |

---

## 3. In-Memory Store Behaviour

### 3.1 Initialisation

When `server.js` starts, Node.js evaluates `mockData.js`. The exported `users` array is assigned to memory. This is the live store — it is the same object that controllers read from and write to.

```
Server start
    │
    ▼
mockData.js evaluates → users array assigned to module memory
    │
    ▼
userController.js imports { users } → holds reference to the same array
    │
    ▼
PATCH mutates objects inside the array in place → changes are visible to all
    subsequent GET calls in the same process lifetime
```

### 3.2 Read Behaviour

`GET /users` returns the full array reference. Because JavaScript objects are passed by reference, any mutations made by a previous PATCH call are already reflected in the array at read time. No additional lookup is required.

### 3.3 Write Behaviour

`PATCH /users/:userId/status` does not replace the array. It finds the matching user object by `id` and mutates two fields directly on that object:

```js
// What the write operation looks like internally
const user = users.find(u => u.id === userId);
user.status    = newStatus;
user.updatedAt = new Date().toISOString();
```

This is intentional. Because the controller holds a reference to the same `users` array that `mockData.js` exported, this mutation is permanent for the life of the server process. The next `GET /users` call will return the updated value.

### 3.4 Data Lifetime

| Event | Effect on data |
|---|---|
| Server starts | Seed data loaded; all 10 users in original state |
| PATCH called | One user's `status` and `updatedAt` mutate in place |
| GET called | Returns current state of all 10 users, including any mutations |
| Server restarts | All mutations lost; seed data reloaded |
| Multiple PATCH calls | Cumulative — each one mutates the state left by the previous |

This behaviour must be documented in the README so reviewers understand why data resets on restart.

---

## 4. Seed Data — Complete Record Set

This is the authoritative seed dataset. It must be copied exactly into `backend/src/data/mockData.js`. Do not alter IDs, names, or initial statuses — the UI/UX mockups and the Definition of Done checklist in the TRD both reference this exact data.

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

### 4.1 Status Distribution

| Status | Count | Users |
|---|---|---|
| `verified` | 4 | user-1, user-4, user-7, user-9 |
| `pending` | 3 | user-2, user-5, user-8 |
| `unverified` | 3 | user-3, user-6, user-10 |
| **Total** | **10** | |

This distribution ensures every filter tab on the frontend has at least two visible cards — making filter behaviour clearly demonstrable during review.

### 4.2 Category Distribution

| Category | Users that hold it |
|---|---|
| ID | user-2, user-3, user-7, user-10 |
| Passport | user-1, user-5, user-7 |
| Utility Bill | user-2, user-6, user-9 |
| Tax Certificate | user-4, user-8, user-10 |
| Business Reg | user-4, user-9 |
| Bank Statement | user-1, user-6, user-7 |

All 6 category types appear at least once across the seed set.

---

## 5. API Endpoint Specifications

### 5.1 GET /users

**Purpose:** Return the complete list of all users in their current state.

**Request**

```
Method:   GET
Path:     /users
Headers:  (none required)
Body:     (none)
Params:   (none)
```

**Success Response — 200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "name": "Amara Osei",
      "status": "verified",
      "categories": ["Passport", "Bank Statement"],
      "updatedAt": "2026-05-01T09:00:00Z"
    },
    {
      "id": "user-2",
      "name": "Emeka Nwosu",
      "status": "pending",
      "categories": ["ID", "Utility Bill"],
      "updatedAt": "2026-05-03T11:30:00Z"
    }
  ]
}
```

`data` is always an array. It is never null. On a fresh server start it contains exactly 10 objects. The order of records in the array matches the order they appear in `mockData.js` and does not change.

**Error Responses**

This endpoint has no user-driven error cases. The only possible failure is an unexpected server error, which Express handles with its default 500 handler. No custom error handling is required for this endpoint.

**Controller function:** `getUsers`

```js
/**
 * Returns the full user list from the in-memory store.
 */
export const getUsers = (req, res) => {
  res.status(200).json({ success: true, data: users });
};
```

---

### 5.2 PATCH /users/:userId/status

**Purpose:** Update the `status` field of a single user identified by their `userId`. Also updates `updatedAt` to the current timestamp.

**Request**

```
Method:   PATCH
Path:     /users/:userId/status
Headers:  Content-Type: application/json
Body:     { "status": "<new_status_value>" }
Params:   userId — string, e.g. "user-3"
```

**Request Body Schema**

```json
{
  "status": "verified"
}
```

| Field | Type | Required | Valid Values |
|---|---|---|---|
| `status` | `string` | Yes | `"verified"`, `"pending"`, `"unverified"` |

Only `status` is accepted in the request body. Any additional fields sent by the client are silently ignored — they do not cause an error and they do not affect the record.

**Success Response — 200 OK**

Returns the full updated user object, not just the changed fields. The frontend uses this response object directly to update its local state.

```json
{
  "success": true,
  "data": {
    "id": "user-3",
    "name": "Fatima Al-Hassan",
    "status": "verified",
    "categories": ["ID"],
    "updatedAt": "2026-05-17T11:45:22.103Z"
  }
}
```

Note that `updatedAt` reflects the exact moment the PATCH was processed, not a rounded or truncated timestamp.

**Error Response — 400 Bad Request**

Returned when `status` in the request body is missing or not one of the three valid values.

```json
{
  "success": false,
  "message": "Invalid status value. Must be one of: verified, pending, unverified"
}
```

**Error Response — 404 Not Found**

Returned when no user in the store matches the provided `userId`.

```json
{
  "success": false,
  "message": "User not found"
}
```

**Validation execution order**

The controller must validate in this exact sequence. Order matters — validating `status` before looking up the user ensures the error message is always accurate:

```
1. Extract status from req.body
2. Check status is in VALID_STATUSES
   └── if not → return 400 immediately (do not proceed)
3. Extract userId from req.params
4. Find user in the users array by id
   └── if not found → return 404 immediately (do not proceed)
5. Mutate user.status = status
6. Mutate user.updatedAt = new Date().toISOString()
7. Return 200 with the full updated user object
```

**Controller function skeleton:** `updateUserStatus`

```js
/**
 * Updates a user's verification status in the in-memory store.
 * Validates status value before performing the lookup.
 */
export const updateUserStatus = (req, res) => {
  const { status } = req.body;
  const { userId } = req.params;

  const VALID_STATUSES = ["verified", "pending", "unverified"];

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value. Must be one of: verified, pending, unverified",
    });
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  user.status    = status;
  user.updatedAt = new Date().toISOString();

  return res.status(200).json({ success: true, data: user });
};
```

---

## 6. Validation Rules

All validation lives exclusively in the controller layer. Route files and `server.js` contain no validation logic.

### 6.1 Status Validation

| Rule | Behaviour on failure |
|---|---|
| `status` field must be present in request body | `400` — "Invalid status value. Must be one of: verified, pending, unverified" |
| `status` must be a string | `400` — same message |
| `status` must be exactly one of `"verified"`, `"pending"`, `"unverified"` | `400` — same message |
| `status` is case-sensitive — `"Verified"` is invalid | `400` — same message |

A single error message covers all status validation failures. No distinction is made between missing, wrong type, and wrong value — the message is the same in all cases.

### 6.2 User Lookup Validation

| Rule | Behaviour on failure |
|---|---|
| `userId` from `req.params` must match an `id` field in the `users` array | `404` — "User not found" |
| If no match is found, the array is unchanged | No side effects |

### 6.3 What Is Not Validated

| Item | Reason |
|---|---|
| `userId` format (e.g. must start with "user-") | Overly strict — any non-matching ID returns a clean 404 |
| Extra fields in the request body | Silently ignored — client may send stale fields |
| `Content-Type` header | Express `express.json()` middleware handles malformed bodies gracefully |
| Empty body | Treated as `status: undefined` — fails the status check, returns 400 |

---

## 7. Response Envelope

Every response from every endpoint follows the same wrapper shape. This consistency allows the frontend to handle responses with a single pattern.

### 7.1 Success Envelope

```json
{
  "success": true,
  "data": <payload>
}
```

`data` is either an array (for `GET /users`) or a single object (for `PATCH /users/:userId/status`). It is never a string, never null, and never omitted on a success response.

### 7.2 Error Envelope

```json
{
  "success": false,
  "message": "<human-readable error description>"
}
```

`message` is always a string. `data` is never included in error responses. The `success: false` field allows the frontend to distinguish errors without inspecting HTTP status codes, though both are set correctly.

### 7.3 No Envelope Deviation

The frontend's `useUsers.js` hook is written to expect this exact shape. Any deviation in the backend — wrapping the array in a nested key, omitting `success`, using a different error key — will break the frontend. This envelope is a contract, not a convention.

---

## 8. Error Catalogue

Complete list of every error the API can produce, with its trigger condition and full response.

| Code | Trigger | `message` value |
|---|---|---|
| `400` | `status` field in PATCH body is missing, not a string, or not in the valid enum | `"Invalid status value. Must be one of: verified, pending, unverified"` |
| `404` | `userId` param does not match any user's `id` in the store | `"User not found"` |
| `500` | Unexpected runtime error (Express default handler) | Express default HTML response — not JSON |

### 8.1 Notes on 500 Errors

The application does not define a custom 500 handler. Express's built-in error handler returns an HTML page for unhandled errors. This is acceptable for a screening task — no unhandled error paths exist in the current codebase given the simplicity of the in-memory store. If this were production code, a global JSON error handler would be required.

### 8.2 What the API Does Not Return

| Code | Why not used |
|---|---|
| `401 Unauthorized` | No authentication in this build |
| `403 Forbidden` | No authorisation rules |
| `405 Method Not Allowed` | Express returns its own default for unregistered methods |
| `422 Unprocessable Entity` | 400 covers all validation failures for this scope |

---

## 9. Middleware Chain

When a request arrives at the Express server, it passes through the following layers in order before reaching a controller:

```
Incoming HTTP request
        │
        ▼
[1] cors()
    Checks the Origin header against the allowed list.
    Attaches CORS headers to the response.
    Allows: origin "http://localhost:5173", methods GET and PATCH.
    Rejects other origins with no CORS headers (browser will block).
        │
        ▼
[2] express.json()
    Parses the request body as JSON if Content-Type is application/json.
    Makes the parsed object available at req.body.
    If body is not valid JSON, sets req.body to undefined (no error thrown).
        │
        ▼
[3] Router — /users
    Matches the path and delegates to the appropriate handler.
        │
        ├── GET  /          → getUsers controller
        └── PATCH /:userId/status → updateUserStatus controller
                │
                ▼
           Controller runs validation and business logic.
           Calls res.json() to end the request.
```

No custom middleware is added for this build. The order above is fixed — `cors()` must come before `express.json()` so preflight OPTIONS requests are handled before body parsing runs.

### 9.1 CORS Configuration

```js
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "PATCH"],
}));
```

| Setting | Value | Reason |
|---|---|---|
| `origin` | `"http://localhost:5173"` | Only the Vite dev server is allowed — not a wildcard |
| `methods` | `["GET", "PATCH"]` | Restricts to the two methods the API actually uses |

A wildcard `origin: "*"` would also work locally but is bad practice — it allows any website to call the API from a user's browser. Scoped origin is the right call.

---

## 10. Module Dependency Map

Shows which modules import from which. Arrows point in the direction of the import (`A → B` means A imports from B).

```
server.js
    │
    ├── imports cors         (npm package)
    ├── imports express      (npm package)
    └── imports userRoutes   (./routes/userRoutes.js)
                │
                └── imports userController  (../controllers/userController.js)
                                │
                                └── imports users  (../data/mockData.js)
```

Rules enforced by this structure:

- `mockData.js` imports nothing from the project. It is a pure data file.
- `userController.js` imports only from `mockData.js`. It does not touch routing or server config.
- `userRoutes.js` imports only from `userController.js`. It does not touch data.
- `server.js` imports only from `userRoutes.js` and npm packages. It does not touch data or controllers directly.

No circular imports. No file imports from a file that is "above" it in the chain.

---

## 11. Field-Level Rules Reference

A consolidated single-source-of-truth table for every field across the full lifecycle.

| Field | Set by | Readable via | Writable via | Format rule | Null allowed |
|---|---|---|---|---|---|
| `id` | Seed data at startup | `GET /users` | Never | `"user-{N}"`, 1–10 | No |
| `name` | Seed data at startup | `GET /users` | Never | Full name string | No |
| `status` | Seed data; PATCH | `GET /users` | `PATCH /users/:id/status` | Enum: `"verified"` / `"pending"` / `"unverified"` | No |
| `categories` | Seed data at startup | `GET /users` | Never | Array of 1–3 strings from categories enum | No |
| `updatedAt` | Seed data; PATCH | `GET /users` | Automatic on PATCH | ISO 8601 UTC string | No |

No field is ever null. No field is ever omitted from a response. The frontend can safely access all five fields on every user object without a null-check.

---

*This document is the definitive reference for all backend data structures, endpoint behaviour, and validation logic. Any deviation from this document during implementation must be reviewed against the PRD and TRD before merging.*
