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
