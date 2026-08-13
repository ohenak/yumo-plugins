# TSPEC — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.2, `FSPEC-EDIST-01`), `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-05), `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-10…M-ENG-13) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft — in review (Phase T) | Claude | 0.1 | 2026-08-13 |

## 1. Scope and altitude

This TSPEC specifies **how** the FSPEC's seven flows are built: package layout, the
version store and launcher, the manifest fields, the provenance carrier across the
engine↔module seam, the publish workflow's jobs, and the test doubles each oracle needs.

It **takes** the four design decisions the FSPEC parked — O-10 (package composition),
O-9 (provenance carriers), the pin mechanism's execution half (O-2), and Q-4's branch of
AC-5.6 — and records the load-bearing ones in `DECISIONS-pdlc-engine-distribution.md`.

**Not owned here.** Anything the REQ already fixed (T-1a…T-7), the FSPEC's three expected
sets (§5.1 required checks, §5.2 packed contents, §5.3 dev-mode kinds — this document
implements them, it does not restate them as a second authority), test *names* and
per-property assertions (PROPERTIES), and task order (PLAN).

**Language and idiom.** The engine is plain Node ESM with JSDoc typedefs, not TypeScript:
`pdlc/engine/package.json:5` declares `"type": "module"` and every shipped module is
`.mjs` with JSDoc `@param`/`@returns` blocks (`pdlc/engine/lib/report.mjs:26-27`,
`pdlc/engine/lib/startup.mjs:302-318`). This TSPEC therefore expresses protocols as JSDoc
typedefs and frozen catalogues, which is the shipped precedent, rather than introducing a
TypeScript toolchain the repo does not have.

## 2. Verified baseline at HEAD

## 3. Architecture

## 4. Decisions this TSPEC takes

## 5. Package composition and the anti-fork oracle (O-10)

## 6. Version resolution: store, launcher, pin, dev-mode (F-4)

## 7. Provenance carriers (F-6, O-9)

## 8. Publish pipeline (F-5)

## 9. Install and upgrade (F-2, F-3)

## 10. Types and protocols

## 11. Error handling

## 12. Test strategy

## 13. Requirements traceability

## 14. Costs, risks, and what is deliberately not closed here
