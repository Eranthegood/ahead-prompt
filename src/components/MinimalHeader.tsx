import React from 'react';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search } from 'lucide-react';
import { Workspace } from '@/types';
import { UserDropdownMenu } from './UserDropdownMenu';

interface MinimalHeaderProps {
  workspace: Workspace;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MinimalHeader({ workspace, searchQuery, onSearchChange }: MinimalHeaderProps) {

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <div className="flex-1 max-w-md">
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
      </div>

      <div className="flex items-center gap-3">
        <UserDropdownMenu />
      </div>
    </header>
  );
}