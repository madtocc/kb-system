#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { resolve, dirname, basename, join, relative as relativePath } from "path";
import { fileURLToPath } from "url";

function readProjectFile(root, filePath) {
  const fullPath = resolve(root, filePath);
  if (!existsSync(fullPath)) {
    console.warn(`  Warning: not found: ${filePath}`);
    return null;
  }
  return readFileSync(fullPath, "utf-8");
}

function resolveStoryPath(root, input) {
  const storiesDir = join(root, ".backlog", "stories");

  if (existsSync(resolve(root, input))) {
    return input;
  }

  if (!existsSync(storiesDir)) {
    return null;
  }

  const files = readdirSync(storiesDir);
  const match = files.find((file) => file.toLowerCase().includes(input.toLowerCase()));
  if (!match) {
    return null;
  }

  return join(".backlog", "stories", match);
}

function extractKnowledgeNodes(content) {
  const nodes = [];
  const lines = content.split("\n");
  let inSection = false;

  for (const line of lines) {
    if (line.startsWith("## Knowledge Nodes")) {
      inSection = true;
      continue;
    }

    if (inSection && line.startsWith("## ")) {
      break;
    }

    if (inSection && line.startsWith("- ")) {
      const node = line.replace(/^- /, "").trim();
      if (node.endsWith(".md")) {
        nodes.push(node);
      }
    }
  }

  return nodes;
}

function extractRelatedLinks(root, content, fromPath) {
  const links = [];
  const sourceDir = dirname(fromPath);
  const regex = /\[.*?\]\((\.\.?\/[^)]+\.md)\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const absolutePath = resolve(root, sourceDir, match[1]);
    const projectRelativePath = relativePath(root, absolutePath);
    if (!projectRelativePath.startsWith("..")) {
      links.push(projectRelativePath);
    }
  }

  return links;
}

function extractStorySection(content, section) {
  return content.match(new RegExp(`## ${section}\\n([\\s\\S]*?)(?=\\n## |\\n*$)`))?.[1]?.trim() || "";
}

function extractStoryMeta(content) {
  return {
    title: content.match(/^# (.+)/m)?.[1] || "Untitled Story",
    description: extractStorySection(content, "Description"),
    tasks: extractStorySection(content, "Tasks"),
    acceptance: extractStorySection(content, "Acceptance Criteria"),
    boundaries: extractStorySection(content, "Scope Boundaries"),
  };
}

function stripTitleAndRelatedSections(content) {
  return content
    .replace(/^# .+\n+/, "")
    .replace(/## Related[\s\S]*$/, "")
    .trim();
}

function extractTestingInfo(nodeContents) {
  for (const [nodePath, content] of nodeContents) {
    if (nodePath.includes("workflows/testing")) {
      return stripTitleAndRelatedSections(content);
    }
  }

  return null;
}

function buildContextMd(meta, storyPath, nodeContents) {
  const sections = [];

  sections.push(`# ${meta.title}`);
  sections.push(`> Generated from \`${storyPath}\` - delete and regenerate anytime\n`);

  if (meta.description) {
    sections.push(`## What We're Building\n\n${meta.description}\n`);
  }

  if (meta.tasks) {
    sections.push(`## Tasks\n\n${meta.tasks}\n`);
  }

  if (meta.acceptance) {
    sections.push(`## Done When\n\n${meta.acceptance}\n`);
  }

  if (meta.boundaries) {
    sections.push(`## Out of Scope\n\n${meta.boundaries}\n`);
  }

  const testingInfo = extractTestingInfo(nodeContents);
  if (testingInfo) {
    const verificationLines = [
      "## Verification",
      "",
      "**Before considering any task complete, you MUST:**",
      "1. Run the existing test suite and confirm all tests pass",
      "2. If you added new functionality, add tests for it",
      "3. If you changed existing behavior, update affected tests",
      "",
      "### Testing Details",
      "",
      testingInfo,
    ];
    sections.push(`${verificationLines.join("\n")}\n`);
  }
  sections.push("---\n\n## Project Knowledge\n");
  sections.push("Follow these as ground truth for this project.\n");

  const groupedByCategory = {};
  for (const [nodePath, content] of nodeContents) {
    const parts = nodePath.split("/");
    const category = parts.length > 1 ? parts[1] : "other";
    if (!groupedByCategory[category]) {
      groupedByCategory[category] = [];
    }
    groupedByCategory[category].push({ nodePath, content });
  }

  const preferredOrder = ["rules", "technology", "domain", "workflows"];
  const categories = [
    ...preferredOrder.filter((category) => groupedByCategory[category]),
    ...Object.keys(groupedByCategory).filter((category) => !preferredOrder.includes(category)),
  ];

  for (const category of categories) {
    sections.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);

    for (const { nodePath, content } of groupedByCategory[category]) {
      const cleanedContent = stripTitleAndRelatedSections(content);
      sections.push(`#### ${basename(nodePath, ".md")}\n\n${cleanedContent}\n`);
    }
  }

  return sections.join("\n");
}

export function generateContextMd({ root = process.cwd(), input, outputPath = "WORKING_SET.md" }) {
  const storyPath = resolveStoryPath(root, input);
  const storiesDir = join(root, ".backlog", "stories");

  if (!storyPath) {
    console.error(`Story not found: ${input}`);
    console.log("Available stories:");
    if (existsSync(storiesDir)) {
      readdirSync(storiesDir).forEach((file) => console.log(`  - ${file}`));
    }
    process.exit(1);
  }

  console.log(`Story: ${storyPath}`);
  const storyContent = readProjectFile(root, storyPath);
  if (!storyContent) {
    process.exit(1);
  }

  const meta = extractStoryMeta(storyContent);
  const directNodes = extractKnowledgeNodes(storyContent);
  console.log(`Direct nodes: ${directNodes.length}`);

  const allNodePaths = new Set(directNodes);
  const nodeContents = new Map();

  for (const nodePath of directNodes) {
    const content = readProjectFile(root, nodePath);
    if (!content) {
      continue;
    }

    nodeContents.set(nodePath, content);
    for (const relatedPath of extractRelatedLinks(root, content, nodePath)) {
      allNodePaths.add(relatedPath);
    }
  }

  for (const nodePath of allNodePaths) {
    if (nodeContents.has(nodePath)) {
      continue;
    }

    const content = readProjectFile(root, nodePath);
    if (content) {
      nodeContents.set(nodePath, content);
    }
  }

  console.log(`Total nodes (1-hop): ${nodeContents.size}`);

  const totalCharacters = [...nodeContents.values()].reduce((sum, content) => sum + content.length, 0);
  const estimatedTokens = Math.round(totalCharacters / 4);
  console.log(`Estimated context: ~${estimatedTokens} tokens`);

  if (estimatedTokens > 3000) {
    console.warn("Warning: context is getting large. Consider splitting nodes or reducing scope.");
  }

  const contextMd = buildContextMd(meta, storyPath, nodeContents);
  const absoluteOutputPath = resolve(root, outputPath);
  writeFileSync(absoluteOutputPath, contextMd);

  console.log(`${outputPath} generated for: ${meta.title}`);
  console.log(`  ${contextMd.split("\n").length} lines, ~${estimatedTokens} tokens`);

  return {
    storyPath,
    outputPath,
    estimatedTokens,
    title: meta.title,
  };
}

export function runGenerateContextCli(argv, options = {}) {
  const defaultOutputPath = options.defaultOutputPath || "WORKING_SET.md";
  const usageScript = options.usageScript || ".kb/scripts/generate-context-md.mjs";
  const input = argv[0];
  const outputPath = argv[1] || defaultOutputPath;

  if (!input) {
    console.log(`Usage: node ${usageScript} <story-path-or-id> [output-path]`);
    console.log("Examples:");
    console.log(`  node ${usageScript} STORY-001`);
    console.log(`  node ${usageScript} STORY-001 ${defaultOutputPath}`);
    process.exit(1);
  }

  generateContextMd({ input, outputPath });
}

function isDirectRun() {
  return Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectRun()) {
  runGenerateContextCli(process.argv.slice(2));
}
