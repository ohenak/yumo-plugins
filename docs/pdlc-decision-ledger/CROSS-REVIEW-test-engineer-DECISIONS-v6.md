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
