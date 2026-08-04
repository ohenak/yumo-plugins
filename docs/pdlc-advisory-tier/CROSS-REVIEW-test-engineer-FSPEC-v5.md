# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` (v1.4)
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** delta re-review of the single erratum-withdrawal commit `1950734` against the v4 base
`3bbf934`. One question only: is my v4 F-01 resolved, and did the revision break anything I had
already approved? Sections untouched by `1950734` are not re-litigated.

## Delta basis

`git diff 3bbf934 HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` — one commit,
`1950734`, three hunks: the version header (1.3 → 1.4), **§12.1 D-6**, and **§12.2 T-10-3**. Nothing
else in the document changed, so the two erratum items I confirmed in v4 (§4.1 A2/A5 ordering, §3.2
C-2 report gating) are untouched and stand.

Grounding cross-checks run against the objects, not the prose:

| Claim now in v1.4 | Check | Result |
|---|---|---|
| D-6's right-hand side is the created-file set of a run at `26c3f1c`, the pre-feature baseline §2 pins | `git merge-base --is-ancestor 26c3f1c origin/main` | **Holds.** `26c3f1c` is an ancestor of the default branch, so it carries every already-merged pipeline change. |
| That baseline exercises the same file-creating pipeline code a disabled branch-HEAD run does (`raisePrAndVerifyCi` / Phase PUB) | `git show 26c3f1c:pdlc/workflows/orchestrate-dev.js` | **Holds.** `export async function raisePrAndVerifyCi({` at `orchestrate-dev.js:6222` (26c3f1c); `PHASE_PUB_ENABLED = true` at `:28`; the `{ prUrl, ciStatus }` returns at `:6254` / `:6282`; dispatched at `:8257`. This is the fact that disproved my own v4 erratum. |
| `26c3f1c` is genuinely *pre-feature* — the advisory tier is not implemented there | grep `advisory` in `orchestrate-dev.js` @ `26c3f1c` | **Holds.** The only hits are the unrelated `advisoryPacingCheck` helper (`:5362`, `:5382`–`:5402`, §15.7's pacing proxy). No advisory-tier code. |
| No residue of the withdrawn rationale remains | grep `fork point` / `pre-feature base` / `may sit ahead` in the FSPEC | **Holds.** Zero hits; §12.1 and §12.2 read consistently against `26c3f1c` and against §2's pin (`:84`, `:90`). |

**Repo-state note (not a finding against this document):** the tree I reviewed is local `HEAD`
`70027d2`, which carries `1950734`. `origin/feat-pdlc-advisory-tier` (`eaa1f74`) is a **diverged**
lineage — merge base `7cdfbb0`, 164 commits remote-only — and does **not** contain `1950734`; its
FSPEC is still the v1.3 text. Per my skill I did not pull in the shared tree. Flagging so the
orchestrator resolves the branch divergence before this approval is treated as covering what is on
the remote; it changes nothing about the document reviewed here.

## Prior finding — disposition

| Prior ID | Finding (v4) | Status |
|---|---|---|
| F-01 (High) | The §12.1 D-6 / §12.2 T-10-3 baseline change rested on the false premise that `26c3f1c` predates `raisePrAndVerifyCi` / Phase PUB; the fix was to withdraw both D-6 errata and restore the baseline to `26c3f1c`. | **Resolved, exactly as asked.** `1950734` restores D-6's literal to "the created-file set of a run of the pipeline at the pre-feature baseline commit §2 pins (`26c3f1c`)" and T-10-3 to "a pre-feature run at `26c3f1c`", and deletes the reversed "may sit ahead" rationale outright rather than papering over it. Both the ancestry and the `raisePrAndVerifyCi`-at-`26c3f1c` facts are re-verified above. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | None. No open finding, old or new. | — |

New-issue scan over the changed sections only — checked and **not** filed:

- **D-6 is still a set-equality oracle, not a containment one.** The restored wording keeps "**equal**
  … not merely free of the two artifacts D-4 names", and T-10-3 keeps "equals, element for element,
  the transcribed literal set of D-6" plus the explicit red direction ("any file created outside that
  literal set fails the test, whether or not this feature named it"). A file this feature never named
  still fails it — which is the property a deleted-case-must-fail oracle needs.
- **No implementation echo re-entered the oracle.** The expected value remains "observed once and
  transcribed into the test, never re-derived by running the code under test", and the sentence naming
  why ("a comparison whose expected value is produced by the system under test cannot fail") survived
  the edit intact.
- **T-10-3 keeps its positive conjuncts alongside the negatives.** The negatives (no `ADVISORY-*`
  file, no `ESCALATIONS.md` entry, no advisory summary) are paired on the same path with the positive
  set-equality assertion on the created-file set; T-10-5 remains the enabled-side discriminator
  (advisory summary present, five zero rows), so neither direction is absence-only.
- **T-10-4 still routes through T-10-3.** The absent-`advisory`-section and malformed-config runs
  inherit the restored baseline by reference, so the withdrawal did not desynchronise them.

## Questions

| ID | Question |
|----|---------|
| — | none |

## Positive Observations

- **The withdrawal is clean, not a compromise.** The erratum was withdrawn by restoring the original
  text and deleting the unverified rationale, rather than by hedging both baselines into one sentence
  — so §12.1 carries exactly one named baseline and T-10-3 has exactly one thing to transcribe.
- **Blast radius is minimal and verified.** Three hunks, no collateral edits, no stale cross-reference
  left behind (`fork point` / `pre-feature base` / `may sit ahead` all return zero hits), and the two
  sound erratum items from `3bbf934` are untouched.

## Recommendation

**Approved**

My single v4 High finding is resolved by `1950734`, and both facts it turned on are re-verified
against the objects: `26c3f1c` is an ancestor of the default branch and already carries
`raisePrAndVerifyCi` (`pdlc/workflows/orchestrate-dev.js:6222` @ `26c3f1c`) with Phase PUB enabled
(`:28`), while carrying none of this feature's advisory code. The changed sections introduce no new
issue, and the set-equality, no-echo, and paired-positive properties of T-10-3 all survived the edit.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:179c3fe23b3ec6ed594b22e25805420363e5231da708f51969fdba1a4ce1e3e3
REVIEWED-COMMIT: 70027d2b61e28569f05873514265b68c40b31ba0
