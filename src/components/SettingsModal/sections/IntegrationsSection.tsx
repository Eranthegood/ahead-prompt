import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Github, Figma, Zap, ExternalLink, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const availableIntegrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync your projects and manage pull requests',
    icon: Github,
    color: 'bg-slate-900 text-white',
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Import your Figma designs and components',
    icon: Figma,
    color: 'bg-purple-600 text-white',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'Integration with Cursor AI editor',
    icon: Zap,
    color: 'bg-blue-600 text-white',
  },
];

export function IntegrationsSection() {
  const navigate = useNavigate();
  const { integrations, isLoading, configureIntegration, testIntegration } = useIntegrations();

  const getIntegrationStatus = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    return {
      isConfigured: integration?.isConfigured || false,
      isEnabled: integration?.isEnabled || false,
      lastTest: integration?.lastTestResult,
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Configure your API tokens to connect your development tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableIntegrations.map((integration) => {
              const Icon = integration.icon;
              const status = getIntegrationStatus(integration.id);
              
              return (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${integration.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{integration.name}</h3>
                        {status.isConfigured ? (
                          <Badge variant={status.lastTest === 'success' ? 'default' : 'secondary'}>
                            {status.lastTest === 'success' ? 'Validated' : 'Configured'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not configured</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/integrations')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Click "Configure" to access the full integrations page where you can enter your API tokens.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}