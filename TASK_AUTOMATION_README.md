# Task Management Automation with Cursor

A comprehensive task management automation system that integrates with Cursor to streamline the transition of tasks from "To Do" to "In Progress" to "Done" with minimal manual intervention.

## 🚀 Features

### Core Automation
- **Automatic Status Transitions**: Tasks automatically move through statuses based on predefined rules
- **Cursor Integration**: Seamless integration with Cursor agents for development tasks
- **Smart Completion Detection**: Automatically detect task completion based on various criteria
- **Dependency Management**: Handle task dependencies and automatic progression

### External Integrations
- **Trello**: Sync tasks with Trello boards and cards
- **Asana**: Integrate with Asana projects and tasks
- **GitHub**: Connect with GitHub issues and pull requests
- **Slack**: Send notifications and updates to Slack channels

### Monitoring & Analytics
- **Real-time Metrics**: Track automation efficiency and task flow
- **Bottleneck Detection**: Identify and resolve workflow bottlenecks
- **Performance Analytics**: Comprehensive reporting and insights
- **Automation Health Monitoring**: System health checks and alerts

## 📋 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### 2. Basic Setup

```typescript
import { taskManagementAPI } from './src/services/TaskManagementAPI';

// Initialize the system
await taskManagementAPI.initialize();

// Create your first task
const task = await taskManagementAPI.createTask({
  title: "Implement user authentication",
  description: "Add login and registration functionality",
  status: "todo",
  priority: "high",
  assignee: "developer@company.com",
  tags: ["development", "security"]
});
```

### 3. Configure Automation Rules

The system comes with pre-configured MVP automation rules:

- **Auto Start on Assignment**: Move tasks from "To Do" to "In Progress" when assigned
- **Auto Progress on Cursor Start**: Update status when Cursor agent begins work
- **Auto Review on PR Created**: Move to "In Review" when pull request is created
- **Auto Done on PR Merged**: Mark as "Done" when pull request is merged
- **Smart Completion**: Complete tasks when all criteria are met

## 🔧 Configuration

### Environment Variables

```bash
# External API Keys
TRELLO_API_KEY=your_trello_key
TRELLO_TOKEN=your_trello_token
ASANA_ACCESS_TOKEN=your_asana_token
GITHUB_TOKEN=your_github_token
SLACK_BOT_TOKEN=your_slack_token

# Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_BASE_URL=https://your-domain.com

# Database (optional)
DATABASE_URL=your_database_url
```

### Integration Setup

#### Trello Integration

```typescript
await taskManagementAPI.addIntegration('trello', {
  type: 'trello',
  apiKey: process.env.TRELLO_API_KEY,
  boardId: 'your_board_id',
  mapping: {
    todo: 'todo_list_id',
    in_progress: 'doing_list_id',
    in_review: 'review_list_id',
    done: 'done_list_id'
  }
});
```

#### Cursor Integration

```typescript
// Webhook endpoint for Cursor agents
app.post('/webhooks/cursor', async (req, res) => {
  const result = await taskManagementAPI.processWebhook(
    '/webhooks/cursor',
    req.body,
    req.headers
  );
  res.json(result);
});
```

## 🎯 Automation Rules

### Predefined Rules

The system includes several predefined automation rules:

```typescript
import { AutomationRulesManager, MVP_AUTOMATION_RULES } from './src/services/AutomationRules';

// Install MVP rules
await AutomationRulesManager.installPredefinedRules(MVP_AUTOMATION_RULES);

// Or install workflow-specific rules
await AutomationRulesManager.installWorkflowTemplate('development');
```

### Custom Rules

Create custom automation rules:

```typescript
const customRule = {
  name: 'Escalate High Priority Tasks',
  description: 'Notify team lead when high priority tasks are stuck',
  trigger: {
    type: 'time_based',
    schedule: '0 */2 * * *' // Every 2 hours
  },
  action: {
    type: 'send_notification',
    notificationTemplate: 'High priority task "{{task.title}}" needs attention'
  },
  conditions: [
    { field: 'priority', operator: 'equals', value: 'high' },
    { field: 'status', operator: 'equals', value: 'in_progress' },
    { field: 'updatedAt', operator: 'less_than', value: new Date(Date.now() - 4 * 60 * 60 * 1000) }
  ],
  enabled: true
};

await taskAutomationEngine.addAutomationRule(customRule);
```

## 🔗 API Reference

### Task Management

#### Create Task
```typescript
POST /api/tasks
{
  "title": "Task title",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "assignee": "user@example.com",
  "tags": ["tag1", "tag2"],
  "dueDate": "2024-12-31T23:59:59Z"
}
```

#### Update Task
```typescript
PUT /api/tasks/:id
{
  "status": "in_progress",
  "assignee": "new-user@example.com"
}
```

#### Get Tasks
```typescript
GET /api/tasks?status=in_progress&assignee=user@example.com&page=1&limit=20
```

### Automation

#### Trigger Automation
```typescript
POST /api/automation/trigger/:taskId
{
  "ruleId": "optional_specific_rule_id"
}
```

#### Get Metrics
```typescript
GET /api/automation/metrics
```

#### Generate Report
```typescript
POST /api/automation/report
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

### Webhooks

#### Process Webhook
```typescript
POST /webhooks/cursor
POST /webhooks/trello
POST /webhooks/asana
POST /webhooks/github
```

## 📊 Dashboard

Access the task automation dashboard at `/dashboard` to:

- Monitor task status distribution
- View automation efficiency metrics
- Identify bottlenecks and performance issues
- Manage automation rules
- Configure external integrations
- View real-time system health

## 🔍 Monitoring

### Health Check

```typescript
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "services": {
    "automation_engine": true,
    "webhook_handler": true,
    "metrics_collector": true,
    "integration_manager": true
  },
  "metrics": {
    "activeAutomations": 15,
    "recentFailures": [],
    "systemHealth": "healthy"
  }
}
```

### Metrics Collection

The system automatically collects metrics on:

- Task completion times
- Automation success rates
- Bottleneck identification
- Productivity trends
- Integration health

### Alerts

Configure alerts for:

```typescript
metricsCollector.setupAlerts({
  automationFailureThreshold: 5,    // Alert if >5 failures per hour
  bottleneckThreshold: 3,           // Alert if >3 tasks stuck in status
  efficiencyThreshold: 50           // Alert if automation efficiency <50%
});
```

## 🚦 Workflow Examples

### Development Workflow

1. **Task Creation**: Developer creates task in system
2. **Auto Assignment**: Task automatically assigned based on skills/availability
3. **Cursor Integration**: Task linked to Cursor agent when development starts
4. **Auto Progress**: Status changes to "In Progress" when Cursor agent starts
5. **PR Creation**: Status changes to "In Review" when PR is created
6. **Auto Completion**: Task marked "Done" when PR is merged

### Design Workflow

1. **Task Creation**: Design task created with specific criteria
2. **Auto Start**: Moves to "In Progress" when designer is assigned
3. **Review Required**: Automatically moves to "In Review" when marked complete
4. **Stakeholder Approval**: Waits for approval before moving to "Done"

## 🛠️ Advanced Configuration

### Custom Completion Criteria

```typescript
const task = await taskManagementAPI.createTask({
  title: "Website Redesign",
  // ... other fields
  completionCriteria: [
    {
      id: "design_approved",
      description: "Design approved by stakeholders",
      type: "manual",
      completed: false
    },
    {
      id: "code_reviewed",
      description: "Code review completed",
      type: "automated",
      condition: "pull_request_approved",
      completed: false
    }
  ]
});
```

### Dependency Management

```typescript
const dependentTask = await taskManagementAPI.createTask({
  title: "Deploy to Production",
  dependencies: ["task_id_1", "task_id_2"], // Must complete these first
  // ... other fields
});
```

### Time-based Rules

```typescript
const timeBasedRule = AutomationRulesManager.createTimeBasedRule(
  '0 9 * * *', // Daily at 9 AM
  {
    type: 'send_notification',
    notificationTemplate: 'Daily standup reminder: Review your tasks'
  },
  [
    { field: 'assignee', operator: 'exists', value: true },
    { field: 'status', operator: 'not_equals', value: 'done' }
  ]
);
```

## 🔧 Troubleshooting

### Common Issues

1. **Automation Not Triggering**
   - Check rule conditions
   - Verify rule is enabled
   - Check system logs for errors

2. **External Integration Failures**
   - Verify API keys and tokens
   - Check network connectivity
   - Review webhook configurations

3. **Performance Issues**
   - Monitor metrics dashboard
   - Check for bottlenecks
   - Review automation rule efficiency

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
DEBUG=task-automation:*

// Or programmatically
taskManagementAPI.setDebugMode(true);
```

### Logs

Check logs for automation events:

```bash
# View recent automation events
tail -f logs/automation.log

# Filter by error level
grep ERROR logs/automation.log
```

## 📈 Performance Optimization

### Best Practices

1. **Rule Optimization**
   - Keep conditions simple and specific
   - Avoid overlapping rules
   - Regular review unused rules

2. **Integration Efficiency**
   - Batch API calls when possible
   - Use webhooks instead of polling
   - Implement proper error handling

3. **Monitoring**
   - Set up appropriate alerts
   - Regular performance reviews
   - Monitor external API limits

### Scaling Considerations

- **Database**: Use persistent storage for production
- **Caching**: Implement Redis for metrics caching
- **Queue**: Use job queues for webhook processing
- **Load Balancing**: Distribute webhook endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Setup

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues]
- Discord: [Community Discord]
- Email: support@yourcompany.com

---

## 📋 MVP Checklist

- [x] Core task management system
- [x] Automation engine with rule processing
- [x] Cursor integration for development workflow
- [x] Webhook handlers for external systems
- [x] Metrics collection and monitoring
- [x] Dashboard UI components
- [x] API service layer
- [x] External integrations (Trello, Asana, GitHub)
- [x] Comprehensive documentation
- [ ] Production deployment configuration
- [ ] Unit and integration tests
- [ ] Performance benchmarks

This system provides a solid foundation for automating task management workflows with Cursor integration. The modular architecture allows for easy extension and customization based on specific needs.