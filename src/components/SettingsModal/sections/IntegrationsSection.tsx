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
          <div className="text-center py-8 opacity-50">
            <p className="text-muted-foreground mb-4">
              Les intégrations sont en cours de développement et seront bientôt disponibles.
            </p>
            <div className="space-y-4">
              {availableIntegrations.map((integration) => {
                const Icon = integration.icon;
                
                return (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${integration.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{integration.name}</h3>
                          <Badge variant="secondary">Bientôt</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    
                    <Button disabled variant="outline" size="sm">
                      Bientôt disponible
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}