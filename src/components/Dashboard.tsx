import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MinimalSidebar } from '@/components/MinimalSidebar';
import { MinimalHeader } from '@/components/MinimalHeader';
import { MinimalPromptList } from '@/components/MinimalPromptList';
import { CommandPalette } from '@/components/CommandPalette';
import { QuickPromptDialog } from '@/components/QuickPromptDialog';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePrompts } from '@/hooks/usePrompts';
import { useEpics } from '@/hooks/useEpics';
import { useProducts } from '@/hooks/useProducts';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickPromptOpen, setQuickPromptOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { workspace, loading } = useWorkspace();
  const { createPrompt, refetch: refetchPrompts } = usePrompts(workspace?.id);
  const { epics } = useEpics(workspace?.id, selectedProductId === 'all' ? undefined : selectedProductId);
  const { products } = useProducts(workspace?.id);
  const { preferences, saveCompletedItemsPreference } = useUserPreferences();

  // Set up global shortcuts
  useGlobalShortcuts({
    'cmd+k': () => setCommandPaletteOpen(true),
    'ctrl+k': () => setCommandPaletteOpen(true),
    'cmd+n': () => setQuickPromptOpen(true),
    'ctrl+n': () => setQuickPromptOpen(true),
    'q': () => setQuickPromptOpen(true),
  });

  const handleToggleCompletedItems = (show: boolean) => {
    saveCompletedItemsPreference(show);
  };

  const handleQuickAdd = () => {
    setQuickPromptOpen(true);
  };

  const handleTitlesUpdated = () => {
    refetchPrompts?.();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load workspace</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex">
        <MinimalSidebar 
          workspace={workspace}
          selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
          onProductSelect={setSelectedProductId}
          showCompletedItems={preferences.showCompletedItems}
          onToggleCompletedItems={handleToggleCompletedItems}
        />
        
        <div className="flex-1 flex flex-col">
          <MinimalHeader 
            workspace={workspace}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onQuickAdd={handleQuickAdd}
            onTitlesUpdated={handleTitlesUpdated}
          />
          
          <MinimalPromptList 
            workspace={workspace}
            selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
            searchQuery={searchQuery}
            onQuickAdd={handleQuickAdd}
          />
        </div>

        <CommandPalette 
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          workspace={workspace}
          onNavigate={() => {}} // No longer needed with simplified interface
        />

        <QuickPromptDialog
          isOpen={quickPromptOpen}
          onClose={() => setQuickPromptOpen(false)}
          onSave={createPrompt}
          workspace={workspace}
          epics={epics}
          products={products}
          selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;