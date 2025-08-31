import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus, LogOut } from 'lucide-react';
import { Workspace } from '@/types';

interface MinimalHeaderProps {
  workspace: Workspace;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickAdd: () => void;
}

export function MinimalHeader({ workspace, searchQuery, onSearchChange, onQuickAdd }: MinimalHeaderProps) {
  const { signOut } = useAuth();

  return (
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
  );
}