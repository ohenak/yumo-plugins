# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.5 erratum)
**Date:** 2026-08-28
**Iteration:** 6 (delta confirmation)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…`, FSPEC v1.3 `sha256:2bd5c3ef…`, Baseline v1.2

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v0.4 (round 5). The
v0.5 erratum retires the 8,000-byte arithmetic, re-pins upstream to REQ v1.9 / FSPEC v1.3 /
Baseline v1.2, closes ERR-1 and ERR-2 as resolved upstream, and restates §7.3's 141-record fixture
as a deliberately over-sized basis rather than "what a real dispatch gathers".

I read `git diff c115fa77d..HEAD` on the TSPEC (five commits, 345 diff lines), re-read REQ G-1,
REQ C-5, REQ A-1/R-5, FSPEC §7's A-1 and Baseline v1.2's `M-6b`/`M-6c`/`M-7a`–`M-7d` at their
current bytes, and re-derived every arithmetic claim the delta introduces.

**Verdict in one line:** every routed item landed, and the arithmetic is correct — but the edit
moved the load-bearing measured margin from a place an oracle pinned to a place no oracle pins.
That is a delta-introduced testability regression against D-10's own stated standard, so this
confirmation is non-approving with one High finding, tagged `delta`/`local` so it earns a bounded
follow-up rather than a halt.

Arithmetic re-derived and confirmed correct:

| Claim | Check | Result |
|---|---|---|
| Line allowance `12500 − 1200` | REQ C-5 default 12,500; §4.3 framing budget ≤1,200 (D-5/DEC-DECLEDGER-07) | **11,300** ✓ |
| Project-level headroom | `11,300 − 6,305` | **4,995** ✓ |
| "about twenty-seven / nineteen lines" | `4,995 / 183` = 27.3; `4,995 / 261` = 19.1 | ✓ |
| `M-6b` worst case rendered whole | `10,859 + 1,200 = 12,059 ≤ 12,500`; 63 ≤ 70 | ✓, margin **441** ✓ |
| §7.3 feature-line survivor count | `maxEntries` 70 − 41 project = 29 cap, byte bound trims below | "roughly two dozen" ✓ |
| Framing implied by `M-7b` | `10,859 − 9,296 = 1,563` over 63 records ≈ 24.8 B/record, inside `M-7c`'s 50 | ✓ |
| Header pins | REQ file HEAD = v1.9, FSPEC HEAD = v1.3, Baseline HEAD = v1.2 | ✓ |

## Architecture

Nothing structural moved, and I confirm that. The delta touches literals, arithmetic and rationale
prose only: the recognition rule (§3.1–§3.4), the two-function split (`renderDecisionLedgerBlock`
as sole byte producer, `selectDecisions` calling it — D-8), the omission order itself, the
attach-point (§2.5), and the fixture-copy discipline (§7.3) are byte-identical. No approved
decision is re-litigated and no new seam appears. The erratum note's "nothing else is touched"
claim is accurate against the diff.

One architectural *conclusion* did move, and it is the one that carries this review. §3.6 formerly
concluded "the order is **live** under shipped defaults"; it now concludes the order **does not
fire** at the Baseline commit on a G-1-scoped dispatch, with inertness explicitly labelled "a
measurement at one commit, not a property of the mechanism". That reconciliation with
`DEC-DECLEDGER-03` is exactly what was routed, and it is well argued — §3.6 keeps the order
specified and tested as load-bearing regardless, and names the three ways the measurement expires
(corpus growth, an operator lowering either threshold, a raised framing budget).

The consequence for testing is the finding in F-01: when a design's safety rests on a *measurement*
rather than a *property*, the measurement is the thing that needs the oracle. The old text put the
load-bearing measurement (project-level 6,305 against a 6,800-byte allowance, ~495 margin) in the
same place §7.3's conjunct (2) asserted it. The new text puts the load-bearing measurement (63
records at 12,059 against 12,500, 441 margin) somewhere §7.3 does not reach.

## Interfaces

Upstream citation surfaces re-read at HEAD (DEC-ERR-03 obligation — the item list is necessary,
not sufficient):

| TSPEC site | What it now says | Upstream at HEAD | Faithful? |
|---|---|---|---|
| Header pins | REQ v1.9 / FSPEC v1.3 / Baseline v1.2 | REQ `Version 1.9`, FSPEC `Version 1.3`, Baseline `1.2 · 2026-08-28` | ✓ |
| §3.5, §7.3 Baseline pin | v1.2's `Verified at` `8c673a09f` | Baseline v1.2 `Verified HEAD 8c673a09f on feat-pdlc-decision-ledger` | ✓ |
| §3.6 / §7.3 "REQ G-1 scopes a real dispatch to the project set plus one feature" | over-sized-fixture framing | REQ G-1: "the project's closed decisions, plus those of the feature whose document is under review", unit is the decision not the file | ✓ — this is the se-author item, correctly landed |
| §4.1 type row + §9.2 ERR-1 | "agrees with REQ C-5, non-negative as of v1.8" | REQ C-5 rows: both thresholds `non-negative integer` | ✓ |
| §4.1 / §5.3 / §7.3 default literal | 12500 | REQ C-5 `maxBytes` default `12500` | ✓ |
| §3.6 "63-record worst standing case" | `M-6b` | Baseline `M-6b`: `41 + 22 = 63`, governing figure for directory-glob file scope | ✓ |
| §9.2 ERR-2 resolution derivation | "derived by id from Baseline v1.2's `M-7b`/`M-7c`" | `M-7b` 9,296 substance bytes / 63 records; `M-7c` 12,500 clears `M-7b` by 3,204 = 50 B/record framing allowance | ✓ — and TSPEC's own rendered 10,859 implies ≈24.8 B/record, inside the allowance |
| §9.4 A-1 restatement | "both thresholds now measured … at one commit rather than against a growth model (REQ R-5)" | REQ R-5 verbatim: "measured … but against one commit rather than a growth model (`M-6d`, `M-7d`)" | ✓ |
| §9.4 provenance | "Carried from FSPEC §7 (v1.2 corrected A-1 to REQ HEAD)" | FSPEC v1.2 erratum note records exactly that correction | ✓ |

Two citation surfaces do **not** survive the re-read cleanly, both minor and both recorded below
as F-03 and F-04: §9.4's unqualified "still operator-vetoable" against REQ A-1's and FSPEC A-1's
*windowed* vetoability, and ERR-2's retained pre-resolution paragraph still arguing in the present
tense from that same window.

I also checked the two upstream ids the delta newly leans on that were **not** on the routed list —
REQ R-5 and REQ AT (§5, "Given … the in-scope set is within C-5's bounds"). Both are consistent
with the new arithmetic: under 12,500 a G-1-scoped set is within bounds, so the REQ's happy-path
Given is satisfiable at the Baseline commit, which it arguably was not under the retired 8,000.
That is a genuine improvement the erratum earns and does not claim.

## Data Model

`DecisionLedgerConfig` and `parseDecisionLedgerConfig` (§4.1) are unchanged except for the default
literal and the comment. Contract-fidelity diff against REQ C-5 at HEAD, which is the check this
lens owes on every type/enum/numeric change:

| Field | TSPEC §4.1 | REQ C-5 | Agreement |
|---|---|---|---|
| `enabled` | `boolean`, default `false` | boolean, default `false` | ✓ |
| `maxEntries` | non-negative integer, default `70` | non-negative integer, default `70` | ✓ |
| `maxBytes` | non-negative integer, default `12500` | non-negative integer, default `12500` | ✓ |

The ERR-1 divergence is genuinely gone, not merely relabelled: §4.1's prose now says the
`nonNegativeInt` choice **agrees with** C-5 rather than diverging from it, which is the correct
reading now that v1.8 retyped both thresholds. `maxEntries: 0` remains a valid admits-nothing
value per FSPEC E-7, so the falsifying test that matters here — `0` is not coerced to `70` — is
still owed and still specified. `DEC-DECLEDGER-15` in the sibling DECISIONS doc records the same
closure, so the two documents agree.

§5.3's config recital moves in lockstep
(`"decisionLedger": { "enabled": false, "maxEntries": 70, "maxBytes": 12500 }`), and
`decision-ledger-config-example.test.js` asserts the example file parses and matches the declared
defaults — so the recital literal *is* oracle-covered and will redden if C-5 and the example
diverge again. That is the right shape and it survived the edit intact.

One numeric consequence worth stating explicitly, because it feeds F-01: the transcribed **6,305**
is unchanged (correctly — Baseline v1.2 records `M-1`…`M-6` at the same `Verified at` commit, so no
measured value moves), but the *threshold it is compared against* in §7.3 conjunct (2) moved from
6,800 to 11,300. The literal stayed; the slack around it grew almost tenfold.

## Test Strategy

### The oracle that got looser (F-01, High)

D-10 states this spec's own standard, and it is the right one: "the promoted corpus is admitted
whole" must be a **measured, pinned** fact, because "an unpinned 'always' would expire silently
with every test green, which is exactly the shape of claim §3.6 retired in the previous revision".

Before this erratum, the load-bearing measurement and the pin were the same arithmetic. §3.6's
conclusion turned on 6,305 project-level bytes fitting a 6,800-byte allowance — **~495 bytes** of
margin — and §7.3 conjunct (2) asserted precisely `6,305 ≤ maxBytes − 1200`. Corpus growth of
roughly three promoted lines spent the margin, and at that moment conjunct (2) reddened. The claim
and its falsifier were the same numbers. That is why I approved it.

After the erratum the two have come apart:

- The **new** load-bearing measurement is `M-6b`'s 63-record G-1-scoped worst case: 10,859 index
  bytes, **12,059** with framing, against 12,500 — a margin of **441 bytes, under two lines**
  (§3.6's own words). This is the number that carries §3.6's conclusion that "neither bound fires
  on any real dispatch at that commit, and no line is omitted", D-10's revised "clearing the bound
  by 441", and §7.6's new AT-01 rationale ("`M-6b`'s 63-record case clears the same bound by only
  441 bytes").
- The **pin** is still conjunct (2), now `6,305 ≤ 11,300` — **4,995 bytes** of slack.

So the claim that expires first (441 bytes ≈ two promoted or feature-level lines) is asserted
nowhere, and the assertion that exists tolerates roughly twenty-seven lines of growth before it
notices. `docs/_decisions/` and `docs/completed/{feature}/` both grow by the exact mechanism this
pipeline runs. The first two decisions promoted after the fixture is captured falsify §3.6's
"no line is omitted" conclusion **with the entire suite green** — the precise failure mode D-10
exists to prevent, reintroduced by an edit whose stated purpose was to preserve D-10's discipline.

Nor is it caught elsewhere. I checked: §7.5's bounds property generates configurations rather than
measuring the standing corpus; AT-13/AT-15 exercise the order under configured bounds; AT-01 runs
deliberately non-binding; the sibling DECISIONS doc's re-evaluation trigger fires at "70 promoted
records", which is the `maxEntries` cap on the project-level half — far past the point the 441-byte
margin is gone. Nothing reddens.

**What resolves it.** One added assertion in §7.3's corpus oracle, over the **`M-6b` slice** of the
frozen fixture (the 41 project-level records plus `pdlc-headless-engine`'s 22 = 63) at C-5's
shipped defaults, asserting three positive conjuncts:

1. `omitted[]` is **empty** — the positive form of §3.6's "no line is omitted", not `omitted.length
   !== 141` or any absence-only shape;
2. the rendered block's byte size equals the transcribed **12,059** (hand-transcribed from the
   fixture, never derived from the renderer — the same discipline conjunct (1) already observes),
   with `10,859` transcribed as the index-lines figure;
3. `12,059 ≤ 12,500`, stated as arithmetic against C-5's default so the margin itself is the
   asserted quantity.

That pins the 441 bytes where §3.6 spends them, reddens at the deliberate fixture re-capture
exactly as conjunct (1) does, and costs one build over a slice the fixture already contains. It
does not replace the whole-fixture assertion — that one is still needed for the non-vacuous
`omitted[]` partition — it sits beside it.

### What the delta got right

The **141-record framing repair is correct and improves falsifiability reasoning**, and it was the
item I was most concerned the erratum would fumble. §7.3 no longer misdescribes the fixture as
"what a real dispatch gathers" (which contradicted G-1 and would have misled a test author into
sizing fixtures by it); it now states the fixture is *deliberately* over-sized "so that a bound
binds and the drop loop runs". That is the honest justification, and it keeps conjunct (3)'s
`omitted[]` non-vacuous — which is the whole reason the whole-fixture build was chosen in round 3.
The non-vacuity argument survives the raise from 8,000 to 12,500: at 141 records both bounds are
exceeded, so the drop loop runs regardless, and "no project-level id was omitted" remains an
absence asserted over a genuinely non-empty set, still reddening under a reversed drop order.

The **project-level-only slice is still correctly rejected**, with the arithmetic restated at the
new allowance (41 against `maxEntries` 70, 6,305 against 11,300 — nothing to drop, `omitted[]`
empty under every order, conjunct vacuously true). D-10's rejected-alternative record moved with
it. Good.

The **§7.6 AT-01 rationale rewrite is a real improvement**, not just a literal swap. The old
rationale ("the 45/48-line sets would be unproducible at the default") is simply false at 12,500 —
7,042 + 1,200 = 8,242 and 7,650 + 1,200 = 8,850 both fit, and 45/48 ≤ 70. Rather than delete the
non-binding-bounds decision, the author re-derived a *better* reason for it: the expected sets must
not depend on the bound at all, so a recognition-rule oracle never reddens for a bounds reason.
That is the correct test-design instinct — it decouples the oracle from a parameter it is not
about — and the "never trim the expected set to whatever the renderer emitted" clause survives
intact.

**ERR-1's closure is clean.** §4.1 now agrees with C-5 rather than diverging, and the
`maxEntries: 0` behaviour FSPEC E-7 requires is unchanged, so no test the PLAN owes moves.

### Minor test-strategy notes

§7.3's new sentence says `maxEntries` 70 "**binds first**, forcing at least 71 omissions before the
byte bound is reached". The conclusion (the drop loop must run) is right, but the mechanism is
mis-stated: §3.6 specifies one loop dropping while the index exceeds `maxEntries` lines **or**
`maxBytes` bytes, and at 141 records both are exceeded from the outset — the byte bound is in fact
what determines the terminal set, as the same section concedes two paragraphs later when it says
the ~4,995 bytes of headroom "trims a few more" past the 29-line entry cap. Recorded as F-02 (Low);
it does not weaken any assertion, but a test author reading "binds first" may write the survivor
count as 29 and redden.

## Open Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
