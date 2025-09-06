import { Task, TaskStatus, TaskMetrics, AutomationRule, ProductivityMetrics, BurndownPoint, TaskBottleneck } from '../types/task-management';
import { taskAutomationEngine } from './TaskAutomationEngine';

export interface AutomationEvent {
  id: string;
  timestamp: Date;
  type: 'rule_executed' | 'status_changed' | 'task_created' | 'task_completed' | 'automation_failed';
  taskId: string;
  ruleId?: string;
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  automated: boolean;
  executionTime?: number; // in milliseconds
  error?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  averageTaskCompletionTime: number; // in hours
  automationSuccessRate: number; // percentage
  manualInterventionRate: number; // percentage
  bottleneckDetection: TaskBottleneck[];
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  throughput: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface AutomationEfficiencyReport {
  timeRange: {
    start: Date;
    end: Date;
  };
  totalTasks: number;
  automatedTransitions: number;
  manualTransitions: number;
  automationEfficiency: number; // percentage
  timeSaved: number; // estimated hours saved through automation
  rulePerformance: RulePerformanceMetric[];
  recommendations: string[];
}

export interface RulePerformanceMetric {
  ruleId: string;
  ruleName: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  tasksAffected: number;
  timeSaved: number;
  lastExecuted: Date;
}

export class MetricsCollector {
  private events: AutomationEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events
  private metricsCache: Map<string, any> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Start periodic metrics calculation
    setInterval(() => this.updateMetricsCache(), 60000); // Every minute
  }

  private setupEventListeners(): void {
    taskAutomationEngine.addEventListener('task_created', (data) => {
      this.recordEvent({
        type: 'task_created',
        taskId: data.task.id,
        automated: data.automated || false
      });
    });

    taskAutomationEngine.addEventListener('task_updated', (data) => {
      if (data.previousTask.status !== data.task.status) {
        this.recordEvent({
          type: 'status_changed',
          taskId: data.task.id,
          fromStatus: data.previousTask.status,
          toStatus: data.task.status,
          automated: data.automated || false
        });
      }
    });

    taskAutomationEngine.addEventListener('rule_executed', (data) => {
      this.recordEvent({
        type: 'rule_executed',
        taskId: data.taskId,
        ruleId: data.ruleId,
        automated: true,
        executionTime: data.executionTime
      });
    });

    taskAutomationEngine.addEventListener('automation_failed', (data) => {
      this.recordEvent({
        type: 'automation_failed',
        taskId: data.taskId,
        ruleId: data.ruleId,
        automated: false,
        error: data.error
      });
    });
  }

  recordEvent(event: Omit<AutomationEvent, 'id' | 'timestamp'>): void {
    const fullEvent: AutomationEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event
    };

    this.events.push(fullEvent);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Invalidate related cache entries
    this.invalidateCache(['metrics', 'performance', 'efficiency']);
  }

  async calculateTaskMetrics(): Promise<TaskMetrics> {
    const cacheKey = 'task_metrics';
    const cached = this.getCachedMetrics(cacheKey);
    if (cached) return cached;

    const allTasks = taskAutomationEngine.getAllTasks();
    const tasksByStatus = this.groupTasksByStatus(allTasks);
    const completedTasks = allTasks.filter(task => task.status === 'done');

    const metrics: TaskMetrics = {
      totalTasks: allTasks.length,
      tasksByStatus,
      averageCompletionTime: this.calculateAverageCompletionTime(completedTasks),
      automationEfficiency: await this.calculateAutomationEfficiency(),
      manualInterventions: await this.countManualInterventions(),
      bottlenecks: await this.identifyBottlenecks(),
      productivity: await this.calculateProductivityMetrics()
    };

    this.setCachedMetrics(cacheKey, metrics);
    return metrics;
  }

  async calculatePerformanceMetrics(): Promise<PerformanceMetrics> {
    const cacheKey = 'performance_metrics';
    const cached = this.getCachedMetrics(cacheKey);
    if (cached) return cached;

    const allTasks = taskAutomationEngine.getAllTasks();
    const completedTasks = allTasks.filter(task => task.status === 'done');

    const metrics: PerformanceMetrics = {
      averageTaskCompletionTime: this.calculateAverageCompletionTime(completedTasks),
      automationSuccessRate: await this.calculateAutomationSuccessRate(),
      manualInterventionRate: await this.calculateManualInterventionRate(),
      bottleneckDetection: await this.identifyBottlenecks(),
      velocityTrend: this.calculateVelocityTrend(),
      throughput: await this.calculateThroughput()
    };

    this.setCachedMetrics(cacheKey, metrics);
    return metrics;
  }

  async generateEfficiencyReport(startDate: Date, endDate: Date): Promise<AutomationEfficiencyReport> {
    const relevantEvents = this.getEventsInTimeRange(startDate, endDate);
    const tasksInRange = this.getTasksInTimeRange(startDate, endDate);

    const automatedTransitions = relevantEvents.filter(e => 
      e.type === 'status_changed' && e.automated
    ).length;

    const manualTransitions = relevantEvents.filter(e => 
      e.type === 'status_changed' && !e.automated
    ).length;

    const totalTransitions = automatedTransitions + manualTransitions;
    const automationEfficiency = totalTransitions > 0 ? (automatedTransitions / totalTransitions) * 100 : 0;

    const rulePerformance = await this.calculateRulePerformance(startDate, endDate);
    const timeSaved = this.estimateTimeSaved(automatedTransitions);

    return {
      timeRange: { start: startDate, end: endDate },
      totalTasks: tasksInRange.length,
      automatedTransitions,
      manualTransitions,
      automationEfficiency,
      timeSaved,
      rulePerformance,
      recommendations: this.generateRecommendations(rulePerformance, automationEfficiency)
    };
  }

  async calculateRulePerformance(startDate: Date, endDate: Date): Promise<RulePerformanceMetric[]> {
    const ruleEvents = this.getEventsInTimeRange(startDate, endDate)
      .filter(e => e.type === 'rule_executed');

    const ruleStats = new Map<string, {
      executions: AutomationEvent[];
      successes: number;
      failures: number;
    }>();

    // Group events by rule
    for (const event of ruleEvents) {
      if (!event.ruleId) continue;
      
      if (!ruleStats.has(event.ruleId)) {
        ruleStats.set(event.ruleId, { executions: [], successes: 0, failures: 0 });
      }
      
      const stats = ruleStats.get(event.ruleId)!;
      stats.executions.push(event);
      
      if (event.error) {
        stats.failures++;
      } else {
        stats.successes++;
      }
    }

    const performance: RulePerformanceMetric[] = [];

    for (const [ruleId, stats] of ruleStats) {
      const rule = this.getRuleById(ruleId);
      const totalExecutions = stats.executions.length;
      const successRate = totalExecutions > 0 ? (stats.successes / totalExecutions) * 100 : 0;
      const avgExecutionTime = this.calculateAverageExecutionTime(stats.executions);
      const timeSaved = this.estimateTimeSavedByRule(stats.executions);

      performance.push({
        ruleId,
        ruleName: rule?.name || 'Unknown Rule',
        executionCount: totalExecutions,
        successRate,
        averageExecutionTime: avgExecutionTime,
        tasksAffected: new Set(stats.executions.map(e => e.taskId)).size,
        timeSaved,
        lastExecuted: Math.max(...stats.executions.map(e => e.timestamp.getTime())) 
          ? new Date(Math.max(...stats.executions.map(e => e.timestamp.getTime())))
          : new Date()
      });
    }

    return performance.sort((a, b) => b.executionCount - a.executionCount);
  }

  // Real-time monitoring methods
  async getRealtimeMetrics(): Promise<{
    activeAutomations: number;
    recentFailures: AutomationEvent[];
    currentBottlenecks: TaskBottleneck[];
    systemHealth: 'healthy' | 'warning' | 'critical';
  }> {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const recentEvents = this.getEventsInTimeRange(lastHour, now);
    const activeAutomations = recentEvents.filter(e => 
      e.type === 'rule_executed' && !e.error
    ).length;

    const recentFailures = recentEvents.filter(e => 
      e.type === 'automation_failed' || e.error
    );

    const bottlenecks = await this.identifyBottlenecks();
    const systemHealth = this.assessSystemHealth(recentFailures, bottlenecks);

    return {
      activeAutomations,
      recentFailures,
      currentBottlenecks: bottlenecks,
      systemHealth
    };
  }

  async getTaskFlowAnalysis(): Promise<{
    statusTransitions: Record<string, Record<string, number>>;
    averageTimeInStatus: Record<TaskStatus, number>;
    conversionRates: Record<string, number>;
  }> {
    const statusChangeEvents = this.events.filter(e => 
      e.type === 'status_changed' && e.fromStatus && e.toStatus
    );

    // Build transition matrix
    const transitions: Record<string, Record<string, number>> = {};
    const timeInStatus: Record<string, number[]> = {};

    for (const event of statusChangeEvents) {
      const from = event.fromStatus!;
      const to = event.toStatus!;
      
      if (!transitions[from]) transitions[from] = {};
      if (!transitions[from][to]) transitions[from][to] = 0;
      transitions[from][to]++;

      // Calculate time in previous status
      const task = taskAutomationEngine.getTask(event.taskId);
      if (task) {
        const timeInPrevStatus = this.calculateTimeInStatus(event.taskId, from, event.timestamp);
        if (!timeInStatus[from]) timeInStatus[from] = [];
        timeInStatus[from].push(timeInPrevStatus);
      }
    }

    // Calculate averages
    const averageTimeInStatus: Record<TaskStatus, number> = {} as any;
    for (const [status, times] of Object.entries(timeInStatus)) {
      averageTimeInStatus[status as TaskStatus] = times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    // Calculate conversion rates (todo -> done, etc.)
    const conversionRates: Record<string, number> = {};
    const todoTasks = taskAutomationEngine.getTasksByStatus('todo').length;
    const doneTasks = taskAutomationEngine.getTasksByStatus('done').length;
    
    if (todoTasks > 0) {
      conversionRates['todo_to_done'] = (doneTasks / (todoTasks + doneTasks)) * 100;
    }

    return {
      statusTransitions: transitions,
      averageTimeInStatus,
      conversionRates
    };
  }

  // Alerting system
  setupAlerts(config: {
    automationFailureThreshold: number;
    bottleneckThreshold: number;
    efficiencyThreshold: number;
  }): void {
    setInterval(async () => {
      const metrics = await this.getRealtimeMetrics();
      
      // Check for automation failures
      if (metrics.recentFailures.length > config.automationFailureThreshold) {
        this.sendAlert('automation_failures', {
          count: metrics.recentFailures.length,
          failures: metrics.recentFailures
        });
      }

      // Check for bottlenecks
      const severeBottlenecks = metrics.currentBottlenecks.filter(b => 
        b.tasksStuck > config.bottleneckThreshold
      );
      
      if (severeBottlenecks.length > 0) {
        this.sendAlert('bottlenecks_detected', {
          bottlenecks: severeBottlenecks
        });
      }

      // Check automation efficiency
      const efficiency = await this.calculateAutomationEfficiency();
      if (efficiency < config.efficiencyThreshold) {
        this.sendAlert('low_efficiency', {
          currentEfficiency: efficiency,
          threshold: config.efficiencyThreshold
        });
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // Private helper methods
  private groupTasksByStatus(tasks: Task[]): Record<TaskStatus, number> {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);
  }

  private calculateAverageCompletionTime(completedTasks: Task[]): number {
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, task) => {
      const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
      return sum + completionTime;
    }, 0);
    
    return totalTime / completedTasks.length / (1000 * 60 * 60); // Convert to hours
  }

  private async calculateAutomationEfficiency(): Promise<number> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const relevantEvents = this.getEventsInTimeRange(last30Days, now);
    const statusChanges = relevantEvents.filter(e => e.type === 'status_changed');
    
    const automated = statusChanges.filter(e => e.automated).length;
    const total = statusChanges.length;
    
    return total > 0 ? (automated / total) * 100 : 0;
  }

  private async countManualInterventions(): Promise<number> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    return this.getEventsInTimeRange(last30Days, now)
      .filter(e => e.type === 'status_changed' && !e.automated).length;
  }

  private async identifyBottlenecks(): Promise<TaskBottleneck[]> {
    const allTasks = taskAutomationEngine.getAllTasks();
    const statusGroups = this.groupTasksByStatus(allTasks);
    const bottlenecks: TaskBottleneck[] = [];

    for (const [status, count] of Object.entries(statusGroups)) {
      const tasksInStatus = allTasks.filter(t => t.status === status as TaskStatus);
      const avgTimeInStatus = this.calculateAverageTimeInCurrentStatus(tasksInStatus);
      
      // Consider it a bottleneck if there are many tasks and they've been there a long time
      if (count > 5 && avgTimeInStatus > 48) { // More than 5 tasks stuck for more than 48 hours
        bottlenecks.push({
          status: status as TaskStatus,
          averageTimeInStatus: avgTimeInStatus,
          tasksStuck: count,
          suggestedActions: this.generateBottleneckSuggestions(status as TaskStatus, avgTimeInStatus)
        });
      }
    }

    return bottlenecks;
  }

  private calculateAverageTimeInCurrentStatus(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const now = new Date();
    const totalTime = tasks.reduce((sum, task) => {
      const timeInStatus = now.getTime() - task.updatedAt.getTime();
      return sum + timeInStatus;
    }, 0);
    
    return totalTime / tasks.length / (1000 * 60 * 60); // Convert to hours
  }

  private generateBottleneckSuggestions(status: TaskStatus, avgTime: number): string[] {
    const suggestions: string[] = [];
    
    switch (status) {
      case 'todo':
        suggestions.push('Consider auto-assigning tasks based on team capacity');
        suggestions.push('Review task prioritization and dependencies');
        break;
      case 'in_progress':
        suggestions.push('Check if tasks need to be broken down into smaller pieces');
        suggestions.push('Review if assignees have blockers or need help');
        break;
      case 'in_review':
        suggestions.push('Set up automated review reminders');
        suggestions.push('Consider implementing review time limits');
        break;
      case 'blocked':
        suggestions.push('Set up automated escalation for blocked tasks');
        suggestions.push('Review and resolve common blocking issues');
        break;
    }
    
    if (avgTime > 72) { // More than 3 days
      suggestions.push('Consider implementing time-based escalation rules');
    }
    
    return suggestions;
  }

  private async calculateProductivityMetrics(): Promise<ProductivityMetrics> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const completedToday = this.getTasksCompletedInRange(today, now).length;
    const completedThisWeek = this.getTasksCompletedInRange(thisWeek, now).length;
    
    return {
      tasksCompletedToday: completedToday,
      tasksCompletedThisWeek: completedThisWeek,
      averageTasksPerDay: completedThisWeek / 7,
      velocityTrend: this.calculateVelocityTrend(),
      burndownData: this.generateBurndownData()
    };
  }

  private calculateVelocityTrend(): 'increasing' | 'stable' | 'decreasing' {
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeekCompleted = this.getTasksCompletedInRange(thisWeek, now).length;
    const lastWeekCompleted = this.getTasksCompletedInRange(lastWeek, thisWeek).length;
    
    if (thisWeekCompleted > lastWeekCompleted * 1.1) return 'increasing';
    if (thisWeekCompleted < lastWeekCompleted * 0.9) return 'decreasing';
    return 'stable';
  }

  private generateBurndownData(): BurndownPoint[] {
    const points: BurndownPoint[] = [];
    const now = new Date();
    
    // Generate last 30 days of data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const completedByDate = this.getTasksCompletedByDate(date).length;
      const remainingTasks = taskAutomationEngine.getAllTasks()
        .filter(t => t.status !== 'done' && t.createdAt <= date).length;
      
      points.push({
        date,
        remainingTasks,
        completedTasks: completedByDate
      });
    }
    
    return points;
  }

  // Event and cache management
  private getEventsInTimeRange(start: Date, end: Date): AutomationEvent[] {
    return this.events.filter(e => 
      e.timestamp >= start && e.timestamp <= end
    );
  }

  private getTasksInTimeRange(start: Date, end: Date): Task[] {
    return taskAutomationEngine.getAllTasks().filter(t => 
      t.createdAt >= start && t.createdAt <= end
    );
  }

  private getTasksCompletedInRange(start: Date, end: Date): Task[] {
    return taskAutomationEngine.getAllTasks().filter(t => 
      t.status === 'done' && t.updatedAt >= start && t.updatedAt <= end
    );
  }

  private getTasksCompletedByDate(date: Date): Task[] {
    return taskAutomationEngine.getAllTasks().filter(t => 
      t.status === 'done' && t.updatedAt <= date
    );
  }

  private getCachedMetrics(key: string): any {
    const cached = this.metricsCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCachedMetrics(key: string, data: any): void {
    this.metricsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private invalidateCache(keys: string[]): void {
    keys.forEach(key => this.metricsCache.delete(key));
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRuleById(ruleId: string): AutomationRule | null {
    // This would need to be implemented in the TaskAutomationEngine
    return null;
  }

  private calculateAverageExecutionTime(events: AutomationEvent[]): number {
    const withExecutionTime = events.filter(e => e.executionTime);
    if (withExecutionTime.length === 0) return 0;
    
    return withExecutionTime.reduce((sum, e) => sum + (e.executionTime || 0), 0) / withExecutionTime.length;
  }

  private estimateTimeSaved(automatedTransitions: number): number {
    // Estimate that each automated transition saves 2 minutes of manual work
    return (automatedTransitions * 2) / 60; // Convert to hours
  }

  private estimateTimeSavedByRule(events: AutomationEvent[]): number {
    return this.estimateTimeSaved(events.length);
  }

  private calculateTimeInStatus(taskId: string, status: TaskStatus, endTime: Date): number {
    // Find the event when the task entered this status
    const enterEvent = this.events
      .filter(e => e.taskId === taskId && e.toStatus === status)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    if (!enterEvent) return 0;
    
    return (endTime.getTime() - enterEvent.timestamp.getTime()) / (1000 * 60 * 60); // Hours
  }

  private async calculateAutomationSuccessRate(): Promise<number> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const automationEvents = this.getEventsInTimeRange(last30Days, new Date())
      .filter(e => e.type === 'rule_executed');
    
    const successful = automationEvents.filter(e => !e.error).length;
    const total = automationEvents.length;
    
    return total > 0 ? (successful / total) * 100 : 0;
  }

  private async calculateManualInterventionRate(): Promise<number> {
    const efficiency = await this.calculateAutomationEfficiency();
    return 100 - efficiency;
  }

  private async calculateThroughput(): Promise<{ daily: number; weekly: number; monthly: number }> {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    
    const daily = this.getTasksCompletedInRange(
      new Date(now.getTime() - day), now
    ).length;
    
    const weekly = this.getTasksCompletedInRange(
      new Date(now.getTime() - 7 * day), now
    ).length;
    
    const monthly = this.getTasksCompletedInRange(
      new Date(now.getTime() - 30 * day), now
    ).length;
    
    return { daily, weekly, monthly };
  }

  private generateRecommendations(rulePerformance: RulePerformanceMetric[], efficiency: number): string[] {
    const recommendations: string[] = [];
    
    if (efficiency < 50) {
      recommendations.push('Consider adding more automation rules to improve efficiency');
    }
    
    const lowPerformingRules = rulePerformance.filter(r => r.successRate < 80);
    if (lowPerformingRules.length > 0) {
      recommendations.push(`Review and optimize ${lowPerformingRules.length} underperforming automation rules`);
    }
    
    const unusedRules = rulePerformance.filter(r => r.executionCount === 0);
    if (unusedRules.length > 0) {
      recommendations.push(`Consider removing or modifying ${unusedRules.length} unused automation rules`);
    }
    
    return recommendations;
  }

  private assessSystemHealth(failures: AutomationEvent[], bottlenecks: TaskBottleneck[]): 'healthy' | 'warning' | 'critical' {
    if (failures.length > 10 || bottlenecks.length > 3) {
      return 'critical';
    }
    
    if (failures.length > 5 || bottlenecks.length > 1) {
      return 'warning';
    }
    
    return 'healthy';
  }

  private sendAlert(type: string, data: any): void {
    console.warn(`ALERT [${type}]:`, data);
    // In a real implementation, this would send notifications via email, Slack, etc.
  }

  private updateMetricsCache(): void {
    // Periodically update cached metrics
    this.calculateTaskMetrics().catch(console.error);
    this.calculatePerformanceMetrics().catch(console.error);
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();