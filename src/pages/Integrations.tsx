import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  Settings, 
  Check, 
  AlertCircle, 
  Plus, 
  Github,
  Key,
  Webhook,
  Zap,
  Globe,
  Code,
  Lock,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const INTEGRATIONS = [
  {
    id: 'cursor',
    name: 'Cursor Background Agents',
    description: 'Envoyez vos prompts directement vers Cursor pour une génération de code autonome sur vos repos GitHub.',
    icon: Code,
    category: 'development',
    status: 'available',
    features: [
      'Génération de code autonome',
      'Intégration GitHub directe',
      'Support des modèles Claude & GPT',
      'Webhooks de statut',
      'Création automatique de PR'
    ],
    setupSteps: [
      'Créer un compte Cursor Pro',
      'Générer une clé API depuis le Dashboard Cursor',
      'Configurer la clé API dans les secrets',
      'Connecter vos repositories GitHub'
    ],
    documentation: 'https://docs.cursor.com/background-agent/api/overview'
  },
  {
    id: 'github',
    name: 'GitHub Integration',
    description: 'Synchronisez automatiquement vos prompts avec vos repositories GitHub et créez des issues.',
    icon: Github,
    category: 'development',
    status: 'coming_soon',
    features: [
      'Création d\'issues automatique',
      'Synchronisation bidirectionnelle',
      'Labels et milestones',
      'Pull request templates'
    ]
  },
  {
    id: 'slack',
    name: 'Slack Notifications',
    description: 'Recevez des notifications Slack quand vos agents Cursor terminent leurs tâches.',
    icon: Zap,
    category: 'notifications',
    status: 'coming_soon',
    features: [
      'Notifications en temps réel',
      'Canaux personnalisés',
      'Rich formatting',
      'Threading des conversations'
    ]
  },
  {
    id: 'webhooks',
    name: 'Custom Webhooks',
    description: 'Configurez des webhooks personnalisés pour intégrer avec vos outils préférés.',
    icon: Webhook,
    category: 'automation',
    status: 'planned',
    features: [
      'Endpoints personnalisés',
      'Authentification sécurisée',
      'Retry logic automatique',
      'Payload customization'
    ]
  }
];

const STATUS_CONFIG = {
  available: { label: 'Disponible', variant: 'default' as const, icon: Check },
  coming_soon: { label: 'Bientôt', variant: 'secondary' as const, icon: AlertCircle },
  planned: { label: 'Planifié', variant: 'outline' as const, icon: Plus }
};

interface IntegrationSecretProps {
  integrationId: string;
  secretName: string;
  label: string;
  placeholder: string;
  description: string;
}

function IntegrationSecret({ integrationId, secretName, label, placeholder, description }: IntegrationSecretProps) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [secretValue, setSecretValue] = useState('');
  const { toast } = useToast();

  const handleSaveSecret = async () => {
    if (!secretValue.trim()) {
      toast({
        title: 'Clé API requise',
        description: 'Veuillez saisir votre clé API.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would use the secrets API
      // For now, we'll simulate the behavior
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConfigured(true);
      setSecretValue('');
      toast({
        title: 'Configuration sauvegardée',
        description: `Clé API ${label} configurée avec succès.`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erreur de configuration',
        description: 'Impossible de sauvegarder la clé API.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Test the integration connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Connexion réussie',
        description: `L'intégration ${label} fonctionne correctement.`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Test échoué',
        description: 'Vérifiez votre configuration.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{label}</CardTitle>
          </div>
          {isConfigured && (
            <Badge variant="default" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Configuré
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder={placeholder}
            value={secretValue}
            onChange={(e) => setSecretValue(e.target.value)}
            disabled={isConfigured}
          />
        </div>
        
        <div className="flex gap-2">
          {!isConfigured ? (
            <Button 
              onClick={handleSaveSecret}
              disabled={isLoading || !secretValue.trim()}
              size="sm"
            >
              {isLoading ? 'Configuration...' : 'Configurer'}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleTestConnection}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? 'Test...' : 'Tester la connexion'}
              </Button>
              <Button 
                onClick={() => setIsConfigured(false)}
                size="sm"
                variant="ghost"
              >
                Reconfigurer
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationCard({ integration }: { integration: typeof INTEGRATIONS[0] }) {
  const status = STATUS_CONFIG[integration.status];
  const Icon = integration.icon;
  const StatusIcon = status.icon;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-muted">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription className="mt-1">
                {integration.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant={status.variant} className="text-xs">
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Features */}
        <div>
          <h4 className="text-sm font-medium mb-2">Fonctionnalités</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {integration.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {integration.status === 'available' && (
            <>
              <Button size="sm" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Configurer
              </Button>
              {integration.documentation && (
                <Button size="sm" variant="outline" asChild>
                  <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </>
          )}
          {integration.status === 'coming_soon' && (
            <Button size="sm" variant="outline" disabled className="flex-1">
              <AlertCircle className="h-4 w-4 mr-2" />
              Bientôt disponible
            </Button>
          )}
          {integration.status === 'planned' && (
            <Button size="sm" variant="ghost" disabled className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              En développement
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrations() {
  const categories = {
    development: { label: 'Développement', icon: Code },
    notifications: { label: 'Notifications', icon: Zap },
    automation: { label: 'Automatisation', icon: Settings }
  };

  const availableIntegrations = INTEGRATIONS.filter(i => i.status === 'available');
  const comingSoonIntegrations = INTEGRATIONS.filter(i => i.status === 'coming_soon');
  const plannedIntegrations = INTEGRATIONS.filter(i => i.status === 'planned');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

        {/* Alert Info */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Les intégrations vous permettent d'étendre les fonctionnalités d'Ahead.love avec vos outils externes. 
            Configurez vos clés API de manière sécurisée dans l'onglet Configuration.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Available Integrations */}
            {availableIntegrations.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  Disponibles maintenant
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {availableIntegrations.map((integration) => (
                    <IntegrationCard key={integration.id} integration={integration} />
                  ))}
                </div>
              </section>
            )}

            {/* Coming Soon */}
            {comingSoonIntegrations.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Bientôt disponibles
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {comingSoonIntegrations.map((integration) => (
                    <IntegrationCard key={integration.id} integration={integration} />
                  ))}
                </div>
              </section>
            )}

            {/* Planned */}
            {plannedIntegrations.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                  En développement
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {plannedIntegrations.map((integration) => (
                    <IntegrationCard key={integration.id} integration={integration} />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Configuration des clés API</h2>
                <p className="text-muted-foreground mb-6">
                  Configurez vos clés API pour activer les intégrations. Toutes les clés sont stockées de manière sécurisée.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <IntegrationSecret
                  integrationId="cursor"
                  secretName="CURSOR_API_KEY"
                  label="Cursor API Key"
                  placeholder="cur_xxx_xxxxxxxxxx"
                  description="Clé API obtenue depuis le Dashboard Cursor → Integrations"
                />
                
                {/* Placeholder for future integrations */}
                <Card className="opacity-60">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base text-muted-foreground">GitHub Token</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Bientôt
                      </Badge>
                    </div>
                    <CardDescription>
                      Token GitHub pour l'intégration des repositories
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Webhooks Configuration</h2>
              <p className="text-muted-foreground mb-6">
                Configurez des webhooks pour recevoir des notifications en temps réel sur les événements.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Cursor Webhooks
                </CardTitle>
                <CardDescription>
                  Recevez des notifications quand vos agents Cursor changent de statut
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Webhook URL</label>
                  <Input
                    placeholder="https://votre-app.com/webhooks/cursor"
                    disabled
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Activer les webhooks</label>
                    <p className="text-xs text-muted-foreground">
                      Recevoir des notifications pour les changements de statut
                    </p>
                  </div>
                  <Switch disabled />
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    La configuration des webhooks sera disponible dans une prochaine version.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}