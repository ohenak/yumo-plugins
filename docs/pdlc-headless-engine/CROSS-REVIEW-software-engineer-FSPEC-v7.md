# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md (v1.6)
**Date:** 2026-08-11
**Iteration:** 7
**Scope:** Delta confirmation only — the Phase-D erratum round adding the C-11 guard-executability
precondition. Diff reviewed: `74d29bda..HEAD` on `FSPEC-pdlc-headless-engine.md` (commits
`81e9fcfa`, `e81f031b`). No re-review of previously approved sections.

## Delta under review

| Item | Where it landed | Resolves? |
|---|---|---|
| C-11 authorises the guard-executability host precondition DEC-ENG-03 declined to originate; FSPEC v1.5 had zero hits for `python\|interpreter`, leaving the interpreter set, observation method, refusal string and ordering unspecified | §4.1 rung **4a**; §9.1 **BR-GUARD-6**; §4.5 **EC-START-10/11**; §9.4 **AT-ENG-11a**; §14 constraint row; §16 BR-index row | **Yes** — all four delegated items are now pinned |

Each of the four delegated decisions, checked individually:

- **Which interpreters satisfy it** — `python3`, `python`, `py`, in that order, declared as
  *following* the shipped script's set rather than an independent set. Verified against
  `pdlc/hooks/scripts/guard-harvest-before-delete.sh:15` (`for cand in python3 python py`): the set
  and the order are exact, and the "never widen or narrow independently" rule is the right
  invariant — a widened set would refuse hosts the guard would have worked on.
- **How it is observed** — by *running* a candidate (`"$cand" -c "import sys"`, script line 16), not
  by `PATH` presence, once at startup rather than per dispatch. Matches the script's own probe
  semantics, and EC-START-11 names the Windows store stub as the case that forces the distinction.
- **What the refusal says** — expected / found / remedy, as a §4.3 catalogue entry, explicitly not
  "guard unavailable" alone. Consistent with C-8's catalogue obligation and with rung 3's shape.
- **Where it sits** — rung 4a, after the plugin bytes are located and readable (the script is one of
  them) and before rung 5. Ordering is sound: the finding costs nothing extra to obtain at that
  point, and it aggregates under BR-START-2 with the other rung failures.

**Existing-code claim verification.** The one line-cited claim in the delta —
`guard-harvest-before-delete.sh:14-21` fails open where no interpreter is obtainable — is accurate
at HEAD: line 14 `PY_BIN=""`, lines 15–20 the probe loop, line 21 `[ -z "$PY_BIN" ] && exit 0`. The
FSPEC restates it correctly and NG-1 is preserved: the script's own posture is unchanged, only the
engine's willingness to run unattended on such a host changes.

**Nothing previously approved is broken.** Rungs 0–5 keep their numbers (4a is an insertion, and
DEC-ENG-03 pins no rung number); BR-START-1/2 are untouched and rung 4a inherits them; §4.6's
AT-ENG-12 row still reads `EC-START-3…EC-START-9` and remains true of the cases it names, with the
two new cases covered by AT-ENG-11a; no other rule, EC, AT or decision text moved.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §17.1's index of per-section EC tables still reads `§4.5 \| startup ladder \| EC-START-1…9`. Two cases were added to that table, so the index under-reports the set. Fix: `EC-START-1…11`. Index drift is cheap now and misleading to TSPEC/PROPERTIES authors who read §17 as the enumeration. | §17.1 |
| F-02 | Low | Local | §15.2's stop-point row `startup ladder rung 1–4 \| plugin reads only, zero tokens` no longer characterises the cost accurately: rung 4a executes a candidate interpreter, so the run is not "plugin reads only" at that point. Exit `1` and zero tokens both still hold. Fix: widen the row to `rung 1–4a` and word the cost as "plugin reads and one interpreter probe, zero tokens". | §15.2 |
| F-03 | Low | Local | §15.1's step 2 spells out the ladder chain (`plugin resolved → manifest read → version handshake → skill prompts readable → billing posture`) and omits guard-executability. §15 adds no behaviour, so this is consolidation drift, not a contradiction — but a reader taking §15.1 as the summary of §4 now gets an incomplete ladder. Fix: insert `→ guard executable`. | §15.1 |
| F-04 | Low | Local | §18.1 states the AT set as `AT-ENG-01…AT-ENG-68`; the suffixed `AT-ENG-11a` is not covered by that range notation and the sentence does not acknowledge suffixed ids. Either renumber to the next free integer or add a clause naming the suffixed id, so the "the set" statement stays literally true. | §18.1, §9.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-ENG-11a's id sequences it after §4.6's AT-ENG-11 (startup ladder) but it is defined in §9.4's guard table. That is defensible — BR-GUARD-6 owns the rule — but if the intent was for it to live with the ladder tests, §4.6 is its home. No behavioural consequence either way; flagging only so the placement is deliberate. |

## Positive Observations

- The erratum stayed inside its item: one rung, one BR, two ECs, one AT, two index rows, and a
  change note that states what did *not* change. No adjacent rule was re-opened.
- Sourcing the interpreter set from the shipped script rather than declaring an independent one is
  the correct coupling direction, and the FSPEC says so explicitly instead of leaving it implied.
- "Presence is not executability" is pinned by a named real-world case (the Windows store stub)
  rather than an abstraction, so EC-START-11 is testable as written.
- The refusal keeps the expected/found/remedy shape of every other rung, so C-8's catalogue closure
  needs no exception for it.

## Recommendation

**Approved with minor changes** — the delta resolves the raised item completely and breaks nothing
previously approved. F-01 is a one-cell index correction; F-02/F-03/F-04 are consolidation-section
wording. None gate the phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}
