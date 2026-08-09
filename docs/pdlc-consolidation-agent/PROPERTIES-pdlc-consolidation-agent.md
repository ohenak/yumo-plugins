---
feature: pdlc-consolidation-agent
---

# PROPERTIES — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** |
| Downstream | IMPL tests (`pdlc/workflows/__tests__/consolidation*.test.js`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-09 |

## 1. Overview — scope, sources, and how to read this document

This document is the proof system for the consolidation pass: the observable invariants an
implementer must be able to falsify, stated precisely enough that each of PLAN §4's 34 tasks knows
which properties its test file carries and what a failing one would mean.

**Sources.** REQ §3 (AC-1.1 … AC-7.2) and §4 (NFR-1 … NFR-5); FSPEC's eight units
(`FSPEC-CONS-01` … `FSPEC-CONS-09`), its business rules (`BR-*`), its edge cases (`E-*`), its 99-id
acceptance register (§13) and its §14.5 layer-deferral register (LD-1 … LD-5); TSPEC §§5–11 (the
seam protocol, the algorithms, the levels, the oracle mechanisms, the property strategies); PLAN §4
(the task table), §5 (the file-ownership manifest) and §2 (the red-before-green and
single-writer-per-batch rules); and the two project-level authority files
`docs/_constraints/pdlc-consolidation-vocabularies.md` (`Version` **1.4**, `:7`) and
`docs/_constraints/pdlc-advisory-corpus-baseline.md`.

**What this layer owns, and what it does not.** `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md:10`) puts **fixture construction and set-equality
domains** here. So this document decides fixtures, expected literals, oracle shapes and coverage
floors; it does **not** re-decide a rule the FSPEC or TSPEC settled. FSPEC §14.5's five deferrals
(LD-1 … LD-5) are named here explicitly, each with the fixture the FSPEC declined to carry: LD-1 and
LD-5 in §6, LD-2 and LD-3 in §5, LD-4 in §5. Every other property below pins an FSPEC acceptance
test's oracle rather than inventing an obligation.

**Grounding.** Every claim about *existing* behaviour cites the working tree, re-measured while
authoring at `feat-pdlc-consolidation-agent` HEAD (clean tree; `git status --porcelain` reports only
untracked `.claude/` and `.serena/`):

| Cited symbol | Location, re-measured | Used by |
|---|---|---|
| `MERGE_GUARD_DEFAULTS` (frozen, four members) | `pdlc/workflows/orchestrate-dev.js:48-53` | §7 routing (PROP-RTE-01) |
| `resolveAdvisoryRung`, `ADVISORY_RUNG_SKILL` (`"se-review"`) | `orchestrate-dev.js:1833`, `:1797` | §9 rung (PROP-RUN-*) |
| `ADVISORY_MODEL_FALLBACK:` emit line | `orchestrate-dev.js:1859` | PROP-RUN-02 |
| `gitWithLockRetry` (module-private `async function` at HEAD) | `orchestrate-dev.js:8653` — **not** `:8617` | §7 commit (PROP-RTE-08) |
| `commitPaths` (plain `git commit -m`, no pathspec) | `orchestrate-dev.js:8705`; its unscoped commit at `:8726` | §7 negative (PROP-RTE-09) |
| `commitQueueRow`'s two-call pathspec form | `orchestrate-queue.js:1576-1595`; `NOTHING_TO_COMMIT_RE` `:1554` | PROP-RTE-08 |
| `rtListFiles` transports `ls -p -A \| grep -v '/$'` and rejects separator lines | `runtime-adapter.js:915`, `:929-931` | §4 negative space (PROP-COR-02) |
| `rtWriteFile`'s `relative to the repository root` clause, one occurrence | `runtime-adapter.js:802-811`, clause at `:805` | §10 (PROP-BLD-04) |
| `fakeFs` reports `file_missing` / `file_empty` as distinct reasons | `__tests__/helpers/seams.js:296-299` | §7 marker (PROP-MRK-03) |
| `AT19_SEAM_NAMES`, `AWAIT_SCAN_SOURCES` (`["orchestrate-dev.js", "orchestrate-queue.js"]`) | `__tests__/runtimeBundle.test.js:215`, `:1040` | §10 (PROP-BLD-06) |
| `seeded`, `resolveSeed` | `__tests__/helpers/driftGenerators.js:76`, `:134` | §11 generators |
| jest's `testPathIgnorePatterns` (helpers and fixtures excluded) | `pdlc/workflows/package.json:18-22` | §2.1 |
| The hook's `THRESHOLD = 5`, glob at `:28`, early exit `:29-30`, predicate `:41`, message `:43-48` | `pdlc/hooks/scripts/nudge-consolidation.sh` | §4 differential (PROP-COR-07) |
| `docs/_queue/ESCALATIONS.md` **absent** at HEAD (`docs/_queue/` holds `QUEUE.md` only) | — | §6 (PROP-ADV-01) |
| The live corpus is **5** LEARNINGS files under the two §3.1 globs | `docs/{orchestrate-dev-workflow,pdlc-advisory-tier}/`, `docs/completed/{pdlc-merge-phase,pdlc-review-loop-hardening,pdlc-workflow-distribution}/` | §2.3 |

**One grounding result is a defect, routed rather than absorbed.** The `:8617` / `:8669` / `:8690`
locators FSPEC §5.4, TSPEC §4.2 and PLAN §3 carry for `gitWithLockRetry` and `commitPaths` are stale
by exactly 36 lines at HEAD; the same offset applies to PLAN §2's `:10136-10143` gate citation
(actually `:10172`) and its `:10151` wave-commit citation (actually `:10187`). No rule changes — the
symbols exist, unexported and unscoped exactly as described — so this document uses the corrected
locators above and emits `ERRATUM:` lines (§13.3). No property below is written against a line
index; §10's source-text properties locate **by name**, which is why the drift costs nothing
executable.

**How to read a property row.** Every row states an invariant that can fail, names its **level**
(L1 pure / L2 orchestration / L3 build-and-source-text / L4 differential / L5 generator, TSPEC
§11.1), names the **test file** that carries it and the **PLAN task** that owns that file for its
wave, and cites the REQ criterion and FSPEC acceptance id it discharges. A property with no
falsifier is not a property; §3 states the six oracle rules every row below satisfies, and each row
that could be read as absence-only names its positive conjunct in the row itself.

**Counts, measured not assumed.** This document states **96** properties across the six levels;
§12's four matrices re-derive the mapping from REQ, FSPEC, PLAN and the test-file index, and every
count in §12 is the length of the list beside it rather than a transcribed total.

## 2. Fixtures, generators, and doubles

## 3. Oracles — the falsifiability rules every property below obeys

## 4. Properties — corpus, predicate, configuration

## 5. Properties — trigger, identity, merge, and the record reader

## 6. Properties — effectiveness, remediation, and the advisory corpus

## 7. Properties — the marker, routing, and the credential

## 8. Properties — rendering and the report

## 9. Properties — the pass end to end

## 10. Properties — build, source text, and traceability

## 11. Generator-driven properties

## 12. Coverage matrix

## 13. Gaps, negative space, and errata
