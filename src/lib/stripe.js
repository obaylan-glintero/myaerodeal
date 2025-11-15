import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

// Get Price ID from environment
export const getStripePriceId = () => {
  return import.meta.env.VITE_STRIPE_PRICE_ID;
};

// Check if Stripe is configured
export const isStripeConfigured = () => {
  return !!(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && import.meta.env.VITE_STRIPE_PRICE_ID);
};
