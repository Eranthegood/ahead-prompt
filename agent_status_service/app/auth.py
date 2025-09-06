import os
from enum import Enum
from typing import Callable, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


class AuthRole(str, Enum):
	AHEAD_OR_ADMIN = "ahead_or_admin"
	CURSOR_OR_ADMIN = "cursor_or_admin"
	ANY = "any"


_bearer_scheme = HTTPBearer(auto_error=False)


def get_auth_dependency(role: AuthRole) -> Callable[[Optional[HTTPAuthorizationCredentials]], None]:
	async def dependency(credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme)) -> None:
		# Reading tokens from environment variables
		ahead_token = os.getenv("AHEAD_TOKEN")
		cursor_token = os.getenv("CURSOR_TOKEN")
		admin_token = os.getenv("ADMIN_TOKEN")

		if role == AuthRole.ANY:
			return

		received: Optional[str] = credentials.credentials if credentials else None

		def ok(token: Optional[str]) -> bool:
			return bool(token) and received == token

		if role == AuthRole.AHEAD_OR_ADMIN:
			if ok(ahead_token) or ok(admin_token):
				return
		elif role == AuthRole.CURSOR_OR_ADMIN:
			if ok(cursor_token) or ok(admin_token):
				return

		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

	return dependency

