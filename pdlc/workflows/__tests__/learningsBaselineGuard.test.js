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

import mainDev, { reviewLoop as reviewLoopDev } from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";

/** `LEARNINGS_CORPUS_ARGV`'s recognisable prefix, restated (never imported) as every other
 *  suite in this feature restates it. */
const isLearningsEnumerateCall = (argv) =>
  Array.isArray(argv) && argv[0] === "ls-files" && argv.includes(":(glob)docs/*/LEARNINGS-*.md");

const REV_PARSE = "rev-parse --abbrev-ref HEAD";
const silent = () => {};

/**
 * The scripted all-approve `_agent` double both scenarios below dispatch through — a locally
 * scoped double, never the live transport (AC-6.1, and `learningsSuiteMap.test.js`'s
 * PROP-META-06 scans for exactly this construction shape).
 *
 * @param {(skill: string, prompt: string) => void} record - called once per dispatch.
 */
function makeBaselineAgent(record) {
  const agent = async (skill, prompt) => {
    record(skill, String(prompt ?? ""));
    return 'Done.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
  };
  return agent;
}

/** The fixture bytes, read from disk — the expected value, never recomputed from the code. */
const baselineBytes = (caseId, dispatchIndex) =>
  readFileSync(path.join(FIXTURE_DIR, caseId, `${dispatchIndex}.txt`), "utf8");

/**
 * One non-injecting state, expressed as the two seam behaviours that distinguish it: the
 * `.claude/pdlc.config.json` text, and the reply to the LEARNINGS enumeration call.
 * `corpusFiles` are additional readable paths (arm 4's real corpus document).
 */
const NON_INJECTING_STATES = [
  {
    name: "DISABLED — learningsInjection.enabled is false",
    configText: JSON.stringify({ learningsInjection: { enabled: false } }),
    enumerateReply: () => ({ ok: true, stdout: "" }),
    corpusFiles: {},
  },
  {
    name: "EMPTY — enumeration succeeds and returns no corpus document (RSN-EMPTY)",
    configText: null,
    enumerateReply: () => ({ ok: true, stdout: "" }),
    corpusFiles: {},
  },
  {
    name: "UNLISTABLE — enumeration fails (RSN-UNLISTABLE, fail-open)",
    configText: null,
    enumerateReply: () => ({ ok: false, stdout: "", stderr: "fatal: not a git repository" }),
    corpusFiles: {},
  },
  {
    name: "ADMITS-NOTHING — a real corpus document is read and rejected RSN-NO-MATERIAL",
    configText: null,
    enumerateReply: () => ({
      ok: true,
      stdout: "docs/completed/li06-prior/LEARNINGS-li06-prior.md\n",
    }),
    corpusFiles: {
      // A well-formed LEARNINGS document carrying none of BR-6's five priority sections, so the
      // selection is empty even though the injector enumerated, opened and parsed it.
      "docs/completed/li06-prior/LEARNINGS-li06-prior.md":
        "# LEARNINGS — li06-prior\n\n| Field | Value |\n|---|---|\n| Date Completed | 2026-01-01 |\n\n## Not A BR-6 Section\n\nNothing BR-6 recognises.\n",
    },
  },
];

describe("learningsBaselineGuard — the committed baseline as an ORACLE (AC-5.1a, AC-6.2; PLAN §DoD item 4)", () => {
  for (const state of NON_INJECTING_STATES) {
    describe(state.name, () => {
      it("PHASE-R-REVIEW-PROMPTS: both Phase R reviewer prompts are byte-identical to the committed pre-feature fixture", async () => {
        const FEATURE = "li06-phase-r-review";
        const prompts = [];
        const git = fakeGit((argv) => {
          if (isLearningsEnumerateCall(argv)) return state.enumerateReply();
          return argv.join(" ") === REV_PARSE
            ? { ok: true, stdout: `feat-${FEATURE}\n` }
            : { ok: true };
        });

        await reviewLoopDev({
          doc: `docs/${FEATURE}/REQ-${FEATURE}.md`,
          phase: "R",
          docType: "REQ",
          reviewers: ["se-review", "te-review"],
          optimizer: "pm-author",
          feature: FEATURE,
          _agent: makeBaselineAgent((skill, prompt) => prompts.push(prompt)),
          _parallel: (promises) => Promise.all(promises),
          _checkFile: () => ({ ok: true }),
          _listFiles: fakeListFiles([]),
          _readFile: (p) => state.corpusFiles[String(p)] ?? null,
          _log: silent,
          _git: git,
        });

        // The control: the run composed the dispatches the fixture records, so the equalities
        // below are not passing on an empty list.
        expect(prompts).toHaveLength(2);
        expect(prompts[0]).toBe(baselineBytes("PHASE-R-REVIEW-PROMPTS", 0));
        expect(prompts[1]).toBe(baselineBytes("PHASE-R-REVIEW-PROMPTS", 1));
      });

      it("PHASE-F-AUTHORING-PROMPT: Phase F's creator prompt is byte-identical to the committed pre-feature fixture", async () => {
        const FEATURE = "li06-phase-f-authoring";
        const REQ_PATH = `docs/${FEATURE}/REQ-${FEATURE}.md`;
        const fs = fakeFs({ [REQ_PATH]: "# REQ\n\nBody.\n", ...state.corpusFiles });
        const git = fakeGit((argv) => {
          if (isLearningsEnumerateCall(argv)) return state.enumerateReply();
          return argv.join(" ") === REV_PARSE
            ? { ok: true, stdout: `feat-${FEATURE}\n` }
            : { ok: true };
        });
        const authoring = [];
        const injections = fs.injections();
        const baseReadFile = injections._readFile;

        await mainDev({
          ...injections,
          reqPath: REQ_PATH,
          _agent: makeBaselineAgent((skill, prompt) => {
            if (skill === "pm-author" || skill === "se-author") authoring.push(prompt);
          }),
          _parallel: (promises) => Promise.all(promises),
          _pipeline: async (label, fn) => fn(),
          _phase: silent,
          _log: silent,
          _listFiles: fakeListFiles([]),
          _git: git,
          // The config is read off this same seam, once per run (§I.2) — the one channel that
          // turns the injector off. Everything else falls through to the fake filesystem.
          _readFile: async (p) =>
            String(p).endsWith("pdlc.config.json") ? state.configText : baseReadFile(p),
        });

        expect(authoring).toHaveLength(1); // the control
        expect(authoring[0]).toBe(baselineBytes("PHASE-F-AUTHORING-PROMPT", 0));
      });
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
});
