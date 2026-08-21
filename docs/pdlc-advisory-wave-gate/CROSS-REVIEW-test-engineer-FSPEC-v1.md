# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.5)
**Date:** 2026-08-20
**Iteration:** 1

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | BR-9/AT-05-1's whole-tree content-hash oracle has neither an observation point nor a domain, and as written it contradicts BR-13 | BR-9, E-23, AT-05-1, AT-05-2 |
| F-02 | High | Local | AT-03-7 and AT-03-8 demand an ordered-sequence equality against "its transcribed literal", but no document supplies that literal — the expected value can only be copied out of the module under test | BR-5, BR-15, AT-03-7, AT-03-8 |
| F-03 | Medium | Process | The three "red before the fix" oracles are already green in this tree, and the FSPEC names no base commit at which "before" is measured | AT-01-1, AT-04-5, AT-07-2, §2 |
| F-04 | Medium | Local | §5.4 has no row for "the pre-A6 tree state cannot be captured"; E-28 covers only a restoration that fails, which is a different observable | §5.4 E-28, §7.1 O-1 |
| F-05 | Medium | Local | AT-07-1's totality partition contradicts its own *Given*: BR-4 is listed as not proposable while E-5/E-6 — which are BR-4 — are the first proposable arms named | AT-07-1 |
| F-06 | Low | Local | AT-03-7's *When* says set-equality and its *Then* says ordered-sequence equality, "never set equality" | AT-03-7 |
| F-07 | Low | Local | AT-04-1 reads as self-contradicting on how many runs it needs | AT-04-1 |
| F-08 | Low | Local | AT-02-9's *Given* leaves `advisory.seamBudgetMinutes` unpinned, so its `budget-exhausted` conjunct is satisfiable by the time window it does not mean to test | AT-02-9, E-25 |

### F-01 (High) — the restoration oracle is unsatisfiable beside BR-13, and its domain is unstated

BR-9 and AT-05-1 sharpen AC-5.1's "observably identical" into a specific oracle: "the
path-to-content-hash map over tracked and untracked files, generated outputs included, equals the
map taken immediately before A6 acted". That is the right *unit* — a `git status` comparison would
not discriminate against a per-path restore, and AT-05-2 is a good companion. Two things are
missing, and each makes the oracle unwritable as stated.

**(a) The observation point is not pinned, and every restoring disposition writes into the tree
after it restores.** BR-13 requires an advisory-record entry "for every A6 invocation", and BR-9's
three restoration triggers — refusal, budget exhaustion, red re-gate — are all escalations, so each
one also appends an escalation-log entry (BR-13, AT-06-3). Both carriers are files inside the
working tree: `docs/{feature}/ADVISORY-{feature}.md`
(`pdlc/workflows/orchestrate-dev.js:3667`) and `docs/_queue/ESCALATIONS.md` (`ESCALATIONS_PATH`,
`orchestrate-dev.js:3730`). In the shipped driver the revert runs *before* the record write —
`doRevert()` then `terminate(...)` (`orchestrate-dev.js:4284`, `:4294`, `:4309`), and `terminate`'s
step 7 RECORD appends the entry (`orchestrate-dev.js:4051`) — so at the moment an operator or a test
observes the tree at wave end, the map is **not** equal to the pre-A6 map: it differs by exactly the
bytes BR-13 requires. E-23 compounds this by asserting the run "ends on the restored tree", when the
halt path also rewrites and commits the queue row (M-WG-3/M-WG-7, `orchestrate-dev.js:10805` per
`pdlc-wave-gate-baseline.md:47`). As written, AT-05-1 and AT-06-1 cannot both pass; an implementer
resolves the conflict by weakening one of them silently, which is the outcome this pair exists to
prevent.

*Resolution:* state the observation point in BR-9 — the map is taken immediately after restoration
completes and before the record/escalation writes — or name the two record carriers as excluded from
the map's domain, and align E-23's "ends on the restored tree" with the queue-row write M-WG-7
already performs.

**(b) The map's domain includes ignored, run-mutated state.** "Tracked and untracked files,
generated outputs included" ranges over `.claude/pdlc-wave-state.json`, which REQ v1.11's changelog
records as untracked and gitignored, and which the wave ledger rewrites during a run
(`REQ-pdlc-advisory-wave-gate.md:36-38`). Any implementation of AT-05-1 that takes the domain
literally is flaky; any implementation that quietly narrows it has re-introduced the per-path restore
AT-05-2 exists to fail. Name the exclusion in BR-9 rather than leaving it to the fixture author.

### F-02 (High) — two ordered-sequence oracles with no spec-side literal to transcribe

AT-03-8 asserts that the shipped exclusion catalogue is compared "by **ordered-sequence** equality
over clause ids" and that "a reordering must fail this test where a set assertion would pass it";
BR-5 makes the order load-bearing, because it decides which refusal reason AT-03-2 expects. AT-03-7
does the same for the eight refusal reasons. Both say the comparison is against "its transcribed
literal".

That literal exists nowhere a test author can reach it from the spec. Grep of this FSPEC, the REQ,
`docs/_constraints/pdlc-wave-gate-baseline.md` and `docs/_constraints/pdlc-advisory-corpus-baseline.md`
returns no enumeration of the eight reason strings and no enumeration of the exclusion clause ids
beyond a single mention of `X-e` (`pdlc-wave-gate-baseline.md:63`). The only source is the module
under test: `ADVISORY_REFUSAL_REASONS` (`orchestrate-dev.js:2445-2456`) and
`ADVISORY_EXCLUSIONS = ["X-a", "X-e", "X-d", "X-b", "X-c"]` (`orchestrate-dev.js:2459`) — an order
that is deliberately not alphabetical and therefore not derivable by reasoning either. A test whose
expected sequence is copied from the array it asserts over is an implementation echo: a reorder
applied to both sides passes, which is precisely the regression AT-03-8 was written to catch. The
corpus baseline is explicit that it is not a transcription source ("no table here is transcribed
row-for-row downstream, so no set-equality oracle ranges over this file",
`pdlc-advisory-corpus-baseline.md:19-20`).

This is the same standard the FSPEC already meets elsewhere and is worth matching: AT-02-1
transcribes the four root causes, AT-03-1 transcribes `E-1`…`E-6`, AT-07-2b transcribes the config
key set.

*Resolution:* enumerate both sequences in §4 — the eight reasons in shipped order under BR-15, and
the five exclusion clause ids in shipped order under BR-5 — so the test transcribes from the spec
and a reorder in either catalogue reds the suite. AT-03-2's expected reason should then be named as a
literal rather than as "the reason the ordered catalogue yields".

### F-03 (Medium) — the "red before the fix" oracles are already green in this tree

Three ATs define themselves against a pre-A6 base: AT-01-1 ("carry six rows where they carried
five"), AT-07-2 ("the comparison fails when a surface still carries its pre-A6 literal"), and
AT-04-5's companion ("It must fail before the fix and pass after"). At this branch's HEAD those
surfaces already carry the post-change values: `ENVELOPE_DEFAULTS` is six members
(`orchestrate-dev.js:1942`), `ADVISORY_SEAMS` is `A1…A6` (`:1952`), and `waveBudgetPerRun: 1` is in
`ADVISORY_DEFAULTS` (`:1948`). The FSPEC cites `pdlc-wave-gate-baseline.md` **v1.2**, whose §4
records exactly this — M-WG-13 and M-WG-14, measured at `origin/main` `11420461`, with M-WG-8's
five-member reading marked as a pre-change fact true only at `c8aa22a4`
(`pdlc-wave-gate-baseline.md:66-78`) — but §2 and §6 argue only from the §1–§3 rows and never
reconcile with §4.

The clauses are not wrong; they are unanchored. Name the base commit the "before" readings are
measured at (the baseline already supplies `c8aa22a4`) in §2's prerequisites paragraph, so an
implementer running AT-07-2 in this tree knows whether a green result is a pass or a vacuum. Tagged
`Process` because the pre-change framing is inherited from the REQ and the baseline sanctions it; the
missing anchor is what makes it actionable here.

### F-04 (Medium) — no edge-case row for a failed capture of the pre-A6 tree state

§5.4 carries E-28 for "Restoration itself fails". It carries no row for the prior and distinct
condition: the pre-A6 tree state cannot be captured in the first place. §7.1 O-1 routes "the point at
which the pre-A6 tree state is captured" to the TSPEC and says "Its failure mode is E-28" — but E-28's
specified behaviour ("the wave halts... A6 must never leave a tree it can neither repair nor
restore") describes a tree that has already been modified, whereas a capture failure must produce a
different observable: **no repair is proposed and none is applied**, the wave escalates, and the halt
is the wave's own with the wave agents' work untouched. The two are not interchangeable, and only the
second is safe.

The branch is real, not hypothetical: the shipped driver has a dedicated `snapshot-unavailable`
escalation naming which git verb failed and stating "no repair was proposed and none was applied"
(`orchestrate-dev.js:3436-3466`), reached from `captureTreeSnapshot`'s five failure returns
(`orchestrate-dev.js:12575-12613`). Add the row with its observable — that is FSPEC altitude; the
mechanism stays O-1's.

### F-05 (Medium) — AT-07-1's totality partition contradicts its own *Given*

AT-07-1's *Given* opens with "each **agent-proposable** boundary in §4 — E-5's scope rule, E-6's two
halves, and the rules the partition below names proposable". The partition then lists "**Not
proposable, by construction:** BR-1, BR-4, BR-9…BR-16". E-5 and E-6 *are* BR-4 — BR-4 is the rule
that defines them — so the same boundary is named on both sides. Since AT-07-1 leans on the partition
being total to discharge BR-16 ("discharged, not sampled"), a reader implementing from the partition
alone drops the two arms the *Given* names first. Move BR-4 to the proposable side, or restate the
*Given* to name the rule ids it means.

### F-06 (Low) — AT-03-7's *When* and *Then* disagree on the oracle unit

*When* reads "compared by set-equality"; *Then* reads "Ordered-sequence equality, never set
equality." Restate the *When* as an ordered-sequence comparison so the two halves name one unit.

### F-07 (Low) — AT-04-1's run count reads as a contradiction

AT-04-1 says "three positive assertions on that one run" and closes "Each conjunct gets its own run —
none exhibits two." The intent is evidently that AC-4.1's *conjuncts* are split across AT-04-1 /
AT-04-1a / AT-04-1b, while AT-04-1's own three assertions share one run. Say that, so the closing
sentence cannot be read as forbidding what the opening sentence requires.

### F-08 (Low) — AT-02-9 leaves the time budget unpinned

AT-02-9's *Given* pins `advisory.attemptBudget` but not `advisory.seamBudgetMinutes`, and its *Then*
asserts `escalated` with `budget-exhausted`. E-24 and E-25 share that literal — a point AT-02-7 makes
explicitly for its own companion — and the shipped predicate returns the same exhaustion for either
cause (`budgetExceeded`, `orchestrate-dev.js:2363-2365`). The dispatch count carries the real
discrimination, so the AT is not false-green, but pinning `seamBudgetMinutes` high in the *Given*
removes the ambiguity for free.

## Questions

## Positive Observations

## Recommendation
