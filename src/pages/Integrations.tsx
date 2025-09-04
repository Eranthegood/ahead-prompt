import React from 'react';
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
    description: 'Envoyez vos prompts directement vers Cursor pour une génération de code autonome sur vos repos GitHub.',
    icon: Code,
    logo: '/lovable-uploads/5d5ed883-0303-4ec8-9358-b4b6043727a0.png',
    configPath: '/integrations/cursor',
    repositoryConfigPath: '/settings/git-cursor'
  },
  {
    id: 'github',
    name: 'GitHub Integration',
    description: 'Synchronisez automatiquement vos prompts avec vos repositories GitHub et créez des issues.',
    icon: Github,
    configPath: '/integrations/github'
  },
  {
    id: 'slack',
    name: 'Slack Notifications',
    description: 'Recevez des notifications Slack quand vos agents Cursor terminent leurs tâches.',
    icon: Zap,
    isComingSoon: true
  }
];

const getStatusConfig = (integration: any, integrationData: any) => {
  if (integration.isComingSoon) {
    return {
      label: 'Bientôt disponible',
      variant: 'secondary' as const,
      icon: AlertCircle,
      color: 'text-muted-foreground'
    };
  }
  
  if (!integrationData.isConfigured) {
    return {
      label: 'Non configuré',
      variant: 'outline' as const,
      icon: AlertCircle,
      color: 'text-orange-600'
    };
  }
  
  if (integrationData.isEnabled) {
    return {
      label: 'Connecté',
      variant: 'default' as const,
      icon: CheckCircle,
      color: 'text-green-600'
    };
  }
  
  return {
    label: 'Déconnecté',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600'
  };
};

function IntegrationRow({ integration }: { integration: typeof INTEGRATIONS_CONFIG[0] }) {
  const navigate = useNavigate();
  const { integrations, isLoading, toggleIntegration, testIntegration } = useIntegrations();
  const Icon = integration.icon;
  
  const integrationData = integrations.find(i => i.id === integration.id) || {
    isConfigured: false,
    isEnabled: false,
    lastTestResult: null
  };
  
  const statusConfig = getStatusConfig(integration, integrationData);
  const StatusIcon = statusConfig.icon;
  
  const handleSwitchToggle = async (checked: boolean) => {
    if (!integrationData.isConfigured) {
      navigate(integration.configPath);
      return;
    }
    
    await toggleIntegration(integration.id, checked);
  };
  
  const handleActionButton = () => {
    if (integration.isComingSoon) return;
    
    if (!integrationData.isConfigured) {
      navigate(integration.configPath);
    } else if (integrationData.isEnabled && integration.repositoryConfigPath) {
      navigate(integration.repositoryConfigPath);
    } else {
      testIntegration(integration.id);
    }
  };
  
  const getActionButtonText = () => {
    if (integration.isComingSoon) return null;
    
    if (!integrationData.isConfigured) return 'Configurer';
    if (integrationData.isEnabled && integration.repositoryConfigPath) return 'Configurer Repository';
    return 'Tester';
  };
  
  const actionButtonText = getActionButtonText();
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
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
            {actionButtonText}
          </Button>
        )}
      </div>
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
              Accueil
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Intégrations</span>
          </nav>
          
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Intégrations</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Connectez vos outils préférés pour automatiser votre workflow de développement.
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
          <h3 className="font-semibold mb-2">💡 Astuce</h3>
          <p className="text-sm text-muted-foreground">
            Activez Cursor pour envoyer automatiquement vos prompts vers vos repositories GitHub. 
            Une fois configuré, vous verrez un bouton "Envoyer vers Cursor" sur vos prompts.
          </p>
        </div>
      </div>
    </div>
  );
}