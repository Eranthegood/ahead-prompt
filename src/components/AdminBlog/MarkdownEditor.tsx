import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Link, 
  Code, 
  Quote, 
  Upload,
  Eye,
  Edit3
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, className }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = start + before.length + textToInsert.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      toast({
        title: "Format non supporté",
        description: "Seuls les fichiers .md et .txt sont supportés",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      onChange(value + (value ? '\n\n' : '') + text);
      toast({
        title: "Fichier importé",
        description: `Le contenu de ${file.name} a été ajouté`,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Erreur d'import",
        description: "Impossible de lire le fichier",
        variant: "destructive",
      });
    }

    // Reset file input
    event.target.value = '';
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      toast({
        title: "Format non supporté",
        description: "Seuls les fichiers .md et .txt sont supportés",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      onChange(value + (value ? '\n\n' : '') + text);
      toast({
        title: "Fichier importé",
        description: `Le contenu de ${file.name} a été ajouté`,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Erreur d'import",
        description: "Impossible de lire le fichier",
        variant: "destructive",
      });
    }
  };

  const renderMarkdownPreview = (markdown: string) => {
    // Simple markdown preview (basic conversion)
    return markdown
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**', 'texte en gras'), tooltip: 'Gras' },
    { icon: Italic, action: () => insertText('*', '*', 'texte en italique'), tooltip: 'Italique' },
    { icon: Heading1, action: () => insertText('# ', '', 'Titre niveau 1'), tooltip: 'Titre H1' },
    { icon: Heading2, action: () => insertText('## ', '', 'Titre niveau 2'), tooltip: 'Titre H2' },
    { icon: Heading3, action: () => insertText('### ', '', 'Titre niveau 3'), tooltip: 'Titre H3' },
    { icon: List, action: () => insertText('- ', '', 'élément de liste'), tooltip: 'Liste à puces' },
    { icon: ListOrdered, action: () => insertText('1. ', '', 'élément numéroté'), tooltip: 'Liste numérotée' },
    { icon: Link, action: () => insertText('[', '](url)', 'texte du lien'), tooltip: 'Lien' },
    { icon: Code, action: () => insertText('`', '`', 'code'), tooltip: 'Code inline' },
    { icon: Quote, action: () => insertText('> ', '', 'citation'), tooltip: 'Citation' },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Éditeur Markdown
          </CardTitle>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              onChange={handleFileImport}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Édition
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Aperçu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50">
              {toolbarButtons.map((button, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={button.tooltip}
                  className="h-8 w-8 p-0"
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            {/* Editor */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative"
            >
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "Écrivez votre contenu en Markdown...\n\n# Titre\n## Sous-titre\n\nVotre contenu ici..."}
                className="min-h-[400px] font-mono text-sm resize-none"
              />
              <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-md pointer-events-none opacity-0 transition-opacity hover:opacity-100" />
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Glissez-déposez un fichier .md ou .txt pour l'importer
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div 
              className="min-h-[400px] p-4 border rounded-md bg-background prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: value ? renderMarkdownPreview(value) : '<p class="text-muted-foreground">Aucun contenu à prévisualiser</p>' 
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}