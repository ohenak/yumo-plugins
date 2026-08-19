# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.0)
**Date:** 2026-08-20
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Technical adequacy of the git plumbing, test strategy and code quality are the engineering and test reviewers' lenses, not mine.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | The DEC-A6-04 consequence says `pdlc/engine`'s `ci-arrangement` expectations "move with" the example-config key. There are no advisory expectations there to move: the tracked example carries no `advisory` section at all, and `ci-arrangement.test.js` reads the example once and asserts only on `implementation.testCommand`. The operator affordance E-33 promises is mirrored into an example nothing asserts | REQ C-2 (`advisory.waveBudgetPerRun`, default `1`); FSPEC E-33 |
| F-02 | Medium | Local | The closing consequence prices the three set-equality surfaces as "one task, not three". The five-member seam list is transcribed at six sites and the four-member envelope at six more, and `ADVISORY_DEFAULTS`' counterpart is a shared frozen double whose key set is asserted against real parse output — so adding `waveBudgetPerRun` reddens tests the record does not mention. A PLAN sized off this sentence under-scopes | REQ C-2; FSPEC AT-07-2b |
| F-03 | Medium | Local | DEC-A6-02 rejects widening a per-task pathspec, but the upstream row it resolves — TSPEC §1.1's O-8 — still states the rejected shape ("the wave commit loop's existing `commitPaths` writer gains one pathspec"), and FSPEC BR-8 still reads as licensing the widening. A later reader tracing O-8 forward gets two answers; the decision record is the right place to name that and route the fix | REQ O-8, AC-4.6; FSPEC BR-8 |
| F-04 | Low | Local | DEC-A6-02's reversibility caveat rests the "test-visible, not silent" claim on AT-04-5. FSPEC's AT-04-5 asserts committed state, absence of a residual working-tree change, the record's paths and the later task's prompt clause — not the message. The message oracle exists, but it is TSPEC §7's mapping of AT-04-5, not AT-04-5 as specified | FSPEC AT-04-5; REQ AC-4.6 |
| F-05 | Low | Local | DEC-A6-03's consequence calls "copy the ref before re-running" the *documented* operator remedy. It is documented in TSPEC §2.5 and in this record — neither of which an operator reads. E-28's halt names the ref, not the remedy, and no operator-facing surface carries it | REQ AC-5.1; FSPEC E-28 |
| F-06 | Low | Local | DEC-01's options table rejects option C because "AC-5.1's oracle is content-level over the whole tree", while the chosen option D has the same residual gap on ignored paths — acknowledged two paragraphs later and open as OQ-7. The table as written reads as full AC-5.1 compliance for D, which is the reading the Context says this document exists to prevent | REQ AC-5.1; FSPEC BR-9; TSPEC §6 OQ-7 |
| F-07 | Low | Local | Two transcription slips in DEC-A6-01: the wave contract is quoted as `Do NOT git commit` where the shipped prompt reads "Do NOT run git add or git commit — the orchestrator verifies your work and commits it", and the capture sequence drops the `-m "…"` that TSPEC §2.5 gives `commit-tree`. The first slip drops the half of the quote that carries the argument | REQ NFR-3; TSPEC §2.5 |

## Detail

### F-01 — the example-config consequence claims coverage that does not exist (Medium)

DEC-A6-04's consequence section states that `.claude/pdlc.config.example.json` gains the key and
"`pdlc/engine`'s `ci-arrangement` expectations move with it; the tracked example is arrangement read
by an engine test, so this is a two-channel edit, not a one-file one."

Against the repo:

- `.claude/pdlc.config.example.json` contains exactly two sections, `dispatch` and `implementation`.
  There is no `advisory` section, so no advisory expectation can "move" — one has to be created.
- `pdlc/engine/__tests__/ci-arrangement.test.js` resolves that example path once (`configPath`) and
  uses it in exactly one test, whose title and body are `implementation.testCommand`: it parses the
  file and asserts the command is a string matching `cd pdlc/workflows && npm test` and
  `cd pdlc/engine && npm test`. Nothing in that file reads `config.advisory`.

So the two-channel framing is right in spirit and wrong in fact: the second channel holds no
expectation today, and the edit is "author a new engine expectation", which is a different size and
a different risk. The product consequence is the one worth stating: `waveBudgetPerRun: 0` is
described in REQ C-2 and FSPEC E-33 as a *documented operator affordance*, and the thing making it
discoverable is the tracked example. If nothing asserts the example carries it, the affordance can
ship working and undiscoverable — the tier is off by default, so the example is the operator's first
and possibly only encounter with the key.

Suggested change: restate the consequence as "the example gains an `advisory` section it does not
have today, and `ci-arrangement` gains a *new* expectation over it", and let PLAN carry both as work
rather than as bookkeeping. I am raising the same correction as an erratum on TSPEC §7, which is
where this record inherited the claim.

### F-02 — "one task, not three" is priced against three constants, not their transcriptions (Medium)

The closing consequence reads: "Three transcribed set-equality surfaces move together when A6 lands —
`ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS` and `ADVISORY_DEFAULTS` — each with a literal counterpart in
the test suite. This is the failure class A6 itself exists to survive, and PLAN can sequence the
edits as one task, not three."

The constants are three. Their counterparts are not:

- The five-member seam literal `["A1", "A2", "A3", "A4", "A5"]` appears at six sites under
  `pdlc/workflows/__tests__/` — the `ADVISORY_SEAMS` set-equality assertion in `advisoryEnvelope`,
  a report-row assertion in `advisoryRecord`, a `test.each` table in the same file, a harvest-row
  assertion in `advisoryHarvest`, a generator pick in `consolidationProperties`, and a `SEAMS`
  constant inside the shared `advisoryDoubles` helper.
- The four-member envelope literal `["E-1", "E-2", "E-3", "E-4"]` appears at six sites likewise,
  two of them inside that same shared helper.
- `ADVISORY_DEFAULTS`' counterpart is not a literal in an asserting test at all: `advisoryConfig`
  binds its `ADVISORY_DEFAULTS` from `makeAdvisoryConfig().config`, which returns the helper's frozen
  `ADVISORY_DEFAULTS_SHAPE`. One assertion in that file compares the *key set* of a real parse
  against the key set of that double, so adding `waveBudgetPerRun` to the shipped constant without
  adding it to the helper turns that test red for a reason this record does not predict.

None of this argues against the decisions — it argues against the sentence PLAN will read. A record
that says "one task" and means "one task touching a dozen transcriptions plus a shared double"
invites exactly the partial edit the set-equality discipline exists to catch. Suggested change: keep
the "move together" claim, drop or requalify the task-count claim, and name the shared double as the
surface with a coupling the other two do not have.

### F-03 — O-8's own traceability row still names the rejected option (Medium)

DEC-A6-02 chooses "one further `commitPaths` call after the per-task loop" and rejects option A,
"widen the owning per-task `commitPaths` call's `paths`". I agree with the choice and I ruled it
acceptable in the TSPEC round that routed it here (PM F-06 → TSPEC §6 OQ-8); this finding is about
what the upstream text still says, not about the decision.

TSPEC §1.1's obligation table, row O-8, describes the resolution as "the wave commit loop's existing
`commitPaths` writer gains one pathspec — the promotion's paths, scoped to the later task's owned
set". Read plainly, that is option A. TSPEC §3.6 and this record say the opposite, and FSPEC BR-8's
"that scope may widen under O-8's E-6 resolution" is the sentence option A was built from — it is
now a licence nobody exercises.

This matters to me for the reason the Context gives for the document existing: a later reader who
enters through the O-8 obligation row, which is the traceability path from REQ, reaches the rejected
shape and never sees the rejection. Suggested change: this record should say, in DEC-A6-02, that
O-8's obligation row and BR-8's licence clause are superseded by this entry, and the upstream text
should be corrected. I am raising the TSPEC half as an erratum; FSPEC BR-8's clause is permissive
rather than wrong, so I am not gating on it, but it would read better as "that scope may widen … —
resolved as a separate commit, DEC-A6-02".

### F-04 — the message assertion is TSPEC's, not AT-04-5's (Low)

DEC-A6-02's reversibility reads "easy, with one caveat — the commit *message* is asserted by AT-04-5,
so a later reshaping is a test-visible change, not a silent one."

FSPEC's AT-04-5 asserts four things: the repair is in the branch's committed state, no uncommitted
working-tree change of the repair remains, the advisory record names the repair's paths and the later
PLAN task that owns them, and the later task's dispatch is told the promotion exists — plus the
companion case whose later-task paths sit outside every configured post-wave pathspec. The message
is not among them. The message oracle does exist: TSPEC's §7 test-mapping row for AT-04-5 says the
commit is "identified by its `message` literal and pathspec", and §3.6 fixes the literal.

The caveat therefore holds, but its citation does not. Suggested change: attribute it to TSPEC §3.6 /
§7's AT-04-5 mapping. This is worth a word because reversibility ratings are what a future operator
will act on: "a test will catch it" is only true if the test that catches it is the one named.

### F-05 — the "documented" remedy is documented where the operator will not be (Low)

DEC-A6-03's consequences say the pre-repair tree is recoverable only until the next run of the
feature, and that "the documented operator remedy, until DEC-A6-03 is revisited: copy the ref before
re-running a halted feature."

Copying the ref is a good remedy. It appears in TSPEC §2.5 and in this record. FSPEC E-28 requires
the halt to name the failed restoration, and TSPEC has the halt name the ref — so what the operator
sees at halt time is an object name, with no indication that re-running (the ordinary next step
after a halt, as §2.5 itself says) destroys it.

I am not asking for a new acceptance criterion in this document — that would be a product decision
belonging in REQ/FSPEC, and DECISIONS is not where it should land. I am asking the record to stop
calling the remedy "documented" when the documentation is a spec no operator reads, and to name the
gap as a consequence in its own right: an operator who follows the ordinary halt→re-run path loses
the snapshot without being told. If PM should route that to REQ as a halt-message obligation, say so
in the re-evaluation triggers and I will carry it.

### F-06 — option C is rejected on a bar the chosen option also does not clear (Low)

DEC-01 rejects option C ("restore only the paths the repair declared") because "AC-5.1's oracle is
content-level over the whole tree", and leaves the chosen option D's rejection column as "—".

Option D has a residual gap against the same AC as written: `git add -A` skips ignored paths, so the
snapshot never holds a generated output written into an ignored path, while REQ AC-5.1 and FSPEC BR-9
state the oracle over tracked and untracked files with no ignored-path carve-out. The record knows
this — DEC-A6-01's constraints paragraph says the boundary is upstream's and open as OQ-7 — but the
options table, which is the part a later reader scans, presents D as unqualified compliance.

Suggested change: give option D a one-clause rejection cell of its own ("— save for the ignored-path
boundary open as OQ-7"), so the table and the prose agree. The Context promises a reader will not
have to reverse-engineer the rejected options from a test oracle; the same promise should hold for
the chosen one's known limit.

### F-07 — two small transcription slips against shipped bytes (Low)

DEC-A6-01's constraints paragraph quotes the wave contract as `Do NOT git commit`. The shipped wave
prompt in `orchestrate-dev.js` reads "Do NOT run git add or git commit — the orchestrator verifies
your work and commits it." The dropped half is the load-bearing one: it is the prohibition on
`git add` that makes "the index equals HEAD on entry" true, which is the premise the `reset --mixed`
exactness argument rests on. Quoting it in full makes the argument stronger, not weaker.

Second, the capture sequence in DEC-A6-01 gives `git commit-tree {tree} -p {head}` where TSPEC §2.5
gives `git commit-tree {tree} -p {head} -m "…"`. A commit object needs the message; the omission is
almost certainly transcription, but this document is the one a later reader will trust for the verb
sequence.

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-A6-04's consequence says `waveBudgetPerRun: 0` and `advisory.enabled: false` must stay observably different, and pins that to AT-01-4 and AT-01-6. Both of those ATs are about the *report key*. Is there an intended operator-facing statement of the difference anywhere the operator reads — the example config's comment-free JSON cannot carry one — or is the report the whole surface? This is the affordance F-01 worries about, asked from the other side. |
| Q-02 | DEC-A6-03's re-evaluation triggers list "accumulated refs become an operational complaint" and "a run id becomes available" as separate triggers, with pruning and discrimination to be decided together. Is one dangling commit per wave per run the accepted steady state for a repo that runs the tier for months, or is there a bound PM should state in REQ before that becomes an operator's discovery? Not a gate on this document — I would rather see it in REQ than added here. |

## Positive Observations

- **The two entries TSPEC nominated are both here, and both are the ones that were actually
  contested.** The restoration mechanism and the E-6 commit shape are exactly what TSPEC §6's closing
  paragraph nominated, and the E-6 entry preserves the reasoning I asked for in PM F-06 last phase
  rather than only the outcome.
- **The two additional entries earn their place.** The snapshot ref name and the `waveBudgetPerRun: 0`
  admission were both re-litigated across rounds (PM F-02, PM F-03, E-33), and both are operator-
  visible. A record that only carried the nominated two would have left the two decisions an operator
  is most likely to hit undocumented.
- **Rejections are stated against shipped code, and the ones I checked hold.** `git stash` appears
  nowhere in `orchestrate-dev.js`; `write-tree` and `commit-tree` appear nowhere either;
  `_runCommand(command)` really is the Phase I transport returning `{ok, output}`; `positiveInt`
  really is `Number.isInteger(v) && v >= 1` pushing onto `invalidKeys` and returning the default, and
  `waveBudgetPerRun`'s default really is `1`, so option A's "the operator's `0` becomes `1`" is
  precisely right; the per-task commit really does pass `paths: task.files` with a
  `waveCommitMessage`, and the build-outputs commit really is a second `commitPaths` past the same
  gate guarded by `postWaveRan && implConfig.postWavePathspecs.length > 0`. The "shipped precedent,
  not invention" argument for DEC-A6-02 is the strongest thing in the document.
- **Citations follow DEC-DOC-01.** Claims are anchored to symbol names, config keys and quoted
  strings rather than raw line numbers, which is the convention for feature documents and the reason
  my own verification was cheap.
- **Reversibility is rated honestly and cheaply, for a real reason.** "All four are easy because the
  tier ships disabled" is not a hand-wave: `ADVISORY_DEFAULTS.enabled` is `false` in shipped code,
  and the inertness suite already pins the byte-identical baseline.

## Recommendation

**Approved with minor changes**

No High findings. The four decisions are the right four, they are traced to the REQ/FSPEC vocabulary
they serve, and none of them narrows, broadens or silently reinterprets an acceptance criterion — the
one reinterpretation present (FSPEC BR-8's "widen scope") was routed to this document deliberately and
ruled on by me in the prior phase, which is the process working.

What I am asking for, in priority order:

1. **F-01 (Medium)** — correct the `ci-arrangement` consequence: the example has no `advisory` section
   and the engine test asserts only `implementation.testCommand`, so this is new work, not a move.
2. **F-02 (Medium)** — requalify "one task, not three"; the three constants have roughly a dozen
   transcriptions plus one shared double with a key-set coupling.
3. **F-03 (Medium)** — say in DEC-A6-02 that TSPEC's O-8 obligation row and FSPEC BR-8's licence
   clause are superseded by this entry, so the traceability path from REQ does not end at the
   rejected option.
4. **F-04, F-06, F-07 (Low)** — attribute the message oracle to TSPEC's AT-04-5 mapping, give option D
   a rejection cell naming its OQ-7 limit, and restore the full `Do NOT run git add or git commit`
   quote plus `commit-tree`'s `-m`.
5. **F-05 (Low)** — stop calling the copy-the-ref remedy "documented", or route it to REQ as a
   halt-message obligation and say so in the re-evaluation triggers.

Errata for TSPEC accompany this review in the response trailer.
## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 4}
