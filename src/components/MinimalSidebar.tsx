import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useEpics } from '@/hooks/useEpics';
import { usePrompts } from '@/hooks/usePrompts';
import { Hash, Package, Plus, FileText } from 'lucide-react';
import { Workspace } from '@/types';

interface MinimalSidebarProps {
  workspace: Workspace;
  selectedProductId?: string;
  onProductSelect: (productId: string) => void;
}

export function MinimalSidebar({ workspace, selectedProductId, onProductSelect }: MinimalSidebarProps) {
  const { products } = useProducts(workspace.id);
  const { epics } = useEpics(workspace.id);
  const { prompts } = usePrompts(workspace.id);

  // Simple organization
  const productsWithCounts = products.map(product => {
    const productEpics = epics.filter(epic => epic.product_id === product.id);
    const productPrompts = prompts.filter(prompt => prompt.product_id === product.id);
    
    return {
      ...product,
      epicCount: productEpics.length,
      promptCount: productPrompts.length
    };
  });

  return (
    <Sidebar className="w-64 border-r border-border">
      <SidebarContent className="p-4">
        {/* Workspace Name */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-foreground">{workspace.name}</h2>
          <p className="text-sm text-muted-foreground">Workspace</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left font-normal"
            onClick={() => onProductSelect('all')}
          >
            <FileText className="mr-3 h-4 w-4" />
            All Prompts
            <Badge variant="secondary" className="ml-auto">
              {prompts.length}
            </Badge>
          </Button>
        </div>

        {/* Products */}
        <SidebarGroup>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Products</h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {productsWithCounts.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No products yet</p>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Product
                  </Button>
                </div>
              ) : (
                productsWithCounts.map((product) => (
                  <SidebarMenuItem key={product.id}>
                    <SidebarMenuButton 
                      className="w-full justify-between"
                      onClick={() => onProductSelect(product.id)}
                      isActive={selectedProductId === product.id}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: product.color || '#6B7280' }}
                        />
                        <Package className="h-4 w-4" />
                        <span className="truncate">{product.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.promptCount}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Epics */}
        {epics.length > 0 && (
          <SidebarGroup className="mt-6">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Epics</h3>
            </div>
            
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {epics.slice(0, 5).map((epic) => (
                  <SidebarMenuItem key={epic.id}>
                    <SidebarMenuButton className="w-full justify-start">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: epic.color || '#8B5CF6' }}
                        />
                        <Hash className="h-3 w-3" />
                        <span className="truncate text-sm">{epic.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}