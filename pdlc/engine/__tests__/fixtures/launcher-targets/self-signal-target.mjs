#!/usr/bin/env node
// Trivial fixture target for launcher.test.js's signalled-child leg (PLAN
// T14, PROP-LAUNCH-6, DEC-EDIST-06). Kills itself with SIGTERM so the
// parent's `spawnSync` observes `{status: null, signal: "SIGTERM"}` — the
// one shape S-3's descriptor double cannot produce, and the one a literal
// `process.exit(result.status)` would collapse to exit code 0 on.

process.stdout.write("SELF-SIGNAL-TARGET-STDOUT\n");
process.kill(process.pid, "SIGTERM");
// Give the signal a moment to land before the event loop would otherwise
// fall through and exit 0 on its own, which would defeat the leg.
setTimeout(() => {}, 2000);
