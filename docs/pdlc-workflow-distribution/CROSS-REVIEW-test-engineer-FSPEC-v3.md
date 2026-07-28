# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (Draft v3.0, 2026-07-28)
**Date:** 2026-07-28
**Iteration:** 3

**Scope of this review.** Testability only, delta-scoped against `git diff 6f4b39b..0a6700b`. REQ
v17.0 is APPROVED with a binding stopping rule; §10 rows bound to TSPEC/PROPERTIES are downstream by
design and nothing below re-litigates REQ scope, need or phasing. `docs/_constraints/` and
`docs/_decisions/` still do not exist on this branch (consistent with O-13), so no `Cross-Feature`
finding is raised on a standing-constraint basis. I re-read only my v2 findings' target sections and
v3.0's new material (§1.1 M10, §1.2, §1.3, §2.1, §2.8, §3, §4.2, §4.4/§4.4a, §4.6, §5.1, §5.5, §5.7,
§5.8, §6.1, §6.2, §6.3, §7.3, §7.4, §8.2, §8.3 N-8, §9, §10 O-1/O-5/O-10/O-16/O-17/O-18/O-19/O-20,
§11 OQ-6, §12 preamble + AT-14b/18a/18b/19/20/28/29/31/33/34/35/36, §13.1).

**Disposition of my v2 findings — all fifteen verified against the document, not against the note.**

| v2 ID | Sev | Verified disposition |
|---|---|---|
| F-16 | High | **Fixed, and fixed at the right altitude.** The no-write-target rule is now stated once, normatively, as a **condition** (§2.1's boxed rule), and re-stated in the same terms at §4.2 steps 3/9, §5.1 exception 1, §5.8's new precedence row, §2.8's worked table (with `Anything written?` and `--check exit` columns), §5.9's AC-3.8 row and §12 AT-33. The exit is pinned (**3**, never 4, because `writeFailures` is necessarily empty), the two §5.1 exceptions are argued disjoint on *attempted vs not attempted*, and **N-8** gives the co-holding state the positive observable O-3 needed. This is the fix, not a patch on the symptom |
| F-17 | High | **Fixed, and the mechanism checks out.** I verified the POSIX claim independently: `open(O_WRONLY\|O_TRUNC)` on an *existing* file is authorised by the **file's** mode bits; the parent directory needs only `x` for traversal — `w` on the directory is required to create, rename or unlink an entry, which is exactly what §4.3's sibling-temp + `mv` does and what an in-place rewrite does not. So a parent at `r-x` with a writable drift-state file is a genuine state in which the atomic replace fails `EACCES` and rung (i) succeeds. AT-14b is correctly re-based on it, AT-15 keeps `ENOSPC` in a writable directory, and the two no longer share a Given. O-4's mandated rung-(i) test, §2.7's `checkEnabled: false` preservation claim and §6.2 row 2's reachability claim now all have one fixture. (One stale back-reference survives — F-33) |
| F-18 | High | **Fixed by closing the field, which is the right direction.** `syncCommand: null` unconditionally under **both** emitter triggers (§4.4a, §1.3, §4.4's field table, O-4). The closed-domain predicate is now true as stated rather than nearly true, AT-14's "it parses" conjunct is derivable, and §6.3's `null` fallback already renders the operator-facing string. Nothing is lost: T1's remediation class is "install a Python interpreter", never sync |
| F-19 | Medium | **Fixed.** §7.3 defines `packagingViolations(root) -> set of {clause, path, detail}` and §7.4 defines `advertisedVersionViolation(root) -> "red" \| "green" \| {skipped}`, both in the `coveredViolations(root)` shape. The "no test may write into `pdlc/workflows/dist/`" rule is re-scoped to the **live** root — which is what it was protecting — so AT-20/28/29 get `git init`-ed fixture roots and both directions are constructible. O-16 and O-17 carry the obligation, and O-16 additionally requires the fixture root to have ≥1 commit so the unborn-`HEAD` skip branch cannot pre-empt the red case. That last clause is a genuinely good catch (a fixture that accidentally tests the skip path it was meant to contrast with) |
| F-20 | Medium | **Fixed by naming the pass, not by hiding it.** Three named passes — as-found (step 2), post-copy (step 5, retiring rows only, never recorded), post-run (step 7) — propagated consistently to §3's two tables, §4.2's step listing, §5.7, §10 O-1 ("label all three distinctly") and §13.1. I re-derived §13.1's arithmetic: 2 hashes × (`2·\|rows\|` + `\|retiringRows\|`) classifications, worst case `2 × 3 × \|rows\|`; correct, and the per-row refinement (the third pass is free when nothing retires) is honest rather than padded |
| F-21 | Medium | **Fixed both ways**, which is more than I asked for: a standing precondition above §12's table covering *every* AT whose expected outcome names a non-`unknown` row state, **plus** the explicit conjunct in all ten named Givens, **plus** an O-11 instruction that a runner without a hash utility skips loudly rather than silently passing. AT-14/AT-14b/AT-21 are correctly named as the deliberate exceptions |
| F-22 | Low | **Fixed: AT-34**, with both halves of §1.2's asymmetry asserted in one test (N-4 printed on unreadable/malformed, **no** N-4 on absent, row states identical). One soft conjunct — F-35 |
| F-23 | Low | **Fixed, and settled the right way.** S3 is restated as W-1 over the **seven** §2.1-produced reasons plus §6.3's Manifest-level line for `drift-state-invalidated`, and §6.3 gains the clause naming that line as the string's rendering site and putting it under AC-2.5a's distinctness requirement. The member is now renderable, so AT-30's author has nothing to invent |
| F-24 | Low | **Fixed.** Both AT-31 fixtures pin `checkEnabled: true` and shape-validity under D1–D8, so rows 1 and 2 are defeated and the assertion is about rows 3 and 7 |
| F-25 | Low | **Fixed: AT-18a / AT-18b**, with the reason stated (two entrypoints with two exit codes cannot be one pass/fail) and the byte-identity of the two records asserted modulo the timestamp |
| F-26 | Low | **Fixed, and over-delivered.** O-18 gains four `prune` clauses: keeps the 5 greatest `(stamp, NN)` per known id, removes exactly the rest, is the **identity** on non-matching names and unknown ids, and is idempotent. Clause (c) is the one that gives §5.6's "never touches a non-matching file" an oracle and makes R-2's "mtime is never read" falsifiable at the prune site |
| Q-01 | — | **Answered:** `PDLC_FAULT`'s token set is closed at **TSPEC**, §4.6 says so and **O-10** carries the enumeration plus a PROPERTIES subset assertion. The right home — the injectable-failure inventory already lives there |
| Q-02 | — | **Answered:** exit **3**, nothing written, N-8, AT-33 |
| Q-03 | — | **Answered:** PM acted now via **O-20**; TSPEC may cite §4.2 directly |
| — | — | **Unprompted correction, verified in source.** §6.1's inherited "`null` on every transport failure" claim was wrong and v3.0 says so. I checked: `runtime-adapter.js` `rtReadFile` has **no** `try`/`catch` (it returns `null` only for a non-string result or the trimmed sentinel), and `orchestrate-queue.js:523` does not wrap `await readFileFn(queuePath)`. A throwing agent turn therefore propagates and aborts the invocation. §6.1's three-row seam-outcome table is correct, and **O-19 duty (d)** — wrap this feature's own drift-state read so a throw maps to row 1 `blocked`, with a unit test injecting a throwing `_readFile` — is exactly the right disposition and correctly scoped to this feature's call site rather than to the adapter |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-33 | Medium | Local | **AT-35 asserts a post-run state its own Given cannot produce, and §5.5 asserts the same wrong consequence normatively.** AT-35's Given is a **`stale`** row. By §3.3 step 5, `stale` *means* `sha1(consumer) == syncManifest[id].consumerHash` — so a sync-manifest entry for that row **already exists** at H_old before the run. §5.5's failure branch and §4.5 both say the entry is "**not written**" for a row that fails verification; neither says it is **removed**, and §1.2's per-copied-row update rule plus AC-3.7's byte-identity clause require entries for untouched rows to persist. So after the truncated copy the entry is still H_old, and §3.3 evaluates: P3 yes, not equal to the plugin (step 3 no), P6 **has** an entry (step 4 no), `sha1(consumer) = H_trunc ≠ H_old` (step 5 no) ⇒ **`local-edit`**. AT-35's Then asserts **`unverified`**, and §5.5's third bullet ("With it, the row has no entry, measures `unverified`") and the closing bullet ("keeps a failed copy from later masquerading as `stale` instead of `unverified`") both state the same thing. All three are wrong for the only Given AT-35 offers — the assertion is red against a conforming implementation, and the masquerade the rule claims to prevent is real but is `local-edit`, which is materially worse for the operator because it accuses them of an edit the tool made. `unverified` is correct only for a **`missing`** row, which has no prior entry. The exit-code half of AT-35 (exit 4, `writeFailures {path, artifact-copy}`, loop continues, no new entry) is sound and §5.8's weakened exit-1 claim survives either way — this is one conjunct, not the whole test. Fix (one clause, choose one): re-base AT-35's Given on a `missing` row so "no entry ⇒ `unverified`" is true; **or** state in §5.5 that a failed verification **deletes** the row's pre-existing sync-manifest entry (and say so in §4.5, since it changes the recordable-failure contract); **or** keep the `stale` Given and assert `local-edit`, naming the misdiagnosis in W-7's text. Whichever is chosen, §5.5's two bullets must say the same thing as the AT. | AT-35; §5.5 (post-copy verification, bullets 3 and 8); §4.5; §3.3 steps 4–6; §1.2; §5.8 |
| F-34 | Low | Local | **AT-15's parenthetical still cites the superseded rung table.** It reads "§4.4's own reachability table sends `EACCES` on the parent to rung (iii)" — but v3.0's rebuilt table sends `EACCES` on the parent **with a writable file** to rung **(i)** (that is the entire F-17 fix, and AT-14b depends on it); only "parent not writable **and** the file not writable" lands at (iii). AT-15's Given (writable directory + `ENOSPC`) is unaffected and the test is still constructible, but a reader who follows the parenthetical to the table finds it contradicted, and the parenthetical is the only justification AT-15 gives for its Given. Restate it as "the corrected table sends `EACCES`-on-parent to rung (i), so an unwritable directory would not exercise rung (ii) at all". | AT-15 (parenthetical); §4.4 rung (ii) table row 1 |
| F-35 | Low | Local | **The rung-(ii) table's `ENOSPC` row contradicts its own `unlink` argument, so O-5's "essentially one cause" may have none.** Row 2 asserts rung (i) fails under `ENOSPC` because "there is no space for the new bytes either", while the same row credits rung (ii) with succeeding because "`unlink` frees space and needs none". `open(O_WRONLY\|O_TRUNC)` frees the file's blocks by exactly the same mechanism, and the record rung (i) writes is the **unresolved** shape (`rows: []`, `retiredPresent: []`, two `null`s) — strictly smaller than the resolved record it overwrites. On a non-COW filesystem, truncate-then-write-a-smaller-record therefore succeeds where `mv` of a new sibling did not, and rung (ii) has **no** reachable cause at all, which makes O-5's disposition vacuous and AT-15 a fixture for an unreachable rung. This is a soundness defect in the reachability *argument*, not a missing fixture: AT-15's `ENOSPC` is fault-injected (§4.6, O-10) like AT-14b/16/17/27/35, so the test can still be built. Fix: either name the condition under which the truncation credit does not apply (delayed allocation / COW snapshots / quota accounted at write rather than at truncate) or state plainly that rung (ii) is fault-reachable only, and adjust O-5's disposition to match. | §4.4 rung (ii) table row 2; §9 O-5; AT-15 |
| F-36 | Low | Local | **AT-33's central assertion needs a JSON-tool conjunct in its Given.** AT-33 asserts the *reported* reason is `manifest-empty` and not `repo-root-unresolved` — the whole point of the AT. But `manifestEmpty` is E6, established only through §2.3's JSON helper, and §2.1 Phase 2 case 1 states that when `jsonToolAbsent` holds, `manifestEmpty` is **indeterminate** and `json-tool-absent` outranks it. So on a runner with no interpreter the same fixture reports `json-tool-absent` and the AT fails for a reason unrelated to what it tests. AT-2 already sets the precedent wording for exactly this ("a JSON tool is present … so no higher-precedence baseline condition holds (§2.8)"); AT-33 should carry it, since it is the fixture the entire F-16/SE-F-14 fix rests on. ("present, parseable and has zero rows" describes the file, not the machine.) | AT-33; §2.1 Phase 2 case 1; §2.3; §2.8; cf. AT-2's Given |
| F-37 | Low | Local | **AT-34's `unverified` conjunct is not pinned by its Given, and the Given conflates two fixtures.** §3.3 evaluates `in-sync` (step 3) **before** `unverified` (step 4), and R-4/O-8 make equal bytes `in-sync` regardless of provenance — so a row whose consumer bytes happen to match the plugin classifies `in-sync` under an unreadable sync manifest, not `unverified`. "every row with no other distinguishing evidence" does not state the discriminating fact, which is that the consumer bytes **differ** from the plugin's. Add that conjunct. Separately, "**unreadable or malformed**" is a disjunction of two fixtures in one row — the defect v2 fixed at AT-8 and v3 fixed again at AT-18; both map to the same behavior here so it is milder, but the N-4 emission should be able to fail independently for each. The contrast half (absent ⇒ identical row states, no N-4) is well-formed and is the load-bearing half. | AT-34; §3.3 steps 3–4; §3.4 R-4; §9 O-8; cf. AT-18a/AT-18b |
| F-38 | Low | Local | **AT-19's Then is not stated over the oracle §7.3 now defines.** §7.3's whole v3.0 change is that the oracle is a set-valued pure function of a root, and AT-22/AT-23 assert it that way (`coveredViolations(liveRepoRoot) == ∅`, `\|coveredViolations(fixtureRoot)\| == 7`). AT-19 still says "`packagingViolations(liveRepoRoot)` **satisfies** AC-6.2 (a)–(d)", which is a restatement of the clause list rather than an assertion over the returned set, and an implementation returning `{}` for every root satisfies it vacuously. State it as `packagingViolations(liveRepoRoot) == ∅`, matching AT-22 and matching AT-29's `clause: "6.2(b)"` counterpart. | AT-19; §7.3; cf. AT-22, AT-29 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §2.4's E3 first branch is `<repoRoot>/pdlc/workflows/build-runtime.mjs`, but §2.1 still asserts "E1 is independent of E2–E6". Under `repoRootUnresolved` — now the *ordinary* first-release state per §2.8 — that branch has no path to test. The natural reading is "a path with an unresolved component cannot exist ⇒ fall to the `${CLAUDE_PLUGIN_ROOT}` branch", which is what AT-33 needs, but the FSPEC never says it and an implementation that materialises `<repoRoot>` as the empty string would probe `/pdlc/workflows/build-runtime.mjs`. Is one sentence in §2.4 worth adding, or is this TSPEC's to pin as a fixture invariant? Not raised as a finding because the charitable reading is available and AT-33 is constructible under it. |
| Q-02 | AT-14b's Given (`.claude/workflows/` at `r-x`) is stated for "any entrypoint". On a **sync** run that directory also blocks every artifact copy, every backup-directory creation and the sync-manifest write, so the record AT-14b inspects will additionally carry `artifact-copy`/`backup` entries in `writeFailures`. None of that defeats the assertions (row 2 `proceed` outranks row 3), but a test author will see conjuncts the AT does not mention. Should AT-14b be scoped to hook/`--check`, or is the extra noise intended as part of the fixture? |

## Positive Observations

- **The condition-vs-selection separation is now stated once and propagated seven times, in the same
  words each time.** §2.1's boxed no-write-target rule, §4.2 steps 3/9, §5.1 exception 1, §5.8's new
  precedence row, §2.8's two new columns, §5.9's AC-3.8 row and AT-33 all key on the E1 *evidence*.
  That is the shape a normative rule should take: one authoritative statement plus references, not
  seven paraphrases that can drift apart. The disjointness argument for §5.1's two exceptions
  (*attempted* vs *not attempted* ⇒ `writeFailures` necessarily empty ⇒ 4 unreachable) is the kind
  of derivation that makes an exit-code oracle checkable instead of asserted.
- **N-8 is the right instrument for the right problem.** The co-holding state's only previous
  observable was a reason string that names something else; N-8 makes it positively observable
  without polluting §8.2's distinctness sets, and its emission condition is deliberately narrow
  (suppressed when W-1 already carries the same remediation) with the reason stated. AT-33 asserts
  the presence, the suppression, the empty `writeFailures` and both exits — four positive conjuncts,
  no absence-only oracle.
- **The rung-(i)/rung-(ii) table is now a real reachability analysis.** Splitting "does the in-place
  overwrite succeed" from "does `unlink` succeed" turned a one-directional list into a table that
  decides which rung lands, and the unwritable-parent asymmetry is derived from the syscall
  semantics rather than asserted. I verified the POSIX claim independently and it holds. F-35 is a
  defect in one row of that analysis, not in its shape.
- **§6.1's seam correction was made by reading the source, and the source says what the FSPEC now
  says.** Retracting an inherited claim mid-document, marking the superseding text explicitly ("do
  not cite the v2.0 note for the seam's failure semantics"), and converting the corrected fact into
  a testable duty — O-19(d), with a named unit test injecting a throwing `_readFile` — is exactly
  the right handling. The three-row outcome table distinguishes `null`-from-absent,
  `null`-from-non-string and *throw*, and only the first two are described as `blocked`.
- **O-18's prune clauses and O-20 are both well-posed property obligations.** O-18(c)'s identity
  requirement on non-matching names and unknown ids is the clause that gives §5.6's destructive
  sentence an oracle, and (d)'s idempotence is a genuine property rather than a restatement. O-20's
  three clauses are falsifiable independently, and (b)'s warning — that the hook/`--check`
  coincidence must not be mistaken for evidence about (a) — pre-empts precisely the false-green a
  PROPERTIES author would otherwise ship.
- **D8's widening was argued as a reachability change, not made silently.** §6.2's row-2 bullet now
  names row 1 as the stated exception, explains why it must be, *and* names the cost of v2's own
  widening of row 1 — "widening row 1 further is a change to the opt-out's reachability and must be
  argued as one" is a durable rule, and AT-36 pins the concrete case.
- **AT-18b, AT-28, AT-29, AT-30, AT-31, AT-33 and AT-36 each name the wrong implementation they are
  red against.** That habit is now consistent across the new ATs and it is what makes this AT set
  reviewable at all.

## Recommendation

**Needs revision**

One Medium stands between this document and approval, and it is a single-clause fix: **F-33** —
AT-35's `unverified` conjunct and §5.5's two matching bullets are wrong for AT-35's own `stale`
Given, because a `stale` row by definition already has a sync-manifest entry and "not written" does
not remove it; the conforming post-run state is `local-edit`. Pick one of the three fixes named in
the finding and make §5.5 and AT-35 agree.

Everything else this round is Low-severity polish on otherwise-sound new material: a stale
back-reference in AT-15 (F-34), an internally inconsistent `ENOSPC` justification in the rung-(ii)
table (F-35), a missing JSON-tool conjunct in AT-33's Given (F-36), an unpinned discriminator in
AT-34 (F-37), and an oracle-shaped restatement in AT-19's Then (F-38). None of them requires new
analysis — each is one clause, and four of the five are Given/Then wording on tests whose structure
is already right.

All three v2 Highs and all three v2 Mediums are genuinely fixed, verified against the document and,
where the fix rested on an external fact (the `O_WRONLY|O_TRUNC` permission semantics, the
`rtReadFile` seam), against the underlying source. Blocking counts have descended 12H/10M → 4H/7M →
3H/3M → **0H/1M**. With F-33 closed this document meets the Phase F bar.

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 5}
