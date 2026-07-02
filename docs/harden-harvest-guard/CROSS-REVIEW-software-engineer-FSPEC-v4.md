# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** docs/harden-harvest-guard/FSPEC-harden-harvest-guard.md (Version 1.3; REQ v1.6)
**Date:** 2026-07-02
**Iteration:** 4

## Review Focus

Iteration-4 SE pass: (1) verify F3-01 (destination-destruction test + M84) and F3-02 (neither-signal row M85, M66/M80 fixture `CLAUDE_PROJECT_DIR` statements) against the actual v1.3/REQ-v1.6 section text — not the disposition table's own summary; (2) hostile scan of the three new matrix rows M84–M86 and the step-4/5 `mv`-flow rewrite for **new** defects only. Second-to-last iteration: only genuinely unimplementable defects rate High/Medium; residual polish carries to TSPEC. No re-litigation of settled decisions (unconditional step-3 D3 jump per F2-01, eager G1, root-(A) policy, degraded token surface).

## Existing-Code Claim Verification (single pass, v1.3-new claims only)

| Claim | Verified against | Result |
|---|---|---|
| "FSPEC v1.3 and REQ v1.6 landed in the same commit" (header, § Acceptance Tests — TE F-09 same-commit discipline) | `git log`: commit `dbea81e` touches exactly the two files ("FSPEC v1.3 + REQ v1.6"); third consecutive round the discipline held (`8a092e6`, `c3fc863` before it) | Accurate |
| "All twenty-two rows are hermetically writable in the existing jest harness (… `CLAUDE_PROJECT_DIR` — including **unsetting** it for M85–M86 — … a second guarded-directory-free fixture repo for M86)" (§ Acceptance Tests) | `pdlc/workflows/__tests__/hookCompatibility.test.js:47-59` — `runHookScript` merges `env: { ...process.env, ...(opts.env \|\| {}) }` into `spawnSync`. Unsetting is expressible as `opts.env = { CLAUDE_PROJECT_DIR: undefined }`: verified empirically that Node's `spawnSync` **drops `undefined`-valued env entries** (child sees the variable unset, not empty). Second fixture repo = one more `mkdtempSync` + `git init`, same pattern the existing fixtures use; `cwd:` is already a passthrough | Accurate |
| REQ normative text (not only revision history) carries the rule pair as the governing procedure for `mv` operands | REQ-GUARD-02 `mv` semantics paragraph: "One coherent rule pair over the resulting file path … First, the destination-destruction test … Then, for guarded sources … `mv` operands are judged by this rule pair, not by the plain D2 path tests" — plus decision-table row (`Static destination whose resulting path is an existing guarded file …`) and AC ("blocked, reason `NOT_COMMITTED` — destination-destruction (M84)") | Accurate |

## Prior-Finding Disposition Verification (SE v3 → FSPEC v1.3 / REQ v1.6)

Each resolution was checked against the actual section text, not the disposition table:

| v3 finding | Claimed resolution | Verified? |
|---|---|---|
| F3-01 (M, shared with TE — the all-static `mv`-overwrite of an existing guarded file was undecided: `mv` flow fell through to ALLOW while a literal D2 reading blocked; no row arbitrated; no RR entry; contradicted the step-3 overwrite-is-deletion rationale) | **Decided: BLOCK, via exactly fix (a) as offered.** FSPEC-GUARD-02 step 4 gains the destination-destruction test with the **existing** qualifier ("source guardedness irrelevant: if the resulting path, or the static destination itself, resolves to an existing guarded file in an unverified guarded directory → BLOCK with the affected feature's FSPEC-GUARD-03 reason code"); the qualifier's M11/M52-preserving role is stated in both documents. Step 5 explicitly scoped to guarded sources with the unguarded-source fall-through-to-ALLOW stated. The requested D2-governance statement landed in BR-02-1 ("This flow, not plain D2, is the decision procedure for `mv` operands … step 4's destruction test is the only destination-guardedness rule") and verbatim-equivalent in the REQ `mv` paragraph. Row **M84** pins my exact example (`mv /tmp/notes.md docs/f/CROSS-REVIEW-x.md` → BLOCK `NOT_COMMITTED`), REQ table row + AC added, GUARD-06 table extended ("step 2 static-source and step 4 destination-destruction" both map to the G-state code). M84 joined M33's G6 re-run set with the trace stated (destination Verified → destruction test unmet → unguarded-source fall-through ALLOW) — traced independently: correct. M11/M52/M12/M13/M74/M79/M82 re-traced through the new step 4: none regress (M11/M52's resulting paths name no existing file; M82 still routes via step 3 before step 4 is reachable) | **Resolved** — one residual reason-code nuance in an adjacent, still-unpinned cell; see F4-01 (Low) |
| F3-02 (L — neither-signal tertiary branch rowless; M66/M80 fixtures never stated `CLAUDE_PROJECT_DIR`, risking degeneration to single-root tests) | Both halves executed: REQ rows M66 and M80 now read "`CLAUDE_PROJECT_DIR` = fixture repo root (candidate root (A) exists and does not resolve the glob)" — the root-(B)-alone discriminating purpose is preserved in the fixture text itself; § Acceptance Tests M66 statement carries the same control with the SE F3-02 back-reference. The offered neither-signal row landed verbatim as **M85** (no stdin `cwd`, `CLAUDE_PROJECT_DIR` unset, process cwd = fixture repo, `rm docs/f/CROSS-REVIEW-x.md` → BLOCK `NOT_COMMITTED`, with the failing-implementation parenthetical "blocks `NO_REPO` — or allows — whenever both signals are absent"); cited in FSPEC-GUARD-01 step 8 and FSPEC-GUARD-03 G-DP1 | **Resolved** |

TE F3-03's REQ-side fix also spot-checked (it touches FSPEC-GUARD-01 step 6's authority): REQ step 4 now applies the union "in **every** segment, not only segment 1 … until a `cd` segment updates it (row M80 …)" — REQ and FSPEC step 6 agree.

## M84–M86 New-Row Verification

- **Partition:** M84 → FSPEC-GUARD-02, M85 → FSPEC-GUARD-03, M86 → FSPEC-GUARD-01 (step-8 anchor) — each row owned exactly once in the Linked Requirements table; the partition over M01–M86/S01–S07 remains exact. The "twenty-two rows" count sums correctly (M66 + M67–M79 + S07 + M80–M83 + M84–M86 = 1+13+1+4+3 = 22). The G6 re-run extension (M84–M86) is consistent between § Acceptance Tests and REQ M33's row text.
- **M84** (static `mv`-overwrite): traced — steps 2–3 miss (all static, source unguarded), step 4 fires on the existing guarded destination, default fixture state G8 → `NOT_COMMITTED` per the GUARD-06 mapping. Symmetry claims check out: same verdict class as M82's indeterminate spelling and M14/M16 truncation of the same file.
- **M85** (neither-signal branch): traced — G-DP1 falls to the process cwd (only remaining notion), repo → pass; enumeration anchor = `rev-parse` of the same root; `docs/f` unverified → D2 → `NOT_COMMITTED`. Genuinely discriminating: a block-`NO_REPO`-when-both-absent implementation and a fail-open one both die here. G6 re-run trace (Verified → ALLOW) is constructible.
- **M86** (enumeration-anchor discriminator): traced — root (A) = stdin `cwd` = fixture repo → G-DP1 passes; conformant anchor `rev-parse`s the tested root → fixture repo → `docs/f` found unverified → BLOCK; the wrong-anchor implementation `rev-parse`s the process cwd (second repo, zero guarded directories) → BR-01-2 → ALLOW. Kills precisely the implementation TE F3-02 named, and no earlier row does (in M01–M85 the two repos never diverge). Operand resolution also lands correctly (relative `docs/f/…` resolves via union root (A)).
- **Step-4 clause audit:** the "or the static destination itself" disjunct is not redundant — it decides the trailing-slash-on-a-file corner (`mv x docs/f/CROSS-REVIEW-x.md/`), where the resulting-path formula alone would compute a non-existing path while the canonicalized destination names the existing guarded file. The dual clause makes that corner a deterministic BLOCK (over-blocking a command `mv` itself would refuse — consistent fail-closed).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F4-01 | Low | Local | **Reason-code asymmetry in the indeterminate-source × static-existing-guarded-destination cell, and step 3's parenthetical is now false for it.** Take `mv "$SRC" docs/f/CROSS-REVIEW-x.md` (destination = existing guarded file, not a directory). The flow is deterministic — step 2 misses, step 3's unconditional indeterminacy jump fires → D3 (a) via the destination literal, (b) met → BLOCK `INDETERMINATE` — so this is not an undecided cell and the block verdict is right. But the destruction is statically certain from the destination alone (destination is not a directory → resulting path = destination, whatever `$SRC` resolves to), so the M74 principle — "static D2 knowledge is consumed before any indeterminacy jump … the message tells the agent to harvest/commit rather than reporting an unresolvable operand" — is honored for sources but not destinations: the agent gets the unresolvable-operand message where a harvest hint is provable. Relatedly, step 3's parenthetical gloss "(resulting path unknowable)" is untrue for this cell — the rule text ("source **or** destination indeterminate") governs, but the gloss misdescribes it. No matrix row pins the cell. Deterministic, correct-verdict, message-quality only — TSPEC can either hoist the destruction test before the step-3 jump for the destination-is-not-a-directory case (mirroring M74) with a pinning row, or keep the D3 routing and strike/reword the parenthetical; either is a one-line fix plus at most one row. | FSPEC-GUARD-02 `mv` flow steps 3–4 vs step 2's M74 rationale; FSPEC-GUARD-01 D3 |

## Questions

None.

## Positive Observations

- F3-01 was resolved with the stronger of the two offered fixes (block, not residual-risk registration), and the *existing* qualifier that keeps M11/M52 allowed was carried into both documents with its purpose stated — the fix closes the hole without collateral re-blocking of the settled ALLOW rows.
- The requested "which reading of D2 governs `mv` destinations" statement landed as normative text in both BR-02-1 and the REQ `mv` paragraph, not as a disposition-table aside — exactly where an implementer will look.
- M85 and M86 complete the cwd-notion story: every branch of the three-notion policy (root (A) present, root (A) absent, mixed-root, neither-signal, anchor fallback) now has a row that kills its specific wrong implementation. The union/anchor mechanism is fully oracle-pinned, which was the largest residual test-blindness surface in v1.2.
- The step-4 "or the static destination itself" disjunct quietly decides the trailing-slash-on-a-file corner rather than leaving it to the resulting-path formula — deterministic where a single-clause rule would have been arguable.
- Same-commit discipline held for the third consecutive round (`dbea81e`), and the 22-row count, partition, and re-run arithmetic are all exact. The hermeticity claim was strengthened honestly (unsetting `CLAUDE_PROJECT_DIR`, second fixture repo) and verifies against the actual harness.

## Recommendation

**Approved with minor changes**

Both iteration-3 findings are discharged in section text with the stronger fixes; all three new rows are genuinely discriminating and correctly traced; every cross-document claim verifies against the REQ, the git history, and the jest harness. The single Low (F4-01) is a reason-code/message-quality nuance in a cell that already blocks correctly and deterministically — it carries to TSPEC with this back-reference and does not gate FSPEC completion.
