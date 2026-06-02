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
  serviceType: z.enum(['chatbot', 'workflow', 'both', 'consulting']),
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

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
});
export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(40),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const documentWebContentSchema = z.object({
  type: z.literal('web'),
  title: z.string().min(1).max(200),
  content: z.string().min(10).max(200_000),
});
export type DocumentWebContentInput = z.infer<typeof documentWebContentSchema>;
