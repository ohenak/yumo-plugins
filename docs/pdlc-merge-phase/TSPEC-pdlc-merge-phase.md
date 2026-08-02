# TSPEC — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-FSPEC-v3.md`, `CROSS-REVIEW-test-engineer-FSPEC-v3.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-02 |

## 1. Scope, inputs, and how to read this document

This TSPEC specifies **how** FSPEC v1.2's Phase MERGE is built in `pdlc/workflows/`. The FSPEC is the
behavioural contract and is not restated here: every section below either names a function, a
signature, a file and a line, or a mechanical rule, and cites the FSPEC clause it implements.

**Inputs.** REQ v1.1 (approved), FSPEC v1.2 (dual-approved), `CROSS-REVIEW-software-engineer-FSPEC-v3`
and `CROSS-REVIEW-test-engineer-FSPEC-v3` (both `APPROVED`, carrying advisory riders addressed here).

**Project-level context read before authoring.** `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-01
closed catalogues and total parsers, DC-02 measured platform facts, DC-03 falsified assertions, DC-04
oracles as pure functions of an injected root, DC-05 one AT per named branch, DC-11 sibling oracles
share an error contract) and `docs/_decisions/DECISIONS-plugin-distribution.md` (the runtime exposes
no `fs`, no `process`, no `import()`, no `fetch`; the bundle is generated). Nothing below contradicts
them; §11 is written against DC-02 in particular — every runtime claim it makes is cited to a line.

**Where the code goes.** Two modules change, plus the generator and the adapter:

| File | Change class |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` | new: Phase MERGE — config reader, six observations, pure decision core, guard, merge execution, post-merge sequence, phase wiring in `main()`, report fields |
| `pdlc/workflows/orchestrate-queue.js` | changed: `updateQueueStatus`, `rewriteStatus`, `commitQueueRow`, `uncommitted`, `runPicked`; new pure helpers for the `Evidence` column |
| `pdlc/workflows/build-runtime.mjs` | changed: `exportedNames` for both IIFEs, both entrypoint `_recordQueueRow` closures, `DEV_META.phases` |
| `pdlc/workflows/runtime-adapter.js` | new: `rtMergeObservations`; one new key in `rtDevInjections` |

**Obligation index.** FSPEC §13's entry obligations are discharged as follows; §15 restates the
result with evidence.

| Obligation | Discharged in |
|---|---|
| O-M1 — disposition catalogue migration, producers and readers, seam rename | §8.2, §8.5 |
| O-M2 — observation names/signatures/injection; the evidence-carrying recording channel | §4, §8.3, §8.4 |
| O-M3 — `O3` GraphQL query, pagination, `prUrl` → owner/repo/number | §4.4 |
| O-M4 — `O5` pagination completeness rule | §4.6 |
| O-M5 — where the `merge` config section is read and cached | §3.3 |
| O-M6 — `RLH-AT-32-orch` re-expression (PLAN-owned) | §13.4 names the task; PLAN owns it |
| O-M7 — the wait between `mergeable` re-reads | §4.3 |
| O-M8 — the M3 replay command sequence and its failure detection | §7.4 |
| SE-v3 advisory / TE-v3 **N-02** — `O4` on the already-merged path | §5.5 |
| TE-v3 **N-01** — an unparseable `O1.number` resolving at two rows | §4.6, §13.3 |

**House idioms this feature inherits, not invents.** `{ execFn }` injection for a command-running
observation (`checkPrCi`, `orchestrate-dev.js:3485`); `defaultGit(argv, { execFn })`'s never-throwing
`{ ok, stdout, stderr }` (`:4252`); the `_seam = defaultImpl` parameter idiom on `main()` (`:4297`);
compile-time phase flags (`PHASE_DOD_ENABLED :22`, `PHASE_PUB_ENABLED :28`); the fail-closed
injected-read wrapper (`readDriftStateSafely`, `orchestrate-queue.js:1354`); and the
fixed-command/exact-reply adapter discipline (`rtGit`, `runtime-adapter.js:927`).

## 2. Module architecture and function inventory

## 3. Configuration reader (O-M5)

## 4. Observation points O1–O6 (O-M2, O-M3, O-M4, O-M7)

## 5. The pure decision core — `decideMerge`

## 6. The self-modification guard

## 7. Merge execution and the post-merge sequence M1–M5 (O-M8)

## 8. The recording seam and the queue write-back (O-M1, O-M2)

## 9. The queue driver's post-pipeline transition

## 10. Reporting — report fields, notices, phase row

## 11. Runtime, bundle, and adapter changes

## 12. Error handling catalogue

## 13. Test strategy

## 14. Requirements traceability

## 15. Obligations discharged, risks, and the DECISIONS verdict
