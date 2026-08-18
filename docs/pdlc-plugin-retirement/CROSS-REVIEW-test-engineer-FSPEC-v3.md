# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.3)
**Date:** 2026-08-17
**Iteration:** 3
**Scope:** delta re-review of `588ff5a6..3f4e3cab` against
`CROSS-REVIEW-test-engineer-FSPEC-v2.md`. The round touched three places only (AT-1.2 clause 1,
AT-3.1's transcript conjunct, AT-3.3's hook half) plus the header's version and cross-review list.
Only those sections were scanned for new issues; every literal cited below was re-derived from the
tree at `3f4e3cab`, not from the document.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AT-3.1's repaired conjunct is countable but is stated over a set, and the invocation it counts is not set-distinguishable from two of itself.** "the session transcript's tool-invocation set for the skill **set-equals** {one engine CLI call}" — a set collapses duplicates, so a skill that invoked the engine CLI twice with the same argument vector yields the same one-element set and passes. The AC being discharged (AC-3.1, "exactly one engine CLI invocation") is a count claim, and the sentence's own justification says so ("discharged by counting"). State the measured quantity as the count — the transcript's tool-invocation *sequence* for the skill has length 1 and its single member is the engine CLI call — so a double-dispatch regression reds. Falsifiability is otherwise intact: the two positives beside it (non-empty dispatch record, field-faithful relay) are unaffected | §6.3 AT-3.1 |

## Resolution of round-2 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (High) — AT-1.2 clause 1 set-equality against an open set | **Resolved** | Clause 1 is now two-sided as recommended: the unfiltered output must be non-empty and **contain** the two mandatory members, with clause 2 unchanged as the upper bound ("that output minus A-1's frozen glob list is **empty**"). The document also states *why* equality was wrong rather than silently swapping the operator. The control is non-vacuous at HEAD: `docs/_decisions/DECISIONS-plugin-distribution.md` matches L-2's seven-term alternation **5** times, `docs/_constraints/pdlc-retirement-baseline.md` **23** times, so both mandatory members are in the unfiltered output today and the clause can pass on a correct sweep while still reding on a search that never ran |
| F-02 (Medium) — AT-3.1 unbounded negative | **Resolved (shape), see F-01** | "no other pipeline action" is gone; the conjunct is now a bounded comparison over the skill's tool invocations. What remains is the set-vs-count nit above, not the unfalsifiable claim |
| F-03 (Low) — AT-3.3 unnamed channels | **Resolved, and the transcription is exact** | All four channel claims re-derive from HEAD: `guard-harvest-before-delete.sh:64` `sys.stderr.write(...)` then `:71` `sys.exit(2)` (blocking payload, message names the blocked dirs and the missing LEARNINGS); `check-scope-field.sh:50` prints `{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":...}}` on stdout, `:51` `exit 0`; `check-req-size.sh:65`/`:74` the same shape on both the soft and hard branches, `:66`/`:75` `exit 0`; `nudge-consolidation.sh:85` `print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": msg}}))`, `:87` `sys.exit(0)`. The added warning sentence is arithmetically right too — exactly **three** hooks would fail a stderr/non-zero harness |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-3.3's nudge entry requires the consolidation nudge to fire and name the stale LEARNINGS count. The nudge is conditional on `nudge-consolidation.sh:25` `THRESHOLD = 5` (`:81` `if n >= THRESHOLD`), so the fixture must stage at least five unconsolidated LEARNINGS files. That is fixture construction and belongs in the TSPEC, not here — flagging only so the TSPEC pins the literal rather than discovering it, since a four-file fixture yields silence and an absence-shaped false green. |

## Positive Observations

- **The clause-1 repair kept the intent and fixed only the operator.** The positive control is still
  mandatory and still non-empty-by-construction; what changed is that its upper bound now lives in
  clause 2 where the closed enumeration actually is. Set-equality survives everywhere it was right
  (L-2's seven terms in clause 3, L-1, L-7, AT-1.4, AT-5.2's field sets) — the document did not
  over-correct by relaxing equality globally.
- **AT-3.3 now names channel, exit status and message text as three conjuncts of one assertion**,
  which is the difference between a hook test and a hook smoke test. The explicit "a harness that
  expects a warning on stderr with a non-zero exit fails three correct hooks" is the kind of line
  that stops a TSPEC author from picking the wrong harness in the first place.
- **No new literals were introduced this round, and no previously verified literal moved.** The
  delta is 22 insertions over 14 deletions confined to three ATs; the round-2 verification of the
  drift-state path, the four `sync-workflows.sh` exit branches and BR-DOC-1a's count words still
  stands unchanged.

## Recommendation

**Approved with minor changes** — no High findings.

The one blocking finding from round 2 is closed the way it was scoped, with the containment
direction now stated on the side where the set is open and equality retained where the enumeration
is closed. F-01 is a one-clause wording change (sequence-of-length-1 instead of set-equality) that
can land with the TSPEC rather than gating this phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
