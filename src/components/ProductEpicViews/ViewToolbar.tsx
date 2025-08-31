import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  List, 
  Kanban, 
  Search, 
  Filter,
  Grid3X3,
  Plus 
} from "lucide-react";
import { ViewType, FilterType, ViewState } from "@/hooks/useViewManager";
import { Product } from "@/types";

interface ViewToolbarProps {
  viewState: ViewState;
  products: Product[];
  stats: {
    filteredProducts: number;
    filteredEpics: number;
    totalProducts: number;
    totalEpics: number;
  };
  enabledViews: ViewType[];
  onViewChange: (view: ViewType) => void;
  onFilterChange: (filter: FilterType) => void;
  onSearchChange: (query: string) => void;
  onProductSelect: (productId?: string) => void;
  onCreateProduct?: () => void;
  onCreateEpic?: () => void;
}

const VIEW_ICONS = {
  list: List,
  kanban: Kanban,
  grid: Grid3X3,
} as const;

const VIEW_LABELS = {
  list: "List View",
  kanban: "Kanban View", 
  grid: "Grid View",
} as const;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Items' },
  { value: 'active', label: 'Active' },
  { value: 'recent', label: 'Recent' },
  { value: 'archived', label: 'Archived' },
  { value: 'by-product', label: 'By Product' },
] as const;

export function ViewToolbar({
  viewState,
  products,
  stats,
  enabledViews,
  onViewChange,
  onFilterChange,
  onSearchChange,
  onProductSelect,
  onCreateProduct,
  onCreateEpic,
}: ViewToolbarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 border-b bg-background/95 backdrop-blur">
      {/* Top Row - Views and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* View Toggle Buttons */}
          <div className="flex items-center rounded-lg border p-1">
            {enabledViews.map((view) => {
              const Icon = VIEW_ICONS[view];
              const isActive = viewState.activeView === view;
              
              return (
                <Button
                  key={view}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(view)}
                  className="h-8 px-3"
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">{VIEW_LABELS[view]}</span>
                </Button>
              );
            })}
          </div>

          {/* Stats Badges */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <Badge variant="secondary" className="text-xs">
              {stats.filteredProducts} Products
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {stats.filteredEpics} Epics
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onCreateEpic && (
            <Button variant="outline" size="sm" onClick={onCreateEpic}>
              <Plus className="h-4 w-4 mr-1" />
              Epic
            </Button>
          )}
          {onCreateProduct && (
            <Button size="sm" onClick={onCreateProduct}>
              <Plus className="h-4 w-4 mr-1" />
              Product
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row - Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products and epics..."
            value={viewState.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select 
            value={viewState.activeFilter} 
            onValueChange={(value) => onFilterChange(value as FilterType)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Product Filter */}
          {viewState.activeFilter === 'by-product' && (
            <Select 
              value={viewState.selectedProductId || "all"} 
              onValueChange={(value) => onProductSelect(value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: product.color }} 
                      />
                      {product.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}