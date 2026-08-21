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
  // CODE_REVIEW v1 F7. The three prompts above are two narrow scenarios; AC-1.2 quantifies over
  // EVERY dispatch outside BR-1's rule, and the only same-branch instrument that covered the
  // rest (LI-AT-03) compared an enabled run to a disabled run of the same branch — the
  // comparison AC-5.1a rules out. This case is a WHOLE `main()` run's non-authoring dispatch
  // set (18 prompts: reviewers across every phase, plus se-implement, harvest-learnings,
  // dod-verify and ship-pr), so the AC-6.2 oracle is whole-run rather than three-prompt.
  "PIPELINE-NON-AUTHORING-PROMPTS": Object.freeze({
    "0.txt": "13964aa0090858f48f7059b99ec2584a296283ade75601d23fc213ad24c70a29",
    "1.txt": "ffb5d2eda6b006c7eccac1eabbe7f4031b36416d5ef629bf4c42089a9b63e378",
    "2.txt": "4d77b0ba51ad64c6edd124178bc9f269f9c6fc39fed66a388c5ac7e06cfa2036",
    "3.txt": "0ae3222ce0e430125a7e878d07e86c40bab8a4f3fc8bf4512dbbad1752595f51",
    "4.txt": "df4afe903ae57be25c02b80618fa38b1c78c9c67eb7367396e69387c9641629c",
    "5.txt": "38ea8c1fcfcb6b813eef9a410ee38126765cfab106c21e4a5921a3d2f0e94aa1",
    "6.txt": "844b8c71d9e6bab97b1fb9c192d624436b816446ba2129a68addfba4d82440a6",
    "7.txt": "4a2e8aecd0d7d63dac1abcf21560f06aee9a165821d4ca2dde08565536f69ca3",
    "8.txt": "4103c82ee094cbe77291065fd18be250b4114ff105f60c2577eac5f170992603",
    "9.txt": "f665ebade95b0a187fa75a4b769e68ca9026b542f01a2092b34527d1a2ba7a68",
    "10.txt": "0830b8bc2ec4253fbbe7d6c777d81613496625eb5c6e675befb9d3ce79faaa72",
    "11.txt": "54c8131fd4cdc98f7ddbab475de6bc3160b8dbc70b35fb2f1111911d9ebd62b3",
    "12.txt": "858f2e9055f0c1261e3d06e03f37af2d0dd1550b3c98b810eb1b8542147f1946",
    "13.txt": "567036df2aa39a041eff434c10d3cd8d40f649ff7138c4aa37b47fccb8ca5f8a",
    "14.txt": "102fe57bc219cfc708fd3dc5961469772b6699ba508ad44bf80770c6843b55c9",
    "15.txt": "e90b8c36451d32020bb9cd9a31d15f0f6cf836bded505c9dca51f5567c3a57fb",
    "16.txt": "2c91edff6cd3d2e91393e1ea9a283e23b3543f4b2ae1390038746c2bf020f890",
    "17.txt": "a15fc36f1484d029836b05c6e5b794a607aa373d0c971f9b815118f66ddd2b59",
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

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CR round 1, PM F-03 / TE F-03 (High): the baseline is USED, not merely guarded.
//
// Everything above this line re-hashes the fixture against hand-transcribed digests of ITSELF.
// That proves the fixture has not drifted; it proves nothing about the code. AC-5.1a requires
// every composed dispatch on a non-injecting run to be byte-identical to "AC-6.2's recorded
// baseline — THAT COMMITTED PRE-FEATURE FIXTURE, NOT A SECOND BRANCH OF THIS RUN", and PLAN
// §DoD item 4 widens it to four states. Before this block no test read a fixture file and
// compared it to a composed prompt at all, so the three tests titled "byte-identical to the
// recorded pre-feature baseline" in `learningsDispatchSet.test.js` all compared an enabled run
// to a disabled run of the same branch — the comparison AC-5.1a explicitly excludes. A
// regression that changed base-prompt composition on BOTH arms passed every one of them.
//
// The subject here is branch code at HEAD; the expected value is merge-base bytes on disk. The
// two scenarios reproduce the capture provenance recorded at the top of this file exactly:
//   - PHASE-R-REVIEW-PROMPTS  — `reviewLoop` driven directly, Phase R / docType REQ, reviewers
//     se-review + te-review, both approving immediately.
//   - PHASE-F-AUTHORING-PROMPT — `main()` from a REQ path, Phase R approving immediately so
//     Phase F's pm-author creator dispatch is reached; the run halts cleanly afterwards because
//     the FSPEC is never written back into the fake filesystem.
// Both come from `branchGuard.test.js`'s already-proven harness pattern, which is what the
// capture itself was driven through.
//
// The four non-injecting states of PLAN §DoD item 4 are each driven SEPARATELY against the same
// expected bytes, because they reach "no block" through four different code paths:
//   (1) DISABLED         — `config.learningsInjection.enabled === false`; `buildLearningsInjector`
//                          returns null, so the composition site never calls it (§I.4/AC-5.1a).
//   (2) EMPTY            — enumeration succeeds and returns nothing; `corpusOutcome: RSN-EMPTY`.
//   (3) UNLISTABLE       — enumeration FAILS; `corpusOutcome: RSN-UNLISTABLE` (BR-12, fail-open).
//   (4) ADMITS-NOTHING   — a real corpus document is enumerated and read, and every one of them
//                          is rejected `RSN-NO-MATERIAL`, so the selection is empty.
// (4) is the one that would catch injected text leaking into a non-injecting run through a path
// the other three never take — it is the only arm where the injector actually opens a file and
// renders. AC-6.2's named regression is undetectable without it.

import * as devModule from "../orchestrate-dev.js";
import {
  BASELINE_MERGE_BASE_REF,
  BASELINE_SCENARIOS,
  NON_INJECTING_STATES,
} from "./helpers/learningsBaselineScenarios.js";

/** The fixture bytes, read from disk — the expected value, never recomputed from the code. */
const baselineBytes = (caseId, dispatchIndex) =>
  readFileSync(path.join(FIXTURE_DIR, caseId, `${dispatchIndex}.txt`), "utf8");

describe("learningsBaselineGuard — the committed baseline as an ORACLE (AC-5.1a, AC-6.2; PLAN §DoD item 4)", () => {
  // The scenarios are the SAME module the capture drives against the merge-base worktree
  // (`scripts/capture-learnings-baseline.mjs`), so "the code that produced the fixtures" and
  // "the code the fixtures are compared against" are one definition differing only in which
  // `orchestrate-dev.js` they are handed. Before CODE_REVIEW v1 F1 the capture harness was an
  // uncommitted one-off script and this file re-implemented it by hand.
  for (const state of NON_INJECTING_STATES) {
    describe(state.name, () => {
      for (const scenario of BASELINE_SCENARIOS) {
        it(`${scenario.caseId}: every composed dispatch is byte-identical to the committed pre-feature fixture`, async () => {
          const prompts = await scenario.run(devModule, state);

          // The control: the run composed the dispatches the fixture records, so the equalities
          // below are not passing on an empty list. Asserted as an EQUALITY against the
          // committed file count, never `> 0` — a run that composed half the dispatch set would
          // otherwise pass on the prefix it did compose.
          const expectedCount = Object.keys(EXPECTED_DIGESTS[scenario.caseId]).length;
          expect(prompts).toHaveLength(expectedCount);

          for (let i = 0; i < expectedCount; i += 1) {
            expect({ index: i, prompt: prompts[i] }).toEqual({
              index: i,
              prompt: baselineBytes(scenario.caseId, i),
            });
          }
        });
      }
    });
  }

  // The control for the whole block: the instrument CAN tell the two apart. A comparison that
  // passes because both sides are empty, or because the fixture reader silently returned "",
  // is the defect this block exists to remove — so prove the assertion is capable of failing.
  it("the fixture bytes are non-trivial and an altered prompt would not compare equal (the instrument fires)", () => {
    const f = baselineBytes("PHASE-F-AUTHORING-PROMPT", 0);
    expect(f.length).toBeGreaterThan(1000);
    expect(f).not.toBe(`${f}\n\n--- PRIOR-FEATURE LEARNINGS (advisory context) ---`);
  });

  // The capture entry point and this guard must agree on WHICH "before" state the fixtures
  // record; otherwise `node scripts/capture-learnings-baseline.mjs` would rewrite them against
  // a different merge base and this file's hand-transcribed digests would be re-transcribed to
  // match, defeating the guard (CODE_REVIEW v1 F1).
  it("the capture entry point's pinned merge-base ref is the one the hand-transcribed digests were taken at", () => {
    expect(BASELINE_MERGE_BASE_REF).toBe(EXPECTED_MERGE_BASE_SHA);
  });

  // Set equality over the SCENARIO set, not only over the fixture directory: a scenario silently
  // dropped from the matrix would stop being captured and stop being compared, while every
  // digest assertion above still passed over the fixtures that remained.
  it("the committed scenario matrix's caseId set equals the hand-transcribed digest set", () => {
    expect(BASELINE_SCENARIOS.map((s) => s.caseId).sort()).toEqual(
      Object.keys(EXPECTED_DIGESTS).sort()
    );
  });
});
