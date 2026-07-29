# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (Draft v4.0, 2026-07-28)
**Date:** 2026-07-28
**Iteration:** 4

**Scope of this review.** Testability only, delta-scoped against `git diff 0a6700b..a81f387`. REQ v17.0
is APPROVED with a binding stopping rule; §10 rows bound to TSPEC/PROPERTIES are downstream by design
and nothing below re-litigates REQ scope, need or phasing. `docs/_constraints/` and `docs/_decisions/`
still do not exist on this branch (consistent with O-13), so no `Cross-Feature` finding is raised on a
standing-constraint basis. I re-read only my v3 findings' target sections and v4.0's new material
(§1.2, §2.1, §2.4, §2.7, §3.4 R-3, §4.2 step 6, §4.4 honesty note + rung-(ii) table and its new row
note, §4.5, §4.6 inset, §5.5, §5.8, §5.9, §9 O-2/O-5/O-14, §10 O-11/O-19, §12 AT-14b/15/19/33/34/35),
plus §3.3's ladder and §5.5's copy loop as the arithmetic behind the shared Medium's fix.

**Disposition of my v3 findings — all six verified against the document, not against the note.**

| v3 ID | Sev | Verified disposition |
|---|---|---|
| F-33 (≡ SE F-22) | Medium | **Fixed, by my option 2, and the derivation is right.** I re-derived it: §3.3's ladder is `3 in-sync → 4 unverified (no entry) → 5 stale → 6 local-edit`, so removing the failed row's pre-existing entry lands rung 4 and yields `unverified`, exactly as §1.2, §3.4 R-3, §5.5 and AT-35 now say. The justification is the right one — `consumerHash` is a *provenance record of the bytes on disk*, so after a failed verification it is a **false** record, and deleting a false record is not the same act as discarding a true one. §1.2's worked trace is now in two explicit parts with the correct statement that neither half alone yields `unverified`; §4.2 step 6 carries the removal; §5.8's worked row and exit-1 derivation, §5.9's AC-3.7 clause, §9 O-14 and AT-35 all agree. SE Q-01 is answered inside the fix (one rewrite at step 6, not a §4.7 case, `sync-manifest-update` on failure with the residual named). **The fix itself is correct; its *scope* is stated three different ways across the sites — see F-39, which is the only thing standing between this document and approval.** |
| F-34 | Low | **Fixed.** AT-15's parenthetical now states the corrected routing (`EACCES`-on-parent with a writable file ⇒ rung **(i)**, that being AT-14b's fixture; only parent-unwritable **and** file-unwritable reaches rung (iii)). It no longer contradicts the table it cites. |
| F-35 | Low | **Fixed by narrowing the claim honestly, which is the disposition I asked for and the harder of the two.** Row 2's condition is now `ENOSPC`/quota **plus** a regime in which truncation does not free the needed space, with three named regimes (delayed allocation, COW-with-snapshot, quota-at-write), and §4.4's prose says plainly that on a classic filesystem the same `ENOSPC` lands at rung **(i)**. O-5's disposition is restated to match rather than left asserting the vacuous version, and AT-15 is re-grounded on the §4.6 fault seam so constructibility no longer depends on the runner's filesystem. §4.4's `checkEnabled` honesty note was rebuilt in the same terms (rung (i) = unwritable-parent only; rung (ii) = the narrowed `ENOSPC`; immutable/append-only/directory/read-only-mount preserve **nothing**, which is the AC-2.9(3) residual and is now said so). |
| F-36 | Low | **Fixed.** AT-33's Given leads with "a JSON tool **is** present", states why (E6 is indeterminate under `jsonToolAbsent`, where `json-tool-absent` outranks it), and cites AT-2's precedent. The fixture the whole F-16/SE-F-14 fix rests on can no longer report the wrong reason. |
| F-37 | Low | **Both halves fixed.** AT-34's Given now states the discriminating fact (consumer bytes **differ** from the plugin's, with the rung-3-before-rung-4 reason spelled out), and the unreadable/malformed disjunction is split into two separately-run fixtures with identical expectations so N-4 can fail independently for each. Keeping it as one AT is correctly argued — the AT-18a/AT-18b split existed because two exits cannot be one pass/fail, which does not apply here. |
| F-38 | Low | **Fixed.** AT-19's Then is `packagingViolations(liveRepoRoot) == ∅`, stated over the returned set, with the vacuity it closes named. It now matches AT-22's shape and AT-29's `clause` counterpart, and the live-root write prohibition survives as a second conjunct. |
| Q-01 | — | **Answered, and the answer is load-bearing enough to deserve the paragraph it got.** §2.4 states that under `repoRootUnresolved` the maintainer-marker branch is **not probed**, the empty string is **not** substituted, and resolution falls to the `${CLAUDE_PLUGIN_ROOT}` branch; §2.1's "E1 is independent of E2–E6" is refined to what it actually claims (free co-holding + determinacy). E3 stays determinate, so AT-33's fixture has a stated path. |
| Q-02 | — | **Answered in AT-14b** rather than by narrowing its scope: the extra `artifact-copy`/`backup` `writeFailures` entries on a sync run are expected, do not defeat the assertions (row 2 `proceed` outranks row 3), and hook/`--check` give the quietest form. Correct call — narrowing the AT would have lost the "any entrypoint" claim. |

I also verified the two dispositions of SE findings that touch testability: SE Q-02's uid-0 problem is
**routed, not re-engineered** — O-11 gains AT-14b in a *named* inventory with the exact invariants the
skip message must name (rung (i)'s `checkEnabled: false` preservation, §6.2 row 2's opt-out
reachability). That is the right handling of a fixture that is unconstructible on a class of runner:
the alternative — deleting the AT — would have left the claim unfalsifiable *silently* for the third
revision running. SE Q-03's answer (the throwing-`_readFile` assertion is a unit test at this feature's
call site, not a PROPERTIES row, because a throw is a property of the injected transport rather than a
value the validator receives) is correct and saves the PROPERTIES author a hunt for a row they cannot
write.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-39 | Medium | Local | **The entry-removal rule ships with two different antecedents, and the broad one deletes a *true* provenance record — inverting the principle the fix rests on.** Six sites scope the removal to **verification failure**: §5.5's normative box branch (`not equal → … any PRE-EXISTING entry for this row is REMOVED`), §1.2 ("after a failed verification"), §3.4 R-3 ("§5.5's **failed-verification** branch"), §5.9's rewrite trigger ("at least one row's copy **failed verification**"), §9 O-14 ("a copy **failing verification**") and AT-35. Two v4.0-added sites scope it to **any** artifact-copy failure: **§4.5**'s box — "for an **artifact-copy failure** over a row that HAD an entry, that pre-existing entry is REMOVED" — and **§5.5**'s summary bullet — "A row whose copy **failed** *or* whose copy failed verification gets no sync-manifest entry **and has any pre-existing entry removed**". The document itself distinguishes the two events (§5.5: "A failed copy does not abort the loop"), so the disjunction is deliberate wording, not shorthand. Under the broad reading the behavior is wrong, not merely different: §5.5 pins **per-row atomicity** (sibling temp + `mv`) and §4.7 pins "original UNTOUCHED" on failure, so a copy that fails *before landing* (temp write `ENOSPC`, `mv` refused) leaves the consumer file holding the **pre-sync bytes that the entry correctly describes**. Deleting it destroys a true record — the exact opposite of §5.5's stated principle ("`E.consumerHash` provably no longer describes those bytes") — and demotes the row `stale → unverified`, whereupon §5.5's own copy loop (`state ∈ {local-edit, unverified} and --force`) **refuses to repair it on a plain sync**: a transient, self-healing copy failure permanently strands the row behind `--force` plus a backup, and W-5 tells the operator the provenance is unverifiable when the tool knows exactly what the bytes are. The two readings are also formally contradictory: §5.9 rewrites the sync manifest only when a row was verified-copied **or** a row failed **verification**, so a run whose only failure is a pre-landing copy failure is required by §4.5 to remove an entry and required by §5.9 not to rewrite the manifest at all. **No AT discriminates** — AT-35's Given is a verification failure, so both readings pass it, and the choice falls to whichever sentence the implementer reads first. Fix (one clause, no new analysis, no new AT): scope both broad sites to verification failure — §4.5 "for a copy that landed and **failed verification**…", §5.5's bullet "A row whose copy failed gets no entry; a row whose copy **failed verification** additionally has any pre-existing entry removed" — since a pre-landing failure leaves a truthful entry and the correct next-run state is the unchanged `stale`, which plain sync *does* repair. | §4.5 (failure box, v4.0 lines); §5.5 (summary bullet "The sync manifest is updated per copied row"); cf. §5.5 box (d), §1.2, §3.4 R-3, §5.9, §9 O-14, AT-35; §5.5 copy loop; §4.7 |
| F-40 | Low | Local | **AT-35's new closing sentence is falsified by §5.8's own derivation.** AT-35 now says "Assert the post-run state explicitly, not merely the exit code — **exit 4 is reached under both wrong implementations**". It is not. Under red direction (i) — an implementation that copies without re-reading — there is no verification, so `writeFailures` stays **empty**; the post-run pass finds an entry over the truncated bytes, `sha1(consumer) == consumerHash`, bytes differing from the plugin ⇒ **`stale`** (§3.3 rung 5), and §5.8 states in terms that a `stale` row in a sync run's own record means exit **1**. So direction (i) exits **1** and direction (ii) exits **4**; the exit code *does* discriminate (i), and only (ii) needs the state conjunct. The instruction to assert the post-run state is still correct and the test is strictly stronger for it — this is a wrong reason attached to a right requirement, and a test author who trusts the sentence will build direction (i)'s red expectation around exit 4 and find it green-on-1. Restate as: "(i) is caught by the exit code alone (1, not 4 — §5.8); (ii) reaches exit 4 and is caught **only** by the post-run state, which is why the state conjunct is mandatory." | AT-35 (closing sentence); §5.8 (exit-1 derivation, "The case v2 missed"); §3.3 rungs 4–5 |
| F-41 | Low | Local | **AT-15's Then names which rung landed, but the two rungs leave byte-identical artifacts and no observable is stated.** Rung (i) writes the §4.4a **T2** invalidation record in place; rung (ii) `unlink`s and "write[s] it fresh" — §4.4's `checkEnabled` honesty note confirms rung (ii)'s fresh write preserves the same `checkEnabled`, so it is the *same* record. AT-15's Then ("rung (i) attempted and fails, rung (ii) `unlink` succeeds, fresh write lands") therefore has no artifact-level oracle: an implementation whose rung (i) *succeeded* produces a file indistinguishable from the one AT-15 expects, and the test passes on the wrong rung. Oracles do exist and the FSPEC should name one, because O-10 will otherwise have to reinvent it: (a) **stderr** — a rung-(i) failure is a §4.5 write failure with `operation: drift-state-invalidate`, stderr-only, so "stderr names `drift-state-invalidate` **and does not name** `drift-state-unlink`" is a positive two-sided oracle; (b) **inode identity** — rung (i)'s in-place `O_WRONLY|O_TRUNC` preserves `st_ino`, rung (ii)'s `unlink`+create does not, which is the cleanest discriminator and is derivable from the syscalls the table already reasons about; (c) the §4.6 trace seam. AT-14b has the same latent shape but is saved by its `checkEnabled: false` conjunct, which rung (iii) could not produce. One clause in AT-15's Then. | AT-15 (Then); §4.4 rungs (i)/(ii); §4.4a trigger T2; §4.5 (`drift-state-invalidate` / `drift-state-unlink` stderr-only operations) |
| F-42 | Low | Local | **AT-15's re-grounded Given needs rung-granular fault injection, and §4.6/O-10 still budget one token per AT.** AT-15's Given now injects `ENOSPC` "on *both* the atomic replace and rung (i)'s in-place write" while requiring rung (ii)'s `unlink` **and its fresh write** to succeed — three distinct write sites in one ladder, two faulted and one clean. §4.6 says the ATs "each need **one** [token] or a mount-level equivalent", and O-10's enumeration rule is "one token per **distinct guard**" without naming the ladder's guards; AT-16 (immutable) needs the mirror case, both rungs faulted. Neither is derivable from "one token per AT". This is the enumeration duty O-10 already owns, so the fix is a clause there rather than new machinery: state that the invalidation ladder presents **three** distinct guards (`drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink` — the operation names §4.5 already closes over), that a fixture may fault any subset, and correct §4.6's "each need one" to "one or more". Without it a TSPEC author enumerating one token per AT produces a set that cannot construct AT-15's Given at all. | §4.6 (`PDLC_FAULT` closure paragraph, "each need one"); §10 O-10; AT-15, AT-16; §4.5 operation set |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.9 now says AC-3.7 "is a property of a no-change re-sync — a run in which nothing was copied and nothing failed — not of a run that failed a write". I checked the removal rule against AC-3.7's byte-identity clause and it holds under that reading: after a verification failure the row is `unverified`, a plain re-sync copies nothing, the manifest is not rewritten, and byte-identity survives. But the reading narrows an approved AC's precondition ("Given a sync **completes**") by FSPEC prose, and there is one case it does not cover: a `--force` re-run *does* re-attempt the `unverified` row, so if the fault has cleared, the manifest changes on a run with no intervening operator change. That is the right behavior, but it is AC-3.7's stated shape being satisfied only under the narrowed reading. Is the narrowing worth a sentence in O-20's neighbourhood (so PROPERTIES asserts AC-3.7 over the no-failure run only), or is §5.9's sentence sufficient? Not raised as a finding — the reading is stated rather than assumed, and the behavior it licenses is correct. |

## Positive Observations

- **The shared Medium was fixed at its principle, not at its six symptoms.** Picking option 2 meant
  deciding *what `consumerHash` is for* — a provenance record of bytes on disk, therefore false once
  those bytes are gone — and then reading the consequence off §3.3's ladder. The propagation followed
  the principle rather than the wording, which is why §5.9's rewrite trigger and §4.2's step-6
  annotation were touched at all; a symptom-level fix would have edited AT-35 and §5.5 and left both.
  AT-35's two named red directions are the artifact I want most from this kind of fix: the AT now
  states *which wrong implementation each conjunct is red against*, so a reader can check the test
  discriminates rather than take it on faith. (F-40 is one wrong sentence inside that otherwise
  exemplary construction.)
- **F-35 was fixed the expensive way.** The cheap fix was to restate row 2's justification and move
  on. Instead §4.4 concedes the finding in full — rung (i)'s `O_TRUNC` frees blocks by the same
  mechanism as `unlink`, and rung (i) writes the *smaller* record, so on a classic filesystem rung
  (ii) has no cause — and then rebuilds the reachability claim on three named filesystem regimes, with
  O-5's disposition rewritten to match rather than left pointing at the vacuous version. Conceding
  that a disposition was vacuous, in the disposition cell itself, is what keeps §9 usable as a record.
- **SE Q-02's uid-0 problem was routed to policy instead of engineered around.** O-11 now carries a
  *named* inventory entry with the exact invariants AT-14b's skip message must print, and the row says
  why: "this claim has now been unfalsifiable across two revisions for two different reasons, which is
  precisely why the skip must be specific rather than categorical". A generic "permission fixture
  skipped" is how an invariant goes untested for a year; naming the invariant in the skip line is the
  cheapest possible fix and it is the right one.
- **AT-34's split respects the distinction the earlier splits were about.** Two separately-run
  fixtures (unreadable, malformed) under one AT id, with the rationale stated for *not* minting a
  second id — the AT-18a/18b split existed because two entrypoints with two exit codes cannot be one
  pass/fail, and that reason genuinely does not apply here. Splitting on the axis that matters
  (independent failure) without splitting on the axis that does not (report granularity) is the
  correct reading of the earlier finding rather than a mechanical application of it.
- **The lettering of §5.5's sub-steps (SE F-25) is a real testability fix, not cosmetics.** §4.2's
  step numbers are the vocabulary O-1/O-7's trace phases key to; a second, colliding 4–7 inside §5.5
  would have produced trace-label assertions that pass against the wrong phase. Stating *why* the
  renumbering is load-bearing is what stops it being undone by the next editor.
- **§2.4's answer to my Q-01 closes a hole I filed as a question rather than a finding.** "The empty
  string is **not** substituted, so the probe is never `/pdlc/workflows/build-runtime.mjs`" is exactly
  the sentence an implementer needed, and refining §2.1's independence claim to "co-holding and
  determinacy" is more honest than defending the stronger claim that was never quite true.

## Recommendation

**Needs revision**

One Medium stands between this document and approval, and — as last round — it is a scoping clause,
not new analysis. **F-39:** the entry-removal rule the v4.0 pass added is stated with two different
antecedents. Six sites say *verification failure*; §4.5's box and §5.5's summary bullet say *any
artifact-copy failure*. Under the broad reading a copy that fails **before landing** — the consumer
file untouched, holding pre-sync bytes the entry describes correctly — has a **true** provenance
record deleted, the row drops `stale → unverified`, and §5.5's own copy loop then refuses to repair it
without `--force`. It also contradicts §5.9, which rewrites the manifest only for a verified copy or a
verification failure. No AT discriminates the two readings, so this ships as whichever sentence the
implementer reads first. Scope the two broad sentences to verification failure and the rule is
consistent everywhere.

The three Lows are one clause each and none needs new work: AT-35's closing sentence contradicts
§5.8's own exit-1 derivation (F-40), AT-15's Then names a rung with no stated observable when both
rungs write the same record (F-41), and §4.6/O-10's one-token-per-AT budget cannot construct AT-15's
new Given (F-42).

Everything I filed in v3 is genuinely fixed, verified against the document and — for F-33 — against
§3.3's ladder arithmetic rather than against the disposition note. The six ATs that gained conjuncts
each still have a constructible fixture and a falsifiable Then (AT-14b subject to O-11's now-named
uid-0 skip; AT-15 subject to F-41/F-42), and the entry-removal rule holds against AC-3.7's
byte-identity clause under §5.9's stated reading (Q-01). Blocking counts have descended
12H/10M → 4H/7M → 3H/3M → 0H/1M → **0H/1M**. With F-39 scoped, this document meets the Phase F bar.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 3}
