import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const feedbackSchema = z.object({
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(500, 'Le message ne peut pas dépasser 500 caractères')
    .trim(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      message: '',
    },
  });

  const { formState: { errors, isValid } } = form;
  const messageValue = form.watch('message');

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the modal is fully rendered
      setTimeout(() => {
        const textarea = document.querySelector('#feedback-message') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  }, [open]);

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: data.message,
          path: location.pathname,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'envoi du feedback');
      }

      // Success toast
      toast.success('Feedback envoyé !', {
        description: 'Merci pour votre retour, nous l\'avons bien reçu.',
      });

      // Log event for observability
      console.log('feedback_submitted_frontend', {
        id: result.id,
        path: location.pathname,
        responseTime: result.responseTime,
        timestamp: new Date().toISOString(),
      });

      // Reset form and close modal
      form.reset();
      onOpenChange(false);

    } catch (error) {
      console.error('feedback_error_frontend', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: location.pathname,
        timestamp: new Date().toISOString(),
      });

      toast.error('Erreur lors de l\'envoi', {
        description: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Envoyer un feedback</span>
            {!isSubmitting && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Partagez vos commentaires, suggestions ou signalez un problème. Votre retour nous aide à améliorer l'application.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      id="feedback-message"
                      placeholder="Décrivez votre feedback, suggestion ou problème..."
                      className="min-h-[100px] resize-none"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between text-xs">
                    <span>
                      {messageValue.length}/500 caractères
                    </span>
                    <span className="text-muted-foreground">
                      Minimum 10 caractères
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting || messageValue.length < 10}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}