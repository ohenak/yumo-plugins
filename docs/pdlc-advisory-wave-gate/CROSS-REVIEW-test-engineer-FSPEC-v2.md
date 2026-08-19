# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.1)
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** Testing lens only — testability, edge-case completeness, oracle falsifiability, acceptance-test implementability. Delta re-review: resolution of v1 findings, plus new issues in changed sections only. Unchanged sections not re-litigated.

## Delta scope

Reviewed `4f9325ea..HEAD` on the FSPEC (97 insertions, 184 deletions across nine commits). Changed: version row + v1.1 revision note, §3.2 (step 3b), §3.3 (row 3b, step 7 red branch), §4 (BR-4…BR-16 oracle statements, rationale compressed), §5 (E-30, E-33 added), §6 (AT-01-6, AT-02-8, AT-02-9, AT-03-8, AT-05-5, AT-06-6, AT-07-2b new; AT-01-3, AT-01-5, AT-03-2, AT-03-5, AT-03-7, AT-04-1, AT-04-3, AT-04-5, AT-05-1, AT-06-1, AT-07-1, AT-07-2, AT-07-3, AT-07-5, AT-02-7 restated).

The net deletion is rationale compression between §4 and §5/§6, not oracle loss — I checked each compressed rule against the AT that depends on it. In two cases (BR-5 ordering, BR-9 "observably identical") compression **moved the oracle up into §4**, which is where I asked for it.

### v1 finding resolution

| v1 ID | Sev | Status | Evidence |
|-------|-----|--------|----------|
| F-01 | High | **Resolved** | AT-07-1 now enumerates agent-proposable boundaries, driven by a stub agent double, asserting shipped refusal reason + unchanged tree. "Prompted to violate" and "no reliance on prompt" both gone. (See F-01 below for a residual on the enumeration's closure.) |
| F-02 | High | **Resolved** | E-11→AT-02-8, E-28→AT-05-5, E-30→AT-06-6, E-32→AT-01-6. E-02/E-03/E-06 are discharged by AT-01-5's absent-prerequisite population rather than new ATs — the right call: they carry no new observable. |
| F-03 | High | **Resolved** | AT-07-2b added: set-equality over the config key set against a spec-transcribed literal, `waveBudgetPerRun` default `1` read back from the module, parse-and-default fixtures in the same test. Direction of transcription stated explicitly. AT-07-2 converted from narration to assertion. |
| F-04 | High | **Resolved** | AT-07-3 now asserts two dispatch counts on one run (green wave `0` + post-gate commit reached; red wave `≥1`). Timing assertion dropped with a stated reason. |
| F-05 | High | **Resolved** | AT-04-1 now carries three positive conjuncts (disposition `escalated`, halt reason equals AT-05-3's literal, resolved-wave count `0`) and explicitly disclaims the existential negative. |
| F-06 | Med | **Resolved** | Step 3b added to §3.2 and §3.3; step 8b's red branch returns to 3b, not 3. AT-02-9 counts dispatches exactly (`1`⇒1, `2`⇒2) and rejects a "no more than" oracle by name. |
| F-07 | Med | **Resolved** | BR-6 (f) now names PLAN, its task table, and the manifest; AT-03-5 enumerates all ten operations and adds set-equality over prohibition ids `(f)`…`(i)`. |
| F-08 | Med | **Resolved** | AT-03-8 added: ordered-sequence equality over exclusion clause ids, with the reordering failure mode stated. BR-5 now carries the same claim. |
| F-09 | Med | **Resolved** | BR-9 names the content-level oracle (path-to-content-hash map over tracked and untracked files, generated outputs included); AT-05-1 inherits it and rules out `git status` by name. |
| F-10 | Med | **Resolved** | AT-07-5 is now a mechanical member-for-member equality of tool grants, transport and environment against a shipped seam's dispatch in the same run. |
| F-11 | Med | **Resolved** | AT-04-5 gained the companion case with later-task paths **outside** every post-wave pathspec, explicitly required to be red before the fix. |
| F-12 | Low | **Resolved** | AT-01-3 now asserts halt reason string + queue row, with NFR-2's named-artifacts caveat. |
| F-13 | Low | **Resolved** | AT-02-8 covers E-19 with positive conjuncts. |
| F-14 | Low | **Resolved** | AT-06-1 states containment is deliberate and names where the closed assertion lives. |

### Grounding checks run this round

Claims the new ATs rest on, verified at HEAD rather than taken from the document:

- `ADVISORY_REFUSAL_REASONS` is exactly eight members in the order AT-03-7 asserts — `pdlc/workflows/orchestrate-dev.js:2297-2306`.
- `ADVISORY_EXCLUSIONS` is `["X-a","X-e","X-d","X-b","X-c"]` and the comment at `:2311-2313` confirms `classifyEnvelope` iterates it in order, so AT-03-8's ordered-sequence oracle is the correct unit, not set equality.
- `ADVISORY_SEAMS` is five members (`:1947`) and `ENVELOPE_DEFAULTS` four (`:1938`), so AT-01-1's six-row and AT-03-1's six-member assertions are genuine deltas, not restatements.
- `ADVISORY_DEFAULTS` (`:1940-1945`) carries `enabled`, `attemptBudget`, `seamBudgetMinutes`, `envelope` — AT-07-2b's "shipped keys plus `waveBudgetPerRun`" is accurate.
- The un-skip guard AT-05-4 relies on does run after the gate and before the commits, and halts on a skipped block owed by a completed task — `pdlc/workflows/orchestrate-dev.js:14374-14391`. AT-05-4's premise holds.
- `resolveAdvisoryRung` is exported (`:2111`), so AT-07-4's "tier's exported rung resolver" names a real surface.
- M-WG-12's commit-scope gap that BR-12 and AT-04-5's companion case turn on is as cited in `docs/_constraints/pdlc-wave-gate-baseline.md`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AT-07-1's boundary partition is not closed, so the test cannot be shown to discharge BR-16.** BR-16 claims *every* boundary in §4 is script-enforced, and AT-07-1 is its only test. The restatement enumerates five agent-proposable boundaries (E-5's scope rule, E-6's two halves, BR-5's exclusions, each BR-6 prohibition, BR-8's no-commit rule) and excludes three by construction (BR-13, BR-14, BR-16). That accounts for eight of sixteen rules. BR-1, BR-2, BR-3, BR-7, BR-9, BR-10, BR-11, BR-12 and BR-15 are neither listed nor excluded — and at least BR-7 is plainly agent-proposable, since a verdict asserting the wave is fixed *is* an agent proposal against it (AT-04-1 covers that case, but AT-07-1 doesn't say so). As written a reader cannot tell whether an unlisted rule was judged not-proposable or simply missed, which is the same closure problem the v1 version had in a milder form. Make the partition total: one line per BR-1…BR-16 assigning each to *proposable* (with its covering AT) or *not-proposable by construction* (with the reason). Cross-references to AT-04-1, AT-04-3 and AT-03-5 will discharge most of them without new tests. | §6.7 AT-07-1, BR-16, NFR-1 |
| F-02 | Medium | Local | **AT-06-6's "the failure to log is surfaced to the operator" names no surface, so that conjunct is not yet assertable.** The other three conjuncts are sharp (disposition still `escalated`, halt reason equals AT-05-3's literal, never upgraded to `resolved`), and the AT-06-2 contrast is exactly right. But this document is careful about surfaces everywhere else — AT-01-5 says "the run report's whole notice surface" and E-04 makes the named surface part of the observable. Here a test author must choose between the run report, the emitted notice stream and the halt report, and an oracle over one passes while an operator reading the other sees nothing. E-30's wording ("the operator is still told") has the same gap. Name the carrier once in E-30 and let AT-06-6 inherit it, as E-04/AT-01-5 already do. | §6.6 AT-06-6, §5.5 E-30 |
| F-03 | Low | Local | **AT-04-3's "no commit is attributable to A6" adds an unanchored conjunct beside a mechanical one.** The writer-identity set-equality is the real oracle and it is well stated — including the welcome clarification that pathspec *scope* is deliberately not asserted, since BR-12/O-8 may widen it. But attribution has no stated decision procedure, and it is also redundant: if the committing-writer identity set equals the shipped two, no third writer exists and A6 committed nothing. Either drop the clause or restate it as the stated consequence of the set-equality rather than a separate assertion. | §6.4 AT-04-3, BR-8 |
| F-04 | Low | Local | **E-33 is filed out of numeric order.** It sits between E-27 and E-28 in the §5 table rather than after E-32. In a table whose rows are cited by id from §6 and §4, out-of-order insertion makes a reader scanning for coverage gaps miss it — I nearly recorded it absent. Move it to the end of the table. | §5.4 E-33 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-07-1 lists BR-6's prohibitions and BR-8's no-commit rule as separate enumerated boundaries, but BR-6 (h) *is* "commit, push, tag". Is the BR-8 entry meant to add something beyond (h) — the green-gate precondition, perhaps — or is it duplicate coverage? If duplicate, the count of cases a test author must write is ambiguous. |
| Q-02 | My v1 Q-01 (whether a classification field of the wrong *type* reads as malformed under E-07 or out-of-set under E-08) is not addressed in the v1.1 delta. E-08 now says "absent, or carries a value outside the four-member set"; a value of type number or array is arguably both. E-09's tie-break resolves it only if the verdict is independently malformed. Still worth pinning before the PROPERTIES author writes the E-08 table. |

## Positive Observations

- **The revision fixed the oracles without adding behaviour, which is what I asked for.** Every one of the five High findings was closed by rewriting an assertion, not by inventing a rule or re-architecting §6. AT-04-1 and AT-07-3 in particular went from unfalsifiable negatives to counted, two-armed oracles on a single run — AT-07-3's "two counts on one run distinguish *nothing ran* from *the path was never reached*" is exactly the discrimination the v1 version lacked.
- **AT-01-6 was built as a deliberate pair with AT-01-4, and the document says so.** Key-**present**-with-all-zero-rows against key-**absent**, named as making "present-and-undefined fail on both sides". That is a test author reasoning about the failure mode a single-sided assertion would miss, not just adding a row for E-32.
- **AT-02-9 rejects a weaker oracle by name.** "Counted, never bounded: a 'no more than' oracle passes an implementation that dispatches none." This document keeps doing this — AT-04-2 rules out set equality, AT-03-8 rules out set equality, AT-05-1 rules out `git status`, AT-07-2b pins the direction of transcription. Naming the wrong oracle beside the right one is the single most useful thing a spec can do for a test author, and it is now consistent across §6.
- **Compression moved oracles up rather than dropping them.** BR-5's ordered-sequence claim and BR-9's content-hash oracle now live in §4, so every AT that touches them inherits one definition instead of restating it. A net −87-line revision that *strengthens* the assertions is unusual; I checked for oracle loss specifically and found none.
- **AT-07-2b got the transcription direction right and said it out loud.** "The literal is transcribed from the spec and the value is read back from the module, never the reverse" — that is the implementation-echo failure mode named and closed in one sentence.
- **§7.1's obligations table now pairs each TSPEC obligation with what the FSPEC does and does not state.** The "FSPEC states" column means the TSPEC author inherits the observable without having to re-derive which parts were deliberately left open.

## Recommendation

**Approved with minor changes**

No High findings. All five v1 Highs are resolved, all six Mediums and all three Lows are resolved, and I verified the load-bearing claims against HEAD rather than against the document. Nothing in the revision broke a section that was previously sound — the compression pass was the main risk and it held.

The two Mediums are worth taking, but neither blocks: F-01 is one line per business rule turning AT-07-1's enumeration into a total partition, and F-02 is naming a carrier in E-30 that AT-06-6 then inherits. F-03 and F-04 are a sentence and a row move.

§6 is now a set of tests an engineer can implement without asking a clarifying question, which is the bar this phase had to clear.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
