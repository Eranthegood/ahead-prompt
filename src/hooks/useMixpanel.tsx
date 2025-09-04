import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import mixpanelService from '@/services/mixpanelService';

export function useMixpanel() {
  const { user } = useAuth();

  useEffect(() => {
    // Identifier l'utilisateur si connecté
    if (user) {
      // First identify the user with their unique ID
      mixpanelService.identify(user.id);
      
      // Then set user properties
      mixpanelService.setUserProperties({
        '$name': user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        '$email': user.email,
        'user_id': user.id,
        'created_at': user.created_at,
        'auth_provider': user.app_metadata?.provider || 'email',
        'plan': 'Free', // Default plan, can be updated based on subscription
        'avatar_url': user.user_metadata?.avatar_url,
        'phone': user.phone,
        'email_confirmed': user.email_confirmed_at ? true : false,
        'last_sign_in': user.last_sign_in_at
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