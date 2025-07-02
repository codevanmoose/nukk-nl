import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Impression package configurations
export const IMPRESSION_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter Package',
    impressions: 10000,
    price: 299, // in euros
    priceInCents: 29900,
    features: [
      '10,000 impressies',
      'Basic analytics',
      'Email support',
      '7 dagen actief'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth Package',
    impressions: 50000,
    price: 999,
    priceInCents: 99900,
    features: [
      '50,000 impressies',
      'Advanced analytics',
      'Priority support',
      'A/B testing (2 varianten)',
      '30 dagen actief'
    ]
  },
  scale: {
    id: 'scale',
    name: 'Scale Package',
    impressions: 150000,
    price: 2499,
    priceInCents: 249900,
    features: [
      '150,000 impressies',
      'Real-time dashboard',
      'Dedicated account manager',
      'Unlimited A/B testing',
      '90 dagen actief'
    ]
  }
} as const;

export type PackageId = keyof typeof IMPRESSION_PACKAGES;

// Helper functions
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(priceInCents / 100);
}

export function calculateCPM(impressions: number, priceInCents: number): number {
  // Cost per mille (1000 impressions)
  return (priceInCents / impressions) * 1000;
}

export function getPackageById(packageId: string) {
  return IMPRESSION_PACKAGES[packageId as PackageId] || null;
}

// Stripe webhook event types we handle
export const WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
} as const;