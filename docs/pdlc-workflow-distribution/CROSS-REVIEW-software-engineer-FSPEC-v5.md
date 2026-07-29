# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (v5.0, Draft)
**Date:** 2026-07-28
**Iteration:** 5
**Prior review:** `CROSS-REVIEW-software-engineer-FSPEC-v4.md` (0H/0M/2L — **Approved with minor changes**)
**Diff reviewed:** `a81f387..1cdccf3` (+69/−22 on the FSPEC; a genuine micro-diff — 11 hunks, no
restructuring, no AT added or renumbered, REQ untouched)
**Scope of review:** technical feasibility and implementability only. REQ v17.0 is APPROVED; §10 rows
whose "Lands in" is TSPEC/PROPERTIES are discharged downstream by design and are not re-litigated.
Per the delta protocol I read only the changed sections plus every section a changed section makes a
claim about — here that meant §4.5's `operation` contract and §4.4a's emitter table, which the
changed AT-15 asserts against.

## Disposition of my v4 findings

| v4 ID | Claim | Verdict | Evidence |
|---|---|---|---|
| F-27 (L) | Three sites called the unwritable-parent case "the only cause under which rung (i) lands", contradicting §4.4's own TE-F-35 paragraph; and the rung table was not exhaustive over `ENOSPC` | **Fixed at 3 of the 4 sites named, plus the exhaustiveness gap** | **§2.7** now reads "the only cause of rung (i) landing that is **constructible as a non-uid-0 permission fixture** (a classic-filesystem `ENOSPC` also lands at rung (i) — §4.4's row note — but only via the §4.6 fault seam, never via a permission fixture)", and the stale "(v3.0)" table citation is corrected to "(v4.0)". **§4.4's honesty note** carries the identical narrowing. **The v4.0 changelog's SE F-23 disposition** is annotated in place rather than left to read as still-true. **The rung table gains the row note** I asked for, and it closes the gap correctly: "classic filesystem ⇒ rung (i); delayed-allocation/COW-snapshot/quota-at-write ⇒ rung (ii)" — a note rather than an eighth row is the right call, because the table is keyed on the *cause of the atomic replace's failure* and `ENOSPC` is one cause with two regimes, not two causes. The residual is **§10 O-11**, the fourth site — see F-30 |
| F-28 (L) | Three sites said the removal's effect lands on the *next* run; §4.2's step 6→7 ordering makes it land in *this* run's record | **Fixed at all three, and correctly discriminated from the case that genuinely is next-run** | **§3.4 R-3**: "in the corrupted run's own post-run pass (§4.2 steps 6–7) and every run thereafter — not merely 'the run after'". **§5.8**: "the removal is what makes **this run's own** post-run report honest, and every run thereafter". **§5.5** gains a leading sentence pinning step 6 ≺ step 7 explicitly. The judgement call I did *not* ask for but agree with: §5.5's residual sentence — a *failed* removal leaves the surviving entry to misclassify the row "on the next run" — was left alone, and that is right, because a failed removal genuinely defers the consequence. Distinguishing the success case from the failure case rather than search-replacing "next run" is the correct disposition |
| Q-01 | `PDLC_FAULT` token granularity — does the ladder need per-rung tokens? | **Answered, and pinned at the right altitude** — §4.6's seam table now says the set is "**rung-granular** for the invalidation ladder … a distinct token exists per distinct guard, so a fixture can compose multiple tokens"; the prose names the three guards (`drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink`) and adds rung-granularity to the two things this FSPEC pins about the set (closure, unrecognised-token behavior). **§10 O-10** records it as a binding enumeration requirement, not a suggestion: "three distinct entries in this enumeration, not one". This is exactly the deferral I asked for — the *vocabulary* stays TSPEC's, the *granularity requirement* is FSPEC's. AT-15's Given was updated to match. The one place the update went wrong is AT-15's **Then** — F-29 |
| Q-02 | Merge vs. replace semantics of the §4.2 step-6 rewrite | **Answered, and the fixture consequence was drawn out** — §4.2 step 6 now states "a **WHOLE-FILE REPLACE** of the entries map as computed by this run (same atomic sibling-temp + mv discipline as every other write), **never a per-key merge** — true whether the run's only change is a removal or not". **§10 O-10** gains the fixture note: a removal-only run (verified copies = 0, one entry removed) is a dedicated row, "empty written set and a non-empty removed set". Whole-file replace is the right choice and stating it here rather than letting TSPEC decide silently is the point of the question |

## Verification performed this round

**TE F-39's narrowing does not break the propagation I verified in v4 — I re-walked all ten sites.**
The narrowing is "landed-then-failed-verification" only, applied by *narrowing the two broad sites*
rather than widening the eight narrow ones, which is the cheaper and the correct direction. Site by
site: **§1.2** (its worked trace is entirely verification-scoped: "if a truncated copy *were*
recorded…", and the removal's justification — "the recorded `consumerHash` provably no longer
describes the bytes on disk" — is only sound for a landed copy, so it was already narrow and needed
no edit); **§4.2 step 6** ("any PRE-EXISTING entry of a row that **FAILED VERIFICATION**" — already
narrow); **§3.4 R-3** ("§5.5's **failed-verification** branch" — already narrow); **§4.5** (narrowed,
both in the contract box and in the paragraph below it); **§5.5** (narrowed in the summary bullet;
its own derivation paragraph was already verification-scoped); **§5.8** (its worked row reads "sync
whose copy **landed corrupted** (§5.5's verification caught it)" — already narrow); **§5.9's
rewrite trigger** ("at least one row's copy **failed verification** and its pre-existing entry must
be removed" — already narrow, byte-identical to v4.0, and still correct under the narrowing: a
before-landing failure now triggers no rewrite at all, which is what AC-3.7 wants); **§9 O-14**
("a copy **failing verification** … has its pre-existing entry removed" — already narrow);
**AT-35** (its fixture is a truncated copy that lands, so it is inside the narrow scope unchanged).
All ten now say one thing. The narrowing is also *behaviorally* right, not just consistent: a copy
that fails at the temp write or at the `mv` never replaces the consumer file (§4.3's per-row
atomicity), so the pre-existing entry still describes real bytes and removing it would manufacture
an `unverified` row out of a perfectly repairable `stale` one. Only the explanatory clause
over-narrows its own antecedent — F-31.

**Contract check.** No new `operation`, no new `rows[].reason`, no new `baselineReason`, no AT added
or renumbered, no REQ text touched. I re-diffed §12's row set: AT-15 and AT-35 gained conjuncts;
nothing else in §12 moved. `drift-state-replace` / `drift-state-invalidate` / `drift-state-unlink`
are pre-existing members of §4.5's closed nine-member `operation` set (`§4.5`, and §4.4a's
`writeFailures`-filtering clause counts them among the four stderr-only members) — the v5.0 edits
reuse them rather than inventing a parallel fault vocabulary, which is the right move and the reason
F-29 is a Medium rather than a High: the tokens exist and are closed, only their *polarity* is
asserted backwards in one AT.

**Existing-code claims:** the v5.0 diff introduces **no** new assertion about code at HEAD. Every
new sentence is about POSIX/filesystem semantics or about this document's own sections. The HEAD
claims I verified in v3 (`runtime-adapter.js:85–96`, `orchestrate-queue.js:523`,
`build-runtime.mjs:132`, `RT_IO_MODEL`, the `.claude/workflows/` tree) are untouched and I did not
re-run them.

**Changelog-vs-content audit.** Because this pass is entirely one-clause edits described by a
changelog block, I checked each of the v5.0 note's nine dispositions against the diff hunk that is
supposed to implement it. Seven land at the site claimed. Two do not: the O-11 claim (F-30) and the
§5.9 claim (F-32).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-29 | **Medium** | Local | **AT-15's new discriminating oracle asserts the operation tokens with inverted polarity: §4.5 defines them as *failure* records, but AT-15 (and the v5.0 changelog, differently) reads a token's presence as evidence that its rung *landed*.** §4.5: "`operation` is the closed nine-member set … `drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink` (**stderr-only — they describe a failure of the record itself**)"; §4.4a's filtering clause repeats it: these four "**describe failures of the record itself**, so they are stderr-only". AT-15's scenario is: atomic replace faulted (fails) → rung (i) faulted (fails) → rung (ii) clean (succeeds). Under §4.5's semantics the stderr tokens on that run are therefore `drift-state-replace` **and** `drift-state-invalidate` (the two that failed), and `drift-state-unlink` is **absent** (it succeeded). AT-15's Then asserts the exact opposite: "`drift-state-unlink` **is** named and `drift-state-invalidate` is **not** (the reverse pairing would instead confirm rung (i) landed)". The parenthetical is also backwards on its own terms — `drift-state-invalidate` present means rung (i) **failed**, which is AT-15's own case, not AT-14b's. Independently, the v5.0 changelog states a *third* variant — "`drift-state-invalidate` present, `drift-state-unlink` absent, **confirms rung (i) landed**" — which is right about the tokens and wrong about the conclusion. Why this is Medium and not polish: TE F-41 raised AT-15 precisely because rungs (i) and (ii) write byte-identical records, so this token pair *is* the AT's primary discriminating observable; a test written verbatim from the Then fails against a correct implementation, and the natural "fix" an implementer reaches for — emitting a success token per landed rung — silently grows §4.5's closed nine-member `operation` set and breaks §4.4a's filtering arithmetic (4 stderr-only + 5 recordable = 9), which §4.4a explicitly warns is transcribed literally into the emitter. Not High because the AT carries a **second, independent and correct** oracle (inode identity: rung (i)'s in-place `O_WRONLY\|O_TRUNC` preserves `st_ino`, rung (ii)'s `unlink`+create does not), so the AT is not unfalsifiable — it is falsifiable and half-wrong. **Fix (one clause):** AT-15's Then should read "`drift-state-replace` **and** `drift-state-invalidate` are named on stderr (both attempts failed) and `drift-state-unlink` is **not** (rung (ii) landed); the presence of `drift-state-unlink` would mean rung (ii) also failed and the ladder reached rung (iii)". Correct the changelog sentence to match, and consider one line in §4.6 or §10 O-10 stating that the ladder's tokens are failure records, so O-10's enumeration does not acquire success tokens by inference. | §12 AT-15 (Then, "Discriminating observable (TE F-41)"); §4.5 (`operation` set definition); §4.4a (`writeFailures` filtering, TE Q-04); v5.0 changelog note, TE F-41 bullet |
| F-30 | Low | Local | **F-27's fourth site was not fixed, and the v5.0 note's stated reason for not fixing it is falsified by the site's own text.** The note says: "**§9 O-11 already spoke in terms of 'constructible cause', not 'only cause under which rung (i) lands', so its wording already agreed and needed no change**". §10 O-11 in fact reads: "Root bypasses the permission bits entirely, so the atomic replace succeeds, the ladder is never entered, and rung (i)'s **only** constructible cause vanishes." The word "only" is the overclaim, and v5.0 makes it *more* wrong rather than less: §4.6's new rung-granular fault seam means rung (i) is constructible on **any** runner by faulting `drift-state-replace` while leaving `drift-state-invalidate` clean — a route no uid bypasses — and §4.4's new row note adds classic-filesystem `ENOSPC` as a second cause. AT-14b's uid-0 skip is still correct (that *fixture* is genuinely unconstructible under root, and AT-14b's own wording is properly scoped to "this fixture"); it is O-11's **rationale** that overclaims, and O-11 is the row TSPEC reads when it writes the skip message. Fix, one word plus a clause: "rung (i)'s only **permission-constructible** cause vanishes (the §4.6 fault seam still reaches rung (i) on any runner — §4.4's row note — but that is not what AT-14b tests)". Two nits in the same neighbourhood, both in §4.4's new row note: it says "**Row 2 below** is the narrower, residual case" while the note sits *below* the table (should be "Row 2 above"); and it derives the classic-filesystem case "by **row 1's mechanism** generalised", but row 1's mechanism is the directory-vs-file permission asymmetry — the block-release argument it means is row 2's own v4.0 paragraph two paragraphs down. | §10 O-11; §4.4 rung (ii) row note; v5.0 changelog note, SE F-27 bullet |
| F-31 | Low | Local | **TE F-39's narrowing is correct as a rule but its explanatory clause names only one of the three antecedents in the copy set, and the sub-claim it attaches is false on the other two.** §4.5: "A copy that fails BEFORE landing … never disturbs the consumer file, so a pre-existing entry over it is **still TRUE** and is NOT removed; **that row stays `stale`**, which plain sync repairs without `--force`." §5.5's bullet repeats it verbatim in substance. But §5.5's own copy set is `stale`, `missing`, and — under `--force` — `local-edit` and `unverified`. On a `--force` run over a **`local-edit`** row whose copy fails before landing: the row stays `local-edit`, not `stale`; the surviving entry is **not** "still true" in the sense the clause means (a `local-edit` row is by §3.3 rung 5's negation one whose `sha1(consumer) ≠ consumerHash` — the entry records the tool's last write, not the bytes on disk); and the repair does **still** require `--force`, contradicting "which plain sync repairs without `--force`". On a `missing` row there is typically no entry at all. The **rule** is right in every case (don't remove — the entry's truth value is unchanged by a write that never landed, and the row's classification is still the honest one), so nothing behavioral turns on this; but this is the same defect class as my v3 F-23 — an enumeration that names a subset and asserts a property of the whole — and it is now the sentence TSPEC will read for the not-removed branch. Fix: "…is not removed; the row keeps whatever state it had (`stale`, or under `--force` `local-edit`/`unverified`), which is the honest classification of bytes the run never changed." | §4.5 (recordable-failure contract box + the paragraph below it); §5.5 (the "sync manifest is updated per copied row" bullet) |
| F-32 | Low | Local | **The v5.0 note claims a TE Q-01 fix in §5.9 that the diff does not contain.** The note: "TE Q-01 (AC-3.7 byte-identity) — … the one uncovered case (a `--force` re-run re-attempting an `unverified`/`local-edit` row after the fault clears) **is now a sentence in §5.9** rather than left implicit". §5.9 is **byte-identical to v4.0** — I diffed `a81f387:…§5.9` against HEAD; there is no hunk, and no sentence anywhere in the document matches ("fault clears" and "re-attempt" appear only inside the changelog bullet itself, line 432). §5.9's existing AC-3.7 paragraph covers the *removal* case's interaction with byte-identity, which is a different case. This is Low because the claim it makes is true on the merits (a `--force` re-run that copies something is not a no-change re-sync, so AC-3.7's precondition does not hold), and because it is TE's finding to close, not mine — but a changelog that asserts a fix at a site with no fix is the one thing that makes the next reviewer's delta protocol unsound, and it is the second instance in this same note (F-30 is the first). Fix: add the sentence to §5.9, or restate the bullet as "answered in the review, no document change needed". | §5.9 (AC-3.7 block); v5.0 changelog note, TE Q-01 bullet |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.6 now says the ladder's `PDLC_FAULT` tokens are per-**guard**, and §10 O-10 makes the three ladder guards three enumeration entries. AT-16 (immutable file → rung (iii)) is the mirror fixture and, per §4.6's new prose, "needs the mirror case, both rungs faulted" — but AT-16's Given is still a **real** `chattr +i`/`uchg` file, not a fault-token pair, and the immutable attribute is itself a root-only setup on most runners. Is AT-16 therefore also an O-11 uid-0 / capability skip, or is it expected to be re-based on the fault seam the way AT-15 was? Not an FSPEC change either way — O-10/O-11 own it — but O-11's "named inventory" currently names only AT-14b, and if AT-16 needs a privileged setup it belongs in the same list, with the same "name the unverified invariant" discipline. |

## Positive Observations

- **This is what a micro-pass should look like.** Eleven hunks, every one of them at a site a review
  named, no restructuring, no AT added or renumbered, no REQ text touched, and a changelog block
  that maps finding id → site so the diff is auditable in one pass. The two Questions were answered
  *in the document* (§4.2 step 6, §4.6, O-10) rather than in the changelog, which is the distinction
  that determines whether TSPEC inherits the answer.
- **TE F-39 was fixed in the correct direction.** Two broad sites narrowed, eight narrow sites left
  alone. The tempting fix was to widen the eight to match the two — it would have been fewer words
  and it would have been wrong, because removing a pre-existing entry over a copy that never landed
  converts a repairable `stale` row into an `unverified` one that then needs `--force`. Grounding
  the narrowing on §4.3's per-row atomicity, rather than on "it seems safer", is what makes it
  checkable.
- **F-28's fix distinguished the success case from the failure case instead of search-replacing.**
  Three sites now say "this run's own post-run pass", and the *fourth* occurrence of "on the next
  run" — the one describing a **failed** removal — was deliberately left, with the reason stated.
  That is the harder and the correct reading of the finding.
- **The rung-table row note is the right shape for the exhaustiveness gap.** An eighth table row
  would have been wrong: the table is keyed on the cause of the atomic replace's failure, and
  `ENOSPC` is one cause with two regimes. A note that partitions the regimes and states the
  resulting rung for each keeps the table's key intact while closing O-5's inventory hole.
- **AT-35's TE F-40 fix improved on my v4 praise of it.** v4 said "exit 4 is reached under both wrong
  implementations"; v5.0 works out that direction (i) never populates `writeFailures` and therefore
  exits **1**, not 4, and ties it back to §5.8's exit-1 derivation. The instruction to assert
  post-run state survives with a corrected justification — the AT is now right about *which*
  observable catches *which* wrong implementation, which is the thing a PROPERTIES author needs.
- **The fault seam was made rung-granular without opening the token set.** §4.6 still pins exactly
  three things (the set is closed, it is rung-granular, unrecognised tokens do X) and still defers
  the vocabulary to O-10. Adding granularity as a *constraint on the enumeration* rather than by
  enumerating tokens here is the correct altitude, and it keeps NFR-6's "exactly two exceptions"
  argument intact.

## Recommendation

**Needs revision**

This is a mandatory verdict on a single Medium, not a judgement that the document is unready. Every
one of my v4 findings and both my v4 Questions were addressed, and the F-39 narrowing that arrived
in the same pass is consistent at all ten propagation sites — I re-walked each one. The document is
implementable today.

What must change is one clause:

1. **F-29 (Medium)** — AT-15's operation-token oracle is inverted against §4.5's own definition of
   those tokens as *failure* records. Assert `drift-state-replace` **and** `drift-state-invalidate`
   present (both attempts failed) and `drift-state-unlink` **absent** (rung (ii) landed), and fix
   the changelog sentence to match. Left as written, the AT's primary discriminating observable
   fails against a correct implementation, and the obvious repair grows a closed contract set.

The three Lows are polish and can be folded into the same edit or carried to TSPEC authoring:
**F-30** (§10 O-11 still carries F-27's overclaim; the changelog's reason for skipping it is
falsified by O-11's own text — plus two nits in §4.4's new row note), **F-31** (§4.5/§5.5's
not-removed clause names only the `stale` antecedent and asserts two sub-claims that are false on
the `--force` `local-edit` path), **F-32** (§5.9 has no hunk in this diff despite the changelog
claiming one).

Trajectory: 12H/10M → 4H/7M → 0H/1M → 0H/0M → **0H/1M**. The regression is a single inverted
polarity introduced by an otherwise-correct fix, and F-29's fix does not touch any other section.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 3}
