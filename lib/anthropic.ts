import Anthropic from '@anthropic-ai/sdk';
import { env, isAnthropicConfigured } from './env';

export const ANTHROPIC_MODEL = 'claude-sonnet-4-6';

export const ASSISTANT_SYSTEM_PROMPT = `You are Emad's AI assistant, an expert consultant specializing in: (1) finding jobs in Romania, (2) AI consulting and implementation in Romania, (3) software development and programming, (4) designing and deploying AI agents in Romania. You provide practical, Romania-specific advice. You are friendly, professional, and concise.`;

export function getAnthropicClient(): Anthropic | null {
  if (!isAnthropicConfigured) return null;
  return new Anthropic({ apiKey: env.anthropicKey });
}
