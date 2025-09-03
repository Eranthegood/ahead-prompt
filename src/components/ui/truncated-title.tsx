import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TruncatedTitleProps {
  title: string;
  maxLength?: number;
  className?: string;
  showCopyButton?: boolean;
  variant?: 'inline' | 'modal' | 'tooltip';
}

export function TruncatedTitle({ 
  title, 
  maxLength = 50, 
  className,
  showCopyButton = false,
  variant = 'modal'
}: TruncatedTitleProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const needsTruncation = title.length > maxLength;
  const truncatedTitle = needsTruncation 
    ? `${title.substring(0, maxLength).trim()}...` 
    : title;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(title);
      toast({
        title: 'Copié',
        description: 'Le titre a été copié dans le presse-papiers'
      });
    } catch (error) {
      console.error('Error copying title:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le titre',
        variant: 'destructive'
      });
    }
  };

  if (!needsTruncation) {
    return (
      <div className={cn("relative flex items-center gap-2", className)}>
        <span>{title}</span>
        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 ml-auto shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'tooltip') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("relative flex items-center gap-2", className)}>
              <span className="cursor-help">{truncatedTitle}</span>
              {showCopyButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 w-6 p-0 ml-auto shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <div className="space-y-2">
              <p className="font-medium">Titre complet:</p>
              <p className="text-sm">{title}</p>
              {showCopyButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="w-full"
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Copier
                </Button>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("relative flex items-center gap-2", className)}>
        <span>{truncatedTitle}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="h-6 px-2 text-xs text-primary hover:text-primary-glow"
        >
          see more
        </Button>
        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 ml-auto shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Titre complet
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">{title}</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Default modal variant
  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <span>{truncatedTitle}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="h-6 px-2 text-xs text-primary hover:text-primary-glow"
      >
        see more
      </Button>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 ml-auto shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Titre complet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{title}</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}