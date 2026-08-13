# POSTMORTEM — Phase D — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **POSTMORTEM-D**` |
| Downstream | operator decision; `LEARNINGS-pdlc-engine-distribution.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{1,2}.md`; erratum confirmation `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v10.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Halted — Phase D erratum confirmation | Claude (se-author) | 1.0 | 2026-08-13 |

RESOLVED: no

## What Halted

**Phase D's own document converged. The halt is the erratum protocol's, not the review
loop's: the erratum round Phase D raised against its upstream TSPEC came back
non-approving from one of the two reviewers, and the protocol allows one erratum round per
upstream document per phase.**

| | |
|---|---|
| Phase document | `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md` — **v0.3**, approved |
| Branch | `feat-pdlc-engine-distribution` |
| Halt reason | Erratum delta-confirmation on **TSPEC v0.10** non-approving: `te-review` **Needs revision** `{"high": 1, "medium": 2, "low": 0}` (`CROSS-REVIEW-test-engineer-TSPEC-v10.md:81-82`) |
| Non-approving reviewer | `te-review` only. `pm-review` returned **Approved with minor changes** `{"high": 0, "medium": 2, "low": 1}` (`CROSS-REVIEW-product-manager-TSPEC-v10.md:88-90`) |
| Round budget | Not exhausted, and not the cause. DECISIONS spent **2 of 5** rounds. TSPEC's lifetime window stands at **10 of `MAX_LIFETIME_ROUNDS` 15** |
| Erratum budget | **Exhausted for TSPEC in this phase** — one round, spent |

DECISIONS itself is in good order and no part of this post-mortem asks for it to be
re-authored:

| Round | DECISIONS version | PM verdict | TE verdict |
|---|---|---|---|
| 1 | v0.2 | Needs revision (`CROSS-REVIEW-product-manager-DECISIONS-v1.md:120`) | Needs revision (`…-test-engineer-DECISIONS-v1.md:118`) |
| 2 | v0.3 | **Approved with minor changes** `{0, 1, 1}` | **Approved with minor changes** `{0, 2, 1}` |

Both round-1 High findings were closed at the level raised, and both reviewers said so
(`CROSS-REVIEW-test-engineer-DECISIONS-v2.md:93`). Two of those closures — DEC-EDIST-04's
corrected notice accounting (§5) and DEC-EDIST-06's signalled-child decision (§7) — are
precisely the material the phase then had to route back up as errata, because the record had
now decided something its own upstream TSPEC still stated wrongly. That is the erratum
channel working as designed. What failed is one item's *landing*, not its *routing*.

## The Erratum Round

Seven items were raised against TSPEC while DECISIONS was in review. Upstream was re-grounded
first, per DEC-ERR-01: REQ is v0.10 and FSPEC v0.2 at HEAD, both last edited *below* the
approval anchor `a3d3489a`, so there was nothing to absorb and no upstream decision to route
back. Both reviewers verified that claim independently and both found it true.

The edit landed as six commits plus a changelog commit, `046f0c58…85ecb399`, and both
reviewers confirmed by diff that it touches only the hunks the changelog claims and re-opens
nothing settled in rounds 1–8.

| # | Raised item | Commit | Landed? |
|---|---|---|---|
| 1 | §5.4/PF-3 closes O-8 blocker 1 but records still count three open | `046f0c58` | Yes — §5.1 (`TSPEC:216-221`), PF-3 (`:1199`), DECISIONS §12 (`:769-784`) now agree; one routing loose end, PM `F-02` |
| 2 | `.npmignore` absent from §5.1's inventory while DEC-EDIST-01/05 ship one | `046f0c58` | Yes — inventory row (`TSPEC:214`), one line `!vendor/workflows/`, never a packed member, PK-* set unchanged |
| 3 | §5.2 does not schedule the file beside the `vendor/` git-ignore rule | `dd3df53d` | Yes — `TSPEC:241-247`, both files authored in one task, PLAN ownership manifest keeps one row |
| 4 | D-5's wording contradicts a shipped `.npmignore` | `2243fecc` | Yes — D-5 (`:152`) now reads "a `files` allow-list **decides the packed set**"; §5.4 (`:302-313`) states the two consequences; consistent with DECISIONS §6 (`:416-419`) |
| 5 | §6.2 names signal handling as needing assertion but decides only exit code and stdio | `403f4057` | Substantively yes — `128 + signum` for `status === null` (`:457-466`), **exact-number** oracle (`:469-478`, §12.1 fixture row `:1770`). One citation defect rode in with it — PM `F-01` / TE `F-47` |
| 6 | §6.5's "the catalogue equality covers it for free" is false at HEAD | `da2f2798` | **Partly** — the false claim is correctly withdrawn; the replacement oracle is not writable as specified. TE `F-45`, `F-46` |
| 7 | AC-5.6 needs a named path-level oracle | `da2f2798`, `e0bff33a` | **Partly** — same defect as item 6 |

Five of seven items land cleanly. The two that half-landed are the same §6.5 defect, raised
twice from different directions.

## What the Confirmation Found

## Best-Guess Root Cause

## Recommendation
