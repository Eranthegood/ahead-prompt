import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MinimalSidebar } from '@/components/MinimalSidebar';
import { MinimalHeader } from '@/components/MinimalHeader';
import { MinimalPromptList } from '@/components/MinimalPromptList';
import { CommandPalette } from '@/components/CommandPalette';
import { QuickPromptDialog } from '@/components/QuickPromptDialog';
import { PromptSidePanel } from '@/components/PromptSidePanel';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePrompts } from '@/hooks/usePrompts';
import { useEpics } from '@/hooks/useEpics';
import { useProducts } from '@/hooks/useProducts';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { Loader2 } from 'lucide-react';
import type { Prompt } from '@/types';

type EnrichedPrompt = Prompt & {
  epic?: { id: string; name: string; color: string };
  product?: { id: string; name: string };
};

const Dashboard = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickPromptOpen, setQuickPromptOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<EnrichedPrompt | null>(null);
  const [isPromptPanelOpen, setIsPromptPanelOpen] = useState(false);
  
  const { workspace, loading } = useWorkspace();
  const { createPrompt } = usePrompts(workspace?.id);
  const { epics } = useEpics(workspace?.id, selectedProductId === 'all' ? undefined : selectedProductId);
  const { products } = useProducts(workspace?.id);

  // Set up global shortcuts
  useGlobalShortcuts({
    'cmd+k': () => setCommandPaletteOpen(true),
    'ctrl+k': () => setCommandPaletteOpen(true),
    'cmd+n': () => setQuickPromptOpen(true),
    'ctrl+n': () => setQuickPromptOpen(true),
    'q': () => setQuickPromptOpen(true),
  });

  const handleQuickAdd = () => {
    setQuickPromptOpen(true);
  };

  const handleCreatePrompt = async (promptData: any) => {
    const newPrompt = await createPrompt(promptData);
    // Enrich with epic and product info before opening side panel
    const epic = epics?.find(e => e.id === newPrompt.epic_id);
    const product = products?.find(p => p.id === newPrompt.product_id);
    
    const enrichedPrompt = {
      ...newPrompt,
      epic: epic ? { id: epic.id, name: epic.name, color: epic.color } : undefined,
      product: product ? { id: product.id, name: product.name } : undefined,
    };
    
    setSelectedPrompt(enrichedPrompt);
    setIsPromptPanelOpen(true);
    return newPrompt;
  };

  const handlePromptSelect = (prompt: Prompt) => {
    // Enrich prompt with epic and product info
    const epic = epics?.find(e => e.id === prompt.epic_id);
    const product = products?.find(p => p.id === prompt.product_id);
    
    const enrichedPrompt = {
      ...prompt,
      epic: epic ? { id: epic.id, name: epic.name, color: epic.color } : undefined,
      product: product ? { id: product.id, name: product.name } : undefined,
    };
    
    setSelectedPrompt(enrichedPrompt);
    setIsPromptPanelOpen(true);
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
        />
        
        <div className="flex-1 flex flex-col">
          <MinimalHeader 
            workspace={workspace}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onQuickAdd={handleQuickAdd}
          />
          
          <MinimalPromptList 
            workspace={workspace}
            selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
            searchQuery={searchQuery}
            onQuickAdd={handleQuickAdd}
            onPromptSelect={handlePromptSelect}
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
          selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        />

        <PromptSidePanel
          isOpen={isPromptPanelOpen}
          onClose={() => setIsPromptPanelOpen(false)}
          prompt={selectedPrompt}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;