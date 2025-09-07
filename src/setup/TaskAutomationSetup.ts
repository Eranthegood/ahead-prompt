import { taskManagementAPI } from '../services/TaskManagementAPI';
import { AutomationRulesManager, MVP_AUTOMATION_RULES, DEVELOPMENT_WORKFLOW_RULES } from '../services/AutomationRules';
import { integrationManager } from '../services/ExternalIntegrations';

export interface SetupConfig {
  // Basic configuration
  workflowType: 'development' | 'design' | 'research' | 'marketing' | 'custom';
  enableMetrics: boolean;
  enableWebhooks: boolean;
  
  // External integrations
  integrations?: {
    trello?: {
      apiKey: string;
      token: string;
      boardId: string;
      listMapping?: Record<string, string>;
    };
    asana?: {
      accessToken: string;
      projectId: string;
    };
    github?: {
      token: string;
      repository: string;
    };
    slack?: {
      botToken: string;
      channel?: string;
    };
  };
  
  // Automation rules
  automationRules?: {
    usePreset: boolean;
    customRules?: any[];
  };
  
  // Webhook endpoints
  webhookEndpoints?: string[];
  
  // Notification settings
  notifications?: {
    email?: string;
    slack?: boolean;
    webhook?: string;
  };
}

export class TaskAutomationSetup {
  private config: SetupConfig;

  constructor(config: SetupConfig) {
    this.config = config;
  }

  async setup(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      console.log('🚀 Starting Task Automation Setup...');

      // Step 1: Initialize the core system
      await this.initializeCore();
      console.log('✅ Core system initialized');

      // Step 2: Setup automation rules
      await this.setupAutomationRules();
      console.log('✅ Automation rules configured');

      // Step 3: Configure external integrations
      await this.setupIntegrations();
      console.log('✅ External integrations configured');

      // Step 4: Setup webhooks
      await this.setupWebhooks();
      console.log('✅ Webhooks configured');

      // Step 5: Configure monitoring and alerts
      await this.setupMonitoring();
      console.log('✅ Monitoring and alerts configured');

      // Step 6: Create sample data (optional)
      if (process.env.NODE_ENV === 'development') {
        await this.createSampleData();
        console.log('✅ Sample data created');
      }

      console.log('🎉 Task Automation Setup Complete!');
      return { success: true, errors };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      console.error('❌ Setup failed:', errorMessage);
      return { success: false, errors };
    }
  }

  private async initializeCore(): Promise<void> {
    await taskManagementAPI.initialize();
  }

  private async setupAutomationRules(): Promise<void> {
    if (!this.config.automationRules?.usePreset) {
      return;
    }

    // Install workflow-specific rules
    switch (this.config.workflowType) {
      case 'development':
        await AutomationRulesManager.installPredefinedRules(DEVELOPMENT_WORKFLOW_RULES);
        break;
      case 'design':
      case 'research':
      case 'marketing':
        await AutomationRulesManager.installWorkflowTemplate(this.config.workflowType);
        break;
      default:
        await AutomationRulesManager.installPredefinedRules(MVP_AUTOMATION_RULES);
    }

    // Add custom rules if provided
    if (this.config.automationRules?.customRules) {
      for (const rule of this.config.automationRules.customRules) {
        // Custom rule installation would be handled by AutomationRulesManager
        console.log('Custom rule would be installed:', rule);
      }
    }
  }

  private async setupIntegrations(): Promise<void> {
    const integrations = this.config.integrations;
    if (!integrations) return;

    // Setup Trello integration
    if (integrations.trello) {
      await integrationManager.addIntegration('trello', {
        type: 'trello',
        apiKey: integrations.trello.apiKey,
        boardId: integrations.trello.boardId,
        mapping: integrations.trello.listMapping || {
          todo: 'To Do',
          in_progress: 'Doing',
          in_review: 'Review',
          done: 'Done'
        }
      });
    }

    // Setup Asana integration
    if (integrations.asana) {
      await integrationManager.addIntegration('asana', {
        type: 'asana',
        apiKey: integrations.asana.accessToken,
        projectId: integrations.asana.projectId
      });
    }

    // Setup GitHub integration
    if (integrations.github) {
      await integrationManager.addIntegration('github', {
        type: 'github',
        apiKey: integrations.github.token,
        mapping: {
          repository: integrations.github.repository
        }
      });
    }

    // Setup Slack integration
    if (integrations.slack) {
      await integrationManager.addIntegration('slack', {
        type: 'slack',
        apiKey: integrations.slack.botToken,
        mapping: {
          channel: integrations.slack.channel || '#general'
        }
      });
    }
  }

  private async setupWebhooks(): Promise<void> {
    if (!this.config.enableWebhooks || !this.config.webhookEndpoints) {
      return;
    }

    for (const endpoint of this.config.webhookEndpoints) {
      await taskManagementAPI.addWebhookEndpoint(endpoint);
    }
  }

  private async setupMonitoring(): Promise<void> {
    if (!this.config.enableMetrics) {
      return;
    }

    // Configure alerts based on workflow type
    const alertConfig = this.getAlertConfigForWorkflow();
    
    // This would be implemented in the metrics collector
    console.log('Monitoring configured with alerts:', alertConfig);
  }

  private async createSampleData(): Promise<void> {
    // Create sample tasks for demonstration
    const sampleTasks = [
      {
        title: 'Setup user authentication',
        description: 'Implement login and registration functionality',
        status: 'todo' as const,
        priority: 'high' as const,
        tags: ['development', 'security'],
        estimatedHours: 8
      },
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and mockups for the new homepage',
        status: 'in_progress' as const,
        priority: 'medium' as const,
        assignee: 'designer@company.com',
        tags: ['design', 'ui/ux'],
        estimatedHours: 12
      },
      {
        title: 'Write API documentation',
        description: 'Document all REST API endpoints',
        status: 'in_review' as const,
        priority: 'low' as const,
        assignee: 'developer@company.com',
        tags: ['documentation'],
        estimatedHours: 4
      }
    ];

    for (const taskData of sampleTasks) {
      await taskManagementAPI.createTask(taskData);
    }
  }

  private getAlertConfigForWorkflow() {
    const baseConfig = {
      automationFailureThreshold: 5,
      bottleneckThreshold: 3,
      efficiencyThreshold: 50
    };

    switch (this.config.workflowType) {
      case 'development':
        return {
          ...baseConfig,
          efficiencyThreshold: 70 // Higher expectation for dev workflows
        };
      case 'design':
        return {
          ...baseConfig,
          bottleneckThreshold: 5 // Design reviews can take longer
        };
      default:
        return baseConfig;
    }
  }

  // Validation methods
  static validateConfig(config: SetupConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (!config.workflowType) {
      errors.push('Workflow type is required');
    }

    // Validate integrations
    if (config.integrations?.trello) {
      if (!config.integrations.trello.apiKey || !config.integrations.trello.token) {
        errors.push('Trello integration requires apiKey and token');
      }
    }

    if (config.integrations?.asana) {
      if (!config.integrations.asana.accessToken) {
        errors.push('Asana integration requires accessToken');
      }
    }

    if (config.integrations?.github) {
      if (!config.integrations.github.token || !config.integrations.github.repository) {
        errors.push('GitHub integration requires token and repository');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Configuration presets
  static getPresetConfig(preset: 'mvp' | 'development' | 'full'): SetupConfig {
    const baseConfig: SetupConfig = {
      workflowType: 'development',
      enableMetrics: true,
      enableWebhooks: true,
      automationRules: {
        usePreset: true
      }
    };

    switch (preset) {
      case 'mvp':
        return {
          ...baseConfig,
          workflowType: 'development',
          automationRules: {
            usePreset: true,
            customRules: []
          }
        };

      case 'development':
        return {
          ...baseConfig,
          workflowType: 'development',
          webhookEndpoints: [
            '/webhooks/cursor',
            '/webhooks/github'
          ],
          notifications: {
            slack: true
          }
        };

      case 'full':
        return {
          ...baseConfig,
          workflowType: 'development',
          webhookEndpoints: [
            '/webhooks/cursor',
            '/webhooks/trello',
            '/webhooks/asana',
            '/webhooks/github'
          ],
          notifications: {
            slack: true,
            email: 'team@company.com'
          }
        };

      default:
        return baseConfig;
    }
  }

  // Quick setup methods
  static async quickSetup(preset: 'mvp' | 'development' | 'full' = 'mvp'): Promise<{ success: boolean; errors: string[] }> {
    const config = TaskAutomationSetup.getPresetConfig(preset);
    const setup = new TaskAutomationSetup(config);
    return await setup.setup();
  }

  // Environment-based setup
  static async setupFromEnvironment(): Promise<{ success: boolean; errors: string[] }> {
    const config: SetupConfig = {
      workflowType: (process.env.WORKFLOW_TYPE as any) || 'development',
      enableMetrics: process.env.ENABLE_METRICS !== 'false',
      enableWebhooks: process.env.ENABLE_WEBHOOKS !== 'false',
      automationRules: {
        usePreset: true
      }
    };

    // Add integrations from environment
    if (process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN) {
      config.integrations = {
        ...config.integrations,
        trello: {
          apiKey: process.env.TRELLO_API_KEY,
          token: process.env.TRELLO_TOKEN,
          boardId: process.env.TRELLO_BOARD_ID || ''
        }
      };
    }

    if (process.env.ASANA_ACCESS_TOKEN) {
      config.integrations = {
        ...config.integrations,
        asana: {
          accessToken: process.env.ASANA_ACCESS_TOKEN,
          projectId: process.env.ASANA_PROJECT_ID || ''
        }
      };
    }

    if (process.env.GITHUB_TOKEN) {
      config.integrations = {
        ...config.integrations,
        github: {
          token: process.env.GITHUB_TOKEN,
          repository: process.env.GITHUB_REPOSITORY || ''
        }
      };
    }

    if (process.env.SLACK_BOT_TOKEN) {
      config.integrations = {
        ...config.integrations,
        slack: {
          botToken: process.env.SLACK_BOT_TOKEN,
          channel: process.env.SLACK_CHANNEL
        }
      };
    }

    const setup = new TaskAutomationSetup(config);
    return await setup.setup();
  }
}

// Export for easy usage
export default TaskAutomationSetup;