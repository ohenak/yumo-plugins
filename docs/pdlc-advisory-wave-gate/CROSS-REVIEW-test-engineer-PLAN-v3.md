# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md (v1.12, HEAD `28dd256b`)
**Date:** 2026-08-20
**Iteration:** 3 (delta re-review of v1.11 → v1.12)

## Scope

Delta re-review, not a re-read. I approved v1.11 with one Low (F-01, a DoD-leg wording gap on
A6-10's ignored-path conjuncts) and no High or Medium. Round 12 landed four commits over the PLAN —
`50b12a4d` (Overview), `0d024193` (Batches), `99c9724d` (Verification), `d703e81d` + `28dd256b`
(changelog and lineage). I read my v2 file, diffed `b3d877a1..HEAD` over the PLAN (34 insertions,
13 deletions across eleven hunks — the lineage header, the twelve/thirteen file count, A6-18's and
A6-21's task rows, the file-ownership manifest, the AT-05-1 and AT-06-4 traceability rows and three
DoD legs), and scanned only those surfaces plus the mechanical invariants the round claims it did
not move.

**What the round is answering.** PM v2 F-01/F-02 (two shipped exact-shape oracles that A6-18's
`snapshotRef` widening reddens), PM v2 F-03 (AT-06-4's un-skip arm has a different owner than the
seam arm) and my own v2 F-01. The round's central factual claim — that
`pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` must join A6-18's owned set — is correct and
I verified it from both ends: the file exists at HEAD (19 KB) and its
`expect(result.haltAdvisory).toEqual({…})` at `advisoryWaveGateMain.test.js:373-378` is exactly the
four-key literal the PLAN describes, and TSPEC §5.1 gives it an `edited` row
(`TSPEC-pdlc-advisory-wave-gate.md:1537`) saying "it gains `snapshotRef` in the same task".

**Where the round goes wrong is the value, not the ownership.** A6-18's row tells the implementer to
widen that assertion with `snapshotRef: null`. That fixture's `_git` double returns `ok: true` for
every plumbing verb `captureTreeSnapshot` issues, so the capture succeeds and the field is a ref
string, not `null` — the widening as written reddens the very file it was added to protect. That is
F-01 below, and it is the one open High.

**Upstream re-grounding first (DEC-ERR-03).** I re-derived the four lineage digests locally rather
than reading them: REQ `f97f4f66…`, FSPEC `d602c440…`, TSPEC `1f6ea486…`, DECISIONS `dc7a8d65…` —
all four match the header. The TSPEC label bump (v1.13 → v1.15) carries the *same* digest, and that
is correct rather than suspicious: `git diff b3d877a1..HEAD` over the TSPEC is empty and TSPEC's own
version cell already read `1.15` (`TSPEC-pdlc-advisory-wave-gate.md:12`, landed in `ffbc2b18`), so
the round corrected a stale *label* against unchanged bytes. No finding — this is the round fixing
something my v2 pass did not catch, because I checked digests and not version labels.

## Batches

**Two task rows changed (A6-18, A6-21) plus the file-count paragraph and the ownership manifest. One
of the three changes carries a High.**

### A6-18's `advisoryWaveGateMain.test.js` widening — right file, wrong literal (F-01, High)

The ownership move is correct and I verified it independently of the document. The file exists at
HEAD, and the assertion the row describes is verbatim there:

```
pdlc/workflows/__tests__/advisoryWaveGateMain.test.js:373-378
    expect(result.haltAdvisory).toEqual({
      rootCause: "plan-ordering-defect",
      diagnosis: "wave 1 needs a symbol a later task owns",
      repairApplied: false,
      repairPaths: [],
    });
```

`toEqual` fails on an extra key exactly as on a missing one, so the row's reasoning — this file
reddens the moment `snapshotRef` joins §4.5's halt fields unless the widening task owns it — is
sound, and TSPEC §5.1 agrees (`TSPEC-pdlc-advisory-wave-gate.md:1537`: "it gains `snapshotRef` in
the same task").

What the row gets wrong is the **value it prescribes**: "(`snapshotRef: null` on the escalation path
that fixture drives)". That fixture does not drive a capture failure — it drives an *out-of-envelope
refusal*, and its git transport succeeds at every verb `captureTreeSnapshot` issues:

```
pdlc/workflows/__tests__/advisoryWaveGateMain.test.js:109-138  (the harness `_git` double)
  args[0] === "add"                                    → { ok: true }
  args[0] === "rev-parse" | "write-tree" | "commit-tree" → { ok: true, stdout: "abc1234…" }
  (fallthrough, which is where `update-ref` lands)     → { ok: true, stdout: "" }
```

PLAN A6-10's green step defines `captureTreeSnapshot` as `rev-parse HEAD`, `add -A`, `write-tree`,
`commit-tree`, `update-ref refs/pdlc/a6-snapshot-{waveNum}`, returning `null` **only** on any
`ok !== true`; TSPEC §3.5 says the same (`:1207`). TSPEC §3.2 step 4 (`:916`) puts the capture at the
call site *before* `runAdvisorySeam` is entered, so it runs on every applying wave regardless of what
the agent later proposes. Every one of those verbs returns `ok: true` on this harness, so on this
fixture `snapshotRef` is the ref string `refs/pdlc/a6-snapshot-1`, **not** `null`.

An implementer following the row writes `snapshotRef: null`, and the file goes red in batch 6 — the
batch whose script-owned gate declares the whole suite green and has no expected-red channel. That
is precisely the failure mode PM v2 F-01 raised the widening to prevent, reintroduced one layer
down. The row conflates "no repair was applied" (true here: `repairApplied: false`, `repairPaths:
[]`) with "no snapshot was taken" (false here). The fix is small: state the expected value as the
wave-scoped ref literal the fixture produces, and — because a hand-written value is exactly where an
implementation echo creeps in — say that the ref is matched by the spec-side literal
`"refs/pdlc/a6-snapshot-" + waveNum`, never by a constant read back from the module under test, the
same anti-echo rule this row already applies to AT-06-4's two halves.

Two consequences the corrected row should carry, both testing-side:

1. A non-`null` `snapshotRef` on that halt makes BR-14's overwrite notice **due** on this fixture's
   halt report too (TSPEC §4.5's row quantifies over "every A6-touched halt whose `snapshotRef` is
   non-`null`"). I checked whether that collaterally reddens anything here: it does not. Every notice
   oracle in this suite is a *filtered* count (`inapplicabilityStatements(logs)` at `:210`, `:227`,
   `:247`, `:257`, `:285`), never a whole-array `toHaveLength`, so an extra notice passes through.
   Worth one clause in the row so the implementer does not discover it, but not a second finding.
2. It is also the one place in this feature where the production-path suite could assert the
   overwrite notice through `mainDev` rather than through the seam — a DC-07-grade proof that the
   notice reaches the real report. I am not requiring it (AT-06-4's two arms are allocated and
   sufficient); I note it because the fixture is now one assertion away from it.

### A6-21's un-skip arm (PM v2 F-03) — correctly allocated, and the two rows agree

The ownership split reads consistently from both sides, which is what I checked rather than taking
either row's word: A6-18's row says "**That un-skip-site push is A6-21's, not this task's**" and
scopes itself to "the seam-internal push and both of AT-06-4/AT-06-4b's seam-level arms"
(PLAN line 338); A6-21's row claims "**this task owns that push** … **and the assertion on it**"
(line 339). No double ownership, no gap. Upstream backs the split: TSPEC §4.5's un-skip row
(`TSPEC:1498`) says the notice is "owed here too", that "the seam has already returned by then, so
this is the one push that cannot happen inside it", and that no new AT id is minted — which is why
the arm rides AT-06-4's witness id.

The oracle A6-21 inherits is the right shape, not a weakened copy: co-location within one `notices`
element (so a split across two notices reddens), both halves by spec-side literals, and a **paired
negative** — "on an un-skip halt where A6 did **not** fire on the wave, the `advisory` argument is
omitted and no overwrite notice appears anywhere in `notices`". That negative is not absence-only:
the shipped companion it attaches to already carries positives on the same run
(`waveExecution.test.js:1299-1302`: `outcome === "halted"`, `haltReason` containing
`"Error: Wave 1 un-skip guard failed"`, `a6.calls.length === 0`), so the absence is quantified over
a run whose live behaviour is pinned.

The green step spells the production edit out at the right altitude — "give the un-skip `haltError`
its second argument `{ advisory: waveAdvisoryFields }` and push
`renderSnapshotOverwriteNotice(snapshotRef)` through `advisoryNotice` there when that ref is
non-`null`" — and names the byte-identity obligation for the fixtures where A6 did not fire. The
helper is exported per TSPEC §4.5 (`TSPEC:1460`), so the red test can also assert its purity
directly.

### The escalation-log count literal — checked, and it is right

A6-18's second named widening claims `advisoryEscalationLog.test.js`'s
`expect(failed.notices).toHaveLength(2)` becomes `3`. I verified the premise rather than the
arithmetic: `runA6Escalation` (`advisoryEscalationLog.test.js:633-669`) builds a **real** temp repo
(`makeRealRepoFixture`) and passes `repo._git` into `devModule.runWaveGateSeam`, so the capture
succeeds and `snapshotRef` is non-`null` — the overwrite notice is genuinely the third element, and
the two `arrayContaining` assertions beside it (`:822-827`) are indeed unaffected. I also swept the
file for any other whole-array notice count the widening would disturb: the only other hit,
`expect(notices.length).toBe(2)` at `:497`, is over a locally constructed two-element array in
PROP-ESC-09 and is untouched.

### Nothing else in the manifest is exposed, and I checked that mechanically

The class of defect PM v2 F-01 found is "a shipped exact-shape oracle over the widened object, in a
file no task in that batch owns". I enumerated the class rather than trusting the round's count:
`grep -l repairPaths pdlc/workflows/__tests__/*.js` returns exactly four files —
`advisoryRecord.test.js`, `advisoryWaveGate.test.js`, `advisoryWaveGateMain.test.js` (all three now
A6-18's) and `waveExecution.test.js` (A6-21's). Every file carrying the widened shape has an owning
task. `waveExecution.test.js`'s two `haltAdvisory` equalities (`:1094`, `:1275`) compare against
objects the A6 *fake* was handed (`haltFields`, `a6HaltFields`), so they follow the fixture's shape
exactly as TSPEC §5.1 says — no widening owed there.

### Mechanical invariants, re-derived rather than trusted

The changelog claims no task row, batch, wave or dependency edge moved. Re-running the shipped
parser against the PLAN at HEAD: `parsePlanTasks` returns **11 tasks**, `computeWaves` returns
**7 waves** (`A6-00+A6-01+A6-04+A6-05 | A6-06+A6-08 | A6-10 | A6-12 | A6-14 | A6-18 | A6-21`), and
every `planBatch` equals `max(dep batch) + 1` (A6-00/01/04/05 → 1; A6-06, A6-08 → 2; A6-10 → 3;
A6-12 → 4; A6-14 → 5; A6-18 → 6; A6-21 → 7). Ids unique, every dependency resolves, graph acyclic.
No same-batch same-new-file collision: this round adds no new file, and the one manifest change
(`advisoryWaveGateMain.test.js` → A6-18, batch 6) is that file's **only** owner across the whole
manifest. TDD order is unchanged — every task keeps its named red steps ahead of its green step, and
A6-01 keeps its `[Fake first]` label in batch 1 ahead of every production task.

**Every file the task table names exists at HEAD.** The manifest now lists thirteen `*.test.js`
paths plus `helpers/advisoryDoubles.js`, `.gitignore`, `.claude/pdlc.config.example.json` and
`pdlc/workflows/orchestrate-dev.js`; I stat'd them all, including the newly added
`advisoryWaveGateMain.test.js`. The Overview's "thirteenth / fourteenth" renumbering is arithmetic
that follows. Comparing TSPEC §5.1's file table against the PLAN's ownership manifest by basename,
`comm -23` is empty — nothing TSPEC lists is unowned here.

## Dependencies

**One line changed here and it is a bookkeeping consequence of the manifest edit, not an ordering
change.** Batch-safety rule 2 ("single writer per file per batch") gained
`advisoryWaveGateMain.test.js` alongside `advisoryEscalationLog.test.js` as "batch 6 only (A6-18)"
(PLAN line 411). I re-derived the whole rule-2 enumeration from the manifest rather than reading it:
`orchestrate-dev.js` in batches 1–7 once each; `advisoryWaveGate.test.js` in batches 1, 2, 3, 5, 6
once each; `advisoryDriver.test.js` in 1 and 4; `advisoryRecord.test.js` in 1 and 6;
`advisoryWaveGateMain.test.js` and `advisoryEscalationLog.test.js` in 6 only;
`advisoryDisabled.test.js` in 1 and 7; `advisoryQueueSeams.test.js` in 1 only. No file has two
writers in one batch, in either column. The narrated list and the manifest now agree, which is the
property that matters — an unlisted second writer is invisible to the dispatcher.

**The edges themselves are untouched.** Column-wise, only description and file cells moved this
round; the `Batch` and `Dependencies` columns are byte-identical to `b3d877a1`, and the re-derivation
in **Batches** above confirms the DAG. So the ordering story I approved at v1.11 stands unchanged:
A6-04 → A6-06 for the example-config edit, A6-00 + A6-05 → A6-08 for the helpers, and the linear
A6-08 → A6-10 → A6-12 → A6-14 → A6-18 → A6-21 spine that keeps every wave boundary green under a
script-owned gate with no expected-red channel.

**The A6-18 → A6-21 edge is what makes this round's split safe, and it is already there.** AT-06-4's
two arms now land in two batches: the seam arm in batch 6 and the un-skip arm in batch 7. That is
only sound because the production push A6-21 adds at the un-skip halt site reads a `snapshotRef`
field that A6-18's green step introduces one batch earlier — an edge the table already declares
(`A6-21 | … | 7 | A6-18`). Had the split been made within one batch, two tasks would have been
editing the same halt-fields object concurrently; as declared, it serializes correctly. I checked
this against the file column too: A6-21's test file (`waveExecution.test.js`) is written by nobody
in batch 6, and A6-18's three test files are written by nobody in batch 7.

**No upstream dependency of this plan is open.** The subsection's v1.11 wording — measured across
all four upstream documents, with the earlier overreach recorded rather than erased — is unchanged
this round, and the evidence behind it is unchanged too: TSPEC's bytes have not moved since
`b3d877a1` (empty diff), so OQ-7 remains closed-answered-no and DEC-A6-01's scoped ignored-path arm
remains explicitly not built. The one upstream defect I still see is the stale AT-02-1 row in TSPEC
§5.6, which I routed as an erratum at v2 and am re-routing below — it is not a dependency this plan
waits on, and no task row reads it.

## Verification

**My v2 F-01 is resolved, and resolved in both places the wording gap existed.** The DoD leg for
A6-10 no longer states the outcome alone. It now reads that the ignored-path case is ticked only by
"**the two conjuncts that can falsify one**": (a) a `.gitignore`d file the wave added is **still
present** after restore — TSPEC §5.2 case 4, the assertion pinning `git clean -fd` over `-fdx` —
paired with case 3's untracked-but-non-ignored file asserted **absent**; and (b) case 5's ordering
conjunct, with AC-6.1's record append, AC-6.2's escalation-log append and AC-5.2's queue-row write
each asserted to happen afterwards. It closes with "A hash-map assertion alone does not tick it",
which is the sentence a DoD verifier needs, and it states the *reason* the map cannot falsify the
defect (its domain excludes ignored paths on both sides). The AT-05-1 traceability row (line 536)
carries the same two conjuncts, so the row the implementer reads and the leg the verifier reads no
longer disagree. I re-checked both transcriptions against TSPEC §5.2 cases 3, 4 and 5: faithful.

**The AT set is still set-equal to FSPEC §6's, and I checked it mechanically rather than by count.**
Extracting AT ids from the PLAN's traceability table and from FSPEC §6 (lines 324–503) and diffing
the two sorted sets gives **48 vs 48 with an empty diff** — equal in both directions, so a deleted
case fails and an invented one fails too. This round adds no witness id, which is the right call:
TSPEC §5.6 explicitly says AT-06-4's predicates cover the un-skip arm "rather than minting a witness
id", so splitting the arm across two owners without splitting the id keeps the set-equality intact.

**AT-06-4's row now carries two arms and two owners, and both halves keep the full oracle.** The row
(line 544) reads "Two arms, two owners" — seam arm (A6-18) in `advisoryWaveGate.test.js` on §5.2's
two-red-wave fixture; un-skip arm (A6-21) in `waveExecution.test.js` on the post-gate un-skip halt
whose `snapshotRef` is non-`null`. Critically, the un-skip arm is not described as a weaker
containment check: "same co-location and anti-echo oracle". The red/green owner columns moved with
it (`A6-15, A6-19` red → `A6-18, A6-21` green), so the traceability table's owner cells and the task
rows agree.

**Three DoD legs changed; two are falsifiable as written and one carries the High.**

- *The forty-eight-AT leg* and *the ordered-vocabulary leg* are unchanged from v1.11 and remain
  falsifiable ("checked both directions"; "never set equality or `toContain`", plus E-08b's arm).
- *The AT-06-4 leg* gained "Both of AT-06-4's arms are present: the seam arm in
  `advisoryWaveGate.test.js` (A6-18) and the post-gate un-skip arm in `waveExecution.test.js`
  (A6-21)." That is a condition a verifier can fail on — two named files, two named tasks. One
  omission I record as Low (F-02): the leg names AT-06-4b's absence arm for the *seam* side but not
  the un-skip arm's paired negative (the no-A6-fired un-skip halt where no overwrite notice appears
  anywhere in `notices`), which A6-21's task row does carry. As written, a verifier could tick the
  leg on a positive-only un-skip arm — the same shape of gap my v2 F-01 flagged, one arm over.
- *The new widening leg* is the right idea — "widened by the task that widened the production
  `fields` object, not left to the gate to discover" — and it is correct on the escalation-log half
  ("`expect(failed.notices).toHaveLength(…)` reads **3** — capture succeeds on that real-temp-repo
  run", verified above). On the main-suite half it asks only that
  `expect(result.haltAdvisory).toEqual({…})` "reads **five** keys", which is value-agnostic and
  therefore survives F-01's correction unchanged; it is A6-18's task row, not this leg, that
  prescribes the wrong fifth value. A verifier ticking this leg against a red suite would notice, so
  the leg is not itself the defect — but it also cannot catch it before the batch-6 gate does.

**Anti-echo, absence-only and set-equality discipline across the changed Verification surface.**
Every negative assertion introduced or restated this round is paired with a positive on the same
run: AT-06-4b (diagnosis and root-cause class present, no ref and no overwrite sentence anywhere in
`notices`); the un-skip negative (halt outcome and `haltReason` positively asserted, `a6.calls`
zero, no overwrite notice); AT-05-1's ignored-path pair (present *and* absent, discriminating the
boundary rather than a blanket keep or delete). The overwrite predicates stay spec-side literals
(`/overwrit/i`, `"refs/pdlc/a6-snapshot-" + waveNum`), never a constant imported from the module
under test — the one place F-01's fix must not regress, since a hand-written `snapshotRef`
expectation is exactly where an implementation echo is tempting.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | A6-18's row tells the implementer to widen `advisoryWaveGateMain.test.js`'s `expect(result.haltAdvisory).toEqual({…})` with **`snapshotRef: null`** "on the escalation path that fixture drives". That fixture drives an out-of-envelope *refusal*, not a capture failure, and its `_git` double returns `ok: true` for every verb `captureTreeSnapshot` issues (`advisoryWaveGateMain.test.js:109-138`: `add`, `rev-parse`, `write-tree`, `commit-tree` explicit, `update-ref` via the `ok: true` fallthrough). Per PLAN A6-10 and TSPEC §3.5 (`TSPEC:1207`) the capture returns `null` only on `ok !== true`, and TSPEC §3.2 step 4 (`TSPEC:916`) runs it at the call site before `runAdvisorySeam` is entered, unconditionally on an applying wave — so on this fixture `snapshotRef` is `refs/pdlc/a6-snapshot-1`, not `null`. Following the row reddens the file in batch 6, whose script-owned gate declares the whole suite green and has no expected-red channel — reintroducing the exact failure PM v2 F-01 raised the widening to prevent. **Fix:** state the fifth value as the wave-scoped ref the fixture produces, matched by the spec-side literal `"refs/pdlc/a6-snapshot-" + waveNum` (never a constant read back from the module under test), and add the clause that a non-`null` ref makes BR-14's overwrite notice due on this halt too — harmless here, since every notice oracle in the suite is a filtered count (`:210`, `:227`, `:247`, `:257`, `:285`), never a whole-array `toHaveLength`. | Batches → A6-18, the `(a) advisoryWaveGateMain.test.js` widening clause |
| F-02 | Low | Local | The AT-06-4 DoD leg names both arms ("seam arm in `advisoryWaveGate.test.js` (A6-18) and the post-gate un-skip arm in `waveExecution.test.js` (A6-21)") and names AT-06-4b's absence arm for the seam side, but not the un-skip arm's **paired negative** — the un-skip halt on a wave where A6 did not fire, `advisory` argument omitted and no overwrite notice anywhere in `notices` — which A6-21's task row does carry. As written a verifier can tick the leg on a positive-only un-skip arm, and an implementation that pushed the notice unconditionally at the un-skip site would satisfy it. Add the negative companion to the leg, the way the seam side already names AT-06-4b. | Verification → DoD, the AT-06-4 leg |

## Questions

| ID | Question |
|----|---------|
| Q-01 | With `snapshotRef` non-`null` on `advisoryWaveGateMain.test.js`'s escalation fixture (F-01), that suite becomes the one place in this feature where BR-14's overwrite notice could be asserted through `mainDev` — the real report, the real seam, no injection — rather than only through the seam's `_notice` sink. AT-06-4's two allocated arms are sufficient as specified, so I am not requiring it; is there a reason not to take the free DC-07-grade proof while A6-18 is already editing that file? |
| Q-02 | (Re-raised from v2 Q-01, still open upstream.) TSPEC §5.6's AT-02-1 row (`TSPEC-pdlc-advisory-wave-gate.md:1910`) still reads "`ADVISORY_ROOT_CAUSES` set-equal to the four-member literal", which contradicts FSPEC BR-2's ordered-sequence rule, TSPEC's own §3.5, and this PLAN's A6-05 row. The PLAN follows FSPEC and is right to; the stale row is upstream's and is routed as an erratum again below rather than folded into this verdict. |

## Positive Observations

## Recommendation

## Verdict
