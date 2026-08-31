# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, unchanged)
**Base reviewed at v8:** `7adc9666196cca6357174fcbb513b6a6f597af2f`
**Upstream HEAD:** REQ `5f3e8051…` (v1.6) · FSPEC `c7d2c832…` (v1.7) · TSPEC `3742216…` (v1.6)
**Date:** 2026-08-31
**Iteration:** 9 (delta confirmation, decision freeze)

## Context

**The document did not move this round. Its upstream did.**
`git diff 7adc9666..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md` is empty: zero commits touch
the file since the bytes I approved at v8. There is no author delta to confirm. What changed is
everything above it — REQ v1.4 → v1.6, FSPEC v1.5 → v1.7, TSPEC v1.4 → v1.6 — all landed after the
commit this document last grounded on.

That inverts the usual delta question. The v8 round asked "did the edit land cleanly". This round
asks the only question a frozen, unedited document can fail: **is any load-bearing claim in it now
false, because upstream moved underneath it?** Under decision freeze that is also the only thing
that may block — a defect the revision introduced (there was no revision) or a factual contradiction
with the repository at HEAD or an upstream document.

**Upstream movement, measured not assumed.** The document's v1.6 changelog attests "TSPEC HEAD is
v1.4 (`sha256:cb351bb3…`) and FSPEC HEAD is v1.5 (`sha256:25af3c47…`) … REQ HEAD (v1.4) matches its
pin". I checked whether that attestation was true when written rather than assuming either way:

| File | Hash at `7adc9666` | Hash at HEAD | Verdict on the attestation |
|---|---|---|---|
| REQ | `60a516fb…` (v1.4) | `5f3e8051…` (v1.6) | True when written; stale now |
| FSPEC | `25af3c47…` (v1.5) | `c7d2c832…` (v1.7) | True when written; stale now |
| TSPEC | `cb351bb3…` (v1.4) | `3742216…` (v1.6) | True when written; stale now |

This matters because TSPEC v1.6 spent its round correcting exactly the opposite failure in itself:
its v1.5 changelog attested "neither moved" while FSPEC and REQ had in fact moved, because it cited
a current hash instead of diffing against the previously grounded one. **DECISIONS did not make that
mistake.** Its three hashes were the real HEAD values at the moment it wrote them. The staleness
here is the ordinary consequence of being reviewed after upstream advanced, not a false attestation.

**What I re-verified mechanically, rather than trusting the v8 result:**

| Claim | How checked | Result |
|---|---|---|
| `c8.include` holds seven entries at HEAD | read `pdlc/workflows/package.json` | seven `**/`-anchored entries |
| `REQUIRED_INCLUDES` holds four | `pdlc/workflows/__tests__/coverageInstrumentation.test.js:37-46` | four; literal is `4 + 1 + 2` = seven |
| TSPEC §2.1 still says *six → seven* | `git diff` on the TSPEC row | row untouched by v1.5/v1.6 |
| P-1's title as DECISIONS quotes it | `learningsPremises.test.js:78` | "MODULE_NAMES is exactly the four canonical workflow modules" — DECISIONS' quote is a faithful substring |
| The ten-site set matches TSPEC's ten | row-by-row compare of both tables | identical membership |

I did **not** re-open `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`, the option
table, K-1 through K-9, or the standing-cost bullets. None of them changed; all were approved on
their merits across v5–v8.
