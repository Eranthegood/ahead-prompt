import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PromptTransformService } from '@/services/promptTransformService';
import { Loader2, Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PromptTestDialog() {
  const [open, setOpen] = useState(false);
  const [testIdea, setTestIdea] = useState('Créer une page de connexion avec email et mot de passe');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [testError, setTestError] = useState<string>('');
  const { toast } = useToast();

  const runTest = async () => {
    if (!testIdea.trim()) return;
    
    setIsTestRunning(true);
    setTestResult('');
    setTestError('');
    
    try {
      console.log('🧪 Testing prompt generation with idea:', testIdea);
      
      const response = await PromptTransformService.transformPrompt(
        testIdea.trim(),
        undefined, // No knowledge context
        'openai', // Default provider
        undefined // Default model
      );
      
      console.log('🧪 Test response:', response);
      
      if (response.success && response.transformedPrompt) {
        setTestResult(response.transformedPrompt);
        toast({
          title: "Test réussi ✅",
          description: "La génération de prompt fonctionne correctement"
        });
      } else {
        setTestError(response.error || 'Aucun prompt généré');
        toast({
          title: "Test échoué ❌",
          description: response.error || 'Erreur inconnue',
          variant: 'destructive'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setTestError(errorMessage);
      console.error('🧪 Test failed:', error);
      toast({
        title: "Test échoué ❌",
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bug className="h-4 w-4 mr-2" />
          Test Génération
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test de génération de prompt</DialogTitle>
          <DialogDescription>
            Testez la fonction de génération de prompt pour diagnostiquer les problèmes
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-idea">Idée à tester</Label>
            <Input
              id="test-idea"
              value={testIdea}
              onChange={(e) => setTestIdea(e.target.value)}
              placeholder="Entrez une idée simple à transformer..."
            />
          </div>
          
          <Button 
            onClick={runTest} 
            disabled={isTestRunning || !testIdea.trim()}
            className="w-full"
          >
            {isTestRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Test en cours...
              </>
            ) : (
              'Lancer le test'
            )}
          </Button>
          
          {testError && (
            <div className="space-y-2">
              <Label className="text-destructive">Erreur détectée :</Label>
              <Textarea
                value={testError}
                readOnly
                className="text-destructive bg-destructive/10"
                rows={3}
              />
            </div>
          )}
          
          {testResult && (
            <div className="space-y-2">
              <Label className="text-success">Résultat du test :</Label>
              <Textarea
                value={testResult}
                readOnly
                className="bg-success/10"
                rows={8}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}