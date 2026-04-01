#!/bin/bash

# install-global.sh
# Installs the knowledge graph system globally for Claude Code.
# Commands become available as /user:init-knowledge-graph, /user:gen, etc.
#
# Usage:
#   bash install-global.sh

set -e

KB_HOME="$HOME/.kb"
CLAUDE_COMMANDS="$HOME/.claude/commands"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📚 Installing Knowledge Graph system globally..."
echo ""

# Create global directories
mkdir -p "$KB_HOME/scripts"
mkdir -p "$CLAUDE_COMMANDS"

# Copy scripts to global location
cp "$SCRIPT_DIR/.kb/scripts/scan-project.mjs" "$KB_HOME/scripts/scan-project.mjs"
cp "$SCRIPT_DIR/.kb/scripts/generate-claude-md.mjs" "$KB_HOME/scripts/generate-claude-md.mjs"
chmod +x "$KB_HOME/scripts/"*.mjs

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
echo "   $KB_HOME/scripts/         — scanner + CLAUDE.md generator"
echo "   $CLAUDE_COMMANDS/kb-*.md  — Claude Code slash commands"
echo ""
echo "📋 Available commands (in any project):"
echo "   /user:kb-init-knowledge-graph  — bootstrap knowledge graph"
echo "   /user:kb-new-story             — create a new story"
echo "   /user:kb-gen                   — generate CLAUDE.md for a story"
echo "   /user:kb-learn                 — add knowledge from discoveries"
echo ""
echo "🚀 Next steps:"
echo "   1. Open Claude Code in any project"
echo "   2. Run: /user:kb-init-knowledge-graph"
echo "   3. Claude will create .knowledge/ and .backlog/ in that project"
