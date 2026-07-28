# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (v3.0, Draft)
**Date:** 2026-07-28
**Iteration:** 3
**Prior review:** `CROSS-REVIEW-software-engineer-FSPEC-v2.md` (1H/4M/3L)
**Diff reviewed:** `6f4b39b..0a6700b` (+647/−167)
**Scope of review:** technical feasibility and implementability only. REQ v17.0 is APPROVED under a
binding stopping rule; scope, need, priority and phasing are not re-litigated, and REQ §10 rows whose
"Lands in" is TSPEC/PROPERTIES are treated as discharged downstream by design. Per the delta protocol
I re-read only the changed sections, plus every section a changed section makes a claim about.

## Disposition of my v2 findings

| v2 ID | Claim | Verdict | Evidence |
|---|---|---|---|
| F-14 (H) | No-write guard keyed on the *selected reason*, not the *condition* | **Genuinely fixed, and fixed at every site** | §2.1 states it as a normative, condition-keyed block quote ("whenever the E1 evidence `repoRootUnresolved` **holds** … regardless of which reason §2.1 Phase 2 selected"). §4.2's step block gains the `steps 3-9 are SKIPPED ENTIRELY` rule line and a paragraph naming the two implementations v2 left an implementer to invent (`$PWD` or silent skip). §5.1 exception 1 is reworded to the condition and adds the disjointness argument against exception 2. §2.8's table gains "Anything written?" and "`--check` exit" columns and a third co-holding row (`+ manifestAbsent`, the ordinary first-release case). §5.8 gains the exit row (**3**, never 4). §5.9's AC-3.8 row is restated. N-8 gives the state a positive observable, narrowly scoped so it never duplicates W-1. AT-33 is the fixture, AT-2 correctly keeps the *selected*-reason Given, AT-3 names a resolved root so its empty record stays attributable. I traced the guard through §2.1 → §4.2 → §5.1 → §5.8 → §2.8 → §5.9 and they now say one thing. Residual: one unqualified bullet in §5.5 — F-24, Low |
| F-15 (M) | §5.7's step-5 re-classification was a hidden third pass | **Genuinely fixed by naming it, not by hiding it** | §3 gains a second table (pass / step / scope / purpose / feeds) and the entrypoint table now reads **3** for sync. §5.7's bullet is retitled to the POST-COPY pass and states why it must be distinct from step 7 (step 5's deletions must be visible to step 7). §4.2's step block labels passes 1/2/3 inline. §13.1's NFR-2 bound is corrected to `2 × (2 × \|rows\| + \|retiringRows\|)`, worst case `2 × 3 × \|rows\|` — **arithmetic re-derived by hand and correct**, and the per-row refinement (post-copy re-classifies only retiring rows, so the ordinary run really is `2 × 2 × \|rows\|`) is an honest refinement rather than padding. O-1's contribution column now requires **three** distinct trace labels and states the concrete failure of a two-label vocabulary (an oracle that accepts the post-copy pass as the as-found one). §4.6 carries the three labels into O-7 |
| F-16 (M) | D8 made `syncCommand` a hard gate above the opt-out; §6.2's row-2 bullet was false | **Both halves fixed** | D8 now reads "`syncCommand`, *if present*, is `null`-or-string — its absence is tolerated and read as `null`". §6.2 gains a "Why D8 tolerates an absent `syncCommand`" paragraph naming the OQ-5 coupling. §1.3 gains the reader-tolerance bullet. §6.3's `null` fallback is extended to "`null` **or absent**". The row-2 bullet now reads "above every blocking row *except row 1*", argues **why** row 1 must outrank it (an unparseable record cannot yield a trustworthy `checkEnabled`), and names the cost of v2's widening rather than leaving it implicit. AT-36 pins the absent-`syncCommand` opt-out. The disposition is the stronger of the two I offered |
| F-17 (M) | M10 bounded the directory but not its own state namespace | **Genuinely fixed** | M10 is restructured into three clauses; (b) reserves the `.pdlc-` basename prefix for both `consumerPath` and `retires` members, and (c)'s claim that clause (a) already excludes `.pdlc-backups/` **is derivable** — (a) permits exactly one path segment after the prefix, so any path inside a subdirectory fails it. The "Why clause (b)" paragraph reproduces the M6-governs-the-union-namespace gap correctly. Cross-checked against the real tree: no bundle or retired name begins `.pdlc-`, so the clause costs nothing today |
| F-18 (M) | §5.8's "exit 1 unreachable on sync" was falsified by §4.2's own truncated-copy argument | **Fixed in the right direction — but the fix has a defect of its own: F-22 (Medium)** | The direction Q-02 offered was taken: §5.5 mandates post-copy re-read-and-hash against `pluginSha1`, §4.2's justification is corrected from `local-edit`/`unverified` to **`stale`**, §5.8's claim is weakened to a conditional and its downstream instruction rewritten from a prohibition to a two-part diagnosis, §1.2 gains the worked trace, O-14's disposition is rewritten, AT-35 is the fixture. The `operation` set correctly stays at the approved nine. **However, the post-verification-failure row state asserted in six places is wrong whenever the row had a prior sync-manifest entry — see F-22** |
| F-19 (L) | "Three of §4.5's nine" listed four | **Fixed** — §4.4 and §9 O-4 both say four, with the arithmetic and the reason the count is stated |
| F-20 (L) | §2.1 Phase 2's false universal | **Fixed** — the universal is dropped and replaced by the two named dependency edges (E2→E5/E6 argued by ranking, E3→E4 argued by reachability). Both arguments check out against §2.8's declared order |
| F-21 (L) | `NN` exhaustion is 99, not 100 | **Fixed** — §1.4 now says 99 and cites §5.6's agreement |
| Q-01 | OQ-6's owner unreachable under the stopping rule | **Taken, and better than I asked for** — new §10 **O-20** makes the reading a PROPERTIES entry obligation with three concrete assertions (a)(b)(c), and §11's OQ-6 splits the ownership into a binding downstream half and an optional upstream half |
| Q-02 | Is the copied file's hash compared before the sync-manifest entry is written? | **Answered: yes** — §5.5's new block. See F-22 for what the answer left open |
| Q-03 | D7 did not close `supersedingState` | **Taken** — D7 now requires one of the six closed states, and also tightens `path`/`supersededBy` to non-empty strings |

## Verification performed this round

**The pm-author's independent POSIX claim is correct**, and it is the load-bearing premise of the
AT-14b re-basing, so I checked it rather than accepting it:

- `open(path, O_WRONLY|O_TRUNC)` on an **existing** file is an access, not a directory-entry
  mutation, so the kernel checks the **write bit on the inode**. Directory write permission is
  required only to *create*, *unlink* or *rename* an entry. §4.3's atomic path does all three
  (sibling temp create + `mv`), which is why it needs the directory and rung (i) does not. The
  asymmetry is real and is exactly the one the corrected table names.
- The fixture's `r-x` mode on `.claude/workflows/` retains the **search (x)** bit, which path
  resolution to the drift-state file does require. Had the FSPEC written `r--` the fixture would be
  unconstructible for a different reason. It wrote `r-x`. Correct.
- Consequence for O-5: the corrected seven-row table is right on every row I checked
  (`ENOSPC` → in-place also fails for want of space but `unlink` needs none → rung (ii);
  `chattr +i`/`uchg` → `EPERM` on both; append-only → `EPERM` on `O_TRUNC`; directory-at-path →
  `EISDIR`; `EROFS` → both). The "parent unwritable **and** file unwritable" row is correctly kept
  as the rung-(iii) case v2 conflated with the new row 1.
- One consequence the table does not state — raised as Q-02 below, not as a finding, because O-11
  already owns the policy: under **uid 0** the permission bits are bypassed entirely, so rung (i)'s
  *only* constructible cause vanishes and AT-14b is unrunnable there.

**Existing-code claims (single batched pass, all verified against HEAD):**

- `runtime-adapter.js:85–96` — `rtReadFile` has **no `try`/`catch`**; it returns `null` in exactly
  two cases (`typeof out !== "string"`, and `out.trim() === RT_MISSING`). §6.1's rewritten item 1
  and its three-row outcome table are **accurate**, and v2's inherited claim ("`null` for every
  transport failure") — which I introduced in v1 and retracted in v2 — is correctly superseded with
  a do-not-cite note on the v2.0 changelog entry. This is the right way to kill a claim that has
  already propagated.
- `orchestrate-queue.js:523` — `const queueText = await readFileFn(queuePath);`, unwrapped, exactly
  as §6.1 states. §6.1's decision to leave it alone (it is another feature's path) and to wrap only
  this feature's own read is correct scoping.
- `build-runtime.mjs:132` — `_readFile: rtReadFile`. `RT_IO_MODEL = "haiku"` at
  `runtime-adapter.js:42`. Both as cited.
- The current `.claude/workflows/` really does hold `orchestrate-dev.js` / `orchestrate-queue.js`
  beside the two `.bundle.js` artifacts, so §5.7's retirement story and AT-11/AT-12 are grounded in
  the actual tree rather than a hypothetical.

**Arithmetic and structure re-derived:** §13.1's NFR-2 bound (above); M10 clause (c)'s derivation
from clause (a); §2.8's precedence list against all seven worked rows; §3.3's ladder against AT-35's
post-run row (this is where F-22 comes from).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-22 | Medium | Local | **A copy that fails §5.5's new verification leaves the row's *prior* sync-manifest entry in place, so the post-run pass measures it `local-edit` — not `unverified`, which six places in v3.0 assert.** Trace AT-35's own Given through the document. "one row `stale`" means, by §3.3 rung 5, that a sync-manifest entry `E` exists with `E.consumerHash == sha1(pre-sync consumer bytes)` — rung 4 has already excluded the no-entry case. Plain sync backs the row up, copies, the copy truncates, §5.5's re-read catches it, and the row gets **no *new*** entry. But nothing **removes `E`**: §5.5 says only "no sync-manifest entry for this row", and §5.9/§1.2's AC-3.7 clause states that "the sync manifest is only rewritten when at least one row was copied", so on a run whose only copy failed verification the file is not rewritten at all and `E` survives byte-for-byte. Now run §3.3 at step 7: P3 yes (the truncated file exists), bytes ≠ plugin (rung 3 no), P6 **has** an entry (rung 4 no), `sha1(consumer)` = hash of the truncation ≠ `E.consumerHash` = hash of the pre-sync bytes (rung 5 no) ⇒ **rung 6, `local-edit`**. The six sites that say otherwise: AT-35's Then ("measures that row **`unverified`** — it has no sync-manifest entry to compare against" — it has one); §1.2's new "A truncated copy never reaches this file" paragraph ("the row stays `unverified`"); §5.5's "With it, the row has no entry, measures `unverified`, and 4 dominates"; §5.5's bullet "keeps a failed copy from later masquerading as `stale` instead of `unverified`" (it now masquerades as `local-edit`); §5.8's new worked row ("that row `unverified`"); and O-14's rewritten disposition. **The exit code survives** — `writeFailures` is non-empty so 4 dominates on the failing run, and F-18's exit-1 closure therefore still holds — but the *next* run is the damage: `--check` reports `local-edit`, §5.2 W-4 is by construction the message that **does not recommend plain sync** and points at `--force`, so the tool tells the operator they hand-edited a file the tool itself truncated, and refuses to repair it without a flag. That is a worse outcome than the `stale` misclassification F-18 was raised to prevent. **Fix (one clause, and the document is otherwise ready):** make the failure branch of §5.5's block **remove any pre-existing sync-manifest entry for the row** — the recorded `consumerHash` provably no longer describes the bytes on disk, so retaining it is retaining a false provenance record — then AT-35's `unverified` and all five prose sites become true as written. (This does not disturb AC-3.7: that property is about a *no-change* re-sync, not about a run that failed a write.) The alternative — accept `local-edit` and correct the six sites — is worse, because it hands the operator W-4's guidance for a fault the tool caused. | §5.5 (post-copy verification block + the two bullets), §1.2, §5.8 (worked row + derivation), §9 O-14, AT-35, §3.3 rungs 4–6 |
| F-23 | Low | Local | **§2.7's closing sentence still names the three causes that v3.0's own corrected rung table routes away from rung (i).** "§4.4 is corrected to match: rung (i) preserves a genuinely-`false` `checkEnabled` in the **`ENOSPC`/immutable/read-only-mount** cases". The corrected §4.4 table sends `ENOSPC` to rung **(ii)**, immutable to **(iii)** and read-only mount to **(iii)** — none of the three reaches rung (i). After the TE F-17 fix the *only* cause under which rung (i) lands is the unwritable-parent/writable-file asymmetry, which is why AT-14b was re-based onto it. This is the same defect class TE F-17 raised (a preservation claim with no constructible cause), resurrected one section away from where it was fixed, and §2.7 is the section an implementer reads for the opt-out-survival rule. Replace the three cases with "the unwritable-parent case (§4.4 rung (i), AT-14b)". The propagation is otherwise complete — §4.4, §6.2, §9 O-5, AT-14b and AT-15 all agree. | §2.7 (final paragraph), §4.4 rung (ii) table |
| F-24 | Low | Local | **§5.5's last bullet still asserts the drift-state write unconditionally for the unresolved baseline.** "**Unresolved baseline:** copy nothing, retire nothing, print the manifest-level reason + remediation, **still rewrite the drift state** (AC-2.7, AC-3.1)." Every `repoRootUnresolved` run has an unresolved baseline (Phase 2 always selects *some* reason when the condition holds, so the fall-through to `resolved` is unreachable there), and in exactly those runs the drift state must **not** be written. The bullet is the one site in the F-14 sweep that kept v2's unqualified phrasing. It is Low rather than Medium only because §2.1's rule is stated as overriding, §4.2 puts the whole of steps 3–9 out of scope, and §5.1 exception 1 names this as an exception to precisely this rule — but the bullet is inside the sync procedure an implementer transcribes, and it says the opposite. Add "— unless `repoRootUnresolved` holds (§2.1's no-write-target rule), in which case nothing is written". | §5.5 (final bullet), §2.1, §5.1 |
| F-25 | Low | Local | **§5.5's post-copy verification block re-uses step numbers 4–7 that mean something different from §4.2's steps 4–7, and cross-references across the collision.** The block is numbered `4. mv temp → consumerPath … 5. RE-READ … 6. compare … 7. equal → step 6 of §4.2 writes its sync-manifest entry`. In §4.2, step 4 is the whole copy loop, step 5 is retirement, step 6 is the sync-manifest update and step 7 is the post-run pass — so local "5" (re-read) and global "5" (retirement) collide, and local "7" points at global "6". Since §4.2's ten steps are the document's ordering vocabulary and O-1/O-7's trace phases are keyed to them, a second 4–7 sequence in the procedure §4.2 step 4 expands is a transcription hazard for exactly the reader who is building the trace oracle. Renumber the block (a)–(d), or state it as prose. | §5.5 (verification block), §4.2 step list |
| F-26 | Low | Local | **Two stale `AT-18` references survive the AT-18a/AT-18b split.** §4.6's "v1 deviated here" inset says "**AT-18 changes with it** — `--check` … now exits **4**", and §9's O-2 disposition ends "the FSPEC conforms to the approved REQ; **AT-18 changed with it**". The `--check` half is AT-18**b** now; §12 has no AT-18. Both are historical insets rather than normative clauses, which is why this is Low, but O-2's disposition cell is what a reviewer of the *next* document checks the obligation against, and it cites an AT number that no longer exists. | §4.6 (inset), §9 O-2, §12 AT-18a/AT-18b |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On the F-22 fix: if the failed-verification branch removes the row's pre-existing sync-manifest entry, that is a sync-manifest **write** on a run whose only copy failed. Does that write itself go through §4.7's verified-write discipline (and therefore have its own failure branch), or is it best-effort with the row falling back to `local-edit` if the removal cannot be written? I do not think this needs a new `operation` value — `artifact-copy` already covers the failed row — but the FSPEC should say which, because "could not remove the stale entry" is the one path back into the misclassification F-22 describes. |
| Q-02 | §4.4 rung (i)'s only constructible cause is now a permission asymmetry, which **uid 0 bypasses entirely**: under root the atomic replace succeeds and the ladder is never entered, so AT-14b — O-4's mandated rung-(i) test, and the sole falsifiable form of the `checkEnabled: false` preservation claim and of §6.2 row 2's reachability — cannot run. O-11 already mandates that uid-0 runners *skip loudly and name the unverified invariants*; should §4.4's rung table (or AT-14b's Given) name this specific invariant, so the skip message says "rung (i) preservation of `checkEnabled: false` is unverified on this runner" rather than a generic permission-fixture skip? The v2 → v3 history is the argument: this claim has now been unfalsifiable for two revisions for two different reasons. |
| Q-03 | O-19 duty (d) requires the drift-state read to be wrapped so a throw maps to §6.2 row 1, and D1 encodes it ("did not throw … normalised to the same outcome by O-19(d)"). But O-19's "Lands in" is *TSPEC / implementation phase*, so PROPERTIES has no entry obligation for it, while D1 — a clause PROPERTIES **will** test — depends on it. Is a throwing-`_readFile` ⇒ `blocked` assertion meant to be inside O-19(d)'s unit test only, or should O-20-style routing put it in PROPERTIES alongside the other D1–D8 cases? The mangled-relay fixtures of (b) are already PROPERTIES-shaped. |

## Positive Observations

- **The F-14 fix is the model for how to repair a predicate that had silently split.** v3.0 did not
  just add the guard — it names the equivalence that removing E1's short-circuit destroyed, states
  the guard once as a normative block quote, and then propagates it to all six consumers of the old
  equivalence with the same words. Adding the "Anything written?" column to §2.8 converts the fix
  from prose into a table an implementer can diff against their code, and AT-33's Then is written to
  fail loudly against v2's implementation ("v2.0's §4.2/§5.1 … would have created a directory here").
  That is a falsifying test, not a coverage row.
- **§6.1's correction is exactly right, including the part that is unflattering to me.** The v3
  author read `runtime-adapter.js` rather than inheriting my v1 claim, found the claim false, marked
  the v2.0 changelog entry as superseded with a do-not-cite instruction, and replaced the prose with
  a three-row outcome table that distinguishes `null`-and-blocked from throw-and-abort. The
  distinction is load-bearing — an abort produces no `blocked` verdict and no §6.3 report — and
  O-19(d) routes it to the one call site this feature owns while deliberately leaving
  `orchestrate-queue.js:523` alone as another feature's path. Correct scoping, correctly argued.
- **F-15's disposition chose the honest option.** The cheap fix was to fold step 5's evaluation into
  step 7; the correct fix was to admit there are three passes and pay for it in §3, §4.2, §5.7,
  §13.1 and O-1 together. §13.1 went further than I asked and gave the *refined* bound
  (`2 × (2 × |rows| + |retiringRows|)`) rather than only the worst case, which is the difference
  between a bound that discharges NFR-2 and a bound that is merely conservative.
- **The rung-table correction turns a documentation fix into a fixture.** TE F-17's finding was that
  rung (i) had no constructible cause; the response was not to weaken the claim but to find the
  actual POSIX asymmetry that produces one, re-base AT-14b on it, and *keep* AT-15 on `ENOSPC` so
  the two stop colliding. The premise checks out (see Verification above), and §9 O-5's disposition
  records why the old row was wrong rather than silently replacing it.
- **O-20 is a better answer to Q-01 than the one I proposed.** I asked for the OQ-6 reading to
  travel with the document that will be tested; O-20 does that and adds the (b) trap — that a
  hook/`--check` test asserting as-found states "must not be mistaken for evidence about (a)" — which
  is the specific way a PROPERTIES author would otherwise think they had covered the sync case.
- **§8.2's S3 correction (TE F-23) is the right kind of answer to "this member has no site".** It
  did not drop the member or invent a W-1 rendering; it located `drift-state-invalidated`'s *actual*
  rendering site (§6.3's Manifest-level line) and re-scoped the distinctness obligation there, with
  the mechanism (§4.4 rung (i) writes it *after* Phase 2 selection) stated in place.
- **M10's three-clause restructure is minimal and derivable.** Clause (c) is explicitly labelled a
  consequence of (a) rather than an independent rule, which is the right way to state a
  non-independent clause — and it is in fact derivable, which I checked.

## Recommendation

**Needs revision** — on one Medium, and only one.

The v2 slate is genuinely discharged: all four Mediums and the High are fixed at the site of the
error, with the wrong reasoning preserved in place, and every existing-code claim in the revision
verifies against HEAD. The trajectory 12H/10M → 4H/7M → 0H/1M reflects real convergence rather than
softened findings, and I have not opened any front that was settled in an earlier round.

Must change:

1. **F-22 (Medium)** — the one substantive defect, and it is in v3's own new material: decide that a
   copy failing §5.5's verification **removes** the row's pre-existing sync-manifest entry, and the
   six sites asserting `unverified` become true as written. Without it a tool-caused truncation is
   reported to the operator as their own `local-edit`, with the one warning (W-4) that refuses to
   recommend the repair. See Q-01 for the one sub-decision this fix needs.

Should change in the same pass, all one-line:

2. **F-23** — §2.7 names three causes the corrected rung table no longer sends to rung (i).
3. **F-24** — §5.5's unresolved-baseline bullet needs the no-write-target carve-out.
4. **F-25** — renumber §5.5's verification block off §4.2's 4–7.
5. **F-26** — two stale `AT-18` citations, one of them in O-2's disposition cell.

If F-22 is settled and the four Lows are applied, I expect to approve at v4 without further
findings; nothing else in this document is blocking implementability.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 4}
