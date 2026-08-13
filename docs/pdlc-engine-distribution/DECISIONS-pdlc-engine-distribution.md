# DECISIONS — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `FSPEC-pdlc-engine-distribution.md` (v0.2), `TSPEC-pdlc-engine-distribution.md` (v0.9), `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-01…05) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft (Phase T) | Claude | 0.1 | 2026-08-13 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft — DEC-EDIST-01…10 recorded from TSPEC v0.9 §4, §6.2, §6.4, §8.2, §9.3 |

## 1. Scope

This document records the load-bearing decisions the TSPEC takes, with the alternatives that
were rejected and why. It is the *record*, not a second authority: where a mechanism is
specified, the TSPEC section named in each entry is normative and this file states only what
was chosen, what was rejected, and what would make the choice worth revisiting.

Ten entries. Five (DEC-EDIST-01…05) close the obligations the FSPEC parked — O-10, O-9, O-2's
execution half, Q-4 and Q-5 — and are the five listed in TSPEC §4. Five more
(DEC-EDIST-06…10) are decisions taken inside the TSPEC's body that a later reader would
otherwise have to reconstruct from prose: they each rejected a plausible alternative, each
have a reversal cost worth stating, and each are cited by more than one downstream artifact.

Project-level decisions in `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-01…05)
are **not** re-litigated here. Two of them are load-bearing inputs: DEC-DIST-02's three-tier
source/artifact/consumer-copy discipline is what DEC-EDIST-01 reuses, and DEC-DIST-05's
"scoped public npm package" is the channel every entry below assumes.

Nothing here decides the operator-owned items — the npm scope (N-6), the licence (N-2) or
BL-03's transcription (N-3). §12 lists them with their owners.

## 2. DEC-EDIST-01: Vendor the workflow modules at build time, into the tarball only

## 3. DEC-EDIST-02: One optional, default-inert `_provenance` seam

## 4. DEC-EDIST-03: A version store plus a resolving launcher

## 5. DEC-EDIST-04: Ignore a bare `PDLC_PLUGIN_ROOT`, with a notice

## 6. DEC-EDIST-05: A `files` allow-list, not an `.npmignore` deny-list

## 7. DEC-EDIST-06: The launcher hop is a child process, not a dynamic import

## 8. DEC-EDIST-07: `--version` and `doctor` resolve but never refuse

## 9. DEC-EDIST-08: An unreadable consumer config refuses, even when no pin was declared

## 10. DEC-EDIST-09: A dependency-free guard entry point; the CLI body moves to `bin/cli.mjs`

## 11. DEC-EDIST-10: `publish.yml` duplicates the gate jobs rather than extracting a reusable workflow

## 12. Decisions deliberately not taken here
