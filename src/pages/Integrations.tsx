import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Github,
  Code,
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntegrations } from '@/hooks/useIntegrations';
import { toast } from 'sonner';

interface TokenInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onTest?: () => void;
  isLoading: boolean;
  isConfigured: boolean;
  isValid?: boolean | null;
  icon: React.ReactNode;
  description?: string;
}

function TokenInput({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onSave, 
  onTest,
  isLoading, 
  isConfigured, 
  isValid,
  icon,
  description 
}: TokenInputProps) {
  const [showToken, setShowToken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getStatusBadge = () => {
    if (!isConfigured) {
      return <Badge variant="outline" className="text-orange-600"><AlertCircle className="w-3 h-3 mr-1" />Non configuré</Badge>;
    }
    if (isValid === true) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Valide</Badge>;
    }
    if (isValid === false) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Invalide</Badge>;
    }
    return <Badge variant="secondary">Configuré</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{label}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Input - Show only if not configured or editing */}
        {(!isConfigured || isEditing) && (
          <div className="space-y-2">
            <Label>Token / Clé API</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {/* Show Configure/Replace button when editing or not configured */}
          {(!isConfigured || isEditing) && (
            <Button 
              onClick={() => {
                onSave();
                setIsEditing(false);
              }}
              disabled={!value.trim() || isLoading}
              className="flex-1"
            >
              <Key className="w-4 h-4 mr-2" />
              {isConfigured ? 'Remplacer' : 'Configurer'}
            </Button>
          )}
          
          {/* Show Update Token button when configured and not editing */}
          {isConfigured && !isEditing && (
            <Button 
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="flex-1"
            >
              <Key className="w-4 h-4 mr-2" />
              Update Token
            </Button>
          )}
          
          {/* Show Test button when configured */}
          {onTest && isConfigured && (
            <Button 
              variant="outline"
              onClick={onTest}
              disabled={isLoading}
            >
              Tester
            </Button>
          )}
          
          {/* Show Cancel button when editing */}
          {isEditing && (
            <Button 
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                onChange(''); // Clear the input
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrations() {
  const navigate = useNavigate();
  const { integrations, isLoading, configureIntegration, testIntegration } = useIntegrations();
  
  const [tokens, setTokens] = useState({
    github: '',
    cursor: '',
    claude: ''
  });

  const getIntegrationData = (id: string) => {
    return integrations.find(i => i.id === id) || {
      isConfigured: false,
      isEnabled: false,
      lastTestResult: null
    };
  };

  const handleSave = async (type: 'github' | 'cursor' | 'claude') => {
    const token = tokens[type];
    if (!token.trim()) {
      toast.error('Veuillez entrer un token valide');
      return;
    }

    const success = await configureIntegration(type, token);
    if (success) {
      setTokens(prev => ({ ...prev, [type]: '' }));
    }
  };

  const handleTest = async (type: string) => {
    await testIntegration(type);
  };

  const githubData = getIntegrationData('github');
  const cursorData = getIntegrationData('cursor');
  const claudeData = getIntegrationData('claude');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 -ml-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Button>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Intégrations</h1>
            <p className="text-muted-foreground">
              Configurez vos tokens d'API pour connecter vos outils de développement.
            </p>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="space-y-6">
          
          {/* GitHub */}
          <TokenInput
            label="GitHub"
            description="Connectez votre compte GitHub pour la synchronisation des dépôts"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={tokens.github}
            onChange={(value) => setTokens(prev => ({ ...prev, github: value }))}
            onSave={() => handleSave('github')}
            onTest={() => handleTest('github')}
            isLoading={isLoading}
            isConfigured={githubData.isConfigured}
            isValid={githubData.lastTestResult === 'success' ? true : githubData.lastTestResult === 'error' ? false : null}
            icon={<Github className="h-6 w-6" />}
          />

          {/* Cursor */}
          <TokenInput
            label="Cursor"
            description="Activez les agents autonomes Cursor pour la génération de code"
            placeholder="Votre clé API Cursor..."
            value={tokens.cursor}
            onChange={(value) => setTokens(prev => ({ ...prev, cursor: value }))}
            onSave={() => handleSave('cursor')}
            onTest={() => handleTest('cursor')}
            isLoading={isLoading}
            isConfigured={cursorData.isConfigured}
            isValid={cursorData.lastTestResult === 'success' ? true : cursorData.lastTestResult === 'error' ? false : null}
            icon={<Code className="h-6 w-6" />}
          />

          {/* Claude */}
          <TokenInput
            label="Claude"
            description="Intégrez Claude pour l'exécution de code et l'IA avancée"
            placeholder="sk-ant-api03-xxxxxxxxxxxxxxxxxxxx"
            value={tokens.claude}
            onChange={(value) => setTokens(prev => ({ ...prev, claude: value }))}
            onSave={() => handleSave('claude')}
            onTest={() => handleTest('claude')}
            isLoading={isLoading}
            isConfigured={claudeData.isConfigured}
            isValid={claudeData.lastTestResult === 'success' ? true : claudeData.lastTestResult === 'error' ? false : null}
            icon={<Code className="h-6 w-6 text-orange-500" />}
          />
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">🔑 Comment obtenir vos tokens ?</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <strong>GitHub :</strong> Allez dans Settings → Developer settings → Personal access tokens → Générer un nouveau token
              </div>
              <div>
                <strong>Cursor :</strong> Ouvrez Cursor → Settings → API Keys → Générer une clé pour Background Agents
              </div>
              <div>
                <strong>Claude :</strong> Visitez console.anthropic.com → Créer une clé API dans votre compte Anthropic
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}