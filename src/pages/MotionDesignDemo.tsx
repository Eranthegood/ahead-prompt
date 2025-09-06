import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { DraggableProductItem } from "@/components/DraggableProductItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Package, Zap } from "lucide-react";
import type { Product } from "@/types";

type DemoEpic = {
  id: string;
  name: string;
  color: string;
  promptCount: number;
};

type DemoProduct = Product & {
  epics: DemoEpic[];
  directPrompts: any[];
  promptCount: number;
};

export default function MotionDesignDemo() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const initialProducts: DemoProduct[] = useMemo(
    () => [
      {
        id: "prod-1",
        name: "Web App",
        description: "Marketing site + dashboard",
        color: "#3B82F6",
        workspace_id: "demo",
        github_repo_url: null,
        default_branch: undefined,
        cursor_enabled: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        epics: [
          { id: "e-1", name: "Authentication", color: "#8B5CF6", promptCount: 6 },
          { id: "e-2", name: "Dashboard", color: "#10B981", promptCount: 3 },
        ],
        directPrompts: [],
        promptCount: 12,
      },
      {
        id: "prod-2",
        name: "Mobile",
        description: "iOS + Android",
        color: "#F59E0B",
        workspace_id: "demo",
        github_repo_url: null,
        default_branch: undefined,
        cursor_enabled: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        epics: [
          { id: "e-3", name: "Onboarding", color: "#F59E0B", promptCount: 4 },
          { id: "e-4", name: "Push", color: "#EF4444", promptCount: 2 },
        ],
        directPrompts: [],
        promptCount: 8,
      },
      {
        id: "prod-3",
        name: "Design System",
        description: "UI kit + tokens",
        color: "#10B981",
        workspace_id: "demo",
        github_repo_url: null,
        default_branch: undefined,
        cursor_enabled: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        epics: [
          { id: "e-5", name: "Components", color: "#10B981", promptCount: 5 },
          { id: "e-6", name: "Theming", color: "#3B82F6", promptCount: 1 },
        ],
        directPrompts: [],
        promptCount: 7,
      },
    ],
    []
  );

  const [products, setProducts] = useState<DemoProduct[]>(initialProducts);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [selectedEpicId, setSelectedEpicId] = useState<string | undefined>();

  const items = products.map((p) => p.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setProducts((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const toggleExpanded = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProductId === productId) {
      setSelectedProductId(undefined);
      setSelectedEpicId(undefined);
    }
  };

  const handleCreateEpic = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              epics: [
                ...p.epics,
                {
                  id: `e-${Math.random().toString(36).slice(2, 7)}`,
                  name: "New Epic",
                  color: p.color,
                  promptCount: 0,
                },
              ],
            }
          : p
      )
    );
    setExpandedProducts((prev) => new Set(prev).add(productId));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden">
      {/* Subtle animated background inspired by collaborative repo motion */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.6 }}
        style={{ backgroundImage: `radial-gradient(circle at 20% 20%, hsl(var(--primary)/0.08), transparent 40%), radial-gradient(circle at 80% 60%, hsl(var(--primary)/0.06), transparent 40%)` }}
      />

      <div className="relative z-10 mx-auto max-w-5xl p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold">Minimal Sidebar + Draggable Items</h1>
              <p className="text-xs text-muted-foreground">Motion showcase with drag-and-drop + smooth transitions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex">
              <Badge variant="secondary" className="px-2 py-0.5">Demo</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsCollapsed((v) => !v)}>
              {isCollapsed ? "Expand" : "Collapse"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setProducts(initialProducts)}>Reset</Button>
          </div>
        </div>

        <div className="flex gap-4 md:gap-6">
          {/* Animated Sidebar Panel */}
          <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 320 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="relative overflow-hidden rounded-lg border bg-card"
          >
            <div className="p-3 border-b flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary">
                <Package className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-none">Products</div>
                  <div className="text-xs text-muted-foreground">Drag to reorder. Click to select.</div>
                </div>
              )}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <motion.div
                  className="p-2 space-y-1"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence initial={false}>
                    {products.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        layout
                        exit={{ opacity: 0, y: -6 }}
                      >
                        <DraggableProductItem
                          product={product}
                          isCollapsed={isCollapsed}
                          isExpanded={expandedProducts.has(product.id) || product.epics.length === 0}
                          isSelected={selectedProductId === product.id}
                          selectedEpicId={selectedEpicId}
                          totalEpicCount={products.reduce((acc, p) => acc + p.epics.length, 0)}
                          onToggleExpanded={() => toggleExpanded(product.id)}
                          onProductSelect={() => {
                            setSelectedProductId(product.id);
                            setSelectedEpicId(undefined);
                          }}
                          onEpicSelect={(epicId) => setSelectedEpicId(epicId)}
                          onDeleteProduct={() => handleDeleteProduct(product.id)}
                          onOpenKnowledge={() => { /* no-op for demo */ }}
                          onCreateEpic={() => handleCreateEpic(product.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </SortableContext>
            </DndContext>
          </motion.aside>

          {/* Right-hand Explanation Panel */}
          <motion.section
            className="flex-1 rounded-lg border bg-card p-4 md:p-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.05 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">Motion Principles in this demo</h2>
            </div>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1.5">
              <li>Animated width transition for the sidebar collapse/expand</li>
              <li>Staggered fade-and-rise for list mount with subtle spring</li>
              <li>Drag feedback via @dnd-kit with opacity and transform</li>
              <li>Contextual selection state for product and epic</li>
              <li>Inspired ambient background cues from collaborative repo animation</li>
            </ul>

            <div className="mt-4 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              Tip: Try dragging items, toggling collapse, and expanding products to see the combined motion and interaction.
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

