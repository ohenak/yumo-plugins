# Cross-Review: software-engineer — REQ (delta confirmation, erratum round)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md (v0.12)
**Date:** 2026-08-16
**Iteration:** 8
**Scope:** Delta confirmation of the erratum edit at `20c87cd3` (O-B count gloss). Not a
re-review of the whole REQ. Upstream re-read: `docs/_constraints/pdlc-engine-baseline.md`
(M-ENG-10) and `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` §5.1 at HEAD.

## Raised item

| Item | Disposition |
|---|---|
| O-B still states "The PR gate is **five** required checks" (`REQ:80`) while §5.1's table now carries six rows; the gloss needs trigger-derived membership, not a count | **Landed.** O-B (`REQ:86`) now opens "The PR gate's membership is **trigger-derived, not a fixed count**", derives a member from "whatever a PR-triggered workflow file renders", states the count "moves whenever such a file is added, removed, or re-triggered — including by this feature's own work", demotes the 2026-08-13 reading to a dated observation ("At the 2026-08-13 measurement that was one file, `pr-tests.yml`…; no number stated here is authoritative"), and names §5.1 as "the authority on membership (T-7)". The `Where` cell was widened to `M-ENG-10; FSPEC §5.1`. No count survives anywhere in the REQ outside the changelog's own description of the fix (`:21`, `:23`). |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **O-A reads present-tense where O-B now self-dates.** O-B carries an inline date anchor ("At the 2026-08-13 measurement that was one file"); its neighbour O-A still asserts flatly "there is **no release automation of any kind**. `.github/workflows/` contains exactly one file" — false of HEAD, where this feature's own work has added `publish.yml` and `fixture-machine.yml`. The §1.1 heading ("The true HEAD (re-measured 2026-08-13 at `89babe8e`)") does date the whole table, so nothing is wrong; the asymmetry just makes O-A the row a reader is most likely to take as current. One clause ("at that measurement") would match O-B's new register. Non-gating, and outside the raised item. | §1.1, O-A |

## Upstream fidelity check (DEC-ERR-03)

Re-read at HEAD, against the text O-B now leans on:

- **§5.1 (FSPEC).** Six rows, two PR-gate files, row 6 `fixture-machine.yml` marked "this
  feature's own addition (PLAN T50)"; BR-7.1 derives file scope from each file's `on:` block
  rather than a list; BR-7.5 states the exclusion reason is the trigger, not the filename.
  O-B's "trigger-derived … moves whenever such a file is added, removed, or re-triggered —
  including by this feature's own work" is a faithful compression of all three, and the
  authority attribution ("§5.1 … is the authority on membership") matches §5.1's own framing
  ("seeded from M-ENG-10's measurement") rather than inverting it.
- **M-ENG-10 (constraints).** Byte-identical since `72e3ff1f`; its heading still says "five" and
  its tail still claims change control ("a change to either is a change to this fact first").
  O-B does **not** mis-report this: it cites M-ENG-10 only for what M-ENG-10 measures — the
  check names in both alphabets — and scopes the disclaimer to the REQ itself ("no number
  stated **here** is authoritative"). The residual gate sentence in the constraints file is the
  known F-26 / DECISIONS N-5 deferral, in a measured-facts file that is not a pipeline doctype;
  the erratum neither worsened nor was obliged to close it.
- **AC-3.4 / T-7 / C-5.** Unchanged by this edit and still consistent with the new gloss:
  AC-3.4 already reads "the workflow file**s**' authored `name:` strings", already asserts
  set-equality "against an expected set stated in the FSPEC", and already says "M-ENG-10 stays
  a point-in-time observation, not a gate". T-7 makes the enumeration, not the count,
  authoritative. Nothing previously approved is contradicted by the delta.
- **Changelog / version.** Metadata row moved 0.11 → 0.12 (2026-08-16) and the 0.12 entry names
  the erratum, its cause and its scope ("No other change"), which the diff bears out: 8 added
  lines, 2 removed, all in the metadata row, the changelog and O-B.

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC's Upstream cell still pins `REQ … (v0.11)`. Expected to be re-anchored by the engine's downstream re-confirmation pass rather than by hand — confirming that is the intent, not a missed edit. |

## Positive Observations

- The fix changed the *kind* of claim, not just the number. Replacing "five" with "six" would
  have re-broken on the next PR-gating workflow file; deriving membership from the trigger makes
  the row correct for any future count, which is what §5.1's BR-7.1 does mechanically.
- Naming this feature's own work as a source of movement ("including by this feature's own
  work") is the sentence that would have prevented the original defect.
- Authority is stated once and pointed downstream (§5.1 via T-7) instead of being restated, so
  the REQ acquires no second change-control point.

## Recommendation

**Approved with minor changes** — the raised item is fully landed, the delta is faithful to
M-ENG-10 and §5.1 at HEAD, and nothing previously approved is broken. F-01 is a one-clause
register fix in a neighbouring row, non-gating.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
