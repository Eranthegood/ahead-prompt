import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeItem } from "@/types";
import { toast } from "sonner";

export interface CreateKnowledgeData {
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  product_id?: string;
}

export interface UpdateKnowledgeData extends Partial<CreateKnowledgeData> {
  id: string;
}

export const KNOWLEDGE_CATEGORIES = {
  general: { label: "General", icon: "📝", description: "General knowledge and notes" },
  technical: { label: "Technical Stack", icon: "🔧", description: "Technologies, frameworks, and technical details" },
  design: { label: "Design Guidelines", icon: "🎨", description: "Design system, UI/UX guidelines, and Figma assets" },
  business: { label: "Business Context", icon: "📊", description: "Business objectives, KPIs, and requirements" },
  api: { label: "API Documentation", icon: "📚", description: "API endpoints, schemas, and integration guides" },
  practices: { label: "Best Practices", icon: "✅", description: "Standards, conventions, and best practices" }
} as const;

export type KnowledgeCategory = keyof typeof KNOWLEDGE_CATEGORIES;

export function useKnowledge(workspaceId: string, productId?: string) {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKnowledgeItems = async () => {
    if (!workspaceId) return;
    
    try {
      let query = supabase
        .from("knowledge_items")
        .select("*")
        .eq("workspace_id", workspaceId);

      if (productId) {
        // For product-specific view, get both product-specific items and general workspace items
        query = query.or(`product_id.eq.${productId},product_id.is.null`);
      } else {
        // For workspace view, only get items without product_id
        query = query.is("product_id", null);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching knowledge items:", error);
        toast.error("Failed to load knowledge items");
        return;
      }

      setKnowledgeItems(data || []);
    } catch (error) {
      console.error("Error fetching knowledge items:", error);
      toast.error("Failed to load knowledge items");
    } finally {
      setLoading(false);
    }
  };

  const createKnowledgeItem = async (itemData: CreateKnowledgeData) => {
    try {
      const { data, error } = await supabase
        .from("knowledge_items")
        .insert([{
          ...itemData,
          workspace_id: workspaceId,
          tags: itemData.tags || [],
          category: itemData.category || 'general',
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating knowledge item:", error);
        toast.error("Failed to create knowledge item");
        return null;
      }

      setKnowledgeItems(prev => [data, ...prev]);
      toast.success("Knowledge item created successfully");
      return data;
    } catch (error) {
      console.error("Error creating knowledge item:", error);
      toast.error("Failed to create knowledge item");
      return null;
    }
  };

  const updateKnowledgeItem = async (itemData: UpdateKnowledgeData) => {
    try {
      const { id, ...updateData } = itemData;
      const { data, error } = await supabase
        .from("knowledge_items")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating knowledge item:", error);
        toast.error("Failed to update knowledge item");
        return null;
      }

      setKnowledgeItems(prev => prev.map(item => 
        item.id === id ? data : item
      ));
      toast.success("Knowledge item updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating knowledge item:", error);
      toast.error("Failed to update knowledge item");
      return null;
    }
  };

  const deleteKnowledgeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("knowledge_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Error deleting knowledge item:", error);
        toast.error("Failed to delete knowledge item");
        return false;
      }

      setKnowledgeItems(prev => prev.filter(item => item.id !== itemId));
      toast.success("Knowledge item deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting knowledge item:", error);
      toast.error("Failed to delete knowledge item");
      return false;
    }
  };

  useEffect(() => {
    fetchKnowledgeItems();

    // Set up real-time subscription with optimized updates
    const channel = supabase
      .channel("knowledge_items_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "knowledge_items",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          // Helper to check if item should be visible in current view
          const shouldShowItem = (item: any) => {
            if (!item) return false;
            
            if (productId) {
              // For product-specific view: show product items + general workspace items
              return item.product_id === productId || item.product_id === null;
            } else {
              // For workspace view: only show items without product_id
              return item.product_id === null;
            }
          };
          
          switch (eventType) {
            case 'INSERT':
              if (shouldShowItem(newRecord)) {
                setKnowledgeItems(prev => {
                  // Prevent duplicates in case of race conditions
                  const exists = prev.some(item => item.id === newRecord.id);
                  if (exists) return prev;
                  return [newRecord as KnowledgeItem, ...prev];
                });
              }
              break;
              
            case 'UPDATE':
              if (shouldShowItem(newRecord)) {
                setKnowledgeItems(prev => 
                  prev.map(item => 
                    item.id === newRecord.id ? newRecord as KnowledgeItem : item
                  )
                );
              } else {
                // Item no longer matches view criteria, remove it
                setKnowledgeItems(prev => prev.filter(item => item.id !== newRecord.id));
              }
              break;
              
            case 'DELETE':
              if (oldRecord) {
                setKnowledgeItems(prev => prev.filter(item => item.id !== oldRecord.id));
              }
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, productId]);

  return {
    knowledgeItems,
    loading,
    createKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    refetch: fetchKnowledgeItems,
  };
}