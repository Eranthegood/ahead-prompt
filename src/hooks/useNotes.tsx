import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Note, CreateNoteData, UpdateNoteData } from '@/types/notes';

export function useNotes(workspaceId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch notes
  useEffect(() => {
    if (!workspaceId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch notes',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [workspaceId, toast]);

  // Create note
  const createNote = async (noteData: CreateNoteData): Promise<Note | null> => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(noteData)
        .select()
        .single();

      if (error) throw error;

      const newNote = data as Note;
      setNotes(prev => [newNote, ...prev]);
      
      toast({
        title: 'Note created',
        description: 'Your note has been created successfully',
      });

      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update note
  const updateNote = async (noteId: string, updates: UpdateNoteData): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      const updatedNote = data as Note;
      setNotes(prev => prev.map(note => 
        note.id === noteId ? updatedNote : note
      ));

      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to update note',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete note
  const deleteNote = async (noteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      toast({
        title: 'Note deleted',
        description: 'Your note has been deleted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Search notes
  const searchNotes = (query: string): Note[] => {
    if (!query.trim()) return notes;
    
    const searchTerm = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  };

  // Filter notes by product/epic
  const filterNotes = (productId?: string, epicId?: string): Note[] => {
    return notes.filter(note => {
      if (productId && note.product_id !== productId) return false;
      if (epicId && note.epic_id !== epicId) return false;
      return true;
    });
  };

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    filterNotes,
  };
}