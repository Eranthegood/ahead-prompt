import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps {
  className?: string;
}

export function FeedbackButton({ className }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length < 10) {
      toast({
        title: "Message trop court",
        description: "Votre message doit contenir au moins 10 caractères.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{ message: message.trim() }]);

      if (error) throw error;

      toast({
        title: "Feedback envoyé",
        description: "Merci pour votre retour !",
      });
      
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le feedback. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
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
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Envoyer un feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="feedback-message">Votre message</Label>
            <Textarea
              id="feedback-message"
              placeholder="Partagez vos commentaires, suggestions ou problèmes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/500 caractères (minimum 10)
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || message.length < 10}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}