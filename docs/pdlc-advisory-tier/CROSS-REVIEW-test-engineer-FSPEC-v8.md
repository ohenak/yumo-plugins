# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md (v1.5, last touched by commit c7dc98f)
**Date:** 2026-08-04
**Iteration:** 8

**Scope:** `Local` — delta re-review. Prior review: `CROSS-REVIEW-test-engineer-FSPEC-v7.md`
(VERDICT: Approved, 0/0/0), which itself carried forward the v6 approval anchored at
`APPROVAL-HASH: sha256:7edebd8c…`, `REVIEWED-COMMIT: 08925cf`.

## Delta verification

**The delta is empty for the second consecutive round. The FSPEC is byte-identical to the revision
I approved at v6 and re-confirmed at v7.**

Evidence, re-derived at HEAD `85ac394`:

| Probe | Command | Result |
|---|---|---|
| Commits touching the FSPEC since my last reviewed commit | `git log --oneline c7dc98f..HEAD -- docs/pdlc-advisory-tier/FSPEC-pdlc-advisory-tier.md` | empty |
| Diff since that commit | `git diff --stat c7dc98f..HEAD -- docs/…/FSPEC-…md` | empty |
| Working-tree state | `git status --short` | FSPEC not listed — no modified or untracked copy shadowing the tracked bytes |
| Byte identity to the approved bytes | `shasum -a 256 docs/…/FSPEC-…md` | `7edebd8c03ce3a22dbbabb0221628055ff1e656e3630458e1fdb9a00c2c8fc8c` — **exactly** the `APPROVAL-HASH` recorded at v6 |

The hash check is the decisive one: the v6 approval anchor pins the bytes that were reviewed, and
the file on disk still hashes to them. There is no revision to re-read and no changed section to
scan, so per the delta protocol nothing already approved is re-litigated.

**No upstream document moved beneath the unchanged FSPEC**, so no traceability claim can have gone
stale under it: `git log --oneline c7dc98f..HEAD -- docs/pdlc-advisory-tier/REQ-…md
DECISIONS-…md TSPEC-…md` is empty. The REQ (the source every FSPEC claim must trace to), DECISIONS
(source of DEC-ADV-11) and TSPEC (§5.5 / §7.2 / §4.3, the gateless-A3 contract the v6 delta aligned
to) are all at the same bytes I checked at v6 and v7.

**Base is not stale.** `git rev-parse origin/feat-pdlc-advisory-tier` and `git rev-parse HEAD` both
print `85ac394`; `git rev-list --count origin/feat-pdlc-advisory-tier..HEAD` is `0`. Local and
remote are identical — I am reviewing the newest bytes, not a stale base.

## Grounding re-check

An empty document delta does not by itself prove the document's *claims about the repository* still
hold — the repo can move under a frozen spec. I therefore re-ran the path-existence sweep rather
than inheriting it:

```
grep -oE '(pdlc|docs|\.claude|\.github)/[A-Za-z0-9_./-]+' FSPEC-pdlc-advisory-tier.md | sort -u
```

Every repo path the FSPEC names resolves at HEAD except two, and both are *outputs* the pipeline is
specified to create, not preconditions it asserts:

| Unresolved path | Why it is not a finding |
|---|---|
| `docs/_queue/ESCALATIONS.md` | The escalation ledger this feature itself introduces — the FSPEC describes it as a file the advisory tier writes, so its absence before implementation is the expected pre-state, and its creation is exactly what the acceptance tests falsify. |
| `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` | Written at Phase H (harvest), after implementation; absent by construction at spec time. |

Both were assessed the same way at v6 and neither changed status. No path the FSPEC relies on as an
existing behaviour has disappeared or moved.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings. The delta is empty (byte-identical to the v6-approved bytes, hash-verified), so no changed section exists to raise a finding against; no prior High or Medium finding is open — v6 closed 0/0/0 and v7 re-confirmed 0/0/0. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. An empty delta raises no question the previous rounds have not already answered. |

## Positive Observations

- The tier-1 approval anchor keeps paying off. Because `APPROVAL-HASH` pins bytes rather than a
  commit range, a second consecutive no-op round costs one `shasum` instead of a re-read — and,
  more importantly, an approval that *had* gone stale could not hide behind an empty `git log`
  (an amended commit or an untracked shadow copy would break the hash while leaving the log clean).
- Grounding was re-derived, not inherited: the path sweep was re-run against HEAD this round, so
  the "every named path exists" claim describes the repo as it is now rather than as it was at v6.
- Local and remote are at the identical commit (`85ac394`, 0 commits ahead), so there is no
  divergence between the bytes I reviewed and the bytes any parallel reviewer sees.

## Recommendation

**Approved**

Nothing changed since the revision I approved at v6 and re-confirmed at v7; the approved bytes are
still the bytes on disk (hash-verified against the v6 anchor); no upstream document moved beneath
them; and every repo path the FSPEC names still resolves at HEAD apart from two files the feature
is specified to create. The prior approval carries forward unchanged.

The bar is not lowered by the empty delta — it is simply not exercised: v6 and v7 both closed with
zero High and zero Medium findings, and a delta with no bytes in it cannot open one.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
