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

**The absorbed obligation is the right call, and it is absorbed at the right altitude.** My v2 F-01
was a High: REQ v1.16's second AC-6.3 conjunct had no carrier anywhere in this TSPEC, and §2.5
delivered the hazard as design prose for an engineering reader rather than as a contract on the halt
report's content. That is now closed. FSPEC BR-14 at HEAD binds the halt *report* — "the **same
report, in the same place**, states that re-running this feature overwrites that capture" — and
explicitly reserves the capture's name, storage form and lifetime to O-1, which is this document.
§4.5's `snapshotRef` field is exactly the seam that split implies: upstream owns the observable
(co-location, presence of the overwrite statement), TSPEC owns the mechanism that renders it. The
document does not re-open the product question and does not invent a product observable one level
up. Both of my v2 High-adjacent concerns — the missing carrier and the foreclosed reason-string
route — are resolved by the same edit.

**The §2.5 rewrite is honest about what changed and what did not.** The run-scoped-overwrite hazard
is unchanged; what changed is who tells the operator. The old text ended "an operator who wants a
snapshot to survive the next run should copy the ref before re-running" — operator lore, owned by
nobody. It now ends "the remedy the halt report hands the operator is to copy the ref before
re-running", which is a promise with a carrier behind it. The bounded-cost argument (an overwritten
ref costs inspectability, never content) is untouched and still correct.

**No approved decision is reopened.** DEC-A6-02's rejected option A still stands as rejected in the
restated O-8 row; the per-promoted-task shape is a *description* of the shipped loop, not a new
choice, so §3.6's "routed to DECISIONS, not settled in this paragraph" paragraph correctly survives
with only its arithmetic updated ("a third commit" → "its own commit beside the wave's per-task
ones"). The wave-scoped ref name, the accepted overwrite cost and the capture-failure disposition
are all where round 4 and round 5 left them.

**Where the re-grounding stopped short.** The round's changelog opens by asserting a DEC-ERR-03
re-grounding: "REQ (`sha256:f97f4f66…`) and FSPEC (`sha256:d602c440…`) have both moved since v1.11's
anchors." The lineage row at the top of the document still reads `FSPEC … v1.6, over REQ … v1.15`.
Those are the versions v1.11 re-grounded on — and v1.11's own changelog says "the Upstream row names
both", so the convention this document follows is that the row tracks the re-grounding. HEAD is
FSPEC v1.7 / REQ v1.16. The body is grounded on the new bytes; the header advertises the old ones,
which is the one line a downstream reader (PLAN, PROPERTIES, the next reviewer) checks to learn
which upstream this compression is measured against. That is F-02.

The many inline pins of the form "FSPEC BR-9 at v1.6" and "REQ AC-5.1 at v1.14" are **not** findings:
those cite the version at which a clause was *decided*, the clauses are byte-unchanged at HEAD
(FSPEC v1.7's changelog says "Nothing else changed"), and provenance pinning is a legitimate style.
Only the lineage row makes a claim about what this document compresses.

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
