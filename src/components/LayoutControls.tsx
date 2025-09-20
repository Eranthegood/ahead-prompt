// Separated layout controls from AppLayout
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LinearPromptCreator } from './LinearPromptCreator';
import { MobilePromptDrawer } from './MobilePromptDrawer';
import { MobilePromptFAB } from './MobilePromptFAB';
import { PromptLibrary } from './PromptLibrary';
import { useAppStore } from '@/store/AppStore';
import { usePromptsContext } from '@/context/PromptsContext';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

interface LayoutControlsProps {
  workspace: any;
  selectedProductId: string;
  selectedEpicId: string | undefined;
}

export function LayoutControls({ workspace, selectedProductId, selectedEpicId }: LayoutControlsProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { state, openDialog, closeDialog } = useAppStore();
  const { preferences } = useUserPreferences();
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const promptsContext = usePromptsContext();

  // Global shortcuts for prompt creation only
  useGlobalShortcuts({
    'cmd+n': () => openDialog('quickPrompt'),
    'ctrl+n': () => openDialog('quickPrompt'),
    'q': () => openDialog('quickPrompt'),
    'll': () => openDialog('promptLibraryCreate'),
  });

  const handleSavePrompt = async (promptData: any) => {
    if (promptsContext?.createPrompt) {
      const result = await promptsContext.createPrompt(promptData);
      closeDialog('quickPrompt');
      return result;
    }
    return null;
  };

  const handleCreateProduct = () => {
    // Instead of navigating, trigger the product creation dialog
    openDialog('productDialog');
  };

  return (
    <>
      <LinearPromptCreator
        isOpen={state.dialogs.quickPrompt && !isMobile}
        onClose={() => closeDialog('quickPrompt')}
        onSave={handleSavePrompt}
        workspace={workspace}
        products={products}
        epics={epics}
        selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        selectedEpicId={selectedEpicId}
        onCreateProduct={handleCreateProduct}
        onCreateEpic={() => navigate('/build?create=epic')}
      />

      <MobilePromptDrawer
        isOpen={state.dialogs.quickPrompt && isMobile}
        onClose={() => closeDialog('quickPrompt')}
        onSave={handleSavePrompt}
        workspace={workspace}
        products={products}
        epics={epics}
        selectedProductId={selectedProductId === 'all' ? undefined : selectedProductId}
        selectedEpicId={selectedEpicId}
      />

      <MobilePromptFAB 
        onOpenPrompt={() => openDialog('quickPrompt')}
        isQuickPromptOpen={state.dialogs.quickPrompt}
      />

      <PromptLibrary 
        open={state.dialogs.promptLibrary}
        onOpenChange={(open) => open ? openDialog('promptLibrary') : closeDialog('promptLibrary')}
        autoFocus={true}
      />
    </>
  );
}