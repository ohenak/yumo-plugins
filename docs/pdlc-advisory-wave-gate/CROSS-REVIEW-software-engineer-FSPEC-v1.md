# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.5)
**Date:** 2026-08-20
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | BR-2 drops AC-2.2's **ordered, first-matching-class-wins** semantics, and AT-02-1's set-equality oracle cannot falsify a reordering | §4 BR-2, §6.2 AT-02-1 |
| F-02 | High | Cross-Feature | BR-9/AT-05-1's restoration oracle ranges over "tracked and untracked files alike" with no exclusion for ignored paths — as written it mandates a destructive restore over `node_modules/`, caches and `.env`, and is non-deterministic under gate-run churn | §4 BR-9, §6.5 AT-05-1, AT-05-2 |
| F-03 | Medium | Local | AT-03-7 contradicts itself: its *When* says "compared by set-equality", its *Then* says "Ordered-sequence equality, never set equality" | §6.3 AT-03-7 |
| F-04 | Medium | Local | The "pre-A6 baseline" / "the reason the pre-A6 pipeline emits" oracles name a comparand that no longer exists at HEAD, and do not say the expected value is a transcribed literal | §6.1 AT-01-3, AT-01-4; §6.4 AT-04-1; §6.5 AT-05-3 |
| F-05 | Medium | Local | BR-12's "that later task's dispatch is told the promotion already exists" is unspecified across a re-invocation, which M-WG-6 says re-enters Phase I at wave 1 and re-dispatches every wave | §4 BR-12, §6.4 AT-04-5 |
| F-06 | Low | Local | §3.2 step 9 enumerates the terminal-disposition vocabulary as a closed three-member set but no AT asserts it; every other closed vocabulary in this FSPEC gets an equality oracle | §3.2 step 9 |

### F-01 (High) — BR-2 loses AC-2.2's ordering, and AT-02-1 cannot see it

REQ AC-2.2 states the vocabulary as a "closed, **ordered** set, the first matching class winning so a
failure matching two still has one class". BR-2's title is "closed on one side and total on the
other"; its table carries a `#` column but no clause says the order decides anything, and no edge
case in §5.2 covers a failure matching two classes. §4's own preamble promises "Where two rules could
both apply, the precedence rule says which wins; there is no case in which the answer is 'either'" —
a gate output that names both a symbol a later PLAN task promotes (`plan-ordering-defect`) and a
defect inside the wave's own owned paths (`wave-internal-defect`) is exactly that case, and this
FSPEC answers "either".

The oracle gap is the same one BR-5 and BR-15 already argue for themselves: AT-03-8 makes the
exclusion catalogue **ordered-sequence** equality because "the order decides which reason a matching
proposal reports", and AT-03-7 does the same for the eight refusal reasons. The classification
vocabulary is ordered for the same reason and gets a **set** oracle (AT-02-1), so a reordering that
silently changes which class a two-way failure receives still passes. Note this is not hypothetical
in shipped code: `ADVISORY_ROOT_CAUSES` is an ordered frozen array
(`pdlc/workflows/orchestrate-dev.js:1955-1960`) whose consumer `parseA6RootCause` implements
membership and a *last-wins* trailer scan (`:2378-2391`) — nothing implements a first-match rule,
because no clause in this FSPEC asks for one.

**To resolve:** restate AC-2.2's first-matching-class rule in BR-2, add a §5.2 row for a
two-class-matching gate output, and make AT-02-1 an ordered-sequence equality plus an arm whose
fixture matches classes 1 and 2 and asserts class 1 is reported.

### F-02 (High) — the whole-tree restoration oracle has no ignored-path boundary

BR-9 defines "observably identical" as "the path-to-content-hash map over tracked and untracked files
alike, generated outputs included", and AT-05-1 repeats it. Untracked is not qualified, so the map
ranges over `.gitignore`d paths: `node_modules/`, tool caches, local databases, `.env`. Two
consequences, both bad, and both decidable at FSPEC altitude because they are about *which files a
destructive machine-authored operation touches*, not about how the restore is implemented:

1. **It licenses data loss.** Restoring an ignored path to its pre-A6 content means deleting a file
   the operator created and A6 never proposed. The shipped restore deliberately refuses exactly this:
   `restoreTreeSnapshot` uses `git clean -fd` and the comment states "deliberately `-fd`, never
   `-fdx`: `-x` would delete `.gitignore`d paths the snapshot never recorded in the first place — a
   worse defect than the one being fixed" (`pdlc/workflows/orchestrate-dev.js:12618-12622`), and the
   capture side is `git add -A` (`:12579`), which never records ignored paths either. So the
   observable this FSPEC specifies is broader than the behaviour the pipeline can safely have.
2. **The oracle is non-deterministic.** The re-gate re-runs the configured test command, which writes
   caches (`.pytest_cache/`, coverage data, build caches) into the tree between capture and
   comparison. A map that includes ignored paths is unequal for reasons that have nothing to do with
   restoration.

There is in-repo precedent for stating the exclusion rather than leaving it implied: the document
oracle walker skips `.git/` and `node_modules/` by an explicit named set
(`pdlc/workflows/lib/document-oracles.mjs:69-72`).

**To resolve:** in BR-9 and AT-05-1/AT-05-2, scope the map to tracked files plus **non-ignored**
untracked files, and add a clause stating that ignored paths are outside restoration's reach — so
the seam is specified never to delete an operator file it did not write.

### F-03 (Medium) — AT-03-7 states two mutually exclusive oracles

"*When* compared by set-equality. *Then* it still has exactly eight members in the shipped order; A6
added none. Ordered-sequence equality, never set equality." The *When* and the *Then* cannot both be
obeyed. The *Then* is the correct one — order is load-bearing, `refusalReasonFor` returns the first
matching member in `ADVISORY_REFUSAL_REASONS` order
(`pdlc/workflows/orchestrate-dev.js:2445-2473`) — so the *When* clause should read "compared by
ordered-sequence equality against its transcribed literal". As written a test author transcribing the
*When* writes the assertion the *Then* forbids.

### F-04 (Medium) — the pre-A6 comparand no longer exists, and no clause says the expected value is transcribed

AT-01-3, AT-01-4, AT-04-1 and AT-05-3 all express their oracle as an equality against "the pre-A6
baseline for the same run" / "the reason the pre-A6 pipeline emits for the same gate failure". Per
`docs/_constraints/pdlc-wave-gate-baseline.md` §4, A6 merged as PR #66 (`bb4d36fb`) and the
default-branch catalogue now reads six, so there is no pre-A6 pipeline left to run: the comparand has
to be a literal transcribed once from the spec (or cited from M-WG-3), never a value re-derived from
the code under test. As phrased, the cheapest implementation of these ATs compares the pipeline
against itself and passes unconditionally — an implementation echo.

**To resolve:** state in each of these four ATs that the expected halt-reason string, queue-row value
and created-file set are **literals transcribed into the fixture** and cite where they come from.
This is oracle *unit*, which this FSPEC already specifies elsewhere (BR-7's sequence, BR-9's hash
map), not fixture mechanics.

### F-05 (Medium) — BR-12's "told" signal is unspecified across the re-invocation that M-WG-6 guarantees

BR-12 and AT-04-5 require that after an E-6 resolution "that later PLAN task's dispatch is told its
owned paths already carry the promotion, so it revises what exists rather than rediscovering it". The
FSPEC does not say whether that signal is in-run state or durable. It matters, because a wave halt
does not end the feature: M-WG-6 measures that Phase I has no recorded-approval skip and that "a
re-invocation after a wave halt re-enters Phase I at wave 1 and re-dispatches every wave, including
those whose commits already landed" (`FORCE_PHASE_TOKENS`, `pdlc/workflows/orchestrate-dev.js:4585`),
and D-AWG-03b defers wave-resume. So the ordinary path is: A6 resolves wave 2 under E-6, a later wave
halts, the operator re-invokes, and the later task is dispatched afresh against a branch that already
carries the promotion — with the in-run signal gone. That task then rediscovers or duplicates the
promotion, which is the outcome BR-12 exists to prevent.

**To resolve:** state in BR-12 whether the signal must survive the run (the advisory record and the
branch state are both durable carriers, and AT-04-5 already asserts the record names the paths and
the owning task), and give AT-04-5 a companion arm that re-enters at wave 1 after the resolution.

### F-06 (Low) — the terminal-disposition vocabulary is enumerated but never asserted

§3.2 step 9 says "Exactly one of: *resolved* / *escalated* / *no-action*". Every other closed
enumeration in this FSPEC carries an equality oracle — the classification vocabulary (AT-02-1), the
envelope (AT-03-1), the refusal reasons (AT-03-7), the exclusions (AT-03-8), the prohibitions
(AT-03-5), the config keys (AT-07-2b), the seam catalogue (AT-01-1) — while this one does not, so a
deleted or invented disposition fails nothing here. If the intent is that the vocabulary is the
tier's and its closed assertion belongs to the tier's own suite (as AT-06-1 argues for the record
shape), say so in step 9 in one clause; the shipped typedef is indeed the tier's
(`pdlc/workflows/orchestrate-dev.js:2243`). Either the pointer or the oracle — not silence.

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
