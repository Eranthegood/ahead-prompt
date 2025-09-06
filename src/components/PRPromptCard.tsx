import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  FileText, 
  Plus, 
  Minus, 
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useGitHubPRs, GitHubPR } from '@/hooks/useGitHubPRs';
import { useIntegrations } from '@/hooks/useIntegrations';
import { formatDistanceToNow } from 'date-fns';

interface PRPromptCardProps {
  workspaceId: string;
}

interface Repository {
  name: string;
  full_name: string;
  owner: string;
}

export function PRPromptCard({ workspaceId }: PRPromptCardProps) {
  const { integrations } = useIntegrations();
  const { prs, isLoading, error, fetchPRs, squashAndMerge, mergeWithMergeCommit, rebaseAndMerge } = useGitHubPRs();
  
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedPR, setSelectedPR] = useState<GitHubPR | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeMethod, setMergeMethod] = useState<'merge' | 'squash' | 'rebase'>('squash');
  const [commitTitle, setCommitTitle] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Get GitHub integration
  const githubIntegration = integrations.find(i => i.id === 'github');
  const isGitHubConfigured = githubIntegration?.isConfigured && githubIntegration?.isEnabled;

  // Extract repositories from GitHub integration metadata
  useEffect(() => {
    if (githubIntegration?.metadata?.repositories) {
      const repos = githubIntegration.metadata.repositories.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        owner: repo.full_name.split('/')[0],
      }));
      setRepositories(repos);
      
      // Auto-select first repository if none selected
      if (repos.length > 0 && !selectedRepo) {
        setSelectedRepo(repos[0]);
      }
    }
  }, [githubIntegration, selectedRepo]);

  // Fetch PRs when repository changes
  useEffect(() => {
    if (selectedRepo && isGitHubConfigured) {
      fetchPRs(selectedRepo.owner, selectedRepo.name).then(() => {
        setLastRefresh(new Date());
      });
    }
  }, [selectedRepo, isGitHubConfigured, fetchPRs]);

  // Auto-refresh PRs every 30 seconds
  useEffect(() => {
    if (!selectedRepo || !isGitHubConfigured) return;

    const interval = setInterval(() => {
      // Only refresh if not currently loading to avoid conflicts
      if (!isLoading) {
        fetchPRs(selectedRepo.owner, selectedRepo.name).then(() => {
          setLastRefresh(new Date());
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedRepo, isGitHubConfigured, fetchPRs, isLoading]);

  const handleMerge = async () => {
    if (!selectedPR || !selectedRepo) return;

    let success = false;
    
    switch (mergeMethod) {
      case 'squash':
        success = await squashAndMerge(
          selectedRepo.owner, 
          selectedRepo.name, 
          selectedPR.number,
          commitTitle || undefined,
          commitMessage || undefined
        );
        break;
      case 'merge':
        success = await mergeWithMergeCommit(
          selectedRepo.owner, 
          selectedRepo.name, 
          selectedPR.number,
          commitMessage || undefined
        );
        break;
      case 'rebase':
        success = await rebaseAndMerge(
          selectedRepo.owner, 
          selectedRepo.name, 
          selectedPR.number
        );
        break;
    }

    if (success) {
      setMergeDialogOpen(false);
      setSelectedPR(null);
      setCommitTitle('');
      setCommitMessage('');
    }
  };

  const openMergeDialog = (pr: GitHubPR) => {
    setSelectedPR(pr);
    setCommitTitle(pr.title);
    setCommitMessage(`${pr.title}\n\n${pr.body || ''}`);
    setMergeDialogOpen(true);
  };

  const getPRStatusColor = (pr: GitHubPR) => {
    if (pr.draft) return 'secondary';
    if (pr.mergeable === false) return 'destructive';
    if (pr.mergeable === true) return 'default';
    return 'secondary'; // mergeable is null (checking)
  };

  const getPRStatusText = (pr: GitHubPR) => {
    if (pr.draft) return 'Draft';
    if (pr.mergeable === false) return 'Conflicts';
    if (pr.mergeable === true) return 'Ready';
    return 'Checking';
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
            <CardTitle className="text-lg">Pull Requests</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {repositories.length > 1 && (
              <Select value={selectedRepo?.full_name || ''} onValueChange={(value) => {
                const repo = repositories.find(r => r.full_name === value);
                setSelectedRepo(repo || null);
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositories.map((repo) => (
                    <SelectItem key={repo.full_name} value={repo.full_name}>
                      {repo.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => selectedRepo && fetchPRs(selectedRepo.owner, selectedRepo.name).then(() => setLastRefresh(new Date()))}
              disabled={isLoading}
              title={lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()}` : 'Refresh pull requests'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardDescription>
          {selectedRepo ? `Manage pull requests for ${selectedRepo.full_name}` : 'Select a repository to view pull requests'}
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
        ) : prs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No open pull requests</p>
            <p className="text-sm">All caught up! 🎉</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {prs.map((pr) => (
                <div key={pr.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm leading-tight">{pr.title}</h4>
                        <Badge variant={getPRStatusColor(pr)} className="text-xs">
                          {getPRStatusText(pr)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {pr.user.login}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Plus className="w-3 h-3 text-green-500" />
                          {pr.additions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Minus className="w-3 h-3 text-red-500" />
                          {pr.deletions}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {pr.changed_files} files
                        </span>
                        <span>#{pr.number}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                      {!pr.draft && pr.mergeable !== false && (
                        <Button 
                          size="sm" 
                          onClick={() => openMergeDialog(pr)}
                          disabled={pr.mergeable === null}
                        >
                          <GitMerge className="w-4 h-4 mr-1" />
                          Merge
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pr.head.ref} → {pr.base.ref}
                  </div>
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
                {selectedPR && `Merge PR #${selectedPR.number}: ${selectedPR.title}`}
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