import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackModal } from './FeedbackModal';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps {
  className?: string;
}

export function FeedbackButton({ className }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "opacity-70 hover:opacity-100 focus-visible:opacity-100 transition-opacity",
          "text-xs h-8 px-2 gap-1.5",
          "text-muted-foreground hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        aria-label="Envoyer un feedback"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Feedback</span>
      </Button>

      <FeedbackModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
}