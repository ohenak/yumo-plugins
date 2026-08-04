# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md (v1.5)
**Date:** 2026-08-04
**Iteration:** 7

**Scope:** `Local` — delta re-review of FSPEC v1.5. The document was approved at `CROSS-REVIEW-software-engineer-FSPEC-v6.md` (VERDICT: Approved, 0/0/0) with tier-1 anchors pinning the reviewed bytes. This round establishes whether anything changed since, and re-grounds the FSPEC's repo-path claims against HEAD. Settled decisions are not re-litigated.

## Delta verification (no delta)

| Probe | Command | Result |
|---|---|---|
| Commits touching the FSPEC since the reviewed commit | `git log --oneline c7dc98f..HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` | **empty** — no commit has touched the file |
| Working-tree diff | `git diff c7dc98f..HEAD -- docs/…/FSPEC-…md` | **empty** |
| Uncommitted changes | `git status --short docs/pdlc-advisory-tier/` | **empty** — no unstaged or staged edits |
| Byte identity with the approved bytes | `shasum -a 256 docs/…/FSPEC-…md` → `7edebd8c03ce3a22dbbabb0221628055ff1e656e3630458e1fdb9a00c2c8fc8c` | **matches** `APPROVAL-HASH` in `CROSS-REVIEW-software-engineer-FSPEC-v6.md:62` exactly |

The v6 approval anchor therefore still pins the bytes on disk. HEAD is `5f7ac89`; the v6 `REVIEWED-COMMIT` is `08925cf`. The seven commits in between (`git log --oneline 08925cf..HEAD`) are all cross-review, DECISIONS-confirmation and POSTMORTEM-resolution documents — `5f7ac89`, `6f32699`, `0aa1d65`, `b896347`, `908e44c`, `b6fd6d3`, `0a9a9e2`. None touches `REQ-pdlc-advisory-tier.md`, `TSPEC-pdlc-advisory-tier.md`, or `DECISIONS-pdlc-advisory-tier.md`, so no upstream document moved under the FSPEC either: the v6 consistency table (FSPEC ⟷ REQ AC-4.5, FSPEC ⟷ TSPEC §5.5/§7.2, DEC-ADV-11) is verified against unchanged counterparties and stands unmodified.

## Prior findings

v6 recorded **no** findings (`{"high": 0, "medium": 0, "low": 0}`), so there is nothing to re-verify as resolved. The v5 approval it confirmed likewise carried none open. No prior High or Medium finding is outstanding at any version.

## Re-grounding: repo-path claims at HEAD

Because approval anchors pin document bytes and not the codebase, I re-ran the existing-code claim sweep in one pass over every repo path the FSPEC names.

| Path named by the FSPEC | State at HEAD | Assessment |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | exists | Consistent — the pipeline the advisory seams attach to |
| `pdlc/workflows/orchestrate-queue.js` | exists | Consistent |
| `pdlc/hooks/scripts/guard-harvest-before-delete.sh` | exists | Consistent — the harvest guard the `ADVISORY-*` lifecycle reasons about |
| `.claude/pdlc.config.json` | exists | Consistent — the config home for the tier's declared settings |
| `docs/_queue/` | exists | Consistent |
| `docs/_queue/ESCALATIONS.md` | **absent** | Correct, not a defect: the FSPEC declares it a *new* artifact this feature creates (FSPEC:764 "a new artifact (B-16)"), specifies its absence as the normal first-run state (FSPEC:801), and pins the create-on-first-entry behaviour in acceptance rows T-09-7 (FSPEC:818) and T-09-8 (FSPEC:819). Its absence at HEAD is exactly the precondition those rows assume |

No path the FSPEC asserts as existing behaviour is missing, and the one absent path is asserted absent.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings. The document is byte-identical to the version approved at v6, every upstream counterparty is unchanged, and every repo path it names resolves as the document describes | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The v1.5 bytes have survived three subsequent document rounds and a POSTMORTEM resolution without drift — the erratum channel did its targeted edit at `c7dc98f` and then left the FSPEC alone, which is the behaviour the bounded one-round-per-doc rule is supposed to produce.
- `ESCALATIONS.md` is the one artifact the FSPEC names that does not exist, and the document already anticipates that state in three places (FSPEC:801, :818, :819) rather than assuming the directory is pre-seeded. T-09-7's Given ("no `ESCALATIONS.md` **and** no `docs/_queue/` directory") covers the strictly harder case than the one HEAD presents.
- T-09-8 pairs the negative write-failure assertion with positive assertions on the same path (still reports `escalated`, disposition not `resolved`, nothing applied, the prior halt/skip stands, failure named on the report) — no absence-only oracle.
- T-10-3 (FSPEC:859) states its disabled-tier completeness as set-equality against a transcribed literal file set captured at `26c3f1c`, and names the red direction explicitly, so a file created outside that set fails whether or not this feature named it.

## Recommendation

**Approved**

The v6 approval carries forward unchanged: no delta in the document, no movement in its upstream counterparties, and every existing-code claim re-verified at HEAD.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
