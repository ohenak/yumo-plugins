# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.5)
**Date:** 2026-08-28
**Iteration:** 6 (delta confirmation of the v0.5 erratum)
**Scope:** Local

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v0.4; the v0.5 erratum
(commits `d619580a9`..`1235ef31d`) re-pins upstream and retires the arithmetic built on REQ C-5's
former `maxBytes` default of `8000`. I read the erratum recital, `git diff d619580a9^..HEAD` over the
TSPEC, and then re-read the upstream text this document now leans on at HEAD — REQ
(`sha256:ce6b133f…`, v1.9), FSPEC (`sha256:2bd5c3ef…`, v1.3) and
`docs/_constraints/pdlc-decision-corpus-baseline.md` v1.2 — rather than checking the routed items off
a list.

**Answer: yes, with one exception.** Every routed item landed, and the re-measurement is internally
consistent and faithful to REQ HEAD. One sentence in §3.6 (line 433) survived the sweep carrying the
retired default's conclusion, and it now contradicts two passages the same erratum wrote. That is a
Medium `delta`/`local` finding — the erratum's own scope statement names §3.6 as a section that moves.

Routed items, verified against the bytes at HEAD:

| Routed item | Landed |
|---|---|
| Header pins REQ HEAD / Baseline v1.2 | Yes — header now reads REQ v1.9, FSPEC v1.3, Baseline **v1.2**; §3.5 and §7.3's fixture pin follow to v1.2 |
| §9.2 ERR-1 / ERR-2 marked resolved in REQ v1.8 | Yes — both retitled `(RESOLVED upstream — REQ v1.8)`, ERR-2 gains a `Resolution.` paragraph naming `M-7b`/`M-7c` |
| §7.3 `8000` → resolved default | Yes — `maxBytes: 12500` in the shipped-defaults build; conjunct (2) reads `6,305 ≤ 11,300` |
| §3.6 `6,800` allowance / `~495` headroom | Yes — `12500 − 1200 = 11,300`, headroom **~4,995** |
| §4.3 framing pin turning on "~495 bytes headroom" | Yes — restated on ~4,995 **and** on the 441-byte margin, which is the tighter constraint |
| §3.6 / D-10 re-measured, live-vs-inert reconciled with `DEC-DECLEDGER-03` | Yes — 10,859 + 1,200 = 12,059 inside 12,500 with **441** bytes to spare; inertness stated as a measurement at one commit, not a property |
| §7.3's "141 in-scope … what a real dispatch gathers" vs REQ G-1 | Yes — the 141-record fixture is now stated as a deliberately over-sized basis, with G-1's ≤63 (`M-6b`) named as the real dispatch scope |
| §4.1 type row / §4.2 comment / §5.3 config recital | Yes — `default 12500`, non-negative typing stated as *agreeing with* C-5 rather than diverging, config recital `"maxBytes": 12500` |
| §7.6's AT-01 rationale (:1187 region) | Yes — rewritten: the 45/48 sets are producible at 12,500, and the reason for explicit bounds is now independence-from-the-bound plus the 441-byte margin |
| §3.6's "(§9.2, E-2)" prefix | Yes — reads `(§9.2, **ERR-2**)` |
| §9.4 A-1's retired "not measured" claim | Yes — both thresholds now measured, `maxBytes` 12,500 against `M-7b`/`M-7c`, at one commit rather than against a growth model (REQ R-5) |

No live occurrence of `8000` / `6,800` / `~495` survives; the remaining ones are past-tense recitals
in §9.2's ERR-2 history and the v0.5 erratum note, which is the correct place for them.

## Architecture

**Product lens on the omission order (§3.6).** The erratum's substantive product move is the switch
from "the order is live on day one" to "the order does not fire at the Baseline commit, and that is a
measurement, not a property". Measured against REQ HEAD this is the faithful reading: REQ C-5 now
defaults `maxBytes` to `12500` and cites `M-7c` for it, and `M-6b`'s 63-record floor renders 12,059
bytes with framing charged, so neither bound fires on a G-1-scoped dispatch. §3.6 says exactly that,
keeps the order specified and tested as load-bearing, and gives the operator-lowers-a-threshold and
corpus-growth regimes as the reason — which is `DEC-DECLEDGER-03`'s conclusion on the same ground.
No acceptance criterion is narrowed by the change.

**One sentence did not follow the re-measurement.** §3.6's rationale paragraph (line 433) still reads:

> the claim was wrong because **`maxBytes` binds first in every case**, and D-5 charges framing to it.

That was true only under the retired `8000` (allowance 6,800, against 10,859 index bytes at 63
records, with 63 lines clearing `maxEntries` 70). At REQ HEAD's `12500` it is false in both regimes
the same erratum measured:

- on a G-1-scoped dispatch, **neither** bound fires — §3.6's own next paragraph, twenty lines below,
  says "so neither bound fires on any real dispatch at that commit, and no line is omitted";
- on §7.3's 141-record fixture, `maxEntries` **binds first** — §7.3 as rewritten says "at 141 records
  `maxEntries` 70 **binds first**, forcing at least 71 omissions before the byte bound is reached".

So the document now asserts "`maxBytes` binds first in every case" and "`maxEntries` 70 binds first"
about the same defaults, three sections apart. The sentence is a recital of why an earlier draft's
inertness claim was falsified, and that history is worth keeping — but as written it is present-tense
and universal, not tensed to the retired default, so a reader arriving at §3.6 first takes the wrong
model of which bound governs into §7.3 and into the PLAN task that writes that oracle. The fix is one
clause: attribute the falsification to the then-current `8000` bound, e.g. "…was wrong because at
C-5's then-current `8000` default `maxBytes` bound first in every case (allowance 6,800 against
10,859 index bytes), and D-5 charges framing to it" — leaving the `maxEntries`-half-is-sound sentence
before it untouched. Traces to REQ C-5 and REQ G-1.

**Scope discipline held.** I checked for product decisions taken in this document under cover of the
erratum. There are none: §3.6's §4.3-quoted budget, D-5, D-7 and D-10 are unchanged in substance, the
default is explicitly stated as "never this spec's to set … settled upstream", and no section outside
the erratum's declared list moved. The recital's promise — "no approved decision is re-litigated" —
holds on the bytes.

## Interfaces

**§5.3's config recital against REQ C-3/C-5.** The `.claude/pdlc.config.example.json` recital now
reads `"decisionLedger": { "enabled": false, "maxEntries": 70, "maxBytes": 12500 }`. Diffed key by
key against REQ C-5's table at HEAD: `enabled` `false`, `maxEntries` `70`, `maxBytes` `12500` — three
keys, no fourth, matching C-3's exhaustive enumeration. The example-file test described alongside it
is unchanged and still asserts the file parses and the defaults are the recited ones, so the recital
stays falsifiable rather than becoming prose.

**§4.3's citation format and framing budget.** Untouched by this erratum except for the consequence
sentence, which now charges the ≤1,200-byte budget against **~4,995** bytes of headroom *and* against
the 441-byte margin by which `M-6b`'s worst standing case clears the bound. Naming both is the right
call under the product lens: the 441 is the binding one, so a future author who raises
`DECISION_LEDGER_RULE_TEXT`'s budget is told the real cost rather than a comfortable one. The
"re-opens §3.6's arithmetic deliberately rather than quietly raising the literal" clause replaces a
now-stale pointer at ERR-2, correctly, since ERR-2 is closed.

**§7.6's AT-01 note.** The old justification ("the 45/48-line sets would be unproducible at the
default") expired with the default. The replacement does not paper over that — it says plainly that
the sets *are* producible at 12,500 and re-grounds the explicit bounds on AT-01's subject being the
recognition rule, with the 441-byte margin as the reason the expected sets must not depend on the
bound. That is a stronger argument than the one it replaces and it preserves FSPEC AT-01's intent
unchanged.

## Data Model

**`DecisionLedgerConfig` diffed against REQ C-5 at HEAD.** Per my role's contract-fidelity duty I
diffed every value, range and type in §4.1 against C-5's rows:

| §4.1 | REQ C-5 (HEAD) | Verdict |
|---|---|---|
| `enabled: boolean` — default `false` | `false`, A-2 rollout config-gated | agrees |
| `maxEntries: number` — non-negative integer, default `70` | `70`, **non-negative integer**, floor `M-6b`/`M-6c` | agrees |
| `maxBytes: number` — non-negative integer, default `12500` | `12500`, **non-negative integer**, `M-7b`/`M-7c` | agrees |

Three keys, `Object.freeze`d, no fourth — C-3's exhaustive enumeration preserved. The previous
divergence (positive-integer label vs `maxEntries: 0` as a valid admits-nothing value, FSPEC E-7) is
gone in the right direction: REQ v1.8 retyped upstream, and §4.1's comment now claims **agreement**
with C-5 rather than divergence from it. I verified that claim against C-5's row text rather than the
TSPEC's summary of it — the row says "**Non-negative**: `0` is a valid admits-nothing value, not a
malformed one falling back to `70`", which is E-7's requirement verbatim in intent. No unmarked
internal variant, no narrowed range.

**Derived quantities.** The three new arithmetic constants — `11,300`, `~4,995`, `441` — are
internally consistent (`12500 − 1200 = 11300`; `11300 − 6305 = 4995`; `12500 − 12059 = 441`) and rest
on measurements this document already owned (`6,305` and `10,859` from §3.6's table, unchanged) plus
Baseline v1.2's `M-7b`/`M-7c`. I checked the one place these could have collided with upstream:
Baseline `M-7c` states 12,500 clears `M-7b`'s **9,296 substance bytes** by 3,204, a ~50-byte-per-record
framing allowance; this TSPEC's rendering spends 10,859 − 9,296 = 1,563 (≈25 bytes/record) plus the
≤1,200 block framing, which sits inside `M-7c`'s allowance. `M-7d` explicitly delegates the rendering
framing to the consuming TSPEC, so this is the intended division of labour, not a contradiction.

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
