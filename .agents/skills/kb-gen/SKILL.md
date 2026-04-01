---
name: kb-gen
description: Generate a focused story working set from the KB System and read it before implementation. Use when the user wants to prepare context for a specific story in .backlog/stories or begin work on that story with minimal context drift. Do not use when there is no story identifier or backlog story to anchor the work.
---

# KB Generate Working Set

Generate a focused working set for a story, then use it as the scoped source of truth for the task.

## Script resolution

1. Prefer repo-local scripts under `.kb/scripts/`.
2. If `.kb/scripts/generate-working-set-md.mjs` is missing, fall back to `$HOME/.kb/scripts/generate-working-set-md.mjs`.
3. If neither exists, but `generate-context-md.mjs` exists in one of those locations, use that with `WORKING_SET.md` as the output file.
4. If no generator exists, stop and explain that the KB System is not installed in this environment.

## Required workflow

1. Resolve the story identifier from the user request. Accept either:
   - a full path under `.backlog/stories/`
   - a partial story id such as `STORY-003`
2. Run the generator so it writes `WORKING_SET.md`.
3. Read `WORKING_SET.md` before taking implementation actions.
4. Verify that:
   - the right story was selected
   - the knowledge nodes resolved cleanly
   - there are no obvious missing files or broken references
5. If knowledge-node references are missing, warn the user and offer to create stubs or repair the story.
6. If the user asked to implement the story, continue the task using `WORKING_SET.md` as the scoped context. Do not widen scope unless the story itself requires it.
7. If the user only asked to prepare context, stop after generation and report the story title plus any problems you found.

## Guardrails

- Treat the story and inlined knowledge as the working contract for the task.
- If the generated context is too large, recommend splitting the story or reducing linked nodes.
- Keep `WORKING_SET.md` disposable. Regenerate it instead of editing it manually.
