---
Status: Active
Author: se-author
Version: 1.0
Feature: harden-harvest-guard
---

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | [CROSS-REVIEW-product-manager-TSPEC.md](CROSS-REVIEW-product-manager-TSPEC.md), [CROSS-REVIEW-test-engineer-TSPEC.md](CROSS-REVIEW-test-engineer-TSPEC.md) |
| LEARNINGS | docs/harden-harvest-guard/LEARNINGS-harden-harvest-guard.md |

# DECISIONS — harden-harvest-guard

## DEC-harden-harvest-guard-01: Single-file guard deployable with embedded `--self-test` mode (no sibling `guard_parser.py`)

**Context:** TE TSPEC F-04 required a unit/property test strategy for the guard's hand-rolled parsing engine (tokenizer, segmenter, heredoc stripper, verb identifier), which the embedded-heredoc architecture appeared to foreclose. Two mechanisms were on the table: extract the Python to a sibling importable `guard_parser.py` (loaded by the bash wrapper, importable by tests), or keep one file and add an argv-gated `--self-test` mode running an embedded parser case table (TSPEC § 6.6).

**Decision:** Keep the single-file deployable (`guard-harvest-before-delete.sh`, bash wrapper + quoted Python heredoc) and add the `--self-test` mode, gated on the conjunction of `argv[1] == "--self-test"` and `GUARD_SELF_TEST=1` — both settable only by the wrapper's own argv-gated branch, which hooks.json can never reach (it passes no arguments).

**Alternatives considered:**
- Sibling `guard_parser.py` imported/execed by the wrapper — rejected because it splits the deployable into two files that must travel together through the plugin cache and the hooks.json absolute-path wiring (TSPEC C16), enabling independent drift and adding a deployment failure mode (missing/stale sibling) to a fail-closed security control. Real unit imports were the only benefit, and the self-test mode recovers direct function-level testing without the split.
- No parser-level tests (v1.0 position: matrix rows only) — rejected; review-confirmed inadequate for a hand-rolled quote-aware parser (~90 fixed examples miss quoting/operator corners), and REQ-GUARD-05 mandates the matrix suite but does not forbid supplementary lower-level tests.
- Generative (hypothesis-style) property testing — rejected: Python-side `hypothesis` breaches the guard's stdlib-only floor; a jest-side bash-grammar generator is itself an unreviewable correctness liability. The discriminating corner space (quote-state × operator × token-position) is finite and enumerable, so parameterized tables give equivalent coverage deterministically (TSPEC § 6.6 P-D1/P-QUOTE).

**Constraints that forced this shape:** hooks.json wires scripts by absolute single-file path and passes no argv (C16); plugin-cache distribution favors self-contained scripts; guard is a fail-closed control, so deployment integrity outweighs unit-test ergonomics; Python floor is stdlib-only (TSPEC § 3.3).

**Reversibility:** easy — extracting the heredoc to a sibling module later is mechanical; the self-test table would move with it and become plain unit tests.

**Re-evaluation triggers:** the embedded Python outgrows comfortable heredoc maintenance (e.g. > ~500 lines or a second consumer wants to import the parser); Claude Code plugin packaging gains first-class multi-file script support with integrity guarantees; the self-test case table's size starts dominating the script.
