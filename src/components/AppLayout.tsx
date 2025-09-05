import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GlobalHeader } from './GlobalHeader';
import { MinimalSidebar } from './MinimalSidebar';
import { QuickPromptDialog } from './QuickPromptDialog';
import Dashboard from './Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { PromptsProvider, usePromptsContext } from '@/context/PromptsContext';
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
  
  // Pages qui n'ont pas besoin du header - now only auth page 
  const noHeaderPages = ['/auth'];
  const shouldShowHeader = !noHeaderPages.includes(location.pathname);
  
  // Pages qui n'ont pas besoin de sidebar (landing page, auth)
  const noSidebarPages = ['/auth'];
  const shouldShowSidebar = user && workspace && !noSidebarPages.includes(location.pathname);
  
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

  // Set up event listener for quick prompt
  useEffect(() => {
    const handler = () => {
      console.log('[AppLayout] open-quick-prompt event received');
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
  shouldShowHeader: boolean;
  shouldShowSearch: boolean;
  shouldShowSidebar: boolean;
  shouldBeCollapsedByDefault: boolean;
  children: React.ReactNode;
}) {
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

  return (
    <SidebarProvider defaultOpen={!shouldBeCollapsedByDefault}>
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
          <main className="flex-1">
            {React.isValidElement(children) && children.type === Dashboard 
              ? React.cloneElement(children as React.ReactElement<any>, {
                  selectedProductId: selectedProductId === 'all' ? undefined : selectedProductId,
                  selectedEpicId: selectedEpicId
                })
              : children
            }
          </main>
        </div>

        <QuickPromptDialog
          isOpen={quickPromptOpen}
          onClose={() => setQuickPromptOpen(false)}
          onSave={handleSavePrompt}
          workspace={workspace}
          products={products}
          epics={epics}
          selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
          selectedEpicId={selectedEpicId}
        />
      </div>
    </SidebarProvider>
  );
}