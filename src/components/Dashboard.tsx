import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MinimalSidebar } from '@/components/MinimalSidebar';
import { MinimalHeader } from '@/components/MinimalHeader';
import { MinimalPromptList } from '@/components/MinimalPromptList';
import { CommandPalette } from '@/components/CommandPalette';
import { QuickPromptDialog } from '@/components/QuickPromptDialog';
import { DebugConsole } from '@/components/debug/DebugConsole';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePromptsContext } from '@/context/PromptsContext';
import { useEpics } from '@/hooks/useEpics';
import { useProducts } from '@/hooks/useProducts';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickPromptOpen, setQuickPromptOpen] = useState(false);
  const [debugConsoleOpen, setDebugConsoleOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedEpicId, setSelectedEpicId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPromptId, setHoveredPromptId] = useState<string | null>(null);
  
  const { workspace, loading } = useWorkspace();
  const promptsContext = usePromptsContext();
  const { prompts = [], createPrompt, refetch: refetchPrompts } = promptsContext || {};
  
  // Provide fallback function if createPrompt is not available
  const handleCreatePrompt = createPrompt || (async () => {
    console.warn('createPrompt not available yet');
  });
  const { epics } = useEpics(workspace?.id, selectedProductId === 'all' ? undefined : selectedProductId);
  const { products } = useProducts(workspace?.id);
  const { preferences, saveCompletedItemsPreference } = useUserPreferences();

  // Function to copy generated prompt
  const handleCopyPrompt = async (prompt: any) => {
    try {
      // If prompt exists, use its generated prompt
      if (prompt.generated_prompt) {
        await navigator.clipboard.writeText(prompt.generated_prompt);
        
        // Using a simple console log instead of toast to avoid dependency issues
        console.log('Prompt copied via keyboard shortcut');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error copying prompt:', error);
      return false;
    }
  };

  // Set up global shortcuts
  useGlobalShortcuts({
    'cmd+k': () => setCommandPaletteOpen(true),
    'ctrl+k': () => setCommandPaletteOpen(true),
    'cmd+n': () => setQuickPromptOpen(true),
    'ctrl+n': () => setQuickPromptOpen(true),
    'q': () => setQuickPromptOpen(true),
    't': () => setDebugConsoleOpen(true),
    'c': async () => {
      // If hovering over a prompt, copy its generated prompt
      if (hoveredPromptId) {
        const hoveredPrompt = prompts?.find(p => p.id === hoveredPromptId);
        if (hoveredPrompt && await handleCopyPrompt(hoveredPrompt)) {
          // Success feedback handled by MinimalPromptList
          return;
        }
      }
      
      // Otherwise copy the first prompt's generated prompt
      if (prompts && prompts.length > 0) {
        const firstPrompt = prompts[0];
        if (await handleCopyPrompt(firstPrompt)) {
          // Success feedback handled by MinimalPromptList
          return;
        }
      }
    },
  });

  const handleToggleCompletedItems = (show: boolean) => {
    saveCompletedItemsPreference(show);
  };

  const handleQuickAdd = () => {
    setQuickPromptOpen(true);
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
        {/* Global Sidebar Trigger - Always Visible */}
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <SidebarTrigger className="bg-background shadow-md border" />
        </div>
        
        <MinimalSidebar
          workspace={workspace}
          selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
          selectedEpicId={selectedEpicId}
          onProductSelect={setSelectedProductId}
          onEpicSelect={setSelectedEpicId}
          showCompletedItems={preferences.showCompletedItems}
          onToggleCompletedItems={handleToggleCompletedItems}
          onQuickAdd={handleQuickAdd}
          searchQuery={searchQuery}
        />
        
        <div className="flex-1 flex flex-col">
          <MinimalHeader 
            workspace={workspace}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <MinimalPromptList 
            workspace={workspace}
            selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
            selectedEpicId={selectedEpicId}
            searchQuery={searchQuery}
            hoveredPromptId={hoveredPromptId}
            onPromptHover={setHoveredPromptId}
            onCopy={handleCopyPrompt}
            showCompletedItems={preferences.showCompletedItems}
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
          onSave={handleCreatePrompt}
          workspace={workspace}
          epics={epics}
          products={products}
          selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
          selectedEpicId={selectedEpicId}
        />

        <DebugConsole
          isOpen={debugConsoleOpen}
          onClose={() => setDebugConsoleOpen(false)}
          workspace={workspace}
        />
      </div>
      </SidebarProvider>
  );
};

export default Dashboard;