# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.12)
**Date:** 2026-08-20
**Iteration:** 2

## Delta Basis

Delta re-review against `5f2a88e7` (the commit at which v1 was written; REQ at v1.11). `git diff`
over `REQ-pdlc-advisory-wave-gate.md` reports **28 insertions, 17 deletions across 7 hunks** — the
frontmatter `ready` flag, the v1.12 changelog block, two baseline-version citations (v1.1 → v1.2),
§1's drift paragraph, AC-1.2's anchor, AC-2.4's zero-budget conjunct, AC-3.5, AC-4.1 and O-4. Only
those sections were scanned; sections unchanged since v1 were approved there and are not
re-litigated.

Every existing-behaviour claim inside the changed sections was re-measured at the working tree, not
read out of the document:

| Delta claim | Site verified | Result |
|---|---|---|
| Frontmatter `ready: true`; PR #66 merged at `bb4d36fb`; QUEUE row 19 `done` | `gh pr view 66` (`state: MERGED`, `mergeCommit.oid` `bb4d36fb50d4…`); QUEUE row `\| 19 \| done \| pdlc-advisory-wave-gate \|` | Holds on all three |
| Baseline cited at v1.2 (two sites) | `docs/_constraints/pdlc-wave-gate-baseline.md`'s `Version` field reads `1.2 · 2026-08-20` | Holds; the version-pinned-citation rule that file states is satisfied |
| §1 — `build-runtime.mjs --check` reports the tracked artifact in-sync, exit `0` | `node pdlc/workflows/build-runtime.mjs --check` prints `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`, exit `0` | Holds exactly, including the exit code |
| §1 — the gitignored consumer copy under `.claude/workflows/` differs from it | `.gitignore:40` carries `/.claude/workflows/`; `cmp` of `.claude/workflows/pdlc-cli.mjs` against `pdlc/workflows/dist/pdlc-cli.mjs` reports a difference, and the two `*.bundle.js` files there have no `dist/` counterpart at all | Holds, and is the *weaker* claim — v1.11's "three rows stale and one missing" is correctly withdrawn |
| AC-1.2 — post-wave runs once; failure halts immediately (symbol anchor) | `runWaveGateSequence`'s single `runCommandFn(implConfig.postWaveCommand)` call and its `return { failed: "post-wave", … }`; the wave loop's `throw haltError` naming `implConfig.postWaveCommand` | Holds, and the anchor now resolves — F-02 closed |
| AC-2.4 — `waveBudgetPerRun` admits any integer ≥ 0 | the advisory validator binds `waveBudgetPerRun: nonNegativeInt("waveBudgetPerRun")`, sibling to `positiveInt`; `advisoryConfig.test.js`'s PROP-CFG-02 pins `0` surviving as configured and not reported invalid | Holds |
| AC-2.4 — at `0` with the tier on, every red wave escalates with no dispatch | the wave-budget escape returns `{ __preDispatch: { outcome: "escalated", reason: "budget-exhausted" } }` when `waveBudget.resolved >= advisoryConfig.waveBudgetPerRun`, and the driver's `__preDispatch` branch terminates with no agent call; `advisoryWaveGate.test.js`'s PROP-CTR-13 asserts `agent.calls` is empty | Holds |
| AC-2.4 — under `advisory.enabled: false` there is no advisory section | the report builds `advisory: advisoryTierOn ? advisorySummaryRows(…) : undefined` on both the success and halt paths, and the tier-disabled A6 return carries `disposition: null` so nothing is pushed | Holds |
| AC-2.4 — at `0` the per-seam A6 row "reads zero" | `advisorySummaryRows` counts `forSeam.length` as `invocations`, and the budget-exhausted disposition carries `seam: "A6"` and is pushed by the wave loop's `if (a6.disposition) advisoryDispositions.push(a6.disposition)` | **Does not hold** — see F-01 |
| C-5 — REQ inside the size budget | 647 lines / 52,156 bytes against `check-req-size.sh`'s `LINE_LIMIT=700` / `BYTE_LIMIT=61440` | Holds, with 53 lines of headroom |

## Prior-Finding Disposition

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Partly resolved** — the AC landed, its oracle is wrong | AC-2.4 now carries the `waveBudgetPerRun: 0` conjunct with the range, the no-dispatch behaviour and the contrast against AC-1.4. Three of its four clauses verify at HEAD; the fourth ("the per-seam A6 row … reads zero") is falsified by the shipped summary. Re-filed as F-01 below |
| F-02 | Low | **Resolved** | The `orchestrate-dev.js:12331-12343` range is gone; AC-1.2 now cites "the wave gate sequence's `failed: \"post-wave\"` early return, and the wave loop's `haltError` on it". Both symbols resolve at HEAD, and the anchor survives unrelated edits to the file. The clause also drops the overstated "already attempted" framing |
| F-03 | Medium | **Resolved** | O-4 now reads "…and how the gate output is matched against a later PLAN row's undertaking for E-6's first conjunct, are TSPEC's", and adds an explicit `Owner: this feature's TSPEC.` E-6's non-decidable conjunct now has the named downstream owner its sibling rules carry, which is the cheaper of the two fixes I proposed and the one that matches E-5's handling |
| F-04 | Low | **Resolved** | All three test-design pins are gone. AC-4.1 keeps its three positive conjuncts (correctly — that was the substance I asked not be reversed) but drops "so three fixtures" and the mutation recipe, ending "how a fixture reaches it is PROPERTIES'". AC-3.5 drops "asserted by its own test" in favour of "Every excluded operation … carries that outcome; the test decomposition is PROPERTIES'" — note this also strengthened the criterion from per-item test assignment to per-item *outcome*, which is the right altitude and the stronger claim |

No prior finding regressed, and no unchanged section was disturbed by the revision.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | AC-2.4's new zero-budget oracle is falsified by shipped behaviour: at `waveBudgetPerRun: 0` the A6 summary row reads `invocations: 1, escalated: 1` per red wave, not zero | AC-2.4 |
| F-02 | Low | Local | AC-2.4 does not say whether the zero-budget escalation carries a root-cause class, leaving AC-6.4's countability undefined in that mode | AC-2.4, AC-6.4 |

### F-01 (High, Local) — the zero-budget row does not read zero

AC-2.4's new conjunct states:

> `advisory.waveBudgetPerRun` admits any integer ≥ 0; `0` is a configured operator mode, not a
> misconfiguration: with the tier enabled every red wave then escalates with no dispatch,
> distinguishably from AC-1.4 inertness — the per-seam A6 row is present and reads zero, where under
> `advisory.enabled: false` there is no advisory section.

Three of the four clauses verify (see the Delta Basis table). The fourth does not. Traced end to end
at HEAD:

1. The wave-budget escape fires when `waveBudget.resolved >= advisoryConfig.waveBudgetPerRun` — at
   `0` that is `0 >= 0`, true on the first red wave — and returns
   `{ __preDispatch: { outcome: "escalated", reason: "budget-exhausted" } }`.
2. The driver's `__preDispatch` branch calls `terminate({ outcome: "escalated", reason, verdict: null,
   … })` with **no agent call**, and the terminal disposition it builds carries `seam: "A6"`.
3. `runWaveGateSeam` returns that as `disposition`, non-null.
4. The wave loop pushes it: `if (a6.disposition) advisoryDispositions.push(a6.disposition);`.
5. `advisorySummaryRows` computes each row's `invocations` as `forSeam.length` and its `escalated` as
   the count of `outcome === "escalated"`.

So the A6 row on a run with one red wave at `waveBudgetPerRun: 0` reads
`{ invocations: 1, resolved: 0, escalated: 1, noAction: 0 }`. `advisoryWaveGate.test.js`'s PROP-CTR-13
pins exactly this path — `result.disposition.outcome === "escalated"`, `reason ===
"budget-exhausted"`, `agent.calls` empty, one `commit-tree` — confirming the disposition is real and
recorded, not suppressed.

This is a High finding rather than a wording nit because the clause **is** the oracle. Under the
no-implementation-echo rule a PROPERTIES author transcribes an AC's expected value literally: written
from AC-2.4 as it stands, the test asserts the A6 row reads zero and goes RED against correct shipped
behaviour. The only two ways out of that are both bad — weaken the assertion by reading the code
(an implementation echo, the exact failure mode the rule exists to prevent), or "fix" the runtime to
suppress a disposition that E-26 deliberately records. The clause also undercuts its own purpose: the
distinguishing observable against AC-1.4 inertness is *stronger* than stated, since a nonzero
escalated count is positive evidence the tier ran, where a zero row would be weak evidence
indistinguishable from "the seam never fired" (the ambiguity S-3 exists to resolve for A5).

Resolving change: state the row's actual contents. E.g. "…the per-seam A6 row is present and reads
`resolved: 0` with one `escalated` invocation per red wave, where under `advisory.enabled: false`
there is no advisory section at all." That keeps the AC-1.4 contrast intact, gives PROPERTIES a
positive oracle on both columns, and matches the shipped summary exactly.

Note for the author: the same "the sixth summary row reads zero" phrasing appears in the TSPEC's
config table, which is downstream of this document — no erratum is raised here, but the TSPEC will
need the same correction when this AC lands.

### F-02 (Low, Local) — the zero-budget escalation's root-cause class is unstated

This is v1's Q-01 restated as a finding now that the mode has an AC of its own. AC-2.2 makes the
root-cause vocabulary total and AC-6.4 makes `plan-ordering-defect` countable across runs. At
`waveBudgetPerRun: 0` no dispatch happens, so no reply is classified — at HEAD `capturedRootCause`
stays `null` and the halt fields fall back to `"unclassified"`. That is a coherent answer, but
AC-2.4 does not state it, so a PROPERTIES author has no upstream oracle for what the escalation's
class is in the mode the AC now blesses.

Low, not Medium: the fallback is already required by AC-2.2's totality rule, so nothing is
unconstrained — only unstated at the point a reader would look for it.

Resolving change: add half a sentence to AC-2.4 — "the escalation carries `unclassified`, no reply
having been classified (AC-2.2's default)".

## Questions

## Positive Observations

## Recommendation

## Verdict
