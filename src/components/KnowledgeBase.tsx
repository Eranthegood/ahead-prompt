import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KnowledgeModal } from '@/components/KnowledgeModal';
import { Workspace, KnowledgeItem } from '@/types';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Edit, 
  Trash2,
  Tag,
  Copy
} from 'lucide-react';

interface KnowledgeBaseProps {
  workspace: Workspace;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ workspace }) => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchKnowledgeItems();
  }, [workspace.id]);

  const fetchKnowledgeItems = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKnowledgeItems(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching knowledge base',
        description: error?.message
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteKnowledgeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setKnowledgeItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: 'Knowledge item deleted',
        description: 'Item has been removed from your knowledge base'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting item',
        description: error?.message
      });
    }
  };

  const copyToClipboard = (item: KnowledgeItem) => {
    const content = `${item.title}\n\n${item.content}`;
    navigator.clipboard.writeText(content);
    
    toast({
      title: 'Copied to clipboard',
      description: 'Knowledge content copied for use in prompts'
    });
  };

  // Get all unique tags from knowledge items
  const getAllTags = () => {
    const tagSet = new Set<string>();
    knowledgeItems.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  // Filter items based on search and tags
  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => item.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    fetchKnowledgeItems(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Knowledge Base</h2>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Knowledge
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tag filters */}
        {getAllTags().length > 0 && (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="w-3 h-3" />
              <span>Filter by tags:</span>
            </div>
            {getAllTags().map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="h-auto p-1 text-xs text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Knowledge Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 flex-1">
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(item)}
                      className="h-8 w-8 p-0 text-muted-foreground"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0 text-muted-foreground"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteKnowledgeItem(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {item.content}
                </p>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || selectedTags.length > 0 ? 'No results found' : 'No knowledge items yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedTags.length > 0 
              ? 'Try adjusting your search or filters'
              : 'Start building your knowledge base with reusable content for better prompts'
            }
          </p>
          {(!searchQuery && selectedTags.length === 0) && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Knowledge Item
            </Button>
          )}
        </div>
      )}

      {/* Knowledge Modal */}
      <KnowledgeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onClose={handleModalClose}
        workspace={workspace}
        editingItem={editingItem}
      />
    </div>
  );
};