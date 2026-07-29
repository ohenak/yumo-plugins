# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (Draft v5.0, 2026-07-28)
**Date:** 2026-07-28
**Iteration:** 5

**Scope of this review.** Testability only, delta-scoped against `git diff a81f387..1cdccf3` (the v5.0
micro-pass). REQ v17.0 is APPROVED; §10 rows bound to TSPEC/PROPERTIES are downstream by design and
nothing below re-litigates REQ scope, need or phasing. `docs/_constraints/` and `docs/_decisions/`
still do not exist on this branch (consistent with O-13), so no `Cross-Feature` finding is raised on
a standing-constraint basis. v5.0 touched only the sites my v4 findings and SE's v4 findings/questions
name, so I re-read exactly those: §2.7's closing paragraph, §3.4 R-3, §4.2 step 6's box, §4.4's
honesty note and the new rung-(ii) row note, §4.5's failure box + explanatory paragraph, §4.6's seam
table and closure paragraph, §5.5's summary bullet and SE Q-01 paragraph, §5.8's exit-1 derivation,
§5.9, §10 O-10, AT-15, AT-35 — plus, as the authorities each edit must agree with, §1.2, §3.3's
ladder, §4.4a's `writeFailures` filter and §4.5's closed `operation` set.

**Disposition of my v4 findings — verified against the document, not against the v5.0 note.**

| v4 ID | Sev | Verified disposition |
|---|---|---|
| F-39 | Medium | **Fixed, and fixed in the correct direction — by narrowing the two broad sites, not by widening the six narrow ones.** Both formerly-broad antecedents now read verification-failure-only. §4.5's contract box: "for a copy that **LANDED and then FAILED VERIFICATION** … that pre-existing entry is REMOVED … A copy that fails **BEFORE landing** (the temp write, or the atomic replace itself — §4.3's per-row atomicity) never disturbs the consumer file, so a pre-existing entry over it is still TRUE and is NOT removed; that row stays `stale`, which plain sync repairs without `--force`." §4.5's explanatory paragraph carries the same split. §5.5's summary bullet is re-split into two clauses — "a row whose copy failed gets **no** sync-manifest entry (AC-2.9(2)); a row whose copy **failed verification** additionally has any pre-existing entry **removed**" — with the pre-landing case named and its `stale`/plain-sync consequence stated. **Oracle-consistency re-derived, not taken on trust:** a pre-landing failure leaves the consumer file at its pre-sync bytes, which is exactly what the surviving entry's `consumerHash` records, so §3.3 evaluates rung 3 no (bytes ≠ plugin), rung 4 no (entry exists), **rung 5 yes** ⇒ `stale`; §5.5's copy loop copies `stale` on a **plain** sync (backup first, §4.7), so the row is self-healing on the next run and never falls into the `{local-edit, unverified} + --force` arm. The formal contradiction I filed is gone: §5.9's rewrite trigger ("at least one row was **verified-copied**, **or** at least one row's copy **failed verification**") now has the same antecedent as §4.5, so a run whose only failure is pre-landing rewrites nothing and removes nothing — no site requires both. §9 O-14 (§5.8) and §4.2 step 6's box were already narrow and still are; §3.4 R-3 still says "failed-verification branch". **AT-35 does not contradict the narrowing** — its Given fault-injects a **truncated prefix that lands**, i.e. squarely the verification-failure case, so it exercises the surviving broad-free rule and says nothing about the pre-landing case. |
| F-40 | Low | **Fixed, with each direction's exit derived rather than asserted.** AT-35's closer now reads: direction (i) (copies without re-reading) never triggers `writeFailures`, the entry records the written bytes' own hash, and the post-run pass finds entry + bytes ≠ plugin + `sha1(consumer) == consumerHash` ⇒ **`stale`** ⇒ exit **1**, "caught by the exit code alone"; direction (ii) reaches exit **4**, the same code as the correct implementation, "so only the post-run state (`local-edit` vs. the correct `unverified`) discriminates it". I checked this against the two authorities rather than against the note: §1.2 ("`consumerHash` records the bytes the sync **wrote**" and its worked bullet "if a truncated copy *were* recorded … ⇒ **`stale`**, not `local-edit` and not `unverified`") and §5.8's "The case v2 missed" bullet derive the same `stale`/exit-1 outcome. The three now agree, and the mandatory post-run-state conjunct survives with the right justification attached. |
| F-41 | Low | **Not fixed — the added stderr conjunct is inverted against §4.5's own token semantics. See F-43.** The inode cross-check half *is* correct and, on its own, would have closed this finding. |
| F-42 | Low | **Fixed, at the two places that had to move together.** §4.6's seam table now says "one token still injects exactly one fault, but the set is **rung-granular** for the invalidation ladder … a fixture can compose multiple tokens", the closure paragraph changes "each need one" → "each need one **or more** tokens", names the three independently-faultable guards (`drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink`), and states AT-15 faults the first two while AT-16 needs both rungs faulted. §10 O-10 records the per-rung granularity as a first-class enumeration duty ("three distinct entries in this enumeration, not one"), which is where it had to land — a TSPEC author enumerating one token per AT now cannot produce a set that fails to construct AT-15's Given. The "one fault per run per token" invariant is preserved (composition is at the fixture level, not inside a token), so NFR-6's "exactly two exceptions" argument is untouched. |
| Q-01 | — | **Answered in the v5.0 note, but the answer was not written into the document. See F-44.** |

I also spot-checked the two SE dispositions that touch oracles. **SE F-27** (the "only cause under
which rung (i) lands" overclaim) is fixed at all three carrying sites, and the new §4.4 row note makes
the rung table **exhaustive over `ENOSPC`** (classic filesystem ⇒ rung (i); delayed-allocation /
COW-snapshot / quota-at-write ⇒ rung (ii)) — which matters for testability because AT-14b and AT-15
share a cause and are now separated by a *stated* regime rather than by a fixture accident. **SE F-28**
(removal visible in this run's own post-run pass, not "the run after") is fixed at §3.4 R-3, §5.8 and
§5.5, and correctly **not** applied to §5.5's residual sentence, where a *failed* removal genuinely
does leave the fix to a later run. Both are consistent with AT-35, which already asserted the
same-run post-run state.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-43 | Medium | Local | **AT-15's new stderr conjunct is unsatisfiable by a conforming implementation — the operation-token polarity is inverted against §4.5's closed set.** §4.5 fixes the semantics without ambiguity: `operation` is "the closed nine-member set", of which `mkdir`, `drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink` are "**stderr-only** — they describe a **failure** of the record itself, so they cannot be *in* the record", and §4.4a's `writeFailures` filter repeats it verbatim ("**describe failures *of the record itself***"). §4.5's both-failed message renders it: "`could not be written (operation: drift-state-replace)`". A token therefore names a write that **failed**, never one that succeeded. AT-15's fixture is: atomic replace faulted, rung (i)'s in-place write faulted, **rung (ii)'s `unlink`+fresh write left clean**. Under a conforming implementation stderr therefore names `drift-state-replace` and `drift-state-invalidate`, and **cannot** name `drift-state-unlink` — nothing failed there. AT-15's Then asserts the exact reverse: "`drift-state-unlink` **is** named and `drift-state-invalidate` is **not** (the reverse pairing would instead confirm rung (i) landed)". Both conjuncts are false against the correct implementation, so the AT as written is **red against conformance** — and the parenthetical inverts the rule a second time, since `drift-state-invalidate` present means rung (i) **failed**, which is precisely AT-15's expected path. (The v5.0 disposition note is inverted a third way: it says the oracle is "`drift-state-invalidate` present, `drift-state-unlink` absent, **confirms rung (i) landed**" — the right two tokens, the wrong conclusion, and the opposite conjuncts to the AT it claims to describe. Note and AT do not agree with each other, let alone with §4.5.) This is not merely a failing test: the cheapest way to make AT-15 green is to emit `drift-state-unlink` on a **successful** unlink, which would put a success marker into a set §4.4a's emitter filters as failures and would break the "every other observable is identical with the seams on or off" property. **Fix, one clause, no new analysis:** restate AT-15's Then as "stderr names `drift-state-invalidate` (rung (i) attempted **and failed**) and does **not** name `drift-state-unlink` (rung (ii) succeeded, and these tokens report failures only — §4.5)", and correct the note's conclusion to match. If it is not established that a *recovered* ladder still prints the failed rungs' tokens (the FSPEC states the drift-state failure line for the entered ladder and N-3 only at rung (iii)), the alternative one-clause fix is to **drop the stderr conjunct entirely** and rely on the inode-identity conjunct, which already discriminates the two rungs correctly and is stated correctly. Either fix closes v4's F-41; what must not ship is an oracle whose polarity contradicts §4.5. | AT-15 (Then, "Discriminating observable (TE F-41)"); §4.5 (closed nine-member `operation` set, "describe a failure of the record itself"); §4.4a (`writeFailures` filtering, TE Q-04); §4.4 rungs (i)/(ii)/(iii); §8.3 N-3; v5.0 note, TE F-41 disposition |
| F-44 | Low | Local | **The v5.0 note claims a §5.9 edit that was not made.** The TE Q-01 disposition states the uncovered `--force`-re-run case "**is now a sentence in §5.9** rather than left implicit". §5.9 is unchanged in the v4→v5 diff and contains no such sentence: its AC-3.7 paragraph still ends at "…not of a run that failed a write". The substance is inert for oracles — AC-3.7's own precondition is "no intervening change **from any source**", and a `--force` re-run of a repaired row is an intervening change by that wording — so this is a note-accuracy defect, not a behavioral gap, and I am not re-raising Q-01. But a disposition note is the record the next reviewer and the PROPERTIES author read for *what the document now says*; v4's note is the reason I re-verified every claim against the document this round, and this is the one claim that did not hold. Fix: either add the sentence, or restate the note as "answered in this note; §5.9's existing precondition already covers it". | v5.0 note (TE Q-01 disposition); §5.9 (AC-3.7 paragraph) |
| F-45 | Low | Local | **AT-15's Given uses a binary connective over three guards.** "a fixture may fault **either or both** of the three guards" — "either/both" ranges over two, the sentence names three, and §4.6's own wording is the correct one ("a fixture may fault **any subset** of them"). AT-15 itself is unambiguous in context (it names the two it faults and the one it leaves clean), so no fixture is misconstructible from this; it matters only because §10 O-10 must enumerate against a rule stated once, and a TSPEC author reading "either or both" could reasonably close the ladder's fault space at pairs and never write AT-16's both-rungs-faulted mirror case. One word: "any subset". | AT-15 (Given); §4.6 (closure paragraph, "any subset"); §10 O-10 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does a ladder that **recovers** at rung (ii) print anything on stderr at all? §4.5's both-failed message is specified for a drift-state failure *plus* a row-write failure; N-3 is explicitly "ladder rung **(iii)**"; §12 AT-16 (the rung-(iii) case) asserts N-3 while AT-14b (rung (i) succeeds) asserts nothing on stderr. If a recovered ladder is silent, then `drift-state-invalidate` is an **unemittable** member of §4.5's closed nine-member set on every path — which would make F-43's first fix option unavailable and the inode-only oracle mandatory, and would also give §10 O-10 an enumeration entry no fixture can ever observe. This is answerable in one sentence at §4.4 (rung (i)'s failure is/is not announced when rung (ii) recovers) and it decides which of F-43's two fixes is correct; it is not itself a finding, because either answer yields a constructible AT-15. |

## Positive Observations

- **F-39 was fixed in the direction that preserves the principle rather than the sentence count.**
  Six narrow sites and two broad ones is normally resolved by making the six broad — one edit instead
  of two. v5.0 did the opposite and stated *why* the narrow reading is the true one: a copy that
  fails before landing leaves bytes the entry still truthfully describes, so removing the entry would
  destroy a **true** provenance record, which is the exact inverse of §5.5's justification for
  removing a false one. Both new sentences carry the `stale`-stays-plain-sync-repairable consequence,
  which is the part a test author needs and the part a scoping edit usually drops.
- **AT-35's exits are now derived from §1.2 and §5.8 rather than asserted.** The closer names each
  wrong implementation's *actual* exit (1 for (i), 4 for (ii)) and, more usefully, names *which
  observable catches which* — exit code alone for (i), post-run state alone for (ii). That is the
  shape I want every two-direction red test to have: a reader can now check that the conjunct set
  discriminates, instead of trusting that it does. The fix also resisted the easy move of deleting the
  contested sentence; keeping it and correcting it is what keeps the mandatory state conjunct
  motivated.
- **F-42 landed at O-10, not only at §4.6.** The FSPEC could have satisfied the finding by editing
  "one" to "one or more" in one paragraph. Instead the three ladder guards are named as three
  distinct enumeration entries in the obligation row that TSPEC actually reads, with AT-15 and AT-16's
  differing subsets cited as the reason. That is the difference between a wording fix and a fix that
  survives into the document that consumes it.
- **§4.4's new row note makes the rung table exhaustive over a cause, not merely correct about one
  case.** "Classic filesystem ⇒ rung (i); delayed-allocation / COW-snapshot / quota-at-write ⇒ rung
  (ii)" converts a fixture hazard (AT-14b and AT-15 sharing `ENOSPC` with different expected rungs —
  the v2.0 defect) into a stated partition. A TSPEC author can now pick the regime deliberately
  instead of discovering it from a flaky runner.
- **SE F-28's fix was applied to three sites and correctly withheld from a fourth.** §5.5's residual
  sentence — a *failed* removal leaves the fix to the next run — is genuinely a next-run claim, and
  leaving it alone while rewriting its three neighbours is the reading that keeps the distinction
  between "removal succeeded" and "removal failed" testable as two different post-run states.

## Recommendation

**Needs revision**

One Medium, and it is the only thing standing between this document and approval. **F-43:** the
stderr oracle v5.0 added to AT-15 to close my v4 F-41 is **inverted** against §4.5's own definition of
the operation tokens. §4.5 (twice) and §4.4a (again) state that `drift-state-replace` /
`drift-state-invalidate` / `drift-state-unlink` name a write that **failed**; AT-15's fixture leaves
rung (ii) clean; so a conforming implementation names `drift-state-invalidate` and cannot name
`drift-state-unlink`, while AT-15 asserts precisely the reverse. As written the AT is red against
conformance, and the cheapest way to green it — emitting a token on a **successful** unlink — would
corrupt the closed set that §4.4a's emitter filter depends on. Fix is one clause: flip AT-15's two
conjuncts (and the note's conclusion) to the failure polarity, or drop the stderr conjunct and keep
the inode-identity conjunct, which is stated correctly and discriminates the two rungs on its own.
Either option closes v4's F-41.

Everything else in the v5.0 pass is verified fixed against the document: **F-39** at both broad sites,
with §5.9's rewrite trigger, §9 O-14, §3.4 R-3 and §4.2 step 6 in agreement and the pre-landing case
re-derived to `stale`/plain-sync-repairable off §3.3's ladder and §5.5's copy loop (AT-35 does not
contradict it — its copy lands); **F-40** with both directions' exits derived from §1.2 and §5.8;
**F-42** at §4.6 and §10 O-10 with per-rung granularity recorded where TSPEC will read it. The two
Lows are one clause and one word. Blocking counts: 12H/10M → 4H/7M → 3H/3M → 0H/1M → **0H/1M**. With
F-43's polarity corrected, this document meets the Phase F bar; nothing else I have is worth another
round, and F-44/F-45 can ride along or be left to TSPEC authoring.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 2}
