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

## Consequences

- **For te-author (PROPERTIES).** The `## Consequences` PROPERTIES row is now the operative
  instruction for encoding DEC-DECLEDGER-16, and it is written in a form a property can implement:
  admitted comparisons are the ones that survive substituting a smaller value for 1,200, and the two
  halves of `12,059 ≤ 12,500` are pinned separately per TSPEC §7.3's conjuncts (5)–(6). Encode the
  substitution test, not a string match on "larger side" — a property that greps for a position will
  reproduce exactly the defect this round removed.
- **No erratum is owed upstream.** The only divergence found is the stale version literal in *this*
  document. TSPEC v1.2 is conformant to the corrected rule at every site checked, and TSPEC's own
  open item (its v1.2 changelog notes an unaddressed PM F-01 about `PLAN` v0.7's retired
  fifteen-member owned list) belongs to PLAN, not here — this document makes no owned-list-size claim
  for it to contradict.
- **Downstream re-pinning is a one-line job, not a decision.** When the freeze lifts, `DECISIONS:98`
  and `DECISIONS:398` re-pin to v1.2 in the same pass; nothing else in the document is coupled to the
  TSPEC version literal, which is itself a consequence of the v1.3/v1.4 choice to cite §-anchors and
  mechanisms rather than transcribe TSPEC line positions.

### Deferred observations (freeze in force — recorded, not decided)

DEFERRED: Re-pin the two current-position `TSPEC v0.7` literals (`DECISIONS:98`, `DECISIONS:398`) to `v1.2` on the next edit this document has reason to make; leave the v1.4 changelog occurrence as history.
DEFERRED: In the v1.5 changelog, "the three prose sites carrying `10,859 + 1,200 = 12,059`" counts two literal sites plus one worded site (`TSPEC:208`); say "three sites, two of them the literal sum" if the sentence is ever touched.
DEFERRED: At promotion of DEC-DECLEDGER-16 to `docs/_constraints/DOMAIN-CONSTRAINTS.md`, carry the substitution test as the normative wording and the position-based phrasing not at all, per the trigger row's own instruction.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The document still names TSPEC's HEAD version `v0.7`; HEAD reads `1.2`.** Carried from v5, now two versions staler after the v0.9→v1.2 upstream move. `DECISIONS:98` ("at HEAD (TSPEC **v0.7**, REQ **v1.9** / FSPEC **v1.3** / Baseline **v1.2**)") and `DECISIONS:398` ("at TSPEC v0.7 (REQ v1.9 / FSPEC v1.3 / Baseline v1.2)") vs `TSPEC:15-19`. The three co-stated pins are still exact (`TSPEC:9`, `TSPEC:11`) and every figure and mechanism these sentences license was re-verified true at HEAD, so only the literal is stale. The edit under review did not touch these lines. | § Context (v1.4 re-grounding); Re-evaluation triggers, DEC-DECLEDGER-10/-12 row |
| F-02 | Low | Local | **The v1.5 changelog says "the three prose sites carrying `10,859 + 1,200 = 12,059`"; exactly two sites carry that expression literally** (`TSPEC:253`, `TSPEC:745`). A third states the same sum in words at `TSPEC:208` ("12,059 is `10,859 + the full 1,200-byte framing ceiling`"), so the count is right on a semantic reading and off by one on a textual one. The substantive claim — that every such site is a labelled recount and none is asserted — is true at HEAD. Delta-introduced but immaterial to the decision. | § Revision history, v1.5 entry |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(carried, still TSPEC-side and not a DECISIONS edit)* Is §7.3's 41-id / 6,305-byte project-level pin re-derived from the same source §7.3's per-file digest guard uses, or hand-transcribed? Unchanged in force by the v1.0–v1.2 errata. |
| Q-02 | At promotion, does DEC-DECLEDGER-16's substitution test want a worked counter-example table (admitted / refused) in `DOMAIN-CONSTRAINTS.md`? The three cases already in the narrative would carry over verbatim and save the next feature re-deriving them. |

## Positive Observations

- **The edit answers the finding and stops.** 50 insertions across four commits, every one of them
  inside DEC-DECLEDGER-16's four sites and the header. Under a decision freeze that is precisely the
  right shape: a round that also "improved" a neighbouring row would have forced a re-review of
  sections approved four iterations ago.
- **The correction is a decision procedure, not a better sentence.** The v4/v5 finding could have
  been discharged by rewording — instead the rule was re-founded on substitution, which is the
  property a mechanical check needs. The document even names why the old form was wrong ("a
  positional 'larger side only' rule would have admitted the first and rejected the second for no
  reason a substitution can name"), so the next reader cannot reintroduce the positional form by
  accident.
- **The trigger row was hardened at the same time as the rule.** Fixing the predicate without
  fixing the re-classing trigger would have left the round-6/-7 literal recoverable through the back
  door. Both `pm-review`'s Q-01 and my Q-02 were answered inside the artifact rather than in a
  reply, which is where a downstream author will actually read them.
- **The document again survived a multi-version upstream rewrite with no false claim.** TSPEC moved
  v0.9 → v1.2 including a census-constant erratum that re-specified §7.3's scanned-source slicing, and
  every load-bearing citation — the wiring sentinels, the corpus literals, the erratum ledger, the
  retired-`8000` tensing — still reads true at HEAD. That is the dividend of citing mechanisms and
  §-anchors instead of transcribing upstream prose, and it is now three rounds of evidence for it.

## Recommendation

**Approved with minor changes**

No open High finding. The delta lands round 5's single Medium at all four of its sites, introduces
no defect in the sections it touched, and — verified line by line against a TSPEC that advanced three
versions — asserts nothing about upstream that is false at HEAD. Two non-gating findings are
recorded: F-01, the inherited and now two-versions-stale `TSPEC v0.7` literal, whose surrounding
claims all remain true; and F-02, a Low off-by-one in the changelog's site count whose substantive
claim holds. Both are fixed in a single line each at the next edit this document has reason to make;
the freeze forbids opening either here.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | Document names TSPEC's HEAD version `v0.7` at `DECISIONS:98` and `DECISIONS:398`; `TSPEC:15-19` reads `1.2`. The three co-stated pins (REQ v1.9 / FSPEC v1.3 / Baseline v1.2) and every figure these sentences license verify true at HEAD; only the version literal is stale. | § Context (v1.4 re-grounding); Re-evaluation triggers, DEC-DECLEDGER-10/-12 row |
| F-02 | Low | delta | local | v1.5 changelog says "the three prose sites carrying `10,859 + 1,200 = 12,059`"; two sites carry it literally (`TSPEC:253`, `TSPEC:745`), a third states it in words (`TSPEC:208`). The substantive claim (all are labelled recounts, none asserted) is true. | § Revision history, v1.5 entry |

FINDING: Medium | inherited | nonlocal | § Context (v1.4 re-grounding) and Re-evaluation triggers DEC-DECLEDGER-10/-12 row | document states TSPEC's HEAD version as v0.7 at DECISIONS:98 and DECISIONS:398 while TSPEC:15-19 reads 1.2; the co-stated REQ v1.9 / FSPEC v1.3 / Baseline v1.2 pins and all licensed figures verify true at HEAD
FINDING: Low | delta | local | § Revision history, v1.5 entry | changelog says "three prose sites" carrying 10,859 + 1,200 = 12,059 but only TSPEC:253 and TSPEC:745 carry the literal sum, TSPEC:208 states it in words; the substantive claim that none is asserted holds

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:5258096270693873ffc1a24cd4bfa542f540c143c4c16cd0aa5e512375584ca0
APPROVAL-HASH-NORMALIZED: sha256:0fd8d366b90ae632637920e6799e9baf31d2e1b0d8e4c1054f0366abaee25c17
REVIEWED-COMMIT: 420edb564f4e0453c216f15d91fd8dd36f83307c
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:fc57bc56e0b53ba00402555bcf4a71575ddf820796586607137fdd8ad4c27504
