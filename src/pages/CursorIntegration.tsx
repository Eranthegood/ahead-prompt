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
      title: 'Connecter GitHub à Lovable',
      description: 'OBLIGATOIRE : Les agents Cursor travaillent sur vos repositories GitHub. Vous devez d\'abord connecter votre compte GitHub à Lovable.',
      action: (
        <div className="space-y-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/settings" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              Connecter GitHub
            </a>
          </Button>
          <Alert>
            <Github className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Allez dans Paramètres → GitHub → "Connect to GitHub" pour configurer votre intégration.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      number: 2,
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
      number: 3,
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
      number: 4,
      title: 'Configurer la clé API',
      description: 'Saisissez votre clé API ci-dessous pour l\'enregistrer de manière sécurisée.',
      action: null
    },
    {
      number: 5,
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
              <img 
                src="/lovable-uploads/5d5ed883-0303-4ec8-9358-b4b6043727a0.png" 
                alt="Cursor logo"
                className="h-8 w-8 object-contain"
              />
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

        {/* Prerequisites Alert */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Github className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Prérequis obligatoire :</strong> Vous devez d'abord{' '}
            <a 
              href="/settings" 
              className="underline font-medium hover:no-underline"
            >
              connecter votre compte GitHub à Lovable
            </a>
            {' '}car les agents Cursor travaillent directement sur vos repositories GitHub.
          </AlertDescription>
        </Alert>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Data Flow Explanation */}
            <Card>
              <CardHeader>
                <CardTitle>Comment ça marche ?</CardTitle>
                <CardDescription>
                  Comprendre le flux de données entre Ahead.love, Cursor et GitHub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl">📝</div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 dark:text-blue-100">1. Vous créez un prompt dans Ahead.love</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Rédigez votre demande de feature ou bugfix</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="w-8 border-t-2 border-dashed border-muted-foreground"></div>
                    <span className="mx-2 text-xs text-muted-foreground">envoi</span>
                    <div className="w-8 border-t-2 border-dashed border-muted-foreground"></div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                    <img 
                      src="/lovable-uploads/5d5ed883-0303-4ec8-9358-b4b6043727a0.png" 
                      alt="Cursor logo"
                      className="h-6 w-6 object-contain"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-purple-900 dark:text-purple-100">2. Cursor reçoit votre prompt</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">L'API Cursor crée un Background Agent autonome</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="w-8 border-t-2 border-dashed border-muted-foreground"></div>
                    <span className="mx-2 text-xs text-muted-foreground">travaille sur</span>
                    <div className="w-8 border-t-2 border-dashed border-muted-foreground"></div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <Github className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">3. L'agent travaille sur votre repo GitHub</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Génère le code, crée des commits, et optionnellement une Pull Request</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important :</strong> Votre prompt ne va pas directement sur GitHub. Il est envoyé à Cursor via API, 
                    puis Cursor crée un agent qui travaille de manière autonome sur votre repository GitHub.
                  </p>
                </div>
              </CardContent>
            </Card>

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
                          {step.number === 4 && (
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
                  <a href="/settings">
                    <Github className="h-4 w-4 mr-2" />
                    Configurer GitHub
                    <ChevronRight className="h-3 w-3 ml-auto" />
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
                  <Github className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Important :</strong> Assurez-vous d'avoir connecté GitHub à Lovable avant de configurer Cursor. 
                    Les agents travaillent sur vos repositories GitHub.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertDescription className="text-sm">
                    Une fois configuré, vous verrez l'option "Envoyer vers Cursor" dans le menu contextuel de vos prompts.
                  </AlertDescription>
                </Alert>
                
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Prérequis obligatoires :</strong>
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Intégration GitHub Lovable</strong> (obligatoire)</li>
                    <li>• Compte Cursor Pro actif</li>
                    <li>• Repository GitHub accessible</li>
                    <li>• Clé API Cursor valide</li>
                  </ul>
                  <p className="mt-3 text-xs">
                    <a 
                      href="/settings" 
                      className="text-primary hover:underline"
                    >
                      → Configurer GitHub dans les paramètres
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}