import React from 'react';
import { Workspace } from '@/types';
import { UserDropdownMenu } from './UserDropdownMenu';

interface MinimalHeaderProps {
  workspace: Workspace;
}

export function MinimalHeader({ workspace }: MinimalHeaderProps) {

  return (
    <>
      <div className="flex-1"></div>
    </>
  );
}