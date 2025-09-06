import { taskAutomationEngine } from './TaskAutomationEngine';
import { Task, TaskWebhookPayload, ExternalSystemConfig } from '../types/task-management';
import { CursorWebhookPayload, CursorAgentStatus } from '../types/cursor';

export class WebhookHandler {
  private endpoints: Map<string, (payload: any) => Promise<void>> = new Map();

  constructor() {
    this.setupDefaultEndpoints();
  }

  private setupDefaultEndpoints(): void {
    // Cursor webhook endpoint
    this.endpoints.set('/webhooks/cursor', this.handleCursorWebhook.bind(this));
    
    // Trello webhook endpoint
    this.endpoints.set('/webhooks/trello', this.handleTrelloWebhook.bind(this));
    
    // Asana webhook endpoint
    this.endpoints.set('/webhooks/asana', this.handleAsanaWebhook.bind(this));
    
    // GitHub webhook endpoint
    this.endpoints.set('/webhooks/github', this.handleGitHubWebhook.bind(this));
    
    // Generic task webhook endpoint
    this.endpoints.set('/webhooks/task', this.handleTaskWebhook.bind(this));
  }

  // Main webhook processor
  async processWebhook(endpoint: string, payload: any, headers: Record<string, string> = {}): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const handler = this.endpoints.get(endpoint);
      if (!handler) {
        return { success: false, error: `Unknown webhook endpoint: ${endpoint}` };
      }

      // Verify webhook signature if present
      if (headers['x-webhook-signature']) {
        const isValid = await this.verifySignature(payload, headers['x-webhook-signature'], endpoint);
        if (!isValid) {
          return { success: false, error: 'Invalid webhook signature' };
        }
      }

      await handler(payload);
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error(`Error processing webhook ${endpoint}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Cursor webhook handler
  private async handleCursorWebhook(payload: CursorWebhookPayload): Promise<void> {
    console.log('Processing Cursor webhook:', payload);

    // Find tasks associated with this Cursor agent
    const tasks = taskAutomationEngine.getAllTasks().filter(task => 
      task.metadata?.cursorIntegration?.agentId === payload.agentId
    );

    for (const task of tasks) {
      await this.updateTaskFromCursorStatus(task, payload);
    }

    // If no existing task found, create one for tracking
    if (tasks.length === 0 && payload.status === 'RUNNING') {
      await this.createTaskFromCursorAgent(payload);
    }
  }

  private async updateTaskFromCursorStatus(task: Task, payload: CursorWebhookPayload): Promise<void> {
    let newStatus = task.status;
    const updates: Partial<Task> = {};

    // Map Cursor status to task status
    switch (payload.status) {
      case 'PENDING':
      case 'QUEUED':
        newStatus = 'todo';
        break;
      case 'RUNNING':
        newStatus = 'in_progress';
        break;
      case 'COMPLETED':
        newStatus = 'in_review'; // PR created, needs review
        if (payload.pullRequestUrl) {
          updates.metadata = {
            ...task.metadata,
            cursorIntegration: {
              ...task.metadata?.cursorIntegration,
              pullRequestUrl: payload.pullRequestUrl,
              pullRequestNumber: payload.pullRequestNumber
            }
          };
        }
        break;
      case 'FAILED':
      case 'CANCELLED':
      case 'TIMEOUT':
        newStatus = 'blocked';
        if (payload.error) {
          updates.metadata = {
            ...task.metadata,
            error: payload.error
          };
        }
        break;
    }

    if (newStatus !== task.status) {
      updates.status = newStatus;
    }

    if (Object.keys(updates).length > 0) {
      await taskAutomationEngine.updateTask(task.id, updates);
    }
  }

  private async createTaskFromCursorAgent(payload: CursorWebhookPayload): Promise<void> {
    const task = await taskAutomationEngine.createTask({
      title: `Cursor Agent: ${payload.repository}`,
      description: `Automated task created from Cursor agent ${payload.agentId}`,
      status: 'in_progress',
      priority: 'medium',
      metadata: {
        cursorIntegration: {
          agentId: payload.agentId,
          repository: payload.repository,
          branch: payload.branch,
          pullRequestUrl: payload.pullRequestUrl,
          pullRequestNumber: payload.pullRequestNumber
        },
        autoCreated: true,
        source: 'cursor_webhook'
      }
    });

    console.log(`Created task ${task.id} from Cursor agent ${payload.agentId}`);
  }

  // Trello webhook handler
  private async handleTrelloWebhook(payload: any): Promise<void> {
    console.log('Processing Trello webhook:', payload);

    const action = payload.action;
    if (!action) return;

    switch (action.type) {
      case 'updateCard':
        await this.handleTrelloCardUpdate(action);
        break;
      case 'createCard':
        await this.handleTrelloCardCreate(action);
        break;
      case 'deleteCard':
        await this.handleTrelloCardDelete(action);
        break;
    }
  }

  private async handleTrelloCardUpdate(action: any): Promise<void> {
    const card = action.data.card;
    const listAfter = action.data.listAfter;
    const listBefore = action.data.listBefore;

    // Find task by Trello card ID
    const task = this.findTaskByExternalId('trello', card.id);
    if (!task) return;

    // Map Trello list to task status
    let newStatus = task.status;
    if (listAfter && listBefore && listAfter.id !== listBefore.id) {
      newStatus = this.mapTrelloListToStatus(listAfter.name);
    }

    if (newStatus !== task.status) {
      await taskAutomationEngine.updateTask(task.id, { 
        status: newStatus,
        metadata: {
          ...task.metadata,
          trello: {
            ...task.metadata?.trello,
            listId: listAfter?.id,
            listName: listAfter?.name
          }
        }
      });
    }
  }

  private async handleTrelloCardCreate(action: any): Promise<void> {
    const card = action.data.card;
    const list = action.data.list;

    // Create new task from Trello card
    await taskAutomationEngine.createTask({
      title: card.name,
      description: card.desc || undefined,
      status: this.mapTrelloListToStatus(list.name),
      priority: 'medium',
      metadata: {
        trello: {
          cardId: card.id,
          listId: list.id,
          listName: list.name,
          boardId: action.data.board.id
        },
        autoCreated: true,
        source: 'trello_webhook'
      }
    });
  }

  private async handleTrelloCardDelete(action: any): Promise<void> {
    const card = action.data.card;
    const task = this.findTaskByExternalId('trello', card.id);
    
    if (task) {
      await taskAutomationEngine.deleteTask(task.id);
    }
  }

  // Asana webhook handler
  private async handleAsanaWebhook(payload: any): Promise<void> {
    console.log('Processing Asana webhook:', payload);

    for (const event of payload.events || []) {
      switch (event.action) {
        case 'changed':
          await this.handleAsanaTaskChange(event);
          break;
        case 'added':
          await this.handleAsanaTaskCreate(event);
          break;
        case 'removed':
          await this.handleAsanaTaskDelete(event);
          break;
      }
    }
  }

  private async handleAsanaTaskChange(event: any): Promise<void> {
    const task = this.findTaskByExternalId('asana', event.resource.gid);
    if (!task) return;

    // Handle status changes
    if (event.change && event.change.field === 'completed') {
      const newStatus = event.change.new_value ? 'done' : 'in_progress';
      if (newStatus !== task.status) {
        await taskAutomationEngine.updateTask(task.id, { status: newStatus });
      }
    }
  }

  private async handleAsanaTaskCreate(event: any): Promise<void> {
    // Fetch full task details from Asana API
    // This would require Asana API integration
    console.log('Creating task from Asana:', event.resource.gid);
  }

  private async handleAsanaTaskDelete(event: any): Promise<void> {
    const task = this.findTaskByExternalId('asana', event.resource.gid);
    if (task) {
      await taskAutomationEngine.deleteTask(task.id);
    }
  }

  // GitHub webhook handler
  private async handleGitHubWebhook(payload: any): Promise<void> {
    console.log('Processing GitHub webhook:', payload);

    switch (payload.action) {
      case 'opened':
        await this.handlePullRequestOpened(payload);
        break;
      case 'closed':
        await this.handlePullRequestClosed(payload);
        break;
      case 'merged':
        await this.handlePullRequestMerged(payload);
        break;
    }
  }

  private async handlePullRequestOpened(payload: any): Promise<void> {
    const pr = payload.pull_request;
    
    // Find tasks associated with this branch or PR
    const tasks = taskAutomationEngine.getAllTasks().filter(task => {
      const cursorIntegration = task.metadata?.cursorIntegration;
      return cursorIntegration?.branch === pr.head.ref || 
             cursorIntegration?.pullRequestUrl === pr.html_url;
    });

    for (const task of tasks) {
      await taskAutomationEngine.updateTask(task.id, {
        status: 'in_review',
        metadata: {
          ...task.metadata,
          github: {
            pullRequestUrl: pr.html_url,
            pullRequestNumber: pr.number,
            branch: pr.head.ref
          }
        }
      });
    }
  }

  private async handlePullRequestClosed(payload: any): Promise<void> {
    const pr = payload.pull_request;
    const merged = pr.merged;

    const tasks = taskAutomationEngine.getAllTasks().filter(task => {
      const github = task.metadata?.github;
      return github?.pullRequestNumber === pr.number;
    });

    for (const task of tasks) {
      const newStatus = merged ? 'done' : 'blocked';
      await taskAutomationEngine.updateTask(task.id, { 
        status: newStatus,
        metadata: {
          ...task.metadata,
          github: {
            ...task.metadata?.github,
            merged,
            closedAt: new Date().toISOString()
          }
        }
      });
    }
  }

  private async handlePullRequestMerged(payload: any): Promise<void> {
    await this.handlePullRequestClosed({ ...payload, pull_request: { ...payload.pull_request, merged: true } });
  }

  // Generic task webhook handler
  private async handleTaskWebhook(payload: TaskWebhookPayload): Promise<void> {
    console.log('Processing generic task webhook:', payload);

    switch (payload.event) {
      case 'task_created':
        // External system created a task
        if (!this.findTaskByExternalId('generic', payload.task.id)) {
          await taskAutomationEngine.createTask({
            ...payload.task,
            metadata: {
              ...payload.task.metadata,
              externalSource: true,
              originalId: payload.task.id
            }
          });
        }
        break;
        
      case 'task_updated':
        const existingTask = this.findTaskByExternalId('generic', payload.task.id);
        if (existingTask) {
          await taskAutomationEngine.updateTask(existingTask.id, payload.task);
        }
        break;
        
      case 'task_deleted':
        const taskToDelete = this.findTaskByExternalId('generic', payload.task.id);
        if (taskToDelete) {
          await taskAutomationEngine.deleteTask(taskToDelete.id);
        }
        break;
    }
  }

  // Utility methods
  private findTaskByExternalId(system: string, externalId: string): Task | null {
    return taskAutomationEngine.getAllTasks().find(task => {
      const metadata = task.metadata;
      switch (system) {
        case 'trello':
          return metadata?.trello?.cardId === externalId;
        case 'asana':
          return metadata?.asana?.taskId === externalId;
        case 'github':
          return metadata?.github?.pullRequestNumber === parseInt(externalId);
        case 'generic':
          return metadata?.originalId === externalId;
        default:
          return false;
      }
    }) || null;
  }

  private mapTrelloListToStatus(listName: string): any {
    const lowercaseName = listName.toLowerCase();
    
    if (lowercaseName.includes('to do') || lowercaseName.includes('todo') || lowercaseName.includes('backlog')) {
      return 'todo';
    }
    if (lowercaseName.includes('in progress') || lowercaseName.includes('doing') || lowercaseName.includes('working')) {
      return 'in_progress';
    }
    if (lowercaseName.includes('review') || lowercaseName.includes('testing')) {
      return 'in_review';
    }
    if (lowercaseName.includes('done') || lowercaseName.includes('complete') || lowercaseName.includes('finished')) {
      return 'done';
    }
    if (lowercaseName.includes('blocked') || lowercaseName.includes('stuck')) {
      return 'blocked';
    }
    
    return 'todo'; // Default fallback
  }

  private async verifySignature(payload: any, signature: string, endpoint: string): Promise<boolean> {
    // Implement signature verification based on the external system
    // This is a simplified example - in production, use proper HMAC verification
    
    switch (endpoint) {
      case '/webhooks/trello':
        return this.verifyTrelloSignature(payload, signature);
      case '/webhooks/github':
        return this.verifyGitHubSignature(payload, signature);
      default:
        return true; // Skip verification for other endpoints in this example
    }
  }

  private async verifyTrelloSignature(payload: any, signature: string): Promise<boolean> {
    // Implement Trello webhook signature verification
    // https://developer.atlassian.com/cloud/trello/guides/rest-api/webhooks/#webhook-signatures
    return true; // Simplified for example
  }

  private async verifyGitHubSignature(payload: any, signature: string): Promise<boolean> {
    // Implement GitHub webhook signature verification
    // https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
    return true; // Simplified for example
  }

  // Public methods for registering custom endpoints
  registerEndpoint(path: string, handler: (payload: any) => Promise<void>): void {
    this.endpoints.set(path, handler);
  }

  unregisterEndpoint(path: string): boolean {
    return this.endpoints.delete(path);
  }

  getRegisteredEndpoints(): string[] {
    return Array.from(this.endpoints.keys());
  }
}

// Singleton instance
export const webhookHandler = new WebhookHandler();