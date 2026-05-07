---
title: "Choosing an AI agent framework in 2026"
excerpt: "LangChain, CrewAI, AutoGen, or roll your own? A practical decision guide."
date: "2026-04-15"
readingMinutes: 6
imageSeed: "blog-agent-frameworks"
tags:
  - AI
  - Agents
  - Claude
---

The agent ecosystem has matured a lot in the last two years. The question is no longer "should we build with an agent framework" but "which one, and when to drop them altogether." Here is how I make that call with clients.

<Callout tone="tip" title="The shortcut">
If you've heard of LangChain in the last 30 days but never traced an agent failure end-to-end, **start without a framework**. Build the smallest thing that works, *then* decide what abstraction you need.
</Callout>

## Start with the workload, not the tool

Before touching any framework, write down the actual sequence of steps your agent needs to perform. If the work fits in a single prompt with a few tool calls, you don't need a framework. If you need planning, multi-turn coordination, or branching workflows, frameworks earn their keep.

## When LangGraph wins

LangGraph (the graph evolution of LangChain) is my default for multi-step workflows where you want explicit control of state transitions. The mental model is simple: nodes are tool-calling steps, edges are routing decisions, and state is a typed object you mutate. It is the best choice when you need durability, retries, and observability.

## When CrewAI or AutoGen win

If your problem maps cleanly onto **multiple specialized agents collaborating** — researcher, writer, critic, executor — CrewAI is fast to prototype with. AutoGen is similar but leans more academic; it shines for richly conversational multi-agent setups.

## When to roll your own

For most production agents I ship, I use the Anthropic SDK directly with structured tool calls and a small in-house orchestrator. This buys:

- Tight control over prompts and tool schemas
- No framework upgrades breaking things
- Trivial debuggability — the entire control flow fits on a screen

The skeleton fits on one screen:

```ts
const result = await client.messages.create({
  model: 'claude-sonnet-4-6',
  system: SYSTEM_PROMPT,
  tools: TOOLS,
  messages: history,
});

if (result.stop_reason === 'tool_use') {
  const toolResults = await Promise.all(
    result.content
      .filter((c) => c.type === 'tool_use')
      .map(invokeTool),
  );
  history.push({ role: 'assistant', content: result.content });
  history.push({ role: 'user', content: toolResults });
  // ...loop until stop_reason === 'end_turn'
}
```

That's it. No framework abstraction over the loop above.

## My rule of thumb

Use a framework when the orchestration logic is the hard part. Skip it when the model and tools are the hard part.
