---
feature: pdlc-stats
---

# DECISIONS — pdlc-stats

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` (`docs/pdlc-stats/REQ-pdlc-stats.md`, `docs/pdlc-stats/FSPEC-pdlc-stats.md`, `docs/pdlc-stats/TSPEC-pdlc-stats.md`) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-DECISIONS[-v{N}].md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 1.3 | 2026-08-31 |

**v1.3 (cross-review round 3).** Replaces the per-file reading of the co-change set with a **mechanical
sweep**, cited so the next reader can tell completeness was established by a command rather than by
another file turning up: the sweep finds three sites the six-row table missed —
`pdlc/workflows/__tests__/coverageInstrumentation.test.js` (already an obligation under K-3 and
already named in the re-evaluation trigger, but absent from the table, which is why the table's six
rows and the trigger's seven files disagreed), `pdlc/engine/__tests__/run.test.js`, and
`pdlc/workflows/__tests__/learningsPremises.test.js`. Option A's measured cost moves six → **nine**
sites; the trigger's count moves eleven lists across seven files → **fifteen across nine**; K-9 is
added to own the two newly-found tests; K-3 is split into its live-site half and its new-conjunct
half (TE Q-01); K-8's headline count is corrected six → seven, its re-baselining is extended so the
importability conjunct keeps proving all three `lib/` members rather than only this feature's, and it
gains the provenance-comment and message-string edits; DEC-STATS-02's re-evaluation trigger is
restated in *fields* rather than *hoists*. It also **corrects a cost claim made in review rather than
inheriting it**: options B and C do *not* pay `run.test.js` or `learningsPremises.test.js`, because
both fence `MODULE_NAMES`, which B and C never move — see *What the sweep found*.

**v1.2 (cross-review round 2).** Adds the sixth co-change site —
`pdlc/engine/__tests__/loop-distribution.test.js`, the completed sibling's live enforcement of this
exact co-change class — to DEC-STATS-01's cost table with its six assertions named, moves option A's
cost from five edit sites to six (the verdict is unchanged: B pays the same site and still measures
no coverage), gives the site an owning obligation (K-8) carrying the re-baselining shape and the
word-map edit K-7's `five → six` prose depends on, names it in K-1 as the conjunct that reds first,
corrects the third residual — which asserted an absence of an oracle that exists at HEAD — to the
narrower gap that is genuinely unguarded, corrects the re-evaluation trigger's list count from six to
eleven, restates K-3's `c8.include` conjunct as array-equality rather than set-equality, softens
K-7's 0.15 precedent claim to what that changelog row actually records, and answers PM Q-02 in
DEC-STATS-02.

**v1.1 (cross-review round 1).** Corrects Option D's evidence sentence against HEAD; makes the
sibling-feature amendment an owned obligation (K-7) rather than a claim this file discharges alone;
re-states K-1/K-3/K-4's falsifiers to name the oracles that actually assert them and records the
three residuals that remain; fixes the re-evaluation triggers' threshold and detectors.

Records the three load-bearing alternatives TSPEC §8.4 routes here: module placement,
`schemaVersion`'s home, and how the driver's parsers reach the new module. Each is stated once here
and cited by reference downstream; no downstream document restates the text.

## Context

Three choices in `TSPEC-pdlc-stats.md` are not derivable from the requirement they serve: each had a
defensible alternative that a later reader would otherwise re-open. `pdlc stats` is a small,
read-only reporting command (REQ G-4), so the code it adds is modest; what is not modest is the
co-change surface one of these choices buys, and the way another binds a published JSON contract
(REQ R-5) to a module-internal type. All three are recorded here so the reasoning survives the
review artifacts that carried it.

### Why placement is a decision and not a detail (DEC-STATS-01)

REQ C-5 requires that every artifact classification `pdlc stats` makes be the classification the
pipeline driver already makes over the same bytes. The four classifiers it needs are shipped exports
of `pdlc/workflows/orchestrate-dev.js` — `parseResolvedMarker`, `parseReviewFilename`,
`deriveRoundWindow`, `deriveDodRoundIndex`, all `export function` declarations in that file. So the
new module's correctness is a question about its relationship to a file in `pdlc/workflows/`, which
argues for co-location; but `pdlc/workflows/lib/` members that the shipped CLI can reach at runtime
are vendored into the published engine at pack time, and that vendored member list is transcribed at
several independent sites. Co-location is therefore not free, and the price is paid in a *completed
sibling feature's* frozen enumerations: `pdlc/engine/__tests__/_tspec-packed-set.mjs` states in its
own header comment that its `WORKFLOW_MEMBERS` list is co-changed with
`docs/completed/pdlc-engine-distribution/`'s TSPEC §5.4 `PK-*` table and FSPEC §5.2's per-class
counts, "never this file alone".

That coupling is the repo-wide pattern `docs/completed/pdlc-engineering-loop/LEARNINGS-pdlc-engineering-loop.md`
records — a completed feature's approved enumerations are live coupling, not a closed record — and
`docs/completed/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md` records the opposite decision
(DEC-LOOPECON-08) taken under a REQ that forbade touching `pdlc/engine/`. This REQ carries no such
non-goal, so the trade is open here and has to be decided rather than inherited.

### Why `schemaVersion`'s home is a decision (DEC-STATS-02)

REQ-STATS-02 requires the JSON document's top-level key set to be set-equal to the printed metric
set plus one schema-version field, and REQ R-5 rests a consumer-stability guarantee on that field
existing. FSPEC turns this into BR-21/BR-23/BR-24/BR-30's exact key sets, and TSPEC §6.3 pins them
with a cross-mode oracle that derives both modes' metric sets from one `StatsReport`. `schemaVersion`
is the one field that must appear in JSON and must *not* appear in the human table, so wherever it is
stored decides whether that oracle is clean or carries a standing exception.

### Why the parser seam is a decision (DEC-STATS-03)

TSPEC §2.5 injects the four classifiers as a `StatsParsers` bundle rather than importing
`orchestrate-dev.js` from `lib/stats.mjs`. Injection is what makes the `ok: false` branches reachable
in a unit test and keeps an 816 KB module (`pdlc/workflows/orchestrate-dev.js`, 816.5 KB at HEAD) out
of the unit path — but injection is also exactly the capability that lets a green suite hide a
production divergence from REQ C-5, which is the constraint the whole design exists to satisfy.
`docs/_decisions/DECISIONS-seam-defaults.md` (DEC-SEAM-01) already governs the shape of an injected
seam's default and its paired guard; this decision records which *kind* of guard discharges C-5.

## Options Considered

Every cost below was measured against the tree at HEAD, not estimated.

### DEC-STATS-01 — where the pure metric logic lives

| Option | Location | Enumeration co-change (verified) | Coverage gate (verified) |
|---|---|---|---|
| **A (chosen)** | `pdlc/workflows/lib/stats.mjs`, thin `cmdStats` in `pdlc/engine/bin/cli.mjs` | **nine** edit sites (sweep-derived, see below); vendored class 5 → 6 | in `pdlc/workflows/package.json`'s `c8.include`, subject to `test:coverage`'s second `--per-file --branches 85` pass — **contingent on K-3's two conjuncts**: c8 opens only what `include` matches (`all` is not set), so an unincluded module produces no per-file entry and the second stage has nothing to check |
| B | `pdlc/engine/lib/stats.mjs` | **three** edit sites: engine `lib/*.mjs` class 15 → 16 (`LIB_MODULES_AT_HEAD` 12 + `LIB_MODULES_FROM_THIS_FEATURE` 3), the same `tspecPackedCount` amendment, and `loop-distribution.test.js` — whose `4 + 15 + 5 + 1` arithmetic pins the engine `lib/` class as `15` in the same expression, so B moves that literal too. B does **not** pay A's `MODULE_NAMES`-fencing sites (`run.test.js`, `learningsPremises.test.js`, `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`) or either `c8.include` site: an engine `lib/` module is not vendored from `pdlc/workflows/` and is measured by nothing | **none** — `pdlc/engine/package.json`'s only test script is `node __tests__/_run-suite.mjs`; the package declares no `c8` block and no coverage dependency at all |
| C | inline in `pdlc/engine/bin/cli.mjs` | none | **none**, same reason as B |
| D | `pdlc/workflows/lib/stats.mjs`, **not vendored** | none | same as A |

**Option A's nine sites**, each confirmed at HEAD to contain the member list it is claimed to contain.
Four *hold* the enumerations; five *pin* them from two other packages, which is why a per-file scan of
the holders reaches none of the five (see *What the sweep found*):

| Site | Symbol | Members at HEAD |
|---|---|---|
| `pdlc/engine/scripts/prepack.mjs` | `MODULE_NAMES` | `orchestrate-dev.js`, `orchestrate-queue.js`, `lib/loop-session.mjs`, `lib/escalation-view.mjs` |
| `pdlc/engine/scripts/publish-preflight.mjs` | `WORKFLOW_MEMBERS` | the same four, `vendor/workflows/`-prefixed, plus `VENDOR-MANIFEST.json` |
| `pdlc/engine/scripts/fixture-machine.mjs` | `WORKFLOW_MODULE_NAMES` | the same four |
| `pdlc/engine/__tests__/_tspec-packed-set.mjs` | `WORKFLOW_MEMBERS` and `tspecPackedCount` | the five; `tspecPackedCount` returns `4 + 15 + 5 + 1 + (licence ? 1 : 0)` |
| `pdlc/workflows/package.json` | `c8.include` | seven `**/`-anchored entries, including both existing `lib/*.mjs` members |
| `pdlc/engine/__tests__/loop-distribution.test.js` | `D1_BASELINE`, `D2_D3_BASELINE`, `D5_BASELINE`, `NEW_LIB_MEMBERS_BARE`, `NEW_LIB_MEMBERS_VENDORED`, and two count assertions | five transcribed member lists plus the vendored-class count; **six assertions** pin the four enumerations above with strict-length equality and pin the count K-2 moves |
| `pdlc/workflows/__tests__/coverageInstrumentation.test.js` | P9-02's expected include literal (`REQUIRED_INCLUDES` + `CAPTURE_SCRIPT_INCLUDE` + the two `lib/` modules) | mirrors `c8.include`'s seven entries; asserted `expect(include).toEqual([…])`, so it reds in both directions and is position-sensitive. Its test title also names the count (*"exactly the six modules the feature owns"*) |
| `pdlc/engine/__tests__/run.test.js` | two `assert.deepEqual` manifest name lists plus the `scratchWorkflows` copy list | the same bare four, transcribed three times. The first `deepEqual`'s own comment states the intent as *"a prepack that … vendored a third file, must still fail this assertion"*, so a fifth member reds it by design; the copy list left at four makes the real `runPrepack` miss `lib/stats.mjs` and reds the process-entry leg's `assert.equal(result.status, 0, …)` |
| `pdlc/workflows/__tests__/learningsPremises.test.js` | P-1's `expect(names).toEqual([…])` over the `MODULE_NAMES` array it parses out of `prepack.mjs`'s **source text** | the same bare four; the test's title pins the count too (*"exactly the four canonical workflow modules"*) |

**What the sweep found, and why two rounds of per-file reading kept missing sites.** The first
measurement scanned the files that *hold* the enumerations and found five; round 2 added
`loop-distribution.test.js` by hand and made it six. That is the wrong instrument: the assertions that
pin an enumeration's membership and size live in *other packages* than the enumeration, so no scan of
the holders reaches them. The set is derivable mechanically instead, in one command —

    grep -rln "escalation-view" pdlc/engine/__tests__/ pdlc/workflows/__tests__/

— fifteen files at HEAD, of which the ones that **transcribe a member list** (rather than importing a
module, which is what the other ten do) are: `_tspec-packed-set.mjs` and `loop-distribution.test.js`,
already in the table, plus three that were not — `coverageInstrumentation.test.js`,
`run.test.js` and `learningsPremises.test.js`. `loop-cli.test.js` is the one hit that survives the
grep but fails the predicate: its five references are `path.join(…, "lib", "loop-session.mjs")` import
paths and comments, never a list. So the co-change set is **nine sites**, and the number is now
reproducible rather than accumulated.

Two of the three were already visible in this document and simply not in the table.
`coverageInstrumentation.test.js` is named in K-3 as an obligation and in the re-evaluation trigger's
list — which is exactly why the trigger counted *seven files* while the table showed six rows: the
document was counting two different sets. It is site 7 because it is the pinning half of a pair
(`pdlc/workflows/package.json` plus the test that array-equals its contents), both owned by K-3. The
genuinely new ones are `run.test.js` and `learningsPremises.test.js`, both of which fence
`prepack.mjs`'s `MODULE_NAMES` — the first by `deepEqual` over `runPrepack`'s manifest twice and by
copying the four members into a scratch tree, the second by parsing `MODULE_NAMES` out of the prepack
*source* and asserting array-equality against a four-name literal. All three are live: no `.skip`
anywhere in `run.test.js` (27 top-level `test(` calls) and P-1 runs in the workflows jest suite.

**Corrected cost claim: options B and C do not pay the two new sites.** The review that surfaced
`run.test.js` reasoned that every option adding a vendored module pays it. Measured at HEAD, that is
true of A only: `run.test.js` and `learningsPremises.test.js` both fence `MODULE_NAMES`, and B puts
the module in `pdlc/engine/lib/`, which `MODULE_NAMES` does not enumerate — nothing copies it into the
vendor tree, so both files stay green. What B does pay is `_tspec-packed-set.mjs`'s `15` term and the
same literal inside `loop-distribution.test.js`'s `4 + 15 + 5 + 1`. The corrected comparison is nine
sites (A) against three (B) — a wider gap than the previous record showed, and still not enough to
move the verdict, because those three sites buy **no coverage gate**, which is the disqualifier.
C pays none of them and puts the whole feature outside every gate; D is still a broken A.

**The durable lesson, and where it goes (PM Q-01).** *An enumeration's co-change set includes every
assertion that pins the enumeration's membership or size, wherever it lives; derive that set with a
query, never by reading the files that hold the enumeration.* This is the second consecutive round in
which a per-file reading missed a fencing test, so the rule is promoted to
`docs/_constraints/DOMAIN-CONSTRAINTS.md` **in this feature**, as part of K-9's owning task, rather
than at harvest: a constraint that arrives at harvest does not protect this feature's own PLAN, which
is where the next miss would cost something.

This raises option A's measured cost from six sites to nine. It does not move the verdict, for the
reason the corrected comparison gives above.

**B rejected.** It pays a co-change of the same order — `_tspec-packed-set.mjs`'s count conjunct has
to move either way, since `tspecPackedCount` sums the `lib` class and the vendored class in one
expression — and buys nothing back: the engine package measures no coverage, so the new module's
branch coverage would be unenforced. It also still has to load the vendored driver across the
`resolveWorkflowRoot()` seam, so the C-5 relationship is no closer.

**C rejected.** `pdlc/engine/bin/cli.mjs` is 57.0 KB at HEAD and is in no coverage include set;
adding a few hundred lines of pure computation to it puts the feature's entire correctness surface
outside every gate the repo has.

**D rejected — and it is the option worth naming, because a `pdlc/workflows/lib/` member can in fact
skip the vendoring co-change.** `pdlc/workflows/lib/document-oracles.mjs` is such a member, and the
measured state at HEAD is stronger than the first draft of this paragraph claimed: it appears in
none of the four vendoring enumerations **and in no coverage include set either** — `c8.include` is
the seven `**/`-anchored entries listed in the site table above, and `document-oracles.mjs` is not
among them. (The completed sibling that added the other two `lib/` members records the same state:
`docs/completed/pdlc-engineering-loop/`'s PLAN file-state table says `lib/document-oracles.mjs` is
**not** in the include list.) The reason it can skip both is that its only importer is a test
(`pdlc/workflows/__tests__/documentOracles.test.js`) — it is never reached by a shipped code path.

The two axes are separate and separately forgettable, and lining them up is the point of the
example: **runtime reachability decides vendoring**, while **membership in `c8.include` is an
independent edit that nothing derives**. `document-oracles.mjs` is therefore a precedent for
skipping *neither* obligation on a runtime-reachable module — a `lib/` member outside every gate is
what D actually produces, which sharpens the rejection rather than softening it.
`lib/stats.mjs` is reached by `pdlc stats` on an installed engine, where `resolveWorkflowRoot()`
resolves to the vendor tree; unvendored, the command would work in a checkout and fail only for
installed users. D is therefore not a cheaper A, it is a broken A, and the asymmetry with
`document-oracles.mjs` is explained by runtime reachability, not by precedent for skipping.

### DEC-STATS-02 — where `schemaVersion` lives

| Option | Shape | Consequence for TSPEC §6.3's cross-mode oracle |
|---|---|---|
| **A (chosen)** | a `renderJson` obligation; module constant `SCHEMA_VERSION`, hoisted identically into all three documents | oracle stays exception-free: every key it compares across modes is a metric |
| B | a field on `StatsReport` | the human renderer reads a value carrying a JSON-only key; the oracle needs a permanent per-key exception, and BR-21's set-equality would have to be restated as set-equality-minus-one |
| C | a field on `FeatureStats` | worse than B: it would also appear per fleet entry, contradicting BR-23's "BR-21's document minus its hoisted `schemaVersion`" |

### DEC-STATS-03 — how the driver's classifiers reach `computeFeatureStats`

| Option | Mechanism | Why it does or does not discharge REQ C-5 |
|---|---|---|
| **A (chosen)** | injected `StatsParsers` bundle + an identity oracle asserting `===` against `orchestrate-dev.js`'s exports at the single production construction site | identity cannot be satisfied by a re-implementation at all, so C-5 holds for every input, not just tested ones |
| B | direct static `import` in `lib/stats.mjs` | discharges C-5 structurally, but forces every unit test to evaluate an 816.5 KB module and leaves `deriveRoundWindow`'s `ok: false` branch reachable only by constructing a colliding-filename fixture |
| C | injection + behavioral-equivalence tests over a corpus | passes for a re-implementation that agrees on today's corpus; C-5 is about agreement on *all* bytes, so this is the one option that cannot enforce it |

## Decision

### DEC-STATS-01: The pure metric logic lives in `pdlc/workflows/lib/stats.mjs`; the operator surface is a `stats` case in `pdlc/engine/bin/cli.mjs`

**Decision.** Option A. `computeFeatureStats`, `discoverFeatures`, `parseStatsArgv`, `runStats` and
both renderers land in a new `pdlc/workflows/lib/stats.mjs`. `pdlc/engine/bin/cli.mjs` gains a
`cmdStats` that builds the four `StatsIo` seams and the `StatsParsers` bundle, reaching the new
module through the same `resolveWorkflowRoot()`-then-dynamic-`import()` arrangement its existing
`loopSessionModule()` and `escalationViewModule()` helpers use. `resolveWorkflowRoot()` itself is
unchanged: it probes for `orchestrate-dev.js` and `orchestrate-queue.js` to pick a root, and
`lib/stats.mjs` loads from whichever root that returns.

**Constraint that forced the shape.** Two, pulling the same way. REQ C-5 makes agreement with
`orchestrate-dev.js`'s classifiers *the* correctness property, so the consumer should be versioned,
vendored and tested as one unit with the producer. And the only per-file branch floor in the repo is
the second stage of `pdlc/workflows/package.json`'s `test:coverage`
(`--per-file --branches 85`), which exists precisely so a small module cannot hide inside
`orchestrate-dev.js`'s aggregate; a new module of a few hundred lines wants that gate.

**Carve-out against a completed sibling feature — the reasoning is stated once, here; the edits are
owned by K-7.** Adding `vendor/workflows/lib/stats.mjs` to
`pdlc/engine/__tests__/_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`, and moving `tspecPackedCount`'s
vendored term from `5` to `6`, amends enumerations that `docs/completed/pdlc-engine-distribution/`
approved and froze (its TSPEC §5.4 `PK-*` table and FSPEC §5.2's per-class counts). This decision
does **not** override that helper's "never this file alone" co-change rule and does not leave the
sibling's documents to go stale: it complies with the rule, spec-first, by the route
`pdlc-engineering-loop` already used. That precedent is explicit in the sibling's own changelog —
its 0.15 row records a *"versioned co-change amendment by `pdlc-engineering-loop`"* that added
`PK-24` and `PK-25`, corrected the vendored-members note from three to five, moved the derived
total, and amended FSPEC §5.2's per-class count in the same change, while touching no other row,
class or oracle. This feature takes the same route one member further: `PK-26`
(`vendor/workflows/lib/stats.mjs`), the note from five to six, and FSPEC §5.2's "Workflow members"
count from five to six. **What this paragraph is the single site of is the carve-out's
justification, not its execution** — the two sibling-document edits are a `PLAN`-visible obligation
with an owning task, recorded as K-7 in the Consequences table, and the same table's K-1/K-2 own the
five in-repo enumeration sites, K-8 the test file that pins four of their sizes, and K-9 the two
`MODULE_NAMES`-fencing tests the sweep found. Downstream documents — PLAN, PROPERTIES, the implementation's tests — **cite `DEC-STATS-01` and do
not restate this text**: `pdlc-engineering-loop`'s LEARNINGS records verbatim restatement of one
clause across three documents as a defect generator, and a carve-out is exactly the clause shape
that attracts it. The growth path is precedented rather than novel: the same class already went from
three members to five when `lib/loop-session.mjs` and `lib/escalation-view.mjs` were added, recorded
as `PK-24`/`PK-25` in that helper's own comments.

**Reversibility: hard.** Undoing it means amending all nine sites — the five enumerations and the
four test files that pin their membership or size — and the sibling feature's frozen table a second
time. Not a one-way door — no data or published contract is committed — but
each reversal costs what the original cost.

**Re-evaluation triggers.**
- `pdlc/workflows/lib/` becomes a routinely-growing directory — a **fourth** runtime-reachable
  member added after `stats.mjs`. At HEAD the runtime-reachable members are `lib/loop-session.mjs`
  and `lib/escalation-view.mjs` (exactly the two `lib/` entries in `prepack.mjs`'s `MODULE_NAMES`),
  so `stats.mjs` is itself the third; the detector is `MODULE_NAMES.length` exceeding five. At that
  point the transcription stops being amortisable and the transcribed enumerations should be
  *derived* from a directory listing at pack time, with the packed-set test asserting the derived
  set rather than a literal. **Which enumerations are still literal transcriptions at HEAD, and
  therefore what this trigger would change:** `prepack.mjs`'s `MODULE_NAMES`,
  `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`, `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`,
  `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`, `pdlc/workflows/package.json`'s `c8.include`,
  `coverageInstrumentation.test.js`'s expected include literal, `loop-distribution.test.js`'s
  `NEW_LIB_MEMBERS_BARE`, `NEW_LIB_MEMBERS_VENDORED`, `D1_BASELINE`, `D2_D3_BASELINE` and
  `D5_BASELINE`, `run.test.js`'s two manifest `deepEqual` lists and its `scratchWorkflows` copy list,
  and `learningsPremises.test.js`'s P-1 literal: **fifteen hand-written lists across nine files**
  (twelve distinct member facts — `D1_BASELINE` and `D5_BASELINE` hold identical content, as do
  `run.test.js`'s three lists; the transcription cost is nonetheless paid per list, not per fact).
  This count and the site table are now derived from the same sweep, so they cannot disagree again.
  The five inside `loop-distribution.test.js` are
  transcriptions of the same membership facts as the first four, and their own comment says so —
  *"transcribed once, here … never derived from a directory listing"* — so they are precisely what a
  derive-at-pack-time change would stop transcribing — as are the four in `run.test.js` and
  `learningsPremises.test.js`, which transcribe `MODULE_NAMES`' contents a fourth, fifth and sixth
  time. Understating the count understates the payoff that decides whether anyone acts on this
  trigger, which is why it is now sweep-derived rather than hand-counted. K-1's
  "derived rather than transcribed" describes only TSPEC §6.4's *count* conjunct
  (`vendoredClassSize === MODULE_NAMES.length + 1`), which ties one transcribed number to its
  source; the member arrays themselves are all still literals.
- A future REQ forbids editing `pdlc/engine/`, as `pdlc-loop-economics`'s NG-3 did. Under that
  constraint option A is unavailable and DEC-LOOPECON-08's inverse trade applies instead.
- `pdlc/engine/package.json` gains a coverage gate with a per-file floor, which would remove option
  B's disqualifying asymmetry.

### DEC-STATS-02: `schemaVersion` is a `renderJson` obligation, not a field on `StatsReport` or `FeatureStats`

**Decision.** Option A. `SCHEMA_VERSION` is a module constant in `lib/stats.mjs`, and `renderJson`
hoists it identically into all three emitted documents (single success, fleet success, refusal).
Neither `StatsReport` nor `FeatureStats` carries it. `renderJson` stays a **projection** of
`StatsReport`, not a serialisation of it — the same reason `FeatureStats.feature` and
`FeatureStats.dir` exist for the human header and BR-02's live-before-archive preference yet reach
no document.

**Constraint that forced the shape.** BR-21's set-equality between the JSON top-level key set and
the printed metric set. A report-level `schemaVersion` breaks it in the human direction: the value
the human renderer reads would carry a key with no printed counterpart, and TSPEC §6.3's cross-mode
oracle would need a standing per-key exception — a permanent hole in the one check REQ-STATS-02's
guarantee rests on.

**All three hoists are inside the released contract (PM Q-02).** The refusal document's
`schemaVersion` is not an FSPEC-level convenience a later change could drop freely: FSPEC BR-30
states the error object is *"a released shape under REQ R-5"* whose key set is exactly
`schemaVersion`, `error`, `feature`, governed by BR-24's increment rule as the success document is.
So a change to the refusal shape is a contract break on the same terms, and K-5's "referenced only
inside `renderJson`" scope covers all three emitted documents, not the two success ones. Nothing in
this decision changes on the answer — the constant lives in the same place either way — but it
decides now what a future consumer would otherwise litigate after shipping.

**Reversibility: easy.** One constant and three hoists in one function.

**Re-evaluation trigger.** A second JSON-only **field** appears. Two such fields — not two hoist
sites — is where an explicitly named envelope type (`JsonEnvelope<T>`) becomes cheaper than repeating
the hoist, and the oracle can then be stated over the envelope's payload rather than over an exception
list. Today's shape is one field hoisted at three sites, so the trigger has **not** fired; the
reversibility line above counts sites, this one counts fields.

### DEC-STATS-03: The driver's four classifiers are injected as a bundle and pinned by an identity oracle

**Decision.** Option A. `computeFeatureStats` receives `parseReviewFilename`, `deriveRoundWindow`,
`deriveDodRoundIndex` and `parseResolvedMarker` in an injected `StatsParsers` bundle.
`statsParsers()` in `pdlc/engine/bin/cli.mjs` is the **single production construction site**, and one
test asserts that the functions it returns are `===`-identical to `orchestrate-dev.js`'s own
exports. Unit-test doubles default to the real parsers (so a test opts *out* of fidelity explicitly,
never into it by omission), consistent with `DECISIONS-seam-defaults.md` DEC-SEAM-01's rule that a
seam's default is chosen for what the consumer does with it.

**Constraint that forced the shape.** REQ C-5 is a claim about all inputs, not a corpus. Reference
identity is the only guard that is total over inputs while still leaving the seam injectable;
behavioral equivalence (option C) is a sample, and a sample cannot discharge a universal.

**Reversibility: easy.** Switching to a static import is a local change in `lib/stats.mjs` and
deletes the oracle rather than requiring a new one.

**Re-evaluation trigger, and its detector.** The driver exports gain state — a closure over
configuration, a cache, a module-level mutable. Sharing a function reference stops being sufficient
the moment two callers can observe each other through it, and the seam would need to share the
state, not the function.

The identity oracle is structurally blind to this trigger's arrival: adding a module-level cache
inside `deriveRoundWindow` changes no reference, so `===` stays true while the property it stands
for is gone — and the recording double of TSPEC §6.1 wraps the real parsers, so it inherits the
shared state rather than exposing it. The trigger therefore carries a **named detector**: a purity
conjunct on the four exports — call each classifier twice with the same input in a fresh module
instance and assert deep-equal, non-aliased results, so a cache or a mutable that makes call *n*
depend on call *n−1* goes red. That conjunct belongs with the identity oracle in TSPEC §6.4 and is
routed there as an erratum rather than being restated as a rule of this document (K-6). Until it
lands, the residual is explicit and is listed under Standing costs accepted: the trigger is
observable only by review of `orchestrate-dev.js`.

## Consequences

### Obligations these decisions create for PLAN and implementation

| # | Obligation | Owner | Falsified by |
|---|---|---|---|
| K-1 | The **six** co-change sites in DEC-STATS-01's table are edited in **one** change with `lib/stats.mjs` itself; a partial edit ships an engine whose `pdlc stats` fails only for installed users, since a checkout's `resolveWorkflowRoot()` finds the module regardless | PLAN task ordering; a single owning task per file, per the batch-safety rules | **What reds first is `pdlc/engine/__tests__/loop-distribution.test.js`, not TSPEC §6.4's oracle**: its `assertAdditiveOnly` length equality fires on the first of the four enumerations edited, and it ships at HEAD, where §6.4's oracle does not yet. Behind it: TSPEC §6.4's vendoring oracle over the same **four** enumeration sites — `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, plus the `vendoredClassSize === MODULE_NAMES.length + 1` conjunct that is derived rather than transcribed — plus the fixture machine's install leg on the packed tarball. The fifth site, `c8.include`, is **K-3's**; the sixth, `loop-distribution.test.js`, is **K-8's**. The three rows partition the six sites rather than overlapping |
| K-2 | `tspecPackedCount`'s vendored term moves `5` → `6` in the same change as `WORKFLOW_MEMBERS` — the count is deliberately derived from class sizes, not from `tspecPackedSet().length`, so it does not follow automatically | same task as the `_tspec-packed-set.mjs` edit | the packed-set tests in `pdlc/engine/__tests__/` |
| K-3 | `pdlc/workflows/package.json`'s `c8.include` gains a `**/`-anchored, path-qualified entry for `lib/stats.mjs`, **and** `coverageInstrumentation.test.js`'s expected include literal and its c8-run driver gain the same module. Bare basenames do not match under `allow-external`, which is already on | same task | Two conjuncts, both to be added in this change and routed to TSPEC §6.4 as a sixth anti-drift row. **Declared:** the P9-02 test in `coverageInstrumentation.test.js` asserts `c8.include` against a transcribed literal in both directions — so once `**/pdlc/workflows/lib/stats.mjs` is in that literal, omitting it from `package.json` is red (and vice versa). The shipped assertion is `expect(include).toEqual([…])`, **array-equality, so position-sensitive and strictly stronger than set-equality**: the new entry must be appended at the same index in `package.json` and in the test literal, or a diff that looks set-correct reds. **Resolved:** the P9-02 c8 run's driver imports `lib/stats.mjs` too and the `json-summary` must name it, which is the only way a declared-but-unresolving glob is caught (the `allow-external` bare-basename defect that run exists for). Without both, the omission is green everywhere and the chosen option silently degrades to the *no coverage gate* state the option table records as disqualifying for B and C |
| K-4 | `statsParsers()` remains the sole production construction of the bundle. A second construction site voids DEC-STATS-03's oracle without failing it | implementation | TSPEC §6.4's identity oracle covers the one site, and a **construction-site count** conjunct covers the rest: read `pdlc/engine/bin/cli.mjs`'s source and assert the four-classifier object literal occurs **exactly once**, inside `statsParsers` — set-equality over occurrences, not "at least one". Positive structural counts over a source file are a precedented mechanism here (`pdlc/engine/__tests__/bin-guard-structure.test.js` pins `bin/pdlc.mjs` with exactly this shape: zero static imports, exactly three top-level statements, zero `await` tokens). Routed to TSPEC §6.4 as an erratum; "review-blocking finding" is not the disposition, since a load-bearing claim on REQ C-5 with no detector has no expiry date |
| K-5 | `SCHEMA_VERSION` is referenced only inside `renderJson`. Any read of it from `computeFeatureStats` or `renderHuman` reintroduces the coupling DEC-STATS-02 rejected | implementation | TSPEC §6.3's cross-mode oracle |
| K-6 | Downstream documents cite `DEC-STATS-01` for the frozen-enumeration carve-out and do not restate its text | PLAN, PROPERTIES authors | review |
| K-7 | The two sibling-feature documents `DEC-STATS-01`'s carve-out amends are edited **in the same change** as `_tspec-packed-set.mjs`, spec-first and by the precedented versioned route: `docs/completed/pdlc-engine-distribution/TSPEC-…md` §5.4 gains `PK-26` (`vendor/workflows/lib/stats.mjs`, under the `files` entry `vendor/workflows/`), its vendored-members note moves five → six with the derived total following, and `FSPEC-…md` §5.2's "Workflow members" per-class count moves five → six — each with its own changelog row naming this feature, by the same versioned route that document's 0.15 row records `pdlc-engineering-loop` taking for `PK-24`/`PK-25` — **bundled more tightly than 0.15 was**, since that row explicitly split the helper literal out (*"`tspecPackedCount`'s vendored-class literal moves separately, in a later task"*) and this feature does not. No other `PK-*` row, class or oracle is touched. **The prose target is the word "six", and K-8 owns the matching word-map edit** that makes the oracle grep for it | PLAN: one owning task, the same task as the `_tspec-packed-set.mjs` edit | **`loop-distribution.test.js`'s `P7-02: docs/completed/pdlc-engine-distribution/ TSPEC §5.4, FSPEC §5.2 and AT-3.8b agree with `tspecPackedCount`'s vendored class size`** — it reads both sibling documents off disk and `assert.match`es their member-count sentences against the class size it derives from `tspecPackedCount` at test time, so a helper amended without the documents is red. It does **not** cover `PK-26`'s existence as a row; see the third residual |
| K-8 | `pdlc/engine/__tests__/loop-distribution.test.js` — the sixth co-change site — is amended in the same change as the four enumerations it fences, by **re-baselining rather than by widening the delta**: `D1_BASELINE`, `D2_D3_BASELINE` and `D5_BASELINE` absorb `pdlc-engineering-loop`'s two `lib/` members (they are that feature's *post*-state at HEAD), and `NEW_LIB_MEMBERS_BARE` / `NEW_LIB_MEMBERS_VENDORED` become this feature's single member (`lib/stats.mjs`, bare and `vendor/workflows/`-prefixed). Six assertion edits in all: the three baselines, the two `added` lists, `tspecPackedCount`'s `4 + 15 + 5 + 1` → `4 + 15 + 6 + 1`, and the derived `assert.equal(vendoredClassSize, 5, …)` → `6`. **Plus the word map K-7 depends on**: `vendoredClassSize === 5 ? "five" : String(vendoredClassSize)` becomes a number-word map (`5 → "five"`, `6 → "six"`), because at 6 the ternary greps for the digit while K-7 writes the word, and K-7 landed exactly as specified would leave this oracle red | PLAN: one owning task, sequenced with the `_tspec-packed-set.mjs` / K-7 task | The file is its own falsifier — `npm test` in `pdlc/engine`, i.e. the required `Engine tests (ubuntu-latest)` check |

### What these decisions do not decide

No observable behavior. Token spellings, key sets, exit codes, row order and edge-case outcomes are
fixed by FSPEC §4 and §5 and restated nowhere here. DEC-STATS-02 decides where a value is stored,
not what BR-24's increment rule is. DEC-STATS-01 decides a file path, not any metric's definition.

### Standing costs accepted

- **Co-change surface roughly the size of the feature's own logic.** One ~300-line module costs six
  edit sites — five enumerations plus the test file that pins four of their sizes — and an amendment
  to a completed feature's frozen table. Accepted because every
  alternative trades it for no coverage gate (B, C) or for a command that is broken on installed
  engines (D), and because the vendored class has already grown once by this exact route.
- **A second consumer of four driver exports.** `parseReviewFilename`, `deriveRoundWindow`,
  `deriveDodRoundIndex` and `parseResolvedMarker` acquire an out-of-driver caller. This adds no new
  obligation on them — they are already `export`ed, already called from `orchestrate-dev.js`'s own
  loops, and already covered — but a future change to any of their return shapes now has two call
  sites to reconcile, and DEC-STATS-03's identity oracle guarantees the second one cannot silently
  drift onto a stale copy instead.
- **Real-path test bindings to the live archive.** Grounding tests on `docs/completed/` means a
  future feature archiving or harvesting a directory turns them red for an unrelated reason — the
  `doc-moves-break-pinned-tests` pattern. Accepted because FSPEC §6 requires literal, non-derived
  expectations on real paths; the mitigation is that each literal is declared in its test as a
  *measurement of the archive*, re-measured when the archive changes, never path-rewritten.

### Residuals — obligations with no oracle at HEAD

Named here so PLAN and the DoD reviewer inherit them as known risks rather than discovering them.
Each is a claim these decisions rest on that nothing currently makes red; two have a routed fix and
one does not.

| Residual | Why it is not closed today | Disposition |
|---|---|---|
| **A second `StatsParsers` construction site** voids DEC-STATS-03's identity oracle without failing it (K-4). REQ C-5's enforcement would degrade to human vigilance at exactly the seam the decision exists to protect | TSPEC §6.4's identity oracle ranges over `statsParsers()` and the bundle `cmdStats` hands `runStats`; a construction elsewhere is outside both conjuncts | **Closed by erratum**: the construction-site count conjunct in K-4, routed to TSPEC §6.4. Open only until that row lands |
| **The driver exports gaining state** is invisible to every conjunct in the design — reference identity survives a cache, and the recording double inherits the shared state rather than exposing it | Reference identity is chosen because it is total over inputs; totality is what makes it blind to the guard's own precondition | **Closed by erratum**: the purity conjunct named in DEC-STATS-03's trigger, routed to TSPEC §6.4. Until it lands, the trigger is observable only by review of `orchestrate-dev.js` |
| **`PK-26`'s existence as a row in the sibling TSPEC §5.4 table (K-7)** has no mechanical falsifier. The count half **does**: `loop-distribution.test.js`'s P7-02 document-oracle reads both completed-feature documents off disk and matches their member-count sentences against the class size it derives from `tspecPackedCount` at test time (*"derived from the live constant, never compared against a literal transcribed here"*), so a helper amended without the documents is red. What that oracle greps is the two **sentences**, not the `PK-*` rows above them, so a counts-only edit that never adds the `PK-26` row is green | The oracle was built to close the count window (`pdlc-engineering-loop`'s PLAN records it as *"now closed by an oracle, not by argument"*); row-level structure was outside its brief | **Accepted, and narrower than the first draft of this row claimed** — that draft asserted the document half had no falsifier at all, which is false at HEAD and would have sent a DoD reviewer past the one guard that exists. What remains is one missing row, discharged by K-7's single owning task and by review. Note the coupling K-8 carries: the oracle greps the word the ternary derives, so K-7's prose and K-8's word map are one change or the check is red |

### Relationship to project-level decisions

Neither contradicted nor re-litigated: `DECISIONS-seam-defaults.md` (DEC-SEAM-01) governs the
`StatsIo` and `StatsParsers` defaults and DEC-STATS-03 applies it rather than restating it;
`DECISIONS-review-severity-bars.md` (DEC-DOC-01) is why every citation above names a stable symbol,
heading or exported name rather than a `file:line` anchor.
