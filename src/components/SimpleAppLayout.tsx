// Simplified AppLayout with separated concerns
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalHeader } from './GlobalHeader';
import { MinimalSidebar } from './MinimalSidebar';
import { PromptsProvider } from '@/context/PromptsContext';
import { AppStoreProvider } from '@/store/AppStore';
import { PromoBanner } from './PromoBanner';
import { LayoutControls } from './LayoutControls';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';

interface SimpleAppLayoutProps {
  children: React.ReactNode;
}

export function SimpleAppLayout({ children }: SimpleAppLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { workspace } = useWorkspace();

  // Simple page configuration
  const config = {
    showHeader: !location.pathname.startsWith('/join-workspace'),
    showSidebar: ['/build', '/integrations'].some(path => location.pathname.startsWith(path)),
    showSearch: !['/profile', '/shortcuts', '/achievements'].some(path => location.pathname.startsWith(path)),
    sidebarDefaultOpen: location.pathname === '/build'
  };

  // Loading states
  if (config.showSidebar && (!user || !workspace)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <AppStoreProvider>
      <div className="min-h-screen bg-background">
        <PromoBanner />
        
        {config.showSidebar ? (
          <SidebarProvider defaultOpen={config.sidebarDefaultOpen}>
            <PromptsProvider workspaceId={workspace?.id}>
              <div className="min-h-screen w-full bg-background flex">
                <MinimalSidebar 
                  workspace={workspace}
                  selectedProductId={undefined}
                  selectedEpicId={undefined}
                  onProductSelect={() => {}}
                  onEpicSelect={() => {}}
                  showCompletedItems={true}
                  onToggleCompletedItems={() => {}}
                  onQuickAdd={() => {}}
                  searchQuery=""
                />
                
                <div className="flex-1 flex flex-col min-w-0">
                  {config.showHeader && (
                    <GlobalHeader 
                      showSearch={config.showSearch} 
                      showSidebarTrigger={true} 
                    />
                  )}
                  
                  <main 
                    className="flex-1 pt-16"
                    style={{ backgroundColor: '#191a23' }}
                  >
                    {children}
                  </main>
                </div>

                <LayoutControls workspace={workspace} />
              </div>
            </PromptsProvider>
          </SidebarProvider>
        ) : (
          <>
            {config.showHeader && (
              <GlobalHeader 
                showSearch={config.showSearch} 
                showSidebarTrigger={false} 
              />
            )}
            <main className={config.showHeader ? 'pt-16' : 'min-h-screen pt-16'}>
              {children}
            </main>
          </>
        )}
      </div>
    </AppStoreProvider>
  );
}