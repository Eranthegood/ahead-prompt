import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalHeader } from './GlobalHeader';
import { MinimalSidebar } from './MinimalSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { PromptsProvider } from '@/context/PromptsContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { preferences, updatePreferences } = useUserPreferences();
  
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedEpicId, setSelectedEpicId] = useState<string | undefined>();
  const [quickPromptOpen, setQuickPromptOpen] = useState(false);
  
  // Pages qui n'ont pas besoin du header (landing page, auth)
  const noHeaderPages = ['/auth'];
  const shouldShowHeader = !noHeaderPages.includes(location.pathname);
  
  // Pages qui n'ont pas besoin de sidebar (landing page, auth)
  const noSidebarPages = ['/auth'];
  const shouldShowSidebar = user && workspace && !noSidebarPages.includes(location.pathname);
  
  // Pages qui n'ont pas besoin de la barre de recherche
  const noSearchPages = ['/settings', '/profile', '/shortcuts', '/achievements'];
  const shouldShowSearch = !noSearchPages.some(path => location.pathname.startsWith(path));

  const handleToggleCompletedItems = (show: boolean) => {
    updatePreferences({ showCompletedItems: show });
  };

  const handleQuickAdd = () => {
    setQuickPromptOpen(true);
  };

  if (shouldShowSidebar) {
    return (
      <PromptsProvider workspaceId={workspace.id}>
        <SidebarProvider>
          <div className="min-h-screen w-full bg-background flex">
            <MinimalSidebar 
              workspace={workspace}
              selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
              selectedEpicId={selectedEpicId}
              onProductSelect={setSelectedProductId}
              onEpicSelect={setSelectedEpicId}
              showCompletedItems={preferences.showCompletedItems}
              onToggleCompletedItems={handleToggleCompletedItems}
              onQuickAdd={handleQuickAdd}
              searchQuery=""
            />
            
            <div className="flex-1 flex flex-col min-w-0">
              {shouldShowHeader && <GlobalHeader showSearch={shouldShowSearch} showSidebarTrigger />}
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </PromptsProvider>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {shouldShowHeader && <GlobalHeader showSearch={shouldShowSearch} />}
      <main className={shouldShowHeader ? '' : 'min-h-screen'}>
        {children}
      </main>
    </div>
  );
}