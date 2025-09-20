import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export const OutrankSyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      console.log('Déclenchement de la synchronisation des articles Outrank...');
      
      const { data, error } = await supabase.functions.invoke('sync-outrank-articles', {
        body: {}
      });

      console.log('Réponse de la fonction:', { data, error });

      if (error) {
        console.error('Erreur lors de la synchronisation:', error);
        toast.error(`Erreur: ${error.message}`);
        throw error;
      }

      console.log('Synchronisation réussie:', data);
      toast.success(`Synchronisation réussie! ${data?.processed_articles || 0} articles traités.`);
      
      // Refresh the page to show new articles
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erreur complète:', error);
      toast.error(`Erreur lors de la synchronisation: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleSync} 
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Synchronisation...' : 'Synchroniser Outrank'}
      </Button>
      
      <p className="text-sm text-muted-foreground">
        Cliquez pour récupérer et publier les articles Outrank disponibles.
      </p>
    </div>
  );
};