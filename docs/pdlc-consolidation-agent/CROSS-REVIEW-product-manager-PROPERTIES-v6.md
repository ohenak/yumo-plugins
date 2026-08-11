# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 6
**Scope:** Delta re-review of the v1.5 revision (`9a95324f..01841250`), which closes se-review's
F-01 — PROP-COR-09's missing all-unreadable-corpus arm. Product lens only.

## Method

Delta protocol. My v5 was **Approved, 0/0/0**, so there are no prior findings of mine to re-verify;
this round judges only whether the new revision is faithful and whether it broke anything.

`git diff 9a95324f..01841250` on the document is **four hunks, 26 insertions / 6 deletions**: the
version/changelog block (`:13-27`), PROP-COR-09's title and body (`:403-429`), and §12.1's AC-1.4
row (`:1668`). No other section moved; the id set is untouched. I read only those hunks plus the
upstream cells they claim to derive from, then checked the claims against repository state rather
than against the document's own prose.

Grounding checks run:

- **TSPEC §10.3 row 1b** (`TSPEC-pdlc-consolidation-agent.md:2230`) — status `no-op`, **no** reason
  code, consumed pair rendered empty, every basename stays un-consolidated, still counts toward
  AC-1.2's volume trigger, named in the report, retried next pass (§10.4). The revision transcribes
  this, not a paraphrase of it.
- **TSPEC §12.2's unreadable-entry row** (`:2850`) — carries the second fixture, the two-basename
  corpus, `no-op` *not* `failed` *not* `refused`, `|un-consolidated|` = 2, and the mutual-control
  sentence. PROP-COR-09's new text matches cell for cell.
- **REQ §4b** (`REQ-…:624-628`) — "a corpus entirely unreadable still fires the trigger and still
  terminates… **that pass's terminal status is `no-op`** — AC-1.4's third cause… and no reason code
  is added either", with the consumed-list-empty-while-un-consolidated-non-empty pairing. The
  revision's AC-1.4 attribution is the REQ's own, not an invention.
- **PLAN T20 → T31** (`PLAN-…:365`, `:388`) — both rows exist and both name
  `pdlc/workflows/__tests__/consolidationPass.test.js`, which is present on the branch. The
  trailer's `T20 → T31` traces. (Both PLAN cells have a defect of their own; see *Errata routed*.)
- **AC-1.4 carriers** — four properties cite AC-1.4 in a trailer (`:429`, `:838`, `:1030`, `:1403`).
  PROP-PASS-11 (`:1390-1403`) pins causes one and two (empty un-consolidated set; all
  duplicate-suppressed); neither is the third cause. §12.1's new "the only property asserting it"
  claim is therefore **accurate**.
- **FSPEC register** — this is where the revision falls short. See F-01.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Cross-Feature | PROP-COR-09's trailer still reads `(no FSPEC AT), TSPEC §12.2` (`:429`) while the new arm it just added is **exactly** the fixture FSPEC v11.7 minted a register id for: **AT-K3b** (`FSPEC-…:2210`) — *"a corpus whose enumerated basenames are **all unreadable** on disk… terminal `no-op` (AC-1.4's third cause, REQ §4b) — the consumed pair is appended **empty**… and **no** reason code is minted"*. `AT-K3b` appears in **FSPEC alone**: `grep AT-K3b` returns zero hits in PROPERTIES, TSPEC and PLAN. So an approved register acceptance test has **no carrier property, no assigned test file and no PLAN task**, and the document under review declares the arm unregistered at the same moment it covers it. Fix: claim `AT-K3b` in PROP-COR-09's trailer in place of `(no FSPEC AT)` for the second fixture. | AC-1.4 (third cause), REQ §4b, AT-K3b |
| F-02 | Medium | Local | PROP-PASS-11 (`:1396-1397`) still says *"PROP-PASS-09's set-equality ranges over `no-op`, and this property pins **the two causes that reach it**"*. After this revision three causes reach `no-op` and the third is carried elsewhere (PROP-COR-09), so that phrasing now reads as a false exhaustiveness claim over the status. §12.1's AC-1.4 row was reconciled; this neighbouring sentence was not. Fix: qualify to *the two causes this property pins*, and point at PROP-COR-09 for the third. | AC-1.4 |

**On F-01's severity.** It is not a coverage gap in behaviour — the behaviour *is* asserted, and
asserted well. It is a traceability break, which is the failure mode this project's own review bar
treats as first-class: `AT-K3b` is an approved acceptance test that no artifact downstream of the
FSPEC claims, so nothing mechanically fails if it is never written, and §12.3/§12.4's set-equality
over register ids can no longer be complete. An acceptance test with zero carriers is indis-
tinguishable, at every later gate, from one that passed.

**Why this is filed here and not routed upstream.** TSPEC §12.2 and PLAN T20 carry the same stale
claim and those halves **are** routed (see below). But the trailer at `:429` is this document's own
statement about existing FSPEC state, made false by this very revision's scope, and the changelog
(`:24-26`) claims the revision "re-grounds on those upstream cells **at HEAD**, ahead of the routed
items". That re-grounding read TSPEC §7.1/§10.3/§10.4/§12.2 and FSPEC's narrative but not FSPEC's
own register row, so the claim is incomplete on the terms the author set.

## Errata routed

Two upstream defects found while grounding. Not folded into the verdict below; emitted as `ERRATUM:`
lines for the orchestrator to route.

1. **TSPEC §12.2** (`:2850`) asserts *"which no register AT reaches either"* for the whole-corpus
   observable, reasoning from FSPEC's AC-1.4 → AT map at `FSPEC-…:2370` (AT-K3, AT-L2, AT-F13,
   AT-R7). FSPEC v11.7 minted **AT-K3b** for precisely this fixture at `FSPEC-…:2210`; the TSPEC cell
   predates it and is now false. §12.3's `consolidationPass.test.js` row (`:2923`) and §12.4's
   register set-equality both need `AT-K3b` assigned, or the set equality is short one id.
2. **PLAN T20** (`PLAN-…:365`) never absorbed the erratum PROPERTIES v1.4 and TSPEC §12.2 both
   absorbed: its obligation (i) still requires *"`renderConsumedPair`'s output **contains both**
   basenames"*, which is the pre-erratum reading REQ §4b overturned — the unreadable entry is
   **omitted** from the pair. An implementer working that cell builds the behaviour REQ §4b exists to
   prevent. The same cell describes **one** fixture only and so does not yet plan the all-unreadable
   second fixture or `AT-K3b`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | With `AT-K3b` claimed, does the second fixture stay in `consolidationPass.test.js` (where its subject — the pass's corpus handling end to end — lives, per O-4) or move to `consolidationCredential.test.js`, which owns AT-K1…AT-K7 today (`TSPEC-…:2929`)? I have no product stake in the answer; I raise it because §12.3's one-file-per-register-id rule forces a choice and PROP-COR-09's placement note should record it. |

## Positive Observations

- **The arm is grounded in upstream cells, not in the erratum list.** The changelog answers
  se-review's Q-01 candidly — the arm was *missed*, not deferred, because the routed item list was
  minted against REQ v2.1 while the wave grew REQ v2.5's second arm — and then re-grounds on the
  cells at HEAD. Naming a miss as a miss is what makes the round auditable; I would rather read this
  than a tidied history.
- **The new fixture's oracle is positive, not absence-only.** Terminal status is asserted as
  *exactly* `no-op` **and** explicitly not `failed` — the adjacent branch (row 1a) an implementer
  actually reaches for — and not `refused`. `|un-consolidated|` = 2 and both basenames named are
  positive conjuncts alongside "pair empty". The one negative-shaped assertion has a stated positive
  partner on the same path.
- **The two fixtures are declared each other's controls, in both directions.** The all-unreadable
  fixture stops *"pair empty"* passing on a pass that enumerated nothing; the mixed fixture stops the
  status assertion passing on an implementation that terminates every unreadable-touching pass
  `failed`. That is the pairing discipline §O-5 asks for, applied to the new arm rather than assumed
  from the old one.
- **AC-1.4's third cause now has a named carrier, and the uniqueness claim is true.** I checked all
  four AC-1.4 citers: PROP-PASS-11 pins causes one and two only, so §12.1's *"the only property
  asserting it"* is accurate rather than aspirational.
- **Blast radius is exactly what the changelog claims.** No property added, removed or renumbered;
  §12.3 and §12.4 are undisturbed because the trailer's file and AT columns did not change — which is
  also, precisely, why F-01 is invisible without reading the FSPEC register.

## Recommendation

**Needs revision**

One High finding. The behaviour this revision adds is right, faithful to REQ §4b and TSPEC §10.3
row 1b, and well-controlled — the gap is one trailer cell. To close:

1. Replace `(no FSPEC AT)` in PROP-COR-09's trailer (`:429`) with **`AT-K3b`** for the second
   fixture, keeping `TSPEC §12.2`, and say in the body that the all-unreadable arm is `AT-K3b`'s
   oracle. Answer Q-01's placement in the same edit.
2. Qualify PROP-PASS-11's *"the two causes that reach it"* (`:1396-1397`) and cross-reference
   PROP-COR-09 for the third (Medium; not gating).

Both errata above are the author's to route, not to fix here.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
