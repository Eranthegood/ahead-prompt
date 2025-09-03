import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, TrendingUp } from 'lucide-react';
import { Workspace } from '@/types';
import { UserDropdownMenu } from './UserDropdownMenu';

interface MinimalHeaderProps {
  workspace: Workspace;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showMetrics?: boolean;
  onToggleMetrics?: () => void;
}

export function MinimalHeader({ 
  workspace, 
  searchQuery, 
  onSearchChange, 
  showMetrics = false, 
  onToggleMetrics 
}: MinimalHeaderProps) {

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-background flex items-center justify-between px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <SidebarTrigger className="lg:hidden shrink-0" />
        <div className="flex-1 max-w-3xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-muted/50 border-none text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <UserDropdownMenu />
      </div>
    </header>
  );
}