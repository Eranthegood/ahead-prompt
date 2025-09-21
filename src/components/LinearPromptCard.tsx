import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Flag, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Workspace, Epic, Product, PromptPriority } from '@/types';

interface CreatePromptData {
  title: string;
  description?: string;
  original_description?: string;
  epic_id?: string;
  product_id?: string;
  priority?: PromptPriority;
  generated_prompt?: string;
  generated_at?: string;
  knowledge_context?: string[];
  ai_provider?: 'openai' | 'claude';
  ai_model?: string;
}

interface LinearPromptCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: CreatePromptData) => Promise<any>;
  workspace: Workspace;
  epics?: Epic[];
  products?: Product[];
  selectedProductId?: string;
  selectedEpicId?: string;
  onCreateProduct?: () => void;
  onCreateEpic?: () => void;
  onProductsRefetch?: () => void;
}

export const LinearPromptCard: React.FC<LinearPromptCardProps> = ({
  isOpen,
  onClose,
  onSave,
  workspace,
  epics = [],
  products = [],
  selectedProductId,
  selectedEpicId,
  onCreateProduct,
  onCreateEpic,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PromptPriority>(2);
  const [productId, setProductId] = useState(selectedProductId || '');
  const [epicId, setEpicId] = useState(selectedEpicId || '');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus on title input when opening
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority(2);
      setProductId(selectedProductId || '');
      setEpicId(selectedEpicId || '');
      setSelectedDate(undefined);
    }
  }, [isOpen, selectedProductId, selectedEpicId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        product_id: productId || undefined,
        epic_id: epicId || undefined,
        priority,
      });
      onClose();
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const filteredEpics = epics.filter(epic => 
    !productId || epic.product_id === productId
  );

  if (!isOpen) return null;

  return (
    <div 
      className="linear-prompt-creator fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl mx-4"
    >
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom de la tâche"
            className="text-base font-medium border-none bg-transparent p-0 focus-visible:ring-0"
          />

          {/* Description Textarea */}
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="min-h-[60px] resize-none border-none bg-transparent p-0 focus-visible:ring-0"
          />

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            {/* Date Button */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {selectedDate ? format(selectedDate, "dd MMM", { locale: fr }) : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            {/* Priority Button */}
            <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value) as PromptPriority)}>
              <SelectTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs w-auto"
                >
                  <Flag className="h-3 w-3 mr-1" />
                  <SelectValue />
                </Button>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Haut</SelectItem>
                <SelectItem value="2">Normal</SelectItem>
                <SelectItem value="3">Bas</SelectItem>
              </SelectContent>
            </Select>

            {/* Rappels Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Rappels
            </Button>

            {/* More Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between">
            {/* Product Selector */}
            <div className="flex-1">
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className="w-48 h-8 text-xs border-none bg-transparent">
                  <SelectValue placeholder="Boîte de réception" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Boîte de réception</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="h-8 px-3 text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={!title.trim()}
                className="h-8 px-3 text-xs"
              >
                Ajouter une tâche
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};