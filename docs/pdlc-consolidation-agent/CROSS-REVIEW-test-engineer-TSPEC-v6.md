# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.6)
**Date:** 2026-08-06
**Iteration:** 6

**Scope:** Delta re-review under the Phase-T decision freeze (POSTMORTEM-T `## Resolution`,
`RESOLVED: yes` at `:14`). Baseline `9436e87` (the v1.4 bytes v5 reviewed) → HEAD `c8c5760`; 183
insertions, 27 deletions across fourteen commits. Two passes: (1) each of v5's three findings and
three questions, verified at the mechanism rather than at the revision's account of it; (2) the
changed text only, read for new issues. Unchanged sections already approved are not re-litigated.
The approval bar is unchanged — any open High or Medium means **Needs revision**.

## Disposition of v5 findings

All three are resolved, and all three questions are answered in the document.

| v5 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | Medium | **Resolved, both halves** | §12.2 carries a new unnumbered `(no FSPEC AT)` row asserting the **key set of `rtConsInjections()` set-equal to §5.1's declared seam names**, explicitly widened from `adapterProbe.test.js:253-258`'s per-name containment ("wires all three into `rtDevInjections`" — I read it; it is three `toBe` identities, so the widening is a real change of shape and not a re-description) because a *surplus* key is as much a drift signal as a missing one. §12.3 assigns it to `consolidationBuild.test.js` (L3) and states why that file owns it. §5.5 now says what the module defaults do **in the runtime**: I verified the premise — `defaultReadFile` is `const { readFileSync } = await import("fs")` (`orchestrate-queue.js:948-955`), and `import()` does not exist in the bundle — and `defaultCheckFile` is specified to **throw** rather than return a legal `{ok:false}`, deliberately not copying `checkFileNonEmpty`'s never-throw catch (`orchestrate-dev.js:3690-3692` — the `catch { return {ok:false, reason:"file_missing"} }`, correctly cited after this round's fix). The unwired-seam precedent is quoted accurately from `runtime-adapter.js:1098-1100` |
| F-02 | Medium | **Resolved, and the wrong line is withdrawn by name** | §7.3's sequence is now `check → read → verdict → write → read back → …` (`:990`), the lead-in reads "Take is `_checkFile`, then `_readFile`, then `_writeFile` — **observe-then-write**" (`:969`), §10.4 item 1 is respelled to the three-call span, and §13.1 row 5's "non-atomic" spelling was made consistent in a commit of its own. The added paragraph states the expected call prefix `["check", "read", "write", "read"]` — I checked the double: `fakeFs` pushes `op: "check"` (`__tests__/helpers/seams.js:304`), `"read"` (`:259`) and `"write"` (`:282`), so that expected value is spelled in the vocabulary the double actually records, and the header example it cites (`:241`) exists |
| F-03 | Low | **Resolved** | §11.2 now shows the drain as `try { …assertions… } finally { await new Promise((r) => setTimeout(r, 0)); }` and says in as many words why the trailing form was wrong — the timer is pending only on the broken implementation, which is the world the mandated mutation check puts the suite in |

**Questions.** Q-01 is answered in §11.1 by a paragraph that records the L4 pathspec case's
*non*-coverage and ties the choice to §13.3's erratum: `--exclude-standard` is inert under
`git add -A` + `--cached`, pinning it would pre-empt the answer this layer declined to give, and the
paragraph states what happens to the conjunct under each answer. Q-02 is answered structurally
rather than verbally — the counter assertion moved out of `afterAll` into its own top-level `test()`
declared last, which is the repair, not a softening. Q-03 is answered in §5.1's `CheckReply` comment,
which now records the byte-size (`test -s`, `runtime-adapter.js:823`) vs. trimmed-content
(`seams.js:298`) divergence, states that nothing in the document reads *which* reason came back, and
tells a future editor not to build on the distinction. I re-verified both mechanisms; the citations
are exact after this round's `:820`→`:823` correction.

## Findings

Three, all in text that did not exist at v5. One Medium: the decision this whole round exists to
confirm — decision 2, "`present` is never derived from `_readFile(...) !== null`" — has no fixture
anywhere in §12 that can tell the two implementations apart. Neither of the other two is blocking.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | No fixture in §12.2/§12.3 puts an **empty** marker on the tree, so §10.3's new row 4a is asserted by nothing and the forbidden `_readFile(...) !== null` derivation greens the entire specified suite. This is the round's central decision and the one it names as the bug being avoided | §7.3 decision 2, §10.3 row 4a, §12.2, §12.3 |
| F-02 | Low | Local | §12.2's new release row keys `{taken?, released?}` on the terminal status, but `refused` has **two** arms with opposite `taken` values — §7.3's failed-take arm writes `IN-PROGRESS` and releases nothing. The row's expected pair is therefore fixture-dependent and reds on correct code if the implementer picks the other arm | §12.2 release row, §7.3, §10.3 row 5a |
| F-03 | Low | Local | `BR-15` is cited as `FSPEC-…:2500`; it is at `:2502` (`:2500` is BR-13). Every other citation in the new text verifies exactly | §12.2 release row |

## Detail

### F-01 — decision 2 is unfalsifiable: no fixture ever carries an empty marker (Medium)

§7.3 states the decision and states its consequence in the same breath (`:916-919`): `present` "is
never derived from `_readFile(...) !== null`, which would read the empty released form as
present-and-unparseable and send `markerVerdict` down the `reclaim` arm on a completely normal pass,
recording `reclaimed-stale-lock` on every steady-state run after the first." §10.3 row 4a now records
the shipped behaviour as a failure-table row: marker present but empty ⇒ `{ok:false,
reason:"file_empty"}` ⇒ `present === false` ⇒ `free`, the pass takes the marker and proceeds, **no**
`reclaimed-stale-lock`.

I went looking for the fixture that holds that row and there is none. I enumerated every marker
fixture the document specifies and evaluated the forbidden implementation against each:

| Fixture | Initial marker state | `_checkFile` route | `_readFile !== null` route |
|---|---|---|---|
| AT-M1 (§12.3, `consolidationPass.test.js`) | present, parseable, fresh | `refuse` | `refuse` |
| AT-M2 | present, parseable, older than `staleLockMinutes` | `reclaim` | `reclaim` |
| AT-M3 (the satisfiable, non-empty arm per §12.3) | present, unparseable, non-empty | `reclaim` | `reclaim` |
| AT-M4 / AT-M6 | absent | `free` | `free` |
| §12.2's release row, all six status arms | absent (the case asserts the *write history*, not an initial marker) | `free` | `free` |
| T-13 (§12.2) | absent | `free` | `free` |

Every row agrees. The two implementations diverge on exactly one input — a marker file that exists
and is empty — and no case constructs one. So the suite as specified is green on the implementation
§7.3 forbids, and the operator-visible failure it names (a false `reclaimed-stale-lock` on **every**
steady-state pass, i.e. on every pass a healthy repo will ever run after its first) ships unobserved.
That is the "safety property that can only pass" class: not a wrong assertion, an absent one, on the
one decision this round was re-opened to confirm.

Two further things make it worth a Medium rather than a note. First, §7.3's release form guarantees
the empty-marker state is not an exotic fixture but **the steady state of every consuming repo from
the first pass onward** — the document says so itself at `:962`, "the zero-byte marker is permanent".
The untested input is the normal one. Second, the document already reasons in the pair-not-absence
shape everywhere else (the unreadable-corpus row's readable control, the ER-6 two-fixture
discriminator, the release row's four positive arms controlling its two negative ones); here the
positive control already exists — AT-M3's non-empty unparseable marker, which *does* reclaim — so the
discriminating pair is one fixture away from being complete.

**Required — one of two, both one sentence, both freeze-compliant (no new mechanism, function,
observable, file or §12.3 row):**

- add a conjunct to the marker case already owned by `consolidationPass.test.js`: a fixture whose
  `docs/_decisions/.consolidation-lock` is `""` asserts (i) the terminal status is a normal one, not
  `refused`, and (ii) `reclaimed-stale-lock` is **absent** from the pass's reasons — paired, in the
  same case, against the non-empty unparseable fixture that **does** record it, so neither conjunct
  is an absence-only oracle. `fakeFs` already supports the input with no change: an own-property
  whose value trims to `""` returns `{ok:false, reason:"file_empty"}` (`seams.js:296-299`), and
  `_readFile` returns `""` for it, which is what makes the case discriminate; **or**
- declare the arm PROPERTIES-owned per DEC-LAYER-01, in the shape §12.4 and §14.5 LD-* already use
  elsewhere — naming the observable and stating that no fixture is claimed at this layer. That is a
  legitimate answer here; what is not is leaving row 4a with neither a falsifier nor a stated owner,
  because then the decision's own account of the bug it prevents is the only evidence it prevents it.

### F-02 — `refused` has two arms and the release row keys on one of them silently (Low)

§12.2's new release row transcribes FSPEC §4.3's six-member table faithfully — I checked it row by
row at `FSPEC-…:458-465` and the pairs match, including `refused` and `skipped-cadence` ⇒ neither
taken nor released — and it defines `taken` as "the `IN-PROGRESS: {passId} …` line was written at
some point". But §7.3 `:1005-1008` creates a second `refused` arm the FSPEC's table does not model:
a **failed take**, where the pass wrote its `IN-PROGRESS` line, read back another pass's `passId`,
and terminates `refused` — releasing nothing, correctly, because the lock is not its own (§10.3 row
5a). On that fixture the observed pair is `{taken: true, released: false}`, which is the exact
opposite of the row's expectation for `refused` on both members.

So the table is not a function of the status alone, and an implementer who reaches for the row-5a
fixture writes a case that reds on correct code. I file it Low rather than Medium deliberately: the
failure direction is red-on-correct, never green-on-broken, so it costs an implementation iteration
and cannot ship a false pass — and the natural `refused` fixture (AT-M1's fresh held marker) is the
one an implementer picks first.

**Suggested:** one clause in the row naming the arm it keys on ("`refused` here is the observed-fresh-
marker arm; §10.3 row 5a's failed-take `refused` writes and does not release, and is that row's own
obligation"). It removes the only reading under which the set-equality oracle contradicts §7.3.

### F-03 — one citation off by two (Low)

The release row cites "BR-15 `FSPEC-…:2500`". `:2500` is BR-13; BR-15 ("Every marker-holding terminal
arm releases the marker — `failed` included") is at `:2502`. Everything else in the new text
verifies exactly, including the three the resolution commit repaired (`runtime-adapter.js:823`,
`orchestrate-dev.js:3690-3692`, `FSPEC-…:2594` for E-11) and the ones I re-checked independently
(`FSPEC-…:415`, `:442`, `:2038`, `:458-465`; `REQ-…:155-156`; `runtime-adapter.js:1098-1100`;
`adapterProbe.test.js:253-258`; `seams.js:241`, `:298`, `:304`).

## Questions

| ID | Question |
|----|---------|
| Q-01 | §12.2's release row keys its table on "§6.1's `TerminalStatus`, not a literal list retyped in the test" — i.e. at runtime on §6.4's frozen `TERMINAL_STATUSES`, which is a constant of the module under test. Taken alone that is an implementation echo: a maintainer who deletes a status from the catalogue *and* its behaviour arm shrinks the table and stays green. It is in fact safe, because §11.3(b)'s fourth leg asserts three-way set equality (module catalogue ≡ doubles' transcription ≡ the authority file's §1 table, both directions) and I confirmed the six terminal statuses are §1 rows in `docs/_constraints/pdlc-consolidation-vocabularies.md` — so the catalogue itself cannot shrink unobserved. Should the row cite §11.3(b) as the pin that makes ranging over the module's own constant legitimate? Without the cross-reference the row reads as deriving its expected value from the code under test, which is the thing every other row in §12.2 is careful not to do. |
| Q-02 | §7.3 states the expected call prefix `["check", "read", "write", "read"]` and then declines to mint a row for it ("no §12.2 row obliges a call-order assertion, and none is added under the freeze"). I agree with the freeze compliance. But note that F-01's empty-marker conjunct, if taken, subsumes the call-order oracle's purpose entirely — it falsifies the forbidden derivation by *behaviour* rather than by call shape, which is the stronger form. Is the call-order paragraph then intended to survive into the PLAN as guidance only, or should it be marked as superseded if the F-01 conjunct lands? |

## Positive Observations

## Recommendation

## Verdict
