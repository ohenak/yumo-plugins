/**
 * learningsBaselineGuard.test.js — LI-06, PLAN §pdlc-learnings-injection, TSPEC §T.3.
 *
 * Guards the committed pre-feature baseline
 * (`__tests__/fixtures/learnings-baseline/{caseId}/{dispatchIndex}.txt`, `MANIFEST.json`)
 * against silent drift. This is the one oracle in the feature with no red predecessor: the
 * guard is authored *after* the artifact it guards, because the artifact is what pins the
 * "before" state a later red would compare against (TSPEC §T.3).
 *
 * The falsifying anchor is a **hand-transcribed digest literal per `{caseId}`** (DC-14), copied
 * by a human from the capture run below — never derived from `MANIFEST.json` or recomputed from
 * the fixture files themselves, both of which a re-capture would silently rewrite in lockstep.
 * Each literal is asserted against BOTH the recomputed file digests AND `MANIFEST.json`'s own
 * entries, and the `{caseId}` key set is compared by **set equality**, never containment (TSPEC
 * §T.3, TE Q-03): containment would let a silently deleted case pass.
 *
 * Capture provenance (recorded here per TSPEC §T.3's "reviewable diff" requirement): captured
 * by `scripts/capture-learnings-baseline.mjs`'s `runCaptureScript`, driven from a one-off
 * invocation script (not committed) against the merge-base worktree at
 * `mergeBaseSha` below, using two scenarios built on `branchGuard.test.js`'s own
 * already-proven harness pattern (real `main()`, fully seamed via `helpers/seams.js`'s
 * `fakeFs`/`fakeGit`/`fakeListFiles`, no real disk or git process touched by the subject run):
 *
 *   - `PHASE-R-REVIEW-PROMPTS` — Phase R's two reviewer dispatches (se-review, te-review),
 *     both approved immediately.
 *   - `PHASE-F-AUTHORING-PROMPT` — Phase F's creator (pm-author) dispatch, reached because
 *     Phase R above converged; the run halts cleanly afterwards because the creator's response
 *     text is never written back into the fake filesystem (branchGuard.test.js's own
 *     documented behavior for this exact scenario shape).
 *
 * Three-step mutation proof (TE F-04), performed against the committed fixtures BEFORE this
 * file's commit, each restored immediately after observing the red, transcribed verbatim in
 * the task's completion note:
 *
 *   (i)   flipped one byte in `PHASE-F-AUTHORING-PROMPT/0.txt` (first char `C` → `X`) ⇒ only
 *         that case's digest assertion (`recomputeDigest` vs. `EXPECTED_DIGESTS`) reds, with
 *         message "digest mismatch for PHASE-F-AUTHORING-PROMPT/0.txt"; restored, suite green
 *         again.
 *   (ii)  deleted the whole `PHASE-R-REVIEW-PROMPTS/` directory ⇒ the set-equality assertion
 *         reds ("case-id set mismatch"), NOT any per-file digest assertion — a conjunct
 *         containment check (`expected.every(id => actual.includes(id))`) would have let this
 *         pass, since `PHASE-F-AUTHORING-PROMPT` was still present; restored, suite green again.
 *   (iii) added a spurious `pdlc/workflows/__tests__/fixtures/learnings-baseline/SPURIOUS-CASE/`
 *         directory (with a `0.txt` file) absent from `EXPECTED_DIGESTS` ⇒ the set-equality
 *         assertion reds again, this time for the opposite reason (actual ⊋ expected); removed,
 *         suite green again.
 *
 * Each step targets a different clause (a per-file digest; the "missing case" half of set
 * equality; the "extra case" half of set equality), so all three were required and none was
 * skipped.
 */

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const FIXTURE_DIR = path.join(__dirname, "fixtures", "learnings-baseline");
const MANIFEST_PATH = path.join(FIXTURE_DIR, "MANIFEST.json");

/**
 * The hand-transcribed anchor (DC-14): one entry per `{caseId}`, copied by hand from the
 * capture run's own console output / recomputed file digests at capture time. Deliberately
 * NOT read from `MANIFEST.json` — that would make this test agree with a re-capture by
 * construction, which is precisely the failure §T.3 requires this file to catch.
 */
const EXPECTED_DIGESTS = Object.freeze({
  "PHASE-R-REVIEW-PROMPTS": Object.freeze({
    "0.txt": "8004cbd790a5ad184bc57085d4ec6120f65a364c7cc26241b886a3d6a98158ab",
    "1.txt": "984ab8831617e9e1159438ad1b6858d4ef93a4d9dcdc4c50c840762c512e19d7",
  }),
  "PHASE-F-AUTHORING-PROMPT": Object.freeze({
    "0.txt": "d8234ea164018c54c9128871b79b69d4cbda910f423ad06de085d71630ef1514",
  }),
});

/** The merge-base sha the capture was taken at (transcribed alongside the digests above). */
const EXPECTED_MERGE_BASE_SHA = "5a080c7af8c550e839001c7d4cd3d260ead36faa";

function sha256OfFile(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

/** Directories directly under `FIXTURE_DIR` — the actual committed `{caseId}` set. */
function actualCaseIds() {
  return readdirSync(FIXTURE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
}

describe("learningsBaselineGuard — pre-feature prompt-composition baseline (TSPEC §T.3)", () => {
  it("the committed fixture directory's caseId set equals the hand-transcribed set (set equality, not containment)", () => {
    const expectedCaseIds = Object.keys(EXPECTED_DIGESTS).sort();
    const found = actualCaseIds();
    // Both directions, explicitly — this is what makes it set equality rather than
    // containment: a deleted case fails the first, a spurious extra case fails the second.
    expect(found).toEqual(expectedCaseIds);
  });

  it("MANIFEST.json's file-key caseId set equals the hand-transcribed set (set equality, not containment)", () => {
    const manifest = readManifest();
    const manifestCaseIds = [
      ...new Set(Object.keys(manifest.files).map((relPath) => relPath.split("/")[0])),
    ].sort();
    const expectedCaseIds = Object.keys(EXPECTED_DIGESTS).sort();
    expect(manifestCaseIds).toEqual(expectedCaseIds);
  });

  for (const [caseId, files] of Object.entries(EXPECTED_DIGESTS)) {
    describe(`caseId ${caseId}`, () => {
      it("its dispatch-index file set equals the hand-transcribed set (set equality, not containment)", () => {
        const caseDir = path.join(FIXTURE_DIR, caseId);
        const actualFiles = readdirSync(caseDir).sort();
        expect(actualFiles).toEqual(Object.keys(files).sort());
      });

      for (const [fileName, expectedDigest] of Object.entries(files)) {
        const relPath = `${caseId}/${fileName}`;

        it(`${relPath}'s recomputed SHA-256 digest matches the hand-transcribed literal`, () => {
          const filePath = path.join(FIXTURE_DIR, caseId, fileName);
          expect(existsSync(filePath)).toBe(true);
          const actualDigest = sha256OfFile(filePath);
          if (actualDigest !== expectedDigest) {
            throw new Error(
              `pdlc-learnings-baseline-guard: digest mismatch for ${relPath} — recomputed ` +
                `${actualDigest}, hand-transcribed ${expectedDigest}. A byte-identity ` +
                `regression, or a legitimate re-capture whose new digest was never ` +
                `transcribed into this file (TSPEC §T.3).`
            );
          }
        });

        it(`${relPath}'s MANIFEST.json entry matches the hand-transcribed literal`, () => {
          const manifest = readManifest();
          expect(manifest.files[relPath]).toBe(expectedDigest);
        });
      }
    });
  }

  // The merge-base-sha ancestor check — kept as a weaker second signal only (TSPEC §T.3):
  // a later `main` commit is still an ancestor of HEAD, so ancestry alone cannot distinguish
  // pre-feature from mid-feature. The hand-transcribed digests above are the load-bearing
  // check; this one only catches a `MANIFEST.json` naming a sha that was never merged at all.
  it("MANIFEST.json's recorded mergeBaseSha is an ancestor of HEAD (weaker second signal)", () => {
    const manifest = readManifest();
    expect(manifest.mergeBaseSha).toBe(EXPECTED_MERGE_BASE_SHA);
    const result = execFileSync(
      "git",
      ["merge-base", "--is-ancestor", manifest.mergeBaseSha, "HEAD"],
      { cwd: REPO_ROOT, stdio: ["ignore", "ignore", "pipe"] }
    );
    // execFileSync throws (non-zero exit) if the ancestry check fails; reaching here is pass.
    expect(result).toBeDefined();
  });
});
