# Cross-Review: software-engineer — FSPEC (delta round 7)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.7)
**Date:** 2026-08-14
**Iteration:** 7
**Scope:** Delta over `a57e0547` (v0.6 → v0.7, 66 lines changed). Regions re-read line by line:
the header/Upstream cell, the 0.7 changelog, the re-grounding record, the amended 0.5/0.4
changelog entries, §5.2's class table and count paragraph, AT-1.1, AT-3.8a, AT-3.8b. Sections
settled in rounds 1–6 are not re-litigated.

## 1. Disposition of my v6 findings

All six are closed, and — unusually — the one that mattered most was closed *outside* this
document, which is where I said it had to be.

| v6 item | Resolved? | Evidence |
|---|---|---|
| **F-01** (Medium, Cross-Feature) — the deleted `"none installed"` literal still live in PLAN and PROPERTIES, unimplementable | **Yes, downstream** | Routed as errata, not held against FSPEC. `PLAN` v0.7 (`PLAN:24`) and `PROPERTIES` v0.4 (`PROPERTIES:21`) both record literal-alignment rounds; `PLAN:147` T15(e) and `PLAN:459` step 5 now pin "**not** AT-1.1's `not found` message", and `PROP-LAUNCH-3` (`PROPERTIES:86`) reads the same. The string an implementer of T15(e) would now assert exists at `handshake.mjs:164` and is pinned by `handshake.test.js:113`. |
| **F-02** (Medium) — Upstream cell still pinned REQ v0.10; no record of the v0.11 absorption | **Yes** | Header cell now reads `(v0.11, 01c27ee4, re-grounded … erratum round)` (`:9`), and a dedicated re-grounding record (`:26-33`) names both REQ v0.11 decisions and marks them **absorbed**. §5.2 now quotes REQ v0.11's actual words (`:544`, "classes and per-class member counts stated in the FSPEC", REQ `:268`) instead of the withdrawn v0.10 phrase. Both amended prior changelog entries (0.5, 0.4) say *discharged/superseded by REQ v0.11* rather than leaving stale "routed upstream" claims standing. |
| **F-03** (Medium) — CLI-entry and engine-module rows carried no `PK-*` anchors, forcing the reader to invent a PK→class mapping | **Yes** | `CLI entry` now anchors `PK-4`, `PK-4b` (`:534`) and `Engine modules` anchors `PK-5`…`PK-19` (`:535`). Both check out against TSPEC §5.4: `TSPEC:350-351` are `bin/pdlc.mjs` / `bin/cli.mjs`, `TSPEC:352-355` are the twelve HEAD `lib/*.mjs` plus `resolve-version`, `store`, `provenance`. With the licence (PK-3), README (PK-2) and install script (PK-23) already anchored, every one of the seven classes now names its `PK-*` slice, and TSPEC's own arithmetic (`TSPEC:388-392`, 4 + 15 + 3 + 1 + 0/1) partitions onto §5.2's 1+1+2+15+3+1 without residue. |
| **F-04** (Medium) — CLI-entry note called its cardinality a downstream-only decision, contradicting the per-class count and §1's co-change rule | **Yes** | The note is rewritten: "the class holds the **2** members counted below, and moving that number is an FSPEC edit" (`:534`). The contradiction is gone in the direction that preserves the change-control point. |
| **F-05** (Low) — AT-3.8a's count conjunct was stated only as what it is *not* | **Yes, and improved** | AT-3.8a now leads with the positive obligation — the transcribed `PK-*` list's length **and each class's slice** equal §5.2's total and per-class numbers — and keeps the never-against-the-tarball's-own-length clause as the paired negative (`:768-772`). That is a strictly stronger oracle than v0.6's: per-class equality catches the merge-one-`lib`/split-one-`bin` swap that a total alone is invariant under, which is exactly the hazard §5.2's own paragraph names. |
| **F-06** (Low) — class was called "Workflow modules" though `PK-22` is a JSON manifest | **Yes** | Class renamed **Workflow members** (`:537`), body says "two `.js` modules and a JSON manifest", count paragraph follows (`:540`), and AT-3.8b says "three members and not three modules" (`:780-782`). `TSPEC:358` confirms `PK-22` is `vendor/workflows/VENDOR-MANIFEST.json`; `TSPEC:390` really does say "three vendored workflow members", so the citation is accurate, not approximate. |

## 2. Verification of the changed regions

I grounded every factual claim the delta added, in code where the claim is about code.

**Upstream re-grounding (DEC-ERR-01/-03) is genuine, not ceremonial.** REQ is at v0.11 at HEAD
(`REQ:18`), authored by `01c27ee4`. Both absorbed decisions are real and are stated in the REQ's
own vocabulary, not paraphrased into something weaker: AC-1.3 now reads "**classes and per-class
member counts are stated in the FSPEC**" / "**member names are stated downstream in the TSPEC**"
(`REQ:267-269`), and the v0.10 changelog's mis-pin is corrected to **F-4 step 2** (`REQ:24`,
`REQ:29`). Both are already true of this FSPEC — §5.2's per-class paragraph and §1's ownership
restatement — so "absorbed, no text moved" is the correct disposition rather than a dodge. The
absorption is recorded ahead of the raised items, which is the ordering DEC-ERR-01 asks for.

**Nothing settled earlier was broken.** I diffed the whole commit, not just the quoted regions.
No `AC-` trace changed, no `BR-` changed, no `E-` row changed, no acceptance-test *criterion*
changed. The 23/24 arithmetic is untouched on both sides and still agrees with TSPEC's derivation.
The two amended prior changelog entries only annotate outcomes that have since occurred; they do
not rewrite what those rounds decided.

**AT-1.1's new sentence answers my v6 `Q-01`, and answers it correctly for the code.**
`checkCompat` maps a null/empty plugin version to the literal `not found` (`handshake.mjs:146`)
and embeds it in the reason as `version found: not found` (`handshake.mjs:164`). So the *reason
text* contains the literal while the *triple member* (`out.pluginVersion`) equals it — precisely
the split the new sentence draws (`:678-681`). `handshake.test.js:110-118` pins both halves. The
FSPEC now says which surface carries which obligation, which is what an implementer of T15 needed
and did not have.

**Set-equality and oracle quality on the changed acceptance tests.** AT-3.8a remains a
member-for-member equality over the full enumeration with an explicit removed-member clause, and
its expected side is a literal transcription of TSPEC §5.4 — never a listing of
`pdlc/engine/lib/`, which BR-8.1 forbids and which is the self-derivation failure mode. The new
per-class conjunct is a set-equality strengthening, not a containment weakening. AT-3.8b's
negative ("a removed member fails") is paired with the positive equality on the same path. No
absence-only oracle was introduced by this delta.

One thing the delta did **not** fully carry through is vocabulary: the rename to *Workflow
members* stopped at §5.2 and AT-3.8b. `E-22` (`:653`) and `BR-8.2` (`:571`) still say "workflow
modules". Behaviourally harmless — F-03 below.

## Findings

No High findings. All six v6 items are closed; what remains is one implementability question the
new AT-1.1 sentence opens and three pieces of tidying.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Medium | Local | **AT-1.6's three-way equality is stated over surfaces, but one of those surfaces is a rendered string in which the member is not equal to the literal.** AT-1.1 now says AT-1.6 and Q-1 pin the version-triple member, which *equals* `not found` (`:678-681`), and AT-1.6 asks the query output's triple to *equal* the same run's banner triple (`:694-697`). At HEAD the banner renders the member as `plugin:   pdlc vnot found` (`buildBanner`, `handshake.mjs:209` — the `v` prefix is unconditional), and the root line renders `not found` bare (`:211`). An implementer who reads the banner *text* to compare triples gets `vnot found` and a red test for a non-defect; one who compares the structured values `buildBanner` is *given* gets the equality the AT means. Fix is one clause on AT-1.6: the three-way equality is asserted over the structured triple values each surface is built from, not over rendered banner text. Medium, not High — PROP-LAUNCH-5 (`PROPERTIES:88`) already pins the member by content, so the downstream carrier is not wrong, only under-instructed. | AT-1.1 (`:678-681`), AT-1.6 (`:694-697`), Q-1 (`:617`) |
| F-02 | Low | Local | **The re-grounding record misdates the upstream move by a day.** It reads "upstream REQ moved v0.10 → **v0.11** (`01c27ee4`, 2026-08-14)" (`:26-27`), and the Upstream cell says "re-grounded 2026-08-14 erratum round" (`:9`). `git show -s 01c27ee4` is `2026-08-13 22:07:05 -0700`. The commit hash is the load-bearing half and it is right, so nothing downstream can be misled about *which* REQ was read; the date is bookkeeping only. Fix: 2026-08-13, or drop the date and keep the sha. | Header (`:9`), re-grounding record (`:26-27`) |
| F-03 | Low | Local | **The `Workflow members` rename is not carried through the document.** §5.2's row, its count paragraph and AT-3.8b were renamed, but `E-22` still reads "Workflow modules absent from the packed tarball" (`:653`) and BR-8.2 still says "the workflow modules" (`:571`). Since the class deliberately includes a JSON manifest, the residual name reintroduces exactly the ambiguity F-06 removed: an implementer reading E-22 could take a missing `VENDOR-MANIFEST.json` to be outside E-22's scope. Two word changes; no criterion moves. §1's `:97` use ("the engine executes the canonical workflow modules") is a *different* referent — the repo-side modules, not the packed class — and should be left alone. | §5.2 (`:537`, `:540`), BR-8.2 (`:571`), E-22 (`:653`) |
| F-04 | Low | Cross-Feature | **Prose residue of the retired literal survives downstream, in labels rather than in oracles.** `PLAN:202`'s trace row is titled "AT-1.1 *(AC-1.1)* refusal, none installed" and `PROP-LAUNCH-9`'s headline still says the refusal "must … state that none is installed" (`PROPERTIES:92`). Neither is an assertion: PROP-LAUNCH-9's conjunct (b) pins the exact literal `not found` and cites `handshake.test.js:110-118`, and the PLAN row is an index label. So this is not a repeat of v6 F-01 — no implementer can now write the dead string into a test — but the two titles will keep drawing reviewers back to a settled question. Worth one sweep on the next PLAN/PROPERTIES touch; not worth an erratum round of its own. | `PLAN:202`, `PROPERTIES:92` |

## Questions

| ID | Question |
|----|----------|
| Q-01 | §5.2's per-class counts and TSPEC §5.4's derivation now agree at 23/24 and partition identically, with the co-change obligation stated on both sides (`:540-548`, `TSPEC:396-400`). Is anything checking that agreement mechanically before PF-4 runs, or does the first red come from PF-4 at build time? Recording only — the obligation is legible either way, and a doc-level check may not be worth its cost. |

## Positive Observations

- **The most consequential fix in this round happened in another document, on purpose.** v6's
  F-01 was a defect in PLAN and PROPERTIES, not here, and the round routed it there rather than
  folding a downstream repair into an FSPEC edit. `PLAN` v0.7 and `PROPERTIES` v0.4 both landed
  literal-alignment rounds that pin the string the code actually emits. That is the erratum
  channel working in the direction it is hardest to use — outward — and it is why T15 is now
  implementable from any of the three documents.
- **F-05 was over-served in the right direction.** I asked only that the count conjunct be stated
  positively. What landed also added the **per-class** slice equality, which closes the
  count-invariant-under-a-swap hole §5.2's own paragraph warns about. Strengthening an oracle
  while answering a wording finding is the opposite of the usual round-N drift.
- **Every citation in the delta checks out against the tree.** `TSPEC:390` really says "three
  vendored workflow members"; `PK-4`/`PK-4b` and `PK-5`…`PK-19` really are the `bin/` and `lib/`
  rows; `REQ:268` really carries the quoted AC-1.3 wording; `handshake.test.js:110-118` really is
  the missing-plugin case, and the v0.6 changelog's citation was widened from the single line
  `:113` to that range, which is more honest about what pins what.
- **The amended prior changelog entries close their own loops.** The 0.5 and 0.4 entries had left
  "routed upstream" and "noted, not fixed" claims standing that have since been discharged; both
  now say so and name the discharging commit. Changelogs that record their own resolution are
  what makes a document readable six rounds later without re-deriving the history.

## Recommendation

**Approved with minor changes**

Every v6 finding is closed — F-02…F-06 in this document, F-01 downstream in PLAN v0.7 and
PROPERTIES v0.4 where it belonged. The revision broke nothing previously approved: no criterion,
count, trace or business rule moved, and the one strengthening (AT-3.8a's per-class equality)
tightens an oracle rather than loosening one. The document remains a faithful compression of REQ
at HEAD, now explicitly re-grounded on v0.11 with both of its decisions absorbed.

No open High findings, so the document is not blocked. Four items to ride along on the next touch,
none costing a round:

1. **F-01** — one clause on AT-1.6 saying the three-way equality is over structured triple values,
   not rendered banner text. Worth doing before T15 is dispatched, since the banner really does
   render `vnot found` at HEAD.
2. **F-03** — finish the `Workflow members` rename at `:571` and `:653`.
3. **F-02** — one date.
4. **F-04** — a PLAN/PROPERTIES title sweep whenever those documents are next opened; no erratum.

No errata are raised this round: REQ v0.11 is clean where this document reads it, and every TSPEC
claim the delta cites is accurate at HEAD.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:d3891a6570da0f3abb126312255e430934ba7fcaa653d63ce1132b39b03423b1
APPROVAL-HASH-NORMALIZED: sha256:87f231423b7f964a35b657c3e8e1daf3f947d436940550e3340dd390746b2153
REVIEWED-COMMIT: a57e0547e9f233ed5e6b86fc87b6263e57974921
