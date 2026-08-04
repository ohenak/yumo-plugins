# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md (v1.3)
**Date:** 2026-08-04
**Iteration:** 7
**Scope:** Delta confirmation of the Phase PR erratum round only — commits `77f81ca`, `657ae5a`,
`75281a3`, `7e9ea4e`, `9d49cdc`, `2e8227e`, diffed against `ef2404f` (the commit approved at v6).
Unchanged sections are not re-reviewed.

## Erratum Items Confirmed

| # | Item (raised by) | Where the delta lands | Resolved |
|---|---|---|---|
| E-1 | A1's `verifyGate = async () => ({ passed: true })` is the trivially-passing stub FSPEC T-03-6(b) treats as a falsifying mutation (pm-review) | §4.3 typedef, §5.5 table, §6.3 A1 table, §7.2 A3 table | **Yes** |
| E-2 | `SeamOps` declares no member through which a seam reports `waitMs`, so PROP-BUD-03 has no surface (se-review, te-author) | §4.3 new paragraph, §4.5, §8.2 A5-3 | **Yes** |
| E-3 | §11.1's "grep for `advisory.enabled` returning exactly three sites" matches one site, not three; matcher and counted set unstated (se-review ×2, te-author) | §11.1 restated with matcher and counted set | **Yes** |

**E-1.** The delta does not merely re-word the stub — it removes it. A1 and A3 now declare
`verifyGate: null` in all four places the value appears (§4.3's typedef is widened to
`null | (() => Promise<…>)`; §5.5's table; §6.3's A1 member table; §7.2's A3 member table), and each
site carries the same reachability argument: `permittedActions: []` ⇒ every proposal is
out-of-envelope at step 3 ⇒ step 4 never runs ⇒ step 6 is never reached ⇒ `resolved` is unreachable
at that seam. That argument is structural against §5.4's step table, which I re-read: `classifyEnvelope`
at step 3 is what refuses first, so the claim is not a convention the code must remember. The
consequence for the test lens is the one that matters: the mutation FSPEC T-03-6(b) uses as its
falsifier (`verifyGate` replaced by `() => ({ passed: true })` ⇒ the case must fail) no longer
collides with a *shipped* implementation of exactly that shape, so the mutation stays falsifying for
every seam. It also removes the contradiction PROPERTIES recorded against PLAN §8.2 / A-31, whose
gate-exclusivity case asserts `verifyGate == null` for A1 — the PLAN row is now what the TSPEC
specifies rather than a divergence.

**E-2.** §4.3 now states the count explicitly ("Nine members, and `waitMs` is deliberately not a
tenth") and names the reporting surface: the **driver** owns the accumulator and passes a
`recordWait(ms)` sink into seam construction, which only A5 calls. §4.5's sentence is corrected from
"the accumulated check-rollup wait the seam reports" to "the wait **the driver accumulates**", and
§8.2's A5-3 paragraph is updated to route the re-poll's wall-clock through `recordWait`. The asserted
surface is now named — the `waitMs` argument the driver passes into `budgetExceeded` — which is
exactly what PROPERTIES PROP-BUD-03 pins (spy on `budgetExceeded`, read `arg.waitMs`; `0` on every
A1–A4 invocation, `> 0` on an A5 invocation that re-polled, with the positive control that keeps the
property from passing vacuously). Contract and oracle now describe one object.

**E-3.** §11.1's unfalsifiable-as-written grep is replaced by a stated matcher and a stated counted
set: source-text scan for `/\.enabled\b/`, over `pdlc/workflows/orchestrate-dev.js` and
`pdlc/workflows/orchestrate-queue.js` only (never `dist/*.bundle.js`, which inlines both modules and
would double every hit), expecting **exactly three** — driver early return, config-notice gate,
distil guard — with `parseAdvisoryConfig`'s body sliced out before counting, and the reason for the
exclusion given (the parser reads the key, not a resolved field, so a destructuring-vs-`section.enabled`
refactor must not move the expected total). It also disposes of the fourth-read question the report
raises: the disabled/enabled-but-quiet distinction is derived from the advisory `_state`, not from a
fourth `enabled` read. I checked this against PROPERTIES §10.1's PROP-DIS-06 and it is transcribed
verbatim — same matcher, same file set, same exclusion, same three-member counted set, same
PROP-SUM-06 carve-out. Cross-document drift on the one assertion whose whole value is its exact
matcher is what this erratum was for, and it is closed.

## Findings

None. No High, Medium, or Low finding arises from this delta.

**Regression check against what I approved at v6.** The delta touches §4.3, §4.5, §5.5, §6.3, §7.2,
§8.2, §11.1, the header version row, and §18's changelog — nothing else. I re-read every changed
region plus the two unchanged regions the changes could falsify:

- **§5.4's step table** (unchanged) still lists step 6 as `seamOps.verifyGate()`. A nullable member
  would be a latent `TypeError` if the driver could reach step 6 with `verifyGate: null` — §4.3 closes
  that explicitly ("the driver reaches `verifyGate` only on a seam whose `permittedActions` is
  non-empty, so the nullable member is never invoked as `null`"), and step 3's `classifyEnvelope`
  refusal is the mechanism. No driver branch on `verifyGate == null` is introduced, so §4.4's uniform
  seven-step order — pinned by PROP-LIFE-02's exact eight-element call log — is untouched.
- **§5.5's closing BR-6 sentence** (unchanged) still reads "the driver's only route to `resolved`
  runs through `verifyGate`". With A1/A3 having no gate and no route to `resolved` at all, the
  sentence remains true (vacuously at those two seams) and BR-6's oracle is unweakened. See Q-01.
- **PROPERTIES coupling.** PROP-BUD-03, PROP-DIS-06, PROP-SUM-06 and the PLAN A-31 gate-exclusivity
  case all now agree with the TSPEC text; the delta closes three cross-document divergences and opens
  none. §18's v1.3 row names each edit and its rationale.

No test obligation was removed, no oracle weakened, no seam count or lifecycle step changed.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.5's BR-6 sentence ("the driver's only route to `resolved` runs through `verifyGate`") is now true in two different ways: through the gate at A2/A4/A5, and vacuously at A1/A3 where `resolved` is unreachable. It reads fine, but a half-sentence — "…and at A1/A3 there is no route to `resolved` at all" — would make the quantifier explicit for whoever writes T-03-6(b)'s per-seam case. Editorial, not a condition of this approval. |

## Positive Observations

- All three items are resolved at the level a testing lens cares about — the **oracle**, not the
  prose. E-1 deletes a shipped implementation that collided with a mutation oracle; E-2 names the
  surface an assertion can read; E-3 replaces a matcher that matched one site with a matcher, a file
  set, and an exclusion rule. In each case the document now says something a test can be written
  from without a clarifying question.
- E-1 is fixed in all four places the stub appeared rather than the one the finding cited, and the
  typedef was widened to match. A partial fix here would have left §4.3 declaring a non-nullable
  member while §5.5 assigned `null` — the kind of divergence that surfaces as a type error at
  implementation time, not review time.
- E-3's fix pre-empts the obvious follow-on defect: it says *why* `parseAdvisoryConfig` is excluded
  (so a legitimate refactor of the parser cannot move the expected total) and *why* the report site
  is not a fourth read (it derives from `_state`). That is the difference between a count that stays
  green for the right reason and one that gets loosened the first time someone touches the parser.
- The three edits are narrowly scoped and additive, and §18's v1.3 row records each with its
  rationale. Nothing settled at v1.1/v1.2 was reopened, and the delta is legible without re-reading
  the document.

## Recommendation

**Approved**

All three erratum items are resolved on their merits, and the delta breaks nothing I approved at v6.
My prior approval of TSPEC-pdlc-advisory-tier stands and extends to v1.3. Q-01 is editorial, carries
no severity, and is not a condition of this approval.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
