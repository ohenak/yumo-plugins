# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.4, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** Delta re-review. Round-1 findings F-01…F-09, then the changed sections only.
Reviewed `feat-pdlc-advisory-wave-gate` at `99d3eb50`, rebased onto `origin/main` `1efb9a3b`;
diffed against the round-1 base `2ca2335a`.

## Round-1 Disposition

| v1 finding | Sev | Disposition | Evidence checked |
|---|---|---|---|
| F-01 stale parallel v1.0 on branch | High | **Resolved** | Branch is rebased onto `origin/main` `1efb9a3b`; `2ca2335a` is an ancestor of HEAD and the document is main's v1.3 carried to v1.4 |
| F-02 E-6 repair has no commit step that owns it | High | **Resolved** | New AC-4.6 states the outcome (a resolved wave never leaves the repair uncommitted) and routes the mechanism to O-8. Matches the shipped per-task scope I re-measured at `orchestrate-dev.js:14395-14412` — `paths = task.files`, so a later task's paths are genuinely outside it |
| F-03 re-gate under-specified against shipped build-then-gate order | High | **Resolved** | AC-4.4 now requires the whole gate sequence in the shipped order. The order and its rationale are at `orchestrate-dev.js:14340-14370` (post-wave first at `:14347-14358`, test gate at `:14360-14369`) |
| F-04 refusal-reason set has no member for a diagnosis-only outcome | High | **Resolved** | AC-3.4 makes a diagnosis-only outcome an escalation *without* a refusal rather than a ninth reason. The shipped escalation entry already renders that field as absent: `` `| Refusal reason | ${advisoryEntrySingleLine(reason ?? "n/a")} |` `` (`orchestrate-dev.js:3065`) |
| F-05 BL-06 too narrow / AC-1.4 contradiction | High | **Resolved** | BL-06 now covers the envelope defaults and the config key set, and AC-1.4 scopes inertness to run behaviour rather than the shipped default tables. `ENVELOPE_DEFAULTS` and `ADVISORY_DEFAULTS` are both id/key sets (`orchestrate-dev.js:2320-2330`), so the widened enumeration is the right one |
| F-06 BL-05 resolution form not repository state | Medium | **Resolved** | BL-05 now cites `docs/completed/pdlc-consolidation-agent/`, which exists on `origin/main` (`git ls-tree origin/main docs/completed/`) |
| F-07 deferral bound to the wrong successor | Medium | **Resolved** | D-AWG-03 splits; D-AWG-03b (re-entry at the failed wave) binds `pdlc-wave-resume` (queue row 20) |
| F-08 AC-3.1 spans two envelope schemas | Medium | **Partly** — see F-11 | AC-3.1 now claims the tier's shape; the tier's own table carries a fourth column |
| F-09 budget scope ambiguous | Low | **Resolved** | AC-2.4 pins `seamBudgetMinutes` per invocation and makes only *resolutions* consume the wave budget, naming both oracles |

Q-01…Q-04 of round 1 are answered by AC-5.1's whole-tree form, AC-4.6, AC-1.5 and the Q-4 row of §8
respectively. The §8 relocation is genuinely verbatim: `diff` of the removed block against
`docs/_decisions/DECISIONS-advisory-wave-gate-questions.md` is one trailing blank line.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-10 | High | Local | **AC-4.4 makes the re-gate run a build, and then hands its side effects to a revert contract written in two incompatible units.** AC-4.4's own words are *"a red re-gate reverts **the repair** whole (AC-5.1)"* — per-path, over the paths A6 changed. AC-5.1's words are *"the **working tree** is observably identical to its state immediately before A6 acted"* — whole-tree. Before this round the two were the same set, because A6 only edited sources. They are no longer: AC-4.4 now requires the configured post-wave command to run again, and in this repo that command is `node pdlc/workflows/build-runtime.mjs`, which rewrites `pdlc/workflows/dist/` — paths A6 never proposed and that no envelope rule ranges over. An implementer taking AC-4.4's per-path reading leaves the operator a halted tree carrying A6-generated artifacts built from a repair that was reverted; one taking AC-5.1's whole-tree reading must restore paths outside the repair. Two oracles a test can disagree about, of exactly the kind AC-2.4 was fixed this round to remove. State the observable: after a red re-gate, does the restoration cover the artifacts the re-gate's post-wave command wrote, or not? | §6 AC-4.4, AC-5.1 |
| F-11 | Medium | Local | **AC-4.2's "sole writer" contradicts the fact it cites, and the contradiction became load-bearing this round.** AC-4.2 says *"the pipeline's existing pathspec-scoped **per-task** commit path remains the **sole** writer of wave commits (M-WG-4)"*. M-WG-4 itself says otherwise — *"Per-task commits are pathspec-scoped to the task's owned paths … **and the build-output commit is scoped to the configured post-wave pathspecs**"* (`pdlc-wave-gate-baseline.md:35`) — and the code has two `commitPaths` call sites per wave: per-task at `orchestrate-dev.js:14405` and build outputs at `:14417`, the latter gated on `postWaveRan && implConfig.postWavePathspecs.length > 0`. This was harmless while A6 touched neither; now AC-4.4 re-runs the post-wave command and AC-4.6 requires an E-6 repair to reach committed state, so which writer covers which paths is a question the REQ's own text answers wrongly. Either name both writers in AC-4.2 or scope "sole writer" to the per-task paths it means. | §6 AC-4.2, AC-4.6 |
| F-12 | Medium | Cross-Feature | **§9's reassurance about baseline drift is false for exactly the facts this round's new text rests on.** The BL-06 note says line references *"measured at `c8aa22a4` … have since drifted; the **symbol-based recipes** still resolve"*. M-WG-2, M-WG-3 and M-WG-4 have no symbol-based recipe — their verification recipes are bare line ranges (`sed -n '10301,10319p'`, `'10249,10259p;10321,10332p'`, `'10334,10364p'` — `pdlc-wave-gate-baseline.md:33-35`), and at HEAD `10301` lands in DoD finding-table parsing, nowhere near the wave gate. The facts are true — I re-measured them at `orchestrate-dev.js:14340-14430` — but AC-4.4's entire new normative content is grounded on M-WG-2/M-WG-3 and AC-4.6 on M-WG-12, so a gate-time reader following BL-01 cannot reproduce them and the note tells them they can. Fix in the baseline (symbol- or grep-anchored recipes) and narrow the REQ's claim to what is true. | §9 BL-06 note, BL-01; AC-4.4, AC-4.6 |
| F-13 | Low | Local | **AC-3.1's "tier's own envelope shape" is a three-field shape; the tier's is four.** AC-3.1 says E-5/E-6 are stated *"in the tier's own envelope shape — an id, a permitted action, and the rule deciding membership"*. The tier's table is `# | Permitted | Decidable rule | **Seam**` (`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`, AC-3.3), and E-1…E-4 each name their seam. Nothing breaks — the shipped set-equality is over ids only (`ENVELOPE_DEFAULTS = ["E-1","E-2","E-3","E-4"]`, `orchestrate-dev.js:2320`) — but the sentence claims a fidelity the table does not have. Add the `Seam` column (`A6` twice) or drop the shape claim. | §6 AC-3.1 |
| F-14 | Low | Local | **AC-1.5's notice has no stated form when both BL-03 and BL-04 are absent.** AC-1.5 requires *"exactly one inapplicability notice per run — not per wave — … naming which of BL-03 or BL-04 was absent"*. The shipped BL-04 notice does fire once per run and outside the wave loop (`orchestrate-dev.js:14143-14153`, loop opens at `:14311`), so the cardinality is reachable; but a run with no ownership manifest **and** no test command satisfies both antecedents, and "exactly one notice naming which" has no reading there. Say that BL-03 is named when both hold, or that the notice names the set. | §6 AC-1.5 |

## Questions

| ID | Question |
|----|---------|
| Q-05 | AC-4.4 says a post-wave failure on the re-gate *"is a red re-gate, handled as one, not the immediate halt it would be on the wave's first pass."* On the first pass that failure throws before the gate is ever reached (`orchestrate-dev.js:14350-14356`), so a post-wave failure at re-gate time is necessarily A6's own doing — which reads right. What is the halt the run ends on after the revert: AC-5.2's *"same halt … same reason it emits today (M-WG-3)"* is the **test-gate** halt, and the tree at that point is back to a state where the post-wave command passed. Worth one clause confirming that, since it is the only place the two halt texts could diverge. |
| Q-06 | AC-3.2's consequence — a wave owning `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/` or `.claude/workflows/` escalates `out-of-envelope` — is correct at HEAD and correctly scoped to the *shipped* defaults: the advisory gate builds its guard set with `effectiveGuardPaths(undefined)` (`orchestrate-dev.js:3500`), so an operator's own `merge.guardPaths` additions do **not** reach A6. Is that asymmetry intended (A6 guarded by the shipped four, Phase MERGE by the shipped four plus configured extras), or is it a fact the REQ should name so TSPEC does not quietly change it? |
| Q-07 | AC-6.4 counts resolutions so that a Phase P problem is a choice rather than a side-effect (R-4). With AC-3.2 as written, in this repo almost every wave of this very feature owns `pdlc/workflows/` and therefore escalates without a repair. Does AC-6.4's countability distinguish "escalated, guard-path" from "escalated, no repair possible"? Otherwise the metric reads as a healthy pipeline in exactly the repo where A6 is structurally inert. |

## Positive Observations

- Every round-1 High is answered at REQ altitude, in observable-outcome form, with the mechanism
  pushed to TSPEC (O-8 for the E-6 commit, O-1 for the restoration) rather than smuggled into an AC.
  AC-4.6 in particular states a fate rather than a design.
- AC-2.4's rewrite is the strongest edit of the round. *"Only resolutions consume the wave budget"*
  plus the two worked cases (two escalations leave the budget untouched; one resolution exhausts the
  shipped default of `1`) turns a knob into a testable contract.
- The §1 correction is the right instinct exercised against the document's own argument: the ledger
  file does exist here, untracked, recording `{"feature":"pdlc-consolidation-agent","planHash":
  "7d394135","lastGreenWave":12}` — a completed feature, no resume — so the stronger "no record has
  ever survived" claim was withdrawn while the economics argument it supported was left standing on
  the preconditions. Withdrawing a convenient claim on re-measurement is not common.
- The §8 relocation is verbatim, not paraphrased, and the decision table that replaced it is
  one row per question with the decision in it. The document shrank while gaining content.
- AC-3.4's resolution of F-04 lands on the shipped surface rather than inventing one: the escalation
  entry already renders an absent refusal reason as `n/a` (`orchestrate-dev.js:3065`), so
  "an escalation without a refusal" needs no new machinery.
- The guard-path consequence in AC-3.2 is named rather than discovered, including the admission that
  the 2026-08-09 motivating incident would today be escalated, not repaired. Naming the case where
  your own feature does not fire is the honest version of this section.

## Recommendation

**Needs revision**

One High (F-10) blocks: AC-4.4's re-gate now runs a build, and the revert contract it points at is
written in a different unit than the paths that build touches. It is a one-clause fix — say whether
restoration covers the artifacts the re-gate's post-wave command wrote — and it stays inside REQ
altitude, since it is an observable of the halted tree, not a mechanism. F-11 and F-12 are
corrections to text that is now load-bearing (AC-4.2's "sole writer", §9's drift reassurance); F-13
and F-14 are recorded, not gating.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 2}
