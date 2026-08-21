# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.12)
**Date:** 2026-08-20
**Iteration:** 3 (delta confirmation, erratum round)
**Upstream at dispatch:** REQ v1.16 (`sha256:f97f4f66…`), FSPEC v1.7 (`sha256:d602c440…`)
**Delta reviewed:** `efeb798e..0f2a9710`

## Scope

This is a delta confirmation, not a re-review. I read the erratum diff
(`efeb798e..0f2a9710`, nine commits opening at `861abf63`), then re-read the upstream this TSPEC
now leans on **at HEAD** — REQ v1.16 and FSPEC v1.7 — and asked one question: does the delta land
the routed items without breaking what earlier rounds approved, and is the result still a faithful
compression of upstream as upstream currently reads (DEC-ERR-03)?

The seven routed items all land, and I verified each against the shipped tree rather than against
the item list:

| Routed item | Verified at HEAD | Verdict |
|---|---|---|
| Retired `dist/orchestrate-dev.bundle.js` runtime premise (§1.2, §3.4 envelope example) | `build-runtime.mjs` emits exactly `pdlc-cli.mjs`; `pdlc/workflows/dist/` holds only that file; `prepack.mjs`'s `MODULE_NAMES` is `["orchestrate-dev.js", "orchestrate-queue.js"]`, vendored verbatim | **Landed.** §1.2 now names both channels correctly and §3.4's example refuses `pdlc-cli.mjs`, not a bundle |
| §1.1 O-8 "one further `commitPaths` call" | `orchestrate-dev.js:15471` — `for (const promo of waveResolvedPromotions)`, fed by `groupPromotedPaths` (`:3329`, `:15403`) | **Landed.** O-8 and §3.6 both now read *per promoted task*, and the `{taskId}` coherence argument is the right one |
| DEC-A6-03 halt-message obligation unlanded at v1.15 | REQ v1.16 AC-6.3 second conjunct (`:533-536`); FSPEC v1.7 BR-14 (`:249`), Step 10 (`:130`), E-34 (`:312`) | **Inverted by HEAD, correctly absorbed.** The obligation landed upstream; §2.5 and §4.5 stop routing it and name a mechanism. Restating it as routed would have been DEC-ERR-01's anti-pattern, and the document says so |
| §1.2 `.claude/workflows/` sync premise | Same as row 1 | **Landed** |
| §2.5 mechanism block `git add -A --` | Shipped call is `["add", "-A"]` (`orchestrate-dev.js:12580`) | **Landed.** The stray `--` is gone; block, prose, O-1 and OQ-5 now agree |
| §5.1 `advisory-config-example.test.js` red-reason | `.claude/pdlc.config.example.json` carries `"advisory":{"enabled":false,"waveBudgetPerRun":1}` | **Landed.** The stated reason is correctly retracted as falsified |
| §5.1 `advisoryQueueSeams.test.js` red-reason | `ADVISORY_SEAMS = ["A1"…"A6"]` (`:1952`); `ADVISORY_SEAM_PHASES` carries `A6: {id:"I", outcome:"halted"}` (`:3813-3820`) | **Landed** |

Necessary, not sufficient. Measured against upstream at HEAD the document is *nearly* a faithful
compression, and three things are not: the round designed a new operator-facing contract without
giving it an oracle (F-01), it left the lineage header pinned to the upstream it explicitly says it
moved off (F-02), and one cell of the table it re-measured is wrong in the direction that hides
remaining work (F-03).

## Design

<!-- pending -->

## Seams

<!-- pending -->

## Data Model

<!-- pending -->

## Verification

<!-- pending -->

## Obligations

<!-- pending -->

## Delta-Confirmation Findings

<!-- pending -->

## Verdict

<!-- pending -->
