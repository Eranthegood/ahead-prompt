import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import mixpanelService from '@/services/mixpanelService';

export function useMixpanel() {
  const { user } = useAuth();

  useEffect(() => {
    // Identifier l'utilisateur si connecté
    if (user) {
      mixpanelService.identify(user.id, {
        email: user.email,
        full_name: user.user_metadata?.full_name,
        created_at: user.created_at,
        provider: user.app_metadata?.provider
      });
    } else {
      // Réinitialiser si l'utilisateur se déconnecte
      mixpanelService.reset();
    }
  }, [user]);

  return {
    // Méthodes de suivi d'événements
    trackEvent: mixpanelService.track.bind(mixpanelService),
    trackPageView: mixpanelService.trackPageView.bind(mixpanelService),
    trackPromptCreated: mixpanelService.trackPromptCreated.bind(mixpanelService),
    trackPromptCompleted: mixpanelService.trackPromptCompleted.bind(mixpanelService),
    trackEpicCreated: mixpanelService.trackEpicCreated.bind(mixpanelService),
    trackProductCreated: mixpanelService.trackProductCreated.bind(mixpanelService),
    trackUserLogin: mixpanelService.trackUserLogin.bind(mixpanelService),
    trackUserSignup: mixpanelService.trackUserSignup.bind(mixpanelService),
    trackTestEvent: mixpanelService.trackTestEvent.bind(mixpanelService),
    
    // Propriétés utilisateur
    setUserProperties: mixpanelService.setUserProperties.bind(mixpanelService)
  };
}