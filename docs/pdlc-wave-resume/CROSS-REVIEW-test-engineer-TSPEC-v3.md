# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3 (upstream-cascade confirmation, not a re-review)

## Overview

This round is an **upstream-cascade confirmation**, not a re-review. TSPEC's own bytes are
unchanged since my v2 approval (`sha256:3cd713c0…`, `REVIEWED-COMMIT: 0c70e900`). What moved is
REQ: my v2 anchors pinned `UPSTREAM-STATE: REQ sha256:ad68cd05…`, and REQ at HEAD is
`sha256:17e83bfc…` (v1.7). FSPEC is unmoved — `sha256:1c05f511…` matches the byte-state my v2
anchors recorded — so nothing in this round touches the FSPEC-facing half of TSPEC.

The single question answered here: **does TSPEC still hold as approved against REQ v1.7?**

The REQ delta, read from `git diff 0c70e900 HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md`,
is four hunks and two substantive items:

| # | Hunk | Change |
|---|------|--------|
| 1 | header `Version` cell | `1.6` → `1.7` |
| 2 | §1 amendment block | new "Erratum, 2026-08-21 (v1.7) — Phase T erratum" paragraph naming the two items below |
| 3 | §5 BL-04 row | now reads "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)", where it previously read as a neutral "Checked at FSPEC authoring:" |
| 4 | §9 OB-1 | the worktree conclusion's evidence is relabelled: the include list carrying `.claude/workflows/` is **consumer-local — untracked on the default branch, so a consumer fact and not a repo fact**, rather than the bare `.worktreeinclude lists only .claude/workflows/` assertion |

Both items are ones **this TSPEC itself raised** as upstream errata in its §6.3 (items 2 and 4).
The round landed them. That is the pleasant case for a confirmation: the upstream did not move
away from the document, it moved *toward* it. My verification below is nevertheless the full
DEC-ERR-03 one — I re-read the upstream text TSPEC leans on at its current version and asked
whether TSPEC is still a faithful compression of it, not merely whether the two items landed.

Outcome, stated up front: **TSPEC still holds.** No High, no Medium. Two Low findings, both
staleness in TSPEC §6.3 — the errata hand-off section — where TSPEC now describes an upstream
state that the round it asked for has superseded. Per DEC-ERR-01 these are the demoted class: a
false statement confined to a hand-off section, with no downstream test, oracle, or assertion
reading from it.

## Architecture

**Where TSPEC touches the changed REQ material.** I grepped the document for every surface the
delta could reach — `BL-04`, `OB-1`, `worktreeinclude`, `worktree`, `§10`, `rebase`, `v1.6` — and
resolved each hit against REQ v1.7 rather than against my memory of v1.6.

| TSPEC site | Leans on | REQ v1.7 says | Still faithful? |
|---|---|---|---|
| §1.1 "Grounding, a prerequisite not met" | REQ BL-04 requires the mechanism and `pdlc-wave-gate-baseline.md` readable in the authoring tree; TSPEC states it is **not** | §5 BL-04 now states the outcome as **unmet**, not discharged | **Yes — strengthened.** TSPEC asserted unmet against a REQ row that was neutral about its own outcome. The row now agrees explicitly. |
| §6.2 OB-F1 | "REQ BL-04 unmet … Re-raised as an erratum below, because the REQ's §10 and the FSPEC's OB-F1 characterise it inconsistently" | §5 and §10 now agree (`open and unmet — not discharged at FSPEC authoring`) | **Yes.** The inconsistency OB-F1 named was REQ-§10-vs-FSPEC-OB-F1, and that half is untouched: FSPEC is byte-unmoved and still says "discharged". OB-F1's re-raise remains live and correctly aimed. |
| §1.2 / §3.2 "Worktrees fail open" | "a Claude-created worktree will not carry `.claude/pdlc-wave-state.json`, so the record is absent and the run is a silent full one (FSPEC EC-17) … a consequence of consumer-local state, not any rule this TSPEC adds; see §6.3" | §9 OB-1 now says the include list is consumer-local, untracked on the default branch, "leaving the ledger's consumer-local path absent there, so it fails open to a full run" | **Yes — converged.** TSPEC already characterised this as consumer-local state; REQ has now adopted the same characterisation. The two documents read the same way where before TSPEC was the more careful of the pair. |
| §6.3 item 4 | "REQ OB-1's worktree conclusion rests on `.worktreeinclude` listing only `.claude/workflows/`, but that file is **not tracked on the default branch**" | REQ no longer rests the conclusion on that; it labels the evidence consumer-local itself | **No — stale.** See F-01. |
| §6.3 items 1–2 preamble | "the REQ at HEAD is **v1.6**" | REQ at HEAD is **v1.7** | **No — stale.** See F-02. |
| §6.3 item 2 (quotation) | quotes REQ §10 as "**open and unmet** — not discharged at FSPEC authoring" | §10 line is verbatim unchanged at v1.7 | **Yes.** The quoted bytes still exist verbatim; this erratum against FSPEC remains open and correctly stated. |
| §6.3 item 3 | FSPEC's missing explicit-pointer write clause | FSPEC unmoved | **Yes.** Untouched by this round. |
| §6.2 OB-F4 | `pdlc-wave-gate-baseline.md` at `Version 1.2 · 2026-08-20`, ids through `M-WG-14` | REQ §5 BL-02 and the amendment history cite the same baseline at v1.2 | **Yes.** The delta did not touch the baseline citations. |

**Structural conclusion.** The delta moved REQ in exactly the direction TSPEC's own errata asked
for. It contradicts no TSPEC claim, invalidates no oracle, and changes no obligation's
disposition. The only residue is that TSPEC's errata ledger now narrates a fixed defect and an
old version number — a bookkeeping lag in a hand-off section, not a fidelity break in the
document's load-bearing body.

## Interfaces

The delta touches no interface TSPEC specifies, and I confirmed that positively rather than by
absence.

TSPEC's interface surface is §2 and §3: the three module-level pure functions extracted from
`orchestrate-dev.js`, the `parseWaveLedger` contract and its `{}` "cleared" tolerance
(DEC-WVR-04), the `WAVE_STATE_PATH` location and encoding, the `ANCESTRY_INDEPENDENT_CODES`
frozen export, the announcement suffix strings, and the run-report detail field. The REQ delta
edits a header version cell, an amendment paragraph, one prerequisite-table row's outcome text,
and one paragraph of OB-1's rationale. None of those name a symbol, a config key, a path, an
encoding, or a string literal.

Two interface-adjacent checks I ran because the confirmation bar is fidelity, not item-landing:

1. **`WAVE_STATE_PATH` / ledger location.** REQ v1.7's OB-1 rewording is the only place the
   record's location is discussed in the delta, and it discusses it as *absence in a worktree*,
   not as a location contract. REQ §9 OB-1 still explicitly delegates "the resume record's
   location, format, matching rules" to the TSPEC (`owner: TSPEC`). TSPEC's ownership of that
   interface is unchanged and unchallenged.
2. **The ignore-rule interface behind AT-14.** REQ-WVR-10 and the `.gitignore` line
   `/.claude/pdlc-wave-state.json` are untouched by the delta. AT-14's three conjuncts —
   line-equality, root-anchoring, and `git check-ignore -v` resolving to *that* line — still
   trace to unchanged REQ text. Notably the delta's new "consumer-local, untracked" framing of
   the worktree include list does **not** weaken AT-14: AT-14 asserts over this repo's tracked
   `.gitignore`, not over any consumer-local include list, so the two live on different sides of
   the tracked/untracked boundary the erratum drew.

No interface finding.

## Data Model

The delta introduces, removes, and renames nothing in the data model, and the one place it comes
close is worth stating explicitly because it is the load-bearing one for this feature.

**The ledger record.** `{ lastGreenWave, headSha, … }` written to `.claude/pdlc-wave-state.json`,
its `{}` cleared-shape tolerance, and the matching procedure in §3.2 are TSPEC-owned per REQ OB-1
and are not mentioned by the delta. `parseWaveLedger`'s tolerance decision (DEC-WVR-04: keep the
tolerance, add no writer) rests on OB-F3, which is discharged and untouched.

**The worktree absence case.** This is the only data-model-shaped statement the delta rewrites,
and it rewrites the *justification*, not the *state*. Before: the record is absent in a
Claude-created worktree because `.worktreeinclude` lists only `.claude/workflows/`. After: the
record is absent because the include list that carries `.claude/workflows/` is itself
consumer-local and untracked, so the ledger's consumer-local path is absent there. **The modelled
state is identical in both readings — record absent, run fails open to a full run.** TSPEC §1.2
and §3.2 model exactly that state and attribute it to consumer-local state, so the model TSPEC
carries survives the rewrite intact. FSPEC EC-17, which TSPEC cites for this case, is byte-unmoved.

**Prerequisite state.** BL-04's value changed from "checked" to "checked and unmet". TSPEC models
BL-04 as unmet in §1.1 and OB-F2/OB-F1 — it was already at the stricter value. No data-model
finding.

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Verdict
