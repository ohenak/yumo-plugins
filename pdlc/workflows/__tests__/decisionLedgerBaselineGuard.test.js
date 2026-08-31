/**
 * decisionLedgerBaselineGuard.test.js — PLAN T-02, TSPEC §7.4, FSPEC O-4, REQ C-2 / REQ-DECLEDGER-02.
 *
 * The pre-feature byte-identity baseline for pdlc-decision-ledger, and the oracle that uses it.
 *
 * AT-04 ("the disabled path's reviewer-prompt stream is byte-identical to the committed
 * merge-base recording") is a claim about a BEFORE state. TSPEC §7.4 requires it to be proven
 * against a **committed fixture baseline captured from the merge base**, never by comparing an
 * enabled arm to a disabled arm of the same branch: a regression that corrupts both arms
 * identically passes every same-branch comparison. This is precisely what
 * `loopEconomicsBaselineGuard.test.js` already does, including the reasoning in its own comment,
 * and TSPEC §7.4 states this feature reuses that shape verbatim rather than redesigning it.
 *
 * This file therefore does two separable jobs:
 *
 *   1. **Guard the artifact.** The fixture bytes have not drifted, measured against a
 *      hand-transcribed digest literal per file (below) — never against `MANIFEST.json` or
 *      against a recomputation of the fixtures themselves, both of which a re-capture rewrites
 *      in lockstep with the thing they would be checking.
 *   2. **Use the artifact.** Drive branch HEAD's `orchestrate-dev.js` `reviewLoop` through the
 *      SAME scenario the capture drove against merge-base code, and compare the composed bytes
 *      to the committed files. Job 1 alone re-hashes the fixture against a digest of itself and
 *      proves nothing at all about the code (the CR-round-1 lesson recorded in
 *      `learningsBaselineGuard.test.js` and repeated in `loopEconomicsBaselineGuard.test.js`).
 *
 * ## Capture provenance (TSPEC §7.4's "reviewable diff" requirement)
 *
 * Captured by the shipped `scripts/capture-learnings-baseline.mjs` harness — `runCaptureScript`,
 * reused unchanged — which materialises the merge-base worktree with `git worktree add`, imports
 * that tree's `pdlc/workflows/orchestrate-dev.js`, drives the `REVIEW-LOOP-REVIEWER-PROMPTS`
 * scenario through the exported `reviewLoop` directly, and removes the worktree in a `finally`.
 * Driven from an uncommitted one-off invocation script, against merge base
 * `72b3c0579ef5d42fbfb6cd881fbce596aa24d593` (`git merge-base origin/main HEAD` on
 * `feat-pdlc-decision-ledger`).
 *
 * The capture is valid **now**, before any production change exists:
 * `pdlc/workflows/orchestrate-dev.js` is byte-identical between that merge base and branch HEAD
 * (`git diff <merge-base> HEAD -- pdlc/workflows/orchestrate-dev.js` is empty; the branch carries
 * only `docs/` and test-fixture commits so far), so "merge-base bytes" and "branch bytes" name the
 * same thing today and will diverge only as this feature lands.
 *
 * The scenario matrix lives at
 * `__tests__/fixtures/decision-ledger-baseline/scenarios.mjs` — one definition imported by BOTH
 * the capture and this guard, differing only in which `orchestrate-dev.js` module namespace is
 * handed to it. It sits under the fixture directory because PLAN's ownership manifest gives T-02
 * exactly two paths, and jest never collects it (`testPathIgnorePatterns` excludes
 * `/__tests__/fixtures/`).
 *
 * ## Three-step mutation proof (TSPEC §7.4), performed against the committed fixtures BEFORE
 * this file was committed, each mutation restored immediately after observing the red:
 *
 *   (i)   flipped one byte in `REVIEW-LOOP-REVIEWER-PROMPTS/2.txt` (first char `R` → `X`) ⇒
 *         `2 failed, 14 passed`: that file's per-file digest assertion ("digest mismatch for
 *         REVIEW-LOOP-REVIEWER-PROMPTS/2.txt — recomputed ..., hand-transcribed ...") and the
 *         ORACLE block's byte comparison for that case's index 2. Its `MANIFEST.json` assertion
 *         stayed GREEN, which is the point of transcribing the digests by hand: the manifest
 *         agrees with a rewritten fixture, the literal does not. Restored, `16 passed` again.
 *   (ii)  deleted the whole `REVIEW-LOOP-REVIEWER-PROMPTS/` directory ⇒ `8 failed, 8 passed`,
 *         led by the case-id set-equality assertion (`actual ⊉ expected`), plus every per-file
 *         assertion inside the (now-missing) directory's `describe` block. Restored,
 *         `16 passed` again.
 *   (iii) added a spurious `fixtures/decision-ledger-baseline/SPURIOUS-CASE/` directory
 *         (containing a `0.txt`) absent from `EXPECTED_DIGESTS` ⇒ `1 failed, 15 passed` — the
 *         SAME set-equality assertion and nothing else, this time for the opposite reason
 *         (`actual ⊋ expected`). Removed, `16 passed` again.
 *
 * Steps (ii) and (iii) are the two halves that make the case-id check **set equality rather
 * than containment**, and they are not interchangeable: a containment check written
 * `expected.every(id => actual.includes(id))` still catches (ii), but (iii) is invisible to it —
 * a silently added case would ride along uncompared. Step (i) targets a third clause entirely
 * (a per-file digest), so all three were required and none was redundant.
 *
 * ## No red predecessor, by construction
 *
 * T-02 is a guard that pins a property already true at HEAD (the disabled path is
 * byte-identical to itself), so there is no failing predecessor test to point at. The falsifying
 * anchors are the hand-transcribed digests and the mutation proof above.
 */

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import * as devModule from "../orchestrate-dev.js";
import {
  BASELINE_MERGE_BASE_REF,
  BASELINE_SCENARIOS,
  takeRecordedGitArgv,
} from "./fixtures/decision-ledger-baseline/scenarios.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const FIXTURE_DIR = path.join(__dirname, "fixtures", "decision-ledger-baseline");
const MANIFEST_PATH = path.join(FIXTURE_DIR, "MANIFEST.json");

/**
 * The hand-transcribed anchor: one entry per `{caseId}`, copied by hand from the capture run's
 * own console output. Deliberately NOT read from `MANIFEST.json` and not recomputed from the
 * fixture files — either would make this file agree with a re-capture by construction, which is
 * precisely the drift TSPEC §7.4 requires it to catch.
 */
const EXPECTED_DIGESTS = Object.freeze({
  // The four reviewer-dispatch prompts of `REVIEW-LOOP-REVIEWER-PROMPTS` (TSPEC §7.4): round 1's
  // pair (iteration 1, first-pass — 0.txt pm-review, 1.txt te-review), then round 2's pair
  // (iteration 2, the delta re-review protocol — 2.txt pm-review, 3.txt te-review). This is the
  // stream this feature's `_injectDecisionLedger` seam must leave byte-identical while absent
  // (AT-04).
  "REVIEW-LOOP-REVIEWER-PROMPTS": Object.freeze({
    "0.txt": "5aae980b0dac29f2c092def9b333c9e549a4e21fe8a527d6924538a72b542506",
    "1.txt": "d97619d073e62529953dfe38a41ad58343be502565924fff8f035fb4434c2e0e",
    "2.txt": "7665632beb3b445a41ee4597a0e053cd94f7f7957f555826f366511f74105470",
    "3.txt": "d21c15b0e84926542f76d2273e5db7e2b2678c7220e5d271cf988b6918feacbe",
  }),
});

/** The merge-base sha the capture was taken at (transcribed alongside the digests above). */
const EXPECTED_MERGE_BASE_SHA = "72b3c0579ef5d42fbfb6cd881fbce596aa24d593";

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

/** The only `git add`/`git commit` this scenario may provoke: round 2's approval-anchor append. */
const APPROVAL_ANCHOR_COMMIT = /^chore\(pdlc\): record approval anchors [0-9a-f]{64}$/;

afterEach(() => {
  // TSPEC §10-style leak check, mirrored from `loopEconomicsBaselineGuard.test.js`: the
  // scenario's `_git` is a scripted `fakeGit` recording into the matrix module's own log. Round
  // 2 converges via a plain approving verdict, so `appendApprovalAnchors` appends the anchor
  // pair and commits it — the shape of that write is pinned here BEFORE `add`/`commit` are
  // allowed through; anything else (a `push`, or a commit of a different shape) still reds.
  const recorded = takeRecordedGitArgv();
  const unexpected = recorded.filter((argv) => {
    if (argv[0] === "rev-parse") return false;
    // The optimizer's advisory pacing check (§ advisory pacing) reads `git diff --numstat`
    // over the reviewed doc and each reviewer's cross-review file — read-only, never a write.
    if (argv[0] === "diff") return false;
    if (argv[0] === "add") return false;
    if (argv[0] === "commit") return !APPROVAL_ANCHOR_COMMIT.test(String(argv[2] ?? ""));
    return true;
  });
  expect(unexpected).toEqual([]);
});

describe("decisionLedgerBaselineGuard — the committed pre-feature fixture (TSPEC §7.4)", () => {
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
    // The capture and this guard must agree on WHICH "before" state the fixtures record. If
    // they could disagree, re-running the capture would rewrite the fixtures against a
    // different base and these digests would simply be re-transcribed to match.
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
              `pdlc-decision-ledger-baseline-guard: digest mismatch for ${relPath} — recomputed ` +
                `${actualDigest}, hand-transcribed ${expectedDigest}. Either a byte-identity ` +
                `regression, or a legitimate re-capture whose new digest was never transcribed ` +
                `into this file (TSPEC §7.4).`
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
    // never merged at all. `git merge-base --is-ancestor` resolves against **HEAD**, never
    // `origin/main`, so it needs no fetch and cannot red on an unrelated push to `main`
    // (TSPEC §7.4). It is a read-only git call — the `afterEach` leak guard covers the SEAM,
    // and this is not one.
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
// Subject: branch HEAD's `orchestrate-dev.js`'s exported `reviewLoop`. Expected value:
// merge-base bytes on disk. The scenario is the same module the capture drove against the
// merge-base worktree, so "the code that produced the fixtures" and "the code the fixtures are
// compared against" are one definition differing only in which module namespace is handed to it.
//
// Today this block asserts a tautology — `orchestrate-dev.js` is byte-identical between the
// merge base and HEAD — and that is the point: it must be green NOW, so that when this feature's
// `_injectDecisionLedger` seam lands with `derivativeStop`-shaped absence, the same assertion
// becomes AT-04's proof without anything being re-transcribed. A baseline re-captured mid-feature
// proves nothing.

describe("decisionLedgerBaselineGuard — the committed baseline as an ORACLE (AT-04)", () => {
  for (const scenario of BASELINE_SCENARIOS) {
    it(`${scenario.caseId}: every recorded byte matches the committed pre-feature fixture`, async () => {
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
    const round1 = baselineBytes("REVIEW-LOOP-REVIEWER-PROMPTS", 0);
    expect(round1).toContain("iteration 1.");
    expect(round1.length).toBeGreaterThan(1000);
    expect(round1).not.toBe(`${round1}\n\nEXTRA`);

    const round2 = baselineBytes("REVIEW-LOOP-REVIEWER-PROMPTS", 2);
    // Round 2 is the delta re-review round: it carries the delta-review protocol text and the
    // "iteration 2" marker, distinguishing it from round 1's full first-pass prompt.
    expect(round2).toContain("iteration 2.");
    expect(round2).toContain("delta re-review protocol");
    expect(round2).not.toContain("iteration 1.");
  });
});
