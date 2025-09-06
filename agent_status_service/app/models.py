from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
	job_id: Optional[str] = Field(default=None, description="Client-supplied job identifier")
	title: Optional[str] = Field(default=None)
	metadata: Optional[Dict[str, Any]] = Field(default=None)


class JobOut(BaseModel):
	id: str
	title: str
	metadata: Dict[str, Any]
	created_at: str


class StatusUpdateIn(BaseModel):
	status: str
	stage: Optional[str] = None
	progress: Optional[int] = Field(default=None, ge=0, le=100)
	payload: Optional[Dict[str, Any]] = None


class StatusUpdateOut(BaseModel):
	id: int
	job_id: str
	status: str
	stage: Optional[str] = None
	progress: Optional[int] = None
	payload: Dict[str, Any]
	ts: str

