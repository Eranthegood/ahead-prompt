import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useIntegrations } from '@/hooks/useIntegrations';
import { Github, Figma, Zap, ExternalLink, Settings } from 'lucide-react';

const availableIntegrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Synchronisez vos projets et gérez vos pull requests',
    icon: Github,
    color: 'bg-slate-900 text-white',
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Importez vos designs et composants Figma',
    icon: Figma,
    color: 'bg-purple-600 text-white',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'Intégration avec l\'éditeur Cursor pour l\'IA',
    icon: Zap,
    color: 'bg-blue-600 text-white',
  },
];

export function IntegrationsSection() {
  const { integrations, isLoading } = useIntegrations();

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
          <CardTitle>Intégrations disponibles</CardTitle>
          <CardDescription>
            Connectez vos outils favoris pour améliorer votre workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Chargement...</div>
          ) : (
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
                          {status.isConfigured && (
                            <Badge variant={status.isEnabled ? 'default' : 'secondary'}>
                              {status.isEnabled ? 'Activé' : 'Configuré'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                        {status.lastTest && (
                          <p className="text-xs text-muted-foreground">
                            Dernier test: {status.lastTest}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status.isConfigured && (
                        <Switch
                          checked={status.isEnabled}
                          onCheckedChange={() => {
                            // TODO: Handle enable/disable
                          }}
                        />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate to integration configuration
                          if (integration.id === 'github') {
                            window.open('/integrations/github', '_blank');
                          } else if (integration.id === 'figma') {
                            window.open('/integrations/figma', '_blank');
                          } else if (integration.id === 'cursor') {
                            window.open('/integrations/cursor', '_blank');
                          }
                        }}
                      >
                        {status.isConfigured ? (
                          <>
                            <Settings className="mr-2 h-4 w-4" />
                            Configurer
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Connecter
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Configurez des webhooks pour recevoir des notifications (bientôt disponible).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 opacity-50">
            <p className="text-muted-foreground mb-4">
              La configuration des webhooks sera bientôt disponible.
            </p>
            <Button disabled variant="outline">
              Ajouter un webhook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}