// Centralized dialog components using AppStore
import React from 'react';
import { useAppStore } from '@/store/AppStore';
import { QuickPromptDialog } from '@/components/QuickPromptDialog';
import { PromptLibrary } from '@/components/PromptLibrary';
import { PromptLibraryCreateDialog } from '@/components/PromptLibraryCreateDialog';
import { QuickEpicDialog } from '@/components/QuickEpicDialog';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import { usePrompts } from '@/hooks/usePrompts';
import { useEpics } from '@/hooks/useEpics';
import { toast } from 'sonner';

export function CentralizedDialogs() {
  const { state, closeDialog, openDialog } = useAppStore();
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const { products } = useProducts(workspace?.id);
  const { createPrompt } = usePrompts(workspace?.id);
  const { createEpic } = useEpics(workspace?.id);

  if (!user || !workspace) return null;

  return (
    <>
      {/* Quick Prompt Dialog */}
      <QuickPromptDialog
        isOpen={state.dialogs.quickPrompt}
        onClose={() => closeDialog('quickPrompt')}
        workspace={workspace}
        onSave={async (promptData) => {
          try {
            const prompt = await createPrompt(promptData);
            if (prompt) {
              toast.success('Prompt créé avec succès !');
              closeDialog('quickPrompt');
            }
          } catch (error) {
            console.error('Error creating prompt:', error);
            toast.error('Erreur lors de la création du prompt');
          }
        }}
      />

      {/* Prompt Library */}
      <PromptLibrary 
        open={state.dialogs.promptLibrary}
        onOpenChange={(open) => !open && closeDialog('promptLibrary')}
      />

      {/* Prompt Library Create Dialog */}
      <PromptLibraryCreateDialog
        open={state.dialogs.promptLibraryCreate}
        onOpenChange={(open) => !open && closeDialog('promptLibraryCreate')}
      />

      {/* Quick Epic Dialog */}
      <QuickEpicDialog
        isOpen={state.dialogs.epicDialog}
        onClose={() => closeDialog('epicDialog')}
        workspace={workspace}
        products={products}
        onSave={async (epicData) => {
          try {
            const epic = await createEpic(epicData);
            if (epic) {
              toast.success('Epic créé avec succès !');
              closeDialog('epicDialog');
            }
          } catch (error) {
            console.error('Error creating epic:', error);
            toast.error('Erreur lors de la création de l\'epic');
          }
        }}
      />
    </>
  );
}