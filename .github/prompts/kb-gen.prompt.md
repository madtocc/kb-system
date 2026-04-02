---
description: 'Generate a focused .github/copilot-instructions.md working set from the KB System for a specific story'
agent: 'agent'
argument-hint: 'story id (e.g. STORY-001)'
tools: ['terminal', 'editFiles']
---

# KB Generate Working Set

Generate a focused working set for a story, then use it as the scoped source of truth for the task.

## Script resolution

1. Prefer repo-local scripts under `.kb/scripts/`.
2. If `.kb/scripts/generate-copilot-md.mjs` is missing, fall back to `$HOME/.kb/scripts/generate-copilot-md.mjs`.
3. If neither exists, but `generate-context-md.mjs` exists in one of those locations, use that with `.github/copilot-instructions.md` as the output file.
4. If no generator exists, stop and explain that the KB System is not installed in this environment.

## Required workflow

1. Resolve the story identifier from the user request. Accept either:
   - a full path under `.backlog/stories/`
   - a partial story id such as `STORY-003`
2. Run the generator so it writes `.github/copilot-instructions.md`:

```bash
node .kb/scripts/generate-copilot-md.mjs <story-path-or-id>
```

3. Read `.github/copilot-instructions.md` before taking implementation actions.
4. Verify that:
   - the right story was selected
   - the knowledge nodes resolved cleanly
   - there are no obvious missing files or broken references
5. If knowledge-node references are missing, warn the user and offer to create stubs or repair the story.
6. If the user asked to implement the story, continue the task using `.github/copilot-instructions.md` as the scoped context. Do not widen scope unless the story itself requires it.
7. If the user only asked to prepare context, stop after generation and report the story title plus any problems you found.

## Guardrails

- Treat the story and inlined knowledge as the working contract for the task.
- If the generated context is too large, recommend splitting the story or reducing linked nodes.
- Keep `.github/copilot-instructions.md` disposable. Regenerate it instead of editing it manually.
