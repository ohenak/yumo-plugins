# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-18
**Iteration:** 11
**Scope:** Upstream-cascade confirmation only. TSPEC bytes unchanged since the v10 approval
(`REVIEWED-COMMIT: f6643915`). REQ moved from `sha256:1038b816…` (v0.11) to
`sha256:41fb21e8…` (v0.12, commit `cc009367`). The single question answered here: does the
approved TSPEC remain a faithful compression of the REQ as it now stands? Settled TSPEC
decisions are not re-litigated.

## Overview — what changed upstream

`git diff 68e72db2..cc009367` on the REQ is one erratum, 16 insertions / 1 deletion:

| Where | Change |
|---|---|
| Header / changelog | Status row to `0.12 | 2026-08-18`; a v0.12 changelog line naming the one correction |
| C-7 (`Repo CI stays green at every commit`) | New paragraph **"Held classes and the interim state"** — C-7 governs the repo's own CI checks per commit, not this REQ's completion criteria (AC-1.1's *given* evaluates at sweep completion); while a class is held pending an upstream disposition, an unsatisfied AC-1.1 is an incomplete feature on an unmerged branch, **not** a C-7 red and **not** registered anywhere as an expected or tolerated failure; ungated classes may still land as their own commits; there is no skip-list, no expected-failure inventory and no tolerated-red register in this feature (C-8 forbids that shape, and "a criterion allowed to be red by registration stops being a criterion"); where a check observing a held class would otherwise run red before that class lands, the resolution is **ordering** — the check goes live with the class it covers — **never registration**; the branch does not merge on a green subset |

No acceptance criterion was added, removed, narrowed or re-scoped. No new obligation lands on
engineering beyond a naming rule for a state the TSPEC already designed for.

## Architecture — does the TSPEC still hold against C-7 at HEAD?

The erratum touches exactly one constraint the TSPEC leans on. Every load-bearing place the
TSPEC reads C-7 or designs the held-class interim was re-read against the current text:

| TSPEC anchor | What it says | Against REQ C-7 at HEAD |
|---|---|---|
| `TSPEC:765` (§5.3) | `ci-arrangement.test.js` "is the single largest correctness hazard in the sweep and the reason **C-7 outranks C-5** for class 1 (BR-SWEEP-3)" | **Holds.** The erratum leaves C-7's per-commit greenness rule and its precedence untouched; it only says what C-7 does *not* govern (this REQ's completion criteria). Class 1 is not a held class, so the ranking argument is unaffected |
| §5.4 `TSPEC:779`–`:803` | Per-commit gate = FSPEC L-9's three commands replayed over `git rev-list --reverse <base>..HEAD`; a red-and-repaired-next-commit is caught (BR-SWEEP-2) | **Holds, and is now the mechanism the erratum names.** The gate observes repo CI checks per commit — precisely C-7's stated domain. Nothing in §5.4 evaluates AC-1.1 per commit, so no TSPEC oracle asserts sweep-completion state at an interim commit |
| §2.6 / §2.9 tables (`TSPEC:282`–`:284`) | Every gate-read reference is deleted **in the same commit as its subject** (BR-SWEEP-4: "a gate-read reference never lags its subject") | **Holds.** This *is* the erratum's "resolution is ordering — the check becomes live with the class it covers", already the TSPEC's general rule, stated before the erratum existed |
| §5.2 row TT-5 (`TSPEC:742`) | The reduced builder's emitted file set **set-equals `{pdlc-cli.mjs}`** | **Holds.** The one new check that observes class 7's outcome is authored as a test of the reduced builder, i.e. it lands with the class-7 edit rather than ahead of it. No registration path is proposed |
| §2.2 (`TSPEC:79`–`:106`) | `pdlc/workflows/dist/` survives with tracked entry set `{pdlc-cli.mjs}`; AT-1.1 asserts the entry set, AC-1.1's **first** branch is pinned | **Holds.** AC-1.1's text and both branches are unchanged; the erratum only dates *when* it is evaluated (completion), which matches the TSPEC's placement of the assertion |
| T-4 (`TSPEC:1375`) | Blocking: do not land class 13 until erratum 4's A-1 rows are on the branch; "until then AC-1.2 is red by construction and the class-13 commit cannot pass the per-commit gate (§5.4)" | **Holds in substance.** The hold-then-order shape is exactly what C-7 now sanctions. See F-01 on vocabulary |
| T-5 (`TSPEC:1376`) | Blocking: do not land class 7 or class 11 until erratum 3 has an upstream disposition | **Holds, and is now explicitly legitimate.** The erratum states that holding a class leaves the feature incomplete rather than in violation, and that ungated classes may still land as their own commits — the TSPEC's exact posture |

No TSPEC statement cites C-7 for something the REQ no longer says, and nothing in the TSPEC
proposes shipping, merging or declaring completion on a green subset with classes 7, 11 or 13
still held — the one behaviour the new final sentence forbids. **The confirmation holds.**
