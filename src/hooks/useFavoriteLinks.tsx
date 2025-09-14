import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface FavoriteLink {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useFavoriteLinks = () => {
  const [links, setLinks] = useState<FavoriteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user's favorite links
  const fetchLinks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorite_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching favorite links:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les liens favoris",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new favorite link
  const createLink = async (linkData: Omit<FavoriteLink, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('favorite_links')
        .insert({
          ...linkData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setLinks(prev => [data, ...prev]);
      toast({
        title: "Succès",
        description: "Lien favori ajouté",
      });

      return data;
    } catch (error) {
      console.error('Error creating favorite link:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le lien favori",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update a favorite link
  const updateLink = async (id: string, updates: Partial<Pick<FavoriteLink, 'title' | 'url' | 'description'>>) => {
    try {
      const { data, error } = await supabase
        .from('favorite_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLinks(prev => prev.map(link => link.id === id ? data : link));
      toast({
        title: "Succès",
        description: "Lien favori mis à jour",
      });

      return data;
    } catch (error) {
      console.error('Error updating favorite link:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le lien favori",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete a favorite link
  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLinks(prev => prev.filter(link => link.id !== id));
      toast({
        title: "Succès",
        description: "Lien favori supprimé",
      });
    } catch (error) {
      console.error('Error deleting favorite link:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien favori",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [user]);

  return {
    links,
    loading,
    createLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks,
  };
};