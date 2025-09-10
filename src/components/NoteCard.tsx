import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  StarOff, 
  Edit, 
  Trash2, 
  Copy,
  FileText,
  Calendar,
  Hash
} from 'lucide-react';
import { Note } from '@/types/notes';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { copyText } from '@/lib/clipboard';
import { useToast } from '@/hooks/use-toast';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onToggleFavorite: (note: Note) => void;
  onConvertToPrompt?: (note: Note) => void;
  className?: string;
  products?: Array<{ id: string; name: string }>;
  epics?: Array<{ id: string; name: string; product_id?: string }>;
}

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
  onConvertToPrompt,
  className,
  products = [],
  epics = []
}: NoteCardProps) {
  const { toast } = useToast();

  const product = products.find(p => p.id === note.product_id);
  const epic = epics.find(e => e.id === note.epic_id);

  const handleCopy = async () => {
    const content = `${note.title}\n\n${note.content}`.trim();
    try {
      const success = await copyText(content);
      if (success) {
        toast({
          title: 'Copied to clipboard',
          description: 'Note content has been copied',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Strip HTML tags for preview
  const getTextPreview = (html: string, maxLength: number = 200) => {
    const textContent = html.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  };

  return (
    <Card className={cn("group hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
              {note.title}
            </h3>
            
            {/* Context badges */}
            <div className="flex flex-wrap gap-1 mt-2">
              {product && (
                <Badge variant="outline" className="text-xs">
                  {product.name}
                </Badge>
              )}
              {epic && (
                <Badge variant="secondary" className="text-xs">
                  {epic.name}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(note)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {note.is_favorite ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Content preview */}
        {note.content && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {getTextPreview(note.content)}
          </p>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            {onConvertToPrompt && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConvertToPrompt(note)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Convert to prompt"
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(note)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note)}
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}