/**
 * provenanceSeam.test.js — TSPEC §7.2's `_provenance` seam on `orchestrate-dev.js`'s
 * `main()`: default-inertness (P-1) plus kinds 1 and 2 of AC-5.3's four placements
 * (PLAN T20 / T29, PROPERTIES PROP-PROV-2, PROP-PROV-3, PROP-PROV-4).
 *
 * RED (authored by T20, batch 2 — this feature's own `provenanceDoubles.js`,
 * T04, has no `_provenance` seam of its own to exercise yet). Every case below
 * lives inside a single `describe.skip("T29: …", …)` block, un-skipped by T29
 * (batch 3, PLAN §0.10's skipped-block convention) once `orchestrate-dev.js`
 * gains the seam and the two placements. This file has exactly one green
 * owner, so it carries exactly one top-level skip.
 *
 * Harness: `runToErratumHalt` drives the REAL `main()` through the same
 * erratum-protocol halt `erratumProtocol.test.js`'s PROP-ERR-24 case does — a
 * TSPEC-phase reviewer raises an erratum against the FSPEC, and the FSPEC's
 * own approvers do not confirm it, which routes into `erratumPostmortemHalt`
 * (`orchestrate-dev.js:11077-11110`, TSPEC V-16) — the script-owned,
 * `_checkFile`-confirmed POSTMORTEM write kind 2's placement table names.
 * Reusing a real, deterministic halt point (rather than a hand-built call into
 * a private closure `erratumPostmortemHalt` is, since it is not exported)
 * keeps every assertion here about OBSERVABLE behaviour: what `main()`
 * returns and what its `_appendFile`/`_checkFile` seams recorded, never about
 * source text.
 *
 * `_checkFile` and `_appendFile` are `fakeFs`'s real doubles (not a
 * hand-rolled always-true stub), so the POSTMORTEM's existence has to be
 * established the same way the pipeline establishes any other document: the
 * harness's own agent double writes stub POSTMORTEM bytes into the in-memory
 * tree when `main()` dispatches the "Write {postmortemPath}." prompt
 * `erratumPostmortemHalt` sends — mirroring `erratumRewrites`' technique in
 * `erratumProtocol.test.js`. `_checkFile(postmortemPath)` then confirms a REAL
 * write, and `fs.calls` — the cross-operation ordered log — is what proves
 * P-4's "after `_checkFile` confirms" ordering, not a timing assumption.
 */

import main from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";
import { makePopulatedProvenance, NO_PROVENANCE_DOUBLE } from "./helpers/provenanceDoubles.js";

const FEATURE = "pfeat";
const DOCS = `docs/${FEATURE}`;
const FSPEC_PATH = `${DOCS}/FSPEC-${FEATURE}.md`;
const FSPEC_TEXT = "# FSPEC\n\nThe functional specification body.\n";
// Seeded so `reviewLoop`'s TSPEC-LOOP-02 entry precondition — a REAL
// `_checkFile` read, never the always-true stub — finds the document already
// on disk before Phase T's own creator dispatch runs, exactly as `FSPEC_TEXT`
// above lets Phase F's precondition pass.
const TSPEC_PATH = `${DOCS}/TSPEC-${FEATURE}.md`;
const TSPEC_TEXT = "# TSPEC\n\nThe technical specification body.\n";
const ERRATUM_ITEM = "§4's error budget contradicts REQ AC-3";
const POSTMORTEM_PATH = `${DOCS}/POSTMORTEM-T-${FEATURE}.md`;

/** A PLAN the mechanical parser reads (PROPOSAL §3.3) — Phase P refuses others. */
const PARSEABLE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

/** A structurally complete cross-review: a trailing `## Verdict` with one verdict line. */
function crossReviewText(verdict = "Approved", high = 0) {
  return [
    "# Cross-review",
    "",
    "## Findings",
    "",
    "None blocking.",
    "",
    "## Verdict",
    "",
    `VERDICT: ${verdict}`,
    `{"high": ${high}, "medium": 0, "low": 0}`,
    "",
  ].join("\n");
}

/**
 * Drives `main()` to Phase T's erratum-confirmation halt (the same shape as
 * `erratumProtocol.test.js`'s PROP-ERR-24): a TSPEC reviewer raises an
 * erratum against the FSPEC, and the FSPEC's own approvers do NOT confirm it,
 * so `routeErrata` calls `erratumPostmortemHalt`, which writes and confirms
 * `POSTMORTEM_PATH` and throws a halt naming Phase T.
 *
 * `provenance` is threaded to `main()` as `_provenance` only when the caller
 * supplies it — an absent key here is what exercises P-1's true default,
 * never a seam explicitly set to `undefined`.
 */
async function runToErratumHalt({ provenance } = {}) {
  const seeded = {
    [`${DOCS}/REQ-${FEATURE}.md`]: "# REQ\n\nThe requirement body.\n",
    [FSPEC_PATH]: FSPEC_TEXT,
    [TSPEC_PATH]: TSPEC_TEXT,
    [`${DOCS}/PLAN-${FEATURE}.md`]: PARSEABLE_PLAN,
    [`${DOCS}/CROSS-REVIEW-software-engineer-FSPEC-v1.md`]: crossReviewText(),
    [`${DOCS}/CROSS-REVIEW-test-engineer-FSPEC-v1.md`]: crossReviewText(),
  };
  const fs = fakeFs(seeded);

  const agentFn = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";

    // erratumPostmortemHalt's own write prompt (V-16) — simulate a REAL write
    // so the subsequent `_checkFile` confirmation is genuine, not a stub.
    if (text.startsWith(`Write ${POSTMORTEM_PATH}.`)) {
      fs.files[POSTMORTEM_PATH] =
        "# POSTMORTEM\n\n## Phase\n\nT\n\n## Recommendation\n\nAddress the erratum.\n";
      return "POSTMORTEM written and committed.";
    }

    // The delta confirmation — the FSPEC's own approvers, deliberately NOT
    // approving, which is what routes into the erratum halt.
    if (text.includes("DELTA CONFIRMATION")) {
      const match = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      if (match) fs.files[match[1]] = crossReviewText("Needs revision", 1);
      return 'Delta confirmed.\nVERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n';
    }

    if (skill === "se-review" || skill === "te-review" || skill === "pm-review") {
      if (skill === "te-review" && text.includes("for phase T of feature")) {
        return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\nERRATUM: FSPEC: ${ERRATUM_ITEM}\n`;
      }
      return 'Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (skill === "pm-author" || skill === "se-author" || skill === "te-author") {
      if (text.includes("DECISIONS_WARRANTED")) {
        return "Finalized.\nREVISION-COMPLETE: yes\nDECISIONS_WARRANTED: false";
      }
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({
          tasks: [{ id: "TASK-01", description: "First task", dependencies: [], planBatch: 1 }],
        });
      }
      return "Document updated and committed.\nREVISION-COMPLETE: yes";
    }
    return "Document updated and committed.\nREVISION-COMPLETE: yes";
  };

  const git = fakeGit((argv) =>
    argv[0] === "rev-parse" && argv[1] === "--abbrev-ref"
      ? { ok: true, stdout: `feat-${FEATURE}` }
      : { ok: true, stdout: "0123456789abcdef0123456789abcdef01234567" }
  );

  const listFiles = fakeListFiles((dirPath) =>
    Object.keys(fs.files)
      .filter((p) => p.startsWith(`${dirPath}/`) && !p.slice(dirPath.length + 1).includes("/"))
      .map((p) => p.slice(dirPath.length + 1))
  );

  const result = await main({
    reqPath: `${DOCS}/REQ-${FEATURE}.md`,
    _agent: agentFn,
    _parallel: (promises) => Promise.all(promises),
    ...fs.injections(),
    _listFiles: listFiles,
    _git: git,
    _phase: () => {},
    _pipeline: async (label, fn) => fn(),
    ...(provenance !== undefined ? { _provenance: provenance } : {}),
  });

  return { result, fs };
}

describe("T29: _provenance seam — inertness and kinds 1–2 (orchestrate-dev.js)", () => {
  // ─── P-1 — default-inert (PROP-PROV-2) ────────────────────────────────────

  describe("P-1: the seam is default-inert", () => {
    test("PROP-PROV-2: no _provenance supplied ⇒ no POSTMORTEM append at all, byte-identical to today", async () => {
      const { result, fs } = await runToErratumHalt();

      // Positive-presence conjunct FIRST: the halt genuinely reached the
      // POSTMORTEM write-and-confirm step — this is not a run that produced
      // nothing, which is the only way the byte-identity claim below is not
      // vacuous.
      expect(result.outcome).toBe("halted");
      expect(result.haltPhase).toBe("T");
      expect(result.postmortemStatus).toBe("written");
      expect(result.postmortemPath).toBe(POSTMORTEM_PATH);
      expect(fs.checks).toContainEqual({
        path: POSTMORTEM_PATH,
        result: { ok: true },
      });

      // The byte-identity claim: no default-provenance run appends anything.
      expect(fs.appends).toEqual([]);
    });
  });

  // ─── Kind 1 — the run report (PROP-PROV-3) ────────────────────────────────

  describe("Kind 1: the run report states the provenance (AT-4.1)", () => {
    test("PROP-PROV-3: a supplied Provenance rides the report, unchanged, by identity", async () => {
      const p = makePopulatedProvenance();
      const { result } = await runToErratumHalt({ provenance: p });

      // Identity, not structural equality — §7.1's frozen value travels
      // through main() without being rebuilt.
      expect(result.provenance).toBe(p);
      // Both versions, as two distinct values (PROP-PROV-3's own wording).
      expect(result.provenance.engineVersion).toBe(p.engineVersion);
      expect(result.provenance.pluginVersion).toBe(p.pluginVersion);
      expect(result.provenance.engineVersion).not.toBe(result.provenance.pluginVersion);
    });

    test("PROP-PROV-2/3: no _provenance supplied ⇒ the report's provenance field is NO_PROVENANCE", async () => {
      const { result } = await runToErratumHalt();

      expect(result.provenance).toEqual(NO_PROVENANCE_DOUBLE);
    });
  });

  // ─── Kind 2 — every POSTMORTEM (PROP-PROV-4) ──────────────────────────────

  describe("Kind 2: the POSTMORTEM append (AT-4.2, P-4, P-5)", () => {
    test("PROP-PROV-4: _appendFile writes `block` strictly AFTER _checkFile confirms the POSTMORTEM", async () => {
      const p = makePopulatedProvenance();
      const { fs } = await runToErratumHalt({ provenance: p });

      expect(fs.appends).toHaveLength(1);
      expect(fs.appends[0].path).toBe(POSTMORTEM_PATH);
      expect(fs.appends[0].text).toContain(p.block);

      // Ordering, read off the cross-operation log (never assumed from timing).
      const checkIndex = fs.calls.findIndex(
        (c) => c.op === "check" && c.path === POSTMORTEM_PATH && c.result && c.result.ok
      );
      const appendIndex = fs.calls.findIndex(
        (c) => c.op === "append" && c.path === POSTMORTEM_PATH
      );
      expect(checkIndex).toBeGreaterThanOrEqual(0);
      expect(appendIndex).toBeGreaterThan(checkIndex);
    });

    test("PROP-PROV-4/P-5: an empty `block` skips the append entirely — call count === 0", async () => {
      const p = makePopulatedProvenance({ block: "" });
      const { fs } = await runToErratumHalt({ provenance: p });

      // A behavioural call-count, not a shape assertion: the resulting file
      // looks identical whether or not an empty append happened, so the
      // oracle has to be "was `_appendFile` invoked at all" (PROP-PROV-4).
      expect(fs.appends).toEqual([]);
    });
  });
});
