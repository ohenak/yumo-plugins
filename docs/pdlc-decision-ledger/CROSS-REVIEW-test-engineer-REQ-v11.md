# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.10)
**Date:** 2026-08-31
**Iteration:** 11
**Round type:** Delta confirmation on a previously approved REQ (frozen round)

## Scope

The erratum under confirmation is `d16ea5c50..e7035da2e`, minting REQ **v1.10**. Three routed
items, all raised in round 9:

| Item | Where it lands |
|---|---|
| C-5's `maxBytes` rationale attributed the whole 3,204-byte slack to per-record framing | `REQ:194` C-5 row, edited |
| Header *Cross-Reviews* row named v1–v6 while later rounds exist | `REQ:13`, edited |
| v1.9 note named `§1` as a swept site; the re-pinned line sits in `§2` G-1 | `REQ:35`, edited |

Plus the item this confirmation was dispatched against: the stale `TSPEC v0.7` literals in the
`§ Context` passage and the DEC-DECLEDGER-10/-12 re-evaluation-trigger row, against a TSPEC whose
HEAD is **v1.2**. The REQ's disposition of that item is a **routing**, not an edit (`REQ:29-31`).

I read the diff, then verified each claim against the tree rather than the commit message, and
re-read the two upstreams this REQ leans on — the corpus Baseline and the routed item's actual
loci — at their current bytes.

## Did the routed item land?

**The routing itself is correct.** `REQ:29-31` claims the stale literals "live in
`DECISIONS-pdlc-decision-ledger.md` ... not in this REQ, which names no TSPEC version anywhere".
Both halves check out:

| Claim | Verification | Verdict |
|---|---|---|
| The REQ names no TSPEC version | `grep -n "v0\.7\|TSPEC v"` over the whole REQ returns exactly one line — `:30`, the routing sentence itself, which *mentions* the literal as the name of the defect rather than *using* it as a pin | **True** |
| The literals live in DECISIONS | `DECISIONS:36`, `:98`, `:398` each carry `TSPEC **v0.7**` | **True** |
| TSPEC HEAD is not v0.7 | `TSPEC:17` reads `| Draft | se-author | 1.2 | 2026-08-30 |` | **True — the item is real** |
| The derived figures still agree | Baseline `M-7b` = 9,296 / 63 records, `M-7c` = cap 12,500 clearing by 3,204, both at `Verified at 8c673a09f`; `12500 − 1200 = 11,300` unchanged | **True — a version label is stale, no measured value moved** |

So declining to edit is the right call, and the substantive claim the stale figures support still
holds. **But the routing pointer under-enumerates its own sweep sites, in two ways.**

**First, there is a third locus the pointer does not name.** `REQ:30-31` names two — `§ Context`
and the DEC-DECLEDGER-10/-12 row. `## Context` begins at `DECISIONS:51`, so `:98` and `:398` are
inside the two named loci, but **`DECISIONS:35-36` is not**: it is the v1.4 changelog note, above
`## Context`, and it reads "`TSPEC-pdlc-decision-ledger.md` **is now v0.7**" — present tense, a
live claim about HEAD, not a tensed historical record. An se-author sweeping exactly the two named
sites leaves it stale and buys another erratum round. I held the v1.8 cascade pointer to **set
equality rather than containment** at v10 and praised it for surviving that bar; the same bar
applied here returns two of three.

**Second, this erratum staled a second member of the same tuples.** `DECISIONS:98` and `:398` do
not pin TSPEC alone — they pin a HEAD tuple, `(TSPEC v0.7, REQ v1.9 / FSPEC v1.3 / Baseline v1.2)`.
FSPEC is `v1.3` at HEAD (`FSPEC:17`) and the Baseline is `v1.2` (`baseline:7`), so those two are
current. `REQ v1.9` was current when the item was raised and stopped being current **when this
commit minted v1.10**. The routing note characterises the routed defect as "the stale
`TSPEC v0.7` literals", which now understates the sweep by one literal that this very edit created.

Neither point contests the routing. Both are about the completeness of the instruction handed to
the next author, so both are Medium, not High: no acceptance criterion, threshold or oracle moves
on either.

## Did the delta break anything previously approved?

No. The edit is four lines across two commits: one header row, one changelog paragraph, one word
inside the v1.9 note, one clause inside C-5's `maxBytes` rationale. I checked the three that could
carry weight.

**The `§1` → `§2 G-1` correction is exact, and I confirmed it in both directions.** `grep -in
baseline` over the whole REQ returns the pin at `:105`, which sits between `## 2. Goals` (`:86`)
and `## 3. Non-Goals` (`:133`) — inside G-1, as the corrected note now says. `## 1. Problem /
Context` (`:57`–`:85`) carries no Baseline version literal at all, so the old pointer named a
section with nothing to sweep. The v1.9 note's other named site, `§5` REQ-DECLEDGER-01, reads
"at **v1.2**'s `Verified at` commit" at `:216-217` — my earlier grep missed it only because the
literal is possessive (`v1.2's`). Both swept sites are real and both read v1.2.

**C-5's re-worded clause is more faithful to upstream than what it replaced, not less.** Before:
"3,204 — 50 bytes per record of framing allowance". After: "3,204 — the allowance covering the
rendered index's per-line *and* block framing, which is the form C-5 bounds". The Baseline's
`M-7c` does say "50 bytes per record of **per-line** framing allowance", so the old wording was a
verbatim transcription — but of a figure that C-5 then applies to a wider object. C-5's own next
paragraph (`:196-197`) scopes the bound to "the rendered index text alone — the index block **as
it appears in the prompt**", which includes block framing, not per-line framing only. The old
sentence therefore promised 50 bytes/record of headroom against a bound that has to pay for the
block as well. `M-7d` settles who may say this: substance bytes are "a floor, not a rendering ...
a consumer sizes against `M-7b` and **declares its own framing allowance on top**". The REQ is
that consumer, and the attribution is placed correctly — "the Baseline's `M-7c` records that
12,500 clears ... by 3,204" is M-7c's claim, and the clause after the em-dash is the REQ's own.
The number a fixture would transcribe (`12500`) is untouched.

**Nothing testable moved.** `12500`, `70`, both `non-negative integer` types, the fail-open
cascade, REQ-DECLEDGER-01's set-equality-of-rendered-lines oracle, -02's byte-identity fixture,
-07's `0` and over-long cases, -08's two-run oracle are all byte-identical to the version I
approved. No AC, no threshold, no `M-*` id, no `Verified at` commit changed.

## Disposition of my v10 findings

| v10 ID | Severity | Status at v11 |
|---|---|---|
| F-01 | Medium | **Closed.** The Baseline's *Cited by* row (`baseline:6`) now reads "(§2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04, **§6 R-5**, §7 O-1, §7 O-5, **§7 O-6**, **§7 Assumptions A-1**)". I re-derived the required set rather than accepting the three additions: every `M-*` citation in the REQ is at `:105` (§2 G-1), `:193`/`:194` (§4 C-5), `:216` (§5 REQ-DECLEDGER-01), `:266` (§5 REQ-DECLEDGER-04, between `:254` and `:270`), `:351-352` (§6 R-5, the `M-6d`/`M-7d` site I named), `:367` (§7 O-1, between `:358` and `:372`), `:390` (§7 O-6) and `:399-400` (§7 Assumptions A-1). Set equality holds: the row's REQ-side list is now exactly the set of citing sites, with no member missing and none invented. My v10 wording named "§1's pin" — that was the same off-by-one-section error the v1.9 note carried, and the correct anchor is §2 G-1, which the row already listed |
| F-02 | Low | **Partially addressed, still open.** `REQ:13` moved from `v{1,2,3,4,5,6}` to `v{1,2,3,4,5,6,7,8,9}`, but `CROSS-REVIEW-software-engineer-REQ-v10.md` and `CROSS-REVIEW-test-engineer-REQ-v10.md` both exist on the branch and both are dated 2026-08-28, two days before this edit. The changelog's own account — "named v1–v6 while v7–v9 exist" — is the same enumeration stopping one round short. Re-raised as F-03 below |
| F-03 | Low | **Closed.** The version table now reads `1.10 | 2026-08-31`-era (`| Draft | pm-author | 1.10 | 2026-08-30 |`) with a v1.10 changelog paragraph, so the header again describes the file it heads |

## What I found by re-reading upstream at HEAD

Per DEC-ERR-03 I re-read the upstream this REQ leans on at its current bytes, not at the bytes it
was approved against. The REQ's measured upstream is `docs/_constraints/pdlc-decision-corpus-baseline.md`,
pinned **v1.2**.

**Every `M-*` value the REQ transcribes still says what the REQ says it says.** `M-7b` = 9,296
substance bytes over 63 records, mean 148, max 238; `M-7c` = a 12,500 cap clears M-7b by 3,204 and
8,000 sits below M-7b outright; `M-6b` = 63 with `M-6c` recording 70 clearing it by 7; `M-7e` =
measured at the same `Verified at` commit as the rest, `8c673a09f`. C-5's row, R-5, O-1, O-6 and
A-1 are faithful compressions of those at v1.2's current bytes. Nothing the REQ leans on has been
re-measured out from under it.

**One thing about the pin's own integrity is worth recording.** The Baseline declares "Consumers
cite this file **at its `Version`**; a content change that is not accompanied by a version bump is
itself a defect" (`baseline:26-27`). Its bytes have changed twice since `efbf3dad9` minted v1.2 —
`4f03479e1` and `5af3ebe82`, both editing the *Cited by* row, the second at my own v10 request —
with `Version` held at 1.2 throughout. Two clauses in the same header disagree about whether that
is allowed: the change-control sentence says "a content change", unqualified, while the *Cited by*
row's own sentence licenses the edit ("a new citation is added here in the same edit that mints
it"). I am recording this as **Low**, not Medium, and deliberately not as a regression:

- the change-control paragraph scopes ownership to "§1–§8 entire ... **owned normative prose**",
  and the header table is above §1, so the row is plausibly outside what the rule governs;
- no measured value, no `M-*` id and no `Verified at` commit moved, so nothing a test transcribes
  is ambiguous at v1.2;
- the Baseline states outright that "no table here is transcribed row-for-row into a downstream
  document, so **no downstream oracle ranges over this file's markup**" (`baseline:24-25`), which
  is what keeps this a documentation-provenance point rather than a fixture-identity one.

The durable form of the point is a wording one, so I have tagged it `Cross-Feature`-adjacent in
substance but `inherited`/`nonlocal` in this round's axes: whichever clause is meant to govern,
the two should not be able to be read against each other by the next consumer who edits that row.

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
