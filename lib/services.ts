import { Bot, Workflow, Building2, Code2, FileText, type LucideIcon } from 'lucide-react';

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
  { key: 'chatbot',        icon: Bot,        sub: ['telegram', 'whatsapp', 'voice', 'travel', 'social'] },
  { key: 'workflow',       icon: Workflow,   sub: ['crm', 'leadsite'] },
  { key: 'techConsulting', icon: Building2,  sub: ['roadmap', 'audit'] },
  { key: 'software',       icon: Code2,      sub: ['web', 'mobile', 'api', 'cloud'] },
  { key: 'resume',         icon: FileText,   sub: ['analysis', 'linkedin'] },
];

export const SERVICE_KEYS = SERVICE_CATEGORIES.map((c) => c.key);

/**
 * The two offerings we actively want to win work on. Both the home "What I do"
 * section and the /services page render only these (the rest of the catalogue
 * stays reachable from the footer Services menu and direct /contact links).
 */
export const FOCUS_KEYS = ['chatbot', 'software'] as const;

/** Sub-items intentionally hidden from the focus cards. */
export const FOCUS_HIDDEN_SUBS: Record<string, string[]> = {
  software: ['cloud'], // Cloud & DevOps lives in the footer Services menu.
};

export const FOCUS_CATEGORIES = FOCUS_KEYS.map(
  (key) => SERVICE_CATEGORIES.find((c) => c.key === key)!,
);
