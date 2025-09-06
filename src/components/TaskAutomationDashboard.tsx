import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  Users,
  Target
} from 'lucide-react';
import { Task, TaskStatus, TaskMetrics, AutomationRule } from '../types/task-management';
import { taskAutomationEngine } from '../services/TaskAutomationEngine';
import { metricsCollector } from '../services/MetricsAndMonitoring';
import { integrationManager } from '../services/ExternalIntegrations';

interface DashboardProps {
  className?: string;
}

export const TaskAutomationDashboard: React.FC<DashboardProps> = ({ className }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadRealtimeMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load tasks
      const allTasks = taskAutomationEngine.getAllTasks();
      setTasks(allTasks);
      
      // Load metrics
      const taskMetrics = await metricsCollector.calculateTaskMetrics();
      setMetrics(taskMetrics);
      
      // Load automation rules (would need to be implemented in engine)
      // setAutomationRules(await taskAutomationEngine.getAutomationRules());
      
      await loadRealtimeMetrics();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeMetrics = async () => {
    try {
      const realtime = await metricsCollector.getRealtimeMetrics();
      setRealtimeMetrics(realtime);
    } catch (error) {
      console.error('Failed to load realtime metrics:', error);
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    const colors = {
      todo: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      in_review: 'bg-yellow-500',
      blocked: 'bg-red-500',
      done: 'bg-green-500',
      cancelled: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getSystemHealthColor = (health: string): string => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Automation Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your automated task workflows
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              realtimeMetrics?.systemHealth === 'healthy' ? 'bg-green-500' :
              realtimeMetrics?.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className={getSystemHealthColor(realtimeMetrics?.systemHealth)}>
              {realtimeMetrics?.systemHealth || 'Unknown'}
            </span>
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'done').length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.automationEfficiency ? `${metrics.automationEfficiency.toFixed(1)}%` : 'N/A'}
            </div>
            <Progress 
              value={metrics?.automationEfficiency || 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageCompletionTime ? `${metrics.averageCompletionTime.toFixed(1)}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per task average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeMetrics?.activeAutomations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Task Status Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics?.tasksByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status as TaskStatus)}`}></div>
                        <span className="capitalize text-sm">{status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getStatusColor(status as TaskStatus)}`}
                            style={{ width: `${((count as number) / (metrics?.totalTasks || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realtimeMetrics?.recentFailures?.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Recent Failures
                      </h4>
                      {realtimeMetrics.recentFailures.slice(0, 3).map((failure: any, index: number) => (
                        <div key={index} className="text-xs bg-red-50 p-2 rounded">
                          <div className="font-medium">Task {failure.taskId}</div>
                          <div className="text-red-600">{failure.error}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      No recent failures
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {realtimeMetrics?.activeAutomations || 0} automations executed in the last hour
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Productivity Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Productivity Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasks completed today</span>
                    <span className="font-medium">{metrics?.productivity?.tasksCompletedToday || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasks completed this week</span>
                    <span className="font-medium">{metrics?.productivity?.tasksCompletedThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Velocity trend</span>
                    <Badge variant={
                      metrics?.productivity?.velocityTrend === 'increasing' ? 'default' :
                      metrics?.productivity?.velocityTrend === 'decreasing' ? 'destructive' : 'secondary'
                    }>
                      {metrics?.productivity?.velocityTrend || 'stable'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottlenecks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Bottlenecks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics?.bottlenecks && metrics.bottlenecks.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">
                            {bottleneck.status.replace('_', ' ')}
                          </span>
                          <Badge variant="destructive">
                            {bottleneck.tasksStuck} stuck
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          Average time: {bottleneck.averageTimeInStatus.toFixed(1)} hours
                        </div>
                        <div className="text-xs space-y-1">
                          {bottleneck.suggestedActions.map((action, actionIndex) => (
                            <div key={actionIndex} className="text-blue-600">
                              • {action}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    No bottlenecks detected
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TasksList tasks={tasks} onTaskUpdate={loadDashboardData} />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <AutomationRulesPanel rules={automationRules} onRulesUpdate={loadDashboardData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsPanel metrics={metrics} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Sub-components
const TasksList: React.FC<{ tasks: Task[]; onTaskUpdate: () => void }> = ({ tasks, onTaskUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${task.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {task.assignee && `Assigned to ${task.assignee} • `}
                    Created {task.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{task.priority}</Badge>
                <Badge>{task.status.replace('_', ' ')}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AutomationRulesPanel: React.FC<{ rules: AutomationRule[]; onRulesUpdate: () => void }> = ({ rules, onRulesUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          Automation rules management coming soon...
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsPanel: React.FC<{ metrics: TaskMetrics | null }> = ({ metrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
          Advanced analytics charts coming soon...
        </div>
      </CardContent>
    </Card>
  );
};

const IntegrationsPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<string[]>([]);

  useEffect(() => {
    setIntegrations(integrationManager.getIntegrations());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>External Integrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded p-4 text-center">
              <div className="font-medium mb-2">Trello</div>
              <div className="text-sm text-muted-foreground mb-3">
                Sync tasks with Trello boards
              </div>
              <Button size="sm" variant="outline">Configure</Button>
            </div>
            <div className="border rounded p-4 text-center">
              <div className="font-medium mb-2">Asana</div>
              <div className="text-sm text-muted-foreground mb-3">
                Sync tasks with Asana projects
              </div>
              <Button size="sm" variant="outline">Configure</Button>
            </div>
            <div className="border rounded p-4 text-center">
              <div className="font-medium mb-2">GitHub</div>
              <div className="text-sm text-muted-foreground mb-3">
                Sync with GitHub issues and PRs
              </div>
              <Button size="sm" variant="outline">Configure</Button>
            </div>
          </div>
          
          {integrations.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Active Integrations</h3>
              <div className="space-y-2">
                {integrations.map((integration) => (
                  <div key={integration} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">{integration}</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskAutomationDashboard;