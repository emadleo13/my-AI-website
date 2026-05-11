import Stripe from 'stripe';
import { env } from './env';
export { SERVICE_PRICES, PACKAGE_PRICES } from './service-prices';

let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.stripeSecretKey, {
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return _stripe;
}
