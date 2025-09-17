import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptionPlans';

interface ProSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProSubscriptionModal({ open, onOpenChange }: ProSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const proFeatures = [
    'Projets illimités',
    'Épiques illimitées', 
    'Bibliothèque de prompts illimitée',
    'Toutes les fonctionnalités Basic',
    'Améliorateur de prompts',
    '2 sièges de collaboration',
    'Support premium',
    'Rappels et notifications',
    'Intégrations avancées'
  ];

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter",
          variant: "destructive",
        });
        return;
      }

      // Use Pro plan's annual price ID for CHF pricing
      const priceId = SUBSCRIPTION_PLANS.find(plan => plan.id === 'pro')?.annualPriceId;
      if (!priceId) {
        toast({
          title: "Erreur",
          description: "Plan Pro non disponible",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: "Erreur lors de la création du paiement",
          description: error.message || "Une erreur s'est produite",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur s'est produite lors de la création du paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-background border-border">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl font-semibold text-foreground">
            S'abonner à Pro
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Boostez votre productivité avec les fonctions Pro, comme les rappels, les projets supplémentaires et plus.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pricing Section */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cycle de facturation</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Annuel
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">4 CHF</span>
                <span className="text-sm text-muted-foreground">/mois</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Économisez 12 CHF
              </p>
            </div>

            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                <strong>Devise</strong><br />
                Franc suisse (CHF)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Vous ne pouvez pas modifier votre devise après vous être abonné.
              </p>
            </div>

            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Nous vous facturerons <strong>48 CHF par an</strong>. Les taxes applicables seront calculées au moment du paiement.
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Obtenez-en plus avec l'abonnement Pro
            </h4>
            <div className="space-y-2">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium"
            size="lg"
          >
            {loading ? "Redirection..." : "S'abonner maintenant"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            En cliquant sur "S'abonner maintenant", vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}