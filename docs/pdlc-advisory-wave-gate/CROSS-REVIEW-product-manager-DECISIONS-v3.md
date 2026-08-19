# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md
**Upstream re-read:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.6, HEAD)
**Date:** 2026-08-20
**Iteration:** 3 (delta re-confirmation, own bytes unchanged)

## Scope

Single question: does DECISIONS still hold as a faithful compression of the TSPEC as it now stands?
DECISIONS' own bytes are unchanged since my v2 approval; the TSPEC moved from the v1.5 state I
approved against (`f2705bf4`, sha256:93385165…) to v1.6 at HEAD, an erratum round that re-grounded on
FSPEC v1.4 and then landed six raised items. I re-read my v2 cross-review, took `git diff f2705bf4
HEAD` on the TSPEC, and re-read the current text of every TSPEC passage the four decisions lean on
(§1.1's O-8 row, §3.6, §4.4, §4.5, §5.1, §5.2, §5.4, §5.6). I did not re-litigate anything settled in
rounds 1–2.

The four decisions themselves survive intact — no rejected option became reachable, no chosen
mechanism was contradicted, and the round in fact moved the TSPEC *toward* this document on every
point where they disagreed. What did not survive is a layer of status commentary: DEC-A6-02,
DEC-A6-03 and DEC-A6-04 each carry text describing an upstream gap that the erratum round closed, in
one case quoting an upstream sentence that no longer exists. Per DEC-ERR-03 these are findings of
this confirmation whether or not they were on the routed item list, and they are what the findings
below record.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **DEC-A6-02 quotes a TSPEC sentence that HEAD no longer contains, and reports a correction as still outstanding.** Lines 149–155 quote TSPEC §1.1's O-8 row as resolving the obligation via "the wave commit loop's existing `commitPaths` writer gains one more pathspec — the promotion's paths, scoped to the later task's owned set", call that "plainly option A", and close with "Correcting the row was raised as an erratum on TSPEC (PM F-03, TE F-07)". At HEAD the O-8 row reads "**One further `commitPaths` call** after the per-task loop, inside the same `if (waveGit)` block … Widening the existing per-task call is the rejected option A of `DECISIONS…`'s DEC-A6-02" — i.e. the erratum landed and the row now cites this document rather than contradicting it. The decision is unaffected; the supersession narrative and the verbatim quote are stale. Restate as resolved (TSPEC v1.6) and drop the quoted option-A text, or a later reader will hunt a conflict that no longer exists — and may "fix" the O-8 row back toward the quote | O-8 / FSPEC BR-8 |
| F-02 | Medium | Local | **DEC-A6-03's "stated but not falsifiable" gap is closed upstream and the entry still reports it open.** Lines 84–90 say option A's rejection is "stated but not falsifiable" because every fixture observing the ref runs a single A6 wave, and that the needed oracle — "one two-A6-wave run asserting set-equality over the observed `update-ref` targets (`{a6-snapshot-1, a6-snapshot-2}`)" — is "an oracle this document cannot mint, raised to TSPEC (TE F-05)". TSPEC v1.6 §5.2 now carries exactly that fixture (two waves, both gates red, `_git` double's `update-ref` targets set-equal to `{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}`, a fixed-name regression failing both conjuncts) and §4.5's row now names it. The rejection of option A is now falsifiable; the entry should say so and cite §5.2 | REQ C-2 (operator inspectability), PM F-03 lineage |
| F-03 | Medium | Local | **DEC-A6-04's consequence claims no test would catch the `0` → `enabled: false` collapse; upstream now has one.** Lines 299–306 state "**No AT in the current set falsifies the collapse of the two**" and conclude "Until it lands, a future 'simplification' collapsing `0` into `enabled: false` passes the suite." TSPEC v1.6 §5.2 adds the behaviour arm (tier enabled, `waveBudgetPerRun: 0`, red wave ⇒ disposition `escalated`, reason `budget-exhausted`, **zero** `_agent` calls, snapshot still taken, advisory summary key **present** with the sixth row at zero), and §5.4's matrix row now points at it. The narrow AT-level sentence may still be literally true, but the operative conclusion — the suite passes such a simplification — is false at HEAD, and it is the sentence an implementer acts on. Rewrite to record the arm as landed and keep the `0`-vs-disabled distinction as the reason it exists | E-33, REQ C-2 |
| F-04 | Medium | Local | **The upstream pin still reads TSPEC v1.5.** The header table (line 5) pins `TSPEC-pdlc-advisory-wave-gate.md` at v1.5; HEAD is v1.6. This document's whole job is to be re-read months later against a specific upstream state, so the pin is provenance, not cosmetics — and the three findings above are precisely what a stale pin hides. Bump to v1.6 in the same edit that lands F-01–F-03 | Traceability (Team Principle 3) |
| F-05 | Low | Local | **DEC-A6-04's parenthetical "mirrors the same claim in §7" no longer resolves.** Line 292 routes the reader to a §7 copy of the withdrawn `ci-arrangement` mirror claim. At HEAD `ci-arrangement` appears only in the changelog, §4.4 and §5.1's second-channel table; §7 carries no such claim. Drop the parenthetical or repoint it at §5.1's two-row table | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-A6-04's consequence and TSPEC §4.4/§5.1 now say the same thing about the engine channel — the example gains `advisory.waveBudgetPerRun`, and `pdlc/engine/__tests__/ci-arrangement.test.js` gains a **new** expectation over it. I verified both premises at HEAD (`.claude/pdlc.config.example.json` has no `advisory` section; the engine test has zero `advisory` occurrences). Since the assertion is TSPEC-owned with no FSPEC AT ranging over it, is the intent that the DECISIONS entry keeps carrying the product justification (the affordance is the operator's first encounter with a tier that ships off) while TSPEC §5.1 owns the coverage row? I read it that way and it is coherent; confirming so the next erratum does not delete one copy as redundant. |
| Q-02 | DEC-A6-01's re-evaluation triggers and DEC-A6-01's ignored-path paragraph both hang on OQ-7 staying open upstream. TSPEC v1.6's changelog confirms "OQ-7 stays open upstream and every upstream-pending flag … stands unchanged", so nothing here moved. No action requested — flagging only that OQ-7 remains the one live upstream dependency this document is exposed to. |

## Positive Observations

- **The erratum round moved the TSPEC toward this document, not away from it.** Every point where
  DECISIONS and TSPEC disagreed at v1.5 — the O-8 row's option-A phrasing, the withdrawn engine
  mirror claim, the unfalsifiable ref-naming rejection, the untested `0` affordance — resolved in
  the direction DECISIONS argued. That is the record doing its job: it named four gaps in upstream
  and upstream closed all four. The findings above are bookkeeping on a document that was right.
- **DEC-A6-04's consequence anticipated the engine-channel correction almost verbatim.** The
  "authoring a new expectation, not relocating an existing one" framing, including the two-section
  example and the zero-`advisory` engine test, is now TSPEC §4.4's own text. Writing the product
  reason down at decision time is what made the upstream correction cheap.
- **The decisions are unchanged in substance and I re-verified each against current upstream:**
  DEC-A6-01's snapshot mechanism against §2.5/§3.2 and §5.5's argv-sequence oracle; DEC-A6-02's
  separate `commitPaths` call against the corrected §1.1 O-8 row and §3.6; DEC-A6-03's wave-scoped
  ref against §4.5 and the new §5.2 two-wave fixture; DEC-A6-04's `nonNegativeInt` against §4.4's
  key table. No rejected option became reachable and no chosen mechanism lost its upstream basis.
- **The honesty about what is decided versus what is tested is what made this cascade cheap to
  audit.** Because the entries said plainly "stated but not falsifiable" and "no AT falsifies this",
  I could check three claims against upstream in minutes rather than reconstructing intent.

## Recommendation

**Approved with minor changes** — the approval stands against TSPEC v1.6.

No High findings. The four decisions remain a faithful compression of the upstream as it now stands:
none of them cites a mechanism upstream abandoned, none of them rests on a rejected option that the
erratum round made reachable, and every chosen mechanism is still the one TSPEC v1.6 specifies. The
staleness this cascade exposed is one-directional and conservative — three entries report upstream
gaps as open that upstream has since closed, and one quotes a superseded sentence. Nothing here
misstates a requirement, narrows an acceptance criterion, or would send an implementer down a wrong
path on mechanism; the worst case is a reader spending time on a resolved conflict, or trusting a
"nothing tests this" warning that is now over-cautious.

Five non-gating edits, all landable in one pass and all in the same direction (record the closures,
re-pin the upstream):

1. **F-01** — DEC-A6-02: drop the quoted option-A text from TSPEC §1.1, record the O-8 row as
   corrected in TSPEC v1.6, and note that the row now cites this decision.
2. **F-02** — DEC-A6-03: replace "stated but not falsifiable" with the landed oracle, citing §5.2's
   two-red-wave set-equality fixture.
3. **F-03** — DEC-A6-04: replace "no AT falsifies the collapse … passes the suite" with the landed
   §5.2 behaviour arm, keeping the present-and-zero versus absent-key distinction as its rationale.
4. **F-04** — header: bump the upstream pin to TSPEC v1.6.
5. **F-05** — DEC-A6-04: drop or repoint the "mirrors the same claim in §7" parenthetical.

FINDING: Medium | delta | nonlocal | DEC-A6-02 | Quotes TSPEC §1.1's pre-erratum O-8 text and reports the correction as outstanding; the row was corrected in TSPEC v1.6 and now cites DEC-A6-02.
FINDING: Medium | delta | nonlocal | DEC-A6-03 | "Stated but not falsifiable" is stale: TSPEC v1.6 §5.2 lands the two-A6-wave `update-ref` set-equality fixture the entry asked for.
FINDING: Medium | delta | nonlocal | DEC-A6-04 (Consequences) | "A simplification collapsing `0` into `enabled: false` passes the suite" is false at HEAD: TSPEC v1.6 §5.2 adds the enabled-tier `waveBudgetPerRun: 0` behaviour arm with the present-and-zero conjunct.
FINDING: Medium | delta | nonlocal | Header table | Upstream pin still reads TSPEC v1.5; HEAD is v1.6.
FINDING: Low | delta | nonlocal | DEC-A6-04 (Consequences) | "Mirrors the same claim in §7" no longer resolves; the withdrawn `ci-arrangement` claim now lives only in §4.4 and §5.1's second-channel table.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 1}
