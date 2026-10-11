import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Enter a valid email'),
  company: z.string().max(160).optional().or(z.literal('')),
  channel: z.enum(['telegram', 'google-meet']),
  service: z.string().max(60).optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters').max(4000),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** Service options on the discovery form (labels live in messages/*.json). */
export const DISCOVERY_SERVICE_TYPES = ['chatbot', 'website', 'webapp', 'android', 'other'] as const;

/**
 * Project Discovery form — a richer, multi-step intake clients fill in when
 * they request a service. Only the essentials are required (name, email,
 * service, goal); everything else is optional so the form never blocks.
 * Select fields are kept as plain strings (the UI controls their values) to
 * stay resilient as option lists evolve.
 */
export const discoverySchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Enter a valid email'),
  company: z.string().max(160).optional().or(z.literal('')),
  website: z.string().max(200).optional().or(z.literal('')),
  industry: z.string().max(160).optional().or(z.literal('')),
  businessDescription: z.string().max(2000).optional().or(z.literal('')),
  serviceType: z.enum(DISCOVERY_SERVICE_TYPES),
  projectGoal: z.string().min(5, 'Tell me a little about your goal').max(2000),
  targetAudience: z.string().max(40).optional().or(z.literal('')),
  platform: z.array(z.string().max(30)).max(10).optional().default([]),
  currentTools: z.string().max(1000).optional().or(z.literal('')),
  integrations: z.string().max(1000).optional().or(z.literal('')),
  hasContent: z.string().max(40).optional().or(z.literal('')),
  language: z.string().max(160).optional().or(z.literal('')),
  tone: z.string().max(40).optional().or(z.literal('')),
  timeline: z.string().max(40).optional().or(z.literal('')),
  budget: z.string().max(40).optional().or(z.literal('')),
  maintenance: z.string().max(40).optional().or(z.literal('')),
  extraNotes: z.string().max(2000).optional().or(z.literal('')),
  locale: z.string().max(5).optional().or(z.literal('')),
});
export type DiscoveryInput = z.infer<typeof discoverySchema>;

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const bookingSchema = z.object({
  serviceType: z.enum(['ai', 'agent', 'career', 'tech']),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bookingTime: z.enum(['10:00', '12:00', '14:00', '16:00']),
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  scope: z.enum(['free', 'session', 'mini', 'full']).optional(),
  socialPlatform: z.enum(['whatsapp', 'telegram', 'facebook']).optional(),
  socialContact: z.string().max(100).optional().or(z.literal('')),
});
export type BookingInput = z.infer<typeof bookingSchema>;

// Hard caps on what the chat endpoint will even parse. The route additionally
// trims the history to a much smaller budget before calling the model (see
// lib/chat-history.ts), so these only bound abuse, not normal long chats.
export const CHAT_MAX_MESSAGES = 60;
export const CHAT_MAX_MESSAGE_CHARS = 4000;
export const CHAT_MAX_TOTAL_CHARS = 60000;

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(CHAT_MAX_MESSAGE_CHARS),
});
export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(CHAT_MAX_MESSAGES)
    .refine((m) => m[m.length - 1]?.role === 'user', 'Last message must be from the user')
    .refine(
      (m) => m.reduce((n, x) => n + x.content.length, 0) <= CHAT_MAX_TOTAL_CHARS,
      'Conversation too long',
    ),
  locale: z.enum(['en', 'fa', 'ro']).optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const documentWebContentSchema = z.object({
  type: z.literal('web'),
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(200_000),
});
export type DocumentWebContentInput = z.infer<typeof documentWebContentSchema>;
