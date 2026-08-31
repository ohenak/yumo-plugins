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
| Draft | se-author | 1.6 | 2026-08-31 |

**v1.6 (erratum round 7).** Targeted versioned edit; no restructuring, no re-litigation.
**Upstream re-grounded first and did not move:** TSPEC HEAD is v1.4 (`sha256:cb351bb3…`) and FSPEC
HEAD is v1.5 (`sha256:25af3c47…`) — the same revisions v1.5 absorbed. The dispatch's cited TSPEC
`sha256:512a9fcf…` again matches no revision of TSPEC on this branch, so re-grounding was done
against HEAD per `DEC-ERR-03`; this is the second round it has resolved to nothing, and it is a
workflow-side anchor defect, not a document defect. REQ HEAD (v1.4) matches its pin. No upstream
decision is owed absorption this round, so the raised items are the whole of the work.

One structural repair and two record corrections. (1) **K-3's row in *Obligations these decisions
create* was unterminated** — it ended after *"makes it **eight**"* with two delimiters where intact
rows carry five, and its `Owner` and `Falsified by` cells sat after an interleaved paragraph, so the
table terminated at K-3 and K-4 through K-9 rendered as literal text outside it. The row is rejoined
into a single five-delimiter line with the *Upstream divergence* paragraph inside its obligation
cell, where it was always meant to sit. K-3 now presents the falsifier column PLAN reads to place its
red test, and the six rows below it are rows again. No cell text changed. (2) **Both count breakdowns
now name the tenth site.** v1.5 moved the co-change count nine → ten but left the sweep-found
breakdown and `DEC-STATS-01`'s *Reversibility: hard* clause enumerating 5 + 4 — the five enumerations
and the four test files — with `pdlc/README.md`'s prose member list dropped from each. Both now list
all ten, agreeing with the site table, K-1's partition, K-9's ownership and *Standing costs accepted*.
(3) The **v1.4 changelog entry** gains a superseded-in-part marker: it asserted `pdlc/README.md` is
*not* a tenth site-table row, which v1.5 reversed. The entry is not rewritten and its `file:line`
forms stay — a changelog records the document at its own version, and `DEC-DOC-01` governs body
citations, which v1.5 already converted, not past entries.

One item is **carried unresolved by design**: TSPEC §2.1's `coverageInstrumentation.test.js` row
still describes P9-02's title as moving *six → seven*, where HEAD measures the include set at seven
already (`REQUIRED_INCLUDES` is four, so the literal is `4 + 1 + 2`) and this feature makes it eight.
Both reviewers agree the arithmetic here is correct and the repair belongs upstream in TSPEC. It is
**not** matched into agreement, and TSPEC is **not** edited from this dispatch: TSPEC is approved and
downstream of it sits an approved PLAN, so moving it here would create a downstream obligation nobody
was asked to discharge. The divergence stays recorded in K-3 and routed as an erratum owed upstream.
Verdicts, options, `DEC-STATS-01/02/03` and every behavioural claim are unchanged.

**v1.5 (erratum round 6 — upstream re-grounding).** Targeted versioned edit; no restructuring, no
re-litigation. **Upstream moved: TSPEC v1.2 → v1.4** (HEAD `sha256:cb351bb3…`; the dispatch's cited
`sha256:512a9fcf…` matches no revision of TSPEC on this branch, so re-grounding was done against HEAD
per DEC-ERR-03). REQ v1.4 and FSPEC v1.5 were re-read and carry no decision this document owes.

Two upstream decisions absorbed ahead of the raised items. (1) **TSPEC §2.1's co-change set is ten,
not nine** — `pdlc/README.md`'s prose member list is a row there. This document had argued it out of
the table on a falsifiers-only membership rule; that divergence is settled in upstream's favour and
the rule restated, because PLAN reads both tables and a set that is nine in one and ten in the other
partitions into K-rows that do not cover it. The README row carries "pinned by no oracle" in place of
a falsifier. (2) **TSPEC §6.4 split the classifier-purity conjunct on return type**, and the erratum
routing it there has landed: non-aliasing is scoped to the three object-returning classifiers, and
`deriveDodRoundIndex` (typed `=> number`) gets an A-B-A conjunct instead. As this document had it —
non-aliased results for all four — the named detector would have redded a correct, wholly pure
implementation. What A-B-A does and does not falsify is now stated: accumulating state reds, a memo
table does not, so the *Residuals* row is **narrowed rather than closed**.

Following from those: the site table gains its tenth row and the narrative counts move nine → ten
throughout; K-1's partition covers site 10 (K-9's); K-8's headline moves **seven → eight** assertion
edits, folding P7-02's `vendoredClassWord` ternary inside the total as TSPEC counts it rather than
holding it beside; K-9's promoted constraint now travels **with its pathspec**, and the 25-vs-24
candidate totals are reconciled as probe-variant routes to the same ten transcribers; the
re-evaluation trigger moves to **sixteen lists across ten files** and retracts v1.4's *"cannot
disagree again"* claim, which a shared sweep does not buy across two documents. K-3 re-measures
`c8.include` at HEAD (`REQUIRED_INCLUDES` is **four**, so the literal is seven and this feature makes
it eight) and records TSPEC §2.1's *"six → seven"* as an **erratum owed upstream**, keeping the
correct arithmetic here rather than matching a number known to be wrong.

Per `DEC-DOC-01`, `coverageInstrumentation.test.js:264` / `:261` and `pdlc/README.md:231` are replaced
by test-title, comment-text and section citations: a line anchor into a file this feature itself edits
is invalidated by that edit. Verdicts, options, `DEC-STATS-01/02/03` and every behavioural claim are
unchanged.

**v1.4 (cross-review round 4).** Fixes the sweep's **scope** and its **tool**, and the one cost claim
that depended on both. Scope: the sweep is restated over tracked sources (`git grep -l "escalation-view"
-- . ':!docs/' ':!*/dist/*'`, 25 files at HEAD) instead of over two `__tests__/` directories, because a
test-directory query structurally cannot see `publish-preflight.mjs:205-219`'s deliberate
production-side copy of the engine `lib/` class — which is why v1.3 listed that file among the sites
option **B does not pay** when B in fact pays it. B is re-priced **three → four** sites (TE F-01,
High); the verdict is untouched, since B's disqualifier is its absent coverage gate, not its site
count. Tool: `grep -rln` silently drops files containing NUL bytes (`loopProperties.test.js:370`,
`lib/escalation-view.mjs`), returning 23 where `git grep -l` returns 25 — recorded as a clause,
because a dropped *transcriber* would be the exact miss the sweep exists to end (PM F-02 / TE F-02).
The repo-scoped sweep also surfaces a tenth transcription, `pdlc/README.md:231`'s prose member list;
it is **not** a tenth site-table row — the table holds falsifiers and nothing pins that line — but the
edit is owed and is now owned by K-9 and recorded under *Standing costs accepted* (PM F-01 / TE F-03).
K-9's promoted constraint carries the query, its scope, its NUL caveat, its probe-choice rule (PM
Q-01) and `publish-preflight.mjs` as the worked example. K-3 gains K-8's message-string clause,
covering P9-02's stale title count and its stale *"three entries"* comment (PM F-03). K-9's falsifier
cell answers TE Q-02 on why K-3's single-check pair stays a separate task. Option A's nine sites, the
site table, K-1's partition and DEC-STATS-01/02/03 are unchanged. *(Superseded in part by v1.5, which
makes `pdlc/README.md` the tenth site-table row carrying "pinned by no oracle" in place of a
falsifier. This entry is left as written: a changelog records the state of the document at its own
version, and its `file:line` forms are historical record — mentions of what a past round measured,
not live pointers a reader is expected to follow. `DEC-DOC-01` governs citations in the document
body, which v1.5 converted; it does not ask past changelog entries to be rewritten, and rewriting
them is the bookkeeping churn that decision exists to prevent. PM F-03 / TE F-02, round 7.)*

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
| **A (chosen)** | `pdlc/workflows/lib/stats.mjs`, thin `cmdStats` in `pdlc/engine/bin/cli.mjs` | **ten** edit sites (sweep-derived, see below; nine falsified, one not); vendored class 5 → 6 | in `pdlc/workflows/package.json`'s `c8.include`, subject to `test:coverage`'s second `--per-file --branches 85` pass — **contingent on K-3's two conjuncts**: c8 opens only what `include` matches (`all` is not set), so an unincluded module produces no per-file entry and the second stage has nothing to check |
| B | `pdlc/engine/lib/stats.mjs` | **four** edit sites: `_tspec-packed-set.mjs`'s engine `lib/*.mjs` class 15 → 16 (`LIB_MODULES_AT_HEAD` 12 + `LIB_MODULES_FROM_THIS_FEATURE` 3) and the same file's `tspecPackedCount` term, `publish-preflight.mjs`'s **second, production-side copy of that same class** (`LIB_MODULES_AT_HEAD` 12 + `LIB_MODULES_FROM_THIS_FEATURE` 3 again, feeding `expectedPackedSet()`, which PF-4 compares to the packed file list in both directions at publish time), and `loop-distribution.test.js` — whose `4 + 15 + 5 + 1` arithmetic pins the engine `lib/` class as `15` in the same expression, so B moves that literal too. B does **not** pay A's `MODULE_NAMES`-fencing sites (`run.test.js`, `learningsPremises.test.js`, `prepack.mjs`, `fixture-machine.mjs`) or either `c8.include` site: an engine `lib/` module is not vendored from `pdlc/workflows/` and is measured by nothing. `publish-preflight.mjs` is on *both* bills — A moves its `WORKFLOW_MEMBERS`, B moves its `LIB_MODULES_*` pair | **none** — `pdlc/engine/package.json`'s only test script is `node __tests__/_run-suite.mjs`; the package declares no `c8` block and no coverage dependency at all |
| C | inline in `pdlc/engine/bin/cli.mjs` | none | **none**, same reason as B |
| D | `pdlc/workflows/lib/stats.mjs`, **not vendored** | none | same as A |

**Option A's ten sites**, each confirmed at HEAD to contain the member list it is claimed to contain.
Four *hold* the enumerations; five *pin* them from two other packages, which is why a per-file scan of
the holders reaches none of the five (see *What the sweep found*); the tenth transcribes the class in
prose and is pinned by nothing, which its own row says in place of a falsifier:

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
| `pdlc/README.md` (the `pdlc` CLI section's vendoring sentence) | prose enumeration — *"The four workflow modules it dispatches (…) are vendored into the package at pack time"* | the same bare four, plus a count word. **Pinned by no oracle**: `documentOracles.test.js` reads this file (for `workflows/dist/` and for the absence of seam-count prose) but never its member list, so this row is the one site where a partial edit stays green. Both the count word *four* → *five* and the member list move. Note the class mismatch this row makes visible: `MODULE_NAMES` is the **copied** class (4 → 5), where `_tspec-packed-set.mjs`'s vendored class is 5 → 6 — two counts one apart, never to be synchronised |

**What the sweep found, and why two rounds of per-file reading kept missing sites.** The first
measurement scanned the files that *hold* the enumerations and found five; round 2 added
`loop-distribution.test.js` by hand and made it six. That is the wrong instrument: the assertions that
pin an enumeration's membership and size live in *other packages* than the enumeration, so no scan of
the holders reaches them. The set is derivable mechanically instead, in one command — and the command is stated **over tracked
sources, not over `__tests__/`**, because the enumeration is mirrored in production code as well as in
tests (round 4 corrected both the scope and the tool; see the two notes below):

    git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'

— **25 files at HEAD**, of which the ones that **transcribe a member list** (rather than importing a
module, which is what the other fifteen do) are exactly the ten in the table above: the five
enumeration holders — `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`,
`_tspec-packed-set.mjs`, `pdlc/workflows/package.json` — the four test files that pin their
membership or size — `loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`
and `learningsPremises.test.js` — and `pdlc/README.md`'s prose member list, the one site the sweep
finds that no oracle pins. Three rounds of per-file reading found five, then six; this one command
finds all ten, and finds them without knowing in advance which package they live in.

Two hits survive the grep and fail the predicate. `loop-cli.test.js` has **six** references on six
lines — `:122`, `:637`, `:652`, `:681` for `loop-session.mjs` and `:827`, `:852` for
`escalation-view.mjs` (the pair that makes it a hit at all) — all of them `path.join(…)` /
`pathToFileURL(…)` import paths and comments, never a list. `pdlc/engine/bin/cli.mjs` (`:114`,
`:117`) is the same shape, a dynamic `import()` path. So the co-change set is **ten sites**, and the
number is now reproducible rather than accumulated.

**Note on scope — why not `__tests__/` (TE F-01).** The first form of this sweep read two test
directories, and a test-directory query structurally cannot see a production-side copy of an
enumeration. `publish-preflight.mjs` is the worked example: at `:205-219` it holds its own
`LIB_MODULES_AT_HEAD` (12) + `LIB_MODULES_FROM_THIS_FEATURE` (3), and its own comment at `:200-203`
says the duplication is deliberate — *"mirroring — not importing — `packaging.test.js`'s oracle: … a
deliberate second, production-side copy of the same TSPEC §5.4 table, run for real at publish time
rather than only in CI's test suite."* It is the copy that runs at publish time, so it is the one a
narrow query can least afford to miss; missing it is what mispriced option B by a site (see
*Corrected cost claim*). The rule K-9 promotes says *wherever it lives*; the query it ships beside
now says the same thing.

**Note on tool — `git grep -l`, not `grep -rln` (PM F-02, TE F-02).** The two forms disagree, silently.
`grep` classifies a file containing NUL bytes as binary and drops it from an `-l` listing;
`pdlc/workflows/__tests__/loopProperties.test.js:370` contains two (`` `${n.code}\0${n.subject}\0${n.text}` ``,
a deliberate field separator), as does `pdlc/workflows/lib/escalation-view.mjs`. Repo-scoped,
`git grep -l` returns 25 and `grep -rln` returns 23; over the earlier two test directories they
returned 15 and 14. Both dropped files are importers here, so the ten-site set survives either way —
but the omission is unannounced, and a dropped *transcriber* would have been the exact miss this
sweep exists to end. Use `git grep -l` (or `grep -ral`), and state the divergence wherever the rule is
copied.

**Note on the probe (PM Q-01).** `escalation-view` works as a probe only because every enumeration in
this class currently contains that member. An enumeration listing only `orchestrate-dev.js` and
`orchestrate-queue.js` would survive the grep unseen. The predicate belongs in the promoted rule:
*grep a member that appears in every enumeration of the class, and re-pick the probe when the class
changes.*

**The tenth site, pinned by no oracle (PM F-01, TE F-01/F-03; re-grounded on TSPEC v1.4).** The
repo-scoped sweep also returns `pdlc/README.md`, whose `pdlc` CLI section states the class in prose —
*"The four workflow modules it dispatches (`orchestrate-dev.js`, `orchestrate-queue.js`,
`lib/loop-session.mjs`, `lib/escalation-view.mjs`) are vendored into the package at pack time"*. Under
option A that sentence's count **and** its member list go stale on this feature's commit.

Through v1.4 this document held that line *outside* the table on the ground that the table admits only
falsifiers, while TSPEC §2.1 carried it as the tenth row. That divergence is settled here in TSPEC's
favour, and the reason is not deference: **PLAN reads both documents**, and a co-change set that is
nine in one and ten in the other partitions into K-rows that do not cover it. The table's membership
rule is therefore restated — it enumerates every site that *transcribes* the class, and a row whose
membership nothing pins says so **in place of** naming a falsifier. A table of falsifiers silently
drops exactly the obligations most likely to be forgotten, which is the defect this row exists to
name.

So the co-change set is **ten sites**. The edit is owed under K-9, and the absence of a falsifier is
recorded twice more: in the site table's own falsifier cell and under *Standing costs accepted*.
`documentOracles.test.js` does read `pdlc/README.md`, but pins `workflows/dist/` and the absence of
seam-count prose — never the member list.

**Why ten is probe-invariant, and why the two candidate totals differ (TE F-04).** This document's
query and TSPEC §2.1's reach the same ten by different routes, and neither total reproduces the
other's:

| Sweep | Candidates at HEAD | Consumers dropped | Transcribers |
|---|---|---|---|
| `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` (this document) | 25 | 15 | **10** |
| `git grep -l "lib/loop-session.mjs" -- . ':!docs/'` (TSPEC §2.1) | 24 | 14 | **10** |

The totals differ for two independent reasons: `escalation-view` matches two files
`lib/loop-session.mjs` does not, and TSPEC's form admits the generated
`pdlc/workflows/dist/pdlc-cli.mjs` as a candidate it then filters as a consumer, where this document's
`':!*/dist/*'` excludes it before the predicate runs. Both are defensible; what is *not* defensible is
citing one total under the other's query, so K-9 promotes the query **with its scope**, and the
arithmetic `24 − 14` is TSPEC's to reproduce, not this document's. The conclusion each reaches — ten
transcribers, the same ten — is what PLAN consumes, and it survives the choice of probe.

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
vendor tree, so both files stay green. What B does pay is `_tspec-packed-set.mjs`'s `15` term, its
`tspecPackedCount` amendment, the same `15` literal inside `loop-distribution.test.js`'s
`4 + 15 + 5 + 1`, **and `publish-preflight.mjs`'s second, production-side copy of the engine `lib/`
class** — the last of which this document itself got wrong in v1.3, listing that file among the sites
B does not pay. It is on both bills for different constants: A moves its `WORKFLOW_MEMBERS`, B moves
its `LIB_MODULES_AT_HEAD` / `LIB_MODULES_FROM_THIS_FEATURE` pair, which `expectedPackedSet()` feeds to
PF-4's both-directions equality against the packed tarball. A B that edited only `_tspec-packed-set.mjs`
would ship a tarball holding a member `expectedPackedSet()` does not name, and PF-4 would red at
publish time rather than in CI. The v1.3 miss is instructive rather than incidental: the sweep that
produced the number was scoped to two `__tests__/` directories, so no run of it could have surfaced a
production script — which is why the scope, not just the number, is corrected above.

The corrected comparison is ten sites (A) against **four** (B) — still a wide gap, and still not
enough to move the verdict, because those four sites buy **no coverage gate**, which is the
disqualifier. The verdict was never carried by the site count.
C pays none of them and puts the whole feature outside every gate; D is still a broken A.

**The durable lesson, and where it goes (PM Q-01).** *An enumeration's co-change set includes every
assertion that pins the enumeration's membership or size, wherever it lives — including production
code that mirrors the enumeration deliberately. Derive that set with a query over tracked sources
(`git grep -l`, not `grep -rln`), never by reading the files that hold the enumeration, and never
scoped to a test directory.* This is the second consecutive round in
which a per-file reading missed a fencing test, so the rule is promoted to
`docs/_constraints/DOMAIN-CONSTRAINTS.md` **in this feature**, as part of K-9's owning task, rather
than at harvest: a constraint that arrives at harvest does not protect this feature's own PLAN, which
is where the next miss would cost something.

This raises option A's measured cost from six sites to ten. It does not move the verdict, for the
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

**Reversibility: hard.** Undoing it means amending all ten sites — the five enumerations, the
four test files that pin their membership or size, and `pdlc/README.md`'s prose member list — and
the sibling feature's frozen table a second time. Not a one-way door — no data or published
contract is committed — but each reversal costs what the original cost.

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
  `learningsPremises.test.js`'s P-1 literal, and `pdlc/README.md`'s prose member list: **sixteen
  hand-written lists across ten files** (thirteen distinct member facts — `D1_BASELINE` and
  `D5_BASELINE` hold identical content, as do `run.test.js`'s three lists; the transcription cost is
  nonetheless paid per list, not per fact).

  This count and the site table are derived from the same sweep and move together. Note that v1.4
  asserted they *"cannot disagree again"*, and they promptly did — not with each other, but with
  TSPEC §2.1, which had already moved to ten. The guarantee a shared sweep buys is internal
  consistency within one document; it does not bind two documents, and the mechanism that actually
  catches that drift is the erratum round, not the query.
  The five inside `loop-distribution.test.js` are
  transcriptions of the same membership facts as the first four, and their own comment says so —
  *"transcribed once, here … never derived from a directory listing"* — so they are precisely what a
  derive-at-pack-time change would stop transcribing — as are the four in `run.test.js` and
  `learningsPremises.test.js`, which transcribe `MODULE_NAMES`' contents four further times. Understating the count understates the payoff that decides whether anyone acts on this
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
shared state rather than exposing it. The trigger therefore carries a **named detector**, and the
erratum routing it to TSPEC §6.4 **has landed**: §6.4 at TSPEC v1.4 carries the conjunct, so this is
a settled shape, not an outstanding request.

**The detector is split on return type, and this document follows §6.4 rather than restating it
(K-6).** Through v1.4 this document specified one shape for all four exports — twice-called in a fresh
module instance, results `deepEqual` **and non-aliased**. That is right for the three
**object-returning** classifiers (`parseReviewFilename`, `deriveRoundWindow`, `parseResolvedMarker`),
where a memoised return is distinguishable from a recomputed one by reference. It is **wrong for
`deriveDodRoundIndex`**, which is typed `=> number`: two equal numbers are `===`, so a non-aliasing
assertion over it reds against a *correct, wholly pure* implementation. Specified as this document
had it, the named detector would have failed the implementation it exists to protect.

§6.4's repair is the one to adopt — and note it is a repair, not a deletion, because deleting the
conjunct would have removed `DEC-STATS-03`'s only mechanical detector. `deriveDodRoundIndex` gets an
**A-B-A** conjunct in the same fresh instance: call on input *A*, then on a different input *B* whose
correct answer differs, then on *A* again, asserting the third result equals the first.

**What A-B-A does and does not falsify, stated rather than overclaimed.** A memo table is invisible
to it — a correct memo returns the right number. What it *does* catch are the state shapes the trigger
actually names for a round-index derivation: an accumulating high-water mark, a ledger carrying the
previous call's maximum forward, or any `let` retained across calls, each of which makes the third
result differ from the first. That is the falsifiable half available for a primitive return. The
consequence for this document is a **narrower residual, not a closed one**: the memo-shaped half of
the trigger remains undetected on `deriveDodRoundIndex` and stays under *Standing costs accepted* and
*Residuals*, observable only by review of `orchestrate-dev.js`.

The fresh instance matters for both shapes: a module-level cache populated by an earlier test in the
same worker would make the first call itself a cache hit and both conjuncts would pass vacuously.

## Consequences

### Obligations these decisions create for PLAN and implementation

| # | Obligation | Owner | Falsified by |
|---|---|---|---|
| K-1 | The **ten** co-change sites in DEC-STATS-01's table — sweep-derived, not hand-counted — are edited in **one** change with `lib/stats.mjs` itself; a partial edit ships an engine whose `pdlc stats` fails only for installed users, since a checkout's `resolveWorkflowRoot()` finds the module regardless | PLAN task ordering; a single owning task per file, per the batch-safety rules | **What reds first is `pdlc/engine/__tests__/loop-distribution.test.js`, not TSPEC §6.4's oracle**: its `assertAdditiveOnly` length equality fires on the first of the four enumerations edited, and it ships at HEAD, where §6.4's oracle does not yet. Behind it: TSPEC §6.4's vendoring oracle over the same **four** enumeration sites — `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, plus the `vendoredClassSize === MODULE_NAMES.length + 1` conjunct that is derived rather than transcribed — plus the fixture machine's install leg on the packed tarball. Editing `MODULE_NAMES` in particular reds three further files in the same commit — `run.test.js`'s two manifest `deepEqual`s and its process-entry `ENOENT`, and `learningsPremises.test.js`'s P-1 array-equality over the parsed constant. Sites 5 and 7, `c8.include` and `coverageInstrumentation.test.js`, are **K-3's**; site 6, `loop-distribution.test.js`, is **K-8's**; sites 8, 9 and 10 — `run.test.js`, `learningsPremises.test.js` and `pdlc/README.md` — are **K-9's**. The four rows partition the ten sites rather than overlapping. Site 10 is the one with no falsifier, so it is the one a green suite will not remind anyone about |
| K-2 | `tspecPackedCount`'s vendored term moves `5` → `6` in the same change as `WORKFLOW_MEMBERS` — the count is deliberately derived from class sizes, not from `tspecPackedSet().length`, so it does not follow automatically | same task as the `_tspec-packed-set.mjs` edit | the packed-set tests in `pdlc/engine/__tests__/` |
| K-3 | `pdlc/workflows/package.json`'s `c8.include` gains a `**/`-anchored, path-qualified entry for `lib/stats.mjs`, **and** `coverageInstrumentation.test.js` — site 7, the pinning half of the pair — gains the same module in its expected include literal. Bare basenames do not match under `allow-external`, which is already on. **Provenance and message strings move with the values, as in K-8.** In `coverageInstrumentation.test.js`, P9-02's test title names a count — *"P9-02: the include set is exactly the six modules the feature owns, no more and no fewer"* — and the comment immediately above it describes the literal as *"REQUIRED_INCLUDES' three entries, CAPTURE_SCRIPT_INCLUDE, and the two `lib/` modules"*. (Both are cited by their own text rather than by line number, per `DEC-DOC-01`: a line anchor into a file this feature edits is invalidated by the edit itself.) Both strings are **already wrong at HEAD**, and the arithmetic is re-measured here rather than carried forward: `REQUIRED_INCLUDES` holds **four** entries — `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs` and `scripts/check-wave-resume-delta-coverage.mjs`, the last added by a CODE_REVIEW finding after the comment was written — so the literal is `4 + 1 + 2` = **seven**, and `pdlc/workflows/package.json`'s `c8.include` is seven at HEAD to match. This feature makes it **eight**. **Upstream divergence resolved in TSPEC v1.7 — no longer owed (retires TE F-05, PM F-01).** Through v1.6 this row routed an erratum upstream: TSPEC §2.1's row for this site described P9-02's title count as moving *six → seven*, reading the stale printed title as if it were the true HEAD state. TSPEC v1.7 repaired that row onto the measurement this document already carried — the set is seven at HEAD, so the feature moves the title *seven → eight* — and neutralised the superseded *six → seven* narration in its own v1.3 changelog row. The two documents now state the same move, nothing is routed upstream from here, and the arithmetic in this row is unchanged; only the disagreement bookkeeping is retired. An implementer who follows this row literally lands a passing test whose title misstates its own assertion by two, so the title's count word and the stale `three entries` comment move with the include literal. Neither is load-bearing on a check, which is why this is a clause and not a row — the same treatment K-8's stale strings get. **The two halves of this row are different kinds of work (TE Q-01):** the include literal is an *edit to a live oracle* that reds at HEAD the moment `package.json` moves without it, while the c8-run driver's import of `lib/stats.mjs` is *new* work with no assertion behind it today | same task | Two conjuncts, one live and one new, both landing in this change; the new one is routed to TSPEC §6.4 as a sixth anti-drift row. **Declared (live at HEAD):** the P9-02 test in `coverageInstrumentation.test.js` asserts `c8.include` against a transcribed literal in both directions — so once `**/pdlc/workflows/lib/stats.mjs` is in that literal, omitting it from `package.json` is red (and vice versa). The shipped assertion is `expect(include).toEqual([…])`, **array-equality, so position-sensitive and strictly stronger than set-equality**: the new entry must be appended at the same index in `package.json` and in the test literal, or a diff that looks set-correct reds. **Resolved (new work):** the P9-02 c8 run's driver imports `lib/stats.mjs` too and the `json-summary` must name it, which is the only way a declared-but-unresolving glob is caught (the `allow-external` bare-basename defect that run exists for). Without both, the omission is green everywhere and the chosen option silently degrades to the *no coverage gate* state the option table records as disqualifying for B and C |
| K-4 | `statsParsers()` remains the sole production construction of the bundle. A second construction site voids DEC-STATS-03's oracle without failing it | implementation | TSPEC §6.4's identity oracle covers the one site, and a **construction-site count** conjunct covers the rest: read `pdlc/engine/bin/cli.mjs`'s source and assert the four-classifier object literal occurs **exactly once**, inside `statsParsers` — set-equality over occurrences, not "at least one". Positive structural counts over a source file are a precedented mechanism here (`pdlc/engine/__tests__/bin-guard-structure.test.js` pins `bin/pdlc.mjs` with exactly this shape: zero static imports, exactly three top-level statements, zero `await` tokens). Routed to TSPEC §6.4 as an erratum; "review-blocking finding" is not the disposition, since a load-bearing claim on REQ C-5 with no detector has no expiry date |
| K-5 | `SCHEMA_VERSION` is referenced only inside `renderJson`. Any read of it from `computeFeatureStats` or `renderHuman` reintroduces the coupling DEC-STATS-02 rejected | implementation | TSPEC §6.3's cross-mode oracle |
| K-6 | Downstream documents cite `DEC-STATS-01` for the frozen-enumeration carve-out and do not restate its text | PLAN, PROPERTIES authors | review |
| K-7 | The two sibling-feature documents `DEC-STATS-01`'s carve-out amends are edited **in the same change** as `_tspec-packed-set.mjs`, spec-first and by the precedented versioned route: `docs/completed/pdlc-engine-distribution/TSPEC-…md` §5.4 gains `PK-26` (`vendor/workflows/lib/stats.mjs`, under the `files` entry `vendor/workflows/`), its vendored-members note moves five → six with the derived total following, and `FSPEC-…md` §5.2's "Workflow members" per-class count moves five → six — each with its own changelog row naming this feature, by the same versioned route that document's 0.15 row records `pdlc-engineering-loop` taking for `PK-24`/`PK-25` — **bundled more tightly than 0.15 was**, since that row explicitly split the helper literal out (*"`tspecPackedCount`'s vendored-class literal moves separately, in a later task"*) and this feature does not. No other `PK-*` row, class or oracle is touched. **The prose target is the word "six", and K-8 owns the matching word-map edit** that makes the oracle grep for it | PLAN: one owning task, the same task as the `_tspec-packed-set.mjs` edit | **`loop-distribution.test.js`'s `P7-02: docs/completed/pdlc-engine-distribution/ TSPEC §5.4, FSPEC §5.2 and AT-3.8b agree with `tspecPackedCount`'s vendored class size`** — it reads both sibling documents off disk and `assert.match`es their member-count sentences against the class size it derives from `tspecPackedCount` at test time, so a helper amended without the documents is red. It does **not** cover `PK-26`'s existence as a row; see the third residual |
| K-8 | `pdlc/engine/__tests__/loop-distribution.test.js` — the sixth co-change site — is amended in the same change as the four enumerations it fences, by **re-baselining rather than by widening the delta**: `D1_BASELINE`, `D2_D3_BASELINE` and `D5_BASELINE` absorb `pdlc-engineering-loop`'s two `lib/` members (they are that feature's *post*-state at HEAD), and `NEW_LIB_MEMBERS_BARE` / `NEW_LIB_MEMBERS_VENDORED` become this feature's single member (`lib/stats.mjs`, bare and `vendor/workflows/`-prefixed). **Eight** assertion edits in all: the three baselines, the two `added` lists, `tspecPackedCount`'s `4 + 15 + 5 + 1` → `4 + 15 + 6 + 1`, the derived `assert.equal(vendoredClassSize, 5, …)` → `6`, and P7-02's `vendoredClassWord` ternary (3 + 2 + 1 + 1 + 1). **The eighth is the word map, counted inside the total and not beside it** — through v1.4 this row held it outside the headline while TSPEC §2.1 counted it inside, so the two documents sized the same work differently and PLAN, which reads both, would have had to pick. It is an assertion edit like the others and is counted like one. `D1_BASELINE` and `D5_BASELINE` look redundant and are not: they are two separate declarations that happen to hold identical content, so both are edited. **The importability conjunct keeps the full post-state, not the delta:** conjunct (a) loops over `NEW_LIB_MEMBERS_BARE` to read each member's bytes from the temp vendor tree and `await import()` it — the only proof in the repo that a vendored `lib/` member resolves on an installed engine (`run.test.js` checks bytes and `existsSync` for those members, never `import()`). Re-baselining alone would silently narrow that loop to `lib/stats.mjs` and drop `loop-session.mjs` and `escalation-view.mjs` from it, with no oracle reporting the loss. So conjunct (a) iterates the post-state set — `[...D1_BASELINE_LIB_MEMBERS, ...NEW_LIB_MEMBERS_BARE]`, or a set derived from `prepackNs.MODULE_NAMES` — and importability stays proved for all three `lib/` members. Conjunct (d) needs no such change: it already derives `postFixMembers` from the live `WORKFLOW_MEMBERS`, which is the shape to copy. (**PM Q-02:** keep `NEW_LIB_MEMBERS_*` as the *delta* it is named for and give the post-state its own name — `POST_STATE_LIB_MEMBERS` — so the next feature to re-baseline inherits two unambiguous names rather than one overloaded one.) **Provenance and message strings move with the values:** the constants' header comment binds them to *"TSPEC §7's shared delta … exactly as its D-1…D-6 table names the two new members"* — a different feature's spec, no longer what the constants hold after re-baselining — and two strings go stale the same way, `assertAdditiveOnly`'s *"delta over baseline must be exactly the two new members"* (now one) and the `"vendored class size must be 5"` message whose literal moves to 6. None is load-bearing on a check, which is why it is a clause here and not a row of its own; stale restatement is the defect generator K-6 exists for. **The eighth edit, expanded — the word map K-7 depends on**: `vendoredClassSize === 5 ? "five" : String(vendoredClassSize)` becomes a number-word map (`5 → "five"`, `6 → "six"`), because at 6 the ternary greps for the digit while K-7 writes the word, and K-7 landed exactly as specified would leave this oracle red. This is the eighth of the eight counted above, not a ninth item | PLAN: one owning task, sequenced with the `_tspec-packed-set.mjs` / K-7 task | The file is its own falsifier — `npm test` in `pdlc/engine`, i.e. the required `Engine tests (ubuntu-latest)` check |
| K-9 | The two `MODULE_NAMES`-fencing tests the sweep found — `pdlc/engine/__tests__/run.test.js` (sites: both `assert.deepEqual` manifest name lists **and** the `scratchWorkflows` copy list, which must copy `lib/stats.mjs` or the real `runPrepack` throws `ENOENT` and the process-entry leg's `assert.equal(result.status, 0, …)` reds) and `pdlc/workflows/__tests__/learningsPremises.test.js` (P-1's four-name literal and its test title's count word) — are amended in the same change as `prepack.mjs`'s `MODULE_NAMES`. The same task also makes the tenth site's edit — `pdlc/README.md`'s `pdlc` CLI section, whose vendoring sentence *"The four workflow modules it dispatches (…) are vendored into the package at pack time"* has both its count word and its member list go stale here (cited by section and sentence, not by line, per `DEC-DOC-01`). It **is** the tenth row of the site table as of v1.5, carrying "pinned by no oracle" in place of a falsifier; the earlier framing that held it outside a falsifiers-only table is retired, since PLAN reads this table and TSPEC §2.1's together. The same task promotes the sweep rule to `docs/_constraints/DOMAIN-CONSTRAINTS.md`, **with its query and the query's scope, not only its prose**: *an enumeration's co-change set includes every assertion that pins its membership or size, wherever it lives — tests and production code alike. Derive that set with `git grep -l` over tracked sources (`grep -rln` silently drops files containing NUL bytes), never scoped to `__tests__/`, and probe with a member that appears in every enumeration of the class, re-picking the probe when the class changes. State the pathspec with the query: a swept total is only reproducible against the exact scope that produced it, and two correct sweeps of the same class differ in total whenever their probe or their pathspec differs.* The promotion carries `publish-preflight.mjs` as the worked example of why the scope matters: a deliberate production-side copy of the enumeration, run at publish time, that a test-directory query cannot reach — and did not, in this document's own v1.3. **The scope clause is why this document's `':!*/dist/*'` and TSPEC §2.1's `lib/loop-session.mjs` probe report different candidate totals (25 and 24) while agreeing on the same ten transcribers (TE F-04)** — the promoted rule must therefore travel with its pathspec, or the next feature will cite one total under the other's query, which is the defect in miniature | PLAN: one owning task covering both files, sequenced with the `prepack.mjs` edit; K-8's task and this one red on the same commit, so they may be the same task | Both files are their own falsifiers, and they sit in **different** required checks — `run.test.js` in `Engine tests (ubuntu-latest)`, `learningsPremises.test.js` in `Unit tests (ubuntu-latest, node 20)` — so a partial edit reds a check on either side of the package boundary. The `pdlc/README.md` clause and the constraint promotion have **no** falsifier: neither reds, and both are caught by review or not at all. **On whether K-3 and K-9 can share a task (TE Q-02):** K-3's pair sits inside a *single* check — `pdlc/workflows/package.json` and `coverageInstrumentation.test.js` are both under `Unit tests (ubuntu-latest, node 20)`, so a partial edit there reds one check twice rather than two checks once. That asymmetry is why K-3 is not merged into K-9: K-9's two files must land together to keep both checks green, while K-3's pair is self-contained in one suite and can be sequenced independently |

### What these decisions do not decide

No observable behavior. Token spellings, key sets, exit codes, row order and edge-case outcomes are
fixed by FSPEC §4 and §5 and restated nowhere here. DEC-STATS-02 decides where a value is stored,
not what BR-24's increment rule is. DEC-STATS-01 decides a file path, not any metric's definition.

### Standing costs accepted

- **Co-change surface roughly the size of the feature's own logic.** One ~300-line module costs
  **ten** edit sites — five enumerations, the four test files that pin their membership or size
  (`loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`,
  `learningsPremises.test.js`), and `pdlc/README.md`'s prose member list — plus an amendment to a
  completed feature's frozen table. The number is sweep-derived; it grew from five to six to nine to
  ten over four review rounds, and the reason it stopped growing is that it is now produced by a
  query — repo-scoped and run with `git grep -l`, after round 4 showed that a `__tests__/`-scoped
  `grep -rln` both missed production-side copies and silently dropped NUL-containing files — rather
  than by reading files. Accepted because every alternative trades it for no coverage gate (B, C) or
  for a command that is broken on installed engines (D), and because the vendored class has already
  grown once by this exact route.
- **One of the ten sites has no falsifier.** `pdlc/README.md`'s vendoring sentence is owed as an edit
  under K-9, drifts silently if forgotten, and is corrected by review rather than by a red. This is
  called out separately from the co-change cost above because it is a *different kind* of cost: nine
  sites are enforced by CI and one is enforced by attention, and the ninth-to-tenth step is where a
  green suite stops being evidence.
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
| **The driver exports gaining state** is invisible to every conjunct in the design — reference identity survives a cache, and the recording double inherits the shared state rather than exposing it | Reference identity is chosen because it is total over inputs; totality is what makes it blind to the guard's own precondition | **Closed for three of four exports, narrowed for the fourth.** The purity conjunct has landed in TSPEC §6.4 (v1.4) and closes this for the object-returning classifiers by non-aliasing. `deriveDodRoundIndex` returns a `number`, where non-aliasing is meaningless, so it carries an **A-B-A** conjunct instead: accumulating state (high-water mark, carried-forward ledger, retained `let`) reds, a **memo table does not**. The memo-shaped half of the trigger on that one export stays open, observable only by review of `orchestrate-dev.js` |
| **`PK-26`'s existence as a row in the sibling TSPEC §5.4 table (K-7)** has no mechanical falsifier. The count half **does**: `loop-distribution.test.js`'s P7-02 document-oracle reads both completed-feature documents off disk and matches their member-count sentences against the class size it derives from `tspecPackedCount` at test time (*"derived from the live constant, never compared against a literal transcribed here"*), so a helper amended without the documents is red. What that oracle greps is the two **sentences**, not the `PK-*` rows above them, so a counts-only edit that never adds the `PK-26` row is green | The oracle was built to close the count window (`pdlc-engineering-loop`'s PLAN records it as *"now closed by an oracle, not by argument"*); row-level structure was outside its brief | **Accepted, and narrower than the first draft of this row claimed** — that draft asserted the document half had no falsifier at all, which is false at HEAD and would have sent a DoD reviewer past the one guard that exists. What remains is one missing row, discharged by K-7's single owning task and by review. Note the coupling K-8 carries: the oracle greps the word the ternary derives, so K-7's prose and K-8's word map are one change or the check is red |

### Relationship to project-level decisions

Neither contradicted nor re-litigated: `DECISIONS-seam-defaults.md` (DEC-SEAM-01) governs the
`StatsIo` and `StatsParsers` defaults and DEC-STATS-03 applies it rather than restating it;
`DECISIONS-review-severity-bars.md` (DEC-DOC-01) is why every citation above names a stable symbol,
heading or exported name rather than a `file:line` anchor.
