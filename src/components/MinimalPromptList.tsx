import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, Package, Calendar, User, MoreHorizontal, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { usePrompts } from '@/hooks/usePrompts';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { Workspace } from '@/types';

interface MinimalPromptListProps {
  workspace: Workspace;
  selectedProductId?: string;
  searchQuery: string;
  onQuickAdd: () => void;
}

export function MinimalPromptList({ workspace, selectedProductId, searchQuery, onQuickAdd }: MinimalPromptListProps) {
  const { prompts, loading } = usePrompts(workspace.id);
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);

  // Filter prompts
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProduct = !selectedProductId || selectedProductId === 'all' || 
      prompt.product_id === selectedProductId;

    return matchesSearch && matchesProduct;
  });

  // Get product and epic info for each prompt
  const promptsWithInfo = filteredPrompts.map(prompt => {
    const product = products.find(p => p.id === prompt.product_id);
    const epic = epics.find(e => e.id === prompt.epic_id);
    
    return {
      ...prompt,
      product,
      epic
    };
  });

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (promptsWithInfo.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'No prompts found' : 'No prompts yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? 'Try adjusting your search query'
              : 'Create your first prompt to get started'
            }
          </p>
          {!searchQuery && (
            <Button onClick={onQuickAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Create Prompt
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          {selectedProductId === 'all' || !selectedProductId ? 'All Prompts' : 
           products.find(p => p.id === selectedProductId)?.name || 'Prompts'}
        </h2>
        <p className="text-muted-foreground">
          {promptsWithInfo.length} prompt{promptsWithInfo.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Prompt List */}
      <div className="space-y-3">
        {promptsWithInfo.map((prompt) => (
          <Card key={prompt.id} className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground mb-2 truncate">
                    {prompt.title}
                  </h3>
                  
                  {prompt.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {prompt.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {prompt.product && (
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{prompt.product.name}</span>
                      </div>
                    )}
                    
                    {prompt.epic && (
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span>{prompt.epic.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(prompt.created_at), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Badge 
                    variant={
                      prompt.status === 'done' ? 'default' : 
                      prompt.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {prompt.status === 'in_progress' ? 'In Progress' : 
                     prompt.status === 'done' ? 'Done' : 'Todo'}
                  </Badge>
                  
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}