# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.6)
**Date:** 2026-08-31
**Iteration:** 8 (erratum round 6 — delta confirmation)
**Prior round:** `CROSS-REVIEW-test-engineer-TSPEC-v7.md` (Needs revision, v1.5 @ `7747eb78f`)

## Overview

Round 7 raised two findings: **F-01** (High, `inherited`) — §4.3 cited `REQ-STATS-06` for a scoping
REQ v1.6 had reversed, contesting AT-17's fourth-leg expected value — and **F-02** (Medium, `delta`)
— the v1.5 changelog's false attestation that REQ and FSPEC "neither moved since v1.4's grounding".

Both are discharged, and discharged in the right way.

**F-02 is corrected accurately.** The v1.6 changelog now states the movement explicitly and
correctly: v1.4 grounded on FSPEC v1.5 / REQ v1.4, HEAD carries FSPEC v1.7 / REQ v1.6. I verified
the version rows rather than the changelog's account of them — `REQ-pdlc-stats.md:3` reads `1.6`,
`FSPEC-pdlc-stats.md:16` reads `1.7`. The enumerated moves are also right: FSPEC's v1.6 BR-16
basename-shape rewrite and v1.7 count correction two → four plus the AT-15 trace row
(`FSPEC:18`–`:26`), REQ's halt withdrawal and REQ-STATS-06 rewording. The entry goes further than a
correction and names *why* the check failed — "citing a current hash is not the same check as
diffing it against the previously grounded one" — which is the durable form of the lesson.

**F-01 is resolved at this layer, which is the only place it could be resolved.** F-01 was tagged
`inherited` because the contradiction is REQ-versus-FSPEC, not a TSPEC authoring error. A derived
document cannot fix that; it can only stop misreporting it. This revision does exactly that:

- §4.3's BR-16 pin moves from "at v1.4" to **v1.7**, and the false clause "REQ-STATS-06 at v1.4
  carries the same scoping" is gone.
- The `docs/completed/pdlc-advisory-wave-gate/` citation is re-scoped to a basename *shape* rather
  than a verdict — matching FSPEC BR-16 v1.7, which says the same thing in its own words
  (`FSPEC:373`–`:375`: the directory "carries four of them **alongside** grammar-matching
  cross-reviews and so reports a measured ratio itself; only the shape is borrowed, not the verdict").
- The REQ-versus-FSPEC conflict is stated in §4.3 and carried as the second open erratum in §8.3,
  routed rather than repaired, with the sites that re-stamp when it settles named.
- The stale "Nothing on this point is routed upstream (FSPEC §7.3 records it closed)" sentence is
  removed, and §8.3's count moves "One remains open" → "**Two** remain open". I counted the bullets:
  two.

The conflict itself is still live upstream — `REQ:205`–`:206` still calls the out-of-catalogue
basename a survivor, `FSPEC:371`–`:372` still says such a directory reports `harvested`. Per the
erratum channel I do not fold that into this document's verdict; it is re-raised as an `ERRATUM: REQ`
line, since the TSPEC in front of me now handles it correctly.

**No open High remains against this document.** Two new findings, both from this round's edit and
both non-gating: a blast-radius claim about AT-15 that does not hold (Medium), and a mis-cited
section anchor repeated twice (Low). Details in Test Strategy and Open Questions.

## Architecture

No structural change, and I confirmed that from the diff rather than from the changelog's assertion
of it. `git diff 7747eb78f HEAD -- docs/pdlc-stats/TSPEC-pdlc-stats.md` touches exactly three
regions: the §0 changelog block, §4.3's harvested-test discussion, and §8.3's open-errata list
(77 insertions, 13 deletions). Module boundaries, the `lib/stats.mjs` / `cmdStats` split, the
injected-parser bundle and the `StatsIo` seam are byte-identical to the v1.5 bytes.

The changelog's closing claim — "No type, signature, exit code, oracle, code sketch or count changed
this round" — holds on the first five. On "count" it needs a gloss: no *existing* count changed, but
the round **adds** three new measured counts to §4.3 (62 / 4 / 58). That is an addition rather than a
change, so the sentence is defensible, and the additions are correct (see Test Strategy). I mention
it only because a reader auditing the round by that sentence alone would not expect new numbers.

The re-scoping move itself is architecturally right. Treating the archive directory as a *shape*
citation rather than a *verdict* citation separates two things the earlier revision had fused: what
the basename form is, and what a directory containing it reports. Those are different questions with
different answers, and fusing them is what produced the false "harvested directory" reading in the
first place.

## Interfaces

Unchanged and unaffected. `deriveRoundWindow`, `parseResolvedMarker`, `computeReviewRounds`, the
`StatsIo` injection surface (`listDir` / `readFile` / `stat`) and the renderer signatures over
`StatsReport` are untouched by the delta; the diff does not reach §3. I re-read §3.3's signatures
against the diff to confirm no incidental edit landed there. None did.

One interface-adjacent detail is worth recording because the dispute touches it. §4.3's membership
predicate is `parseReviewFilename(...).ok` — cross-review membership is decided by the **driver's**
parser, which validates the doc-type token against its catalogue. That is the mechanism by which the
TSPEC implements BR-16, and it is also precisely the mechanism REQ v1.6 disputes. The seam is not
wrong; it simply inherits whichever answer the reconciliation lands. No signature changes either way,
which §4.3 correctly states ("No type, signature, exit code or other oracle depends on the outcome")
— with one qualification I take up under Test Strategy.

## Data Model

Unchanged by the delta. §5's declarations are outside the diff, so the live question is the same one
I asked at round 7: do they still match upstream after REQ moved to v1.6? They do, and the changelog's
item (c) now records why in the document itself rather than leaving it to a reviewer's note.

I re-verified the load-bearing part. `TSPEC:551` declares

```
halts: HaltEntry[];              // possibly empty — BR-13, no state needed
```

`HaltEntry[]` carries no `state` discriminator, so REQ v1.6's withdrawal of REQ-STATS-05's harvested
halt state and its restoration of a measured `0` is satisfied by an empty array rather than
contradicted by a type. `MetricState` remains applied only to `reviewRounds`, `dodRounds` and
`byteRatio`. The `StatsReport` shape at `:611` agrees.

The five-key JSON literal still matches REQ-STATS-02's printed metric set plus the schema-version
field, and the delta does not touch it. Recording this in the changelog is the right call: at round 7
this was a near-miss that happened to hold, and an unrecorded near-miss is indistinguishable from an
unchecked one on the next pass.

## Test Strategy

No oracle changed this round. §6.4's purity split, the vendoring oracle, the catalogue-agreement
set-equality, the exact-key-set conjuncts, the snapshot isolation property and the named mutation
kills are all outside the diff. What changed is §4.3's *account* of what the oracles rest on, and
that account is now materially better in one place and wrong in another.

**Better: the measured counts are real.** §4.3 now records that
`docs/completed/pdlc-advisory-wave-gate/` holds 62 `CROSS-REVIEW-*` files, of which 4 are the
out-of-catalogue form and 58 match BR-14's grammar, and concludes that a real-path test written
against this directory must expect a **measured** ratio, not `harvested`. I re-measured all three at
HEAD rather than trusting the document: `ls | grep -c '^CROSS-REVIEW-'` → 62; the four
out-of-catalogue files are `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md`; 62 − 4 =
58. Correct, and this is exactly the kind of literal FSPEC §6 requires and RK-4 asks to be re-measured
rather than derived. It also forecloses a real bug: the earlier revision's "harvested directory"
reading would have produced a real-path test asserting `harvested` against a directory that measures.

**Wrong: AT-15's byte half is not immune to the dispute (F-01).** §4.3's new contested-scoping
paragraph closes:

> FSPEC §8 also maps BR-16 to **AT-15**, whose neither-list pins the byte half of the same agreement
> (a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file reaching neither side); that half is unaffected by the
> dispute, since neither reading gives the file spec-side bytes.

The reason clause is true and irrelevant, and the conclusion does not follow. AT-15's *Then*
(`FSPEC:730`–`:733`) does not assert that the file misses the **spec** side; it asserts the file's
bytes "reach **neither** side, so an implementation that globs `CROSS-REVIEW-*` into the process
total fails here". The pinned claim is about the **process** total. So the question is whether the
contested reading gives the file process-side bytes — and it does:

- REQ `C-4` (`REQ:110`–`:113`) defines the process side as "the byte total of every file matching the
  documented … grammars: `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, …".
- `CROSS-REVIEW-test-engineer-REVIEW-v1.md` matches that grammar with `doc-type = REVIEW`.
- REQ-STATS-06 (`REQ:196`–`:197`) computes process bytes over "C-4 set, present files only", and
  REQ v1.6 (`REQ:205`–`:206`) says membership is "set-membership over C-4's grammars", making this
  basename a member.

Under REQ v1.6's reading the file therefore **does** contribute process bytes, and AT-15's
neither-list expectation is false. Under BR-16's reading it contributes nothing and AT-15 holds. The
byte half is not a bystander to the dispute; it is the second thing the dispute decides.

This matters for two concrete reasons, both testing reasons:

1. **The re-stamp set is understated.** §4.3 says "exactly three things here re-stamp — this
   paragraph, BR-16's version pin above, and AT-17's fourth-leg expectation". If the reconciliation
   lands REQ's way, a fourth site re-stamps: §4.3's own byte-membership paragraph immediately above
   (`TSPEC:745`–`:748`), which states that a grammatically-failing basename "contributes to **neither**
   side" and is "sized into nothing". An implementer following the enumeration literally would leave
   that paragraph — and any test written from it — asserting the losing reading.
2. **The "no oracle depends on the outcome" claim is too strong.** AT-15 is a byte-total oracle with
   a removal probe and literal sums; §4.3 itself calls the removal probe "what makes the assertion
   set-equality rather than containment". An oracle whose expected totals shift by four files' bytes
   under one reading is an oracle that depends on the outcome.

I am filing this **Medium**, not High, deliberately. Nothing currently written in the TSPEC is
inconsistent: §4.3 implements BR-16 throughout, and under BR-16 both the harvested disjunct and
AT-15's neither-list are correct as stated. No test written to this document today would assert a
wrong value. The defect is in the *scoping of the open item* — it under-describes what the pending
reconciliation reaches, which is a hazard at re-stamp time rather than an error at authoring time.
The fix is a sentence, not a redesign: drop the "unaffected" claim, add AT-15's neither-list and
§4.3's byte-membership paragraph to the re-stamp list, and soften "no oracle depends on the outcome"
to name AT-15 as the one that does.

**Unchanged and still correct.** AT-17's fourth leg now carries both readings explicitly — "expected
`harvested` on BR-16's reading, and `measured` on REQ-STATS-06 v1.6's" — and names itself as the row
to re-stamp. That is the right way to carry a contested expectation: determinate today (implement
BR-16), flagged for tomorrow. The `CODE_REVIEW`-files-intact conjunct is still correctly identified
as load-bearing, since the condition is a disjunction and an empty DoD family would read `harvested`
through the other disjunct whatever the cross-review side said. §6.1's AT-09 baseline row still
asserts `TSPEC` row = `6` with the four basenames in `malformed` (`reason: "bad_doc_type"`), which is
consistent with the 4/58 split and unaffected by either reading, since AT-09 asserts a round index
and a malformed listing, not a ratio.

## Open Questions

**The `§7.2's AT-09 row` citation points at the wrong section (F-02).** This round introduces the
same mis-citation twice: the changelog at `TSPEC:32` ("§7.2's AT-09 row and §6.1's baselines already
carried the four-file count") and §4.3 at `:766` ("§7.2's AT-09 row and §6.1's measured baselines
already record the same four-file count").

There is no AT-09 row in §7.2. §7.2 (`:1218`) is "FSPEC open item → decision", a four-row table over
`O-1`…`O-4`. The AT-09 row is in **§6.1**, at `:926` — the measured-baseline table the same sentence
already cites correctly by its other half. So the claim is true and the evidence is real; only the
pointer is wrong, and the correct pointer is sitting in the same clause.

Low, and non-gating: no oracle, expected value or count depends on it, and a reader who follows the
§6.1 half finds everything. I file it rather than waive it because §4.3's whole purpose in this
revision is to tell a future re-stamper where things live, and a re-stamper who opens §7.2 finds an
unrelated table and may conclude the row was already removed. Both occurrences should change to §6.1
in the same edit.

**Why F-01's REQ/FSPEC conflict is not counted against this document.** Round 7 tagged it
`inherited` precisely so it would route to the owning phase rather than halt. It has now been routed
— §8.3 carries it as an open erratum with both readings quoted, both version pins current, and an
explicit note distinguishing it from the closed E-1 item ("E-1 was bare glob versus grammar, settled
at REQ v1.4 in favour of the grammar. The live question is narrower"). That distinction is worth
calling out: re-routing a settled question is `DEC-ERR-01`'s anti-pattern, and the document guards
against it by name.

The conflict remains live upstream — I confirmed `REQ:205`–`:206` and `FSPEC:371`–`:372` still say
opposite things about the same basename. It is re-raised as an `ERRATUM: REQ` line in my response
rather than as a finding here, per the erratum channel: the defect is in the upstream pair, and the
document in front of me now reports it accurately instead of misreporting it. Note that when the
owning phase reconciles, F-01 above means the reconciliation must also settle the **byte-side**
question (does the out-of-catalogue basename contribute process bytes?), not only the
harvested/measured question. Settling one and not the other would leave AT-15 and AT-17 disagreeing.

**Still open, unchanged, correctly still open.** BR-26/EC-10 remains a TSPEC→FSPEC erratum with its
circular feature-recognition predicate; §4.4 still ships its discovery predicate as
stated-provisional with the blast-radius table; RK-1's two un-oracled residues (`PK-26`'s existence
row, `pdlc/README.md`'s prose count word) remain named accepted residue rather than implied coverage.
I re-checked that this round's §8.3 edit did not sweep any of these closed by association. It did not
— the BR-26 bullet is byte-identical and the count moved one → two, not one → one.

## Recommendation

**Approved with minor changes**

Both round-7 findings are discharged. F-02's changelog correction is accurate and I verified it
against the upstream version rows rather than its own account. F-01 is resolved as far as this layer
can resolve it: the false REQ citation is gone, the BR-16 pin is current at v1.7, the archive-directory
citation is correctly re-scoped from verdict to basename shape with re-measured counts (62 / 4 / 58,
all three confirmed at HEAD), and the REQ-versus-FSPEC conflict is routed to §8.3 rather than guessed.
AT-17's fourth leg carries both readings and names itself as the row to re-stamp, which is the right
way to hold a contested expectation without blocking implementation.

No open High remains against this document. The two new findings are non-gating and both fixable in
one targeted edit:

- **F-01 (Medium)** — drop §4.3's claim that AT-15's byte half is "unaffected by the dispute" (the
  reason given concerns spec-side bytes; AT-15 pins *neither*-side, and REQ v1.6's C-4 membership
  gives the file **process**-side bytes). Extend the re-stamp list from three sites to four by adding
  §4.3's byte-membership paragraph, and qualify "no oracle depends on the outcome" to name AT-15.
- **F-02 (Low)** — correct "§7.2's AT-09 row" to "§6.1's AT-09 row" at `:32` and `:766`.

Neither blocks Phase T. The upstream REQ-STATS-06 / BR-16 reconciliation is raised separately as an
erratum and should settle the byte-side question at the same time as the harvested/measured one.
