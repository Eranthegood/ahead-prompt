import { Task, TaskStatus, AutomationRule, CompletionCriteria } from '../types/task-management';
import { taskAutomationEngine } from './TaskAutomationEngine';

export class AutomationRulesManager {
  // Pre-defined automation rules for common workflows
  static readonly PREDEFINED_RULES = {
    // MVP Core Rules: To Do → In Progress → Done
    AUTO_START_ON_ASSIGNMENT: {
      name: 'Auto Start on Assignment',
      description: 'Automatically move task from To Do to In Progress when assigned to someone',
      trigger: {
        type: 'status_change' as const,
        toStatus: 'todo' as TaskStatus
      },
      action: {
        type: 'change_status' as const,
        targetStatus: 'in_progress' as TaskStatus
      },
      conditions: [
        { field: 'assignee', operator: 'exists' as const, value: true }
      ],
      enabled: true
    },

    AUTO_PROGRESS_ON_CURSOR_START: {
      name: 'Auto Progress on Cursor Start',
      description: 'Move task to In Progress when Cursor agent starts working',
      trigger: {
        type: 'webhook' as const,
        webhookEvent: 'cursor_agent_running'
      },
      action: {
        type: 'change_status' as const,
        targetStatus: 'in_progress' as TaskStatus
      },
      enabled: true
    },

    AUTO_REVIEW_ON_PR_CREATED: {
      name: 'Auto Review on PR Created',
      description: 'Move task to In Review when PR is created',
      trigger: {
        type: 'webhook' as const,
        webhookEvent: 'pull_request_opened'
      },
      action: {
        type: 'change_status' as const,
        targetStatus: 'in_review' as TaskStatus
      },
      enabled: true
    },

    AUTO_DONE_ON_PR_MERGED: {
      name: 'Auto Done on PR Merged',
      description: 'Move task to Done when PR is merged',
      trigger: {
        type: 'webhook' as const,
        webhookEvent: 'pull_request_merged'
      },
      action: {
        type: 'change_status' as const,
        targetStatus: 'done' as TaskStatus
      },
      enabled: true
    },

    AUTO_DONE_ON_ALL_CRITERIA_MET: {
      name: 'Auto Done on All Criteria Met',
      description: 'Move task to Done when all completion criteria are satisfied',
      trigger: {
        type: 'criteria_met' as const
      },
      action: {
        type: 'change_status' as const,
        targetStatus: 'done' as TaskStatus
      },
      enabled: true
    },

    AUTO_START_ON_DEPENDENCIES_COMPLETE: {
      name: 'Auto Start on Dependencies Complete',
      description: 'Move task from To Do to In Progress when all dependencies are completed',
      trigger: {
        type: 'dependency_completed' as const
      },
      action: {
        type: 'change_status' as const,
        targetStatus: 'in_progress' as TaskStatus
      },
      conditions: [
        { field: 'status', operator: 'equals' as const, value: 'todo' }
      ],
      enabled: true
    },

    // Time-based automation rules
    AUTO_ESCALATE_OVERDUE_TASKS: {
      name: 'Auto Escalate Overdue Tasks',
      description: 'Escalate priority of tasks that are overdue',
      trigger: {
        type: 'time_based' as const,
        schedule: '0 9 * * *' // Daily at 9 AM
      },
      action: {
        type: 'send_notification' as const,
        notificationTemplate: 'Task "{{task.title}}" is overdue. Due date was {{task.dueDate}}'
      },
      conditions: [
        { field: 'dueDate', operator: 'less_than' as const, value: new Date() },
        { field: 'status', operator: 'not_equals' as const, value: 'done' }
      ],
      enabled: true
    },

    AUTO_REMINDER_FOR_STUCK_TASKS: {
      name: 'Auto Reminder for Stuck Tasks',
      description: 'Send reminder for tasks stuck in In Progress for too long',
      trigger: {
        type: 'time_based' as const,
        schedule: '0 */4 * * *' // Every 4 hours
      },
      action: {
        type: 'send_notification' as const,
        notificationTemplate: 'Task "{{task.title}}" has been in progress for {{hoursInProgress}} hours'
      },
      conditions: [
        { field: 'status', operator: 'equals' as const, value: 'in_progress' },
        { field: 'updatedAt', operator: 'less_than' as const, value: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      ],
      enabled: false // Disabled by default to avoid spam
    },

    // Smart automation rules
    AUTO_ASSIGN_BASED_ON_SKILLS: {
      name: 'Auto Assign Based on Skills',
      description: 'Automatically assign tasks based on required skills and team member availability',
      trigger: {
        type: 'status_change' as const,
        toStatus: 'todo' as TaskStatus
      },
      action: {
        type: 'assign_user' as const
        // assignee would be determined by the skill matching algorithm
      },
      conditions: [
        { field: 'assignee', operator: 'not_exists' as const, value: null },
        { field: 'tags', operator: 'exists' as const, value: true }
      ],
      enabled: false // Requires skill matching implementation
    },

    AUTO_CREATE_FOLLOWUP_TASKS: {
      name: 'Auto Create Follow-up Tasks',
      description: 'Create follow-up tasks for completed tasks that require post-completion work',
      trigger: {
        type: 'status_change' as const,
        toStatus: 'done' as TaskStatus
      },
      action: {
        type: 'create_task' as const,
        taskTemplate: {
          title: 'Follow-up: {{task.title}}',
          description: 'Post-completion follow-up for task: {{task.title}}',
          status: 'todo' as TaskStatus,
          priority: 'low' as const,
          assignee: '{{task.assignee}}'
        }
      },
      conditions: [
        { field: 'tags', operator: 'contains' as const, value: 'needs-followup' }
      ],
      enabled: false // Optional feature
    }
  };

  // Advanced rule conditions for complex workflows
  static createConditionalRule(
    name: string,
    description: string,
    conditions: {
      if: any[];
      then: any;
      else?: any;
    }
  ): Omit<AutomationRule, 'id' | 'createdAt'> {
    return {
      name,
      description,
      trigger: {
        type: 'status_change'
      },
      action: conditions.then,
      conditions: conditions.if,
      enabled: true
    };
  }

  // Rule templates for common patterns
  static createStatusTransitionRule(
    fromStatus: TaskStatus,
    toStatus: TaskStatus,
    conditions?: any[]
  ): Omit<AutomationRule, 'id' | 'createdAt'> {
    return {
      name: `Auto transition from ${fromStatus} to ${toStatus}`,
      description: `Automatically move tasks from ${fromStatus} to ${toStatus}`,
      trigger: {
        type: 'status_change',
        fromStatus,
        toStatus: fromStatus
      },
      action: {
        type: 'change_status',
        targetStatus: toStatus
      },
      conditions: conditions || [],
      enabled: true
    };
  }

  static createTimeBasedRule(
    schedule: string,
    action: any,
    conditions?: any[]
  ): Omit<AutomationRule, 'id' | 'createdAt'> {
    return {
      name: `Scheduled automation`,
      description: `Time-based automation running on schedule: ${schedule}`,
      trigger: {
        type: 'time_based',
        schedule
      },
      action,
      conditions: conditions || [],
      enabled: true
    };
  }

  // Specialized rules for Cursor integration
  static createCursorIntegrationRules(): Array<Omit<AutomationRule, 'id' | 'createdAt'>> {
    return [
      {
        name: 'Cursor Agent Started',
        description: 'Update task status when Cursor agent starts working',
        trigger: {
          type: 'webhook',
          webhookEvent: 'cursor_agent_running'
        },
        action: {
          type: 'change_status',
          targetStatus: 'in_progress'
        },
        conditions: [
          { field: 'status', operator: 'equals', value: 'todo' }
        ],
        enabled: true
      },
      {
        name: 'Cursor Agent Completed',
        description: 'Update task status when Cursor agent completes work',
        trigger: {
          type: 'webhook',
          webhookEvent: 'cursor_agent_completed'
        },
        action: {
          type: 'change_status',
          targetStatus: 'in_review'
        },
        conditions: [
          { field: 'status', operator: 'equals', value: 'in_progress' }
        ],
        enabled: true
      },
      {
        name: 'Cursor Agent Failed',
        description: 'Handle failed Cursor agents',
        trigger: {
          type: 'webhook',
          webhookEvent: 'cursor_agent_failed'
        },
        action: {
          type: 'change_status',
          targetStatus: 'blocked'
        },
        enabled: true
      }
    ];
  }

  // Smart completion detection rules
  static createSmartCompletionRules(): Array<Omit<AutomationRule, 'id' | 'createdAt'>> {
    return [
      {
        name: 'Smart Completion - All Criteria Met',
        description: 'Automatically mark task as done when all completion criteria are satisfied',
        trigger: {
          type: 'criteria_met'
        },
        action: {
          type: 'change_status',
          targetStatus: 'done'
        },
        enabled: true
      },
      {
        name: 'Smart Completion - PR Merged',
        description: 'Mark development tasks as done when PR is merged',
        trigger: {
          type: 'webhook',
          webhookEvent: 'pull_request_merged'
        },
        action: {
          type: 'change_status',
          targetStatus: 'done'
        },
        conditions: [
          { field: 'tags', operator: 'contains', value: 'development' }
        ],
        enabled: true
      },
      {
        name: 'Smart Completion - Deadline Based',
        description: 'Auto-complete tasks at deadline if criteria are met',
        trigger: {
          type: 'time_based',
          schedule: '0 0 * * *' // Daily at midnight
        },
        action: {
          type: 'change_status',
          targetStatus: 'done'
        },
        conditions: [
          { field: 'dueDate', operator: 'equals', value: new Date() },
          { field: 'completionCriteria', operator: 'exists', value: true }
        ],
        enabled: false // Requires careful consideration
      }
    ];
  }

  // Workflow templates for different project types
  static createWorkflowTemplate(workflowType: 'development' | 'design' | 'research' | 'marketing'): Array<Omit<AutomationRule, 'id' | 'createdAt'>> {
    const baseRules = [
      this.PREDEFINED_RULES.AUTO_START_ON_ASSIGNMENT,
      this.PREDEFINED_RULES.AUTO_DONE_ON_ALL_CRITERIA_MET,
      this.PREDEFINED_RULES.AUTO_START_ON_DEPENDENCIES_COMPLETE
    ];

    switch (workflowType) {
      case 'development':
        return [
          ...baseRules,
          this.PREDEFINED_RULES.AUTO_PROGRESS_ON_CURSOR_START,
          this.PREDEFINED_RULES.AUTO_REVIEW_ON_PR_CREATED,
          this.PREDEFINED_RULES.AUTO_DONE_ON_PR_MERGED,
          ...this.createCursorIntegrationRules()
        ];

      case 'design':
        return [
          ...baseRules,
          {
            name: 'Design Review Required',
            description: 'Move design tasks to review when marked as complete',
            trigger: {
              type: 'status_change',
              toStatus: 'in_progress'
            },
            action: {
              type: 'change_status',
              targetStatus: 'in_review'
            },
            conditions: [
              { field: 'tags', operator: 'contains', value: 'design' },
              { field: 'completionCriteria', operator: 'exists', value: true }
            ],
            enabled: true
          }
        ];

      case 'research':
        return [
          ...baseRules,
          {
            name: 'Research Documentation Required',
            description: 'Create documentation task when research is completed',
            trigger: {
              type: 'status_change',
              toStatus: 'done'
            },
            action: {
              type: 'create_task',
              taskTemplate: {
                title: 'Document findings: {{task.title}}',
                description: 'Document research findings from: {{task.title}}',
                status: 'todo',
                priority: 'medium',
                tags: ['documentation', 'research-followup']
              }
            },
            conditions: [
              { field: 'tags', operator: 'contains', value: 'research' }
            ],
            enabled: true
          }
        ];

      case 'marketing':
        return [
          ...baseRules,
          {
            name: 'Marketing Approval Required',
            description: 'Marketing tasks require approval before completion',
            trigger: {
              type: 'status_change',
              toStatus: 'in_progress'
            },
            action: {
              type: 'change_status',
              targetStatus: 'in_review'
            },
            conditions: [
              { field: 'tags', operator: 'contains', value: 'marketing' },
              { field: 'priority', operator: 'equals', value: 'high' }
            ],
            enabled: true
          }
        ];

      default:
        return baseRules;
    }
  }

  // Rule validation and testing
  static validateRule(rule: Omit<AutomationRule, 'id' | 'createdAt'>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!rule.trigger || !rule.trigger.type) {
      errors.push('Rule trigger is required');
    }

    if (!rule.action || !rule.action.type) {
      errors.push('Rule action is required');
    }

    // Validate trigger-specific requirements
    if (rule.trigger.type === 'time_based' && !rule.trigger.schedule) {
      errors.push('Time-based triggers require a schedule');
    }

    if (rule.trigger.type === 'status_change' && !rule.trigger.toStatus && !rule.trigger.fromStatus) {
      errors.push('Status change triggers require at least fromStatus or toStatus');
    }

    // Validate action-specific requirements
    if (rule.action.type === 'change_status' && !rule.action.targetStatus) {
      errors.push('Change status actions require a target status');
    }

    if (rule.action.type === 'assign_user' && !rule.action.assignee) {
      errors.push('Assign user actions require an assignee');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Test rule against sample data
  static async testRule(
    rule: Omit<AutomationRule, 'id' | 'createdAt'>,
    sampleTask: Task
  ): Promise<{ wouldExecute: boolean; reason: string }> {
    // Simulate rule execution
    try {
      // Check if trigger would fire
      const triggerWouldFire = this.simulateTrigger(rule.trigger, sampleTask);
      if (!triggerWouldFire) {
        return { wouldExecute: false, reason: 'Trigger conditions not met' };
      }

      // Check if conditions would pass
      if (rule.conditions && rule.conditions.length > 0) {
        const conditionsPass = this.simulateConditions(rule.conditions, sampleTask);
        if (!conditionsPass) {
          return { wouldExecute: false, reason: 'Rule conditions not satisfied' };
        }
      }

      return { wouldExecute: true, reason: 'All conditions met' };
    } catch (error) {
      return { wouldExecute: false, reason: `Error: ${error}` };
    }
  }

  private static simulateTrigger(trigger: any, task: Task): boolean {
    switch (trigger.type) {
      case 'status_change':
        return true; // Assume status change for testing
      case 'criteria_met':
        return task.completionCriteria?.every(c => c.completed) || false;
      case 'dependency_completed':
        return true; // Assume dependency completed for testing
      case 'time_based':
        return true; // Assume time condition met for testing
      case 'webhook':
        return true; // Assume webhook received for testing
      default:
        return false;
    }
  }

  private static simulateConditions(conditions: any[], task: Task): boolean {
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
        case 'not_exists':
          return fieldValue === undefined || fieldValue === null;
        default:
          return false;
      }
    });
  }

  private static getFieldValue(task: Task, field: string): any {
    const fields = field.split('.');
    let value: any = task;
    
    for (const f of fields) {
      value = value?.[f];
    }
    
    return value;
  }

  // Bulk rule management
  static async installPredefinedRules(ruleNames: string[]): Promise<AutomationRule[]> {
    const installedRules: AutomationRule[] = [];

    for (const ruleName of ruleNames) {
      const ruleTemplate = (this.PREDEFINED_RULES as any)[ruleName];
      if (ruleTemplate) {
        try {
          const rule = await taskAutomationEngine.addAutomationRule(ruleTemplate);
          installedRules.push(rule);
        } catch (error) {
          console.error(`Failed to install rule ${ruleName}:`, error);
        }
      }
    }

    return installedRules;
  }

  static async installWorkflowTemplate(workflowType: 'development' | 'design' | 'research' | 'marketing'): Promise<AutomationRule[]> {
    const rules = this.createWorkflowTemplate(workflowType);
    const installedRules: AutomationRule[] = [];

    for (const ruleTemplate of rules) {
      try {
        const rule = await taskAutomationEngine.addAutomationRule(ruleTemplate);
        installedRules.push(rule);
      } catch (error) {
        console.error(`Failed to install workflow rule:`, error);
      }
    }

    return installedRules;
  }
}

// Export commonly used rule sets
export const MVP_AUTOMATION_RULES = [
  'AUTO_START_ON_ASSIGNMENT',
  'AUTO_PROGRESS_ON_CURSOR_START',
  'AUTO_REVIEW_ON_PR_CREATED',
  'AUTO_DONE_ON_PR_MERGED',
  'AUTO_DONE_ON_ALL_CRITERIA_MET',
  'AUTO_START_ON_DEPENDENCIES_COMPLETE'
];

export const DEVELOPMENT_WORKFLOW_RULES = [
  ...MVP_AUTOMATION_RULES,
  'AUTO_ESCALATE_OVERDUE_TASKS'
];

export { AutomationRulesManager };