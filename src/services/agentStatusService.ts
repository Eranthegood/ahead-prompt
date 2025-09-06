type StatusUpdate = {
	id: number;
	job_id: string;
	status: string;
	stage?: string;
	progress?: number;
	payload: Record<string, any>;
	ts: string;
};

const SERVICE_URL = (window as any).__AGENT_STATUS_URL__ || (import.meta as any).env?.VITE_AGENT_STATUS_URL || '/agent-status';
const AHEAD_TOKEN = (window as any).__AHEAD_TOKEN__ || (import.meta as any).env?.VITE_AHEAD_TOKEN;

export async function createJob(init: { jobId?: string; title?: string; metadata?: Record<string, any>; }): Promise<{ id: string } | null> {
	try {
		const res = await fetch(`${SERVICE_URL}/api/jobs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(AHEAD_TOKEN ? { Authorization: `Bearer ${AHEAD_TOKEN}` } : {})
			},
			body: JSON.stringify({ job_id: init.jobId, title: init.title, metadata: init.metadata || {} })
		});
		if (!res.ok) return null;
		const data = await res.json();
		return { id: data.id };
	} catch (e) {
		console.error('createJob failed', e);
		return null;
	}
}

export function streamJob(jobId: string, onUpdate: (u: StatusUpdate) => void): () => void {
	const url = `${SERVICE_URL}/api/jobs/${jobId}/stream`;
	const es = new EventSource(url);
	es.addEventListener('status', (evt) => {
		try {
			const data = JSON.parse((evt as MessageEvent).data);
			onUpdate(data as StatusUpdate);
		} catch (err) {
			console.error('SSE parse error', err);
		}
	});
	return () => es.close();
}

