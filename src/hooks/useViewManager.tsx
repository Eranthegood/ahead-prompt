import { useState, useMemo, useCallback } from "react";
import { Product, Epic } from "@/types";

export type ViewType = 'list' | 'kanban' | 'grid';
export type FilterType = 'all' | 'active' | 'archived' | 'recent' | 'by-product';

export interface ViewState {
  activeView: ViewType;
  activeFilter: FilterType;
  searchQuery: string;
  selectedProductId?: string;
}

export interface ViewManagerConfig {
  enabledViews: ViewType[];
  defaultView: ViewType;
  defaultFilter: FilterType;
}

export function useViewManager(
  products: Product[], 
  epics: Epic[], 
  config: ViewManagerConfig = {
    enabledViews: ['list', 'kanban'],
    defaultView: 'list',
    defaultFilter: 'all'
  }
) {
  const [viewState, setViewState] = useState<ViewState>({
    activeView: config.defaultView,
    activeFilter: config.defaultFilter,
    searchQuery: "",
  });

  // View actions
  const setActiveView = useCallback((view: ViewType) => {
    setViewState(prev => ({ ...prev, activeView: view }));
  }, []);

  const setActiveFilter = useCallback((filter: FilterType) => {
    setViewState(prev => ({ ...prev, activeFilter: filter }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setViewState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedProductId = useCallback((productId?: string) => {
    setViewState(prev => ({ ...prev, selectedProductId: productId }));
  }, []);

  // Filtered data based on current state
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (viewState.searchQuery) {
      const query = viewState.searchQuery.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    switch (viewState.activeFilter) {
      case 'recent':
        // Sort by creation date, show last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          product => new Date(product.created_at) > weekAgo
        );
        break;
      case 'archived':
        // If you have an archived status, filter for those
        // For now, showing older than 30 days as example
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          product => new Date(product.created_at) < monthAgo
        );
        break;
      case 'active':
      default:
        // Show all active (non-archived) products
        break;
    }

    return filtered;
  }, [products, viewState.searchQuery, viewState.activeFilter]);

  const filteredEpics = useMemo(() => {
    let filtered = [...epics];

    // Search filter
    if (viewState.searchQuery) {
      const query = viewState.searchQuery.toLowerCase();
      filtered = filtered.filter(
        epic =>
          epic.name.toLowerCase().includes(query) ||
          epic.description?.toLowerCase().includes(query)
      );
    }

    // Product filter
    if (viewState.selectedProductId) {
      filtered = filtered.filter(
        epic => epic.product_id === viewState.selectedProductId
      );
    }

    // Status filter
    switch (viewState.activeFilter) {
      case 'recent':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          epic => new Date(epic.created_at) > weekAgo
        );
        break;
      case 'archived':
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          epic => new Date(epic.created_at) < monthAgo
        );
        break;
      case 'active':
      default:
        break;
    }

    return filtered;
  }, [epics, viewState.searchQuery, viewState.activeFilter, viewState.selectedProductId]);

  // Get epics grouped by product for kanban view
  const epicsByProduct = useMemo(() => {
    const grouped = new Map<string, Epic[]>();
    
    // Group by product
    filteredEpics.forEach(epic => {
      const productId = epic.product_id || 'unassigned';
      if (!grouped.has(productId)) {
        grouped.set(productId, []);
      }
      grouped.get(productId)!.push(epic);
    });

    // Convert to array format with product info
    return Array.from(grouped.entries()).map(([productId, epics]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        productName: product?.name || 'Unassigned',
        productColor: product?.color || '#6B7280',
        epics
      };
    });
  }, [filteredEpics, products]);

  // Stats
  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalEpics: epics.length,
    filteredProducts: filteredProducts.length,
    filteredEpics: filteredEpics.length,
    recentProducts: products.filter(
      p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    recentEpics: epics.filter(
      e => new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)  
    ).length,
  }), [products, epics, filteredProducts, filteredEpics]);

  return {
    // State
    viewState,
    
    // Actions
    setActiveView,
    setActiveFilter,
    setSearchQuery,
    setSelectedProductId,
    
    // Filtered data
    filteredProducts,
    filteredEpics,
    epicsByProduct,
    
    // Utils
    stats,
    config,
  };
}