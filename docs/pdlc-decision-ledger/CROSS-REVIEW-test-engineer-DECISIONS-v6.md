# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.5)
**Date:** 2026-08-30
**Iteration:** 6
**Round type:** delta re-review under DECISION FREEZE
**Last reviewed commit:** `6b328e16a29bfc9a1d8fa16c01f1e2974d81fc49` (v5)
**Reviewed at:** `420edb564f4e0453c216f15d91fd8dd36f83307c`

## Context

**What moved in the document.** `git diff 6b328e16..HEAD` over the document is 50 insertions /
12 deletions across four commits (`29cd33a64`, `63f205e89`, `106531d42`, `420edb564`), all of
them DEC-DECLEDGER-16 and its header: the version bump to **v1.5** plus its changelog entry, the
narrative restatement of the provenance rule, the `## Decision` row, the PROPERTIES
`## Consequences` row, and the DEC-DECLEDGER-16 re-evaluation trigger. Nothing else in the file
moved — no other decision row, no other consequence, no risk, no trigger.

That is exactly the scope round 5 asked for, from both reviewers: my v5 F-02 (carried from v4)
and `pm-review`'s matching Medium said the ceiling rule was stated **positionally** ("only on the
larger side of an inequality") and so could not be run as a mechanical authoring check. The edit
answers that finding and declines to open anything else, which is what the freeze requires.

**What moved upstream.** Between `6b328e16` and HEAD, `TSPEC-pdlc-decision-ledger.md` advanced
eight commits from **v0.9** to **v1.2** (`452d72c07` erratum v1.0 homing the census constants,
`933fab196`, `36889291d`, `224d0bff1`, `54b17bf84` v1.1, `d7aee41ec`, `a3715ae0e`, `3a17387d6`
v1.2). REQ and FSPEC did **not** move: HEAD digests are `sha256:ce6b133f…3c7b7c` and
`sha256:2bd5c3ef…5aed39`, byte-identical to the `UPSTREAM-STATE` anchors v5 recorded. TSPEC's
digest is now `sha256:fc57bc56…c27504`.

So this round has two jobs, not one: check that the delta lands its own finding without breaking
an approved section, and check that a three-version upstream move has not silently falsified a
claim the document makes about TSPEC. The second is the larger risk — the delta's new prose is
unusually specific about what TSPEC HEAD contains, and the census-constant erratum (v1.0) changed
the very §7.3 machinery the document's DEC-DECLEDGER-09 row points at.

## Options Considered

**(a) Read the delta only, trust the v5 verification of upstream.** Rejected. v5's verification
log was taken against TSPEC **v0.9**; HEAD is **v1.2** and one of the intervening commits is an
*erratum* that moved census constants out of the owned-declaration list. A delta round that reads
only the document's own bytes would approve a document whose upstream citations were re-checked
three versions ago.

**(b) Re-litigate the sections the upstream move touched.** Rejected under freeze. Sections
approved in iterations 1–5 are not reopened, and I open no new decision here.

**(c) Read the delta closely, then re-verify on HEAD every claim the delta newly asserts about
TSPEC, plus the pre-existing claims the upstream move could have falsified.** Chosen. Every row
below was checked by reading the TSPEC line at HEAD, not by trusting either document's prose.

### Verification log — claims the delta newly makes

| Claim in the v1.5 delta | Checked at TSPEC HEAD (v1.2) | Verdict |
|---|---|---|
| "the asserted form on disk is the subtraction one (`10,859 ≤ maxBytes − 1200`)" | `TSPEC:731` (§3.6) and `TSPEC:1351` (§7.3 conjunct (6)), both literally `10,859 ≤ maxBytes − 1200`; conjunct (2)'s sibling at `TSPEC:1306` is `6,305 ≤ maxBytes − 1200` | **Holds** |
| "no addition form is asserted anywhere" | `grep -n "10,859 + 1,200 = 12,059"` returns `TSPEC:253` and `TSPEC:745` only, both prose; `TSPEC:1344-1353` (conjuncts (5)–(6)) assert the 10,859 index literal and the subtraction margin, never the sum | **Holds** |
| "carries `10,859 + 1,200 = 12,059` only as prose recounting `M-6b`'s worst standing case (§3.6, and the revision history's recital)" | `TSPEC:745` sits inside `### 3.6` (heading at `TSPEC:646`) and reads "the worst standing case (10,859 + 1,200 = 12,059) with headroom"; `TSPEC:253` is the v0.5 changelog recital, same labelling | **Holds** |
| "the three prose sites" (changelog count) | Two sites carry the literal sum expression; a third, `TSPEC:208`, states it in words ("12,059 is `10,859 + the full 1,200-byte framing ceiling`") in the v0.7 recital. The count is defensible on the looser reading and wrong on the strict one | **Holds on the stated reading** (F-02, Low) |
| "§7.3 stat[es] in terms that the block total is deliberately *not* an equality" | `TSPEC:732-734` (§3.6) and `TSPEC:1344-1349` (conjunct (5)): "This is deliberately *not* an equality over the whole 12,059-byte block" | **Holds** |
| "pinning the two halves of `12,059 ≤ 12,500` separately where each is measurable" | `TSPEC:1353-1355` (conjunct (6)): "the two halves of `12,059 ≤ 12,500` are each asserted where they are measurable"; restated at `TSPEC:1802` (§9.1) | **Holds** |
| `10,859 + 1,200 ≤ 12,500` ⟺ `10,859 ≤ 12,500 − 1200` (the substitution argument) | Arithmetic is sound and matches the shipped form; TSPEC asserts the right-hand form, which the corrected rule still admits | **Holds** |

### Verification log — pre-existing claims the upstream move could have broken

| Claim in the document (unchanged bytes) | Checked at TSPEC HEAD (v1.2) | Verdict |
|---|---|---|
| DEC-DECLEDGER-09 row's `// === DECISION LEDGER WIRING START/END ===` region and "§7.x's census slices" | `TSPEC:425` names both sentinels and calls the region distinct from the learnings-injection one; `TSPEC:1448` re-specifies the scanned source as the module minus every owned declaration body **plus the `main()` wiring block between those two sentinels** | **Holds** |
| `ERR-1` / `ERR-2` resolved upstream, `ERR-3` / `ERR-4` still open | `TSPEC:1820` (ERR-2 RESOLVED, REQ v1.8), `TSPEC:1858` (ERR-3 open), `TSPEC:1867` (ERR-4 open), `TSPEC:279` "ERR-1…ERR-4 stand" | **Holds** |
| Corpus literals 6,305 / 10,859 / 12,059 / 441, allowance `12500 − 1200 = 11,300`, ~4,995 headroom, `maxEntries` 70 clearing the 63-record floor | `TSPEC:691-692`, `TSPEC:701`, `TSPEC:725-731`, `TSPEC:1049`, `TSPEC:1300`; the v1.2 changelog (`TSPEC:22`) re-states the four literals as unchanged | **Holds** |
| Every surviving mention of `8000` is tensed as retired (DEC-DECLEDGER-10/-12 discharge list, `DECISIONS:398`) | `TSPEC:216`, `:244`, `:658-659`, `:689`, `:745`, `:1820-1824` — all past-tensed or explicitly "retired" | **Holds** |
| No claim in this document about the size of the owned-declaration list | `grep -n "fifteen\|fourteen\|OWNED_DECLS"` over the document returns nothing, so TSPEC's fifteen→fourteen census correction (`452d72c07`) cannot falsify it | **Holds — nothing to break** |

## Decision

**Approve with minor changes.** No open High finding, old or new. The delta lands the finding it
was dispatched for, breaks nothing that was approved, and — checked line by line at HEAD — makes
no false claim about a TSPEC that moved three versions underneath it.

Three things I looked at specifically, because each is where this delta could plausibly have gone
wrong:

1. **The corrected rule is now runnable as an authoring check, which is the whole point of the
   finding.** The v4/v5 defect was not that the rule's intent was wrong — it was that a positional
   predicate gives two different answers to the same claim depending on how the comparison happens
   to be typed, so no author and no test could apply it mechanically. The restatement replaces
   position with substitution ("a ceiling may enter a claim only where substituting the true —
   necessarily smaller — drafted value **preserves** that claim"). That is a decision procedure:
   take the site, substitute a smaller value for the ceiling, see whether the claim survives.
   `10,859 + 1,200 ≤ 12,500` survives, `10,859 ≤ 12,500 − 1200` survives, `10,859 + 1,200 = 12,059`
   does not. One answer per site, and the answer no longer depends on transcription order. From a
   test-authoring lens this is the difference between a rule PROPERTIES can encode and a rule a
   reviewer has to arbitrate.

2. **The scope predicate closes the prose-versus-assertion hole without opening a licence.** The
   rule now binds "assertions and pinned expected values, plus prose stating a figure as a standing
   fact", and explicitly excludes prose recounting a retired figure or a labelled worst-case upper
   bound. I checked this against the actual sites rather than against the claim: the two surviving
   `10,859 + 1,200 = 12,059` sites in TSPEC (`TSPEC:253`, `TSPEC:745`) are both labelled worst-case
   recounts, and the two assertion sites (`TSPEC:1351`, and conjunct (2)'s sibling at `TSPEC:1306`)
   are both subtraction-form comparisons. So the corrected predicate classifies TSPEC HEAD as
   conformant *and* would still redden the round-6/-7 defect (`TSPEC:207-211` records exactly that
   defect: conjunct (5) once asserted the block equal to 12,059). The rule has not been widened
   into vacuity to make HEAD pass — the falsifier it exists for is intact.

3. **The re-evaluation trigger no longer licenses un-retiring `12,059`.** This is the one place a
   "scope predicate" edit could have quietly created a hole: once the framing constants are measured,
   the ceiling re-classes to a measurement and equalities become assertable. The revised trigger
   bounds that to "**over that newly measured framing size only**" and says in terms that 12,059 is
   `10,859 + the ceiling`, so a block total must be re-derived and re-transcribed, "never un-retired
   as written". A future author reading only the trigger row cannot restore the retired literal by
   citing it. That closure was `pm-review`'s Q-01 and it is answered where the answer is load-bearing
   — in the trigger, not only in the narrative.

### Carried finding from v5

My v5 F-01 (the document names TSPEC's HEAD version `v0.7`) is **still open, and is now two
versions staler**: `DECISIONS:98` and `DECISIONS:398` both read "TSPEC **v0.7**", while TSPEC's
header (`TSPEC:15-19`) reads **1.2**. This is inherited, not delta — the edit under review did not
touch either line, and the freeze does not oblige it to. It remains non-gating for the same reason
it was non-gating in v5: the three pins the sentences actually carry (REQ **v1.9** / FSPEC **v1.3** /
Baseline **v1.2**) are still exact at `TSPEC:9` and `TSPEC:11`, the arithmetic those sentences
license is still true at HEAD (verified above), and the stale literal carries no figure. It is a
visible, self-announcing staleness rather than a silent numeric one. Re-recorded below as
`inherited` so this round routes rather than halts.

Note for whoever fixes it: the `DECISIONS:36` occurrence is inside the **v1.4** changelog entry and
is correct as history — a changelog records what was true when it was written. Only `DECISIONS:98`
(the "at HEAD (…)" statement) and `DECISIONS:398` (the discharge record) assert current position and
need the re-pin.
