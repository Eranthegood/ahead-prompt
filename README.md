# Prompt Errors MVP

## Running locally

- Backend
  - `cd backend`
  - `cp .env.example .env` (optional; defaults work and fall back to in-memory MongoDB)
  - `npm install`
  - `npm run dev`
  - API at `http://localhost:4000`

- Frontend (served by backend)
  - Visit `http://localhost:4000/`
  - Press `T` to generate an error; it should appear within ~500ms

## Endpoints

- GET `/api/health` -> `{ status: "ok" }`
- GET `/api/errors` -> latest errors (max 100)
- POST `/api/errors` -> body: `{ message, stack?, source?, meta? }`

## Notes

- If no MongoDB is available at `MONGODB_URI`, the backend uses an in-memory MongoDB for development.
- For a real MongoDB, you can run one via Docker and set `MONGODB_URI` accordingly.
