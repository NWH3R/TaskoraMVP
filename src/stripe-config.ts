export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
  features: string[];
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_T1uvZYUKIplM9r',
    priceId: 'price_1S5r5iQ4VdcoVfX8PXQNtwnR',
    name: 'Loner',
    description: 'Perfect for individuals who want to join tribes',
    price: 0.00,
    currency: 'EUR',
    mode: 'subscription',
    trialDays: 0,
    features: [
      'Join unlimited tribes',
      'Basic task management',
      'Mobile app access',
      'Email support',
      'Community access'
    ]
  },
  {
    id: 'prod_T3TZ8EU6OyqZyD',
    priceId: 'price_1S7MceQ4VdcoVfX8K7UoXtTg',
    name: 'Starter Tribe',
    description: 'Basic tribe features for small teams',
    price: 9.99,
    currency: 'EUR',
    mode: 'subscription',
    trialDays: 7,
    features: [
      'Create up to 3 tribes',
      'Up to 10 members per tribe',
      'Basic analytics',
      'Task templates',
      'Email notifications',
      'Priority support'
    ]
  },
  {
    id: 'prod_T1uwWQcR6B6YDL',
    priceId: 'price_1S7I7cQ4VdcoVfX8XdX8vtNM',
    name: 'Starter Tribe',
    description: 'Basic tribe features for small teams',
    price: 99.99,
    currency: 'EUR',
    mode: 'payment',
    trialDays: 0,
    features: [
      'Everything in basic Starter Tribe',
      'Premium templates',
      'Advanced integrations',
      'Priority feature requests',
      'Dedicated support',
      'Custom onboarding'
    ]
  },
  {
    id: 'prod_T1uxOeNRi5trMP',
    priceId: 'price_1S5r7TQ4VdcoVfX8MOrplW47',
    name: 'Pro Tribe',
    description: 'Full AI access with advanced features',
    price: 24.99,
    currency: 'EUR',
    mode: 'subscription',
    trialDays: 7,
    features: [
      'Unlimited tribes',
      'AI-powered task suggestions',
      'Advanced analytics & insights',
      'Custom integrations',
      'Advanced permissions',
      'Video call integration',
      'Custom branding'
    ]
  },
  {
    id: 'prod_T3TYHBGcJoIdG4',
    priceId: 'price_1S7MayQ4VdcoVfX8X3fNU8oU',
    name: 'Pro Tribe',
    description: 'Full AI access with advanced features',
    price: 249.99,
    currency: 'EUR',
    mode: 'payment',
    trialDays: 0,
    features: [
      'Everything in basic Pro Tribe',
      'Advanced AI automation',
      'Smart task prioritization',
      'Predictive analytics',
      'Custom AI models',
      'Advanced reporting',
      'White-label options'
    ]
  },
  {
    id: 'prod_T3TWwy9d7Jn2XR',
    priceId: 'price_1S7MZaQ4VdcoVfX8cqz2dH8V',
    name: 'Team Tribe',
    description: 'Best for Large Teams',
    price: 59.99,
    currency: 'EUR',
    mode: 'subscription',
    trialDays: 7,
    features: [
      'Create up to 5 tribes',
      'Up to 50 members per tribe',
      'Sub-tribes (departments or project groups)',
      'AI-powered task suggestions',
      'Priority support',
      'Tribe-level insights'
    ]
  },
  {
    id: 'prod_T1uycP3ZjkkRCT',
    priceId: 'price_1S7I6UQ4VdcoVfX8teEkzia9',
    name: 'Team Tribe',
    description: 'Enterprise features for large teams',
    price: 599.99,
    currency: 'EUR',
    mode: 'payment',
    trialDays: 0,
    features: [
      'Everything in basic Team Tribe',
      'Lifetime access benefits',
      'White-label solution',
      'Custom development',
      'On-premise deployment',
      'Premium support',
      'Training & onboarding'
    ]
  }
];

// Helper functions
export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductsByName = (name: string): StripeProduct[] => {
  return stripeProducts.filter(product => product.name === name);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};