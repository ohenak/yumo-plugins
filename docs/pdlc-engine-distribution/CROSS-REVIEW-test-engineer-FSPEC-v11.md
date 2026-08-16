# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md
**Date:** 2026-08-16
**Iteration:** 11
**Scope:** Delta confirmation of the erratum round routed to FSPEC (BR-7.7 / §5.1 gate scope),
plus the DEC-ERR-03 upstream re-grounding against REQ HEAD
(sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f).

## Confirmation state

**No delta landed in this document.** FSPEC's bytes at HEAD are `730aa0b6`, the same commit my v10
approval anchor pins (`REVIEWED-COMMIT: 730aa0b6…`), and the recorded upstream state
(`UPSTREAM-STATE: REQ sha256:44d0e188…`) equals REQ's HEAD hash measured now. So the confirmation
question splits cleanly in two:

1. **Did the routed items land?** No — and they could not have, here. Both items name rows in
   **PLAN**, not FSPEC: `PLAN:192` (T17) and `PLAN:222` (T49). Both are still stale at HEAD.
   T17 still specifies "`publish.yml`/`pr-tests.yml` gate-command set-equality" and T49 still
   specifies "the five PR-gate job bodies duplicated". FSPEC itself was already the *correct*
   authority the items cite — `FSPEC:548-554`'s BR-7.7 says the tag gate's run-command set equals
   "the union of **all** PR-gate files' gate jobs' run commands", and `FSPEC:483-499`'s §5.1 table
   carries row 6 (`fixture-machine.yml`) with the trigger-derived membership rule at
   `FSPEC:505-518`. The erratum was mis-routed: the edit that discharges it belongs to PLAN.
2. **Does anything I previously approved now break?** No. The document is unchanged, upstream REQ
   is unchanged, and re-reading the text FSPEC leans on confirms it is still a faithful
   compression: REQ's O-B (`REQ:86`) states PR-gate membership as trigger-derived and explicitly
   count-free, and T-7 (`REQ:269`) gives FSPEC the expected-set authority in two alphabets —
   which is exactly what §5.1 and BR-7.1 encode. The shipped carrier agrees with the document
   rather than trailing it (`pdlc/engine/__tests__/ci-arrangement.test.js:12-14`,
   `:482-562`), and PROPERTIES v0.9's PROP-PUB-7 (`PROPERTIES:160`) already absorbed BR-7.7's
   union form.

One residual wording defect in FSPEC *did* surface while re-reading BR-7.7, and it is plausibly
the seed of the stale PLAN rows — filed as F-01 below. It is a single-clause edit, not a
criterion change.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | BR-7.7's closing sentence undercounts its own set: "The set-equality is asserted by the same offline carrier, so **the two files** stay in step by a test rather than by memory" (`FSPEC:553`). Three files are in play — `publish.yml` plus the two PR-gate files the same rule derives (`pr-tests.yml`, `fixture-machine.yml`) — and the rule is deliberately count-free, so any fixed count re-introduces exactly the brittleness BR-7.1's derived scope removed. This is the one clause in the document that still reads two-file, and it sits three lines below the union statement it contradicts in tone; the stale PLAN rows read the same way. Suggested edit: "so `publish.yml` and every PR-gate file stay in step by a test rather than by memory". No criterion, oracle or AT moves. | §5, BR-7.7 (`FSPEC:553`) |
| F-02 | Medium | Cross-Feature | The routed erratum items are **unlanded and not landable in this document**: they name `PLAN:192` (T17) and `PLAN:222` (T49), both stale at HEAD. T17's carrier spec still says "`publish.yml`/`pr-tests.yml` gate-command set-equality" and T49 still says "the five PR-gate job bodies duplicated" — a two-file/five-job premise that contradicts BR-7.7, PROP-PUB-7 and the code T17 is supposed to own (`ci-arrangement.test.js:12-14` already asserts the union, naming `fixture-machine.yml`). Testing impact if the PLAN rows are implemented as written rather than as shipped: the tag gate omits row 6's legs, which carry AT-2.3…AT-2.6, and a two-file equality then passes on a release gated on strictly weaker evidence than the PR was — a false green no other oracle catches. Route this erratum to PLAN; FSPEC needs no edit for it. | Routing (PLAN §2.1 T17, T49) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is the intended erratum target PLAN rather than FSPEC? If so, this round can close on FSPEC and the same item list re-open against PLAN unchanged; if the orchestrator instead expected an FSPEC-side edit, the only one warranted is F-01's clause. |

## Positive Observations

- BR-7.7 states the union form in the strongest available way — "the union of **all** PR-gate
  files' gate jobs' run commands" — and pays for it with a falsifiable reason (row 6 carries
  AT-2.3…AT-2.6, so a two-file equality is strictly weaker evidence than the PR's). That is the
  sentence that makes the downstream contradiction detectable at all.
- BR-7.1's file scope is derived, not listed (`FSPEC:509-512`): the carrier enumerates
  `.github/workflows/` and set-equals the PR-triggered files against §5.1's file column, so a new
  PR-gating workflow cannot enter the repo without entering the table. That is the right shape for
  a membership oracle — an enumeration can go stale silently, a set-equality cannot.
- BR-7.5 keeps the exclusion reason on the **trigger**, not the filename, and says so explicitly
  ("were the file `pr-tests.yml` … it *is* in the set"). The shipped carrier mirrors that reasoning
  verbatim at `ci-arrangement.test.js:559-562`, and the mutation legs (`:546`) prove a rename of a
  fixture-machine job goes red — the authored-alphabet hole is closed by a test, not a note.
- BR-7.4's one-time, dated, explicitly **non-gating** seed record is the correct treatment for a
  GitHub-side expansion observation: it grounds the rendered column without adding a second gate
  that would go red on network weather.

## Recommendation

**Approved with minor changes**

No High findings. The document is unchanged, still faithful to REQ HEAD, and still ahead of the
downstream artifacts that contradict it. F-01 is a one-clause wording fix to apply whenever FSPEC
is next opened; F-02 is a routing correction — the erratum's real target is PLAN's T17 and T49
rows, which are still stale at HEAD and should be re-raised there.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}

FINDING: Medium | inherited | local | §5, BR-7.7 (`FSPEC:553`) | Residual two-file phrasing "so the two files stay in step" contradicts BR-7.7's own count-free union over `publish.yml` plus every PR-gate file; one-clause edit.
FINDING: Medium | inherited | nonlocal | Routing (PLAN T17 `:192`, T49 `:222`) | Routed items are unlanded and belong to PLAN, not FSPEC; the two-file/five-job premise there contradicts BR-7.7, PROP-PUB-7 and the shipped carrier, and would false-green a tag gated without row 6's AT-2.3…AT-2.6 legs.

