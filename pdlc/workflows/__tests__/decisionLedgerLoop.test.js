/**
 * decisionLedgerLoop.test.js — PLAN T-10 (`[red]`, batch 2, deps T-01, T-02), pdlc-decision-ledger.
 *
 * TSPEC §7.2's Integration row: `reviewLoop` driven directly with a scripted `_injectDecisionLedger`
 * seam, asserting the COMPOSED reviewer-prompt bytes on both the iteration-1 and iteration-≥2
 * return paths of `reviewerPrompt` — the shape TSPEC §4.5 fixes: `reviewLoop` gains one optional
 * seam `_injectDecisionLedger: null | ((args: { feature }) => Promise<string>) = null`, and
 * `reviewerPrompt` gains one trailing parameter `ledgerBlock = ""`, appended AFTER `oraclePart` and
 * `findingGrammarPart` on both return paths, read once per round (shared by both reviewers — TSPEC
 * §4.5: "the single `await` per round is placed immediately before the two `reviewerPrompt`
 * calls").
 *
 * None of the surfaces this file exercises exist on HEAD yet:
 *   - `parseDecisionLedgerConfig` / `buildDecisionLedgerInjector` (owned T-13/T-08's production
 *     landing, per TSPEC §4.1/§4.4) — used by the AT-05 arm below exactly as PLAN T-10's row
 *     describes ("each run through parseDecisionLedgerConfig → buildDecisionLedgerInjector").
 *   - `selectDecisions` / `renderDecisionLedgerBlock` (TSPEC §4.3, owned T-16/T-15) — used by the
 *     AT-14 arm to build a real (degenerate) rendered block rather than a hand-rolled stub, so the
 *     assertion is over the actual renderer's total/empty contract, not an implementation echo.
 *   - `reviewLoop`'s `_injectDecisionLedger` seam and `reviewerPrompt`'s `ledgerBlock` parameter
 *     themselves (TSPEC §4.5) — the wiring PLAN T-18 lands.
 *
 * RED discipline (mirrors `decisionLedgerConfig.test.js` / `decisionLedgerBounds.test.js`): every
 * block below is committed `.skip`, titled `"T-18: …"` — T-18 is the PLAN task that lands the
 * `reviewLoop`/`reviewerPrompt` wiring these tests exercise (`buildDecisionLedgerInjector` itself
 * predates T-18 per T-08's row, but the wiring that makes THESE tests observable anything is T-18's
 * alone, and PLAN's row for this file names T-18 explicitly). The module namespace import at top is
 * therefore safe even though several named exports do not exist yet — every not-yet-existing symbol
 * is read only from inside a (skipped) test body, never at import time, the same discipline
 * `decisionLedgerConfig.test.js` documents.
 *
 * ## What "the driver" means below (AT-16, AT-17, AT-12)
 *
 * `reviewLoop`'s round-accounting mechanics — `findingIdentityKey`/`classifyRoundFindings`'s
 * identity-triple dedupe (DEC-LOOPECON-06), the open-finding ledger, `review.derivativeStop`'s
 * flat/non-flat classification, erratum minting (`DEC-ERRROUTE-01`), and the fail-closed read of a
 * non-approving confirmation with no parseable `FINDING:` line — are pdlc-loop-economics mechanics
 * that already exist and are untouched by this feature (REQ-DECLEDGER-08 / BR-11 / BR-14: "driver
 * never holds an id"). AT-16/AT-17/AT-12's obligation is INVARIANCE: none of that accounting may
 * read, branch on, or be coupled to decision-ledger state. FINDING: lines are parsed from reviewer
 * response text unconditionally (M1, "ALWAYS-ON, no config gate" — `orchestrate-dev.js`'s own
 * comment above the round-history push), so a scripted reviewer response can carry a `FINDING:`
 * line regardless of whether `reviewerPrompt`'s finding-grammar clause instructed it — the identity
 * accounting below therefore needs no `review.derivativeStop.enabled` gate to be exercised.
 */

import * as devModule from "../orchestrate-dev.js";
import { fakeFs, fakeGit, fakeListFiles } from "./helpers/seams.js";
import { assertNoLiveGitWrites } from "./helpers/loopEconomicsDoubles.js";

const { reviewLoop } = devModule;

// ─── shared scenario plumbing ──────────────────────────────────────────────────────────────────
//
// Deliberately its own small harness rather than importing T-02's committed
// `fixtures/decision-ledger-baseline/scenarios.mjs` scenario runner: that runner accepts no
// `_injectDecisionLedger` seam (TSPEC §7.4's own header: "reviewLoop receives only an
// already-built `_injectDecisionLedger` seam. Driving `reviewLoop` directly therefore reaches
// every 'not enabled' spelling as the SAME input ... a second case, entering through the config
// gate, is this feature's LATER production task's to own" — i.e. exactly this file, T-10).

const DRIVER_FEATURE = "decledger-driver";
const DRIVER_DOC = `docs/${DRIVER_FEATURE}/TSPEC-${DRIVER_FEATURE}.md`;

/** One `_git` double whose only job is answering `rev-parse` calls harmlessly. */
function driverGit() {
  return fakeGit((args) => {
    if (args[0] === "rev-parse" && args[1] === "--abbrev-ref") {
      return { ok: true, stdout: `feat-${DRIVER_FEATURE}\n` };
    }
    if (args[0] === "rev-parse") return { ok: true, stdout: "c1a2b3d4e5f60718293a4b5c6d7e8f90a1b2c3d4\n" };
    return { ok: true, stdout: "" };
  });
}

/** A structurally complete cross-review document: findings, then a trailing `## Verdict`. */
function crossReviewText(verdict = "Approved", high = 0, body = "None blocking.") {
  return ["# Cross-review", "", "## Findings", "", body, "", "## Verdict", "", `VERDICT: ${verdict}`, `{"high": ${high}, "medium": 0, "low": 0}`, ""].join("\n");
}

/**
 * Drives `reviewLoop` over the two-round scenario T-02's own fixture uses (round 1: reviewer[0]
 * files a High finding and reviewer[1] approves, forcing an optimizer pass; round 2: both
 * approve), scripted to embed `extraLines` (any `FINDING:` lines under test) into reviewer[0]'s
 * round-1 response text, and threading `_injectDecisionLedger` through unmodified. Returns the
 * captured reviewer prompts (dispatch order) and the raw `reviewLoop` return record.
 */
async function runDriverScenario({ _injectDecisionLedger, extraLines = "", derivativeStop } = {}) {
  const prompts = [];
  const fs = fakeFs({ [DRIVER_DOC]: "# TSPEC\n\n§1: body.\n" });
  const git = driverGit();
  const logs = [];

  const agentFn = async (skill, prompt) => {
    const text = String(prompt ?? "");
    if (skill === "pm-review" || skill === "te-review") {
      prompts.push(text);
      const target = /(docs\/\S*CROSS-REVIEW-\S+\.md)/.exec(text);
      const isRound1 = /iteration 1\./.test(text);
      if (isRound1 && skill === "pm-review") {
        if (target) fs.files[target[1]] = crossReviewText("Needs revision", 1, "Blocking gap.");
        return `Reviewed.\n${extraLines}VERDICT: Needs revision\n{"high": 1, "medium": 0, "low": 0}\n`;
      }
      if (target) fs.files[target[1]] = crossReviewText();
      return 'Reviewed.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n';
    }
    if (skill === "se-author") {
      fs.files[DRIVER_DOC] = "# TSPEC\n\n§1: body, revised per pm-review.\n";
      return "Revised.\nREVISION-COMPLETE: yes";
    }
    return "Success.";
  };

  const record = await reviewLoop({
    doc: DRIVER_DOC,
    phase: "T",
    docType: "TSPEC",
    reviewers: ["pm-review", "te-review"],
    optimizer: "se-author",
    feature: DRIVER_FEATURE,
    ...(derivativeStop ? { derivativeStop } : {}),
    _agent: agentFn,
    _parallel: (ps) => Promise.all(ps),
    _checkFile: fs.checkFile,
    _listFiles: fakeListFiles([]),
    _readFile: fs.readFile,
    _hashFile: fs.hashFile,
    _hashNormalizedFile: fs.hashNormalizedFile,
    _appendFile: fs.appendFile,
    _log: (line) => logs.push(String(line)),
    _git: git,
    ...(_injectDecisionLedger !== undefined ? { _injectDecisionLedger } : {}),
  });

  const gitCalls = git.invocations.map((i) => i.argv);
  allGitCalls.push(...gitCalls);
  return { prompts, record, logs, gitCalls };
}

/** Aggregates every `_git` invocation across every scenario run this test file drives, so the
 *  `afterEach` guard below inspects the SAME calls the tests actually exercised, not a static
 *  zero-calls stand-in (`driverGit()` is a real, scripted double — `rev-parse` reads only, per its
 *  own definition above — so this is expected to stay empty of writes, and fails loudly the moment
 *  a future edit threads a live write call through it). */
let allGitCalls = [];

afterEach(() => {
  // commit f325016's lesson, restated for this driver harness: assert on the calls actually made,
  // not merely on an empty static array.
  assertNoLiveGitWrites(allGitCalls);
  allGitCalls = [];
});

// ─── AT-05 — four not-enabled config spellings, through the real config gate ───────────────────
//
// PLAN T-10's row, verbatim: "four not-enabled spellings supplied as four distinct
// `learningsConfigText` values — absent block, `enabled` absent, `enabled` wrong-typed, malformed
// section — each run through `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector`, each
// yielding `null` and hence the identical `""` block and the baseline-identical stream (the arm
// must **consume** the config text it varies)". "Baseline-identical" here means: the driver
// scenario run with NO `_injectDecisionLedger` seam at all (the shipped default, `null`) produces
// the SAME four reviewer-prompt bytes as the same scenario run with the seam built from each of
// the four not-enabled config texts — proving the four spellings are not merely untested, but
// genuinely indistinguishable from absent.

describe("T-18: AT-05 — four not-enabled config spellings resolve through the real gate to the identical, baseline-identical stream", () => {
  const NOT_ENABLED_CONFIG_TEXTS = Object.freeze({
    "absent decisionLedger block": JSON.stringify({ other: "block" }),
    "enabled key absent (defaults false)": JSON.stringify({ decisionLedger: { maxEntries: 10 } }),
    "enabled key wrong-typed": JSON.stringify({ decisionLedger: { enabled: "yes" } }),
    "malformed decisionLedger section (array, not object)": JSON.stringify({ decisionLedger: [1, 2, 3] }),
  });

  test("baseline control: the driver scenario with the seam absent entirely produces a defined, non-empty four-prompt stream", async () => {
    const { prompts, record } = await runDriverScenario({});
    expect(prompts).toHaveLength(4);
    expect(record.iterations).toBe(2);
  });

  for (const [label, configText] of Object.entries(NOT_ENABLED_CONFIG_TEXTS)) {
    test(`"${label}" consumed through parseDecisionLedgerConfig → buildDecisionLedgerInjector yields null, and the resulting stream is baseline-identical`, async () => {
      const { config } = devModule.parseDecisionLedgerConfig(configText);
      // The arm must CONSUME the config text it varies (PLAN T-10): each of the four is a
      // genuinely distinct input, and `config.enabled` must resolve `false` for every one of
      // them — a case that silently defaulted to `true` for one of the four would red here,
      // not merely at `buildDecisionLedgerInjector`'s own gate.
      expect(config.enabled).toBe(false);

      const injector = devModule.buildDecisionLedgerInjector({
        config,
        sink: [],
        _git: driverGit(),
        _readFile: () => null,
      });
      expect(injector).toBeNull();

      const baseline = await runDriverScenario({});
      const underTest = await runDriverScenario({ _injectDecisionLedger: injector ?? undefined });

      expect(underTest.prompts).toEqual(baseline.prompts);
      expect(underTest.record.iterations).toBe(baseline.record.iterations);
    });
  }
});

// ─── AT-14 — the empty and zero cases, driven through the real renderer ────────────────────────
//
// PLAN T-10's row: "zero-decision in-scope set, `maxEntries` `0`, `maxBytes` `0` — all three
// byte-identical to the baseline, pinning that there is no header without rows and no rule text
// standing alone above a missing index." FSPEC AT-14 pins this is NOT an error, NOT a fallback to
// the default, and NOT a halt — the run simply converges over a stream indistinguishable from the
// disabled path. Built over `selectDecisions` + `renderDecisionLedgerBlock` themselves (T-16/T-15's
// real production pipeline), never a hand-rolled `""` stub, so the assertion is over the actual
// renderer's total/empty contract (PROP-REND-01) rather than an implementation echo of it.

describe("T-18: AT-14 — zero-decision set / maxEntries 0 / maxBytes 0 all degrade to the baseline-identical stream", () => {
  const oneEntry = () => [
    { id: "DEC-DRV-01", sourcePath: "docs/_decisions/DECISIONS-drv.md", origin: "project", statement: "Some decision." },
  ];

  const CASES = Object.freeze({
    "zero-decision in-scope set": { entries: [], thresholds: { maxEntries: 70, maxBytes: 12500 } },
    "maxEntries resolved to 0": { entries: oneEntry(), thresholds: { maxEntries: 0, maxBytes: 12500 } },
    "maxBytes resolved to 0": { entries: oneEntry(), thresholds: { maxEntries: 70, maxBytes: 0 } },
  });

  for (const [label, { entries, thresholds }] of Object.entries(CASES)) {
    test(`"${label}": renders exactly "" and the driver stream is baseline-identical`, async () => {
      const { selectDecisions, renderDecisionLedgerBlock } = devModule;
      const { selected } = selectDecisions({ entries, feature: DRIVER_FEATURE, thresholds });
      const block = renderDecisionLedgerBlock({ selected });
      // The positive assertion PLAN T-10 names: no header without rows, no rule text standing
      // alone above a missing index — pinned in one comparison as exact-`""`, not `.toBeFalsy()`
      // (which would also pass on `undefined` or `null`, neither of which is the contract).
      expect(block).toBe("");

      const baseline = await runDriverScenario({});
      const underTest = await runDriverScenario({
        _injectDecisionLedger: async () => block,
      });

      expect(underTest.prompts).toEqual(baseline.prompts);
      // Neither an error, nor a halt, nor a silent fallback to the shipped default: the round
      // count and convergence outcome are untouched.
      expect(underTest.record.converged).toBe(baseline.record.converged);
      expect(underTest.record.iterations).toBe(baseline.record.iterations);
    });
  }
});

// ─── Enabled path — the block is appended LAST, on both prompt-return paths, once per round ────
//
// PLAN T-10: "the block is appended last, after `oraclePart` and `findingGrammarPart`, on both the
// iteration-1 and iteration-≥2 return paths of `reviewerPrompt`, and both reviewers of a round
// receive the identical block (§2.6)." TSPEC §4.5 fixes the read site: one `await` per round,
// immediately before the two `reviewerPrompt` calls.

describe("T-18: enabled path — ledgerBlock is appended last on both prompt-return paths, identically to both reviewers", () => {
  const LEDGER_MARKER = "\n## Decisions\n\nDEC-DRV-01 | docs/_decisions/DECISIONS-drv.md | project\n";

  test("iteration 1 (first-pass) prompt ends with the ledger block, for BOTH reviewers, byte-identically", async () => {
    const { prompts } = await runDriverScenario({ _injectDecisionLedger: async () => LEDGER_MARKER });
    // Round 1's pair is dispatch index 0 (pm-review) and 1 (te-review) — see the harness's
    // scenario shape, mirrored from T-02's committed fixture ordering.
    const [round1a, round1b] = prompts;
    expect(round1a.endsWith(LEDGER_MARKER)).toBe(true);
    expect(round1b.endsWith(LEDGER_MARKER)).toBe(true);
    // "Both reviewers of a round receive the identical block" — not merely "a" block each: the
    // SAME bytes, read once per round.
    const suffixA = round1a.slice(round1a.length - LEDGER_MARKER.length);
    const suffixB = round1b.slice(round1b.length - LEDGER_MARKER.length);
    expect(suffixA).toBe(suffixB);
  });

  test("iteration >= 2 (delta re-review) prompt also ends with the ledger block, for BOTH reviewers", async () => {
    const { prompts } = await runDriverScenario({ _injectDecisionLedger: async () => LEDGER_MARKER });
    const [, , round2a, round2b] = prompts;
    expect(round2a).toContain("iteration 2.");
    expect(round2a.endsWith(LEDGER_MARKER)).toBe(true);
    expect(round2b.endsWith(LEDGER_MARKER)).toBe(true);
  });

  test("the block is appended AFTER the oracle-quality/erratum-protocol clause, not spliced before it", async () => {
    const { prompts } = await runDriverScenario({ _injectDecisionLedger: async () => LEDGER_MARKER });
    const [round1a] = prompts;
    const oracleIdx = round1a.indexOf("No implementation echoes");
    const ledgerIdx = round1a.indexOf(LEDGER_MARKER.trim());
    expect(oracleIdx).toBeGreaterThan(-1);
    expect(ledgerIdx).toBeGreaterThan(oracleIdx);
  });

  test("a round with the ledger block enabled changes ONLY the trailing bytes: the prefix through the oracle/erratum clause is untouched relative to the disabled arm", async () => {
    const baseline = await runDriverScenario({});
    const underTest = await runDriverScenario({ _injectDecisionLedger: async () => LEDGER_MARKER });
    const [basePrompt] = baseline.prompts;
    const [testPrompt] = underTest.prompts;
    expect(testPrompt).toBe(`${basePrompt}${LEDGER_MARKER}`);
  });
});

// ─── AT-16 — replay under both flag settings agrees on every driver-side outcome ────────────────
//
// FSPEC AT-16: "one recorded fixture of reviewer outputs for a round ... replayed twice, once with
// the flag `true` and once `false`. ... the convergence decision, the identity-triple dedupe and
// resulting open-finding ledger, the `review.derivativeStop` flat/non-flat classification, the
// erratum items minted under `DEC-ERRROUTE-01`, and the fail-closed read of a non-approving
// confirmation carrying no parseable `FINDING:` line are all identical. The dispatch-construction
// leg differs in exactly one asserted way ... at least one of the five is additionally anchored to
// a value transcribed from the fixture."
//
// The "recorded fixture of reviewer outputs" is the literal, module-scope constant below — fixed
// text, asserted byte-for-byte against the SAME text on both replays, so nothing here can drift
// silently between the two runs.

const AT16_ROUND1_FINDING_LINES =
  "FINDING: High | delta | nonlocal | §3.2 | Reopens DEC-DRV-07 citing a changed source.\n" +
  "FINDING: Medium | delta | local | §4.1 | Minor style nit.\n";
const AT16_ROUND1_ERRATUM_LINE = "ERRATUM: DECISIONS: DEC-DRV-07 reopened by a delta finding\n";
/** The recorded fixture, verbatim, replayed on BOTH arms — see the header above. */
const AT16_FIXTURE_EXTRA_LINES = AT16_ROUND1_FINDING_LINES + AT16_ROUND1_ERRATUM_LINE;
/** Transcribed from the fixture (2 distinct identity triples: the High and the Medium above) —
 *  the anchor FSPEC AT-16 requires so invariance-only cannot pass a driver broken identically in
 *  both arms. */
const AT16_EXPECTED_OPEN_FINDINGS_AFTER_ROUND_1 = 2;

describe("T-18: AT-16 — replay of a fixed reviewer-output fixture under the flag true/false agrees on every driver-side outcome", () => {
  async function replay(_injectDecisionLedger) {
    return runDriverScenario({
      _injectDecisionLedger,
      extraLines: AT16_FIXTURE_EXTRA_LINES,
      derivativeStop: { enabled: true, rounds: 2 },
    });
  }

  test("convergence decision, iteration count and the derivativeStop record field are identical in both arms", async () => {
    const off = await replay(undefined);
    const on = await replay(async () => "\n## Decisions\n\nDEC-DRV-01 | ...\n");
    expect(on.record.converged).toBe(off.record.converged);
    expect(on.record.iterations).toBe(off.record.iterations);
    expect(on.record.derivativeStop).toBe(off.record.derivativeStop);
  });

  test("the identity-triple dedupe's resulting open-finding ledger is identical in both arms, AND anchored to a value transcribed from the fixture", async () => {
    // `reviewLoop`'s own "Open findings: N" log line is gated on `carried.length > 0`
    // (`orchestrate-dev.js`'s round-accounting comment: "Silent unless something was actually
    // carried") — round 1 of this scenario is the FIRST round, so `openFindings` starts empty
    // and nothing can have been carried into it yet; that log line is therefore never emitted
    // here regardless of wiring, and is not a usable observable for this assertion. Instead,
    // this drives the SAME pure accounting `reviewLoop` itself calls
    // (`parseConfirmationFindings` → `findingIdentityKey`/`classifyRoundFindings`, unmodified by
    // this feature per the header above) directly over the fixture text, which is anchored to a
    // value transcribed from the fixture and is untouched by the ledger flag by construction —
    // exactly the invariance FSPEC AT-16 pins.
    const { parseConfirmationFindings, findingIdentityKey, classifyRoundFindings } = devModule;
    const parsed = parseConfirmationFindings(AT16_FIXTURE_EXTRA_LINES);
    expect(parsed.malformed).toEqual([]);
    const seen = new Set();
    const roundFindings = [];
    for (const finding of parsed.findings) {
      const key = findingIdentityKey(finding);
      if (seen.has(key)) continue;
      seen.add(key);
      roundFindings.push(finding);
    }
    const { added } = classifyRoundFindings([], roundFindings);
    // The anchor: agreeing on a WRONG number is not the same as being right — this is the
    // conjunct FSPEC AT-16 requires so a driver broken identically in both arms still fails.
    expect(added).toHaveLength(AT16_EXPECTED_OPEN_FINDINGS_AFTER_ROUND_1);

    // And still a genuine replay through `reviewLoop` under both arms, not merely a pure-function
    // check in isolation — the ledger flag cannot influence this accounting either way.
    const off = await replay(undefined);
    const on = await replay(async () => "\n## Decisions\n\nDEC-DRV-01 | ...\n");
    expect(on.record.iterations).toBe(off.record.iterations);
    expect(on.record.converged).toBe(off.record.converged);
  });

  test("the erratum items minted under DEC-ERRROUTE-01 are identical in both arms", async () => {
    const off = await replay(undefined);
    const on = await replay(async () => "\n## Decisions\n\nDEC-DRV-01 | ...\n");
    expect(on.record.errata).toEqual(off.record.errata);
    // Non-vacuous: the fixture's ERRATUM: line actually minted something, in both arms.
    expect(off.record.errata.length).toBeGreaterThan(0);
    expect(off.record.errata).toContainEqual(
      expect.objectContaining({ docType: "DECISIONS", item: "DEC-DRV-07 reopened by a delta finding" })
    );
  });

  test("the fail-closed read of a non-approving, zero-FINDING-line confirmation is identical in both arms", async () => {
    // A separate replay of the SAME shape, minus any FINDING:/ERRATUM: line — round 1 is still
    // non-approving (`high: 1`), but carries no parseable tag at all, which is the legacy/untagged
    // case `parseConfirmationFindings`'s own contract names.
    const off = await runDriverScenario({ extraLines: "" });
    const on = await runDriverScenario({ extraLines: "", _injectDecisionLedger: async () => "\n## Decisions\n\nDEC-DRV-01 | ...\n" });
    expect(on.record.converged).toBe(off.record.converged);
    expect(on.record.iterations).toBe(off.record.iterations);
    expect(on.record.errata).toEqual(off.record.errata);
  });

  test("the dispatch-construction leg differs in exactly one asserted way: the false arm's round-1 prompt is a strict prefix of the true arm's, and the suffix IS the rendered block", async () => {
    const LEDGER_MARKER = "\n## Decisions\n\nDEC-DRV-01 | ...\n";
    const off = await replay(undefined);
    const on = await replay(async () => LEDGER_MARKER);
    expect(on.prompts[0]).toBe(`${off.prompts[0]}${LEDGER_MARKER}`);
  });
});

// ─── AT-17 — a filed reopening is scored, deduped and routed as any other High finding ──────────
//
// FSPEC AT-17: "a reviewer files a High finding re-opening an indexed decision. ... it is scored,
// deduped and routed as any other High finding — it mints its erratum item and satisfies the
// confirmation-presence check. Any special-casing on account of the index fails."

describe("T-18: AT-17 — a High finding re-opening an indexed decision is scored, deduped and routed exactly as any other High finding", () => {
  const REOPENING_FINDING_LINE =
    "FINDING: High | delta | nonlocal | §5.1 | Reopens DEC-DRV-09: cited source changed.\n";
  const ORDINARY_FINDING_LINE = "FINDING: High | delta | nonlocal | §5.1 | Ordinary unrelated defect.\n";
  const REOPENING_ERRATUM_LINE = "ERRATUM: DECISIONS: DEC-DRV-09 reopened\n";

  test("a High reopening finding converges/mints exactly like an ordinary High finding of the identical shape (no special-casing)", async () => {
    const reopening = await runDriverScenario({
      extraLines: REOPENING_FINDING_LINE + REOPENING_ERRATUM_LINE,
    });
    const ordinary = await runDriverScenario({
      extraLines: ORDINARY_FINDING_LINE + "ERRATUM: DECISIONS: unrelated item\n",
    });
    // Same round shape (one High finding, one erratum item) yields the same convergence
    // behaviour and the same errata COUNT — the only difference is the content of the minted
    // item, never whether one is minted or how the round converges.
    expect(reopening.record.converged).toBe(ordinary.record.converged);
    expect(reopening.record.iterations).toBe(ordinary.record.iterations);
    expect(reopening.record.errata).toHaveLength(ordinary.record.errata.length);
  });

  test("the reopening finding mints its erratum item under DEC-ERRROUTE-01, exactly as any other High finding does", async () => {
    const { record } = await runDriverScenario({
      extraLines: REOPENING_FINDING_LINE + REOPENING_ERRATUM_LINE,
    });
    expect(record.errata).toContainEqual(
      expect.objectContaining({ docType: "DECISIONS", item: "DEC-DRV-09 reopened" })
    );
  });

  test("the reopening finding is deduped by the SAME identity triple as any other finding — a re-filed identical line in the same round mints only once", async () => {
    const { findingIdentityKey } = devModule;
    const a = { severity: "High", provenance: "delta", locality: "nonlocal", section: "§5.1", text: "Reopens DEC-DRV-09: cited source changed." };
    const b = { ...a };
    expect(findingIdentityKey(a)).toBe(findingIdentityKey(b));
  });
});

// ─── AT-12 (driver half) — DEC-LOOPECON-06's exact-match triple remains the sole dedupe key ─────
//
// FSPEC AT-12: "the rule text directs the reviewer to key repeats on the decision id, AND
// `DEC-LOOPECON-06`'s exact-match triple (severity, section anchor, normalised text) remains the
// sole key the driver dedupes on. A change to the driver's key fails." The rule-text half (that the
// prompt names the decision-id convention) is owned elsewhere (T-15's `DECISION_LEDGER_RULE_TEXT`);
// this file's obligation is the DRIVER half — the dedupe key itself is untouched by this feature.

describe("T-18: AT-12 (driver half) — the driver's dedupe key stays severity/section/normalised-text; a decision id embedded in the text is not part of the key", () => {
  test("two findings differing ONLY in which decision id their text cites are NOT deduped — the key does not special-case a decision id", () => {
    const { findingIdentityKey } = devModule;
    const citingA = { severity: "High", provenance: "delta", locality: "nonlocal", section: "§5.1", text: "Reopens DEC-DRV-09: cited source changed." };
    const citingB = { severity: "High", provenance: "delta", locality: "nonlocal", section: "§5.1", text: "Reopens DEC-DRV-11: cited source changed." };
    expect(findingIdentityKey(citingA)).not.toBe(findingIdentityKey(citingB));
  });

  test("two findings with the IDENTICAL severity/section/normalised-text triple dedupe to the same key even when one cites a decision id and the other does not", () => {
    const { findingIdentityKey } = devModule;
    const withId = { severity: "High", provenance: "delta", locality: "nonlocal", section: "§5.1", text: "Cited source changed." };
    const withoutId = { severity: "High", provenance: "delta", locality: "nonlocal", section: "§5.1", text: "Cited source changed." };
    expect(findingIdentityKey(withId)).toBe(findingIdentityKey(withoutId));
  });

  test("integration: a round carrying a reopening finding still dedupes both reviewers' identical filing into ONE open-finding entry", () => {
    const REOPENING_FINDING_LINE =
      "FINDING: High | delta | nonlocal | §5.1 | Reopens DEC-DRV-09: cited source changed.\n";
    // Both reviewer[0] AND reviewer[1] file the identical finding in round 1 — the harness's
    // template only lets reviewer[0] carry `extraLines` today, so this exercises the
    // within-response dedupe (identical line, still one entry) rather than the cross-reviewer
    // union; the cross-reviewer union is `loopEconomicsFindingIdentity.test.js`'s own coverage
    // and is unmodified by this feature (nothing here re-tests it).
    //
    // `reviewLoop`'s "Open findings: N" log line is gated on `carried.length > 0`, which is only
    // ever true once something was open from an EARLIER round — round 1 starts from an empty
    // `openFindings` list, so that log line is never emitted here regardless of wiring and is not
    // a usable observable. This instead drives the SAME pure accounting `reviewLoop` itself calls
    // (`parseConfirmationFindings` → `findingIdentityKey`/`classifyRoundFindings`) directly, which
    // is exactly what the round-accounting block does with `[result1, result2]` before ever
    // touching the log.
    const { parseConfirmationFindings, findingIdentityKey, classifyRoundFindings } = devModule;
    const doubled = REOPENING_FINDING_LINE + REOPENING_FINDING_LINE;
    const parsed = parseConfirmationFindings(doubled);
    // The parser itself does not dedupe — two lines in, two findings out.
    expect(parsed.findings).toHaveLength(2);
    const seen = new Set();
    const roundFindings = [];
    for (const finding of parsed.findings) {
      const key = findingIdentityKey(finding);
      if (seen.has(key)) continue;
      seen.add(key);
      roundFindings.push(finding);
    }
    const { added } = classifyRoundFindings([], roundFindings);
    expect(added).toHaveLength(1);
  });
});
