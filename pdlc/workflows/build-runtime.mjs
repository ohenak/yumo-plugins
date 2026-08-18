#!/usr/bin/env node
/**
 * build-runtime.mjs — emit the pdlc-cli.mjs artifact from the canonical modules.
 *
 * pdlc-plugin-retirement (DEC-02): the workflow-runtime bundles this builder used to
 * emit (`orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`,
 * `consolidate-learnings.bundle.js`) are retired along with the Claude Code workflow
 * runtime that loaded them — pipeline execution now lives in the published
 * `@kaneho/pdlc-engine` package, invoked by the `orchestrate-dev` / `orchestrate-queue`
 * SKILL.md delegators as `pdlc dev <req-path>` / `pdlc queue`. This builder now emits a
 * single artifact: `pdlc-cli.mjs`, the document-state query CLI, which stays plain Node
 * (real `fs`, its own imports) and is built by inlining `orchestrate-dev.js`'s stripped
 * body into `cli.mjs`.
 *
 * Usage:  node pdlc/workflows/build-runtime.mjs [--check]
 *   --check  verify the emitted artifact is up to date; exit 1 if not (CI use).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
// Sole output directory (AC-6.1) — the builder writes nothing outside pdlc/workflows/dist/.
// The .claude/workflows/ consumer copy is produced by the maintainer sync step, not this script.
const OUT_DIR = resolve(HERE, "dist");

/** The generated-file banner, naming THIS artifact's own sources.
 *
 * The banner is the one line of an artifact an operator reads before deciding
 * where to make a change, so naming sources the artifact was not built from
 * sends that edit to the wrong file.
 */
function banner(sources) {
  return [
    "// ⚠️  GENERATED FILE — DO NOT EDIT.",
    "// Built by `node pdlc/workflows/build-runtime.mjs` from:",
    ...sources.map((s) => `//   pdlc/workflows/${s}`),
    "// Edit those, then rebuild. See pdlc/workflows/build-runtime.mjs for why this",
    "// artifact exists.",
  ].join("\n");
}

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

// ───── dist/pdlc-cli.mjs — the document-state query CLI ─────────────────────
//
// Not a workflow bundle: plain Node, run as `node .../pdlc-cli.mjs <command>`,
// so it keeps its imports and needs no `meta`.
//
// The dev module's exports it reaches — the ONLY names `__dev` publishes for it.
const CLI_DEV_EXPORTS = [
  "isComplete",
  "approvalHashOf",
  "approvalHashOfNormalized",
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

// The CLI is plain Node: it inlines the dev module and cli.mjs, and takes no
// adapter (it has real `fs`) and no queue module.
const CLI_SOURCES = ["orchestrate-dev.js", "cli.mjs"];

const cliArtifact = [
  moduleImportLines(devSource).join("\n"),
  banner(CLI_SOURCES),
  wrapModule("__dev", stripModuleSyntax(devSource), CLI_DEV_EXPORTS),
  cliBody,
].join("\n\n");

const bundles = [
  {
    file: "pdlc-cli.mjs",
    contents: cliArtifact,
  },
];

const checkOnly = process.argv.includes("--check");
let stale = false;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

for (const { file, contents } of bundles) {
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
}

if (stale) {
  console.error("\nBundles are out of date. Run: node pdlc/workflows/build-runtime.mjs");
  process.exit(1);
}
