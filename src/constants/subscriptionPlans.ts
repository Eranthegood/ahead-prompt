export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  priceId: string;
  productId: string;
  features: string[];
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'USD',
    interval: 'month',
    priceId: '',
    productId: '',
    features: [
      '1 Product',
      '3 Epics per product',
      '10 Prompt library items',
      'Basic AI generation',
      'Community support'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'For growing projects',
    price: 5,
    currency: 'USD',
    interval: 'month',
    priceId: 'price_1S7AeZCwKhElNdgf7j9K0Tq8',
    productId: 'prod_T3HCJpUD2Br7Ea',
    features: [
      '3 Products',
      '10 Epics per product',
      '50 Prompt library items',
      'Advanced AI models',
      'Knowledge base access',
      'Cursor integration',
      'Priority support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For teams & power users',
    price: 15,
    currency: 'USD',
    interval: 'month',
    priceId: 'price_1S7Af1CwKhElNdgfavJNSZxH',
    productId: 'prod_T3HDpk4FpT8mnu',
    features: [
      'Unlimited Products',
      'Unlimited Epics',
      'Unlimited Prompt library',
      'All Basic features',
      'Prompt enhancer',
      '2 collaboration seats',
      'Premium support'
    ],
    recommended: true
  }
];

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id);
};

export const getPlanByProductId = (productId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.productId === productId);
};