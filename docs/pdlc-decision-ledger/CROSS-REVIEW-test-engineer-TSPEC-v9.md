# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.8)
**Date:** 2026-08-29
**Iteration:** 9 (delta confirmation on Phase P's five-item erratum)

## Overview

**Upstream: unmoved, and re-checked rather than assumed.** I recomputed both digests at HEAD:
REQ `sha256:ce6b133f…3c7b7c`, FSPEC `sha256:2bd5c3ef…5aed39`. Both are byte-identical to the
`UPSTREAM-STATE` anchors on my round-8 approval, so the compression question DEC-ERR-03 asks —
"does this document still say what upstream says?" — has the same answer it had at round 8 for
every section this delta did not touch, and for the sections it did touch I re-read the upstream
each new sentence leans on (FSPEC §6.1's failure table, REQ NG-4 / BR-11, REQ-DECLEDGER-02 / AT-04)
against the changed text. No citation in the delta attributes anything to upstream that upstream
no longer says.

**Scope of this round.** The delta is five TSPEC commits — `039555ea9`, `d462a9475`, `471d3a4b9`,
`396a7b0f3`, `cc2c09e53` — +153 / −13 against `277db8b27`, the commit I last reviewed. Every
insertion is inside §7 or the changelog; I confirmed by diff that no section outside §7 moved, so
§§1–6 and §§8–9 are not re-litigated here. I verified each landed claim against the shipped code it
cites rather than against the prose that asserts it: `pdlc/workflows/package.json`,
`pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`, `orchestrate-dev.js`'s
`buildFinalReport` / `learningsInjectionField` sites, and `.claude/pdlc.config.example.json`.

**The one-line answer.** All five routed items landed, four of them in the strongest available form.
But the fix to item 5 was applied to a single member of a set whose siblings fail the *same*
satisfiability test the fix itself articulates, so §7.3's census remains an oracle that cannot go
green on conforming code. That is a High I did not catch in earlier rounds — it is inherited, not
introduced here — and it is why this confirmation does not approve.

## Architecture

Nothing in §§2–6 changed, and the delta introduces no new component, seam or dependency edge. What
it changes is *which evidence the design claims for the components already specified* — three
additions, each of which alters the test-obligation graph rather than the module graph:

1. **A live composition-root arm** is added to §7.2's category table and given a rationale
   paragraph. This is a new test level for `main()`, previously owed only §7.3's source census.
2. **Two properties** (`P-REC`, `P-LINE`) are promoted into §7.5, which previously carried only
   O-8's bounds invariant. Both target pure functions §7.1 already exercises, so no new seam and no
   new double: the addition is genuinely free at the architecture layer.
3. **One census token is removed**, narrowing §7.3's forbidden set from seven members to six.

The first two strictly enlarge the evidence the design claims; the third strictly narrows it. That
asymmetry is worth naming, because it is where this round's residual risk sits — a narrowing
justified by an argument that was not swept across the rest of the set.

## Interfaces

The seams the delta now leans on, each checked against HEAD rather than against the citation:

| Seam / contract the delta cites | Claim in the delta | Verified at HEAD |
|---|---|---|
| `npm run test:coverage` | "four `&&`-joined clauses" | ✅ `pdlc/workflows/package.json:9` — `c8 npm test` / `c8 report --reporter=json` / `node scripts/check-wave-resume-delta-coverage.mjs` / `c8 report --check-coverage --per-file --branches 85`. The ordinals the delta assigns (**third** = delta gate, **fourth** = percentage floor) are correct |
| `check-wave-resume-delta-coverage.mjs` `SUBJECT` | hard-coded to `pdlc/workflows/orchestrate-dev.js` | ✅ `export const SUBJECT = "pdlc/workflows/orchestrate-dev.js"` |
| its `resolveBase()` | "prefers the live `merge-base HEAD origin/main`", pinned sha only as fallback | ✅ it loops `["origin/main", "main"]` taking `git merge-base HEAD <ref>`, falling back to `PINNED_BASE_SHA` only when neither ref resolves. So on this branch the ranges are *this* feature's own delta, exactly as claimed |
| its fail-closed set | fail-closed on subject-absent-from-checkout and absent-from-report; empty range set is a **pass** | ✅ both `fail(...)` sites exist; the empty-range branch returns 0 with a "no delta in range" log. The delta's warning — "nothing this feature adds may rest on the empty-range reading" — is the right operational gloss |
| dirty-tree behaviour | *warns*, does not fail | ✅ `git diff --quiet HEAD -- SUBJECT` → `error(...)` then continues |
| wave gate `implementation.testCommand` | plain `npm test`, does **not** include the script | ✅ `.claude/pdlc.config.example.json` → `(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- …`. So the delta's consequence — PLAN T-18 owes a per-wave manual run — is load-bearing, not belt-and-braces |
| c8 `include` list | names `**/pdlc/workflows/orchestrate-dev.js` as a single file | ✅ first entry of the `include` array |
| `main()`-driving precedent suites | `advisoryDisabled`, `advisoryWaveGateMain`, `anchorCascade`, `branchGuard`, "~20 further" | ✅ all four exist; 64 of the 156 suites reference a `main(` call, so "~20 further" is conservative |
| `learningsInjectionField` / `buildFinalReport` | field spread at "~six" call sites, all outside `main()`'s wiring sentinels | ✅ six `buildFinalReport(` call sites (`orchestrate-dev.js`:16725, 16742, 16767, 16791, 18294, 18326) and six `learningsInjection: learningsInjectionField` spreads. The routed item said *eight*; the TSPEC says *six* and the TSPEC is right — it did not copy the number it was handed |

Two things follow that I want to record as reviewed rather than assumed. First, the delta's central
factual claim — that the percentage clause is blind to this feature while the delta clause is not —
is *true and load-bearing*: the subject file measures 18,509 lines / 836,091 bytes, so §6.1's
fourteen failure rows could be wholly uncovered without moving the per-file ratio, while every one
of those same lines sits inside a post-image hunk range the third clause reads. Second, `SUBJECT`
being this feature's *only* production file is what makes the gate total rather than partial; D-6
carries that claim and §5.3/T-19's config and documentation edits are not source, so the claim holds.

## Data Model

The only data the delta moves is §7.3's two census **operands**, and that is where both Highs live.
No literal changed: 6,305 / 10,859 / 12,059 / 441 are unchanged at all sixteen sites, and I re-ran
the arithmetic once more (`12,500 − 1,200 = 11,300`; `11,300 − 10,859 = 441`) to be sure the token
edit did not disturb §7.3's conjunct pair. It did not.

**Operand 1 — the forbidden token set, after the edit.** Six members: `selectDecisions`,
`recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`,
`DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`.

**Operand 2 — the scanned source: everything minus four owned regions.** Three brace-matched
slices (`parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, and the
`selectDecisions`/`recogniseDecisionRecords`/`renderDecisionLedgerBlock` group) plus the
sentinel-bounded `main()` wiring run.

The edit's own test of satisfiability, stated in the new paragraph, is exactly right: *a token is
unsatisfiable when the conforming sites that mention it land in the scanned remainder.* Applying
that test to the surviving six against the declarations §4 and §5.2 actually specify:

| Token | Where conforming code declares / mentions it | Inside an owned region? |
|---|---|---|
| `selectDecisions` | own body (sliced); called inside `buildDecisionLedgerInjector` (sliced) | ✅ |
| `renderDecisionLedgerBlock` | own body (sliced); called inside `buildDecisionLedgerInjector` (sliced) | ✅ |
| `recogniseDecisionRecords` | own body (sliced) — **but §4.4 has `gatherDecisionCorpus` call it**, and `gatherDecisionCorpus` is not a sliced region | ❌ |
| `gatherDecisionCorpus` | **§4.4 declares it as a sixth top-level export.** Its declaration line and whole body are in none of the four regions | ❌ |
| `DECISION_LEDGER_OMIT_REASONS` | **§5.2 declares it as a top-level frozen literal**, outside all four regions | ❌ |
| `DECISION_LEDGER_CORPUS_OUTCOMES` | same | ❌ |

Four of the six therefore occur in the scanned remainder on a *correct* implementation, so
"zero occurrences of any member in the scanned remainder" cannot go green. This is F-01, and it is
the same defect class the round just repaired for `decisionLedger` — the fix named the principle
and applied it to one member without sweeping the set. The carve-out list enumerates five
declarations; §4 declares six functions and §5.2 three catalogues.

**The companion set-equality is red for the mirror reason (F-02).** It asserts
`DECISION_LEDGER_CENSUS_TOKENS` set-equal to "the module's exported decision-ledger symbol names".
Enumerating those from §3.1/§3.2/§4/§5.2 gives at least thirteen — `DECISION_CORPUS_ARGV`,
`DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`, `parseDecisionLedgerConfig`,
`recogniseDecisionRecords`, `selectDecisions`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`,
`buildDecisionLedgerInjector`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`,
`DECISION_LEDGER_NOTICES`, `DECISION_LEDGER_CENSUS_TOKENS` itself — against a six-member set. The
new paragraph's closing clause, "the field name is not an exported symbol, so its removal also
keeps the companion set-equality check exact", is directionally true about `decisionLedger` and
does not make the check satisfiable: it was already unsatisfiable in the other direction, by seven
members. Both Highs are inherited — the pre-round bytes carried the same carve-out list and the
same four tokens — and both sit in the row this edit rewrote, so both are `inherited` + `local`.

The fix is small and belongs to the same author in the same section: name the predicate the census
actually wants. Either (a) restrict the token set to symbols whose *every* conforming mention is
inside an owned region — which is `selectDecisions` and `renderDecisionLedgerBlock`, and then say
so and drop the set-equality to a **subset** relation with a stated reason; or (b) keep the six and
extend the owned regions to `gatherDecisionCorpus`'s brace-matched body and §5.2's three catalogue
declarations, and restate the set-equality against the *distinctive* exported names rather than all
of them. (b) preserves more of BR-11's falsifying power and is the smaller edit to the table.

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
