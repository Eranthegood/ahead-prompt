import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Github, Settings, AlertCircle, CheckCircle, Loader2, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClaudeCodeIntegration } from '@/integrations/claude-code/hooks/useClaudeCodeIntegration';
import { CLAUDE_MODELS } from '@/integrations/claude-code/types/claude-types';
import type { Prompt, Product, Epic } from '@/types';

interface ClaudeConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt & {
    product?: Product;
    epic?: Epic;
  };
  onPromptUpdate?: (promptId: string, updates: Partial<Prompt>) => void;
}

export function ClaudeConfigDialog({ isOpen, onClose, prompt, onPromptUpdate }: ClaudeConfigDialogProps) {
  // Auto-populate from mapping data
  const defaultRepository = prompt.product?.github_repo_url || '';
  const defaultBranch = prompt.product?.default_branch || 'main';
  const suggestedBranchName = prompt.epic?.git_branch_name || '';
  const createPrDefault = prompt.epic?.auto_create_pr ?? true;
  
  const [repository, setRepository] = useState(defaultRepository);
  const [branch, setBranch] = useState(defaultBranch);
  const [workingDirectories, setWorkingDirectories] = useState<string[]>([]);
  const [createPR, setCreatePR] = useState(createPrDefault);
  const [model, setModel] = useState<'claude-sonnet-4-20250514' | 'claude-opus-4-1-20250805'>('claude-sonnet-4-20250514');
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { sendToClaudeCode, isExecuting } = useClaudeCodeIntegration();

  // Update form fields when prompt changes
  React.useEffect(() => {
    setRepository(defaultRepository);
    setBranch(defaultBranch);
    setCreatePR(createPrDefault);
    setCommitMessage(suggestedBranchName ? `feat: ${prompt.title}` : '');
  }, [defaultRepository, defaultBranch, createPrDefault, suggestedBranchName, prompt.title]);

  const validateRepository = (url: string): boolean => {
    const githubRepoRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    return githubRepoRegex.test(url);
  };

  const handleSendToClaude = async () => {
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

    try {
      // Get the generated prompt or use the description
      const promptText = prompt.generated_prompt || prompt.description;
      
      if (!promptText) {
        throw new Error('No prompt content available');
      }

      const config = {
        model,
        repository: cleanRepo,
        branch: branch || 'main',
        workingDirectories: workingDirectories.length > 0 ? workingDirectories : undefined,
        createPR,
        commitMessage: commitMessage || undefined,
      };

      // Send to Claude Code
      const newSessionId = await sendToClaudeCode(prompt.id, promptText, config);
      
      if (newSessionId) {
        setSessionId(newSessionId);
        
        // Update the prompt status to reflect Claude workflow
        if (onPromptUpdate) {
          onPromptUpdate(prompt.id, {
            status: 'generating' as const,
            workflow_metadata: {
              claudeSessionId: newSessionId,
              repository: cleanRepo,
              branch: branch || 'main',
              model,
              createPR,
              sentAt: new Date().toISOString()
            }
          });
        }
        
        toast({
          title: 'Claude session started!',
          description: 'Claude is now working on your repository.',
          variant: 'default'
        });
      }

    } catch (error) {
      console.error('Error sending to Claude:', error);
      toast({
        title: 'Failed to create Claude session',
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
    setBranch(defaultBranch);
    setWorkingDirectories([]);
    setCreatePR(createPrDefault);
    setModel('claude-sonnet-4-20250514');
    setCommitMessage('');
    setSessionId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Send to Claude Code
          </DialogTitle>
          <DialogDescription>
            Configure settings to send this prompt to Claude Code for autonomous development.
          </DialogDescription>
        </DialogHeader>

        {!sessionId ? (
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
                    Branch
                    {defaultBranch !== 'main' && <Badge variant="outline" className="text-xs">Auto-filled</Badge>}
                  </label>
                  <Input
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Commit message
                  </label>
                  <Input
                    placeholder="feat: implement feature"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Claude Model
              </label>
              <Select value={model} onValueChange={(value: 'claude-sonnet-4-20250514' | 'claude-opus-4-1-20250805') => setModel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLAUDE_MODELS.map((modelOption) => (
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
                  <label className="text-sm font-medium">Create Pull Request</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create a PR when Claude completes the task
                  </p>
                </div>
                <Switch
                  checked={createPR}
                  onCheckedChange={setCreatePR}
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
                <h3 className="font-medium text-green-800 dark:text-green-200">Claude Session Started!</h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Claude is now working on your repository.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Session ID</label>
                  <p className="font-mono bg-muted px-2 py-1 rounded text-xs">{sessionId}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Status</label>
                  <Badge variant="secondary">Running</Badge>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Repository</label>
                  <p className="text-xs truncate">{repository}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Branch</label>
                  <p className="text-xs">{branch}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons - always visible at bottom */}
        {!sessionId && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendToClaude}
              disabled={!repository.trim() || !validateRepository(repository.trim().replace(/\/$/, '')) || isLoading || isExecuting}
            >
              {isLoading || isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting Claude...
                </>
              ) : (
                <>
                  <Code className="h-4 w-4 mr-2" />
                  Send to Claude
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}