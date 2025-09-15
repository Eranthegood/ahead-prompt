import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Github, GitBranch, Loader2, ExternalLink, Code, X, ChevronDown, Send, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useClaudeCodeIntegration } from '@/integrations/claude-code/hooks/useClaudeCodeIntegration';
import type { Prompt, Product, Epic } from '@/types';

interface PromptActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt & {
    product?: Product;
    epic?: Epic;
  };
  actionType: 'send';
  onPromptUpdate?: (promptId: string, updates: Partial<Prompt>) => void;
}

const CURSOR_MODELS = [
  { value: 'claude-4-sonnet', label: 'Claude 4 Sonnet' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
];

const CLAUDE_MODELS = [
  { value: 'claude-sonnet-4-20250514', label: 'Claude 4 Sonnet' },
  { value: 'claude-opus-4-1-20250805', label: 'Claude 4 Opus' }
];

// Sample repositories and branches for dropdowns
const SAMPLE_REPOSITORIES = [
  'https://github.com/user/frontend-app',
  'https://github.com/user/backend-api',
  'https://github.com/user/mobile-app'
];

const SAMPLE_BRANCHES = [
  'main',
  'develop',
  'feature/new-ui',
  'feature/api-integration'
];

export function PromptActionDrawer({ 
  isOpen, 
  onClose, 
  prompt, 
  actionType, 
  onPromptUpdate 
}: PromptActionDrawerProps) {
  const defaultRepository = prompt.product?.github_repo_url || '';
  const defaultBranch = prompt.product?.default_branch || 'main';
  
  const [repository, setRepository] = useState(defaultRepository || SAMPLE_REPOSITORIES[0]);
  const [branch, setBranch] = useState(defaultBranch || 'main');
  const [provider, setProvider] = useState<'cursor' | 'claude'>('cursor');
  const [model, setModel] = useState('claude-4-sonnet');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { sendToClaudeCode } = useClaudeCodeIntegration();

  useEffect(() => {
    if (isOpen) {
      setRepository(defaultRepository || SAMPLE_REPOSITORIES[0]);
      setBranch(defaultBranch || 'main');
    }
  }, [isOpen, defaultRepository, defaultBranch]);

  useEffect(() => {
    const defaultModel = provider === 'cursor' ? 'claude-4-sonnet' : 'claude-sonnet-4-20250514';
    setModel(defaultModel);
  }, [provider]);

  const handleSendToCursor = async () => {
    setIsLoading(true);
    
    try {
      const promptText = prompt.generated_prompt || prompt.description;
      
      if (!promptText) {
        throw new Error('No prompt content available');
      }

      const { data, error } = await supabase.functions.invoke('send-to-cursor', {
        body: {
          prompt: promptText,
          repository,
          ref: branch,
          model
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send to Cursor');
      }

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      if (onPromptUpdate) {
        onPromptUpdate(prompt.id, {
          status: 'sent_to_cursor' as const,
          cursor_agent_id: data.agent?.id,
          cursor_agent_status: data.agent?.status,
          workflow_metadata: {
            repository,
            ref: branch,
            model,
            sentAt: new Date().toISOString()
          }
        });
      }
      
      toast({
        title: 'Sent to Cursor!',
        description: `Agent "${data.agent?.name || 'Cursor Agent'}" is now working on your repository.`,
      });

      onClose();
    } catch (error) {
      console.error('Error sending to Cursor:', error);
      toast({
        title: 'Failed to send to Cursor',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToClaude = async () => {
    setIsLoading(true);
    
    try {
      const promptText = prompt.generated_prompt || prompt.description;
      
      if (!promptText) {
        throw new Error('No prompt content available');
      }

      const config = {
        model: model as 'claude-sonnet-4-20250514' | 'claude-opus-4-1-20250805',
        repository,
        branch,
        createPR: true,
      };

      const sessionId = await sendToClaudeCode(prompt.id, promptText, config);
      
      if (sessionId && onPromptUpdate) {
        onPromptUpdate(prompt.id, {
          status: 'generating' as const,
          workflow_metadata: {
            claudeSessionId: sessionId,
            repository,
            branch,
            model,
            sentAt: new Date().toISOString()
          }
        });
      }
      
      toast({
        title: 'Sent to Claude!',
        description: 'Claude is now working on your repository.',
      });

      onClose();
    } catch (error) {
      console.error('Error sending to Claude:', error);
      toast({
        title: 'Failed to send to Claude',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log('[PromptActionDrawer] Render:', { isOpen, actionType, promptId: prompt.id });
  
  if (!isOpen) {
    console.log('[PromptActionDrawer] Not rendering - isOpen is false');
    return null;
  }

  const models = provider === 'cursor' ? CURSOR_MODELS : CLAUDE_MODELS;
  const IconComponent = provider === 'cursor' ? ExternalLink : Code;
  const actionLabel = provider === 'cursor' ? 'Send to Cursor' : 'Send to Claude';
  const handleAction = provider === 'cursor' ? handleSendToCursor : handleSendToClaude;

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-4 mx-3 mt-2 mb-2 animate-in slide-in-from-top-2 duration-200 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Send Prompt</span>
          {prompt.product?.github_repo_url && (
            <Badge variant="outline" className="text-xs">Auto-configured</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Provider Selection */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          Provider
        </label>
        <Select value={provider} onValueChange={(value: 'cursor' | 'claude') => setProvider(value)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
            <ChevronDown className="h-3 w-3 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cursor" className="text-xs">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3 w-3" />
                Cursor
              </div>
            </SelectItem>
            <SelectItem value="claude" className="text-xs">
              <div className="flex items-center gap-2">
                <Code className="h-3 w-3" />
                Claude
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Repository Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Github className="h-3 w-3" />
            Repository
          </label>
          <Select value={repository} onValueChange={setRepository}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
              <ChevronDown className="h-3 w-3 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              {defaultRepository && (
                <SelectItem value={defaultRepository} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[200px]">{defaultRepository}</span>
                    <Badge variant="outline" className="text-[10px] h-4">Auto</Badge>
                  </div>
                </SelectItem>
              )}
              {SAMPLE_REPOSITORIES.filter(repo => repo !== defaultRepository).map((repo) => (
                <SelectItem key={repo} value={repo} className="text-xs">
                  {repo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Branch Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            Branch
          </label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
              <ChevronDown className="h-3 w-3 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              {defaultBranch && (
                <SelectItem value={defaultBranch} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span>{defaultBranch}</span>
                    <Badge variant="outline" className="text-[10px] h-4">Default</Badge>
                  </div>
                </SelectItem>
              )}
              {SAMPLE_BRANCHES.filter(b => b !== defaultBranch).map((branchName) => (
                <SelectItem key={branchName} value={branchName} className="text-xs">
                  {branchName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Model</label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
            <ChevronDown className="h-3 w-3 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            {models.map((modelOption) => (
              <SelectItem key={modelOption.value} value={modelOption.value} className="text-xs">
                {modelOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-7 text-xs"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAction}
          disabled={isLoading}
          size="sm"
          className="h-7 text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <IconComponent className="h-3 w-3 mr-1" />
              {actionLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}