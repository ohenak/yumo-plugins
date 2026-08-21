# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN v0.5 → v0.6)

## Overview

**Question answered.** Does PROPERTIES (bytes unchanged, sha256 `6d74d3eb…`) still hold as approved
against PLAN as it now stands at `d028d972…` (v0.6)? **Yes for every property, oracle, fixture and
traceability count** — the PLAN erratum moved no task, no batch, no `Deps` edge, no AT partition and
no fixture, so nothing this document *asserts* is disturbed. What the erratum did break is a pair of
prose statements in §C.4 and the header that *describe the state of PLAN*: PROPERTIES still says the
routed item is open when PLAN has closed it, and still pins PLAN at v0.5. Both are documentation
accuracy, neither gates a suite — hence Medium and Low, not High.

**The delta I read.** `git diff 7bcbce64~1..HEAD -- PLAN` is confined to four places: the version cell
(0.5 → 0.6, PLAN:18), LI-08's row gaining a pointer to the new paragraph (PLAN:147), the new
**Amendment commits on landed suites (P-A-7)** paragraph and its two-case table inside §The three
gate wordings (PLAN:484–503), and the v0.6 changelog row (PLAN:590). I re-read only those, plus the
sections of PROPERTIES that lean on them (header row :11, §C.4's landed-files paragraph :1087–1101,
PROP-BOUND-03's cost sentence :252, PROP-BOUND-05 :264–275, §G.1's T-O-6 row, §G.2/§G.3).

**What the erratum resolves, verified against PLAN at HEAD.** PLAN:486–495 now names the expected-red
rows for the heading-form follow-up in both reachable cases: **case A** (commit lands before batch 7)
adds **no** row, because `learningsBlock.test.js` is already ledgered as a whole-suite red after
batches 7–8 and greens entire at LI-17/batch 9; **case B** (batch 9 or later) adds the named row
`learningsBlock` → `LI-AT-11`'s heading-form cases only, stated in test names, for every batch from
the landing batch through the greening batch. PLAN:496–503 additionally discharges the fixture-helper
question by declaring the heading-form knob **additive** over the landed `buildLearningsCorpus`
ordinal/gloss rendering, so `learningsSelect.test.js` and `learningsCorpus.test.js` carry no row —
and commits the non-additive future to entering the ledger first. That is exactly the shape §C.4
asked for when it routed the item, and it is engineering-sound: an additive knob keeps existing
callers byte-identical, which is the premise the empty row-set rests on.

**Verification method.** `shasum -a 256` on all five upstream files against the dispatch pins (all
five match, PLAN included); `git log`/`git diff` over PLAN's erratum commits (`7bcbce64`,
`748659c0`, `92e5d178`, `6a2d3007`); grep of every `PLAN` mention in PROPERTIES (22 sites) against
PLAN at HEAD; re-check of PROP-BOUND-03's and PROP-BOUND-05's owning-task cites (PLAN:147, LI-08 red
/ LI-17 green — unchanged by the erratum). I did not re-read the sections of PROPERTIES that carry no
PLAN dependency.

## Properties

No property changes status. The erratum touched no behavioural text, so no property's *claim* can
have drifted; what I checked is whether any property's **owning-task or cost sentence** still reads
true against PLAN v0.6.

- **PROP-BOUND-03** (PROPERTIES:235–252) — holds. Its cost sentence ("one added case in
  `pdlc/workflows/__tests__/learningsBlock.test.js` (landed, 7.6 K) under the **existing** LI-08 red /
  LI-17 green tasks — no new fixture, no new PLAN task, no new AT id, no new property id") is still
  exact: PLAN:147 still assigns `learningsBlock.test.js` to LI-08 with `learningsBlock` red at
  batches 7–8 and green at LI-17/batch 9, and the erratum added ownership language only, never moved
  it. The zero-bound conjuncts trace to TSPEC §I.3/§D.5, untouched at `22dee8ce…`.
- **PROP-BOUND-05** (PROPERTIES:264–275) — holds, and is now *better* supported than when I approved
  it. Its priority-ordered-intersection oracle is the same claim PLAN's LI-08 row now pins with the
  non-canonical heading forms (un-numbered `## Cross-Feature Patterns`, un-glossed
  `## Rejected Proposals`, the `###` sub-heading that must read as body text, the `## Process
  Findings` near-miss). PROPERTIES states the observable; PLAN states which test carries it and when
  it reds — the altitude split is intact and the two texts agree.
- **PROP-BOUND-06, PROP-BOUND-07, PROP-BOUND-08, PROP-CONFIG-09** — untouched by the delta; their
  upstream anchors (FSPEC E-36/BR-6/BR-9 at `ae75fa62…`, TSPEC §D.5 at `22dee8ce…`) are byte-identical
  to the versions I approved against. Not re-litigated.
- **Counts unchanged.** `grep -o 'PROP-[A-Z]*-[0-9]*' | sort -u | wc -l` → **70**, matching §C.4:1056
  and the header at :22. §C.3's "23 of 23 tasks accounted for" still holds: PLAN still carries
  LI-01…LI-23 and the erratum added no task.

The one place a property-adjacent sentence *is* now wrong is §C.4's account of what PLAN has and has
not decided — see F-01 and F-03. Neither changes a property's text, oracle, level, fixture or owning
task; both are stale descriptions of upstream that a reader would use to conclude an item is still
open when it is not.

## Oracles

- **§G.1's T-O-6 row** — holds. It names LI-08 red / LI-17 green for the example arm "with the
  generated arm folded into the same suites", and closes with "**No new PLAN task is required**". PLAN
  v0.6 adds no task and moves no batch, so the sentence is still true at HEAD; the erratum in fact
  strengthens it, since the amendment mechanism it now spells out is explicitly ownership-preserving
  ("Ownership does not move, so the single-writer manifest is unchanged", PLAN:147).
- **§O.9's generated arms** — untouched. The domain statement (`every non-negative maxBytes, 0
  included`) quotes TSPEC §T.5, which is byte-identical at HEAD. Nothing in the PLAN delta bears on
  generator domains.
- **§O.5's level table and §O.8's mutation ledger** — untouched, and neither cites PLAN's ledger
  paragraph. The mutation ledger's M-5 row still reads against FSPEC BR-6 / TSPEC §D.5 as approved.
- **The re-red discipline is where the two documents now have to agree, and mostly do.** PROPERTIES
  §C.4 says the Group D amendments land on committed code, so they are a re-red rather than a fold
  into LI-16/LI-17, "which is exactly PLAN P-A-7's case". PLAN v0.6 now *implements* P-A-7 for one
  slice of that surface — `LI-AT-11`'s heading-form cases. The remaining slice PROPERTIES names in the
  same breath (PROP-BOUND-05/07/08's amendments, and PROP-BOUND-03's zero case at :252, all landing in
  the same `learningsBlock.test.js`) is governed instead by **P-A-6** (PLAN:577: the PROPERTIES suite
  commits at the first point it is green, in practice after LI-21/batch 13, "or else its red rows are
  amended into the ledger by name first"). Both mechanisms exist and together they cover the surface —
  but §C.4's sentence points the reader at the erratum-shaped route for all of it, which after v0.6
  reads as though the heading-form paragraph were the governing rule for amendments it does not
  mention. That is F-03: a one-clause pointer fix, not a mechanism gap.

No oracle is retracted, weakened or made unfalsifiable by the delta.

## Fixtures

The erratum's only fixture-adjacent claim is PLAN:496–503: `__tests__/helpers/learningsFixtures.js`
and its consumers carry **no** expected-red row, because the declared-heading-form knob is *additive*
over the landed helper — "the landed helper already renders an optional ordinal and an optional
gloss, and existing callers that declare neither keep byte-identical output". I checked that premise
rather than taking it: `pdlc/workflows/__tests__/helpers/learningsFixtures.js` is tracked at HEAD, and
its section rendering takes the title through an optional ordinal/gloss composition, so a caller that
declares neither produces the same bytes it does today. The premise is sound, and PLAN correctly
states the fallback for the day it stops being sound (non-additive amendment ⇒ moved consumers enter
the ledger by name first). That is the right engineering answer — it makes the empty row-set
conditional on a checkable property rather than on optimism.

Consequences for PROPERTIES' fixture surface, all null:

- **No fixture PROPERTIES names is invalidated.** `BYTES-BINDING`'s 3/5/0 literal, `ZERO-BOUND`,
  `DIVERGENT-CORPUS`, `DISCARDED-NESTED`/`DISCARDED-DIRECT`, `COUNT-BINDING` — none is mentioned in the
  delta, and none derives an expected value from PLAN's ledger.
- **No hand-computed expected byte count moves.** §G.2.2 already resolved the framing-accounting
  question to "no change" against FSPEC v0.13; the erratum does not reopen it, and PLAN:590 says so
  explicitly ("no AT partition or fixture was touched"), which I verified by diff rather than by
  trusting the changelog.
- **The fourteen-row file-ownership manifest is unchanged**, so §C.4's "fourteen rows over fourteen
  files" arithmetic and its seven-landed/seven-planned split still hold. (The stale item in that
  paragraph is the routing sentence, not the arithmetic — F-01.)
- **No new fixture is owed by this confirmation.** Every amendment the erratum contemplates is a case
  added to an existing suite over an existing corpus builder.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | §C.4 states "PLAN's LI-08 v0.5 amendment note assigns the follow-up commit to the existing owners but **does not name the ledger rows**; that naming is the PLAN's to do and is routed as an erratum, not decided here." False at HEAD: PLAN v0.6 names them, in both cases, at PLAN:484–503 (§The three gate wordings, *Amendment commits on landed suites (P-A-7)*), and LI-08's row now points at that paragraph. The routed erratum is CLOSED; the sentence should record it as such and cite the paragraph, so a reader does not re-route a settled item | §C.4 Landed files and re-red of landed suites |
| F-02 | Low | delta | nonlocal | Header upstream row pins `PLAN-pdlc-learnings-injection.md` at **v0.5**; HEAD is **v0.6** (`d028d972…`). The parenthetical reason for the pin ("LI-12's three-case AT-30 matches PROP-CONFIG-09") is still true, so this is a version-cell refresh only | §Document control, Upstream row (:11) |
| F-03 | Low | delta | nonlocal | §C.4 attributes the whole re-red surface of `learningsBlock.test.js` to "PLAN P-A-7's case", but PLAN v0.6's new paragraph names rows for `LI-AT-11`'s heading-form cases only. PROPERTIES' own amendments to that landed suite (PROP-BOUND-05/07/08, and PROP-BOUND-03's zero case at :252) are governed by **P-A-6** (PLAN:577 — PROPERTIES suite commits once green after LI-21, or its red rows are ledgered by name first). Both mechanisms exist and jointly cover the surface; the sentence should name P-A-6 for its own amendments rather than let the heading-form paragraph read as the governing rule for them | §C.4 Landed files and re-red of landed suites |

FINDING: Medium | delta | nonlocal | §C.4 Landed files / re-red of landed suites | PROPERTIES says PLAN's LI-08 note "does not name the ledger rows" and routes that naming as an open erratum; PLAN v0.6 (PLAN:484–503, *Amendment commits on landed suites (P-A-7)*) now names them in both cases A and B, so the sentence describes an upstream state that no longer exists and re-routes a closed item
FINDING: Low | delta | nonlocal | §Document control, Upstream row (:11) | The PLAN pin reads v0.5; PLAN at HEAD is v0.6 (`d028d972…`) — version-cell refresh only, the stated reason for the pin still holds
FINDING: Low | delta | nonlocal | §C.4 Landed files / re-red of landed suites | §C.4 attributes the whole `learningsBlock.test.js` re-red surface to P-A-7's case, but PLAN v0.6's paragraph is scoped to `LI-AT-11`'s heading-form cases; PROPERTIES' own amendments (PROP-BOUND-05/07/08, PROP-BOUND-03's zero case) fall under P-A-6 (PLAN:577) and should cite it

## Recommendation

## Verdict
