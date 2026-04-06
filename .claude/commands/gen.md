# Generate CLAUDE.md

Generate a focused CLAUDE.md for a specific story from the knowledge graph.

## Usage

The user should provide a story path as an argument: `/project:gen STORY-001`

## Steps

1. Find the story file. If the user gave a partial name like `STORY-001`, search in `.backlog/stories/` for a match:

```bash
ls .backlog/stories/ | grep -i "$ARGUMENTS"
```

2. Run the generator:

```bash
node .kb/scripts/generate-claude-md.mjs .backlog/stories/<matched-file>
```

3. Read the generated CLAUDE.md and verify it looks right. Check:
   - Story context is at the top
   - Knowledge nodes are inlined below
   - No broken references or missing nodes
   - Estimated token count is reasonable (aim for under 2000 tokens)

4. If any knowledge nodes referenced in the story don't exist, warn the user and offer to create stubs.

5. Print: "CLAUDE.md generated. Ready to work on: {story title}"

## On story completion

When the story's acceptance criteria are met and the work is done:

1. Review the changes made during implementation for new conventions, architecture decisions, or domain facts worth capturing.
2. Automatically update the knowledge graph following the `learn` workflow for each durable discovery — do not wait for the user to run it manually.
3. Skip anything temporary, debugging-only, or already captured in the knowledge graph.
