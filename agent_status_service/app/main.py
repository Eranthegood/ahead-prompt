import asyncio
import json
import os
import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from .auth import AuthRole, get_auth_dependency
from .db import (
	Database,
	get_database,
	init_database,
	insert_job,
	insert_update,
	select_job,
	select_updates,
)
from .models import JobCreate, JobOut, StatusUpdateIn, StatusUpdateOut
from .sse import Broadcaster, get_broadcaster


app = FastAPI(title="Agent Status Service", version="0.1.0")


@app.on_event("startup")
async def on_startup() -> None:
	await init_database()


# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
	CORSMiddleware,
	allow_origins=allowed_origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"]
)


@app.post("/api/jobs", response_model=JobOut)
async def create_job(
	data: JobCreate,
	_: None = Depends(get_auth_dependency(AuthRole.AHEAD_OR_ADMIN)),
	db: Database = Depends(get_database),
) -> JobOut:
	job_id = data.job_id or str(uuid.uuid4())
	await insert_job(db, job_id=job_id, title=data.title or "", metadata=data.metadata or {})
	job = await select_job(db, job_id)
	if job is None:
		raise HTTPException(status_code=500, detail="Failed to create job")
	return job


@app.get("/api/jobs/{job_id}", response_model=JobOut)
async def get_job(
	job_id: str,
	db: Database = Depends(get_database),
) -> JobOut:
	job = await select_job(db, job_id)
	if job is None:
		raise HTTPException(status_code=404, detail="Job not found")
	return job


@app.post("/api/jobs/{job_id}/status", response_model=StatusUpdateOut)
async def push_status(
	job_id: str,
	update: StatusUpdateIn,
	_: None = Depends(get_auth_dependency(AuthRole.CURSOR_OR_ADMIN)),
	db: Database = Depends(get_database),
	broadcaster: Broadcaster = Depends(get_broadcaster),
) -> StatusUpdateOut:
	job = await select_job(db, job_id)
	if job is None:
		raise HTTPException(status_code=404, detail="Job not found")
	row = await insert_update(
		db=db,
		job_id=job_id,
		status=update.status,
		stage=update.stage,
		progress=update.progress,
		payload=update.payload or {},
	)
	# Publish to SSE subscribers
	await broadcaster.publish(job_id, row)
	return row


async def sse_event_generator(
	job_id: str,
	db: Database,
	broadcaster: Broadcaster,
	after_id: Optional[int],
) -> AsyncGenerator[bytes, None]:
	# Send recent history first
	history = await select_updates(db, job_id=job_id, limit=50, after_id=after_id)
	for item in history:
		yield f"id: {item.id}\n".encode()
		yield b"event: status\n"
		yield f"data: {json.dumps(item.model_dump())}\n\n".encode()

	# Then live stream
	queue = await broadcaster.subscribe(job_id)
	try:
		while True:
			item = await queue.get()
			yield f"id: {item.id}\n".encode()
			yield b"event: status\n"
			yield f"data: {json.dumps(item.model_dump())}\n\n".encode()
	except asyncio.CancelledError:
		return
	finally:
		await broadcaster.unsubscribe(job_id, queue)


@app.get("/api/jobs/{job_id}/stream")
async def stream_status(
	request: Request,
	job_id: str,
	db: Database = Depends(get_database),
	broadcaster: Broadcaster = Depends(get_broadcaster),
) -> StreamingResponse:
	# Support Last-Event-ID header or query param after_id
	last_event_id = request.headers.get("Last-Event-ID")
	after_id_param = request.query_params.get("after_id")
	after_id: Optional[int] = None
	try:
		if after_id_param is not None:
			after_id = int(after_id_param)
		elif last_event_id is not None:
			after_id = int(last_event_id)
	except ValueError:
		after_id = None

	generator = sse_event_generator(job_id=job_id, db=db, broadcaster=broadcaster, after_id=after_id)
	return StreamingResponse(generator, media_type="text/event-stream")


@app.get("/api/jobs/{job_id}/updates", response_model=List[StatusUpdateOut])
async def list_updates(
	job_id: str,
	after_id: Optional[int] = None,
	limit: int = 100,
	db: Database = Depends(get_database),
) -> List[StatusUpdateOut]:
	return await select_updates(db, job_id=job_id, limit=limit, after_id=after_id)

