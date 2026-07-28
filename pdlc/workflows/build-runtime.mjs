#!/usr/bin/env node
/**
 * build-runtime.mjs — emit runtime-loadable bundles from the canonical modules.
 *
 * The Claude Code workflow runtime imposes constraints the canonical sources
 * deliberately do not follow (they are ES modules so jest can import and inject
 * into them):
 *
 *   1. `export const meta = {...}` must be the FIRST statement.
 *   2. No `import` — static or dynamic. No other `export`.
 *   3. No `fs`, no `child_process`, no `process`.
 *   4. The script body itself is the entrypoint; nothing calls main() for you.
 *
 * This build satisfies all four without forking the logic: each module body is
 * stripped of its import/export syntax, wrapped in an IIFE (which also isolates
 * the two modules' identically-named helpers), and driven by an entrypoint that
 * injects the agent-backed adapters from runtime-adapter.js.
 *
 * Usage:  node pdlc/workflows/build-runtime.mjs [--check]
 *   --check  verify the emitted bundles are up to date; exit 1 if not (CI use).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..");
const OUT_DIR = resolve(REPO_ROOT, ".claude", "workflows");

const BANNER = [
  "// ⚠️  GENERATED FILE — DO NOT EDIT.",
  "// Built by `node pdlc/workflows/build-runtime.mjs` from:",
  "//   pdlc/workflows/orchestrate-dev.js",
  "//   pdlc/workflows/orchestrate-queue.js",
  "//   pdlc/workflows/runtime-adapter.js",
  "// Edit those, then rebuild. See pdlc/workflows/build-runtime.mjs for why this",
  "// bundle exists (the workflow runtime allows no imports, exports past meta, or fs).",
].join("\n");

/** Strip ES module syntax so the body can live inside an IIFE. */
export function stripModuleSyntax(source) {
  return source
    .split("\n")
    .filter((line) => !/^import\s.+;\s*$/.test(line.trim()))
    .join("\n")
    .replace(/^export default (async )?function /gm, "$1function ")
    .replace(/^export (const|let|var|function|async function|class) /gm, "$1 ");
}

/** Wrap a stripped body in an IIFE that publishes the named bindings. */
function wrapModule(varName, body, exportedNames, prelude = "") {
  return [
    `const ${varName} = (function () {`,
    prelude,
    body,
    `return { ${exportedNames.join(", ")} };`,
    `})();`,
  ]
    .filter(Boolean)
    .join("\n");
}

const devSource = readFileSync(resolve(HERE, "orchestrate-dev.js"), "utf8");
const queueSource = readFileSync(resolve(HERE, "orchestrate-queue.js"), "utf8");
const adapter = readFileSync(resolve(HERE, "runtime-adapter.js"), "utf8");

const devModule = wrapModule("__dev", stripModuleSyntax(devSource), [
  "main",
  "meta",
  "checkPrCi",
  "mergeWorktree",
  "checkFileNonEmpty",
  "parsePlanTasks",
]);

const queueModule = wrapModule(
  "__queue",
  stripModuleSyntax(queueSource),
  ["main", "meta", "DEFAULT_QUEUE_PATH"],
  "const realMain = __dev.main;"
);

// `meta` must be a pure literal and the first statement, so each bundle carries
// its own hand-written copy rather than re-exporting the module's.
const QUEUE_META = `export const meta = {
  name: "orchestrate-queue",
  description:
    "Serial PDLC queue driver — picks the next ready REQ from docs/_queue/QUEUE.md and runs the orchestrate-dev pipeline for it.",
  whenToUse:
    "Driven by /loop to work a dependency-ordered feature queue one feature per invocation.",
  phases: [
    { title: "Queue: Load", detail: "read docs/_queue/QUEUE.md" },
    { title: "Queue: Select", detail: "pick pending entries in order" },
    { title: "Queue: Triage", detail: "Phase-0 readiness check (sonnet)" },
    { title: "Queue: Run", detail: "delegate to the orchestrate-dev pipeline" },
  ],
};`;

const DEV_META = `export const meta = {
  name: "orchestrate-dev",
  description:
    "Full PDLC pipeline for one REQ — spec authoring, reviews, TDD implementation, DoD, harvest, PR.",
  whenToUse: "Run the pipeline for a single named REQ path.",
  phases: [
    { title: "Phase R", detail: "REQ review" },
    { title: "Phase F", detail: "FSPEC author + review" },
    { title: "Phase T", detail: "TSPEC author + review" },
    { title: "Phase D", detail: "PLAN author + review" },
    { title: "Phase P", detail: "PROPERTIES author + review" },
    { title: "Phase I", detail: "implementation batches (sonnet)" },
    { title: "Phase CR", detail: "final codebase review" },
    { title: "Phase DOD", detail: "definition-of-done verify + remediate" },
    { title: "Phase H", detail: "harvest learnings" },
    { title: "Phase PUB", detail: "raise PR + verify CI" },
  ],
};`;

const QUEUE_ENTRY = `
// ─── Entrypoint ───────────────────────────────────────────────────────────────
const __devInjections = rtDevInjections(__dev);
const __queuePath =
  typeof args === "string" && args.trim()
    ? args.trim()
    : args && typeof args === "object" && args.queuePath
      ? args.queuePath
      : __queue.DEFAULT_QUEUE_PATH;

return await __queue.main({
  queuePath: __queuePath,
  _agent: rtAgent,
  _readFile: rtReadFile,
  _writeFile: rtWriteFile,
  _log: rtLog,
  _phase: rtPhase,
  _runPipeline: ({ reqPath }) => __dev.main({ reqPath, ...__devInjections }),
});
`;

const DEV_ENTRY = `
// ─── Entrypoint ───────────────────────────────────────────────────────────────
const __reqPath =
  typeof args === "string" && args.trim()
    ? args.trim()
    : args && typeof args === "object" && args.reqPath
      ? args.reqPath
      : null;

if (!__reqPath) {
  return { outcome: "halted", haltReason: "No reqPath supplied — pass the REQ path as args." };
}

return await __dev.main({ reqPath: __reqPath, ...rtDevInjections(__dev) });
`;

const bundles = [
  {
    file: "orchestrate-queue.bundle.js",
    contents: [QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY].join("\n\n"),
  },
  {
    file: "orchestrate-dev.bundle.js",
    contents: [DEV_META, BANNER, adapter, devModule, DEV_ENTRY].join("\n\n"),
  },
];

const checkOnly = process.argv.includes("--check");
let stale = false;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

for (const { file, contents } of bundles) {
  const path = resolve(OUT_DIR, file);
  const current = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (current === contents) {
    console.log(`  in-sync  .claude/workflows/${file}`);
    continue;
  }
  if (checkOnly) {
    stale = true;
    console.error(`  STALE    .claude/workflows/${file}`);
    continue;
  }
  writeFileSync(path, contents, "utf8");
  console.log(`  wrote    .claude/workflows/${file}  (${contents.length} bytes)`);
}

if (stale) {
  console.error("\nBundles are out of date. Run: node pdlc/workflows/build-runtime.mjs");
  process.exit(1);
}
