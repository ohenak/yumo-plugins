# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** Delta re-review of the TSPEC revision `5ebec75`→HEAD (`afd916e`, `8c8f311`, `921dbab`, `590f12d`) against REQ v1.4 and FSPEC; product fidelity only; grounded against the branch working tree and git history.

## Delta context

My v1 verdict was *Approved with minor changes* (1 Low: F-01 candidate-directory locality; 2 Questions). The four revision commits address the SE reviewer's F-01…F-04, my F-01, and both my Questions. I re-verified each prior item (all resolved — see below) and scanned only the changed sections. One changed section (§11.2, expanded this revision) introduces a **High** product-fidelity defect: it reinterprets FSPEC acceptance test D-6 on a factually false premise.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§11.2 changes FSPEC-pinned acceptance test D-6's baseline commit on a false premise, and routes an unwarranted FSPEC erratum.** The new §11.2 block (`1206-1229`) asserts "code that `26c3f1c` **predates**… `raisePrAndVerifyCi` was introduced by `4d5e4dc`, **after** `26c3f1c`" — and §1.1 (`39-40`), now load-bearing for this claim, says the same ("`26c3f1c` predates Phase PUB's `raisePrAndVerifyCi`… on the branch tree but not at `26c3f1c`"). Both are **inverted**. Ground check: `4d5e4dc` ("Add Phase PUB…", 2026-06-23) is an **ancestor** of `26c3f1c` (2026-08-03) — `git merge-base --is-ancestor 4d5e4dc 26c3f1c` ⇒ true — and `git grep -c 'raisePrAndVerifyCi' 26c3f1c -- pdlc/workflows/orchestrate-dev.js` ⇒ **4**. So `26c3f1c` **already carries** `raisePrAndVerifyCi` and every Phase PUB file-creating path. FSPEC D-6 (`FSPEC:831`) and T-10-3 (`FSPEC:851`) explicitly pin the transcribed-literal baseline to `26c3f1c`; that pin is **correct**. On the false premise the revision (a) substitutes "the pre-feature branch tip" for `26c3f1c` as the D-6 baseline, (b) renames the fixture `created-files-26c3f1c.json` → `created-files-prefeature.json` (§11.2, §14.2 `1406`), and (c) raises `> Upstream note (routed as an erratum)` (`1226-1229`) flagging FSPEC D-6's `26c3f1c` pin as defective. This reinterprets an acceptance criterion the FSPEC fixes verbatim, and would send the FSPEC author to "fix" a pin that is not broken. **Resolution:** restore the FSPEC-faithful `26c3f1c` baseline and the `created-files-26c3f1c.json` fixture name, delete the erratum note, and drop the false "predates" clause from both §1.1 and §11.2. If a baseline other than `26c3f1c` is genuinely required (e.g. a *later* file-creating commit that `26c3f1c` truly predates), that must be justified on a verified-true ground and taken back to the FSPEC — not asserted against `26c3f1c`, which contains the cited code. | REQ-ADV-10 / FSPEC D-6, T-10-3 |

## Prior items — disposition

| Prior | Status | Where resolved |
|-------|--------|----------------|
| v1 F-01 (Low — candidate-directory locality of A1/A2 record) | **Resolved** | §6 new block (`642-648`): pins `feature = candidate feature`, states the A1/A2 record lands at `docs/{candidate-feature}/ADVISORY-{candidate-feature}.md` "under the candidate feature's directory, exactly as AC-9.1 requires" — the obligation is now stated where a reader looks, not inferred across §5.2/§6.3/§9.1. |
| v1 Q-01 (self-pin vs live HEAD drift) | **Resolved** | §1.1 new "Pin vs. live HEAD" block (`28-35`): documents that docs-only commits advance HEAD past the source pin `5d66c48` while leaving citations intact, with an `is-ancestor` cross-check. Citation hygiene, not product fidelity — satisfactory. |
| v1 Q-02 (REQ summary omits `no-action`) | **Addressed** | §17.1 (`1494-1500`) now states the disposition set is closed and total over `{resolved, escalated, no-action}` (FSPEC V-7), and §13.5's `advisorySummaryRows` property re-states `invocations === resolved + escalated + noAction`. The `no-action` remainder is now explicit tier-side; any REQ-side enumeration clarification remains a REQ author's judgment, not a TSPEC blocker. |

## Changed-section scan (new material, product lens)

- **§5.3 `ADVISORY_EXCLUSIONS`** (`562-573`): exports `["X-a","X-e","X-d","X-b","X-c"]` — set identity `{X-a…X-e}` matches FSPEC's five exclusions exactly (no member added/dropped); array order is documented as §5.1 evaluation order. Contract-faithful. No finding.
- **§5.4 P-2 row** (`592`): the revised prose *strengthens* the "never set `ready:true`" guarantee — a frontmatter edit is now shown to fail at membership (not-in-`permittedActions`), observable reason `out-of-envelope`, with a named falsifying fixture. Prohibition preserved. No finding.
- **§8.3 T-06-8** (`876-884`): adds a workflow-level integration test driving the real Phase DOD body (`dev:8281`) end-to-end for the no-`testCommand` escalation path — satisfies the AC→production-caller demand rather than testing `verifyGate` in isolation. Positive; `dev:158-161` (`testCommand: null` default) verified present.
- **§13.5 properties** (`1342-1356`): the two new parser properties pair positive and negative oracles (`parseAdvisoryVerdict`: malformed⇒`why` names the field / well-formed⇒field-equal echo) and assert set-equality ("exactly the four known keys") rather than containment. No absence-only oracle, no implementation echo. No finding.
- **§17** (`1489-1538`): tier-wide invariants. §17.1 (closed/total disposition set), §17.2 (escalation log has no reader ⇒ first-entry immutability is structural), §17.3 (terminal catch maps the unenumerated case to `escalated`, **never** `resolved`) directly reinforce the product's "never claim a resolution / never declare a gate passed" promise (P-1…P-4). Positive. Minor prose wrinkle: §17.1 says "no fourth terminal value" then "four terminal facts" (3 outcomes + the unchanged `throw haltError`) — legible on a careful read, not a product defect.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §11.2's *decision* to compare a disabled run's created-file set against the pre-feature branch tip is defensible **in the abstract** (the branch tip is by construction a valid additivity baseline). The problem in F-01 is the false factual justification and the resulting FSPEC erratum, not the abstract choice. If, after correcting the "predates" error, the pre-feature tip and `26c3f1c` are the same tree (or `26c3f1c` is an ancestor with no intervening file-creating commit), the two baselines are equal by construction and D-6's original `26c3f1c` pin should simply stand — is there any *verified* file-creating commit between `26c3f1c` and this feature's first implementation commit that would make the two sets differ? If not, F-01's resolution is simply to revert to `26c3f1c`. |

## Positive Observations

- **My v1 F-01 is resolved cleanly** and at the right locality — the candidate-directory obligation (AC-9.1) is now stated in §6 in prose, not inferred.
- **The contract-fidelity surface I approved in v1 is intact under the diff.** The new `ADVISORY_EXCLUSIONS`/`ENVELOPE_DEFAULTS` frozen literals preserve set identity with FSPEC's X-a…X-e and E-1…E-4; the P-2 strengthening does not narrow the prohibition; §17.3 makes the "never claim resolution" promise structural.
- **The test-quality discipline this review must demand is present in the new material** — §8.3 drives the production Phase DOD path, §13.5 pairs positive/negative oracles and uses set-equality, and no new expectation derives its expected value from the code under test.

## Recommendation

**Needs revision**

One High finding (F-01). The revision is otherwise sound and resolves every prior item; the single blocker is that §11.2 reinterprets FSPEC acceptance test D-6 — changing its pinned baseline commit and raising an FSPEC erratum — on a claim (`26c3f1c` predates `raisePrAndVerifyCi`) that is verifiably false against git history (`4d5e4dc` is an ancestor of `26c3f1c`; `raisePrAndVerifyCi` is present at `26c3f1c`). Restore the `26c3f1c` baseline and fixture name, withdraw the erratum, and drop the false "predates" clause from §1.1 and §11.2. No ERRATUM is emitted from this review: the FSPEC D-6 pin is correct as written — the defect is the TSPEC's, not the FSPEC's.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}
