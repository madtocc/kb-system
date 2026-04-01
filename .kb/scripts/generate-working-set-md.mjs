#!/usr/bin/env node

import { runGenerateContextCli } from "./generate-context-md.mjs";

runGenerateContextCli(process.argv.slice(2), {
  defaultOutputPath: "WORKING_SET.md",
  usageScript: ".kb/scripts/generate-working-set-md.mjs",
});
