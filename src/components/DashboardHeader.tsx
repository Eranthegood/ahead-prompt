import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Workspace } from '@/types';
import { Zap, LogOut, Command } from 'lucide-react';

interface DashboardHeaderProps {
  workspace: Workspace;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ workspace }) => {
  const { signOut, user } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-glow rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{workspace.name}</h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          <Command className="w-3 h-3" />
          <span>K</span>
          <span>to search</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{user?.email}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={signOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};