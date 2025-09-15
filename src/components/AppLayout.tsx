import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalHeader } from './GlobalHeader';
import { MinimalSidebar } from './MinimalSidebar';
import { LinearPromptCreator } from './LinearPromptCreator';
import { MobilePromptFAB } from './MobilePromptFAB';
import { MobilePromptDrawer } from './MobilePromptDrawer';
import { PromptLibrary } from './PromptLibrary';
import Dashboard from './Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { PromptsProvider, usePromptsContext } from '@/context/PromptsContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { PromoBanner } from './PromoBanner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { preferences, updatePreferences } = useUserPreferences();
  
  // Product/Epic assignment state - core functionality for prompt association
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedEpicId, setSelectedEpicId] = useState<string | undefined>();
  const [quickPromptOpen, setQuickPromptOpen] = useState(false);
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  
  // Pages qui n'ont pas besoin du header - auth and invitation pages 
  const noHeaderPages = ['/auth', '/join-workspace'];
  const shouldShowHeader = !noHeaderPages.some(path => location.pathname.startsWith(path));
  
  // Pages that should show the sidebar
  const allowedSidebarPages = ['/build', '/integrations'];
  const canShowSidebar = allowedSidebarPages.some(path => location.pathname.startsWith(path));
  
  // Determine default collapsed state - collapsed on non-build pages
  const shouldBeCollapsedByDefault = location.pathname !== '/build';
  
  // Pages qui n'ont pas besoin de la barre de recherche
  const noSearchPages = ['/profile', '/shortcuts', '/achievements'];
  const shouldShowSearch = !noSearchPages.some(path => location.pathname.startsWith(path));

  const handleToggleCompletedItems = (show: boolean) => {
    updatePreferences({ showCompletedItems: show });
  };

  const handleQuickAdd = () => {
    setQuickPromptOpen(true);
  };

  // Global keyboard shortcuts
  useGlobalShortcuts({
    '/l': () => setPromptLibraryOpen(true),
  });

  // Global keyboard shortcut handler for quick prompt creation
  useEffect(() => {
    const handler = () => {
      setQuickPromptOpen(true);
    };
    // @ts-ignore - custom event name
    window.addEventListener('open-quick-prompt', handler as EventListener);
    return () => {
      // @ts-ignore - custom event name
      window.removeEventListener('open-quick-prompt', handler as EventListener);
    };
  }, []);

  // Always render the same component structure to prevent remounts
  const shouldShowSidebar = user && workspace && canShowSidebar;
  const isLoading = !user || (canShowSidebar && !workspace);

  // Always use the same layout structure but conditionally render content
  return (
    <div className="min-h-screen bg-background">
      {canShowSidebar ? (
        // Render sidebar layout structure always for sidebar pages
        <SidebarProvider defaultOpen={!shouldBeCollapsedByDefault}>
          <PromoBanner />
          {/* 
            ⚠️ CRITICAL ARCHITECTURE - DO NOT MODIFY ⚠️
            
            This single PromptsProvider MUST wrap the entire sidebar layout to ensure:
            1. MinimalSidebar and SidebarPromptComponents share the same prompts state
            2. When a prompt is created, it appears INSTANTLY in MinimalPromptList
            3. No state synchronization issues between components
            
            NEVER add additional PromptsProvider instances inside this tree!
            NEVER move this provider to a more nested position!
            
            If you need to access prompt state elsewhere, use usePromptsContext()
          */}
          <PromptsProvider 
            workspaceId={workspace?.id}
            selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
            selectedEpicId={selectedEpicId}
          >
            <div className="min-h-screen w-full bg-background flex">
              {isLoading ? (
                // Loading state with consistent structure
                <div className="w-64 border-r border-border bg-sidebar flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : shouldShowSidebar ? (
                <MinimalSidebar 
                  workspace={workspace}
                  selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
                  selectedEpicId={selectedEpicId}
                  onProductSelect={setSelectedProductId}
                  onEpicSelect={setSelectedEpicId}
                  showCompletedItems={preferences.showCompletedItems}
                  onToggleCompletedItems={handleToggleCompletedItems}
                  onQuickAdd={() => setQuickPromptOpen(true)}
                  searchQuery=""
                />
              ) : null}
              
              <div className="flex-1 flex flex-col min-w-0">
                {shouldShowHeader && <GlobalHeader showSearch={shouldShowSearch} showSidebarTrigger={shouldShowSidebar} />}
                <main 
                  className="flex-1" 
                  style={{ backgroundColor: '#191a23' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : shouldShowSidebar ? (
                    React.isValidElement(children) && children.type === Dashboard 
                      ? React.cloneElement(children as React.ReactElement<any>, {
                          selectedProductId: selectedProductId === 'all' ? undefined : selectedProductId,
                          selectedEpicId: selectedEpicId
                        })
                      : children
                  ) : children}
                </main>
              </div>

              {!isLoading && shouldShowSidebar && (
                <SidebarPromptComponents
                  workspace={workspace}
                  selectedProductId={selectedProductId}
                  selectedEpicId={selectedEpicId}
                  quickPromptOpen={quickPromptOpen}
                  setQuickPromptOpen={setQuickPromptOpen}
                />
              )}
            </div>
          </PromptsProvider>
        </SidebarProvider>
      ) : (
        // Non-sidebar pages
        <>
          <PromoBanner />
          {shouldShowHeader && <GlobalHeader showSearch={shouldShowSearch} showSidebarTrigger={false} />}
          <main className={shouldShowHeader ? '' : 'min-h-screen'}>
            {children}
          </main>
        </>
      )}
      
      <PromptLibrary 
        open={promptLibraryOpen}
        onOpenChange={setPromptLibraryOpen}
        autoFocus={true}
      />
    </div>
  );
}

/**
 * ⚠️ CRITICAL COMPONENT - Handles prompt creation within shared PromptsProvider context
 * 
 * This component MUST be rendered inside the PromptsProvider tree to ensure:
 * - usePromptsContext() returns the same state as MinimalSidebar
 * - Prompt creation updates are immediately visible in the sidebar
 * 
 * DO NOT move this component outside the PromptsProvider wrapper!
 */
function SidebarPromptComponents({ 
  workspace,
  selectedProductId,
  selectedEpicId,
  quickPromptOpen,
  setQuickPromptOpen,
}: {
  workspace: any;
  selectedProductId: string;
  selectedEpicId: string | undefined;
  quickPromptOpen: boolean;
  setQuickPromptOpen: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  
  // ⚠️ CRITICAL: This hook MUST return the same context as MinimalSidebar
  const promptsContext = usePromptsContext();

  const handleSavePrompt = async (promptData: any) => {
    if (promptsContext?.createPrompt) {
      const result = await promptsContext.createPrompt(promptData);
      setQuickPromptOpen(false);
      return result;
    }
    return null;
  };

  return (
    <>
      <LinearPromptCreator
        isOpen={quickPromptOpen && !isMobile}
        onClose={() => setQuickPromptOpen(false)}
        onSave={handleSavePrompt}
        workspace={workspace}
        products={products}
        epics={epics}
        selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        selectedEpicId={selectedEpicId}
        onCreateProduct={() => navigate('/build?create=product')}
        onCreateEpic={() => navigate('/build?create=epic')}
      />

      <MobilePromptDrawer
        isOpen={quickPromptOpen && isMobile}
        onClose={() => setQuickPromptOpen(false)}
        onSave={handleSavePrompt}
        workspace={workspace}
        products={products}
        epics={epics}
        selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        selectedEpicId={selectedEpicId}
      />

      <MobilePromptFAB 
        onOpenPrompt={() => setQuickPromptOpen(true)}
        isQuickPromptOpen={quickPromptOpen}
      />
    </>
  );
}