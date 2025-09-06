import asyncio
import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import aiosqlite

from .models import JobOut, StatusUpdateOut


DB_PATH = os.getenv("DATABASE_PATH", "/workspace/agent_status_service/data.sqlite3")


@dataclass
class Database:
	conn: aiosqlite.Connection


_db_lock = asyncio.Lock()
_db_instance: Optional[Database] = None


async def init_database() -> None:
	async with _db_lock:
		conn = await aiosqlite.connect(DB_PATH)
		await conn.execute("PRAGMA journal_mode=WAL;")
		await conn.execute(
			"""
			CREATE TABLE IF NOT EXISTS jobs (
				id TEXT PRIMARY KEY,
				title TEXT NOT NULL DEFAULT '',
				metadata TEXT NOT NULL DEFAULT '{}',
				created_at TEXT NOT NULL
			);
			"""
		)
		await conn.execute(
			"""
			CREATE TABLE IF NOT EXISTS updates (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				job_id TEXT NOT NULL,
				status TEXT NOT NULL,
				stage TEXT,
				progress INTEGER,
				payload TEXT NOT NULL DEFAULT '{}',
				ts TEXT NOT NULL,
				FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
			);
			"""
		)
		await conn.execute("CREATE INDEX IF NOT EXISTS idx_updates_job_id_id ON updates(job_id, id);")
		await conn.commit()
		global _db_instance
		_db_instance = Database(conn=conn)


async def get_database() -> Database:
	global _db_instance
	if _db_instance is None:
		await init_database()
	assert _db_instance is not None
	return _db_instance


def _now_iso() -> str:
	return datetime.now(timezone.utc).isoformat()


async def insert_job(db: Database, job_id: str, title: str, metadata: Dict[str, Any]) -> None:
	await db.conn.execute(
		"INSERT OR IGNORE INTO jobs(id, title, metadata, created_at) VALUES (?, ?, ?, ?)",
		(job_id, title, json.dumps(metadata), _now_iso()),
	)
	await db.conn.commit()


async def select_job(db: Database, job_id: str) -> Optional[JobOut]:
	cursor = await db.conn.execute(
		"SELECT id, title, metadata, created_at FROM jobs WHERE id = ?",
		(job_id,),
	)
	row = await cursor.fetchone()
	await cursor.close()
	if row is None:
		return None
	metadata = json.loads(row[2]) if row[2] else {}
	return JobOut(id=row[0], title=row[1], metadata=metadata, created_at=row[3])


async def insert_update(
	db: Database,
	job_id: str,
	status: str,
	stage: Optional[str],
	progress: Optional[int],
	payload: Dict[str, Any],
) -> StatusUpdateOut:
	cursor = await db.conn.execute(
		"INSERT INTO updates(job_id, status, stage, progress, payload, ts) VALUES (?, ?, ?, ?, ?, ?)",
		(job_id, status, stage, progress, json.dumps(payload), _now_iso()),
	)
	await db.conn.commit()
	last_id = cursor.lastrowid
	await cursor.close()
	return StatusUpdateOut(
		id=last_id,
		job_id=job_id,
		status=status,
		stage=stage,
		progress=progress,
		payload=payload,
		ts=_now_iso(),
	)


async def select_updates(
	db: Database,
	job_id: str,
	limit: int = 100,
	after_id: Optional[int] = None,
) -> List[StatusUpdateOut]:
	params: List[Any] = [job_id]
	query = "SELECT id, job_id, status, stage, progress, payload, ts FROM updates WHERE job_id = ?"
	if after_id is not None:
		query += " AND id > ?"
		params.append(after_id)
	query += " ORDER BY id ASC LIMIT ?"
	params.append(limit)
	cursor = await db.conn.execute(query, tuple(params))
	rows = await cursor.fetchall()
	await cursor.close()
	result: List[StatusUpdateOut] = []
	for r in rows:
		result.append(
			StatusUpdateOut(
				id=r[0],
				job_id=r[1],
				status=r[2],
				stage=r[3],
				progress=r[4],
				payload=json.loads(r[5]) if r[5] else {},
				ts=r[6],
			)
		)
	return result

