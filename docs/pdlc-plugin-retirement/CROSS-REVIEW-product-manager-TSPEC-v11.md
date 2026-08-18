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

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **T-4's "AC-1.2 is red by construction" now uses vocabulary the REQ has just partitioned.** REQ C-7 at HEAD distinguishes two states a reader used to conflate: a *C-7 red* (a repo CI check failing at a commit) and *a completion criterion unsatisfied while its class is held* (an incomplete feature on an unmerged branch, explicitly "not a C-7 red"). T-4 (`TSPEC:1375`) calls the held state "red by construction" and T-5 (`TSPEC:1376`) says only "blocking", neither citing C-7's held-class paragraph. The obligations are correct as written and the ordering they prescribe is exactly the erratum's resolution; only the label is now ambiguous, and an implementer reading T-4 alone could believe a held class puts the branch in violation of C-7 rather than merely incomplete. Suggested fix: in T-4 replace "AC-1.2 is red by construction" with "AC-1.2 is unsatisfied until those rows land (REQ C-7, held classes — not a C-7 red)", and add the same C-7 pointer to T-5. One clause each, no design change | REQ C-7 (held classes), AC-1.2, AC-1.1 |
| F-02 | Low | Local | **§5.5's justification for TT-1b leans on the words "registered record" and "inventory entry", which the new C-7 sentence now uses for a shape it forbids.** REQ C-7 now states flatly: "There is no skip-list, no expected-failure inventory and no tolerated-red register in this feature." TSPEC §5.5 (`TSPEC:890`–`:924`) defends TT-1b's root-conditional skip precisely because it "goes through `itOrSkip` and a `SKIP_INVENTORY` capability entry", i.e. it "reaches the sink as a **registered record**", and prices the alternative as "no inventory entry, no join oracle, no upstream erratum". The two are compatible on the merits — `SKIP_INVENTORY` records a *declared capability gap in an executing run*, not a criterion tolerated in the red, and REQ AC-1.3's no-skip clause is M-8-scoped (`REQ:341`) while C-7's sentence is about criteria allowed to be red by registration — but the TSPEC nowhere draws that distinction, so the surface collision reads as a contradiction to anyone joining C-7 to §5.5. Suggested fix: one sentence in §5.5 stating that `SKIP_INVENTORY` is a capability-gap ledger, not the expected-failure or tolerated-red register REQ C-7 forbids, and that no criterion of this feature is registered as permitted-red | REQ C-7 (no skip-list / no tolerated-red register), C-8, AC-1.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | C-7 now says the branch "does not merge on a green subset: completion is all criteria satisfied at HEAD, held classes included." Classes 7 and 11 are held on erratum 3 (T-5) and class 13 on erratum 4 (T-4). Is a PLAN-time gate wanted that names those three holds as merge blockers, or is the TSPEC's per-obligation "blocking" wording plus the completion check at HEAD considered sufficient? This is a routing question for PLAN, not a TSPEC defect — the TSPEC states the holds; nothing in it claims a subset merge |

## Positive Observations

- **The erratum ratifies the TSPEC rather than moving under it.** The REQ's new "resolution is
  ordering — the check becomes live with the class it covers — never registration" is a
  restatement, at constraint level, of the rule the TSPEC already applies commit by commit
  (BR-SWEEP-4, `TSPEC:282`–`:284`: a gate-read reference never lags its subject). An upstream
  correction that a downstream document already satisfies without edits is the cheap kind, and
  it is cheap here because the TSPEC chose ordering over registration on its own.
- **The held classes were named as blocking obligations before the REQ had language for them.**
  T-4 and T-5 already routed classes 7, 11 and 13 to upstream dispositions and forbade landing
  them early. The erratum tells the implementer that this posture is completeness, not
  violation — the two documents now agree in both directions.
- **No acceptance criterion moved, so no traceability had to be re-derived.** AC-1.1's two
  branches, AC-1.2's search-and-exclude shape and AC-1.3's M-8-scoped no-skip clause are
  byte-identical to the versions the v10 approval was taken against; §2.2's pinning of AC-1.1's
  first branch and §5.2's oracle placements need no revision.

## Recommendation

**Approved with minor changes**

The v10 approval carries forward. The TSPEC remains a faithful compression of REQ v0.12: every
place it leans on C-7 still says what the TSPEC reports it says, and the erratum's one new
obligation (ordering, never registration; no subset merge) is already the TSPEC's design. Both
findings are Low and wording-level — one clause in T-4/T-5 and one sentence in §5.5 — and
neither changes an acceptance criterion, an oracle, or an implementer obligation. They can be
carried into the next ordinary revision round rather than forcing one.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:90464289a6f32ed39f13ffe30aca693f7d033e96c0bc1a08311a53b964b876e4
APPROVAL-HASH-NORMALIZED: sha256:42a25af6643c0533c9b567faece87bc60ece6effd00ae81667d22a4101c9dc90
REVIEWED-COMMIT: f1b8be6652e665d4558c39e17d15bb713a8a386a
UPSTREAM-STATE: REQ sha256:41fb21e82be8b5c5622da7638abde6694890703ec72bf257fbefa7f52dda9c51
UPSTREAM-STATE: FSPEC sha256:dccb45d6fb253d197b7a197288a3381b330903fc4ac49efbf0c99b410c79ade0
