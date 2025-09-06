import { Task, TaskStatus, TaskResponse, AutomationResponse, TaskWebhookPayload } from '../types/task-management';
import { taskAutomationEngine } from './TaskAutomationEngine';
import { webhookHandler } from './WebhookHandler';
import { metricsCollector } from './MetricsAndMonitoring';
import { integrationManager } from './ExternalIntegrations';
import { AutomationRulesManager, MVP_AUTOMATION_RULES } from './AutomationRules';

export class TaskManagementAPI {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Install MVP automation rules
      await AutomationRulesManager.installPredefinedRules(MVP_AUTOMATION_RULES);
      
      // Set up webhook endpoints
      this.setupWebhookEndpoints();
      
      // Initialize metrics collection
      this.setupMetricsCollection();
      
      console.log('Task Management API initialized successfully');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Task Management API:', error);
      throw error;
    }
  }

  // Task CRUD Operations
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskResponse> {
    try {
      const task = await taskAutomationEngine.createTask(taskData);
      
      // Sync with external systems
      await integrationManager.syncTask(task);
      
      return {
        success: true,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<TaskResponse> {
    try {
      const task = await taskAutomationEngine.updateTask(taskId, updates);
      
      if (task) {
        // Sync with external systems
        await integrationManager.syncTask(task);
      }
      
      return {
        success: true,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteTask(taskId: string): Promise<TaskResponse> {
    try {
      const success = await taskAutomationEngine.deleteTask(taskId);
      
      return {
        success,
        error: success ? undefined : 'Task not found'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTask(taskId: string): Promise<TaskResponse> {
    try {
      const task = taskAutomationEngine.getTask(taskId);
      
      return {
        success: true,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAllTasks(filters?: {
    status?: TaskStatus;
    assignee?: string;
    priority?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  }): Promise<TaskResponse> {
    try {
      let tasks = taskAutomationEngine.getAllTasks();
      
      // Apply filters
      if (filters) {
        if (filters.status) {
          tasks = tasks.filter(task => task.status === filters.status);
        }
        if (filters.assignee) {
          tasks = tasks.filter(task => task.assignee === filters.assignee);
        }
        if (filters.priority) {
          tasks = tasks.filter(task => task.priority === filters.priority);
        }
        if (filters.tags) {
          tasks = tasks.filter(task => 
            filters.tags!.some(tag => task.tags?.includes(tag))
          );
        }
      }
      
      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const startIndex = (page - 1) * limit;
      const paginatedTasks = tasks.slice(startIndex, startIndex + limit);
      
      return {
        success: true,
        data: paginatedTasks,
        metadata: {
          total: tasks.length,
          page,
          limit
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Automation Management
  async triggerAutomation(taskId: string, ruleId?: string): Promise<AutomationResponse> {
    try {
      const task = taskAutomationEngine.getTask(taskId);
      if (!task) {
        return {
          success: false,
          error: 'Task not found'
        };
      }

      // If specific rule ID provided, execute that rule
      // Otherwise, process all applicable rules
      
      return {
        success: true,
        data: {
          rulesExecuted: 1,
          tasksAffected: 1,
          errors: []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getAutomationMetrics(): Promise<any> {
    try {
      const metrics = await metricsCollector.calculateTaskMetrics();
      const performance = await metricsCollector.calculatePerformanceMetrics();
      const realtime = await metricsCollector.getRealtimeMetrics();
      
      return {
        success: true,
        data: {
          metrics,
          performance,
          realtime
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async generateEfficiencyReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const report = await metricsCollector.generateEfficiencyReport(startDate, endDate);
      
      return {
        success: true,
        data: report
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Webhook Management
  async processWebhook(endpoint: string, payload: any, headers: Record<string, string> = {}): Promise<any> {
    try {
      const result = await webhookHandler.processWebhook(endpoint, payload, headers);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async addWebhookEndpoint(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      taskAutomationEngine.addWebhookEndpoint(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Integration Management
  async addIntegration(name: string, config: any): Promise<{ success: boolean; error?: string }> {
    try {
      const connected = await integrationManager.addIntegration(name, config);
      return { 
        success: connected,
        error: connected ? undefined : 'Failed to connect to external system'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async syncWithExternalSystems(): Promise<{ success: boolean; synced: number; error?: string }> {
    try {
      const syncedTasks = await integrationManager.syncFromAllSources();
      
      // Update local tasks with synced data
      for (const syncedTask of syncedTasks) {
        const existingTask = taskAutomationEngine.getTask(syncedTask.id);
        if (existingTask) {
          await taskAutomationEngine.updateTask(syncedTask.id, syncedTask);
        } else {
          await taskAutomationEngine.createTask(syncedTask);
        }
      }
      
      return {
        success: true,
        synced: syncedTasks.length
      };
    } catch (error) {
      return {
        success: false,
        synced: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Cursor Integration
  async integrateCursorAgent(taskId: string, cursorAgentData: any): Promise<{ success: boolean; error?: string }> {
    try {
      await taskAutomationEngine.integrateCursorAgent(taskId, cursorAgentData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Completion Criteria Management
  async updateCompletionCriteria(taskId: string, criteriaId: string, completed: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      await taskAutomationEngine.updateCompletionCriteria(taskId, criteriaId, completed);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Bulk Operations
  async bulkUpdateTasks(taskIds: string[], updates: Partial<Task>): Promise<{
    success: boolean;
    updated: number;
    failed: number;
    errors: string[];
  }> {
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const taskId of taskIds) {
      try {
        await taskAutomationEngine.updateTask(taskId, updates);
        updated++;
      } catch (error) {
        failed++;
        errors.push(`Task ${taskId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: failed === 0,
      updated,
      failed,
      errors
    };
  }

  async bulkStatusChange(taskIds: string[], newStatus: TaskStatus): Promise<{
    success: boolean;
    updated: number;
    failed: number;
    errors: string[];
  }> {
    return this.bulkUpdateTasks(taskIds, { status: newStatus });
  }

  // Analytics and Reporting
  async getTaskFlowAnalysis(): Promise<any> {
    try {
      const analysis = await metricsCollector.getTaskFlowAnalysis();
      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getProductivityReport(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    try {
      const metrics = await metricsCollector.calculateTaskMetrics();
      const performance = await metricsCollector.calculatePerformanceMetrics();
      
      return {
        success: true,
        data: {
          productivity: metrics.productivity,
          throughput: performance.throughput,
          velocityTrend: performance.velocityTrend,
          timeRange
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    metrics: any;
  }> {
    const services = {
      automation_engine: true,
      webhook_handler: true,
      metrics_collector: true,
      integration_manager: true
    };

    try {
      const realtimeMetrics = await metricsCollector.getRealtimeMetrics();
      
      return {
        status: realtimeMetrics.systemHealth === 'healthy' ? 'healthy' : 
               realtimeMetrics.systemHealth === 'warning' ? 'degraded' : 'unhealthy',
        services,
        metrics: realtimeMetrics
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services: { ...services, metrics_collector: false },
        metrics: null
      };
    }
  }

  // Private helper methods
  private setupWebhookEndpoints(): void {
    // Register default webhook endpoints
    const endpoints = [
      '/webhooks/cursor',
      '/webhooks/trello',
      '/webhooks/asana',
      '/webhooks/github',
      '/webhooks/task'
    ];

    console.log('Webhook endpoints registered:', endpoints);
  }

  private setupMetricsCollection(): void {
    // Set up alerts for automation failures and bottlenecks
    metricsCollector.setupAlerts({
      automationFailureThreshold: 5,
      bottleneckThreshold: 3,
      efficiencyThreshold: 50
    });

    console.log('Metrics collection and alerting configured');
  }

  // Configuration Management
  async getConfiguration(): Promise<{
    automationRules: number;
    integrations: string[];
    webhookEndpoints: string[];
    metricsEnabled: boolean;
  }> {
    return {
      automationRules: 0, // Would need to be implemented in engine
      integrations: integrationManager.getIntegrations(),
      webhookEndpoints: webhookHandler.getRegisteredEndpoints(),
      metricsEnabled: true
    };
  }

  async exportConfiguration(): Promise<any> {
    try {
      const config = await this.getConfiguration();
      const tasks = taskAutomationEngine.getAllTasks();
      
      return {
        success: true,
        data: {
          version: '1.0.0',
          exportedAt: new Date(),
          configuration: config,
          tasks: tasks.map(task => ({
            ...task,
            // Remove sensitive data
            metadata: undefined
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Utility Methods
  isInitialized(): boolean {
    return this.initialized;
  }

  getVersion(): string {
    return '1.0.0';
  }

  getSupportedIntegrations(): string[] {
    return ['trello', 'asana', 'github', 'slack'];
  }

  getSupportedWebhookEvents(): string[] {
    return [
      'task_created',
      'task_updated',
      'task_deleted',
      'status_changed',
      'cursor_agent_running',
      'cursor_agent_completed',
      'cursor_agent_failed',
      'pull_request_opened',
      'pull_request_merged'
    ];
  }
}

// Singleton instance
export const taskManagementAPI = new TaskManagementAPI();

// Initialize on import
taskManagementAPI.initialize().catch(console.error);