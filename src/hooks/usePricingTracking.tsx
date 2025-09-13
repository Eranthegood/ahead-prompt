import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

export function usePricingTracking() {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);

  const trackPricingInteraction = async (pricePoint: string) => {
    if (isTracking) return; // Prevent duplicate tracking
    
    setIsTracking(true);
    
    try {
      // Collect browser data for tracking
      const trackingData: any = {
        price_point: pricePoint,
        feedback_type: 'pricing_interaction',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      };

      // Add user info if authenticated
      if (user) {
        trackingData.user_id = user.id;
        trackingData.email = user.email;
      }

      // Insert into pricing_feedback table
      const { error } = await supabase
        .from('pricing_feedback')
        .insert([trackingData]);

      if (error) {
        console.error('Error tracking pricing interaction:', error);
        toast.error("Failed to track interaction");
        return false;
      }

      // Show success message based on plan
      const planMessages = {
        'free': "Thank you! We'll contact you with a special Free plan offer 🎉",
        'basic': "Thank you! We'll contact you with a special Basic plan offer 🎉", 
        'pro': "Thank you! We'll contact you with a special Pro plan offer 🎉"
      };

      toast.success(planMessages[pricePoint.toLowerCase() as keyof typeof planMessages] || "Thank you for your interest!");
      return true;

    } catch (error) {
      console.error('Error tracking pricing interaction:', error);
      toast.error("Failed to track interaction");
      return false;
    } finally {
      setIsTracking(false);
    }
  };

  return {
    trackPricingInteraction,
    isTracking
  };
}