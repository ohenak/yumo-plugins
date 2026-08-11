# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.6)
**Date:** 2026-08-11
**Iteration:** 7 (erratum delta confirmation — not a full re-review)

**Scope:** the Phase-D erratum edit only — `24b99ebb..HEAD` on
`docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md`, one item: FSPEC carried nothing of REQ
v0.10's **C-11** (guard-executability host precondition), leaving the interpreter set, the
observation method, the refusal string and the startup-check ordering unspecified. One question
answered: does the delta resolve that item without disturbing anything previously approved?
Everything outside the diff was re-checked for disturbance only, never re-argued.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | Rung 4a's acceptance test sits in the wrong table. §4.6 is the ladder's AT table (AT-ENG-06…12, one row per rung behaviour), and every other rung's proof lives there; **AT-ENG-11a** was appended to §9's table instead (`FSPEC:967`, after AT-ENG-44), where the id sorts nowhere near its neighbours. It is reachable — §4.5's EC rows and the BR-index point at it — but a TSPEC or PLAN author deriving ladder test tasks from §4.6 alone sees rungs 0–5 with no 4a and no AT for EC-START-10/11, and drops the only test for a fail-closed refusal. Move the row to §4.6 (its content needs no change), or add a §4.6 pointer row naming AT-ENG-11a and its home | §4.6 (`:409-419`), §9.4 (`:967`) |
| F-02 | Medium | Local | The set-fidelity clause has no oracle. BR-GUARD-6 pins the engine's candidate set to *the script's own*, and makes the tracking obligation explicit — "if the script's set changes, this one follows it" — but no AT falsifies drift. AT-ENG-11a exercises the engine's set (`python3`, `python`, `py`) as a literal, so it stays green forever after the shipped script's loop changes, which is exactly the failure the clause anticipates: a precondition refusing hosts the guard would have worked on. Falsifiable oracle available cheaply — read `guard-harvest-before-delete.sh`'s `for cand in …` line at test time and assert **set equality** (both directions, ordered) with the engine's constant; mutate the script's list in a fixture and expect RED. Best owned by TSPEC, so recording it here rather than blocking | §9.1 BR-GUARD-6 first bullet (`:915-919`) |
| F-03 | Low | Local | AT-ENG-06's rung enumeration was not swept with the insert. It asserts a rung-0 refusal leaves "rungs 1–5" reported skipped-with-reason (`FSPEC:410`); with 4a inserted, "1–5" as a written range now silently decides whether 4a must appear in that skipped list. BR-START-2 clearly intends it to, and the change note's "rung numbers 0–5 are unchanged" is about numbering, not about this enumeration. One-word fix whenever §4.6 is next opened: "rungs 1–5 including 4a" | §4.6 AT-ENG-06 (`:410`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None. The delta answers the round's one item in full; F-01/F-02 need an edit, not an answer, and neither blocks TSPEC from being written against this text |

## Positive Observations

- **All four delegated items landed, and each landed checkably.** REQ C-11 delegated exactly four
  things — which interpreters satisfy the precondition, how the observation is made, the refusal
  string, and where it sits among the startup checks (`REQ:296-299`). BR-GUARD-6 answers them as
  four fixed named terms rather than prose: the set (`python3`, `python`, `py`, in order), the
  observation (**by running**, once at startup), the message (§4.3 catalogue shape — expected,
  found, remedy), and the position (rung 4a, after the plugin's bytes are readable, before rung 5).
  A test author can write each of the four as an assertion without asking a further question.
- **The set and the observation match the shipped script, verified rather than trusted.** HEAD's
  `guard-harvest-before-delete.sh:15-16` loops `for cand in python3 python py` and probes each with
  `command -v … && "$cand" -c "import sys"` — running, not `PATH` presence. FSPEC's set is the same
  set in the same order, and its "presence is not executability" reading of the Windows store stub
  is the script's own comment, not an invention. The `:14-21` citation is accurate to the line
  (`PY_BIN=""` through `[ -z "$PY_BIN" ] && exit 0`), so BR-GUARD-6's fail-open premise is a fact
  about HEAD, not an assumption.
- **AT-ENG-11a's oracles are positive and falsifiable, both directions.** The refusal case asserts
  exact outcomes — refuses at rung 4a, **dispatches nothing**, names each candidate tried, its
  outcome, and the remedy — not an absence-shaped `!= dispatched`. Crucially it also carries the
  *pass* fixture (an earlier candidate present-but-not-runnable while a later one runs ⇒ rung 4a
  passes), which is what stops a trivially-refusing implementation from going green. That second
  fixture is the one an author would most likely have omitted; it is here.
- **EC-START-11 is the harder edge case, and it is the one that got written down.** The failure this
  precondition can actually cause in the field is not "no Python" — it is a host where `python` is
  on `PATH`, does not run, and a working `python3` sits behind it. Refusing that host would be the
  regression; EC-START-11 pins it as a **pass**, and AT-ENG-11a tests it.
- **The edit is additive, and nothing previously approved moved.** `git diff 24b99ebb..HEAD` on the
  FSPEC shows insertions only, apart from two header cells (upstream REQ v0.8 → v0.10, which matches
  `REQ:20`; FSPEC 1.5 → 1.6): one ladder row, two EC rows, BR-GUARD-6, one AT row, and two index
  rows (C-11 traceability, BR-GUARD-6). No rung renumbered, no existing BR, EC, AT or AC text
  altered, no deletion anywhere. My v6 findings' subjects — §12.1's BR-REP-0a and §3.5's AT-ENG-05 —
  are untouched by this diff and carry forward unchanged in status, still non-gating.
- **The scoping sentence prevents the obvious over-read.** "The engine alters no part of the
  script's own fail-open posture (NG-1) … a refusal to *run unattended*, not a change to the guard"
  keeps the plugin path's behaviour out of scope, which means no test here needs to assert anything
  about interactive-session guard behaviour — a smaller, cleaner test surface than the erratum could
  easily have produced.

## Recommendation

**Approved with minor changes**

The erratum resolves the round's one item. C-11's four delegated specifics are all present and all
testable as written, the interpreter set and observation method are faithful to the shipped script
at HEAD (checked, not assumed), and AT-ENG-11a carries both a falsifying refusal oracle and the pass
fixture that keeps a blanket-refusal implementation from false-greening. Nothing I previously
approved was disturbed: the diff is purely additive apart from the version header.

Two Medium findings, neither blocking and neither about the delta's substance: AT-ENG-11a is filed
in §9's table rather than §4.6's ladder table (F-01), where a downstream author deriving ladder test
tasks may not find it; and BR-GUARD-6's "the set follows the script's set" obligation has no drift
oracle (F-02), best discharged in TSPEC by a set-equality check against the script's own candidate
loop. F-03 is a one-word enumeration sweep. No High findings; no re-litigation of settled decisions.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
