# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/FSPEC-pdlc-merge-phase.md` (v1.0)
**Date:** 2026-08-02
**Iteration:** 1
**Scope:** Testability of the FSPEC against REQ v1.1 (approved). Testing lens only — no product,
architecture or style findings. Findings are stated as observable-outcome defects, not as seam or
fixture design (that is TSPEC/PROPERTIES territory per the altitude rule).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **Two §11 rows claim the same run, with different escalation assertions.** §2.2 row 3 must observe `O1.state` to decide "already `MERGED`", and it sits *before* the guard (row 4). But §2.3 places the PR-open check at 5a/5b, *after* the guard, and §3.2 says only that an unknown `O1.state` resolves `refused` — it never says *where*. So a run with an unparseable `state` **and** a guard-matching diff satisfies both §11 row 5/4 (`refused`, escalation **yes**) and row 8 (`refused`, escalation **no**). A test cannot assert the notices channel for that input, and §11's "exhaustive and exclusive — exactly one row applies" is false. **Fix:** state in §2.2 that row 3 consumes `O1` and what an `unknown` `O1` at that point resolves to (value *and* escalation), or state that row 3 treats non-`MERGED`-including-unknown as "not resolved here" and the entire state decision belongs to 5b. Either is testable; the document must pick one. | §2.2 r3, §2.3 5b, §3.2, §11 rows 4/5/8 |
| F-02 | High | Local | **§11 row 3 writes the queue with an Evidence cell the spec never defines.** Row 3 (PR already `MERGED`) reports `merged` with **no `mergeSha`** (§9.1: `null`; §2.5: "no `mergeSha` it did not observe"), yet the write-back still runs and §7.3 fixes the Evidence cell as `{shortSha} #{prNumber}`. A row still at `awaiting-merge` on an already-merged PR must therefore be written to `done` with an undefined sixth cell. AT-M2 only covers the already-`done`-with-identical-evidence case, so the gap is untested as well as unspecified. **Fix:** state the Evidence content for row 3 — read `mergeCommit.oid` back via `O6`, or a defined placeholder (e.g. `— #{prNumber}`) — and add the "already merged, row still `awaiting-merge`" case to §12. This is the recovery path AC-5.2/AC-5.8 exist for, so it is the one row-3 case that actually mutates the file. | §2.2 r3, §2.5, §7.3, §7.4, §9.1, §11 r3, AT-M2 |
| F-03 | Medium | Local | **§11 rows 18–21 are not mutually exclusive, contradicting the table's own exclusivity claim.** A run can merge (18), fail the remote branch deletion (19), fail the queue write (20) *and* fail the tree update (21) simultaneously; §9.3 already anticipates "one or more lines". The header's "exactly one row applies to any run" makes the expected notices set for a multi-failure input undefined, which is precisely the assertion a parameterised suite needs. **Fix:** one sentence declaring rows 19–21 **composable post-merge annotations** over row 18 (all reporting `merged`) and that escalation lines accumulate in a stated order. | §11 header, rows 18–21, §9.3 |
| F-04 | Medium | Local | **Row 20's trigger has no domain against the shipped disposition catalogue.** The queue recording channel §7.4 reuses today's closed catalogue `"halted" \| "halted (uncommitted)" \| "none" \| "error"` (`orchestrate-queue.js:871`). §11 row 20 says "queue write failed → escalation **yes**", but §7.4 describes three distinct non-happy outcomes — `none` (no `QUEUE.md`; AC-5.4 says *no error*), `error` (row absent), and written-but-uncommitted (git refusal, "never downgrades") — and maps none of them to a §11 row. A test cannot decide whether a git refusal should emit `MERGE ESCALATION: merged … but the queue row … was not updated`. **Fix:** map every disposition member to a §11 row and to escalate-yes/no. (Note this interacts with obligation O-M1, which changes the vocabulary — the mapping should be stated over the *new* members.) | §7.4, §9.3, §11 rows 18/20 |
| F-05 | Medium | Local | **AT-M3's control arm is an absence-only oracle.** "the outcomes are opposite — `refused` …, and **not-refused**" passes for any non-`refused` value, including `skipped` (config `off`), `deferred` (any later precondition) or an exception path — so it would stay green with the guard deleted *and* an unrelated precondition broken. That defeats the very falsifiability AC-3.5 asks for. **Fix:** pin the positive terminal value for the control list (e.g. the control run proceeds past §2.2 row 4 and resolves at a named row of §11), and pin the same positive value for each of the three near-miss paths. | §12 AT-M3, §4.2, REQ AC-3.5 |
| F-06 | Medium | Local | **Re-read count, reason-line `N`, and the retry settings' accepted domain are all unpinned.** §3.3 says "up to `mergeableRetries` **additional** times", so total `O1` observations are `1 + retries` = 4 by default — but the reason line is "mergeability still UNKNOWN after **N** re-reads" without saying whether `N` is the retry count (3) or the observation count (4); both are string assertions in §11 row 13. Separately, §10.3 classifies only "unrecognised value or wrong type", and never states the accepted domain for `mergeableRetries` / `mergeableRetryDelay` — so it is undefined whether `0`, a negative, or a non-integer is honoured or silently reset to the 10 s default. A suite that sets the delay to `0` to stay deterministic cannot know whether it is testing its own value or the default. **Fix:** state the total observation count, define `N`, and state the accepted domain (e.g. integers ≥ 0 honoured; anything else takes the default). | §3.3, §10.3, §11 r13 |
| F-07 | Low | Local | **`shortSha` is not derived anywhere.** AT-M1 asserts the Evidence cell reads exactly `{shortSha} #{prNumber}` while §6.2 records the **full** oid. Pin the transformation (e.g. "the first 7 characters of the full oid") so the assertion is writable without guessing. | §6.2, §7.3, AT-M1 |
| F-08 | Low | Local | **A 22nd observable lives outside the exhaustive table.** §9.1's "a run that halts before Phase MERGE reports `mergeStatus: skipped`" is a reportable outcome §11 does not carry. Add it as a row (queue: no, escalation: no) and state whether §9.4's merge-deferred note is emitted (it should not be — the status is `skipped`, not `deferred`). | §9.1, §9.4, §11 |
| F-09 | Low | Local | **AT-M5 is environment-dependent as written.** "the next `orchestrate-queue` invocation selects that dependent" runs a driver whose first act — before `QUEUE.md` is read at all — is the distribution drift gate, which can return `outcome: "blocked"` and select nothing. State the gate precondition the scenario assumes (`distribution.checkEnabled: false`, or a clean drift-state record) so both halves of AC-6.3 are determinate rather than dependent on the tree the suite happens to run in. | §9.5, AT-M5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On §11 row 3 with the queue row still `awaiting-merge`, is the §9.4 merge-deferred note suppressed and is any notice emitted for the idempotent write? §7.4 states the byte-identical case emits nothing, but not the mutating case. |
| Q-02 | §10.3 says a `merge` section "present but unparseable" is reported as a plain note. §2.2 states row 1 resolves **before** the config is read at all — so with `PHASE_MERGE_ENABLED` false, is that note suppressed? A test asserting the notices channel for row 1 needs the answer. |

## Positive Observations

- §3.2's **single** fail-closed parse rule, tabulated per surface with its recognised value set and its
  `unknown` resolution, is exactly what makes "feed it garbage" a writable test per observation point.
  The two carve-outs called out for the TSPEC (literal `mergeable: UNKNOWN`; an empty `O5` list being
  valid, not unretrievable) are the two a naive implementation would get wrong.
- §4.2's near-miss table (`pdlc/workflows-notes/`, `docs/pdlc/workflows/`, `PDLC/Workflows/`) is a
  ready-made parameterised case list, and stating the guard as a pure function of (list, path set) is
  the right shape for AC-3.5 — F-05 is about the assertion, not the mechanism.
- §2.3's explicitly **positional** tie-break, with two worked examples that cut in opposite directions,
  removes the single largest source of nondeterminism a precondition set like this usually carries.
- §11's 21 rows with four assertable columns plus a reason line, declared as *the* parameterised suite,
  is a far better acceptance artifact than AT-M1…AT-M5 alone would be; §12 correctly positions the five
  ATs as covering what the table cannot express, which answers the "17 rows covered?" question in full.
- §7.5 recording the `RLH-AT-32-orch` supersession as a *decision with a re-expressed assertion* — rather
  than a test to delete — is the right instinct, and O-M6 makes it a reviewed task instead of a red test
  discovered later.

## Recommendation

**Needs revision**

F-01 and F-02 are contradictory/undefined observables: one input maps to two §11 rows with different
escalation assertions, and one row prescribes a queue write whose written bytes are unspecified.
F-03…F-06 are each closable with one or two sentences and no new scope. F-07…F-09 are advisory.
No finding asks for seam, fixture or test-level detail — those remain TSPEC-owned.

## Verdict

VERDICT: REVISE
{"high": 2, "medium": 4, "low": 3}
