import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  ChevronRight,
  Code,
  Github,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntegrations } from '@/hooks/useIntegrations';

const INTEGRATIONS_CONFIG = [
  {
    id: 'cursor',
    name: 'Cursor Background Agents',
    description: 'Send your prompts directly to Cursor for autonomous code generation on your GitHub repos.',
    icon: Code,
    logo: '/lovable-uploads/5d5ed883-0303-4ec8-9358-b4b6043727a0.png',
    configPath: '/integrations/cursor',
    repositoryConfigPath: '/settings/repository-mapping'
  },
  {
    id: 'github',
    name: 'GitHub Integration',
    description: 'Automatically sync your prompts with your GitHub repositories and create issues.',
    icon: Github,
    configPath: '/integrations/github'
  },
  {
    id: 'figma',
    name: 'Figma Integration',
    description: 'Connect your Figma projects to enrich your Knowledge Base with designs, specs, and components for enhanced prompt context.',
    icon: Code,
    logo: '/lovable-uploads/ee087f3f-2f51-434e-97bc-91d8c2586b10.png',
    configPath: '/integrations/figma'
  },
  {
    id: 'string',
    name: 'String.com Integration',
    description: 'Automatisez la récupération d\'articles SEO depuis String.com via webhook pour enrichir votre base de connaissances.',
    icon: Zap,
    configPath: '/integrations/string'
  },
  {
    id: 'slack',
    name: 'Slack Notifications',
    description: 'Receive Slack notifications when your Cursor agents complete their tasks.',
    icon: Zap,
    isComingSoon: true
  }
];

const getStatusConfig = (integration: any, integrationData: any) => {
  if (integration.isComingSoon) {
    return {
      label: 'Coming Soon',
      variant: 'secondary' as const,
      icon: AlertCircle,
      color: 'text-muted-foreground'
    };
  }
  
  if (!integrationData.isConfigured) {
    return {
      label: 'Not Configured',
      variant: 'outline' as const,
      icon: AlertCircle,
      color: 'text-orange-600'
    };
  }
  
  if (integrationData.isEnabled) {
    return {
      label: 'Connected',
      variant: 'default' as const,
      icon: CheckCircle,
      color: 'text-green-600'
    };
  }
  
  return {
    label: 'Disconnected',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600'
  };
};

function IntegrationRow({ integration }: { integration: typeof INTEGRATIONS_CONFIG[0] }) {
  const navigate = useNavigate();
  const { integrations, isLoading, toggleIntegration, testIntegration, configureIntegration } = useIntegrations();
  const [showTokenField, setShowTokenField] = useState(false);
  const [token, setToken] = useState('');
  const Icon = integration.icon;
  
  const integrationData = integrations.find(i => i.id === integration.id) || {
    isConfigured: false,
    isEnabled: false,
    lastTestResult: null,
    metadata: null
  };
  
  const statusConfig = getStatusConfig(integration, integrationData);
  const StatusIcon = statusConfig.icon;
  
  const handleSwitchToggle = async (checked: boolean) => {
    if (!integrationData.isConfigured) {
      setShowTokenField(true);
      return;
    }
    
    await toggleIntegration(integration.id, checked);
  };
  
  const handleActionButton = () => {
    if (integration.isComingSoon) return;
    
    if (!integrationData.isConfigured) {
      setShowTokenField(true);
    } else if (integrationData.isEnabled && integration.repositoryConfigPath) {
      navigate(integration.repositoryConfigPath);
    } else {
      testIntegration(integration.id);
    }
  };

  const handleTokenSubmit = async () => {
    if (token.trim()) {
      const success = await configureIntegration(integration.id, token);
      if (success) {
        setShowTokenField(false);
        setToken('');
      }
    }
  };
  
  const getActionButtonText = () => {
    if (integration.isComingSoon) return null;
    
    if (!integrationData.isConfigured) return 'Configure';
    if (integrationData.isEnabled && integration.repositoryConfigPath) return 'Configure Repository';
    return 'Test';
  };
  
  const actionButtonText = getActionButtonText();
  
  return (
    <div className="border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between p-4">
        {/* Left section - Logo, Name, Description */}
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 rounded-lg bg-muted">
            {integration.logo ? (
              <img 
                src={integration.logo} 
                alt={`${integration.name} logo`}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Icon className="h-8 w-8" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{integration.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {integration.description}
            </p>
          </div>
        </div>
        
        {/* Right section - Status, Switch, Action Button */}
        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
            <Badge variant={statusConfig.variant} className="text-xs">
              {statusConfig.label}
            </Badge>
          </div>
          
          {/* Switch */}
          {!integration.isComingSoon && (
            <Switch
              checked={integrationData.isEnabled}
              onCheckedChange={handleSwitchToggle}
              disabled={isLoading}
              className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-500"
            />
          )}
          
          {/* Action Button */}
          {actionButtonText && (
            <Button
              variant={integrationData.isEnabled ? "default" : "outline"}
              size="sm"
              onClick={handleActionButton}
              disabled={isLoading || integration.isComingSoon}
              className="min-w-[120px]"
            >
              {actionButtonText || 'Configure'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Token Configuration Field */}
      {showTokenField && (
        <div className="border-t bg-muted/20 p-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                {integration.id === 'github' ? 'Personal Access Token' : 
                 integration.id === 'figma' ? 'Personal Access Token' :
                 'API Token'}
              </label>
              <p className="text-xs text-muted-foreground">
                {integration.id === 'github' 
                  ? 'Enter your GitHub Personal Access Token'
                  : integration.id === 'figma'
                  ? 'Enter your Figma Personal Access Token from Account Settings > Personal Access Tokens'
                  : 'Enter your API token'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={
                  integration.id === 'github' ? 'ghp_xxxxxxxxxxxx' : 
                  integration.id === 'figma' ? 'figd_xxxxxxxxxxxx' :
                  'Token...'
                }
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                onKeyDown={(e) => e.key === 'Enter' && handleTokenSubmit()}
              />
              <Button 
                size="sm" 
                onClick={handleTokenSubmit}
                disabled={!token.trim() || isLoading}
              >
                Configure
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setShowTokenField(false);
                  setToken('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Show configured GitHub user info */}
      {'metadata' in integrationData && integrationData.metadata && integration.id === 'github' && integrationData.isConfigured && (
        <div className="border-t bg-muted/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={integrationData.metadata.avatar_url} 
              alt="GitHub Avatar" 
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="font-medium">{integrationData.metadata.name || integrationData.metadata.username}</div>
              <div className="text-sm text-muted-foreground">@{integrationData.metadata.username}</div>
            </div>
            <div className="text-sm text-muted-foreground">
              {integrationData.metadata.public_repos} public repos
            </div>
          </div>
          {integrationData.metadata.repositories && integrationData.metadata.repositories.length > 0 && (
            <div className="pt-3 border-t">
              <div className="text-sm font-medium mb-2">Recent repositories:</div>
              <div className="flex flex-wrap gap-2">
                {integrationData.metadata.repositories.slice(0, 4).map((repo: any) => (
                  <a 
                    key={repo.name} 
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-background hover:bg-muted/50 rounded px-2 py-1 border transition-colors"
                  >
                    {repo.name} {repo.private && '🔒'}
                  </a>
                ))}
                {integrationData.metadata.repositories.length > 4 && (
                  <span className="text-xs text-muted-foreground px-2 py-1">
                    +{integrationData.metadata.repositories.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show configured Cursor user info */}
      {'metadata' in integrationData && integrationData.metadata && integration.id === 'cursor' && integrationData.isConfigured && (
        <div className="border-t bg-muted/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <div className="flex-1">
              <div className="font-medium">{integrationData.metadata.username || 'Cursor User'}</div>
              {integrationData.metadata.email && (
                <div className="text-sm text-muted-foreground">{integrationData.metadata.email}</div>
              )}
            </div>
            <div className="text-sm text-green-600 font-medium">
              Token configured ✓
            </div>
          </div>
          <div className="pt-3 border-t">
            <div className="text-sm font-medium mb-2">Available capabilities:</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                Background Agents
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Code Generation
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Auto PR Creation
              </Badge>
            </div>
          </div>
        </div>
      )}
      {/* Show configured Figma user info */}
      {'metadata' in integrationData && integrationData.metadata && integration.id === 'figma' && integrationData.isConfigured && (
        <div className="border-t bg-muted/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <div className="flex-1">
              <div className="font-medium">{integrationData.metadata.handle || 'Figma User'}</div>
              {integrationData.metadata.email && (
                <div className="text-sm text-muted-foreground">{integrationData.metadata.email}</div>
              )}
            </div>
            <div className="text-sm text-green-600 font-medium">
              Token configured ✓
            </div>
          </div>
          <div className="pt-3 border-t">
            <div className="text-sm font-medium mb-2">Available resources:</div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                Design Import
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Component Specs
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Knowledge Base
              </Badge>
            </div>
            {integrationData.metadata.teams && integrationData.metadata.teams.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">Teams ({integrationData.metadata.teams.length}):</div>
                <div className="flex flex-wrap gap-2">
                  {integrationData.metadata.teams.slice(0, 3).map((team: any) => (
                    <Badge key={team.id} variant="outline" className="text-xs">
                      {team.name}
                    </Badge>
                  ))}
                  {integrationData.metadata.teams.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{integrationData.metadata.teams.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Integrations() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="p-0 h-auto hover:bg-transparent"
            >
              Home
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Integrations</span>
          </nav>
          
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Integrations</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Connect your favorite tools to automate your development workflow.
          </p>
        </div>

        {/* Integrations List */}
        <div className="space-y-3">
          {INTEGRATIONS_CONFIG.map((integration) => (
            <IntegrationRow key={integration.id} integration={integration} />
          ))}
        </div>
        
        {/* Helpful Information */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">💡 Tip</h3>
          <p className="text-sm text-muted-foreground">
            Enable Cursor to automatically send your prompts to your GitHub repositories. 
            Once configured, you'll see a "Send to Cursor" button on your prompts.
          </p>
        </div>
      </div>
    </div>
  );
}