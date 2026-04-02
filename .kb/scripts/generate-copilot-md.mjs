#!/usr/bin/env node

import { runGenerateContextCli } from "./generate-context-md.mjs";

runGenerateContextCli(process.argv.slice(2), {
  defaultOutputPath: "COPILOT.md",
  usageScript: ".kb/scripts/generate-copilot-md.mjs",
});
