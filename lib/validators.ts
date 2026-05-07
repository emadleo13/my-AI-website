import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Enter a valid email'),
  subject: z.enum(['general', 'ai', 'dev', 'job', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(4000),
});
export type ContactInput = z.infer<typeof contactSchema>;

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
