// Task Management Automation Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
  completionCriteria?: CompletionCriteria[];
  dependencies?: string[]; // Task IDs that must be completed first
  automationRules?: AutomationRule[];
  metadata?: Record<string, any>;
}

export type TaskStatus = 
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'blocked'
  | 'done'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CompletionCriteria {
  id: string;
  description: string;
  type: 'manual' | 'automated' | 'deadline' | 'dependency';
  condition?: string; // For automated criteria
  completed: boolean;
  completedAt?: Date;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  conditions?: AutomationCondition[];
  enabled: boolean;
  createdAt: Date;
}

export interface AutomationTrigger {
  type: 'status_change' | 'time_based' | 'dependency_completed' | 'criteria_met' | 'webhook';
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  schedule?: string; // Cron expression for time-based triggers
  webhookEvent?: string;
}

export interface AutomationAction {
  type: 'change_status' | 'assign_user' | 'send_notification' | 'create_task' | 'update_external_system';
  targetStatus?: TaskStatus;
  assignee?: string;
  notificationTemplate?: string;
  externalSystemConfig?: ExternalSystemConfig;
  taskTemplate?: Partial<Task>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: any;
}

export interface ExternalSystemConfig {
  type: 'trello' | 'asana' | 'jira' | 'github' | 'slack';
  apiKey?: string;
  boardId?: string;
  projectId?: string;
  webhookUrl?: string;
  mapping?: Record<string, string>;
}

export interface TaskBoard {
  id: string;
  name: string;
  description?: string;
  columns: TaskColumn[];
  tasks: Task[];
  automationRules: AutomationRule[];
  settings: BoardSettings;
}

export interface TaskColumn {
  id: string;
  name: string;
  status: TaskStatus;
  order: number;
  limit?: number; // WIP limit
  color?: string;
}

export interface BoardSettings {
  autoTransitions: boolean;
  notificationsEnabled: boolean;
  timeTracking: boolean;
  externalIntegrations: ExternalSystemConfig[];
  webhookEndpoint?: string;
}

// Webhook payload for external integrations
export interface TaskWebhookPayload {
  event: 'task_created' | 'task_updated' | 'task_deleted' | 'status_changed';
  task: Task;
  previousTask?: Task; // For updates
  timestamp: Date;
  boardId: string;
  triggeredBy?: string; // User or automation rule ID
}

// Metrics and Analytics
export interface TaskMetrics {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  averageCompletionTime: number; // in hours
  automationEfficiency: number; // percentage of automated transitions
  manualInterventions: number;
  bottlenecks: TaskBottleneck[];
  productivity: ProductivityMetrics;
}

export interface TaskBottleneck {
  status: TaskStatus;
  averageTimeInStatus: number;
  tasksStuck: number;
  suggestedActions: string[];
}

export interface ProductivityMetrics {
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  averageTasksPerDay: number;
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  burndownData: BurndownPoint[];
}

export interface BurndownPoint {
  date: Date;
  remainingTasks: number;
  completedTasks: number;
}

// API Response types
export interface TaskResponse {
  success: boolean;
  data?: Task | Task[];
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface AutomationResponse {
  success: boolean;
  data?: {
    rulesExecuted: number;
    tasksAffected: number;
    errors: string[];
  };
  error?: string;
}

// Integration with existing Cursor types
export interface CursorTaskIntegration {
  taskId: string;
  cursorAgentId?: string;
  repository: string;
  branch?: string;
  pullRequestUrl?: string;
  automationTriggered: boolean;
  lastSyncAt: Date;
}