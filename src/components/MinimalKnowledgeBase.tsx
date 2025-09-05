import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { KnowledgeModal } from "./KnowledgeModal";
import { QuickKnowledgeForm } from "./QuickKnowledgeForm";
import { useKnowledge } from "@/hooks/useKnowledge";
import type { Workspace, KnowledgeItem, Product } from "@/types";

interface MinimalKnowledgeBaseProps {
  workspace: Workspace;
  product?: Product;
}

export function MinimalKnowledgeBase({ workspace, product }: MinimalKnowledgeBaseProps) {
  const { knowledgeItems, loading, deleteKnowledgeItem: deleteItem } = useKnowledge(
    workspace.id, 
    product?.id
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);

  const deleteKnowledgeItem = async (itemId: string) => {
    const success = await deleteItem(itemId);
    if (!success) {
      toast.error("Failed to delete");
    }
  };

  // Filter knowledge items based on search only
  const filteredItems = knowledgeItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Simple header */}
      <div className="flex items-center justify-between">
        <Button onClick={handleCreate} size="sm" className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Simple search */}
      {knowledgeItems.length > 0 && (
        <div className="relative">
          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
      )}

      {/* Simple knowledge items list */}
      {filteredItems.length > 0 ? (
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group">
              <CardHeader className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm truncate">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.content.length > 60
                        ? `${item.content.substring(0, 60)}...`
                        : item.content}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(item)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteKnowledgeItem(item.id)}
                      className="h-6 w-6 p-0 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">No knowledge items</p>
          <QuickKnowledgeForm 
            workspace={workspace}
            product={product}
            onSuccess={() => {
              toast.success("Added!");
            }}
          />
        </div>
      )}

      <KnowledgeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        workspace={workspace}
        product={product}
        editingItem={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
      />
    </div>
  );
}