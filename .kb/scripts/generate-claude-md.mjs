#!/usr/bin/env node

/**
 * generate-claude-md.mjs
 *
 * Reads a story file, resolves its knowledge nodes (+ one level deep),
 * and generates a focused CLAUDE.md scoped to that story.
 *
 * Usage:
 *   node .kb/scripts/generate-claude-md.mjs .backlog/stories/STORY-001-user-invitation.md
 *   node .kb/scripts/generate-claude-md.mjs STORY-001  (fuzzy match)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { resolve, dirname, basename, join } from "path";

const ROOT = process.cwd();
const STORIES_DIR = join(ROOT, ".backlog", "stories");

// --- Helpers ---

function readFile(path) {
  const full = resolve(ROOT, path);
  if (!existsSync(full)) {
    console.warn(`  ⚠ Not found: ${path}`);
    return null;
  }
  return readFileSync(full, "utf-8");
}

function resolveStoryPath(input) {
  // Direct path
  if (existsSync(resolve(ROOT, input))) return input;

  // Fuzzy match in stories dir
  if (existsSync(STORIES_DIR)) {
    const files = readdirSync(STORIES_DIR);
    const match = files.find(f =>
      f.toLowerCase().includes(input.toLowerCase())
    );
    if (match) return join(".backlog", "stories", match);
  }

  return null;
}

function extractKnowledgeNodes(content) {
  const nodes = [];
  const lines = content.split("\n");
  let inSection = false;

  for (const line of lines) {
    if (line.startsWith("## Knowledge Nodes")) { inSection = true; continue; }
    if (inSection && line.startsWith("## ")) break;
    if (inSection && line.startsWith("- ")) {
      const node = line.replace(/^- /, "").trim();
      if (node.endsWith(".md")) nodes.push(node);
    }
  }
  return nodes;
}

function extractRelatedLinks(content, fromPath) {
  const links = [];
  const dir = dirname(fromPath);
  const regex = /\[.*?\]\((\.\.?\/[^)]+\.md)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const resolved = resolve(ROOT, dir, match[1]);
    const relative = resolved.replace(ROOT + "/", "");
    links.push(relative);
  }
  return links;
}

function extractStoryMeta(content) {
  const get = (section) =>
    content.match(new RegExp(`## ${section}\\n([\\s\\S]*?)(?=\\n## |\\n*$)`))?.[1]?.trim() || "";

  return {
    title: content.match(/^# (.+)/m)?.[1] || "Untitled Story",
    description: get("Description"),
    tasks: get("Tasks"),
    acceptance: get("Acceptance Criteria"),
    boundaries: get("Scope Boundaries"),
  };
}

function buildClaudeMd(meta, storyPath, nodeContents) {
  const sections = [];

  sections.push(`# ${meta.title}`);
  sections.push(`> Generated from \`${storyPath}\` — delete and regenerate anytime\n`);

  if (meta.description) sections.push(`## What We're Building\n\n${meta.description}\n`);
  if (meta.tasks) sections.push(`## Tasks\n\n${meta.tasks}\n`);
  if (meta.acceptance) sections.push(`## Done When\n\n${meta.acceptance}\n`);
  if (meta.boundaries) sections.push(`## Out of Scope\n\n${meta.boundaries}\n`);

  sections.push(`---\n\n## Project Knowledge\n`);
  sections.push(`Follow these as ground truth for this project.\n`);

  // Group by category
  const grouped = {};
  for (const [path, content] of nodeContents) {
    const parts = path.split("/");
    const category = parts.length > 1 ? parts[1] : "other";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({ path, content });
  }

  // Order: rules first, then technology, domain, workflows, rest
  const order = ["rules", "technology", "domain", "workflows"];
  const sorted = [
    ...order.filter(k => grouped[k]),
    ...Object.keys(grouped).filter(k => !order.includes(k)),
  ];

  for (const category of sorted) {
    sections.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);
    for (const { path, content } of grouped[category]) {
      const body = content.replace(/^# .+\n+/, "").trim();
      // Strip the Related section to save tokens — links were already resolved
      const cleaned = body.replace(/## Related[\s\S]*$/, "").trim();
      sections.push(`#### ${basename(path, ".md")}\n\n${cleaned}\n`);
    }
  }

  return sections.join("\n");
}

// --- Main ---

function main() {
  const input = process.argv[2];
  if (!input) {
    console.log("Usage: node .kb/scripts/generate-claude-md.mjs <story-path-or-id>");
    console.log("Examples:");
    console.log("  node .kb/scripts/generate-claude-md.mjs .backlog/stories/STORY-001-user-invitation.md");
    console.log("  node .kb/scripts/generate-claude-md.mjs STORY-001");
    process.exit(1);
  }

  const storyPath = resolveStoryPath(input);
  if (!storyPath) {
    console.error(`❌ Story not found: ${input}`);
    console.log("Available stories:");
    if (existsSync(STORIES_DIR)) {
      readdirSync(STORIES_DIR).forEach(f => console.log(`  - ${f}`));
    }
    process.exit(1);
  }

  console.log(`\n📖 Story: ${storyPath}`);
  const storyContent = readFile(storyPath);
  if (!storyContent) process.exit(1);

  const meta = extractStoryMeta(storyContent);
  const directNodes = extractKnowledgeNodes(storyContent);
  console.log(`📌 Direct nodes: ${directNodes.length}`);

  // Resolve nodes + one hop
  const allNodePaths = new Set(directNodes);
  const nodeContents = new Map();

  for (const node of directNodes) {
    const content = readFile(node);
    if (content) {
      nodeContents.set(node, content);
      for (const link of extractRelatedLinks(content, node)) {
        allNodePaths.add(link);
      }
    }
  }

  // Load 1-hop nodes
  for (const node of allNodePaths) {
    if (!nodeContents.has(node)) {
      const content = readFile(node);
      if (content) nodeContents.set(node, content);
    }
  }

  console.log(`🔗 Total nodes (1-hop): ${nodeContents.size}`);

  const totalChars = [...nodeContents.values()].reduce((s, c) => s + c.length, 0);
  const estimatedTokens = Math.round(totalChars / 4);
  console.log(`📊 ~${estimatedTokens} tokens of context`);

  if (estimatedTokens > 3000) {
    console.warn(`⚠️  Context is getting large. Consider splitting knowledge nodes or reducing story scope.`);
  }

  const claudeMd = buildClaudeMd(meta, storyPath, nodeContents);
  writeFileSync(resolve(ROOT, "CLAUDE.md"), claudeMd);
  console.log(`\n✅ CLAUDE.md generated for: ${meta.title}`);
  console.log(`   ${claudeMd.split("\n").length} lines, ~${estimatedTokens} tokens`);
}

main();
