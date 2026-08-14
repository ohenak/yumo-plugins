# Cross-Review: test-engineer — FSPEC (delta confirmation, erratum round)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.3)
**Date:** 2026-08-13
**Iteration:** 3
**Scope:** Delta confirmation of the erratum edit (`aa4d4a50..HEAD`) plus re-grounding of the FSPEC
against upstream REQ v0.10 at `sha256:f570fb72…57e1`. Not a whole-document re-review.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | The packed-content erratum was fixed by **deleting** the expected member set from §5.2 and routing it to TSPEC §5.4, but upstream REQ v0.10 AC-1.3 still requires the packed list to equal "an expected set **stated in the FSPEC**". REQ v0.10's changelog restates only NG-6/O-2 and AC-3.5 — AC-1.3's ownership was not re-decided, so the document is no longer a faithful compression of its upstream. Testing consequence: AT-3.8a's oracle is now unresolvable inside the FSPEC + REQ pair — the verifier must transcribe from a *downstream* document, and a decomposition edit in TSPEC §5.4 silently redefines what an acceptance test asserts, with no FSPEC-side change-control point. The set-equality falsifiers also degrade: "an added `SKILL.md`" and "an added test file" survive (they are the §5.2 exclusions, still literal here), but "a **removed member** fails" is now unfalsifiable at this altitude because no member is named. Fix either direction, not neither: (a) restate the correct set in §5.2 — TSPEC §5.4's `PK-1…PK-23` / 24 after E-4b's `bin/cli.mjs` split, with the existing same-change update rule kept — or (b) raise `ERRATUM: REQ:` to relocate the expected set's ownership to the TSPEC and let AC-1.3 be re-worded, then cite the re-worded AC here. | §5.2 (CLI entry, Engine modules rows); §8 AT-3.8a; REQ AC-1.3 |
| F-02 | Low | Local | §1's scope paragraph still asserts the FSPEC "carries the three **expected sets** … the packed-content set (AC-1.3)", which §5.2 no longer does; and the v0.3 changelog closes with "No other change" while this self-description went stale. Whichever direction F-01 resolves, this line and the §5.2 forward-references need updating in the same edit. | §1 (`FSPEC:32-33`); §Changelog v0.3 |

## Delta verification of the raised items

| Item (as dispatched) | Landed? | Evidence |
|---|---|---|
| §3 F-7 step 4 cites "§8's AT-7.2"; §8 enumerates no AT-7 group; meant AT-6.2 (raised by pm-review, te-review, se-author — same defect, one line) | **Yes** | `FSPEC:296` now reads "§8's AT-6.2". `grep -n 'AT-7'` over the document returns only the changelog's own description of the fix (`:20-21`); no dangling `AT-7.x` remains. The target is correct on substance, not just on numbering: AT-6.2 (`:755`) is the load-root/two-conjunct channel test F-7 step 4 describes, and it carries the same "claims no more" limit and the same §9 Q-2 pointer. |
| AT-3.8a's expected packed set ("the manifest, `bin/pdlc.mjs`, twelve named `lib/*.mjs` modules") contradicts TSPEC §5.4's `PK-*` table (raised by se-author, twice) | **Partly — the contradiction is gone, the replacement introduces F-01** | The wrong literal set is removed from §5.2 and from AT-3.8a (`:474-476`, `:689-696`); no stale "twelve" or sole-`bin/pdlc.mjs` entry survives outside cited HEAD line references (`:87`, `:103`, `:321`, which are HEAD measurements, not expected-set claims). The divergence against TSPEC §5.4 / E-4b is genuinely closed. What is not closed is where the set now lives — see F-01. |
| REQ v0.10 re-grounding (NG-6/O-2 scope; AC-3.5 paired positives) | **Yes** | Upstream cell updated to REQ v0.10 (`:9`). AT-3.5 (`:678-684`) now carries both positives and they are faithful to REQ AC-3.5 verbatim: (a) secret present ⇒ publish authenticates and the release is cut; (b) absent or empty ⇒ failure naming the missing credential, nothing published. This clears the absence-only oracle on AT-3.5 — the three-conjunct shape is now positive-presence plus named-reason, not `no occurrence` alone. NG-6/O-2's run-reads-`engine.*`-pin scope was already carried in §3 F-4 / BR-2.2 / BR-4.7 / I-4 / E-11, and I re-read those; nothing needed to move. |

## Regression check against what was previously approved

- AT-6.2's own text (`:755-761`), §9 Q-1 and Q-2 are unchanged; the interim-limit position I approved in round 2 still stands and is still stated inside the test rather than dressed up as an oracle.
- AT-6.1's fresh-clone precondition (`:745-753`) and the `local-edit`/`unverified` caveat are untouched.
- AT-3.6, AT-3.7 and AT-3.8b are byte-unchanged; AT-3.8b remains correctly `[blocked on O-10]`.
- The `git diff` touches only the header/changelog, `FSPEC:296`, the two §5.2 rows, AT-3.5 and AT-3.8a. No other approved content moved.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Which F-01 direction do you intend — restate the set in §5.2, or `ERRATUM: REQ:` to move AC-1.3's expected-set ownership to the TSPEC? Both close it; the second is the larger claim and should be raised in this round rather than deferred, since the confirmation round is bounded. |
| Q-02 | If §5.2 restates the set, is the intended member count 23 (before N-2's `LICENSE` decision) or 24 (after E-4b's `bin/cli.mjs` split)? TSPEC §5.4 carries both states with `PK-3` and `PK-4b` conditional; the FSPEC copy needs to say which one AT-3.8a asserts, or the test inherits the ambiguity that caused this erratum. |

## Positive Observations

- The AT-3.5 absorption is exactly the shape the oracle-falsifiability rule asks for: absence plus two positives, one of which names a reason. It resolves an absence-only oracle I would have had to file against the next revision anyway.
- The AT-7.x fix chose the semantically right target rather than the nearest id, and the changelog was written so the fix's own description does not reintroduce a dangling reference — a detail that would otherwise have re-tripped a grep-based check.
- The erratum stayed genuinely targeted: five lines of substantive change, no settled decision reopened.

## Recommendation

**Needs revision** — one High. The three raised items landed; the packed-set fix replaced a wrong literal set with no literal set, which contradicts upstream AC-1.3 as it currently reads. This is a delta-confirmation finding under DEC-ERR-03 (upstream fidelity is judged against the upstream text, not against the item list), and it is a small edit in either direction.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
