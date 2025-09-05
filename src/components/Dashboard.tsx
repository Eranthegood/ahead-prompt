import React, { useState, useEffect } from 'react';
import { MinimalPromptList } from '@/components/MinimalPromptList';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import { CommandPalette } from '@/components/CommandPalette';
import { QuickPromptDialog as QPD_Keep } from '@/components/QuickPromptDialog';
import { ProductEpicViews } from '@/components/ProductEpicViews/ProductEpicViews';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DebugConsole } from '@/components/debug/DebugConsole';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePromptsContext } from '@/context/PromptsContext';
import { useEpics } from '@/hooks/useEpics';
import { useProducts } from '@/hooks/useProducts';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { Loader2, MessageSquare, Package } from 'lucide-react';

// Declare Supademo global function
declare global {
  interface Window {
    Supademo: (id: string, options?: { variables?: { email?: string; name?: string; [key: string]: any } }) => void;
  }
}

interface DashboardProps {
  selectedProductId?: string;
  selectedEpicId?: string;
}

// Keep QuickPromptDialog referenced to avoid potential HMR stale reference errors
void QPD_Keep;

const Dashboard = ({ selectedProductId, selectedEpicId }: DashboardProps = {}) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [debugConsoleOpen, setDebugConsoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPromptId, setHoveredPromptId] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  
  // Tab state management
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (selectedProductId || selectedEpicId) return 'products';
    return tabParam === 'products' ? 'products' : 'prompts';
  });

  const {
    workspace,
    loading
  } = useWorkspace();
  const promptsContext = usePromptsContext();
  const {
    prompts = [],
    createPrompt,
    refetch: refetchPrompts
  } = promptsContext || {};

  // Provide safe fallback if createPrompt is not available yet
  const handleCreatePrompt = createPrompt || (async () => {
    console.warn('createPrompt not available yet');
    return null;
  });
  const {
    epics
  } = useEpics(workspace?.id);
  const {
    products
  } = useProducts(workspace?.id);
  const {
    preferences,
    saveCompletedItemsPreference
  } = useUserPreferences();

  // Calculate stats for tab badges
  const promptsCount = prompts?.length || 0;
  const productsCount = products?.length || 0;
  const epicsCount = epics?.length || 0;

  // Initialize Supademo SDK for dynamic elements
  useEffect(() => {
    if (window.Supademo) {
      window.Supademo("f69d8646ce4f145dc4df128f8ef97c60812ddbc21557f45e9b709a11ba7c8e23", {
        variables: {
          email: "", // optional user email
          name: ""   // optional user name
          // add your custom variables here
        }
      });
    }
  }, []);

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
    'cmd+n': () => window.dispatchEvent(new CustomEvent('open-quick-prompt')),
    'ctrl+n': () => window.dispatchEvent(new CustomEvent('open-quick-prompt')),
    'q': () => window.dispatchEvent(new CustomEvent('open-quick-prompt')),
    't': () => setDebugConsoleOpen(true),
    'p': () => setActiveTab('products'),
    'r': () => setActiveTab('prompts'),
    'c': async () => {
      // If hovering over a prompt, copy its generated prompt
      if (hoveredPromptId) {
        const hoveredPrompt = prompts?.find(p => p.id === hoveredPromptId);
        if (hoveredPrompt && (await handleCopyPrompt(hoveredPrompt))) {
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
    }
  });

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTab === 'products') {
      url.searchParams.set('tab', 'products');
    } else {
      url.searchParams.delete('tab');
    }
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);
  const handleToggleCompletedItems = (show: boolean) => {
    saveCompletedItemsPreference(show);
  };
  // Auto-open universal search when typing in header (2+ chars)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length >= 2) {
      setCommandPaletteOpen(true);
    }
  }, [searchQuery]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>;
  }
  if (!workspace) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load workspace</p>
        </div>
      </div>;
  }
  return (
    <>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Metrics Dashboard - conditionally shown */}
        {showMetrics}
        
        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompts
              {promptsCount > 0 && (
                <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {promptsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products & Epics
              {(productsCount > 0 || epicsCount > 0) && (
                <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {productsCount + epicsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompts" className="flex-1 mt-0">
            <MinimalPromptList 
              workspace={workspace} 
              selectedProductId={selectedProductId} 
              selectedEpicId={selectedEpicId} 
              searchQuery={searchQuery} 
              hoveredPromptId={hoveredPromptId} 
              onPromptHover={setHoveredPromptId} 
              onCopy={handleCopyPrompt} 
            />
          </TabsContent>
          
          <TabsContent value="products" className="flex-1 mt-0">
            <ProductEpicViews />
          </TabsContent>
        </Tabs>
      </div>

      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} workspace={workspace} injectedQuery={searchQuery} onSetSearchQuery={setSearchQuery} onNavigate={() => {}} />

      <DebugConsole isOpen={debugConsoleOpen} onClose={() => setDebugConsoleOpen(false)} workspace={workspace} />
    </>
  );
};
export default Dashboard;