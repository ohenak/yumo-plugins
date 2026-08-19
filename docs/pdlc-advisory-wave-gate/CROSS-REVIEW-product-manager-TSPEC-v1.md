# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.0)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Date:** 2026-08-18
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria
fidelity. Technical choices (snapshot plumbing, module layout, coverage mechanics) are the software
engineer's and test engineer's lenses, not mine.

## Grounding note

Every shipped symbol and behavioural claim cited below was checked against the repository, not
against the TSPEC's prose. Verified reads are cited `file:line`.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | AC-5.1's restoration reach is silently narrowed: `.gitignore`d paths are excluded from both capture and restore, and the narrowing is pinned by a test rather than ratified upstream | REQ AC-5.1; FSPEC BR-9, AT-05-1 |
| F-02 | High | Local | A snapshot-capture failure is a named A6 invocation that writes no advisory record, no escalation entry and no root-cause halt fields — the one path where the operator gets a halt with nothing to read | REQ AC-6.1, AC-6.2, AC-6.3 |
| F-03 | High | Local | §5 Test Strategy allocates no home for the prohibition tests, their required paired positive assertions, or AC-4.1's conjunct-(iii) mutation fixture — three P0 obligations with no test surface named | REQ AC-4.1, AC-4.5, AC-3.5; FSPEC AT-03-5, AT-04-1 |
| F-04 | Medium | Local | AC-2.2's first-match precedence over the root-cause set is not script-decidable, which contradicts §3.3's blanket claim that every prompt rule is also checked by the script | REQ AC-2.2, NFR-1; FSPEC BR-2, BR-16 |
| F-05 | Medium | Local | The §2.6 ordering change and the widened inapplicability notice are unconditional on `advisory.enabled`, and the TSPEC never says whether a disabled-tier run emits them | REQ AC-1.4, AC-1.5, NFR-2 |
| F-06 | Medium | Local | §3.6 adds a third `commitPaths` call where BR-8 licensed widening the existing per-task commit's pathspec; the interpretation is flagged but not routed to DECISIONS | REQ AC-4.2, AC-4.6; FSPEC BR-8, AT-04-3 |
| F-07 | Low | Local | Two accepted deviations claim to be recorded in §6 (`O-Q1`, `O-Q3`); §6 carries neither row, so both deviations are unrecorded | REQ AC-5.1, AC-4.6 |
| F-08 | Low | Local | §5.1's test-file table names no home for the AC-6.x record and escalation-log assertions, though both suites already exist in the repo | REQ AC-6.1, AC-6.2; FSPEC AT-06-1…AT-06-6 |

### F-01 — `.gitignore`d paths silently leave AC-5.1's reach (High)

FSPEC BR-9 fixes the oracle for AC-5.1 with no carve-out
(`docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md:204`):

> "the path-to-content-hash map over tracked **and untracked files alike**, generated outputs
> included, equals the map taken immediately before A6 acted"

AT-05-1 restates it verbatim (`FSPEC-pdlc-advisory-wave-gate.md:410`). A `.gitignore`d file written
by the wave or by the re-run post-wave command is an untracked file and a generated output, so it is
inside that map as the FSPEC writes it.

TSPEC §2.5 puts it outside: capture is `git add -A` (which skips ignored paths) and restore is
`git clean -fd`, with `-x` "deliberately absent"
(`docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md:172-190`). §5.2 then pins the
narrowing as an assertion — "a wave that adds a `.gitignore`d file leaves it present" after restore.

The engineering reasoning is sound and I am not asking for `-fdx`: restoring `node_modules/` or
`.claude/workflows/` would be worse than the defect. What I am asking is that the product boundary
be stated where product boundaries live. As written, a P0 acceptance criterion is narrowed inside a
TSPEC and then locked in by a test, so the next reader's only route to the real promise is the test
file. Two consequences an operator would care about are currently undocumented: in a consumer repo
whose build directory is gitignored, a failed A6 attempt leaves build outputs from a repair that no
longer exists in the tree; and AC-5.1's "observably identical" no longer means what BR-9 says.

**To resolve:** raise the carve-out as an erratum on FSPEC BR-9 and AT-05-1 so the oracle reads
"tracked and untracked files that git does not ignore", and let REQ AC-5.1 inherit the same
wording. Then §2.5 and §5.2 are transcribing an approved boundary rather than setting one.

### F-02 — the capture-failure path writes nothing (High)

Three places describe what happens when `captureTreeSnapshot` fails, and none of them writes a
record:

- §2.5 (`TSPEC:203-205`): "A capture that fails means A6 never dispatches at all."
- §3.2 step 4 (`TSPEC:295-296`): "A capture failure halts here, before any dispatch."
- §3.5 (`TSPEC:414-415`): "returns `null` on any `ok !== true`; the caller emits a notice and does
  not dispatch."

AC-6.1 binds on invocation, not on dispatch: "Given **any A6 invocation**, Then an entry is appended
to the feature's existing advisory record". By §3.2's own control flow this path is an invocation —
`runWaveGateSeam` was called, the tier gate passed, the wave budget was checked — so AC-6.1 is not
met on it. AC-6.2 and AC-6.3 fail with it: no escalation entry, and §4.5's halt-fields row is
scoped to "any non-resolved wave" but the capture-failure halt is the first-pass gate halt, which
§2.3 builds with no advisory fields when A6 returned nothing.

This is also the path where the operator is least equipped: the wave is red, A6 engaged, and the
only trace is a report notice that does not survive the run. Contrast the wave-budget escalation in
step 3, which the TSPEC is careful to route through `terminate` precisely so the record and the log
are still written — the right instinct, applied one step later than it needs to be.

The three descriptions should also be reconciled. "Halts here" and "emits a notice and does not
dispatch" are different contracts even though both runs end in a halt, and §5.1 lists no case for
either.

**To resolve:** name capture failure as a terminal disposition that writes an advisory record entry
and an escalation entry (root cause `unclassified`, action refused, no attempt consumed), state
which of the two halt descriptions governs, and give it a row in §5.1. FSPEC E-28 covers restore
failure only, so capture failure needs an edge-case row there too.

### F-03 — the P0 prohibition tests have no home (High)

REQ AC-4.5 is explicit and is P0: "Given AC-4.1 through AC-4.4, Then each has a failing test proving
the prohibition holds, and each such test **asserts the corresponding positive outcome on the same
path** — the refusal reason recorded, the escalation entry written, the pre-A6 behaviour taken —
because a negative assertion alone is satisfied by accident." AC-3.5 adds that each excluded
operation in AC-3.2 and AC-3.3 is "asserted by its own test", and FSPEC AT-03-5 requires the four
prohibitions `(f)`…`(i)` be exercised one by one.

§5 carries none of this. §5.1's row for the new suite reads "A6's parsers, envelope classification,
invocation ordering, snapshot/restore, budget" — no prohibitions. §5.2's four bullets cover
totality, the ordered-sequence oracle, the root-cause/envelope binding and the disabled tier. The
string "AC-4.5" does not appear in the document, nor does any statement of the paired-positive rule.
AC-4.1's conjunct (iii) — the fixture that mutates the shipped control flow to drop the re-gate and
asserts the halt survives — is likewise absent; REQ v1.8's changelog records it as a deliberate
addition (erratum round 4, F-24), so its absence here reads as a drop rather than a judgement.

This matters beyond bookkeeping. A6 is a seam whose entire licence to exist is that its boundaries
hold, and AC-4.5 exists because "the seam did not commit" passes trivially in a test where the seam
never ran. Without the paired positive assertion named in the design, PLAN has nothing to schedule
and the property author has nothing to trace.

**To resolve:** add a §5 subsection allocating (a) one test per prohibition `(f)`…`(i)`, each
asserting both the refusal and the recorded reason plus escalation entry on the same path; (b) the
AC-4.1 conjunct-(iii) mutation fixture, named as such; (c) the AC-4.2/AC-4.3 negative-plus-positive
pairs. Naming the file is enough; the shapes are the test engineer's.

### F-04 — first-match precedence is not script-decidable (Medium)

AC-2.2 defines the root-cause set as "closed, ordered, first matching class winning so a failure
matching two classes still yields one class", and FSPEC BR-2 repeats it. NFR-1 and BR-16 require
every boundary to be enforced in the script, never only in an agent prompt.

The design enforces membership but not precedence. `parseA6RootCause` "returns it iff it is a member
of `ADVISORY_ROOT_CAUSES`" (`TSPEC:334-340`) — a set test, with no view of whether an earlier class
also matched. Ordering therefore lives entirely in the prompt, while §3.3's `prompt` row claims the
opposite: "every one of these is *also* checked by the script, and no rule here is satisfied by
having told the agent about it" (`TSPEC:314`). For the vocabulary and the citation rule that claim
holds; for precedence it cannot.

Product impact is bounded rather than absent, and worth stating so the residual is accepted
knowingly: §4.2's class-to-envelope binding *is* script-enforced, so a failure that is really a
`plan-ordering-defect` misreported as `wave-internal-defect` cannot reach E-6 — it gets E-5 and is
confined to the wave's own owned paths. What it does defeat is AC-6.4: `plan-ordering-defect`
counts are the signal R-4 and O-6 exist to produce, and an unenforceable ordering rule makes that
count a function of agent judgement.

**To resolve:** either qualify §3.3's claim to name precedence as the one prompt-only rule and say
what the residual costs AC-6.4, or add the one conjunct that is decidable — a declared
`wave-internal-defect` whose `PROMOTES-TASK:` conjuncts would have held is re-read as
`plan-ordering-defect`. Either is fine; silence is not, because NFR-1 reads as fully discharged today.

### F-05 — the disabled tier is not answered for the §2.6 notices (Medium)

§2.6 hoists the implementation-config read and the `scriptGate` computation above the `if (!waveMode)`
branch (`orchestrate-dev.js:14039-14044`, `:14143-14155` — both read as described) and widens the
legacy notice to name both absent prerequisites. The change is unconditional: nothing in §2.6 or
§3.2 gates it on `advisory.enabled`.

So a run with the tier disabled now emits notices it did not emit before, and the TSPEC does not say
whether the AC-1.5 inapplicability statement is among them. AC-1.4 promises A6 is inert when
disabled; NFR-2 pins "the report's phase table, every phase outcome, and the run's created-file set"
plus "no A6 row", and §2.6 leans on exactly that narrowness — "These are report text; NFR-2 pins the
created-file set and the phase outcomes, not the report prose" (`TSPEC:222-224`). That is a fair
reading of NFR-2's letter. It is a thin one against AC-1.4's spirit, and §5.2's disabled-tier bullet
does not close it: it asserts no dispatch, no model resolution, no snapshot ref and an `undefined`
`advisory` key, and says nothing about notices.

The operator-visible question is small and concrete: with the seam switched off, does my run report
change? The TSPEC should answer it rather than leave Phase I to pick.

**To resolve:** state explicitly whether the inapplicability statement is emitted when
`advisory.enabled` is false (I would say yes — it describes prerequisites, not the seam, and §2.6
already argues A6 authors none), and extend §5.2's disabled-tier bullet to pin the answer either way.

### F-06 — the E-6 commit interpretation should be routed to DECISIONS (Medium)

§3.6 adds "one further `commitPaths` call" after the per-task loop, and argues the writer-**identity**
set stays two. FSPEC BR-8 does licence movement here, but licenses a different move: "the invariant
A6 preserves is the writer identity set, not the pathspec scope those writers pass … that **scope**
may widen under O-8's E-6 resolution". The natural reading of that sentence is widening the existing
per-task commit's pathspec, not adding a call with its own `what` label
(`Wave N advisory promotion (task T)`), which surfaces in git history as a third commit.

I am not blocking on the choice. AC-4.2's product intent is that A6 never commits — that the wave
loop's existing writer commits, past the same green gate, with the same provenance — and §3.6
preserves that. AC-4.6's intent, that a resolved wave leaves no repair uncommitted, is served either
way. The TSPEC is right that this is "the load-bearing interpretive decision of the feature" and
right to surface it now.

What is missing is the routing. A decision this load-bearing, which the author expects a reviewer
might overturn, is a DECISIONS row with its re-evaluation trigger, not a paragraph inside §3.6 —
otherwise Phase I inherits it as settled and AT-04-3's author has to reverse-engineer the intent.

**To resolve:** record it as a DECISIONS entry (decision, alternative considered — widening the
per-task pathspec — and the trigger that would reopen it), and add it to §6 as a resolved question
rather than an implicit one. My product ruling, for the record: the added call is acceptable.

### F-07 — two accepted deviations claim a record that does not exist (Low)

§2.5 defers the staged-index deviation to "§6 O-Q1" (`TSPEC:181-183`) and §3.6 defers the
cross-run promotion asymmetry to "§6 O-Q3" (`TSPEC:450-451`). §6 carries four rows — OQ-1
(`waveBudgetPerRun: 0`), OQ-2 (leaving the snapshot ref), OQ-3 (PLAN-lint feedback), OQ-4 (queue
visibility) — and none of them is either deviation. Both cross-references are dangling, and both
deviations are therefore asserted-as-recorded and not recorded.

Neither deviation is objectionable on the merits. The staging loss is inside FSPEC BR-9's
content-level oracle, and the cross-run asymmetry is honestly handled — the commit survives even
when the prompt clause does not. That is precisely why they should appear: they are the kind of
thing a reader accepts once it is written down and re-litigates when it is not.

**To resolve:** add both as §6 rows (non-blocking, with their dispositions), or repoint the two
references at wherever they are meant to land.

### F-08 — no test home named for the AC-6.x record and escalation assertions (Low)

§5.1's table names seven files. `advisoryRecord.test.js` appears only in §1.3's transcribed-surface
list, and `advisoryEscalationLog.test.js` does not appear at all, though both exist
(`pdlc/workflows/__tests__/advisoryRecord.test.js`,
`pdlc/workflows/__tests__/advisoryEscalationLog.test.js`). FSPEC AT-06-1…AT-06-6 — the record entry
per invocation, the failed-record-write refusal, the escalation entry's decision sentence, the
failed-log-write notice — consequently have no allocated home, and REQ-AWG-06 is the criterion group
that makes A6's behaviour legible to the operator after the run.

**To resolve:** add the two files to §5.1 with the AC-6.x obligations they carry.

## Questions

| ID | Question |
|----|---------|
| Q-01 | With `advisory.enabled: false`, does a run still emit the AC-1.5 inapplicability statement and the newly-hoisted implementation-config notices? F-05 asks the TSPEC to answer; I would like the answer to be "yes, prerequisites are not the seam", but the decision is the author's to state. |
| Q-02 | On the capture-failure path (F-02), which halt does the operator see — the wave's own gate halt with advisory fields attached, or a distinct restoration-unavailable halt? AC-5.2 says escalation never changes control flow, which argues for the former. |
| Q-03 | `waveBudgetPerRun: 0` (OQ-1) makes every A6 invocation escalate pre-dispatch, which is operationally indistinguishable from `advisory.enabled: false` for this seam. Is that a documented operator affordance ("keep the tier on, keep A6 off") or an accident of the validator change? Naming it in §4.4 would close the question without a DECISIONS round. |
| Q-04 | AC-6.4's countability rests on `ESCALATIONS.md`. If a `plan-ordering-defect` is *resolved*, the count is lost at Phase PUB by design (REQ O-2). Is one line in the advisory record's LEARNINGS distillation enough to keep R-4's "the PLAN has a problem" signal alive across runs, or is that genuinely deferred? |

## Positive Observations

- **The obligation table in §1.1 is the right way to open a TSPEC.** Five FSPEC-routed obligations,
  each with the section that answers it and the answer in one line, means a product reader can check
  discharge without reading the design. O-1, O-3, O-4, O-5 and O-8 are all genuinely answered where
  the table says they are.
- **Reuse is treated as a design decision, not a shortcut.** §2.2's "every box marked SHIPPED is a
  cite-and-reuse" and its consequence — "BR-5's precedence claim, BR-15's eight-member reason set and
  NFR-6's rung are all discharged by *not writing code*" — is exactly right, and it checks out:
  `ADVISORY_REFUSAL_REASONS` carries eight members (`orchestrate-dev.js:2297-2306`), the exclusion
  order is `X-a, X-e, X-d, X-b, X-c` as §3.4 states (`orchestrate-dev.js:2311`), and
  `advisorySummaryRows` maps over `ADVISORY_SEAMS` so AC-1.1's sixth row follows from the constant
  alone (`orchestrate-dev.js:2989-2992`).
- **§1.3 refuses to hide that the change is not additive.** Naming all six transcribed surfaces that
  go red on the first constant edit, and instructing that each be re-transcribed rather than loosened
  to a `toContain`, is the honest handling of R-5 and it protects the set-equality oracles the seam's
  safety rests on. The five-member literals are where §1.3 says they are
  (`__tests__/helpers/advisoryDoubles.js:271`, `__tests__/advisoryRecord.test.js:496`).
- **AC-2.3 is fully served.** `gatherEvidence` returning the untruncated `gateResult.output` rather
  than `outputTail`'s 30 lines (`orchestrate-dev.js:10751`) is what makes "cites the gate command's
  own output" satisfiable on a long suite instead of nominally true.
- **The `classifyReply` hook instead of an `if (seam === "A6")` branch.** The stated reason — the
  gate-exclusivity registry asserts no seam has a private path through the driver — keeps A6 from
  becoming the exception that erodes the tier's uniformity. That is a product property (every seam is
  reviewable the same way), not only an engineering one.
- **§3.2 step 3 routes the no-dispatch budget escalation through `terminate` so the record and log
  are still written.** Verified against the shipped `__preDispatch` escape
  (`orchestrate-dev.js:3399-3410`), which terminates with no `_agent` call and no rung resolution.
  F-02 asks only that the capture-failure path be given the same care.
- **§2.6 states its consequences rather than letting them be discovered.** The admission that a
  legacy-path run gains notices it did not emit before is the kind of disclosure that makes a design
  reviewable; F-05 asks it to go one step further, not to start over.
- **§3.6 flags its own load-bearing interpretation and invites the disagreement now.** "That
  disagreement is cheaper to have now than in Phase I" is correct, and it is why F-06 is a Medium
  about routing rather than a High about the choice.

## Recommendation

**Needs revision** — three High findings (F-01, F-02, F-03).

Exactly what to change:

1. **F-01** — stop narrowing AC-5.1 inside the TSPEC. Raise the ignored-path carve-out as an erratum
   on FSPEC BR-9 and AT-05-1 (and REQ AC-5.1), then have §2.5 and §5.2 transcribe the approved
   boundary. The `clean -fd` choice itself is right; only its provenance is wrong.
2. **F-02** — give the snapshot-capture failure a terminal disposition that writes the advisory
   record entry and the escalation entry, carries the root-cause class into the halt fields,
   reconciles §2.5 / §3.2 / §3.5 on one control-flow contract, and gets a §5.1 row.
3. **F-03** — add a §5 subsection allocating the prohibition tests `(f)`…`(i)` one by one, each with
   AC-4.5's paired positive assertion on the same path, plus AC-4.1's conjunct-(iii) mutation
   fixture named as such.

F-04 through F-06 should be answered in the same revision — each is a sentence or two of stated
decision, and F-06 additionally a DECISIONS row — but none of them gates the phase. F-07 and F-08
are bookkeeping.

This is a strong TSPEC. It discharges every obligation FSPEC routed to it, it reuses the shipped
tier rather than re-implementing it, and its claims about existing code held up under every check I
made. The three High findings are all of one kind: a boundary decided in the right place
technically, recorded in the wrong place for the product to see it.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 2}
