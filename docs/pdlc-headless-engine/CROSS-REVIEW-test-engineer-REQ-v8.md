# Cross-Review: test-engineer — REQ (delta confirmation, round 6)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md (v0.10)
**Date:** 2026-08-11
**Iteration:** 8
**Scope:** Delta confirmation only, on the Phase-D erratum round 6 edit (commit `6ff9871a`) that
adds **C-11**. Not a re-review of the REQ; the v7 approval stands except where stated below.

## Delta reviewed

One file, two hunks, +31/−28:

| Hunk | Change |
|---|---|
| header + change notes (`:17-35`) | version 0.9 → 0.10; new change note; older notes compressed to hold the size budget |
| §4 constraints (`:284-298`) | **C-11 added** — the guard-executability host precondition, authorising DEC-ENG-03's startup refusal |

Re-derived, not taken on the change note's word: the AC id set is **26 before and 26 after**, and
the constraint id set gains exactly `C-11` and nothing else (C-1, C-1a, C-1b, C-2…C-10 all present,
unmoved). No goal, non-goal, threshold, risk or acceptance criterion text appears in the diff. The
change note's "No AC, goal, non-goal or other constraint changed" is accurate.

**Both erratum items resolve.**

1. *(se-author)* The interpreter precondition now has REQ authority. The prior `grep -in
   "python\|interpreter"` returning zero hits is no longer true of HEAD — C-11 states the
   precondition and, importantly, states it as a **change of premise rather than an inherited one**:
   "a host that previously ran pdlc with the guard silently inert no longer runs it at all, and that
   is the intended outcome." That is the sentence DEC-ENG-03 could not write for itself.
2. *(pm-review)* The constraint is grounded in the mechanism, not asserted. I re-read the cited
   source at HEAD: `guard-harvest-before-delete.sh:14-21` is exactly the `python3 python py` probe
   loop terminating in `[ -z "$PY_BIN" ] && exit 0`, and the file's own comment reads "If none is
   available, fail open (allow) rather than erroring." The citation is line-accurate and the
   fail-open characterisation is the script's own.

**Altitude is right and the hand-off is real.** C-11 routes the interpreter set, the observation
mechanism, the refusal string and the check ordering to FSPEC/TSPEC, and does not pin a rung number
— which is precisely what the DECISIONS hand-off row (`:839`) was blocked on. It states only
black-box observables the REQ owns: dispatch nothing, exit non-zero, name what was missing and the
remedy. Nothing here reaches into seam design or test-double placement.

**Nothing previously approved regressed.** NG-1 is explicitly preserved (the plugin path keeps the
script's fail-open posture; only the engine's *own* ability to run it becomes a precondition), so
C-11 does not contradict the non-goal it sits next to. C-5 is re-read, not rewritten. M-ENG-06's
AC-totality fact is untouched because no AC changed. AC-5.1's guard-parity oracle is unaffected —
it asserts refusal on a host where the guard *does* run, which C-11 now guarantees is the only kind
of host the engine accepts, strengthening rather than weakening that test's premise.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-04 | Medium | Local | C-11's **message** inherits a falsifiable oracle via C-8 → AC-6.4's set-equality (a registered catalogue id that no path emits fails), but its two **behavioural** conjuncts — "dispatches nothing" and "exits non-zero" — are pinned by no AC. C-10, which C-11 explicitly claims the same footing as, *does* have one: AC-3.2 asserts dispatch-count-zero and non-zero exit for the handshake refusal. As written, a suite could satisfy AC-6.4 by emitting the refusal id and still dispatch afterwards. Suggest FSPEC/TSPEC carry an AC-3.2-shaped criterion for the interpreter refusal (or a clause added to AC-3.2), so the refusal is proven by a positive assertion on all three conjuncts, not by message presence alone. | §4 C-11 vs AC-3.2 / AC-6.4 |
| F-05 | Low | Process | The REQ is now **695 lines / 54.7 KB** against the `check-req-size` budget of 700 lines / 60 KB. This round already had to compress older change notes to fit. The next targeted edit will trip the hook warning; the change-note block is the obvious candidate to roll into a single "0.6–0.9" line. | header, `:21-35` |

Neither finding blocks: F-04 is a coverage obligation that lands downstream, where the refusal's
mechanism is specified and where the te lens applies in full; F-05 is hygiene.

## Questions

| ID | Question |
|----|---------|
| — | None new in this round's scope. Q-01 from rounds 2–6 (AC-5.1 guard parity on the SDK transport) is unchanged and, if anything, better-founded now that the interpreter case is refused at startup rather than encountered mid-run. |

## Positive Observations

- **The precondition is stated as a cost, not smuggled as a detail.** The constraint names who
  loses — the host that ran with the guard inert — and asserts that outcome is intended. A reader
  hitting the refusal in six months finds the rationale in the constraint, not in a commit message.
- **The erratum fixed the authority without absorbing the mechanism.** The temptation on an item
  like this is to answer "which interpreters?" in the REQ. C-11 refuses, names FSPEC/TSPEC as
  owners, and leans on C-8 for the message. That keeps the REQ black-box and leaves the TSPEC review
  something it can actually judge.
- **It re-grounded rather than re-asserted.** The `:14-21` citation survives a HEAD check verbatim,
  including the comment quoted. Erratum rounds that touch claims about HEAD are exactly where stale
  citations get minted; this one didn't.

## Recommendation

**Approved with minor changes**

The delta resolves both errata and breaks nothing previously approved: the AC set is byte-stable at
26, the constraint set gains only C-11, the guard citation holds at HEAD, and NG-1 is preserved
explicitly. The v7 approval of the REQ stands. F-04 is carried forward as a Medium coverage
obligation for FSPEC/TSPEC review — where C-11's refusal mechanism is specified — and F-05 as a
Low process note for whoever makes the next targeted edit.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:9176adf0e0f33b085bf238dc181741c7991315474d864c76673bb7e20c970957
REVIEWED-COMMIT: 6ff9871a
