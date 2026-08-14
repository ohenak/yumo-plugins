#!/usr/bin/env node
// Test-only wrapper used by launcher.test.js's real-spawn legs (PLAN T14,
// PROP-LAUNCH-6). `execLauncher`'s own contract is `spawnSync` with
// `stdio: "inherit"`, so calling it directly from the test process would
// hand the target's stdout/stderr straight to the test runner's own fds —
// this wrapper puts one more real process between the two, so the outer
// `spawnSync` in launcher.test.js captures exactly what the target wrote,
// unmixed, the way a launcher's own caller would see it.
//
// Usage: node run-exec-launcher.mjs <targetPath> [...targetArgv]

import { execLauncher } from "../../../bin/cli.mjs";

const [target, ...targetArgv] = process.argv.slice(2);
const exitCode = execLauncher(target, targetArgv, process.env);
process.exit(exitCode);
