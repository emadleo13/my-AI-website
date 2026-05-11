import Stripe from 'stripe';
import { env } from './env';

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2026-04-22.dahlia',
});

export const SERVICE_PRICES: Record<string, number> = {
  ai: 200_00,      // €200 in cents
  agent: 200_00,
  career: 200_00,
  tech: 200_00,
};

export const PACKAGE_PRICES: Record<string, { amount: number; name: string }> = {
  standard: { amount: 200_00, name: 'Standard Package' },
  premium:  { amount: 500_00, name: 'Premium Package'  },
};
