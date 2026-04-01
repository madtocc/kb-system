#!/bin/bash

# install-global.sh
# Installs the knowledge graph system globally for Claude Code and Codex.
#
# Usage:
#   bash install-global.sh

set -e

KB_HOME="$HOME/.kb"
CLAUDE_COMMANDS="$HOME/.claude/commands"
CODEX_SKILLS="$HOME/.agents/skills"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📚 Installing Knowledge Graph system globally..."
echo ""

# Create global directories
mkdir -p "$KB_HOME/scripts"
mkdir -p "$CLAUDE_COMMANDS"
mkdir -p "$CODEX_SKILLS"

# Copy scripts to global location
cp "$SCRIPT_DIR/.kb/scripts/scan-project.mjs" "$KB_HOME/scripts/scan-project.mjs"
cp "$SCRIPT_DIR/.kb/scripts/generate-context-md.mjs" "$KB_HOME/scripts/generate-context-md.mjs"
cp "$SCRIPT_DIR/.kb/scripts/generate-claude-md.mjs" "$KB_HOME/scripts/generate-claude-md.mjs"
cp "$SCRIPT_DIR/.kb/scripts/generate-working-set-md.mjs" "$KB_HOME/scripts/generate-working-set-md.mjs"
chmod +x "$KB_HOME/scripts/"*.mjs

# Copy Codex skills to global location
cp -R "$SCRIPT_DIR/.agents/skills/." "$CODEX_SKILLS/"

# Copy commands — rewrite script paths to global location
for cmd in init-knowledge-graph gen new-story learn; do
  sed 's|\.kb/scripts/|~/.kb/scripts/|g; s|node \.kb/|node ~/.kb/|g; s|node ~/|node $HOME/|g' \
    "$SCRIPT_DIR/.claude/commands/$cmd.md" > "$CLAUDE_COMMANDS/kb-$cmd.md"
done

# Fix: sed replaced ~ but we need $HOME expanded at runtime, use literal $HOME
# Actually for markdown command prompts, Claude reads them literally.
# Use the full absolute path instead.
for cmd in kb-init-knowledge-graph kb-gen kb-new-story kb-learn; do
  sed -i '' "s|\\\$HOME|$HOME|g" "$CLAUDE_COMMANDS/$cmd.md"
  sed -i '' "s|~|$HOME|g" "$CLAUDE_COMMANDS/$cmd.md"
done

echo "✅ Installed globally:"
echo "   $KB_HOME/scripts/         — scanner + context generators"
echo "   $CLAUDE_COMMANDS/kb-*.md  — Claude Code slash commands"
echo "   $CODEX_SKILLS/            — Codex skills"
echo ""
echo "📋 Available globally:"
echo "   /user:kb-init-knowledge-graph  — bootstrap knowledge graph"
echo "   /user:kb-new-story             — create a new story"
echo "   /user:kb-gen                   — generate CLAUDE.md for a story"
echo "   /user:kb-learn                 — add knowledge from discoveries"
echo "   \$kb-init-knowledge-graph      — bootstrap knowledge graph in Codex"
echo "   \$kb-new-story                 — create a new story in Codex"
echo "   \$kb-gen STORY-001             — generate WORKING_SET.md in Codex"
echo "   \$kb-learn                     — add knowledge from discoveries in Codex"
echo ""
echo "🚀 Next steps:"
echo "   Claude Code:"
echo "     1. Open Claude Code in any project"
echo "     2. Run: /user:kb-init-knowledge-graph"
echo "     3. Claude will create .knowledge/ and .backlog/ in that project"
echo ""
echo "   Codex:"
echo "     1. Open Codex in any project"
echo "     2. Run: \$kb-init-knowledge-graph"
echo "     3. Codex will create .knowledge/ and .backlog/ in that project"
