// Simplified AppLayout with separated concerns
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalHeader } from './GlobalHeader';
import { MinimalSidebar } from './MinimalSidebar';
import { PromptsProvider } from '@/context/PromptsContext';

import { PromoBanner } from './PromoBanner';
import { LayoutControls } from './LayoutControls';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useAppStoreOptional } from '@/store/AppStore';
import Dashboard from './Dashboard';

interface SimpleAppLayoutProps {
  children: React.ReactNode;
}

export function SimpleAppLayout({ children }: SimpleAppLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { preferences, updatePreferences } = useUserPreferences();
const appStore = useAppStoreOptional();
  const openDialog = appStore?.openDialog ?? (() => {});
  
  // Product/Epic assignment state - core functionality for prompt association
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedEpicId, setSelectedEpicId] = useState<string | undefined>();

  // Simple page configuration
  const config = {
    showHeader: !location.pathname.startsWith('/join-workspace'),
    showSidebar: ['/build', '/integrations'].some(path => location.pathname.startsWith(path)),
    showSearch: !['/profile', '/shortcuts', '/achievements'].some(path => location.pathname.startsWith(path)),
    sidebarDefaultOpen: location.pathname === '/build'
  };

  const handleToggleCompletedItems = (show: boolean) => {
    updatePreferences({ showCompletedItems: show });
  };

  const handleQuickAdd = () => {
    openDialog('quickPrompt');
  };

  // Global keyboard shortcuts
  useGlobalShortcuts({
    '/l': () => openDialog('promptLibrary'),
  });

  // Global keyboard shortcut handler for quick prompt creation
  useEffect(() => {
    const handler = () => {
      openDialog('quickPrompt');
    };
    // @ts-ignore - custom event name
    window.addEventListener('open-quick-prompt', handler as EventListener);
    return () => {
      // @ts-ignore - custom event name  
      window.removeEventListener('open-quick-prompt', handler as EventListener);
    };
  }, [openDialog]);

  // Loading states
  if (config.showSidebar && (!user || !workspace)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        <PromoBanner />
        
        {config.showSidebar ? (
          <SidebarProvider defaultOpen={config.sidebarDefaultOpen}>
            <PromptsProvider 
              workspaceId={workspace?.id}
              selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
              selectedEpicId={selectedEpicId}
            >
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
                    {React.isValidElement(children) && children.type === Dashboard 
                      ? React.cloneElement(children as React.ReactElement<any>, {
                          selectedProductId: selectedProductId === 'all' ? undefined : selectedProductId,
                          selectedEpicId: selectedEpicId
                        })
                      : children}
                  </main>
                </div>

                <LayoutControls 
                  workspace={workspace}
                  selectedProductId={selectedProductId}
                  selectedEpicId={selectedEpicId}
                />
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
    );
  }