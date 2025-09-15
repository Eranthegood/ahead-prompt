import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Github, Settings, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Prompt, Product, Epic } from '@/types';

interface CursorConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt & {
    product?: Product;
    epic?: Epic;
  };
  onPromptUpdate?: (promptId: string, updates: Partial<Prompt>) => void;
}

interface CursorAgentResponse {
  id: string;
  name: string;
  status: string;
  repository: string;
  branch?: string;
  url: string;
  createdAt: string;
}

const CURSOR_MODELS = [
  { value: 'claude-4-sonnet', label: 'Claude 4 Sonnet' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
];

export function CursorConfigDialog({ isOpen, onClose, prompt, onPromptUpdate }: CursorConfigDialogProps) {
  // Auto-populate from mapping data
  const defaultRepository = prompt.product?.github_repo_url || '';
  const defaultBranch = prompt.product?.default_branch || 'main';
  const suggestedBranchName = prompt.epic?.git_branch_name || '';
  const autoCreatePrDefault = prompt.epic?.auto_create_pr ?? true;
  
  const [repository, setRepository] = useState(defaultRepository);
  const [ref, setRef] = useState(defaultBranch);
  const [branchName, setBranchName] = useState(suggestedBranchName);
  const [autoCreatePr, setAutoCreatePr] = useState(autoCreatePrDefault);
  const [model, setModel] = useState('claude-4-sonnet');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CursorAgentResponse | null>(null);
  
  const { toast } = useToast();

  // Update form fields when prompt changes
  React.useEffect(() => {
    setRepository(defaultRepository);
    setRef(defaultBranch);
    setBranchName(suggestedBranchName);
    setAutoCreatePr(autoCreatePrDefault);
  }, [defaultRepository, defaultBranch, suggestedBranchName, autoCreatePrDefault]);

  const validateRepository = (url: string): boolean => {
    const githubRepoRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    return githubRepoRegex.test(url);
  };

  const handleSendToCursor = async () => {
    if (!repository.trim()) {
      toast({
        title: 'Repository required',
        description: 'Please enter a GitHub repository URL.',
        variant: 'destructive'
      });
      return;
    }

    const cleanRepo = repository.trim().replace(/\/$/, '');
    if (!validateRepository(cleanRepo)) {
      toast({
        title: 'Invalid repository URL',
        description: 'Please enter a valid GitHub repository URL (https://github.com/user/repo).',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Check if Cursor is configured first
      const { data: integrationCheck, error: checkError } = await supabase.functions.invoke('validate-cursor-token', {
        body: { test: true }
      });

      if (checkError || !integrationCheck?.isValid) {
        throw new Error('Cursor integration not configured. Please configure Cursor first in Settings > Integrations.');
      }

      // Get the generated prompt or use the description
      const promptText = prompt.generated_prompt || prompt.description;
      
      if (!promptText) {
        throw new Error('No prompt content available');
      }

      // Call the send-to-cursor Edge Function
      const { data, error } = await supabase.functions.invoke('send-to-cursor', {
        body: {
          prompt: promptText,
          repository: cleanRepo,
          ref: ref || 'main',
          branchName: branchName || undefined,
          autoCreatePr,
          model
        }
      });

      if (error) {
        console.error('Cursor API error:', error);
        throw new Error(error.message || 'Failed to send to Cursor');
      }

      if (data.error) {
        // Check if it's a Cursor billing/trial limit error
        if (data.details && data.details.includes('Free trial usage limit reached')) {
          toast({
            title: 'Cursor Trial Limit Reached',
            description: 'Your Cursor free trial has reached its usage limit. Please upgrade to Cursor Pro to continue using background agents.',
            variant: 'destructive'
          });
          return;
        }
        throw new Error(data.details || data.error);
      }

      // Success! Update the prompt status to reflect Cursor workflow
      setResult(data.agent);
      
      // Update the prompt in the database with Cursor workflow data
      if (onPromptUpdate) {
        onPromptUpdate(prompt.id, {
          status: 'sent_to_cursor' as const,
          cursor_agent_id: data.agent.id,
          cursor_agent_status: data.agent.status,
          cursor_branch_name: data.agent.branch || branchName,
          workflow_metadata: {
            repository: cleanRepo,
            ref: ref || 'main',
            model,
            autoCreatePr,
            sentAt: new Date().toISOString()
          }
        });
      }
      
      toast({
        title: 'Agent created successfully!',
        description: `Cursor agent "${data.agent.name}" is now working on your repository.`,
        variant: 'default'
      });

    } catch (error) {
      console.error('Error sending to Cursor:', error);
      toast({
        title: 'Failed to create Cursor agent',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset to default values from mapping
    setRepository(defaultRepository);
    setRef(defaultBranch);
    setBranchName(suggestedBranchName);
    setAutoCreatePr(autoCreatePrDefault);
    setModel('claude-4-sonnet');
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Send to Cursor
          </DialogTitle>
          <DialogDescription>
            Configure settings to send this prompt to Cursor Background Agents for autonomous code generation.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Prompt Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt to send</label>
              <div className="p-3 rounded-md bg-muted/50 border text-sm max-h-32 overflow-y-auto">
                {prompt.generated_prompt ? (
                  <div>
                    <Badge variant="outline" className="mb-2">Generated</Badge>
                    <div dangerouslySetInnerHTML={{ __html: prompt.generated_prompt }} />
                  </div>
                ) : (
                  <div>
                    <Badge variant="secondary" className="mb-2">Original</Badge>
                    <div dangerouslySetInnerHTML={{ __html: prompt.description || 'No content' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Auto-populated info banner */}
            {defaultRepository && (
              <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Auto-configured from your repository mapping</span>
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Product: {prompt.product?.name} {prompt.epic && `• Epic: ${prompt.epic.name}`}
                </div>
              </div>
            )}

            {/* Repository Configuration */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Repository *
                  {defaultRepository && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                </label>
                <Input
                  placeholder="https://github.com/user/repo"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  className={!repository || validateRepository(repository.trim().replace(/\/$/, '')) ? '' : 'border-destructive'}
                />
                {repository && !validateRepository(repository.trim().replace(/\/$/, '')) && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    Invalid GitHub repository URL
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Base branch
                    {defaultBranch !== 'main' && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                  </label>
                  <Input
                    placeholder="main"
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    New branch name
                    {suggestedBranchName && <Badge variant="outline" className="text-xs">From epic</Badge>}
                  </label>
                  <Input
                    placeholder="cursor/feature-xyz (optional)"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                AI Model
              </label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURSOR_MODELS.map((modelOption) => (
                    <SelectItem key={modelOption.value} value={modelOption.value}>
                      {modelOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Auto-create Pull Request</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create a PR when the agent completes the task
                  </p>
                </div>
                <Switch
                  checked={autoCreatePr}
                  onCheckedChange={setAutoCreatePr}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Success Result */
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            <div className="flex items-center gap-3 p-4 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-200">Agent Created Successfully!</h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Your Cursor Background Agent is now working on the repository.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Agent ID</label>
                  <p className="font-mono bg-muted px-2 py-1 rounded text-xs">{result.id}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Status</label>
                  <Badge variant="secondary">{result.status}</Badge>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Repository</label>
                  <p className="text-xs truncate">{result.repository}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Branch</label>
                  <p className="text-xs">{result.branch || 'Auto-generated'}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button asChild className="flex-1">
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View in Cursor
                  </a>
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons - always visible at bottom */}
        {!result && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendToCursor}
              disabled={!repository.trim() || !validateRepository(repository.trim().replace(/\/$/, '')) || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Agent...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Send to Cursor
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}