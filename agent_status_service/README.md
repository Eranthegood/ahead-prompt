Agent Status Service

Sync AI Agent development status between Ahead /build Prompt card and Cursor Agent.

Run

```bash
export ADMIN_TOKEN=admin-secret
export AHEAD_TOKEN=ahead-secret
export CURSOR_TOKEN=cursor-secret
export ALLOWED_ORIGINS=http://localhost:5173,https://ahead.love
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

API

- POST /api/jobs (Ahead -> Service)
  - Auth: Bearer AHEAD_TOKEN or ADMIN_TOKEN
  - Body: {"job_id":"optional-external-id","title":"Build Feature X","metadata":{"agentId":"..."}}
- POST /api/jobs/{job_id}/status (Cursor -> Service)
  - Auth: Bearer CURSOR_TOKEN or ADMIN_TOKEN
  - Body: {"status":"running|succeeded|failed|queued","stage":"install","progress":42,"payload":{"details":"..."}}
- GET /api/jobs/{job_id}/updates (Ahead -> Service)
- GET /api/jobs/{job_id}/stream (Ahead -> Service) SSE

Frontend SSE example

```js
const es = new EventSource(`${SERVICE_URL}/api/jobs/${jobId}/stream`);
es.addEventListener('status', (event) => {
  const update = JSON.parse(event.data);
  console.log(update);
});
```

