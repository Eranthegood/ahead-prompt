import React from 'react';
import { cn } from '@/lib/utils';

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function GridContainer({ children, className }: GridContainerProps) {
  return (
    <div className={cn("h-full overflow-auto", className)}>
      <div className="min-h-full">
        {children}
      </div>
    </div>
  );
}