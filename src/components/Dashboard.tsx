import React, { useState, useEffect } from 'react';
import { MinimalPromptList } from '@/components/MinimalPromptList';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import { EnhancedCommandPalette } from '@/components/EnhancedCommandPalette';
import { QuickPromptDialog as QPD_Keep } from '@/components/QuickPromptDialog';
import { UsageOverviewDashboard } from '@/components/UsageOverviewDashboard';

import { DebugConsole } from '@/components/debug/DebugConsole';
import { PromptLibrary } from '@/components/PromptLibrary';
import { PromptLibraryCreateDialog } from '@/components/PromptLibraryCreateDialog';
import { NotesDialog } from '@/components/NotesDialog';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePromptsContext } from '@/context/PromptsContext';
import { useEpics } from '@/hooks/useEpics';
import { useProducts } from '@/hooks/useProducts';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { useAppStore } from '@/store/AppStore';
import { Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { copyText } from '@/lib/clipboard';

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
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPromptId, setHoveredPromptId] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { openDialog, state } = useAppStore();
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
        const ok = await copyText(prompt.generated_prompt);
        if (!ok) throw new Error('Clipboard copy failed');

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
    'cmd+n': () => openDialog('quickPrompt'),
    'ctrl+n': () => openDialog('quickPrompt'),
    'q': () => openDialog('quickPrompt'),
    't': () => setDebugConsoleOpen(true),
    'l': () => openDialog('promptLibrary'),
    'll': () => openDialog('promptLibraryCreate'),
    'n': () => setNotesDialogOpen(true),
    'j': () => {
      setCreatingNote(true);
      setNotesDialogOpen(true);
    },
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
  
  // Sync with app store state for library dialogs
  const promptLibraryOpen = state.dialogs.promptLibrary;
  const promptLibraryCreateOpen = state.dialogs.promptLibraryCreate;
  
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
        
        {/* Usage Overview - show at top, but not on /build route */}
        {location.pathname !== '/build' && <UsageOverviewDashboard />}
        
        {/* Metrics Dashboard - conditionally shown */}
        {showMetrics && <MetricsDashboard />}
        
        
        <MinimalPromptList
          workspace={workspace} 
          selectedProductId={selectedProductId} 
          selectedEpicId={selectedEpicId} 
          searchQuery={searchQuery} 
          hoveredPromptId={hoveredPromptId} 
          onPromptHover={setHoveredPromptId} 
          onCopy={handleCopyPrompt} 
        />
      </div>

      <EnhancedCommandPalette 
        open={commandPaletteOpen} 
        onOpenChange={setCommandPaletteOpen} 
        injectedQuery={searchQuery} 
        onSetSearchQuery={setSearchQuery} 
        onNavigate={(path: string) => navigate(path)} 
      />

      <DebugConsole isOpen={debugConsoleOpen} onClose={() => setDebugConsoleOpen(false)} workspace={workspace} />
      
      <PromptLibrary
        open={promptLibraryOpen}
        onOpenChange={(open) => open ? openDialog('promptLibrary') : openDialog('promptLibrary')}
      />
      
      <PromptLibraryCreateDialog
        open={promptLibraryCreateOpen}
        onOpenChange={(open) => open ? openDialog('promptLibraryCreate') : openDialog('promptLibraryCreate')}
      />
      
      <NotesDialog
        open={notesDialogOpen}
        onOpenChange={(open) => {
          setNotesDialogOpen(open);
          if (!open) setCreatingNote(false);
        }}
        selectedProductId={selectedProductId}
        selectedEpicId={selectedEpicId}
      />
    </>
  );
};
export default Dashboard;