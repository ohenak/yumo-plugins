# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.3)
**Date:** 2026-08-14
**Iteration:** 2
**Scope:** Delta re-review. Round-1 findings (SE F-01…F-04) checked for resolution; only the
changed sections re-read for new defects. Every existing-code and upstream-document claim added in
v0.3 re-verified at HEAD.

## Round-1 disposition

All four of my round-1 findings are resolved. Each was checked against the diff
(`git diff 00177ed3 HEAD -- …/PROPERTIES-…md`), not against the changelog's description of it.

| Round-1 finding | Severity | Resolution | Verified |
|---|---|---|---|
| F-01 — PROP-CAT-2 asserted twelve ids past the open TSPEC §10.3 / §9.3 erratum without PROP-CAT-4's conditional marking | Medium | PROP-CAT-2 now states both resolutions ("eleven or twelve"), names `node.below-floor` as the conditional member, forbids transcribing the expected set from the row, and adds `PLAN §7 open erratum` to its `Traces`; §5's REQ-EDIST-05 row carries the matching footnote and states that no `AT-5.*` id depends on the branch | **Resolved.** Both edits present |
| F-02 — §7's Unit row was defined by reachability, which does not discriminate | Medium | The row is now defined by **scope of assertion** (single module or function over injected seams; no spawned process, temp prefix, built artifact or full run) and explicitly hands the Machine boundary back to reading rule 5 | **Resolved.** The nine Integration properties no longer fall inside the Unit definition |
| F-03 — PROP-REGR-1's site-count floor was not mechanically reproducible as stated | Low | The counting method is stated inline (top-level `test(` call, excluding `.test(` regex predicates and comment mentions), with the naive `grep -c` result (20) named as the trap; §1's floor list follows; `ci-arrangement.test.js` gains its own dual floor | **Resolved, and the new measurement holds.** `node --test __tests__/ci-arrangement.test.js` at HEAD reports `1..2` and `# tests 6`, exactly as claimed |
| F-04 — PROP-PACK-7's positional anchor lacked the "at HEAD" qualifier its sibling carries | Low | The parenthetical now reads "read at HEAD" and states that T41 edits those very lines | **Resolved** |

Nothing in the revision re-opened a settled decision, changed the task graph or the ownership
manifest, or disturbed §4's set-equality against FSPEC §8 — the 35 `AT-` rows are unchanged in
count and in `Carried by`; only the `Properties` cell of AT-1.1 moved.

## Claims verified at HEAD (v0.3 additions only)

The revision added a lot of line-cited code claims. Every one of them is exact.

| Claim under review | Method | Result |
|---|---|---|
| PROP-LAUNCH-2: `checkCompat(engineCompatRange, pluginVersion)` takes the **installed plugin** version, in `lib/handshake.mjs` | Read the signature | **Holds.** `pdlc/engine/lib/handshake.mjs:144` `export function checkCompat(engineCompatRange, pluginVersion)`; `readPluginVersion` at `:45` is what supplies it |
| PROP-LAUNCH-2: "the decision half ships green at HEAD (`handshake.test.js:120-126`)" | Read the range | **Exact.** `:120` is the out-of-range test, `:123` pins `0.25.1`, `:124` the range, `:125` `/Remedy:/`, `:126` closes |
| PROP-LAUNCH-9: "`handshake.test.js:110-118` pins the range, `not found`, `Remedy:` and `PDLC_PLUGIN_ROOT` on `checkCompat`'s reason" | Read the range | **Exact.** `:110` opens, `:113` `pluginVersion === "not found"`, `:114` range, `:115` `not found`, `:116` `/Remedy:/`, `:117` `/PDLC_PLUGIN_ROOT/`, `:118` closes |
| PROP-LAUNCH-5: `not found` is "the same value `checkCompat` reports at HEAD (`handshake.test.js:113`)" | Read the line | **Exact**, and the renderer agrees — `handshake.mjs:209` prints `` `plugin: pdlc v${pluginVersion ?? "not found"}` `` |
| PROP-VER-14: "the **only** HEAD assertions on `REMEDY`'s content are `handshake.test.js:116-117` and `:125`" | `grep -rn REMEDY` over `lib`, `bin`, `__tests__`, `scripts`; then the six files mentioning `PDLC_PLUGIN_ROOT` | **Holds, and the exclusion is real.** `REMEDY` is referenced only at `handshake.mjs:131` (definition), `:164` and `:177` (the two rendered reasons). The other five files named (`report-engine`, `startup-ladder`, `cli`, `exit-loop`, `skills`) mention the variable but none reads `REMEDY`. So "no edit to `handshake.test.js` is required and none is owned" is correct as stated |
| PROP-REGR-1: `ci-arrangement.test.js` is "≥ 6 from ≥ 2 sites, measured `1..2` / `# tests 6` at HEAD" | Ran `node --test __tests__/ci-arrangement.test.js` | **Reproduced exactly:** `1..2`, `# tests 6`, `# fail 0` |
| PROP-LAUNCH-4: "per PLAN T15(f) the diagnostic is asserted … in *both* refusal states" | Read PLAN `:146` | **Holds.** T15(f) reads "**AT-1.3**: the diagnostic completes and reports the triple in *both* refusal states, not just one" |
| PROP-LAUNCH-9 / PROP-LAUNCH-2 carriers T15 → `version-doctor.test.js`, T46 → `bin/cli.mjs` | Diffed against PLAN §2's Files and Owns columns | **Holds.** T15 owns `version-doctor.test.js` (`PLAN:146`), T46 owns `bin/cli.mjs` (`:184`). No new file and no ownership change is implied by the new property |
| §4's AT-1.1 row still transposes PLAN §2.1's `Carried by` | Diffed the cells | **Holds.** PLAN `:201` reads `T15, T14, T46`; the PROPERTIES row is unchanged at `T15, T14, T46` |
| "TSPEC §11 names AC-1.1's carrier as two halves" | Read TSPEC's AC map | **Holds.** `TSPEC:1972` — `handshake.checkCompat` (shipped, V-09) **+ launcher refusal path`, §11 |
| PROP-LAUNCH-2's T-5 / T-3 distinction | Read REQ §4.1's terminology table | **Holds.** `REQ:238` T-5 is the per-consumer-project **pin**; `REQ:236` T-3 is `pdlcPluginCompat`, constraining the **plugin** version. The two axes are as the row now describes them |
| §7 arithmetic: 89 properties, column sum 95, Unit 74 | Recounted from §2's tables | **Holds.** LAUNCH 9 + PACK 12 + VER 16 + CAT 4 + PROV 19 + INSTALL 8 + PUB 10 + GATE 5 + REGR 6 = 89; Unit 74 + Integration 9 + Machine 12 = 95; Unit's own breakdown (12+16+4+18+8+5+3+3+5) = 74; Integration's nine members enumerate to nine |

## Findings

Two, both in text the revision introduced. Neither is High; neither blocks Phase I.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **PROP-LAUNCH-1's new home is a state neither of its two cited legs is about.** Moving it off AC-1.1 was right (that was PM F-01), but the replacement trace does not hold in either half. (a) Its `Traces` now reads `AC-5.5, TSPEC §6.2`, and `AC-5.5` is *"Given: a pin naming a version that is not installed"* (`REQ:427-429`) — the `version.pin-missing` branch, already carried by PROP-VER-5 (`AC-5.5, AT-5.5`). PROP-LAUNCH-1's subject is a different branch: **no engine version installed at all**, reason id `store.empty`. Two properties now claim AC-5.5 while asserting two different message ids, and the one that actually matches AC-5.5's Given is the other one. (b) §4's new no-`AT-`-row sentence says PROP-LAUNCH-1 "is observed inside AT-5.5's and AT-1.3's legs on the same fixtures" — but this same revision redefined AT-1.3's subject as *"the two plugin-handshake refusal states"* (PROP-LAUNCH-4), which explicitly excludes the empty-store state, and AT-5.5's leg is the pin-missing fixture. So the sentence justifies traceability by pointing at the two legs the document has just finished saying are about something else. **Fix, one clause and one cell:** the empty-store state *is* genuinely observed — it is PROP-LAUNCH-4's resolution state (b), "empty store reports the launcher's own triple with `mode: "unresolved"` and carries the refusal text as a **notice**". Point the §4 sentence there (and at AT-1.6's triple, which that leg reports) instead of at AT-5.5 / AT-1.3, and trace the row to TSPEC §6.2's ladder branch rather than to AC-5.5, or state plainly that `store.empty` is a resolver-shape property with no criterion of its own — the honest reading, and the one PROP-CAT-1/-2/-4 already use. Why Medium and not High: PROP-LAUNCH-1 keeps its named carriers (T15, T14, T46 → `version-doctor.test.js`, `launcher.test.js`) and its three positive conjuncts, so an implementer builds and tests the right thing; what is wrong is the coverage *claim*, which a DoD reader could take as "AC-5.5 has two carriers" when it has one. | §2.1 PROP-LAUNCH-1, §4 (no-`AT-`-row paragraph) |
| F-02 | Low | Local | **PROP-LAUNCH-9's clause (d) is the document's own §3 shape and did not get a §3 row.** Clause (d) — "no file in the consumer project changed, asserted as a byte-identical tree-and-index comparison against a **non-empty** recorded pre-state, never as a bare absence" — is character-for-character the pattern PROP-NEG-3 exists to catalogue for `postinstall` ("the repo's tree and index are byte-identical against a **non-empty** pre-state"). §3's preamble says "**Every** negative below is stated with the positive conjunct that makes it falsifiable"; the new property adds a negative of exactly that class to §2 without a matching §3 entry, so a reader auditing absence-only hazards from §3 alone now misses G-1's headline refusal. The conjunct itself is correctly written — this is a catalogue-completeness gap, not an oracle weakness. **Fix:** one §3 row (must-not: a refusal that leaves the consumer tree modified, or that "refuses" after dispatching; positive conjunct: dispatch count `=== 0` plus the byte-identical tree-and-index comparison against a non-empty pre-state; traces AC-1.1, AT-1.1). | §2.1 PROP-LAUNCH-9, §3 |

No High findings. No finding contradicts a standing constraint in `docs/_constraints/` or a promoted
decision, and I found no unverified existing-code claim anywhere in the added text — see the
verification table above, which is 100% clean this round.

**One erratum is raised against an upstream document** and is reported in the response trailer
rather than folded into this verdict: FSPEC's AT-1.6 (`FSPEC:663`) writes the missing-plugin member
of the version triple as the literal `"none"`, while the shipped renderer and this document both use
`not found` (`handshake.mjs:209`, `handshake.test.js:113`, PROP-LAUNCH-5). PROPERTIES is right and
FSPEC is stale; a verifier transcribing AT-1.6 rather than the property would pin the wrong string.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-LAUNCH-4 now carries five states and PROP-NEG-13 asserts exit `0` in all five. Two of them (PROP-LAUNCH-9's and PROP-LAUNCH-2's) are states in which a *pipeline* command exits non-zero, so the same fixture is asserted twice with opposite exit codes depending on the command. Worth one clause naming the discriminator explicitly — `doctor`/`--version` are a distinct `switch` arm that dispatches nothing (`bin/pdlc.mjs:208`, `:489-491`, TSPEC V-12) — so an implementer does not read the pair as a contradiction and reach for a flag on the refusal path? |
| Q-02 | PROP-VER-14's new conjunct closes the DoD-item-2 hole for *today's* wording by naming the two assertions the new `REMEDY` must keep green. It then says a future wording that drops either substring must pull `handshake.test.js` into T32's ownership manifest. That obligation lives only in this row's prose — nothing in PLAN §3 or the DoD reads it. Is that acceptable (the rewrite is a single known string, and the property is asserted positively in T32's own leg), or would you rather the sentence say plainly that T32's manifest is correct *because* the substrings survive, so a reader does not go looking for a mechanism that enforces the conditional? |

## Positive Observations

- **The blocking pair was fixed at the root, not papered over.** PM F-01 could have been closed by
  re-pointing §4's rows at `handshake.test.js`; instead PROP-LAUNCH-9 was added with four conjuncts
  that map one-to-one onto AT-1.1's clauses, and PROP-LAUNCH-2 was restated on the axis the design
  actually has. The new "two refusal axes are not the same axis" paragraph then says *why* the split
  exists and what would have been wrong without it — that paragraph is the part a future reader
  needs and the part most revisions omit.
- **Every added line citation is exact.** Twelve new code and document anchors, checked
  individually: signatures, test line ranges, PLAN sub-items, REQ terminology rows, the TSPEC AC
  map. Not one was approximate, and `ci-arrangement.test.js`'s `1..2` / `# tests 6` reproduced on
  first run. The `REMEDY` exclusion claim in PROP-VER-14 — that five other files mention the
  variable and none reads the constant — is the kind of negative claim usually asserted from
  memory; it is true.
- **PROP-VER-14 turned an assumption into an asserted conjunct.** "The rewrite happens not to redden
  an unowned file" is exactly the sort of thing that is discovered by a red CI run three tasks
  later. Naming the two surviving substrings and asserting them positively in T32's own leg makes
  the disposition checkable at the moment the string changes.
- **The arithmetic was re-derived, not adjusted.** Adding one property moved 88 → 89, 94 → 95 and
  73 → 74, and the Unit row's nine-way breakdown was re-stated to match (`8 of 9 PROP-LAUNCH`). All
  three totals recompute from §2's tables with no residue.
- **PROP-CAT-2's conditional marking is stated the strong way.** It does not merely note the
  erratum; it says which member is conditional, what the set is under each resolution, that the
  expected set is transcribed from the resolved TSPEC and never from the row, and that
  implementation must not begin against the unresolved form. That is the version an implementer
  cannot misread under time pressure.

## Recommendation

**Approved with minor changes**

Both round-1 Medium findings and both Lows are resolved, and the two PM Highs that were the real
blockers are resolved in a way that survives verification against HEAD rather than against the
changelog. The two findings here are one Medium traceability correction (PROP-LAUNCH-1's trace and
its §4 justification sentence, ~two edits) and one Low catalogue row in §3. Neither changes a
property's assertion, a carrier, a task or the ownership manifest, and neither needs to land before
Phase I begins — though F-01 costs about as much to fix now as to read later.

Phase I remains blocked by the two open TSPEC errata recorded in PLAN §7 (below-floor emission,
fixture-machine home), which are correctly routed and are not this document's defect. The FSPEC
`"none"` / `not found` divergence is raised as an erratum below rather than as a finding here.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}


APPROVAL-HASH: sha256:5742146d078c333fea6a5b6bc06025a94689e3fe1c674e117c05b3abc8a1d9bb
APPROVAL-HASH-NORMALIZED: sha256:cb107783b3c07753b48ec3c54888ab77f06aae23027b78a3cf8678aeed76789a
REVIEWED-COMMIT: 16b022b3702c74a91d2e825cbeca9452c9d68cc1
