# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.12)
**Date:** 2026-08-20
**Iteration:** 3 (delta confirmation, erratum round)
**Upstream at dispatch:** REQ v1.16 (`sha256:f97f4f66…`), FSPEC v1.7 (`sha256:d602c440…`)
**Delta reviewed:** `efeb798e..0f2a9710`

## Scope

This is a delta confirmation, not a re-review. I read the erratum diff
(`efeb798e..0f2a9710`, nine commits opening at `861abf63`), then re-read the upstream this TSPEC
now leans on **at HEAD** — REQ v1.16 and FSPEC v1.7 — and asked one question: does the delta land
the routed items without breaking what earlier rounds approved, and is the result still a faithful
compression of upstream as upstream currently reads (DEC-ERR-03)?

The seven routed items all land, and I verified each against the shipped tree rather than against
the item list:

| Routed item | Verified at HEAD | Verdict |
|---|---|---|
| Retired `dist/orchestrate-dev.bundle.js` runtime premise (§1.2, §3.4 envelope example) | `build-runtime.mjs` emits exactly `pdlc-cli.mjs`; `pdlc/workflows/dist/` holds only that file; `prepack.mjs`'s `MODULE_NAMES` is `["orchestrate-dev.js", "orchestrate-queue.js"]`, vendored verbatim | **Landed.** §1.2 now names both channels correctly and §3.4's example refuses `pdlc-cli.mjs`, not a bundle |
| §1.1 O-8 "one further `commitPaths` call" | `orchestrate-dev.js:15471` — `for (const promo of waveResolvedPromotions)`, fed by `groupPromotedPaths` (`:3329`, `:15403`) | **Landed.** O-8 and §3.6 both now read *per promoted task*, and the `{taskId}` coherence argument is the right one |
| DEC-A6-03 halt-message obligation unlanded at v1.15 | REQ v1.16 AC-6.3 second conjunct (`:533-536`); FSPEC v1.7 BR-14 (`:249`), Step 10 (`:130`), E-34 (`:312`) | **Inverted by HEAD, correctly absorbed.** The obligation landed upstream; §2.5 and §4.5 stop routing it and name a mechanism. Restating it as routed would have been DEC-ERR-01's anti-pattern, and the document says so |
| §1.2 `.claude/workflows/` sync premise | Same as row 1 | **Landed** |
| §2.5 mechanism block `git add -A --` | Shipped call is `["add", "-A"]` (`orchestrate-dev.js:12580`) | **Landed.** The stray `--` is gone; block, prose, O-1 and OQ-5 now agree |
| §5.1 `advisory-config-example.test.js` red-reason | `.claude/pdlc.config.example.json` carries `"advisory":{"enabled":false,"waveBudgetPerRun":1}` | **Landed.** The stated reason is correctly retracted as falsified |
| §5.1 `advisoryQueueSeams.test.js` red-reason | `ADVISORY_SEAMS = ["A1"…"A6"]` (`:1952`); `ADVISORY_SEAM_PHASES` carries `A6: {id:"I", outcome:"halted"}` (`:3813-3820`) | **Landed** |

Necessary, not sufficient. Measured against upstream at HEAD the document is *nearly* a faithful
compression, and three things are not: the round designed a new operator-facing contract without
giving it an oracle (F-01), it left the lineage header pinned to the upstream it explicitly says it
moved off (F-02), and one cell of the table it re-measured is wrong in the direction that hides
remaining work (F-03).

## Design

**The absorbed obligation is the right call, and it is absorbed at the right altitude.** My v2 F-01
was a High: REQ v1.16's second AC-6.3 conjunct had no carrier anywhere in this TSPEC, and §2.5
delivered the hazard as design prose for an engineering reader rather than as a contract on the halt
report's content. That is now closed. FSPEC BR-14 at HEAD binds the halt *report* — "the **same
report, in the same place**, states that re-running this feature overwrites that capture" — and
explicitly reserves the capture's name, storage form and lifetime to O-1, which is this document.
§4.5's `snapshotRef` field is exactly the seam that split implies: upstream owns the observable
(co-location, presence of the overwrite statement), TSPEC owns the mechanism that renders it. The
document does not re-open the product question and does not invent a product observable one level
up. Both of my v2 High-adjacent concerns — the missing carrier and the foreclosed reason-string
route — are resolved by the same edit.

**The §2.5 rewrite is honest about what changed and what did not.** The run-scoped-overwrite hazard
is unchanged; what changed is who tells the operator. The old text ended "an operator who wants a
snapshot to survive the next run should copy the ref before re-running" — operator lore, owned by
nobody. It now ends "the remedy the halt report hands the operator is to copy the ref before
re-running", which is a promise with a carrier behind it. The bounded-cost argument (an overwritten
ref costs inspectability, never content) is untouched and still correct.

**No approved decision is reopened.** DEC-A6-02's rejected option A still stands as rejected in the
restated O-8 row; the per-promoted-task shape is a *description* of the shipped loop, not a new
choice, so §3.6's "routed to DECISIONS, not settled in this paragraph" paragraph correctly survives
with only its arithmetic updated ("a third commit" → "its own commit beside the wave's per-task
ones"). The wave-scoped ref name, the accepted overwrite cost and the capture-failure disposition
are all where round 4 and round 5 left them.

**Where the re-grounding stopped short.** The round's changelog opens by asserting a DEC-ERR-03
re-grounding: "REQ (`sha256:f97f4f66…`) and FSPEC (`sha256:d602c440…`) have both moved since v1.11's
anchors." The lineage row at the top of the document still reads `FSPEC … v1.6, over REQ … v1.15`.
Those are the versions v1.11 re-grounded on — and v1.11's own changelog says "the Upstream row names
both", so the convention this document follows is that the row tracks the re-grounding. HEAD is
FSPEC v1.7 / REQ v1.16. The body is grounded on the new bytes; the header advertises the old ones,
which is the one line a downstream reader (PLAN, PROPERTIES, the next reviewer) checks to learn
which upstream this compression is measured against. That is F-02.

The many inline pins of the form "FSPEC BR-9 at v1.6" and "REQ AC-5.1 at v1.14" are **not** findings:
those cite the version at which a clause was *decided*, the clauses are byte-unchanged at HEAD
(FSPEC v1.7's changelog says "Nothing else changed"), and provenance pinning is a legitimate style.
Only the lineage row makes a claim about what this document compresses.

## Seams

Three interface surfaces moved in this delta. All three are HEAD-faithful.

**The runtime-artifact seam (§1.2).** The old text justified "everything lands in
`orchestrate-dev.js`" on a bundling premise that no longer exists. The replacement grounds the same
conclusion on two real channels — `build-runtime.mjs` emitting only `pdlc-cli.mjs`, and
`prepack.mjs` vendoring `MODULE_NAMES` verbatim into `@kaneho/pdlc-engine` — and draws the correct
product consequence: "Both channels therefore carry whatever this file says and nothing else has to
be kept in sync by hand." I verified `MODULE_NAMES` (`prepack.mjs:20`) and the contents of
`pdlc/workflows/dist/`. The single-module placement argument, which several downstream sections
lean on, is now resting on load-bearing ground instead of a retired artifact.

**The promotion-commit seam (§1.1 O-8, §3.6).** `groupPromotedPaths(waves, waveIndex, repairPaths)`
returns rows; the wave loop iterates them and issues one `commitPaths` per row. The restated O-8 row
names the loop, names its source rows, and gives the coherence argument — the `message` template
carries a single `{taskId}` slot, which only reads under a per-task call. §3.6's prose matches. The
row and the section no longer disagree, which was the point of the v1.10 fix and is preserved here.

**The envelope-example seam (§3.4).** The trailing-slash lesson is unchanged; only its worked example
is re-grounded, from a refused `orchestrate-dev.bundle.js` to a refused `pdlc-cli.mjs`, described as
"the one artifact `build-runtime.mjs` emits at HEAD". The pedagogical point — a slash-less manifest
row refuses silently — is intact, and the example is now one an operator could actually hit.

## Data Model

`haltFields` gains a fifth member: `snapshotRef: string | null`. The shape change is propagated
consistently — the `runWaveGateSeam` return type (§3.2), §4.5's carrier row, §4.5's capture-failure
literal table (`null`, with the reason given: this *is* the capture-failure path, and `null` is what
suppresses the warning under E-34's arm), and §4.5's un-skip `fields` row. I checked for a fourth
site the edit might have missed and found none; every place the four-field object was enumerated now
enumerates five.

Two modelling choices are worth endorsing explicitly, because they are the ones that make the
upstream observable mechanically checkable rather than editorial:

- **`null` rather than an absent key.** This matches the existing `repairPaths: []` reasoning
  already in §4.5 ("the field is present so the halt report's shape is the same on every A6-touched
  halt"), and it gives E-34's negative arm a *value* to assert rather than an absence to prove.
- **A field rather than prose folded into `diagnosis`.** §4.5's "Why a field and not a prose string"
  row gets this right for the right reason: AC-6.3's diagnosis conjunct compares `diagnosis`
  literally, while BR-14's oracle asserts co-location and the presence of the overwrite statement,
  never the ref's name. Folding them would couple two assertions upstream deliberately keeps apart.
  This is also what dissolves my v2 F-02 — with the second conjunct carried in `fields`, §4.5's
  claim that "the diagnosis travels in `fields`, never in the reason string, which is what lets
  AT-05-3's literal comparison and AC-6.3 both hold" is now true of *both* conjuncts, where at v1.11
  it was true of only one.

Naming the ref in the rendered report is TSPEC's prerogative, not a divergence: BR-14 says the
*oracle* never asserts the name because the name is O-1's, and O-1 is this document.

## Verification

This is where the round is incomplete, and where both of my remaining substantive findings sit.

**The new contract has no oracle (F-01, High).** FSPEC v1.7 did not only add BR-14 — it extended the
test surface with it. FSPEC `:474-478`: AT-06-4 now has **three** conjuncts, the third being "points
the operator at a captured pre-A6 tree state, and states there that re-running this feature
overwrites that capture", with "the oracle asserts co-location and the presence of the overwrite
statement". FSPEC `:479-483` adds **AT-06-4b**, the no-capture companion (E-34's arm: class and
diagnosis, no pointer, no warning). §5.6's AT-06-4 row still reads, in full: "halt report following
an escalation carries the root-cause class (§4.5's halt fields)". There is no AT-06-4b row anywhere
in §5.6, and no row in §5.1's file table attributes the new assertions to a test file.

This is not a nit about a missing table row. §5.6 is this document's AT→test-file map, and the
document's own established convention is that it follows upstream's AT set: when FSPEC v1.4 split
AT-04-1 into conjunct-scoped runs, v1.10's changelog records "§5.6 gains AT-04-1a … AT-04-1b", and
those rows are there. The convention was not applied this round. The product consequence is concrete:
`snapshotRef` is now a designed operator-facing contract with two arms specified to the literal —
and nothing in the feature's test set would go red if either arm were dropped in implementation. The
round landed the mechanism half of the routed obligation and left the proof half unlanded. PLAN
mints red-test tasks from §5.6; a row that does not exist mints no task.

The fix is bounded and mechanical: restate §5.6's AT-06-4 row on FSPEC v1.7's three conjuncts, add
an AT-06-4b row for the no-capture arm (`snapshotRef === null` ⇒ no pointer and no warning, which
§4.5's capture-failure literal table already specifies), and check whether §5.1's
`advisoryWaveGate.test.js` row needs the new assertions named. My v2 F-04 flagged the shape of this
gap as Low when the obligation was still upstream-pending; now that the obligation has landed and
the mechanism is designed, the unfalsifiability is the gap, and it is High.

**One re-measured cell is wrong, in the direction that hides work (F-03, Medium).** §1.3's residue
column was re-measured this round and every cell but one now reads "**none**". The exception is the
"Per-seam report rows" row, which still asserts that `advisoryRecord.test.js`'s
`rows.map((r) => r.seam)` equality "**still reads `["A1" … "A5"]`**" and calls it "the one test-side
literal not yet transcribed — unchanged by the v1.12 re-measurement, which moved production surfaces
only". At HEAD that literal reads `["A1", "A2", "A3", "A4", "A5", "A6"]`
(`pdlc/workflows/__tests__/advisoryRecord.test.js:496`); a second site at `:505` compares against
`[...devModule.ADVISORY_SEAMS]` and is drift-proof by construction. The row's own re-measurement
disclaimer is what makes this a finding rather than staleness: the round states it checked this cell
and left the old value.

The consequence is the mirror of the two red-reason caveats this round correctly retracted. Those
told a reader that work was outstanding when it was not; this one does the same, in the one table a
PLAN author reads to decide whether §1.3's transcription batches still have residue. On the corrected
measurement §1.3's residue column is empty across the board, which is a materially different input to
"whether the early-landed edits are reverted or PLAN's batches are re-derived around them" — the very
question §1.3 leaves to PLAN.

**Everything else in §5.1 and §5.6 verified clean.** Both retracted red-reasons are correct: the
config example carries `"advisory":{"enabled":false,"waveBudgetPerRun":1}` — matching §4.4's stated
defaults — and `ADVISORY_SEAMS` is six members, so `advisoryQueueSeams.test.js`'s `toHaveLength(6)`
has its production counterpart. The `ADVISORY_SEAM_PHASES` sixth row is `{ id: "I", outcome:
"halted" }`, exactly as §1.3 now states. The gate-exclusivity row's revised residue — A6's behaviour
exposed through the optional `seamOps.classifyReply` member rather than an `if (seam === "A6")`
branch — is a more precise statement than the cell it replaces, not a weaker one.

## Obligations

<!-- pending -->

## Delta-Confirmation Findings

<!-- pending -->

## Verdict

<!-- pending -->
