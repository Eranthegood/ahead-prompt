import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Github, ExternalLink, Check, AlertCircle, Code, GitBranch, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIntegrations } from "@/hooks/useIntegrations";

export default function GitHubIntegration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { integrations, configureIntegration, testIntegration, isLoading } = useIntegrations();
  const [token, setToken] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const githubIntegration = integrations.find(i => i.id === 'github');
  const isConfigured = githubIntegration?.isConfigured;
  const isConnected = githubIntegration?.isEnabled && githubIntegration?.lastTestResult === 'success';

  const handleSaveToken = async () => {
    if (!token.trim()) {
      toast({
        title: "Token requis",
        description: "Veuillez saisir votre Personal Access Token GitHub.",
        variant: "destructive",
      });
      return;
    }

    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      toast({
        title: "Format de token invalide",
        description: "Le token doit commencer par 'ghp_' ou 'github_pat_'.",
        variant: "destructive",
      });
      return;
    }

    setIsConfiguring(true);
    try {
      const success = await configureIntegration('github', token);
      if (success) {
        toast({
          title: "Token configuré avec succès",
          description: "Votre token GitHub a été sauvegardé de manière sécurisée.",
        });
        setToken("");
        // Test the connection automatically after configuration
        handleTestConnection();
      } else {
        toast({
          title: "Erreur de configuration",
          description: "Impossible de sauvegarder le token. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de configuration",
        description: "Une erreur est survenue lors de la sauvegarde du token.",
        variant: "destructive",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const success = await testIntegration('github');
      if (success) {
        toast({
          title: "Connection successful",
          description: "Your GitHub integration is working correctly.",
        });
      } else {
        toast({
          title: "Connection test failed",
          description: "Check that your token is valid and has the proper permissions.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de test",
        description: "Impossible de tester la connexion GitHub.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const features = [
    {
      icon: Code,
      title: "Contexte de code enrichi",
      description: "Accès au code et à l'historique des commits pour de meilleures suggestions"
    },
    {
      icon: GitBranch,
      title: "Gestion des branches",
      description: "Intégration avec vos branches et pull requests GitHub"
    },
    {
      icon: Users,
      title: "Collaboration d'équipe",
      description: "Partage et synchronisation avec les membres de votre équipe"
    },
    {
      icon: Settings,
      title: "Configuration flexible",
      description: "Contrôle précis des permissions et de l'accès aux repositories"
    }
  ];

  const requiredPermissions = [
    "repo (accès aux repositories privés)",
    "read:user (informations de profil)",
    "read:org (accès aux organisations)"
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/integrations')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to integrations
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-lg bg-card border flex items-center justify-center">
          <Github className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">GitHub Integration</h1>
          <p className="text-muted-foreground">
            Connect your GitHub account to enrich your prompts context
          </p>
        </div>
        {isConnected && (
          <Badge variant="secondary" className="ml-auto">
            <Check className="w-4 h-4 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      {!isConnected && (
        <Alert className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>Prerequisites:</strong> GitHub integration is required to use Cursor Background Agents with your code context.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Personal Access Token</CardTitle>
              <CardDescription>
                Configurez votre token GitHub pour permettre l'accès à vos repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-token">Personal Access Token</Label>
                <Input
                  id="github-token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isConfiguring}
                />
                <p className="text-sm text-muted-foreground">
                  Votre token sera stocké de manière sécurisée et chiffrée
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveToken}
                  disabled={isConfiguring || !token.trim()}
                  className="flex-1"
                >
                  {isConfiguring ? "Configuration..." : "Sauvegarder le token"}
                </Button>
                {isConfigured && (
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                  >
                    {isTesting ? "Test..." : "Tester la connexion"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Comment créer un Personal Access Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">1</div>
                  <div>
                    <p className="font-medium">Accédez aux paramètres GitHub</p>
                    <p className="text-sm text-muted-foreground">
                      Allez dans Settings → Developer settings → Personal access tokens → Tokens (classic)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">2</div>
                  <div>
                    <p className="font-medium">Générez un nouveau token</p>
                    <p className="text-sm text-muted-foreground">
                      Cliquez sur "Generate new token" et sélectionnez "Generate new token (classic)"
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">3</div>
                  <div>
                    <p className="font-medium">Configurez les permissions</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Sélectionnez les scopes suivants :</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        {requiredPermissions.map((permission, index) => (
                          <li key={index}>{permission}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">4</div>
                  <div>
                    <p className="font-medium">Copiez et collez le token</p>
                    <p className="text-sm text-muted-foreground">
                      Une fois généré, copiez le token et collez-le dans le champ ci-dessus
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Button variant="outline" asChild className="w-full">
                <a 
                  href="https://github.com/settings/tokens/new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Créer un token sur GitHub
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avantages de l'intégration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <feature.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <a 
                  href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Documentation GitHub
                </a>
              </Button>
              {isConnected && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate('/integrations/cursor')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurer Cursor
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}