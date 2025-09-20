import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProductIcon } from '@/components/ui/product-icon';
import { 
  Search, 
  BookOpen,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, Workspace } from '@/types';

interface KnowledgeSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  workspace?: Workspace | null;
  products: Product[];
}

export function KnowledgeSidebar({ 
  activeSection, 
  onSectionChange, 
  searchTerm, 
  onSearchChange,
  workspace,
  products
}: KnowledgeSidebarProps) {
  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if workspace section should be shown based on search
  const showWorkspaceSection = !searchTerm || 
    'workspace'.includes(searchTerm.toLowerCase()) ||
    'general'.includes(searchTerm.toLowerCase());

  return (
    <div className="w-64 bg-muted/30 border-r border-border flex flex-col">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Workspace Section */}
        {showWorkspaceSection && (
          <div className="px-3 py-2">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              General
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSectionChange('workspace')}
                className={cn(
                  "w-full justify-start px-3 py-2 h-auto font-normal",
                  activeSection === 'workspace' && "bg-accent text-accent-foreground"
                )}
              >
                <Building2 className="mr-3 h-4 w-4" />
                Workspace Knowledge
              </Button>
            </div>
            {filteredProducts.length > 0 && <Separator className="my-3" />}
          </div>
        )}

        {/* Products Section */}
        {filteredProducts.length > 0 && (
          <div className="px-3 py-2">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Products ({filteredProducts.length})
            </h3>
            <div className="space-y-1">
              {filteredProducts.map((product) => {
                const isActive = activeSection === product.id;
                
                return (
                  <Button
                    key={product.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSectionChange(product.id)}
                    className={cn(
                      "w-full justify-start px-3 py-2 h-auto font-normal",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <ProductIcon 
                      className="mr-3 h-4 w-4" 
                    />
                    <span className="truncate">{product.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* No results message */}
        {searchTerm && !showWorkspaceSection && filteredProducts.length === 0 && (
          <div className="px-6 py-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No products found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}