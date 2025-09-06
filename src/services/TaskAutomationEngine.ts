import { 
  Task, 
  TaskStatus, 
  AutomationRule, 
  AutomationTrigger, 
  AutomationAction, 
  TaskWebhookPayload,
  TaskMetrics,
  ExternalSystemConfig,
  CompletionCriteria
} from '../types/task-management';
import { CursorAgent, CursorAgentStatus } from '../types/cursor';

export class TaskAutomationEngine {
  private tasks: Map<string, Task> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private webhookEndpoints: string[] = [];
  private metricsData: TaskMetrics | null = null;
  private eventListeners: Map<string, ((event: any) => void)[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  // Task Management
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.set(task.id, task);
    
    // Trigger automation rules
    await this.processTrigger({
      type: 'status_change',
      toStatus: task.status
    }, task);

    this.emitEvent('task_created', { task });
    return task;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const existingTask = this.tasks.get(taskId);
    if (!existingTask) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const previousTask = { ...existingTask };
    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      updatedAt: new Date()
    };

    this.tasks.set(taskId, updatedTask);

    // Check if status changed to trigger automation
    if (previousTask.status !== updatedTask.status) {
      await this.processTrigger({
        type: 'status_change',
        fromStatus: previousTask.status,
        toStatus: updatedTask.status
      }, updatedTask, previousTask);
    }

    this.emitEvent('task_updated', { task: updatedTask, previousTask });
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    this.tasks.delete(taskId);
    this.emitEvent('task_deleted', { task });
    return true;
  }

  getTask(taskId: string): Task | null {
    return this.tasks.get(taskId) || null;
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter(task => task.status === status);
  }

  // Automation Rules Management
  async addAutomationRule(rule: Omit<AutomationRule, 'id' | 'createdAt'>): Promise<AutomationRule> {
    const automationRule: AutomationRule = {
      ...rule,
      id: this.generateId(),
      createdAt: new Date()
    };

    this.automationRules.set(automationRule.id, automationRule);
    return automationRule;
  }

  async removeAutomationRule(ruleId: string): Promise<boolean> {
    return this.automationRules.delete(ruleId);
  }

  async toggleAutomationRule(ruleId: string, enabled: boolean): Promise<AutomationRule | null> {
    const rule = this.automationRules.get(ruleId);
    if (!rule) {
      return null;
    }

    rule.enabled = enabled;
    this.automationRules.set(ruleId, rule);
    return rule;
  }

  // Core Automation Processing
  private async processTrigger(
    trigger: AutomationTrigger, 
    task: Task, 
    previousTask?: Task
  ): Promise<void> {
    const applicableRules = this.getApplicableRules(trigger, task);
    
    for (const rule of applicableRules) {
      if (!rule.enabled) continue;
      
      try {
        // Check conditions
        if (rule.conditions && !this.evaluateConditions(rule.conditions, task)) {
          continue;
        }

        // Execute action
        await this.executeAction(rule.action, task);
        
        console.log(`Automation rule "${rule.name}" executed for task ${task.id}`);
      } catch (error) {
        console.error(`Error executing automation rule ${rule.id}:`, error);
      }
    }
  }

  private getApplicableRules(trigger: AutomationTrigger, task: Task): AutomationRule[] {
    return Array.from(this.automationRules.values()).filter(rule => {
      if (rule.trigger.type !== trigger.type) return false;
      
      if (trigger.type === 'status_change') {
        if (rule.trigger.fromStatus && rule.trigger.fromStatus !== trigger.fromStatus) return false;
        if (rule.trigger.toStatus && rule.trigger.toStatus !== trigger.toStatus) return false;
      }
      
      return true;
    });
  }

  private evaluateConditions(conditions: any[], task: Task): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(task, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'greater_than':
          return fieldValue > condition.value;
        case 'less_than':
          return fieldValue < condition.value;
        case 'contains':
          return String(fieldValue).includes(condition.value);
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        default:
          return false;
      }
    });
  }

  private getFieldValue(task: Task, field: string): any {
    const fields = field.split('.');
    let value: any = task;
    
    for (const f of fields) {
      value = value?.[f];
    }
    
    return value;
  }

  private async executeAction(action: AutomationAction, task: Task): Promise<void> {
    switch (action.type) {
      case 'change_status':
        if (action.targetStatus) {
          await this.updateTask(task.id, { status: action.targetStatus });
        }
        break;
        
      case 'assign_user':
        if (action.assignee) {
          await this.updateTask(task.id, { assignee: action.assignee });
        }
        break;
        
      case 'send_notification':
        await this.sendNotification(task, action.notificationTemplate);
        break;
        
      case 'create_task':
        if (action.taskTemplate) {
          await this.createTask({
            ...action.taskTemplate,
            title: action.taskTemplate.title || `Follow-up for ${task.title}`,
            status: action.taskTemplate.status || 'todo'
          } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
        }
        break;
        
      case 'update_external_system':
        if (action.externalSystemConfig) {
          await this.updateExternalSystem(task, action.externalSystemConfig);
        }
        break;
    }
  }

  // Default automation rules for MVP
  private initializeDefaultRules(): void {
    // Rule 1: Auto-transition from To Do to In Progress when assigned
    this.addAutomationRule({
      name: 'Auto Start on Assignment',
      description: 'Automatically move task to In Progress when assigned to someone',
      trigger: {
        type: 'status_change',
        toStatus: 'todo'
      },
      action: {
        type: 'change_status',
        targetStatus: 'in_progress'
      },
      conditions: [
        { field: 'assignee', operator: 'exists', value: true }
      ],
      enabled: true
    });

    // Rule 2: Auto-complete when all criteria are met
    this.addAutomationRule({
      name: 'Auto Complete on Criteria Met',
      description: 'Automatically move task to Done when all completion criteria are satisfied',
      trigger: {
        type: 'criteria_met'
      },
      action: {
        type: 'change_status',
        targetStatus: 'done'
      },
      enabled: true
    });

    // Rule 3: Auto-transition based on dependencies
    this.addAutomationRule({
      name: 'Auto Start on Dependencies Complete',
      description: 'Move task to In Progress when all dependencies are completed',
      trigger: {
        type: 'dependency_completed'
      },
      action: {
        type: 'change_status',
        targetStatus: 'in_progress'
      },
      conditions: [
        { field: 'status', operator: 'equals', value: 'todo' }
      ],
      enabled: true
    });
  }

  // Integration with Cursor
  async integrateCursorAgent(taskId: string, cursorAgent: CursorAgent): Promise<void> {
    const task = this.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Update task with Cursor integration data
    await this.updateTask(taskId, {
      metadata: {
        ...task.metadata,
        cursorIntegration: {
          agentId: cursorAgent.id,
          repository: cursorAgent.repository,
          branch: cursorAgent.branch,
          pullRequestUrl: cursorAgent.pullRequestUrl,
          status: cursorAgent.status
        }
      }
    });

    // Auto-transition based on Cursor status
    await this.handleCursorStatusChange(taskId, cursorAgent.status);
  }

  private async handleCursorStatusChange(taskId: string, cursorStatus: CursorAgentStatus): Promise<void> {
    let newTaskStatus: TaskStatus | null = null;

    switch (cursorStatus) {
      case 'RUNNING':
        newTaskStatus = 'in_progress';
        break;
      case 'COMPLETED':
        newTaskStatus = 'in_review'; // PR created, needs review
        break;
      case 'FAILED':
      case 'CANCELLED':
      case 'TIMEOUT':
        newTaskStatus = 'blocked';
        break;
    }

    if (newTaskStatus) {
      await this.updateTask(taskId, { status: newTaskStatus });
    }
  }

  // Completion Criteria Management
  async updateCompletionCriteria(taskId: string, criteriaId: string, completed: boolean): Promise<void> {
    const task = this.getTask(taskId);
    if (!task || !task.completionCriteria) {
      return;
    }

    const criteria = task.completionCriteria.find(c => c.id === criteriaId);
    if (!criteria) {
      return;
    }

    criteria.completed = completed;
    criteria.completedAt = completed ? new Date() : undefined;

    await this.updateTask(taskId, { completionCriteria: task.completionCriteria });

    // Check if all criteria are completed
    const allCompleted = task.completionCriteria.every(c => c.completed);
    if (allCompleted) {
      await this.processTrigger({ type: 'criteria_met' }, task);
    }
  }

  // Webhook Management
  addWebhookEndpoint(url: string): void {
    if (!this.webhookEndpoints.includes(url)) {
      this.webhookEndpoints.push(url);
    }
  }

  removeWebhookEndpoint(url: string): void {
    const index = this.webhookEndpoints.indexOf(url);
    if (index > -1) {
      this.webhookEndpoints.splice(index, 1);
    }
  }

  private async sendWebhooks(payload: TaskWebhookPayload): Promise<void> {
    const promises = this.webhookEndpoints.map(async (url) => {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error(`Failed to send webhook to ${url}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // Notifications
  private async sendNotification(task: Task, template?: string): Promise<void> {
    const message = template || `Task "${task.title}" status changed to ${task.status}`;
    
    // Here you would integrate with notification services (Slack, email, etc.)
    console.log(`Notification: ${message}`);
    
    // Emit event for UI notifications
    this.emitEvent('notification', { message, task });
  }

  // External System Integration
  private async updateExternalSystem(task: Task, config: ExternalSystemConfig): Promise<void> {
    switch (config.type) {
      case 'trello':
        await this.updateTrelloCard(task, config);
        break;
      case 'asana':
        await this.updateAsanaTask(task, config);
        break;
      case 'slack':
        await this.sendSlackMessage(task, config);
        break;
      default:
        console.warn(`External system ${config.type} not supported`);
    }
  }

  private async updateTrelloCard(task: Task, config: ExternalSystemConfig): Promise<void> {
    // Trello API integration
    console.log(`Updating Trello card for task ${task.id}`);
  }

  private async updateAsanaTask(task: Task, config: ExternalSystemConfig): Promise<void> {
    // Asana API integration
    console.log(`Updating Asana task for task ${task.id}`);
  }

  private async sendSlackMessage(task: Task, config: ExternalSystemConfig): Promise<void> {
    // Slack API integration
    console.log(`Sending Slack notification for task ${task.id}`);
  }

  // Metrics and Analytics
  async calculateMetrics(): Promise<TaskMetrics> {
    const allTasks = this.getAllTasks();
    const tasksByStatus = allTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const completedTasks = allTasks.filter(task => task.status === 'done');
    const averageCompletionTime = this.calculateAverageCompletionTime(completedTasks);
    
    // Calculate automation efficiency
    const automatedTransitions = this.countAutomatedTransitions();
    const totalTransitions = this.countTotalTransitions();
    const automationEfficiency = totalTransitions > 0 ? (automatedTransitions / totalTransitions) * 100 : 0;

    this.metricsData = {
      totalTasks: allTasks.length,
      tasksByStatus,
      averageCompletionTime,
      automationEfficiency,
      manualInterventions: totalTransitions - automatedTransitions,
      bottlenecks: this.identifyBottlenecks(),
      productivity: this.calculateProductivityMetrics()
    };

    return this.metricsData;
  }

  private calculateAverageCompletionTime(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
      return sum + completionTime;
    }, 0);
    
    return totalTime / completedTasks.length / (1000 * 60 * 60); // Convert to hours
  }

  private countAutomatedTransitions(): number {
    // This would be tracked in a real implementation
    return 0;
  }

  private countTotalTransitions(): number {
    // This would be tracked in a real implementation
    return 0;
  }

  private identifyBottlenecks(): any[] {
    // Analyze tasks stuck in certain statuses
    return [];
  }

  private calculateProductivityMetrics(): any {
    return {
      tasksCompletedToday: 0,
      tasksCompletedThisWeek: 0,
      averageTasksPerDay: 0,
      velocityTrend: 'stable' as const,
      burndownData: []
    };
  }

  // Event System
  private emitEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });

    // Send webhook
    if (['task_created', 'task_updated', 'task_deleted', 'status_changed'].includes(eventType)) {
      const payload: TaskWebhookPayload = {
        event: eventType as any,
        task: data.task,
        previousTask: data.previousTask,
        timestamp: new Date(),
        boardId: 'default',
        triggeredBy: 'automation'
      };
      this.sendWebhooks(payload);
    }
  }

  addEventListener(eventType: string, listener: (event: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  removeEventListener(eventType: string, listener: (event: any) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Utility Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Dependency Management
  async checkDependencies(taskId: string): Promise<boolean> {
    const task = this.getTask(taskId);
    if (!task || !task.dependencies) {
      return true;
    }

    return task.dependencies.every(depId => {
      const depTask = this.getTask(depId);
      return depTask?.status === 'done';
    });
  }

  async processDependencyCompletion(completedTaskId: string): Promise<void> {
    const dependentTasks = this.getAllTasks().filter(task => 
      task.dependencies?.includes(completedTaskId)
    );

    for (const task of dependentTasks) {
      const allDepsComplete = await this.checkDependencies(task.id);
      if (allDepsComplete) {
        await this.processTrigger({ type: 'dependency_completed' }, task);
      }
    }
  }
}

// Singleton instance
export const taskAutomationEngine = new TaskAutomationEngine();