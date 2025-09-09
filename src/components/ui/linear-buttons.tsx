import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LinearDropdown } from './linear-dropdown';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Flag,
  Flame,
  Minus,
  User,
  Folder,
  GitBranch,
  Bot,
  MoreHorizontal,
  BookOpen
} from 'lucide-react';
import type { Epic, Product, PromptPriority, KnowledgeItem } from '@/types';
import { PRIORITY_OPTIONS } from '@/types';

interface ProviderConfig {
  provider: 'openai' | 'claude';
  model?: string;
}

interface LinearActionButtonsProps {
  priority: PromptPriority;
  onPriorityChange: (priority: PromptPriority) => void;
  selectedProduct?: string;
  onProductChange: (productId?: string) => void;
  selectedEpic?: string;
  onEpicChange: (epicId?: string) => void;
  providerConfig: ProviderConfig;
  onProviderChange: (config: ProviderConfig) => void;
  products: Product[];
  epics: Epic[];
  onCreateProduct?: () => void;
  onCreateEpic?: () => void;
  knowledgeItems: KnowledgeItem[];
  selectedKnowledge: KnowledgeItem[];
  onKnowledgeChange: (knowledge: KnowledgeItem[]) => void;
  onExpandToggle: () => void;
}

export const LinearActionButtons: React.FC<LinearActionButtonsProps> = ({
  priority,
  onPriorityChange,
  selectedProduct,
  onProductChange,
  selectedEpic,
  onEpicChange,
  providerConfig,
  onProviderChange,
  products,
  epics,
  onCreateProduct,
  onCreateEpic,
  knowledgeItems,
  selectedKnowledge,
  onKnowledgeChange,
  onExpandToggle,
}) => {
  const getStatusIcon = () => <Circle className="w-4 h-4 text-muted-foreground" />;
  
  const getPriorityIcon = () => {
    switch (priority) {
      case 1: return <Flame className="w-4 h-4 text-red-500" />;
      case 2: return <Minus className="w-4 h-4 text-orange-500" />;
      case 3: return <Clock className="w-4 h-4 text-muted-foreground" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityLabel = () => {
    const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return option?.label || 'No Priority';
  };

  const getProviderIcon = () => {
    return providerConfig.provider === 'openai' ? 
      <Bot className="w-4 h-4 text-green-600" /> : 
      <Bot className="w-4 h-4 text-purple-600" />;
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const selectedEpicData = epics.find(e => e.id === selectedEpic);

  const priorityOptions = PRIORITY_OPTIONS.map(option => ({
    id: option.value.toString(),
    label: option.label,
    icon: option.value === 1 ? Flame : 
          option.value === 2 ? Minus : 
          option.value === 3 ? Clock : Clock,
    onClick: () => onPriorityChange(option.value),
  }));

  const productOptions = [
    ...products.map(product => ({
      id: product.id,
      label: product.name,
      icon: Folder,
      color: product.color,
      onClick: () => onProductChange(product.id),
    })),
    ...(onCreateProduct ? [{
      id: 'create-new',
      label: 'Create new product',
      icon: Folder,
      onClick: onCreateProduct,
    }] : [])
  ];

  const epicOptions = [
    ...epics.map(epic => ({
      id: epic.id,
      label: epic.name,
      icon: GitBranch,
      color: epic.color,
      onClick: () => onEpicChange(epic.id),
    })),
    ...(onCreateEpic ? [{
      id: 'create-epic',
      label: 'Create new epic',
      icon: GitBranch,
      onClick: onCreateEpic,
    }] : [])
  ];

  const providerOptions = [
    {
      id: 'openai',
      label: 'OpenAI',
      icon: Bot,
      onClick: () => onProviderChange({ provider: 'openai', model: 'gpt-4' }),
    },
    {
      id: 'claude',
      label: 'Claude',
      icon: Bot,
      onClick: () => onProviderChange({ provider: 'claude', model: 'claude-3-sonnet' }),
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-3 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60"
      >
        {getStatusIcon()}
        <span className="ml-2 text-sm">Todo</span>
      </Button>

      {/* Priority Button */}
      <LinearDropdown
        trigger={
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60"
          >
            {getPriorityIcon()}
            <span className="ml-2 text-sm">{getPriorityLabel()}</span>
          </Button>
        }
        options={priorityOptions}
        placeholder="Select priority"
      />

      {/* AI Provider Button */}
      <LinearDropdown
        trigger={
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60"
          >
            {getProviderIcon()}
            <span className="ml-2 text-sm capitalize">{providerConfig.provider}</span>
          </Button>
        }
        options={providerOptions}
        placeholder="Select AI provider"
      />

      {/* Product Button */}
      <LinearDropdown
        trigger={
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60"
          >
            <Folder className="w-4 h-4" />
            <span className="ml-2 text-sm">
              {selectedProductData?.name || 'Product'}
            </span>
          </Button>
        }
        options={productOptions}
        placeholder="Select product"
      />

      {/* Epic Button (conditional) */}
      {(selectedEpicData || epics.length > 0) && (
        <LinearDropdown
          trigger={
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60"
            >
              <GitBranch className="w-4 h-4" />
              <span className="ml-2 text-sm">
                {selectedEpicData?.name || 'Epic'}
              </span>
            </Button>
          }
          options={epicOptions}
          placeholder="Select epic"
        />
      )}

      {/* Knowledge Items */}
      {knowledgeItems.length > 0 && (
        <LinearDropdown
          trigger={
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60"
            >
              <BookOpen className="w-4 h-4" />
              <span className="ml-2 text-sm">
                {selectedKnowledge.length > 0 ? 
                  `Knowledge (${selectedKnowledge.length})` : 
                  'Knowledge'
                }
              </span>
            </Button>
          }
          options={knowledgeItems.map(item => ({
            id: item.id,
            label: item.title,
            icon: BookOpen,
            isSelected: selectedKnowledge.some(k => k.id === item.id),
            onClick: () => {
              const isSelected = selectedKnowledge.some(k => k.id === item.id);
              if (isSelected) {
                onKnowledgeChange(selectedKnowledge.filter(k => k.id !== item.id));
              } else {
                onKnowledgeChange([...selectedKnowledge, item]);
              }
            },
          }))}
          placeholder="Select knowledge"
          allowMultiple
        />
      )}

      {/* More Options */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/60"
        onClick={onExpandToggle}
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>
  );
};