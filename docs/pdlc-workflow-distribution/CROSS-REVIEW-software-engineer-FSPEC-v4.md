# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (v4.0, Draft)
**Date:** 2026-07-28
**Iteration:** 4
**Prior review:** `CROSS-REVIEW-software-engineer-FSPEC-v3.md` (0H/1M/4L)
**Diff reviewed:** `0a6700b..a81f387` (+336/−53 on the FSPEC)
**Scope of review:** technical feasibility and implementability only. REQ v17.0 is APPROVED under a
binding stopping rule; scope, need, priority and phasing are not re-litigated, and REQ §10 rows whose
"Lands in" is TSPEC/PROPERTIES are treated as discharged downstream by design. Per the delta protocol
I re-read only the changed sections, plus every section a changed section makes a claim about.

## Disposition of my v3 findings

| v3 ID | Claim | Verdict | Evidence |
|---|---|---|---|
| F-22 (M) ≡ TE F-33 | A copy failing §5.5's verification leaves the row's *prior* sync-manifest entry in place ⇒ post-run `local-edit`, not the `unverified` six sites asserted | **Fixed with the recommended rule, and fixed at every propagation site I named** | The rule is the entry **removal**, and I traced it through all ten sites. **§5.5** — the failure branch now reads "no sync-manifest entry is written for this row … **AND any PRE-EXISTING entry for this row is REMOVED**", with a derivation paragraph that reproduces the rung-4/5/6 trace correctly and grounds the rule on §1.2's own provenance principle rather than on convenience. **§4.2 step 6** — "entries ONLY for rows whose step-4 verification passed; and any PRE-EXISTING entry of a row that FAILED verification is removed in this same rewrite", and the placement is load-bearing: step 6 precedes step 7, so the removal is visible to the pass the record carries. **§4.5** — the removal is written into the recordable-failure contract block, not only its prose. **§1.2** — the worked trace is now two bullets with the explicit "declining to write the new entry is not sufficient on its own", and the closing sentence states that *both halves* are required. **§3.4 R-3** — carries the rule as the reason R-3 delivers `unverified`. **§5.8** — both the worked row and the exit-1 derivation are restated ("by writing no entry **and** removing the row's pre-existing one"). **§5.9** — AC-3.7's rewrite trigger is widened to "verified-copied **or** … failed verification and its pre-existing entry must be removed". **§9 O-14** — disposition extended. **AT-35** — Given now states that a `stale` row *by definition* already has an entry, Then asserts the removal, and the AT gains **two** named red directions with "assert the post-run state explicitly, not merely the exit code — exit 4 is reached under both wrong implementations", which is the one thing that makes the fixture falsifying rather than decorative. I checked the two contradiction risks the orchestrator flagged: **AC-3.7 is not disturbed** (a no-change re-sync copies nothing and fails nothing, so no rewrite is triggered and the file stays byte-identical), and **§4.5's continue-on-failure loop is not disturbed** (the removal is one batched rewrite at step 6, not a per-row write inside the loop). I also checked the rule against the copy set: `missing` and `--force`-`unverified` rows may or may not carry a prior entry, and §5.5's clause is written generally ("any pre-existing entry"), so it is correct on those rows too even though §1.2's prose enumerates only `stale`/`local-edit` |
| Q-01 | Is the removal itself a governed write? | **Answered inside the fix, and better than the two options I offered** — §5.5's new paragraph pins it to §4.2 step 6's single rewrite (not a per-row write), argues it out of §4.7 on the correct ground (§4.7 guards *operator* content; this destroys a tool-owned record whose subject no longer exists), and **names the residual**: a failed rewrite records `{ path, sync-manifest-update }` and the surviving entry re-creates the misclassification. I verified `sync-manifest-update` is a member of REQ §4's closed nine-member `operation` set (`REQ:800`) — no tenth operation was invented. Residual: the timing wording, F-28 below |
| F-23 (L) | §2.7 named three causes the corrected rung table routes away from rung (i) | **Fixed, and propagated to the twin in §4.4** — but the fix now collides with the *other* v4 edit in the same section: **F-27** |
| F-24 (L) | §5.5's unresolved-baseline bullet asserted the drift-state write unconditionally | **Fixed** — the bullet carries the `repoRootUnresolved` carve-out, cites §2.1/§4.2 steps 3–9/§5.1 exception 1, and states why it is not a corner |
| F-25 (L) | §5.5's verification block re-used §4.2's step numbers 4–7 | **Fixed** — lettered (a)–(d), the one outward reference reads "§4.2 step 6", and the renumbering's rationale (O-1/O-7 key their trace phases to §4.2's numbering) is stated in place |
| F-26 (L) | Two stale `AT-18` citations | **Fixed** — §4.6's inset and §9 O-2 both read `AT-18b`, each noting §12 has no AT-18 |
| Q-02 | uid 0 bypasses the permission bits, so rung (i)'s only constructible cause vanishes | **Routed to O-11 as I suggested, with the invariants named verbatim** — and AT-14b carries the note. See F-27 for the one clause of the routing rationale that the same revision falsifies |
| Q-03 | Where does the throwing-`_readFile` ⇒ `blocked` assertion live? | **Answered in O-19** — unit test at this feature's call site, on the correct ground (PROPERTIES' D1–D8 duty is over *values*; a throw is a property of the injected transport), and stated so the PROPERTIES author does not hunt for an unwritable row |

## Verification performed this round

**The two POSIX/filesystem premises new in v4 both check out**, and they are load-bearing for TE
F-35's narrowing, so I checked them rather than accepting them:

- `open(O_WRONLY|O_TRUNC)` on an existing file **does** release the file's blocks by the same
  mechanism `unlink` does; there is no asymmetry that would let `unlink` free space a truncate
  cannot. v3.0's row-2 justification really was self-contradictory, and the finding is sound.
- The three regimes named as rung (ii)'s residual reachability are all real and correctly
  characterised: ext4's default `delalloc` (and XFS) defers allocation so `ENOSPC` surfaces at
  writeback rather than at `write(2)`; COW filesystems with a snapshot pinning the old extents
  (btrfs/ZFS/APFS) free nothing on truncate; and quota accounted at write does not credit freed
  blocks back in time. Naming these rather than restating the old claim is the right disposition.
- The consequence the same paragraph draws — that on a classic filesystem `ENOSPC` therefore lands
  at rung **(i)** — is also correct, and it is what F-27 is about: it is a second rung-(i) cause,
  and two other v4 edits still say there is only one.

**Existing-code claims:** the v4 diff introduces **no** new assertion about code at HEAD. Every
claim in the changed text is about POSIX/filesystem semantics or about this document's own sections.
The claims I verified against HEAD in v3 (`runtime-adapter.js:85–96`, `orchestrate-queue.js:523`,
`build-runtime.mjs:132`, `RT_IO_MODEL`, the current `.claude/workflows/` tree) are unchanged in v4
and I did not re-run them.

**Contract check:** `{ path, sync-manifest-update }` — `sync-manifest-update` is in REQ §4's closed
nine-member `operation` set (recordable half). No new `operation`, no new `reason`, no new AT, no AT
renumbered. Confirmed by diffing §12's row set: six ATs gained conjuncts (AT-14b, AT-15, AT-19,
AT-33, AT-34, AT-35), none added or removed.

**Traces re-derived by hand:** the removal rule through §3.3's ladder for a `stale` row, a
`local-edit` row under `--force`, a `missing` row with a surviving entry, and an `unverified` row
under `--force` (no entry to remove — the general phrasing handles it); AC-3.7 against the widened
rewrite trigger; §5.8's exit-1 derivation against the new failure branch; §2.8's precedence against
AT-33's revised Given; and §4.4's rung table against §2.7's and §4.4's own preservation claims (this
is where F-27 comes from).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-27 | Low | Local | **The F-23 fix and the TE F-35 fix were made independently and contradict each other: three sites still say the unwritable-parent case is the *only* cause under which rung (i) lands, while §4.4's own new paragraph establishes a second one.** §2.7: "rung (i) preserves a genuinely-`false` `checkEnabled` in the **unwritable-parent case** — §4.4's corrected rung table (v3.0) shows that is **the one cause under which rung (i) actually lands**", and then "Under `ENOSPC` the `false` is preserved, but **by rung (ii)'s fresh write, not by rung (i)**". §4.4's honesty note: "rung **(i)** in the unwritable-parent case (**the only cause under which rung (i) succeeds** — AT-14b)". But §4.4's TE F-35 paragraph, ~50 lines below, states the opposite in terms: "On a classic filesystem with immediate block release and quota accounted at truncate, truncate-then-write-a-smaller-record therefore **succeeds** and rung (i) lands", and closes "**on a classic filesystem the same `ENOSPC` lands at rung (i)**". Both cannot be true. Three consequences, none of them behavioral (the implementation attempts each rung unconditionally, so no code path changes) but all of them in the text TSPEC reads: (1) the seven-row rung table is no longer exhaustive over `ENOSPC` — row 2 was narrowed to "on a filesystem where truncation does not free the needed space" and **no row was added for the complement**, so the table O-5 hands TSPEC as its reachability inventory has a hole on its most-discussed cause; (2) §2.7's `ENOSPC` sentence is flatly false on a classic filesystem, and §2.7 is the section an implementer reads for the opt-out-survival rule — this is the same defect class as my v3 F-23, reintroduced by F-23's own fix; (3) **§10 O-11's newly added uid-0 rationale inherits it** — "Root bypasses the permission bits entirely … and rung (i)'s **only** constructible cause vanishes" is the premise for AT-14b's named skip, and it is weaker than stated if a classic-filesystem `ENOSPC` (or a seam-injected atomic-replace-only fault, which no uid bypasses) also lands rung (i). The skip is still right for the *POSIX-asymmetry* invariant; the *rationale* overclaims. Fix, all one-line: in §2.7 and §4.4's honesty note say "the unwritable-parent case, **and `ENOSPC` on a filesystem where truncation frees the needed space** (§4.4 row 2's note)"; add the complement row (or a row note) to the rung table so it stays exhaustive over `ENOSPC`; and narrow O-11's rationale to "the POSIX-asymmetry cause AT-14b constructs". Also, §2.7's parenthetical still cites "§4.4's corrected rung table (**v3.0**)" — the table was corrected again in v4.0. | §2.7 (final paragraph), §4.4 "Honesty note on `checkEnabled`", §4.4 rung (ii) table row 2 + the v4.0 narrowing paragraph, §10 O-11 |
| F-28 | Low | Local | **Three v4-edited sites describe the removal's effect as landing on the *next* run, when §4.2's own ordering makes it land in *this* run's record.** Step 6 (the removal) precedes step 7 (the post-run pass the sync record carries), so both the removal and a *failure* of the removal are observable in the same run's `rows[].state`. The three sites: §5.5's Q-01 paragraph — "the **stated consequence** is that the surviving entry sends the row back to `local-edit` **on the next run**" (it is already `local-edit` in this run's step-7 record); §3.4 R-3 — "delivers `unverified` rather than `local-edit` **on the run after** a corrupted copy"; §5.8 — "the removal is what makes the ***next*** run's report honest". Low, not Medium, because no exit code moves (`writeFailures` is non-empty in every one of these cases, so 4 dominates) and because **AT-35 gets it right** ("The post-run pass **then** measures that row `unverified`"). But AT-35's discriminating assertion *is* the same-run post-run state, and a reader who takes R-3 and §5.5 literally will look for a second run to assert against — which is exactly the misreading that would make the new red direction (ii) untestable as written. Say "in this run's own post-run record, and in every run thereafter". | §5.5 (the SE Q-01 paragraph), §3.4 R-3, §5.8 (final bullet of the exit-1 derivation), §4.2 steps 6–7, AT-35 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.6 defines `PDLC_FAULT` as a closed token set that "injects **one** fault", but AT-15's v4.0 Given now requires the `ENOSPC` to be injected "on *both* the atomic replace **and** rung (i)'s in-place write", while AT-14b's rung-(i) case requires the *asymmetric* pair (atomic replace fails, in-place write succeeds). Is a token's scope therefore a *write path* (one token ⇒ `ENOSPC` at every drift-state write attempt) rather than a single call site — and if so, is the asymmetric pair expressible at all through the seam, or is AT-14b's real-permission fixture the only route to rung (i)? I do not think this needs an FSPEC change (the enumeration is explicitly O-10's, and §4.6 defers the vocabulary deliberately), but O-10's enumeration obligation should be told that at least one token needs *per-rung* granularity, otherwise the ladder's three outcomes are not separately drivable and F-27's second rung-(i) cause is unconstructible on every runner. |
| Q-02 | §5.9's widened rewrite trigger makes a step-6 rewrite reachable on a run with **zero** verified copies (removal only). Is that rewrite a full replacement of `entries` from the in-memory read, or a merge into the file as it stands on disk? It is self-limiting today — a removal presupposes a *readable* manifest, so the degraded-read case cannot reach it — which is why this is a question and not a finding. But §1.2 never states the rewrite's semantics, and now that the rewrite has a second trigger it is the kind of thing TSPEC will have to decide silently. |

## Positive Observations

- **The F-22 fix is the strongest disposition of the four rounds, because it fixed the *rule* and
  then paid the propagation cost in full.** Ten sites, all saying one thing, with the two structural
  risks (AC-3.7's idempotence clause; §4.5's continue-on-failure loop) explicitly argued rather than
  left for the reviewer to check — and both arguments hold. Placing the removal at §4.2 **step 6**
  rather than inside the copy loop is the detail that makes it work: it keeps the loop's per-row
  independence intact *and* puts the removal before the pass the record carries.
- **AT-35's "two red directions, both required" is the right response to a fix that a wrong
  implementation still exits 4 on.** The v3 version asserted the exit code, which both wrong
  implementations produce; v4 names the discriminating assertion and says so in the AT. That is the
  difference between a fixture and a coverage row, and it is the second time this document has
  chosen the falsifying form (AT-33 was the first).
- **TE F-35's disposition narrowed a claim instead of restating it.** The cheap fix was to reword
  row 2; the correct fix was to admit the `unlink`/`O_TRUNC` symmetry, follow it to "rung (ii) may
  have no cause at all and O-5 is vacuous", and then find the three regimes under which it is
  genuinely reachable. The premises check out, and re-grounding AT-15 on the §4.6 fault seam rather
  than on a real full disk is what keeps the AT constructible after the narrowing. F-27 is the price
  of doing this fix in the same pass as F-23 without reconciling the two — the work itself is right.
- **SE Q-01 was answered with its own residual named.** "If that rewrite itself fails … the surviving
  entry sends the row back to `local-edit`" is the one path back into the defect, and stating it in
  the FSPEC — rather than letting an implementer discover it — is the behavior I want from a closing
  pass. F-28 is a wording correction to that sentence, not a challenge to it.
- **TE Q-01's answer refined §2.1's independence claim instead of deleting it.** "Independence means
  co-holding and determinacy, not that E1's value is invisible to later probes" is exactly right, and
  §2.4's added paragraph closes the empty-string substitution hazard that a literal reading of the
  code block would otherwise leave open.
- **Nothing was deferred.** Both reviews' complete Low slates were applied in one pass, `operation`
  stayed at nine, no AT was added or renumbered, and no REQ text was touched. That is the shape a
  closing revision should have.

## Recommendation

**Approved with minor changes**

The v3 slate is discharged: the shared Medium is fixed with the rule I recommended, applied and
verified at all ten propagation sites, and it disturbs neither AC-3.7's byte-identical idempotence
clause nor §4.5's continue-on-failure loop — I checked both by hand. All four Lows are fixed at the
site of the error, and all three Questions are answered inside the document rather than in a
changelog. The trajectory 12H/10M → 4H/7M → 0H/1M → **0H/0M** is real convergence.

The two residual findings are Low polish and neither blocks TSPEC:

1. **F-27** — reconcile the "only cause under which rung (i) lands" wording in §2.7, §4.4's honesty
   note and §10 O-11 with §4.4's own v4.0 narrowing, and give the rung table a row (or row note) for
   classic-filesystem `ENOSPC` so it stays exhaustive.
2. **F-28** — the removal's effect lands in *this* run's post-run record, not only the next run's;
   three sites say otherwise while AT-35 says it correctly.

Both are one-line edits and can be folded into the TSPEC-authoring pass rather than forcing another
FSPEC round. Nothing in this document blocks implementability.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
