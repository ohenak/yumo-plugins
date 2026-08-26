---
feature: pdlc-engineering-loop
---

# PROPERTIES — pdlc-engineering-loop

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** |
| Downstream | IMPL tests |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES[-v{N}].md` in this directory |
| LEARNINGS | `docs/pdlc-engineering-loop/LEARNINGS-pdlc-engineering-loop.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.7 | 2026-08-25 |

Derived from REQ **v1.9**, FSPEC **v0.9**, TSPEC **v1.2** (*Traceability* §), PLAN **v1.2**
(*Batches* §) and DECISIONS **v0.8**, and verified against the repository at `d4122427b`, with the
PLAN axis (C-4) re-derived against PLAN v1.2 at HEAD. All five upstreams are pinned by version,
not only by section, because a section-only pin carries no staleness signal: a section name reads
the same before and after the section's content is rewritten, so a reader cannot tell whether this
document was re-checked against what that section now says. The version cell can disagree with
upstream and be seen to disagree — which is exactly what surfaced this revision's own findings.

*(The earlier statement of this rationale cited TSPEC v0.9's *Erratum-dispatch upstream snapshot
stale* note as its precedent. **TSPEC v1.2 withdrew that note as false** — the pipeline digests with
`sha256Hex` over `canonicaliseForDigest(text)` in `pdlc/workflows/orchestrate-dev.js`, not with
`shasum -a 256`, so the dispatch headers were correct all along; the note now reads
*"Dispatch-header `UPSTREAM-STATE` digests are correct"*. The citation is withdrawn with it. The
pinning practice stands on its own reasoning above, which never depended on that note.)*

**Reading this document's baseline claims.** Every unqualified *"at HEAD"* in the prose below —
the red-at-HEAD reasons, the *present at HEAD* / **new** state labels in `## Fixtures` F-5, and
the *Verification notes* rows — is a measurement taken at the pin commit **`d4122427b`**, i.e. the
tree as it stood before this feature's own implementation waves began landing on
`feat-pdlc-engineering-loop`. Read them as *"at `d4122427b`"*, not as live assertions about
today's tree: a file this document labels **new** that is tracked today was created by the very
PLAN task the label names as its owner, which is the plan executing, not a falsified claim. Where
a baseline premise has since been filled by implementation, the property it grounds is *satisfied*,
never falsified.

**Changelog — v0.7 (round 10 revision; DECISION FREEZE in force — blocking findings only).**
Round 10 was a delta re-review of v0.6. Both reviewers re-derived the catalogue (94), the level
table, C-5's arithmetic and C-6's 36 FSPEC v0.9 `BR-` ids independently and found no drift, and
both confirmed SE's v9 High closed **against the code** (`pdlc/engine/__tests__/loop-distribution.test.js:91`
runs `assert.doesNotReject(import(queueUrl))` over the `runPrepack`-produced vendor tree). No
property was added, removed or renumbered in this revision, and no oracle, fixture row or trace
moved. Two accounting statements were corrected.

**PM F-01 (High, delta) / SE F-02 (Medium, delta) — the v0.6 changelog no longer reads an owed
AT-52 conjunct as covered.** The sentence claimed PROP-DIST-02 and PROP-DIST-03 *"already state in
that form"* the whole of FSPEC v0.9's widened AT-52 second conjunct. Only half of that is true:
PROP-DIST-02 asserts superset-plus-growth over enumeration **membership** and PROP-DIST-03 asserts
path-preserving copy; neither says anything about an edit to a comparison, a normalisation or a
derived count. PLAN **v1.2** adjudicated exactly this and recorded the clause as **owed** —
*"P7-01(b) asserts membership additivity only, and owes that conjunct"* (PLAN §*Verification*,
`AT-52` bullet), with the natural home named as **P7-01(c)** and *"No new conjunct added"* (PLAN
v1.2 changelog row). The clause is split: the transcription half is named as carried, the
gate-invariance half is recorded as not-yet-covered in **Gaps and Routed Errata** as **G-6**, citing
PLAN v1.2's qualifier and its named home. **No property was opened for it** — whether the clause
earns its own property (or a strengthening of PROP-DIST-02) is the coverage decision PLAN v1.2
declined to take and both reviewers filed `DEFERRED:` under this freeze.

**SE F-01 (Medium, delta) — C-4's set-equality sentence now states both its exceptions.** The
v0.6 revision emptied P7-03's Properties cell to *(none — descoped)*, which is correct, but left
C-4 asserting *"Every one of the PLAN's 60 task rows traces to at least one property"* with P0-01
as the single named exception. The sentence is a machine-checkable coverage claim, so it now names
P7-03 as the second exception in place, with the reason a reader arriving at the empty cell needs.

**SE F-03 (Low) — not taken.** PROP-DIST-05 cites its owning test by title without the shipped
`P7-02: ` skip-title prefix while attributing the conjunct to P7-01(a) per PLAN. SE records the
mapping as PLAN's to own and the citation as non-load-bearing under this document's `d4122427b`
measurement pin; under freeze it is left for the round that opens either file substantively. Both
reviewers' `DEFERRED:` items and Questions are recorded, not actioned. SE Q-01 asked whether the
document should carry a consolidated *"owed coverage"* list gathering every known gap across both
documents; G-6 answers only the half PM F-01 made blocking — the one clause this document was
asserting as covered — and does not consolidate DEC-LOOP-07's ratified residual, which stays where
it is ratified, in PROP-DIST-05's text. The wider list remains SE's open question.

**Changelog — v0.6 (round 9 revision; upstream-cascade round — the routed REQ erratum was inert,
three other upstreams had moved).** The routed item (REQ v1.8 → v1.9, `4923651`, filling
D-LOOP-01…05's `Binds-to` cells with queue row 26) touches nothing this document compresses: no
property, oracle, fixture row or trace line cites a `D-LOOP-*` id or a queue row. Both reviewers
measured that independently and agreed. What this revision lands is what the confirmation's
*upstream at HEAD* sweep found instead.

**SE F-01 (High, inherited) — PROP-DIST-05 restated, not retired.** DECISIONS **v0.8** added
**DEC-LOOP-07**, which descopes AT-52's installed-engine leg, and PLAN **v1.0** marked **P7-03**
`DESCOPED` in both its Task and Status cells, reattributing the installed-engine conjunct to
P7-01(a)'s packed-tree import. PROP-DIST-05 as written named an executing assertion — the
`npm-pack-install-upgrade` leg — that upstream has ruled will not be written. It is restated at the
level that actually discharges the conjunct (P7-01(a)'s `import()` of the vendored
`orchestrate-queue.js` and **both** `lib/` modules through a `packRealTarball()`-built tree) and
carries DEC-LOOP-07's accepted residual risk as a named, visible gap rather than a silent one.
Retirement was the alternative (SE Q-01); restatement was chosen for the reason SE leaned to it —
deleting the property would delete the only place this document names the risk DEC-LOOP-07 accepts.
The consequential sites move with it and are the same edit, counted once: the AT-52 row in the
AT → property table, the P7-03 row in the PLAN-task table, C-4's Phase-7 note, the BR-21
coverage-matrix row and F-5's `fixture-machine.mjs` state row, which no longer claims this feature
extends that file. **No property was added or removed: the catalogue is still 94, the AT → property
mapping still covers all 53 `AT-*` identifiers**, so C-2's and C-5's arithmetic is unchanged.

**SE F-02 (Low, delta), PM F-01 (Low, delta), SE F-03 (Low, inherited) — the derivation pin
refreshed.** It read REQ v1.8 / FSPEC v0.8 / TSPEC v1.0 / PLAN v0.9 / DECISIONS v0.7; HEAD is
**REQ v1.9 / FSPEC v0.9 / TSPEC v1.2 / PLAN v1.2 / DECISIONS v0.8**. Note the pin is *ahead* of
both reviews on two axes — SE's table recorded FSPEC v0.8 and PLAN v1.0, and both had moved again
by this dispatch — so the pin is measured at HEAD, not transcribed from the review. Each move was
checked for substance, not just for its label: FSPEC v0.9's erratum widens AT-52's second conjunct
to red on assertion changes beyond enumeration membership and decides test-side transcriptions are
part of the enumeration — of which the **test-side-transcription half** is already carried
(PROP-DIST-02's oracle re-reads each enumeration at test time, and P7-01(b)'s artifact sites include
`packaging.test.js`'s `WORKFLOW_MODULE_NAMES`), while the **gate-invariance half** is **not**: see
**G-6**, and v0.7's changelog entry below, which corrected this sentence; PLAN
v1.0 → v1.2 changed no task id, batch, dependency edge or AT mapping and holds the task count at
**60**, so C-4's set-equality survives unaltered; TSPEC v1.1/v1.2 are corrective-only.

**SE F-04 (Medium, inherited) — the pinning rationale no longer cites a withdrawn note.** The
*Erratum-dispatch upstream snapshot stale* note it cited was withdrawn as **false** at TSPEC v1.2.
The rationale is restated on its own reasoning and the withdrawal recorded in place, so the
citation is not silently dropped and cannot be re-introduced by a later reader who remembers it.

SE Q-02 (dispatch-header digests that do not resolve at HEAD) is a workflow question, not a
document edit, and TSPEC v1.2 has already answered its general form; nothing is owed here. PM's
carried v8 items (F-01's illustrative migration count, F-02/F-03/F-05's field-marker grep counts,
F-04's *"engine suite"* paraphrase, Q-01's `REQUIRED_INCLUDES` window) were explicitly carried, not
re-raised, and are left for the next round that opens the document for a substantive reason.

**Changelog — v0.5 (round 6 revision; DECISION FREEZE still in force — blocking findings only).**
Round 6 was a no-delta round: both reviewers re-measured the v0.4 bytes against a moved tree and
approved (PM: 0 High / 1 Medium / 1 Low; SE: 0 High / 0 Medium / 4 Low). This revision lands the
non-decision items rather than deferring them a further round. PM F-02 / SE F-02: the upstream pin
is refreshed from **PLAN v0.5** to **PLAN v0.9**, with C-4's set-equality re-derived mechanically
against the live PLAN rather than trusted from a changelog — the id sets are identical (60 in this
document; the PLAN's only extra token, `P7-04`, survives solely in historical changelog rows and
carries no task row). PM F-01 / SE F-03: the *Reading this document's baseline claims* paragraph
above fixes all 28 *"at HEAD"* baseline phrasings to the pin commit in one place, and C-4's P8-03
note is past-tensed (`pdlc/templates/loop.md` has since landed). SE F-04: the G-2 discharge's four
raw `TSPEC:{line}` anchors are replaced by *Levels and homes* row citations by test-file name and
level label, per DEC-DOC-01 — the convention PLAN v0.6 adopted for its own code citations.
SE F-01: the two mid-clause line breaks in PROP-DIST-02 and PROP-DIST-03 are re-flowed, folded into
this edit rather than spent as a round of their own. No property statement, oracle clause, trace
line, level line or coverage-matrix trace changed; no gap opened or closed. (Those three field
markers are deliberately not written out in literal form here: C-5's arithmetic is re-derived by
grepping this document for them, so a prose mention outside a property block would inflate the
count from 94 to 95.)

**Changelog — v0.4 (round 4 revision; DECISION FREEZE still in force — blocking findings only).**
SE F-01: PROP-DIST-02's introductory apposition corrected from `pdlc/completed`-side (a path that
exists nowhere at HEAD) to `docs/completed/`-side; the row's own citation,
`docs/completed/pdlc-engine-distribution/`, was already right and is unchanged. SE F-03: the four
over-long lines this document's v0.3 delta left behind — the upstream-pin paragraph, PROP-DIST-02's
`deepEqual` sentence and PROP-DIST-03's *Ordering* sentence — re-wrapped to the document's
prevailing width. No property statement, oracle, trace, level or coverage-matrix row changed; both
findings were Low, and no round-4 finding of higher severity was raised by either reviewer.

**Changelog — v0.3 (round 3 revision; DECISION FREEZE in force — blocking findings only).**
PM F-01 / SE F-01: PROP-DIST-03's co-landing clause now names **D-3**, not D-2, with the
`packaging.test.js:28-31` / `:25` import evidence stated; the citation follows TSPEC v1.0 §7's
*Ordering* row. PM F-02: routed erratum **G-2** marked discharged at TSPEC v1.0 (four rows now
exist, `TSPEC:1312`/`:1315`/`:1316`/`:1327`), retained as round history, and the open-errata count
reconciled to four (G-1, G-3, G-4, G-5, all re-measured and still reproducing). PM F-03 / SE F-04:
PROP-DIST-02's spec side re-labelled **D-4** (`docs/completed/pdlc-engine-distribution/`), with
`_tspec-packed-set.mjs` correctly identified as **D-3**, the ordering authority. PM F-04: upstream
pin re-stated at TSPEC v1.0 / PLAN v0.5 / DECISIONS v0.7 and the verification commit re-anchored.
PM F-05 / SE F-02: C-5's *Reading the arithmetic* corrected to 94 + 5 − 2 = **97**. SE F-03:
PROP-ESC-15's conjuncts (2)/(3) made falsifiable by scripting two distinct epochs in F-3's
`backoff-reappend` fixture (F-1's `_now` row notes the exception). SE F-05: the `packaging.test.js`
`cpSync` anchor narrowed to `:119-124`. No other text was touched; every DEFERRED item in both
reviews was left unactioned by the freeze.

**Changelog — v0.2 (round 1 revision).** PM F-01: PROP-DOC-03 gains AC-6.1's content half and a
non-vacuity control, with a new O-4 row. PM F-02: the Overview's "reconciled by PROP-BND-11"
claim is narrowed to the two enumerations PROP-BND-11 actually reconciles. SE F-01: PROP-ESC-08
restated against the real HEAD inventory (two push sites, three return-literal sites, two
mechanisms), and the Verification notes row corrected to vouch only for what was checked. SE F-02:
new coverage axis **C-6** (FSPEC business rules → properties) and new **PROP-ESC-15** for BR-09a.
SE F-03 / SE F-04 + PM F-03: C-2's and C-5's counts corrected. SE F-05: G-1 restated as a
placement defect, with two further errata routed (**G-4** P3-07/P3-08's escalation-site count,
**G-5** BR-09a's unowned backoff re-append cell). SE F-06: PROP-ESC-05's `LOOP_SOURCES` marked planned-state. SE F-07: two raw
`file:line` anchors replaced with symbol citations. SE F-08: upstream pins completed.

## Overview

**What this document is.** The proof system for `pdlc-engineering-loop`: 94 falsifiable properties
derived from REQ v1.9's acceptance criteria, FSPEC v0.9's business rules (BR-01…BR-30), error
scenarios (E-01…E-26) and acceptance tests (AT-01…AT-52), and pinned to the components TSPEC's
**Traceability** table names and the tasks PLAN's **Batches** table owns. Every property is stated
so an implementer can write its test without asking a question, and so a reviewer can say what
input would make it fail.

**Scope in one line.** A session-level `/loop` driver — one queue invocation per iteration, its own
termination discipline, a once-per-session preflight, and one rendered operator view over
`docs/_queue/ESCALATIONS.md` — built entirely on mechanisms that already ship, adding two pure
modules and widening two inherited enumerations.

**The seam under test.** Two new pure ESM modules, `pdlc/workflows/lib/loop-session.mjs` and
`pdlc/workflows/lib/escalation-view.mjs`, plus edits at four write points in
`pdlc/workflows/orchestrate-dev.js`, the driver in `pdlc/workflows/orchestrate-queue.js`, the
calibration reader in `pdlc/workflows/consolidate-learnings.js`, and the engine's
`pdlc/engine/bin/cli.mjs` / `pdlc/engine/lib/startup.mjs`. At HEAD `pdlc/workflows/lib/` contains
exactly one file, `document-oracles.mjs`; both loop modules are new. `pdlc/templates/` contains
exactly `QUEUE.md`; `pdlc/templates/loop.md` is new.

**Why the pyramid leans hard on unit.** Both new modules are pure, so the majority of the AT set is
discharged from plain values with no double at all — TSPEC's *Test doubles* section states that
`nextDirective` alone discharges AT-03…AT-09, AT-39, AT-40, AT-41 and AT-49. That is the correct
shape and this document preserves it: **zero E2E properties**. The one property that runs against a
published-shaped artifact (PROP-DIST-05) rides a *genuinely packed tree* built inside an existing
module-integration test rather than adding a journey test — and, since PLAN v1.0 descoped P7-03
(DECISIONS DEC-LOOP-07), **no property is homed on the fixture machine at all**; the level survives
in the table below with a count of zero so its emptiness is a stated fact rather than an omission.

**Property counts by test level.** Each number is the count of properties whose `Level:` cell
names that level. These are **hand-maintained** and a reviewer should re-derive them: PROP-BND-11
reconciles the two enumerations it names — the stop-reason set and the notice-code set — and
nothing else. No document oracle reads this table, the per-domain counts below it, or C-5. The
tables in **C-1…C-6** are the machine-checkable coverage claims; these are the arithmetic ones.

| Level | Count | Home |
|---|---|---|
| Pure unit | 42 | `loopSession*.test.js`, `escalationView*.test.js`, `loopProperties.test.js`, `loop-startup-remediation.test.js` |
| Unit **and** integration (asserted at both) | 5 | as above, plus `loopQueueDriver.test.js` |
| Module integration | 32 | `loopQueueDriver.test.js`, `loopMergeEscalation.test.js`, `loopThreeSources.test.js`, `loopAdvisoryCatalogue.test.js`, `loopCalibrationIsolation.test.js`, `loopDecisionEntry.test.js`, `loopEntryVocabulary.test.js`, `loop-cli.test.js`, `loop-config-example.test.js`, `loop-distribution.test.js` |
| Document oracle | 12 | `loopDocumentSurfaces.test.js`, `loopGuardPaths.test.js`, `coverageInstrumentation.test.js`, `ci-arrangement.test.js`, `loopBaselinePreflight.test.js` |
| Git-history oracle (new level) | 1 | `loopQueueCommitProvenance.test.js` |
| Fixture machine (existing leg) | **0** | — (was PROP-DIST-05; PLAN v1.0 descoped P7-03, DECISIONS DEC-LOOP-07) |
| Design property / policy — **no executing assertion** | 2 | PROP-BND-06, PROP-BND-09 (declared, not hidden) |
| E2E | 0 | — |

**Property counts by domain.** `CFG` 6, `ITER` 16, `PRE` 10, `ESC` 15, `VIEW` 14, `BND` 11,
`RPT` 8, `DIST` 6, `DOC` 8 — 94 in total. Hand-maintained, as above.

**Property-based coverage.** Four laws under `fast-check` (already declared at
`pdlc/workflows/package.json`, `devDependencies.fast-check`), following the two shipped precedents
`advisoryHelperProperties.test.js` and `consolidationProperties.test.js`. They supplement the
example-based properties; neither subsumes the other.

**Falsifiability discipline applied here.** Three failure modes this repo has shipped before are
structurally excluded by construction, not by inspection:

1. **No absence-only oracle.** Every blocked / refused / degraded property below carries three
   positive conjuncts — exact status value, named reason code from a closed enumeration, and a
   retention or byte-identity assertion. `preflight-refused` versus `engine-dispatch-refused` is
   the sharpest instance: PROP-PRE-05 asserts both the code *and* the textual distinguishability of
   the two `detail` strings, because "not `preflight-refused`" would pass on any accident.
2. **No constant-compared-with-itself catalogue oracle.** Every closed-enumeration property names a
   **literal transcription** as one operand and a **collected set** as the other; the frozen export
   (`LOOP_NOTICE_CODES`, `LOOP_STOP_KINDS`, `LOOP_DEFAULTS`, `ADVISORY_SEAMS`) is an operand of at
   most one deliberately narrow pinning property (PROP-RPT-05), never of the behavioural oracle.
3. **No vacuous set-equality.** Every set-equality property carries a non-vacuity control: both
   sides non-empty, a named member present on both, or a stated fixture that makes the naive
   comparison differ.

**Reading the ids.** `PROP-{DOMAIN}-{NN}`. Nine domains: `CFG` configuration, `ITER` iteration and
termination, `PRE` preflight, `ESC` escalation writing, `VIEW` operator view, `BND` boundaries and
negatives, `RPT` session report, `DIST` distribution and instrumentation, `DOC` documentation
surfaces. Negative properties are marked **(negative)** in the property statement.

**Project-level context.** `docs/_constraints/DOMAIN-CONSTRAINTS.md` and `docs/_decisions/` were
read before derivation. `DEC-DOC-01` (`docs/_decisions/DECISIONS-review-severity-bars.md`) governs
citation form throughout: headings, spec ids and exported symbol names, never a bare `file:line`
except where the position is itself the claim (PROP-DIST-04 on
`coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES`, and PROP-DIST-03 on `prepack.mjs`'s
`MODULE_NAMES`). `DEC-ORACLE-05`'s no-hand-maintained-counts rule is discharged **within PROP-BND-11's stated
scope** — the stop-reason and notice-code enumerations — and not over this document's own level,
domain and C-5 arithmetic, which stays hand-maintained and is labelled as such above. Widening
PROP-BND-11 to parse this file's own `Level:` cells would be a new deliverable no PLAN row owns
(P9-04's row is scoped to the CI check table), so the honest treatment is the narrower claim, not
an over-promised oracle.

## Properties

Every property states a falsifiable claim, its category, its test level, and the upstream it traces
to. `Traces` cites REQ acceptance criteria, FSPEC rules/scenarios/ATs, TSPEC sections and the PLAN
task that owns the deliverable. **(negative)** marks a property asserting what must *not* happen.

### Configuration (PROP-CFG)

**PROP-CFG-01** — `readLoopConfig` must return a **complete** `LoopConfig` — all four keys
`backoffSchedule`, `idleStopAfter`, `preflight`, `dirtyTreePolicy` present — for every input,
where each key holds either the in-domain configured value or exactly the corresponding
`LOOP_DEFAULTS` value.
*Category:* Data Integrity. *Level:* Unit. *Traces:* REQ AC-2.5; FSPEC BR-01, BR-02; TSPEC
*Interfaces* → `LoopConfigResult`; PLAN P1-01/P1-02, P9-01.
*Oracle:* the returned `config`'s key set is `deepEqual`'d against the literal
`["backoffSchedule","dirtyTreePolicy","idleStopAfter","preflight"]` (sorted), and each value is
asserted `in-domain OR === LOOP_DEFAULTS[key]`. Stated as a `fast-check` law over arbitrary JSON,
not only over the two-key example AT-38 samples.

**PROP-CFG-02** — `LOOP_DEFAULTS` must be set-equal, as a key→value map, to the literal
`{backoffSchedule: [5, 15, 30, 60], idleStopAfter: 4, preflight: "strict", dirtyTreePolicy:
"tracked"}` transcribed from FSPEC BR-01 into the test file.
*Category:* Contract. *Level:* Unit. *Traces:* REQ AC-2.1/AC-2.2, FSPEC BR-01, AT-10; PLAN P1-01.
*Oracle:* `deepEqual(LOOP_DEFAULTS, <literal>)`. The literal is transcribed from BR-01's threshold
table; deriving it from the module under test would be the constant-compared-with-itself defect.

**PROP-CFG-03** — For each of the four configuration states, `readLoopConfig` must report a
`case` value from `{"absent-file", "absent-section", "malformed-section", "explicit-default"}`, the
four reported cases must be **pairwise distinct**, and in all four the loop must run with the
declared defaults applied.
*Category:* Functional. *Level:* Unit. *Traces:* REQ AC-2.5 (authoritative four-state partition),
FSPEC BR-02, E-01, AT-10; TSPEC *Interfaces* → `ConfigCase`; PLAN P1-01/P1-02.
*Oracle:* four fixture reads produce four `case` values; `new Set(cases).size === 4` **and** each
value is asserted individually against its literal — pairwise-distinctness alone would pass on four
wrong labels. The "loop runs" conjunct is asserted as `directive.kind !== "stop"` for a `ran`
report under each case.

**PROP-CFG-04** — A configured key present with an unacceptable type must fall back to its declared
default **independently** of every other key, the other keys keeping any valid configured value,
and each substituted key must be named by name in `invalidKeys`.
*Category:* Error Handling. *Level:* Unit. *Traces:* FSPEC BR-03, E-02, AT-38; PLAN P1-01, P9-01.
*Oracle:* fixture with `idleStopAfter` as a string and `backoffSchedule` as an object, and
`preflight`/`dirtyTreePolicy` set to valid non-default values; assert the two bad keys equal
`LOOP_DEFAULTS`, the two good keys equal their **configured** (non-default) values — the conjunct
that fails a reader which discards the whole section on one bad key — and
`invalidKeys.sort()` `deepEqual`s `["backoffSchedule","idleStopAfter"]`.

**PROP-CFG-05 (negative)** — `readLoopConfig` must **not** throw, and must **not** abort the
session, on any input: absent file, unreadable file, non-JSON bytes, JSON that is not an object,
a `loop` value that is not an object, or an unknown key inside `loop`.
*Category:* Error Handling. *Level:* Unit. *Traces:* REQ AC-2.5 state (d), FSPEC BR-02/BR-03,
E-01, E-02; PLAN P9-01.
*Oracle:* `fast-check` totality law over arbitrary strings; the positive conjunct is that every
return is a complete `LoopConfigResult` with a `case` in the four-member enumeration — not merely
"did not throw".

**PROP-CFG-06** — `.claude/pdlc.config.example.json` must **contain** the top-level sections
`loop` and `merge` alongside HEAD's four (`dispatch`, `advisory`, `implementation`,
`learningsInjection`), and its `loop` section's key→value map must be **set-equal** to BR-01's four
declared keys at their declared defaults.
*Category:* Contract. *Level:* Integration (engine). *Traces:* FSPEC BR-29, AT-46; TSPEC *Data
Model* §2; PLAN P8-01/P8-02.
*Oracle:* containment for the section set (the file is shared — a fifth section shipped by another
feature must not red this feature), set-equality for the `loop` map against a literal transcription
of BR-01. Follows the shipped shape of `pdlc/engine/__tests__/advisory-config-example.test.js` and
`learnings-config-example.test.js`, both present at HEAD.

### Iteration and termination (PROP-ITER)

**PROP-ITER-01** — One iteration must make **exactly one** queue invocation, without `--loop`, and
that invocation must return before the next iteration begins.
*Category:* Contract. *Level:* Integration. *Traces:* REQ AC-1.2, FSPEC BR-04, AT-02; PLAN P5-01.
*Oracle:* a **call-count spy** on the invocation seam asserting `1`, plus an assertion that the
argv passed carries no `--loop`. A shape assertion over the returned report cannot falsify a double
invocation — this is the identical-envelope case, so the oracle is behavioural.

**PROP-ITER-02** — Given iteration 1 returns `ran` for feature A with
`report.pipelineReport.mergeStatus === "merged"`, iteration 2 must pick up a feature B whose
effective dependencies name A, with **no operator input recorded** between the two.
*Category:* Integration. *Level:* Integration. *Traces:* REQ AC-1.3 (the property the whole plan
exists to produce), FSPEC BR-04, AT-01; TSPEC *Data Model* §6 (Q-04 / REQ O-1); PLAN P5-01/P5-02.
*Oracle:* two consecutive scripted invocations against one in-memory queue in
`loopQueueDriver.test.js`; assert report 1 is `{outcome: "ran", picked: "A"}` with
`pipelineReport.mergeStatus === "merged"`, report 2 is `{outcome: "ran", picked: "B"}`, and the
operator-input seam's call count is `0`. The merge-status field is read at
`report.pipelineReport.mergeStatus` because `buildQueueReport` projects no top-level equivalent
(`pdlc/workflows/orchestrate-queue.js`, `buildQueueReport`).

**PROP-ITER-03** — A `ran` outcome must continue to the next iteration **immediately** with
`waitMinutes: 0`, resetting both the consecutive-idle counter and the schedule position to zero.
*Category:* Functional. *Level:* Unit. *Traces:* FSPEC BR-04, AT-08; PLAN P1-07/P1-08.
*Oracle:* `nextDirective` returns `{kind: "continue", waitMinutes: 0}` and the post-`ran` wait
sequence is `deepEqual`'d against the **literal** `[5, 15]` restarted from its first element —
transcribed, never "the first interval again" computed from the schedule the code read.

**PROP-ITER-04** — A `blocked` outcome must stop the session with stop reason `queue-blocked` and a
`detail` naming both the blocking feature and the reason.
*Category:* Functional. *Level:* Unit. *Traces:* REQ AC-1.4, FSPEC BR-05, AT-03; TSPEC *Data
Model* §5; PLAN P1-07/P1-08.
*Oracle:* three positive conjuncts — `kind === "stop"`, `stopReason === "queue-blocked"`, and
`detail` contains the blocking feature's name and the reason string. Never `stopReason !== "idle"`.

**PROP-ITER-05** — A `halted` outcome must stop the session with stop reason `pipeline-halted`, and
this must differ observably from `runQueueLoop`'s behaviour on the same queue state.
*Category:* Functional. *Level:* Unit + Integration. *Traces:* REQ AC-1.5, FSPEC BR-06, AT-04;
PLAN P1-07/P1-08, P4-05.
*Oracle:* `nextDirective` returns `stop`/`pipeline-halted`; the divergence conjunct asserts
`LOOP_STOP_REASONS` (`pdlc/engine/lib/run.mjs`, `LOOP_STOP_REASONS`, the four-member
`["exhausted","bound-reached","blocked","refused"]`) does **not** contain `pipeline-halted`, so the
two paths are pinned as distinct rather than asserted in prose.

**PROP-ITER-06** — An `idle` outcome with at least one `awaiting-merge` row in
`docs/_queue/QUEUE.md` must stop the session with stop reason `awaiting-merge`, `waitMinutes: 0`,
and a `detail` naming the awaited features — **without** entering backoff.
*Category:* Functional. *Level:* Unit. *Traces:* REQ AC-1.6, FSPEC BR-07, AT-05; PLAN P1-07/P1-08.
*Oracle:* exact stop reason, `waitMinutes === 0`, and the awaited feature names present in
`detail`. The feature names come from `QUEUE.md`, not from the `idle` report, which carries none
(REQ NFR-2) — so the fixture supplies a queue whose awaiting-merge rows are named and asserts those
exact names appear.

**PROP-ITER-07** — An `idle` outcome with **no** `awaiting-merge` row must enter backoff: the
directive is `continue` with `waitMinutes` equal to `backoffSchedule[schedulePos]`, and iteration
*n+1* runs after that wait.
*Category:* Functional. *Level:* Unit. *Traces:* FSPEC BR-07/BR-09, AT-06; PLAN P1-07/P1-08.
*Oracle:* `{kind: "continue", waitMinutes: 5}` on the first such `idle` under the declared defaults.

**PROP-ITER-08** — Over five consecutive backoff-entering `idle` outcomes under the declared
defaults, the **reported** waited intervals must be sequence-equal to the literal
`[5, 15, 30, 60, 60]` minutes, and the session must end after `idleStopAfter` (4) consecutive such
outcomes with stop reason `idle-exhausted`.
*Category:* Functional. *Level:* Unit. *Traces:* REQ AC-2.1/AC-2.2, FSPEC BR-09, AT-07; PLAN
P1-07/P1-08.
*Oracle:* the literal `[5, 15, 30, 60, 60]` is transcribed from BR-01 into the test, never computed
from the schedule the code under test read. The observable is the per-iteration line's reported
wait (FSPEC §3.4, E-25), **not** wall-clock elapsed time — a wall-clock oracle would make the
suite slow and flaky and could not distinguish a 60-minute repeat from a schedule overrun.

**PROP-ITER-09** — `schedulePos` must advance **exactly once per emitted `continue`** and never on
a `stop`.
*Category:* Idempotency. *Level:* Unit. *Traces:* FSPEC BR-09, E-25, AT-49; TSPEC *Mutation
sensitivity* mutant (a); PLAN P1-08.
*Oracle:* given a host that returns from a requested 15-minute wait after a different actual
length, assert the iteration proceeds, the report states **both** requested and actual lengths, and
`nextState.schedulePos` is exactly one greater — the wait is never counted twice and never treated
as an error. This is the named killer for mutant (a).

**PROP-ITER-10** — `no-queue` must end the session immediately with stop reason `no-queue` and zero
waits taken.
*Category:* Functional. *Level:* Unit. *Traces:* REQ AC-2.4, FSPEC BR-08, AT-09; PLAN P1-07/P1-08.
*Oracle:* `{kind: "stop", stopReason: "no-queue", waitMinutes: 0}`.

**PROP-ITER-11** — Given `backoffSchedule: []` or `idleStopAfter: 0`, the first backoff-entering
`idle` must end the session with stop reason `backoff-unenterable`, exactly one iteration running
after the triggering `idle` (zero when the triggering `idle` is iteration 1) and **zero** waits
taken.
*Category:* Error Handling. *Level:* Unit. *Traces:* FSPEC BR-09, E-03, AT-39; TSPEC *Data Model*
§5 (`backoff-unenterable` distinct from `idle-exhausted`); PLAN P1-07/P1-08.
*Oracle:* the falsifier is the **iteration count**, not elapsed time — a zero-interval busy-loop
reds on the count. `backoff-unenterable` must be the reported reason, distinguishing E-03 from
`idleStopAfter` exhaustion.

**PROP-ITER-12** — A queue invocation that **throws** must end the session with stop reason
`invocation-threw`, surfacing the failure, with **no** backoff wait taken and the consecutive-idle
counter **unchanged** from its pre-iteration value.
*Category:* Error Handling. *Level:* Unit. *Traces:* FSPEC BR-04a, E-04, AT-40; PLAN P1-07/P1-08.
*Oracle:* four positive conjuncts — exact stop reason, failure text present in `detail`,
`waitMinutes === 0`, and `nextState.consecutiveIdle === input.state.consecutiveIdle` asserted
against a **non-zero** pre-value so "unchanged" is distinguishable from "reset to zero".

**PROP-ITER-13** — An `idle` outcome while `docs/_queue/QUEUE.md` cannot be read must stop the
session with stop reason `queue-unreadable` and name the read failure, **without** entering backoff.
*Category:* Error Handling. *Level:* Unit. *Traces:* FSPEC BR-07, E-05, AT-41; PLAN P1-07/P1-08.
*Oracle:* exact stop reason plus a `queue-unreadable` notice carrying the path as its subject. The
safe direction is stated as the reason for the rule: an awaiting-merge row cannot be ruled out.

**PROP-ITER-14** — `decodeLoopState(encodeLoopState(s))` must deep-equal `s` for every well-formed
`SessionState`, and `decodeLoopState` must be **total** over arbitrary strings — never throwing and
always returning the fresh-session value.
*Category:* Data Integrity. *Level:* Unit (property-based). *Traces:* FSPEC E-24, AT-48; TSPEC
*Property-based strategies*; PLAN P1-05/P1-06, P9-01.
*Oracle:* two `fast-check` laws. The totality generator must include non-base64, non-JSON,
non-object, wrong-`v`, and **truncations of a valid token** — a generator of arbitrary strings
alone almost never produces a near-miss token, which is the input that distinguishes a real decoder
from a `try/catch` wrapper.

**PROP-ITER-15** — The reserved literal token `new` must decode to a fresh session **without** a
`session-restarted` notice, while every other undecodable token decodes fresh **with** one.
*Category:* Functional. *Level:* Unit. *Traces:* FSPEC E-24, AT-48; TSPEC *Interfaces* → notice
channel (`session-restarted` row); PLAN P1-05/P1-06.
*Oracle:* differential — same fresh-state return value, different notice sets. Asserting only the
state would make the two indistinguishable; the notice is the whole observable.

**PROP-ITER-16** — After session state is discarded mid-run and the session continues, preflight
must be evaluated a **second** time, the idle counter and schedule position must restart at zero,
and the report must name the restart.
*Category:* Error Handling. *Level:* Integration. *Traces:* FSPEC §3.1, E-24, AT-48; PLAN P5-01.
*Oracle:* three positive conjuncts. This is what lets PROP-PRE-06's "exactly once per session"
be falsifiable rather than unfalsifiable across a restart.

### Preflight (PROP-PRE)

**PROP-PRE-01** — `evaluatePreflight` must return a `conditions` array of **length 2** with an
explicit `held` boolean on each member, for every policy value and every input — including when the
first condition fails.
*Category:* Contract. *Level:* Unit. *Traces:* REQ AC-3.4, FSPEC BR-11b, AT-16; TSPEC *Oracle
discipline* item 1; PLAN P1-03/P1-04.
*Oracle:* `conditions.length === 2` and both `held` values are `typeof "boolean"`. This shape
exists precisely so "the check ran and passed" is assertable rather than inferred from silence, and
it is the named killer for TSPEC mutant (c) — short-circuiting the second condition under `"off"`.

**PROP-PRE-02** — Preflight must **refuse** when the engine's own startup result is not ok under
`preflight: "strict"`: zero iterations run and the refusal carries the engine's reason and
`STARTUP_REMEDIATION`.
*Category:* Security / Error Handling. *Level:* Integration. *Traces:* REQ AC-3.1, FSPEC BR-10,
AT-11, AT-44; TSPEC *Architecture* §3; PLAN P4-06/P4-07.
*Oracle:* driven **through the production `cmdQueue`** with the real `!startup.ok` branch in place
and only `deps.startupFor` scripted. Asserting `evaluatePreflight` in isolation is explicitly not
the oracle — it would prove nothing about `cli.mjs`'s return. `STARTUP_REMEDIATION` does not exist
at HEAD in `pdlc/engine/lib/startup.mjs`; PLAN P4-02 exports it, and PROP-PRE-09 pins its bytes.

**PROP-PRE-03** — An ok startup result whose version preamble reports a mismatch must **not**
cause a refusal on the preamble alone: iteration 1 runs, the session report positively records the
readiness result as **passed**, and the mismatch is named as an `engine-version-mismatch` notice.
*Category:* Functional. *Level:* Integration. *Traces:* REQ AC-3.1, FSPEC BR-10, AT-12; PLAN
P1-03/P1-04.
*Oracle:* the positive conjunct — readiness recorded as passed — is what fails a build in which
preflight was never evaluated at all. "Did not refuse" alone is unfalsifiable here.

**PROP-PRE-04** — Under `dirtyTreePolicy: "tracked"` (the default), preflight must refuse when a
tracked file carries uncommitted changes, pass when only untracked files are dirty, and pass when
only ignored files are dirty; under `"any"` it must additionally refuse on untracked files, and
still pass on ignored files alone.
*Category:* Functional. *Level:* Unit. *Traces:* REQ AC-3.2, FSPEC BR-11, E-16, E-17, AT-13; PLAN
P1-03/P1-04.
*Oracle:* six cells — {tracked-dirty, untracked-only, ignored-only} × {`"tracked"`, `"any"`} —
each asserted as an exact `held` boolean, so the ignored-file row (pass under **both** policies) is
a positive control that an over-broad `git status --porcelain` implementation fails. The seam is
`git status --porcelain` responses through the argv-keyed `gitFn` double.

**PROP-PRE-05 (negative)** — A preflight refusal must run **zero** iterations, leave
`docs/_queue/QUEUE.md` byte-identical to its pre-session content, and report stop reason
`preflight-refused` — a value textually distinguishable in its `detail` from
`engine-dispatch-refused`'s.
*Category:* Data Integrity. *Level:* Integration. *Traces:* REQ AC-3.3, NFR-2, FSPEC BR-11a, E-18,
AT-14; TSPEC *Data Model* §5; PLAN P5-01/P5-02.
*Oracle:* four positive conjuncts — iteration count `0`, `readFileFn` byte-identity over
`QUEUE.md` before and after, exact stop reason, and a `notEqual` between the two rendered `detail`
strings. That last conjunct is the only falsifier for TSPEC *Data Model* §5's textual-
distinguishability claim, which is otherwise a stated contract with no oracle; both cases must
therefore run in the **same** test file. The refusal must be placed before `readFileFn(queuePath)`
in `main`, which is what makes the byte-identity structural rather than incidental.

**PROP-PRE-06** — Across a session of three iterations, the engine-readiness check and the
working-tree check must each be evaluated **exactly once**, before iteration 1.
*Category:* Idempotency. *Level:* Integration. *Traces:* REQ AC-3.1 ("once per session"), FSPEC
§3.1 S1–S3, AT-17; PLAN P5-01.
*Oracle:* **call-count spies** on the two seams asserting `1` each across three iterations. A shape
assertion cannot falsify a per-iteration re-check — the envelope is identical either way — so the
oracle is behavioural. PROP-ITER-16 supplies the restart case that keeps "exactly once" meaningful.

**PROP-PRE-07** — Under `preflight: "off"` with a failing **working-tree** condition, a
`preflight-warning` notice naming that condition and the **same remediation a refusal would give**
must be emitted, **and** iteration 1 must run.
*Category:* Functional. *Level:* Integration. *Traces:* REQ AC-3.4, FSPEC BR-11b, AT-15a; PLAN
P1-03/P1-04, P4-06.
*Oracle:* both conjuncts. The remediation string is asserted equal to the string the `"strict"`
refusal emits for the same condition — a paraphrase reds, per the fixture-string verbatim rule.

**PROP-PRE-08 (negative)** — Under `preflight: "off"` with a **not-ok engine startup** result, the
engine's own dispatch refusal must stand: `runQueue` is **never reached**, the exit code is `1`,
`emitReport(null, …)` is the report call taken, the iteration count is `0`, no wait is taken,
`docs/_queue/QUEUE.md` is byte-identical, the `preflight-warning` notice still carries
`STARTUP_REMEDIATION`, and the stop reason is `engine-dispatch-refused` — not `preflight-refused`.
*Category:* Security. *Level:* Integration (engine). *Traces:* REQ AC-3.4, FSPEC BR-11b, BR-10,
E-19, E-20, AT-15b, AT-44; DEC-LOOP-06 (alternative **B** Chosen, **D** Rejected); PLAN P4-06/P4-07.
*Oracle:* eight positive conjuncts, never an absence-only "iteration 1 does not proceed". This is
the named killer for TSPEC mutant (h) — re-introducing a policy-aware `!startup.ok` branch. The
asymmetry against PROP-PRE-07 is the whole point of AC-3.4 and must be falsifiable in **both**
directions, which is why the two cases live in one file.

**PROP-PRE-09** — `STARTUP_REMEDIATION` must be an exported frozen constant from
`pdlc/engine/lib/startup.mjs` whose value equals a literal transcription written into the test,
and `cmdDoctor`'s printed bytes on a not-ok startup must be **unchanged** against a baseline
captured before any Phase-4 source edit lands.
*Category:* Contract. *Level:* Unit (engine). *Traces:* FSPEC BR-10, AT-44; PLAN P4-01, P4-02,
P4-03.
*Oracle:* byte-equality against the captured baseline. At HEAD the remediation text is an inline
template literal inside `cmdDoctor` (`pdlc/engine/bin/cli.mjs`, `cmdDoctor`, the
`--plugin-root` / `PLUGIN_ROOT_ENV` sentence); the baseline must be captured in batch 2, **before**
P4-02 lands, or the oracle compares the refactor with itself.

**PROP-PRE-10 (negative)** — No value of `loop.preflight` may permit an iteration to run against an
unready engine, and the engine must **never** be faked to let one run.
*Category:* Security. *Level:* Integration. *Traces:* REQ AC-3.4, FSPEC BR-11b, E-20, AT-44;
DEC-LOOP-06; PLAN P4-06.
*Oracle:* asserted over the bounded policy universe `{"strict", "off"}` × {engine missing, engine
fails to start}: in all four cells the iteration count is `0`. The universe is bounded because
`Policy` is a two-member union (TSPEC *Interfaces*); "every configuration" would be unbounded and
no test discharges it.

### Escalation writing (PROP-ESC)

**PROP-ESC-01** — All three escalation sources — an advisory seam refusal, a refused merge, and a
pipeline halt — must append an entry to `docs/_queue/ESCALATIONS.md` within one session.
*Category:* Integration. *Level:* Integration. *Traces:* REQ AC-4.1, FSPEC §3.5, AT-18; PLAN P5-05.
*Oracle:* one scripted session drives all three append sites through **one** `_appendFile`
collector; the oracle is set-equality between the `sourceLabel`s parsed back out of the collected
log and the literal three-member set `{advisory-seam, merge-refusal, pipeline-halt}`. Non-vacuity:
the collector is asserted non-empty and each append is attributed to its own call site. Three
separate per-site tests would not falsify "one source silently stopped appending" the way one
shared collector does.

**PROP-ESC-02** — The set of advisory escalation sources that append to the log must be
**set-equal** to the live advisory seam catalogue's membership, computed by re-enumerating
`ADVISORY_SEAMS` (`pdlc/workflows/orchestrate-dev.js`, a six-member frozen array
`["A1","A2","A3","A4","A5","A6"]`) at test time rather than compared against a literal list.
*Category:* Integration. *Level:* Integration. *Traces:* REQ AC-4.1 (set-equality against the
catalogue, never a count restated here), FSPEC AT-19; PLAN P5-06.
*Oracle:* set-equality **plus two non-vacuity conjuncts** — both sides non-empty, cardinality at
least the frozen enumeration's, and the named member `A6` present on both. Without them a catalogue
read as empty makes ∅ = ∅ green with zero sources wired. Deleting a catalogue member reds this
feature's own oracle, which is the intended coupling.

**PROP-ESC-03** — Every appended entry must carry BR-12's seven required fields, asserted as
**containment of a literal transcription of BR-12's set**, with the decision sentence as the
entry's first prose statement.
*Category:* Contract. *Level:* Integration. *Traces:* REQ AC-4.2, FSPEC BR-12, AT-21; PLAN P3-03.
*Oracle:* containment, so a dropped field reds while the shipped renderer's extra fields do not.
Field order is asserted only for the first-field conjunct, because BR-12 leaves order
unconstrained — asserting full order would fail on a compliant renderer.

**PROP-ESC-04** — A non-advisory entry must render `## {iso} — {feature} — {source}` with a
`| Source |` row and **no** `| Seam |` row, where `{source}` is exactly one member of
`LOOP_SOURCES` per block and never an alternation; the advisory branch's structure must be
byte-identical to HEAD for an unchanged advisory input.
*Category:* Contract. *Level:* Integration. *Traces:* REQ AC-4.1a, FSPEC BR-12a, AT-20; TSPEC
*Data Model* §4; PLAN P3-03/P3-04.
*Oracle:* the byte-identity half is a **regression control** captured from HEAD's
`renderEscalationEntry` (`pdlc/workflows/orchestrate-dev.js`, `renderEscalationEntry`) before
P3-04 lands. Without it, widening the renderer could silently reshape advisory entries and the
consolidation agent's parser would drift with no test naming the cause.

**PROP-ESC-05** — `LOOP_SOURCES` must be **disjoint** from `ADVISORY_SEAMS`, so an advisory and a
non-advisory entry are distinguishable from the log file alone.
*Category:* Data Integrity. *Level:* Unit. *Traces:* REQ AC-4.1a, FSPEC BR-12a; TSPEC *Traceability*
BR-12a row; PLAN P1-02, P3-04.
*Oracle:* empty set intersection, **plus** both sets asserted non-empty — an empty `LOOP_SOURCES`
would make disjointness vacuously true. `LOOP_SOURCES` occurs **zero** times in
`pdlc/workflows/orchestrate-dev.js` at HEAD; P3-04 **will declare** it there as its own frozen
literal rather than importing from `./lib/` — the same planned-state marking PROP-PRE-09 uses for
`STARTUP_REMEDIATION`. PLAN P3-03 pins the two equal by a differential assertion, which this
property requires to be present.

**PROP-ESC-06** — Given a log containing advisory entries and at least one non-advisory entry whose
presence would otherwise change the maximum, the calibration's **whole output** over that log must
equal its output over the same log with every non-advisory entry removed — per-seam totals,
distinct feature counts, entry count, corpus state, **and** the derived over/tie/under candidate —
while the operator view still shows the non-advisory entries.
*Category:* Data Integrity. *Level:* Integration. *Traces:* REQ AC-4.1a, FSPEC E-09, AT-20; PLAN
P6-01/P6-02.
*Oracle:* whole-output identity, compared as a whole rather than totals alone. The fixture must be
constructed so a naive reader flips `over` to a non-advisory source (or suppresses it into a
`tie`), and the test asserts that the naive comparison **would have differed** — the non-vacuity
control. An oracle over totals alone passes on that fixture, which is why the derived candidate is
the conjunct that bites.

**PROP-ESC-07** — `corpusState` must be derived from **counted entries**, not the raw block count,
so a malformed advisory block no longer lifts an otherwise-empty corpus to `present`.
*Category:* Data Integrity. *Level:* Integration. *Traces:* FSPEC E-09; DEC-LOOP-03; TSPEC
*Mutation sensitivity* mutant (b); PLAN P6-02, P6-03.
*Oracle:* a corpus of exactly one malformed advisory block yields `corpusState` absent, not
`present`. The sibling oracle in `pdlc/workflows/__tests__/consolidationAdvisory.test.js` (present
at HEAD) asserts the old derivation and **must be updated in the landing commit**, not left red —
PLAN P6-03 owns that co-change, and this property is unsatisfied until it lands.

**PROP-ESC-08** — At each of the **five** merge-phase escalation sites in
`pdlc/workflows/orchestrate-dev.js`, an entry must be appended to `docs/_queue/ESCALATIONS.md`
**and** that site's existing notice string must still reach the caller unchanged; the append is
awaited outside the try/catch owning the merge action.
*Category:* Integration. *Level:* Integration. *Traces:* REQ AC-4.1, FSPEC BR-12a; PLAN P3-07/P3-08.

*Site inventory, measured at `8eb43beed`* (`grep -n "MERGE ESCALATION:" pdlc/workflows/orchestrate-dev.js`).
The sites do **not** share one mechanism, and an oracle written as "four `escalations.push` cells"
is not constructible: there are **two** pushes, not four, and `MERGE_ESCALATIONS.guard` /
`MERGE_ESCALATIONS.ci` — though declared in the frozen catalogue — have **no production caller at
HEAD** (their only callers are `advisoryEscalationLog.test.js` and `mergePhase.test.js`).

| # | Site | Mechanism | Surviving-notice conjunct | Fixture requirement |
|---|---|---|---|---|
| 1 | `MERGE_ESCALATIONS.queue({…})` | push onto the mutable `escalations` accumulator | the accumulator still holds the catalogue-rendered queue notice | a merged PR whose queue row is not updated |
| 2 | `MERGE_ESCALATIONS.tree({…})` | push onto the same accumulator | the accumulator still holds the catalogue-rendered tree notice | a merged PR whose working tree is not updated |
| 3 | guard, `verdict.matched` variant | **inline template literal** inside an `escalations: [ … ]` array on a returned `{kind: "resolved", mergeStatus: "refused", …}` object | the **returned** `escalations` array still contains its literal | a guard verdict with a non-empty `matched` list |
| 4 | guard, changed-file-list-unretrievable variant | inline template literal, same return shape | as row 3 | a guard verdict whose changed-file list is unretrievable |
| 5 | CI evidence absent | inline template literal, **conditional**: `escalations: ci.escalate ? [ … ] : []` | as row 3 | `ci.escalate` must be scripted **truthy**, or the cell silently exercises the empty branch and asserts nothing |

*Oracle:* five cells, one per row. Each asserts (a) exactly one append at that site, (b) the site's
own notice string still present in the escalations that site yields — *pushed onto the accumulator*
for rows 1–2, *present in the returned array* for rows 3–5 — and (c) the appended entry's
`sourceLabel` is `merge-refusal`. The surviving-notice conjunct is what falsifies an implementation
that **replaces** the notice with the append rather than adding to it; it has to be re-expressed
per mechanism, because rows 3–5 have no push to survive. **Non-vacuity:** row 5's `ci.escalate`
truthiness is asserted in the fixture *before* the behaviour is exercised, so an empty-branch cell
reds instead of passing over an empty array (O-4 row).

*Scope note — not a licence to widen.* This property asserts only that an **append** is added at
each of the five sites. It does **not** require rows 3–5 to be converted into
`MERGE_ESCALATIONS.guard` / `.ci` calls: that conversion would rewrite strings existing assertions
in `mergePhase.test.js` and `advisoryEscalationLog.test.js` pin, and no requirement asks for it.
The inline literals stay in place. PLAN P3-07/P3-08's task text says *"its four escalation sites"*,
which does not match this inventory; that mismatch is routed upstream as **G-4** and is not folded
into this document's own claim.

**PROP-ESC-09** — A halt escalation must be appended **after** `rewriteStatus(…, "halted", …)` and
**before** `finish({outcome: "halted", …})`, so the durable row survives an append failure.
*Category:* Data Integrity. *Level:* Integration. *Traces:* REQ AC-4.7, FSPEC E-08; PLAN P5-03/P5-04.
*Oracle:* a rejecting `_appendFile` produces an `escalation-append-failed` notice **and** the
queue row still reads `halted` — the ordering is falsified by the row's post-failure content, not
by inspecting call order in the source.

**PROP-ESC-10** — An escalation append failure must be surfaced in the session report as an
`escalation-append-failed` notice, and the escalating phase's own outcome must be **what it would
have been had the append succeeded**.
*Category:* Error Handling. *Level:* Integration. *Traces:* REQ AC-4.7, FSPEC E-08, AT-29; PLAN
P5-03.
*Oracle:* differential — the same fixture run with a succeeding and a rejecting `_appendFile`
yields identical phase outcomes and differs only in the notice set. Asserting the outcome against a
hard-coded expectation would not prove the invariance.

**PROP-ESC-11 (negative)** — For each of the five behavioural credential-prefix families
(`gh[pousr]_`, `github_pat_`, `sk-`, `xox[baprs]-`, `AKIA`), a seeded token in the diagnosis and in
an evidence line must be replaced by `[redacted:{n} chars]` with `n` equal to the seeded token's
length, and BR-12's other six fields must **still render**.
*Category:* Security. *Level:* Integration + Unit (property-based). *Traces:* REQ NFR-5, FSPEC
BR-18, AT-34; DEC-LOOP-05; PLAN P3-01/P3-02, P9-01.
*Oracle:* redaction proven **positively on a known seed**, never an unfalsifiable "contains no
secret" scan over an arbitrary entry. One seeded positive per family; the property-based half draws
a concrete `prefix` instance from a family (`ghu_`, `xoxb-`, …) — never the character-class source
text — and asserts the output contains neither the drawn prefix nor the run. Named killer for
TSPEC mutant (g), deleting one prefix family.

**PROP-ESC-12 (negative)** — `redactEntryText` must **not** fire on input containing no catalogue
prefix at any position — 40-hex git oids and `--loop-state` base64url tokens filtered to exclude
every catalogue prefix as a substring — returning the input unchanged; and it must **not** fire on
a prefix appearing in a run's **interior** rather than at its start.
*Category:* Security. *Level:* Unit (property-based). *Traces:* REQ NFR-5, FSPEC BR-18; DEC-LOOP-05
(b)'s accepted false-positive residual; TSPEC *Mutation sensitivity* mutant (f); PLAN P9-01.
*Oracle:* the anchor half is the only assertion distinguishing a compiled-and-correct
prefix-anchored pattern from a copied constant; the 40-hex-oid half is the named killer for mutant
(f). The generator is deliberately **not** "any valid token": base64url admits `AKIA…`, which is
correctly redacted — a known false positive, not a defect.

**PROP-ESC-13** — Closed-vocabulary fields (`Feature`, `Seam`, `Source`, `Root cause`, the heading
timestamp, `Pipeline state`) must **not** be passed through the redactor; only free-prose fields —
decision sentence, `Refusal reason`, diagnosis, proposed action, each evidence line — are.
*Category:* Data Integrity. *Level:* Unit. *Traces:* FSPEC BR-18; PLAN P3-02.
*Oracle:* a fixture whose `Feature` name is itself prefix-shaped (e.g. `sk-demo`) renders
unredacted, while the same string inside the diagnosis renders redacted. This is the positive
control that a blanket whole-block redactor fails.

**PROP-ESC-14** — `docs/_queue/ESCALATIONS.md` must be created on first escalation, and its absence
must yield an **empty view with no error and no file created by the render**.
*Category:* Error Handling. *Level:* Unit. *Traces:* REQ AC-4.6, FSPEC BR-17, E-06, AT-28; PLAN
P2-01/P2-02.
*Oracle:* `parseEscalationLog(null)` returns `{entries: [], parseNotices: []}` **and no write
seam is called** — a call-count spy on the write seam asserting `0`, since a render that creates an
empty file returns the same empty view.

**PROP-ESC-15** — A backoff re-invocation that re-triages an **already-escalated** candidate must
append a **further** entry block: after the second iteration the number of entry blocks on disk for
that `(source-or-seam, feature, conditionKey)` must be **strictly greater** than after the first,
and the operator view over the same log must show **one** item at `occurrences: 2`.
*Category:* Data Integrity. *Level:* Integration. *Traces:* REQ AC-4.1a, AC-4.5, FSPEC **BR-09a**,
BR-15, E-26, AT-50; PLAN P5-01/P5-02 (driver), P2-05/P2-06 (view).
*Oracle:* one scripted session of **two** iterations over an unchanged queue, the second entered
through the backoff schedule, driving the real append site through one `_appendFile` collector —
**not** three fixture-manufactured appends. Three positive conjuncts: (1) block count after
iteration 2 is exactly one greater than after iteration 1, measured by re-parsing the collected log
between the two iterations rather than at the end, so growth is observed rather than inferred;
(2) the second block is byte-identical to the first in its closed-vocabulary fields
(`Feature`, `Seam`, `Source`, `Root cause`) and differs only in its heading timestamp, which is what
makes it *the same situation* rather than a new one; (3) `buildOperatorView` over the two-block log
yields exactly one item whose `occurrences` is `2` and whose `entryIds` has **two distinct** member
ids, oldest first. Conjuncts (2) and (3) require the fixture to script **two distinct epochs**, one
per iteration (F-3's `backoff-reappend` row): under F-1's single fixed epoch the heading
`## {iso} — {feature} — {source}` is identical between the blocks, so "differs only in its heading
timestamp" has nothing to differ in and `entryId = sha256(canonicalBlock).slice(0,12)` collides,
leaving both conjuncts vacuous. Conjunct (1), the block-count growth, is independent of the epoch.
**Why this is not covered by PROP-VIEW-06 or PROP-ESC-01.** PROP-VIEW-06's three appends are
fixture-manufactured, so it exercises the *view's* collapsing, not the *loop's* non-suppression;
PROP-ESC-01 drives three appends from three **different** sources in one session, never the same
source twice across a backoff. Without this property an implementation that de-duplicates at the
loop's own append site — the most natural "optimisation" on a retry path — passes all other
properties while violating BR-09a and silently deflating the calibration input the consolidation
agent reads (BR-15, E-26). **Non-vacuity (O-4 row):** the growth conjunct is the positive form;
"the append is not suppressed" alone is absence-only and would pass on a log that never received a
first append either. The first-iteration block count is therefore asserted to be exactly `1` before
the second iteration runs.
*PLAN note.* No PLAN row's task text names this cell today — P5-01's driver row does not mention a
backoff re-append, and P2-05/P2-06 own AT-50 at the view layer only. Routed upstream as **G-5**;
the property is homed in `loopQueueDriver.test.js` (P5-01's file) on the assumption the cell lands
there.

### Operator view (PROP-VIEW)

**PROP-VIEW-01** — Open view items must be ordered by **blocked-feature count descending**; given
three entries whose features block 4, 1 and 0 downstream features, the view's order must be exactly
`4, 1, 0`.
*Category:* Functional. *Level:* Unit. *Traces:* REQ AC-4.3, FSPEC BR-13, AT-22; PLAN P2-05/P2-06.
*Oracle:* asserted as a **full expected sequence**, not a first-element check — a first-element
oracle passes on `[4, 0, 1]`.

**PROP-VIEW-02** — The blocked-feature count must be computed over the **effective** dependency
union — the `QUEUE.md` `Depends-On` column ∪ the REQ frontmatter's own `depends-on` — as a
transitive closure over non-`done` rows, excluding the entry's own feature.
*Category:* Data Integrity. *Level:* Unit. *Traces:* REQ AC-4.3, FSPEC BR-13, E-11, AT-23; PLAN
P2-03/P2-04.
*Oracle:* a dependent declaring its dependency **only** in REQ frontmatter is counted, and the same
fixture counted from the `Depends-On` column alone yields a **strictly smaller** number — the
differential is what pins the union. Asserting the union's count alone would pass on a
column-only implementation whose fixture happened to declare both. The union is the one
`precheckDependencies` resolves (`pdlc/workflows/orchestrate-queue.js`) and the one
`pdlc/templates/QUEUE.md` documents.

**PROP-VIEW-03** — An entry naming a feature with **no** queue row must count 0.
*Category:* Error Handling. *Level:* Unit. *Traces:* REQ AC-4.3, FSPEC BR-13, E-10; PLAN P2-03.
*Oracle:* exact `0`, plus the entry still appearing in the view — a count of 0 must not drop the
item.

**PROP-VIEW-04** — On equal blocked-feature counts, oldest timestamp must break the tie first, then
feature name ascending; the resulting sequence must be **stable across renders**.
*Category:* Idempotency. *Level:* Unit. *Traces:* REQ AC-4.3, FSPEC BR-13, E-13, AT-24; PLAN
P2-05/P2-06.
*Oracle:* a fixture with equal counts **and** equal timestamps, so the name comparator is the only
remaining discriminator and is therefore exercised; then two renders of the same input compared for
sequence equality. A fixture with distinct timestamps would leave the name tie-break untested.

**PROP-VIEW-05** — `blockedFeatureCounts` must terminate on a dependency graph containing a cycle,
with each feature contributing at most 1 and every count bounded above by the number of non-`done`
rows; and the result must be **invariant under permutation of the input rows**.
*Category:* Data Integrity. *Level:* Unit (property-based). *Traces:* FSPEC BR-13, E-12, AT-42;
TSPEC *Property-based strategies*; PLAN P2-03/P2-04, P9-01.
*Oracle:* stated as a `fast-check` law over arbitrary dependency graphs including cycles, rather
than one cycle fixture — the permutation-invariance conjunct is what catches an implementation
whose visited-set traversal depends on row order.

**PROP-VIEW-06** — Repeated occurrences of the same escalation for the same feature must collapse
into **one** view item carrying an occurrence count, while the number of entry blocks on disk stays
unchanged.
*Category:* Functional. *Level:* Unit. *Traces:* REQ AC-4.5, FSPEC BR-15, E-14, AT-26; PLAN
P2-05/P2-06.
*Oracle:* three appends of the same escalation ⇒ one item with `occurrences: 3` **and** three
blocks still on disk. Both halves are required: the on-disk conjunct is what keeps collapsing a
rendering operation and preserves the per-seam totals the consolidation agent's calibration reads.

**PROP-VIEW-07** — The recurrence key must be `(source-or-seam, feature, conditionKey)` and must
**not** fall back to the rendered decision sentence.
*Category:* Data Integrity. *Level:* Unit. *Traces:* FSPEC BR-15; TSPEC *Mutation sensitivity*
mutant (e); PLAN P2-05.
*Oracle:* three appends whose rendered sentences **differ in an interpolated count** still collapse
to `occurrences: 3`. A sentence-keyed implementation yields three items on that fixture; a fixture
with identical sentences cannot distinguish the two, so the differing-sentence construction is
load-bearing.

**PROP-VIEW-08** — An entry's status must be a **property of the view** derived from a later
decision record naming it — never a rewrite of the appended block. Given an entry resolved by a
durably recorded decision, the view must omit it, all four of the decision's
outcome / who-decided / when / which-entry must be retrievable, and the entry's block on disk must
be **byte-identical** to before the decision.
*Category:* Data Integrity. *Level:* Unit + Integration. *Traces:* REQ AC-4.2, AC-4.4, FSPEC BR-14,
AT-25; PLAN P3-05/P3-06, P2-05/P2-06.
*Oracle:* a decision record missing `Decided by` **reds** — the four-field retrieval is asserted
member by member, not as "a decision exists". Retrieval is through `parseEscalationLog` into
`decidedOutcome` / `decidedBy` / `decidesId` / `decidedAt`, **never** by regex over `blockText`;
a regex oracle would pass on a renderer that emits the fields in prose rather than as parseable
rows.

**PROP-VIEW-09** — Collapse (V3) must run **before** the decision overlay (V4), so `occurrences` is
the on-disk member count. Given an entry resolved by a decision and then the same escalation
appended again for the same feature, the view must show **one open item**, its occurrence count
equal to the on-disk recurrences, the earlier decision still retrievable, and every block on disk
byte-identical.
*Category:* Data Integrity. *Level:* Unit. *Traces:* REQ AC-4.4, AC-4.5, FSPEC BR-14, BR-15, E-15,
AT-43; TSPEC *Mutation sensitivity* mutant (d); PLAN P2-05/P2-06.
*Oracle:* the `occurrences: 2` conjunct is the named killer for mutant (d) — an implementation
overlaying before collapsing reports `occurrences: 1`. A decision neither resets nor suppresses the
count, and the item's status must be asserted equal to the literal `"open"`, not merely
"not resolved".

**PROP-VIEW-10** — An unparseable block must be **skipped** with a named parse notice carrying
enough detail to locate it, and the rest of the log must render; a malformed corpus must never
refuse the render or abort the loop.
*Category:* Error Handling. *Level:* Unit. *Traces:* REQ AC-4.7, FSPEC BR-16, E-07, AT-27; TSPEC
*Data Model* §4b; PLAN P2-01/P2-02.
*Oracle:* three cases, one per recognised shape, each producing its own `reason` —
`missing-field: {name}`, `duplicate-field: {name}`, `unrecognised-shape` — with a 1-based
`blockIndex` and the block's `heading`. Given a log whose **second of three** blocks is
unparseable, blocks one and three render and the notice locates block two: the middle position is
what falsifies a parser that truncates at the first failure.

**PROP-VIEW-11** — Duplicate-field detection must **count** matches per recognised field name
rather than taking the shipped first-match.
*Category:* Data Integrity. *Level:* Unit. *Traces:* FSPEC BR-16; TSPEC *Data Model* §4b; PLAN
P2-02.
*Oracle:* a block carrying `| Feature |` twice yields `duplicate-field: Feature`; a first-match
parser returns a well-formed entry on that fixture and this property is its only falsifier.

**PROP-VIEW-12** — The view must be **recomputed from `docs/_queue/ESCALATIONS.md` and
`docs/_queue/QUEUE.md` on every render**, holding no state between iterations, and rendering must
never write to the log.
*Category:* Idempotency. *Level:* Unit + Integration. *Traces:* REQ AC-4.3 (view holds no state),
AC-4.1 (log is sole input), FSPEC §3.3; PLAN P2-06, P5-02.
*Oracle:* two renders over the same inputs are deep-equal; a write-seam call-count spy asserts `0`
across both; and a render whose only change is a mutated `QUEUE.md` produces a changed order —
the positive control that the second render actually re-read rather than returning a cached value.

**PROP-VIEW-13 (negative)** — No render may rewrite, reorder or delete a block already written to
`docs/_queue/ESCALATIONS.md`; the append-only, newest-last guarantee
(`appendEscalationEntry`, `pdlc/workflows/orchestrate-dev.js`) must survive every operation this
feature adds.
*Category:* Data Integrity. *Level:* Integration. *Traces:* REQ AC-4.1 preamble (this REQ does not
supersede `pdlc-advisory-tier` AC-10.4), FSPEC §3.3, BR-14, BR-15; PLAN P2-06, P3-06.
*Oracle:* whole-file byte-identity across a session that renders the view, records a decision and
collapses recurrences — asserted as `before === after` for every pre-existing block, with the
positive conjunct that the file **grew** by exactly the appended blocks. Byte-identity of the whole
file would be wrong (appends are expected); prefix-identity plus the growth conjunct is the
falsifiable form.

**PROP-VIEW-14** — `entryIds` must retain **every** member id of a collapsed item, oldest first.
*Category:* Data Integrity. *Level:* Unit. *Traces:* FSPEC BR-15, AC-4.5; TSPEC *Interfaces* →
`EscalationEntry`; PLAN P2-06.
*Oracle:* three collapsed occurrences yield three ids in ascending timestamp order — the conjunct
that keeps a collapsed item traceable back to the individual blocks on disk, which AC-4.4's
decision records need in order to name an entry.

### Boundaries and negative properties (PROP-BND)

**PROP-BND-01 (negative)** — The loop driver must **never** write a queue row. Across a completed
session of N iterations, every commit touching `docs/_queue/QUEUE.md` in the session's range must
have been produced by a queue invocation, each carrying `commitQueueRow`'s own message form
`chore(queue): {feature} → {status}` (`pdlc/workflows/orchestrate-queue.js`, `commitQueueRow`), and
none by the driver.
*Category:* Data Integrity. *Level:* Git-history oracle (new level). *Traces:* REQ NFR-2, FSPEC
BR-19, AT-30; PLAN P5-07.
*Oracle:* a temporary git repo is initialised in a fixture directory and a scripted session runs N
iterations against it through the **real** `gitFn`. A driver-side write is falsified by a commit in
the range that no invocation produced. **No count-equality is asserted** — BR-19 states a
row-writing invocation commits the file more than once, so `commits === invocations` would red on
correct behaviour. The zero-iteration half is PROP-PRE-05's byte-identity.

**PROP-BND-02 (negative)** — The loop must **never** set `ready: true`, under any configuration. A
`ready: false` row must produce iteration outcome `idle`, the invocation must record the candidate
as skipped with the `"not ready"` reason, the session report must name both, and the row's bytes
must be unchanged.
*Category:* Security. *Level:* Integration. *Traces:* REQ AC-5.3, NFR-3, FSPEC BR-20, E-21, AT-31;
PLAN P5-01/P5-02.
*Oracle:* asserted **set-equal across a bounded configuration universe** — the four pairings of
`preflight` ({`"strict"`, `"off"`}) with `dirtyTreePolicy` ({`"tracked"`, `"any"`}), crossed with
`backoffSchedule` ∈ {declared default, `[]`} and `idleStopAfter` ∈ {declared default, `0`}, plus
one unknown-key case. "Every configuration" is unbounded and no test discharges it; this
enumeration is the discharging form. Four positive conjuncts per cell, never `ready !== true`.

**PROP-BND-03 (negative)** — The queue report's outcome set must remain the closed five-member set
`{ran, halted, idle, blocked, no-queue}` — a not-ready candidate is a **skip**, never a sixth
outcome.
*Category:* Contract. *Level:* Unit. *Traces:* REQ AC-5.3, FSPEC BR-20, §3.2; TSPEC *Data Model*
§6; PLAN P5-01.
*Oracle:* the outcome set is `deepEqual`'d against a literal five-member transcription of
`buildQueueReport`'s own typedef (`pdlc/workflows/orchestrate-queue.js`), and the two new report
fields `loop` and `operatorView` are asserted to arrive in the conditional-spread idiom — present
when populated, absent otherwise — so an unconditional spread that ships `undefined` reds.

**PROP-BND-04** — The documented guarded-path set must be **set-equal** to the merge phase's
**effective** guard-path set computed at render time via the shipped `effectiveGuardPaths`
(`pdlc/workflows/orchestrate-dev.js`, `effectiveGuardPaths`), with `pdlc/engine/` a member of the
configured extras while remaining **absent** from the shipped defaults `MERGE_GUARD_DEFAULTS`.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ AC-5.1a, FSPEC BR-23, BR-24, AT-32;
PLAN P8-08.
*Oracle:* the documented extras are read from `pdlc/OPERATIONS.md` and the effective set is
**derived**, never restated as a literal — a restated list goes stale the first time the set
widens. Read from the repo's **tracked default-branch content** rather than the working tree, so
an untracked machine-local declaration (the case BR-24 excludes) reds. The two membership
conjuncts against `MERGE_GUARD_DEFAULTS` are what prevent an empty-extras configuration from making
the set-equality vacuous.

**PROP-BND-05 (negative)** — No gate delivered by orders 1–4 or by `pdlc-engine-distribution` may
have its **assertion** changed; the `pdlc queue --loop` path must be left exactly as it ships.
*Category:* Contract. *Level:* Integration. *Traces:* REQ NFR-1, REQ §5 carve-out, FSPEC BR-21,
AT-04, AT-52; PLAN P4-04, P9-04.
*Oracle:* `LOOP_STOP_REASONS` and `runQueueLoop` (`pdlc/engine/lib/run.mjs`) are asserted unchanged
against a literal transcription of their HEAD values, and the `--loop` code path is exercised to
its existing outcome. Additive changes to file **enumerations** are permitted and are asserted
additive by PROP-DIST-02; changes to what a gate **asserts** are what this property forbids.

**PROP-BND-06** — Stopping must always be cheap and always safe: an `Esc` at any point leaves a
consistent state, because every iteration is one complete queue invocation.
*Category:* Contract. *Level:* Design property (E-22), asserted structurally. *Traces:* REQ NFR-4,
FSPEC BR-22, E-22; PLAN P5-01.
*Oracle:* one `pdlc queue` process is the interruptible unit. This is the one property with **no
executing behavioural assertion**; its structural proxy is PROP-ITER-01's exactly-one-invocation
call count plus PROP-BND-01's commit provenance — together they establish that no partial write can
straddle an interruption. Recorded here rather than silently omitted, per the "a green PLAN row is
not evidence its deliverable shipped" lesson.

**PROP-BND-07** — The steady-state operator surface must be **set-equal** to exactly four items:
flipping `ready: true` on a REQ, approving a PR that touches a guarded path, resolving open
escalations, and product/business-judgment calls outside the pipeline's scope.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ AC-5.1, FSPEC BR-25, AT-33; PLAN
P8-05, P8-06, P8-07.
*Oracle:* set-equality over the documented surface, **plus** `--loop-state` asserted **absent** from
it (it is an internal flag, not an operator turn), **plus** the setup list asserted disjoint from
the four-item set.

**PROP-BND-08** — The one-time setup list must be documented **separately** from the steady-state
surface and must contain at least AC-5.2's three literal members: installing the engine, creating
`docs/_queue/QUEUE.md` from the shipped template, and installing the loop prompt.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ AC-5.2, FSPEC BR-25, AT-33; PLAN
P8-06, P8-07.
*Oracle:* containment of three literal members. Without the containment conjunct an **empty** setup
list satisfies PROP-BND-07's disjointness. See **Gaps and Routed Errata** G-1: PLAN P8-06's task
text names only two of these three members, so as planned this property's third conjunct reds
against the document P8-06 ships.

**PROP-BND-09 (negative)** — A stop condition arising that is in neither BR-25's steady-state set
nor the documented setup list is a **defect in this feature**, not an expected mode.
*Category:* Observability. *Level:* Policy (not mechanically checkable at delivery). *Traces:* REQ
NFR-6, FSPEC E-23; PLAN — none.
*Oracle:* none exists, and none is claimed. NFR-6 is a standing policy about how a surprise is
**triaged**, not a criterion checkable at delivery; recording it as an unasserted property is
honest, whereas inventing a weak oracle for it would be worse than the gap. Its nearest mechanical
proxy is PROP-RPT-04's stop-reason set-equality: a stop reason added later without a summary reds.

**PROP-BND-10** — `notice()` must **throw** on any code outside `LOOP_NOTICE_CODES`, and each of
the ten codes must have **exactly one** producer inside `collectNotices`.
*Category:* Contract. *Level:* Unit. *Traces:* FSPEC §3.4 notice catalogue, E-23's invariant; TSPEC
*Interfaces* → notice channel; PLAN P1-09/P1-10.
*Oracle:* `notice()` is the **only** constructor of a `Notice`, so the invariant is enforced in one
place at the moment a notice is born; the one-producer conjunct is asserted by driving each code's
stated condition in isolation and asserting exactly one notice of that code results.

**PROP-BND-11** — Every count this document, the TSPEC and the PLAN state about an enumerable set
must be reconciled against the enumeration rather than hand-maintained.
*Category:* Observability. *Level:* Document oracle. *Traces:* TSPEC *Oracle discipline* item 5;
`DEC-ORACLE-05`; PLAN P9-02a, P9-04.
*Oracle:* the stop-reason and notice-code counts are checked against the **length of the literal
arrays** the tests define, never against the frozen constants — the counts and the behavioural
oracle must not share an operand. This is the property that catches "fourteen new test files" style
drift, a pattern this repo has shipped three times.

### Session report (PROP-RPT)

**PROP-RPT-01** — Every iteration's report line must have a field set **set-equal** to a literal
transcription of FSPEC §3.4's per-iteration set: iteration number, queue outcome, feature picked or
an explicit `"none"`, merge status, PR URL when the report carries one, wait (requested and actual)
when a wait was taken, and notices.
*Category:* Contract. *Level:* Unit. *Traces:* REQ AC-7.1, FSPEC BR-27, AT-36; PLAN P1-09/P1-10.
*Oracle:* `deepEqual` of `iterationLine`'s `fields` key set against the literal. A dropped field —
merge status included — reds, while a named notice riding `notices` is **not** a field violation.
The literal is transcribed from §3.4, never derived from the module's own export.

**PROP-RPT-02** — Merge status must be read from `report.pipelineReport.mergeStatus` and rendered
`"n/a"` when there is no pipeline report.
*Category:* Data Integrity. *Level:* Unit. *Traces:* REQ AC-7.1, AC-1.3; TSPEC *Data Model* §6
(Q-04 / REQ O-1); PLAN P1-10.
*Oracle:* two cells — a report with a `pipelineReport` and one without. `buildQueueReport` projects
no top-level merge field (`pdlc/workflows/orchestrate-queue.js`, `buildQueueReport`), so an
implementation reading a top-level `mergeStatus` renders `undefined` on both cells and this
property is its falsifier.

**PROP-RPT-03** — The end-of-session summary's field set must be **set-equal** to a literal
transcription of FSPEC §3.4's **nine** summary members: stop reason, iteration count, features
merged each with its PR URL, features halted, escalations raised this session, open escalation
count, next actionable item, the current operator view, and notices.
*Category:* Contract. *Level:* Unit. *Traces:* REQ AC-2.3, AC-7.2, FSPEC BR-28, AT-37; PLAN
P1-09/P1-10.
*Oracle:* `deepEqual` against the nine-member literal. REQ AC-7.2 is the **authoritative** field set
and AC-2.3 adds none of its own, so a tenth field sourced to AC-2.3 reds. Note the trap TSPEC names
explicitly: **nine fields, ten stop reasons** — different sets, and asserting one against the
other's cardinality is the defect this property is written to catch.

**PROP-RPT-04** — A summary must be emitted on **every** member of §3.4's ten-member stop-reason
enumeration, and the set of stop reasons **exercised** by the session fixtures must be set-equal to
a ten-member literal written into the test: `preflight-refused`, `queue-blocked`, `pipeline-halted`,
`no-queue`, `awaiting-merge`, `idle-exhausted`, `invocation-threw`, `queue-unreadable`,
`backoff-unenterable`, `engine-dispatch-refused`.
*Category:* Contract. *Level:* Unit + Integration. *Traces:* REQ AC-2.3, FSPEC BR-28, §3.4, AT-37;
TSPEC *Data Model* §5; PLAN P1-09/P1-10.
*Oracle:* the **exercised** set is the collected operand; `LOOP_STOP_KINDS` is an operand of
neither side. A session ending on the zero-iteration engine-dispatch path must be among the
fixtures or this reds — which is exactly what makes `engine-dispatch-refused` a real member rather
than a declared one. The preflight-refusal case must additionally report iteration count `0`.

**PROP-RPT-05** — `LOOP_NOTICE_CODES` and `LOOP_STOP_KINDS` must each be set-equal to the same
ten-member literals the behavioural oracles use, asserted in a **separate, deliberately narrow**
consistency test.
*Category:* Contract. *Level:* Unit. *Traces:* TSPEC *Oracle discipline* item 2; PLAN P1-01/P1-02.
*Oracle:* this is the **only** property in this document whose operand is a frozen constant, and it
is deliberately not the behavioural oracle. Keeping it separate is what stops
`deepEqual(LOOP_NOTICE_CODES, LOOP_NOTICE_CODES)` — a comparison that passes for any content —
from standing in for PROP-RPT-04 and PROP-RPT-06.

**PROP-RPT-06** — A session exercising **every one of the ten notice-raising conditions** must
produce a collected notice-code set `deepEqual` to a ten-member literal written into the test:
`config-case`, `config-key-defaulted`, `preflight-warning`, `preflight-held`,
`engine-version-mismatch`, `escalation-parse`, `escalation-append-failed`,
`candidate-skipped-not-ready`, `queue-unreadable`, `session-restarted` — each carrying the subject
its rule names.
*Category:* Observability. *Level:* Integration. *Traces:* FSPEC §3.4 notice catalogue, AT-51;
TSPEC *Interfaces* → notice channel table; PLAN P1-09/P1-10.
*Oracle:* the collected set is what `collectNotices` actually produced across the session, one
fixture case per row of the notice-channel table. A catalogue code that **no condition raises**
then reds — which a constant-compared-with-itself oracle structurally cannot do. The per-subject
conjunct is asserted individually, since a code with the wrong subject is a real defect the set
comparison alone would pass.

**PROP-RPT-07** — When a wait is taken, the per-iteration line must state **both** the requested and
the actual length; when no wait is taken, the wait field must be absent.
*Category:* Observability. *Level:* Unit. *Traces:* FSPEC §3.4, E-25, AT-49; PLAN P1-10.
*Oracle:* the two-cell differential is what makes PROP-ITER-08's schedule assertion readable from
the report rather than from wall-clock time, and what makes E-25's "host could not honour the
requested length" observable instead of silently absorbed.

**PROP-RPT-08 (negative)** — The session report must **never be read back** by any later render:
the authoritative record is the log on disk, and a re-run must reproduce the view from the log
rather than from a prior report.
*Category:* Data Integrity. *Level:* Integration. *Traces:* REQ AC-4.1 ("sole input" rule), FSPEC
§3.4 closing paragraph; PLAN P2-06, P5-02.
*Oracle:* a second session over the same on-disk log with **no** prior report available produces a
view deep-equal to the first session's. A report-reading implementation renders an empty or
degraded view on that fixture. Asserting only "the report is transient" would be unfalsifiable.

### Distribution and instrumentation (PROP-DIST)

**PROP-DIST-01** — `runPrepack` must vendor both new `lib/` modules such that the vendored
`orchestrate-queue.js` is `import()`-able from a packed tree and resolves
`./lib/loop-session.mjs` and `./lib/escalation-view.mjs` through it.
*Category:* Integration. *Level:* Integration (engine). *Traces:* REQ §5 carve-out, FSPEC BR-21,
AT-52; TSPEC *Architecture* §7 D-1; PLAN P7-01/P7-02.
*Oracle:* `runPrepack` is invoked into a temp vendor tree and the vendored module is actually
`import()`ed, reaching both `lib/` modules through it — not a file-existence check. At HEAD
`MODULE_NAMES` is the flat two-entry list `["orchestrate-dev.js", "orchestrate-queue.js"]`
(`pdlc/engine/scripts/prepack.mjs:20`, cited by position because the flatness is the claim), which
creates no `lib/` subdirectory, so without D-1 the import throws `ERR_MODULE_NOT_FOUND` on an
installed engine. This is the red-at-HEAD reason.

**PROP-DIST-02** — Over the diff to each distribution / release-gate enumeration and each approved
`pdlc-engine-distribution` table this feature must agree with, **every pre-existing member must
still be present and unaltered** — the change is provably additive.
*Category:* Contract. *Level:* Integration (engine). *Traces:* REQ §5 carve-out and NFR-1's single
exception, FSPEC BR-21, AT-52; TSPEC *Architecture* §7 D-1…D-6; PLAN P7-00, P7-01/P7-02.
*Oracle:* each enumeration is read **at test time**, never transcribed, and asserted a superset of
its captured pre-change membership. The spec side is **D-4** — `docs/completed/`-side
documentation, i.e. `docs/completed/pdlc-engine-distribution/` TSPEC §5.4's `PK-*` table,
FSPEC §5.2's per-class counts
and AT-3.8b (`TSPEC` *Architecture* §7, D-4 row) — and it must move **first**. The ordering is
enforced by **D-3**, `pdlc/engine/__tests__/_tspec-packed-set.mjs` (present at HEAD), whose own
header states that adding or re-classing a member is a spec change first; D-3 is the single
transcription of that set, not itself a spec-side member. A `deepEqual` against the new membership
would pass on a change that silently dropped an old member, which is why superset-plus-growth is
the falsifiable form.

**PROP-DIST-03** — The packaging copier must **preserve each member's relative path** and create
parent directories.
*Category:* Error Handling. *Level:* Integration (engine). *Traces:* TSPEC *Architecture* §7 D-6,
*Test Strategy* → *AT-52's vendor-tree fixture*; PLAN P7-02.
*Oracle:* at HEAD the copy step is path-lossy — `WORKFLOW_MODULE_NAMES` is `path.basename`-mapped
off `WORKFLOW_MEMBERS` (`pdlc/engine/__tests__/packaging.test.js:49-51`, cited by position because
the mapping site is the claim) and the loop copies to `buildWorkflowsDir/<basename>`
(`packaging.test.js:119-124`). With `lib/` members in the set it throws `ENOENT`. D-6 must land
with D-1 and **D-3** in one task — `WORKFLOW_MEMBERS` is imported from `./_tspec-packed-set.mjs`
(D-3, `packaging.test.js:28-31`), and only `buildPairingRecord` comes from D-2's
`publish-preflight.mjs` (`:25`), so it is D-3's growth alone that flows two flattened `lib/` names
into `packRealTarball()` (TSPEC *Architecture* §7 *Ordering*, D-6 row); a copy of HEAD's flattening
into `loop-distribution.test.js` or `fixture-machine.mjs` would red the required
`Engine tests (ubuntu-latest)` and `Fixture machine` checks respectively.

**PROP-DIST-04** — `**/pdlc/workflows/lib/loop-session.mjs` and
`**/pdlc/workflows/lib/escalation-view.mjs` must be present in the c8 `include` block
(`pdlc/workflows/package.json`), `**/`-anchored and path-qualified, **and** present in
`coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES` literal transcription — the two are one
co-change.
*Category:* Observability. *Level:* Document oracle. *Traces:* REQ §5's out-of-scope clause
(widening the file set a floor ranges over changes no assertion), TSPEC *Test Strategy* →
*Coverage floor*; PLAN P9-02a, P9-02.
*Oracle:* at HEAD `REQUIRED_INCLUDES` is a literal transcription naming exactly the three
pre-existing workflow entries (`pdlc/workflows/__tests__/coverageInstrumentation.test.js:37-41`,
cited by position because the transcription's contents at that position are the claim), and the
existing resolution oracle iterates the `include` block **as found** — so it would pass over a
block that never gained the two new entries. Presence is therefore **unasserted at HEAD**, and this
property is what makes the mutant "ship the `lib/` modules but forget the `include` entries"
killable. The strengthening must land **additively** (the shipped three-entry `toContain` case left
in place) and **before** the block is edited.

**PROP-DIST-05** — Every shipped file this feature adds to the packed channel must be **present and
`import()`able** from a genuinely packed engine tree: the vendored `orchestrate-queue.js` **and
both** `lib/` members (`lib/loop-session.mjs`, `lib/escalation-view.mjs`) must resolve from the
vendor directory `runPrepack` produces over a `packRealTarball()`-built tree.
*Category:* Integration. *Level:* Module integration (`pdlc/engine/__tests__/loop-distribution.test.js`,
test *"vendored orchestrate-queue.js and both lib/ modules are importable from the packed tree"*).
*Traces:* REQ §5 carve-out, FSPEC BR-21, AT-52; TSPEC *Architecture* §7 D-1/D-5; PLAN **P7-01(a)**.
*Oracle:* the assertion is `await assert.doesNotReject(import(url))` against the *file URL of the
vendored copy*, not against a manifest entry — a manifest-only or enumeration-only assertion passes
while `ERR_MODULE_NOT_FOUND` still fires on an installed engine (TSPEC §7), which is why presence
and resolvability are one conjunct here rather than two. Non-vacuity: the tree is built by
`runPrepack` from the real `packRealTarball()` recipe, so the fixture cannot contain a file the pack
step would not have carried; reverting D-1's two path-bearing `MODULE_NAMES` entries reds it.

*Residual risk this property does **not** discharge, carried explicitly (DECISIONS **DEC-LOOP-07**).*
An earlier statement of this property asserted that an installed engine **starts and iterates** a
loop session, homed on the `npm-pack-install-upgrade` leg of `pdlc/engine/scripts/fixture-machine.mjs`
and traced to PLAN P7-03. **That surface is not producible and will not be built.** BR-04 makes an
iteration a pipeline invocation, and the fixture machine has no repo to run one against, so PLAN
**v1.0 marks P7-03 `DESCOPED`** (both its Task and Status cells; the authored specification is
retained as intent, and nothing in it shipped) and DEC-LOOP-07 records the descope, naming
P7-01(a)'s importability conjunct over a genuinely packed tree as *"the coverage argument that
stands in for the leg"* and deferring *"a reduced installed-engine assertion"* as its alternative.
DEC-LOOP-07 accepts the residual explicitly: **no CI check runs the loop path of a
packed-and-installed binary.** This property is therefore deliberately weaker than the AT-52
sentence it traces: it proves the *files are there and resolve*, not that a session *runs*. The gap
is named here so it stays visible, and DEC-LOOP-07's re-evaluation triggers own its closure. It is
**not** an unowned coverage hole and **not** a property without an executing assertion (O-6): the
assertion above executes today; what is descoped is the stronger one.

**PROP-DIST-06** — `node pdlc/workflows/build-runtime.mjs --check` must print no `STALE` line after
**each** `orchestrate-dev.js` write, not only after the last.
*Category:* Contract. *Level:* Integration. *Traces:* TSPEC *Test Strategy*; PLAN P3-02, P3-04,
P3-06, P3-08, P9-03.
*Oracle:* `orchestrate-dev.js` is a member of `CLI_SOURCES` (`pdlc/workflows/build-runtime.mjs`) and
`consolidationBuild.test.js`'s `T32` case — pre-existing and green at HEAD — asserts the check is
clean, so the bundle goes stale after each of the four writes. Regeneration folded into each
writer's definition of done is what makes this property hold at every batch boundary rather than
only at the end. A stale shipped bundle against reviewed source is a standing hazard this repo has
shipped before.

### Documentation surfaces (PROP-DOC)

**PROP-DOC-01** — `pdlc/templates/loop.md` must exist in the shipped plugin, **and** a shipped
document must contain an install instruction naming that exact path.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ AC-1.1, FSPEC BR-26a, AT-45; PLAN
P8-03, P8-06, P8-07.
*Oracle:* both conjuncts. At HEAD `pdlc/templates/` contains exactly `QUEUE.md`, so the existence
half is red at HEAD for a stated reason. This is the **positive** half that BR-26 leaves
unasserted, since BR-26 asserts only that installing is optional.

**PROP-DOC-02 (negative)** — Installing the loop prompt template must **not** be a precondition for
any outcome REQ-LOOP-01…07 requires: an operator running `/loop run /pdlc:orchestrate-queue`
explicitly must get every one of them.
*Category:* Functional. *Level:* Integration. *Traces:* REQ AC-1.1, FSPEC BR-26; PLAN P8-03.
*Oracle:* no rule in the FSPEC depends on the default-prompt convention being honoured — asserted
by driving a full session fixture with **no** template installed and checking the directive
sequence is deep-equal to the same fixture with one installed. A documentation-only assertion here
would be unfalsifiable.

**PROP-DOC-03** — The durability documentation must record all three of AC-6.1's scope-and-lifetime
facts — that `/loop` is **session-scoped**, that it **fires only while a session is open and
idle**, and that it **expires** — **and** each `/loop` scope-or-lifetime literal it states must be
**transcribed from the runtime's own `/loop` documentation**, with that source and the runtime
version cited beside it.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ AC-6.1, FSPEC BR-30, AT-35; PLAN
P8-05, P8-07.
*Oracle:* two conjuncts, evaluated **in order**, mirroring PROP-DOC-04's treatment of AC-6.2/AC-6.3.

1. **Content containment (AC-6.1's first half).** Assert the shipped file's scope-and-lifetime text
   contains all three facts as content — session-scoping, the open-and-idle firing condition, and
   expiry — over whitespace-normalised text, not as presence of a heading. A heading-presence
   oracle passes on an empty section.
2. **Per-literal citation (AC-6.1's second half).** For each `/loop` scope-or-lifetime literal
   present, assert a cited source and runtime version beside it. The literals are checked for the
   citation, not for a value this document restates — a restated value goes stale the first time
   the runtime changes, which is precisely the failure mode AC-6.1 exists to prevent, and AC-6.1
   itself says *"Figures are not restated here"*.

**Non-vacuity control (O-4 row).** Conjunct 2 is a per-literal universal and is satisfied
**trivially** by a document containing zero literals, so a durability page that omitted the
scope-and-lifetime section entirely would pass the property as originally stated. Conjunct 1 is the
control: it is evaluated first and must find all three facts, and the section's literal count is
asserted **≥ 1** before conjunct 2's universal is evaluated. An empty or absent scope-and-lifetime
section therefore **reds** rather than passing. Both conjuncts are document-oracle work inside the
test PLAN P8-05/P8-07 already own — this is a wording change and one O-4 row, not new scope.

**PROP-DOC-04** — The durability documentation must name **both** promotion paths with their stated
trade-offs — Desktop scheduled task (local files, machine must be on) and Routine (cloud, fresh
clone) — **and** state that `orchestrate-dev` is a poor fit for a Routine, giving the working-tree
reason.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ AC-6.2, AC-6.3, FSPEC BR-30, AT-47;
PLAN P8-05, P8-07.
*Oracle:* asserted as **content containment** over the shipped file, not as presence of a heading —
a heading-presence oracle passes on an empty section.

**PROP-DOC-05** — `pdlc/skills/orchestrate-queue/SKILL.md` must carry the session-side half of the
directive protocol: invoke iteration 1 as `pdlc queue --loop-state new`, echo `nextState`, perform
the wait, stop on a `stop` directive; and E-20(b)'s launch-failure detection rule (`command not
found` / exit 127 / spawn failure) with its install remediation.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ AC-1.2, FSPEC BR-11b, E-20, AT-44's
(b) half; PLAN P8-04, P8-07.
*Oracle:* content containment over the tracked SKILL.md. This is the only surface on which the
session — which is a model, not a process — can detect that the engine never launched; without it
E-20's `"off"` case has no session-side observable at all.

**PROP-DOC-06** — `--loop-state` must be documented as an **internal** flag and must be **absent**
from BR-25's four-item steady-state operator surface.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ AC-5.1, FSPEC BR-25; PLAN P8-05,
P8-07.
*Oracle:* the absence conjunct rides PROP-BND-07's set-equality, which is the falsifiable form —
a bare "not in the list" check over a list that could be empty proves nothing.

**PROP-DOC-07** — Document oracles over the shipped docs must range over a **glob**, not an
enumerated file list.
*Category:* Observability. *Level:* Document oracle. *Traces:* `docs/_constraints/` promotion from
`pdlc-plugin-retirement` LEARNINGS (doc-fidelity oracles must range over a glob); PLAN P8-07.
*Oracle:* `loopDocumentSurfaces.test.js` enumerates its inputs by glob at test time. The
enumeration is exactly what goes stale — a sweep with per-file oracles shipped four High
documentation findings in this repo despite having explicit acceptance criteria.

**PROP-DOC-08** — The project `CLAUDE.md` four-check table and FSPEC §5.1's required-check set must
be **unchanged in membership** by this feature.
*Category:* Contract. *Level:* Document oracle. *Traces:* REQ NFR-1, TSPEC *Test Strategy*; PLAN
P9-04.
*Oracle:* `pdlc/engine/__tests__/ci-arrangement.test.js` (present at HEAD) already derives the rows
and the count word from §5.1 itself, so a check added to the gate without being added to the table
goes red. This feature adds no CI workflow file and no required check; both new test homes sit
inside `Unit tests (ubuntu-latest, node 20)` and `Engine tests (ubuntu-latest)`. The property is
that this existing oracle stays green — it is inherited, not new, and is named here so its
inheritance is deliberate rather than assumed.

## Oracles

Each property above states its own oracle inline. This section states the **rules those oracles
obey**, the falsifiability checklist applied to every one of them, and the oracle-shape decisions
that are load-bearing enough to be reviewable on their own.

### O-1. The four oracle shapes used here

| Shape | Used when | Properties |
|---|---|---|
| **Exact-value** — the observable is compared against a literal transcribed from the normative source | a closed enumeration, a declared default, a schedule | PROP-CFG-02, PROP-ITER-03, PROP-ITER-08, PROP-RPT-01, PROP-RPT-03, PROP-RPT-04, PROP-RPT-06, PROP-BND-03 |
| **Behavioural call-count** — a spy's invocation count, because the result envelope is identical whether or not the behaviour happened | exactly-once, never-called, re-read-vs-cached | PROP-ITER-01, PROP-PRE-06, PROP-ESC-14, PROP-VIEW-12, PROP-BND-01, PROP-PRE-08 |
| **Differential** — the same fixture run two ways, the two outputs compared | invariance claims, union-vs-column claims, redaction on/off | PROP-CFG-04, PROP-ITER-15, PROP-ESC-06, PROP-ESC-10, PROP-VIEW-02, PROP-ESC-13, PROP-RPT-08, PROP-DOC-02 |
| **Derived-at-render** — the expectation is recomputed from the live source at test time, never restated | catalogue membership, guard-path sets, effective enumerations | PROP-ESC-02, PROP-BND-04, PROP-DIST-02 |

### O-2. The falsifiability checklist, applied

Each row below is a checklist item from the TE authoring standard, with the properties in this
document it bites on and how it was discharged.

| Checklist item | Where it bites | Discharge |
|---|---|---|
| **Absence-based oracle** — `status != X` alone is unfalsifiable | every stop/refuse/block property | Each carries the exact status value from a closed ten-member enumeration, a named reason code, and a retention or byte-identity conjunct. PROP-PRE-05 and PROP-PRE-08 are the sharpest: the two zero-iteration paths are distinguished by exact stop reason **and** a `notEqual` over the rendered `detail` strings, both cases in one file. |
| **Preservation / byte-identity oracle is vacuous on a fixture that never had the content** | PROP-VIEW-13, PROP-ESC-04, PROP-PRE-05, PROP-PRE-09 | Each carries a positive-presence conjunct. PROP-VIEW-13 asserts prefix-identity of the pre-existing blocks **plus** that the file grew by exactly the appended blocks — whole-file byte-identity would be the wrong claim, since appends are expected. |
| **Regex alternation branches each need their own positive control** | PROP-ESC-11 (five credential families) | One seeded positive **per behavioural match family**, plus a per-family `fast-check` law that draws a concrete prefix instance (`ghu_`, `xoxb-`) rather than the character-class source text. Deleting `ghs_` alone is the stated exception — behaviourally subsumed by `gh[pousr]_` — and is killed by the set-equality pin instead. |
| **Pair any absence-tolerant check with a positive-presence oracle** | PROP-ESC-12 (redactor must not fire) | The non-firing law is paired with PROP-ESC-11's firing law over the same catalogue, and with the anchor half — a prefix in a run's **interior** must not fire. That anchor conjunct is the only assertion distinguishing a compiled-and-correct pattern from a copied constant. |
| **Identical-envelope behaviours need a call-count, not a shape assertion** | PROP-ITER-01, PROP-PRE-06, PROP-VIEW-12, PROP-ESC-14 | All four use spies. Applied **symmetrically**: the rule is not limited to the one under test — `evaluatePreflight`'s two condition seams are both counted, not just the engine one. |
| **Exact-value oracles over a real multi-node graph must derive N×U via a dispatch-count spy** | PROP-BND-01 (N iterations × commits) | **No count-equality is asserted.** BR-19 states a row-writing invocation commits the file more than once, so a hand-derived `commits === N` would red on correct behaviour. The oracle is per-commit provenance by message form instead. |
| **Derived values and absence-shaped conjuncts belong at the pipeline seam, not an injectable unit** | PROP-PRE-02, PROP-PRE-08, PROP-PRE-10 | Driven **through the production `cmdQueue`** with the real `!startup.ok` branch in place and only `deps.startupFor` scripted. Asserting `evaluatePreflight` in isolation is explicitly **not** the oracle — it would prove nothing about `cli.mjs`'s return, which is where the refusal actually lives. |
| **Prefer real captured envelopes over hand-built synthetic fixtures at contract boundaries** | PROP-ESC-04, PROP-PRE-09, PROP-DIST-02 | Each compares against a **baseline captured from HEAD before the change lands** — the advisory entry's rendered structure, `cmdDoctor`'s printed bytes, each enumeration's pre-change membership. A baseline captured after the refactor compares the refactor with itself; PLAN P4-01 and P7-00 own the ordering. |
| **A new blocking cause behind a precedence chain needs a fixture defeating every earlier branch** | PROP-PRE-08 (`engine-dispatch-refused` behind `preflight-refused`) | The fixture sets `preflight: "off"` precisely so the loop's own refusal **cannot** preempt the engine's. Under `"strict"` the earlier branch fires and the new cause would pass even if unimplemented — which is why PROP-PRE-10's bounded universe runs all four cells. |
| **Disk-mediated carry-forward must be proven with a reload, not an in-memory prior** | PROP-RPT-08, PROP-VIEW-12 | The second render is performed with **no prior report available**, forcing a re-read of the on-disk log. An in-memory continuation would pass on a report-reading implementation. |
| **Hypothesis / `fast-check` strategy hygiene** | PROP-CFG-01, PROP-CFG-05, PROP-ITER-14, PROP-VIEW-05, PROP-ESC-11, PROP-ESC-12 | Generators are bounded: `run` drawn from `[A-Za-z0-9_\-]{8,64}`; dependency graphs bounded by row count; the codec totality generator **must include truncations of a valid token**, because arbitrary strings almost never produce a near-miss and a `try/catch` wrapper would pass without it. The non-firing redaction generator is base64url **filtered to exclude every catalogue prefix** — not "any valid token", since base64url admits `AKIA…`. |

### O-3. The catalogue-oracle rule (the one this repo gets wrong most)

`deepEqual(LOOP_NOTICE_CODES, LOOP_NOTICE_CODES)` passes for **any** content and derives its
expectation from the code under test. Every closed-enumeration property in this document therefore
compares a **collected** set against a **literal transcription written into the test file**:

| Property | Collected operand | Literal operand | The frozen constant |
|---|---|---|---|
| PROP-RPT-06 | codes `collectNotices` actually produced across a session exercising all ten conditions | ten-member array | **neither side** |
| PROP-RPT-04 | stop reasons **exercised** by the session fixtures | ten-member array | **neither side** |
| PROP-RPT-01 / PROP-RPT-03 | `iterationLine` / `sessionSummary` `fields` key set | §3.4 transcription | **neither side** |
| PROP-CFG-02 | `LOOP_DEFAULTS` | BR-01 transcription | operand (this is the pin) |
| PROP-RPT-05 | `LOOP_NOTICE_CODES`, `LOOP_STOP_KINDS` | same ten-member literals | operand (this is the pin) |

PROP-CFG-02 and PROP-RPT-05 are the **only** two properties whose operand is a frozen export, and
both are deliberately narrow pins rather than behavioural oracles. Keeping them separate is what
lets PROP-RPT-04 and PROP-RPT-06 red on "a catalogue code that no condition raises" — the failure a
constant-vs-itself comparison structurally cannot detect.

PROP-ESC-02 is the deliberate exception in the other direction: it **re-enumerates** `ADVISORY_SEAMS`
at test time rather than transcribing it, because REQ AC-4.1 requires set-equality against the
*live* catalogue "whatever its current membership" and forbids a count restated here. Its
non-vacuity conjuncts (both sides non-empty, cardinality ≥ the frozen enumeration's, named member
`A6` on both) are what stop a catalogue read as empty from making ∅ = ∅ green.

### O-4. Non-vacuity controls, enumerated

Every set-equality and every absence-tolerant property names its own control. These are the ones
whose absence would silently produce a green suite over an unimplemented feature:

| Property | Vacuity risk | Control |
|---|---|---|
| PROP-ESC-02 | catalogue read as empty ⇒ ∅ = ∅ | both sides non-empty; cardinality ≥ frozen enumeration; `A6` on both |
| PROP-ESC-01 | collector never written ⇒ ∅ = ∅ | collector asserted non-empty; each append attributed to its own call site |
| PROP-ESC-06 | totals-only oracle passes | fixture built so the naive comparison **would have differed**; the test asserts that |
| PROP-BND-07 | empty documented surface satisfies disjointness | PROP-BND-08's three-member containment |
| PROP-PRE-01 | `"off"` skipping the checks entirely | positive `held` booleans, both conditions, length-2 array |
| PROP-VIEW-04 | name tie-break never exercised | fixture has equal counts **and** equal timestamps |
| PROP-VIEW-02 | union oracle passes on a column-only implementation | strictly-smaller column-only differential |
| PROP-VIEW-07 | identical sentences cannot distinguish key choices | three appends whose sentences differ in an interpolated count |
| PROP-DIST-02 | `deepEqual` passes on a silently dropped member | superset-of-captured-baseline plus growth |
| PROP-DOC-03 | the per-literal citation universal is satisfied trivially by a page with **zero** literals — an omitted scope-and-lifetime section passes | AC-6.1's three facts asserted as content containment **first**, and the section's literal count asserted **≥ 1** before the universal is evaluated |
| PROP-ESC-08 | row 5's site is conditional (`escalations: ci.escalate ? [ … ] : []`) — an unscripted cell exercises the empty branch and asserts nothing | `ci.escalate` asserted truthy in the fixture before the behaviour is exercised |
| PROP-ESC-15 | "the append is not suppressed" is absence-only and passes on a log that never received a first append either | block count asserted **exactly 1** after iteration 1, then **strictly greater** after iteration 2 — growth observed between the iterations, not inferred at the end |
| PROP-DIST-04 | resolution oracle iterates the block **as found** | presence asserted against a literal `REQUIRED_INCLUDES` extension |

### O-5. Mutants the suite must kill

Named because each corresponds to a defect class this repo has shipped before. Every mutant has an
owning property; a mutant with no owner is a gap, not a nuance.

| Mutant | Killed by |
|---|---|
| (a) `schedulePos` advancing on a `stop` as well as a `continue` | PROP-ITER-09 |
| (b) `corpusState` left on the raw block count | PROP-ESC-07, PROP-ESC-06's corpus-state conjunct |
| (c) `evaluatePreflight` short-circuiting condition 2 when 1 fails under `"off"` | PROP-PRE-01 |
| (d) V4 overlay running before V3 collapse | PROP-VIEW-09's `occurrences` conjunct |
| (e) recurrence key falling back to the rendered decision sentence | PROP-VIEW-07 |
| (f) the redactor firing on a 40-hex git oid | PROP-ESC-12 |
| (g) deleting one credential prefix family | PROP-ESC-11 per-family law + parameterised case |
| (h) `cmdQueue` returning early on `!startup.ok` only under `"strict"` | PROP-PRE-08 (`runQueue` never reached, exit code `1`) |
| (i) shipping the `lib/` modules without the c8 `include` entries | PROP-DIST-04 |
| (j) a duplicate-field parser taking first-match | PROP-VIEW-11 |
| (k) an unconditional report spread shipping `loop: undefined` | PROP-BND-03 |

### O-6. Properties with no executing assertion — declared, not hidden

Two properties in this document have **no oracle**, and neither is given a weak one to look green:

- **PROP-BND-06** (REQ NFR-4, cheap-and-safe stopping) is a design property of "one queue
  invocation is the interruptible unit". Its structural proxies — PROP-ITER-01's call count and
  PROP-BND-01's commit provenance — are real assertions, but neither *is* NFR-4.
- **PROP-BND-09** (REQ NFR-6, an unlisted stop is a defect) is a standing triage policy, and REQ
  NFR-6 says so itself: "not a criterion checkable at delivery". Its nearest mechanical proxy is
  PROP-RPT-04.

Recording these is deliberate. This repo has shipped a green PLAN row whose named deliverable had
no executing assertion at all; declaring the two that genuinely have none is what keeps the other 91
trustworthy.

## Fixtures

Fixtures, generators and doubles. **No new double kinds**: every seam below is already injected
somewhere in the shipped suite, and the precedent is cited so an implementer copies a working shape
rather than inventing one.

### F-1. Shared doubles (PLAN P0-01, "[Fake first]")

| Seam | Double | Shipped precedent (verified present at HEAD) |
|---|---|---|
| `readFileFn` | in-memory `Map<path, string\|null>` | `pdlc/workflows/__tests__/` helpers and the queue-driver suites |
| `_appendFile` | array-collecting async fn, **plus a rejecting variant** for E-08 | `pdlc/workflows/__tests__/advisoryEscalationLog.test.js` |
| `gitFn` | argv-keyed `{ok, stdout, stderr}` responder | `pdlc/workflows/__tests__/mergeQueueDriver.test.js` |
| `_now` | fixed epoch — except in F-3's `backoff-reappend` fixture, which scripts two distinct epochs so PROP-ESC-15's conjuncts (2) and (3) are falsifiable | `renderEscalationEntry`'s existing `{now}` parameter (`pdlc/workflows/orchestrate-dev.js`, `renderEscalationEntry`) |
| `deps.startupFor` | scripted startup result | `pdlc/engine/__tests__/cli.test.js` |

The rejecting `_appendFile` variant is not optional decoration: PROP-ESC-09 and PROP-ESC-10 are the
only properties proving a durable queue row survives an append failure, and both need it.

### F-2. Fixture-string ownership

Every fixture string below is the **normative string verbatim**, not a paraphrase. Where a lower
layer pins a literal, this document references it rather than duplicating it.

| Fixture string | Normative source | Used by |
|---|---|---|
| `{backoffSchedule: [5,15,30,60], idleStopAfter: 4, preflight: "strict", dirtyTreePolicy: "tracked"}` | FSPEC BR-01 threshold table | PROP-CFG-02, PROP-CFG-06 |
| `[5, 15, 30, 60, 60]` | FSPEC AT-07, derived from BR-01's "last value repeats" | PROP-ITER-08 |
| `["absent-file","absent-section","malformed-section","explicit-default"]` | TSPEC *Interfaces* → `ConfigCase` | PROP-CFG-03 |
| the ten stop reasons | TSPEC *Data Model* §5, itself transcribing FSPEC §3.4's stop-reason enumeration | PROP-RPT-04 |
| the ten notice codes | TSPEC *Data Model* §5 / *Interfaces* notice-channel table | PROP-RPT-06, PROP-BND-10 |
| `{ran, halted, idle, blocked, no-queue}` | `buildQueueReport`'s own typedef (`pdlc/workflows/orchestrate-queue.js`) | PROP-BND-03 |
| `["exhausted","bound-reached","blocked","refused"]` | `LOOP_STOP_REASONS`, `pdlc/engine/lib/run.mjs` | PROP-ITER-05, PROP-BND-05 |
| `chore(queue): {feature} → {status}` | `commitQueueRow` (`pdlc/workflows/orchestrate-queue.js`) | PROP-BND-01 |
| `## {iso} — {feature} — {source}`, `\| Source \|`, no `\| Seam \|` | TSPEC *Data Model* §4 | PROP-ESC-04 |
| `[redacted:{n} chars]` | TSPEC *Error Handling* → *Pattern*; DEC-LOOP-05 | PROP-ESC-11 |
| `{advisory-seam, merge-refusal, pipeline-halt}` | `LOOP_SOURCES`, TSPEC *Interfaces* | PROP-ESC-01, PROP-ESC-05 |
| `["A1","A2","A3","A4","A5","A6"]` | `ADVISORY_SEAMS`, `pdlc/workflows/orchestrate-dev.js` — **re-enumerated, never transcribed** (PROP-ESC-02) | PROP-ESC-02 |
| `missing-field: {name}`, `duplicate-field: {name}`, `unrecognised-shape` | TSPEC *Data Model* §4b | PROP-VIEW-10 |
| `**/pdlc/workflows/lib/loop-session.mjs`, `**/pdlc/workflows/lib/escalation-view.mjs` | TSPEC *Test Strategy* → *Coverage floor* | PROP-DIST-04 |
| `STARTUP_REMEDIATION`'s bytes | captured baseline of `cmdDoctor`'s output at HEAD (`pdlc/engine/bin/cli.mjs`, `cmdDoctor`) | PROP-PRE-09 |

**Lexicon cross-check performed.** The four closed vocabularies — `ConfigCase` (4), `Policy` (2),
`DirtyTreePolicy` (2), `LOOP_SOURCES` (3) — plus the two ten-member catalogues were each read back
against TSPEC *Data Model* §5 and *Interfaces* before the properties above were finalised. The one
trap worth naming again: **nine summary fields, ten stop reasons** — PROP-RPT-03 and PROP-RPT-04
assert different sets, and a fixture reusing one count for the other is the defect TSPEC calls out.

### F-3. Named fixtures whose construction is load-bearing

These are the fixtures where a plausible simpler construction makes the property pass vacuously.
Each is stated with the construction requirement and the reason.

| Fixture | Construction requirement | Why the simpler construction fails |
|---|---|---|
| **`mixed-log`** (PROP-ESC-06) | advisory entries **plus** at least one non-advisory entry whose presence would otherwise change the maximum; built so a naive reader flips `over` to a non-advisory source or suppresses it into a `tie` | a mixed log whose non-advisory entries never touch the maximum passes a totals-only oracle |
| **`three-block-middle-bad`** (PROP-VIEW-10) | the **second of three** blocks is the unparseable one | a first-block or last-block fixture passes on a parser that truncates at the first failure |
| **`equal-count-equal-timestamp`** (PROP-VIEW-04) | equal blocked-feature counts **and** equal timestamps | distinct timestamps leave the name comparator unexercised |
| **`frontmatter-only-dependent`** (PROP-VIEW-02) | the dependent declares its dependency **only** in REQ frontmatter, and the same fixture is counted column-only for the differential | a fixture declaring the dependency in both places passes on a column-only implementation |
| **`differing-sentence-recurrence`** (PROP-VIEW-07) | three appends whose rendered sentences differ in an **interpolated count** | identical sentences cannot distinguish a key-based from a sentence-based implementation |
| **`backoff-reappend`** (PROP-ESC-15) | a **two-iteration** session over an unchanged queue whose second iteration is entered through the backoff schedule and re-triages the *same* already-escalated candidate, with the collected log re-parsed **between** the two iterations, and `_now` scripted to **two distinct epochs**, one per iteration (overriding F-1's single fixed epoch for this fixture only) | three fixture-manufactured appends (PROP-VIEW-06's construction) exercise the view's collapsing, not the loop's non-suppression; measuring the block count only at the end cannot distinguish growth from two appends written in one iteration |
| **`ci-escalate-true`** (PROP-ESC-08 row 5) | a CI-absent fixture with `ci.escalate` scripted **truthy** and asserted so before the behaviour runs | `escalations: ci.escalate ? [ … ] : []` means an unscripted fixture exercises the empty branch and the cell asserts nothing |
| **`resolved-then-recurring`** (PROP-VIEW-09) | an entry resolved by a durable decision, **then** the same escalation appended again | without the post-decision recurrence, collapse-vs-overlay ordering is unobservable |
| **`prefix-shaped-feature-name`** (PROP-ESC-13) | a `Feature` value that is itself prefix-shaped (e.g. `sk-demo`), with the same string also in the diagnosis | a fixture with an ordinary feature name passes on a blanket whole-block redactor |
| **`nonzero-idle-prior`** (PROP-ITER-12) | the pre-iteration `consecutiveIdle` is **non-zero** | a zero prior makes "unchanged" and "reset to zero" indistinguishable |
| **`off-policy-not-ok-startup`** (PROP-PRE-08) | `preflight: "off"` **and** a not-ok startup | under `"strict"` the loop's own refusal preempts the engine's, so the new cause would pass unimplemented |
| **`ignored-only-dirty`** (PROP-PRE-04) | a tree dirty in **ignored** files alone, asserted passing under **both** policies | this is the positive control an over-broad `git status --porcelain` implementation fails; note the shipped hazard that `node_modules/`-style trailing-slash ignore patterns do **not** match symlinks |
| **`no-template-installed`** (PROP-DOC-02) | a full session driven with **no** `pdlc/templates/loop.md` present | a documentation-only assertion of "optional" is unfalsifiable |
| **`ten-condition-session`** (PROP-RPT-06) | one fixture case per row of TSPEC *Interfaces*' notice-channel table — all ten | a session raising nine codes passes a containment oracle and hides the tenth being unreachable |

### F-4. Generators (`fast-check`)

`fast-check` is already a declared devDependency (`pdlc/workflows/package.json`), and two suites
ship using it — `advisoryHelperProperties.test.js` and `consolidationProperties.test.js`. Four laws
live in `loopProperties.test.js`.

| Generator | Domain | Bounds and `assume` clauses | Law |
|---|---|---|---|
| `arbitraryLoopConfigJson` | arbitrary JSON | unbounded shape is the point; the **result** is bounded — all four keys present | PROP-CFG-01, PROP-CFG-05 |
| `arbitrarySessionState` | well-formed `SessionState` | `consecutiveIdle` and `schedulePos` bounded to small non-negative integers; no float arithmetic, so no `isFinite` guard is needed | PROP-ITER-14 round-trip |
| `arbitraryStateToken` | arbitrary strings **plus** truncations of a valid token | the truncation branch is **required**, not optional | PROP-ITER-14 totality |
| `credentialPrefixInstance` | a concrete instance drawn per family — `ghp_`/`gho_`/`ghu_`/`ghs_`/`ghr_`, `github_pat_`, `sk-`, `xoxb-`/`xoxa-`/`xoxp-`/`xoxr-`/`xoxs-`, `AKIA` | **never the character-class source text**; `run` from `[A-Za-z0-9_\-]{8,64}` | PROP-ESC-11 |
| `nonCatalogueText` | 40-hex git oids; base64url **filtered** to exclude every catalogue prefix as a substring | the filter is load-bearing: unfiltered base64url admits `AKIA…`, correctly redacted, which is DEC-LOOP-05 (b)'s accepted false positive — a different thing from the false negative NFR-5 scopes | PROP-ESC-12 |
| `arbitraryDependencyGraph` | rows with `Depends-On` and frontmatter `depends-on`, **cycles included** | bounded by row count; counts bounded above by the number of non-`done` rows | PROP-VIEW-05 |

No generator here computes a product or a magnitude, so the `math.isfinite` / boundary-tolerance
hygiene rules do not bite; they are named as checked rather than silently omitted.

### F-5. Fixture homes, against the PLAN

Every test file named below is either **present at HEAD** or **explicitly new** in the PLAN's
File-ownership manifest. No property in this document is homed in a file that neither exists nor is
planned.

**The State column is measured at the pin commit `d4122427b`**, not against the live tree. It is
the authoring-time split, and the guarantee it discharges — that no property is homed in a file
which neither exists nor has an owning task — is monotone: a row labelled **new** whose owning task
has since run is now a tracked file, created by exactly the task named in its *Owning PLAN task*
cell, which strengthens the guarantee rather than falsifying it. Fifteen of the **new** rows had
already migrated that way by `9362e2766`. The falsifying direction is the other one: a row labelled
**present at HEAD** whose file is absent, or a row labelled **new** whose file was pre-created by
some task other than its named owner. Neither has occurred.

| File | State | Owning PLAN task |
|---|---|---|
| `loopSessionConfig.test.js`, `loopSessionPreflight.test.js`, `loopSessionState.test.js`, `loopSessionDirective.test.js`, `loopSessionReport.test.js` | **new** | P1-01…P1-10 |
| `escalationViewParse.test.js`, `escalationViewCounts.test.js`, `escalationViewBuild.test.js` | **new** | P2-01…P2-06 |
| `loopDecisionEntry.test.js`, `loopEntryVocabulary.test.js`, `loopMergeEscalation.test.js` | **new** | P3-01…P3-08 |
| `loop-startup-remediation.test.js`, `loop-cli.test.js` | **new** | P4-01…P4-07 |
| `loopQueueDriver.test.js`, `loopThreeSources.test.js`, `loopAdvisoryCatalogue.test.js`, `loopQueueCommitProvenance.test.js` | **new** | P5-01…P5-07 |
| `loopCalibrationIsolation.test.js` | **new** | P6-01/P6-02 |
| `loop-distribution.test.js` | **new** | P7-01/P7-02 |
| `loop-config-example.test.js`, `loopDocumentSurfaces.test.js`, `loopGuardPaths.test.js` | **new** | P8-01…P8-08 |
| `loopProperties.test.js` | **new** | P9-01 |
| `loopBaselinePreflight.test.js` | **new** | P0-00 |
| `consolidationAdvisory.test.js` | **present at HEAD**, updated in the landing commit | P6-03 |
| `coverageInstrumentation.test.js` | **present at HEAD**, extended additively | P9-02a/P9-02 |
| `packaging.test.js`, `ci-arrangement.test.js`, `_tspec-packed-set.mjs`, `consolidationBuild.test.js` | **present at HEAD**, inherited green | P7-00, P9-03, P9-04 |
| `pdlc/engine/scripts/fixture-machine.mjs` (`npm-pack-install-upgrade` leg) | **present at HEAD**, *not extended by this feature* — P7-03 is `DESCOPED` (PLAN v1.0, DECISIONS DEC-LOOP-07); only D-5's `WORKFLOW_MODULE_NAMES` literal moves, under **P7-02** | P7-02 (D-5); P7-03 descoped |

`loopDecisionEntry.test.js`, `loopEntryVocabulary.test.js`, `loopBaselinePreflight.test.js` and
`loop-startup-remediation.test.js` are named by the PLAN but have **no row** in TSPEC's
*Test Strategy* → *Levels and homes* table; that gap was routed as an erratum (**G-2**) rather than
papered over here, and TSPEC v1.0 has since **discharged it** — all four now carry their own rows in
that table, cited by test-file name and level label per DEC-DOC-01: `loopBaselinePreflight.test.js`
(*Baseline pre-flight*), `loopEntryVocabulary.test.js` (*Pure unit*),
`loopDecisionEntry.test.js` (*Pure unit*) and `loop-startup-remediation.test.js` (engine suite),
re-measured at HEAD `c4d1e2d8b`.

## Coverage Matrix

Three directions are checked: every REQ acceptance criterion has a property, every FSPEC acceptance
test has a property, and every PLAN task has a property that traces to it. Gaps are named in
**Gaps and Routed Errata**, never left implicit.

### C-1. REQ acceptance criteria → properties

| REQ | Properties | Gap? |
|---|---|---|
| AC-1.1 | PROP-DOC-01, PROP-DOC-02 | — |
| AC-1.2 | PROP-ITER-01, PROP-DOC-05 | — |
| AC-1.3 | PROP-ITER-02, PROP-ITER-03, PROP-RPT-02 | — |
| AC-1.4 | PROP-ITER-04 | — |
| AC-1.5 | PROP-ITER-05, PROP-BND-05 | — |
| AC-1.6 | PROP-ITER-06 | — |
| AC-2.1 | PROP-CFG-02, PROP-ITER-08 | — |
| AC-2.2 | PROP-CFG-02, PROP-ITER-08 | — |
| AC-2.3 | PROP-RPT-03, PROP-RPT-04 | — |
| AC-2.4 | PROP-ITER-10 | — |
| AC-2.5 | PROP-CFG-01, PROP-CFG-03, PROP-CFG-05 | — |
| AC-3.1 | PROP-PRE-02, PROP-PRE-03, PROP-PRE-06 | — |
| AC-3.2 | PROP-PRE-04 | — |
| AC-3.3 | PROP-PRE-05 | — |
| AC-3.4 | PROP-PRE-01, PROP-PRE-07, PROP-PRE-08, PROP-PRE-10 | — |
| AC-4.1 | PROP-ESC-01, PROP-ESC-02, PROP-VIEW-13, PROP-RPT-08 | — |
| AC-4.1a | PROP-ESC-04, PROP-ESC-05, PROP-ESC-06, PROP-ESC-15 | — |
| AC-4.2 | PROP-ESC-03, PROP-VIEW-08 | — |
| AC-4.3 | PROP-VIEW-01, PROP-VIEW-02, PROP-VIEW-03, PROP-VIEW-04, PROP-VIEW-12 | — |
| AC-4.4 | PROP-VIEW-08, PROP-VIEW-09, PROP-VIEW-14 | — |
| AC-4.5 | PROP-VIEW-06, PROP-VIEW-07, PROP-VIEW-09, PROP-VIEW-14, PROP-ESC-15 | — |
| AC-4.6 | PROP-ESC-14 | — |
| AC-4.7 | PROP-VIEW-10, PROP-VIEW-11, PROP-ESC-09, PROP-ESC-10 | — |
| AC-5.1 | PROP-BND-07, PROP-DOC-06 | — |
| AC-5.1a | PROP-BND-04 | — |
| AC-5.2 | PROP-BND-08 | **G-1** — PLAN P8-06 ships two of the three literal members |
| AC-5.3 | PROP-BND-02, PROP-BND-03 | — |
| AC-6.1 | PROP-DOC-03 | — |
| AC-6.2 | PROP-DOC-04 | — |
| AC-6.3 | PROP-DOC-04 | — |
| AC-7.1 | PROP-RPT-01, PROP-RPT-02, PROP-RPT-07 | — |
| AC-7.2 | PROP-RPT-03, PROP-RPT-04 | — |
| NFR-1 | PROP-BND-05, PROP-DIST-02, PROP-DOC-08 | — |
| NFR-2 | PROP-BND-01, PROP-PRE-05 | — |
| NFR-3 | PROP-BND-02 | — |
| NFR-4 | PROP-BND-06 | **declared unasserted** (O-6) |
| NFR-5 | PROP-ESC-11, PROP-ESC-12, PROP-ESC-13 | scoped to a recognising check, per NFR-5's own wording |
| NFR-6 | PROP-BND-09 | **declared unasserted** (O-6) |

**Every REQ acceptance criterion has at least one property.** Two non-functional requirements
(NFR-4, NFR-6) have properties with no executing assertion, both by the REQ's own construction; that
is recorded, not hidden.

### C-2. FSPEC acceptance tests → properties

| AT | Properties | AT | Properties |
|---|---|---|---|
| AT-01 | PROP-ITER-02 | AT-27 | PROP-VIEW-10 |
| AT-02 | PROP-ITER-01 | AT-28 | PROP-ESC-14 |
| AT-03 | PROP-ITER-04 | AT-29 | PROP-ESC-10 |
| AT-04 | PROP-ITER-05, PROP-BND-05 | AT-30 | PROP-BND-01 |
| AT-05 | PROP-ITER-06 | AT-31 | PROP-BND-02 |
| AT-06 | PROP-ITER-07 | AT-32 | PROP-BND-04 |
| AT-07 | PROP-ITER-08 | AT-33 | PROP-BND-07, PROP-BND-08 |
| AT-08 | PROP-ITER-03 | AT-34 | PROP-ESC-11 |
| AT-09 | PROP-ITER-10 | AT-34a | PROP-ESC-12 |
| AT-10 | PROP-CFG-02, PROP-CFG-03 | AT-35 | PROP-DOC-03 |
| AT-11 | PROP-PRE-02 | AT-36 | PROP-RPT-01 |
| AT-12 | PROP-PRE-03 | AT-37 | PROP-RPT-03, PROP-RPT-04 |
| AT-13 | PROP-PRE-04 | AT-38 | PROP-CFG-04 |
| AT-14 | PROP-PRE-05 | AT-39 | PROP-ITER-11 |
| AT-15a | PROP-PRE-07 | AT-40 | PROP-ITER-12 |
| AT-15b | PROP-PRE-08 | AT-41 | PROP-ITER-13 |
| AT-16 | PROP-PRE-01 | AT-42 | PROP-VIEW-05 |
| AT-17 | PROP-PRE-06 | AT-43 | PROP-VIEW-09 |
| AT-18 | PROP-ESC-01 | AT-44 | PROP-PRE-02, PROP-PRE-08, PROP-PRE-09, PROP-PRE-10, PROP-DOC-05 |
| AT-19 | PROP-ESC-02 | AT-45 | PROP-DOC-01 |
| AT-20 | PROP-ESC-06, PROP-ESC-04 | AT-46 | PROP-CFG-06 |
| AT-21 | PROP-ESC-03 | AT-47 | PROP-DOC-04 |
| AT-22 | PROP-VIEW-01 | AT-48 | PROP-ITER-14, PROP-ITER-15, PROP-ITER-16 |
| AT-23 | PROP-VIEW-02 | AT-49 | PROP-ITER-09, PROP-RPT-07 |
| AT-24 | PROP-VIEW-04 | AT-50 | PROP-VIEW-06, PROP-VIEW-07, PROP-ESC-15 |
| AT-25 | PROP-VIEW-08 | AT-51 | PROP-RPT-06, PROP-BND-10 |
| AT-26 | PROP-VIEW-06 | AT-52 | PROP-DIST-01, PROP-DIST-02, PROP-DIST-03, PROP-DIST-05 (see its residual note: AT-52's *iterates* clause is descoped per DEC-LOOP-07; the four properties cover its additive-only and presence clauses) |

All **53** FSPEC acceptance tests — AT-01…AT-52, with AT-15 split into AT-15a/AT-15b — plus
**AT-34a**, giving the **54** rows in the table above, map to at least one property. Note **AT-34a** is
introduced in TSPEC's *Traceability* table and *Mutation sensitivity* section as BR-18's negative
control; it has no numbered row in FSPEC's own acceptance-test list, which is routed as **G-3**.

### C-3. FSPEC error scenarios → properties

| E | Property | E | Property |
|---|---|---|---|
| E-01 | PROP-CFG-03 | E-14 | PROP-VIEW-06 |
| E-02 | PROP-CFG-04, PROP-CFG-05 | E-15 | PROP-VIEW-09 |
| E-03 | PROP-ITER-11 | E-16 | PROP-PRE-04 |
| E-04 | PROP-ITER-12 | E-17 | PROP-PRE-04 |
| E-05 | PROP-ITER-13 | E-18 | PROP-PRE-05 |
| E-06 | PROP-ESC-14 | E-19 | PROP-PRE-08 |
| E-07 | PROP-VIEW-10 | E-20 | PROP-PRE-09, PROP-PRE-10, PROP-DOC-05 |
| E-08 | PROP-ESC-09, PROP-ESC-10 | E-21 | PROP-BND-02 |
| E-09 | PROP-ESC-06, PROP-ESC-07 | E-22 | PROP-BND-06 (declared unasserted) |
| E-10 | PROP-VIEW-03 | E-23 | PROP-BND-09 (declared unasserted), PROP-BND-10 |
| E-11 | PROP-VIEW-02 | E-24 | PROP-ITER-14, PROP-ITER-15, PROP-ITER-16 |
| E-12 | PROP-VIEW-05 | E-25 | PROP-ITER-09, PROP-RPT-07 |
| E-13 | PROP-VIEW-04 | E-26 | PROP-ESC-15, PROP-VIEW-06, PROP-ESC-01 |

All 26 error scenarios are covered.

### C-4. PLAN tasks → properties

Every row of the PLAN's Batches table, with the property whose falsification is that task's
deliverable. A task with no property is a task whose green status would be evidence of nothing —
the failure mode this repo has already shipped once, where a ✅ row traced a property that was never
written.

| PLAN task | Properties | Deliverable is falsifiable by |
|---|---|---|
| P0-00 | PROP-DIST-01, PROP-DIST-03 | import/presence of every BL-PREREQ symbol at HEAD; all seven verified present in `pdlc/workflows/orchestrate-dev.js` at `8eb43beed` |
| P0-01 | F-1 doubles (no property of its own) | consumed by every integration property; the rejecting `_appendFile` variant is required by PROP-ESC-09/10 |
| P1-01 | PROP-CFG-01, PROP-CFG-02, PROP-CFG-03, PROP-CFG-04 | red at HEAD: `loop-session.mjs` does not exist |
| P1-02 | PROP-CFG-01…04, PROP-ESC-05, PROP-RPT-05 | `LOOP_STOP_KINDS` at **10**, `LOOP_NOTICE_CODES` at 10 |
| P1-03 | PROP-PRE-01, PROP-PRE-03, PROP-PRE-04, PROP-PRE-07 | `conditions` length 2 with explicit `held` |
| P1-04 | PROP-PRE-01, PROP-PRE-03, PROP-PRE-04, PROP-PRE-07 | both conditions always evaluated; `policy` decides only `decision` |
| P1-05 | PROP-ITER-14, PROP-ITER-15 | reserved `new` vs every other undecodable token |
| P1-06 | PROP-ITER-14, PROP-ITER-15 | round-trip + totality |
| P1-07 | PROP-ITER-03…13 | ordered rule list; `backoff-unenterable` tested before `idle-exhausted` |
| P1-08 | PROP-ITER-03…13, PROP-ITER-09 | `schedulePos` advances once per `continue`, never on `stop` |
| P1-09 | PROP-BND-10, PROP-RPT-01, PROP-RPT-03, PROP-RPT-04, PROP-RPT-06, PROP-RPT-07 | `notice()` throws outside the catalogue; one producer per code |
| P1-10 | PROP-RPT-01…07 | `halted`/`escalationsRaised`/`operatorView` reach the summary |
| P2-01 | PROP-ESC-14, PROP-VIEW-10, PROP-VIEW-11 | three parse-failure shapes, each with its own `reason` |
| P2-02 | PROP-ESC-14, PROP-VIEW-10, PROP-VIEW-11 | duplicate detection **counts** rather than first-matches |
| P2-03 | PROP-VIEW-02, PROP-VIEW-03, PROP-VIEW-05 | frontmatter-only dependent counted |
| P2-04 | PROP-VIEW-02, PROP-VIEW-03, PROP-VIEW-05 | BFS over a visited set terminates on a cycle |
| P2-05 | PROP-VIEW-01, PROP-VIEW-04, PROP-VIEW-06…09, PROP-ESC-15 (view half) | V3 before V4; key is not the rendered sentence |
| P2-06 | PROP-VIEW-01, PROP-VIEW-04, PROP-VIEW-06…09, PROP-VIEW-12, PROP-VIEW-14, PROP-ESC-15 (view half) | `entryIds` retains every member id, oldest first |
| P3-01 | PROP-ESC-11, PROP-ESC-12, PROP-ESC-13 | one seeded positive per behavioural family |
| P3-02 | PROP-ESC-11, PROP-ESC-12, PROP-ESC-13, PROP-DIST-06 | closed-vocabulary fields excluded; `dist/` regenerated in the same commit |
| P3-03 | PROP-ESC-03, PROP-ESC-04, PROP-ESC-05 | `{source}` one `LOOP_SOURCES` member, never an alternation |
| P3-04 | PROP-ESC-04, PROP-ESC-05, PROP-DIST-06 | differential pinning `orchestrate-dev.js`'s own `LOOP_SOURCES` equal to the module's |
| P3-05 | PROP-VIEW-08 | four `decided*` fields read through `parseEscalationLog`, never by regex |
| P3-06 | PROP-VIEW-08, PROP-VIEW-13, PROP-DIST-06 | decision block appended, never rewriting the decided block |
| P3-07 | PROP-ESC-08, PROP-ESC-10 | notice string still pushed alongside the append |
| P3-08 | PROP-ESC-08, PROP-DIST-06 | four merge escalation sites; fourth `orchestrate-dev.js` write |
| P4-01 | PROP-PRE-09 | baseline captured **before** any Phase-4 source edit |
| P4-02 | PROP-PRE-09 | `STARTUP_REMEDIATION` exported frozen; absent at HEAD |
| P4-03 | PROP-PRE-09 | `cmdDoctor`'s printed bytes unchanged |
| P4-04 | PROP-BND-05 | `--loop`+`--loop-state` is a usage error; `--loop` path untouched |
| P4-05 | PROP-ITER-05, PROP-BND-05 | directive and view printed |
| P4-06 | PROP-PRE-02, PROP-PRE-07, PROP-PRE-08, PROP-PRE-10 | driven through production `cmdQueue`, real branch in place |
| P4-07 | PROP-PRE-08, PROP-RPT-03 | `!startup.ok` branch **unmodified**; `loop` block on the existing `emitReport` seam |
| P5-01 | PROP-ITER-02, PROP-ITER-16, PROP-PRE-05, PROP-PRE-06, PROP-BND-02, PROP-BND-03, PROP-BND-06, PROP-ESC-15 | refusal returns **before** `readFileFn(queuePath)`; the backoff re-append cell is **G-5** (not in P5-01's task text today) |
| P5-02 | PROP-ITER-02, PROP-BND-02, PROP-BND-03, PROP-VIEW-12, PROP-RPT-08, PROP-ESC-15 | `loop` + `operatorView` projected in the conditional-spread idiom |
| P5-03 | PROP-ESC-09, PROP-ESC-10 | append after `rewriteStatus`, before `finish` |
| P5-04 | PROP-ESC-09 | `ctx.source = "pipeline-halt"` |
| P5-05 | PROP-ESC-01 | one collector, three sources, set-equality + non-vacuity |
| P5-06 | PROP-ESC-02 | re-enumeration of `ADVISORY_SEAMS` at test time |
| P5-07 | PROP-BND-01 | real fixture git repo; per-commit provenance, no count-equality |
| P6-01 | PROP-ESC-06 | whole-output identity incl. the derived candidate |
| P6-02 | PROP-ESC-07 | `corpusState` from counted entries |
| P6-03 | PROP-ESC-07 | sibling `consolidationAdvisory.test.js` updated in the landing commit |
| P7-00 | PROP-DIST-02 | spec side moves first (`_tspec-packed-set.mjs` header) |
| P7-01 | PROP-DIST-01, PROP-DIST-02, PROP-DIST-03, **PROP-DIST-05** | four conjuncts, each red at HEAD for its own reason; **(a)**'s packed-tree `import()` is PROP-DIST-05's home since P7-03 was descoped |
| P7-02 | PROP-DIST-01, PROP-DIST-02, PROP-DIST-03 | D-1, D-2, D-3, D-5, D-6 in **one** task; a split reds a required check |
| P7-03 | *(none — descoped)* | **`DESCOPED` at PLAN v1.0 / DECISIONS DEC-LOOP-07.** Its authored intent — an installed engine that starts **and iterates** — is not producible (BR-04 makes an iteration a pipeline invocation and the fixture machine has no repo to run one against). PROP-DIST-05 moved to P7-01(a); the residual DEC-LOOP-07 accepts is carried in PROP-DIST-05's own text, not dropped |
| P8-01 | PROP-CFG-06 | containment for sections, set-equality for the `loop` map |
| P8-02 | PROP-CFG-06 | `loop` **and** the missing `merge` section in the same change |
| P8-03 | PROP-DOC-01, PROP-DOC-02 | `pdlc/templates/loop.md`; `pdlc/templates/` held only `QUEUE.md` at the pin commit `d4122427b` (P8-03 has since landed the second file) |
| P8-04 | PROP-DOC-05 | session-side directive protocol + E-20(b) launch-failure rule |
| P8-05 | PROP-BND-04, PROP-BND-07, PROP-DOC-03, PROP-DOC-04, PROP-DOC-06 | `--loop-state` documented as internal, absent from the four-item surface |
| P8-06 | PROP-BND-07, PROP-BND-08, PROP-DOC-01 | **G-1**: task text names two of AC-5.2's three literal setup members |
| P8-07 | PROP-BND-07, PROP-BND-08, PROP-DOC-01, PROP-DOC-03, PROP-DOC-04, PROP-DOC-05, PROP-DOC-07 | ranges over a **glob**, not an enumerated file list |
| P8-08 | PROP-BND-04 | documented set **derived** via shipped `effectiveGuardPaths`, read from tracked content |
| P9-01 | PROP-CFG-01, PROP-CFG-05, PROP-ITER-14, PROP-VIEW-05, PROP-ESC-11, PROP-ESC-12 | four `fast-check` laws |
| P9-02a | PROP-DIST-04 | strengthened **additively** and **before** the block is edited |
| P9-02 | PROP-DIST-04 | both `include` entries and both `REQUIRED_INCLUDES` entries, one co-change |
| P9-03 | PROP-DIST-06 | `build-runtime.mjs --check` clean after the last write |
| P9-04 | PROP-DOC-08, PROP-BND-05, PROP-BND-11 | four CI checks unchanged in membership |

**Every one of the PLAN's 60 task rows traces to at least one property, with two stated
exceptions.** **P0-01** is the row whose deliverable is test infrastructure rather than a behaviour;
it is named explicitly rather than counted as covered, and its own falsifier is that six named
properties cannot be written without it. **P7-03** is `DESCOPED` (PLAN v1.0, DECISIONS
**DEC-LOOP-07**) and its Properties cell is therefore empty by construction: a row that ships
nothing owes no property. The installed-engine conjunct P7-03 once carried was reattributed to
P7-01(a), where **PROP-DIST-05** homes it, and the residual DEC-LOOP-07 accepts — no CI check runs
the loop path of a packed-and-installed binary — is carried in PROP-DIST-05's own text rather than
left implied. Both exceptions are stated here so an unqualified *"every one of 60"* is never the
sentence a later reviewer or oracle checks mechanically.

### C-5. Test-level distribution against the pyramid

| Level | Properties | Budget | Within budget? |
|---|---|---|---|
| Unit | 47 (42 unit-only + 5 asserted at both levels) | many | yes |
| Integration | 37 (32 module, of which 6 engine-side, + 5 asserted at both levels) | moderate | yes |
| Document / history oracles | 13 | as few as the doc surfaces require | yes |
| E2E | **0** | max 3–5 | yes |

Zero E2E is the right answer here, and at HEAD it is no longer even a choice this document makes.
The feature's only end-to-end claim — *"an installed engine starts and iterates"* — was to have
ridden the existing `npm-pack-install-upgrade` fixture-machine leg; **PLAN v1.0 descoped that leg's
task (P7-03) and DECISIONS DEC-LOOP-07 records why**: BR-04 makes an iteration a pipeline
invocation and the fixture machine has no repo to run one against, so the surface is not producible
inside a required check. What remains is PROP-DIST-05's presence-and-resolvability conjunct over a
genuinely packed tree, asserted at module-integration level. Adding a journey test in its place
would not recover the descoped claim either — it would run against a checkout, not an installed
engine — so the residual is carried as a named, accepted risk in PROP-DIST-05 rather than
papered over with a more expensive test that proves something else.

**Reading the arithmetic.** The engine six are *inside* the 32 module-integration properties, not
additional to them; the five that lift 32 to 37 are the *asserted-at-both-levels* five, which is
also why they appear in the Unit row. Every property is counted once per level it is asserted at,
so the column sums to **97**, not 94: 94 properties, **plus 5** for the dual-level five counted
once in each of the Unit and Integration rows, **less 2** for PROP-BND-06 and PROP-BND-09, which
have no executing assertion (Overview row *Design property / policy*, O-6) and so appear in no level
row. 94 + 5 − 2 = 97 = 47 + 37 + 13 + 0. These are hand-maintained numbers — see the Overview's note
on PROP-BND-11's actual scope.

### C-6. FSPEC business rules → properties

The Overview claims the property set is derived from FSPEC v0.9's business rules (re-derived at
that revision: FSPEC v0.9 defines the same 36 BR ids as v0.8, `BR-01`…`BR-30` with the lettered
variants, so this axis carries over unchanged). **This is the axis
on which that claim is checkable, and it was absent from v0.1** — which is exactly how BR-09a fell
through (SE F-02): C-3 mapped E-26 (BR-09a's scenario) to properties that *assert* the mapping
rather than *exercise* it, and no other axis would have shown the hole.

FSPEC defines **36** distinct BR ids. Each row below is derived from the properties' own `Traces:`
cells, not hand-assembled: a property appears against a rule iff its block cites that rule.

| BR | Properties | Note |
|---|---|---|
| BR-01 | PROP-CFG-01, PROP-CFG-02, PROP-CFG-06, PROP-ITER-08 | — |
| BR-02 | PROP-CFG-01, PROP-CFG-03, PROP-CFG-05 | — |
| BR-03 | PROP-CFG-04, PROP-CFG-05 | — |
| BR-04 | PROP-ITER-01, PROP-ITER-02, PROP-ITER-03 | — |
| BR-04a | PROP-ITER-12 | — |
| BR-05 | PROP-ITER-04 | — |
| BR-06 | PROP-ITER-05 | — |
| BR-07 | PROP-ITER-06, PROP-ITER-07, PROP-ITER-13 | — |
| BR-08 | PROP-ITER-10 | — |
| BR-09 | PROP-ITER-07, PROP-ITER-08, PROP-ITER-09, PROP-ITER-11 | backoff advance and reset |
| **BR-09a** | **PROP-ESC-15** | *the gap closed in v0.2 (SE F-02).* Non-suppression of a retry append is the **loop's** obligation; BR-15's collapsing is the **view's** (PROP-VIEW-06), and neither substitutes for the other |
| BR-10 | PROP-PRE-02, PROP-PRE-03, PROP-PRE-08, PROP-PRE-09 | — |
| BR-11 | PROP-PRE-04 | — |
| BR-11a | PROP-PRE-05 | — |
| BR-11b | PROP-PRE-01, PROP-PRE-07, PROP-PRE-08, PROP-PRE-10, PROP-DOC-05 | — |
| BR-12 | PROP-ESC-03, PROP-ESC-11 | — |
| BR-12a | PROP-ESC-04, PROP-ESC-05, PROP-ESC-08 | — |
| BR-13 | PROP-VIEW-01, PROP-VIEW-02, PROP-VIEW-03, PROP-VIEW-04, PROP-VIEW-05 | — |
| BR-14 | PROP-VIEW-08, PROP-VIEW-09, PROP-VIEW-13 | — |
| BR-15 | PROP-VIEW-06, PROP-VIEW-07, PROP-VIEW-09, PROP-VIEW-13, PROP-VIEW-14, PROP-ESC-15 | BR-15's on-disk-count-**unchanged-by-rendering** clause is PROP-VIEW-06's; BR-09a's on-disk-count-**grows-on-retry** clause is PROP-ESC-15's |
| BR-16 | PROP-VIEW-10, PROP-VIEW-11 | — |
| BR-17 | PROP-ESC-14 | — |
| BR-18 | PROP-ESC-11, PROP-ESC-12, PROP-ESC-13 | — |
| BR-19 | PROP-BND-01 | — |
| BR-20 | PROP-BND-02, PROP-BND-03 | — |
| BR-21 | PROP-BND-05, PROP-DIST-01, PROP-DIST-02, PROP-DIST-05 | PROP-DIST-05 covers BR-21's *presence on the installed engine* half only; its *starts and iterates* half is the residual DEC-LOOP-07 accepts |
| BR-22 | PROP-BND-06 | declared unasserted (O-6) |
| BR-23 | PROP-BND-04 | — |
| BR-24 | PROP-BND-04 | — |
| BR-25 | PROP-BND-07, PROP-BND-08, PROP-BND-09, PROP-DOC-06 | PROP-BND-09 declared unasserted (O-6) |
| BR-26 | PROP-DOC-01, PROP-DOC-02 | — |
| BR-26a | PROP-DOC-01 | — |
| BR-27 | PROP-RPT-01 | — |
| BR-28 | PROP-RPT-03, PROP-RPT-04 | — |
| BR-29 | PROP-CFG-06 | — |
| BR-30 | PROP-DOC-03, PROP-DOC-04 | — |

**No BR is uncovered.** The re-derivation recipe, since this table is hand-maintained like
C-1…C-5: `grep -o 'BR-[0-9]*[a-z]*' FSPEC-pdlc-engineering-loop.md | sort -u` set-differenced
against the same grep run per property block in this document's **Properties** section. Note that a
plain `grep BR-09` matches `BR-09a`; the two must be matched as distinct whole ids or the gap
re-hides itself.

## Gaps and Routed Errata

Four kinds of item: **routed errata** (five of them, G-1…G-5 — of which **four remain open** and
**G-2 is discharged** by TSPEC v1.0; defects in an upstream document,
not edited here and not
folded into this document's own verdict), **owed coverage** (one, **G-6** — an upstream clause this
document does **not** cover, recorded so the gap is visible where a reader looks for coverage; not
a defect and not routed anywhere, because the owning upstream has already recorded it),
**declared unasserted properties** (already stated in
Oracles O-6), and **verification notes** recording what was checked against the repository rather
than taken from a document.

### Routed errata

**G-1 — PLAN P8-06 places AC-5.2's third setup member outside the setup list.**
*(Restated in v0.2. The v0.1 wording said P8-06 **omitted** the loop prompt; SE F-05 is right that
it does not, and an overstated diagnosis costs the PLAN's author a round. The narrower defect below
is the real one.)*

REQ AC-5.2 names three members of one list: *"installing the engine, creating `docs/_queue/QUEUE.md`
from the shipped template, and installing the loop prompt (AC-1.1)"*, and FSPEC AT-33 asserts
containment of all three **as members of the setup list**. PLAN P8-06's task text reads in full:

> `pdlc/README.md`: AC-5.1's four steady-state operator turns and AC-5.2's separate one-time setup
> list (install the engine, create `docs/_queue/QUEUE.md`), **plus the install instruction naming
> `pdlc/templates/loop.md`**

The loop prompt **is** named, and P8-06's AT column carries AT-45 alongside AT-33. What P8-06 does
not require is that the instruction land **inside** the setup-list parenthetical — it is scoped as a
separate "plus" clause. AT-33's containment conjunct is over the setup list, so a `pdlc/README.md`
satisfying P8-06 as written can still red AT-33's third member on placement. PROP-BND-08's third
conjunct is therefore at risk for a **placement** reason, not an omission reason. Routed to the
PLAN's author to move the clause inside the list, or to say explicitly that the two surfaces are
one.

**G-2 (DISCHARGED at TSPEC v1.0, re-measured at HEAD `c4d1e2d8b`) — TSPEC's *Levels and homes*
table had no row for four PLAN-named new test files.**
*The item is retained as round history; it no longer routes anything. TSPEC v1.0's round-11 erratum
added a row for each of the four files to *Test Strategy* → *Levels and homes*, so the claim below
is false at HEAD. Cited by test-file name and level label per DEC-DOC-01, not by line:
`loopBaselinePreflight.test.js` (level *Baseline pre-flight*), `loopEntryVocabulary.test.js`
(level *Pure unit*, AT-21), `loopDecisionEntry.test.js` (level *Pure unit*, AT-25) and
`loop-startup-remediation.test.js` (engine suite, AT-44) each declare a level and a home. The
homing this document had already given the four is unchanged and now agrees with the TSPEC.*

As originally routed: the PLAN names `loopDecisionEntry.test.js` (P3-05/P3-06), `loopEntryVocabulary.test.js` (P3-03),
`loopBaselinePreflight.test.js` (P0-00) and `pdlc/engine/__tests__/loop-startup-remediation.test.js`
(P4-01…P4-03). None matches the table's `loopSession*` or `escalationView*` globs and none has its
own row, so four files with real deliverables have no declared level or home in the TSPEC. The
TSPEC's own opening claim for that section — that it names where each level lives — is therefore
incomplete against the plan derived from it. Routed to the TSPEC's author.

**G-3 — `AT-34a` is cited by TSPEC and PLAN but is not defined in FSPEC's acceptance-test list.**
`AT-34a` appears 13 times in the TSPEC (including the *Traceability* BR-18 row, which cites it as
*"**AT-34a** (negative control)"*) and 7 times in the PLAN, but **zero** times in the FSPEC. The AT
namespace is the FSPEC's, and BR-18's falsifiability depends on the negative control existing: AT-34
alone proves the redactor fires, and nothing in the FSPEC asks that it *not* fire on a git oid or on
an interior prefix match — the two mutants TSPEC names as (f) and the anchor case. PROP-ESC-12
carries the claim, but its cited authority does not exist. Routed to the FSPEC's author to define
AT-34a as a numbered row.

**G-4 — PLAN P3-07/P3-08 name "four escalation sites"; there are five, under two mechanisms.**
Measured at `8eb43beed` (`grep -n "MERGE ESCALATION:" pdlc/workflows/orchestrate-dev.js`): exactly
**two** sites push a catalogue-rendered notice onto the mutable `escalations` accumulator
(`MERGE_ESCALATIONS.queue`, `MERGE_ESCALATIONS.tree`), and **three** emit an inline template literal
inside an `escalations: [ … ]` array on a returned `{kind: "resolved", mergeStatus: "refused", …}`
object — two guard variants (`verdict.matched` matched, and changed-file list unretrievable) and one
CI-evidence-absent site, the last gated on `ci.escalate` being truthy. `MERGE_ESCALATIONS.guard`
and `MERGE_ESCALATIONS.ci` are declared in the frozen catalogue but have **no production caller**;
their only callers are `advisoryEscalationLog.test.js` and `mergePhase.test.js`. An implementer
following P3-07/P3-08's text looks for four `escalations.push` sites, finds two, and either invents
call sites the REQ does not authorise or writes cells that assert nothing. PROP-ESC-08 now states
the real inventory; the PLAN's task text still does not. Routed to the PLAN's author. **Not** a
request to convert the inline literals into catalogue calls — that would rewrite strings existing
assertions pin, and no requirement asks for it.

**G-5 — no PLAN row's task text owns BR-09a's backoff re-append cell.**
BR-09a (`FSPEC`, BR-09a row) requires that a backoff re-invocation re-triaging an already-escalated
candidate **appends a further entry**, and that *"the loop neither suppresses nor de-duplicates an
append"*, because the on-disk block count is the escalation-frequency signal the calibration reads
(BR-15, E-26). AT-50 is owned by P2-05/P2-06, whose task text is view-layer only — three
fixture-manufactured appends collapsing to one item. P5-01's driver row does not mention a backoff
re-append. So the loop-side half of BR-09a has no task text behind it, and an implementation that
de-duplicated at the loop's own append site would pass every planned cell. PROP-ESC-15 states the
property and homes it in `loopQueueDriver.test.js` (P5-01's file) on that assumption; the PLAN
should make the cell explicit. Routed to the PLAN's author.

### Owed coverage

**G-6 — AT-52's gate-invariance clause is not covered by any property in this catalogue.**
FSPEC **v0.9** widened AT-52's second conjunct so that *"nothing the gate asserts changed other than
that enumeration's membership — so an edit to a comparison, a normalisation or a derived count
reds"* (FSPEC **AT-52**; also stated in FSPEC's v0.9 erratum summary, and reaching BR-21 and REQ §5's
carve-out). The conjunct has two halves and this document carries only one of them:

| Half of the widened conjunct | Status here |
|---|---|
| Test-side transcriptions are part of the enumeration | **Carried.** PROP-DIST-02's oracle re-reads each enumeration *at test time*, and P7-01(b)'s artifact sites include `packaging.test.js`'s `WORKFLOW_MODULE_NAMES` |
| An edit to a **comparison, a normalisation or a derived count** reds, even where every enumeration's membership is intact | **Not covered.** PROP-DIST-02 asserts superset-plus-growth over membership only; PROP-DIST-03 asserts path-preserving copy. An edit of that shape passes both |

This is **not** an erratum: FSPEC v0.9's AT-52 is correct as written, and the owning upstream has
already adjudicated the gap. PLAN **v1.2** records it under *"Not yet covered, and named as owed"*
(PLAN §*Verification*, `AT-52` bullet): P7-01(b) *"asserts membership additivity only, and owes that
conjunct"*, with P7-01(c) named as the **natural home** and the DoD item carrying an exception that
says ticking it is not evidence the clause is covered. PLAN v1.2's changelog row adds *"No new
conjunct added"* — P7-01(e) would discharge the clause outright, but adding it is a decision both
reviewers filed `DEFERRED:` under DECISION FREEZE. This row therefore opens **no property** and
asks for no upstream edit; it exists so that the one document whose purpose is to make covered and
uncovered distinguishable does not read the clause as closed. It is discharged when the round that
absorbs FSPEC v0.9 substantively takes that decision.

Not to be confused with **DEC-LOOP-07's residual** (AT-52's *installed-engine* *"starts and
iterates"* clause), which is a ratified accepted risk carried in PROP-DIST-05's own text, not an
owed item.

### Declared unasserted properties

PROP-BND-06 (REQ NFR-4) and PROP-BND-09 (REQ NFR-6) have no executing assertion. Both are so by the
REQ's own construction — NFR-6 states outright that it is *"not a criterion checkable at
delivery"* — and O-6 records the structural proxies that exist for each. Neither was given a weak
oracle to appear covered.

### Testability observations routed to their owning authors (non-blocking)

These are not errata; they are notes an implementer will hit and should not have to rediscover.

1. **PROP-VIEW-13's byte-identity is prefix-identity, not whole-file identity.** FSPEC BR-14/BR-15
   and REQ AC-4.4 say *"byte-identical"* of a **block**, and appends are expected to grow the file.
   A reviewer reading "byte-identical" as whole-file would call PROP-VIEW-13 wrong; it is not, and
   the growth conjunct is what makes it falsifiable.
2. **PROP-PRE-04's ignored-file cell interacts with a shipped repo hazard.** Trailing-slash
   `.gitignore` patterns (`node_modules/`) do not match a *symlinked* directory, so a worktree with
   symlinked dependencies reds every `git status --porcelain`-clean assertion. The fixture must use
   an argv-keyed `gitFn` double rather than the host tree, or be measured in a tracked-files-only
   detached checkout.
3. **PROP-DIST-04's coverage-floor entries are the feature's second inherited widening.** They sit
   **outside** REQ §5's carve-out (which is qualified to `pdlc-engine-distribution`'s file
   enumerations) and rest on §5's out-of-scope clause directly: widening the file set a ≥85%
   per-file branch floor ranges over changes no gate's *assertion*. Two more files must clear 85%;
   no file's floor moves. Stated here so a reviewer does not read it as a carve-out claim.

### Verification notes

Every claim this document makes about existing behaviour was checked against the working tree at
`8eb43beed`, not against a document:

| Claim | Verified |
|---|---|
| **Exported symbols only** (this row vouches for each symbol's *export*, not for its call sites — see the next row): `renderEscalationEntry`, `appendEscalationEntry`, `MERGE_ESCALATIONS`, `MERGE_GUARD_DEFAULTS`, `effectiveGuardPaths`, `ADVISORY_SEAMS`, `MERGE_CONFIG_PATH` exported | all seven present in `pdlc/workflows/orchestrate-dev.js` |
| **Merge-escalation call sites** — `MERGE_ESCALATIONS.queue` and `.tree` are the **only** production callers; `.guard` and `.ci` are declared but called only from tests; three further sites emit inline template literals on returned objects, one of them gated on `ci.escalate` | `grep -n "MERGE ESCALATION:" pdlc/workflows/orchestrate-dev.js` and `grep -n "MERGE_ESCALATIONS\.\(guard\|ci\|queue\|tree\)"` over the same file, plus the test-side callers in `advisoryEscalationLog.test.js` and `mergePhase.test.js`. **v0.1 did not check this**, and PROP-ESC-08 asserted "four `escalations.push` sites" on the strength of the export row above. Corrected in v0.2 (SE F-01); the export row is now explicitly scoped to exports |
| `ADVISORY_SEAMS` is a six-member frozen array | `Object.freeze(["A1","A2","A3","A4","A5","A6"])` |
| `ESCALATIONS_PATH = "docs/_queue/ESCALATIONS.md"` | present, module-private (correctly excluded from P0-00's importability set) |
| `commitQueueRow`, `precheckDependencies`, default-exported `main` | present in `pdlc/workflows/orchestrate-queue.js` |
| `parseEscalations` | present in `pdlc/workflows/consolidate-learnings.js` |
| `runStartupChecks`, `formatStartup` | present in `pdlc/engine/lib/startup.mjs`; `STARTUP_REMEDIATION` **absent** (P4-02 adds it) |
| `startupFor`, `defaultDeps`, `cmdDoctor`, `cmdQueue` | present in `pdlc/engine/bin/cli.mjs`; `startupFor` is a member of the exported `defaultDeps`, so `deps.startupFor` is injectable as TSPEC states |
| `LOOP_STOP_REASONS` is `["exhausted","bound-reached","blocked","refused"]`; `runQueueLoop` exported | `pdlc/engine/lib/run.mjs` |
| `prepack.mjs`'s `MODULE_NAMES` is a flat two-entry list creating no `lib/` | `["orchestrate-dev.js", "orchestrate-queue.js"]` — PROP-DIST-01's red-at-HEAD reason |
| `packaging.test.js`'s copier is `path.basename`-flattened under a single `mkdirSync` | PROP-DIST-03's red-at-HEAD reason |
| c8 `include` block holds exactly four entries, none of them `lib/` | `pdlc/workflows/package.json`; `lib/document-oracles.mjs` is not in it |
| `REQUIRED_INCLUDES` names exactly the three pre-existing workflow entries | `coverageInstrumentation.test.js`; `CAPTURE_SCRIPT_INCLUDE` is a separate constant — PROP-DIST-04's gap |
| `pdlc/workflows/lib/` holds exactly `document-oracles.mjs` | both loop modules are new |
| `pdlc/templates/` holds exactly `QUEUE.md` | `loop.md` is new — PROP-DOC-01's red-at-HEAD reason |
| `fast-check` is a declared devDependency | `pdlc/workflows/package.json` |
| precedent suites exist | `advisoryHelperProperties.test.js`, `consolidationProperties.test.js`, `advisoryEscalationLog.test.js`, `mergeQueueDriver.test.js`, `consolidationAdvisory.test.js`, `consolidationBuild.test.js`, `coverageInstrumentation.test.js`; engine-side `advisory-config-example.test.js`, `learnings-config-example.test.js`, `packaging.test.js`, `ci-arrangement.test.js`, `cli.test.js`, `_tspec-packed-set.mjs` |
| `npm-pack-install-upgrade` is an existing fixture-machine leg | `pdlc/engine/scripts/fixture-machine.mjs` — recorded as a *tree fact*, not as a property home: no property is homed there since PLAN v1.0 descoped P7-03 (DECISIONS DEC-LOOP-07) |
| no test file named `loop*` exists on either side | every loop test file in this document is new; the two `*loop*` matches at HEAD (`reviewLoop.test.js`, `exit-loop.test.js`) are unrelated |

**Coverage matrix shows no unexplained gaps.** The five routed errata that exist — G-1…G-5 — are
named, routed upstream, and each states what would red as a consequence; **G-2 is discharged** at
TSPEC v1.0, so four remain open (G-1, G-3, G-4, G-5), each re-measured against HEAD `c4d1e2d8b` and
still reproducing. **G-6** is a gap of a different kind — coverage this document owes rather than a
defect it routes — and is stated in full above rather than left to be inferred from a property's
silence. Since v0.2 the matrix carries **six**
axes, not five: **C-6** (FSPEC business rules → properties) is the axis on which the Overview's own
derivation claim is checkable, and adding it is what surfaced BR-09a's gap.
