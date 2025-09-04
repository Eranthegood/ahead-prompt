import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Workspace } from '@/types';
import { UserDropdownMenu } from './UserDropdownMenu';

interface MinimalHeaderProps {
  workspace: Workspace;
}

export function MinimalHeader({ workspace }: MinimalHeaderProps) {

  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
      <SidebarTrigger className="lg:hidden shrink-0" />
      <div className="flex-1"></div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <UserDropdownMenu />
      </div>
    </div>
  );
}