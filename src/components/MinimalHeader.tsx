import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { TitleUpdateDialog } from '@/components/TitleUpdateDialog';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus, LogOut, Wand2 } from 'lucide-react';
import { Workspace } from '@/types';
import { useState } from 'react';

interface MinimalHeaderProps {
  workspace: Workspace;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickAdd: () => void;
  onTitlesUpdated?: () => void;
}

export function MinimalHeader({ workspace, searchQuery, onSearchChange, onQuickAdd, onTitlesUpdated }: MinimalHeaderProps) {
  const { signOut } = useAuth();
  const [titleUpdateOpen, setTitleUpdateOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold text-foreground">{workspace.name}</h1>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-muted/50 border-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setTitleUpdateOpen(true)}
            variant="outline"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Améliorer les titres
          </Button>
          
          <Button onClick={onQuickAdd} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <TitleUpdateDialog
        workspace={workspace}
        open={titleUpdateOpen}
        onOpenChange={setTitleUpdateOpen}
        onComplete={() => {
          onTitlesUpdated?.();
          setTitleUpdateOpen(false);
        }}
      />
    </>
  );
}