# KB System — Knowledge Graph for AI-Driven Development

Markdown files in a graph structure. Human readable, AI native. Break work into small stories, generate focused working-context files, ship.

## Install

Run a single installer and either answer the prompts or pass flags.

### Interactive

```bash
bash install.sh
```

The installer will ask:
- local or global install
- Claude, Codex, GitHub Copilot, or any combination

### Non-interactive examples

```bash
bash install.sh --local --claude
bash install.sh --local --codex
bash install.sh --local --gh
bash install.sh --local --codex --path ~/code/my-project
bash install.sh --global --claude --codex --gh
bash install.sh --scope global --targets claude,codex,gh
```

### Claude Code

| Command | What it does |
|---|---|
| `/user:kb-init-knowledge-graph` | Scan codebase and bootstrap knowledge graph |
| `/user:kb-new-story Add profile editing` | Create a scoped story with knowledge references |
| `/user:kb-gen STORY-003` | Generate CLAUDE.md pulling only relevant knowledge |
| `/user:kb-learn We use cursor pagination` | Update knowledge nodes from discoveries |

### Codex

Invoke the same workflows as skills:

| Skill | What it does |
|---|---|
| `$kb-init-knowledge-graph` | Scan codebase and bootstrap knowledge graph |
| `$kb-new-story Add profile editing` | Create a scoped story with knowledge references |
| `$kb-gen STORY-003` | Generate WORKING_SET.md pulling only relevant knowledge |
| `$kb-learn We use cursor pagination` | Update knowledge nodes from discoveries |

### GitHub Copilot

Invoke via prompt files in VS Code or any GitHub Copilot-enabled editor:

| Prompt file | What it does |
|---|---|
| `kb-init-knowledge-graph` | Scan codebase and bootstrap knowledge graph |
| `kb-new-story Add profile editing` | Create a scoped story with knowledge references |
| `kb-gen STORY-003` | Generate `.github/copilot-instructions.md` pulling only relevant knowledge |
| `kb-learn We use cursor pagination` | Update knowledge nodes from discoveries |

### Per-project

Local install adds:
- `.claude/commands/` for Claude Code
- `.agents/skills/` for Codex
- `.github/prompts/` for GitHub Copilot
- `.kb/scripts/` for all

Claude commands are available as `/project:*`. Codex skills are available in the repo via `$kb-*` and, in the Codex app, appear in the slash-command list as well. GitHub Copilot prompt files are available in VS Code via the prompt file picker.

Global install adds:
- `~/.claude/commands/` for Claude Code
- `~/.agents/skills/` for Codex
- `~/.github/prompts/` for GitHub Copilot
- `~/.kb/scripts/` for shared generator scripts

If you choose `local`, the installer defaults to the current directory. You can override that with `--path /absolute/or/relative/project-path`.

## Workflow

### First time (once per project)

#### Claude Code

1. Open Claude Code in your project
2. Run `/user:kb-init-knowledge-graph`
3. Claude scans your codebase and generates `.knowledge/` nodes automatically

#### Codex

1. Open Codex in your project
2. Run `$kb-init-knowledge-graph`
3. Codex scans your codebase and generates `.knowledge/` nodes automatically

#### GitHub Copilot

1. Open VS Code in your project
2. Use prompt file `kb-init-knowledge-graph`
3. Copilot scans your codebase and generates `.knowledge/` nodes automatically

### Daily loop

#### Claude Code

```text
/user:kb-new-story <description>   -> create a scoped story
/user:kb-gen STORY-NNN             -> generate focused CLAUDE.md
"Work on the tasks in CLAUDE.md"   -> code with focused context
/user:kb-learn <insight>           -> optional: capture what you learned
```

#### Codex

```text
$kb-new-story <description>        -> create a scoped story
$kb-gen STORY-NNN                  -> generate focused WORKING_SET.md
"Work on the tasks in WORKING_SET.md" -> code with focused context
$kb-learn <insight>                -> optional: capture what you learned
```

#### GitHub Copilot

```text
kb-new-story <description>         -> create a scoped story
kb-gen STORY-NNN                   -> generate focused .github/copilot-instructions.md
"Work on the story"                -> code with auto-loaded context
kb-learn <insight>                 -> optional: capture what you learned
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

Small stories (1-3 hours) mean each working-context file only needs 5-8 knowledge nodes (~500-1500 tokens). Context stays focused, which is where LLMs perform best. You ship piece by piece instead of trying to cram everything into one massive prompt.

The knowledge base grows with your project. Every time you learn something, `kb-learn` captures it. Every new story benefits from everything you've learned before.

## Add to .gitignore

```
# Generated — regenerate per story
CLAUDE.md
WORKING_SET.md
.github/copilot-instructions.md
```

Commit everything else (`.knowledge/`, `.backlog/`).
