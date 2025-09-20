import { supabase } from "@/integrations/supabase/client";

export const syncOutrankArticles = async () => {
  try {
    console.log('Déclenchement de la synchronisation des articles Outrank...');
    
    const { data, error } = await supabase.functions.invoke('sync-outrank-articles', {
      body: {}
    });

    if (error) {
      console.error('Erreur lors de la synchronisation:', error);
      throw error;
    }

    console.log('Synchronisation réussie:', data);
    return data;
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    throw error;
  }
};