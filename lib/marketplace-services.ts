import {
  Bot,
  Plane,
  Mic2,
  Globe,
  BarChart3,
  Share2,
  type LucideIcon,
} from 'lucide-react';

export type ServiceKey =
  | 'telegram_bot'
  | 'travel_automation'
  | 'voice_assistant'
  | 'website_design'
  | 'crm_automation'
  | 'social_automation';

export type ServiceStatus =
  | 'pending'
  | 'demo_used'
  | 'paid'
  | 'in_progress'
  | 'delivered';

export interface MarketplaceService {
  key: ServiceKey;
  icon: LucideIcon;
  isAutomated: boolean;
  priceEurCents: number;
  freeDemo: string;
}

export const MARKETPLACE_SERVICES: MarketplaceService[] = [
  {
    key: 'telegram_bot',
    icon: Bot,
    isAutomated: true,
    priceEurCents: 2900,
    freeDemo: 'Preview welcome message + 1 FAQ answer',
  },
  {
    key: 'travel_automation',
    icon: Plane,
    isAutomated: true,
    priceEurCents: 1900,
    freeDemo: '3 curated flight/hotel options',
  },
  {
    key: 'voice_assistant',
    icon: Mic2,
    isAutomated: true,
    priceEurCents: 3900,
    freeDemo: 'Embed code snippet preview',
  },
  {
    key: 'website_design',
    icon: Globe,
    isAutomated: false,
    priceEurCents: 29900,
    freeDemo: 'Free design brief & scope document',
  },
  {
    key: 'crm_automation',
    icon: BarChart3,
    isAutomated: false,
    priceEurCents: 14900,
    freeDemo: 'Free process assessment',
  },
  {
    key: 'social_automation',
    icon: Share2,
    isAutomated: false,
    priceEurCents: 9900,
    freeDemo: 'Free content plan outline',
  },
];

export const SERVICE_MAP = Object.fromEntries(
  MARKETPLACE_SERVICES.map((s) => [s.key, s]),
) as Record<ServiceKey, MarketplaceService>;

export function formatPrice(eurCents: number): string {
  return `€${(eurCents / 100).toFixed(0)}`;
}
