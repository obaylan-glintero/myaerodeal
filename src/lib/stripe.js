import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

// Get Price IDs from environment
export const getStripeMonthlyPriceId = () => {
  return import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;
};

export const getStripeAnnualPriceId = () => {
  return import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID;
};

// Check if Stripe is configured
export const isStripeConfigured = () => {
  return !!(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
    import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID &&
    import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID
  );
};
