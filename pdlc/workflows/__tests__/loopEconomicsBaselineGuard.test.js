/**
 * loopEconomicsBaselineGuard.test.js — PLAN T-02, TSPEC §9, FSPEC §7.4, REQ C-2.
 *
 * The pre-M2/M3 byte-identity baseline for pdlc-loop-economics, and the oracle that uses it.
 *
 * REQ-LOOPECON-04 ("pin-check disabled ⇒ the dispatch stream is byte-identical") and
 * REQ-LOOPECON-07 ("derivative-stop disabled ⇒ the convergence decision and `reviewerPrompt`
 * bytes are identical") are claims about a BEFORE state. TSPEC §9 requires them to be proven
 * against a **committed fixture baseline captured from the merge base**, never by comparing an
 * enabled arm to a disabled arm of the same branch: a regression that corrupts both arms
 * identically passes every same-branch comparison. PLAN §8 row 1 names the matching risk —
 * "baseline fixtures captured after an M2/M3 change has already landed ⇒ the byte-identity
 * claim proves nothing" — and PLAN §2 makes the ordering a real dependency edge rather than a
 * prose note: T-14 and T-15 carry `Deps: T-02` even though neither imports anything from it.
 *
 * This file therefore does two separable jobs:
 *
 *   1. **Guard the artifact.** The fixture bytes have not drifted, measured against a
 *      hand-transcribed digest literal per file (below) — never against `MANIFEST.json` or
 *      against a recomputation of the fixtures themselves, both of which a re-capture rewrites
 *      in lockstep with the thing they would be checking.
 *   2. **Use the artifact.** Drive branch HEAD's `orchestrate-dev.js` through the SAME scenario
 *      matrix the capture drove against merge-base code, and compare the composed bytes to the
 *      committed files. Job 1 alone re-hashes the fixture against a digest of itself and proves
 *      nothing at all about the code (the CR-round-1 lesson recorded in
 *      `learningsBaselineGuard.test.js`).
 *
 * ## Capture provenance (TSPEC §9's "reviewable diff" requirement)
 *
 * Captured by the shipped `scripts/capture-learnings-baseline.mjs` harness — `runCaptureScript`,
 * which materialises the merge-base worktree with `git worktree add`, imports that tree's
 * `pdlc/workflows/orchestrate-dev.js`, and removes the worktree in a `finally` — driven from an
 * uncommitted one-off invocation script, against merge base
 * `95005dad8fe21178fd25e9ec0b2586e796747916` (`git merge-base origin/main HEAD` on
 * `feat-pdlc-loop-economics`).
 *
 * The capture is valid **now**, before any M2/M3 production change exists:
 * `pdlc/workflows/orchestrate-dev.js` is byte-identical between that merge base and branch
 * HEAD (`git diff <merge-base> HEAD -- pdlc/workflows/orchestrate-dev.js` is empty; the branch
 * carries only `docs/` commits so far), so "merge-base bytes" and "branch bytes" name the same
 * thing today and will diverge only as this feature lands.
 *
 * The scenario matrix lives at
 * `__tests__/fixtures/loop-economics-baseline/scenarios.mjs` — one definition imported by BOTH
 * the capture and this guard, differing only in which `orchestrate-dev.js` module namespace is
 * handed to it. It sits under the fixture directory rather than under `__tests__/helpers/`
 * because PLAN §4's ownership manifest gives T-02 exactly two paths and `__tests__/helpers/` is
 * T-01's in the same batch; jest never collects it (`testPathIgnorePatterns` excludes
 * `/__tests__/fixtures/`).
 *
 * ## Three-step mutation proof (TSPEC §9), performed against the committed fixtures BEFORE
 * this file was committed, each mutation restored immediately after observing the red:
 *
 *   (i)   flipped one byte in `PHASE-T-REVIEW-ROUNDS/0.txt` (first char `R` → `X`) ⇒ exactly
 *         two assertions red, `2 failed, 22 passed`: that file's per-file digest assertion,
 *         with "digest mismatch for PHASE-T-REVIEW-ROUNDS/0.txt — recomputed 3831bf09…,
 *         hand-transcribed 4565c447…", and the ORACLE block's byte comparison for that case.
 *         Its `MANIFEST.json` assertion stayed GREEN, which is the point of transcribing the
 *         digests by hand: the manifest agrees with a rewritten fixture, the literal does not.
 *         Restored, suite green again (`24 passed`).
 *   (ii)  deleted the whole `CASCADE-DOWNSTREAM-REDISPATCH/` directory ⇒ `8 failed, 16 passed`,
 *         led by the **case-id set-equality** assertion. This is the "missing case" half:
 *         `actual ⊉ expected`. Restored, suite green again.
 *   (iii) added a spurious `fixtures/loop-economics-baseline/SPURIOUS-CASE/` directory
 *         (containing a `0.txt`) absent from `EXPECTED_DIGESTS` ⇒ `1 failed, 23 passed` — the
 *         SAME set-equality assertion and nothing else, this time for the opposite reason
 *         (`actual ⊋ expected`). Removed, suite green again.
 *
 * Steps (ii) and (iii) are the two halves that make the case-id check **set equality rather
 * than containment**, and they are not interchangeable: a containment check written
 * `expected.every(id => actual.includes(id))` still catches (ii), but (iii) is invisible to it —
 * a silently added case would ride along uncompared. Step (i) targets a third clause entirely
 * (a per-file digest), so all three were required and none was redundant.
 *
 * ## No red predecessor, by construction
 *
 * PLAN §5 marks batch 1 as NOT red-terminal: T-00, T-02 and T-03 are guards that pin properties
 * already true at HEAD, so there is no failing predecessor test to point at. The falsifying
 * anchors are the hand-transcribed digests and the mutation proof above.
 */

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import { assertNoLiveGitWrites } from "./helpers/loopEconomicsDoubles.js";
import {
  BASELINE_MERGE_BASE_REF,
  BASELINE_SCENARIOS,
  takeRecordedGitArgv,
} from "./fixtures/loop-economics-baseline/scenarios.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const FIXTURE_DIR = path.join(__dirname, "fixtures", "loop-economics-baseline");
const MANIFEST_PATH = path.join(FIXTURE_DIR, "MANIFEST.json");

/**
 * The hand-transcribed anchor: one entry per `{caseId}`, copied by hand from the capture run's
 * own console output. Deliberately NOT read from `MANIFEST.json` and not recomputed from the
 * fixture files — either would make this file agree with a re-capture by construction, which is
 * precisely the drift TSPEC §9 requires it to catch.
 */
const EXPECTED_DIGESTS = Object.freeze({
  // The cascade walk's `UPSTREAM-CASCADE CONFIRMATION` dispatch stream, in dispatch order:
  // two stale downstream documents (PLAN, then PROPERTIES) × two reviewer roles each. This is
  // the stream M2's collect/dispatch split must leave byte-identical while `cascade.pinCheck`
  // is absent (REQ-LOOPECON-04).
  "CASCADE-DOWNSTREAM-REDISPATCH": Object.freeze({
    "0.txt": "857d334ee7e40278047f6b3c8eca0f31f68547228a2df0e22258355f0b226caf",
    "1.txt": "e2ca269c84a4e9c764759f7931e62c10bc6ff7886fcbf557a938cfdaf728f5d7",
    "2.txt": "4ec936d84fe5c18a965b1d3430f4ef02bd591b41c089d444de1ebd885ff7bbcf",
    "3.txt": "e4193165c84302a53c7695358a681fb2146e1a00d4cf359e04ed569714ac179a",
  }),
  // One Phase T review round: `0.txt` and `1.txt` are the two `reviewerPrompt` bodies, `2.txt`
  // is the convergence decision `reviewLoop` returned, serialised with sorted keys. M3 must
  // leave all three byte-identical while `review.derivativeStop` is absent (REQ-LOOPECON-07,
  // which names both halves — "convergence decision AND `reviewerPrompt` bytes").
  "PHASE-T-REVIEW-ROUNDS": Object.freeze({
    "0.txt": "4565c44717294c1431a61b9fd3adff763ca5fe72e7c1d09b01aad2dc39191f7d",
    "1.txt": "b5ac9983ebcfb39a38b40044366092bbd1fef170df89fa4a8d2e9a10d53ef3ff",
    "2.txt": "55b08d45e792a282204582109e052eaaf6b0adc8d490bbb35b1be1300d0de1ae",
  }),
});

/** The merge-base sha the capture was taken at (transcribed alongside the digests above). */
const EXPECTED_MERGE_BASE_SHA = "95005dad8fe21178fd25e9ec0b2586e796747916";

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

/** The fixture bytes, read from disk — the expected value, never recomputed from the code. */
const baselineBytes = (caseId, dispatchIndex) =>
  readFileSync(path.join(FIXTURE_DIR, caseId, `${dispatchIndex}.txt`), "utf8");

/** The only `git commit` these scenarios may provoke: `appendApprovalAnchors`' anchor commit. */
const APPROVAL_ANCHOR_COMMIT = /^chore\(pdlc\): record approval anchors sha256:[0-9a-f]{64}$/;

// TSPEC §10 / commit `f325016`: the mandatory leak check. Every scenario's `_git` is a scripted
// `fakeGit` recording into the matrix module's own log; if one were ever left at its real
// default — or if production grew an unreviewed write path — the argv would show up here and
// red immediately rather than writing to the repository. The log is drained each time, so one
// test's calls can never be attributed to the next.
//
// These scenarios DO reach one production write path through the seam: both of them converge a
// review round, and `appendApprovalAnchors` commits the anchor pair it has just appended. The
// rule TSPEC §10 states is stricter than "the double is fake" — a recorded `commit` must be one
// this file names and asserts on — so the shape of every recorded commit is pinned here BEFORE
// `commit` is opted in. A `push`, or a commit of any other shape, still reds.
afterEach(() => {
  const recorded = takeRecordedGitArgv();
  const unexpectedCommitMessages = recorded
    .filter((argv) => argv[0] === "commit")
    .map((argv) => String(argv[2] ?? ""))
    .filter((message) => !APPROVAL_ANCHOR_COMMIT.test(message));
  expect(unexpectedCommitMessages).toEqual([]);
  assertNoLiveGitWrites(recorded, { allow: ["commit"] });
});

describe("loopEconomicsBaselineGuard — the committed pre-M2/M3 fixture (TSPEC §9)", () => {
  it("the committed fixture directory's caseId set equals the hand-transcribed set (set equality, not containment)", () => {
    // Both directions at once: a deleted case fails because `found` is short, a spurious case
    // fails because `found` is long. Containment would catch only the second.
    expect(actualCaseIds()).toEqual(Object.keys(EXPECTED_DIGESTS).sort());
  });

  it("MANIFEST.json's file-key caseId set equals the hand-transcribed set (set equality, not containment)", () => {
    const manifest = readManifest();
    const manifestCaseIds = [
      ...new Set(Object.keys(manifest.files).map((relPath) => relPath.split("/")[0])),
    ].sort();
    expect(manifestCaseIds).toEqual(Object.keys(EXPECTED_DIGESTS).sort());
  });

  it("the committed scenario matrix's caseId set equals the hand-transcribed set", () => {
    // Over the SCENARIOS, not only over the directories: a scenario silently dropped from the
    // matrix would stop being captured and stop being compared, while every digest assertion
    // below still passed over the fixtures that happened to remain on disk.
    expect(BASELINE_SCENARIOS.map((s) => s.caseId).sort()).toEqual(
      Object.keys(EXPECTED_DIGESTS).sort()
    );
  });

  it("the capture entry point's pinned merge-base ref is the one the digests were taken at", () => {
    // The capture and this guard must agree on WHICH "before" state the fixtures record.
    // If they could disagree, `node` re-running the capture would rewrite the fixtures against
    // a different base and these digests would simply be re-transcribed to match.
    expect(BASELINE_MERGE_BASE_REF).toBe(EXPECTED_MERGE_BASE_SHA);
  });

  for (const [caseId, files] of Object.entries(EXPECTED_DIGESTS)) {
    describe(`caseId ${caseId}`, () => {
      it("its dispatch-index file set equals the hand-transcribed set (set equality, not containment)", () => {
        expect(readdirSync(path.join(FIXTURE_DIR, caseId)).sort()).toEqual(
          Object.keys(files).sort()
        );
      });

      for (const [fileName, expectedDigest] of Object.entries(files)) {
        const relPath = `${caseId}/${fileName}`;

        it(`${relPath}'s recomputed SHA-256 digest matches the hand-transcribed literal`, () => {
          const filePath = path.join(FIXTURE_DIR, caseId, fileName);
          expect(existsSync(filePath)).toBe(true);
          const actualDigest = sha256OfFile(filePath);
          if (actualDigest !== expectedDigest) {
            throw new Error(
              `pdlc-loop-economics-baseline-guard: digest mismatch for ${relPath} — recomputed ` +
                `${actualDigest}, hand-transcribed ${expectedDigest}. Either a byte-identity ` +
                `regression, or a legitimate re-capture whose new digest was never transcribed ` +
                `into this file (TSPEC §9).`
            );
          }
        });

        it(`${relPath}'s MANIFEST.json entry matches the hand-transcribed literal`, () => {
          expect(readManifest().files[relPath]).toBe(expectedDigest);
        });
      }
    });
  }

  it("MANIFEST.json's recorded mergeBaseSha is an ancestor of HEAD (weaker second signal)", () => {
    // Kept only as a second signal: a later `main` commit is still an ancestor of HEAD, so
    // ancestry alone cannot distinguish "pre-feature" from "mid-feature". The hand-transcribed
    // digests are the load-bearing check; this one catches a manifest naming a sha that was
    // never merged at all. `git merge-base --is-ancestor` is a read-only git call — the
    // `afterEach` leak guard covers the SEAM, and this is not one.
    const manifest = readManifest();
    expect(manifest.mergeBaseSha).toBe(EXPECTED_MERGE_BASE_SHA);
    const result = execFileSync(
      "git",
      ["merge-base", "--is-ancestor", manifest.mergeBaseSha, "HEAD"],
      { cwd: REPO_ROOT, stdio: ["ignore", "ignore", "pipe"] }
    );
    // `execFileSync` throws on a non-zero exit, so reaching this line IS the pass.
    expect(result).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// The baseline as an ORACLE — the half that says something about the code.
//
// Subject: branch HEAD's `orchestrate-dev.js`. Expected value: merge-base bytes on disk. The
// scenarios are the same module the capture drove against the merge-base worktree, so "the code
// that produced the fixtures" and "the code the fixtures are compared against" are one
// definition differing only in which module namespace is handed to it.
//
// Today this block asserts a tautology — `orchestrate-dev.js` is byte-identical between the
// merge base and HEAD — and that is the point: it must be green NOW, so that when T-14 (M2,
// batch 7) and T-15 (M3, batch 8) land with their keys absent from the config, the same
// assertion becomes the REQ-LOOPECON-04 / REQ-LOOPECON-07 proof without anything being
// re-transcribed. A baseline re-captured mid-feature proves nothing (PLAN §8 row 1).

describe("loopEconomicsBaselineGuard — the committed baseline as an ORACLE (REQ-LOOPECON-04, -07)", () => {
  for (const scenario of BASELINE_SCENARIOS) {
    it(`${scenario.caseId}: every recorded byte matches the committed pre-M2/M3 fixture`, async () => {
      const recorded = await scenario.run(devModule);

      // The control: this run actually produced the stream the fixture records, so the
      // equalities below are not passing over an empty list. Asserted as an EQUALITY against
      // the committed file count, never `> 0` — a run that composed half the stream would
      // otherwise pass on the prefix it did compose.
      const expectedCount = Object.keys(EXPECTED_DIGESTS[scenario.caseId]).length;
      expect(recorded).toHaveLength(expectedCount);

      for (let i = 0; i < expectedCount; i += 1) {
        // Compared as `{index, text}` objects so a failure names WHICH entry diverged rather
        // than dumping two multi-kilobyte strings with no position.
        expect({ index: i, text: recorded[i] }).toEqual({
          index: i,
          text: baselineBytes(scenario.caseId, i),
        });
      }
    });
  }

  it("the fixture bytes are non-trivial and an altered stream would not compare equal (the instrument fires)", () => {
    // The control for the whole block: a comparison that passes because both sides are empty,
    // or because the fixture reader silently returned "", is exactly the defect this block
    // exists to remove — so prove the assertion is capable of failing.
    const cascade = baselineBytes("CASCADE-DOWNSTREAM-REDISPATCH", 0);
    expect(cascade).toContain("UPSTREAM-CASCADE CONFIRMATION");
    expect(cascade.length).toBeGreaterThan(1000);
    expect(cascade).not.toBe(`${cascade}\n\nPIN-CHECK ROUND`);

    const decision = baselineBytes("PHASE-T-REVIEW-ROUNDS", 2);
    expect(JSON.parse(decision)).toMatchObject({ converged: true, iterations: 1 });
    // Nothing named `derivativeStop` exists in the pre-M3 convergence decision. This is the
    // negative half of REQ-LOOPECON-07's baseline: when M3 lands disabled, a returned
    // `derivativeStop` field — even `false` — is a difference the byte comparison above will
    // surface, and this assertion says why that is the intended reading rather than an
    // over-strict fixture.
    expect(decision).not.toContain("derivativeStop");
  });
});
