# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 7
**Scope:** Local (Scope tags per finding below)
**Delta base:** `0681852` (the tree v6 reviewed) → HEAD

Delta re-review. v6's findings F-38…F-41 are dispositioned in §Prior findings; new findings are
numbered F-42 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `0681852` were read for new issues; unchanged sections approved in v1–v6 were not revisited.

## Prior findings

All four v6 findings are dispositioned below. Each was checked against the code the revision cites,
not against its prose. Both Mediums are resolved on the mechanism, not by softening the claim.

| v6 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-38 | Medium | **Resolved** | AC-5.1 re-keys `failure-mode-id` on the promotion's `phase` and its target `artifact`, "and from **nothing else** — not from the pass, not from its consumed set, and **not** from `symptom`" (`:362-364`), with `symptom` demoted in the same sentence to "one line, human-readable and explicitly **non-keying**". That is the first of the two fixes I named, taken in full. The justifying paragraph states the argument I made rather than asserting the conclusion — "Determinism of the derivation is not stability of its inputs … `symptom` is a line the pass's own model writes under no vocabulary, so two passes recognising one failure mode from different corpora would word it differently and slug differently" (`:368-372`) — and ties it to the case NFR-4 exists for (AC-3.8b abandonment, a later pass with a larger consumed set). The oracle is now writable: two passes, same `phase` + `artifact`, different `symptom` text, assert equal ids and assert `duplicate-suppressed`. Under v6's wording that fixture could not be built at all. One residual in the *granularity* dimension survives as F-42 (Low) — it is a different defect from the one I filed, and it is fixturable, which the old one was not. |
| F-39 | Medium | **Resolved — and the stronger of the two fixes I offered was taken** | The marker moves out of the log entirely: AC-1.3 now puts it in `docs/_decisions/.consolidation-lock`, "deliberately **not** in `.consolidation-log.md`, because taking and releasing it are in-place rewrites of a whole small file and every write to the *log* must stay an append" (`:167-171`). The new "**Why no lock is needed: the write-granularity obligation**" paragraph (`:191-196`) then states the invariant positively and closes the two writes that would have broken it: the marker (moved out) and the winner's `<!-- pdlc:consumed -->` pair, which is "emitted **complete, in one append**, its consumed set being fixed at step 1 of the tick order before any promotion work". A whole-file read-modify-write of the log is called out as "**forbidden**, not merely unnecessary: it is the one shape that loses a concurrent append". With that, AC-1.3's race fixture has a deterministic oracle — the loser's `refused` row and the winner's records interleave in either order and both survive — instead of the flaky one I flagged. The claim is grounded in a shipped capability I re-verified: `rtAppendFile` (`pdlc/workflows/runtime-adapter.js:863`) dispatches `cat >> "${path}"` (`:883`) and is explicitly not a read-modify-write (`:852-857`); it is plumbed as a real injected seam `_appendFile`, not a latent capability — `orchestrate-dev.js:2684` / `:2809` consume it and `orchestrate-queue.js:801` / `:874` thread it, with `defaultAppendFile` as the default (`orchestrate-dev.js:5697`). |
| F-40 | Low | **Resolved** | AC-5.1's new "**Uniqueness, scoped.**" paragraph (`:374-379`) removes the collision I flagged by removing the premise: within one pass, two promotions deriving the same id "name the same `phase` and `artifact`, are one failure mode, and are recorded once — the pass never mints a suffixed variant, which would break derivation purity and with it NFR-4", and the cost is stated out loud ("the accepted cost of keying on `artifact` rather than prose"). Cross-pass repetition is then made deliberate rather than accidental, with the referent disambiguated by key arity: log **records** are keyed `(failure-mode-id, passId)`, a **promotion** on the id alone, and every downstream contract is restated in promotion terms — AC-5.2 one row per id, AC-5.3 one streak per id over all its records, AC-5.4 retires an id. That last sentence is what makes AC-5.2's set-equality obligation unambiguous over a corpus containing a re-proposal; it also survived into AC-5.2 itself (`:414-415`). |
| F-41 | Low/Process | **Improved, still open — refiled as F-44** | The round bought headroom rather than spending it: at HEAD the file is 663 lines / 61,371 bytes against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41`, `:40`), so 37 lines and 69 bytes of margin, up from 2 lines and 8 bytes. Two of the five commits this round were pure compression (`0377214`). The recurrence I flagged is unchanged in kind — a fourth consecutive round paid for edit budget with reflow — so it is refiled at the same severity rather than closed. |

## Findings

No High or Medium finding this round. All three are corrections to material this round introduced,
and each is fixable in one clause. None contests a claim about code at HEAD: every `file:line` in
the changed text resolves (see §Positive Observations).

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-42 | Low | Local | **AC-5.1 permits `artifact` to be "a path or glob", so id stability survives the `symptom` dimension but not the granularity one — and the REQ claims it as achieved.** `artifact` is defined as "a path or glob the symptom appears in" (`:364`), and the justifying paragraph concludes "Keying on `phase` + `artifact` makes 'a later pass re-deriving the same failure mode yields the same id' **true rather than hoped for**" (`:371-372`). It is not yet true: nothing constrains *which* description of the location the pass writes. Two passes recognising one failure mode may name `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/*.js`, or `pdlc/workflows/` — all three satisfy AC-5.1 as written, all three slug differently, and NFR-4's duplicate suppression misses. The paragraph's own defence does not cover this: it argues that `artifact` "is *file* text", which is true of the value's referent but not of the choice between referents, and the "accepted cost" clause at `:375-376` addresses only the *merge* direction (two distinct modes collapsing to one id), never the *split* direction (one mode yielding two ids), which is the direction NFR-4 depends on. Filed **Low**, not Medium, and the difference is a testing one: unlike v6's `symptom`, this input is fixturable — a test can pin both passes to one literal path and assert equal ids — so the oracle NFR-4 needs now exists, and what remains is a normalisation rule (canonical repository path, no glob, for the keying input), which §5a routes to FSPEC. What belongs here is the overclaim: either add "canonical repository path, never a glob" to the keying input, or downgrade `:371-372` to name granularity normalisation as FSPEC's obligation. | AC-5.1 ("Why those inputs"), NFR-4 |
| F-43 | Low | Local | **AC-3.4's "written back into" the log is not reconciled with AC-7.2's "exactly one report … one channel" now that AC-1.3 forbids in-place log edits.** AC-3.4 says the PR URL "is written back into `docs/_decisions/.consolidation-log.md`" (`:260-261`); AC-7.2 says "exactly one report is emitted, on one channel: the pass's terminal report, written as the pass's row" and that the row "carries the PR URL **when and only when** a PR was opened" (`:492-494`). Under v6 this was a harmless overlap. Under AC-1.3's new write-granularity obligation it is a live question, because "written back" is the phrasing of an in-place update and in-place updates of the log are now forbidden — so the reading that would have been most natural is the one the REQ just outlawed. Both surviving readings are append-shaped and both are testable, but they demand different oracles: if the URL is a field of the single terminal row, the test asserts one appended record containing the URL; if it is a second appended record, the test asserts two records and AC-7.2's "exactly one report" needs the qualifier that it counts reports, not appends. A test author must currently guess. One clause in AC-3.4 ("carried in the pass's terminal row, appended once — AC-7.2") settles it. | AC-3.4, AC-7.2, AC-1.3 (write-granularity obligation) |
| F-44 | Low | Process | **Refile of v6 F-41: the REQ still absorbs each round by reflowing prose, now with 37 lines / 69 bytes of margin.** At HEAD 663 lines / 61,371 bytes against `LINE_LIMIT=700` and `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41`, `:40`); `0377214` was a dedicated compression commit, the fourth consecutive round to spend edit budget that way. The margin improved and the compression again cost nothing checkable (verified below), so this is not a defect in the document's content — the durable signal is the recurrence, which pm-author's REQ Size Budget answers with phasing and for which REQ-CONS-05/06 remains the natural seam. Carried as `Process` for harvest, not as something this round must fix. | Whole document; `pdlc/hooks/scripts/check-req-size.sh:40-41` |

## Questions

No open questions. v6 raised none, and neither of this round's substantive items is a
clarification — F-42 is a claim to narrow and F-43 is a choice between two readings the REQ must
make rather than explain.

## Positive Observations

- Both v6 Mediums were closed by changing the **mechanism**, not the wording. F-38 removed the
  unstable input from the key rather than weakening NFR-4's promise; F-39 moved the marker out of
  the log rather than accepting the loss window. In each case the option I offered as the weaker
  alternative — "state the accepted consequence" — was available and was not taken. A document that
  declines its own escape hatch twice in one round is converging on the requirement, not on the
  reviewer.
- The F-39 fix is stated as a **positive obligation with its violating shape named**, which is the
  form a test can be written against: "Every write to `.consolidation-log.md`, by any pass, is a
  single **append of one whole record at end of file**. A whole-file read-modify-write of the log is
  **forbidden**, not merely unnecessary: it is the one shape that loses a concurrent append"
  (`:191-193`). It then discharges the obligation for both writes that would have breached it
  instead of leaving the invariant asserted. That is the difference between an invariant and a hope.
- The obligation is redeemable at HEAD, which I checked rather than assumed. The append channel is
  not a latent runtime capability but a **wired dependency-injection seam**: `rtAppendFile`
  (`runtime-adapter.js:863`, `cat >> "${path}"` at `:883`, explicitly not a read-modify-write per
  `:852-857`) reaches modules as `_appendFile`, consumed by `appendAdvisoryEntry`
  (`orchestrate-dev.js:2684`) and `appendEscalationEntry` (`:2809`), defaulted at `:5697`, and
  threaded through `orchestrate-queue.js:801`/`:874`. A new workflow can take the same seam on the
  same terms.
- AC-5.1's uniqueness paragraph fixes an ambiguity I had not filed. By keying **records** on
  `(failure-mode-id, passId)` and **promotions** on the id alone, then restating each downstream
  contract in promotion terms (`:377-379`), it makes AC-5.2's set-equality obligation — "exactly one
  row per **distinct `failure-mode-id`**" (`:414`) — decidable over a corpus containing a
  re-proposal. Without that arity split, a repeated id would have made the row count ambiguous and
  the set-equality check unfalsifiable in exactly the case NFR-4 sanctions.
- The REQ-CONS-01 exempt-record clause shrank from two members to one **as a consequence** of the
  F-39 fix rather than being separately edited: with the marker in its own file, "The AC-1.3 marker
  is **not** a second exempt record: it lives in its own file, never in this log" (`:112-113`). The
  ripple was carried in the same revision, which is the tell that the decision was applied rather
  than appended.
- The first-run assertion is now inline and correct. `:113-115` names the three `docs/completed/`
  directories and the split of the 5 LEARNINGS; I verified all of it: the corpus is exactly 5 files
  (2 at depth 1, 3 under `docs/completed/pdlc-merge-phase/`, `…/pdlc-review-loop-hardening/`,
  `…/pdlc-workflow-distribution/`), and `docs/_decisions/.consolidation-log.md` names
  `LEARNINGS-orchestrate-dev-workflow.md` and `LEARNINGS-pdlc-workflow-distribution.md` in its Pass
  1 table (`:16-17`) and none of the other three anywhere. So the legacy-region predicate yields
  exactly the 3 the REQ claims, 3 is below the default `volumeThreshold` of 5
  (`nudge-consolidation.sh:25`), and the first tick does reach the cadence test as stated. That is a
  first-run fixture transcribable without touching the repo.
- Compression again cost nothing checkable. I re-verified every citation in text this round changed
  or introduced: `guardVerdict` (`orchestrate-dev.js:732`), `commitPaths` (`:8669`) with its
  pathspec-less `git commit -m` (`:8690`) and `gitWithLockRetry` add (`:8670`), the POSTMORTEM name
  builder (`:5429`), `advisorySummaryRows` (`:2708`), `commitQueueRow`
  (`orchestrate-queue.js:1576`), `commitAdvisoryRecord` (`:1615`), `QUEUE.md:11` and `:279`,
  `consolidate-learnings/SKILL.md:35`/`:43`/`:49`/`:54`, `harvest-learnings/SKILL.md:77`,
  `nudge-consolidation.sh:25`/`:28`/`:32`/`:41`/`:47-48`, `check-req-size.sh:40-41`, and DC-09 at
  `docs/_constraints/DOMAIN-CONSTRAINTS.md:245`. All resolve to what the REQ attributes to them.
- One risk the new `.consolidation-lock` file could have carried, checked and cleared: it is an
  untracked file under `docs/_decisions/`, and `coveredViolations` walks the whole tree skipping
  only `.git/` and `node_modules/` (`pdlc/workflows/lib/document-oracles.mjs:77-95`) with no
  gitignore consultation, so an untracked file there is scanned. `docs/_decisions/` has no
  `REQ-_decisions.md` sibling, so exemption (ii) (`:105-113`) does not apply. Its content is
  `IN-PROGRESS: {passId} {ISO-8601}`, which matches none of the five `COVERED_PATTERNS` (`:69-75`),
  so a pass in flight cannot redden the document oracle. No finding — recorded because the
  reasoning is not visible from the REQ and the next reader of AC-1.3 should not have to redo it.

## Recommendation

## Verdict
