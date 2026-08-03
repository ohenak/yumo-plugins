# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** Delta re-review of the TSPEC revision `590f12d`→HEAD (`3701694`, `18f531b`, `dd46b66`) against REQ v1.4 and FSPEC; product fidelity only; grounded against the branch working tree and git history.

## Delta context

My v2 verdict was *Needs revision* on a single High finding (F-01): §11.2 and §1.1 reinterpreted FSPEC acceptance test D-6 — substituting "the pre-feature branch tip" for the FSPEC-pinned `26c3f1c` baseline, renaming the fixture `created-files-26c3f1c.json` → `created-files-prefeature.json`, and raising an FSPEC erratum — all on the factually inverted premise that `26c3f1c` **predates** `raisePrAndVerifyCi`.

The three revision commits address exactly that finding (`3701694` drops the false "predates" clause from §1.1; `18f531b` restores the `26c3f1c` baseline, the `created-files-26c3f1c.json` fixture name, and withdraws the FSPEC erratum) plus one test-engineer Low (`dd46b66`, §7.4/§8.3 T-06-8 attribution). I re-verified F-01's resolution on ground and scanned only the changed sections. No open High or Medium remains.

## Prior finding — disposition

| Prior | Status | Where resolved (ground check) |
|-------|--------|-------------------------------|
| v2 F-01 (High — §11.2 reinterprets D-6's baseline on a false "predates" premise, routes an unwarranted FSPEC erratum) | **Resolved** | §1.1 (`38-47`) and §11.2 (`1210-1227`) now assert the **true** ground: `4d5e4dc` ("Add Phase PUB…") is an **ancestor** of `26c3f1c` — `git merge-base --is-ancestor 4d5e4dc 26c3f1c` ⇒ **true** — and `raisePrAndVerifyCi` is present at `26c3f1c` (`git grep -c` ⇒ **4**; defined at `26c3f1c:6222`, matching the TSPEC's cited line exactly). The baseline is restored to `26c3f1c` "exactly as FSPEC D-6 / T-10-3 fix it", the fixture is renamed back to `created-files-26c3f1c.json` (§11.2 and the §14.2 manifest row `1405`), and the `> Upstream note (routed as an erratum)` block is deleted. The FSPEC pin is no longer contradicted; no erratum is routed. |

## Changed-section scan (new material, product lens)

- **§1.1 "Pin vs. live HEAD" block** (`38-47`): the corrected prose now grounds the two-pin rationale on *file churn between `26c3f1c` and HEAD* (line numbers re-read at HEAD to stay navigable) rather than on a missing symbol. Every named symbol is stated to resolve at both commits — verified for `raisePrAndVerifyCi`. The behavioral-baseline invariant (`26c3f1c` is an ancestor of HEAD) is unchanged and re-verified true. Citation hygiene, not a product decision. No finding.
- **§7.4 / §8.3 T-06-8** (`864-890`, `dd46b66`): the routing proof for E-24 ("A4 repo has no `testCommand` ⇒ reverted, escalated — unverifiable ≠ resolved", REQ-ADV-07) is re-attributed. Because the real `verifyGate` runs *inside* the faked seam in the phase-integration test, that test now honestly asserts only the **phase wiring** (a scripted `escalated` disposition threads through the real Phase DOD body to the report and the pre-existing `haltError`), while the `testCommand: null → revert+escalate` **branch** is proven at the **Seam-unit** level (§13.2, E-24 → §7.4) where a real `SeamOps` runs against fakes of the pure IO seams and the real `verifyGate` sees `testCommand: null`. From the product lens this **preserves — does not narrow** — the AC→production-path coverage I approved in v2: the E-24 acceptance criterion still traces to a test that drives the real decision code (`verifyGate`, not an isolated builder), and the two tests together cover branch + wiring. Cited grounds verified: `parseImplementationConfig` at `dev:181`, `testCommand: null` default at `dev:158-161`, E-24 present in the §13.2 catalogue routing to §7.4. Positive, no finding.

## Questions

None. My v2 Q-01 (whether the corrected baseline is genuinely `26c3f1c`) is answered by the revision on verified-true ground: `26c3f1c` already carries every file-creating pipeline path a disabled run at HEAD exercises, the disabled tier is a strict no-op (§11.1), and the feature's own commits are the only pipeline-behavior diff — so the `26c3f1c` fixture is a faithful additivity baseline and D-6's original pin stands.

## Positive Observations

- **F-01 is resolved at the root, not papered over.** The revision did not merely revert the baseline name — it corrected the false premise in both §1.1 and §11.2 and withdrew the erratum, so the FSPEC author is no longer sent to "fix" a pin that was correct. The contract fidelity to FSPEC D-6 / T-10-3 is now exact.
- **The T-06-8 re-attribution raises test honesty.** The prior text claimed the phase-integration test proved a routing branch that its own fake made unobservable; the revision correctly separates wiring (phase-integration) from the branch decision (seam-unit against the real `verifyGate`). The AC still lands on a production-driving test.
- **Everything I approved across v1/v2 is intact under this diff** — the frozen `ADVISORY_EXCLUSIONS`/`ENVELOPE_DEFAULTS` set identity, the P-2 prohibition strengthening, §17's structural "never claim resolution" invariants, and the candidate-directory locality of the A1/A2 advisory record are all untouched.

## Recommendation

**Approved**

The single High finding from v2 is fully resolved on independently verified ground, and the one other changed section is a faithful test-attribution correction that preserves the product-relevant AC→production coverage without narrowing any acceptance criterion. No open High, Medium, or Low finding remains.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
