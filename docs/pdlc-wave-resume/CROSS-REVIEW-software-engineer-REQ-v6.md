# Cross-Review: software-engineer — REQ (delta confirmation, round v6)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.7)
**Date:** 2026-08-21
**Iteration:** 6
**Round type:** Delta confirmation (Phase T erratum)
**Scope:** Local — REQ v1.7 delta against v1.6 (reviewed commit `7660f1ed`), plus DEC-ERR-03 upstream re-grounding at HEAD

## Problem / Context

This is a **delta confirmation**, not a fresh review. I approved this REQ at v1.6 (round v5,
`REVIEWED-COMMIT: 7660f1ed`, *Approved with minor changes*). A Phase T erratum round has since
landed three commits touching this document:

| Commit | Change |
|---|---|
| `1ec391c1` | §5's BL-04 row restated: the FSPEC-authoring check was performed and found **unmet**; the row is explicitly *not* discharged, cross-referencing §10 |
| `ea43a474` | §9 OB-1's worktree conclusion relabels its include-list evidence as consumer-local and untracked on the default branch, rather than a repo fact |
| `5753de27` | Frontmatter version 1.6 → 1.7 and a new v1.7 erratum changelog paragraph recording exactly those two items |

`git diff 7660f1ed..HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md` is four hunks and
nothing else: the version cell, the changelog paragraph, the BL-04 row, and the OB-1 worktree
clause. No requirement id, acceptance criterion, invariant, or measured-fact citation moved.

The four routed items reduce to two distinct defects — one BL-04/§10 contradiction (OB-F1, raised
by pm-review and se-author) and one over-claimed worktree evidence citation (raised three times
across pm-review and se-author). Both are addressed below, and per DEC-ERR-03 I re-grounded the
upstream facts this REQ now leans on at their current HEAD state rather than accepting the item
list as the whole scope.

## Goals

One question, asked and answered: **does this delta resolve the routed items without breaking
anything I previously approved?**

Item-by-item disposition:

| Routed item | Landed? | Evidence |
|---|---|---|
| OB-F1 — §10 says BL-04 open/unmet, §5 read as discharged at FSPEC authoring | **Yes** | §5 line 231 now reads "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)"; §10 line 558 reads "BL-04 is **open and unmet** — not discharged at FSPEC authoring". `grep -n "BL-04\|discharged at FSPEC"` over the whole file returns six hits (lines 29, 40, 43–44, 55, 231, 558) and no residual site states or implies discharge. The contradiction is gone in both directions, not patched on one side. |
| OB-1 cites `.worktreeinclude`, untracked on the default branch (pm-review) | **Yes** | §9 OB-1 no longer names the file as a repo fact; it names "the worktree include list that carries `.claude/workflows/` into a worktree" and labels it "consumer-local — untracked on the default branch, so a consumer fact and not a repo fact". |
| Same item, se-author phrasing (evidence is consumer-local, conclusion holds) | **Yes** | Same hunk. The conclusion — a Claude-created worktree has no ledger and therefore fails open to a full run — is preserved verbatim in substance, with the D-DIST-07 consistency note and the TSPEC obligation untouched. |
| Same item, se-author phrasing (file not tracked, evidence not a repo fact) | **Yes** | Same hunk. |

The edits are **targeted and versioned** as an erratum round should be: the changelog paragraph
names the two items and asserts "nothing else changed", and the diff bears that assertion out.
The document's requirement surface (REQ-WVR-01..08), invariant guards (IG-1..IG-6), measured
observations (OF-1..3), risks (R-1..R-5) and obligations (OB-1..OB-2) are byte-identical to the
bytes I approved at v1.6.

## Non-Goals

Deliberately outside this round:

- **Re-review of unchanged sections.** §§1–4, 6–8, and the whole requirement/invariant surface were
  approved at v1.6 and are untouched by this delta. I did not re-litigate them, and no finding
  below contests a settled decision.
- **The TSPEC's own `.worktreeinclude` citation.** `TSPEC-pdlc-wave-resume.md:879–881` still names
  the file directly — but that is the downstream document that *raised* the observation, it
  already records the untracked status itself, and TSPEC is not the artifact under confirmation
  here. Not a finding against this REQ.
- **Product framing, user-story shape, test-level choices.** Not the engineering lens.
- **Whether BL-04 should be discharged.** Whether the branch gets rebased is a Phase-level
  operator decision; my scope is only whether the REQ *states* BL-04's status truthfully and
  self-consistently. It now does.

## Constraints

**DEC-ERR-03 re-grounding — is this REQ still a faithful compression of its upstream at HEAD?**
The item list is necessary, not sufficient. I re-ran the upstream checks the edited claims and
their neighbours depend on, against the default branch as it stands today, not against the
authoring tree:

| Claim in REQ (v1.7) | Where | Re-derivation at HEAD | Verdict |
|---|---|---|---|
| The worktree include list is untracked on the default branch | §9 OB-1 | `git ls-tree -r origin/main --name-only \| grep worktreeinclude` → no rows; the file exists locally (19 bytes, content `.claude/workflows/`) | **Holds.** The new wording is exactly right: consumer-local fact, not a repo fact |
| A worktree therefore has no ledger and fails open to a full run | §9 OB-1 | Follows from the above plus `WAVE_STATE_PATH` = `.claude/pdlc-wave-state.json`, itself consumer-local and untracked | **Holds.** Conclusion survived the evidence relabel, which is the point of the edit |
| The authoring tree carries neither the resume mechanism nor the baseline file | §5 BL-04, §10 | `grep startWave` in this tree → absent; `git grep startWave origin/main -- pdlc/workflows/orchestrate-dev.js` → present from line 166. `ls docs/_constraints/pdlc-wave-gate-baseline.md` → absent here; present on `origin/main` | **Holds.** BL-04's "unmet" is a measured statement, not an assertion |
| This branch is 1,637 commits behind the default branch | §Note on base | `git rev-list --count HEAD..origin/main` → 1637 | **Holds exactly** |
| Baseline file is at `Version 1.2 · 2026-08-20` with ids through `M-WG-14` | §9 OB-2 | `git show origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` → version cell `1.2 · 2026-08-20`; highest id `M-WG-14` | **Holds** |
| Shipped ledger contract cited by exported symbol name | §9 OB-1 | All eight symbols resolve on `origin/main` in `pdlc/workflows/orchestrate-dev.js`: `WAVE_STATE_PATH`, `computePlanHash`, `parseWaveLedger`, `formatWaveLedger`, `writeWaveLedger`, `explicitPointer`, `allWavesRecorded`, `headCorroborated` | **Holds.** Symbol-name citation (SE G-02, TE G-04) remains grep-stable |
| Ledger tests live in `pdlc/workflows/__tests__/waveExecution.test.js` | §9 OB-1 | File exists on `origin/main` and matches ledger-parsing symbols | **Holds** |
| §1's replay arithmetic: waves 1–3 hold 7 tasks; wave-2 halt replays one task | §1, OF-1 §4 | §1's trimmed v1.6 wording still agrees with OF-1's re-derivation recipe (W1=`[T00]`, W2=`[T01..T05]`, W3=`[T06]` ⇒ 1+5+1=7) | **Holds.** The v1.6 trim did not damage the arithmetic |

Nothing this REQ cites has moved upstream, and nothing it says is a stale reading of upstream text.
No DEC-ERR-03 finding arises. Citation convention (DEC-DOC-01) is likewise unaffected: the delta
removed a filename-anchored evidence claim and added none; the surviving citations are symbol
names, spec ids, and `M-*` measured-fact ids.

## Acceptance Criteria

What this confirmation had to be true to approve, and whether it is:

| # | Criterion | Met |
|---|---|---|
| AC-1 | Every routed item has landed in the document bytes | **Yes** — four items, two distinct defects, both landed (see Goals table) |
| AC-2 | No routed item landed only partially (one side of a contradiction fixed, the other left) | **Yes** — BL-04 is consistent at §5, §10, and the §Note-on-base cross-reference at line 55 |
| AC-3 | The edit broke nothing I previously approved | **Yes** — the diff is four hunks; requirement ids, invariants, ACs, risks, measured facts untouched |
| AC-4 | The erratum is recorded as a versioned changelog entry, not a silent edit | **Yes** — version 1.6 → 1.7 with a v1.7 paragraph naming both items and their raisers |
| AC-5 | The document remains a faithful compression of upstream at HEAD (DEC-ERR-03) | **Yes** — eight upstream claims re-derived, all hold (see Constraints) |
| AC-6 | No new unverified existing-code claim was introduced | **Yes** — the delta *removes* one over-claimed code/repo fact and adds no new one |
| AC-7 | Altitude preserved: no implementation contract crept into the REQ | **Yes** — OB-1 already carried shipped-contract detail as an explicitly-flagged reconciliation note for TSPEC; the edit narrows its evidence claim rather than adding mechanics |

No High finding arises against any criterion.

## Risks

## Obligations

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
