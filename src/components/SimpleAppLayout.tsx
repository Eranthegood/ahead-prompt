// Simplified AppLayout with separated concerns
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalHeader } from './GlobalHeader';
import { MinimalSidebar } from './MinimalSidebar';
import { PromptsProvider } from '@/context/PromptsContext';
import { KnowledgeBoxModal } from './KnowledgeBoxModal';
import { NotesDialog } from './NotesDialog';
import { OnboardingModal } from './OnboardingModal';

import { LayoutControls } from './LayoutControls';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useAppStoreOptional } from '@/store/AppStore';
import Dashboard from './Dashboard';
import { OnboardingDebug } from './debug/OnboardingDebug';

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
  
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedEpicId, setSelectedEpicId] = useState<string | undefined>();
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('workspace');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('ahead-onboarding-completed');
    console.log('[Onboarding Debug]', {
      hasSeenOnboarding,
      user: !!user,
      pathname: location.pathname,
      shouldShow: !hasSeenOnboarding && user
    });
    
    if (!hasSeenOnboarding && user) {
      console.log('[Onboarding] Showing onboarding for new user');
      setShowOnboarding(true);
    }
  }, [user, location.pathname]);

  // Manual onboarding trigger (for debugging/testing)
  useEffect(() => {
    const handleForceOnboarding = () => {
      console.log('[Onboarding] Manually triggered');
      setShowOnboarding(true);
    };
    
    // Global shortcut Ctrl+Shift+O to force onboarding
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        handleForceOnboarding();
      }
    };
    
    window.addEventListener('force-onboarding', handleForceOnboarding as EventListener);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('force-onboarding', handleForceOnboarding as EventListener);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    'l': () => openDialog('promptLibrary'), // Simple 'L' shortcut
    'k': () => setIsKnowledgeModalOpen(true),
    'n': () => setIsNotesOpen(true),
  });

  const handleOnboardingComplete = (data?: { productId?: string; promptId?: string }) => {
    console.log('[Onboarding] Completed by user', data);
    localStorage.setItem('ahead-onboarding-completed', 'true');
    setShowOnboarding(false);
    
    // Si un produit a été créé, le sélectionner automatiquement
    if (data?.productId) {
      setSelectedProductId(data.productId);
      // Réinitialiser la sélection d'epic pour voir tous les prompts du produit
      setSelectedEpicId(undefined);
    }
  };

  // Development helper: expose reset function globally
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).resetOnboarding = () => {
        console.log('[Onboarding] Reset via window.resetOnboarding()');
        localStorage.removeItem('ahead-onboarding-completed');
        setShowOnboarding(true);
      };
      
      (window as any).forceOnboarding = () => {
        console.log('[Onboarding] Forced via window.forceOnboarding()');
        setShowOnboarding(true);
      };
    }
  }, []);

  // Listen for knowledge dialog events
  useEffect(() => {
    const handleOpenKnowledge = (event?: CustomEvent) => {
      setIsKnowledgeModalOpen(true);
      // If event has productId, set the active section to that product
      if (event?.detail?.productId) {
        setActiveSection(event.detail.productId);
      } else {
        // Default to workspace section
        setActiveSection('workspace');
      }
    };
    
    window.addEventListener('open-knowledge-dialog', handleOpenKnowledge as EventListener);
    return () => window.removeEventListener('open-knowledge-dialog', handleOpenKnowledge as EventListener);
  }, []);

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

      {/* Knowledge Box Modal */}
      <KnowledgeBoxModal
        open={isKnowledgeModalOpen}
        onOpenChange={setIsKnowledgeModalOpen}
        defaultSection={activeSection}
      />

      {/* Notes Dialog */}
      <NotesDialog
        open={isNotesOpen}
        onOpenChange={setIsNotesOpen}
        selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        selectedEpicId={selectedEpicId}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {/* Debug utilities for development */}
      <OnboardingDebug />
    </div>
  );
}