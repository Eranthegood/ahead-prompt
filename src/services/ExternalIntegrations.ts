import { Task, TaskStatus, ExternalSystemConfig } from '../types/task-management';
import { taskAutomationEngine } from './TaskAutomationEngine';

// Base interface for external system integrations
interface ExternalSystemIntegration {
  config: ExternalSystemConfig;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  syncTask(task: Task): Promise<void>;
  syncFromExternal(): Promise<Task[]>;
  createTask(task: Partial<Task>): Promise<string>; // Returns external ID
  updateTask(externalId: string, updates: Partial<Task>): Promise<void>;
  deleteTask(externalId: string): Promise<void>;
}

// Trello Integration
export class TrelloIntegration implements ExternalSystemIntegration {
  config: ExternalSystemConfig;
  private apiBase = 'https://api.trello.com/1';
  private connected = false;

  constructor(config: ExternalSystemConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/members/me?key=${this.config.apiKey}&token=${this.config.apiKey}`);
      this.connected = response.ok;
      return this.connected;
    } catch (error) {
      console.error('Failed to connect to Trello:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async syncTask(task: Task): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Trello');
    }

    const trelloCardId = task.metadata?.trello?.cardId;
    
    if (trelloCardId) {
      await this.updateTask(trelloCardId, task);
    } else {
      const externalId = await this.createTask(task);
      await taskAutomationEngine.updateTask(task.id, {
        metadata: {
          ...task.metadata,
          trello: {
            cardId: externalId,
            boardId: this.config.boardId,
            listId: this.getListIdForStatus(task.status)
          }
        }
      });
    }
  }

  async syncFromExternal(): Promise<Task[]> {
    if (!this.connected) {
      throw new Error('Not connected to Trello');
    }

    const response = await fetch(
      `${this.apiBase}/boards/${this.config.boardId}/cards?key=${this.config.apiKey}&token=${this.config.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Trello cards');
    }

    const cards = await response.json();
    const tasks: Task[] = [];

    for (const card of cards) {
      const task = await this.convertTrelloCardToTask(card);
      tasks.push(task);
    }

    return tasks;
  }

  async createTask(task: Partial<Task>): Promise<string> {
    const listId = this.getListIdForStatus(task.status || 'todo');
    
    const response = await fetch(`${this.apiBase}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: this.config.apiKey,
        token: this.config.apiKey,
        idList: listId,
        name: task.title,
        desc: task.description,
        due: task.dueDate?.toISOString(),
        labels: task.tags?.join(',')
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create Trello card');
    }

    const card = await response.json();
    return card.id;
  }

  async updateTask(externalId: string, updates: Partial<Task>): Promise<void> {
    const updateData: any = {};

    if (updates.title) updateData.name = updates.title;
    if (updates.description) updateData.desc = updates.description;
    if (updates.dueDate) updateData.due = updates.dueDate.toISOString();
    if (updates.status) updateData.idList = this.getListIdForStatus(updates.status);

    const response = await fetch(`${this.apiBase}/cards/${externalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updateData,
        key: this.config.apiKey,
        token: this.config.apiKey
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update Trello card');
    }
  }

  async deleteTask(externalId: string): Promise<void> {
    const response = await fetch(`${this.apiBase}/cards/${externalId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: this.config.apiKey,
        token: this.config.apiKey
      })
    });

    if (!response.ok) {
      throw new Error('Failed to delete Trello card');
    }
  }

  private getListIdForStatus(status: TaskStatus): string {
    // This would be configured based on the Trello board structure
    const mapping = this.config.mapping || {
      todo: 'todo_list_id',
      in_progress: 'progress_list_id',
      in_review: 'review_list_id',
      blocked: 'blocked_list_id',
      done: 'done_list_id',
      cancelled: 'cancelled_list_id'
    };
    
    return mapping[status] || mapping.todo;
  }

  private async convertTrelloCardToTask(card: any): Promise<Task> {
    return {
      id: `trello_${card.id}`,
      title: card.name,
      description: card.desc,
      status: this.getStatusFromListId(card.idList),
      priority: this.getPriorityFromLabels(card.labels),
      dueDate: card.due ? new Date(card.due) : undefined,
      tags: card.labels?.map((label: any) => label.name) || [],
      createdAt: new Date(card.dateLastActivity),
      updatedAt: new Date(card.dateLastActivity),
      metadata: {
        trello: {
          cardId: card.id,
          listId: card.idList,
          boardId: card.idBoard,
          url: card.url
        }
      }
    };
  }

  private getStatusFromListId(listId: string): TaskStatus {
    const reverseMapping = Object.entries(this.config.mapping || {}).reduce((acc, [status, id]) => {
      acc[id] = status as TaskStatus;
      return acc;
    }, {} as Record<string, TaskStatus>);
    
    return reverseMapping[listId] || 'todo';
  }

  private getPriorityFromLabels(labels: any[]): any {
    const priorityLabels = labels?.filter(label => 
      ['low', 'medium', 'high', 'urgent'].includes(label.name.toLowerCase())
    );
    
    return priorityLabels?.[0]?.name.toLowerCase() || 'medium';
  }
}

// Asana Integration
export class AsanaIntegration implements ExternalSystemIntegration {
  config: ExternalSystemConfig;
  private apiBase = 'https://app.asana.com/api/1.0';
  private connected = false;

  constructor(config: ExternalSystemConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/users/me`, {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
      });
      this.connected = response.ok;
      return this.connected;
    } catch (error) {
      console.error('Failed to connect to Asana:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async syncTask(task: Task): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to Asana');
    }

    const asanaTaskId = task.metadata?.asana?.taskId;
    
    if (asanaTaskId) {
      await this.updateTask(asanaTaskId, task);
    } else {
      const externalId = await this.createTask(task);
      await taskAutomationEngine.updateTask(task.id, {
        metadata: {
          ...task.metadata,
          asana: {
            taskId: externalId,
            projectId: this.config.projectId
          }
        }
      });
    }
  }

  async syncFromExternal(): Promise<Task[]> {
    if (!this.connected) {
      throw new Error('Not connected to Asana');
    }

    const response = await fetch(
      `${this.apiBase}/projects/${this.config.projectId}/tasks?opt_fields=name,notes,completed,due_on,tags,assignee`,
      {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Asana tasks');
    }

    const data = await response.json();
    const tasks: Task[] = [];

    for (const asanaTask of data.data) {
      const task = await this.convertAsanaTaskToTask(asanaTask);
      tasks.push(task);
    }

    return tasks;
  }

  async createTask(task: Partial<Task>): Promise<string> {
    const response = await fetch(`${this.apiBase}/tasks`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          name: task.title,
          notes: task.description,
          projects: [this.config.projectId],
          due_on: task.dueDate?.toISOString().split('T')[0],
          completed: task.status === 'done'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create Asana task');
    }

    const data = await response.json();
    return data.data.gid;
  }

  async updateTask(externalId: string, updates: Partial<Task>): Promise<void> {
    const updateData: any = {};

    if (updates.title) updateData.name = updates.title;
    if (updates.description) updateData.notes = updates.description;
    if (updates.dueDate) updateData.due_on = updates.dueDate.toISOString().split('T')[0];
    if (updates.status !== undefined) updateData.completed = updates.status === 'done';

    const response = await fetch(`${this.apiBase}/tasks/${externalId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: updateData })
    });

    if (!response.ok) {
      throw new Error('Failed to update Asana task');
    }
  }

  async deleteTask(externalId: string): Promise<void> {
    const response = await fetch(`${this.apiBase}/tasks/${externalId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
    });

    if (!response.ok) {
      throw new Error('Failed to delete Asana task');
    }
  }

  private async convertAsanaTaskToTask(asanaTask: any): Promise<Task> {
    return {
      id: `asana_${asanaTask.gid}`,
      title: asanaTask.name,
      description: asanaTask.notes,
      status: asanaTask.completed ? 'done' : 'todo',
      priority: 'medium', // Asana doesn't have built-in priority
      dueDate: asanaTask.due_on ? new Date(asanaTask.due_on) : undefined,
      assignee: asanaTask.assignee?.name,
      tags: asanaTask.tags?.map((tag: any) => tag.name) || [],
      createdAt: new Date(asanaTask.created_at),
      updatedAt: new Date(asanaTask.modified_at),
      metadata: {
        asana: {
          taskId: asanaTask.gid,
          projectId: this.config.projectId,
          permalink: asanaTask.permalink_url
        }
      }
    };
  }
}

// GitHub Integration
export class GitHubIntegration implements ExternalSystemIntegration {
  config: ExternalSystemConfig;
  private apiBase = 'https://api.github.com';
  private connected = false;
  private repoOwner: string;
  private repoName: string;

  constructor(config: ExternalSystemConfig) {
    this.config = config;
    // Extract owner and repo from repository URL or config
    const repoPath = config.mapping?.repository || '';
    [this.repoOwner, this.repoName] = repoPath.split('/');
  }

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/user`, {
        headers: { 'Authorization': `token ${this.config.apiKey}` }
      });
      this.connected = response.ok;
      return this.connected;
    } catch (error) {
      console.error('Failed to connect to GitHub:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async syncTask(task: Task): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to GitHub');
    }

    const githubIssueId = task.metadata?.github?.issueNumber;
    
    if (githubIssueId) {
      await this.updateTask(githubIssueId.toString(), task);
    } else {
      const externalId = await this.createTask(task);
      await taskAutomationEngine.updateTask(task.id, {
        metadata: {
          ...task.metadata,
          github: {
            issueNumber: parseInt(externalId),
            repository: `${this.repoOwner}/${this.repoName}`
          }
        }
      });
    }
  }

  async syncFromExternal(): Promise<Task[]> {
    if (!this.connected) {
      throw new Error('Not connected to GitHub');
    }

    const response = await fetch(
      `${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/issues?state=all`,
      {
        headers: { 'Authorization': `token ${this.config.apiKey}` }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch GitHub issues');
    }

    const issues = await response.json();
    const tasks: Task[] = [];

    for (const issue of issues) {
      if (!issue.pull_request) { // Skip pull requests
        const task = await this.convertGitHubIssueToTask(issue);
        tasks.push(task);
      }
    }

    return tasks;
  }

  async createTask(task: Partial<Task>): Promise<string> {
    const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/issues`, {
      method: 'POST',
      headers: { 
        'Authorization': `token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: task.title,
        body: task.description,
        labels: task.tags || [],
        assignees: task.assignee ? [task.assignee] : []
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create GitHub issue');
    }

    const issue = await response.json();
    return issue.number.toString();
  }

  async updateTask(externalId: string, updates: Partial<Task>): Promise<void> {
    const updateData: any = {};

    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.body = updates.description;
    if (updates.tags) updateData.labels = updates.tags;
    if (updates.status === 'done') updateData.state = 'closed';
    else if (updates.status !== 'done') updateData.state = 'open';

    const response = await fetch(`${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/issues/${externalId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `token ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error('Failed to update GitHub issue');
    }
  }

  async deleteTask(externalId: string): Promise<void> {
    // GitHub doesn't support deleting issues, so we close them instead
    await this.updateTask(externalId, { status: 'cancelled' });
  }

  private async convertGitHubIssueToTask(issue: any): Promise<Task> {
    return {
      id: `github_${issue.number}`,
      title: issue.title,
      description: issue.body,
      status: issue.state === 'closed' ? 'done' : 'todo',
      priority: this.getPriorityFromLabels(issue.labels),
      assignee: issue.assignee?.login,
      tags: issue.labels?.map((label: any) => label.name) || [],
      createdAt: new Date(issue.created_at),
      updatedAt: new Date(issue.updated_at),
      metadata: {
        github: {
          issueNumber: issue.number,
          repository: `${this.repoOwner}/${this.repoName}`,
          url: issue.html_url,
          state: issue.state
        }
      }
    };
  }

  private getPriorityFromLabels(labels: any[]): any {
    const priorityLabel = labels?.find(label => 
      ['priority:low', 'priority:medium', 'priority:high', 'priority:urgent'].includes(label.name)
    );
    
    return priorityLabel?.name.split(':')[1] || 'medium';
  }
}

// Slack Integration (for notifications)
export class SlackIntegration {
  private config: ExternalSystemConfig;
  private apiBase = 'https://slack.com/api';

  constructor(config: ExternalSystemConfig) {
    this.config = config;
  }

  async sendTaskNotification(task: Task, message: string, channel?: string): Promise<void> {
    const response = await fetch(`${this.apiBase}/chat.postMessage`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channel || '#general',
        text: message,
        attachments: [{
          color: this.getColorForStatus(task.status),
          fields: [
            { title: 'Task', value: task.title, short: true },
            { title: 'Status', value: task.status, short: true },
            { title: 'Priority', value: task.priority, short: true },
            { title: 'Assignee', value: task.assignee || 'Unassigned', short: true }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send Slack notification');
    }
  }

  private getColorForStatus(status: TaskStatus): string {
    const colors = {
      todo: '#36a3eb',
      in_progress: '#ffce56',
      in_review: '#ff9f40',
      blocked: '#ff6384',
      done: '#4bc0c0',
      cancelled: '#9966ff'
    };
    return colors[status] || '#36a3eb';
  }
}

// Integration Manager
export class IntegrationManager {
  private integrations: Map<string, ExternalSystemIntegration> = new Map();
  private slackIntegration?: SlackIntegration;

  async addIntegration(name: string, config: ExternalSystemConfig): Promise<boolean> {
    let integration: ExternalSystemIntegration;

    switch (config.type) {
      case 'trello':
        integration = new TrelloIntegration(config);
        break;
      case 'asana':
        integration = new AsanaIntegration(config);
        break;
      case 'github':
        integration = new GitHubIntegration(config);
        break;
      case 'slack':
        this.slackIntegration = new SlackIntegration(config);
        return true;
      default:
        throw new Error(`Unsupported integration type: ${config.type}`);
    }

    const connected = await integration.connect();
    if (connected) {
      this.integrations.set(name, integration);
    }

    return connected;
  }

  async removeIntegration(name: string): Promise<void> {
    const integration = this.integrations.get(name);
    if (integration) {
      await integration.disconnect();
      this.integrations.delete(name);
    }
  }

  async syncTask(task: Task): Promise<void> {
    const promises = Array.from(this.integrations.values()).map(integration =>
      integration.syncTask(task).catch(error => 
        console.error(`Failed to sync task to ${integration.config.type}:`, error)
      )
    );

    await Promise.allSettled(promises);
  }

  async syncFromAllSources(): Promise<Task[]> {
    const allTasks: Task[] = [];
    
    for (const [name, integration] of this.integrations) {
      try {
        const tasks = await integration.syncFromExternal();
        allTasks.push(...tasks);
        console.log(`Synced ${tasks.length} tasks from ${name}`);
      } catch (error) {
        console.error(`Failed to sync from ${name}:`, error);
      }
    }

    return allTasks;
  }

  async sendNotification(task: Task, message: string, channel?: string): Promise<void> {
    if (this.slackIntegration) {
      await this.slackIntegration.sendTaskNotification(task, message, channel);
    }
  }

  getIntegrations(): string[] {
    return Array.from(this.integrations.keys());
  }

  getIntegration(name: string): ExternalSystemIntegration | undefined {
    return this.integrations.get(name);
  }
}

// Singleton instance
export const integrationManager = new IntegrationManager();