# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.13)
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review)
**Upstream at HEAD:** REQ v1.16 (`REQ-pdlc-advisory-wave-gate.md:18`), FSPEC v1.7 (`FSPEC-pdlc-advisory-wave-gate.md:12`)
**Delta reviewed:** `0f2a9710..033cd093` (one commit, 49 lines changed)

## Scope

This is a delta re-review, not a fresh read. My v3 was a delta confirmation on the v1.12 erratum
round; it closed **Needs revision** on one High (F-01, the `snapshotRef` mechanism landed without an
oracle), two Medium (F-02 lineage row, F-03 §1.3 residue cell) and two Low inherited (F-04 OQ-2,
F-05 OQ-7). The round under review is a single commit — `033cd093`, "v1.13 completion pass" — that
touches 49 lines across the lineage header, the changelog, §1.3's residue table, §4.5's carrier
table, §5.1's file manifest, §5.6's preamble and AT rows, and §6's OQ-2 / OQ-7 dispositions.

I verified each prior finding against the tree rather than against the round's own prose, then read
only the changed sections for new issues. Sections I approved in earlier rounds and this delta did
not touch are not re-litigated here.

## Prior findings — disposition

All five are resolved. Each was checked against the repository, not against the changelog's claim
that it was checked.

| Prior | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| v3 F-01 | High | **Resolved** | §5.6's AT-06-4 row is restated on FSPEC v1.7's three conjuncts and a companion **AT-06-4b** row is added (TSPEC `:1823`, `:1824`); §5.1's `advisoryWaveGate.test.js` row names both ATs (`:1437`). The upstream they compress reads as the rows say: FSPEC `:474-478` carries the three conjuncts and "the oracle asserts co-location and the presence of the overwrite statement, never the capture's name", FSPEC `:479-483` carries AT-06-4b's no-capture arm. The AT ids in §5.6 are **set-equal** to FSPEC §6's — 48 on both sides, `diff` empty — so AT-06-4b's arrival did not silently drop a row elsewhere. (One residual gap sits *inside* the new AT-06-4 row; see F-01 below. The row exists, which is what my v3 finding demanded; what it asserts over is the new problem.) |
| v3 F-02 | Medium | **Resolved** | The `Upstream` cell now reads FSPEC v1.7 / REQ v1.16 with the two hashes (TSPEC `:5`). Verified at HEAD: FSPEC version cell is `1.7` (`FSPEC-pdlc-advisory-wave-gate.md:12`), REQ is `1.16` (`REQ-pdlc-advisory-wave-gate.md:18`). |
| v3 F-03 | Medium | **Resolved** | §1.3's "Per-seam report rows" residue is now `none`, and the re-measurement is transcribed rather than inferred. Verified: `pdlc/workflows/__tests__/advisoryRecord.test.js:496` reads `expect(rows.map((r) => r.seam)).toEqual(["A1", "A2", "A3", "A4", "A5", "A6"])`, and `:505` reads `expect(rows.map((r) => r.seam)).toEqual([...devModule.ADVISORY_SEAMS])`. Both line pins are exact. The cell also names *why* v1.12 got it wrong ("that round's scope covered production constants only"), which is the honest form of a retraction. |
| v3 F-04 | Low | **Resolved** | OQ-2 now separates the landed half from the open half: BR-14 / AC-6.3 have landed and the report carries the warning unconditionally; only the **ref-naming** remedy stays contingent (TSPEC `:1849`). That is exactly the split §2.5 points at. |
| v3 F-05 | Low | **Resolved** | OQ-7 now pins both revisions: AC-5.1's observation point at **v1.14**, AC-6.2's escalation-log append entering the excluded-carrier list at **v1.15** (TSPEC `:1854`). Verified against REQ's own changelog: `REQ-pdlc-advisory-wave-gate.md:29` — "AC-5.1's excluded-carrier list adds AC-6.2's escalation-log append (TE F-01, High)" under the v1.15 entry. |

Nothing I approved in v1.12 was broken by this delta: §2.5's hazard text, §4.5's five-member
`haltFields` shape, §3.6's per-promoted-task commit loop and §3.4's envelope example are byte-
unchanged in `0f2a9710..033cd093`.

## What the delta changed

Six edits, all bounded, none reopening a decision:

1. **Lineage + changelog** — the `Upstream` cell re-grounded, a v1.13 entry that answers TE Q-01
   before touching §5 and states what it is closing.
2. **§1.3 residue table** — the last non-`none` cell re-measured; the residue column is now empty
   across all eight rows, which is what the surrounding prose ("the table below was written as
   future work and is no longer that", `:369`) has claimed since v1.12. The routing sentence to
   PLAN survives, correctly: whether the early-landed edits are reverted or PLAN's batches are
   re-derived is still open, and emptying the residue does not settle it.
3. **§4.5's Snapshot-ref carrier row** — gains a pointer to §2.5's next-run-overwrite correction so
   the implementer reading the field contract finds the warning's trigger (TE F-03). Faithful:
   §2.5 `:599-608` is where that trigger is stated.
4. **§5.1's manifest row** — `advisoryWaveGate.test.js` now names both arms. The `new` status on
   that row is not a finding: the Status-column caveat (`:1449-1457`) already says `new` means
   required end state and explicitly records that the file is on disk — and it is
   (`pdlc/workflows/__tests__/advisoryWaveGate.test.js`, 3645 lines, tracked).
5. **§5.6 preamble arithmetic** — forty-seven ATs becomes forty-eight. Verified: FSPEC §6 carries
   48 distinct AT ids at v1.7. The companion claim that "A6-15 alone covers nineteen in
   `advisoryWaveGate.test.js`" is also still true at HEAD — PLAN `:331`'s former-A6-15 step
   enumerates exactly nineteen `Covers` ids.
6. **§6 OQ-2 / OQ-7 dispositions** — the two Low inherited items, closed as described above.

The one design judgement in the round is TE Q-01's answer: conjunct (3)'s oracle is
presence-plus-co-location, never a verbatim sentence pin, because FSPEC declines to fix the
capture's name (O-1). That is the right call and it is the right altitude — inventing a sentence at
TSPEC altitude would be a new product decision, not an absorption. My remaining High is not with
that judgement; it is with the surface the oracle is stated over.

## New findings in changed sections

### The co-location oracle names a carrier this design does not have (F-01, High)

The new AT-06-4 row (`:1823`) states conjunct (3)'s oracle as:

> **co-location within one rendered report string** — the ref pointer and the overwrite sentence
> found in the *same* `haltError` report text, not merely both present somewhere in the run

There is no such string — not in this TSPEC's own carrier design, and not at HEAD.

**What the design says the carriers are.** §2.3 pins the halt call shape verbatim (`:496`):
`if (!a6.resolved) throw haltError(TEST_GATE_MESSAGE, { advisory: a6.haltFields });` — the message
is the pre-A6 template literal, and §2.3 `:503-507` makes the separation load-bearing: "The
diagnosis travels as `haltError`'s second argument (`fields`…), **never inside the reason string** —
that is how AC-6.3 and AT-05-3 hold at once." §4.5 `:1405` repeats it for the un-skip halt
("Message string | unchanged … never in the reason string"). §5.6 `:1817` pins AT-05-3's oracle as
"halt reason string **equals** the pre-A6 literal" — an equality, not a containment, so anything
appended to the message reddens it. And the v1.13 changelog itself confirms "no overwrite sentence
is transcribed into §5.5's halt literals" (`:24-25`).

**What HEAD has.** `haltError(message, fields)` `Object.assign`s the fields onto the Error
(`pdlc/workflows/orchestrate-dev.js:4539-4546`). The pipeline then sets
`haltReason = err.message` (`:15966`) and carries the fields as **structured data**:
`haltAdvisory: err && err.advisory ? err.advisory : undefined` (`:16076`), spread onto the report
object by `buildFinalReport` (`:16169`, `:16248`). `buildFinalReport` returns a plain object; there
is no report-to-text renderer anywhere in `pdlc/workflows` (`grep` for `render*Report` /
`format*Report` over `orchestrate-dev.js` and `orchestrate-queue.js` returns nothing), and the
shipped assertions treat it as data — `expect(result.haltAdvisory).toEqual(haltFields)`
(`pdlc/workflows/__tests__/waveExecution.test.js:1094`).

**So neither reading closes.** If "the rendered report text" means `haltReason`, the ref pointer and
the sentence would have to live in the message — which AT-05-3's equality oracle forbids and §2.3
and §4.5 both explicitly rule out. If it means `haltAdvisory`, there is no text at all: `snapshotRef`
is pinned to the bare ref name `refs/pdlc/a6-snapshot-{waveNum}` (`:1382`), "adjacent" has no meaning
over a JS object, and AT-06-4 forbids asserting on the ref's name anyway. §4.5's "What the report
renders" row (`:1383`) states the obligation — "both halves together and adjacent" — but names no
function, no field and no file that does the rendering, and §1.2's "no new module, no new file, no
new transport" (`:360-362`) forecloses inventing one silently.

This is the same class of defect my v3 F-01 raised, one level in: that round the mechanism had no
oracle; this round the oracle has no mechanism to bind to. An implementer reading §4.5 and §5.6
today cannot tell where to emit the sentence, and PLAN cannot mint a red test that would fail for
the right reason — a test author would have to pick a carrier, and either choice contradicts a
different section of this document.

The fix is bounded and entirely TSPEC-local; it does not touch upstream, because FSPEC correctly
states the product observable ("the same report, in the same place", `FSPEC:476-478`) and leaves the
mechanism here. §4.5 needs one more row naming the carrier — which report field or notice string
holds the rendered pair, produced by which named function — and AT-06-4's conjunct-(3) oracle needs
restating over that named surface, with one sentence on how AT-05-3's message equality survives it.

### `§4.5's four fields` is stale in three places the delta now leans on (F-02, Medium)

§4.5's capture-failure table enumerates **five** fields — `rootCause`, `diagnosis`,
`repairApplied`, `repairPaths`, `snapshotRef` (`:1363-1369`) — but three prose sites still say
four: `:302` ("§4.5 gives the capture-failure halt's four fields literal, transcribable values"),
`:1357` (the bullet heading immediately above the five-row table), and `:1530` (§5.2's fixture: "a
halt on AT-05-3's literal with §4.5's **four** fields attached at their literal values").

Inherited from v1.12 — but the delta makes `:1530` load-bearing: the new AT-06-4b row (`:1824`)
cites "§5.2's existing E-34 capture-failure fixture (`snapshotRef: null`, §4.5's literal field
values)" as the whole basis for the negative arm. A fixture whose own section says it attaches four
fields is the wrong fixture for asserting the fifth field's `null` value, and if that fixture's
oracle is a set-equality over the field set — which §5.6 `:1820` requires elsewhere for exactly this
reason — the two sections contradict each other outright. One edit fixes all three counts.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | §5.6's new AT-06-4 row states conjunct (3)'s oracle as "co-location within one rendered report string … the same `haltError` report text", but no such string exists in this design or at HEAD. §2.3 (`:496`, `:503-507`) pins the halt message to `TEST_GATE_MESSAGE` and puts everything else in `fields`, "never inside the reason string"; §5.6 `:1817` makes AT-05-3 a message **equality**; §4.5 `:1405` repeats the separation. At HEAD `haltReason = err.message` (`orchestrate-dev.js:15966`) and `haltAdvisory` is structured data (`:16076`, `:16248` via `buildFinalReport`), with no report-to-text renderer in `pdlc/workflows`. §4.5 `:1383` states "the report renders both halves together and adjacent" but names no function, field or file, and §1.2 `:360-362` forbids a new module/file. Fix: name the rendering carrier in §4.5 (which field or notice, produced by which named function), restate AT-06-4's conjunct-(3) oracle over it, and say in one sentence how AT-05-3's message equality survives. | AC-6.3 (REQ v1.16), BR-14 / AT-06-4 (FSPEC v1.7 `:474-478`) |
| F-02 | Medium | Local | "§4.5's **four** fields" survives at `:302`, `:1357` and `:1530` while §4.5's table enumerates five (`:1363-1369`, `snapshotRef` added at v1.12). The delta makes `:1530` load-bearing: the new AT-06-4b row (`:1824`) rests the whole negative arm on §5.2's capture-failure fixture "at §4.5's literal field values", and that fixture's own section says four. Fix: four → five at all three sites. | AC-6.3, FSPEC E-34 / AT-06-4b (`FSPEC:479-483`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-06-4b is homed in `advisoryWaveGate.test.js` by §5.1 and §5.6, but PLAN at HEAD has no home for it — `PLAN:527` lists AT-06-4 alone, and the former-A6-15 step's `Covers` list (`PLAN:331`) enumerates nineteen ids ending at AT-06-4/AT-07-1. §5.6's own discharge rule is **set-equality over AT ids**, so PLAN is now one id short of set-equal. This is PLAN's obligation, not TSPEC's, and I raise it as a question rather than a finding — but the round that lands F-01's carrier is the natural moment to flag it downstream so Phase P is not the one to discover it. |
| Q-02 | Does the run-level `advisory` summary (`orchestrate-dev.js:16070`, `advisorySummaryRows`) or the halt-only `haltAdvisory` own the rendered pair once F-01's carrier is named? Both ride the same report object, and §4.5 `:1387-1389` is explicit that the advisory **record** carries no such warning — worth one sentence so an implementer does not put it on the summary channel, where a run that halted without A6 touching it would still be a candidate carrier. |

## Positive Observations

## Recommendation

## Verdict
