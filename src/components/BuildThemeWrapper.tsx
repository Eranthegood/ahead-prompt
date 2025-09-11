import { ReactNode } from 'react';
import { useBuildTheme } from '@/hooks/useBuildTheme';

interface BuildThemeWrapperProps {
  children: ReactNode;
}

export const BuildThemeWrapper = ({ children }: BuildThemeWrapperProps) => {
  const { theme } = useBuildTheme();
  
  return (
    <div data-theme={theme} className="min-h-screen">
      {children}
    </div>
  );
};