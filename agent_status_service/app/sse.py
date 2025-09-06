import asyncio
from typing import Dict

from .models import StatusUpdateOut


class Broadcaster:
	def __init__(self) -> None:
		self._job_to_subscribers: Dict[str, set[asyncio.Queue[StatusUpdateOut]]] = {}
		self._lock = asyncio.Lock()

	async def subscribe(self, job_id: str) -> asyncio.Queue[StatusUpdateOut]:
		queue: asyncio.Queue[StatusUpdateOut] = asyncio.Queue()
		async with self._lock:
			self._job_to_subscribers.setdefault(job_id, set()).add(queue)
		return queue

	async def unsubscribe(self, job_id: str, queue: asyncio.Queue[StatusUpdateOut]) -> None:
		async with self._lock:
			subs = self._job_to_subscribers.get(job_id)
			if subs and queue in subs:
				subs.remove(queue)
				if not subs:
					self._job_to_subscribers.pop(job_id, None)

	async def publish(self, job_id: str, update: StatusUpdateOut) -> None:
		async with self._lock:
			for q in list(self._job_to_subscribers.get(job_id, set())):
				# Put without awaiting to avoid blocking
				try:
					q.put_nowait(update)
				except asyncio.QueueFull:
					pass


_broadcaster_instance: Broadcaster | None = None


async def get_broadcaster() -> Broadcaster:
	global _broadcaster_instance
	if _broadcaster_instance is None:
		_broadcaster_instance = Broadcaster()
	return _broadcaster_instance

