# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Scope

Testing lens only: whether each decision's obligations are falsifiable, whether each
re-evaluation trigger is detectable, and whether the cost claims that decide between options
are true of the tree at HEAD. Architecture merit, product framing and prose style are out of
lens. Every cost figure in the document was re-measured against HEAD rather than read.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **K-3's falsifier does not falsify: omitting `lib/stats.mjs` from `c8.include` is green everywhere, which silently voids the coverage gate that is DEC-STATS-01's whole differentiator over option B.** | Consequences, K-3; DEC-STATS-01 *Constraint that forced the shape* |
| F-02 | Medium | Local | **Option D's stated evidence is false against HEAD:** `document-oracles.mjs` is not in `c8.include`. | Options Considered, DEC-STATS-01, "D rejected" |
| F-03 | Medium | Local | **DEC-STATS-03's re-evaluation trigger is invisible to the only oracle that guards the decision** — `===` identity still holds when the driver exports gain state. | DEC-STATS-03, *Re-evaluation trigger* |
| F-04 | Medium | Cross-Feature | **K-4 is discharged by review where a mechanical oracle is available** — "a second construction site is a review-blocking finding, not a test failure". | Consequences, K-4 |
| F-05 | Low | Local | **K-1's Falsified-by column claims coverage of five sites from an oracle that ranges over four.** | Consequences, K-1 |
| F-06 | Low | Local | **Off-by-one in DEC-STATS-01's first re-evaluation trigger** ("a third runtime-reachable member added after `stats.mjs`"). | DEC-STATS-01, *Re-evaluation triggers* |

### F-01 (High, Cross-Feature) — the c8-include obligation has no detector

K-3 reads: *"`pdlc/workflows/package.json`'s `c8.include` gains a `**/`-anchored, path-qualified
entry for `lib/stats.mjs` … **Falsified by** `coverageInstrumentation.test.js`, which runs c8
against the block."* The second half is not true of that file, and the gap is load-bearing.

What `coverageInstrumentation.test.js` actually asserts, read at HEAD:

1. `REQUIRED_INCLUDES` — a **transcribed literal of four entries** (`orchestrate-dev.js`,
   `orchestrate-queue.js`, `build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs`),
   plus `CAPTURE_SCRIPT_INCLUDE`. It is a **containment** check over that fixed list, never a
   set-equality over `c8.include`, so a member absent from both the config and the list is absent
   from nothing.
2. Shape assertions that range over whatever entries *do* exist (`entry.startsWith("**/")`,
   `allow-external === true`, the exclude globs).
3. One test that genuinely runs c8 — "the shipped c8 config resolves BOTH in-package modules and
   the external script (F4)" — but its driver imports exactly `build-runtime.mjs` and
   `scripts/capture-learnings-baseline.mjs`. It answers "does the config resolve *these two*
   paths", by its own comment ("one in-package module answers it for all three"), and never opens
   `lib/`.

**The live proof that the obligation is unguarded is already in the tree.** Two
`pdlc/workflows/lib/` members sit in `c8.include` (`lib/loop-session.mjs`,
`lib/escalation-view.mjs`) and appear in **no** assertion in that file; a third,
`lib/document-oracles.mjs`, sits in `pdlc/workflows/lib/` and in no include set at all, and
nothing anywhere is red about it. A `lib/*.mjs` member's presence in or absence from the
coverage config is, at HEAD, an unasserted property.

**Why this is High rather than Medium.** The include entry is not a reporting nicety; it is the
membership test for measurement. c8 opens only what `include` matches (`all` is not set), so an
unincluded `lib/stats.mjs` produces no per-file entry, and the second stage of `test:coverage`
(`c8 report --check-coverage --per-file --branches 85 …`) has nothing to check and exits 0. The
module would then be in exactly the state DEC-STATS-01's own option table records as
disqualifying for options B and C — *"Coverage gate (verified): **none**"* — while the document
records option A as having one. A forgotten one-line JSON edit converts the chosen option into
the rejected one, with a green suite and a green CI leg, and the DECISIONS record still reading
"subject to `test:coverage`'s second `--per-file --branches 85` pass".

This is DC-14's corollary verbatim: *"a comment or document that asserts 'X is enforced by Y'
names Y as an existing test id. A claim with no citable oracle has no expiry date."* It is also
the failure mode K-1's own Falsified-by column quotes from `pdlc-engineering-loop`'s LEARNINGS —
*"a co-change set enumerated in prose with no oracle is unsound by construction"* — applied to
the one member of the five-site set that the vendoring oracle does not reach.

**Change that resolves it.** Re-state K-3's Falsified-by as a *new* oracle, and route the
corresponding conjunct to TSPEC §6.4 as a sixth anti-drift row, so the five-site co-change set is
oracle-complete rather than four-of-five. Two conjuncts, because either alone is inert (the same
lesson the F4 test's own header records):

- **Declared:** `c8.include` contains the literal `**/pdlc/workflows/lib/stats.mjs`. Add it to
  `REQUIRED_INCLUDES` rather than writing a fresh assertion, so the existing `startsWith("**/")`
  loop keeps covering the anchoring half of K-3.
- **Resolved:** the F4 c8 run's driver imports `lib/stats.mjs` too, and the resulting
  `json-summary` names it. A declared entry that c8 does not resolve is precisely the defect that
  test exists for — CODE_REVIEW v1 F4 round 2 caught three bare basenames that silently stopped
  matching under `allow-external`, and `lib/stats.mjs` is reached through the same include set.

Both are positive-presence assertions on the served path, not absence checks, and both fail if
the co-change is partial in either direction.

### F-02 (Medium, Local) — Option D's evidence sentence is wrong at HEAD

DEC-STATS-01's "D rejected" paragraph reads: *"`pdlc/workflows/lib/document-oracles.mjs` is such
a member: it appears in none of the four vendoring enumerations, only in
`pdlc/workflows/package.json`'s `c8.include`."* The first clause is true; the second is not.
`c8.include` at HEAD is seven entries — `orchestrate-dev.js`, `orchestrate-queue.js`,
`build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs`,
`scripts/capture-learnings-baseline.mjs`, `lib/loop-session.mjs`, `lib/escalation-view.mjs` —
and `document-oracles.mjs` is not among them. The completed sibling that added the other two lib
members says so in as many words: `docs/completed/pdlc-engineering-loop/PLAN-…md`'s file-state
table records *"c8 `include` is a four-entry `**/`-anchored list; `lib/document-oracles.mjs` is
**not** in it"*.

The paragraph's **conclusion** survives intact — D is a broken A, not a cheaper A, and the
asymmetry really is explained by runtime reachability, which the `resolveWorkflowRoot()` probe
confirms: `rootResolves` in `pdlc/engine/lib/run.mjs` tests only for `orchestrate-dev.js` and
`orchestrate-queue.js`, so an unvendored `lib/stats.mjs` leaves the vendor root selected and the
dynamic `import()` throws for installed users exactly as the document says. What does not survive
is the sentence's implicit second claim, that a `lib/` member skipping the vendoring co-change
still lands inside a coverage gate. No such precedent exists; the one cited example is measured
by nothing.

Correcting it matters beyond accuracy, because the true state is F-01's evidence: the repository
already contains a `pdlc/workflows/lib/` module that is in no enumeration and in no include set,
and nothing is red about it.

**Change that resolves it.** Replace the clause with the measured state — `document-oracles.mjs`
appears in none of the four vendoring enumerations *and in no coverage include set*, because its
only importer is `pdlc/workflows/__tests__/documentOracles.test.js` and it is never reached by a
shipped code path. Line up the two axes explicitly (reachability decides vendoring; the include
set is a separate, separately-forgettable edit) so a later reader does not re-derive the wrong
precedent.

### F-03 (Medium, Local) — DEC-STATS-03's re-evaluation trigger cannot be observed by its own oracle

The trigger reads: *"The driver exports gain state — a closure over configuration, a cache, a
module-level mutable. Sharing a function reference stops being sufficient the moment two callers
can observe each other through it."* That is the right condition, and it is the one condition
under which the decision's single guard is structurally blind. The identity oracle asserts
`statsParsers()`'s members are `===` `orchestrate-dev.js`'s exports; adding a module-level cache
inside `deriveRoundWindow` changes no reference, so the oracle stays green while the property it
stands for is gone. Every other conjunct in the design is equally blind: the recording double
wraps the real parsers, so it inherits the shared state rather than exposing it.

The document is honest that reference identity is chosen because it is *total over inputs* —
which is right, and is why it is the correct guard for the C-5 question it answers. The gap is
that no gate observes the guard's own **precondition**. A trigger whose arrival is invisible is a
trigger nobody pulls; this decision would be re-evaluated only after a caller observed the
symptom in production.

**Change that resolves it.** Give the trigger a named detector rather than leaving it as a
condition a reader is expected to notice. The cheapest honest one is a purity conjunct on the
four exports, at the level DEC-STATS-03 already reaches: call each classifier twice with the same
input in a fresh module instance and assert deep-equal, non-aliased results, so a cache or a
mutable that makes call *n* depend on call *n−1* goes red. If that is judged out of this feature's
scope, say so in the trigger itself ("no detector; caught only by review of
`orchestrate-dev.js`") — an acknowledged residual is reviewable, an implied one is not.

### F-04 (Medium, Cross-Feature) — K-4's sole-construction-site rule is mechanically checkable, and is left to review

K-4: *"`statsParsers()` remains the sole production construction of the bundle. A second
construction site voids DEC-STATS-03's oracle without failing it … **Falsified by** TSPEC §6.4's
identity oracle covers the one site; a second site is a review-blocking finding, not a test
failure."* The diagnosis is exactly right — TSPEC §6.4 pins `statsParsers()` and the object
`cmdStats` hands `runStats`, so a second construction elsewhere is outside both conjuncts — and
the disposition is the one DC-14's corollary rules out. "Voids the oracle without failing it" is
the definition of a load-bearing claim with no detector, and DC-03's *"correct by reasoning is
not green"* corollary is the same lesson from the other direction.

It is Cross-Feature because sole-production-construction-site is a recurring shape in this
repository, not a fact about `pdlc stats`: `resolveWorkflowRoot()`, `loopSessionModule()` and
`escalationViewModule()` all carry the same "one arrangement, reused" contract in prose.

**Change that resolves it.** A source-scan oracle in the same file as the identity oracle: read
`pdlc/engine/bin/cli.mjs`, and assert that the bundle's construction — the object literal naming
all four classifiers — occurs exactly once, inside `statsParsers`. Set-equality over occurrences,
not "at least one", so a second site is red rather than tolerated. The repository already ships
oracles of this shape over source text, so this is a precedented row rather than a new mechanism.
If it is genuinely not worth the row, file it as a Residual with its reason rather than as a
Falsified-by cell naming "review".

### F-05 (Low, Local) — K-1 claims five sites from a four-site oracle

K-1 obliges *"the five co-change sites in DEC-STATS-01's table"* to move in one change, and cites
TSPEC §6.4's vendoring oracle as the falsifier. That oracle asserts membership in
`prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`,
`fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES` and `_tspec-packed-set.mjs`'s
`WORKFLOW_MEMBERS`, plus the `vendoredClassSize === MODULE_NAMES.length + 1` invariant — four
sites. The fifth, `pdlc/workflows/package.json`'s `c8.include`, is K-3's, and F-01 is about
whether K-3's own falsifier holds. As written the row reads as though one oracle covers all five.

**Change that resolves it.** Say four in K-1's Falsified-by cell and name K-3 as the owner of the
fifth, so the two rows partition the co-change set instead of overlapping ambiguously.

### F-06 (Low, Local) — off-by-one in the first re-evaluation trigger

*"`pdlc/workflows/lib/` becomes a routinely-growing directory (a third runtime-reachable member
added after `stats.mjs`)."* At HEAD the runtime-reachable members are `lib/loop-session.mjs` and
`lib/escalation-view.mjs` — two — so `stats.mjs` is itself the third, and a member added after it
is the fourth. The parenthetical and the sentence it qualifies name different thresholds.

This is worth a word only because the trigger is otherwise the one in the document with a clean
mechanical detector (`MODULE_NAMES.length`), and a threshold stated twice at two values cannot be
turned into one.

**Change that resolves it.** "a fourth runtime-reachable member, added after `stats.mjs`", and
optionally state the detector: `prepack.mjs`'s `MODULE_NAMES` exceeding five entries.

## Questions

| ID | Question |
|----|---------|
| Q-01 | K-5 obliges `SCHEMA_VERSION` to be *referenced* only inside `renderJson`, but names TSPEC §6.3's cross-mode oracle as the falsifier. §6.3 compares rendered outputs, so it catches a read that *surfaces* (a `schemaVersion` row in the human table goes red on the correspondence check) and not a read that does not — `computeFeatureStats` consulting the constant without emitting it stays green. Is the obligation intended as "never emitted outside `renderJson`", which §6.3 does falsify, or as "never read outside `renderJson`", which needs a source-scan conjunct? The first is what the harm requires and would be worth saying instead. |
| Q-02 | The third standing cost accepts that real-path tests bound to `docs/completed/` go red when a future feature archives a directory, and mitigates it by declaring each literal a *measurement of the archive*. TSPEC §6.1 discharges that with a per-literal comment carrying the measurement date and the re-measuring command. Does DEC-STATS-01 intend that comment convention to be the binding form of the mitigation — in which case naming it here makes it citable — or is the convention TSPEC's own choice, free to change without reopening this cost? |

## Positive Observations

- **Every cost figure in the document is true at HEAD.** All of it was re-measured rather than
  read: `orchestrate-dev.js` is 836 091 bytes (816.5 KiB, as stated); `bin/cli.mjs` is 58 346
  bytes (57.0 KiB); `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s and
  `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` and `fixture-machine.mjs`'s
  `WORKFLOW_MODULE_NAMES` hold exactly the members the site table claims; `tspecPackedCount`
  returns `4 + 15 + 5 + 1 + (licence ? 1 : 0)`; `LIB_MODULES_AT_HEAD` is twelve and
  `LIB_MODULES_FROM_THIS_FEATURE` three, so option B's `15 → 16` is right; `c8.include` is seven
  `**/`-anchored entries; `test:coverage`'s second stage really is
  `--per-file --branches 85`; and `pdlc/engine/package.json`'s only test script is
  `node __tests__/_run-suite.mjs`, with no `c8` block and no `devDependencies` at all, so option
  B's "**none**" is exact rather than rhetorical. The document's opening promise — *"Every cost
  below was measured against the tree at HEAD, not estimated"* — is kept, which is rarer than it
  should be and made this review a verification rather than a reconstruction.

- **Every cross-feature citation resolves to the authority it names.** `_tspec-packed-set.mjs`'s
  header does say *"Never this file alone"* about TSPEC §5.4's `PK-*` table and FSPEC §5.2's
  per-class counts; `PK-24`/`PK-25` are in that file's own comments recording the three → five
  growth; `pdlc-engineering-loop`'s LEARNINGS carries both the "completed sibling's approved
  enumerations are a live coupling" row and the "verbatim restatement across three documents is a
  defect generator" row, the latter with the 110-of-177 figure; `pdlc-loop-economics` carries
  DEC-LOOPECON-08 and NG-3 exactly as characterised. Nonexistent-authority citations have shipped
  in this repository before; none here.

- **DEC-STATS-02 is the strongest of the three, and for a testing reason.** Choosing
  `renderJson`-as-projection over a field on `StatsReport` is what lets TSPEC §6.3's cross-mode
  oracle stay a clean set-equality instead of set-equality-minus-one. A permanent per-key
  exception is not a small cost: it is a standing hole in the one oracle REQ R-5's stability
  guarantee rests on, and exception lists grow. The decision is correctly framed as *what shape
  keeps the oracle falsifiable*, which is the framing I would have asked for.

- **The anti-echo discipline is carried through into the decision, not left to the test author.**
  §6.3 pins `schemaVersion` against the literal `1` rather than against the module's
  `SCHEMA_VERSION` — the decision that makes BR-24's increment rule detectable at all — and the
  chosen key-set assertions are set-equality over hand-transcribed literals. DEC-STATS-01's
  carve-out paragraph is likewise stated once with downstream documents obliged to cite rather
  than restate (K-6), which is the direct application of the LEARNINGS row it cites.

- **DEC-STATS-03 correctly identifies that a corpus cannot discharge a universal.** Rejecting
  behavioral-equivalence testing (option C) because *"C-5 is about agreement on all bytes"* is the
  right reasoning, and defaulting the unit doubles to the real parsers so a test opts *out* of
  fidelity explicitly — matching TSPEC §6.1's `recordingParsers(real)` — closes the by-omission
  path that usually undoes such a guard.

## Recommendation

**Needs revision**

One High finding (F-01). The revision is narrow: K-3's Falsified-by cell names an oracle that
does not assert the obligation, and the fix is to name one that does — a `c8.include` membership
conjunct in `REQUIRED_INCLUDES` plus a resolution conjunct in the existing c8 run — with the
matching row routed to TSPEC §6.4 so the five-site co-change set is oracle-complete. F-02 is a
one-sentence correction whose conclusion is unaffected. F-03 and F-04 ask for a named detector or
an acknowledged residual, not for a design change. F-05 and F-06 are wording.

Nothing in the three decisions themselves is contested. All three read as correct choices, and
the option tables are the best-evidenced I have reviewed on this feature; what is missing is a
detector for one obligation the decisions' own value depends on.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 2}
