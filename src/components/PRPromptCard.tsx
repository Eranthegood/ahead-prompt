import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GitPullRequest, 
  GitMerge, 
  GitBranch, 
  ExternalLink, 
  User, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Settings,
  Zap,
  Eye
} from 'lucide-react';
import { usePromptPRs, PromptPR } from '@/hooks/usePromptPRs';
import { useIntegrations } from '@/hooks/useIntegrations';
import { formatDistanceToNow } from 'date-fns';
import { getStatusDisplayInfo } from '@/types/cursor';

interface PRPromptCardProps {
  workspaceId: string;
}

export function PRPromptCard({ workspaceId }: PRPromptCardProps) {
  const { integrations } = useIntegrations();
  const { promptsWithPRs, isLoading, error, refreshPrompts, mergePR } = usePromptPRs(workspaceId);
  
  const [selectedPrompt, setSelectedPrompt] = useState<PromptPR | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeMethod, setMergeMethod] = useState<'merge' | 'squash' | 'rebase'>('squash');
  const [commitTitle, setCommitTitle] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  // Get GitHub integration
  const githubIntegration = integrations.find(i => i.id === 'github');
  const isGitHubConfigured = githubIntegration?.isConfigured && githubIntegration?.isEnabled;

  const handleMerge = async () => {
    if (!selectedPrompt) return;

    const success = await mergePR(
      selectedPrompt.id,
      mergeMethod,
      commitTitle || undefined,
      commitMessage || undefined
    );

    if (success) {
      setMergeDialogOpen(false);
      setSelectedPrompt(null);
      setCommitTitle('');
      setCommitMessage('');
    }
  };

  const openMergeDialog = (prompt: PromptPR) => {
    setSelectedPrompt(prompt);
    setCommitTitle(prompt.title);
    setCommitMessage(prompt.description || '');
    setMergeDialogOpen(true);
  };

  const getCursorStatusBadge = (prompt: PromptPR) => {
    if (!prompt.cursor_agent_status) return null;
    
    const statusInfo = getStatusDisplayInfo(prompt.cursor_agent_status as any);
    return (
      <Badge variant="outline" className="text-xs">
        <div className={`w-2 h-2 rounded-full ${statusInfo.color} mr-1`} />
        {statusInfo.label}
      </Badge>
    );
  };

  if (!isGitHubConfigured) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <GitPullRequest className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">GitHub Integration Required</CardTitle>
          <CardDescription>
            Configure GitHub integration to manage pull requests from your build interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => window.open('/integrations', '_blank')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure GitHub
          </Button>
          <div className="mt-3 text-xs text-muted-foreground text-center">
            You'll need a GitHub Personal Access Token with 'repo' permissions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Active Pull Requests</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshPrompts}
              disabled={isLoading}
              title="Refresh pull requests from Cursor prompts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>
          Manage pull requests created by Cursor from your prompts
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading pull requests...</span>
          </div>
        ) : promptsWithPRs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No active pull requests</p>
            <p className="text-sm">Send prompts to Cursor to create PRs</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {promptsWithPRs.map((prompt) => (
                <div key={prompt.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm leading-tight">{prompt.title}</h4>
                        {getCursorStatusBadge(prompt)}
                        {prompt.github_pr_number && (
                          <Badge variant="outline" className="text-xs">
                            PR #{prompt.github_pr_number}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
                        </div>
                        {(prompt.workflow_metadata as any)?.repository && (
                          <div className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {(prompt.workflow_metadata as any).repository}
                          </div>
                        )}
                      </div>
                      {prompt.cursor_branch_name && (
                        <div className="text-xs text-muted-foreground mb-2">
                          Branch: {prompt.cursor_branch_name}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {prompt.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {prompt.github_pr_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={prompt.github_pr_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {prompt.github_pr_url && prompt.cursor_agent_status === 'COMPLETED' && (
                        <Button 
                          size="sm" 
                          onClick={() => openMergeDialog(prompt)}
                        >
                          <GitMerge className="w-4 h-4 mr-1" />
                          Merge
                        </Button>
                      )}
                    </div>
                  </div>
                  {(prompt.workflow_metadata as any)?.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {(prompt.workflow_metadata as any).error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Merge Dialog */}
        <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Merge Pull Request</DialogTitle>
              <DialogDescription>
                {selectedPrompt && `Merge PR #${selectedPrompt.github_pr_number}: ${selectedPrompt.title}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="merge-method">Merge Method</Label>
                <Select value={mergeMethod} onValueChange={(value: 'merge' | 'squash' | 'rebase') => setMergeMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="squash">
                      <div className="flex flex-col">
                        <span>Squash and merge</span>
                        <span className="text-xs text-muted-foreground">Combine all commits into one</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="merge">
                      <div className="flex flex-col">
                        <span>Create a merge commit</span>
                        <span className="text-xs text-muted-foreground">Preserve commit history</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="rebase">
                      <div className="flex flex-col">
                        <span>Rebase and merge</span>
                        <span className="text-xs text-muted-foreground">Replay commits without merge commit</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mergeMethod === 'squash' && (
                <>
                  <div>
                    <Label htmlFor="commit-title">Commit Title</Label>
                    <Input
                      id="commit-title"
                      value={commitTitle}
                      onChange={(e) => setCommitTitle(e.target.value)}
                      placeholder="Enter commit title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commit-message">Commit Message</Label>
                    <Textarea
                      id="commit-message"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Enter commit message"
                      rows={4}
                    />
                  </div>
                </>
              )}

              {mergeMethod === 'merge' && (
                <div>
                  <Label htmlFor="merge-message">Merge Commit Message</Label>
                  <Textarea
                    id="merge-message"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Enter merge commit message"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMerge} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <GitMerge className="w-4 h-4 mr-2" />
                      Merge PR
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}