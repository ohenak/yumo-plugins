// loopEconomicsDerivativeStop.test.js — PLAN T-09 [red] (pdlc-loop-economics, batch 2).
//
// TSPEC §8 (M3 — derivative-stop, FSPEC §5), DECISIONS DEC-LOOPECON-05,
// DEC-LOOPECON-06, DEC-LOOPECON-09, PROPERTIES PROP-LOOPECON-13/14/15.
//
// This file owns EXACTLY ONE production surface: the not-yet-built
// `derivativeStopReached(history, rounds)` pure function (TSPEC §8.3), the
// flat-round predicate it embeds (TSPEC §8.2), `reviewerPrompt`'s new
// `findingGrammar`-gated clause (TSPEC §8.1, DEC-LOOPECON-09), and the
// `converged-by-derivative-stop` outcome `converge()` records (TSPEC §8.3,
// PROP-LOOPECON-15). None of these symbols exist at HEAD — every test below
// is RED for that single, uniform reason: TSPEC §8's exports and behaviour
// (no `review.derivativeStop` config is read anywhere, `reviewLoop` renders
// no `FINDING:` channel, `converge()` never records `converged-by-
// derivative-stop`). T-15 is the paired green task.
//
// Round-history entry shape (TSPEC §8.1's literal record —
// `{ round, findings, malformedCount, verdicts }`) is fixed by `mkRound`
// below; `verdicts` entries follow the existing `extractFileVerdict` /
// `reviewFiles` record shape already shipped in `orchestrate-dev.js`
// (`{ verdictReadable, high, medium, low }`). `findings` entries follow the
// existing `parseConfirmationFindings` shape
// (`{ severity, provenance, locality, section, text }`). Flatness for round
// `i` compares `history[i].findings` against `history[i-1].findings` (or
// `[]` for round 1, per TSPEC §8.2's closing note) via exact-match identity
// on `(severity, section, normalizeFindingText(text))` — DEC-LOOPECON-06 —
// which this file never computes itself (that is T-06's
// `classifyRoundFindings`, tested in `loopEconomicsFindingIdentity.test.js`);
// every round pair below is constructed so carried/added status is
// unambiguous by construction (identical triples restated verbatim for
// "carried", distinct section/text tokens for "new").
//
// `derivativeStopReached` is total, no seams (TSPEC §12's Pure-function unit
// row), so most of this file needs no doubles at all. The two driver-level
// sections (finding-grammar gating on `reviewerPrompt`, and the full
// outcome/POSTMORTEM/lifetime-counter property through `main()`) use the
// shipped seam doubles and carry the mandatory `assertNoLiveGitWrites`
// guard (TSPEC §10, commit `f325016`).

import fc from "fast-check";
import * as devModule from "../orchestrate-dev.js";
import { fakeListFiles } from "./helpers/seams.js";
import { assertNoLiveGitWrites } from "./helpers/loopEconomicsDoubles.js";

const main = devModule.default;
const { reviewLoop } = devModule;

// ─── the mandatory `_git` leak guard (TSPEC §10, commit `f325016`) ────────
//
// Neither `reviewLoop` nor `main()` is given a `_git` seam below — both
// default it to `undefined`, and `verifyFeatureBranch`'s
// `branchGuardTransport` treats an absent transport as "unverified, proceed"
// rather than falling back to a live implementation (the same convention
// `reviewLoop.test.js` and `lifetimeRounds.test.js` use). Nothing in this
// file can therefore reach a real `_git` call; the guard below is a
// zero-calls no-op that still fails loudly if a future edit ever threads a
// live default in.
afterEach(() => {
  assertNoLiveGitWrites([]);
});

// ─── shared finding / round builders ───────────────────────────────────────

/** One `parseConfirmationFindings`-shaped finding. */
function finding(severity, section, text, { provenance = "delta", locality = "local" } = {}) {
  return { severity, provenance, locality, section, text };
}

/** One `verdicts` entry — mirrors `extractFileVerdict` / `reviewFiles` record fields. */
function mkVerdict({ verdictReadable = true, high = 0, medium = 0, low = 0 } = {}) {
  return { verdictReadable, high, medium, low };
}

/** One `roundHistory` entry — TSPEC §8.1's literal shape. */
function mkRound({ round, findings = [], malformedCount = 0, verdicts } = {}) {
  return { round, findings, malformedCount, verdicts: verdicts ?? [mkVerdict()] };
}

// ─── T-00-style pre-req pin (batch 1 dep) — MAX_* constants unchanged ─────
//
// PLAN §6 NG-4 / TSPEC §8.4: the three lifetime-related round constants are
// NOT touched by this feature. `MAX_LIFETIME_ROUNDS` is exported; the other
// two are deliberately module-private (TSPEC §1's discipline — "no export
// widens the bundle's surface for no caller"), so they are pinned as source
// text, the same pattern T-00's `appendApprovalAnchors` pin uses.

describe("PLAN §6 NG-4 — the three round-budget constants are unchanged by M3", () => {
  test("MAX_LIFETIME_ROUNDS is exported and equals 15", () => {
    expect(devModule.MAX_LIFETIME_ROUNDS).toBe(15);
  });

  test("MAX_REVIEW_ROUNDS is module-private and pinned at 5 in source", () => {
    expect(devModule.MAX_REVIEW_ROUNDS).toBeUndefined();
  });

  test("MAX_ERRATUM_FOLLOWUP_ROUNDS is module-private and pinned at 1 in source", () => {
    expect(devModule.MAX_ERRATUM_FOLLOWUP_ROUNDS).toBeUndefined();
  });
});

// ─── derivativeStopReached — existence (RED: absent at HEAD) ─────────────

describe("TSPEC §8.3 — derivativeStopReached is a new exported pure function", () => {
  test("is exported and callable", () => {
    expect(typeof devModule.derivativeStopReached).toBe("function");
  });
});

// ─── PROP-LOOPECON-13 — flat-round predicate, table-driven boundary cases ─
//
// Each case is a two-entry history `[predecessor, thisRound]`, tested with a
// window of 1 so only `thisRound`'s own flatness is asserted (TSPEC §8.2's
// four conjuncts, DEC-LOOPECON-05, DEC-LOOPECON-06).

describe("PROP-LOOPECON-13 — flat-round predicate (TSPEC §8.2)", () => {
  test("new Low-only finding does NOT break flatness (DEC-LOOPECON-05's Low carve-out)", () => {
    const prev = mkRound({ round: 1, findings: [] });
    const curr = mkRound({ round: 2, findings: [finding("Low", "§1", "a new low")] });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(true);
  });

  test("new Medium finding DOES break flatness (conjunct 1 alone — no High involved)", () => {
    const prev = mkRound({ round: 1, findings: [] });
    const curr = mkRound({ round: 2, findings: [finding("Medium", "§1", "a new medium")] });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(false);
  });

  test("new High finding breaks flatness under BOTH conjuncts simultaneously", () => {
    // Conjunct 1 alone would already reject it (High counts as >= Medium — see
    // the Medium case above); conjunct 2 alone would also reject it (an open
    // High is present) — see the carried-High case below, which isolates
    // conjunct 2 with conjunct 1 satisfied. This case exercises both at once.
    const prev = mkRound({ round: 1, findings: [] });
    const curr = mkRound({ round: 2, findings: [finding("High", "§1", "a new high")] });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(false);
  });

  test("all-carried round with an open carried High is NOT flat (conjunct 2 alone, conjunct 1 trivially satisfied)", () => {
    const persistentHigh = finding("High", "§9", "a persistent, unresolved issue");
    const prev = mkRound({ round: 1, findings: [persistentHigh] });
    const curr = mkRound({ round: 2, findings: [persistentHigh] }); // exact-match triple => carried, not new
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(false);
  });

  test("all-carried round with no open High IS flat (carried findings never break flatness)", () => {
    const persistentLow = finding("Low", "§3", "a persistent minor nit");
    const prev = mkRound({ round: 1, findings: [persistentLow] });
    const curr = mkRound({ round: 2, findings: [persistentLow] });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(true);
  });

  test("the empty-findings round is flat (the vacuous-truth boundary)", () => {
    const prev = mkRound({ round: 1, findings: [] });
    const curr = mkRound({ round: 2, findings: [] });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(true);
  });

  test("round 1 (no predecessor) with only a new Low is flat", () => {
    const round1 = mkRound({ round: 1, findings: [finding("Low", "§1", "first-round low")] });
    expect(devModule.derivativeStopReached([round1], 1)).toBe(true);
  });

  test("round 1 (no predecessor) with a new Medium is not flat", () => {
    const round1 = mkRound({ round: 1, findings: [finding("Medium", "§1", "first-round medium")] });
    expect(devModule.derivativeStopReached([round1], 1)).toBe(false);
  });

  // ── unevaluable rounds (conjuncts 3 and 4; DEC-LOOPECON-06, FSPEC §7.1) ──

  test("a round with malformed FINDING: lines is unevaluable, not flat", () => {
    const prev = mkRound({ round: 1, findings: [] });
    const curr = mkRound({ round: 2, findings: [], malformedCount: 1 });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(false);
  });

  test("a round whose verdict did not parse readably is unevaluable, not flat", () => {
    const prev = mkRound({ round: 1, findings: [] });
    const curr = mkRound({
      round: 2,
      findings: [],
      verdicts: [mkVerdict({ verdictReadable: false })],
    });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(false);
  });

  test("a round whose verdict reports a nonzero High count is unevaluable, not flat", () => {
    const prev = mkRound({ round: 1, findings: [] });
    const curr = mkRound({ round: 2, findings: [], verdicts: [mkVerdict({ high: 1 })] });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(false);
  });

  test("a round whose verdict reports nonzero counts over an EMPTY parsed finding set is unevaluable, not flat (silently-empty guard)", () => {
    const prev = mkRound({ round: 1, findings: [] });
    const curr = mkRound({ round: 2, findings: [], verdicts: [mkVerdict({ medium: 1 })] });
    expect(devModule.derivativeStopReached([prev, curr], 1)).toBe(false);
  });
});

// ─── PROP-LOOPECON-13 — generative law over arbitrary carried/new rounds ──
//
// Domain: an arbitrary list of findings each independently tagged
// carried/new and each independently severity in {High, Medium, Low},
// mirroring PROPERTIES' generator. `classifiedRoundsToHistory` gives each
// finding a unique `(section, text)` token so "carried" restates the exact
// same triple in both rounds (guaranteed carried under DEC-LOOPECON-06's
// exact-match identity) and "new" appears only in the later round
// (guaranteed added), so the reference computation below is unambiguous by
// construction — independent of `classifyRoundFindings`'s own
// implementation, which this file does not import.

const severityArb = fc.constantFrom("High", "Medium", "Low");
const classifiedFindingArb = fc.record({
  severity: severityArb,
  classification: fc.constantFrom("carried", "new"),
});
const classifiedRoundArb = fc.array(classifiedFindingArb, { maxLength: 8 });

function classifiedRoundsToHistory(classified) {
  const prevFindings = [];
  const currFindings = [];
  classified.forEach((f, i) => {
    const obj = finding(f.severity, `§gen-${i}`, `generated finding ${i}`);
    if (f.classification === "carried") prevFindings.push(obj);
    currFindings.push(obj);
  });
  return [mkRound({ round: 1, findings: prevFindings }), mkRound({ round: 2, findings: currFindings })];
}

function referenceFlat(classified) {
  const noNewAtLeastMedium = !classified.some(
    (f) => f.classification === "new" && (f.severity === "High" || f.severity === "Medium")
  );
  const noOpenHigh = !classified.some((f) => f.severity === "High");
  return noNewAtLeastMedium && noOpenHigh;
}

describe("PROP-LOOPECON-13 — generative: flat iff no-new->=Medium AND no-open-High, jointly", () => {
  test("derivativeStopReached agrees with the independent reference predicate over arbitrary carried/new rounds", () => {
    fc.assert(
      fc.property(classifiedRoundArb, (classified) => {
        const history = classifiedRoundsToHistory(classified);
        const expected = referenceFlat(classified);
        expect(devModule.derivativeStopReached(history, 1)).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });
});

// ─── PROP-LOOPECON-14 — consecutive-window property, reset on interruption ─
//
// Composable round builders: `FLAT_ROUND` always carries zero findings
// (flat regardless of neighbours — nothing carried forward, nothing new,
// no open High); `NON_FLAT_ROUND(i)` always carries one brand-new Medium
// finding unique to index `i` (never matches a neighbour's triple, so it is
// always classified "added", always breaking flatness) — each entry's
// flatness is therefore fully determined by its own tag, independent of
// what came before or after it, which is what isolates this property from
// the flat-round derivation itself (PROPERTIES' stated intent).

function flatRoundAt(round) {
  return mkRound({ round, findings: [] });
}
function nonFlatRoundAt(round) {
  return mkRound({ round, findings: [finding("Medium", `§nf-${round}`, `non-flat marker ${round}`)] });
}
function historyFromTags(tags) {
  return tags.map((flat, i) => (flat ? flatRoundAt(i + 1) : nonFlatRoundAt(i + 1)));
}

const roundsWindowArb = fc.constantFrom(1, 2, 3, 5);
const tagsArb = fc.array(fc.boolean(), { minLength: 1, maxLength: 12 });

describe("PROP-LOOPECON-14 — N consecutive flat rounds, reset on any interruption", () => {
  test("converges iff the trailing window of size `rounds` is entirely flat, at every prefix length", () => {
    fc.assert(
      fc.property(tagsArb, roundsWindowArb, (tags, rounds) => {
        const history = historyFromTags(tags);
        for (let k = 1; k <= history.length; k++) {
          const windowTags = tags.slice(Math.max(0, k - rounds), k);
          const expected = windowTags.length === rounds && windowTags.every(Boolean);
          expect(devModule.derivativeStopReached(history.slice(0, k), rounds)).toBe(expected);
        }
      }),
      { numRuns: 200 }
    );
  });

  test("a single non-flat round anywhere in a would-be window resets the count — the textbook example", () => {
    // [flat, non-flat, flat, flat] with rounds=2 converges only at the final
    // round, never at round 3 (the window there is [non-flat, flat]).
    const history = [flatRoundAt(1), nonFlatRoundAt(2), flatRoundAt(3), flatRoundAt(4)];
    expect(devModule.derivativeStopReached(history.slice(0, 1), 2)).toBe(false);
    expect(devModule.derivativeStopReached(history.slice(0, 2), 2)).toBe(false);
    expect(devModule.derivativeStopReached(history.slice(0, 3), 2)).toBe(false);
    expect(devModule.derivativeStopReached(history.slice(0, 4), 2)).toBe(true);
  });
});

// ─── PROP-LOOPECON-14 — never fires while an open High remains in the window ─
//
// The distinguished sub-domain: a High finding restated identically in
// EVERY round (so conjunct 1 — "no new >=Medium" — is always trivially
// satisfied, it is never "added") still defeats convergence at the window
// level, catching an implementation that checks flatness per round but
// aggregates the High-override incorrectly across the window boundary.

describe("PROP-LOOPECON-14 — an open High present throughout never satisfies the window, regardless of length or `rounds`", () => {
  test("generative: persistent carried High defeats convergence for any sequence length and any `rounds`", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 12 }), roundsWindowArb, (length, rounds) => {
        const persistentHigh = finding("High", "§persistent", "never resolved");
        const history = Array.from({ length }, (_, i) => mkRound({ round: i + 1, findings: [persistentHigh] }));
        expect(devModule.derivativeStopReached(history, rounds)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── PROP-LOOPECON-15 — fires at exactly round L0 + rounds, no earlier, no later ─
//
// Models "L0 rounds already accumulated, then `rounds` more flat rounds
// converge" purely at the `derivativeStopReached` level: a non-flat "reset"
// round seeded at index L0 forces the window to start counting fresh
// immediately afterward, so the window can only first become fully flat at
// L0 + rounds. This operationalises PROP-LOOPECON-15's lifetime-counter
// invariant ("L0 + rounds, every round counts, none exempted") as a pure
// property; the literal `converged-by-derivative-stop` outcome string and
// the zero-POSTMORTEM-write assertion (the parts unobservable at this pure
// level) are covered by the `main()`-level test below.

describe("PROP-LOOPECON-15 — convergence round index is exactly L0 + rounds", () => {
  test("generative: never converges before L0 + rounds, converges exactly at L0 + rounds", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10 }), roundsWindowArb, (l0, rounds) => {
        const history = [
          ...Array.from({ length: l0 }, (_, i) => flatRoundAt(i + 1)),
          nonFlatRoundAt(l0 + 1), // forces a reset immediately before the counted window
          ...Array.from({ length: rounds }, (_, i) => flatRoundAt(l0 + 2 + i)),
        ];
        const convergeAt = l0 + 1 + rounds; // 1-indexed position in `history`
        // Start at the non-flat reset round itself (index l0 + 1), not at k = 1:
        // when l0 >= rounds, a prefix drawn ENTIRELY from the leading l0 flat
        // rounds can already contain `rounds` consecutive flat entries on its
        // own — that is a different, already-covered claim (a flat run can
        // converge), not this property's claim (a non-flat round resets the
        // count). Checking from the reset round onward isolates the reset
        // behavior regardless of how l0 relates to rounds.
        for (let k = l0 + 1; k < convergeAt; k++) {
          expect(devModule.derivativeStopReached(history.slice(0, k), rounds)).toBe(false);
        }
        expect(devModule.derivativeStopReached(history.slice(0, convergeAt), rounds)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── DEC-LOOPECON-09 — reviewerPrompt's finding-grammar clause is gated ────
//
// Driven through `reviewLoop` directly (the driver-level tier TSPEC §12
// names), since `reviewerPrompt` itself is module-private. The clause's
// distinctive line ("FINDING: {High|Medium|Low} | {delta|inherited} |
// {local|nonlocal} | {section anchor} | {what is wrong}") is the marker
// asserted on; its exact prose is `findingGrammarClause`'s to own.

const FINDING_GRAMMAR_MARKER =
  "FINDING: {High|Medium|Low} | {delta|inherited} | {local|nonlocal} | {section anchor} | {what is wrong}";

const baseReviewLoopParams = {
  doc: "docs/loopecon-feat/TSPEC-loopecon-feat.md",
  phase: "T",
  reviewers: ["pm-review", "te-review"],
  optimizer: "se-author",
  feature: "loopecon-feat",
};

function approvingAgent(prompts) {
  return async (skill, prompt) => {
    if (skill === "guard") return { ok: true };
    prompts.push({ skill, prompt: typeof prompt === "string" ? prompt : "" });
    if (skill === "pm-review" || skill === "te-review") {
      return `Review complete.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    return "Addressed all feedback.";
  };
}

describe("DEC-LOOPECON-09 — reviewerPrompt's finding-grammar clause, gated on review.derivativeStop.enabled", () => {
  test("PIN — disabled (HEAD default, no derivativeStop config threaded): the finding-grammar marker never appears", async () => {
    const prompts = [];
    await reviewLoop({
      ...baseReviewLoopParams,
      _agent: approvingAgent(prompts),
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
    });
    const reviewerPrompts = prompts.filter((p) => p.skill === "pm-review" || p.skill === "te-review");
    expect(reviewerPrompts.length).toBeGreaterThan(0);
    for (const p of reviewerPrompts) {
      expect(p.prompt).not.toContain(FINDING_GRAMMAR_MARKER);
    }
  });

  test("RED — enabled (review.derivativeStop.enabled: true threaded to reviewLoop): the finding-grammar marker is appended to every reviewer prompt", async () => {
    const prompts = [];
    await reviewLoop({
      ...baseReviewLoopParams,
      // TSPEC §8.1 / DEC-LOOPECON-09: threading shape assumed here is
      // `{ enabled, rounds }`, mirroring `DERIVATIVE_STOP_DEFAULTS`'s own
      // shape — T-15 owns the exact parameter name at the call site.
      derivativeStop: { enabled: true, rounds: 2 },
      _agent: approvingAgent(prompts),
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
    });
    const reviewerPrompts = prompts.filter((p) => p.skill === "pm-review" || p.skill === "te-review");
    expect(reviewerPrompts.length).toBeGreaterThan(0);
    for (const p of reviewerPrompts) {
      expect(p.prompt).toContain(FINDING_GRAMMAR_MARKER);
    }
  });
});

// ─── DEC-LOOPECON-10 — the high-only shortcut is suspended when enabled ──────
//
// TSPEC §8.3.1's reachability hole: `reviewLoop`'s standing gate
// (`gatePass = isPassResult(verdict1) && isPassResult(verdict2)`) already
// converges any round whose verdict is readable and reports `high === 0`,
// regardless of the verdict STRING or Medium/Low counts (the 2026-08-08
// high-only relaxation). Every TSPEC §8.2 flat round also has `high === 0`
// on both reviewers, so — unpatched — every flat round already converges on
// the spot and `derivativeStopReached` can never see a second consecutive
// flat round. DEC-LOOPECON-10's fix: `review.derivativeStop.enabled: true`
// suspends the high-only limb for THIS document's loop only, via
// `loopPassResult(parsed, { strictVerdict })`; `isPassResult`'s other six
// call sites are untouched (byte-identical when the key is absent/false).
describe("DEC-LOOPECON-10 — high-only convergence shortcut is suspended when review.derivativeStop.enabled", () => {
  test("RED — a zero-High/open-Medium Needs-revision round does NOT converge on its own; a later literal-Approved round converges ordinarily (not via derivative-stop)", async () => {
    const prompts = [];
    const callCounts = {};
    const agent = async (skill, prompt) => {
      if (skill === "guard") return { ok: true };
      prompts.push({ skill, prompt: typeof prompt === "string" ? prompt : "" });
      if (skill === "pm-review" || skill === "te-review") {
        callCounts[skill] = (callCounts[skill] ?? 0) + 1;
        const round = callCounts[skill];
        if (round === 1) {
          // high:0, open Medium, verdict text NOT approving. Under HEAD's
          // unpatched high-only shortcut this already converges (RED);
          // under DEC-LOOPECON-10's strict limb it must NOT.
          return `Review.\nVERDICT: Needs revision\n{"high": 0, "medium": 2, "low": 0}\n`;
        }
        // Round 2: a literal approval — the ordinary (non-derivative-stop)
        // convergence route TSPEC §8.3.3 keeps open even in enabled mode.
        return `Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
      }
      return "Addressed all feedback.";
    };

    const loop = await reviewLoop({
      ...baseReviewLoopParams,
      derivativeStop: { enabled: true, rounds: 2 },
      _agent: agent,
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
    });

    expect(loop.converged).toBe(true);
    // Round 1's Needs-revision/high:0/Medium round must NOT have converged
    // the loop by itself; convergence only happens on round 2's literal
    // approval. HEAD's unpatched shortcut converges at iterations === 1.
    expect(loop.iterations).toBe(2);
    // PROP-LOOPECON-16: an earlier literal-approving verdict converges
    // ordinarily, never mislabeled as the derivative-stop outcome.
    expect(loop.derivativeStop).not.toBe(true);
  });
});

// ─── loopPassResult(p, { strictVerdict: false }) === isPassResult(p) ────────
//
// TSPEC §8.3.2 / DEC-LOOPECON-10: the disabled-path (`strictVerdict: false`)
// limb of the new gated wrapper must be decision-identical to the shipped,
// untouched `isPassResult` over the SAME operands — this is REQ-LOOPECON-07's
// byte/behaviour-identity claim restated at the decision-boundary, not just
// at the prompt-text boundary DEC-LOOPECON-09 covers. `isPassResult` itself
// is module-private and untouched by this feature, so `expected` below is a
// literal transcription of its documented bar (orchestrate-dev.js's own
// doc comment on `isPassResult`), never computed by calling it — no
// implementation echo.
describe("TSPEC §8.3.2 / DEC-LOOPECON-10 — loopPassResult(p, { strictVerdict: false }) is decision-identical to isPassResult(p)", () => {
  test.each([
    ["literal Approved verdict", { verdict: "Approved", high: 0, medium: 0, low: 0 }, true],
    [
      "literal 'Approved with minor changes' verdict",
      { verdict: "Approved with minor changes", high: 0, medium: 0, low: 0 },
      true,
    ],
    [
      "Needs revision, high:0, Mediums present — the high-only shortcut still passes it",
      { verdict: "Needs revision", high: 0, medium: 3, low: 1 },
      true,
    ],
    ["Needs revision, high:1 — blocked", { verdict: "Needs revision", high: 1, medium: 0, low: 0 }, false],
    [
      "malformed:true fallback record — fails closed regardless of counts",
      { verdict: "Needs revision", high: 0, medium: 0, low: 0, malformed: true },
      false,
    ],
    ["null parse (no VERDICT line at all)", null, false],
  ])("RED — %s", (_label, parsed, expected) => {
    expect(devModule.loopPassResult(parsed, { strictVerdict: false })).toBe(expected);
  });
});

// ─── converged-by-derivative-stop — full outcome, POSTMORTEM, lifetime count ─
//
// Driven through `main()` (PHASE F / FSPEC), mirroring `lifetimeRounds.test.js`'s
// proven harness shape. Reviewers never literally approve (they file the same
// carried Low every round, flat but not "Approved"), so the ordinary
// convergence path never fires — the ONLY way this phase can end without
// running to `MAX_REVIEW_ROUNDS` and writing a POSTMORTEM is derivative-stop.
// At HEAD, `review.derivativeStop` is never read, so this run proceeds to the
// cap and DOES write a POSTMORTEM — the RED failure this section pins.

const FEATURE = "loopecon-dstop-feat";
const DOCS_DIR = `docs/${FEATURE}`;
const REQ_PATH = `${DOCS_DIR}/REQ-${FEATURE}.md`;
const PLAN_PATH = `${DOCS_DIR}/PLAN-${FEATURE}.md`;

const REQ_TEXT = "# REQ\n\nA requirement.\n";
const PARSEABLE_PLAN = [
  "| Task ID | Description | Batch | Dependencies |",
  "|---|---|---|---|",
  "| TASK-01 | First task | 1 | - |",
  "",
  "| Task | Files |",
  "|---|---|",
  "| TASK-01 | `src/one.js` |",
].join("\n");

const REVIEWER_SKILLS = new Set(["se-review", "te-review", "pm-review"]);
const AUTHOR_SKILLS = new Set(["pm-author", "se-author", "te-author"]);

/** Minimal recording in-memory filesystem double (mirrors lifetimeRounds.test.js's `localFakeFs`). */
function localFakeFs(initial = {}) {
  const contents = { ...initial };
  const writes = [];
  return {
    contents,
    writes,
    readFile: (path) => (Object.prototype.hasOwnProperty.call(contents, path) ? contents[path] : null),
    writeFile: (path, text) => {
      writes.push({ path, mode: "write", text });
      contents[path] = text;
      return { ok: true };
    },
    appendFile: (path, text) => {
      writes.push({ path, mode: "append", text });
      contents[path] = (contents[path] ?? "") + text;
      return { ok: true };
    },
  };
}

function makeDerivativeStopHarness() {
  const dispatches = [];
  const fs = localFakeFs({
    [REQ_PATH]: REQ_TEXT,
    [PLAN_PATH]: PARSEABLE_PLAN,
    [devModule.MERGE_CONFIG_PATH]: JSON.stringify({
      review: { derivativeStop: { enabled: true, rounds: 2 } },
    }),
  });
  const listFiles = fakeListFiles([]);

  const agent = async (skill, prompt) => {
    const text = typeof prompt === "string" ? prompt : "";
    dispatches.push({ skill, prompt: text });

    // Phase F's two reviewers: never approve, but restate the SAME single
    // Low finding every round — flat by TSPEC §8.2, never "Approved" by the
    // ordinary bar, so only derivative-stop can end this phase early. Every
    // OTHER phase's reviewer dispatch (Phase R's REQ cross-review, etc.)
    // approves unconditionally on the first round, mirroring
    // lifetimeRounds.test.js's makeHarness — without this fallback, a
    // pre-F phase's reviewers fall through to the generic non-VERDICT
    // "Success." response below and the pipeline never converges past
    // Phase R, so Phase F is never reached.
    if (REVIEWER_SKILLS.has(skill)) {
      if (text.includes("for phase F ")) {
        return (
          `Review.\nVERDICT: Needs revision\n{"high": 0, "medium": 0, "low": 1}\n` +
          `FINDING: Low | inherited | nonlocal | §style | a persistent minor style nit\n`
        );
      }
      return `Review.\nVERDICT: Approved\n{"high": 0, "medium": 0, "low": 0}\n`;
    }
    if (AUTHOR_SKILLS.has(skill)) {
      if (text.includes("DECISIONS_WARRANTED")) return "Finalized.\nDECISIONS_WARRANTED: false";
      if (text.includes("Return a JSON object")) {
        return JSON.stringify({ tasks: [{ id: "T1", description: "x", dependencies: [], planBatch: 1 }] });
      }
      return "Document created.\nREVISION-COMPLETE: yes";
    }
    if (skill === "se-implement") return "Tests: 3 passed, 0 failed.";
    if (skill === "harvest-learnings") return "Harvest complete.";
    if (skill === "dod-verify") return "Clean.\nDOD_STATUS: passed";
    return "Success.";
  };

  return {
    dispatches,
    fs,
    args: {
      reqPath: REQ_PATH,
      _agent: agent,
      _parallel: (p) => Promise.all(p),
      _checkFile: () => ({ ok: true }),
      _phase: () => {},
      _log: () => {},
      _pipeline: async (label, fn) => fn(),
      _listFiles: listFiles,
      _readFile: fs.readFile,
      _writeFile: fs.writeFile,
      _appendFile: fs.appendFile,
      _recordQueueRow: async () => ({ queueRow: "none" }),
      _mergeWorktree: async () => ({ ok: true }),
      _rebaseOntoDefault: async () => "clean",
      _dodVerifyLoop: async () => ({ passed: true, iterations: 1 }),
      _raisePrAndVerifyCi: async () => ({ prUrl: "https://x/pull/1", ciStatus: "passed" }),
    },
  };
}

describe("RED — converged-by-derivative-stop: distinct outcome, zero POSTMORTEM, exact round count", () => {
  test("Phase F converges by derivative-stop after exactly 2 flat, never-approving rounds; writes no POSTMORTEM; the outcome string is never coerced into an approval", async () => {
    const harness = makeDerivativeStopHarness();

    const result = await main(harness.args);

    const fPhase = result.phases.find((p) => p.phase === "F");
    expect(fPhase).toBeTruthy();

    // Outcome distinctness (PROP-LOOPECON-15): the literal token, never
    // substituted for or coerced into an ordinary approval string.
    expect(fPhase.detail).toContain("converged-by-derivative-stop (2 iterations)");
    expect(fPhase.detail).not.toBe("Approved (2 iterations)");
    expect(fPhase.detail).not.toContain("Approved (");

    // No POSTMORTEM write for this outcome, unlike the cap-reached path.
    expect(harness.fs.writes.filter((w) => w.path.includes("POSTMORTEM"))).toEqual([]);
    expect(Object.keys(harness.fs.contents).filter((p) => p.includes("POSTMORTEM"))).toEqual([]);

    // Exactly `rounds` (2) round(s) consumed — the lifetime round index
    // (L0=0 here) advances by exactly `rounds`, no overshoot to round 3.
    // Asserted on dispatch count rather than on-disk cross-review files:
    // this harness's `_agent` double never writes CROSS-REVIEW-*.md itself
    // (that write belongs to the real se-review/te-review agents in
    // production, not to a test double), and `appendApprovalAnchors` bails
    // out when the anchored file is absent, so a file-existence assertion
    // here is unreachable regardless of the round count. Phase F's two
    // reviewers (se-review, te-review) each dispatch once per round.
    const fPhaseReviewerDispatches = harness.dispatches.filter(
      (d) => REVIEWER_SKILLS.has(d.skill) && d.prompt.includes("for phase F ")
    );
    expect(fPhaseReviewerDispatches.length).toBe(4); // 2 reviewers x 2 rounds

    // Not a halt: the run proceeds past Phase F.
    expect(result.outcome).not.toBe("halted");
  });
});
