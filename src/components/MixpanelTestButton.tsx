import React from 'react';
import { Button } from '@/components/ui/button';
import { useMixpanelContext } from '@/components/MixpanelProvider';
import { useToast } from '@/hooks/use-toast';

export function MixpanelTestButton() {
  const { trackTestEvent } = useMixpanelContext();
  const { toast } = useToast();

  const handleTestEvent = () => {
    trackTestEvent();
    toast({
      title: "Événement test envoyé",
      description: "Vérifiez votre tableau de bord Mixpanel pour voir l'événement 'Test Event'",
    });
  };

  return (
    <Button onClick={handleTestEvent} variant="outline" size="sm">
      Test Mixpanel
    </Button>
  );
}