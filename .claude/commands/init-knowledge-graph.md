# Init Knowledge Graph

Analyze this project and bootstrap a markdown knowledge graph from the existing codebase.

## Step 1: Scan the project

Run the scanner script to extract project signals:

```bash
node .kb/scripts/scan-project.mjs
```

Read the output carefully. It contains the detected stack, folder structure, config files, existing docs, and patterns.

## Step 2: Create .knowledge/ structure

Based on the scan results, create these knowledge nodes. Each file should be 50-150 lines of markdown, with a `## Related` section linking to other nodes using relative paths.

### Required nodes (always create these):

**`.knowledge/rules/code-style.md`**
- Infer from: eslint/prettier configs, tsconfig strictness, existing code patterns
- Include: naming conventions, formatting, comment policy, import style

**`.knowledge/rules/api-conventions.md`** (if project has an API)
- Infer from: route files, middleware, error handling patterns
- Include: URL patterns, error format, auth approach, validation

**`.knowledge/technology/stack.md`**
- Infer from: package.json, lockfile, Dockerfile, CI configs
- Include: every major dependency with version, why it's there

**`.knowledge/technology/architecture.md`**
- Infer from: folder structure, import patterns, module boundaries
- Include: directory layout with purpose of each folder, dependency rule

**`.knowledge/workflows/testing.md`**
- Infer from: test files, jest/vitest config, CI pipeline
- Include: test strategy, file naming, frameworks used, coverage expectations

**`.knowledge/workflows/deploy.md`**
- Infer from: CI/CD configs, Dockerfile, vercel.json, scripts in package.json
- Include: how to deploy, environments, branch strategy

### Conditional nodes (create if relevant):

**`.knowledge/technology/database.md`** — if prisma/drizzle/supabase/mongo detected
**`.knowledge/technology/auth.md`** — if auth provider detected
**`.knowledge/technology/infra.md`** — if AWS/GCP/Vercel infra configs found
**`.knowledge/domain/{concept}.md`** — one per major domain entity found in the codebase
**`.knowledge/rules/components.md`** — if React/Vue/Svelte UI project
**`.knowledge/workflows/local-dev.md`** — from README setup instructions
**`.knowledge/research/`** — leave empty, user fills as they research

## Step 3: Create initial backlog

Look at the codebase for TODO comments, open issues (if .github present), and incomplete features. Create:

**`.backlog/epics/EPIC-001-current-work.md`**
- A catch-all epic for whatever seems to be in progress
- Reference the relevant knowledge nodes

**`.backlog/stories/STORY-001-example.md`**
- One concrete example story based on something real in the codebase (a TODO, a missing test, an incomplete feature)
- Include the Knowledge Nodes section with paths to relevant .knowledge/ files
- Include Tasks, Acceptance Criteria, and Scope Boundaries

## Step 4: Install the generator

Verify `.kb/scripts/generate-claude-md.mjs` exists and works:

```bash
node .kb/scripts/generate-claude-md.mjs .backlog/stories/STORY-001-example.md
```

Check that it produces a reasonable CLAUDE.md.

## Step 5: Summary

Print a summary of:
- How many knowledge nodes were created
- What was detected vs what was inferred
- Any gaps the user should fill in manually
- How to use the system going forward

Remind the user:
- Run `/project:gen` to generate CLAUDE.md for any story
- Run `/project:new-story` to create new stories
- Knowledge nodes should be updated as the project evolves
- Commit `.knowledge/` and `.backlog/` to git
