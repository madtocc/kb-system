#!/usr/bin/env node

/**
 * scan-project.mjs
 *
 * Scans the current project and outputs a structured analysis
 * that the init-knowledge-graph command uses to bootstrap .knowledge/
 *
 * Extracts: stack, folder structure, configs, patterns, existing docs
 */

import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import { join, relative, extname } from "path";

const ROOT = process.cwd();
const output = { stack: {}, structure: {}, configs: {}, patterns: {}, docs: [] };

// --- Helpers ---

function tryReadJson(path) {
  try {
    return JSON.parse(readFileSync(join(ROOT, path), "utf-8"));
  } catch {
    return null;
  }
}

function tryRead(path) {
  try {
    return readFileSync(join(ROOT, path), "utf-8");
  } catch {
    return null;
  }
}

function walkDir(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  const entries = [];
  try {
    const items = readdirSync(join(ROOT, dir));
    for (const item of items) {
      if (item.startsWith(".") || item === "node_modules" || item === "dist" || item === "build" || item === ".next") continue;
      const rel = join(dir, item);
      const stat = statSync(join(ROOT, rel));
      if (stat.isDirectory()) {
        entries.push({ type: "dir", path: rel, children: walkDir(rel, depth + 1, maxDepth) });
      } else {
        entries.push({ type: "file", path: rel });
      }
    }
  } catch {}
  return entries;
}

function findFiles(dir, extensions, maxDepth = 4, depth = 0) {
  if (depth > maxDepth) return [];
  const results = [];
  try {
    const items = readdirSync(join(ROOT, dir));
    for (const item of items) {
      if (item.startsWith(".") || item === "node_modules") continue;
      const rel = join(dir, item);
      const stat = statSync(join(ROOT, rel));
      if (stat.isDirectory()) {
        results.push(...findFiles(rel, extensions, maxDepth, depth + 1));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        results.push(rel);
      }
    }
  } catch {}
  return results;
}

// --- Detect Stack ---

console.log("🔍 Scanning project...\n");

// Package.json
const pkg = tryReadJson("package.json");
if (pkg) {
  output.stack.name = pkg.name;
  output.stack.type = "node";

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  output.stack.dependencies = Object.keys(allDeps).sort();

  // Detect frameworks
  const frameworks = [];
  if (allDeps["next"]) frameworks.push(`Next.js ${allDeps["next"]}`);
  if (allDeps["react"]) frameworks.push(`React ${allDeps["react"]}`);
  if (allDeps["react-native"]) frameworks.push(`React Native ${allDeps["react-native"]}`);
  if (allDeps["expo"]) frameworks.push(`Expo ${allDeps["expo"]}`);
  if (allDeps["vue"]) frameworks.push(`Vue ${allDeps["vue"]}`);
  if (allDeps["svelte"]) frameworks.push(`Svelte ${allDeps["svelte"]}`);
  if (allDeps["express"]) frameworks.push(`Express ${allDeps["express"]}`);
  if (allDeps["fastify"]) frameworks.push(`Fastify ${allDeps["fastify"]}`);
  if (allDeps["hono"]) frameworks.push(`Hono ${allDeps["hono"]}`);
  output.stack.frameworks = frameworks;

  // Detect DB/ORM
  const db = [];
  if (allDeps["prisma"] || allDeps["@prisma/client"]) db.push("Prisma");
  if (allDeps["drizzle-orm"]) db.push("Drizzle");
  if (allDeps["@supabase/supabase-js"]) db.push("Supabase");
  if (allDeps["mongoose"] || allDeps["mongodb"]) db.push("MongoDB");
  if (allDeps["typeorm"]) db.push("TypeORM");
  if (allDeps["pg"]) db.push("PostgreSQL (pg)");
  output.stack.database = db;

  // Detect testing
  const testing = [];
  if (allDeps["jest"] || allDeps["@jest/core"]) testing.push("Jest");
  if (allDeps["vitest"]) testing.push("Vitest");
  if (allDeps["playwright"] || allDeps["@playwright/test"]) testing.push("Playwright");
  if (allDeps["cypress"]) testing.push("Cypress");
  if (allDeps["@testing-library/react"]) testing.push("React Testing Library");
  output.stack.testing = testing;

  // Detect styling
  const styling = [];
  if (allDeps["tailwindcss"]) styling.push("Tailwind CSS");
  if (allDeps["styled-components"]) styling.push("styled-components");
  if (allDeps["@emotion/react"]) styling.push("Emotion");
  output.stack.styling = styling;

  // Detect auth
  const auth = [];
  if (allDeps["next-auth"] || allDeps["@auth/core"]) auth.push("NextAuth/Auth.js");
  if (allDeps["@clerk/nextjs"]) auth.push("Clerk");
  if (allDeps["@supabase/auth-helpers-nextjs"]) auth.push("Supabase Auth");
  if (allDeps["passport"]) auth.push("Passport.js");
  output.stack.auth = auth;

  // Scripts
  output.stack.scripts = pkg.scripts || {};

  console.log("📦 Package:", pkg.name);
  console.log("   Frameworks:", frameworks.join(", ") || "none detected");
  console.log("   Database:", db.join(", ") || "none detected");
  console.log("   Testing:", testing.join(", ") || "none detected");
  console.log("   Auth:", auth.join(", ") || "none detected");
}

// Python
if (existsSync(join(ROOT, "pyproject.toml")) || existsSync(join(ROOT, "requirements.txt"))) {
  output.stack.type = output.stack.type ? "mixed" : "python";
  console.log("🐍 Python project detected");
}

// --- Detect Configs ---

const configFiles = [
  "tsconfig.json", "tsconfig.base.json",
  ".eslintrc.json", ".eslintrc.js", "eslint.config.js", "eslint.config.mjs",
  ".prettierrc", ".prettierrc.json", "prettier.config.js",
  "tailwind.config.js", "tailwind.config.ts",
  "next.config.js", "next.config.mjs", "next.config.ts",
  "vercel.json", "netlify.toml",
  "docker-compose.yml", "docker-compose.yaml", "Dockerfile",
  ".github/workflows/ci.yml", ".github/workflows/deploy.yml",
  "vitest.config.ts", "jest.config.ts", "jest.config.js",
  "drizzle.config.ts", "prisma/schema.prisma",
  "supabase/config.toml",
  "turbo.json", "nx.json", "pnpm-workspace.yaml",
  "CLAUDE.md",
];

console.log("\n📋 Config files found:");
for (const cf of configFiles) {
  if (existsSync(join(ROOT, cf))) {
    output.configs[cf] = tryRead(cf)?.substring(0, 2000) || "[binary/unreadable]";
    console.log(`   ✓ ${cf}`);
  }
}

// --- Detect Folder Structure ---

console.log("\n📁 Project structure:");
const structure = walkDir(".", 0, 2);
output.structure = structure;

function printTree(entries, indent = "") {
  for (const e of entries.slice(0, 30)) {
    if (e.type === "dir") {
      console.log(`${indent}📂 ${e.path}`);
      if (e.children) printTree(e.children, indent + "  ");
    }
  }
}
printTree(structure);

// --- Detect Patterns ---

// Find route files
const routeFiles = findFiles(".", ["route.ts", "route.js", "+page.svelte", "+server.ts"]);
if (routeFiles.length > 0) {
  output.patterns.routes = routeFiles.slice(0, 20);
  console.log(`\n🛣️  API/Page routes: ${routeFiles.length} found`);
}

// Find test files
const testFiles = findFiles(".", [".test.ts", ".test.tsx", ".test.js", ".spec.ts", ".spec.tsx"]);
output.patterns.testFiles = testFiles.length;
console.log(`🧪 Test files: ${testFiles.length}`);

// Find existing docs
const docFiles = findFiles(".", [".md"]).filter(f => !f.includes("node_modules") && !f.includes("CHANGELOG"));
output.docs = docFiles.slice(0, 20);
console.log(`📝 Markdown docs: ${docFiles.length}`);

// TODO comments
try {
  const { execSync } = await import("child_process");
  const todos = execSync('grep -rn "TODO\\|FIXME\\|HACK\\|XXX" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null | head -20', { cwd: ROOT, encoding: "utf-8" });
  if (todos.trim()) {
    output.patterns.todos = todos.trim().split("\n");
    console.log(`📌 TODOs/FIXMEs: ${output.patterns.todos.length}+ found`);
  }
} catch {}

// --- Detect monorepo ---

if (existsSync(join(ROOT, "pnpm-workspace.yaml")) || existsSync(join(ROOT, "turbo.json")) || existsSync(join(ROOT, "nx.json"))) {
  output.patterns.monorepo = true;
  console.log("\n📦 Monorepo detected");
  try {
    const workspaceConfig = tryRead("pnpm-workspace.yaml") || tryRead("turbo.json");
    if (workspaceConfig) output.patterns.workspaceConfig = workspaceConfig.substring(0, 1000);
  } catch {}
}

// --- Output full analysis ---

console.log("\n" + "=".repeat(60));
console.log("SCAN COMPLETE — Full analysis below");
console.log("=".repeat(60) + "\n");
console.log(JSON.stringify(output, null, 2));
