# Halt-Hardening Regression Test Fixtures

This directory contains sanitized, historical-incident-reproducing fixtures extracted from `regime-scaffold-pivot-alignment` feature's postmortems. Each fixture is consumed by one or more regression test (RT-*) as specified in `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` §5.

## Fixture Manifest

### Confirmation Fixtures

#### `confirmation-delta-high.md`
- **Consumed by:** RT-1a
- **Incident:** POSTMORTEM-PR frozenset halt — erratum round lands 4/5 items, both confirmers High-delta-local on one noun (owner `tuple` → `frozenset[str]`)
- **Sanitization:** Replaced actual feature name and section numbers with placeholder; retained FINDING: grammar with High | delta | local severity/provenance/locality tags

#### `confirmation-inherited-high.md`
- **Consumed by:** RT-1b
- **Incident:** POSTMORTEM-P inherited-staleness halt — confirmers non-approving, all Highs tagged `inherited`, findings describe pre-round staleness in unchanged sections
- **Sanitization:** Simplified section references; retained FINDING: High | inherited | nonlocal tags to test R2 gate rule

#### `confirmation-untagged.md`
- **Consumed by:** RT-1c
- **Incident:** Legacy reviewer output with prose findings but no FINDING: lines; tests fail-closed behavior (halts exactly as v0.22.7)
- **Sanitization:** Created synthetic prose findings without FINDING: tags; includes VERDICT: Needs revision line to match confirmation format

### PLAN Fixtures

#### `plan-piped-cells.md`
- **Consumed by:** RT-3a
- **Incident:** Fabricated-cycle halt — PLAN task table with backticked pipe `` `list[str] | None` `` in description cells, historically mis-parsed as column delimiter and fabricated cycle
- **Sanitization:** Simple three-column task table with backticked pipes in descriptions; deps column is valid and acyclic to demonstrate parser correctness

#### `plan-owning-tasks-manifest.md`
- **Consumed by:** RT-3c (first variant)
- **Incident:** Invisible manifest — header `| Owning task(s) | Files |` historically silently skipped due to header normalization absence
- **Sanitization:** Simple task table + file-ownership manifest with canonical `Owning task(s)` header (now should parse correctly)

#### `plan-near-miss-manifest.md`
- **Consumed by:** RT-3c (second variant)
- **Incident:** Near-miss diagnostic — header `| Writers | Files |` should trigger loud near-miss contract error, not silence
- **Sanitization:** Same structure as canonical manifest but with `Writers` header; tests that parser emits diagnostic naming exact accepted spellings

### PROPERTIES Fixtures

#### `properties-renamed-headings.md`
- **Consumed by:** RT-3d
- **Incident:** te-author 3× stall — PROPERTIES with non-canonical section names (`## Test Oracles`, `## Test Data` instead of canonical `## Oracles`, `## Fixtures`)
- **Sanitization:** Structurally complete PROPERTIES with renamed headings in `## Overview`, `## Properties`, `## Test Oracles`, `## Test Data` (the observed spellings that stalled te-author); tests that extended alts now pass isComplete()

### Corpus Fixtures

#### `plan-corpus/plan-simple.md`
- **Consumed by:** RT-3b
- **Incident:** Parser back-compat property — pipe-free PLAN with simple linear task table
- **Use:** Control baseline for parser equivalence corpus (new splitPipeRow must parse byte-identically to old on pipe-free rows)

#### `plan-corpus/plan-diamond.md`
- **Consumed by:** RT-3b
- **Incident:** Parser back-compat property — pipe-free PLAN with DAG (diamond dependency pattern)
- **Use:** Exercise dependency parsing and batch derivation without pipe-escape complexity

#### `plan-corpus/plan-linear.md`
- **Consumed by:** RT-3b
- **Incident:** Parser back-compat property — pipe-free PLAN with linear sequential deps
- **Use:** Verify task ID and header variations (`Task ID` vs `ID`, `Dependencies` vs `Deps`, `Dependencies` vs `Depends on`) remain parseable

#### `plan-corpus/plan-with-manifest.md`
- **Consumed by:** RT-3b
- **Incident:** Parser back-compat property — pipe-free PLAN with integrated file-ownership manifest
- **Use:** Ensure ownership header variants (`Task | Files` with alt spellings) parse or emit correct diagnostics

## Sanitization Notes

All fixtures have been stripped of:
- Real feature/product names → replaced with generic placeholders (`test-feature`, `regime-scaffold`, etc.)
- Trading strategy content → replaced with neutral business logic descriptions
- Specific line numbers → replaced with section anchors (§3-02) and generic references
- Implementation details → kept table structures faithful but simplified narrative text

Structure and table formats remain authentic to the original incidents to ensure regression tests truly exercise the historical failure modes.

## Test Execution

Run from repository root:
```bash
cd pdlc/workflows
npm test -- --testNamePattern='halt-hardening|RT-[0-9]'
```

Each regression test loads fixtures via dependency-injection seams (`readFileFn`, `agentFn`) and asserts:
1. Parser/completer gates emit expected diagnostics (if fixture triggers an error path)
2. New behavior avoids historical halts (for RT-* tests of fixes)
3. Fail-closed defaults apply when new grammar tags are absent (for legacy-compat tests)
