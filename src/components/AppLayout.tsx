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
  
  // Pages qui n'ont pas besoin du header - now only auth page 
  const noHeaderPages = ['/auth'];
  const shouldShowHeader = !noHeaderPages.includes(location.pathname);
  
  // Pages that should show the sidebar
  const allowedSidebarPages = ['/build', '/settings', '/integrations'];
  const shouldShowSidebar = user && workspace && allowedSidebarPages.some(path => location.pathname.startsWith(path));
  
  // Determine default collapsed state - collapsed on non-build pages
  const shouldBeCollapsedByDefault = location.pathname !== '/build';
  
  // Pages qui n'ont pas besoin de la barre de recherche
  const noSearchPages = ['/settings', '/profile', '/shortcuts', '/achievements'];
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

  if (shouldShowSidebar) {
    return (
      <PromptsProvider 
        workspaceId={workspace.id}
        selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        selectedEpicId={selectedEpicId}
      >
        <SidebarWithContent 
          workspace={workspace}
          selectedProductId={selectedProductId}
          selectedEpicId={selectedEpicId}
          setSelectedProductId={setSelectedProductId}
          setSelectedEpicId={setSelectedEpicId}
          preferences={preferences}
          handleToggleCompletedItems={handleToggleCompletedItems}
          quickPromptOpen={quickPromptOpen}
          setQuickPromptOpen={setQuickPromptOpen}
          promptLibraryOpen={promptLibraryOpen}
          setPromptLibraryOpen={setPromptLibraryOpen}
          shouldShowHeader={shouldShowHeader}
          shouldShowSearch={shouldShowSearch}
          shouldShowSidebar={shouldShowSidebar}
          shouldBeCollapsedByDefault={shouldBeCollapsedByDefault}
          children={children}
        />
      </PromptsProvider>
    );
  }

  // For non-sidebar pages, still use the same structure but without sidebar
  return (
    <div className="min-h-screen bg-background">
      {shouldShowHeader && <GlobalHeader showSearch={shouldShowSearch} showSidebarTrigger={shouldShowSidebar} />}
      <main className={shouldShowHeader ? '' : 'min-h-screen'}>
        {children}
      </main>
      
      <PromptLibrary 
        open={promptLibraryOpen}
        onOpenChange={setPromptLibraryOpen}
        autoFocus={true}
      />
    </div>
  );
}

function SidebarWithContent({ 
  workspace,
  selectedProductId,
  selectedEpicId,
  setSelectedProductId,
  setSelectedEpicId,
  preferences,
  handleToggleCompletedItems,
  quickPromptOpen,
  setQuickPromptOpen,
  promptLibraryOpen,
  setPromptLibraryOpen,
  shouldShowHeader,
  shouldShowSearch,
  shouldShowSidebar,
  shouldBeCollapsedByDefault,
  children
}: {
  workspace: any;
  selectedProductId: string;
  selectedEpicId: string | undefined;
  setSelectedProductId: (id: string) => void;
  setSelectedEpicId: (id: string | undefined) => void;
  preferences: any;
  handleToggleCompletedItems: (show: boolean) => void;
  quickPromptOpen: boolean;
  setQuickPromptOpen: (open: boolean) => void;
  promptLibraryOpen: boolean;
  setPromptLibraryOpen: (open: boolean) => void;
  shouldShowHeader: boolean;
  shouldShowSearch: boolean;
  shouldShowSidebar: boolean;
  shouldBeCollapsedByDefault: boolean;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const promptsContext = usePromptsContext();

  const handleSavePrompt = async (promptData: any) => {
    if (promptsContext?.createPrompt) {
      const result = await promptsContext.createPrompt(promptData);
      setQuickPromptOpen(false);
      return result;
    }
    return null;
  };

  // Force sidebar to be open on /build page
  const shouldForceOpen = location.pathname === '/build';

  return (
    <SidebarProvider defaultOpen={shouldForceOpen || !shouldBeCollapsedByDefault}>
      <div className="min-h-screen w-full bg-background flex">
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
        
        <div className="flex-1 flex flex-col min-w-0">
          {shouldShowHeader && <GlobalHeader showSearch={shouldShowSearch} showSidebarTrigger={shouldShowSidebar} />}
          <main 
            className="flex-1" 
            style={{ backgroundColor: '#191a23' }}
          >
            {React.isValidElement(children) && children.type === Dashboard 
              ? React.cloneElement(children as React.ReactElement<any>, {
                  selectedProductId: selectedProductId === 'all' ? undefined : selectedProductId,
                  selectedEpicId: selectedEpicId
                })
              : children
            }
          </main>
        </div>

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
        
        <PromptLibrary 
          open={promptLibraryOpen}
          onOpenChange={setPromptLibraryOpen}
          autoFocus={true}
        />
      </div>
    </SidebarProvider>
  );
}