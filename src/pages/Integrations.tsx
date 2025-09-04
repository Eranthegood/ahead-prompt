import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  ChevronRight,
  Code,
  Github,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INTEGRATIONS = [
  {
    id: 'cursor',
    name: 'Cursor Background Agents',
    description: 'Envoyez vos prompts directement vers Cursor pour une génération de code autonome sur vos repos GitHub.',
    icon: Code,
    logo: '/lovable-uploads/5d5ed883-0303-4ec8-9358-b4b6043727a0.png',
    status: 'available',
    path: '/integrations/cursor'
  },
  {
    id: 'github',
    name: 'GitHub Integration',
    description: 'Synchronisez automatiquement vos prompts avec vos repositories GitHub et créez des issues.',
    icon: Github,
    status: 'coming_soon',
    path: null
  },
  {
    id: 'slack',
    name: 'Slack Notifications',
    description: 'Recevez des notifications Slack quand vos agents Cursor terminent leurs tâches.',
    icon: Zap,
    status: 'coming_soon',
    path: null
  }
];

const STATUS_CONFIG = {
  available: { label: 'Disponible', variant: 'default' as const },
  coming_soon: { label: 'Bientôt', variant: 'secondary' as const }
};

function IntegrationCard({ integration }: { integration: typeof INTEGRATIONS[0] }) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[integration.status];
  const Icon = integration.icon;

  const handleClick = () => {
    if (integration.path && integration.status === 'available') {
      navigate(integration.path);
    }
  };

  return (
    <Card 
      className={`h-full transition-colors ${
        integration.path && integration.status === 'available' 
          ? 'cursor-pointer hover:bg-muted/50' 
          : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-muted">
              {integration.logo ? (
                <img 
                  src={integration.logo} 
                  alt={`${integration.name} logo`}
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                {integration.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className="text-xs">
              {status.label}
            </Badge>
            {integration.path && integration.status === 'available' && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function Integrations() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Intégrations</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Connectez vos outils préférés pour automatiser votre workflow de développement.
          </p>
        </div>

        {/* Integrations List */}
        <div className="space-y-4">
          {INTEGRATIONS.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      </div>
    </div>
  );
}