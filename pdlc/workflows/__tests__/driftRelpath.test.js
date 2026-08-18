/**
 * driftRelpath.test.js — `_pdlc_c3_relpath`, the repo-relative re-expression seam (C3).
 *
 * Phase CR remediation, finding F-17.
 *
 * C1's `pdlc_backup` / `pdlc_copy_artifact` / `pdlc_retire` record whatever absolute path they
 * were called with into `PDLC_WRITE_FAILURES[]`; `sync-workflows.sh`'s `_pdlc_c3_relpath` is the
 * one seam that re-expresses those entries in the repo-relative form the drift-state record and
 * the W-7 lines contract for (`writeFailures[].path`, row `consumerPath`, `retires` entries).
 *
 * The strip was written `${p#${PDLC_REPO_ROOT}/}` — an UNQUOTED prefix expansion, which bash
 * evaluates as a *pattern*, not a literal. A repo root containing `*`, `?`, `[` or `\` therefore
 * fails to strip (or mis-strips), and `writeFailures[].path` silently stops being repo-relative
 * for that consumer while everything else about the run looks correct.
 *
 * The function is exercised by extracting its definition from the shipped script and evaluating
 * it in a bash subshell: it is a pure string function of `PDLC_REPO_ROOT` and its argument, and
 * driving it end-to-end would require a consumer fixture whose temp-directory NAME carries glob
 * metacharacters — which `makeConsumerTree` (correctly) does not offer. Extraction keeps the
 * subject the shipped bytes rather than a copy.
 */

import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYNC_SCRIPT = resolve(__dirname, "../../hooks/scripts/sync-workflows.sh");

/** The shipped definition of a top-level shell function, from its header to its closing brace. */
function extractShellFunction(source, name) {
  const header = `${name}() {`;
  const start = source.indexOf(header);
  if (start === -1) throw new Error(`extractShellFunction: ${name} not found in ${SYNC_SCRIPT}`);
  const end = source.indexOf("\n}\n", start);
  if (end === -1) throw new Error(`extractShellFunction: unterminated ${name}`);
  return source.slice(start, end + 3);
}

// Held under T15 (sync-workflows.sh removed by T12): the extraction below is deferred to first
// call, not evaluated eagerly at module-load time, so collection does not throw ENOENT while the
// whole suite is skip-held — REQ C-7 precedent (driftFault.test.js's PROP-SEAM-02 hoist).
let relpathDefCache;
function getRelpathDef() {
  if (relpathDefCache === undefined) {
    relpathDefCache = extractShellFunction(readFileSync(SYNC_SCRIPT, "utf8"), "_pdlc_c3_relpath");
  }
  return relpathDefCache;
}

function relpath(repoRoot, path) {
  return execFileSync(
    "bash",
    ["-c", `set -u\nPDLC_REPO_ROOT="$1"\n${getRelpathDef()}\n_pdlc_c3_relpath "$2"`, "_", repoRoot, path],
    { encoding: "utf8" }
  );
}

describe.skip("F-17 — _pdlc_c3_relpath strips the repo root literally, not as a glob pattern — held under T15: sync scripts removed by T12, suite deleted by T15", () => {
  const ROOTS = [
    ["no metacharacters", "/tmp/pdlc-repo"],
    ["a star", "/tmp/pdlc*repo"],
    ["a question mark", "/tmp/pdlc?repo"],
    ["a bracket class", "/tmp/pdlc[ab]repo"],
    ["a backslash", "/tmp/pdlc\\repo"],
  ];

  for (const [label, root] of ROOTS) {
    it(`returns a repo-relative path when the repo root contains ${label}`, () => {
      expect(relpath(root, `${root}/.claude/workflows/orchestrate-dev.bundle.js`)).toBe(
        ".claude/workflows/orchestrate-dev.bundle.js"
      );
    });
  }

  it("passes a path outside the repo root through unchanged", () => {
    expect(relpath("/tmp/pdlc[ab]repo", "/var/elsewhere/thing.js")).toBe("/var/elsewhere/thing.js");
  });

  it("passes every path through unchanged when the repo root is unset/empty", () => {
    expect(relpath("", "/tmp/pdlc-repo/.claude/workflows/x.js")).toBe(
      "/tmp/pdlc-repo/.claude/workflows/x.js"
    );
  });
});
