# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.5, erratum round 5)
**Date:** 2026-08-31
**Iteration:** 7
**Round type:** Delta confirmation (erratum)

## Overview

**Scope of this round.** A targeted erratum edit (`fb69424c3..7747eb78f`, five commits) against a
TSPEC I approved at v6. I did not re-review the document. I read the diff, verified the dispatched
item against the artefacts it claims, then — as `DEC-ERR-03` requires — re-grounded the TSPEC's
upstream citations on **REQ and FSPEC at HEAD**, not on the dispatched item list.

**The dispatched item is discharged.** The claim that §2.1 and §8/RK-1 "still list five" is itself
stale, and the v1.5 changelog says so rather than silently rewriting: §1, §2.1, §6.4, §7.3 and RK-1
all carry the sweep-derived **ten**, and §2.1's table names both sibling-feature document edits
(`docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26`; that feature's FSPEC §5.2 per-class
five → six) as explicit `K-7`-owned rows. I checked the dispatch's "`K-1` derives nine" against
`DECISIONS-pdlc-stats.md` at HEAD: `K-1` says **ten** and partitions all ten across `K-1`/`K-3`/
`K-8`/`K-9`. The "nine" survives only as a superseded mention of Option A's pre-correction count.
TSPEC and DECISIONS agree. Nothing in the item list is outstanding.

**But the round does not pass.** The dispatched items are necessary, not sufficient. FSPEC moved
**v1.5 → v1.7** after the grounding TSPEC v1.4 recorded, and v1.7 rewrote the very `BR-16` passage
TSPEC §4.3 quotes as its authority — reversing the worked example's verdict. TSPEC §4.3 now
attributes to FSPEC a claim FSPEC explicitly denies, and states a falsehood about a real archive
path this feature's tests bind to. That is `F-01`, and it is **inherited**: the erratum edit did not
touch §4.3, and did not introduce the divergence. The v1.5 changelog's own attestation that upstream
"neither moved" is what let it pass unnoticed, and that claim *is* delta-introduced (`F-02`).

Both findings are recorded below with provenance and locality tags. The High is tagged `inherited`
deliberately: this is FSPEC-movement fallout that belongs back in the owning phase, not a defect the
erratum edit created, and it should route rather than halt.

## Architecture

### What the erratum edit changed

Five commits, four wording corrections in the body plus a changelog row. I verified each against the
artefact it describes rather than against the changelog's description of it.

| Edit | Claim | Verified at HEAD | Verdict |
|---|---|---|---|
| (a) §1 cost sentence | The sibling-feature carve-out was joined to the ten with "including", placing *inside* the ten an edit §2.1 and RK-1 place *outside* it; corrected to a coordinating "and … that sits **outside** that ten" | §2.1's table does list the two `docs/completed/pdlc-engine-distribution/` rows below the ten in-repo rows, and `K-1`'s partition in DECISIONS covers sites 1–10 only, assigning the sibling edits to `K-7` | Correct, and it removes a genuine scoping contradiction |
| (b) RK-1 opening clause | Same mis-scoping, corrected the same way | RK-1 now reads "the ten-site vendoring co-change (§2.1), together with the two sibling-feature document edits that sit **outside** the ten (§2.1's last two rows, owned by `DEC-STATS-01`'s `K-7`)" | Correct, and consistent with (a) |
| (c) §6.4 "four script-side enumerations" | Renamed "the four enumerations `assertAdditiveOnly` reads", because three sit under `pdlc/engine/scripts/` and the fourth is `_tspec-packed-set.mjs` under `__tests__/` | `loop-distribution.test.js:137,145,153,166` — four `assertAdditiveOnly` calls reading `../scripts/prepack.mjs`, `../scripts/publish-preflight.mjs`, `./_tspec-packed-set.mjs`, `../scripts/fixture-machine.mjs`. `_tspec-packed-set.mjs` resolves to `pdlc/engine/__tests__/` | Correct. The old name was factually wrong about one of the four; the new one names the subset by its falsifier |
| (d) §2.1 `learningsPremises.test.js` row | Now quotes P-1's shipped title verbatim | `pdlc/workflows/__tests__/learningsPremises.test.js:78` — `test("MODULE_NAMES is exactly the four canonical workflow modules", …)`. The TSPEC quotes this string character-for-character | Correct. A co-change grep for the quoted phrase now resolves; the prior paraphrase ("exactly four workflow modules") would not have |

### Does the delta break anything previously approved?

No. All four edits are scoping or citation corrections. I confirmed no count, behavioural claim,
type, signature, oracle or code sketch moved: the diff touches the changelog block, one clause in
§1, one table cell in §2.1, one sentence in §6.4 and one clause in RK-1's risk cell. The `ten`, the
`4 + 15 + 6 + 1` re-baseline, the `5 → 6` derived class-size assertion and P7-02's
`vendoredClassWord` ternary arm are all unchanged. Nothing I approved at v6 regressed.

### Where the round fails: upstream moved and §4.3 did not

TSPEC v1.4's changelog recorded "**Upstream moved: FSPEC v1.4 → v1.5.** Re-grounded first." Since
that grounding, FSPEC has advanced to **v1.7** across three commits (`ae7eb8f1a`, `a81a3c45c`,
`d3843cfe7`). v1.6 and v1.7 both edited `BR-16` — the rule TSPEC §4.3 leans on most heavily.

FSPEC `BR-16` at HEAD (`FSPEC-pdlc-stats.md`, §4.2) now reads:

> A directory whose only `CROSS-REVIEW-` basenames are the out-of-catalogue
> `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files BR-06 reports as malformed reports `harvested`, not a
> measured ratio. That basename shape is cited from `docs/completed/pdlc-advisory-wave-gate/`, which
> carries four of them **alongside** grammar-matching cross-reviews and so reports a measured ratio
> itself; only the shape is borrowed, not the verdict.

TSPEC §4.3 still says FSPEC "names the `docs/completed/pdlc-advisory-wave-gate/` shape — a harvested
directory whose only `CROSS-REVIEW-` basenames are the out-of-catalogue
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` form — as reporting `harvested`."

FSPEC v1.7 added its second sentence specifically to deny that reading. The ground truth agrees with
FSPEC: `docs/completed/pdlc-advisory-wave-gate/` holds **62** `CROSS-REVIEW-*` files, of which only
**four** are the out-of-catalogue `REVIEW` form; the other 58 match `BR-14`'s grammar. That directory
reports a **measured ratio**, not `harvested`. Detail in `## Test Strategy` below.

## Interfaces

### Upstream citation surface, re-checked at HEAD

`DEC-ERR-03` asks whether anything the TSPEC cites still says what the TSPEC says it says. I swept
every TSPEC anchor touched by FSPEC v1.6/v1.7 and by REQ at HEAD.

| Upstream anchor | What changed in FSPEC v1.6/v1.7 | TSPEC's citation | Still faithful? |
|---|---|---|---|
| `BR-16` worked example | The `pdlc-advisory-wave-gate` citation was re-scoped: the directory carries four out-of-catalogue files **alongside** grammar-matching ones and reports a **measured ratio**; only the basename *shape* is borrowed, not the verdict | §4.3 still calls it "a harvested directory whose only `CROSS-REVIEW-` basenames are the out-of-catalogue … form … as reporting `harvested`" | **No** — `F-01` |
| `BR-16` version pin | `BR-16`'s text changed at v1.6 and again at v1.7 | §4.3 cites "FSPEC `BR-16` **at v1.4**" | **No** — stale pin, folded into `F-01` |
| `BR-16` rule itself | Unchanged: harvested is evaluated over exactly the file set `BR-14`'s numerator sums; a basename failing a grammar contributes no bytes and counts as no file remaining | §4.3's rule statement and its `if (harvested && (crossReviews.length === 0 \|\| dodReviews.length === 0))` sketch | **Yes** — the implementable rule is correct and unmoved |
| `BR-16` precedence | Unchanged: harvested is tested **before** `BR-15`'s zero-denominator test | §4.3's ordering and §7.4's mutation row | **Yes** |
| §8 `BR-16` trace row | Gains `AT-15` (`BR-16` \| `AT-15, AT-17`) | §4.3 calls `AT-17`'s fourth leg "the boundary fixture" | **Yes, narrowly** — TSPEC never claims `AT-17` is the *only* test asserting `BR-16`, so this is an omission rather than a misstatement. Noted, not raised |
| `AT-15` neither-list | Gains a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file, pinning the `BR-16` half no test reached | TSPEC cites `AT-15` only for `EC-19`'s symbolic-link leg (§3, and §8's `EC-19 \| AT-15` row) | **Yes** — FSPEC §8 still maps `EC-19` to `AT-15 (symbolic-link member)`; TSPEC enumerates no neither-list of its own |
| §7.3 row `E-5` | Now cites `BR-27, AT-20, AT-26` instead of `BR-27, AT-19` | TSPEC §1 rests `E-5`'s settled zero-state row on the `EC-03`/`AT-26` argument | **Yes** — TSPEC already cites `AT-26`, matching the corrected trace. Its separate `AT-19` mentions are about `AT-19`'s own *Given*, not `E-5`'s trace |
| `pdlc-advisory-wave-gate` out-of-catalogue count | "two" corrected to "four" | TSPEC §7.2's `AT-09` row already asserts "the **four** `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` basenames" | **Yes** — TSPEC was already right here, which is what makes §4.3's survival an internal contradiction |
| REQ (`sha256:5f3e8051…`) | Unmoved; hash matches this round's dispatch pin exactly | `REQ-STATS-06` at v1.4 scoping, `C-4`'s process-side definition | **Yes** — verified by hash, no re-read divergence |

One row in this table is the whole of `F-01`. Everything else in TSPEC's upstream surface survived
the FSPEC v1.5 → v1.7 move intact, which is worth saying plainly: this is a narrow, single-passage
divergence, not a document that has drifted from its upstream.

## Data Model

### The changelog's grounding attestation

The v1.5 changelog states:

> Re-grounded on REQ / FSPEC HEAD first — both are the versions this round's dispatch pins
> (`REQ sha256:5f3e8051…`, `FSPEC sha256:c7d2c832…`) and neither moved since v1.4's grounding, so no
> upstream decision is absorbed.

Two halves, and they are not both true.

**The hashes are right.** `REQ-pdlc-stats.md` hashes to `5f3e8051…`, matching the dispatch pin
character-for-character. `FSPEC-pdlc-stats.md` hashes to `c7d2c832…`, matching both the changelog
and the approval-anchor commit `e4a92e4a6`. The document correctly identifies *which bytes* it is
grounded on.

**"Neither moved since v1.4's grounding" is false for FSPEC.** TSPEC v1.4's own changelog records
grounding on **FSPEC v1.5**. FSPEC's header at HEAD reads **v1.7**, and its changelog carries two
further revision entries (v1.6, v1.7) above the v1.5 one. FSPEC moved by two revisions between the
two groundings.

This is the mechanism that produced `F-01`. The erratum protocol's re-grounding step is the control
that catches upstream drift; an attestation that upstream did not move discharges that control
without exercising it. Had the round compared FSPEC v1.5 to v1.7, the `BR-16` rewrite — which is the
*first* substantive line of both revision entries — would have been the first thing it saw.

I am recording this separately from `F-01` and at **Medium**, not High, deliberately. Its own user
impact is a record-accuracy defect in a changelog, and the behavioural consequence it permitted is
already carried at full severity by `F-01`. Booking the same impact twice as two Highs would inflate
severity rather than calibrate it. But it is `delta`-provenance and `local` — the erratum edit wrote
this sentence — and it should be corrected in the same revision that fixes §4.3, so the next round's
grounding claim is one a reader can rely on.

## Test Strategy

### Ground truth for the disputed path

`docs/completed/pdlc-advisory-wave-gate/` at HEAD, counted by basename:

| Class | Count | Examples |
|---|---|---|
| `CROSS-REVIEW-*` total | 62 | — |
| Out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` | **4** | `CROSS-REVIEW-product-manager-REVIEW-v{1,2}.md`, `CROSS-REVIEW-test-engineer-REVIEW-v{1,2}.md` |
| Grammar-matching (`BR-14`'s `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`) | **58** | `CROSS-REVIEW-product-manager-TSPEC-v6.md`, `CROSS-REVIEW-software-engineer-REQ-v6.md`, … |

Under `BR-16`, `crossReviews.length` for this directory is 58, not 0. The harvested disjunct
`crossReviews.length === 0` does not fire. The directory reports a **measured ratio** — exactly what
FSPEC v1.7 says, and the opposite of what TSPEC §4.3 says FSPEC says.

### Why this is High and not a wording nit

TSPEC §4.3's *rule* is correct, and its code sketch is correct. If the divergence stopped there I
would raise it Low. It does not, for three reasons:

1. **It misdescribes a real path the suite binds to.** §7 pins tests against the live
   `docs/completed/` archive on purpose (`RK-4` accepts the coupling). A test author reading §4.3
   could reasonably write a real-path expectation that `pdlc-advisory-wave-gate` reports
   `harvested`. It would go red — and the red would look like a production bug, not a spec typo.

2. **It points at the wrong fix.** The natural way to make `harvested` true for that directory is to
   widen cross-review membership from `parseReviewFilename(...).ok` to a bare `CROSS-REVIEW-*` glob.
   That is precisely the mutation FSPEC's `BR-16` sentence exists to kill ("an implementation that
   globs `CROSS-REVIEW-*` into the process total fails here (`BR-14`, `BR-16`)"), and it would break
   `BR-14`'s numerator at the same time. A wrong worked example that recommends the wrong repair is
   materially more dangerous than one that is merely inert.

3. **TSPEC already contradicts itself.** §7.2's `AT-09` row asserts `TSPEC` row = `6` for this same
   directory, off `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v6.md` — a grammar-matching
   file — and lists the four `REVIEW` basenames as `malformed`. §4.3 and §7.2 cannot both be right
   about the same path, and §7.2 is the one that matches HEAD.

### What would close it

A minimal, local edit to the §4.3 sentence — no restructuring, no re-litigation of the rule:

- Say that `BR-16` cites `pdlc-advisory-wave-gate` for the **basename shape only**, and that the
  directory itself reports a measured ratio because it carries grammar-matching cross-reviews
  alongside the four out-of-catalogue ones. Mirror FSPEC's "only the shape is borrowed, not the
  verdict".
- Move the `harvested` verdict onto the construct that actually earns it — a directory whose *only*
  `CROSS-REVIEW-` basenames are the out-of-catalogue form. §4.3 already has that construct to hand
  in `AT-17`'s fourth leg, which it describes correctly one paragraph later.
- Re-pin the citation from "FSPEC `BR-16` at v1.4" to `BR-16` at v1.7.

`F-02` closes by correcting the changelog's grounding sentence to record that FSPEC moved v1.5 →
v1.7 and to name what was absorbed from it.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | FSPEC §8 now maps `BR-16` to `AT-15, AT-17`. §4.3 names only `AT-17`'s fourth leg as "the boundary fixture". Should §4.3 acknowledge `AT-15`'s out-of-catalogue neither-list entry as the leg pinning the *byte* half of `BR-16`/`BR-14` agreement, so the two halves of the claim each have a named oracle? Not raised as a finding — TSPEC never asserts exclusivity — but the round that fixes `F-01` is touching this passage anyway. |
| Q-02 | The erratum protocol's re-grounding step was discharged this round by an attestation that upstream had not moved, when it had. Is there a cheap mechanical check — comparing the upstream version header or hash recorded at the previous grounding against HEAD — that would make this class of miss impossible rather than diligence-dependent? Flagged `Process` in `F-02`; the answer belongs in harvest, not here. |

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | inherited | nonlocal | §4.3 attributes to FSPEC `BR-16` a claim `BR-16` at HEAD explicitly denies. TSPEC says FSPEC names `docs/completed/pdlc-advisory-wave-gate/` as "a harvested directory whose only `CROSS-REVIEW-` basenames are the out-of-catalogue … form … as reporting `harvested`". FSPEC v1.7 says that directory "carries four of them **alongside** grammar-matching cross-reviews and so reports a measured ratio itself; only the shape is borrowed, not the verdict". Ground truth agrees with FSPEC: 62 `CROSS-REVIEW-*` files, 58 grammar-matching, so `crossReviews.length` is 58 and the harvested disjunct cannot fire. The citation is also pinned to "FSPEC `BR-16` at v1.4" while `BR-16`'s text changed at v1.6 and v1.7. TSPEC's own §7.2 `AT-09` row contradicts §4.3 on the same path. The rule and code sketch are correct; the worked example and its verdict are not | §4.3 (byte ratio, `BR-14…BR-16`) — the "harvested test is asked over `BR-14`'s grammars" paragraph |
| F-02 | Medium | delta | local | The v1.5 changelog attests that REQ and FSPEC "neither moved since v1.4's grounding". The hashes it pins are correct, but TSPEC v1.4 grounded on **FSPEC v1.5** and FSPEC is at **v1.7**, having revised `BR-16` twice in between. The false attestation discharged the re-grounding control without exercising it, which is how `F-01` survived this round. Correct the sentence to record the v1.5 → v1.7 move and what it absorbs | §0 changelog, "v1.5 — erratum round 5" block |

FINDING: High | inherited | nonlocal | §4.3 BR-16 harvested paragraph — advisory-wave-gate cited as reporting `harvested`; FSPEC v1.7 says it reports a measured ratio, only the basename shape is borrowed
FINDING: Medium | delta | local | §0 v1.5 changelog — "neither moved since v1.4's grounding" is false for FSPEC (v1.5 → v1.7, BR-16 revised twice)

## Positive Observations

_(pending)_
