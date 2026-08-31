# Cross-Review: test-engineer — DECISIONS (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, unchanged bytes)
**Date:** 2026-08-31
**Iteration:** 9

## Context

This is a **delta confirmation under DECISION FREEZE**, and the delta is empty on this document's
side: `git diff 7adc9666..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md` is empty, and the file's
sha256 is `48522bf9…`, byte-identical to the `APPROVAL-HASH` my v8 recorded. Nothing in the document
changed, so nothing in the document can have been broken by an edit to it.

What *did* move is upstream, and that is the whole question this round answers. Measured on
`feat-pdlc-stats` at HEAD (`5ec3e593e`):

| Upstream | v8's `UPSTREAM-STATE` pin | HEAD sha256 | Version at HEAD |
|---|---|---|---|
| REQ | `60a516fb…` | `5f3e8051…` | v1.6 (was v1.4) |
| FSPEC | `25af3c47…` | `c7d2c832…` | v1.7 (was v1.5) |
| TSPEC | `512a9fcf…` (phantom) | `37422160…` | v1.6 (was v1.4) |

So the question is DEC-ERR-03's, not the ordinary one: **is a frozen DECISIONS still a faithful
compression of upstream after upstream moved three times?** I answered it by diffing each upstream
document across the same range and by re-measuring, at HEAD, every repository claim this document
makes — not by re-reading the document.

The upstream deltas, and what each one asks of this document:

- **REQ v1.5–v1.6** withdraws REQ-STATS-05's harvested halt state and restores a measured `0`,
  rescopes NG-6 to the two families harvest removes, and rewords REQ-STATS-06's predicate so a
  grammatical basename outside the driver's catalogue is a *survivor*. All four are metric-semantics
  changes. This document decides module placement, `schemaVersion`'s home and the parser seam; it
  contains no reference to REQ-STATS-05, to halts-as-harvested, or to the harvested predicate at all
  (grep over the file returns no hit for `REQ-STATS-05`, `harvested`, or `POSTMORTEM`). Nothing owed.
- **FSPEC v1.6–v1.7** rewrites BR-16's `docs/completed/pdlc-advisory-wave-gate/` citation to a
  basename *shape*, corrects two → four, adds AT-15 to BR-16's trace row and re-points §7.3's E-5
  row to AT-20/AT-26. This document cites FSPEC only for §4/§5's fixed key sets and §5.2's per-class
  count (K-7) — neither touched.
- **TSPEC v1.5–v1.6** scopes the two sibling-feature document edits **outside** the ten (§1, RK-1),
  renames §6.4's "four script-side enumerations" to "the four enumerations `assertAdditiveOnly`
  reads" with the same four members, quotes P-1's title verbatim in §2.1, rewrites §4.3 to the
  shape-only BR-16 reading, and opens a second §8.3 erratum (REQ-STATS-06 v1.6 versus BR-16 v1.7).
  Every one of these is either agreed with this document already or outside its scope; §4.3's
  contested scoping touches no decision, oracle, type or count this document owns.

## Options Considered

Under freeze the only options open to me are dispositions of this round, not of the document.

| Option | Shape | Why not / why |
|---|---|---|
| Approve on "no diff, nothing to check" | Treat an empty document delta as a null round | **Rejected.** Upstream moved three documents; a frozen compression can be falsified by its sources moving underneath it without a byte of it changing. DEC-ERR-03 asks the confirmation to measure the document against HEAD, not against the item list |
| Re-open TSPEC's §4.3 / REQ-STATS-06 dispute here | Take a side on the out-of-catalogue basename | **Rejected.** It is a REQ-versus-FSPEC reconciliation TSPEC §8.3 already routes to the owning phase, and it reaches no decision, type or oracle this document owns. Opening it here would be a new decision in a frozen round |
| Block on the stale grounding attestation | Read v1.6's "upstream did not move" as false at HEAD | **Rejected as blocking, recorded as Medium.** The sentence was true when written and is version-scoped; I verified independently that no upstream decision is owed absorption, so no load-bearing claim of this document is false. It is a freshness defect a future round could trip over, not a falsified claim |
| Approve with the residual findings recorded | Confirm faithfulness, file what is stale, route what is upstream | **Chosen** |

I also re-derived the repository claims themselves rather than trusting either document, because
"cheaper / simpler" and "N sites" claims are exactly the kind that rot silently when a branch
advances. Every measurement below is a fresh run at HEAD.

**Sweep totals (both probes, both documents):**

| Query | Measured at HEAD | Document claiming it |
|---|---|---|
| `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` | **25** | DECISIONS (25 − 15 = 10) |
| `git grep -l "lib/loop-session.mjs" -- . ':!docs/'` | **24** | TSPEC §2.1/§7.3 (24 − 14 = 10) |
| `grep -rln "escalation-view"` (dist/docs/node_modules excluded) | **23** | DECISIONS' NUL-byte caveat |

All three reproduce exactly. **This withdraws my own v8 F-02**, which read TSPEC §7.3's "24
candidates / 14 pure consumers" as stale by one against a measured 25: the 25 is *this document's*
probe, the 24 is TSPEC's (`TSPEC:211-222` states the `lib/loop-session.mjs` probe and the 24 − 14 = 10
arithmetic explicitly), and DECISIONS' own probe-invariance table already reconciles them. The error
was mine — comparing one document's total under the other's query, the exact thing this document
warns is "not defensible". Nothing is owed to TSPEC on that count.

## Decision

**The document is unchanged, remains a faithful compression of REQ v1.6 / FSPEC v1.7 / TSPEC v1.6 at
HEAD, and nothing was broken.** No High finding, old or new. Two findings stand, both **inherited**
(there is no delta on this document, so nothing can be `delta`-provenanced) and both **nonlocal**.

Every repository claim in the document re-measured at HEAD, one by one — this is the part that could
have rotted while the branch advanced, and none of it did:

| Claim (DECISIONS) | Re-measured at HEAD | State |
|---|---|---|
| `prepack.mjs` `MODULE_NAMES` = four bare names | `pdlc/engine/scripts/prepack.mjs`, four members | holds |
| `publish-preflight.mjs` holds a deliberate production-side copy at `:205-219`, comment at `:200-203` | `LIB_MODULES_AT_HEAD` (12) + `LIB_MODULES_FROM_THIS_FEATURE` (3) at exactly those lines; comment reads *"deliberate second, production-side copy"* | holds |
| `_tspec-packed-set.mjs` `tspecPackedCount` = `4 + 15 + 5 + 1 + (licence…)` | `_tspec-packed-set.mjs:98-99`, verbatim | holds |
| `pdlc/workflows/package.json` `c8.include` = **seven** `**/`-anchored entries | seven entries, both `lib/*.mjs` members present | holds |
| `REQUIRED_INCLUDES` holds **four** entries, so P9-02's literal is `4 + 1 + 2` = seven | `coverageInstrumentation.test.js:37-46`: four entries, the fourth `check-wave-resume-delta-coverage.mjs` | holds |
| P9-02's title still says **six** | `coverageInstrumentation.test.js:264` — *"the include set is exactly the six modules the feature owns"* | holds (stale in the shipped code, as the document says) |
| P-1's title pins the count | `learningsPremises.test.js:78` — *"MODULE_NAMES is exactly the four canonical workflow modules"* | holds |
| `run.test.js` is live: 27 top-level `test(` calls, no `.skip` | 27 and 0, measured | holds |
| `pdlc/README.md`'s prose enumeration names four and is pinned by no oracle | `pdlc/README.md:231`, the four-member sentence; `documentOracles.test.js` reads the file but not the member list | holds |
| Two grep hits survive and fail the predicate: `loop-cli.test.js` at `:122`, `:637`, `:652`, `:681`, `:827`, `:852`; `cli.mjs` at `:114`, `:117` | every one of the eight line anchors resolves to the stated `path.join` / `pathToFileURL` / comment shape | holds |

The line-number anchors are the fragile class, and the document is explicit that it uses them only
where position is the measurement (the grep hits) while citing test titles and section prose
elsewhere per `DEC-DOC-01`. Eight anchors, eight resolutions, on a branch that has taken twenty-odd
commits since they were written.

The cost claims are equally intact. Option B's "four edit sites" still prices correctly: an engine
`lib/` module is not enumerated by `MODULE_NAMES`, so B genuinely does not pay `run.test.js`,
`learningsPremises.test.js`, `prepack.mjs` or `fixture-machine.mjs`, and `pdlc/engine/package.json`
still declares no `c8` block and no coverage dependency, which is what makes B's and C's "no coverage
gate" column true rather than rhetorical. Option A's ten remain the ten.

## Consequences

**For the PLAN implementer, nothing changes.** The K-1…K-9 obligations table, the site table, the
three `DEC-STATS-*` verdicts and every falsifier cell are byte-identical to the set I approved at v8.
K-3's rejoined row still parses as six pipe-delimited fields with its `Owner` and `Falsified by`
cells populated, so the red test per obligation is still readable where PLAN reads it. The two
conjuncts K-3 names remain correctly split into one live oracle (P9-02's `expect(include).toEqual([…])`,
which reds at HEAD the moment `package.json` moves without the test literal) and one new one (the
c8-run driver importing `lib/stats.mjs`, plus `json-summary` naming it — the only conjunct that
catches a declared-but-unresolving glob under `allow-external`).

**For upstream, one erratum is still owed and is now the only one.** TSPEC §2.1's
`coverageInstrumentation.test.js` row (`TSPEC:236`) still describes P9-02's title as moving *six →
seven*. Re-measured at HEAD: `REQUIRED_INCLUDES` holds four, `CAPTURE_SCRIPT_INCLUDE` one and the two
`lib/` modules two, so the shipped literal is seven today and this feature moves it to **eight**; the
shipped *title* is stale at six, so the title moves *six → eight* while the count it describes moves
*seven → eight*. TSPEC v1.6's changelog reproduces the same "(six → seven)" phrasing at `TSPEC:96`,
so the erratum survived the round rather than being repaired by it. DECISIONS carries the correct
arithmetic in K-3 and records the divergence instead of matching it — still the right call, still
un-actionable from this document. Routed below as an `ERRATUM: TSPEC` line.

**For the next DECISIONS touch, one freshness item.** The v1.6 changelog's grounding attestation
(*"Upstream re-grounded first and did not move: TSPEC HEAD is v1.4 … FSPEC HEAD is v1.5 … REQ HEAD
(v1.4) matches its pin"*) was true when written and is false of HEAD, where the three are v1.6, v1.7
and v1.6. I have done the absorption check this round and the answer is *nothing owed* — but the
attestation is the artifact a later round reads to decide whether re-grounding is needed, and TSPEC
v1.6's own changelog documents exactly this failure mode one document upstream (*"Citing a current
hash is not the same check as diffing it against the previously grounded one"*). Recorded as F-01,
Medium, non-gating: the fix is a one-line re-grounding note whenever DECISIONS next opens, not a
round of its own.

**No consequence for oracles, types or counts.** Nothing in this round moves a falsifier, a test
level, a coverage claim or a co-change total.

## Positive Observations

- The document survived three upstream revisions without a byte changing, and it survived them
  *because* of how it was written: it cites REQ and FSPEC by spec id and section, not by line, so
  REQ's +38/−23 and FSPEC's +26/−9 could not invalidate a single citation. The only line anchors it
  uses are the ones where position **is** the measurement — the eight grep hits — and all eight still
  resolve.
- The probe-invariance table is the piece that earned its keep this round. It is what let me catch
  my own v8 F-02 as a measurement error rather than propagating a false erratum to TSPEC: the
  document had already stated that 25 and 24 are the same ten reached by different probes, and
  re-running both queries confirmed it.
- Refusing to match TSPEC's known-wrong "six → seven" remains correct after another upstream round
  in which TSPEC could have fixed it and did not. Two documents agreeing on a mis-sized task is the
  failure this refusal prevents, and the divergence is still recorded where PLAN will read it.
- K-1's four-way partition of the ten sites still covers site 10 without overlap, and the tenth
  site's "pinned by no oracle" cell is still stated in three places. A green suite will not remind
  anyone about `pdlc/README.md:231`; the document does, three times.
