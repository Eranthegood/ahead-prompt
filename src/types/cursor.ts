// Centralized Cursor integration types
export interface CursorAgent {
  id: string;
  status: CursorAgentStatus;
  repository: string;
  branch?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  error?: string;
  createdAt?: string;
  completedAt?: string;
  filesModified?: string[];
  logs?: CursorAgentLog[];
}

export interface CursorAgentLog {
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: any;
}

// Cursor API Status -> Internal Status Mapping
export type CursorAgentStatus = 
  | 'PENDING'      // Agent created, waiting to start
  | 'QUEUED'       // Agent queued for execution
  | 'RUNNING'      // Agent actively working
  | 'COMPLETED'    // Agent finished successfully
  | 'FAILED'       // Agent failed with error
  | 'CANCELLED'    // Agent was cancelled
  | 'TIMEOUT';     // Agent timed out

export type InternalPromptStatus = 
  | 'todo'
  | 'in_progress'
  | 'generating'
  | 'sending_to_cursor'
  | 'sent_to_cursor'
  | 'cursor_working'
  | 'pr_created'
  | 'pr_review'
  | 'pr_ready'
  | 'pr_merged'
  | 'done'
  | 'error';

// Status mapping utilities
export const mapCursorStatusToInternal = (cursorStatus: CursorAgentStatus): InternalPromptStatus => {
  switch (cursorStatus) {
    case 'PENDING':
    case 'QUEUED':
      return 'sent_to_cursor';
    case 'RUNNING':
      return 'cursor_working';
    case 'COMPLETED':
      return 'pr_created'; // Assume PR is created on completion
    case 'FAILED':
    case 'CANCELLED':
    case 'TIMEOUT':
      return 'error';
    default:
      return 'sent_to_cursor';
  }
};

export const getStatusDisplayInfo = (status: CursorAgentStatus | InternalPromptStatus) => {
  const statusMap = {
    // Cursor statuses
    'PENDING': { label: 'Pending', color: 'bg-yellow-500', icon: 'Clock' },
    'QUEUED': { label: 'Queued', color: 'bg-blue-500', icon: 'Clock' },
    'RUNNING': { label: 'Working', color: 'bg-blue-600', icon: 'Zap' },
    'COMPLETED': { label: 'Completed', color: 'bg-green-500', icon: 'CheckCircle' },
    'FAILED': { label: 'Failed', color: 'bg-red-500', icon: 'AlertCircle' },
    'CANCELLED': { label: 'Cancelled', color: 'bg-gray-500', icon: 'X' },
    'TIMEOUT': { label: 'Timeout', color: 'bg-orange-500', icon: 'Clock' },
    
    // Internal statuses
    'sending_to_cursor': { label: 'Sending', color: 'bg-purple-500', icon: 'ArrowRight' },
    'sent_to_cursor': { label: 'Sent', color: 'bg-blue-500', icon: 'GitBranch' },
    'cursor_working': { label: 'Coding', color: 'bg-blue-600', icon: 'Zap' },
    'pr_created': { label: 'PR Created', color: 'bg-green-500', icon: 'GitPullRequest' },
    'pr_review': { label: 'In Review', color: 'bg-orange-500', icon: 'Eye' },
    'pr_ready': { label: 'Ready', color: 'bg-green-600', icon: 'CheckCircle' },
    'pr_merged': { label: 'Merged', color: 'bg-emerald-500', icon: 'GitMerge' },
    'error': { label: 'Error', color: 'bg-red-500', icon: 'AlertCircle' }
  } as const;

  return statusMap[status] || { label: status, color: 'bg-gray-500', icon: 'Circle' };
};

export interface CursorIntegrationConfig {
  repository: string;
  ref: string;
  branchName?: string;
  autoCreatePr: boolean;
  model: string;
  webhookUrl?: string;
}

export interface CursorWebhookPayload {
  agentId: string;
  status: CursorAgentStatus;
  repository?: string;
  branch?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  error?: string;
  filesModified?: string[];
  logs?: CursorAgentLog[];
}