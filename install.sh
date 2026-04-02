#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KB_HOME="$HOME/.kb"
CLAUDE_COMMANDS="$HOME/.claude/commands"
CODEX_SKILLS="$HOME/.agents/skills"
GH_PROMPTS="$HOME/.github/prompts"

SCOPE=""
INSTALL_PATH=""
TARGETS_SET=0
INSTALL_CLAUDE=0
INSTALL_CODEX=0
INSTALL_GH=0

usage() {
  cat <<'EOF'
KB System installer

Usage:
  bash install.sh
  bash install.sh --local|--global [--claude] [--codex] [--gh] [--path /target/project]
  bash install.sh --scope local|global --targets claude|codex|gh|claude,codex,gh

Examples:
  bash install.sh
  bash install.sh --local --claude
  bash install.sh --local --codex --path ~/code/my-project
  bash install.sh --local --gh
  bash install.sh --global --codex
  bash install.sh --scope global --targets claude,codex,gh

If you run without flags in an interactive terminal, the installer will ask what to install.
`--path` only applies to local installs. If omitted, local install defaults to the current directory.
EOF
}

set_targets() {
  local raw="$1"
  local normalized
  normalized="$(echo "$raw" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"

  TARGETS_SET=1
  INSTALL_CLAUDE=0
  INSTALL_CODEX=0
  INSTALL_GH=0

  IFS=',' read -r -a parts <<< "$normalized"
  for part in "${parts[@]}"; do
    case "$part" in
      all)
        INSTALL_CLAUDE=1
        INSTALL_CODEX=1
        INSTALL_GH=1
        ;;
      both|claude+codex|codex+claude)
        INSTALL_CLAUDE=1
        INSTALL_CODEX=1
        ;;
      claude)
        INSTALL_CLAUDE=1
        ;;
      codex)
        INSTALL_CODEX=1
        ;;
      gh|github)
        INSTALL_GH=1
        ;;
      "")
        ;;
      *)
        echo "Unknown target: $part" >&2
        usage
        exit 1
        ;;
    esac
  done

  if [ "$INSTALL_CLAUDE" -eq 0 ] && [ "$INSTALL_CODEX" -eq 0 ] && [ "$INSTALL_GH" -eq 0 ]; then
    echo "At least one target must be selected." >&2
    usage
    exit 1
  fi
}

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --local)
        SCOPE="local"
        shift
        ;;
      --global)
        SCOPE="global"
        shift
        ;;
      --path)
        if [ $# -lt 2 ]; then
          echo "--path requires a value." >&2
          exit 1
        fi
        INSTALL_PATH="$2"
        shift 2
        ;;
      --path=*)
        INSTALL_PATH="${1#*=}"
        shift
        ;;
      --scope)
        if [ $# -lt 2 ]; then
          echo "--scope requires a value." >&2
          exit 1
        fi
        SCOPE="$2"
        shift 2
        ;;
      --scope=*)
        SCOPE="${1#*=}"
        shift
        ;;
      --targets)
        if [ $# -lt 2 ]; then
          echo "--targets requires a value." >&2
          exit 1
        fi
        set_targets "$2"
        shift 2
        ;;
      --targets=*)
        set_targets "${1#*=}"
        shift
        ;;
      --claude)
        TARGETS_SET=1
        INSTALL_CLAUDE=1
        shift
        ;;
      --codex)
        TARGETS_SET=1
        INSTALL_CODEX=1
        shift
        ;;
      --gh|--github)
        TARGETS_SET=1
        INSTALL_GH=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Unknown argument: $1" >&2
        usage
        exit 1
        ;;
    esac
  done
}

prompt_scope() {
  echo "Choose installation scope:"
  echo "  1) Local  — install into the current project"
  echo "  2) Global — install for all projects"
  printf "Enter choice [1-2]: "
  read -r choice

  case "$choice" in
    1|"")
      SCOPE="local"
      ;;
    2)
      SCOPE="global"
      ;;
    *)
      echo "Invalid choice: $choice" >&2
      exit 1
      ;;
  esac
}

prompt_targets() {
  echo "Choose target runtime:"
  echo "  1) Claude + Codex + GitHub Copilot"
  echo "  2) Claude only"
  echo "  3) Codex only"
  echo "  4) GitHub Copilot only"
  echo "  5) Claude + Codex"
  echo "  6) Claude + GitHub Copilot"
  echo "  7) Codex + GitHub Copilot"
  printf "Enter choice [1-7]: "
  read -r choice

  case "$choice" in
    1|"")
      set_targets "claude,codex,gh"
      ;;
    2)
      set_targets "claude"
      ;;
    3)
      set_targets "codex"
      ;;
    4)
      set_targets "gh"
      ;;
    5)
      set_targets "claude,codex"
      ;;
    6)
      set_targets "claude,gh"
      ;;
    7)
      set_targets "codex,gh"
      ;;
    *)
      echo "Invalid choice: $choice" >&2
      exit 1
      ;;
  esac
}

prompt_local_path() {
  printf "Local install path [.] : "
  read -r choice

  if [ -z "$choice" ]; then
    INSTALL_PATH="."
  else
    INSTALL_PATH="$choice"
  fi
}

resolve_defaults() {
  if [ -z "$SCOPE" ]; then
    if [ -t 0 ]; then
      prompt_scope
    else
      SCOPE="local"
      echo "No scope specified and no interactive terminal detected. Defaulting to local install."
    fi
  fi

  if [ "$TARGETS_SET" -eq 0 ]; then
    if [ -t 0 ]; then
      prompt_targets
    else
      set_targets "claude,codex,gh"
      echo "No targets specified and no interactive terminal detected. Defaulting to Claude + Codex + GitHub Copilot."
    fi
  fi

  if [ "$SCOPE" = "local" ] && [ -z "$INSTALL_PATH" ]; then
    if [ -t 0 ]; then
      prompt_local_path
    else
      INSTALL_PATH="."
      echo "No local path specified and no interactive terminal detected. Defaulting to current directory."
    fi
  fi
}

validate_scope() {
  case "$SCOPE" in
    local|global)
      ;;
    *)
      echo "Invalid scope: $SCOPE" >&2
      usage
      exit 1
      ;;
  esac
}

resolve_local_path() {
  local raw_path="$1"
  local parent_dir
  local base_name

  if [ -z "$raw_path" ]; then
    raw_path="."
  fi

  mkdir -p "$raw_path"

  parent_dir="$(dirname "$raw_path")"
  base_name="$(basename "$raw_path")"

  (
    cd "$parent_dir"
    mkdir -p "$base_name"
    cd "$base_name"
    pwd
  )
}

copy_scripts() {
  local destination="$1"
  mkdir -p "$destination"
  cp "$SCRIPT_DIR/.kb/scripts/scan-project.mjs" "$destination/scan-project.mjs"
  cp "$SCRIPT_DIR/.kb/scripts/generate-context-md.mjs" "$destination/generate-context-md.mjs"
  cp "$SCRIPT_DIR/.kb/scripts/generate-claude-md.mjs" "$destination/generate-claude-md.mjs"
  cp "$SCRIPT_DIR/.kb/scripts/generate-working-set-md.mjs" "$destination/generate-working-set-md.mjs"
  cp "$SCRIPT_DIR/.kb/scripts/generate-copilot-md.mjs" "$destination/generate-copilot-md.mjs"
  chmod +x "$destination/"*.mjs
}

install_claude_local() {
  local target_dir="$1"
  mkdir -p "$target_dir/.claude/commands"
  cp "$SCRIPT_DIR/.claude/commands/init-knowledge-graph.md" "$target_dir/.claude/commands/init-knowledge-graph.md"
  cp "$SCRIPT_DIR/.claude/commands/gen.md" "$target_dir/.claude/commands/gen.md"
  cp "$SCRIPT_DIR/.claude/commands/new-story.md" "$target_dir/.claude/commands/new-story.md"
  cp "$SCRIPT_DIR/.claude/commands/learn.md" "$target_dir/.claude/commands/learn.md"
}

install_claude_global() {
  mkdir -p "$CLAUDE_COMMANDS"

  for cmd in init-knowledge-graph gen new-story learn; do
    sed \
      -e "s|\\.kb/scripts/|$KB_HOME/scripts/|g" \
      -e "s|node \\.kb/|node $KB_HOME/|g" \
      -e "s|node ~/|node $HOME/|g" \
      -e "s|~|$HOME|g" \
      "$SCRIPT_DIR/.claude/commands/$cmd.md" > "$CLAUDE_COMMANDS/kb-$cmd.md"
  done
}

install_codex_local() {
  local target_dir="$1"
  mkdir -p "$target_dir/.agents/skills"
  cp -R "$SCRIPT_DIR/.agents/skills/." "$target_dir/.agents/skills/"
}

install_codex_global() {
  mkdir -p "$CODEX_SKILLS"
  cp -R "$SCRIPT_DIR/.agents/skills/." "$CODEX_SKILLS/"
}

install_gh_local() {
  local target_dir="$1"
  mkdir -p "$target_dir/.github/prompts"
  cp "$SCRIPT_DIR/.github/prompts/"kb-*.prompt.md "$target_dir/.github/prompts/"
}

install_gh_global() {
  mkdir -p "$GH_PROMPTS"

  for prompt in kb-init-knowledge-graph kb-gen kb-new-story kb-learn; do
    sed \
      -e "s|\\.kb/scripts/|$KB_HOME/scripts/|g" \
      -e "s|node \\.kb/|node $KB_HOME/|g" \
      -e "s|node ~/|node $HOME/|g" \
      -e "s|~|$HOME|g" \
      "$SCRIPT_DIR/.github/prompts/$prompt.prompt.md" > "$GH_PROMPTS/$prompt.prompt.md"
  done
}

install_local() {
  local target_dir
  target_dir="$(resolve_local_path "$INSTALL_PATH")"

  echo "📚 Installing Knowledge Graph system into this project..."
  echo ""

  mkdir -p "$target_dir/.knowledge/rules"
  mkdir -p "$target_dir/.knowledge/workflows"
  mkdir -p "$target_dir/.knowledge/technology"
  mkdir -p "$target_dir/.knowledge/domain"
  mkdir -p "$target_dir/.knowledge/research"
  mkdir -p "$target_dir/.backlog/epics"
  mkdir -p "$target_dir/.backlog/stories"

  copy_scripts "$target_dir/.kb/scripts"

  if [ "$INSTALL_CLAUDE" -eq 1 ]; then
    install_claude_local "$target_dir"
  fi

  if [ "$INSTALL_CODEX" -eq 1 ]; then
    install_codex_local "$target_dir"
  fi

  if [ "$INSTALL_GH" -eq 1 ]; then
    install_gh_local "$target_dir"
  fi

  echo "✅ Installed locally:"
  echo "   Target: $target_dir"
  echo "   .knowledge/      — your knowledge graph (empty, ready to fill)"
  echo "   .backlog/        — epics and stories"
  echo "   .kb/scripts/     — scanner + context generators"
  if [ "$INSTALL_CLAUDE" -eq 1 ]; then
    echo "   .claude/commands/ — Claude Code slash commands"
  fi
  if [ "$INSTALL_CODEX" -eq 1 ]; then
    echo "   .agents/skills/  — Codex skills"
  fi
  if [ "$INSTALL_GH" -eq 1 ]; then
    echo "   .github/prompts/ — GitHub Copilot prompt files"
  fi
  echo ""
  echo "🚀 Next steps:"
  if [ "$INSTALL_CLAUDE" -eq 1 ]; then
    echo "   Claude Code:"
    echo "     1. Open Claude Code in: $target_dir"
    echo "     2. Run: /project:init-knowledge-graph"
    echo "     3. Claude will scan your project and bootstrap the knowledge graph"
    echo ""
  fi
  if [ "$INSTALL_CODEX" -eq 1 ]; then
    echo "   Codex:"
    echo "     1. Open Codex in: $target_dir"
    echo "     2. Run: \$kb-init-knowledge-graph"
    echo "     3. Codex will scan your project and bootstrap the knowledge graph"
    echo ""
  fi
  if [ "$INSTALL_GH" -eq 1 ]; then
    echo "   GitHub Copilot:"
    echo "     1. Open VS Code / GitHub Copilot in: $target_dir"
    echo "     2. Use prompt: kb-init-knowledge-graph"
    echo "     3. Copilot will scan your project and bootstrap the knowledge graph"
    echo ""
  fi
  echo "💡 Tip: run 'bash install.sh --global' to install reusable assets for all projects"
}

install_global() {
  echo "📚 Installing Knowledge Graph system globally..."
  echo ""

  copy_scripts "$KB_HOME/scripts"

  if [ "$INSTALL_CLAUDE" -eq 1 ]; then
    install_claude_global
  fi

  if [ "$INSTALL_CODEX" -eq 1 ]; then
    install_codex_global
  fi

  if [ "$INSTALL_GH" -eq 1 ]; then
    install_gh_global
  fi

  echo "✅ Installed globally:"
  echo "   $KB_HOME/scripts/ — scanner + context generators"
  if [ "$INSTALL_CLAUDE" -eq 1 ]; then
    echo "   $CLAUDE_COMMANDS/ — Claude Code slash commands"
  fi
  if [ "$INSTALL_CODEX" -eq 1 ]; then
    echo "   $CODEX_SKILLS/ — Codex skills"
  fi
  if [ "$INSTALL_GH" -eq 1 ]; then
    echo "   $GH_PROMPTS/ — GitHub Copilot prompt files"
  fi
  echo ""
  echo "📋 Available globally:"
  if [ "$INSTALL_CLAUDE" -eq 1 ]; then
    echo "   /user:kb-init-knowledge-graph"
    echo "   /user:kb-new-story"
    echo "   /user:kb-gen"
    echo "   /user:kb-learn"
  fi
  if [ "$INSTALL_CODEX" -eq 1 ]; then
    echo "   \$kb-init-knowledge-graph"
    echo "   \$kb-new-story"
    echo "   \$kb-gen STORY-001"
    echo "   \$kb-learn"
  fi
  if [ "$INSTALL_GH" -eq 1 ]; then
    echo "   kb-init-knowledge-graph (prompt file)"
    echo "   kb-new-story (prompt file)"
    echo "   kb-gen (prompt file)"
    echo "   kb-learn (prompt file)"
  fi
}

parse_args "$@"
resolve_defaults
validate_scope

if [ "$SCOPE" = "local" ]; then
  install_local
else
  install_global
fi
