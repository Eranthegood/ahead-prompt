import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { syncOutrankArticles } from "@/utils/syncOutrankArticles";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export const OutrankSyncButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncOutrankArticles();
      toast.success(`Synchronisation réussie! ${result.processed_articles} articles traités.`);
      
      // Refresh the page to show new articles
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la synchronisation des articles');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSync} 
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Synchronisation...' : 'Synchroniser Outrank'}
    </Button>
  );
};