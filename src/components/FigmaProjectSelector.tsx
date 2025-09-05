import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { figmaService, type FigmaProject } from '@/services/figmaService';
import { Code, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';

interface FigmaProjectSelectorProps {
  workspaceId: string;
  onProjectImported?: (project: FigmaProject) => void;
}

export function FigmaProjectSelector({ workspaceId, onProjectImported }: FigmaProjectSelectorProps) {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [projects, setProjects] = useState<FigmaProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const loadFigmaProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const userProjects = await figmaService.getFigmaProjects();
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading Figma projects:', error);
      toast.error('Failed to load Figma projects');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  React.useEffect(() => {
    loadFigmaProjects();
  }, []);

  const handleImportProject = async () => {
    if (!figmaUrl.trim()) {
      toast.error('Please enter a Figma file URL');
      return;
    }

    if (!figmaService.isValidFigmaUrl(figmaUrl)) {
      toast.error('Please enter a valid Figma file URL');
      return;
    }

    const fileKey = figmaService.extractFileKeyFromUrl(figmaUrl);
    if (!fileKey) {
      toast.error('Could not extract file key from URL');
      return;
    }

    setIsImporting(true);
    try {
      const result = await figmaService.importFigmaFile(fileKey, workspaceId);
      
      if (result.success && result.project) {
        toast.success(`Successfully imported "${result.project.figma_file_name}" with ${result.elementsCount || 0} design elements`);
        setFigmaUrl('');
        setShowImportDialog(false);
        await loadFigmaProjects(); // Reload projects list
        onProjectImported?.(result.project);
      } else {
        toast.error(result.error || 'Failed to import Figma project');
      }
    } catch (error) {
      console.error('Error importing Figma project:', error);
      toast.error('Failed to import Figma project');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const success = await figmaService.deleteFigmaProject(projectId);
    if (success) {
      await loadFigmaProjects();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Figma Projects</h3>
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Import Figma File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Figma Project</DialogTitle>
              <DialogDescription>
                Enter a Figma file URL to import its design elements into your knowledge base.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Figma File URL</label>
                <Input
                  placeholder="https://www.figma.com/file/[file-key]/[file-name]"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Copy the URL from your Figma file and paste it here
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleImportProject} 
                  disabled={isImporting || !figmaUrl.trim()}
                  className="flex-1"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import Project'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowImportDialog(false);
                    setFigmaUrl('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      {isLoadingProjects ? (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No Figma Projects</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Import your first Figma file to get started with design-driven prompt generation.
              </p>
              <Button 
                onClick={() => setShowImportDialog(true)}
                size="sm"
              >
                Import First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:bg-muted/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{project.figma_file_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>File Key: {project.figma_file_key}</span>
                      {project.last_synced_at && (
                        <Badge variant="secondary" className="text-xs">
                          Synced {new Date(project.last_synced_at).toLocaleDateString()}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://www.figma.com/file/${project.figma_file_key}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {project.thumbnail_url && (
                <CardContent className="pt-0">
                  <img 
                    src={project.thumbnail_url} 
                    alt={project.figma_file_name}
                    className="w-full h-32 object-cover rounded-md bg-muted"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}