import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EpicSidebar } from '@/components/EpicSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { CommandPalette } from '@/components/CommandPalette';
import { QuickPromptDialog } from '@/components/QuickPromptDialog';
import { ProductSelector } from '@/components/ProductSelector';
import { ProductManagement } from '@/components/ProductManagement';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePrompts } from '@/hooks/usePrompts';
import { useProducts } from '@/hooks/useProducts';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Hash, BookOpen, Package, Settings } from 'lucide-react';

const Dashboard = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickPromptOpen, setQuickPromptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [epics, setEpics] = useState([]);
  const { workspace, loading } = useWorkspace();
  const { createPrompt } = usePrompts(workspace?.id);
  const { products } = useProducts(workspace?.id);

  // Fetch epics based on selected product
  useEffect(() => {
    const fetchEpics = async () => {
      if (!workspace?.id) return;
      
      try {
        let query = supabase
          .from('epics')
          .select('id, name, color, product_id')
          .eq('workspace_id', workspace.id);
        
        // Filter by product if specific product is selected
        if (selectedProductId !== 'all') {
          query = query.eq('product_id', selectedProductId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setEpics(data || []);
      } catch (error) {
        console.error('Error fetching epics:', error);
      }
    };

    fetchEpics();
  }, [workspace?.id, selectedProductId]);

  // Set up global shortcuts
  useGlobalShortcuts({
    'cmd+k': () => setCommandPaletteOpen(true),
    'ctrl+k': () => setCommandPaletteOpen(true),
    'q': () => setQuickPromptOpen(true), // Quick prompt creation
  });

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
      <div className="min-h-screen w-full bg-background">
        <DashboardHeader workspace={workspace} />
        
        <div className="flex w-full">
          <EpicSidebar 
            workspace={workspace} 
            selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
            onProductSelect={setSelectedProductId}
          />
          
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Product Navigation */}
              <div className="flex items-center justify-between">
                <ProductSelector
                  workspace={workspace}
                  selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
                  onProductChange={(productId) => setSelectedProductId(productId)}
                  showAllOption={true}
                />
                <div className="text-sm text-muted-foreground">
                  Architecture: Workspace / Produit / Epic / Prompt
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-lg grid-cols-4">
                  <TabsTrigger value="board" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Prompts
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Knowledge
                  </TabsTrigger>
                  <TabsTrigger value="products" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Produits
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Config
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="board">
                  <KanbanBoard 
                    workspace={workspace} 
                    selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
                  />
                </TabsContent>

                <TabsContent value="knowledge">
                  <KnowledgeBase workspace={workspace} />
                </TabsContent>

                <TabsContent value="products">
                  <ProductManagement workspace={workspace} />
                </TabsContent>

                <TabsContent value="settings">
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Configuration</h3>
                    <p className="text-muted-foreground">
                      Paramètres et configuration du workspace (à venir)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>

        <CommandPalette 
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          workspace={workspace}
          onNavigate={(tab) => setActiveTab(tab)}
        />

        <QuickPromptDialog
          isOpen={quickPromptOpen}
          onClose={() => setQuickPromptOpen(false)}
          onSave={createPrompt}
          workspace={workspace}
          epics={epics}
          selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;