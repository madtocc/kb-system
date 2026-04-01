#!/bin/bash

# install.sh
# Adds the knowledge graph system to your existing project.
#
# Usage:
#   bash install.sh            — install into current project (per-project)
#   bash install.sh --global   — install globally for all projects
#
# Per-project:
#   - Claude Code commands available as /project:*
#   - Codex skills available from .agents/skills
# Global:
#   - Claude Code commands available as /user:kb-*
#   - Codex skills available from $HOME/.agents/skills

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$1" = "--global" ]; then
  exec bash "$SCRIPT_DIR/install-global.sh"
fi

echo "📚 Installing Knowledge Graph system into this project..."
echo ""

# Create directories
mkdir -p .knowledge/rules
mkdir -p .knowledge/workflows
mkdir -p .knowledge/technology
mkdir -p .knowledge/domain
mkdir -p .knowledge/research
mkdir -p .backlog/epics
mkdir -p .backlog/stories
mkdir -p .kb/scripts
mkdir -p .claude/commands
mkdir -p .agents/skills

# Copy scripts
cp "$SCRIPT_DIR/.kb/scripts/scan-project.mjs" .kb/scripts/scan-project.mjs
cp "$SCRIPT_DIR/.kb/scripts/generate-context-md.mjs" .kb/scripts/generate-context-md.mjs
cp "$SCRIPT_DIR/.kb/scripts/generate-claude-md.mjs" .kb/scripts/generate-claude-md.mjs
cp "$SCRIPT_DIR/.kb/scripts/generate-working-set-md.mjs" .kb/scripts/generate-working-set-md.mjs

# Copy slash commands
cp "$SCRIPT_DIR/.claude/commands/init-knowledge-graph.md" .claude/commands/init-knowledge-graph.md
cp "$SCRIPT_DIR/.claude/commands/gen.md" .claude/commands/gen.md
cp "$SCRIPT_DIR/.claude/commands/new-story.md" .claude/commands/new-story.md
cp "$SCRIPT_DIR/.claude/commands/learn.md" .claude/commands/learn.md

# Copy Codex skills
cp -R "$SCRIPT_DIR/.agents/skills/." .agents/skills/

# Make scripts executable
chmod +x .kb/scripts/*.mjs

echo "✅ Installed:"
echo "   .knowledge/     — your knowledge graph (empty, ready to fill)"
echo "   .backlog/        — epics and stories"
echo "   .kb/scripts/     — scanner + context generators"
echo "   .claude/commands/ — Claude Code slash commands"
echo "   .agents/skills/  — Codex skills"
echo ""
echo "🚀 Next steps:"
echo "   Claude Code:"
echo "     1. Open Claude Code in this project"
echo "     2. Run: /project:init-knowledge-graph"
echo "     3. Claude will scan your project and bootstrap the knowledge graph"
echo ""
echo "   Codex:"
echo "     1. Open Codex in this project"
echo "     2. Run: \$kb-init-knowledge-graph"
echo "     3. Codex will scan your project and bootstrap the knowledge graph"
echo ""
echo "📖 After setup:"
echo "   Claude: /project:new-story, /project:gen STORY-001, /project:learn"
echo "   Codex:  \$kb-new-story, \$kb-gen STORY-001, \$kb-learn"
echo ""
echo "💡 Tip: use 'bash install.sh --global' to install for all projects"
