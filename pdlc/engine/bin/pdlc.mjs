#!/usr/bin/env node
// pdlc CLI entry point — the dependency-free Node-floor guard (TSPEC §9.3,
// PROP-LAUNCH-7, AC-2.4, DEC-EDIST-09).
//
// This file is written in the syntax subset valid on the oldest Node that
// could plausibly try to run it: Node 12.17+, where dynamic `import()`
// first parses in ESM. That is deliberate, not an oversight — ESM static
// imports are resolved and evaluated BEFORE the importing module's own body
// runs, so a floor check placed after a static `import` would still execute
// after everything that import pulls in, and a modern-syntax construct
// anywhere in that graph throws a parse-error stack trace with no named
// floor before the check's first statement ever runs. Keeping this file's
// only top-level statements to a version comparison, a refusal, and a
// single **promise-chained** `import("./cli.mjs").then(...)` is what keeps
// the refusal reachable on a genuinely old runtime.
//
// No top-level `await` anywhere below, including inside the promise chain's
// callbacks: top-level `await` is itself a Node 14.8+ parse-level feature,
// so using it here would turn the guard into exactly the bare SyntaxError
// stack trace this redesign exists to prevent — merely relocated from
// `lib/` into the guard instead of eliminated (AC-2.4).
//
// The full CLI — every static import this package needs — lives in
// `./cli.mjs` (PK-4b), loaded only once this guard has confirmed the
// running Node is new enough to parse it. The `bin` field in
// `package.json` keeps pointing at this file's name so `AC-2.1`'s `PATH`
// entry and the shipped subprocess tests' invocation target are untouched
// by the split (§5.4, TE Q-06).

const major = Number(process.versions.node.split(".")[0]);
if (Number.isNaN(major) || major < 20) {
  console.error("pdlc requires Node >= 20; found " + process.versions.node);
  process.exit(1);
}
import("./cli.mjs")
  .then((mod) => mod.main())
  .catch((err) => {
    console.error(err && err.stack ? err.stack : String(err));
    process.exitCode = 1;
  });
