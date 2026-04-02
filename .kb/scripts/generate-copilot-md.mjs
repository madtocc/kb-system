#!/usr/bin/env node

import { runGenerateContextCli } from "./generate-context-md.mjs";

runGenerateContextCli(process.argv.slice(2), {
  defaultOutputPath: ".github/copilot-instructions.md",
  usageScript: ".kb/scripts/generate-copilot-md.mjs",
});
