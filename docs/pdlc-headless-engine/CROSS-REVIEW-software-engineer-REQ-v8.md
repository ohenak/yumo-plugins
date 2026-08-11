# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md
**Date:** 2026-08-11
**Iteration:** 8
**Scope:** Delta confirmation of the Phase-D erratum round 6 edit (interpreter precondition —
C-11). Not a re-review of the whole REQ; the v7 approval stands for everything outside the diff.

## Delta Verified

The erratum edit is commit `6ff9871a`, +31/−28 lines in the REQ. Three regions change: the
version row (0.9 → 0.10), the change-note block (a new 0.10 note; the 0.8/0.9 notes compressed
into the *Earlier change notes* paragraph), and one new constraint **C-11** at `REQ:284-298`.
`git diff` confirms no `AC-`, `BR-`, goal, non-goal, risk or other constraint text is touched.

**Both raised items are resolved by the same constraint.**

- *se-author's item — no constraint authorises requiring a working interpreter on an unattended
  host; `grep -in "python\|interpreter"` returns zero hits.* Cleared. The grep now returns hits at
  `REQ:23`, `:25` (change note) and `:285-298` (C-11's body), and the hits are authorising text,
  not narration: C-11 declares the engine's ability to execute the shipped guard script a
  **declared host precondition**, observed once at startup, whose absence is a fail-closed startup
  refusal — the engine dispatches nothing and exits non-zero naming what was missing and the
  remedy. That is precisely the authority DEC-ENG-03 said it could not originate for itself
  (`DECISIONS:183-196`).
- *pm-review's item — a constraint must state the precondition, as probed at
  `guard-harvest-before-delete.sh:14-21`.* Cleared, and the cited claim is true at HEAD. Lines
  14–21 are the probe loop over `python3 python py` with `[ -z "$PY_BIN" ] && exit 0`, and the
  comment at `:13` reads "If none is available, fail open (allow) rather than erroring" — exactly
  what C-11 characterises as fail-open-by-design. The citation is line-accurate, not approximate.

**The change of premise is stated, not smuggled.** C-11 says in its own words that a host which
previously ran pdlc with the guard silently inert no longer runs it at all, and that this is the
intended outcome. That is the operator-facing deployability rule pm-review asked for, and it is
the half DEC-ENG-03 explicitly deferred upstream rather than the half it kept.

**Altitude is right.** C-11 routes four things downstream by name — which interpreters satisfy the
precondition, how the observation is made, the refusal string, and where the check sits among the
startup checks — leaving FSPEC's EC row and TSPEC to fix them. Under the REQ/FSPEC altitude rule
that is the correct split: the constraint authorises, the downstream contract specifies. It also
avoids re-carrying the candidate list `guard-harvest-before-delete.sh` already owns, so there is
no second definition to keep in sync.

**No regression against anything I approved in v7 or earlier.** Checked the four places a new
fail-closed startup refusal could contradict standing text:

- **AC-4.1's closed six-member catalogue** (`REQ:504-513`) classifies *dispatch outcomes*. A
  startup refusal precedes any dispatch and produces no dispatch row, so the set-equality oracle
  is untouched.
- **AC-2.1's ordered first-match auth table** (`REQ:404-421`) is conditioned on "any successful
  start" and decides the banner. A run that refuses on the interpreter precondition is not a
  successful start and prints no banner — the same shape as row 5's `auth.api-key-refused`
  refusal, which already coexists with the table. No row is invalidated and none is added.
- **C-8's closed string catalogue** (`REQ:262-271`) already quantifies over "every banner line,
  refusal, warning, and failure message", so the new refusal is inside the catalogue obligation by
  quantifier, not by amendment. C-11 says so explicitly, and AC-6.4's set-equality check over the
  catalogue therefore continues to hold without edit.
- **NG-1** (`REQ:189`) is preserved verbatim by C-11's own sentence: the engine does not alter the
  script's fail-open posture; the plugin path keeps it. C-5 (`REQ:248`) gains a reading — parity is
  a claim about the invariant holding, not about a hook being configured — but no text of C-5
  changes and no AC that cites C-5 (AC-5.1, AC-5.2) shifts meaning: both remain assertions about a
  refused deletion on a host where the guard *can* execute.

**On the compressed change notes.** The 0.8 and 0.9 notes are condensed into one paragraph to hold
the size budget. Spot-checked the compression against the retired text: every erratum the 0.8 note
recorded (AC-1.2(c) per-surface attribution, AC-3.5's dispatchable-subset scoping, AC-2.1 rows
2/4/5, AC-4.5's transport identity and report location, `queue.maxIterations`, the `pdlc doctor`
authority) survives by name in the compressed line, and 0.9's M-ENG-06 totality restatement
survives. No approved decision is dropped, only its prose.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | C-11 declares a fail-closed startup refusal "on the same footing as C-10's", but C-10's footing includes a dedicated acceptance criterion (AC-3.2 asserts the refusal, the message contents and the remedy), while C-11 has none. Verification therefore rests entirely on the FSPEC EC row filed as the sibling erratum plus C-8's catalogue obligation. That is a defensible split and not gating for this edit, but if the FSPEC row lands narrower than C-11, no REQ-level oracle will catch it. Suggested resolution when Group 2 or Group 3 is next opened: one AC in AC-3.2's shape, or an explicit sentence in C-11 delegating its assertion to the FSPEC row by id. | §4, C-11 (`REQ:284-298`) vs C-10 / AC-3.2 (`REQ:272-283`, `:477-481`) |
| F-02 | Low | Local | The REQ is now 695 lines / 54,685 bytes against the pdlc budget of 700 lines / 60 KB — five lines of headroom. The next targeted edit will not fit without further compression of the change-note block. Not a defect in this edit (which compressed to stay inside the budget), just the standing cost of recording errata in-document. | Document size; `check-req-size` budget |

## Questions

| ID | Question |
|----|---------|
| Q-01 | C-11 leaves the ordering of the interpreter check among the startup checks to FSPEC/TSPEC. Since a host can fail both the plugin handshake (C-10) and the interpreter precondition, does the operator see one refusal or two? Not a REQ concern — flagged so the FSPEC EC row settles precedence rather than leaving it to implementation order. |

## Positive Observations

- The erratum is answered with authority rather than with restatement: C-11 establishes the
  precondition and declines to re-specify the interpreter set, the message or the check ordering,
  which is exactly the division DEC-ENG-03 asked for and the altitude the REQ should hold.
- The change of premise is written down as a change of premise ("a host that previously ran pdlc
  with the guard silently inert no longer runs it at all, and that is the intended outcome"),
  which is what makes this reviewable at all rather than an invisible tightening.
- The `guard-harvest-before-delete.sh:14-21` citation is line-accurate at HEAD, including the
  fail-open branch it is used to characterise. Existing-code claims in this REQ have been
  consistently checkable across rounds.
- The size budget was held by compressing history rather than by dropping the new constraint's
  reasoning — the right trade when the constraint is the load-bearing part.

## Recommendation

**Approved with minor changes** — the delta resolves both raised items and breaks nothing
previously approved. F-01 and F-02 are recorded for the next time this REQ is opened; neither is
gating and neither should trigger a re-authoring round.

Note for the DECISIONS author, not a finding against this REQ: DEC-ENG-03 still reads "`grep -in
"python\|interpreter"` over `REQ-...md` and `FSPEC-...md` returns **zero hits in both**" and still
describes its authority as pending. That statement is now stale for the REQ half by design — this
is the downstream half of the erratum wave, to be updated when DEC-ENG-03 cites C-11.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:9176adf0e0f33b085bf238dc181741c7991315474d864c76673bb7e20c970957
REVIEWED-COMMIT: 6ff9871a
