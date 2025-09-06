import { useEffect, useRef, useState } from 'react';
import { streamJob } from '@/services/agentStatusService';

export type AgentStatus = {
	id: number;
	job_id: string;
	status: string;
	stage?: string;
	progress?: number;
	payload: Record<string, any>;
	ts: string;
};

export function useAgentStatusStream(jobId?: string) {
	const [updates, setUpdates] = useState<AgentStatus[]>([]);
	const [latest, setLatest] = useState<AgentStatus | null>(null);
	const unsubscribeRef = useRef<() => void>();

	useEffect(() => {
		if (!jobId) return;
		unsubscribeRef.current?.();
		setUpdates([]);
		setLatest(null);
		unsubscribeRef.current = streamJob(jobId, (u) => {
			setUpdates(prev => [...prev, u]);
			setLatest(u);
		});
		return () => unsubscribeRef.current?.();
	}, [jobId]);

	return { updates, latest };
}

