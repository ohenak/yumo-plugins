# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.3)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v3.md` (iteration 3)
**Date:** 2026-08-20
**Iteration:** 4
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta protocol followed. `CROSS-REVIEW-product-manager-TSPEC-v3.md` re-read first, then
`git diff a2ade58c..HEAD -- docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
(90 insertions, 21 deletions) taken as the round's change set: the v1.3 changelog block, §2.5's
disposition row, §3.2 steps 3/4/6, §3.3's `gatherEvidence` and `verifyGate` rows, §5.2's two
bullets, §5.5's `(g)`/`(h)` rows and mutation-fixture bullets, and §6's OQ-12/OQ-13. Sections
approved in round 3 were not re-litigated.

Every behavioural claim added this round was checked against the shipped code, not the prose:

- `renderAdvisoryEntry` destructures exactly the six members §2.5 now names, and interpolates
  `modelValue` unguarded (`pdlc/workflows/orchestrate-dev.js:2924`, `:2934`, `:2947`) — so
  `model: "n/a", fallback: false` renders `| Model | n/a |` with no renderer change, exactly as
  §2.5 and §3.2 step 4 claim.
- The capture verbs are capture-unique: `commit-tree` appears only on the capture path, while
  restore drives `read-tree`/`clean`/`reset` (`TSPEC:232-238`), so §5.2's new `commit-tree === 1`
  count is a sound proxy for the one-snapshot-per-wave invariant and the raw `_git` count it
  replaced was not.
- The four clauses that GFM was dropping now sit inside their cells: `TSPEC:504` and `:511` carry
  3 pipes against a 2-column header, `:1061` and `:1062` carry 5 against a 4-column header.
- The snapshot ref is a single fixed name, `refs/pdlc/a6-snapshot` (`TSPEC:233`, `:831`), written
  by "every A6 invocation that reached the snapshot step".
- The ledger is per wave and the **first pass appends to it**: `runWaveGateSequence` pushes one
  token before each command call whether or not it passes (`TSPEC:196-205`), and §2.3's call-site
  sketch passes the same `invocations` array to the first pass and to every re-gate.

That last fact is what F-01 below turns on.

## Prior findings (round 3)

| ID | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Addressed, but the replacement rule is wrong** — see F-01 below | §3.2 step 6 no longer denies resolution to a two-attempt run: the suffix reading resolves `[post-wave, test, post-wave, test]` (`TSPEC:475-478`), and §5.2 gains the positive companion I asked for, with literal expected `invocations` and a `waveBudget.resolved` increment (`TSPEC:973-979`). The half I raised is fixed. But the new quantity drops the dispatch anchor, and with it the ability to refuse the defect the rule exists for |
| F-02 | Medium | **Resolved** | All four clauses moved inside their cells; pipe counts now match their headers at `TSPEC:504`, `:511`, `:1061`, `:1062`. Nothing was lost in the move — each clause reads the same as it did past the pipe |
| F-03 | Medium | **Resolved, and correctly grounded** | §2.5 names the disposition object in full and says *why* `model: "n/a"` rather than leaving it to the renderer: `renderAdvisoryEntry` destructures six members and interpolates `model` unguarded (`orchestrate-dev.js:2924`, `:2934`). §3.2 step 4 repeats the same literal, and §5.2's capture-failure fixture transcribes the rendered cell as `n/a`, not `undefined` |
| Q-01 | — | **Still open upstream** | OQ-7's erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1 has not landed: `FSPEC:204` and `:410` still read "tracked and untracked files alike, generated outputs included" with no `.gitignore` carve-out. Re-emitted this round |
| Q-02 | — | **Answered** | §6 OQ-12 (`TSPEC:1197`) closes it by construction rather than by convention: A6 is only entered on an already-red gate, every non-`resolved` terminal returns `{resolved: false}`, and the call site rethrows the wave's halt — so `ADVISORY_SEAM_PHASES.A6`'s fixed `outcome: "halted"` cannot be a false record |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | §3.2 step 6's suffix check passes on the exact defect it was written to refuse: the first pass already appended the wave's gate sequence, so the ledger ends with it whether or not the re-gate ran | REQ AC-4.1 (iii); FSPEC BR-7 |
| F-02 | Medium | Local | §3.2 step 3's new capture-before-budget paragraph claims two oracles read it explicitly; neither does. AT-02-6 says nothing about snapshots, and §5.2's count fixture runs a dispatching wave, not a no-dispatch one | REQ AC-4.6; AC-7.x (traceability) |
| F-03 | Medium | Local | The same paragraph prices the over-budget capture at "one `write-tree`/`commit-tree` pair", omitting that it also rewrites the single fixed `refs/pdlc/a6-snapshot` — discarding the recovery record OQ-2 promised the operator for an earlier resolved wave | REQ AC-5.1; §6 OQ-2 |

### F-01 — the suffix check cannot see the defect it replaced (High, delta, local)

§3.2 step 6 now reads (`TSPEC-pdlc-advisory-wave-gate.md:470-475`): `resolved: true` requires
`outcome === "resolved"` **and** that the wave's `invocations` ledger *ends with* the wave's own
gate sequence — stated explicitly as "a **suffix check, not a growth-since-dispatch equality**:
read the ledger's final tokens and require that they are the wave's configured gate sequence".

The two-attempt half of that is right, and it fixes my round-3 finding. But the ledger does not
start empty at dispatch. `runWaveGateSequence` pushes a token before each command call whether or
not it passes (§2.4, `TSPEC:196-205`), and A6 is only ever entered **because** that first pass ran
and its test command went red (§2.3, §3.2 step 1). So at the moment of dispatch the ledger already
reads `[post-wave, test]` — precisely the wave's own gate sequence. §2.4's own table says so: the
"one attempt, red re-gate" row is `[post-wave, test, post-wave, test]`, four tokens for two runs of
the sequence, the first of which is the pre-A6 pass.

Now apply the rule as written to the mutation §5.5 exists for. A `verifyGate` that returns
`{passed: true}` without running anything appends nothing, so the ledger is still `[post-wave,
test]`. Its final tokens **are** the wave's configured gate sequence. The suffix check passes. The
call site reports the wave resolved.

The document asserts the opposite two sentences later — "a dropped re-gate appends nothing, so the
ledger's final tokens are a *stale* earlier attempt's pair, or nothing at all, and the check fails"
(`TSPEC:483-486`). That sentence is not derivable from the rule above it: a suffix check reads
values, and stale tokens and fresh tokens are the same values. Nothing in the rule as stated
carries the position information that would tell them apart. The word "stale" is doing work the
specified quantity cannot do — which is exactly the work the deleted `since dispatch` anchor used
to do.

The product consequences, in order of severity:

1. **BR-7's whole content goes unenforced.** BR-7 forbids an advisory verdict substituting for a
   gate result. Under this rule a repair that A6 authored can be reported as gate-verified when the
   gate was never re-run — the tier's single most consequential failure mode, and the one the
   call-site re-check was added for.
2. **REQ AC-4.1 conjunct (iii) becomes unfalsifiable again**, which is the exact state TE F-14
   raised and this rule was written to escape. Round 3 fixed one direction and reopened the other.
3. **§5.5's mutation fixture becomes unsatisfiable by a conforming implementation.** §5.5 asserts
   the dropped-re-gate run does **not** resolve, halts on AT-05-3's literal, and reports `0` waves
   resolved (`TSPEC:1088-1091`). An implementation that transcribes step 6 faithfully resolves that
   run, so the test is red with no code change that both satisfies it and matches this document.
   Phase I inherits an unresolvable contradiction between §3 and §5, and PLAN mints tasks for both.

**To resolve** — keep the anchor and make it a suffix over the anchored slice. Concretely: at step
4/5, before `runAdvisorySeam` is entered, record `const ledgerAtDispatch = invocations.length`;
at step 6 require that the tokens appended *since dispatch* are (a) non-empty and (b) end with the
wave's configured gate sequence. That holds at every attempt count — a two-attempt run appends
`[post-wave, test, post-wave, test]` after dispatch and passes — and it refuses the dropped re-gate,
which appends nothing at all and fails clause (a). Reconcile the same wording in three places that
now carry the unanchored version: §3.3's `verifyGate` row (`TSPEC:511`), §5.5's mutation bullet
(`TSPEC:1076-1082`), and §5.2's companion case (`TSPEC:973-979`), whose expected value should be
stated as the tokens appended since dispatch rather than the whole array, so the two fixtures pin
one quantity.

### F-02 — two oracles claimed for the capture-before-budget decision; neither covers it (Medium, delta, local)

§3.2 step 3's new paragraph (`TSPEC:437-444`) states a real design decision — the wave-budget
escape resolves inside `runAdvisorySeam`, *after* step 4's capture, so an over-budget wave still
captures and still rewrites the snapshot ref — and closes with: "Two oracles read this explicitly:
AT-02-6 asserts a snapshot ref **is** written on a budget-escalated wave, and §5.2's
one-snapshot-per-wave call count is once *per wave entered*, no-dispatch waves included."

Neither holds:

- **AT-02-6 says nothing about snapshots.** FSPEC's text (`FSPEC:348-352`) and this document's own
  §5.6 row (`TSPEC:1137`) both scope it to dispatch and budget arithmetic: two escalated waves leave
  `waveBudget.resolved` at `0`; one resolved wave increments it to `1`. No snapshot ref, no capture.
- **§5.2's count fixture runs a dispatching wave.** The bullet counts `commit-tree === 1` across a
  **two-attempt run** (`TSPEC:964-969`) — a wave that was dispatched and repaired. It cannot
  witness "no-dispatch waves included", because no no-dispatch wave appears in it.

So a behaviour this round newly made normative — capture happens even when nothing will be
dispatched — ships with zero test coverage while the document tells PLAN it has two. The harm is
downstream and mechanical: PLAN reads §3.2, sees the coverage claim, and mints no task; Phase I
implements the ordering; nothing ever fails if a later refactor hoists the budget read above the
capture, which is precisely the change the paragraph says was rejected.

**To resolve:** either drop the two citations and state plainly that the ordering is design-level
with no oracle, or — better, since the paragraph argues the ordering is load-bearing — add one
§5.2 case: a wave entered over budget, asserted to escalate with no dispatch **and** to have
written the snapshot ref (`commit-tree === 1`, `update-ref` observed on the `_git` double). One
run, both facts positive.

### F-03 — the over-budget capture's cost is understated: it also discards the operator's recovery ref (Medium, inherited, local)

The same paragraph prices the retained ordering as costing "one `write-tree`/`commit-tree` pair".
It costs one more thing the document does not name here. `refs/pdlc/a6-snapshot` is a **single
fixed ref** (`TSPEC:233`), rewritten by "every A6 invocation that reached the snapshot step"
(`TSPEC:831`). §6 OQ-2 (`TSPEC:1187`) rules that the ref is deliberately left in place after a halt
because it "is the only mechanical record of the pre-repair tree once the wave has halted", and
§3.2 step 6 repeats the promise for the resolved path: "the snapshot ref is left in place for the
operator".

Compose those with this round's new statement. Wave 1 resolves; its pre-repair snapshot is left for
the operator. Wave 2 goes red, is over budget, captures anyway per this paragraph, rewrites the ref
to wave 2's tree, escalates without dispatching, and the run halts. The operator now holds a ref
describing a tree in which nothing was ever repaired, and wave 1's machine-authored repair — the
one thing they might want to inspect or undo — has no mechanical record left. That is the promise
of OQ-2 and step 6 failing on a run shape this paragraph newly makes reachable.

I am rating this Medium rather than High because the resolved wave's repair is gate-verified and
lands in the wave's own commit, so the loss is inspectability rather than recoverability, and the
fixed ref name predates this round. But this paragraph is where the cost is now being tallied for
the reader, and the tally is incomplete.

**To resolve** — cheapest fix is naming: `captureTreeSnapshot` already takes `waveNum` (§3.5,
`TSPEC:653`), so write `refs/pdlc/a6-snapshot-{waveNum}` and every wave's record survives the run.
If the single ref is deliberate, say so in the same paragraph and in OQ-2 — "the ref describes the
most recent wave that reached the snapshot step, not the wave whose repair is in the tree" — so the
operator reads it correctly.

## Questions

| ID | Question |
|----|---------|
| Q-01 | OQ-7's erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1 has now been open for three rounds; `FSPEC:204` and `:410` are unchanged. §5.2's ignored-path round-trip and §5.6's AT-05-1 are both parked on it. If it does not land before Phase P, does the author want OQ-9's ruling restated as a PLAN authoring instruction — "mint the red-test task with the expected value literally marked pending, and name the erratum in the task row" — so the pending value cannot be silently transcribed as whichever boundary the implementer assumes? |
| Q-02 | §6 OQ-13 routes the underlying git failure (verb, `stderr`) into the escalation entry's free-text `decision` slot and says "PLAN should have the call site interpolate the failing verb there". Since §4.5's `diagnosis` stays fixed and §5.2's fixtures assert the record entry rather than the escalation entry, is anything asserting that the verb actually reaches the escalation log? If not, the one place the operator learns *which* git call failed is uncovered — a one-line containment assertion on the escalation entry would close it without touching the equality oracle. |

## Positive Observations

- **The two-attempt companion case is the right shape, and its expected value is a literal.**
  §5.2's new fixture asserts `resolved`, a `waveBudget.resolved` increment, and `invocations`
  reading `["post-wave", "test", "post-wave", "test"]` written out in full rather than derived from
  the implementation (`TSPEC:973-979`). That is the positive pairing I asked for, and it is stated
  in the form that cannot echo the code under test. It is also the fixture that will expose F-01
  the moment the rule is anchored properly — the two live in the same section for a reason.

- **§5.2's snapshot count was fixed for a reason better than the one it was given.** Counting
  `commit-tree === 1` over the recorded argv instead of calls on the `_git` double is right because
  `restoreTreeSnapshot` drives the same transport (`TSPEC:232-238` shows the two verb sets are
  disjoint), so the old count would have gone green on a run that captured twice and restored
  never. The document says exactly that, and the verbs check out.

- **§2.5's disposition row explains the value instead of just naming it.** "`model` is `n/a`
  because no rung was ever resolved — without it `advisoryEntrySingleLine(model)` is
  `String(undefined)` and the operator-facing record ships a literal `| Model | undefined |` cell on
  exactly the path AC-6.1 exists to make legible." I checked `renderAdvisoryEntry`: the
  destructuring, the `modelValue` ternary and the unguarded interpolation are all as described. A
  reader who has never opened the renderer now knows why the caller supplies the value.

- **OQ-12 closes my question by construction rather than by assertion.** The answer walks every
  non-`resolved` terminal, shows each returns `{resolved: false}`, and shows the only escape from
  the halt is a genuine resolution that writes no escalation — so `ADVISORY_SEAM_PHASES.A6`'s fixed
  `outcome: "halted"` is true by structure. That is a stronger answer than the test I would have
  asked for, because it removes the run shape rather than covering it.

- **OQ-13 splits by slot instead of compromising.** Fixed sentence stays in `diagnosis` because
  §5.5 compares it literally; the variable detail goes to the free-text `decision` slot that carries
  no equality oracle. It also pre-empts a misreading I would have raised later — that a failed
  record write on this path is not `record-write-failed`, since nothing was proposed or applied.

- **The GFM fix preserved every clause.** Moving four clauses inside their cells is the kind of
  edit that quietly loses a sentence; all four survived intact, and the pipe counts now match their
  headers.

## Recommendation

**Needs revision** — one High finding (F-01).

Round 3's blockers are all genuinely closed: F-02 and F-03 are resolved and better grounded than I
asked for, and F-01's two-attempt half is fixed with the positive companion case in place. The
single blocker is that the replacement rule over-corrected: dropping the `since dispatch` anchor
removed the only positional information that distinguishes a fresh gate sequence from the pre-A6
pass's, so the rule now admits the dropped re-gate it was written to refuse, and §3.2 contradicts
§5.5.

To close:

1. **F-01** — anchor the suffix. Record the ledger length at dispatch, and require the tokens
   appended *since dispatch* to be non-empty and to end with the wave's configured gate sequence.
   Reconcile §3.3's `verifyGate` row, §5.5's mutation bullet and §5.2's companion case to that one
   wording, with the companion's expected value stated as the since-dispatch slice.

Then, not gating but worth the same pass:

2. **F-02** — drop the two coverage citations or add the one §5.2 case that earns them: a wave
   entered over budget, escalating with no dispatch, with the snapshot ref asserted written.
3. **F-03** — either name the ref per wave (`waveNum` is already a parameter) or state in §3.2 and
   OQ-2 that the ref describes the most recent wave that captured, not the wave whose repair is in
   the tree.

One upstream item is unchanged and re-emitted below: OQ-7's BR-9 `.gitignore` boundary, open on
FSPEC and REQ since round 1.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}
