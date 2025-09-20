import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { KnowledgeSidebar } from './KnowledgeSidebar';
import { MinimalKnowledgeBase } from './MinimalKnowledgeBase';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types';

export interface KnowledgeBoxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: string;
}

export function KnowledgeBoxModal({ open, onOpenChange, defaultSection = 'workspace' }: KnowledgeBoxModalProps) {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [searchTerm, setSearchTerm] = useState('');
  const { workspace } = useWorkspace();
  const { products } = useProducts(workspace?.id);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderSectionContent = () => {
    if (!workspace) return null;

    // Workspace general knowledge
    if (activeSection === 'workspace') {
      return <MinimalKnowledgeBase workspace={workspace} />;
    }

    // Product-specific knowledge
    const product = products.find(p => p.id === activeSection);
    if (product) {
      return <MinimalKnowledgeBase workspace={workspace} product={product} />;
    }

    // Fallback to workspace
    return <MinimalKnowledgeBase workspace={workspace} />;
  };

  const getCurrentSectionInfo = () => {
    if (activeSection === 'workspace') {
      return {
        title: 'Workspace Knowledge',
        description: 'General knowledge items shared across all products'
      };
    }

    const product = products.find(p => p.id === activeSection);
    if (product) {
      return {
        title: `${product.name} Knowledge`,
        description: `Knowledge items specific to ${product.name}`
      };
    }

    return {
      title: 'Knowledge Box',
      description: 'Manage your knowledge items'
    };
  };

  const currentSection = getCurrentSectionInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex h-full min-h-[600px] max-h-[calc(90vh-2rem)]">
          {/* Sidebar */}
          <KnowledgeSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            workspace={workspace}
            products={products}
          />
          
          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border">
              <h1 className="text-2xl font-semibold text-foreground">
                {currentSection.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSection.description}
              </p>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderSectionContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}