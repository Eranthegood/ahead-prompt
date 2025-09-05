import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Epic } from '@/types';
import { GridContainer } from './GridContainer';
import { ProductGridCard } from './ProductGridCard';
import { EpicGridCard } from './EpicGridCard';
import { Button } from '@/components/ui/button';
import { Plus, Package, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface GridViewProps {
  products: Product[];
  epics: Epic[];
  productEpicCounts: Map<string, number>;
  productPromptCounts: Map<string, number>;
  epicPromptCounts: Map<string, number>;
  onProductClick?: (product: Product) => void;
  onEpicClick?: (epic: Epic) => void;
  onProductEdit?: (product: Product) => void;
  onEpicEdit?: (epic: Epic) => void;
  onProductDelete?: (productId: string) => void;
  onEpicDelete?: (epicId: string) => void;
  onProductDuplicate?: (product: Product) => void;
  onEpicDuplicate?: (epic: Epic) => void;
  onCreateProduct?: () => void;
  onCreateEpic?: () => void;
  searchQuery?: string;
}

export function GridView({
  products,
  epics,
  productEpicCounts,
  productPromptCounts,
  epicPromptCounts,
  onProductClick,
  onEpicClick,
  onProductEdit,
  onEpicEdit,
  onProductDelete,
  onEpicDelete,
  onProductDuplicate,
  onEpicDuplicate,
  onCreateProduct,
  onCreateEpic,
  searchQuery = '',
}: GridViewProps) {
  // Group epics by product for better visual organization
  const epicsByProduct = useMemo(() => {
    const grouped = new Map<string, Epic[]>();
    
    epics.forEach(epic => {
      const productId = epic.product_id || 'unassigned';
      if (!grouped.has(productId)) {
        grouped.set(productId, []);
      }
      grouped.get(productId)!.push(epic);
    });
    
    return grouped;
  }, [epics]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    }
  };

  const hasNoData = products.length === 0 && epics.length === 0;

  if (hasNoData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 
              `No products or epics match "${searchQuery}"` :
              "Get started by creating your first product or epic"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {onCreateProduct && (
              <Button onClick={onCreateProduct} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Product
              </Button>
            )}
            {onCreateEpic && (
              <Button onClick={onCreateEpic} variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-1" />
                Create Epic
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <GridContainer>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 p-4 auto-fit-grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          }}
        >
          <AnimatePresence mode="popLayout">
            {/* Product Cards */}
            {products.map((product) => (
              <motion.div
                key={`product-${product.id}`}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <ProductGridCard
                  product={product}
                  epicCount={productEpicCounts.get(product.id) || 0}
                  promptCount={productPromptCounts.get(product.id) || 0}
                  epics={epicsByProduct.get(product.id) || []}
                  onClick={() => onProductClick?.(product)}
                  onEdit={() => onProductEdit?.(product)}
                  onDelete={() => onProductDelete?.(product.id)}
                  onDuplicate={() => onProductDuplicate?.(product)}
                />
              </motion.div>
            ))}

            {/* Epic Cards */}
            {epics.map((epic) => (
              <motion.div
                key={`epic-${epic.id}`}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <EpicGridCard
                  epic={epic}
                  promptCount={epicPromptCounts.get(epic.id) || 0}
                  product={products.find(p => p.id === epic.product_id)}
                  onClick={() => onEpicClick?.(epic)}
                  onEdit={() => onEpicEdit?.(epic)}
                  onDelete={() => onEpicDelete?.(epic.id)}
                  onDuplicate={() => onEpicDuplicate?.(epic)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </GridContainer>
    </div>
  );
}