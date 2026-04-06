# New Story

Create a new story in the backlog with proper knowledge node references.

## Usage

The user describes what they want to build: `/project:new-story Add user profile editing`

## Steps

1. Find the next story number:

```bash
ls .backlog/stories/ | sort -V | tail -1
```

Increment the number (e.g., STORY-003 → STORY-004).

2. Analyze the user's description against existing knowledge nodes:

```bash
ls -R .knowledge/
```

3. Determine which knowledge nodes are relevant to this story. Pick 3-7 nodes max. Always include `code-style.md`, `architecture.md`, and `workflows/testing.md` if they exist.

4. Find or create an appropriate epic. If none fits, create a new one.

5. Create the story file at `.backlog/stories/STORY-{NNN}-{slug}.md` with this structure:

```markdown
# STORY-{NNN}: {Title}

## Epic
[{Epic Name}](../epics/{epic-file}.md)

## Description
{User story format: As a ___, I want ___, so that ___}
{If the user didn't provide this format, infer it from their description}

## Knowledge Nodes
- .knowledge/rules/code-style.md
- .knowledge/technology/architecture.md
- {other relevant nodes}

## Tasks
1. {Concrete implementation task}
2. {Next task}
3. {Write tests}

## Acceptance Criteria
- [ ] {Specific, testable criterion}
- [ ] {Another criterion}
- [ ] Tests pass

## Scope Boundaries
- {What this story does NOT include}
- {Defer to future stories}
```

6. If the user's description implies a large task, suggest splitting into multiple focused stories and ask which one to start with.

7. After creating the story, ask: "Want me to generate the CLAUDE.md for this story now?"
