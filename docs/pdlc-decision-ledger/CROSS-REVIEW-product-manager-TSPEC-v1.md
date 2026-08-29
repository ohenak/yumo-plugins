# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.1)
**Date:** 2026-08-28
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Method

Every production file and symbol the TSPEC cites was confirmed to exist, and every claim about
current behavior was checked against the cited code rather than the TSPEC's prose. Three checks went
beyond citation-matching:

1. **The recognition rule was executed.** `DECISION_HEADING_RE` (§3.2) and `DECISION_CORPUS_ARGV`
   (§3.1) were run over the tree at the Baseline's `Verified at` commit `8c673a09f`
   (`docs/_constraints/pdlc-decision-corpus-baseline.md:8`), with §3.3's last-wins resolution.
2. **The rendered index was measured** under §4.3's concrete line format against `maxBytes`.
3. **PROP-DIS-06 was re-run** as the test itself computes it, to check §2.3's claim about the
   destructured enablement read.

Results are cited inline below.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | Under the shipped defaults the rendered index exceeds `maxBytes` before a single feature line is added, so REQ-DECLEDGER-01's "one line per in-scope decision" does not hold on the default configuration — and §3.6 asserts the opposite as load-bearing rationale | REQ-DECLEDGER-01, REQ C-5, REQ-DECLEDGER-07 |
| F-02 | Medium | Local | §7.6's AT-01 coverage row does not state the bounds configuration the corpus oracle runs under; under default `maxBytes` its expected 45/48-line sets are unreachable | REQ-DECLEDGER-01, REQ-DECLEDGER-07 |
| F-03 | Medium | Local | D-2 narrows the injection surface to `reviewerPrompt` only, but REQ G-4 measures the intended effect over *all* committed `CROSS-REVIEW-*` artifacts, including confirmation-round ones that never see the rule text | REQ §2 G-4, REQ-DECLEDGER-03 |
| F-04 | Low | Local | §3.5's verification table gives the wrong *reason* for `pdlc-plugin-retirement`'s 0, in the one table whose job is to carry the evidence | REQ-DECLEDGER-01, O-1 |
| F-05 | Low | Local | Three internal accuracy slips: §1.2's heading count, §1.3's cross-reference, §5.3's block count | — |

### F-01 (High) — the shipped `maxBytes` default omits ~35–50% of the index on day one

§3.6 states, as the rationale for why the omission order is safe: *"under the shipped defaults the
bound is never reached and the order is inert. It becomes live only when an operator lowers the
bound or the corpus grows past it."* I executed §4.3's format over the recognised corpus at
`8c673a09f` and measured the block's own bytes, which §4.2/D-5 explicitly charge to the bound
(framing, preamble and rule text included):

| In-scope set | Lines | Rendered body bytes | vs `maxBytes` 8000 |
|---|---|---|---|
| Project-level alone (`M-1d`) | 41 | **9,371** | **over, before any feature line or framing** |
| AT-01 (a) `pdlc-advisory-wave-gate` | 45 | **10,441** | 30% over |
| AT-01 (b) `pdlc-engineering-loop` | 48 | **11,354** | 42% over |
| Largest, `pdlc-headless-engine` (`M-6b`'s 63-line floor) | 63 | **16,283** | 104% over |

The bound therefore binds on the very first enabled dispatch, and §3.6's drop loop fires
immediately. Three consequences, each traceable:

- **REQ-DECLEDGER-01 (P0) is not satisfied on the default configuration.** Its **Then** requires the
  prompt to carry one line per decision in G-1's in-scope set. On defaults it carries roughly 60% of
  them. REQ-DECLEDGER-07 permits omission, but as a *bound-exceeded* path, not as the ordinary
  day-one behavior of the shipped defaults.
- **REQ C-5's measured floor is defeated.** The REQ went to the trouble of measuring `maxEntries`
  against the Baseline (`M-6b` 63, `M-6c` a cap of 70 clearing it by 7) so the corpus would not drop
  a line on day one. That measurement never governs, because `maxBytes` binds first in every case
  above. The one threshold the REQ measured is inert; the one it flagged as an unmeasured analogy
  (R-5, A-1) is the one that decides the outcome.
- **§3.6's own safety argument is falsified.** Its claim that the omission order is "inert" under
  shipped defaults is the reason the order is not tested harder. The order is live on day one.

The `maxBytes` **value** is REQ C-5's and is routed upstream as an erratum — A-1 already makes it
operator-revisable without a REQ revision, and the measurement it was waiting for is now taken.
What is **this document's** to fix:

1. Restate §3.6's rationale to match the measurement, so the omission order is presented as live
   under shipped defaults rather than inert.
2. Reconsider §4.3's line format, which is this spec's own choice under Q-1. The format
   `{id} — {statement}  [{sourcePath} § {heading}]` renders the statement **twice**: `heading` is
   the full heading line, which already contains both the id and the statement. Citing
   `[{sourcePath} § {id}]` still names the record file and locates the record — which is all BR-3
   and AT-02 require — and roughly halves the block. That single change brings AT-01's two
   dispatches inside 8000 bytes without touching the REQ default.
3. Whichever route is taken, §9.3's T-2 should be closed with the measured number rather than
   deferred to PLAN. It is answerable now.

### F-02 (Medium) — AT-01's expected values are unreachable under the configuration §7.6 implies

§7.6 maps AT-01 to the corpus oracle with "whole-line equality; two dispatches,
`pdlc-advisory-wave-gate` (45 lines) and `pdlc-engineering-loop` (48)". FSPEC AT-01 pins those sets
as "both inside `maxEntries` 70", which reads as the default configuration. Per F-01 both sets are
outside default `maxBytes`, so as written the oracle asserts a set the renderer cannot produce.

This needs one sentence in §7.6 or §7.3: state that the corpus oracle runs with `maxBytes` set
non-binding (and say so explicitly, so a reader does not mistake it for a default-config test), or
re-derive the expected sets. Leaving it unstated hands the implementer a test that cannot pass and
invites the wrong fix — trimming the expected set to whatever the renderer emits, which is exactly
the implementation-echo AT-01's own "never captured from the renderer's output" clause forbids.

### F-03 (Medium) — the injection surface is narrower than G-4's measurement surface

§2.5 and D-2 attach the index and rule text to `reviewerPrompt` only. I verified the premise: the
delta-confirmation and finding-restatement prompts are separate builders
(`pdlc/workflows/orchestrate-dev.js:11712`, `:11746`, `:11850`, `:11934`), and one of them already
carries "do not re-review the whole document, and do not re-litigate settled decisions"
(`orchestrate-dev.js:11850`). D-2's rationale is sound as far as it goes, and I am not asking for
the index to be attached there.

The gap is in measurement, not mechanism. REQ G-4 measures the intended effect over **committed
`CROSS-REVIEW-*` artifacts on the branch**, and confirmation-round cross-reviews are committed under
those same names and do carry `FINDING:` lines — including `inherited` ones, which is precisely the
shape a re-opened closed decision takes. So G-4's denominator includes rounds whose prompts never
carried the rule text. The TSPEC should record that asymmetry where D-2 is stated, so the
retrospective trend is not later read as a clean measurement of the mechanism's effect. G-4 is
explicitly non-binding, which is why this is Medium and not High.

### F-04 (Low) — wrong reason recorded for the right number

§3.5's verification table reads `pdlc-plugin-retirement` | **0** | "(no matching directory entry)".
I confirmed the directory entry **does** match: `docs/completed/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md`
exists at `8c673a09f` and is enumerated by `DECISION_CORPUS_ARGV`. It contributes 0 because all of
its ids are `M-4b`'s namespace-less `DEC-01`…`DEC-10` form, which `DECISION_HEADING_RE`'s namespace
conjunct correctly rejects. The number is right; the stated reason is not, and in a table whose
entire purpose is to carry the evidence for the design's single named risk, the reason conjunct is
the load-bearing half. The Baseline column already cites `M-4b` correctly — only the middle column
needs the fix.

### F-05 (Low) — three internal accuracy slips

- §1.2's heading reads "The two shipped precedents this design reuses" over a table of **five** rows.
- §1.3 cites "§3.4" for the result of running the rule over the standing corpus; that table is §3.5.
- §5.3 justifies containment because the example config "is shared with four other blocks". It
  currently holds **eight** top-level blocks (`dispatch`, `advisory`, `implementation`,
  `learningsInjection`, `cascade`, `review`, `loop`, `merge`), so `decisionLedger` would be shared
  with eight. The containment argument is right; the count is not.

## Questions

## Positive Observations

## Recommendation

## Verdict
