# DECISIONS — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | _none yet_ |
| LEARNINGS | `docs/pdlc-plugin-retirement/LEARNINGS-pdlc-plugin-retirement.md` |

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-08-17 | Initial: DEC-01…DEC-09 extracted from TSPEC v0.10, re-verified at `2017c6f9`. |

## Context

The feature is a deletion sweep: retire the pdlc **plugin** distribution channel (bundled workflow runtime, consumer sync, drift hook) now that `pdlc/engine` (`@kaneho/pdlc-engine`) is the shipped execution host. TSPEC v0.10 fixed the architecture; this document records the load-bearing choices made inside that architecture, the alternatives priced against actual repository state, and the conditions under which each should be revisited.

Verification base for every code claim below: commit `2017c6f9` on `feat-pdlc-plugin-retirement`. Where TSPEC cited a base of `2cd0d6b1`, the claim was re-verified at `2017c6f9` and is restated here only if it still holds.

Standing constraints that shape most decisions:

- **REQ NG-5 — engine runtime behaviour is out of scope.** The sweep may edit `pdlc/engine/**` only inside two named carve-outs. Anything that would change what a published engine *does* is successor work, not sweep work.
- **REQ C-6 / FSPEC §3.0 — pinned literals are re-measured, never loosened.** Counts and set-equalities in the specs are exact; a decision that makes one unmeasurable is rejected on that ground alone.
- **BR-SWEEP-3 — class boundaries are commit boundaries.** A decision that forces two classes into one commit costs blast radius, and is priced as such.
- **DC-01 / `MERGE_GUARD_DEFAULTS` — the pipeline refuses to merge its own self-modifications.** The frozen array at `pdlc/workflows/orchestrate-dev.js` (`export const MERGE_GUARD_DEFAULTS = Object.freeze([`) still holds `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` — four members, none of them `pdlc/engine/`.

Project-level context read before authoring: `docs/_decisions/DECISIONS-plugin-distribution.md` (the promoted decision this feature retires one half of), `docs/_decisions/DECISIONS-review-severity-bars.md` (DEC-DOC-01 citation form, DEC-ERR-01 erratum handling), `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-08 cite-and-reuse). No decision below contradicts a promoted decision; DEC-01 and DEC-08 narrow `DECISIONS-plugin-distribution.md` rather than reverse it, and say so in place.

## Options Considered

## Decision

## Consequences
