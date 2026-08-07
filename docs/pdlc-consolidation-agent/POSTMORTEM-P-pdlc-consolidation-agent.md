# POSTMORTEM — Phase P — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `DECISIONS` → `PLAN` → **POSTMORTEM-P** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{1,2}.md` (4 files); `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v9.md` (the failed erratum confirmation) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 1.0 | 2026-08-06 |

RESOLVED: no

## Phase

**Phase P — PLAN authoring and cross-review. The review loop is not what failed.** The PLAN
converged in **two** rounds, well inside the `MAX_REVIEW_ROUNDS = 5` window, with both approvers
holding an approval and approval anchors recorded (`0339276b`,
`sha256:6f58b4ede3bcb91d4ece30763feea5f27864206107aede499f7d1e653ed7a997`). What halted the phase is
the **erratum channel that runs after convergence**.

| | |
|---|---|
| Document (converged) | `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md` — **v1.1**, approved by both reviewers at round 2 |
| Document (halted on) | `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` — **v1.8**, the upstream document Phase P's errata were routed to |
| Branch | `feat-pdlc-consolidation-agent` |
| PLAN window | rounds 1–2; 22:03 → 22:26 — **23 minutes**, 2 of 5 rounds consumed |
| Erratum round | TSPEC erratum round **8**, edited 22:30–22:34 (six commits, `e22a3c4c` … `569578d0`), confirmed 22:38–22:40 as TSPEC cross-review round **9** |
| Terminal state | delta confirmation **did not pass** — non-approving: **`te-review`** (`VERDICT: Needs revision`, 1 High + 2 Medium). `pm-review` returned `VERDICT: Approved with minor changes` |
| Halt rule | one erratum round per upstream doc per phase (shipped constant); a **failed confirmation** halts to the current phase's POSTMORTEM. No second round was available |

**This is a different failure from the three that precede it, and the difference is the whole point
of this document.** `POSTMORTEM-R`, `POSTMORTEM-F` and `POSTMORTEM-T` are all *exhausted-window*
halts: five rounds consumed, no pair of approvals, the loop out of budget. This one is an
**erratum-protocol** halt. The budget was never touched — the PLAN used 2 of its 5 rounds, and the
erratum round used its 1 of 1. Nothing was slow, nothing stalled, and no reviewer refused to
converge. One bounded repair to an upstream document was attempted, and one of the two approvers of
that document declined to confirm it.

**What the errata were.** Phase P raised **13 erratum lines** against the TSPEC across four reviews
(PM PLAN v1/v2, TE PLAN v1/v2) and the se-author's own hand-off scan. De-duplicated they are **six
distinct defects**, and the shape of that set is diagnostic:

| # | Distinct defect | Raise lines | Class |
|---|---|---|---|
| E-1 | §12.3's traceability table omits `AT-M11`, `AT-Q13`, `AT-R7` | 5 | traceability bookkeeping |
| E-2 | §12.3 fixes the register at "96 ids, measured at v11.1"; FSPEC is v11.3 and re-enumeration gives **99** | 4 | stale transcribed count |
| E-3 | the same three ids have no test **level** and no test **file** | 1 | coverage assignment (a facet of E-1) |
| E-4 | §3.2's modified-files table omits `CLAUDE.md`, whose `:62` is already false at HEAD | 2 | file-touch bookkeeping |
| E-5 | both `SKILL.md` production edits have no falsifying test | 1 | coverage gap |
| E-6 | §11.3(c) names two L3 scan axes and misses `runtimeBundle.test.js:26`'s `BUNDLES` | 1 | coverage gap |

Every one of the thirteen raises is a **bookkeeping** defect — a table that omits a row, a count
that went stale, a production edit with no oracle. **Not one of them names the semantic defect that
actually blocked the confirmation.** That gap is § Best-Guess Root Cause.

**What the confirmation found instead.** The erratum edit resolved all six items on their own terms —
both reviewers independently re-derived the register set equality (99 ids, `comm` empty in both
directions) and confirmed it. `te-review` then filed three findings that are **not** in the raised
set:

- **F-01 (High)** — `AT-M11` was assigned a file but has **no fixture that can pass** against this
  TSPEC's own §7.3. AT-M11's fixtures carry `RELEASED: {passId} {ISO-8601}`; §7.3 (`TSPEC:926-930`)
  decides `parseMarker` accepts *exactly* `IN-PROGRESS: …` and maps present-but-unparseable ⇒
  `reclaim`, and `present` is true for a `RELEASED:`-carrying file. So a §7.3-conformant
  implementation records `reclaimed-stale-lock` on both AT-M11 fixtures — the exact outcome AT-M11
  exists to forbid. The id landed as bookkeeping; the PLAN task that must write the case (**T05**)
  is still red on arrival, which is the failure mode the register erratum was raised to prevent.
- **F-02 (Medium)** — §13.3's marker bullet (`TSPEC:2592-2608`) still hands the removal-verb question
  downstream as **open** ("The question the FSPEC owns is…", "Until it is answered…") and still
  asserts "release is an in-place write of `\"\"`". **FSPEC v11.3 answered it 13 minutes before the
  TSPEC's own erratum round began**: BR-14a (`FSPEC:2551`) decides release is an in-place write of
  `RELEASED: {passId} {ISO-8601}`, and E-11b (`:2645`) decides a `RELEASED:` marker is taken like an
  absent one at any age with no reason code.
- **F-03 (Medium)** — the new `CLAUDE.md` ↔ manifest oracle §12.2 introduces to close E-4 is **red on
  correct code as specified**. It asserts set equality between `CLAUDE.md`'s artifact enumeration and
  the ids in `distribution-manifest.json`; the manifest carries no row for itself (`orchestrate-dev`,
  `orchestrate-queue`, `pdlc-cli` — three rows, verified at HEAD) while the enumeration must keep its
  `distribution-manifest.json` bullet. The two sets structurally cannot be equal.

All three verify at HEAD. F-01 and F-02 are one defect seen from two channels; F-03 is a new one the
repair itself minted.

## Iterations

## Reviewers

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation
