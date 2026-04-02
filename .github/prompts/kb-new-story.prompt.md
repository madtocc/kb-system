---
description: 'Create a new scoped story in .backlog/stories with knowledge-node references'
agent: 'agent'
argument-hint: 'describe the work (e.g. Add user profile editing)'
tools: ['terminal', 'editFiles']
---

# KB New Story

Create a new story file under `.backlog/stories/` that is small, testable, and linked to the most relevant knowledge nodes.

## Required workflow

1. Find the next story number from `.backlog/stories/`.
2. Read the existing `.knowledge/` tree before picking references.
3. Pick 3-7 knowledge nodes that are directly relevant to the request.
4. Always include these if they exist:
   - `.knowledge/rules/code-style.md`
   - `.knowledge/technology/architecture.md`
   - `.knowledge/workflows/testing.md`
5. Reuse an existing epic when it fits. If none fits, create a new epic first.
6. Create `.backlog/stories/STORY-{NNN}-{slug}.md` with this structure:

```markdown
# STORY-{NNN}: {Title}

## Epic
[{Epic Name}](../epics/{epic-file}.md)

## Description
{User story format if possible}

## Knowledge Nodes
- .knowledge/rules/code-style.md
- .knowledge/technology/architecture.md
- .knowledge/workflows/testing.md

## Tasks
1. {Concrete task}
2. {Concrete task}
3. {Verification or tests}

## Acceptance Criteria
- [ ] {Specific, testable criterion}
- [ ] {Specific, testable criterion}
- [ ] Tests pass

## Scope Boundaries
- {Out-of-scope item}
- {Deferred item}
```

## Guardrails

- Keep the story small. If it looks larger than 1-3 hours, split it before writing.
- Tasks should describe implementation work, not vague goals.
- Acceptance criteria must be testable.
- Scope boundaries should be explicit so the story stays focused.
- If the user asks, offer to generate the working set next with `kb-gen`.
