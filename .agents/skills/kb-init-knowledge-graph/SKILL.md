---
name: kb-init-knowledge-graph
description: Bootstrap or refresh the KB System in the current project by scanning the codebase and creating starter files under .knowledge/ and .backlog/. Use when the user wants to initialize, repair, or regenerate the project knowledge graph. Do not use for ordinary feature work unless the user explicitly asks to set up or fix the KB workflow.
---

# KB Init Knowledge Graph

Initialize the KB System for the current project by scanning the repository, creating durable knowledge nodes, and seeding the backlog with one realistic starter story.

## Script resolution

1. Prefer repo-local scripts under `.kb/scripts/`.
2. If `.kb/scripts/scan-project.mjs` is missing, fall back to `$HOME/.kb/scripts/scan-project.mjs`.
3. If neither path exists, stop and explain that the KB System is not installed in this environment.

## Required workflow

1. Run the scanner script and read the output carefully. Treat the scan as evidence, not the final truth.
2. Create or refresh these baseline nodes. Each file should stay focused and include a `## Related` section with relative markdown links:
   - `.knowledge/rules/code-style.md`
   - `.knowledge/rules/api-conventions.md` if the project has an API
   - `.knowledge/technology/stack.md`
   - `.knowledge/technology/architecture.md`
   - `.knowledge/workflows/testing.md`
   - `.knowledge/workflows/deploy.md`
3. For `.knowledge/workflows/testing.md`, always include:
   - the exact command to run the full test suite
   - the exact command to run a single test file, if the stack supports it
4. Create conditional nodes when the scan justifies them:
   - `.knowledge/technology/database.md`
   - `.knowledge/technology/auth.md`
   - `.knowledge/technology/infra.md`
   - `.knowledge/domain/{concept}.md`
   - `.knowledge/rules/components.md`
   - `.knowledge/workflows/local-dev.md`
5. Seed the backlog with:
   - `.backlog/epics/EPIC-001-current-work.md`
   - `.backlog/stories/STORY-001-example.md`
6. The starter story must be grounded in something real from the codebase: a TODO, a missing test, an unfinished integration, or a concrete cleanup item.
7. If a generator script is available, run it against the example story to make sure the story references resolve cleanly.
8. End with a short summary:
   - what was detected directly
   - what was inferred
   - what still needs human follow-up
   - how to use `kb-new-story`, `kb-gen`, and `kb-learn` next

## Quality bar

- Keep knowledge nodes factual and repo-specific.
- Prefer explicit commands, file paths, and conventions over broad summaries.
- If the scan is ambiguous, say so instead of pretending certainty.
- Keep the story small enough for roughly 1-3 hours of work.
