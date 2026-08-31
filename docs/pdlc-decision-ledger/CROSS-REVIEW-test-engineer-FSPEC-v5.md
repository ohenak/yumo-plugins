# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.3)
**Date:** 2026-08-28
**Iteration:** 5 (delta confirmation, not a full re-review)

## Overview

Round v4 approved FSPEC v1.2 with two non-gating inherited findings: F-01 (Medium) — `maxBytes` `0`
had no stated outcome, unlike `maxEntries` `0`, leaving §7 O-8's bounds property without a boundary
on that axis — and F-02 (Low) — the Baseline's `Cited by` propagation row omitted FSPEC §7
Assumptions. This round confirms the erratum edit (`514dccd67`, FSPEC v1.3) against upstream at HEAD,
and re-measures the compression against REQ **v1.9** (`sha256:ce6b133f…`), which moved under the
document since v4's `UPSTREAM-STATE` pin (`sha256:d61cbb0d…`).

## Routed items — disposition

| Item | Where it landed | Confirmed |
|---|---|---|
| v4 F-01 (Medium) — `maxBytes` `0` outcome unstated | FSPEC v1.3: E-7 broadened to **either** bound (`:331`), AT-14 broadened to three cases (`:473`–`:479`), changelog entry `:19`–`:24` | Resolved |
| v4 F-02 (Low) — Baseline propagation row omits FSPEC §7 Assumptions | Absorbed upstream in `4f03479e1`: `docs/_constraints/pdlc-decision-corpus-baseline.md:6` now reads `…§7 O-5, §7 Assumptions A-1` | Resolved upstream |

Both routed items were verified on disk, not from the commit message. The dispatch reported F-02 as
absorbed at HEAD; that is confirmed — the Baseline row names the site, so a future `Version` bump
routes to A-1's `M-6b`/`M-6c`/`M-7b`/`M-7c` restatement (`:562`) rather than leaving it stale.

## Re-measurement against upstream at HEAD

REQ v1.9 is a pin erratum: §1 (`:90`) and §5 REQ-DECLEDGER-01 (`:202`) moved `v1.1` → `v1.2`, and the
v1.8 note's cascade pointer was corrected from §3.3 to "§3.1's defaults sentence and §7 A-1". No
measured value moved. Checked against that:

- FSPEC's Baseline pin (`:11`), §1 (`:59`) and §5 fixture instruction (`:347`) all read **v1.2** —
  the document no longer disagrees with its upstream, and the frozen-fixture AT can be cut at one
  `Verified at` commit.
- The two sites REQ v1.9 names as the real recitals are correct at HEAD: §3.1's defaults sentence
  reads `maxBytes` `12500` (`:127`), §7 A-1 reads `12500` from `M-7b`/`M-7c` (`:562`). No `8000`
  literal survives anywhere in the file (grepped).
- §3.3 keeps its Baseline citations (`M-4e`, `M-4a`, `M-4b`), so its entry on the propagation row is
  a real site and not the stale pointer REQ v1.9 retired.

## Testing-lens check on the delta itself

The broadening is testable as written, and it does not weaken any oracle v4 approved:

- **E-7 states one outcome for both keys, with the mechanism named** (`:331`): `maxEntries` `0` is
  E-6 directly; `maxBytes` `0` reaches the same outcome via E-8 then E-6, "since every line exceeds
  `0`". An implementer does not have to guess which path applies, and a reviewer can falsify either.
- **AT-14's oracle stayed positive** (`:473`–`:479`). The third case is asserted the same way as the
  first two — byte-identity to AT-04's committed baseline — not as an absence check (`no index
  block`, `status != error`). It keeps the explicit failing condition ("A build emitting the rule
  text without an index fails"), so the added case inherits a falsifiable oracle rather than a
  weaker one.
- **BR-1 already generalises over the delta.** Its third conjunct is "at least one rendered line
  survives the bounds of §3.2 step 5" (`:210`) — bounds, not `maxEntries` — so `maxBytes` `0`
  suppressing the whole block is an instance of BR-1, not a new exception, and §3.2 step 6's
  unconditional "attach the rule text" cannot be read as emitting standalone rule text. The delta
  needed no BR edit and correctly made none.
- **§7 O-8 is now total over its own quantifier** (`:533`). The property is parameterised over "set
  size × line sizes × **both bounds**"; with `maxBytes` `0` specified, PROPERTIES can state the
  boundary on both axes instead of inheriting an unspecified one. This was v4 F-01's whole cost and
  it is paid.
- **Traceability held**: REQ-DECLEDGER-07's row (`:90`) still binds BR-12/BR-13 → E-6/E-7/E-8 →
  AT-13/AT-14/AT-15, and O-8's "AT-13 exercises exactly two examples" is still accurate, since the
  third case went to AT-14, not AT-13.

## Questions

None. Nothing in the delta requires an answer before PROPERTIES authoring.

## Positive Observations

- **The changelog states the negative explicitly.** "REQ v1.9 moved no measured value … the pin
  above advances and nothing here follows from it" (`:19`–`:20`) — a scope claim a reviewer can
  falsify mechanically in under a minute, which is what makes a delta-confirmation round cheap.
- **The fix was made at the edge case, not at the AT.** E-7 carries the rule and AT-14 carries the
  witness; the mechanism sentence lives once, in E-7, and the AT cites it. That is the shape that
  survives the next bound change.
- **The `0`-on-either-key rule names why it is stated** ("Stated for both so O-8's bounds property
  is total over either bound"), so a future editor tempted to compress it back knows the obligation
  it discharges.

## Recommendation

**Approved**

The delta resolves v4's F-01 at the edge case and the AT that witnesses it, F-02 was absorbed
upstream in the Baseline's propagation row, and re-measurement against REQ **v1.9** at HEAD finds the
document still a faithful compression: every Baseline pin reads v1.2, the `12500` default is recited
only at the two sites REQ v1.9 names, and no oracle v4 approved was weakened. No open High, no new
Medium or Low.

## Delta-Confirmation Findings

No findings.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39
APPROVAL-HASH-NORMALIZED: sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39
REVIEWED-COMMIT: 4f03479e15a6afa7b479565c81683a24c4a0679e
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
