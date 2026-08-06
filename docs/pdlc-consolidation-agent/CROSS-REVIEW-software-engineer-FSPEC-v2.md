# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v2.0)
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Local unless tagged otherwise
**Protocol:** delta re-review. Baseline `4b65278` (the commit `CROSS-REVIEW-software-engineer-FSPEC-v1.md` reviewed); diff `4b65278..HEAD` — 399 insertions, 97 deletions across 13 commits. Only the changed sections were re-read for new issues.

## Prior findings — disposition

Every v1 finding was re-checked against the revision and, where it made a claim about HEAD, against
the code. Ten of twelve are closed; one is closed only in part.

| v1 | Verdict | Evidence |
|---|---|---|
| F-01 (High) — `resolveAdvisoryRung` reuse not implementable | **Partially resolved** → re-raised as F-01 below | §2.6 now states the seam correctly: no probe mode (doc comment `orchestrate-dev.js:1811-1813` — verified verbatim), the hardcoded `ADVISORY_RUNG_SKILL = "se-review"` (`:1797`, dispatched `:1841`), the exported signature `({ _agent, _log, _state, prompt })` (`:1833`), and the chosen repair (an optional `skill` parameter). Step 8 is now *the first advisory dispatch*, which is the only reading the seam permits. **But** the two places §2.6 says carry that repair do not carry it — see F-01 |
| F-02 (High) — the resolver's fourth outcome unmapped | **Resolved** | §2.6 row 4 maps `{kind: "dispatch-error", err}` (`:1857`, `:1867` — both verified) to `failed` with no reason code and the message in the report body; S-11b, E-19b and AT-M6 carry it; the missing vocabulary row is routed as ER-2. The claim "rows 1–4 are set-equal to the resolver's return and throw set" is true of `:1833-1875`: two `{kind:"response"}` paths, two `{kind:"dispatch-error"}` paths, one `throw haltError` (`:1868`) |
| F-03 (High) — NFR-4 has no carrier for the consuming-repo routes | **Resolved in structure** | §6.4 now names two carriers per route, and §3.4 / §4.5 withdraw the claims the PR-trailer carrier could not support — including an explicit statement that the §4.5 race admits a duplicate consuming-repo append. Two follow-on defects in the *new* carrier are filed as F-04 and F-05 |
| F-04 (High) — §8.5 row 3 undecidable over `symptom` | **Resolved** | Row 3 is now a file-existence test on `artifact` at the pass's HEAD; the withdrawal is argued explicitly; AT-F17 / AT-F18 assert both arms and AT-F17 asserts determinism across two runs |
| F-05 (High) — `recurred` unobservable on the producing side | **Resolved** | §8.4 adds a four-step harvest-side **lookup** (never a re-derivation), the subset property, the parse-notice arm for an unmatched id, O-C6 for the recall limit, and AT-F15 / AT-F16. AT-F15's Given ranges over a harvest-authored LEARNINGS, which is what v1 asked for. One residue is filed as F-06 |
| F-06 (Medium) — two opposite `no-op` proposal-file rules | **Resolved** | §5.3's four-row table decides the file's existence on the three proposal rows and explicitly *not* on the terminal status; the AC-1.4 / AC-4.3 tension is routed as ER-3 rather than papered over |
| F-07 (Medium) — false injectivity claim | **Resolved** | The claim is withdrawn; the collision is stated with a worked example, a three-row consequence table and an argued refusal of the lossless repair |
| F-08 (Medium) — "the consumed window" undefined | **Resolved** | §9.2 fixes the population as the whole of `ESCALATIONS.md`, §9.4 and §9.5 are re-worded to match, BR-37a states the rule, and AT-A6 pins it **differentially** (disjoint vs matching `Feature` values must give an identical verdict) — a genuinely falsifying oracle, not a restatement |
| F-09 (Medium) — AC-1.6's fallback branch untested | **Resolved** | AT-M7 asserts all three conjuncts of the non-silent downgrade and AT-M8 is its paired positive-rung negative; §15.1 remaps AC-1.5 → AT-M7/AT-M8 and AC-1.6 → AT-M4/AT-M6/AT-M7 |
| F-10 (Medium) — AT-Q7 absence-only | **Resolved in shape, broken in content** → re-raised as F-02 below | The oracle is now a positive set-equality with a paired PR-state assertion and a demoted supplementary source check (AT-Q7b), and §6.5 control (b) and BR-28 are restated positively. The enumeration it compares against is wrong |
| F-11 (Low) — three citation off-by-ones | **Resolved** | Verified at HEAD: `commitQueueRow`'s commit is `orchestrate-queue.js:1580-1586` ✓, `NOTHING_TO_COMMIT_RE` is `:1631-1635` ✓, the resolver's `throw haltError(` is `orchestrate-dev.js:1868` ✓ |
| F-12 (Low) — `rungState` precedent miscited | **Resolved** | §2.6 now cites `orchestrate-queue.js:1120` for the shape ✓, states that `:1245-1256` threads it into `runAdvisorySeam` ✓, that the resolver's only shipped call site is `orchestrate-dev.js:3132` ✓, and that this pass's direct call is therefore a **new** call site |

## Findings

*(filled below)*

## Questions

*(filled below)*

## Positive Observations

*(filled below)*

## Recommendation

*(filled below)*
