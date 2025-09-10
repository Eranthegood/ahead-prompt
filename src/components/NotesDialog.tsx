import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  StickyNote,
  Star,
  Filter,
  X
} from 'lucide-react';
import { Note } from '@/types/notes';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { useNotes } from '@/hooks/useNotes';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePromptsContext } from '@/context/PromptsContext';
import { CreateNoteData, UpdateNoteData } from '@/types/notes';

interface NotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProductId?: string;
  selectedEpicId?: string;
}

export function NotesDialog({ 
  open, 
  onOpenChange, 
  selectedProductId, 
  selectedEpicId 
}: NotesDialogProps) {
  const { workspace } = useWorkspace();
  const { products } = useProducts(workspace?.id);
  const { epics } = useEpics(workspace?.id);
  const { createPrompt } = usePromptsContext() || {};
  const { 
    notes, 
    loading, 
    createNote, 
    updateNote, 
    deleteNote, 
    searchNotes, 
    filterNotes 
  } = useNotes(workspace?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [creatingNote, setCreatingNote] = useState(false);

  // Filter and search notes
  const filteredNotes = React.useMemo(() => {
    let result = notes;
    
    // Apply product/epic filter
    if (selectedProductId || selectedEpicId) {
      result = filterNotes(selectedProductId, selectedEpicId);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      result = searchNotes(searchQuery);
    }
    
    // Apply favorites filter
    if (showFavoritesOnly) {
      result = result.filter(note => note.is_favorite);
    }
    
    return result;
  }, [notes, selectedProductId, selectedEpicId, searchQuery, showFavoritesOnly, searchNotes, filterNotes]);

  const handleCreateNote = async (data: CreateNoteData) => {
    const newNote = await createNote(data);
    if (newNote) {
      setCreatingNote(false);
    }
  };

  const handleUpdateNote = async (data: UpdateNoteData) => {
    if (editingNote) {
      const success = await updateNote(editingNote.id, data);
      if (success) {
        setEditingNote(null);
      }
    }
  };

  const handleToggleFavorite = async (note: Note) => {
    await updateNote(note.id, { is_favorite: !note.is_favorite });
  };

  const handleConvertToPrompt = async (note: Note) => {
    if (!createPrompt || !workspace) return;
    
    await createPrompt({
      product_id: note.product_id,
      epic_id: note.epic_id,
      title: note.title,
      description: note.content.replace(/<[^>]*>/g, ''), // Strip HTML
    });
    
    // Close dialog after conversion
    onOpenChange(false);
  };

  const handleDeleteNote = async (note: Note) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note.id);
    }
  };

  if (!workspace) return null;

  // Show editor view
  if (creatingNote || editingNote) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Note' : 'Create Note'}
            </DialogTitle>
          </DialogHeader>
          
          <NoteEditor
            note={editingNote || undefined}
            onSave={editingNote ? handleUpdateNote : handleCreateNote}
            onCancel={() => {
              setCreatingNote(false);
              setEditingNote(null);
            }}
            workspaceId={workspace.id}
            productId={selectedProductId}
            epicId={selectedEpicId}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Notes
              {filteredNotes.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filteredNotes.length}
                </Badge>
              )}
            </DialogTitle>
            
            <Button
              onClick={() => setCreatingNote(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </Button>
          </div>

          {/* Active filters */}
          <div className="flex flex-wrap gap-2">
            {selectedProductId && (
              <Badge variant="outline">
                Product: {products.find(p => p.id === selectedProductId)?.name}
              </Badge>
            )}
            {selectedEpicId && (
              <Badge variant="outline">
                Epic: {epics.find(e => e.id === selectedEpicId)?.name}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="outline">
                Search: "{searchQuery}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-4 py-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading notes...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8">
                <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">
                  {searchQuery || showFavoritesOnly ? 'No notes found' : 'No notes yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || showFavoritesOnly 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first note to capture ideas and thoughts'
                  }
                </p>
                <Button onClick={() => setCreatingNote(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={setEditingNote}
                    onDelete={handleDeleteNote}
                    onToggleFavorite={handleToggleFavorite}
                    onConvertToPrompt={createPrompt ? handleConvertToPrompt : undefined}
                    products={products}
                    epics={epics}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}