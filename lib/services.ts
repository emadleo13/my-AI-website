import { Bot, Globe, Code2, FileText, type LucideIcon } from 'lucide-react';

/**
 * Single source of truth for the unified service catalogue.
 *
 * Each category has a translation key (under `services.categories.<key>`) and a
 * list of sub-items (under `services.categories.<key>.sub.<subKey>`). The nav
 * dropdown, the services page cards, and the home preview all read from here so
 * there is exactly one place to edit when the offering changes.
 */
export interface ServiceCategory {
  key: string;
  icon: LucideIcon;
  /** Sub-item translation keys, rendered as the dropdown / card sub-menu. */
  sub: string[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { key: 'chatbot',  icon: Bot,      sub: ['telegram', 'whatsapp', 'voice', 'travel', 'social'] },
  { key: 'website',  icon: Globe,    sub: ['business', 'landing', 'ecommerce', 'portfolio'] },
  { key: 'software', icon: Code2,    sub: ['saas', 'dashboard', 'pwa', 'android', 'api'] },
  { key: 'resume',   icon: FileText, sub: ['analysis', 'linkedin'] },
];

export const SERVICE_KEYS = SERVICE_CATEGORIES.map((c) => c.key);

/**
 * The offerings we actively want to win work on. Both the home "What I do"
 * section and the /services page render only these (resume / LinkedIn stays
 * reachable from the nav and footer Services menus and direct /contact links).
 */
export const FOCUS_KEYS = ['chatbot', 'website', 'software'] as const;

export const FOCUS_CATEGORIES = FOCUS_KEYS.map(
  (key) => SERVICE_CATEGORIES.find((c) => c.key === key)!,
);
