---
description: 'Capture a new convention, decision, or discovery in the KB System knowledge graph'
agent: 'agent'
argument-hint: 'describe what you learned (e.g. We use cursor-based pagination)'
tools: ['terminal', 'editFiles']
---

# KB Learn

Update the knowledge graph with a durable discovery and keep cross-links consistent.

## Required workflow

1. Read the existing `.knowledge/` tree to find the best destination for the new information.
2. Decide whether the discovery belongs in:
   - an existing node that should be expanded, or
   - a new focused node
3. If you update an existing node:
   - preserve the existing structure
   - add the new information in the section where a teammate would expect to find it
4. If you create a new node:
   - place it in the correct category directory
   - add a `## Related` section
   - update the connected nodes so the links are bidirectional when appropriate
5. Keep nodes focused. If a node is growing too large, split it instead of adding another unrelated section.
6. After updating knowledge, search `.backlog/stories/` for stories that reference the changed node and mention any likely follow-on impact.

## Guardrails

- Prefer durable conventions, architecture decisions, operational commands, and domain facts.
- Do not store temporary debugging notes unless they are likely to matter again.
- Write the update so a future agent can use it without knowing the original conversation.
