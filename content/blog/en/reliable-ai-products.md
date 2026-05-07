---
title: "Beyond the prompt: building reliable AI products"
excerpt: "From prototype to production with eval, retries, and guardrails."
date: "2026-02-10"
readingMinutes: 7
imageSeed: "blog-reliable-ai"
tags:
  - AI
  - Engineering
  - Claude
---

The hardest part of shipping an AI product isn't the model — it's everything around it. Here's the system I wrap around every Claude-powered feature I ship.

## Eval before product-market fit

A new feature doesn't go to users until it has an eval set. Even five hand-curated examples beat shipping blind. The eval set lives in a CSV, gets re-run on every prompt change, and the deltas are reviewed in PR.

## Retries with shape constraints

Models occasionally return malformed output. I never let a single bad response surface to a user. Wrap every model call in:

1. Schema validation (zod or pydantic)
2. Retry on validation failure with the original error appended to the prompt
3. Hard cap of three attempts; fall back to a deterministic template

<Terminal title="evals — pnpm">
```bash
$ pnpm eval --suite=auth-router
running 12 cases · model=claude-sonnet-4-6
  ✓ classifies password reset (12ms)
  ✓ classifies signup intent (15ms)
  ✓ rejects ambiguous handoff to human (28ms)
  ...
12/12 passed · cost $0.04
```
</Terminal>

## Guardrails that match the threat

Not every product needs a content moderation pipeline. The right question is: "What's the worst plausible output, and what's the cost of letting it slip?" For a public chat, you need filtering. For an internal tool with twelve users, you don't.

## Observability is non-negotiable

Log every model input, output, latency, and cost. Tag traces with the user, feature, and prompt version. When something goes wrong in week six, you'll know.

## The order I ship in

1. Prompt + scaffolded tool use that runs end-to-end
2. Eval set + automated regression check
3. Retries and fallbacks
4. Observability
5. Cost guardrails (caps, alerts)
6. *Then* invite users

Skip steps and you'll pay for them later. Always.

<ConsultantCTA />
