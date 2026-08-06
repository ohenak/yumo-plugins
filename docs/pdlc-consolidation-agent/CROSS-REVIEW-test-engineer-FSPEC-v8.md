# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v8.0)
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`). Baseline for the diff is `27eeab1` — the commit
v7 was written against; the revision is five commits, `82256e9`…`f264860`, +25/−18 lines. Prior
findings M-01, L-01, L-02, L-03 are verified for disposition; new observations are drawn **only**
from changed text.

## Prior findings — disposition

All four v7 findings are **resolved**, and both v7 questions are answered in the document. Each was
checked against the revised text and, where it made a claim about this repository or about another
section, against the cited target.

| v7 ID | Sev | Disposition | Evidence in v8.0 |
|----|---|---|---|
| M-01 | Medium | **Resolved, exactly as the finding specified** | AT-F21's Given (`:2067`) now pins `F` as "**`action: promote`**, `route: degraded`" and states why: "`F`'s `action` and `route` are stated because BR-25 and BR-33c decide `F`'s downstream state from them, and `route: degraded` is what makes §6.4 read the pair `absent` so the re-derivation is live rather than suppressed". Conjunct (3)'s `F` arm is rescoped to the missing `target` — "**§8.6 routes no remediation for `F`, and no `target` is guessed for it on the stored record**" — and the two clauses that were red on conforming behaviour ("not routed", "no write is made on its behalf") are gone, replaced by the positive statement of what *does* happen: "The pass's re-derived promotion for `F` is a *fresh* proposal whose `target` is a function of its kind (§5.2) and is not missing, so it routes and writes normally". The Given now determines the Then on every branch; the fixture is buildable |
| L-01 | Low | **Resolved** | §8.1's set-equality lead (`:1135-1137`) drops the broken "the four in the paragraph below" pointer and transcribes the set inline: "§5.1, §8.6, §6.4, §8.4 step 1, §10.2 order 2, §8.3 and §8.5, seven, one row each, and no reader of a failure-mode record anywhere in this document outside that set". I re-counted the table (`:1141-1147`): seven rows, set-equal to the seven named. The claim and its audit trail now agree |
| L-02 | Low | **Resolved, and in the durable form** | AT-F21's reader-table citation is no longer a line number: "(§8.1's reader table, the §8.6 row)". A section-and-row anchor survives every edit, which is what makes this the repair rather than `:1131` → `:1141`. That the same revision reintroduced the defect it just fixed, one section away, is L-01 below |
| L-03 | Low | **Resolved** | §8.2 (`:1237-1242`) now names the two-action-one-subject pass: "**No fixture in §13 covers that two-action-one-subject pass** — every §13 row is single-action over a subject by construction (AT-R6b's five fixtures) or partitions on PR-opening rather than on action multiplicity (AT-Q7, AT-Q7c) — so it is named **PROPERTIES-owned per DEC-LAYER-01**, with its observable stated here: two records under two keys, both writes made, and the guard-set one made as a PR." It also names the defective implementation ("folds the two actions into one key and makes one write, or suppresses the guard-set write as if consequence 2 bound it"), which is the oracle the deferred owner inherits |
| Q-01 | — | **Answered, in the row, as a literal** | AT-F21's Given now pins the third record — "one well-formed record for id `W`, **`action: retire`, `route: constraints`** (a landed retirement, so `W` is closed by BR-33c and the expected open set below is a literal, not a description)" — and conjunct (3) writes the expected set as **`{E, F}`** with a per-member justification. I re-derived it against the rules rather than the prose: §8.4 step 1 indexes `failure-mode-id`, `action`, `route` (`:1144`), so `E` — short of `route` — is skipped for that contract and stays open; `F` carries `action: promote`, so no `retire` record exists for it and BR-33c (`:2459`) cannot close it; `W`'s `retire` at a non-`degraded` route is exactly BR-33c's closing predicate. `{E, F}` is right, and it is a literal, so the set-equality is falsifiable in both directions |
| Q-02 | — | **Answered by ownership, correctly left where it is** | §8.1's §8.3 row is unchanged and still names the unavailable-path cell an observable owned by TSPEC per DEC-LAYER-01; BR-33a's AT cell (`:2457`) now carries the same statement, so the deferral is recorded on the rule as well as in the prose. The check I asked for is a TSPEC-author check and remains on record here; it was never a change this layer owed |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
