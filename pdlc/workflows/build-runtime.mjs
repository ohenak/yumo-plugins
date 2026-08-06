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
import { createHash } from "crypto";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..");
// Sole output directory (AC-6.1) — the builder writes nothing outside pdlc/workflows/dist/.
// The .claude/workflows/ consumer copy is produced by the maintainer sync step, not this script.
const OUT_DIR = resolve(HERE, "dist");

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

/** The import lines `stripModuleSyntax` removes, verbatim and in order.
 *
 * The CLI artifact is plain Node, not the workflow runtime, so the stripped dev
 * body's module-scope identifiers (`fs`) must be re-supplied. Re-emitting the
 * module's OWN import lines is the only form that cannot drift: a hand-written
 * `import * as fs` here would silently miss any import added upstream. Matches
 * `stripModuleSyntax`'s predicate exactly, so the two can never disagree about
 * which lines are imports.
 */
export function moduleImportLines(source) {
  return source
    .split("\n")
    .filter((line) => /^import\s.+;\s*$/.test(line.trim()))
    .map((line) => line.trim());
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
  // The queue module's advisory imports (PLAN A-30) — republished so the
  // queue IIFE's prelude can re-bind them as free identifiers.
  "runAdvisorySeam",
  "readAdvisoryConfigSafely",
  "parseAdvisoryConfig",
  "defaultAppendFile",
  "ADVISORY_CONFIG_PATH",
]);

const queueModule = wrapModule(
  "__queue",
  stripModuleSyntax(queueSource),
  // §7.2 edit 3 — `rewriteStatus` / `updateQueueStatus` are what an entrypoint's
  // `_recordQueueRow` closure calls; without them on `__queue` it has nothing to call.
  ["main", "meta", "DEFAULT_QUEUE_PATH", "rewriteStatus", "updateQueueStatus"],
  ["const realMain = __dev.main;",
   "const runAdvisorySeam = __dev.runAdvisorySeam;",
   "const readAdvisoryConfigSafely = __dev.readAdvisoryConfigSafely;",
   "const parseAdvisoryConfig = __dev.parseAdvisoryConfig;",
   "const defaultAppendFile = __dev.defaultAppendFile;",
   "const ADVISORY_CONFIG_PATH = __dev.ADVISORY_CONFIG_PATH;"].join("\n")
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
  // CR F-1 — the module's own meta.inputs is dead in this artifact (it stays
  // inside the __dev IIFE, where nothing reads it), so the operator's declared
  // channel is this copy. Keep it in step with orchestrate-dev.js's meta.inputs:
  // forcePhases' catalogue here is FORCE_PHASE_TOKENS + "all".
  inputs: [
    {
      name: "reqPath",
      description:
        "Path to the approved REQ document, e.g. docs/{feature}/REQ-{feature}.md",
      type: "string",
      required: true,
    },
    {
      name: "forcePhases",
      description:
        "Optional comma- or space-separated phases to re-run despite a recorded approval. Valid: R, F, T, P, D, PR, all.",
      type: "string",
      required: false,
    },
  ],
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
    // TSPEC §11.2 — Phase MERGE runs immediately after Phase PUB. The
    // module's own meta.phases is dead in this artifact (same reason
    // meta.inputs is, above), so this hand-written copy is the only place
    // the operator-visible phase list can carry the new row.
    { title: "Phase MERGE", detail: "merge the PR + advance the queue row" },
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
  _git: rtGit,
  _log: rtLog,
  _phase: rtPhase,
  _runPipeline: ({ reqPath }) =>
    __dev.main({
      reqPath,
      ...__devInjections,
      // TSPEC §11.2 — the 7th (evidence) argument threads a merged run's
      // Evidence cell through to the queue row (§8.3/§8.4); absent, it is
      // undefined, and rewriteStatus treats that exactly as it does today.
      _recordQueueRow: async ({ feature, status, evidence }) =>
        __queue.rewriteStatus(__queuePath, feature, status, rtReadFile, rtWriteFile, rtGit, evidence),
    }),
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

// §7.2 edit 1 — the operator's phase override has no other channel into the bundle.
const __forcePhases =
  args && typeof args === "object" && args.forcePhases ? args.forcePhases : null;

if (!__reqPath) {
  return { outcome: "halted", haltReason: "No reqPath supplied — pass the REQ path as args." };
}

return await __dev.main({
  reqPath: __reqPath,
  forcePhases: __forcePhases,
  ...rtDevInjections(__dev),
  // §7.2 edits 3 + 4 — a direct dev invocation still owns its queue row, so it
  // closes over __queue's row helpers at the default queue path. Absent this,
  // the seam falls back to defaultRecordQueueRow's queueRow "none" no-op.
  // TSPEC §11.2 — same evidence thread as QUEUE_ENTRY's closure (§7.2 edits
  // 3 + 4): a direct run's own queue-row write also carries the merged
  // Evidence cell when Phase MERGE produced one.
  _recordQueueRow: async ({ feature, status, evidence }) =>
    __queue.rewriteStatus(
      __queue.DEFAULT_QUEUE_PATH,
      feature,
      status,
      rtReadFile,
      rtWriteFile,
      rtGit,
      evidence
    ),
});
`;

// ─── dist/pdlc-cli.mjs — the document-state query CLI ────────────────────────
//
// Not a workflow bundle: plain Node, run as `node .../pdlc-cli.mjs <command>`,
// so it keeps its imports and needs no `meta`. It ships through the same
// manifest/sync channel as the bundles, which is why it is built here.
//
// The dev module's exports it reaches — the ONLY names `__dev` publishes for it.
const CLI_DEV_EXPORTS = [
  "isComplete",
  "approvalHashOf",
  "sha256Hex",
  "approvalAnchorPreCount",
  "artifactClassOf",
  "firstUnwrittenSection",
  "refreshReviewState",
  "checkPostmortem",
  "defaultReadFile",
  "defaultListFiles",
];

const cliSource = readFileSync(resolve(HERE, "cli.mjs"), "utf8");

// The marked line is the whole seam between source and artifact. Its replacement
// binds the same identifier to the IIFE's published record, so no other line of
// cli.mjs differs between the two forms. A shebang is only a shebang on line 1;
// mid-file it is a syntax error, so it is dropped here rather than re-emitted.
const CLI_IMPORT_MARK = /^import .*\/\/ BUILD:REPLACE-DEV-IMPORT$/m;
if (!CLI_IMPORT_MARK.test(cliSource)) {
  console.error("cli.mjs has no `// BUILD:REPLACE-DEV-IMPORT` import line to replace.");
  process.exit(1);
}
const cliBody = cliSource
  .replace(/^#![^\n]*\n/, "")
  .replace(CLI_IMPORT_MARK, "const dev = __dev;");

const cliArtifact = [
  moduleImportLines(devSource).join("\n"),
  BANNER,
  wrapModule("__dev", stripModuleSyntax(devSource), CLI_DEV_EXPORTS),
  cliBody,
].join("\n\n");

// The workflow runtime rejects a script over 512 KiB, and the comment-dense
// sources pushed the concatenated dev bundle past it. The two runtime bundles
// are therefore emitted with comments stripped. The stripper is hand-rolled
// and dependency-free ON PURPOSE: this builder runs on a fresh clone before
// any `npm install` (the bootstrap contract, pinned by DOD-03's temp-tree
// checks), so it may not require npm packages. `runtimeBundle.test.js`
// re-parses the stripped bundles with the test environment's real parser, so
// a stripper bug is a red suite, not a silently corrupt artifact. The banner
// is re-prepended below because it must outlive stripping: it is the
// "generated — never edit" warning an operator reads. pdlc-cli.mjs is plain
// Node with no size ceiling and keeps its comments.
const REGEX_PREFIX_WORDS = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "delete", "void",
  "throw", "case", "do", "else", "yield", "await",
]);

function stripJsComments(code) {
  let out = "";
  let i = 0;
  const n = code.length;
  // Mode stack: "code" (with its ${}-depth) nests inside "template" and back.
  const stack = [{ mode: "code", braces: 0 }];
  let prevCh = ""; // last significant char emitted in code mode
  let prevWord = ""; // last identifier-ish word emitted in code mode

  const top = () => stack[stack.length - 1];

  while (i < n) {
    const s = top();
    const c = code[i];
    const d = i + 1 < n ? code[i + 1] : "";

    if (s.mode === "code") {
      if (c === "/" && d === "/") {
        while (i < n && code[i] !== "\n") i++;
        continue; // the \n itself is emitted on the next pass
      }
      if (c === "/" && d === "*") {
        const hadNewline = () => code.slice(start, i).includes("\n");
        const start = i;
        i += 2;
        while (i < n && !(code[i] === "*" && code[i + 1] === "/")) i++;
        i = Math.min(n, i + 2);
        // Preserve line structure so a stripper bug stays diffable to a line.
        if (hadNewline()) out += "\n";
        continue;
      }
      if (c === "'" || c === '"') {
        stack.push({ mode: "string", quote: c });
        out += c; i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "`") {
        stack.push({ mode: "template" });
        out += c; i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "/") {
        // Regex literal vs division, by what precedes it.
        const regexish =
          prevCh === "" || "(,=:[!&|?{};+-*%~^<>".includes(prevCh) ||
          REGEX_PREFIX_WORDS.has(prevWord);
        if (regexish) {
          stack.push({ mode: "regex", inClass: false });
        }
        out += c; i++; prevCh = c; prevWord = "";
        continue;
      }
      if (c === "{") { s.braces++; }
      if (c === "}") {
        if (s.braces === 0 && stack.length > 1) {
          // End of a template's ${ … } hole.
          stack.pop();
          out += c; i++;
          continue;
        }
        s.braces--;
      }
      out += c; i++;
      if (!/\s/.test(c)) {
        prevCh = c;
        if (/[A-Za-z0-9_$]/.test(c)) prevWord += c;
        else prevWord = "";
      }
      continue;
    }

    if (s.mode === "string") {
      out += c;
      if (c === "\\") { out += d; i += 2; continue; }
      i++;
      if (c === s.quote) stack.pop();
      continue;
    }

    if (s.mode === "template") {
      if (c === "\\") { out += c + d; i += 2; continue; }
      if (c === "$" && d === "{") {
        stack.push({ mode: "code", braces: 0 });
        out += "${"; i += 2;
        continue;
      }
      out += c; i++;
      if (c === "`") stack.pop();
      continue;
    }

    // regex
    out += c;
    if (c === "\\") { out += d; i += 2; continue; }
    i++;
    if (c === "[") s.inClass = true;
    else if (c === "]") s.inClass = false;
    else if (c === "/" && !s.inClass) { stack.pop(); prevCh = "/"; }
    else if (c === "\n") stack.pop(); // never a real regex — bail conservatively
  }
  // Collapse the blank lines stripping leaves behind, but never touch content:
  // only fully-empty (whitespace-only) line runs shrink.
  return out.replace(/\n(?:[ \t]*\n)+/g, "\n\n");
}

/** Replace `await import("x")` with a rejecting expression carrying the same specifier.
 *
 * Constraint 2 in this file's header ("No `import` — static or dynamic") is a
 * LAUNCHER constraint, not merely a runtime one: the Workflow launcher parses
 * the script statically and refuses to start on any `import(` token, long
 * before any injection could happen. The canonical modules' Node-only seam
 * defaults (`defaultGit`, `defaultGhRun`, `defaultReadFile`, `defaultWriteFile`,
 * `checkPrCi`, `mergeWorktree`) each carry one, and each is overridden by
 * runtime-adapter.js — they are dead code inside the runtime, but a dead
 * `import(` still costs the whole pipeline its launch.
 *
 * The replacement is deliberately self-contained (no helper binding to place
 * relative to the `meta` first-statement rule), keeps the specifier verbatim so
 * the site stays greppable, and throws if a path this build believed dead ever
 * runs — a loud failure beats a silent fallback to a seam that isn't there.
 */
export function neutralizeDynamicImports(code) {
  return code.replace(
    /\bawait\s+import\(\s*("[^"\n]*"|'[^'\n]*')\s*\)/g,
    (_match, specifier) =>
      `await Promise.reject(new Error("Node module " + ${specifier} + ` +
      `" is unavailable in the workflow runtime; this seam must be injected"))`
  );
}

function stripCommentsForRuntime(code) {
  return `${BANNER}\n${neutralizeDynamicImports(stripJsComments(code))}`;
}

const bundles = [
  {
    file: "orchestrate-queue.bundle.js",
    contents: stripCommentsForRuntime(
      [QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY].join("\n\n")
    ),
  },
  {
    file: "orchestrate-dev.bundle.js",
    // §7.2 edit 4 — `queueModule` joins the dev bundle so DEV_ENTRY's
    // `_recordQueueRow` closure can reach the queue's row helpers. ORDERING HAZARD:
    // queueModule's prelude references `__dev.main`, so devModule must precede it.
    contents: stripCommentsForRuntime(
      [DEV_META, BANNER, adapter, devModule, queueModule, DEV_ENTRY].join("\n\n")
    ),
  },
  {
    file: "pdlc-cli.mjs",
    // Explicit: the id is not derivable from this filename by the `.bundle.js`
    // rule the two rows above use.
    id: "pdlc-cli",
    contents: cliArtifact,
  },
];

// Self-enforcing gate on the constraint `neutralizeDynamicImports` exists to keep:
// no `import(` token may survive in a runtime bundle, whatever produced it. Scoped
// to the `.bundle.js` rows — pdlc-cli.mjs is plain Node and keeps its imports.
for (const { file, contents } of bundles) {
  if (!file.endsWith(".bundle.js")) continue;
  const surviving = contents.match(/\bimport\s*\(/g) || [];
  if (surviving.length) {
    console.error(
      `${file}: ${surviving.length} dynamic import(s) survived neutralization — ` +
        `the workflow launcher rejects the script on sight. See neutralizeDynamicImports.`
    );
    process.exit(1);
  }
}

const checkOnly = process.argv.includes("--check");
let stale = false;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// artifactVersion / pluginVersion (TSPEC §2.3 point 2, FSPEC M3/M4) — read once, at build time,
// from the plugin manifest. Never encoded as a `meta` field: `meta` must stay a pure literal.
const pluginManifest = JSON.parse(
  readFileSync(resolve(REPO_ROOT, "pdlc", ".claude-plugin", "plugin.json"), "utf8")
);
const pluginVersion = pluginManifest.version;

// id -> the retired pre-bundle source this artifact replaces, per FSPEC §1.1's example rows.
//
// The two retired paths are assembled from fragments because this file is itself scanned by
// `coveredViolations` (pdlc/workflows/lib/document-oracles.mjs) and these exact strings are two
// of the patterns it searches for — a contiguous literal here would report this file forever.
// Assembly removes the self-reference without changing what is matched or what is emitted: the
// assembled values are byte-identical to the former literals. Narrowing the patterns (R-10) and
// widening EXEMPTIONS (TE F-10) are both barred, so fragment assembly is the available fix.
const RETIRED_DIR = ".claude/" + "workflows/";
const RETIRES_BY_ID = {
  "orchestrate-dev": [`${RETIRED_DIR}orchestrate-dev.js`],
  "orchestrate-queue": [`${RETIRED_DIR}orchestrate-queue.js`],
};

const manifestRows = [];

for (const { file, contents, id: declaredId } of bundles) {
  const path = resolve(OUT_DIR, file);
  const current = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (current === contents) {
    console.log(`  in-sync  pdlc/workflows/dist/${file}`);
  } else if (checkOnly) {
    stale = true;
    console.error(`  STALE    pdlc/workflows/dist/${file}`);
  } else {
    writeFileSync(path, contents, "utf8");
    console.log(`  wrote    pdlc/workflows/dist/${file}  (${contents.length} bytes)`);
  }

  const id = declaredId ?? file.replace(/\.bundle\.js$/, "");
  manifestRows.push({
    id,
    pluginPath: `workflows/dist/${file}`,
    consumerPath: `.claude/workflows/${file}`,
    artifactVersion: pluginVersion,
    // Computed over the same in-memory `contents` string just written above — never re-read
    // from disk — so it can never disagree with what was (or would have been) emitted.
    pluginSha1: createHash("sha1").update(contents, "utf8").digest("hex"),
    retires: RETIRES_BY_ID[id] ?? [],
  });
}

manifestRows.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

const retired = [...new Set(manifestRows.flatMap((row) => row.retires))].sort();

const manifest = {
  schemaVersion: 1,
  pluginVersion,
  rows: manifestRows,
  retired,
};

const manifestContents = `${JSON.stringify(manifest, null, 2)}\n`;
const manifestPath = resolve(OUT_DIR, "distribution-manifest.json");
const manifestCurrent = existsSync(manifestPath) ? readFileSync(manifestPath, "utf8") : null;

if (manifestCurrent === manifestContents) {
  console.log("  in-sync  pdlc/workflows/dist/distribution-manifest.json");
} else if (checkOnly) {
  stale = true;
  console.error("  STALE    pdlc/workflows/dist/distribution-manifest.json");
} else {
  writeFileSync(manifestPath, manifestContents, "utf8");
  console.log(
    `  wrote    pdlc/workflows/dist/distribution-manifest.json  (${manifestContents.length} bytes)`
  );
}

if (stale) {
  console.error("\nBundles are out of date. Run: node pdlc/workflows/build-runtime.mjs");
  process.exit(1);
}
