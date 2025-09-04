import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Code,
  Check,
  ExternalLink,
  Key,
  Github,
  Zap,
  Shield,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function CursorIntegration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Clé API requise',
        description: 'Veuillez saisir votre clé API Cursor.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConfigured(true);
      setApiKey('');
      toast({
        title: 'Configuration réussie',
        description: 'Votre clé API Cursor a été configurée avec succès.',
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

  const steps = [
    {
      number: 1,
      title: 'Créer un compte Cursor Pro',
      description: 'Rendez-vous sur cursor.com et créez un compte Pro pour accéder aux Background Agents.',
      action: (
        <Button variant="outline" size="sm" asChild>
          <a href="https://cursor.com/pricing" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir les plans
          </a>
        </Button>
      )
    },
    {
      number: 2,
      title: 'Générer une clé API',
      description: 'Dans votre Dashboard Cursor, allez dans Integrations et générez une nouvelle clé API.',
      action: (
        <Button variant="outline" size="sm" asChild>
          <a href="https://www.cursor.com/settings" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Dashboard Cursor
          </a>
        </Button>
      )
    },
    {
      number: 3,
      title: 'Configurer la clé API',
      description: 'Saisissez votre clé API ci-dessous pour l\'enregistrer de manière sécurisée.',
      action: null
    },
    {
      number: 4,
      title: 'Commencer à utiliser',
      description: 'Une fois configuré, vous pourrez envoyer vos prompts directement vers Cursor depuis vos cartes de prompt.',
      action: null
    }
  ];

  const features = [
    {
      icon: Code,
      title: 'Génération de code autonome',
      description: 'Les agents Cursor travaillent de manière autonome sur vos repositories'
    },
    {
      icon: Github,
      title: 'Intégration GitHub directe',
      description: 'Connexion directe avec vos repositories GitHub publics et privés'
    },
    {
      icon: Zap,
      title: 'Modèles IA avancés',
      description: 'Support complet des modèles Claude et GPT pour une génération optimale'
    },
    {
      icon: Shield,
      title: 'Sécurité renforcée',
      description: 'Toutes les clés API sont chiffrées et stockées de manière sécurisée'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/integrations')}
            className="mb-4 -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux intégrations
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted">
              <Code className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Cursor Background Agents</h1>
              <p className="text-muted-foreground text-lg">
                Automatisez votre génération de code avec les agents Cursor
              </p>
            </div>
            <Badge variant="default" className="ml-auto">
              <Check className="h-3 w-3 mr-1" />
              Disponible
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités principales</CardTitle>
                <CardDescription>
                  Découvrez ce que vous pouvez faire avec l'intégration Cursor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="p-2 rounded-md bg-muted flex-shrink-0">
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuration Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Guide de configuration</CardTitle>
                <CardDescription>
                  Suivez ces étapes pour configurer votre intégration Cursor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {steps.map((step, index) => (
                    <div key={index}>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 mb-3">
                            {step.description}
                          </p>
                          {step.action}
                          
                          {/* API Key Configuration */}
                          {step.number === 3 && (
                            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Key className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Configuration de la clé API</span>
                                  {isConfigured && (
                                    <Badge variant="default" className="text-xs">
                                      <Check className="h-3 w-3 mr-1" />
                                      Configuré
                                    </Badge>
                                  )}
                                </div>
                                
                                {!isConfigured ? (
                                  <>
                                    <Input
                                      type="password"
                                      placeholder="cur_xxx_xxxxxxxxxx"
                                      value={apiKey}
                                      onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <Button 
                                      onClick={handleSaveApiKey}
                                      disabled={isLoading || !apiKey.trim()}
                                      size="sm"
                                    >
                                      {isLoading ? 'Configuration...' : 'Configurer'}
                                    </Button>
                                  </>
                                ) : (
                                  <Alert>
                                    <Check className="h-4 w-4" />
                                    <AlertDescription>
                                      Votre clé API Cursor est configurée et prête à l'utilisation.
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="ml-4 mt-4">
                          <Separator orientation="vertical" className="h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="https://docs.cursor.com/background-agent/api/overview" target="_blank" rel="noopener noreferrer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Documentation officielle
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <a href="https://www.cursor.com/settings" target="_blank" rel="noopener noreferrer">
                    <Key className="h-4 w-4 mr-2" />
                    Dashboard Cursor
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                </Button>

                {isConfigured && (
                  <Button size="sm" className="w-full justify-start" onClick={() => navigate('/')}>
                    <Zap className="h-4 w-4 mr-2" />
                    Commencer à utiliser
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription className="text-sm">
                    Une fois configuré, vous verrez l'option "Envoyer vers Cursor" dans le menu contextuel de vos prompts.
                  </AlertDescription>
                </Alert>
                
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Prérequis :</strong>
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• Compte Cursor Pro actif</li>
                    <li>• Repository GitHub configuré</li>
                    <li>• Clé API valide</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}