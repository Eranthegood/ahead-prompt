import React from 'react';
import { useLocation } from 'react-router-dom';
import { GlobalHeader } from './GlobalHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  // Pages qui n'ont pas besoin du header (landing page, auth)
  const noHeaderPages = ['/auth'];
  const shouldShowHeader = !noHeaderPages.includes(location.pathname);
  
  // Pages qui n'ont pas besoin de la barre de recherche
  const noSearchPages = ['/settings', '/profile', '/shortcuts', '/achievements'];
  const shouldShowSearch = !noSearchPages.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-background">
      {shouldShowHeader && <GlobalHeader showSearch={shouldShowSearch} />}
      <main className={shouldShowHeader ? '' : 'min-h-screen'}>
        {children}
      </main>
    </div>
  );
}