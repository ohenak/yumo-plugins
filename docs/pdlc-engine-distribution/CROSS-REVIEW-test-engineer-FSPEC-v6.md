# Cross-Review: test-engineer — FSPEC (delta confirmation, erratum round)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 6
**Scope:** Delta confirmation of the erratum edit `73e664bb` (v0.5 → v0.6), plus DEC-ERR-03
re-grounding of FSPEC against upstream REQ at HEAD. Not a whole-document re-review.

## Raised-item disposition

| Item | Raised by | Disposition | Evidence |
|---|---|---|---|
| AT-1.6 quotes placeholder `"none"`; shipped `checkCompat` reports the literal `not found` | pm-review | **Resolved** | `FSPEC:672-674` now reads "installed plugin version (the literal `not found` when none is installed)". Matches `pdlc/engine/lib/handshake.mjs:146` (`… ? "not found" : String(pluginVersion)`), `:164` (refusal text) and `:209` (banner renderer), pinned at `pdlc/engine/__tests__/handshake.test.js:110-118` (`assert.equal(out.pluginVersion, "not found")`). |
| AT-1.6 pins the wrong user-facing string vs. renderer and PROPERTIES | se-review | **Resolved** | Same edit. `PROP-LAUNCH-5` (triple member) and `PROP-LAUNCH-9` (conjunct (b), "exact `not found` value `checkCompat` reports") now read identically to AT-1.6 — the transcription chain FSPEC → PROPERTIES → test is single-valued. |
| Collateral: AT-1.1's prose and Q-1's triple-member obligation | (author, same edit) | **Resolved, correct** | `FSPEC:596` (Q-1) and `FSPEC:656-658` (AT-1.1) both name the literal `not found`. AT-1.1 is the only place a verifier could have taken "states none is installed" as the assertable string; it no longer says that. |
| Collateral: AT-1.4's discriminator cited the retired "none installed" message | (author, same edit) | **Resolved, and the reference no longer dangles** | `FSPEC:664-666` now discriminates against "AT-1.1's `not found` message". The two refusal states (missing plugin vs. unparseable manifest) remain distinguishable, which is what BR-1.3/AT-1.4 buy. |

Both raised items land. Nothing previously approved is weakened by the edit: no AC changed, no AT
added or dropped, no severity bar or oracle shape moved, no scope relocated between FSPEC and TSPEC.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Process | **The erratum round did not re-ground on upstream HEAD, and the FSPEC now routes upstream three questions the REQ has already decided.** REQ moved v0.10 → v0.11 in commit `01c27ee4` ("AC-1.3 ownership split, F-4 pin citation"). The FSPEC's Upstream row still pins **v0.10** (`FSPEC:9`), and the v0.6 changelog entry records no absorption. Three consequences, all readable as false statements about upstream: (a) `FSPEC:30` "Routed upstream: REQ AC-1.3 wording" — decided in REQ v0.11; (b) `FSPEC:38` asserts REQ AC-1.3 says "*expected set stated in the FSPEC*", which REQ v0.11 no longer says (it now reads "classes and per-class member counts … stated in the FSPEC" and "member names … stated downstream in the TSPEC"); (c) `FSPEC:42-43` "Noted, not fixed, for the next round: REQ v0.10's changelog attributes the run-side pin read to FSPEC F-3 step 5" — fixed in REQ v0.11 to F-4 step 2, which is where `FSPEC:180` already puts it. Per DEC-ERR-01 a routed-but-already-decided item is never demoted. **Substance is fine — the fix is bookkeeping:** bump the Upstream row to v0.11, and in the 0.6 changelog record the absorbed set (AC-1.3 ownership split, F-4 step-2 citation) *before* the raised items, marking `:30`, `:38` and `:42-43` discharged. No §5.2, AT-3.8a or AT-3.8b text needs to change. | Header `:9`; changelog `:27-45` |
| F-02 | Medium | Local | **Downstream PROPERTIES still quotes the retired "none installed" phrase, so the erratum wave has not propagated one step down.** `PROP-LAUNCH-3` requires that AT-1.4's unparseable-manifest assertion "must pin text, not the 'none installed' message"; that message no longer exists in any document or in the shipped renderer. A test author transcribing PROP-LAUNCH-3 literally would write a discriminator against a string nothing emits — an oracle that passes vacuously and never falsifies. `PROP-LAUNCH-9`'s headline clause ("state none installed") has the same residue, though its conjunct (b) correctly pins `not found`, so the property itself is still implementable. Flagged here because the FSPEC edit is what created the drift; the fix belongs in a PROPERTIES erratum, not in the FSPEC. | `PROPERTIES:85`, `:91` (vs. `FSPEC:664-666`) |
| F-03 | Low | Local | **The changelog's `handshake.test.js:113` citation is a line-drifty pin for a multi-line evidence block.** The assertion that actually pins the literal is `assert.equal(out.pluginVersion, "not found")` inside the test at `:110-118`; `:113` alone will drift the moment a case is inserted above it. PROPERTIES already cites the range (`:110-118`) for PROP-LAUNCH-9. Citing the test *name* ("a missing plugin refuses and names the range, 'not found', and the remedy") or the range would survive edits. Prose only; no oracle depends on it. | Changelog `:21` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-1.1 now asserts the refusal "reports the plugin version as the literal `not found`". At HEAD that literal appears in two shapes — inside `checkCompat`'s `reason` (`handshake.mjs:164`, `version found: not found`) and as the banner/triple field (`:209`, `plugin:   pdlc vnot found`). AT-1.1 is a refusal-message AT, so I read it as the former; AT-1.6/Q-1 as the latter. Is that split intended? If so it is already unambiguous enough to test; if AT-1.1 is meant to cover both surfaces, say so, because the two strings are not substring-equal (`vnot found` vs `version found: not found`) and a verifier picking the wrong one gets a red test for no defect. |

## Positive Observations

- The edit is exactly the shape an erratum should be: one literal, aligned everywhere it is quoted,
  with the shipped source and the pinning test both cited, and an explicit "no criterion changed, no
  scope moved" statement. I could re-verify the whole claim from the changelog alone.
- Alignment ran **towards the shipped value**, not away from it. `not found` is what
  `handshake.mjs` emits and what `handshake.test.js` already pins, so the documents moved to the
  green oracle rather than asking implementation to move to the prose — the cheap direction, and
  the one that cannot redden a passing suite.
- AT-1.4's discriminator was repaired in the same edit. Retiring a string that another AT names as
  its negative is exactly how dangling absence-oracles get created; catching it in-round is the
  behaviour I want to see repeated.
- The triple's three-way equality obligation (AT-1.6 → BR-1.5) survived the rewording intact —
  "equals the triple in the same run's banner and report" is still there, so PROP-LAUNCH-5's
  within-one-run equality assertion keeps its FSPEC anchor.

## Recommendation

**Needs revision** — on F-01 only, and the revision is a header bump plus a changelog paragraph.

Concretely: set `FSPEC:9`'s Upstream row to REQ **v0.11**, and extend the 0.6 changelog entry to
record, ahead of the raised items, that REQ v0.11 decided (a) AC-1.3's ownership split — classes and
per-class counts here, member names in TSPEC §5.4, which is what §5.2 and AT-3.8a already implement —
and (b) the F-4 step 2 citation for the run-side `engine.*` pin read, which `FSPEC:180` already
carries; then mark `:30`, `:38` and `:42-43` as discharged rather than open. Both raised errata are
resolved and no acceptance criterion, oracle or test-level assignment needs to move.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}

