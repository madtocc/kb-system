# KB System — Knowledge Graph for AI-Driven Development

Markdown files in a graph structure. Human readable, AI native. Break work into small stories, generate focused CLAUDE.md files, ship.

## Install

### Global (recommended — available in any project)

```bash
bash install.sh --global
```

Commands become available as `/user:kb-*` in any project:

| Command | What it does |
|---|---|
| `/user:kb-init-knowledge-graph` | Scan codebase and bootstrap knowledge graph |
| `/user:kb-new-story Add profile editing` | Create a scoped story with knowledge references |
| `/user:kb-gen STORY-003` | Generate CLAUDE.md pulling only relevant knowledge |
| `/user:kb-learn We use cursor pagination` | Update knowledge nodes from discoveries |

### Per-project

```bash
bash install.sh
```

Same commands, available as `/project:*` instead.

## Workflow

### First time (once per project)

1. Open Claude Code in your project
2. Run `/user:kb-init-knowledge-graph`
3. Claude scans your codebase and generates `.knowledge/` nodes automatically

### Daily loop

```
/user:kb-new-story <description>   → create a scoped story
/user:kb-gen STORY-NNN             → generate focused CLAUDE.md
"Work on the tasks in CLAUDE.md"   → code with focused context
/user:kb-learn <insight>           → optional: capture what you learned
```

Start a fresh session per story for the cleanest context.

## How It Works

```
.knowledge/          ← markdown graph (nodes link to each other)
  rules/             ← code style, API conventions, component rules
  technology/        ← stack, architecture, database, infra
  domain/            ← business entities, concepts, data models
  workflows/         ← testing, deploy, local dev, PR review
  research/          ← spikes, evaluations, ADRs

.backlog/            ← work breakdown
  epics/             ← groups of related stories
  stories/           ← small units of work (1-3 hours each)
```

Every knowledge node links to related nodes via standard markdown links. The generator follows these links one hop deep, so related context gets pulled in automatically.

## Why This Works

Small stories (1-3 hours) mean each CLAUDE.md only needs 5-8 knowledge nodes (~500-1500 tokens). Context stays focused, which is where LLMs perform best. You ship piece by piece instead of trying to cram everything into one massive prompt.

The knowledge base grows with your project. Every time you learn something, `/user:kb-learn` captures it. Every new story benefits from everything you've learned before.

## Add to .gitignore

```
# Generated — regenerate per story
CLAUDE.md
```

Commit everything else (`.knowledge/`, `.backlog/`).
