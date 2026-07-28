---
feature: pdlc-workflow-distribution
---

# FSPEC — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` v17.0 (**approved, product scope**) |
| Downstream | `TSPEC-pdlc-workflow-distribution.md`, `PROPERTIES-pdlc-workflow-distribution.md` |
| REQ §10 rows disposed here | O-2, O-4, O-5, O-6, O-8, O-14, O-15 (the seven whose "Lands in" is FSPEC) |
| REQ §10 rows carried forward | O-1, O-3, O-7, O-9, O-10, O-11, O-12, O-16, O-17 → TSPEC/PROPERTIES; O-13 → `consolidate-learnings` |
| Obligations **added** by this FSPEC | O-18 (backup-grammar round-trip + prune → PROPERTIES), O-19 (LLM-mediated `_readFile` seam → TSPEC/implementation, Cross-Feature), O-20 (OQ-6's reading, → PROPERTIES) — §10 |
| Prerequisites | BL-01, BL-03, BL-06 are **"Before FSPEC"** and are **not discharged** — see §0.3 |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-FSPEC-v1.md`, `CROSS-REVIEW-test-engineer-FSPEC-v1.md` (disposed in the v2.0 note); `CROSS-REVIEW-software-engineer-FSPEC-v2.md`, `CROSS-REVIEW-test-engineer-FSPEC-v2.md` (disposed in the v3.0 note) |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` (Phase H) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 3.0 | 2026-07-28 |

> **Altitude.** The REQ is approved at product scope and states *observable behavior*. This FSPEC
> states *how the behavior is produced*: the component inventory, the data formats, the algorithms
> and their decision points, and the exact operator-facing strings. It does not choose bash idioms,
> test frameworks or file layouts beyond what the REQ already fixes — those are TSPEC/PLAN.
>
> Where the REQ names an obligation as downstream (§10), this document either discharges it (the
> seven FSPEC rows, §9) or restates it as a TSPEC entry obligation (§10). A reviewer finding that
> a TSPEC-bound row is unspecified here is answered by §10.

> **v2.0 — SE/TE cross-review round 1 (SE 6H/4M/3L, TE 6H/6M/3L). Every High and Medium is
> addressed; all three SE Lows and all three TE Lows are addressed too. No REQ text is amended:
> where the FSPEC deviated from an approved AC it was conformed to the AC, and the one genuine
> REQ internal tension is recorded as OQ-6 rather than resolved unilaterally. AT numbering is
> stable; AT-8 is split into AT-8a/AT-8b and AT-26–AT-32 are added.**
>
> **Disposition by finding id.**
>
> - **SE F-01 (High) — sync run's row states unspecified.** **Fixed, §4.2 rewritten.** The ordering
>   is now eight steps and names copy/backup/retire explicitly. A sync run makes **two**
>   classification passes: the *as-found* pass (which decides what to copy — this is what
>   AC-2.9(1) governs) and a *post-run* pass whose results are what the record carries. §3 now
>   says "once per row **per pass**" and states that hook/`--check` make one pass and sync makes
>   two; §5.7's "post-copy" state and §5.8's post-run exit are now produced by a stated mechanism;
>   §4.3/§6.2's mid-session unblock is now true rather than asserted. The residual tension with
>   AC-2.6's "recorded states are those observed before this run created anything" is recorded as
>   **OQ-6** (non-blocking; AC-2.6's own `supersedingState` clause already says "sync: post-copy",
>   and AC-2.7 + AC-3.3 both require the post-run reading).
> - **SE F-02 (High) — plain sync destroyed `stale` content without a backup.** **Fixed, §5.5.**
>   `stale` now takes a verified backup (§4.7) before the copy. AC-1.1's "`missing` is the one
>   non-`unknown` state sync overwrites without a backup" and AC-3.4's "overwrites **any existing
>   file**" are now both honoured by the same procedure. New **AT-26** covers it.
> - **SE F-03 ≡ TE F-02 (High) — row-reason ladder contradicted the declared precedence.**
>   **Fixed, §3.3.** The ladder now probes hash-tool availability **first**, then plugin-missing,
>   then plugin-unreadable, then consumer-unreadable — i.e. exactly REQ §4's declared row-reason
>   precedence. §3.6's "structural, not asserted" claim is now true.
> - **SE F-08 ≡ TE F-01 (High/Medium) — rung-1 clause named the wrong reason.** **Fixed, §3.3.**
>   `P1 indeterminate ⇒ plugin-artifact-unreadable`, agreeing with the footnote and §3.2.
> - **TE F-03 (High) — baseline-reason precedence vs the B1–B7 flow.** **Fixed, §2.1/§2.8
>   restructured.** Baseline resolution is now explicitly two phases: **evidence gathering** (a
>   dependency-ordered probe sequence that short-circuits only where a probe's *prerequisite*
>   failed) and **reason selection** (the declared precedence applied over the conditions that
>   hold *and are determinate*). The declared precedence is therefore observable and O-9 can
>   generate fixtures for it. TE Q-02 is answered: observable, not inert.
> - **SE F-04 (High) — §6.2's mapping was not total and validated no shape.** **Fixed, §6.2.**
>   Row 1 now carries a full required-key/type check (including `rows`/`retiredPresent`/
>   `writeFailures` present-and-array, `checkEnabled` boolean, closed-set membership for
>   `state`/`reason`/`baselineStatus`), and a terminal **row 10 — "anything else ⇒ `blocked`"** is
>   added. `resolved` with empty `rows` now lands on row 10, not in an undefined region.
> - **SE F-05 (High) — §4.6/AT-18 deviated from approved AC-2.9(5).** **Conformed to the REQ.**
>   An unrecognised `PDLC_FAULT` token now exits **4** on `--check`/sync and **0** on the hook,
>   verbatim per AC-2.9(5). §4.6's contrary argument is deleted, §9 O-2's disposition is rewritten,
>   and **AT-18** now asserts `--check` exit **4** (AT number kept).
> - **SE F-06 (High, Cross-Feature) — BL-04 discharged against the module, not the runtime.**
>   **Fixed, §6.1 rewritten against the real seam.** `pdlc/workflows/runtime-adapter.js`'s
>   `rtReadFile` is an `agent()` call pinned to `haiku` (`RT_IO_MODEL`) that asks a model to relay
>   the file's bytes, and returns `null` for absent **and** for every transport failure and
>   non-string result. §6.1 now states that, states which failure modes the F-04 shape validator
>   catches, states the one residual it cannot (a shape-preserving value corruption) as
>   **accepted-and-stated**, and routes adapter hardening as an explicit implementation-phase
>   obligation (**§10 O-19**) rather than leaving it implicit.
> - **TE F-04 (High) — `json-tool-absent` had no drift-state write path.** **Fixed, §4.4a (new).**
>   The `printf` emitter is now specified as the **serialiser of last resort for any record whose
>   every field is closed-domain** — which is exactly the unresolved-baseline shape, and
>   `json-tool-absent` guarantees unresolved. It is therefore the *ordinary* writer on a
>   no-JSON-tool run (including first adoption, where no file pre-exists), and separately the
>   rung-(i) emitter. TE Q-01 is answered: yes, a record is written. AC-2.9(3)'s "over a
>   pre-existing file" entry condition is left exactly as approved.
> - **TE F-05 (High) + SE F-09 (Medium) — `checkEnabled: false` unreachable under
>   `json-tool-absent`.** **Stated honestly, §2.7 and §4.4.** With no JSON tool the config cannot
>   be read, so AC-4.3's fail-closed rule forces `true`; there is no JSON-tool-free read and this
>   FSPEC does not invent one (a `grep` of a JSON document is the thing §1 forbids). §4.4's
>   rationale is corrected: the rung preserves a genuinely-`false` `checkEnabled` in the
>   `ENOSPC`/immutable/read-only-mount cases (where a JSON tool exists), **not** in the
>   `json-tool-absent` case. The residual — a machine with no Python interpreter cannot reach the
>   opt-out — is recorded as **accepted and stated**, alongside NFR-6 exception (ii), with the
>   remediation (install a Python interpreter) named. **AT-14** is rewritten onto the
>   constructible fixture and **AT-14b** added for the falsifiable `false` case.
> - **TE F-06 (High) — AT-15's Given was self-contradictory.** **Fixed.** AT-15's Given is now a
>   writable directory with `ENOSPC` on the file write, matching §4.4's own reachability table.
> - **SE F-07 + TE F-12 (Medium) — backup grammar / ordering.** **Fixed, §1.4.** The collision
>   suffix is now **always present and zero-padded**: `{id}.{stamp}-NN.bak`, `NN ∈ 01..99`. The
>   filename is then fixed-width after the id, so (a) `LC_ALL=C` descending filename sort **is**
>   reverse-chronological with no special case, satisfying AC-3.4's sort clause and AC-3.5's
>   "newest backup" selection, and (b) the id is recovered by a fixed 24-byte offset, so the
>   grammar has exactly one parse. **§10 O-18** binds the round-trip property obligation.
> - **SE F-10 (Medium) — blast radius not a spec invariant.** **Fixed, §1.1 M10:** every
>   `consumerPath` and every `retires` member must lie under `.claude/workflows/` (NFR-3).
> - **TE F-07 (Medium) — `syncCommand` missing from §4.4's table; AT-14 dropped a conjunct.**
>   **Fixed.** `syncCommand: null` added to the field table; AT-14's Then restores the AC-4.1
>   mapping conjunct and asserts `baselineReason`.
> - **TE F-08 (Medium) — "byte that cannot be represented" undefined.** **Fixed by simplifying the
>   rule so no such case exists, §4.4.** The emitter interpolates a path verbatim **iff every byte
>   is printable ASCII `0x20`–`0x7E`** (with `\` and `"` backslash-escaped); otherwise the whole
>   path is `"<unprintable>"`. Decidable byte-wise under `LC_ALL=C`, no UTF-8 validation, no
>   `\uXXXX` rule. The cost — a legitimately non-ASCII path reports as `<unprintable>` — is stated.
> - **TE F-09 (Medium) — AC-2.9(4)'s negative had no test.** **Fixed: new AT-27** (backup written
>   but not landed ⇒ original bytes unchanged, operation skipped, `writeFailures` entry, exit 4).
> - **TE F-10 (Medium) — one-directional jest ATs.** **Fixed: new AT-28** (AC-6.6 green when
>   `version` *was* bumped) and **AT-29** (AC-6.2 red when a `pluginSha1` disagrees with disk).
> - **TE F-11 (Medium) — textual distinctness asserted only in prose.** **Fixed: new AT-30**, with
>   the distinctness predicate stated in §8.2.
> - **SE F-11 (Low) — §4.4 vacuous with no pre-existing file.** **Stated, §4.4.**
> - **SE F-12 (Low) — §1.3 understated the `syncCommand` addition.** **Fixed inline in §1.3.**
> - **SE F-13 (Low) — gitignore scope.** **Fixed, §7.5 item 1**, naming the three state paths.
> - **TE F-13 (Low) — §6.2 rows 3/7 and the `syncCommand: null` fallback untested.** **Fixed: new
>   AT-31.**
> - **TE F-14 (Low) — N-4/N-5/N-6 untested.** **Fixed: new AT-32.**
> - **TE F-15 (Low) — AT-8 packed two When/Then pairs.** **Fixed: split into AT-8a / AT-8b.**
> - **Questions.** SE Q-01 answered in §11.1 (documentation-only; an implementation-time
>   observation is now a named obligation). SE Q-02 answered in §3.1/§13.1 (the hash-utility probe
>   is **once per run**, not once per row). SE Q-03 answered in §5.8 (the derivation survives, and
>   now rests on a stated mechanism). SE Q-04 answered in §4.2 (E7 completes inside step 1, before
>   any write is attempted). TE Q-01/Q-02 as above. TE Q-03 answered in §5.4. TE Q-04 answered in
>   §4.4 (the three stderr-only `operation` values are filtered out before interpolation).
> - **Changed acceptance tests, per instruction:** AT-2 (Given tightened so the two-phase baseline
>   selection is deterministic), AT-8 → AT-8a/AT-8b, AT-14 (rewritten; AT-14b added), AT-15
>   (Given corrected), AT-18 (`--check` exit 0 → **4**). AT-1, AT-3–AT-7, AT-9–AT-13, AT-16,
>   AT-17, AT-19–AT-25 are unchanged in number and substance.

> **v3.0 — SE/TE cross-review round 2 (SE 1H/4M/3L, TE 3H/3M/6L). Every High and Medium in both
> reviews is addressed; every Low is addressed too. No REQ text is amended. No existing AT is
> renumbered; AT-18 is split into AT-18a/AT-18b (the AT-8a/AT-8b precedent) and AT-33–AT-36 are
> added at the end. Finding ids are qualified by reviewer — the two reviews' F-1x numbering
> overlaps but refers to different findings.**
>
> **Disposition by finding id.**
>
> - **SE F-14 ≡ TE F-16 (High) — the no-write-target guard was keyed on the *selected reason*, not
>   on the *condition*.** **Fixed everywhere the guard is stated.** v2 removed E1's short-circuit,
>   so `repoRootUnresolved` can now co-hold with a higher-precedence selected reason — and at first
>   release it usually does (`manifest-absent` is universal). §4.2 now states the guard as a
>   **condition**: whenever `repoRootUnresolved` holds, **no `<repoRoot>`-relative path is created,
>   written, backed up, deleted or hashed**, whatever reason §2.1 Phase 2 selected. §2.1's E1
>   bullet, §2.8's worked table, §4.2 steps 3 and 9, §5.1's exception 1, §5.8 and §5.9 all now say
>   the same thing in the same terms. **Exit code, stated:** `repoRootUnresolved` ⇒ the baseline is
>   unresolved on every path, so `--check`/sync exit **3** (never 4 — nothing was attempted, so
>   `writeFailures` is empty and no `mkdir` entry can exist), and the hook exits **0**. New notice
>   **N-8** gives the state a positive observable when the reported reason is something else, and
>   **AT-33** is the co-holding fixture (`repoRootUnresolved` + `manifestEmpty`). AT-2 keeps its
>   Given (the *selected*-reason case) and AT-3's Given now names a resolved repo root.
> - **SE F-15 ≡ TE F-20 (Medium) — the pass count hid a pass.** **Fixed by naming the third pass,
>   not by hiding it.** A sync run makes **three** `classify_row` passes: **as-found** (step 2),
>   **post-copy** (step 5, the retirement decision), **post-run** (step 7, the recorded pass). §3's
>   table, §4.2, §5.7, §13.1's NFR-2 bound (`2 × 3 × |rows|` worst case, with the honest per-row
>   refinement) and §10 O-1's trace vocabulary (three distinct phase labels) are corrected together.
> - **SE F-16 (Medium) — D8 made the FSPEC-invented `syncCommand` a hard shape gate above the
>   opt-out, and §6.2's row-2 bullet was false.** **Both fixed, §6.2.** D8 now reads *`syncCommand`,
>   **if present**, is `null`-or-string*; an absent field is read as `null` and §6.3's `null`
>   fallback already handles it. A record satisfying AC-2.6's schema exactly can therefore reach the
>   `checkEnabled` opt-out, so resolving OQ-5 against the FSPEC cannot block every consumer. The
>   row-2 bullet now says "above every blocking row **except row 1**" and states why row 1 must
>   outrank it (a record that cannot be parsed cannot yield a trustworthy `checkEnabled` — §4.4's
>   own reasoning), plus the consequence of v2's widening of row 1. **AT-36** pins the absent-
>   `syncCommand` opt-out.
> - **SE F-17 (Medium) — M10 bounded the directory but not its own state namespace.** **Fixed,
>   §1.1 M10** gains a third clause: no `consumerPath` and no `retires` member may have a basename
>   beginning `.pdlc-`, and none may lie inside `.pdlc-backups/`. The "Why M10" paragraph names the
>   failure it closes.
> - **SE F-18 (Medium) + SE Q-02 — the truncated-copy case.** **Settled in the direction Q-02
>   offered: yes, the copy is verified.** Worked through honestly: §1.2's `consumerHash` records the
>   bytes *written*, so a truncated copy hashes as its own truncation and step 7 measures the row
>   **`stale`** (not `local-edit`/`unverified` as §4.2 claimed), which would end a sync run at exit
>   **1** — the outcome §5.8 declared unreachable. §5.5 now mandates a **post-copy re-read and hash
>   comparison against `pluginSha1`** (the §4.7 pattern, applied to copies), so a silently corrupted
>   copy is a `writeFailures` `{path, artifact-copy}` case at exit **4**, with **no** sync-manifest
>   entry. §4.2's justification of step 7 is corrected to say `stale`. §5.8's claim is **weakened to
>   a conditional**: exit 1 on a sync run is reachable only if that verification is absent or
>   defeated, and the downstream instruction is rewritten from a prohibition to a diagnosis.
>   **AT-35** pins it. The `operation` set stays the approved nine values — a verification failure
>   reports as `artifact-copy`.
> - **TE F-17 (High) — no fixture made rung (i) *succeed*, so AT-14b was unconstructible.**
>   **Fixed, §4.4 rung (ii) table rebuilt.** The unwritable-parent row's premise was wrong: an
>   in-place `O_WRONLY|O_TRUNC` of an existing, writable file needs write permission on the **file**,
>   not on the directory — only the sibling-temp creation of §4.3 needs the directory. So
>   `EACCES` on the parent is exactly the cause under which the atomic replace fails and **rung (i)
>   succeeds**. The table gains a rung-(i) column, and **AT-14b is re-based** on that fixture, so
>   O-4's mandated rung-(i) test, the `checkEnabled: false` preservation claim and §6.2 row 2's
>   reachability claim all have one. AT-15 (`ENOSPC`, writable directory) keeps its Given and the
>   two tests no longer collide.
> - **TE F-18 (High) — `syncCommand` is not closed-domain under trigger T1.** **Fixed by closing
>   it, §4.4a and §1.3.** The `printf` emitter writes `syncCommand: null` **unconditionally under
>   both triggers**. Nothing is lost: `json-tool-absent`'s remediation is "install a Python
>   interpreter", never sync (§5.2, §6.3). §4.4a's closed-domain predicate is therefore true as
>   stated, AT-14's "it parses" conjunct is derivable, and AT-14's `syncCommand: null` assertion now
>   agrees with §1.3 for its own Given.
> - **Cross-cutting correction the two Highs above surface — §6.1's inherited "widened `null`"
>   claim was wrong, and the v2.0 note above repeats it.** Verified in source, not from the v1
>   review: `runtime-adapter.js:85–96` `rtReadFile` has **no `try`/`catch`**, and
>   `orchestrate-queue.js:523` does not wrap `await readFileFn(queuePath)`. So a throwing agent turn
>   **propagates** and aborts the invocation; it does **not** return `null`. §6.1 item 1 is
>   rewritten to say exactly that, the disposition of the abort is stated, and **O-19 gains duty
>   (d)**: this feature's own drift-state read must be wrapped so a throw maps to §6.2 row 1
>   `blocked` rather than an unhandled abort. The v2.0 note's sentence "returns `null` for absent
>   **and** for every transport failure" is **superseded by §6.1** and should not be cited.
> - **TE F-19 (Medium) — §7.3/§7.4's jest oracles were not parameterised over a root, so AT-20/28/29
>   were unconstructible.** **Fixed:** §7.3 defines `packagingViolations(root)` and §7.4 defines
>   `advertisedVersionViolation(root)`, both pure functions of a root directory in the
>   `coveredViolations(root)` shape, so a `git init`-ed fixture tree carries the red cases while the
>   live root carries the green ones. The "no test may write into this repository's
>   `pdlc/workflows/dist/`" constraint is re-scoped to the **live** root, which is what it was
>   protecting. **§10 O-16** carries the parameterisation and fixture-root obligation.
> - **TE F-21 (Medium) — the P5-first reorder was not propagated into the row-level ATs.**
>   **Fixed both ways:** a standing precondition is stated above §12's table, **and** the
>   hash-utility conjunct is added to each of AT-1, AT-6, AT-7, AT-8a, AT-8b, AT-9, AT-10, AT-24,
>   AT-25 and AT-26's Givens, so a generated fixture cannot combine `hash-tool-absent` with them.
> - **SE F-19 (Low) — "Three of §4.5's nine" lists four.** **Fixed** in §4.4 and in §9 O-4.
> - **SE F-20 (Low) — §2.1 Phase 2's false universal.** **Fixed:** the universal is dropped and the
>   two-case argument (the only argument that is true) is kept.
> - **SE F-21 (Low) — `NN` exhaustion is 99, not 100.** **Fixed, §1.4.**
> - **TE F-22 (Low) — N-4 uncovered.** **Fixed: new AT-34**, covering the unreadable/malformed
>   notice with O-8's verbatim wording *and* the absent case's deliberate silence.
> - **TE F-23 (Low) — S3 required rendering W-1 for a reason that has no W-1 site.** **Fixed,
>   §8.2:** S3 is restated as W-1 over the **seven** §2.1-produced reasons **plus** §6.3's
>   Manifest-level line for `drift-state-invalidated`, which is that string's actual rendering site.
> - **TE F-24 (Low) — AT-31's fixtures did not defeat the rows above the asserted one.** **Fixed:**
>   both fixtures now pin `checkEnabled: true` and a shape-valid record.
> - **TE F-25 (Low) — AT-18 packed two invocations.** **Fixed: split into AT-18a / AT-18b**, the
>   AT-8a/AT-8b precedent. No other AT is renumbered.
> - **TE F-26 (Low) — O-18 bound the grammar but not the destructive act.** **Fixed:** O-18 gains a
>   third property over `prune` (keeps exactly the 5 greatest `(stamp, NN)` per known id, removes
>   only the rest, identity on non-matching names and unknown ids).
> - **SE Q-01 (task-routed) — OQ-6's owner was unreachable under the REQ's stopping rule.**
>   **Fixed: new §10 O-20** makes OQ-6's reading a PROPERTIES entry obligation, so it travels to the
>   document that will be tested rather than waiting on a REQ revision that will not occur. OQ-6's
>   owner line is rewritten accordingly.
> - **SE Q-03 (Low, taken) — D7 did not close `supersedingState`.** **Fixed:** D7 now requires it to
>   be one of the six closed states, since §6.3 prints it.
> - **TE Q-01 answered, §4.6:** the `PDLC_FAULT` token set is **closed at TSPEC**, and §10 O-10 now
>   says so explicitly — NFR-6's "exactly two exceptions" argument needs the set closed *somewhere*,
>   and TSPEC is where the injectable-failure inventory already lives.
> - **TE Q-02 answered** by the SE F-14/TE F-16 fix (exit **3**, nothing written, N-8, AT-33).
>   **TE Q-03 answered:** PM acted now (O-20); TSPEC may cite §4.2 directly.
> - **Changed acceptance tests:** AT-1, AT-6–AT-10, AT-24, AT-25, AT-26 (hash-utility precondition
>   added to the Given); AT-3 (resolved repo root named); AT-14b (re-based on the unwritable-parent
>   fixture); AT-18 → AT-18a/AT-18b; AT-19, AT-20, AT-28, AT-29 (restated over a named root);
>   AT-31 (`checkEnabled: true` pinned). **Added:** AT-33, AT-34, AT-35, AT-36.

## 0. Preliminaries

### 0.1 Naming used throughout

| Term | Meaning |
|---|---|
| `<pluginRoot>` | `${CLAUDE_PLUGIN_ROOT}` in a consumer; `<repoRoot>/pdlc` in the maintainer repo (REQ AC-0.3a) |
| `<repoRoot>` | consumer repo root resolved per REQ AC-0.5 |
| **distribution manifest** | `<pluginRoot>/workflows/dist/distribution-manifest.json` — ships with the plugin, authored by the builder |
| **sync manifest** | `<repoRoot>/.claude/workflows/.pdlc-sync-manifest.json` — provenance, written only by `sync-workflows.sh` |
| **drift state** | `<repoRoot>/.claude/workflows/.pdlc-drift-state.json` — the queue's only input |
| **managed row** | one entry of the distribution manifest's `rows` |
| **entrypoint** | one of the three surfaces that can run a drift computation: `hook`, `check`, `sync` |

### 0.2 Component inventory

Seven components. C1–C3 are new files; C4 is a placeholder so the inventory is exhaustive; C5–C7
are edits to existing files.

| # | Component | Path | Kind | Owns |
|---|---|---|---|---|
| C1 | drift library | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | bash, sourced (never executed) | baseline resolution, row classification, the drift-state writer, message formatting |
| C2 | SessionStart hook | `pdlc/hooks/scripts/check-workflow-drift.sh` | bash, executable | sources C1, warns, always exits 0 |
| C3 | sync tool | `pdlc/hooks/scripts/sync-workflows.sh` | bash, executable | sources C1, `--check` / plain / `--force`, backups, retirement, exit codes |
| C4 | fixture-free test support | *(TSPEC-owned)* | — | listed only so the inventory is exhaustive |
| C5 | builder | `pdlc/workflows/build-runtime.mjs` | ES module (node) | retargeted to `dist/`, emits the distribution manifest |
| C6 | queue workflow | `pdlc/workflows/orchestrate-queue.js` | ES module → bundle | one injected read of the drift state, AC-4.1 mapping |
| C7 | hook registration | `pdlc/hooks/hooks.json` | JSON | second `SessionStart` entry (REQ §6, BL-03) |

**C1 exists because the REQ requires it.** AC-2.7 mandates "exactly one writer routine, shared by
the hook and `sync-workflows.sh`", and AC-1.0's baseline-then-rows order plus AC-1.1's classifier
must produce identical results on all three entrypoints. A shared sourced library is the only
structure that makes "shared routine" a fact rather than a convention. C1 is **not** shipped as a
managed row (§1.1) — it ships with the plugin like any hook script and is never copied into a
consumer repo.

**Dependency direction is strictly one-way:** C2 and C3 source C1; C1 sources nothing and never
calls back into an entrypoint. C1 exposes exactly the surface in §3.1 and holds no global state
other than the documented output variables.

### 0.3 Prerequisites — status at FSPEC entry

REQ §7 gates BL-01, BL-03 and BL-06 as **"Before FSPEC"**. They are **not discharged**. This is
recorded here rather than worked around, and each is carried as an open question in §11:

| # | Claim | Status | What this FSPEC does about it |
|---|---|---|---|
| BL-01 | `${CLAUDE_PLUGIN_ROOT}` resolves in a consumer `SessionStart`, **and a nested build-output dir survives packaging** | **Discharged by measurement, 2026-07-28** (spike run per §7's positive-presence criterion — see OQ-1's resolution, §11) | The second clause is now measured true: an installed plugin built from this repo exposes a *readable* `${CLAUDE_PLUGIN_ROOT}/workflows/dist/distribution-manifest.json` whose bytes equal the repo's copy (sha1 `b4d18ba…5373` both sides). §7's shipping path stands |
| BL-03 | `hooks.json` accepts a second `SessionStart` entry | **Discharged by citation, 2026-07-28** (see OQ-2, §11): the hooks schema is array-based at both levels, all matching hooks run in parallel, and plugin hooks merge with user/project hooks — code.claude.com/docs/en/hooks | §5.1 stands. One caveat carried into §5.1: handlers are deduplicated by identical command string + args, so the two SessionStart commands must differ (they do — different scripts). A both-hooks-fire smoke observation remains an implementation-time check, not a blocker |
| BL-06 | Whether the runtime in a **linked worktree** loads `.claude/workflows/` from that worktree or the main one | **Answered by documentation, 2026-07-28: per-worktree (cwd-based).** Workflows load by walking up from the working directory (code.claude.com/docs/en/workflows), and worktrees share only `.git`, project-scope plugins and permission approvals (code.claude.com/docs/en/worktrees) — project `.claude/` content comes from the checkout you are in | **The unfavourable answer — REQ §7 BL-06's gating clause fires** ("AC-0.5's main-worktree resolution is insufficient and D-DIST-07 pulls into this feature"). **Operator decision 2026-07-28: Option B** — D-DIST-07 stays deferred to queue row 6; mitigations are normative in §7.5 (items 7–8) and §11.1 |
| BL-04 | The runtime's injected read can read the drift state and distinguish absence | **Discharged by citation**, §6.1 | — |
| BL-02 | The plugin package contains an artifact to copy | Discharged by §7 landing (AC-6.1 + AC-6.2) | — |
| BL-05 | Which artifact the runtime resolves when `X.js` and `X.bundle.js` share a `meta.name` | Deliberately not contingent (REQ §7) | §5.3 and §6.2 row 7 specify the safe default for the unfavourable case |

## 1. Data formats

Three JSON documents and one filename grammar. All three JSON documents are read with the JSON
utility (REQ §4) and never with `grep`/`sed`. All are UTF-8, LF-terminated.

### 1.1 Distribution manifest — `<pluginRoot>/workflows/dist/distribution-manifest.json`

Emitted by C5 (AC-5.1), read by C1. Sole authority for the managed set (AC-0.1).

```json
{
  "schemaVersion": 1,
  "generatedAtUtc": "2026-07-28T00:00:00Z",
  "pluginVersion": "0.11.0",
  "rows": [
    {
      "id": "orchestrate-dev",
      "pluginPath": "workflows/dist/orchestrate-dev.bundle.js",
      "consumerPath": ".claude/workflows/orchestrate-dev.bundle.js",
      "artifactVersion": "0.11.0",
      "pluginSha1": "<sha1 of the emitted bundle>",
      "retires": [".claude/workflows/orchestrate-dev.js"]
    },
    {
      "id": "orchestrate-queue",
      "pluginPath": "workflows/dist/orchestrate-queue.bundle.js",
      "consumerPath": ".claude/workflows/orchestrate-queue.bundle.js",
      "artifactVersion": "0.11.0",
      "pluginSha1": "<sha1 of the emitted bundle>",
      "retires": [".claude/workflows/orchestrate-queue.js"]
    }
  ],
  "retired": [
    ".claude/workflows/orchestrate-dev.js",
    ".claude/workflows/orchestrate-queue.js"
  ]
}
```

**Well-formedness predicate** (all clauses; any failure ⇒ `manifest-malformed`, AC-0.1/AC-0.2):

| # | Clause |
|---|---|
| M1 | Top-level is a JSON object; `schemaVersion` is the integer `1` |
| M2 | `rows` is an array. Zero rows is **well-formed** and yields `manifest-empty`, not `manifest-malformed` (AC-1.0 lists them separately) |
| M3 | Every row is an object with exactly the six keys `id`, `pluginPath`, `consumerPath`, `artifactVersion`, `pluginSha1`, `retires` — no more, no fewer. `retires` is an array, possibly empty, **never absent** |
| M4 | `id`, `pluginPath`, `consumerPath`, `artifactVersion`, `pluginSha1` are non-empty strings; every member of `retires` is a non-empty string |
| M5 | `pluginPath` and `consumerPath` and every `retires` member are **relative** — no leading `/`, no `.` or `..` segment, no backslash, no NUL |
| M6 | Every member of the union namespace `{row ids} ∪ {basename(p) : p ∈ any retires}` matches `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`, and the members are **pairwise distinct** (AC-0.1; the namespace is shared with backup filenames, §5.6) |
| M7 | No path appears in two rows' `retires`; no `retires` member equals any row's `consumerPath` (AC-0.1) |
| M8 | `retired` is present and its **set** equals the union of every row's `retires` (AC-0.2). Order and duplicates are ignored in the comparison; the two disagreeing as sets is malformed |
| M9 | `pluginSha1` matches `^[0-9a-f]{40}$` |
| M10 | **Containment (NFR-3's blast-radius bound), three clauses.** (a) Every `consumerPath` and every `retires` member begins with the literal prefix `.claude/workflows/` and names a file **directly** in it (exactly one path segment after the prefix). (b) **State-namespace reservation:** no `consumerPath` and no `retires` member may have a basename beginning with the literal `.pdlc-`. (c) Consequently none of them may lie inside `.pdlc-backups/` — clause (a) already excludes it, and (b) excludes the directory itself. A manifest that does not satisfy any clause is `manifest-malformed` — not a row-level problem |

**Why M10 is a validator clause and not a convention.** REQ §4 asserts "all consumer-side state
lives under `.claude/workflows/`" and NFR-3 forbids touching unmanaged files, but without M10 a row
declaring `consumerPath: "pdlc/workflows/orchestrate-dev.js"` — a build bug, or a hand-edited plugin
cache — would be *synced*: overwritten (backed up, but overwritten), and never seen by §3.5's
`not-managed` enumeration, which lists only `.claude/workflows/`. M10 makes the blast radius a spec
invariant that the consumer verifies at every run against the manifest it was handed, rather than a
property the builder is trusted to have preserved. `pluginPath` is deliberately **not** constrained
this way: it is read-only and lives in the plugin tree, whose layout is the builder's.

**Why clause (b) exists and is not covered by clause (a) or by M6.** M6's charset rule governs the
*union namespace* — row `id`s and `basename(retires)` — not `consumerPath` basenames, so without (b)
a row declaring `consumerPath: ".claude/workflows/.pdlc-drift-state.json"` (or
`".pdlc-sync-manifest.json"`) satisfies M1–M9 and clause (a). Sync would then treat one of *this
feature's own state files* as a managed artifact: overwrite it on every run, while §3.5's
`not-managed` enumeration would never surface it — it drops every basename starting `.pdlc-` by
design. The blast radius M10 exists to bound would then land squarely on the files the queue's whole
verdict depends on. The threat model is the same one clause (a) names: a build bug or a hand-edited
plugin cache, not a malicious manifest.

M1–M10 are evaluated in order and the **first** failure decides; the reason is always
`manifest-malformed` regardless of which clause failed, with the failing clause id printed on
stderr for the operator (not in the drift state — the reason set is closed, AC-1.0).

**Non-clause, stated:** the manifest is *not* validated against what the plugin directory actually
contains. A row whose `pluginPath` is absent is a **row-level** `unknown`/`plugin-artifact-missing`
(AC-1.2), never a malformed manifest. This keeps a single missing bundle from blanking the whole
managed set.

### 1.2 Sync manifest — `.claude/workflows/.pdlc-sync-manifest.json`

Written only by C3 (AC-1.6), read by C1 for the `stale`/`local-edit`/`unverified` discrimination.

```json
{
  "schemaVersion": 1,
  "entries": {
    "orchestrate-dev": {
      "id": "orchestrate-dev",
      "consumerHash": "<sha1 of the bytes written into consumerPath>",
      "pluginHash": "<sha1 of the source bytes>",
      "artifactVersion": "0.11.0",
      "pluginVersion": "0.11.0",
      "syncedAtUtc": "2026-07-28T09:14:02Z"
    }
  }
}
```

Keyed by row `id` so a lookup is O(1) and cannot be confused by a `consumerPath` change between
releases. **Degradation (AC-1.6, and O-8's verbatim requirement):** absent, unreadable, or
malformed ⇒ *every* row whose bytes differ classifies `unverified`; a row whose bytes are **equal**
still classifies `in-sync`. The unreadable and malformed cases print one stderr notice (§8.3 N-4);
the absent case does not — never having synced is the ordinary first-adoption state, not a fault.
An unreadable sync manifest is deliberately **not** a baseline reason.

`consumerHash` records the bytes the sync wrote, not the bytes of the source: they are equal by
construction after a **verified** copy (§5.5 re-reads the written file and compares it to
`pluginSha1`), but recording the written side is what makes `local-edit` detection correct if the
consumer file is later edited.

**A truncated copy never reaches this file.** Worked through, because v2 got the consequence wrong:
if a truncated copy *were* recorded, `consumerHash` would be the hash of the truncation, so the next
classification would find an entry, unequal bytes, and `sha1(consumer) == consumerHash` — i.e.
**`stale`**, not `local-edit` and not `unverified`. That is why §5.5 verifies the copy *before*
writing the entry: a copy that did not land gets **no** entry (AC-2.9(2)), the row stays
`unverified`, and the run exits 4. See §4.2 and §5.8, which v2 had disagreeing on this case.

### 1.3 Drift state — `.claude/workflows/.pdlc-drift-state.json`

The exact schema is fixed by REQ AC-2.6 and reproduced here as the writer's contract. All three
arrays are always present.

> **One field below is not in AC-2.6's listing: `syncCommand`.** It is an FSPEC-level addition
> forced by AC-4.2 + NFR-1 jointly (the queue must print a `<pluginRoot>`-expanded command and
> cannot expand one itself), argued in full at **OQ-5**. It is recorded here inline, not only in
> §11, because §1.3 is what an implementer and the PROPERTIES author read as the contract. A
> reviewer who holds that AC-2.6's key list is exhaustive should route this as a REQ amendment;
> this FSPEC does not amend the REQ.

```json
{
  "schemaVersion": 1,
  "generatedAtUtc": "2026-07-28T09:14:02Z",
  "generatedBy": "hook",
  "pluginVersion": "0.11.0",
  "checkEnabled": true,
  "syncCommand": "/Users/x/.claude/plugins/cache/yumo-plugins/pdlc/0.11.0/hooks/scripts/sync-workflows.sh",
  "baselineStatus": "resolved",
  "baselineReason": null,
  "retiredPresent": [
    { "path": ".claude/workflows/orchestrate-dev.js",
      "supersededBy": "orchestrate-dev",
      "supersedingState": "in-sync" }
  ],
  "writeFailures": [
    { "path": ".claude/workflows/orchestrate-queue.bundle.js", "operation": "artifact-copy" }
  ],
  "rows": [
    { "id": "orchestrate-dev",
      "state": "in-sync",
      "reason": null,
      "pluginHash": "<sha1>",
      "consumerHash": "<sha1>",
      "pluginArtifactVersion": "0.11.0",
      "consumerArtifactVersion": "0.11.0" }
  ]
}
```

Field rules the writer enforces:

- `generatedBy ∈ {"hook","check","sync"}` — the entrypoint, not the caller.
- `pluginVersion` is context only and is `null` when unreadable (AC-5.4). It is **always** `null`
  in the invalidation record (§4.4, O-4).
- `syncCommand` is the `<pluginRoot>`-expanded sync invocation, written so the queue can print a
  runnable command without resolving `<pluginRoot>` itself (AC-4.2 + NFR-1; OQ-5's resolution).
  `null` when `<pluginRoot>` did not resolve, and **always** `null` in **any record written by the
  §4.4a `printf` emitter — under both of its triggers**, not only the invalidation record. It is a
  path-bearing string with no escaping rule in that emitter, and neither trigger's remediation class
  is sync: T2's is permissions/filesystem, T1's (`json-tool-absent`) is "install a Python
  interpreter" (§5.2, §6.3). This is what makes §4.4a's closed-domain predicate true rather than
  nearly true.
- Because `syncCommand` is an FSPEC-level addition (OQ-5) rather than an AC-2.6 field, **a reader
  must tolerate its absence**: §6.2 D8 requires it to be `null`-or-string *if present* and §6.3
  treats absent exactly as `null`. A writer in §4.1 always emits it; a record that omits it is still
  shape-valid, so resolving OQ-5 against this FSPEC cannot block every consumer (SE F-16).
- `baselineReason` is `null` exactly when `baselineStatus == "resolved"`, else one of the eight
  closed values.
- When `baselineStatus == "unresolved"`: `rows == []` **and** `retiredPresent == []`, meaning *not
  evaluated* (AC-0.3b). `writeFailures` may still be non-empty.
- `rows` has exactly one entry per manifest row and nothing else. `not-managed` files never appear
  (AC-0.6); retired paths never appear (AC-2.6) — they travel in `retiredPresent`.
- `reason` is `null` on every state except `unknown`.
- `pluginHash` / `consumerHash` are `null` when not computed (unreadable side, or no hash tool).
- Hashes and versions are reporting-only. **No consumer of this file may derive a state from them**
  — the state is already decided.

### 1.4 Backup filename grammar

`.claude/workflows/.pdlc-backups/{id}.{YYYYMMDDTHHMMSSZ}-{NN}.bak` (AC-3.4).

```
backup   ::= id "." stamp "-" NN ".bak"
id       ::= ^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$      (the union namespace, M6)
stamp    ::= YYYY MM DD "T" HH MM SS "Z"            (UTC, fixed width, 16 chars)
NN       ::= ^(0[1-9]|[1-9][0-9])$                  (zero-padded, 01..99, ascending within one
                                                     second, never reused, never overwritten)
```

**The suffix is always present and always two digits.** AC-3.4 writes it `[-N]` and illustrates it
with `-2`, `-3`; this FSPEC emits `-01` for the *first* backup in a second and `-02`, `-03`, … for
subsequent ones. That choice is made inside AC-3.4's `[-N]` latitude and is what makes AC-3.4's own
normative sort clause **true**:

- With an optional bare form, `…091402Z.bak` and `…091402Z-2.bak` compare at `.` (`0x2E`) versus
  `-` (`0x2D`), so a `LC_ALL=C` **descending** filename sort puts the *older* un-suffixed file
  first. AC-3.5's P0 restore oracle ("restoring the **newest** backup for that id") would then
  restore the wrong file, and retention would prune the wrong member, whenever two backups for one
  id land in the same second.
- With the suffix mandatory and zero-padded, every filename for a given id has the **same length**
  and the varying part is a fixed-width `stamp` followed by a fixed-width `NN`. A plain `LC_ALL=C`
  descending filename sort is therefore exactly reverse-chronological, with no comparator and no
  special case — which is what AC-3.4 requires and AC-3.5 depends on.

**Parsing is by fixed offset, so the grammar has exactly one parse.** Everything after the id is
`"." + stamp(16) + "-" + NN(2) + ".bak"` = **24 bytes**, so `id := name[0 : len(name) - 24]`, and
the parse is accepted only if the trailing 24 bytes match the grammar above. This settles the
ambiguity an id-charset that admits stamp-shaped substrings would otherwise create: `format` is
injective (`format(id₁,s₁,n₁) == format(id₂,s₂,n₂) ⟹ id₁==id₂ ∧ s₁==s₂ ∧ n₁==n₂`), because the
three components occupy fixed positions counted from the end. A file named
`dev.20260101T000000Z-01.bak` is the id `dev`; a backup of the id `dev.20260101T000000Z` is
`dev.20260101T000000Z.20260102T000000Z-01.bak`, and the two can never be confused.

`NN` exhaustion (**99** backups of one id inside one second — the grammar is `01..99`, and §5.6
says the same) is a write failure, not a silent reuse:
the backup is reported skipped with `operation: backup`, the destroying operation does **not**
proceed (§4.7), and the run exits 4.

Retention prunes to the newest 5 **per id** and never touches a file that does not match this
pattern for a *currently known* id — a stray file in the backup directory is left alone forever.
**The grammar's round-trip is a PROPERTIES obligation, §10 O-18.**

## 2. Baseline resolution (FSPEC-DIST-01)

**Linked requirements:** AC-0.1, AC-0.2, AC-0.3, AC-0.3a, AC-0.3b, AC-0.4, AC-0.5, AC-1.0, and
§4's tool declarations.

Baseline resolution runs first on every entrypoint and produces either
`baselineStatus=resolved` plus a managed set, or `baselineStatus=unresolved` plus exactly one
reason. **No row is classified and nothing is created on disk until it completes** (AC-1.0,
AC-2.9(1)).

### 2.1 Behavioral flow — two phases, deliberately separated

Baseline resolution is **evidence gathering** followed by **reason selection**. The separation is
not cosmetic: it is what makes §2.8's declared precedence — which is REQ §4's, and normative —
actually observable. A single short-circuiting ladder cannot realise that precedence, because the
ladder's order is forced by *data dependencies* (you cannot know a manifest is empty without a JSON
tool to parse it) while the precedence is ordered by *what the operator should be told*.

#### Phase 1 — evidence gathering (no reason is chosen here)

Each probe records one of `holds` / `does-not-hold` / **`indeterminate`**. A probe is
`indeterminate` exactly when a probe it depends on did not succeed — never for any other reason.
Nothing is written to disk in this phase.

```
E1  resolve consumer repo root       → repoRootUnresolved ∈ {holds, does-not-hold}
E2  probe JSON utility               → jsonToolAbsent     ∈ {holds, does-not-hold}
E3  resolve <pluginRoot>             → pluginRootUnset, pluginRootUnreadable
E4  stat + read manifest bytes       → manifestAbsent      (indeterminate if E3 failed)
                                     → pluginRootUnreadable may also be established here
E5  parse + validate (M1..M10)       → manifestMalformed   (indeterminate if E2 or E4 failed)
E6  rows empty?                      → manifestEmpty       (indeterminate if E5 failed)
E7  resolve checkEnabled             → never fails (fail-closed true, §2.7)
```

Three points about the dependencies, because they bound what the precedence can ever observe:

- **E4 is JSON-free.** "The manifest file is not there" is a `stat`, so `manifestAbsent` is
  determinate even when `jsonToolAbsent` holds. `manifestMalformed` and `manifestEmpty` are not.
- **E1 is independent of E2–E6.** The consumer's repo root and the plugin's manifest are unrelated
  filesystem facts, so `repoRootUnresolved` genuinely co-holds with any of them. This is the pair
  that made v1's ladder observably disagree with its own declared precedence.
- **E1 no longer short-circuits, and the write guard moved with it.** v1 stopped at E1 on the
  argument that a run with no write target should not do further work. That argument is an
  efficiency claim, not a correctness one, and it cost the feature its declared precedence. The
  probes E2–E6 are a bounded number of `stat`s plus at most three helper invocations (§13.1), none
  of which write anything.

  **But removing the short-circuit removed an equivalence the rest of the document was relying on.**
  While E1 short-circuited, "`repoRootUnresolved` **holds**" and "`repo-root-unresolved` is the
  **selected reason**" were the same predicate, so it did not matter which one the write guard was
  keyed to. They are no longer the same predicate — §2.8's worked table shows
  `repoRootUnresolved` + `manifestEmpty` reporting `manifest-empty` — and at first release the
  divergent case is the *ordinary* one, because `manifest-absent` is universal then (§2.5).
  **The guard is therefore keyed on the evidence, not on the selection:**

  > **No-write-target rule (normative, condition-keyed).** Whenever the E1 evidence
  > `repoRootUnresolved` **holds**, no `<repoRoot>`-relative path is created, written, backed up,
  > deleted or opened for writing by this run — no `mkdir`, no drift state, no sync manifest, no
  > backup, no copy, no retirement — **regardless of which reason §2.1 Phase 2 selected for
  > reporting.** There is no write target to key a path off, so any such write would have to be
  > invented relative to `$PWD`, which §2.2 clause 2 exists to forbid.

  §4.2 steps 3 and 9 state the same rule operationally, §5.1's exception 1 states it as the hook's
  first write exception, and §5.8 gives its exit code (**3**; never 4, because nothing was
  attempted, so `writeFailures` is necessarily empty). §8.3 **N-8** is the operator-visible
  observable for the case where the *reported* reason is something else.

#### Phase 2 — reason selection

Apply §2.8's declared precedence, highest first, over the conditions that **hold and are
determinate**. The first such condition is `baselineReason`; if none holds,
`baselineStatus = resolved` and the managed set is `rows`. Selection is total by construction: the
list is exhaustive over the reason set and its fall-through is `resolved`.

**An `indeterminate` condition is never selected.** There are exactly two dependency edges that can
make a condition indeterminate, and each is argued on its own terms — v2 prefaced this with the
universal "that prerequisite's own condition is higher in the precedence **in every case**", which is
false for the second edge (`plugin-root-unreadable` and `plugin-root-unset` are the two *lowest*
entries in §2.8, below `manifest-absent`). The universal is dropped; the two-case argument is the
real one, and it is what O-9's fixture generation should be read against:

1. **E2 → E5/E6.** When `jsonToolAbsent` holds, `manifestMalformed` and `manifestEmpty` are
   indeterminate — and `json-tool-absent` **outranks** both in §2.8, so the selector stops above
   them and never faces the choice.
2. **E3 → E4.** When `pluginRootUnset` or `pluginRootUnreadable` holds, `manifestAbsent` is
   indeterminate. Here the prerequisite's condition is *lower* in the precedence, so the ranking
   argument does not apply — but the choice still never arises, because the only way the selector
   reaches the `manifest-absent` row is by finding every higher row false, and it then finds
   `manifestAbsent` indeterminate and continues to the two `plugin-root-*` rows, one of which holds.

So the selector never has to choose between "not determinable" and "true".

### 2.2 E1 — consumer repo root (AC-0.5)

```
if git is on PATH and `git rev-parse --git-dir` succeeds:
    candidate := work-tree path of the FIRST record of `git worktree list --porcelain`
    accept iff:  candidate is not bare
             and candidate is traversable
             and `git -C candidate rev-parse --show-toplevel` agrees with candidate
    if any check fails → repo-root-unresolved        # step 3, NEVER the walk
else:
    walk upward from $PWD to the nearest ancestor containing `.claude/`,
    stopping before $HOME and before /
    not found → repo-root-unresolved

finally, whichever step produced it:
    if resolved == $HOME or resolved == / → repo-root-unresolved
```

Three points the REQ makes load-bearing and the implementation must not soften:

1. **"If step 1 applies and any check fails, the result is step 3 — never the walk."** A git work
   tree whose main-worktree probe fails does **not** fall through to the upward walk. A wrong root
   is worse than a refusal, because a wrong root is a write target.
2. The `$HOME` / `/` rejection is applied **after** either step, not inside step 2's stopping
   condition alone. `~/.claude/` exists on every machine running Claude Code; no operation in this
   feature may ever write under `$HOME/.claude/`.
3. `git worktree list --porcelain` is why §4 declares `git ≥ 2.7.0`. Paths are compared after
   `realpath`-style normalisation so a symlinked `$HOME` does not defeat clause 2.

Linked worktrees of one clone therefore share one `.claude/workflows/`, one sync manifest, one
drift state (D-DIST-07, and **OQ-3**/BL-06).

### 2.3 E2 — JSON utility

The three shipped hook scripts already share a Python-interpreter discovery loop (REQ §0 fact 9);
C1 reuses it verbatim rather than inventing a second one (NFR-5).

The JSON read is a **dedicated four-outcome helper**, not a bare `python -c` (REQ §4):

| Outcome | Exit | Meaning |
|---|---|---|
| parsed | `0` | value printed on stdout |
| unreadable | `10` | path exists but could not be opened/read |
| absent | `11` | path does not exist |
| malformed | `12` | read succeeded, JSON parse failed |

`10`–`12` sit outside CPython's own `1`/`2` and outside the script's `0`–`4` exit space, so an
interpreter crash is never mistaken for a data verdict. The helper catches named exceptions only —
**never a bare `except`** — so an interpreter-level fault surfaces as CPython's exit, which the
caller treats as "no usable JSON tool".

No interpreter found ⇒ `json-tool-absent`, a **baseline** reason: without JSON there is no manifest,
hence no managed set. This is the whole-run degradation NFR-5 contrasts with the hash tool's
row-level one.

### 2.4 E3 — `<pluginRoot>` (AC-0.3, AC-0.3a, AC-0.4)

```
if <repoRoot>/pdlc/workflows/build-runtime.mjs exists:      # the maintainer marker
    <pluginRoot> := <repoRoot>/pdlc
    ${CLAUDE_PLUGIN_ROOT} is NOT consulted; its being unset is not an error
else:
    <pluginRoot> := ${CLAUDE_PLUGIN_ROOT}, used verbatim
    unset or empty            → plugin-root-unset
    set but not traversable   → plugin-root-unreadable
```

The maintainer branch is checked **first** so that a maintainer who happens to have the plugin
installed still gets their working tree as the baseline — otherwise their own repo would report
every row stale-or-worse forever and block the queue on itself (AC-0.3a rationale).

`${CLAUDE_PLUGIN_ROOT}` is used **verbatim**. C1 contains no code that enumerates, sorts, or
version-compares `~/.claude/plugins/cache/**` — REQ §0 fact 7 measured two concurrently cached
versions, and picking between them is exactly the bug AC-0.4 forbids.

The maintainer marker is `build-runtime.mjs` rather than, say, `.claude-plugin/` because the marker
must be a file only the *source* tree has; a packaged plugin ships `.claude-plugin/` too.

### 2.5 E4/E5 — manifest load

Read via the JSON helper (§2.3), **never** via the hash utility — AC-0.4 is explicit that
hash-tool absence is a row-level reason and never a baseline one.

| Helper outcome | Condition established |
|---|---|
| absent (`11`) | `manifestAbsent` |
| unreadable (`10`) | `pluginRootUnreadable` |
| malformed (`12`), or any M1–M10 failure | `manifestMalformed` |

**Existence is probed without the JSON tool.** E4 first `stat`s the manifest path; only if it exists
and is readable does the JSON helper parse it. That is what keeps `manifestAbsent` determinate on a
machine with no interpreter, and it is the only reason the precedence in §2.8 can distinguish
"your plugin ships no manifest" from "this machine cannot read JSON".

`manifest-absent` maps to AC-0.3b — **every** consumer at first release. Its remediation on every
surface is **update the plugin**, never `sync-workflows.sh`: syncing cannot create a manifest that
the installed plugin does not ship. The `checkEnabled` escape stays reachable because E7 runs on
the unresolved path too (§2.7) — with the one stated exception in §2.7's final paragraph.

### 2.6 E6 — `manifest-empty`

A parsed manifest with zero rows is well-formed but yields `baselineStatus: unresolved`, reason
`manifest-empty`. Rationale, stated by AC-1.0: a size-zero managed set satisfies every universal
claim ("all rows in-sync") vacuously, so treating it as resolved would turn an empty manifest into
a silent green.

### 2.7 E7 — `checkEnabled` (AC-4.3)

Resolved by the **shell writer**, never by the queue (one-read rule, NFR-1), and recorded in the
drift state.

| Read of `.claude/pdlc.config.json` | `checkEnabled` |
|---|---|
| parsed, `distribution.checkEnabled` present and boolean | that boolean |
| parsed, key absent | `true` |
| file absent | `true` |
| unreadable or malformed | `true` + one verbatim stderr notice (§8.3 N-5) |
| present but not a boolean (string `"false"`, number, null) | `true` + the same notice |
| **no JSON utility on this machine (`jsonToolAbsent`)** | **`true`** + the same notice — see below |

Fail-closed to `true` in every degraded case. E7 runs on **both** the resolved and unresolved
paths, and on the invalidation record (§4.4) — this is what AC-2.9(3) means by "the record
preserves `checkEnabled`", and it is why a consumer whose drift state is unwritable *for
permission or space reasons* can still opt out.

**The `json-tool-absent` residual — accepted and stated.** `.claude/pdlc.config.json` is a JSON
document, and §1 forbids reading any of this feature's JSON documents with `grep`/`sed`. On a
machine with no Python interpreter the config is therefore unreadable **by construction**, AC-4.3's
fail-closed rule forces `checkEnabled: true`, and the documented opt-out is **not reachable** in
that state: the baseline is `unresolved`/`json-tool-absent`, so §6.2 blocks the queue and no
recorded `false` can unblock it.

This FSPEC does not invent an escape. The two candidates were both rejected: a fixed-literal `grep`
of one key would make a JSON document's meaning depend on a line-oriented pattern match — exactly
the class of bug the "never `grep`/`sed`" rule exists to prevent, and it would disagree with the
JSON reader on any config the two parse differently; and an environment-variable override would be
a **third** config surface, which NFR-6 forbids ("exactly two exceptions") and AC-2.9(5) reinforces
by making the two env seams test-only and not config surfaces.

The residual is therefore recorded on the same footing as NFR-6 exception (ii): **on a machine with
no Python interpreter, the queue is blocked and the only remediation is to install one.** That
remediation is exactly what AC-2.5a already names for `json-tool-absent`, it is announced on stderr
at every drift computation, and it is a one-command fix on every platform Claude Code runs on. §4.4
is corrected to match: rung (i) preserves a genuinely-`false` `checkEnabled` in the
`ENOSPC`/immutable/read-only-mount cases, **not** in the `json-tool-absent` case.

### 2.8 Baseline reason precedence (AC-1.0, §4)

When several conditions hold, one reason is reported, by this declared precedence — highest first,
the reverse of §4's listing order:

```
drift-state-invalidated
  > manifest-empty > json-tool-absent > manifest-malformed > manifest-absent
  > repo-root-unresolved > plugin-root-unreadable > plugin-root-unset
```

`drift-state-invalidated` is highest because it is written by the drift-state writer *about this
run's own failure* — "nothing in this file measures this run" dominates any statement the file
would otherwise carry. It is the only reason not produced by §2.1's evidence phase: it is produced
by §4.4 rung (i), after selection has already happened, and it replaces whatever reason the record
would otherwise have carried.

**This precedence is the selector, not a commentary on one.** §2.1 Phase 2 *is* this list; there is
no second ordering anywhere in the feature, and no short-circuit that can pre-empt it. That is the
whole reason §2.1 is written in two phases — v1 declared this precedence and then evaluated a
ladder whose order was its near-reverse, so the two disagreed for every pair that can co-hold
(`repo-root-unresolved` with `manifest-empty` being the plainest). Worked consequences, all
normative and all fixture-constructible for O-9:

| Conditions that hold | Reported `baselineReason` | Anything written? | `--check` exit |
|---|---|---|---|
| `repoRootUnresolved` + `manifestEmpty` | `manifest-empty` | **no** — §2.1's no-write-target rule; N-8 also printed | **3** |
| `repoRootUnresolved` + `jsonToolAbsent` | `json-tool-absent` | **no**; N-8 also printed | **3** |
| `repoRootUnresolved` + `manifestAbsent` (the ordinary first-release consumer outside a repo) | `manifest-absent` | **no**; N-8 also printed | **3** |
| `jsonToolAbsent` + `manifestAbsent` | `json-tool-absent` | yes — drift state written by the §4.4a T1 emitter | 3 |
| `jsonToolAbsent` + manifest present (so malformed/empty are **indeterminate**) | `json-tool-absent` | yes (T1 emitter) | 3 |
| `repoRootUnresolved` + `pluginRootUnset` | `repo-root-unresolved` | **no** (N-8 not printed — W-1 already names this reason) | **3** |
| `repoRootUnresolved` alone | `repo-root-unresolved` | **no** (N-8 not printed) | **3** |
| none | `resolved` | yes | per §5.8 |

The third and fourth columns are the point of this table's v3.0 revision: **the reported reason and
the write behavior are decided by different things.** The reason comes from the precedence above;
whether anything is created comes from the `repoRootUnresolved` *condition* (§2.1's no-write-target
rule). Every row in which that condition holds writes nothing, exits 3 on `--check`/sync and 0 on
the hook, and carries an empty `writeFailures` — exit 4 is unreachable there, because nothing was
attempted. **AT-33** is the fixture for row 1.

### 2.9 Edge cases

| Case | Behavior |
|---|---|
| `$PWD` deleted underneath the process | `git rev-parse` fails, walk cannot start ⇒ `repo-root-unresolved` |
| `<repoRoot>` resolves but `.claude/` absent | Not a baseline failure. Rows classify `missing` (AC-3.8) and the run creates the directory *after* classifying (§4.2) |
| `${CLAUDE_PLUGIN_ROOT}` set to a **file** | not traversable ⇒ `plugin-root-unreadable` |
| Manifest readable, one `pluginPath` absent | baseline **resolved**; that row is `unknown`/`plugin-artifact-missing` (§3.4) |
| Maintainer marker present **and** `${CLAUDE_PLUGIN_ROOT}` set to some other plugin | marker wins; the env var is not consulted (AC-0.3a) |
| Manifest has 2 rows with the same `id` | M6 pairwise-distinct fails ⇒ `manifest-malformed` |
| `retired` array present but empty while a row has non-empty `retires` | M8 set-equality fails ⇒ `manifest-malformed` |

## 3. Row classification (FSPEC-DIST-02)

**Linked requirements:** AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, AC-1.7, AC-1.8, AC-0.6.

Runs once per managed row **per classification pass**, only under a resolved baseline, against the
filesystem as it stands when the pass runs.

**How many passes a run makes (§4.2):**

| Entrypoint | Passes | Named | What the drift state records |
|---|---|---|---|
| hook | 1 | **as-found** | the as-found pass |
| `--check` | 1 | **as-found** | the as-found pass (nothing changed, so as-found == post-run) |
| sync (plain or `--force`) | **3** | **as-found** (step 2), **post-copy** (step 5), **post-run** (step 7) | the **post-run** pass |

The three passes, each with the step it runs at and what it is *for* — v2 counted two and §5.7
silently required a third, which made §13.1's spawn bound and O-1's trace vocabulary wrong together:

| Pass | §4.2 step | Scope | Purpose | Feeds |
|---|---|---|---|---|
| **as-found** | 2 | every managed row | the AC-2.9(1) classification, before this run creates anything | every copy / backup / retire **decision** (§5.5, §5.7) |
| **post-copy** | 5 | only rows R with a non-empty `retires` whose retired paths exist | AC-3.9's "R's post-copy state is `in-sync`" gate, measured after step 4's copies and before step 5's deletions | the retirement decision only — never the record |
| **post-run** | 7 | every managed row, plus a re-probe of retired paths | the state the record carries | `rows[]`, `retiredPresent[]`, and the exit code (§5.8) |

The as-found pass is the one AC-2.9(1) governs. The post-copy pass exists because AC-3.9 conditions
the deletion on a state that only exists after the copies; it is deliberately **narrow** (only rows
that can retire something) and it is **never** recorded. The post-run pass exists because AC-2.6
records `supersedingState` "sync: post-copy", AC-2.7 requires a post-sync drift state to unblock the
queue **within the same session**, and AC-3.3's exit table is applied to the post-run state (§5.8).
It must be a separate invocation from the post-copy pass, because step 5's deletions have to be
visible to it.

All three call the same pure `classify_row`; there is no second classifier and no derived-state
shortcut. **The trace grammar must label all three distinctly** (§10 O-1, O-7) — labelling only two
is what would let the ordering assertion be satisfied by the wrong pass. §13.1 budgets three.
See **OQ-6** and **§10 O-20** for the one REQ sentence this reading has to interpret.

### 3.1 C1's classifier surface

```
classify_row(rowId, pluginPath, consumerPath) -> (state, reason, pluginHash, consumerHash,
                                                  pluginArtifactVersion, consumerArtifactVersion)
```

Pure with respect to the filesystem: it reads, it never writes, and it never spawns a process other
than the declared hash utility. Rows are independent (AC-1.4) — no row's outcome is an input to
another's, and the loop has no early exit.

**The hash-utility *probe* is performed once per run, not once per row** (SE Q-02). `classify_row`
receives the resolved utility (or the fact that none exists) as an input; it never re-probes. This
is what §13.1's structural latency claim depends on — per row the spawn count is at most **two**
hash invocations and nothing else — and it is also why `hash-tool-absent` is a property of the
machine that is identical for every row in a run, which is precisely the justification §3.3 gives
for ranking it first.

### 3.2 Probes

Six probes, each with a three-valued outcome (`yes` / `no` / `indeterminate`). "Indeterminate" is
what produces `unknown`, and keeping it distinct from "no" is the whole of AC-1.1's `missing`
caveat.

| # | Probe | `indeterminate` when |
|---|---|---|
| P1 | plugin artifact exists | its first existing ancestor is not traversable |
| P2 | plugin artifact readable | — (open failure is a definite `no`) |
| P3 | consumer artifact exists | its first existing ancestor is not traversable |
| P4 | consumer artifact readable | — |
| P5 | sha1 of a readable file | hash utility absent |
| P6 | sync-manifest entry for `rowId` | manifest unreadable/malformed ⇒ treated as **no entry**, §1.2 |

**The definite-negative rule (AC-1.1).** `missing` is the one non-`unknown` state that sync
overwrites *without a backup*, so it demands a **definite** negative: the path is absent **and its
first existing ancestor is traversable**. An absent path behind an untraversable ancestor is
`unknown`, not `missing`. An entirely **absent** ancestor chain establishes absence — which is what
lets the fresh-consumer bootstrap classify `missing` rather than `unknown` (AC-3.8).

### 3.3 Decision procedure

Evaluated in AC-1.8(ii)'s fixed precedence — `unknown` > `missing` > `in-sync` > `unverified` >
`stale` > `local-edit`. First match wins; the ladder is total.

```
1. unknown    if  P5 unavailable (no hash tool)      → hash-tool-absent
              or  P1 == no                           → plugin-artifact-missing
              or  P1 indeterminate                   → plugin-artifact-unreadable*
              or  P2 == no                           → plugin-artifact-unreadable
              or  P3 indeterminate                   → consumer-artifact-unreadable
              or  (P3 == yes and P4 == no)           → consumer-artifact-unreadable
2. missing    if  P3 == no (definite)
3. in-sync    if  sha1(consumer) == sha1(plugin)
4. unverified if  P6 == no entry
5. stale      if  sha1(consumer) == syncManifest[id].consumerHash
6. local-edit otherwise
```

\* P1 indeterminate is an untraversable ancestor **on the plugin side**; its reason is
`plugin-artifact-unreadable`, the same as an unreadable plugin artifact. (Written out as its own
line rather than folded in, because the four reasons exist precisely so the remediations differ —
AC-1.2. v1 wrote `consumer-artifact-unreadable` on this line, which contradicted this very footnote
and would have routed the operator to the wrong fix.)

**Row reason precedence (§4, AC-1.2):**
`hash-tool-absent` > `plugin-artifact-missing` > `plugin-artifact-unreadable` >
`consumer-artifact-unreadable`. `hash-tool-absent` outranks the rest because it is a property of
the machine, not of any path — remediating a permission while no hash tool exists changes nothing.
`reason` is `null` on every state except `unknown`.

**The ladder above evaluates in exactly this order, and that is the point.** v1 probed `P5` *last*,
so on the entirely ordinary machine with no `shasum`/`sha1sum` and a row whose `pluginPath` is
absent it emitted `plugin-artifact-missing` while the declared precedence (and REQ §4) demanded
`hash-tool-absent`. §3.6's claim that single-valuedness is *structural* is only true when the
first-match order and the declared precedence are the same list, so they are now the same list.

Two consequences of ranking `P5` first, both intended and both testable:

- On a machine with no hash utility, **every** managed row is `unknown`/`hash-tool-absent`,
  regardless of what any path looks like. That is the correct report: nothing on that machine can
  be verified, and telling the operator about a missing plugin artifact first would send them to
  reinstall a plugin that would still not verify afterwards.
- `hash-tool-absent` is therefore all-or-nothing across a run (§3.1's once-per-run probe), never
  per row. A fixture in which some rows carry it and others do not is unconstructible, and O-9
  should not generate one.

Row reasons and baseline reasons are **disjoint sets** (AC-1.2); a row reason exists only under a
resolved baseline. Nothing in the implementation may write a baseline reason into `rows[].reason`
or vice versa.

### 3.4 Business rules

| # | Rule | Source |
|---|---|---|
| R-1 | `stale` vs `local-edit` is discriminated **solely** by `sha1(consumer bytes) == syncManifest[id].consumerHash`. `pluginHash` is reporting-only and never enters a state decision | AC-1.1 |
| R-2 | **mtime is never read.** Not for state, not for backup retention, not for tie-breaking. Byte-identical ⇒ `in-sync` regardless of timestamps | AC-1.3 |
| R-3 | No sync-manifest entry ⇒ `unverified`, never `stale`, never `local-edit`. First adoption must be safe in both directions | AC-1.7 |
| R-4 | Equal bytes classify `in-sync` **regardless of provenance** — a degraded sync manifest cannot turn a byte-identical row into `unverified` | AC-1.6, **O-8** |
| R-5 | All four `unknown` reasons: never `in-sync`, never copied by sync, `--check` exit 3, queue `blocked` | AC-1.2 |
| R-6 | A file in `.claude/workflows/` with no manifest row and in no `retires` is `not-managed`: never read for comparison, never overwritten, never deleted | AC-1.5, NFR-3 |
| R-7 | A retired path is neither a managed row nor `not-managed` — it is quarantined by sync (§5.7) | AC-0.7 |

### 3.5 `not-managed` and the report-only listing (AC-0.6)

Produced when a **human-facing report** is built, not when the managed set is computed:

```
enumerate .claude/workflows/ once (non-recursive)
  drop every basename starting ".pdlc-"            # no state file describes itself
  drop every path that is some row's consumerPath
  drop every path in any row's retires             # those are retired-present, §5.7
  remainder → not-managed
```

This is the **only** operation that needs directory *read* permission. When enumeration fails, the
report says so (§8.3 N-6) and **no row state changes** — the managed set came from the manifest,
never from a directory listing (AC-0.1's globbing prohibition).

`not-managed` never appears in `rows` (AC-2.6) and is not one of AC-1.1's six states.

### 3.6 Classifier properties (AC-1.8) — restated as a PROPERTIES obligation

The classifier is required to be **total**, **single-valued** with the precedence in §3.3, and
**deterministic** (same filesystem inputs ⇒ same state across runs and processes, independent of
clock, mtime, environment order, directory order), with the same three properties holding for
`rows[].reason` and for `baselineReason`.

The FSPEC's contribution is the decision procedure above, which is written as a first-match ladder
whose order **is** the declared row-reason precedence — that is what makes single-valuedness
structural rather than asserted. The corresponding guarantee for `baselineReason` is §2.1 Phase 2,
which applies §2.8's declared precedence directly as its selector. Both declared precedences are
therefore observable and O-9 can generate fixtures for each; §2.8's worked table and §3.3's two
consequences are the starting rows. **Generating the axes and fixtures is PROPERTIES' obligation,
§10 O-9** — and v13's axis tables are explicitly *not* to be imported (24 of 96 cells were
undefined).

Two determinism hazards the implementation must avoid, called out because they are easy to
reintroduce in bash:

- **Directory order.** `not-managed` output is sorted `LC_ALL=C` before printing. Row order in
  `rows` follows the **manifest's** row order, never a glob's.
- **Environment order.** No behavior depends on the iteration order of environment variables or on
  locale; every comparison and sort in C1/C3 runs under `LC_ALL=C`.

## 4. The shared drift-state writer (FSPEC-DIST-03)

**Linked requirements:** AC-2.6, AC-2.7, AC-2.9(1)–(5), AC-2.4, AC-4.3.
**Disposes:** §10 **O-4** (the `printf` invalidation emitter), **O-5** (ladder rung-2
reachability), **O-6** (the both-failed message).

### 4.1 Writer inventory (AC-2.7) — exhaustive

| Writer | Component | `generatedBy` |
|---|---|---|
| SessionStart hook | C2 | `"hook"` |
| `sync-workflows.sh --check` | C3 | `"check"` |
| `sync-workflows.sh` (plain or `--force`) | C3 | `"sync"` |

**This list is exhaustive.** `build-runtime.mjs` (C5) is not on it and gains no write target
(AC-6.1). `orchestrate-queue` (C6) reads only. Any future process gaining write access to the drift
state must be added to this table in the same commit — the REQ makes that a requirement, and the
FSPEC records it as a maintenance rule on this section.

All three call **one routine in C1**. Neither entrypoint contains its own serialiser.

### 4.2 Ordering: classify first, create second (AC-2.9(1))

The complete run ordering, for every entrypoint. Steps marked **sync only** do not execute on the
hook or under `--check`.

```
1. resolve baseline                                   (§2, both phases; E7 completes HERE)
2. classify every row + probe retired paths           (§3, §5.7)   ← filesystem AS FOUND
                                                       — pass 1: AS-FOUND, the AC-2.9(1) pass
   ── nothing above this line has created anything on disk ──
   ── steps 3-9 are SKIPPED ENTIRELY when repoRootUnresolved holds (see below) ──
3. mkdir -p .claude/ and .claude/workflows/           ← at most these two, at process umask
4. sync only: for each row, backup (§4.7) then copy,  (§5.5)
              then VERIFY the copy by re-read
5. sync only: retirement — re-classify each retiring  (§5.7)      ← pass 2: POST-COPY
              row, then backup and delete                           (retiring rows only)
6. sync only: sync-manifest update for copied rows    (§1.2)
              — only rows whose step-4 verification passed
7. sync only: RE-CLASSIFY every row + re-probe        (§3)         ← pass 3: POST-RUN
              retired paths                                         — the recorded pass
8. build the record                                   (§1.3)
9. atomic write of the drift state                    (§4.3)
10. compute the exit code over the record just built  (§5.8)
```

**Which pass the record carries — the question v1 left open, answered.**

| `generatedBy` | `rows[]`, `retiredPresent[]` come from |
|---|---|
| `"hook"` | step 2 (the only pass) |
| `"check"` | step 2 (the only pass) |
| `"sync"` | **step 7** (the post-run pass) |

Steps 4–6 read their decisions **only** from step 2, so AC-2.9(1)'s "the whole drift computation
has run against the filesystem as found" governs every action this run takes. Step 7 changes no
decision; it only re-measures, so that the file the queue reads describes the tree the queue will
work in. Three approved requirements make step 7 mandatory rather than optional:

- **AC-2.6** records `supersedingState` as "measured at write time (hook: session start; check:
  current; **sync: post-copy**)". A pre-copy `supersedingState` is not post-copy.
- **AC-2.7** states the consequence that "post-sync drift state is current within the same session,
  so the queue unblocks without a restart". With a pre-copy record, a successful sync would write
  `rows[].state: "stale"` and §6.2 row 6 would keep the queue blocked — the promise would be false.
- **AC-3.3 / §4** compute the exit code over "the observed state at the end of the run". Step 10
  reads the record built at step 8, so there is exactly one state in play and the exit code and the
  drift state can never disagree.

**Step 7 is a fresh invocation of the same `classify_row`,** not a derivation from copy success.
Deriving would re-introduce the very failure this feature exists to catch: a copy that reported
success but truncated would be recorded `in-sync` by derivation, whereas measurement records what is
actually there. **Worked correctly, which v2 did not do:** because §1.2's `consumerHash` records the
bytes *written*, an unverified truncated copy would measure **`stale`** at step 7 (an entry exists;
bytes differ from the plugin; `sha1(consumer) == consumerHash`) — not `local-edit` and not
`unverified`. A `stale` row in a sync run's own record means exit **1**, which §5.8 previously
declared unreachable. That contradiction is closed at its source: **step 4 verifies every copy by
re-read (§5.5) and step 6 writes a sync-manifest entry only for rows that passed**, so a corrupted
copy produces no entry, stays `unverified`, and the run exits **4**. §5.8's exit-1 claim is
correspondingly restated as a conditional resting on that verification. §3.1's classifier is pure and
cheap (its hash-utility probe already happened once per run), so the extra passes cost at most two
more hash invocations per row each.

**O-1's "single classification invocation" is unaffected — but it scopes to three named phases, not
two.** The trace assertion is scoped to one invocation, the **as-found** pass. Steps 5 and 7 are two
*further* distinct, separately-labelled phases in the trace grammar (§10 O-1, O-7): a grammar that
names only "as-found" and "post-run" leaves step 5's invocation unlabelled, and an oracle built
against it either double-counts or mistakes the post-copy pass for the as-found one — precisely the
ordering invariant O-1 exists to protect. v1's §3 text ("runs once … as found") is corrected in §3:
once per row *per pass*, and a sync run makes **three** passes.

**Step 3 is guarded on the E1 *condition*, not on the reported reason.** Steps 3–9 execute **only**
after step 2, and are **skipped entirely — no `mkdir`, no artifact copy, no backup, no retirement,
no sync-manifest update, no drift-state write — whenever the evidence `repoRootUnresolved` holds**,
whatever reason §2.1 Phase 2 selected for reporting (§2.1's no-write-target rule). Keying this on the
*selected reason*, as v2 did, left every co-holding state undefined: `repoRootUnresolved` +
`manifest-absent` is the ordinary first-release case, and in it there is no `<repoRoot>` for
`.claude/workflows/…` to be relative to, so the only available implementations are "write under
`$PWD`" — which §2.2 clause 2 forbids outright — or "silently skip", which no clause authorised.
The run still classifies nothing (the baseline is unresolved on every such path, so `rows` is `[]`
by AC-0.3b), still prints W-1 for the selected reason, additionally prints **N-8** when that reason
is not `repo-root-unresolved`, carries an empty `writeFailures`, and exits **3** on `--check`/sync
and **0** on the hook (§5.8). Step 3 is **also** never executed under `$HOME` or `/` (§2.2), which
is a distinct guard on the same step.

Otherwise, a first run on a fresh consumer records `missing` rows in a directory that the very same
run then creates — the intended, stated behavior (AC-3.8), not an inconsistency. (On a `--check`
run, step 7 does not execute, so those rows stay `missing` in the record; on a sync run, step 7
measures them `in-sync` after step 4 copied and verified them.)

**`checkEnabled` is resolved inside step 1** (§2.1 E7), before any write is attempted, so it is
available to §4.4's invalidation record whatever happens at steps 3–9 (SE Q-04).

The alternative — skip the write when the directory is absent — was considered and rejected by the
REQ: it leaves the queue permanently blocked at rollout and makes the `checkEnabled` escape
unreachable.

**The ordering invariant needs a script-layer call-order observable. That is a TSPEC obligation
(§10 O-1)**, and the `PDLC_TRACE_FILE` seam (§4.6) exists to serve it.

### 4.3 Atomic write

Sibling temp file in the destination directory, then `mv` (same filesystem, so the rename is
atomic). Whole-file; last complete write wins. No reader ever observes a partial record.

Consequence the REQ draws out: a post-sync drift state is current **within the same session**, so
an operator who syncs mid-session unblocks the queue without restarting. This is also why AC-4.1
has no freshness clause — every writer refreshes the file, so a stale snapshot cannot outlive the
operation that invalidated it.

### 4.4a The `printf` emitter — what it is, and when it is the writer

The `printf` emitter is introduced by AC-2.9(3) for rung (i), but it is not *only* rung (i)'s. It is
this feature's **serialiser of last resort**, and stating its trigger condition here closes the gap
v1 left: with no JSON tool there was no specified way to write the ordinary drift-state record at
all, so the ladder's "most important case" could never be entered and its test had no fixture.

**Definition.** The emitter serialises, with `printf` alone and no JSON tool, exactly those records
**every field of which is closed-domain** (§4.4's table below enumerates them, plus the one escaped
string). That is precisely the **unresolved-baseline** record shape: `rows` and `retiredPresent` are
`[]` by AC-2.6, `baselineStatus`/`baselineReason` are closed literals, `generatedBy` and
`checkEnabled` are closed sets, and `generatedAtUtc` is fixed-width. It **cannot** serialise a
resolved record — arbitrary `id`s and hashes are not closed-domain — and it is never asked to.

**Two fields are forced to `null` to make that predicate true, under *both* triggers.**
`pluginVersion` and `syncCommand` are arbitrary strings from the plugin cache and the filesystem
respectively; the emitter has no escaping rule for either (§4.4's printable-ASCII rule is scoped to
`writeFailures[].path`). So the emitter writes **`pluginVersion: null` and `syncCommand: null`
unconditionally**, whether it is serialising the ordinary T1 record or the T2 invalidation record.

> v2 stated this for the invalidation record only, and separately claimed `syncCommand` was `null`
> "in the unresolved shape" — which is false under T1: `<pluginRoot>` resolution is a file-existence
> test plus an env var (§2.4) and needs no JSON tool, so on the ordinary no-Python consumer with an
> installed plugin, `syncCommand` is a non-`null` arbitrary path. The closed-domain predicate was
> therefore false for exactly the record the emitter most often writes. Closing the field costs
> nothing: `json-tool-absent`'s remediation is **install a Python interpreter**, never sync (§5.2,
> §6.3), so a `syncCommand` in a T1 record would never be printed as a remediation anyway. §6.3's
> `null` fallback — "run the sync script shipped with the installed plugin", by description rather
> than a fake path — is what the operator sees, and it is already specified.

**Trigger conditions — exhaustive, two of them:**

| # | Condition | Which record |
|---|---|---|
| T1 | `jsonToolAbsent` holds (§2.1 E2) | the run's **ordinary** record, written through the normal step-3/step-9 path (`mkdir -p`, sibling temp, `mv`) |
| T2 | the drift-state write failed over a **pre-existing** file (AC-2.9(3)) | the **invalidation** record, written in place per rung (i) |

T1 is well-defined because `jsonToolAbsent` forces `baselineStatus: unresolved`
(reason `json-tool-absent`, §2.8), which is exactly the shape the emitter can serialise. So:

- On a **first-adoption** consumer with no JSON tool — no `.claude/workflows/`, no pre-existing
  drift state — the run creates the directory (step 3) and the emitter writes a complete, parseable
  record through the ordinary atomic path. The queue then blocks at §6.2 row 4 naming
  `json-tool-absent`, with AC-2.5a's remediation, rather than at row 1 naming nothing. This is TE
  Q-01's answer: **yes, a record is written.**
- If *that* write fails and a drift state pre-exists, the ladder below runs — and its rung (i)
  emitter is the same routine, differing only in `baselineReason` and in writing in place.
- If that write fails and **no** drift state pre-exists (a `mkdir` failure on a fresh consumer),
  rungs (i) and (ii) have no target: (i)'s in-place overwrite has nothing to overwrite and (ii)'s
  `unlink` has nothing to unlink. Both are no-ops and the outcome is **rung (iii) directly** — the
  queue then sees an absent file, §6.2 row 1, `blocked`. This is stated so O-10's fixture inventory
  is correct and so no one builds a fixture for a rung-(i) success that cannot exist.

### 4.4 Failure class (a): `mkdir` or the atomic replace fails — the invalidation ladder (AC-2.9(3))

Entry condition, verbatim from AC-2.9(3): **the drift-state write failed over a pre-existing file.**
Three rungs, **stop at first success**:

```
(i)   in-place overwrite with a schema-valid invalidation record
(ii)  unlink the file, then write it fresh
(iii) print the residual to stderr and exit 4   (hook: 0)
```

#### Rung (i) — the invalidation record. **Disposes O-4.**

Written **over the pre-existing file in place**, without `mv`, and **without the JSON tool** — it is
the §4.4a emitter under trigger T2. O-4 requires the `printf` form because the write must succeed on
a machine where no serialiser exists at all, and because the ladder must not acquire a dependency
that the failure it is recovering from may itself have removed. A `printf` template can only be safe
if every interpolated value is closed-domain, so:

| Field | Value in the record | Why it is safe to interpolate |
|---|---|---|
| `schemaVersion` | `1` | literal |
| `generatedAtUtc` | ISO-8601 Z from `date -u` | fixed-width, closed charset |
| `generatedBy` | this entrypoint | closed 3-member set |
| `pluginVersion` | **`null`, unconditionally** | it is an arbitrary string from the plugin cache — the one field that could inject arbitrary bytes into the template. It is context-only (AC-5.4), so emitting `null` loses nothing |
| `syncCommand` | **`null`, unconditionally — under both triggers** (§4.4a) | a path-bearing string with the same injection profile as `pluginVersion`, and neither trigger's remediation class is sync (T2: permissions/filesystem; T1: install a Python interpreter) — §1.3, OQ-5. **Listed because AC-2.9(3) requires a schema-valid record and §1.3 makes this a top-level field** |
| `checkEnabled` | this run's resolved boolean | closed 2-member set — see the honesty note below |
| `baselineStatus` | `"unresolved"` | literal |
| `baselineReason` | `"drift-state-invalidated"` | literal (this is the one reason not produced by §2.1 Phase 2; it **replaces** whatever Phase 2 selected — §2.8) |
| `rows`, `retiredPresent` | `[]` | literal |
| `writeFailures` | this run's collected entries, **filtered** — see below | `path` is **not** closed-domain — see below |

**`writeFailures` filtering (TE Q-04).** **Four** of §4.5's nine `operation` values — `mkdir`,
`drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink` — describe failures *of the
record itself*, so they are stderr-only and cannot be *in* the record. (v2 wrote "three" and then
listed four; §4.5's arithmetic, 4 stderr-only + 5 recordable = 9, is the correct one. The count is
stated here because this clause is transcribed literally into the emitter, and "three … one of
those" invites dropping a member.) The emitter therefore drops every collected entry whose
`operation` is one of those four before interpolation; what remains is drawn from the five
recordable operations, each a closed-set literal that interpolates safely. If nothing
remains, `writeFailures` is `[]`. (This filter is the emitter's, not the caller's, so both trigger
conditions get it.)

**Path escaping — a decidable predicate, no UTF-8 validation.** `writeFailures[].path` is a
filesystem path and is not closed-domain. The rule, evaluated byte-wise under `LC_ALL=C`:

```
if EVERY byte of the path is in the printable-ASCII range 0x20..0x7E:
     emit it, with  \  →  \\   and  "  →  \"        (the only two escapes needed)
else:
     emit the literal string   "<unprintable>"      (the WHOLE path, not the offending byte)
```

v1 said "a byte that cannot be represented" and never defined which bytes those are, so an
implementer escaping only `\`, `"` and `< 0x20` satisfied every clause literally and still emitted
an unparseable record for a path containing a lone `0x80`. The predicate above removes the class:
every byte outside printable ASCII — control bytes, `0x7F`, any byte `≥ 0x80` whether or not it
forms valid UTF-8 — takes the `<unprintable>` branch, so no `\uXXXX` rule and no UTF-8 validator is
needed anywhere in the emitter. **A path can never break the record's parseability**, and the claim
is now checkable rather than asserted.

**Stated cost:** a legitimately non-ASCII path (an accented directory name) is reported as
`<unprintable>` in the *invalidation* record. That record exists to say "nothing here measures this
run"; the operator's next action is a permissions/filesystem fix, and the same path is printed
**verbatim on stderr** by W-7, which has no serialisation constraint. Nothing is lost that the
operator needs.

**Honesty note on `checkEnabled` (see §2.7).** The rung preserves a genuinely-`false`
`checkEnabled` in every case where a JSON tool exists and the config was read — `ENOSPC`/quota,
immutable attribute, read-only mount, unwritable parent. It **cannot** preserve `false` under
`json-tool-absent`, because in that state AC-4.3's fail-closed rule already forced `true` before the
ladder ran; there is no JSON-tool-free read of the config and this FSPEC does not invent one. v1
called `checkEnabled` "the field the whole rung exists to preserve" while pointing at
`json-tool-absent` as the rung's most important case — the two could not both be true. The rung's
purpose stands for the permission/space cases; the `json-tool-absent` residual is **accepted and
stated** in §2.7, with "install a Python interpreter" as its named remediation.

**Record-first ordering is deliberate** (AC-2.9(3)): an *absent* drift state blocks the queue at
AC-4.1 row 1, which sits **above** the `checkEnabled` row. Unlinking first would therefore make the
documented opt-out unreachable on a permanently-unwritable consumer. The record preserves
`checkEnabled`; that is why it is rung (i) and not rung (ii).

**Mandated test, per O-4:** a `json-tool-absent` test asserting that the emitted record *parses*
**and** that AC-4.1's mapping over it produces the `baselineStatus`-unresolved outcome. Both
conjuncts are required — a record that parses but that the mapping cannot classify is exactly the
undefined region §6.2 row 10 now closes. AT-14 (trigger T1) and AT-14b (trigger T2, where a `false`
`checkEnabled` is genuinely recordable) carry it; TSPEC owns their construction (§10 O-10).

#### Rung (ii) — `unlink` and retry. **Disposes O-5.**

`unlink(2)` is attempted only if rung (i) failed. O-5's point, carried here as spec: **rung (ii) is
reachable for essentially one cause.** The table is keyed on the cause of the *atomic replace's*
failure (§4.3's sibling-temp + `mv`), which is what the ladder is entered from:

| Cause of the §4.3 atomic-replace failure | Does rung (i)'s **in-place overwrite** succeed? | Does rung (ii)'s `unlink` succeed? | Rung that lands |
|---|---|---|---|
| **parent directory not writable (`EACCES`), the drift-state file itself writable** | **yes** — an in-place `open(O_WRONLY\|O_TRUNC)` of an *existing* file needs write permission on the **file**, not on its directory. Only §4.3's sibling **temp creation** needed the directory | not reached | **(i)** |
| `ENOSPC` / quota exhausted | no — there is no space for the new bytes either | yes — `unlink` frees space and needs none | **(ii)** |
| immutable attribute (`chattr +i`, `uchg`) | no — `EPERM` | no — `EPERM` | (iii) |
| append-only attribute | no — `EPERM` on `O_TRUNC` | no — `EPERM` | (iii) |
| a **directory** at the path | no — `EISDIR` | no — `EISDIR`/`EPERM` on `unlink` | (iii) |
| read-only mount | no — `EROFS` | no — `EROFS` | (iii) |
| parent directory not writable **and** the file not writable | no — `EACCES` | no — `EACCES` | (iii) |

**Row 1 is the correction v2 needed.** v2's table listed "parent directory not writable" as a
rung-(iii) cause and offered *no* cause under which rung (i) succeeds — which left O-4's mandated
rung-(i) test, the `checkEnabled: false` preservation claim of §2.7/§4.4, and §6.2 row 2's
"the opt-out stays reachable" claim all without a constructible fixture, and put **AT-14b** and
**AT-15** on the same Given with mutually exclusive Thens. The unwritable-parent case is exactly the
asymmetry rung (i) exists for: the atomic path needs the directory, the in-place path does not.
**AT-14b is re-based on it**; AT-15 keeps `ENOSPC` in a writable directory and the two no longer
collide.

`ENOSPC`/quota remains the only ordinary path to rung (ii); the rest are rung-3 residual, derived the
same way the read-only-mount case is. The implementation still *attempts* each rung unconditionally
in order — probing the cause first would be a syscall race — but the spec states the reachability so
that TSPEC does not attempt to build fixtures for unreachable variants.

If `unlink` succeeds, a fresh write is attempted; if **that** fails, the ladder falls to (iii).

#### Rung (iii) — residual

Print to stderr and exit 4 (hook: 0). **Accepted, stated residual** (NFR-6 exception ii): on a
consumer where neither the drift state nor its directory is writable, the queue may proceed on
stale contents. This is announced on stderr at **every** drift computation — not once — so it
cannot become invisible. Message N-3, §8.3.

### 4.5 Failure class (b): a per-row write fails (AC-2.9(2))

Applies to the five recordable operations: `artifact-copy`, `backup`, `backup-verify`,
`retire-delete`, `sync-manifest-update`.

```
the run CONTINUES to the next row                    (rows are independent, AC-1.4)
that row's sync-manifest entry is NOT written
{ path, operation } appended to writeFailures
final exit 4;  queue blocks
```

Write failure is a **run-level** outcome — deliberately not a fifth row reason (AC-2.9(2)), so
`rows[].reason` stays the four-member closed set and "could not verify" stays distinct from "could
not write".

`operation` is the closed nine-member set of §4: `mkdir`, `drift-state-replace`,
`drift-state-invalidate`, `drift-state-unlink` (stderr-only — they describe a failure of the record
itself, so they cannot be *in* the record), plus the five recordable ones above.

Exit **4** ("attempted and could not write") is distinct from exit **3** ("no write target"). 4
outranks 3 because "could not repair the record" dominates "could not verify".

#### The both-failed message. **Disposes O-6.**

When a run fails **both** a per-row write **and** the drift-state write, the operator must be told
about the **invalidated state**, not only the failed copy — otherwise they fix the copy, re-run,
and are still blocked by a record that no longer measures anything. The message emits **both**
lines, drift-state line **first**, and it names the state explicitly:

```
pdlc: drift state at .claude/workflows/.pdlc-drift-state.json could not be written
      (operation: drift-state-replace). The recorded state does not describe this run.
      Fix filesystem permissions or free space; syncing will not repair this.
pdlc: 1 artifact write also failed:
      .claude/workflows/orchestrate-queue.bundle.js (artifact-copy)
```

The ordering is normative: the drift-state failure is the one that changes what the operator should
*do next* (a permissions/filesystem fix, never a sync — AC-4.2 puts `drift-state-invalidated` in
that remediation class).

### 4.6 Test seams (AC-2.9(5)). **Disposes O-2.**

Two declared, test-only environment seams owned by C1/C3. **Neither is a config surface**, and
every other observable is identical with the seams on or off.

| Seam | Unset behavior | Set behavior |
|---|---|---|
| `PDLC_TRACE_FILE` | inert | append-only call trace; a failure to open or append is **ignored by the script** |
| `PDLC_FAULT` | inert | closed token set; injects one fault |

**An unrecognised `PDLC_FAULT` token** — this is exactly what O-2 requires FSPEC to pin, so that
NFR-6's "exactly two exceptions" stays true:

```
print ONE line to stderr:  pdlc: unrecognised PDLC_FAULT token "<token>"; no fault injected
inject nothing
exit per AC-2.9(5), verbatim:
     hook    → 0     (unconditionally; NFR-6 admits no third exception)
     --check → 4
     sync    → 4
```

AC-2.9(5) reads: an unrecognised token "prints one stderr line, injects nothing, and uses the
entrypoint's normal exit — **4 on `--check`/sync, 0 on the hook**". The AC fixes both halves
explicitly, so `--check` and sync exit **4** — the same code a genuine usage error (an unknown
`--flag`) produces, and for the same reason: a `--check`/sync invocation is an *assertion* surface,
and an environment it does not understand is a failed assertion, not a green one. The hook is the
sole exception because AC-2.4 makes its exit 0 absolute.

> **v1 deviated here and this version conforms.** v1 pinned `--check`/sync to "its computed exit
> (0–4)" on the argument that an unrecognised token "must not manufacture a 4". That argument
> contradicts the plain text of an approved AC on a P0 requirement, and the REQ text is what TSPEC
> and PROPERTIES will cite. The FSPEC does not amend an approved REQ; where it disagreed, it is the
> FSPEC that changed. **AT-18 changes with it** — `--check` under an unrecognised token now exits
> **4**, not 0.

Note that the drift computation still **runs** and its record is still written: "injects nothing"
means the run is not perturbed, and only the process exit is pinned. So a `--check` whose tree is
green still writes a green drift state and the queue still proceeds — the token affects the
operator-visible exit of the assertion surface, nothing else.

The trace failure asymmetry is deliberate and stated: the **script** ignores a trace-write failure
(it must never change production behavior), while the **test** that relies on the trace treats an
unwritable trace as red. That split is TSPEC's to implement (§10 O-1).

The trace grammar — delimiter, quoting, whether non-row probes are traced, and the **three pass
labels** §3/§4.2 now require (`as-found`, `post-copy`, `post-run`) — is **TSPEC's, §10 O-7**. The
seam's *existence*, and the fact that the labels must be three and distinct, are mandated here and
by §4; only the grammar is downstream.

**`PDLC_FAULT`'s token set is closed at TSPEC, not here (TE Q-01).** NFR-6's "exactly two
exceptions" argument requires the set to be closed *somewhere*, and TSPEC is where it belongs: the
injectable-failure inventory is already O-10's, and the tokens exist to serve the fixtures O-10
designs (AT-14b, AT-15, AT-16, AT-17, AT-27, AT-35 each need one or a mount-level equivalent). This
FSPEC pins only the two things a token set cannot decide for itself: that the set **is** closed, and
what an unrecognised token does (above). **§10 O-10** carries the enumeration obligation.

### 4.7 No destroy before verified backup (AC-2.9(4))

A cross-cutting rule binding every destroying operation in §5:

```
1. copy the pre-existing bytes to the backup path            (§1.4)
2. RE-READ the backup from disk and hash it
3. compare to the hash of the source bytes
4. equal    → proceed with the overwrite/delete
   not equal or step 1/2 failed
            → original UNTOUCHED
            → operation reported skipped
            → writeFailures gains { path, backup|backup-verify }
            → exit 4
```

Step 2 is a genuine re-read, not a reuse of the in-memory hash: the failure this guards against is
a backup that was written but did not land. A recorded hash is explicitly **not** a substitute for
a backup — a digest cannot restore content (AC-3.4).

## 5. Operator surfaces (FSPEC-DIST-04, FSPEC-DIST-05)

### 5.1 The SessionStart hook — C2 (AC-2.1–2.5a, 2.8, 2.4)

**Registration (BL-03, OQ-2).** `pdlc/hooks/hooks.json` gains a **second** `SessionStart` entry
beside `nudge-consolidation.sh`. Without this edit the hook never fires (REQ §6). Both entries are
independent; neither's failure suppresses the other.

**Behavioral flow:**

```
run the shared drift computation (§2, §3, §4)
emit warnings per §5.2
ALWAYS exit 0
```

**AC-2.4 is absolute.** The hook exits `0` on every path — including an internal error, a failed
baseline, a failed write, and an unrecognised `PDLC_FAULT` token. A broken drift check must never
block a session from starting. This is implemented as a trap plus an unconditional `exit 0` at the
end, not as per-branch discipline.

Exiting 0 is about **not blocking**, never about staying quiet: every non-green condition produces
output, and the failure is recorded in the drift state as well as on stderr — as
`baselineStatus: unresolved` + reason, or as `unknown` rows + reason, per level. The drift-state
write happens on every failure path with **exactly two exceptions**, both stated by AC-2.4:

1. **No write target** — the E1 evidence **`repoRootUnresolved` holds**. Nothing is created
   anywhere. Note the predicate carefully: this exception is keyed on the *condition*, **not** on
   `repo-root-unresolved` being the reason the run *reports*. Since v2 removed E1's short-circuit,
   a higher-precedence reason (`manifest-absent` — universal at first release — `manifest-empty`,
   `json-tool-absent`, `manifest-malformed`) is frequently reported while this condition holds, and
   the exception applies in every one of those runs (§2.1's no-write-target rule, §4.2 steps 3/9,
   §2.8's worked table). The hook prints W-1 for whatever reason was selected, plus **N-8** when
   that reason is not `repo-root-unresolved`, and exits **0**; `--check`/sync exit **3**.
2. **Write attempted and failed** — the AC-2.9(3) ladder ran and reached rung (iii).

The two exceptions are disjoint and are distinguished by whether anything was *attempted*:
exception 1 leaves `writeFailures` empty and cannot produce exit 4, while exception 2 is exit 4's
defining case (hook: 0).

### 5.2 Warning taxonomy — exhaustive over non-silence

AC-2.2 requires that the warning ACs be **exhaustive over the conditions that break silence**:
there is no silent non-green state. The hook emits, in this order:

| Order | Condition | AC | Message |
|---|---|---|---|
| 1 | `baselineStatus: unresolved` (incl. `manifest-empty`) | AC-2.5a | W-1 — manifest-level reason **verbatim**, textually distinct from every row-level message, + a remediation that can actually fix it. **No rows are printed** |
| 2 | any row `unknown` | AC-2.5 | W-2 — one line per row, each of the four reasons individually distinguishable with its own remediation |
| 3 | any row `unverified` | AC-2.5 | W-3 — "direction unknown"; remediation is *diff, then sync*; `--force` named |
| 4 | any row `local-edit` | AC-2.3 | W-4 — **textually distinct from `stale`**, does **not** recommend plain sync, names `--force` and the backup location |
| 5 | any row `stale` or `missing` | AC-2.1 | W-5 — row `id`, state, and the exact remediation command |
| 6 | `retiredPresent` non-empty | AC-2.8 | W-6 — token `retired-present`, emitted **independently of managed-row states** |
| 7 | `writeFailures` non-empty | AC-2.9(2) | W-7 — one line per entry, path + operation |

**Silence (AC-2.2)** requires *all* of: `baselineStatus: resolved`, a **non-empty** row set, every
row `in-sync`, no retired path present, and `writeFailures` empty. Silence means everything was
verified — never "could not check". A non-empty row set is part of the condition precisely so that
`manifest-empty` cannot go vacuously silent.

**AC-2.5a's remediations**, one per baseline reason, each chosen to be the thing that actually
fixes it:

| Reason | Remediation |
|---|---|
| `manifest-absent`, `manifest-malformed`, `manifest-empty` | **update the plugin** (never sync) |
| `plugin-root-unset` | environment fix — `${CLAUDE_PLUGIN_ROOT}` is not set |
| `plugin-root-unreadable` | deliberately **generic** environment/permissions fix — the cause could be either, and guessing wrong sends the operator down a dead end |
| `repo-root-unresolved` | "create `.claude/` at the intended root, or run inside a git work tree" |
| `json-tool-absent` | install a Python interpreter |
| `drift-state-invalidated` | permissions/filesystem fix — **never** sync (§4.4, AC-4.2) |

`manifest-absent` is universal at rollout, which is why AC-2.5a exists at all: without it, the
single most common state at first release reaches the operator as silence.

### 5.3 Retired-artifact warning (AC-2.8)

Emitted whenever a path in some row R's `retires` exists in the consumer — **independently of
managed-row states**. All-`in-sync` with a legacy `.js` still on disk still warns; that
configuration is precisely the one where the runtime may load the stale artifact (BL-05).

Retirement is manifest-derived, so it is **not evaluated while the baseline is unresolved** — that
case belongs to AC-2.5a end to end, and `retiredPresent` is `[]` meaning *not evaluated*.

Token: `retired-present` — deliberately in **neither** reason set (it is a message token, not a
`baselineReason` and not a row `reason`). Each warning names the retired path, R's `id`, and R's
state, with a remediation conditioned on R's state:

| R's state | Remediation |
|---|---|
| `in-sync` (the primary, rollout-universal case), `stale`, `missing` | plain sync |
| `local-edit`, `unverified` | `--force`, naming the backup **directory** and both backup filename **patterns** — R's bundle and the retired basename, each labelled |
| `unknown` (any of the four reasons) | plugin update or environment fix; **sync is not named** |

Two rules the implementation must not soften: the `--force` case prints a directory plus a literal
*pattern*, **never a concrete filename** (the concrete name depends on a timestamp that does not
exist yet); and **manual deletion is never recommended**, in any state — the tool backs up before
it deletes, and an operator deleting by hand loses that.

### 5.4 `sync-workflows.sh` — delivery and invocation (REQ-DIST-03 preamble)

A **bash script** (NFR-5) shipped at `<pluginRoot>/hooks/scripts/sync-workflows.sh`, invoked
directly by the operator, and runnable in the maintainer repo with **no plugin installed**
(AC-0.3a). It is not an LLM prompt: an LLM-driven file copy is neither deterministic (NFR-1) nor
auditable. A thin discoverability `SKILL.md` may exist, but its **only permitted action** is to run
the script verbatim and relay its output — it may not paraphrase, summarise a decision, or copy a
file itself.

**If that `SKILL.md` ships in the landing commit it is inside `coveredViolations`' scan (TE Q-03).**
It lives under `pdlc/skills/`, which none of §7.5's four exemptions covers, so its wording must
avoid all five patterns — in particular it must not name `.claude/workflows/*.js` or describe
"copying the bundle into a consumer repo". That is not a hardship: the correct text for it is "run
this script", which contains none of them. The rule §7.5 already states applies here unchanged — a
false positive is resolved by **rephrasing the document**, never by narrowing a pattern — so AT-22's
live-root `== ∅` assertion stays green on the landing commit either way.

Three modes:

| Invocation | Writes artifacts? | Writes drift state? | `generatedBy` |
|---|---|---|---|
| `--check` | no | **yes** (and, per AC-2.9(1), the directory containing it) | `check` |
| *(no flags)* | `stale` + `missing` rows | yes | `sync` |
| `--force` | additionally `local-edit` + `unverified` rows, after verified backup | yes | `sync` |

`--check` and a sync run are mutually exclusive; `--check --force` is a usage error (exit 4).

### 5.5 Copy semantics (AC-3.1, AC-3.2)

Row states are read from §4.2's **step-2** (as-found) pass; the loop is §4.2 step 4.

```
for each row, in manifest order:
    if state == missing                               → copy            (NO backup — see below)
    elif state == stale                               → verified backup (§4.7), then copy
    elif state ∈ {local-edit, unverified} and --force → verified backup (§4.7), then copy
    else                                              → skip, report the reason
```

Every row falls in **exactly one** of the copy set / skip set (AC-3.1) — the loop has no
fall-through and no row is silently ignored.

**Why `stale` takes a backup even without `--force`, and `missing` does not.** AC-3.4's trigger is
"a sync overwrites or deletes **any existing file**". A `stale` row *is* an existing consumer file
about to be overwritten, so it is inside AC-3.4 and the verified backup is mandatory. AC-1.1 says it
from the other side: `missing` is "**the one** non-`unknown` state sync overwrites without a
backup" — one, not two — and it is the only one because there is nothing there to destroy. §3.2's
definite-negative rule is what makes that safe: a `missing` classification requires the path to be
absent *and* its first existing ancestor traversable, so "nothing to back up" is a measured fact,
not an assumption.

v1's procedure grouped `stale` with `missing` and backed up neither, which destroyed operator
content with no backup on the **most common sync path** while §3.2, §4.7 and §5.6 all said the
opposite. **AT-26** now pins it: plain sync of a `stale` row backs up first, and restoring that
backup yields the pre-sync bytes.

A backup failure on a `stale` row is §4.7's failure branch — the row is **not** copied, the
operation is reported skipped, `writeFailures` gains an entry, and the run exits 4. A row the
operator cannot back up is a row the tool will not overwrite, in every state.

**Post-copy verification — the symmetric half of §4.7 (new in v3.0; SE F-18 / SE Q-02).** §4.7
mandates re-read-and-verify before a *destroying* operation but v2 mandated nothing equivalent for
the *copy* itself, so a silently corrupted copy was recorded as provenance-verified. Each copy
therefore ends with:

```
4. mv temp → consumerPath                                  (atomic, as above)
5. RE-READ consumerPath from disk and hash it
6. compare to the row's pluginSha1 (equivalently, to sha1 of the source bytes)
7. equal      → the copy stands; step 6 of §4.2 writes its sync-manifest entry
                with consumerHash = that measured hash
   not equal  → the copy is a FAILED write:
                  no sync-manifest entry for this row       (AC-2.9(2))
                  writeFailures gains { path, artifact-copy }
                  the loop CONTINUES to the next row        (AC-1.4)
                  the run exits 4
```

Three things this pins deliberately:

- **The `operation` stays `artifact-copy`.** §4.5's nine-member `operation` set is REQ §4's and is
  closed; a verification failure is a copy that did not land, not a tenth kind of failure.
- **The consumer file is left as the copy left it.** Unlike §4.7's branch there is nothing to
  preserve — the pre-existing bytes were already backed up (`stale`, or `--force` over
  `local-edit`/`unverified`) or absent (`missing`) — and rolling back would be a second unverified
  write. The operator's remediation is the backup, named by W-4/W-7.
- **This is what keeps §5.8's exit-1 claim true.** Without it, an unverified truncated copy yields a
  sync-manifest entry over truncated bytes, §4.2 step 7 measures the row **`stale`**, and the sync
  run exits **1** — see §1.2's worked trace and §5.8's restated claim. With it, the row has no
  entry, measures `unverified`, and 4 dominates. **AT-35** is the fixture.

- **Never copied under any flag:** all four `unknown` reasons. `--force` overrides *provenance*
  doubt, never *verification* failure — forcing a copy over a row whose plugin side is unreadable
  would write bytes nobody has read.
- **Per-row atomicity:** sibling temp + `mv`, same as the drift state.
- **Every copy is verified after it lands** — the §4.7 discipline, applied to copies rather than
  backups. See the clause below; this is new in v3.0 and it is what makes `consumerHash`'s
  "bytes written" rule (§1.2) safe.
- **Each copy is reported with both hashes** (AC-3.1).
- **The sync manifest is updated per copied row** — and *only* per **verified**-copied row. A row
  whose copy failed **or whose copy failed verification** gets **no** sync-manifest entry
  (AC-2.9(2)), which is what keeps a failed copy from later masquerading as `stale` instead of
  `unverified`.
- **A failed copy does not abort the loop** (AC-3.1): `writeFailures` entry, continue, exit 4.
- **Unresolved baseline:** copy nothing, retire nothing, print the manifest-level reason +
  remediation, **still rewrite the drift state** (AC-2.7, AC-3.1).

`sync-workflows.sh` is the **only** writer of managed artifacts into `.claude/workflows/`, in every
repo including the maintainer's (AC-1.6). The maintainer green path is two commands: **build, then
sync** (AC-0.3a).

### 5.6 Backups (AC-3.4, AC-3.5)

Every overwrite or delete this feature performs is preceded by a verified backup (§4.7) at
`.claude/workflows/.pdlc-backups/{id}.{stamp}-{NN}.bak` (§1.4). **This includes a plain sync's
`stale` rows** (§5.5) — the only state overwritten without a backup is `missing`, where nothing
exists to destroy.

- **Id namespace** is the union of row ids and retired basenames (AC-0.1/M6) — so retirement
  backups share the retention rule, and the pairwise-distinctness clause is what stops a retired
  basename from colliding with a row id in this directory.
- **Same-second collision:** `-01`, `-02`, … ascending, always present, always zero-padded (§1.4).
  A backup file is **never overwritten**; suffix exhaustion at `-99` is a `backup` write failure,
  never a reuse.
- **Retention: newest 5 per id**, selected by `LC_ALL=C` lexicographic **descending** filename sort.
  Because the suffix is mandatory and fixed-width, every filename for one id has the same length and
  the sort is exactly reverse-chronological with no comparator and no special case (§1.4 derives
  this, and derives why the optional-suffix form v1 specified was not). Pruning is **never**
  mtime-based and never touches a file that does not match the §1.4 pattern for a currently-known id.
- **Backup dir creation** follows AC-2.9(1) (classify first); its failure is the write-failed
  outcome, `operation: backup`.
- **Restore (AC-3.5):** restoring the newest backup for an id yields a file **byte-identical** to
  its pre-sync content. This is the one oracle for AC-3.4 that cannot be false-greened — a hash
  comparison can pass against a backup that was never written; a restore cannot.

### 5.7 Retirement (AC-3.9)

```
for each path p in each row R's retires, where p exists and the baseline is resolved:
    if sync run (NOT --check):
        if R's POST-COPY state == in-sync:
            verified backup of p (id = basename(p))      §4.7
            success  → delete p
            failure  → leave p, report retire-skipped, writeFailures, exit 4
        else:
            leave p, report retire-skipped naming R's state
    if --check:
        report retired-present, exit class 1 (sync-fixable, same as stale)
```

- **`iff` R's post-copy state is `in-sync`** — measured *after* this run's copies, not before. Any
  other state, **including every `unknown`**, leaves `p` in place. The failure mode this prevents
  is deleting the loadable artifact and leaving nothing behind.
- **Where that measurement comes from, concretely (§4.2): the POST-COPY pass — a third named
  classification pass, not a hidden one.** Retirement is step 5, immediately after the copy loop at
  step 4. "R's post-copy state" is obtained by re-running `classify_row` for R against the tree as
  it stands at step 5 — the same routine, same inputs discipline. It is *not* inferred from "the
  copy at step 4 reported success". This invocation is **distinct from both** the step-2 as-found
  pass and the step-7 post-run pass: it must be, because step 5's own deletions have to be visible
  to step 7. §3's table names it, §13.1 budgets it, and §10 O-1/O-7 require the trace grammar to
  label it distinctly — v2 counted two passes here and its NFR-2 bound and trace vocabulary were
  both wrong as a result. The pass is **narrow**: only rows with a non-empty `retires` whose retired
  paths exist are re-classified, and its results are **never** recorded. The record's
  `retiredPresent` comes from step 7's re-probe, so a path deleted at step 5 correctly does **not**
  appear in it, and `supersedingState` is post-copy exactly as AC-2.6 requires.
- **Per path, idempotent, never before its replacement is in place.**
- A `mv` into the backup directory is an acceptable implementation of backup-then-delete.

**Version control — two rules of different kind, and only the second ships:**

1. A **one-time maintainer landing step** in this repo `git rm`s the four tracked
   `.claude/workflows/*` paths and gitignores the directory's generated contents (§7.5).
2. **In any consumer, sync never runs a VCS command.** It detects tracked-ness best-effort
   (`git ls-files --error-unmatch`; no usable git ⇒ **treat as untracked**) and prints a one-line
   manual action telling the operator to commit the removal. **Detection failure never blocks
   retirement** — the retirement is the safety-relevant act; the commit reminder is a courtesy.

### 5.8 Exit codes (AC-3.3). **Disposes O-14.**

The complete precedence table — highest applicable wins, never green while anything is unverified:

| Condition (precedence order) | Exit |
|---|---|
| any mandated write was attempted and failed (AC-2.9(2)) | **4** |
| the E1 evidence `repoRootUnresolved` **holds** — no write target, so nothing was attempted and `writeFailures` is necessarily empty (§2.1, §4.2, §5.1) | **3**, and **never 4** |
| `baselineStatus: unresolved` (any reason, incl. `manifest-empty`), or any row `unknown` | **3** |
| any row `local-edit` or `unverified` | **2** |
| any row `stale` or `missing`, or any retired path present | **1** |
| `resolved`, non-empty rows, all `in-sync`, no retired path, `writeFailures` empty | **0** |

**The observation point — O-14's substance.** The code is computed over the state observed **at the
end of the run** — concretely, over **the record built at §4.2 step 8**, which is why §4.2 makes the
exit computation step 10. There is exactly one state in play, so the exit code and the drift state
can never disagree:

- **`--check`** changes nothing and makes one classification pass, so its post-run state *is* its
  pre-run state.
- **A sync run** applies the same table to the **post-run** state, which §4.2 step 7 measures.

Worked consequences, all normative:

| Run | Post-run state | Exit |
|---|---|---|
| sync repaired the only `stale` row | all `in-sync` | **0** |
| sync copied a `stale` row and skipped an `unverified` one | one `unverified` remains | **2** |
| sync copied a `stale` row; a second copy failed | `writeFailures` non-empty | **4** |
| `--check` on a consumer with one `stale` row | unchanged | **1** |
| `repoRootUnresolved` holds, `manifest-absent` reported (first release, outside a repo) | not evaluated; nothing written | **3** |
| sync whose copy landed corrupted (§5.5's verification caught it) | that row `unverified`, `writeFailures` non-empty | **4** |

**Exit `1` on a sync run is reachable only if §5.5's post-copy verification is absent or defeated —
otherwise exit 1 belongs to `--check`.** The derivation, restated as a conditional because v2 stated
it as an unconditional and §4.2's own truncated-copy argument falsifies the unconditional form:

- Post-run, every `stale`/`missing` row has either been copied **and verified** (⇒ `in-sync`), or
  failed to copy, or failed verification (⇒ `writeFailures` non-empty ⇒ **4**, which dominates).
- A retired path still present implies its row was skipped as `local-edit`/`unverified`/`unknown`,
  which outranks 1 at 2 or 3.
- **The case v2 missed.** Without §5.5's verification, a copy that silently truncated *does* leave a
  row at 1. §1.2's `consumerHash` records the bytes **written**, so the sync-manifest entry hashes
  the truncation; §4.2 step 7 then finds an entry, bytes differing from the plugin, and
  `sha1(consumer) == consumerHash` ⇒ **`stale`** — not `local-edit`, not `unverified` as §4.2
  claimed. A "fully successful" sync would end with a `stale` row in its own record and exit 1.
  §5.5's verification closes that at 4.

Two consequences for downstream, replacing v2's blanket instruction:

1. **No acceptance test should construct a sync run that exits 1 as a *normal* outcome** — there is
   no conforming path to it. **AT-35** constructs the corruption and asserts **4**, which is the
   falsifying test this claim actually needs.
2. **A sync run observed exiting 1 is a diagnosis, not a spec case:** it means §5.5's verification
   was skipped, or the filesystem lied on read-back (the same class §4.7 step 2 guards). Treat it as
   the corrupted-copy signal, not as a state to specify around.

**This derivation rests on a mechanism rather than an assumption** (SE Q-03): a sync run records the
step-7 pass, so a verified copy is re-measured `in-sync` and no `stale` row survives into the record.
Under v1's unresolved reading — where a sync might have recorded pre-copy states — a fully successful
sync would have ended with `stale` rows and exited 1 unconditionally. The claim, the three-pass
ordering (§3) and §5.5's verification stand or fall together, and all three are now stated.

**The 3/4 boundary** is *no write target* vs *attempted write*. 4 outranks 3 because "could not
repair the record" dominates "could not verify". The two are mutually exclusive at the source, not
merely ordered: when `repoRootUnresolved` holds nothing is attempted, so no exit-4 condition can
arise in that run (§5.1's two disjoint exceptions).

**Exit 0 asserts** "every managed row was compared against a resolved baseline and matched" — the
automated form can never go green having verified nothing (AC-1.0).

**The `unverified` asymmetry is deliberate and both halves must be tested:** `--check` exits **2**
on an `unverified` row, while the queue **proceeds** (§6.2). `--check` is an assertion surface, red
whenever provenance is missing; the queue is a work surface, and blocking on "direction unknown"
would strand every consumer at first adoption. The two seams optimise for opposite errors.

### 5.9 Idempotence and round-trip (AC-3.6, AC-3.7, AC-3.8)

| # | Property | Behavior |
|---|---|---|
| AC-3.6 | sync, then `--check` with no intervening edit | every copied row `in-sync`; every skipped row reports its **prior** state |
| AC-3.7 | sync twice with no intervening change **from any source** | second run copies nothing, writes no backup, leaves the sync manifest **byte-identical**, exits 0 |
| AC-3.8 | fresh consumer, `.claude/workflows/` absent, root resolves | `--check`: every row `missing` (classified before this run's `mkdir -p`), drift state written into the directory the run itself created, exit **1**. sync: directory created under the AC-0.5 root — never `$HOME` — every row copied |
| AC-3.8 | **non-git tree with no `.claude/` anywhere** | `repoRootUnresolved` **holds**: `--check` exits **3**, the hook warns and exits 0, **nothing is created**, the queue blocks. This holds whichever reason is *reported* — if a higher-precedence condition co-holds (`manifest-absent` at first release, `manifest-empty`, `json-tool-absent`, `manifest-malformed`), W-1 names that reason, **N-8** additionally names the absent write target, and the write behavior is identical (§2.1's no-write-target rule, §4.2, §5.1). Remediation is one `mkdir .claude` (or `git init`) at the intended root |

**AC-3.7's byte-identical clause** is why the sync manifest is only rewritten when at least one row
was copied: an unconditional rewrite would change `syncedAtUtc` and break the property.

**Version-control caveat, stated:** a checkout or stash-pop that resurrects a retired, still-tracked
file **is** an intervening change. The next sync legitimately retires it again, with a second
backup. That is correct behavior, not an idempotence violation.

## 6. Queue integration (FSPEC-DIST-06)

**Linked requirements:** AC-4.1, AC-4.2, AC-4.3, NFR-1, NFR-6.

**Primary detector is the hook, not the queue** (REQ-DIST-04 preamble). The hook ships from the
plugin and fires regardless of what the consumer's workflow copies contain; the queue check lives
*inside* the artifact whose staleness it detects. A consumer whose queue bundle predates this
feature will never self-report via AC-4.1 — the first and worst instance is covered **only** by the
hook. **No AC in this section may be relied on for first adoption.**

First-adoption story: install/update plugin → hook fires next session → operator syncs → the queue
check exists from then on.

### 6.1 The single read (AC-4.1, BL-04)

`orchestrate-queue` performs **one** injected read of `.claude/workflows/.pdlc-drift-state.json` at
the start of an invocation. It never hashes, never enumerates, never classifies, and **never opens
any other file** — in particular it never opens `.claude/pdlc.config.json` (AC-4.3's one-read rule,
NFR-1).

**BL-04 discharged — against the runtime that actually executes, not only against the module
signature.** The read uses the existing `_readFile` dependency-injection parameter in
`pdlc/workflows/orchestrate-queue.js`. At the **module** level its contract is clean:
`defaultReadFile` returns `null` on any throw, and the queue already relies on the `null`-vs-`""`
distinction for `docs/_queue/QUEUE.md` (`readFileFn(queuePath)`). Per CLAUDE.md, **the injected call
must be `await`ed** — the adapter's implementation is async while the test doubles are sync — and
the bundles must be rebuilt in the same commit.

**What the runtime actually injects, stated plainly.** `build-runtime.mjs`'s `QUEUE_ENTRY` wires
`_readFile: rtReadFile` from `pdlc/workflows/runtime-adapter.js`, and `rtReadFile` is **an `agent()`
call pinned to `haiku`** (`RT_IO_MODEL`) that asks a model to return the file's exact contents, with
a sentinel string for "does not exist or cannot be read". Two consequences the FSPEC must own rather
than inherit silently:

1. **The seam's `null` is wider than "absent" — but narrower than v2 claimed, and the difference
   matters.** Read from source rather than inherited from the v1 review:
   `runtime-adapter.js:85–96` returns `null` in exactly **two** cases — the agent's final message
   trims to the missing sentinel, or the result is not a string. There is **no `try`/`catch`** in
   `rtReadFile`, and `orchestrate-queue.js:523` does not wrap its own `await readFileFn(queuePath)`
   either. **So a throwing agent turn does not return `null`; it propagates** and aborts the
   workflow invocation.

   | Seam outcome | What the queue sees | Disposition |
   |---|---|---|
   | file absent (sentinel relayed) | `null` | §6.2 **row 1 ⇒ `blocked`** |
   | agent returned a non-string | `null` | §6.2 **row 1 ⇒ `blocked`** |
   | agent turn **threw** (transport failure) | **exception propagates** | invocation aborts — no `blocked` verdict, no §6.3 report |

   The first two are a conflation, and a safe one: both land on `blocked`, the fail-closed
   direction, which is why §6.2 row 1's wording is "read did not yield a usable record", not "file
   absent". The third is **not** `blocked` and must not be described as such. An abort dispatches no
   work, so it is not a *silent* green — but it reaches the operator as an unhandled runtime error
   rather than as this feature's own blocked report, and nothing in the record explains it.
   **Therefore: this feature's drift-state read is wrapped at its call site so that a throw is
   handled exactly like a `null` — §6.2 row 1, `blocked`, with the §6.3 report.** That is a change
   inside `orchestrate-queue.js`, this feature's own new code, not an adapter change, and it is
   carried as **§10 O-19 duty (d)**. The pre-existing unwrapped `QUEUE.md` read at
   `orchestrate-queue.js:523` is deliberately **left alone** — changing it is a behavior change to
   another feature's path — and the asymmetry is raised as the follow-up O-19 already names.

   > **v2.0's note above is wrong on this point** ("returns `null` for absent **and** for every
   > transport failure and non-string result") and inherited the error from the v1 cross-review,
   > which the v2 reviewer subsequently retracted. This subsection supersedes it; do not cite the
   > v2.0 note for the seam's failure semantics.
2. **The transport is model-mediated, so the bytes are not guaranteed verbatim.** A model relaying a
   JSON record containing 40-character sha1s can truncate it, re-wrap it, fence it, drop a key, or
   "tidy" an array. NFR-1's guarantee — *no judgement in an LLM turn* — holds for the **decision**
   (§6.2's mapping is a pure function of the parsed record; no model chooses `blocked` or
   `proceed`), but it does **not** hold for the **transport** at this seam. Saying otherwise would
   be false, and this feature exists to stop exactly that kind of unverified green.

**The defence is §6.2 row 1's strict shape validation plus row 10's terminal `blocked`** (both added
in v2.0 for SE F-04, and load-bearing here). Against the realistic corruptions:

| Corruption | Caught by |
|---|---|
| the agent turn threw | the O-19(d) wrapper ⇒ row 1 (unwrapped, this aborts the invocation) |
| fenced, truncated mid-record, or prose-wrapped | unparseable ⇒ row 1 |
| a required key dropped (`rows`, `writeFailures`, `checkEnabled`, …) | required-key check ⇒ row 1 |
| an array replaced by a scalar, or a row object flattened | type check ⇒ row 1 |
| a `state` or `baselineStatus` value re-worded | closed-set membership ⇒ row 1 |
| a record that is shape-valid but matches no outcome row | row 10 ⇒ `blocked` |

**The residual, accepted and stated.** A relay that preserves the shape exactly while altering a
**value** within its closed set — flipping one row's `"stale"` to `"in-sync"`, or `checkEnabled`
`false` to `true` — is not detectable by any check the queue can perform on a single read, because
the corrupted record is indistinguishable from a legitimate one. Three things bound it, and none of
them is an assertion that it cannot happen:

- The queue is **defence in depth only**; the hook is the primary detector (§6 preamble, and REQ
  scope), and the hook is a shell script that reads the filesystem directly with no model in the
  path. A corrupted relay degrades the second line of defence, never the first.
- The corruption must be *semantically plausible* to survive shape validation, and the mapping's
  fail-closed rows (1, 10) catch every implausible one.
- The residual is on the same footing as NFR-6 exception (ii)'s rung-(iii) residual: the queue may
  proceed on a state that does not describe the tree. It is announced by the same surface — the
  hook — at every session start.

**Routed as an implementation obligation, not a wish (§10 O-19).** Hardening `rtReadFile` into a
byte-faithful read is a runtime-adapter change that touches every pdlc workflow module's
`_readFile` consumer, so it is out of this FSPEC's scope; but the implementation phase must (a) not
add a second agent-mediated read for this feature, (b) unit-test the §6.2 shape validator against
mangled-relay fixtures — fenced, re-wrapped, key-dropped, truncated, type-swapped — (c) record the
seam's LLM mediation in the queue's own comments so the next reader does not re-derive it, and
(d) **wrap this feature's drift-state read so a throwing agent turn maps to row 1 `blocked` rather
than propagating**, with a unit test injecting a throwing `_readFile`. This is tagged
**Cross-Feature**: the byte-faithfulness property belongs to the adapter, not to this feature —
though (d) is squarely this feature's own call site.

No new injected seam is introduced. Adding one would widen the runtime-adapter surface for a read
the existing seam already performs — and would inherit the same mediation.

### 6.2 The mapping (AC-4.1) — precedence order

| # | Condition | Outcome |
|---|---|---|
| 1 | the read did not yield a **shape-valid** record — see the predicate below | `blocked` |
| 2 | `checkEnabled` is `false` | **proceed**; skip noted in the report (AC-4.3) |
| 3 | `writeFailures` non-empty | `blocked`, naming each `{ path, operation }` — and naming `drift-state-invalidated` when `baselineReason` carries it |
| 4 | `baselineStatus: unresolved` (incl. `manifest-empty`, `drift-state-invalidated`) | `blocked`, naming `baselineReason` |
| 5 | any row `unknown` | `blocked` |
| 6 | any row `missing` or `stale` | `blocked` |
| 7 | `retiredPresent` non-empty | `blocked` (sync-fixable — BL-05) |
| 8 | any row `local-edit` or `unverified` | **proceed**, rows named in the run report |
| 9 | `resolved`, non-empty rows, all `in-sync`, `retiredPresent` `[]`, `writeFailures` `[]` | **proceed silently** |
| **10** | **anything else** — the terminal row | **`blocked`**, naming "drift state does not describe a recognised outcome" |

**Row 1's shape predicate (D1–D8) — all clauses; any failure ⇒ `blocked`.**

| # | Clause |
|---|---|
| D1 | The injected read returned a string (not `null`, and did not throw) — see §6.1: `null` means absent *or* a non-string relay, a throw is normalised to the same outcome by O-19(d), and all three block |
| D2 | It parses as JSON and the top level is an **object** |
| D3 | `schemaVersion` is present and is the integer `1` |
| D4 | `baselineStatus` is present and is one of `"resolved"` \| `"unresolved"`; `baselineReason` is present and is `null` or one of the eight closed baseline reasons |
| D5 | `checkEnabled` is present and is a **boolean** (not the string `"false"`, not absent) |
| D6 | `rows`, `retiredPresent` and `writeFailures` are all **present and arrays** |
| D7 | Every member of `rows` is an object with `id` a non-empty string and `state` one of the six closed states, and `reason` `null` or one of the four closed row reasons. Every member of `retiredPresent` is an object with `path` and `supersededBy` non-empty strings and `supersedingState` **one of the six closed states** (closed in v3.0 per SE Q-03 — §6.3 prints it, so an LLM-relayed re-wording would otherwise reach the operator unchecked). Every member of `writeFailures` is an object with `path` and `operation` strings |
| D8 | `generatedBy` is one of `"hook"` \| `"check"` \| `"sync"`; `pluginVersion` is present and `null`-or-string; **`syncCommand`, *if present*, is `null`-or-string — its absence is tolerated and read as `null`** |

**Why this is here and not left to "the writer always writes a valid record".** Three reasons, and
the mapping is the feature's own last line of defence in all three:

1. **The record arrives through an LLM-mediated read** (§6.1) that can drop a key or re-shape an
   array while still producing parseable JSON. Without D1–D8 such a record reaches rows 3–8, all of
   which test *non-empty predicates* — `rows.some(...)` over `undefined` throws, over `[]` returns
   false — so the naive implementation either crashes or **proceeds**. Proceeding on a record that
   verified nothing is precisely the failure this feature exists to prevent.
2. **v1's mapping was not total.** A record with `baselineStatus: "resolved"` and `rows: []` matched
   no row 1–9: rows 3–8 each require a non-empty predicate and row 9 explicitly requires non-empty
   `rows`. It now lands on **row 10 ⇒ `blocked`**, which is also the right answer on the merits —
   AC-1.0 requires every green outcome to have a **non-empty** `rows`, so a resolved-but-empty
   record is a green that verified nothing.
3. **AC-1.8-class totality is demanded of the shell classifier**; the mapping the queue actually
   gates on is entitled to no less. With row 10, the mapping is total by construction over *all*
   inputs, including ones no writer in §4.1 can produce.

**Why D8 tolerates an absent `syncCommand` (SE F-16).** `syncCommand` is an **FSPEC-level addition**
(§1.3, OQ-5), not an AC-2.6 field, and OQ-5 explicitly invites a reviewer to route it as a REQ
amendment. v2's D8 required it to be *present*, which quietly promoted an open question into a hard
runtime gate: a drift state satisfying AC-2.6's schema exactly — the schema §1.3 calls "fixed by
REQ AC-2.6" — would fail row 1 and be `blocked` permanently, with **no escape**, because row 1
outranks the `checkEnabled` opt-out. If OQ-5 were ever resolved against the FSPEC, every consumer's
queue would block. The field is only ever *read* by §6.3, which already specifies the `null`
fallback, so requiring presence bought nothing. Every writer in §4.1 still emits it; the reader
simply does not depend on its being there.

**Row 2 and the shape check.** `checkEnabled` is validated in D5, *before* row 2 reads it, so the
opt-out cannot be triggered by a missing or non-boolean field. A record whose `checkEnabled` is
absent or non-boolean is `blocked` at row 1 — fail-closed, matching §2.7's resolution rule on the
writer side.

Three further design points the implementation must preserve:

- **Row 2 sits above every blocking row *except row 1*, deliberately.** The operator's opt-out stays
  reachable on a consumer whose state is degraded in any way rows 3–10 describe — which is also why
  §4.4 rung (i) preserves `checkEnabled`. **Row 1 is the stated exception, and it must be:** a
  record that cannot be parsed or shape-validated cannot yield a *trustworthy* `checkEnabled` at
  all, which is exactly the reasoning §4.4 gives from the writer's side ("an *absent* drift state
  blocks the queue at AC-4.1 row 1, which sits **above** the `checkEnabled` row"). v2's bullet
  claimed row 2 sat above **every** blocking row, contradicting the paragraph three lines above it.
  The correction has a cost worth naming: **v2 widened row 1 from four conditions to D1–D8**, so the
  set of states in which the opt-out is unreachable grew with it. That is the fail-closed trade the
  D1–D8 validator was added to make, and it is stated rather than assumed. Widening row 1 further —
  D8's `syncCommand` clause was such a widening — is therefore a change to the opt-out's
  reachability and must be argued as one.
- **Row 7 blocks** because a retired path beside a fresh bundle is the one configuration where the
  runtime may load the stale artifact (BL-05). AC-2.8's warning and this row are deliberately **not
  contingent** on BL-05's answer: they specify the safe default for the unfavourable case.
- **No freshness clause.** AC-2.7 makes every writer refresh the file, so a stale snapshot cannot
  outlive the operation that invalidated it. "Hook never ran" is row 1 (absent). A write
  attempted-and-failed is closed at the writer by §4.4's ladder, whose rung-3 residual — the queue
  may proceed on stale contents — is **accepted and stated** (NFR-6 exception ii), not asserted
  away. `generatedAtUtc` is human-report-only; **the queue never compares timestamps** (NFR-1).

The mapping is a pure function of the parsed record. It is implemented in `orchestrate-queue.js` as
a standalone function so it is unit-testable against literal records without a filesystem.

### 6.3 The blocked report (AC-4.2) — split by level

The three reason sets are disjoint, so the report is split into **Manifest / Row / Run**:

```
Manifest level:
  manifest-absent | manifest-malformed | manifest-empty   → update the plugin
  plugin-root-unset | plugin-root-unreadable
    | repo-root-unresolved | json-tool-absent             → environment fix
  drift-state-invalidated                                 → permissions/filesystem fix (NEVER sync)

Row level:
  plugin-artifact-missing                                 → update the plugin
  plugin-artifact-unreadable | consumer-artifact-unreadable
    | hash-tool-absent                                    → environment/permissions fix
  stale | missing                                         → sync

Run level:
  one line per writeFailures entry, naming path + operation
```

- Multiple simultaneous **row** reasons print the one selected by the declared precedence (§3.3).
- `retiredPresent` entries carry R's `id` and state and the remediation **AC-2.8's table** names for
  that state (§5.3) — the queue does not invent a second vocabulary.
- **Every printed command is `<pluginRoot>`-expanded** and runnable exactly as shown (AC-0.4,
  AC-4.2). The queue cannot expand `<pluginRoot>` itself (no env access, one-read rule), so it
  prints the record's `syncCommand` field verbatim wherever sync is the remediation (§1.3, OQ-5).
  When `syncCommand` is `null` **or absent** — D8 tolerates absence and reads it as `null` — the
  report says to run the sync script shipped with the installed plugin, by description rather than
  by a fake path.
- **`drift-state-invalidated`'s rendering site is the Manifest-level line above** (TE F-23). It is
  the one baseline reason §2.1's evidence phase never produces (§2.8): it is written by §4.4 rung
  (i) after selection, so the hook that produced it emits §4.5's drift-state failure line rather
  than W-1. §8.2's set S3 is scoped accordingly, and this line is required to be textually distinct
  from every row-level message on the same footing as W-1.
- The design target, stated by AC-4.2: **the operator's next turn is one command, not an
  investigation.**

### 6.4 `checkEnabled` scope (AC-4.3)

The flag gates the **queue only**. The hook still warns and `--check` still exits non-zero. It
deliberately does **not** live in workflow source, because that source is what drifts — a flag
inside the stale artifact could not turn off the check that detects the staleness.

The **shell writer** resolves it (§2.7) and records the boolean; the queue reads that field from the
one file it already reads.

## 7. Build, packaging and publication (FSPEC-DIST-07)

**Linked requirements:** AC-5.1–5.4, AC-6.1–6.6, REQ §6.
**Disposes:** §10 **O-15** (monotonicity decision).

### 7.1 The builder (AC-6.1, AC-5.1)

`node pdlc/workflows/build-runtime.mjs` writes to **exactly one location**:

```
pdlc/workflows/dist/orchestrate-dev.bundle.js
pdlc/workflows/dist/orchestrate-queue.bundle.js
pdlc/workflows/dist/distribution-manifest.json
```

tracked and committed. It writes **nothing else**: no `.claude/workflows/` copy, no sync-manifest
entry, no drift state. The builder is not on §4.1's writer list and gains no write target.

`build-runtime.mjs --check` compares `dist/` only. The builder keeps its single output directory and
its **node-builtins-only** dependency footprint (REQ §0 fact 8) — a future builder dependency would
extend the bootstrap story of AC-6.5 and is out of scope here.

`meta` literals and the runtime's pure-literal constraint are **untouched** (AC-5.1). Version
stamping is data emitted *alongside* the bundles, never a `meta` field: the runtime demands a pure
first-statement literal, and grepping a 92 KB generated file from shell is backwards.

**Manifest emission.** Per row, `artifactVersion` is the `pdlc/.claude-plugin/plugin.json` version
at build time and `pluginSha1` is the sha1 of the bytes just emitted — computed from the emitted
buffer, so it cannot disagree with what landed.

**The maintainer loop is: build, then sync.** This repo's `.claude/workflows/*.bundle.js` become
untracked, gitignored consumer copies produced by the same sync script every consumer runs.

### 7.2 Version semantics (AC-5.2, AC-5.3, AC-5.4)

| # | Rule |
|---|---|
| AC-5.2 | Where hash and version stamp disagree, **content hash is authoritative**. Versions are compared for **equality only, never ordered** — no semver comparator exists anywhere in this feature (§4) |
| AC-5.3 | A row not `in-sync` reports **both** `pluginArtifactVersion` and `consumerArtifactVersion` (absent ⇒ reported as unknown). Both lines are **required** and both labelled **"not a drift signal"** — many distinct bundle contents legitimately share one `artifactVersion`. The two sha1 values are printed as the discriminating evidence |
| AC-5.4 | `pluginVersion` in any report or state file is **context only** — never an input to any state decision; `null` when unreadable. REQ §0 fact 6 measured `0.9.0` and `0.10.0` shipping byte-identical workflow files |

### 7.3 Packaging and freshness oracles (AC-6.2, AC-6.2a, AC-6.3)

**AC-6.2 — packaging oracle, executable before release. Stated as a pure function of a root**, in
the `coveredViolations(root)` shape, because an oracle pinned to *this* repository's tree has no red
fixture and therefore only one direction (TE F-19):

```
packagingViolations(root) -> set of { clause, path, detail }
```

Over the set of files `root/pdlc/` would package (everything under it minus ignore rules), it
returns one entry per violated clause:

- (a) every `pluginPath` in `root`'s manifest resolves **inside** the packaged set;
- (b) each file's sha1, **recomputed from disk bytes under `root`**, equals its `pluginSha1`;
- (c) top-level `retired` equals the union of rows' `retires`;
- (d) the manifest itself sits at `pdlc/workflows/dist/distribution-manifest.json` inside that set.

Build inputs present in the package are **tolerated, not asserted away**.

**Why the parameterisation is normative and not a test-style preference.** AC-6.2's green direction
is `packagingViolations(liveRepoRoot) == ∅` (**AT-19**). Its red direction — **AT-29**, a manifest
whose `pluginSha1` disagrees with the file's bytes — cannot be arranged in the live tree, and §7.3's
own rule forbids the only other route: **no test may write into *this repository's*
`pdlc/workflows/dist/`**. That prohibition is scoped to the **live** root, which is what it was
protecting; a `git init`-ed **fixture root** under `pdlc/workflows/__tests__/fixtures/` carries the
red case, exactly as AC-6.4's two-root structure already does for `coveredViolations` (§7.5). This
is the same pattern, applied to the oracle that lacked it. Fixture construction is TSPEC's,
**§10 O-16**.

**AC-6.2a — post-release check (P1, release checklist).** A published release, once installed,
exposes `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` containing the named bundles **plus the manifest
itself**. Hosted automation is D-DIST-06.

**AC-6.3 — freshness.** `__tests__/runtimeBundle.test.js` fails unless the committed `dist/` bundles
were rebuilt in the same commit as any workflow-source change — the existing assertion, repointed at
`dist/`.

### 7.4 The advertised-version oracle (AC-6.6). **Disposes O-15.**

**Observation point: the working tree against `HEAD`** — matching AC-6.3, and deliberately *not* an
audit of committed history. **Stated as a pure function of a root**, for the same reason §7.3 is
(TE F-19): the red states this oracle must detect are a dirty `dist/` and an unbumped `version`,
neither of which can be arranged in the live tree, so an oracle pinned to this repository has only
one direction and both AT-20 and AT-28 are unconstructible.

```
advertisedVersionViolation(root) -> "red" | "green" | { skipped: reason }

red  iff  `git -C root status --porcelain -- pdlc/workflows/dist/` produces ANY line
     and  root/pdlc/.claude-plugin/plugin.json `version` == its value at root's HEAD
```

A `git init`-ed fixture root can be driven to either side: stage a `dist/` change with the version
untouched (**AT-20**, red, including the untracked-only `??` case), or with the version bumped
(**AT-28**, green). The live root exercises the ordinary inert case (a) below. **§10 O-16** carries
the fixture-root obligation alongside the skip-branch pinning.

**`--porcelain` is required, not `git diff HEAD`.** `git diff` reports tracked paths only, and on
the landing commit — the highest-risk commit, and the first to ship `dist/` — **every** file under
`dist/` is untracked (`pdlc/workflows/dist/` neither exists nor is gitignored at `HEAD`). A `git
diff` form is therefore empty, falls into inert case (a), and would pass a brand-new bundle set
under an unchanged advertised version. The same hole reopens on every later commit that adds a
*new* bundle. `--porcelain` covers `??`, `A`, `M` and `D` alike.

**Rationale for gating the working tree rather than history:** `npm test` runs pre-commit, so the
violating commit does not yet exist to be audited; and a history-walking form is red on every
subsequent commit that changes nothing relevant — a steady-state red, disabled within a week.

**Inert cases — each skips loudly**, printing the reason and naming the invariant left unverified,
never passing silently: (a) the `--porcelain` output is empty (the ordinary case — nothing to
advertise); (b) `git` absent from `PATH`; (c) no `.git` (source tarball, exported copy); (d) `HEAD`
does not exist (unborn branch). **Shallow clones and linked worktrees are not inert** — neither
`git status` nor a `HEAD` comparison needs ancestry. Probe order and the exact printed strings are
**TSPEC's, §10 O-16**.

**Accepted residual, restated:** a violation that already landed is not detected here. The scope is
strictly the commit about to be authored. The fallback is the same P1 surface as AC-6.2a — the
maintainer's release checklist confirms, before publishing, that `plugin.json` `version` differs
from the previously published release whenever the packaged `dist/` bytes differ. **No acceptance
test should attempt to detect the landed case.**

#### O-15 — monotonicity: **decided, and the decision is no.**

AC-6.6 asserts only that the pin **moved**; a downgrade (`0.11.0` → `0.10.0`) passes. O-15 asks
FSPEC to decide whether to add a monotonicity assertion and, if so, which comparator. **This FSPEC
does not add one**, for three reasons:

1. **It would require the comparator §4 forbids.** REQ §4 states flatly that *no semver comparator
   exists anywhere in this feature*, and AC-5.2 fixes version comparison as **equality only**.
   Adding an ordering assertion here would introduce the project's only version-ordering code, in a
   test, for a failure mode nobody has observed.
2. **The `version` field is not this feature's to police.** It is the marketplace's advertised
   version, changed by the maintainer for many reasons. AC-6.6's claim is a *change-detection*
   claim — "the thing you are shipping is advertised as new" — and a downgrade satisfies that claim
   in the only sense the consumer's cache cares about: the advertised value differs, so the cache
   is refreshable.
3. **The genuine risk is already covered elsewhere.** A downgrade that collides with a
   *previously published* version is the AC-6.2a/AC-6.6 release-checklist row, which compares
   against the previously published release rather than against `HEAD` — the correct place for it,
   because only the checklist knows what was published.

**Recorded as a deliberate omission, not an oversight.** If a monotonic pin is later wanted, it
belongs to D-DIST-06's release automation, where a published-version baseline exists.

### 7.5 Landing step and document corrections (REQ §6, AC-6.4, AC-3.9)

A **one-time** maintainer landing step, all in the commit that lands this feature:

1. `git rm` the four tracked `.claude/workflows/*` paths, and **gitignore `.claude/workflows/`
   wholesale**. Naming the directory rather than a bundle glob is deliberate: after this feature
   lands, that directory also holds `.pdlc-sync-manifest.json`, `.pdlc-drift-state.json` and
   `.pdlc-backups/`, all of which are **machine-local**. Committing a sync manifest would make
   `stale`-vs-`local-edit` discrimination differ per checkout (every clone would inherit another
   machine's `consumerHash`); committing a drift state would hand every clone a stale verdict; and
   committing backups would put an operator's pre-sync content in the repository. The directory's
   contents become untracked consumer copies, produced by the same sync script every consumer runs.
2. `pdlc/.claude-plugin/plugin.json` `version` bumped — required by AC-6.6, since `dist/` is new
   bytes — and in **every later commit that changes `dist/`**.
3. `pdlc/hooks/hooks.json` gains the second `SessionStart` entry (§5.1, BL-03).
4. **Execute bits on five scripts**: this feature's two (C2, C3) **and** the three existing sibling
   hook scripts. Both objects are required and are independent — index mode `100755` **and**
   on-disk `[ -x ]` (REQ §0 fact 11, §4). The three siblings are deliberately in scope: they work
   today only because `hooks.json` happens to invoke them by bare path, and this feature adds a
   fourth script under the same convention plus AC-6.5's bare-path bootstrap, so the latent
   exit-126 class is fixed once here rather than split into a follow-up.
5. **Document corrections**: whatever `coveredViolations(repoRoot)` returns — **7 files today**,
   including both orchestrator SKILLs — plus `dist/` path updates to the already-correct normative
   documents. Archived per-feature spec history under other features' `docs/` dirs is **not**
   edited.
6. Bootstrap sequence documented in `CLAUDE.md` and `pdlc/README.md` (AC-6.5).
7. A repo-root `.worktreeinclude` listing `.claude/workflows/` — Claude-created worktrees then
   carry the untracked bundles (OQ-3 Option B, §11.1).
8. The same two documents state the manual-worktree limitation: a `git worktree add` tree is not a
   supported consumer until D-DIST-07 (queue row 6); work from the main worktree or a
   Claude-created one (§11.1).

**AC-6.4's two assertions run against two different roots and are never both evaluated over the
same tree:**

| Assertion | Root | Claim |
|---|---|---|
| Landing criterion | **live repo root** | `coveredViolations(liveRepoRoot) == ∅` — green from the landing commit onward |
| Anti-widening guard | **pinned fixture tree** under `pdlc/workflows/__tests__/fixtures/` | `\|coveredViolations(fixtureRoot)\| == 7`, the returned paths equal the enumerated 7, and the exemption list itself is asserted literally |

A cardinality assertion over the *live* root would be red from the landing commit and red forever.
The fixture never changes, so the count assertion is stable; widening an exemption or narrowing a
pattern turns it red even when the exemption-list prose is untouched. **Fixture construction is
TSPEC's, §10 O-17.**

`coveredViolations` is a **pure function of a root directory with no judgement step**: `grep` of
five literal qualifier-free patterns — the two `.claude/workflows/orchestrate-{dev,queue}.js` forms;
`.claude/workflows/*.js`; the phrase `managed manually`; the phrase `opying the bundle into a
consumer repo` (case-tolerant stem) — minus a four-member exemption enumerated literally: (i)
generated trees `.claude/workflows/` and `pdlc/workflows/dist/`; (ii) per-feature artifact dirs,
**mechanically defined as a `docs/<X>/` containing `REQ-<X>.md`**; (iii) any
`distribution-manifest.json`; (iv) any `__tests__/`.

The definition in (ii) is load-bearing: "any `docs/` subdirectory" would silently exempt
`docs/_queue/` and `docs/design/`, dropping the covered set from 7 to 5 and losing the two most
normative non-SKILL documents while the oracle stayed green.

A false positive is resolved by **rephrasing the document**. Narrowing a pattern or widening an
exemption requires changing AC-6.4 **and** the fixture expectation in the same commit.

### 7.6 Fresh-clone bootstrap (AC-6.5)

Given a fresh clone with **no plugin installed** and `${CLAUDE_PLUGIN_ROOT}` unset, the two
documented commands:

```
node pdlc/workflows/build-runtime.mjs
pdlc/hooks/scripts/sync-workflows.sh          # bare path — the scripts ship executable
```

yield: bundles present, every row `in-sync`, `--check` exit 0, and the queue's §6.2 mapping over
the resulting drift state is **proceed silently**. **No published release, no installed plugin, no
network.**

The maintainer substitution (§2.4) is what makes this work with `${CLAUDE_PLUGIN_ROOT}` unset:
`build-runtime.mjs` is present, so `<pluginRoot>` is `<repoRoot>/pdlc` and the env var is never
consulted. Every row first classifies `missing` (§3.2's ancestor rule) and the sync run creates the
directory (§4.2).

Fixture construction, mode-bit assertions, and the classify-before-create trace oracle are
downstream: **§10 O-1, O-12**.

### 7.7 Enforcement surface, stated (REQ §6)

Every AC whose Who is `npm test` — AC-6.2, AC-6.3, AC-6.4, AC-6.5, AC-6.6 — is enforced by
**maintainer discipline plus `npm test`** until D-DIST-06 lands hosted CI. **No pre-commit hook is
in scope and none is implied**; a maintainer who commits without running `npm test` bypasses all of
them. This is a pre-existing property of AC-6.3, made load-bearing by AC-6.6's working-tree
observation point, and it is why AC-6.6 and AC-6.2a both name the release checklist as the P1
fallback.

## 8. Message catalogue

Operator-facing strings are specified here because AC-2.3, AC-2.5, AC-2.5a, AC-2.8 and AC-4.2 all
make *textual distinctness* a requirement. The exact wording below is normative for the
distinctions the ACs demand; incidental phrasing may change without a spec revision.

### 8.1 Conventions

- Every line is prefixed `pdlc:` on stderr.
- Every command shown is **`<pluginRoot>`-expanded** and runnable exactly as printed (AC-0.4,
  AC-4.2).
- No message ever recommends **manual deletion** of any file (AC-2.8).
- No message recommends `sync-workflows.sh` for a condition sync cannot fix — specifically
  `manifest-*` (⇒ update the plugin) and `drift-state-invalidated` (⇒ permissions/filesystem).

### 8.2 Warnings (hook)

| # | Trigger | Shape |
|---|---|---|
| W-1 | unresolved baseline | `pdlc: workflow drift check could not run — {reason}. {remediation}` |
| W-2 | row `unknown` | `pdlc: {id} could not be verified — {reason}. {per-reason remediation}` |
| W-3 | row `unverified` | `pdlc: {id} differs from the plugin's copy and has no sync provenance — direction unknown. Diff it, then sync (--force required): {cmd}` |
| W-4 | row `local-edit` | `pdlc: {id} was edited locally after its last sync. Plain sync will NOT overwrite it; --force will, after backing it up to {backupDir}: {cmd}` |
| W-5 | row `stale` / `missing` | `pdlc: {id} is {state}. Run: {cmd}` |
| W-6 | retired present | `pdlc: retired-present — {path} is superseded by {id} ({state}). {state-conditioned remediation}` |
| W-7 | write failure | `pdlc: could not write {path} ({operation})` |

W-3 and W-4 are required to be **textually distinct** (AC-2.3) and they are: W-4 names `--force` and
the backup location and explicitly denies plain sync; W-3 asks for a diff first. Neither is a
substring of the other.

**The distinctness predicate — normative, so it can be an oracle rather than an argument.**
AC-2.3, AC-2.5 and AC-2.5a each make textual distinctness a *requirement*, and §8 declares itself
normative for exactly those distinctions; but a prose argument cannot fail a build, and v1 contained
no test over the catalogue at all — an implementation emitting one string for both `stale` and
`local-edit` passed every acceptance test. The predicate, over the messages **as emitted** (with
their `{…}` substitutions applied, `pdlc:` prefix included, whitespace-normalised):

```
distinct(a, b)  ≡  a != b  AND  a is not a substring of b  AND  b is not a substring of a
```

It must hold pairwise over each of these sets:

| Set | Members | AC |
|---|---|---|
| S1 | the six row-state messages — one emission each for `stale`, `missing`, `local-edit`, `unverified`, and W-2 for two different `unknown` reasons | AC-2.3, AC-2.5 |
| S2 | W-2 rendered for **each of the four** row reasons | AC-2.5 |
| S3 | W-1 rendered for **each of the seven §2.1-produced** baseline reasons, **plus §6.3's Manifest-level line for `drift-state-invalidated`** — that reason's actual rendering site — and every member of S1 | AC-2.5a ("textually distinct from every row-level message") |

**Why S3's eighth member is a `§6.3` line and not a W-1 rendering (TE F-23).** v2 required W-1 for
"each of the eight" baseline reasons, but `drift-state-invalidated` has no W-1 site: §2.8 states it
is the one reason not produced by §2.1's evidence phase — §4.4 rung (i) writes it *after* selection —
and the run that produced it emits §4.5's drift-state failure line (and, at rung (iii), N-3), never
W-1 on its own `baselineStatus`. The string does reach an operator, through the **queue's** blocked
report (§6.3, Manifest level), and AC-2.5a's distinctness requirement applies there just as it does
to W-1. Requiring a rendering that cannot exist would have left AT-30's author to either invent one
or silently drop the member.

Substring exclusion, not just inequality, is the operative half: two messages differing only by an
appended clause are not "individually distinguishable" to an operator scanning session output, and
a naive implementation reaches inequality by appending an id. **AT-30** asserts the predicate.

### 8.3 Notices

| # | Condition | Line |
|---|---|---|
| N-3 | ladder rung (iii) — announced at **every** drift computation (NFR-6 ii) | `pdlc: drift state is not writable at {path}; the queue may proceed on stale contents until this is fixed.` |
| N-4 | sync manifest unreadable/malformed | `pdlc: sync manifest at {path} is {unreadable\|malformed}; rows that differ are reported unverified.` |
| N-5 | `pdlc.config.json` unreadable/malformed/non-boolean | `pdlc: {path} could not be read for distribution.checkEnabled; assuming true.` |
| N-6 | `.claude/workflows/` enumeration failed | `pdlc: could not list {dir}; unmanaged files are not reported this run. Managed rows are unaffected.` |
| N-7 | unrecognised `PDLC_FAULT` (§4.6) | `pdlc: unrecognised PDLC_FAULT token "{token}"; no fault injected.` |
| **N-8** | the E1 evidence `repoRootUnresolved` **holds** and the *reported* `baselineReason` is **not** `repo-root-unresolved` (§2.1's no-write-target rule) | `pdlc: no write target — the consumer repo root did not resolve, so nothing was recorded this run. Create .claude/ at the intended root, or run inside a git work tree.` |

N-4's wording is **O-8's verbatim requirement**: *rows whose bytes differ are reported `unverified`;
an equal-bytes row is `in-sync` regardless of provenance.* N-6 states explicitly that row states are
unaffected (AC-0.6).

The **absent** sync manifest produces no notice — never having synced is the ordinary
first-adoption state, not a fault. **AT-34** asserts both halves of that asymmetry.

**N-8's emission condition is deliberately narrow.** When `repo-root-unresolved` *is* the reported
reason, W-1 already carries the same remediation and N-8 would duplicate it; when a
higher-precedence reason is reported, W-1 names something the operator can otherwise act on without
learning that nothing was recorded. N-8 exists so that state has a **positive observable** beyond
the reason string — the case §2.8's worked table rows 1–3 name, and the one O-3's fixture inventory
needs a second oracle for. It is a notice, not a warning: it does not participate in §8.2's
distinctness sets, and it never appears on a run whose repo root resolved.

## 9. Disposition of REQ §10 FSPEC obligations

Every row whose "Lands in" names FSPEC, with where it is discharged. A reviewer verifying this
document should check these seven.

| # | Obligation | Disposed in | Disposition |
|---|---|---|---|
| **O-2** | Unrecognised `PDLC_FAULT` must never make the hook exit non-zero; specify per-entrypoint behavior so NFR-6's "exactly two exceptions" stays true | **§4.6** | One stderr line (N-7), nothing injected, the drift computation still runs and still writes its record, and the exit is **AC-2.9(5)'s verbatim**: hook **0** unconditionally, `--check` and sync **4**. The run is not perturbed; only the process exit of the assertion surfaces is pinned. **v1 reinterpreted this AC as "the computed exit" and is corrected here — the FSPEC conforms to the approved REQ; AT-18 changed with it** |
| **O-4** | The `printf` invalidation emitter; `pluginVersion` emitted `null` unconditionally; mandate a `json-tool-absent` ladder test | **§4.4a, §4.4 rung (i)** | The emitter is defined as the serialiser of last resort with **two exhaustive triggers** (§4.4a): the ordinary record whenever `jsonToolAbsent` holds — which closes v1's gap, where no writer was specified for that state at all — and the rung-(i) invalidation record. Field-by-field table showing every interpolated value is closed-domain, with **`pluginVersion` *and* `syncCommand` emitted `null` unconditionally under *both* triggers** (v3.0: closing `syncCommand` under T1 too is what makes the closed-domain predicate true — under T1 `<pluginRoot>` resolves without a JSON tool, so the field would otherwise be an arbitrary path with no escaping rule); `writeFailures` filtered of the **four** stderr-only operations before interpolation; and a **decidable** escaping predicate for `writeFailures[].path` (printable-ASCII-only, else `"<unprintable>"` wholesale) that needs no UTF-8 validator. The mandated test is stated with **both** conjuncts (parses **and** AC-4.1's mapping reaches the unresolved outcome) as AT-14/AT-14b; construction is TSPEC's (O-10) |
| **O-5** | Rung-2 reachability: only `ENOSPC`/quota reaches `unlink`; the rest are rung-3 residual | **§4.4 rung (ii)** | Seven-row table: cause of the §4.3 atomic-replace failure → does rung (i)'s **in-place overwrite** succeed → does `unlink` succeed → rung reached. v3.0 corrects the unwritable-parent row: an in-place `O_WRONLY\|O_TRUNC` needs write permission on the **file**, not the directory, so `EACCES` on the parent is the cause under which **rung (i) succeeds** — previously the table admitted no such cause at all, leaving O-4's mandated rung-(i) test and §6.2 row 2's reachability claim without a fixture, and putting AT-14b and AT-15 on the same Given with opposite Thens. `ENOSPC`/quota remains the only ordinary path to rung (ii). The implementation still *attempts* each rung unconditionally (probing the cause first would be a syscall race); the spec states reachability so TSPEC does not build fixtures for unreachable variants |
| **O-6** | A run failing both an artifact copy and the drift-state write must name the invalidated state | **§4.5** | Both lines emitted, **drift-state line first**, naming the state as not describing this run and directing to a permissions/filesystem fix rather than a sync. Ordering is normative because that line is the one that changes what the operator does next |
| **O-8** | Degraded-provenance wording, verbatim | **§1.2, §3.4 R-4, §8.3 N-4** | Rows whose bytes **differ** are reported `unverified`; an **equal-bytes** row is `in-sync` regardless of provenance. Carried as a schema rule, a business rule, and the notice's wording |
| **O-14** | `sync-workflows.sh`'s exit code = AC-3.3's table applied to the **post-run** state, with the mixed-run example | **§5.8** | Observation point stated per mode (`--check` changes nothing ⇒ pre == post); six worked rows including the mixed run (copied a `stale`, skipped an `unverified` ⇒ **2**), the no-write-target row (⇒ **3**) and the corrupted-copy row (⇒ **4**); and the derived consequence that **exit 1 on a sync run is reachable only if §5.5's post-copy verification is absent or defeated** — v3.0 weakens v2's unconditional claim, which §4.2's own truncated-copy argument falsified, and replaces "no test should construct it" with a two-part instruction: no test constructs exit 1 as a normal sync outcome (AT-35 constructs the corruption and asserts **4**), and an observed sync exit 1 is a diagnosis of skipped verification rather than a spec case |
| **O-15** | Decide whether to add a monotonicity assertion to AC-6.6, and which comparator | **§7.4** | **Decided: no.** Three reasons — it would require the semver comparator REQ §4 forbids and AC-5.2's equality-only rule excludes; the advertised `version` is not this feature's to police, and AC-6.6's claim is change-detection, which a downgrade satisfies; and the real risk (colliding with a previously *published* version) belongs to the release checklist, the only surface that knows what was published. Recorded as a deliberate omission, with a pointer to D-DIST-06 if it is later wanted |

## 10. Obligations carried forward to TSPEC / PROPERTIES

Restated as **entry obligations** — the TSPEC/PROPERTIES author must dispose of every row, and that
document's reviewers must verify the disposition. A finding that one of these is unspecified in
*this* document is answered by this table.

| # | Lands in | Obligation | This FSPEC's contribution |
|---|---|---|---|
| O-1 | TSPEC / PROPERTIES | Classify-before-create ordering observable: scope to a single classification invocation; row-id and phase fields in the trace grammar; a positive-presence conjunct so it cannot pass vacuously on an empty trace; an unwritable trace is a red **test** while the script still ignores trace failures | §4.2 states the ordering as ten steps and settles what "a single classification invocation" scopes to: the **step-2 as-found pass**. **A sync run makes three passes, not two** (§3's table): as-found (step 2), **post-copy** (step 5, the AC-3.9 retirement gate, retiring rows only, never recorded) and post-run (step 7, the recorded pass). The trace grammar must label **all three** distinctly (with O-7) — a two-label vocabulary leaves step 5's invocation unlabelled, and an oracle built against it either double-counts on a conforming run or accepts the post-copy pass as the as-found one, which is the exact ordering invariant this row exists to protect. §4.6 mandates the seam's existence and the script-ignores/test-reds split |
| O-3 | TSPEC / PROPERTIES | AC-0.5 step 2 is reachable only on a **non-git** fixture; its oracle must assert observables that exist in `repo-root-unresolved` (stderr reason line, `--check` exit 3), not drift-state fields never written there; one fault token per guard (git vs walk) | §2.2 makes the never-fall-through rule explicit; §2.9 and §5.9 give the observables |
| O-7 | TSPEC | The trace seam's delimiter and quoting; whether non-row probes (manifest, sync manifest, `pdlc.config.json` reads) are traced | §4.6 mandates existence; grammar is explicitly deferred |
| O-9 | PROPERTIES | Classifier totality / single-valuedness / determinism over states, row reasons and baseline reasons, including both declared precedences. **Regenerate the axes; do not import v13's tables** (24 of 96 cells undefined) | §3.3's first-match ladder **is** the declared row-reason precedence, and §2.1 Phase 2 **is** the declared baseline-reason precedence, so both are observable and single-valuedness is structural; §2.8's worked table and §3.3's two consequences are starting fixtures; §3.6 names two determinism hazards (directory order, environment order/locale) |
| O-10 | TSPEC | Write-failure test design: which failures are injectable, per-runner fixture requirements (uid-0 caveats), fail-open assertions per writer surface. v13's tests (a)–(f) are the starting inventory. **Additionally (new in v3.0): enumerate and close the `PDLC_FAULT` token set.** §4.6 declares the token vocabulary **closed at TSPEC** — TSPEC must list every token any C1/C2/C3 code path can emit, one token per distinct guard (O-3 already forces the git-guard/walk-guard split), and PROPERTIES asserts that the emitted set is a subset of the listed one. An open-ended token set makes every fault-observing oracle unfalsifiable, because an unexpected token is indistinguishable from a token the test simply had not heard of | §4.4/§4.5 give the contract; §4.4 rung (i) names the mandated `json-tool-absent` ladder test; §4.6 declares the closure and hands the enumeration to this row |
| O-11 | TSPEC / PROPERTIES | Probe vocabulary and permission-fixture policy: uid-0 runners **skip with a printed reason and named unverified invariants** — never silently pass. Coverage floors live here | §3.2's six probes are the vocabulary's basis; §7.4 reuses the skip-loudly pattern |
| O-12 | TSPEC | Bootstrap fixture construction (working-tree copy with mode bits, `git init` anchor, pinned `HOME`, `realpath` normalisation) and **both** mode-bit assertions (index and on-disk) | §7.5 item 4 and §7.6 state the requirement; §2.2 requires `realpath` normalisation for the `$HOME` guard |
| O-16 | TSPEC | AC-6.6's skip-loudly branches: pin the **probe order** and the printed reason string for each of (a) empty `--porcelain`, (b) `git` absent, (c) no `.git`, (d) unborn `HEAD`, reusing O-11's vocabulary. Also pin the **untracked-addition** case as a positive (red) fixture. **The fixture root must be `git init`-ed and given at least one commit** — otherwise branch (d) fires and the red case is unreachable, i.e. the fixture accidentally tests the skip path it was meant to contrast with | §7.4 defines the oracle as `advertisedVersionViolation(root)` — **parameterised over a root**, exactly like `coveredViolations(root)` — precisely so a red fixture is constructible without touching the live repo; it states the four branches and why `git -C root status --porcelain -- pdlc/workflows/dist/` (not `git diff`) is required, which is the same reason the untracked fixture must exist |
| O-17 | TSPEC | AC-6.4's pinned fixture tree reproducing the pre-landing layout for the five patterns and four exemption members; the expected 7 paths; and that live-root (`== ∅`) and fixture-root (`== 7`, exact paths, exemption list) are **separate test cases over separate roots**. The fixture root is built under the runner's temp area, never inside the live repo — §7.3's "no test may write into `pdlc/workflows/dist/`" rule is scoped to the **live** root for this reason | §7.3 defines the oracle as `packagingViolations(root) -> set of { clause, path, detail }`, parameterised over a root; §7.5 states the two-root structure and the exemption definitions verbatim |
| **O-18** | PROPERTIES | **Backup filename grammar round-trip.** The grammar is a parameterisable component (id, stamp, `NN` in; a filename out; and a parse back), so it takes a property-based strategy rather than examples: `parse(format(id, stamp, NN)) == (id, stamp, NN)` over the **full M6 id charset** — including ids containing `.`, `-`, digits, and stamp-shaped substrings such as `dev.20260101T000000Z` — and, as a second property, that `LC_ALL=C` descending sort over a generated set of filenames for one id agrees with descending `(stamp, NN)` order. §1.4's fixed-24-byte-suffix parse is what makes both properties provable; v1's optional-suffix grammar made the second one false. **Third property (new in v3.0) — `prune` is bound, not merely described.** Over a generated directory containing backups for several ids plus decoy names, `prune(dir, knownIds)` (a) **keeps exactly the 5 greatest `(stamp, NN)` members per known id** — greatest under the second property's order, so keep-set membership is decidable without reading mtimes; (b) **removes exactly the remaining members of those ids and nothing else**; (c) is the **identity** on every name that does not match §1.4's pattern and on every matching name whose id is not in `knownIds`; and (d) is **idempotent** — `prune ∘ prune == prune`. Without (c) the "never touches a non-matching file" sentence in §5.6 has no oracle, and R-2's "mtime is never read" is unfalsifiable at the prune site, which is the one place an implementer is most tempted to reach for it | §1.4 gives the grammar, the parse rule, the injectivity argument and the exhaustion behavior; §5.6 states the newest-5-per-id rule, the `LC_ALL=C` descending selector and the never-touch-non-matching rule that clauses (a)–(c) formalise |
| **O-19** | TSPEC / **implementation phase** (Cross-Feature) | **The LLM-mediated `_readFile` seam.** `runtime-adapter.js`'s `rtReadFile` is an `agent()` call pinned to `haiku`; the queue's drift-state read inherits it (§6.1). The implementation must (a) add **no** second agent-mediated read for this feature; (b) unit-test §6.2's D1–D8 shape validator against mangled-relay fixtures — fenced, re-wrapped, truncated, key-dropped, array-replaced-by-scalar, state-value-reworded — asserting `blocked` for each; (c) record the seam's mediation in `orchestrate-queue.js` where the read happens, so the next reader does not re-derive it. Byte-faithful hardening of the adapter itself is **not** this feature's change — every pdlc module's `_readFile` consumer shares the property — but it must be raised as a follow-up rather than absorbed silently | §6.1 states the seam, what the validator catches, and the one residual it cannot |
| **O-20** | PROPERTIES | **AC-2.6's measurement-time reading must be asserted, not assumed (OQ-6).** OQ-6 records that AC-2.6's two sentences cannot both be read literally over the same field set on a sync run, and §4.2 applies a reading: sentence (2) ("states observed before this run created anything") governs the pass the run **acts on** — the step-2 as-found pass — while a sync run's **record** carries the step-7 post-run pass, per sentence (1), AC-2.7 and AC-3.3. PROPERTIES must pin that reading with executable assertions, because it is the difference between a successful sync exiting `0` and exiting `1`: (a) after a successful plain sync over an all-`stale` consumer, the written `rows[].state` are the **post-run** states (`in-sync`), and the exit is `0` — the record does **not** replay the as-found `stale` states; (b) on a hook run and on a `--check` run the two readings coincide, so the recorded states equal the as-found states, and a test asserting that must not be mistaken for evidence about (a); (c) the copy/backup/delete decisions of the sync run are the ones the **as-found** pass produced, observable through O-1/O-7's `as-found` trace label rather than through the record. Without this row the reading lives only in FSPEC prose that the PROPERTIES author has no obligation to read | §4.2 states the behavior; §3's pass table names the three passes; §5.8 gives the exit-code consequence; OQ-6 (§11) states the tension and the invited REQ amendment, and routes ownership here rather than to a REQ revision that the stopping rule makes unreachable |
| O-13 | `consolidate-learnings` | REQ-scope stopping rule → `docs/_constraints/DOMAIN-CONSTRAINTS.md`. **Neither `docs/_constraints/` nor `docs/_decisions/` exists on this branch** — the file must be **created**, not merged into; "no such file" does not discharge the row | Not FSPEC's; recorded so it is not lost |

## 11. Open questions

| # | Question | Blocking? | Owner |
|---|---|---|---|
| **OQ-1** | ~~Does a nested build-output directory survive packaging?~~ **RESOLVED — yes, measured 2026-07-28.** Spike: a scratch directory-sourced marketplace pointing at this repo's `pdlc/`, with a placeholder `workflows/dist/distribution-manifest.json` of arbitrary bytes; `claude plugin install` produced a cache at `…/pdlc/0.10.0/workflows/dist/distribution-manifest.json`, `test -r` true, bytes equal (sha1 `b4d18ba15df3896d304f74f3f8a59bd3db955373` both sides). Spike fully torn down afterwards | No | Two collateral findings, both recorded: (1) a **directory-sourced** marketplace install copies the **working tree including untracked files** — so REQ BL-01's throwaway-branch contingency is unnecessary; (2) the *currently configured* `yumo-plugins` marketplace on this machine is **git-remote-sourced** (`github.com/ohenak/yumo-plugins.git`), so real consumer installs copy committed content from the remote's default branch — "update the plugin" for consumers means the feature must be **merged** to be distributable, which is consistent with the queue's `awaiting-merge → done` gate |
| **OQ-2** | ~~Does `hooks.json` accept a second `SessionStart` entry?~~ **RESOLVED — yes, by documentation.** The hooks schema maps each event to an *array* of matcher groups, each with a `hooks` array of handlers; "all matching hooks run in parallel, and identical handlers are deduplicated automatically. Command hooks are deduplicated by command string and `args`"; a group with no matcher "activates on every occurrence of the event"; plugin `hooks.json` uses "the same format" and merges with user/project hooks (code.claude.com/docs/en/hooks). For SessionStart only `command` and `mcp_tool` handler types are supported — C2 is `command` | No | Residual: dedup-by-command-string means the two entries must not be byte-identical invocations (they are different scripts). Both-fire is observed once at implementation as a smoke check |
| **OQ-3** | ~~Linked worktree: which `.claude/workflows/` does the runtime load?~~ **ANSWERED — per-worktree (cwd-based), by documentation** (§0.3 BL-06 row for citations; residual: the docs pin it by enumeration of what worktrees *do* share, not by an explicit worktree sentence). Consequence: post-landing the bundles are untracked, so a fresh `git worktree add` worktree has **no bundles at all**, while AC-0.5 routes the drift check — and sync's writes — to the **main** worktree: green check, absent artifact. This is exactly the case REQ BL-06 gated, and its clause says D-DIST-07 pulls in | **RESOLVED — operator selected Option B, 2026-07-28** (§11.1) | No | AC-0.5 stands as approved; mitigations normative in §7.5 items 7–8; residual stated in §11.1 |
| **OQ-4** | ~~Is a `lib/` subdirectory under `hooks/scripts/` acceptable?~~ **RESOLVED — yes, decided.** The OQ-1 spike proved arbitrary nested directories survive packaging (`workflows/dist/` did; the live cache also ships `workflows/__tests__/`, `hooks/scripts/`, `templates/`). `hooks.json`'s bare-path convention is irrelevant to C1 because C1 is **sourced, never executed and never registered as a hook** — it needs no execute bit. `pdlc/hooks/scripts/lib/pdlc-drift.sh` stands | No | — |
| **OQ-5** | ~~How does the queue print `<pluginRoot>`-expanded commands?~~ **RESOLVED — decided: the drift state carries one pre-expanded command.** The queue *cannot* expand: it runs in the workflow runtime, which has no `process`/env access, and the one-read rule forbids it opening anything else. The drift state therefore gains one top-level field, `syncCommand` (string \| null) — the `<pluginRoot>`-expanded sync invocation, written by C1 like every other field. See §1.3. AC-2.6 fixes the *required* fields of the record, not an exhaustive key set (its "exactly one entry per manifest row" clause governs `rows`, not the top level), so this is an FSPEC-level elaboration, not a REQ deviation — reviewers who disagree should route it as a REQ amendment, but the field itself is forced by AC-4.2 + NFR-1 jointly | No | In the §4.4 invalidation record `syncCommand` is emitted as **`null`** unconditionally — it is a path-bearing string (the O-4 injection concern), and the record's remediation class is permissions/filesystem, never sync, so nothing is lost |

**OQ-6 — AC-2.6's two sentences about *when* the recorded states are measured.** *(New in v2.0,
non-blocking, recorded rather than resolved unilaterally.)*

AC-2.6 contains both of these:

1. "`supersedingState` measured at write time (hook: session start; check: current; **sync:
   post-copy**)"; and
2. "Recorded states are those observed **before this run created anything** (AC-2.9(1))."

For a sync run they cannot both be read literally over the same field set: (2) read as a claim about
`rows[].state` would make a successful sync write `stale` rows, which contradicts (1) for the
sibling field, contradicts **AC-2.7**'s stated consequence that a post-sync drift state unblocks the
queue within the same session, and contradicts **AC-3.3/§4**'s rule that the exit code is computed
over the state at the end of the run (§5.8). Under that reading a fully successful sync would exit
`1` and leave the queue blocked. §5.8 (as weakened in v3.0) puts it precisely: a sync run reaches
exit `1` only if §5.5's post-copy verification is absent or defeated — never as the outcome of a
fully successful sync.

**This FSPEC's reading, applied in §4.2:** sentence (2) governs the classification the run **acts
on** — the AC-2.9(1) pass, which decides every copy, backup and deletion and runs before the run
creates anything — and it is also literally what the hook and `--check` records carry, since those
runs create nothing that a re-measurement could see. A sync run's *record* carries the post-run
pass, per sentence (1), AC-2.7 and AC-3.3.

**This is recorded as an open question rather than acted on as a deviation** because the reading is
forced by three other approved ACs and changes no observable the REQ pins; but sentence (2)'s
wording would read better as "the recorded states are those the run acted on (hook, `--check`) or
those left by the run (sync)". A REQ amendment to that effect is invited and is **not** blocking:
nothing downstream changes if the REQ keeps its current wording, because §4.2 states the behavior
unambiguously either way.

**Ownership (revised in v3.0 — SE Q-01).** v2.0 assigned this to "PM, at the next REQ revision if one
occurs". That owner is unreachable: the REQ is APPROVED at v17.0 and the stopping rule forecloses a
further revision for a non-blocking wording preference, so the reading above would have travelled no
further than this paragraph — and the party who most needs it is the **PROPERTIES author**, who
writes the oracle that decides whether a successful sync exits `0` or `1`. The reading is therefore
restated as a §10 entry obligation, **O-20**, and that row — not this paragraph — is the binding
artifact. Two independent consequences follow, and neither depends on the other:

1. **Downstream (binding, no revision required):** O-20 obliges PROPERTIES to assert the reading
   directly — post-run states in a sync record, as-found states driving the run's decisions.
2. **Upstream (optional, non-blocking):** the invitation to reword AC-2.6 sentence (2) as "the
   recorded states are those the run acted on (hook, `--check`) or those left by the run (sync)"
   stands and is recorded here for whoever next has legitimate cause to open the REQ. If that never
   happens, nothing is lost — O-20 already carries the behavior.

### 11.1 OQ-3 — the linked-worktree decision (**decided: Option B**, operator, 2026-07-28)

The failure mode, precisely: in a linked worktree the runtime loads the worktree's own
`.claude/workflows/` (absent post-landing, since bundles become untracked), while the drift check
resolves the **main** worktree (AC-0.5) and reports its copies `in-sync`. A workflow invocation in
the worktree fails **loudly** (no workflow found) — not silently stale — but the drift tooling
points the operator at a green state that does not describe the tree the runtime reads.

| | Option A — pull D-DIST-07 in now (what REQ BL-06's clause says) | Option B — defer D-DIST-07, mitigate (recommended) |
|---|---|---|
| Change | AC-0.5 re-scoped: each linked worktree is its own consumer — own `.claude/workflows/`, own sync manifest, own drift state; repo root = the worktree containing `$PWD` | AC-0.5 unchanged. Two mitigations: (1) ship a `.worktreeinclude` listing `.claude/workflows/` so worktrees Claude Code itself creates copy the untracked bundles (docs: `.worktreeinclude` applies to Claude-created worktrees only); (2) document plainly that a manual `git worktree add` tree is not a supported consumer until D-DIST-07 (row 6) |
| Cost | Amends an **approved** REQ (AC-0.5, D-DIST-07's deferral row, §6 scope) — reopens Phase R for the delta, on the eve of implementation; grows the fixture matrix (per-worktree state × every classifier state) | A stated, loud residual: manual worktrees fail with "workflow not found" and the drift report does not explain why |
| Risk profile | Correctness everywhere, at schedule + re-review risk | The feature's enemy is **silent staleness**; this residual is neither silent nor stale — it is loud absence |

**Decision: B, selected by the operator on 2026-07-28.** Rationale as recommended: the failure is
loud-absent, not silent-stale; D-DIST-07 keeps its queue-row home (row 6); an approved REQ is not
reopened for a non-silent edge. Consequences, now normative:

1. AC-0.5's main-worktree resolution stands exactly as approved (§2.2 unchanged).
2. The landing step ships a repo-root `.worktreeinclude` listing `.claude/workflows/`, so worktrees
   Claude Code itself creates copy the untracked bundles (§7.5 item 7).
3. `CLAUDE.md` / `pdlc/README.md` state that a manual `git worktree add` tree is **not a supported
   consumer** until D-DIST-07 lands: its workflow invocations fail with "workflow not found", and
   the remedy is to work from the main worktree or a Claude-created one (§7.5 item 8).
4. The residual — a manual worktree's loud failure plus a drift report that describes the main
   worktree — is **accepted and stated**, on the same footing as AC-2.9(3)'s rung-(iii) residual.

**Mitigation (1) rests on documentation, not observation (SE Q-01) — stated, with an obligation.**
The claim that `.worktreeinclude` copies **untracked** `.claude/workflows/` content into
Claude-created worktrees is cited from the product documentation; it has **not** been observed on
this machine. It matters because post-landing the bundles are untracked by design, so if
`.worktreeinclude` copies *tracked* content only, mitigation (1) is void and OQ-3's residual widens
from manual worktrees to **every** worktree. The decision itself is unaffected either way — Option B
was selected on the ground that the failure is loud-absent rather than silent-stale, which holds
under both answers — but the *scope* of what §7.5 item 8 must document is not. **Implementation
obligation:** verify at implementation time by creating one Claude-created worktree after the
landing commit and checking whether `.claude/workflows/*.bundle.js` is present; if it is not, §7.5
item 8's wording widens from "a manual `git worktree add` tree" to "any linked worktree", and item 7
is dropped as ineffective. This is a documentation-scope adjustment, not a spec change, which is why
it is an implementation-time check rather than a blocking prerequisite.

## 12. Acceptance tests

Who/Given/When/Then, one per behavioral cluster. These are FSPEC-level; the fixture matrix,
generation axes and coverage policy are TSPEC/PROPERTIES (§10).

**Standing precondition — the hash utility (new in v3.0).** §3.3 ranks `P5` **first**: on a machine
with no `shasum`/`sha1sum`, *every* managed row is `unknown`/`hash-tool-absent` regardless of what
any path looks like, and that outranks every other row reason. So any test that expects a row state
other than `unknown` is unconstructible unless a hash utility is on `PATH` — the fixture would
silently produce `unknown` rows and the assertion would fail for a reason unrelated to what it is
testing. **Every acceptance test below whose expected outcome names a row state other than `unknown`
carries the implicit conjunct "a hash utility is present on `PATH`" in its Given.** It is written
explicitly in the rows where the ladder's first rung is closest to the surface — AT-1, AT-6, AT-7,
AT-8a, AT-8b, AT-9, AT-10, AT-24, AT-25, AT-26 — and TSPEC must make it a fixture-level invariant
rather than an assumption about the runner (O-11 owns the runner-capability policy; a runner without
a hash utility **skips loudly**, it does not silently pass). AT-14/AT-14b/AT-21 and the
`hash-tool-absent` cases are the deliberate exceptions: they assert the absence branch itself.

| # | Who | Given | When | Then |
|---|---|---|---|---|
| AT-1 | operator, fresh consumer | repo root resolves, `.claude/` absent, plugin ships a valid manifest, **hash utility present** | `--check` | every row `missing`; drift state written into the directory the run created; exit **1** |
| AT-2 | operator, non-git tree, no `.claude/` anywhere | a JSON tool is present and the installed plugin ships a **valid, non-empty** manifest, so no higher-precedence baseline condition holds (§2.8) | `--check` | exit **3**, reason `repo-root-unresolved`, **nothing created on disk** |
| AT-3 | operator, pre-manifest consumer | **repo root resolves** (a git tree with `.claude/` present, so `repoRootUnresolved` does **not** hold — the write-suppression of §2.1's no-write-target rule is out of play and the empty record below is attributable to `manifest-absent` alone); installed plugin ships no manifest | hook runs | warns `manifest-absent` with **update the plugin**; exits **0**; drift state has `baselineStatus: unresolved`, `rows: []`, `retiredPresent: []` |
| AT-4 | queue | that same drift state | queue invocation | `blocked`, naming `manifest-absent` at **Manifest** level |
| AT-5 | operator | `distribution.checkEnabled: false` and rows `stale` | hook, then queue | hook **still warns**; `--check` **still** exits 1; queue **proceeds** with the skip noted |
| AT-6 | operator | **hash utility present**; one row byte-identical, sync manifest absent | `--check` | that row `in-sync` (**not** `unverified`) — O-8's equal-bytes rule |
| AT-7 | operator | **hash utility present**; one row differs, no sync-manifest entry | `--check` | `unverified`, exit **2**; queue over the same state **proceeds** — the asymmetry, both halves |
| AT-8a | operator | **hash utility present**; one row `local-edit` | plain sync | **not** overwritten; bytes unchanged; reported with the `local-edit` reason (W-4); exit **2** |
| AT-8b | operator | **hash utility present**; the same `local-edit` row, unchanged | `--force` | overwritten **after** a verified backup; restoring the newest backup for that id yields **byte-identical** pre-sync content — AC-3.5's non-false-greenable oracle |
| AT-9 | operator | **hash utility present**; sync completed, nothing changed | sync again, same flags | copies nothing, writes no backup, sync manifest **byte-identical**, exit **0** |
| AT-10 | operator | **hash utility present**; one `stale` row and one `unverified` row | plain sync | `stale` copied, `unverified` skipped, exit **2** (post-run precedence) — O-14's worked case |
| AT-11 | operator | all rows `in-sync`, a retired `.js` present | hook | **still warns** `retired-present` with R's id and `in-sync` remediation (plain sync); queue **blocks** |
| AT-12 | operator | retired path present, R post-copy `in-sync` | sync | `p` backed up (id = retired basename), verified, then deleted; a one-line manual commit action printed if tracked |
| AT-13 | operator | retired path present, R `unknown` | sync | `p` **left**, `retire-skipped` naming R's state |
| AT-14 | operator | no JSON interpreter on `PATH`; **no pre-existing drift state** (first adoption) | hook | the §4.4a **T1** `printf` emitter writes the ordinary record through the normal path: it **parses**, carries `baselineStatus: "unresolved"`, `baselineReason: "json-tool-absent"`, `pluginVersion: null`, `syncCommand: null`, `checkEnabled: true` (forced — §2.7's stated residual), `rows: []`; **and §6.2's mapping over it yields `blocked` at row 4** naming the reason. Hook exit **0** — O-4, both conjuncts |
| AT-14b | operator | a JSON tool **is** present; `.claude/pdlc.config.json` readable with `distribution.checkEnabled: false`; a drift state pre-exists at `.claude/workflows/.pdlc-drift-state.json` and **the file itself is writable**, but its parent `.claude/workflows/` is **not writable** (mode `r-x`) | any entrypoint | the atomic sibling-temp + `mv` replace fails (`EACCES` — creating the temp sibling needs write on the **directory**), so §4.4a **T2** fires; **rung (i) succeeds**, because in-place `open(O_WRONLY\|O_TRUNC)` needs write permission on the **file**, not on the directory (§4.4's rung table, corrected in v3.0). The record **parses**, carries `baselineReason: "drift-state-invalidated"`, `pluginVersion: null`, `syncCommand: null`, and **`checkEnabled: false`** — the falsifiable form of the preservation claim, red against an emitter that hard-codes `true`; §6.2's mapping over it yields **proceed** at row 2. The fixture is deliberately **not** `ENOSPC` any more: v2.0 gave AT-14b and AT-15 the same cause with different expected rungs, which no implementation can satisfy simultaneously |
| AT-15 | operator | drift-state file exists in a **writable** directory; `ENOSPC` (or quota exhaustion) on the file write | any entrypoint | rung (i) attempted and fails, rung (ii) `unlink` succeeds, fresh write lands — O-5's only reachable rung-2 path. (The Given deliberately does **not** make the directory unwritable: §4.4's own reachability table sends `EACCES` on the parent to rung (iii), and a fresh write could not land there) |
| AT-16 | operator | drift-state file immutable | any entrypoint | rung (i) fails, rung (ii) `unlink` refused (`EPERM`), rung (iii): N-3 on stderr, `--check` exit **4**, hook exit **0** |
| AT-17 | operator | a copy fails **and** the drift-state write fails | sync | both lines printed, **drift-state line first**, naming the invalidated state and a permissions fix — O-6 |
| AT-18a | operator | `PDLC_FAULT=not-a-real-token`, everything else green | **hook** | N-7 printed exactly once, nothing injected, the green drift state still written, hook exit **0** — O-2 |
| AT-18b | operator | the identical fixture and environment | **`--check`** | N-7 printed exactly once, the **same green record** written (byte-identical to AT-18a's, modulo the timestamp field), and exit **4** — AC-2.9(5) verbatim (v1 asserted 0 here). Split from AT-18 in v3.0 because one row asserting two entrypoints with two different exit codes cannot be reported as a single pass/fail, and the `--check` half is the one v1 got wrong |
| AT-19 | jest | `liveRepoRoot`; the manifest and the packaged set under it | `npm test` | `packagingViolations(liveRepoRoot)` satisfies AC-6.2 (a)–(d); no test writes into **the live root's** `pdlc/workflows/dist/` (the rule is scoped to the live root — §7.3 — so AT-29's fixture root is unaffected) |
| AT-20 | jest | a **fixture** root `fxRoot`, `git init`-ed with at least one commit (so AC-6.6's unborn-`HEAD` skip branch does not pre-empt the case), containing any `dist/` change and a `plugin.json` whose `version` == its value at `fxRoot`'s `HEAD` | `npm test` | `advertisedVersionViolation(fxRoot) == "red"` — including the untracked-only case (`??` lines), which `git diff HEAD` would miss. Constructible only because §7.4's oracle is parameterised over a root; a live-root-only oracle could not be driven red without dirtying the repo under test |
| AT-21 | jest | `git` absent from `PATH` | `npm test` | AC-6.6 **skips loudly**, printing the reason and naming the unverified invariant — never a silent pass |
| AT-22 | jest | live repo root, post-landing | `npm test` | `coveredViolations(liveRepoRoot) == ∅` |
| AT-23 | jest | pinned fixture root | `npm test` | `\|coveredViolations(fixtureRoot)\| == 7`, paths equal the enumerated 7, exemption list asserted literally |
| AT-24 | maintainer | **hash utility present**; fresh clone, no plugin, `${CLAUDE_PLUGIN_ROOT}` unset | `build-runtime.mjs` then `sync-workflows.sh` | bundles present, all rows `in-sync`, `--check` exit **0**, queue mapping proceeds silently — AC-6.5 |
| AT-25 | operator | **hash utility present**; a `.claude/workflows/` file with no row and in no `retires` | any entrypoint | reported `not-managed`; never read for comparison, never overwritten, never deleted; absent from `rows` |
| **AT-26** | operator | **hash utility present**; one row `stale` (consumer hash == the sync manifest's `consumerHash`) | **plain** sync, no `--force` | a verified backup of the pre-existing bytes is written **before** the copy; the row is copied; restoring that backup yields **byte-identical** pre-sync content. Red against a procedure that copies a `stale` row without backing it up — SE F-02, AC-3.4 |
| **AT-27** | operator | a `local-edit` row under `--force` where the backup write **appears to succeed but the backup does not land** (fault-injected: re-read returns different bytes) | `--force` | the original consumer file's bytes are **unchanged**; the operation is reported skipped; `writeFailures` gains `{path, backup-verify}`; exit **4**. Red against an implementation that skips §4.7 step 2's re-read — AC-2.9(4)'s negative |
| **AT-28** | jest | a second **fixture** root `fxRoot2`, `git init`-ed with at least one commit, with a `dist/` change and a `plugin.json` `version` **different** from its value at `fxRoot2`'s `HEAD` | `npm test` | `advertisedVersionViolation(fxRoot2) == "green"` — the green counterpart to AT-20, red against an unconditionally-red oracle. This is the case the landing commit itself must satisfy on the live root |
| **AT-29** | jest | a **fixture** root `fxRoot3` (under the runner's temp area, never the live repo) carrying a manifest whose `pluginSha1` for one row disagrees with that file's bytes on disk | `npm test` | `packagingViolations(fxRoot3)` reports a violation with `clause: "6.2(b)"` and that row's path — the falsifying counterpart to AT-19, red against a no-op assertion. Constructible only because §7.3's oracle is parameterised over a root; AT-19's "no test writes into `pdlc/workflows/dist/`" rule binds the live root only |
| **AT-30** | operator / jest | the emitted message catalogue rendered over S1, S2 and S3 (§8.2) | render each | `distinct(a,b)` holds **pairwise** within each set — not equal, and neither a substring of the other. Red against an implementation emitting one string for `stale` and `local-edit`, or reaching inequality only by appending an id — AC-2.3, AC-2.5, AC-2.5a |
| **AT-31** | queue | two records, **both shape-valid under D1–D8 and both carrying `checkEnabled: true`** — so neither can be diverted to §6.2 row 1 (malformed) or row 2 (opt-out), and the row under test is the one actually exercised: (a) `writeFailures` non-empty, `baselineReason: "drift-state-invalidated"`, `syncCommand: null`; (b) `retiredPresent` non-empty and every row `in-sync` | queue invocation over each | first: `blocked` at §6.2 **row 3**, naming each `{path, operation}` **and** naming `drift-state-invalidated`, with a permissions/filesystem remediation and **no sync command**; the `syncCommand: null` fallback describes the shipped script rather than printing a fake path. second: `blocked` at **row 7** naming the retired path — §6.2 rows 3 and 7, §6.3 |
| **AT-32** | operator | (a) `.claude/workflows/` exists but is not listable; (b) `distribution.checkEnabled: "false"` (the string) | any entrypoint | (a) N-6 printed **and every row's state is identical** to the same fixture with a listable directory — AC-0.6's "no row state changes"; (b) N-5 printed once and `checkEnabled` recorded **`true`** — §2.7's non-boolean row |
| **AT-33** | operator, non-git tree (`repoRootUnresolved` **holds**) | the installed plugin ships a manifest that is **present, parseable and has zero rows**, so `manifestEmpty` also holds and, by §2.1 Phase 2, **outranks** `repoRootUnresolved` for reporting | `--check`, then the hook over the same fixture | the reported `baselineReason` is **`manifest-empty`** (not `repo-root-unresolved`) — *and yet* **nothing is created on disk**: no `.claude/`, no `.claude/workflows/`, no drift state, no sync manifest, no backup directory. **N-8** is printed (the reported reason is not `repo-root-unresolved`, so W-1 alone would leave the empty result unexplained), `writeFailures` is empty — suppression is not a write failure — and the exits are `--check` **3**, hook **0**. This is the AT that separates the *condition* from the *selected reason*: v2.0's §4.2/§5.1 keyed the no-write-target guard on the reason and would have created a directory here — SE F-14 ≡ TE F-16 |
| **AT-34** | operator | repo root resolves, hash utility present, and the sync manifest at `.claude/workflows/.pdlc-sync-manifest.json` **exists but is unreadable or malformed** | `--check` | every row with no other distinguishing evidence classifies **`unverified`** (P6 ⇒ "no entry", §1.2) **and N-4 is printed once**, in O-8's wording, naming the manifest path and that it was treated as carrying no entries. Contrast case, asserted in the same test: with the sync manifest simply **absent**, the row states are **identical** but **no N-4 is printed** — absence is the ordinary first-sync condition, not an anomaly. Red against an implementation that emits N-4 in both cases or in neither, and it is the only AT covering N-4 |
| **AT-35** | operator | hash utility present; one row `stale`; the copy is fault-injected to write a **truncated** prefix of the plugin bytes (a full-disk or interrupted-write simulation) | plain sync | §5.5's post-copy verification re-reads the copy, hashes it, and finds it ≠ `pluginSha1`: the row gets **no sync-manifest entry** (AC-2.9(2)), `writeFailures` gains `{ path, artifact-copy }`, the loop **continues** to the remaining rows (AC-1.4), and the run exits **4**. The post-run pass measures that row **`unverified`** — it has no sync-manifest entry to compare against, which is exactly what §1.2's "bytes written" rule implies. Red against an implementation that copies without re-reading: there the row would silently record a sync-manifest entry whose `consumerHash` is the truncated bytes, classify **`in-sync`** on the next run, and the corruption would be undetectable forever — SE F-18 / SE Q-02 |
| **AT-36** | queue | a drift state that is **shape-valid under D1–D8 but omits the `syncCommand` key entirely** (an older C1, or the `printf` emitter of a build that predates the field), with `checkEnabled: false` and rows `stale` | queue invocation | the queue **proceeds**, at §6.2 **row 2** (the `checkEnabled` opt-out) — it is **not** blocked at row 1 as malformed. D8 reads an absent `syncCommand` as `null` (§6.2, §6.3), so the record parses, row 1 does not fire, and the opt-out that outranks every other blocking row takes effect. Red against a validator that makes an FSPEC-invented field a hard shape gate and thereby lets a schema addition silently revoke a consumer's opt-out — SE F-16 |

## 13. Traceability

| REQ unit | FSPEC section |
|---|---|
| REQ-DIST-00 (AC-0.1–0.7) | §1.1, §2, §3.5 |
| REQ-DIST-01 (AC-1.0–1.8) | §2, §3 |
| REQ-DIST-02 (AC-2.1–2.9) | §4, §5.1–5.3 |
| REQ-DIST-03 (AC-3.1–3.9) | §5.4–5.9 |
| REQ-DIST-04 (AC-4.1–4.3) | §2.7, §6 |
| REQ-DIST-05 (AC-5.1–5.4) | §7.1, §7.2 |
| REQ-DIST-06 (AC-6.1–6.6) | §7 |
| NFR-1 | §5.4, §6.1, §6.2 |
| NFR-2 | §13.1 below |
| NFR-3 | §3.4 R-6, §3.5 |
| NFR-4 | §5.4 |
| NFR-5 | §2.3, §5.4, §4.6 |
| NFR-6 | §5.1, §4.4 rung (iii), §6.2, §4.6 |

| User story | FSPEC sections |
|---|---|
| US-01 (told at session start) | §5.1, §5.2, §5.3 |
| US-02 (single command to update) | §5.4, §5.5, §7.6 |
| US-03 (which direction, deterministically) | §3.3, §3.4, §3.6, §5.6 |
| US-04 (published and reaches consumers) | §7.1, §7.3, §7.4 |

### 13.1 NFR-2 — the structural latency discharge

NFR-2 requires the p95 budget to be discharged **structurally and reviewably at FSPEC**, with **no
test asserting wall-clock time** (a timing assertion on a SessionStart hook is flaky by
construction). The three structural claims, each checkable by reading this document:

1. **No unbounded filesystem enumeration.** The managed set comes from the manifest (§2.5), never
   from a glob — AC-0.1 prohibits globbing outright. The only directory listing in the feature is
   the single non-recursive read of `.claude/workflows/` for the `not-managed` report (§3.5).
2. **No process spawn per row beyond the three declared tools.** Per row **per classification
   pass**: at most two hash invocations (plugin side, consumer side). The hash-utility *probe* is
   **once per run**, not once per row (§3.1, SE Q-02), so it does not scale with the managed set.
   Baseline resolution spawns the JSON helper a bounded number of times (manifest, sync manifest,
   config) and `git` at most twice (§2.2). Nothing scales with the size of the repo.

   **A sync run makes three classification passes, not two** (§3's table, corrected in v3.0):
   as-found (step 2), post-copy (step 5) and post-run (step 7). All three are inside the budget, and
   **all three apply to sync runs only** — the SessionStart hook, which is the surface NFR-2's p95
   budget is actually about, makes **one** pass and its cost is unchanged from v1.

   The honest sync-run bound is therefore `2 × (2 × |rows| + |retiringRows|)` hash invocations,
   whose worst case — every row retiring — is `2 × 3 × |rows|`, up from the `2 × 2 × |rows|` v2.0
   quoted. The refinement matters and is not padding: the post-copy pass (§5.7) re-classifies
   **only the retiring rows**, because it exists solely to gate AC-3.9's delete, so on the ordinary
   run where nothing retires the sync cost really is `2 × 2 × |rows|` and the third pass is free.
   Over a managed set the manifest fixes at 2 rows today, every one of these is a constant.
3. **No network.** Nowhere in C1/C2/C3. `${CLAUDE_PLUGIN_ROOT}` is used verbatim and the cache is
   never enumerated (§2.4).

The wall-clock number is observed **once**, on the maintainer's release checklist (the AC-6.2a
pattern), and is advisory: a miss opens a bug, it never fails a build.
