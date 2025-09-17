import { loadStripe } from '@stripe/stripe-js';
import { stripeProducts } from '../stripe-config';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key';

export const stripe = loadStripe(stripePublishableKey);

// Export the products from stripe-config
export const subscriptionTiers = stripeProducts;