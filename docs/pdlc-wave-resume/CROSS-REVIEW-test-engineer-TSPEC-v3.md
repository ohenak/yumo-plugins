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

This is my lens, so it gets the closest reading: **does any TSPEC test, oracle, or sequencing
precondition change meaning under REQ v1.7?**

**AT-14 and the rebase precondition — unchanged, and better grounded.** TSPEC §5.4 AT-14 and
§6.2 OB-F1 carry the round's most consequential test claim: AT-14 is red in this tree, in wave
mode a red gate halts the wave and every wave after it, so *the wave carrying AT-14 must not be
dispatched before the rebase* — a PLAN sequencing precondition, not a caveat. That claim rests on
BL-04 being unmet. Before this round, TSPEC asserted "unmet" against a REQ §5 row that read
neutrally and a REQ §10 that read "open and unmet"; the erratum removed the ambiguity in the
direction TSPEC had already chosen. **A load-bearing sequencing precondition just got a firmer
upstream anchor.** Nothing to revise; this is the delta doing its job.

**Falsifiability of AT-14's three conjuncts — unaffected.** Line-equality on
`/.claude/pdlc-wave-state.json`, the explicit root-anchoring assertion, and the
`git check-ignore -v` resolution oracle all read this repo's tracked `.gitignore`. The erratum's
subject is an *untracked, consumer-local* include list. No conjunct's input moved, and the
prohibition TSPEC records — no weakening to "no churn observed", no `some(line => line.includes(…))`
that an unanchored rule would also satisfy — still stands on its own rationale.

**Set-equality oracles — unaffected.** OB-F5's discharge (AT-02 / AT-08 / AT-13 as transcribed
set-equality assertions over the three frozen catalogues, including `ANCESTRY_INDEPENDENT_CODES`)
depends on REQ's IG catalogue being closed. The delta does not touch REQ-WVR-02's IG rows — that
was the *previous* erratum round (v1.6, "IG labels name causes, not precedence"), which I already
reviewed at v2. My v2 F-01 (missing set-equality oracle on `ANCESTRY_INDEPENDENT_CODES`, Medium,
routed to Phase P) is untouched by this delta and stays where it was routed; I am not re-raising
it here, and it is not `inherited`-tagged below because it is not open against this document — it
was accepted as a Phase P obligation at v2.

**Call-count and ancestry oracles — unaffected.** AT-03 / AT-11's `merge-base` call-count oracles
(equality, not containment) and RT-2's extraction-regression argument read shipped behaviour at
`origin/main 345ae358`. The delta changes no claim about shipped behaviour.

**Worktree fail-open — no new test owed.** One could ask whether the erratum's sharper "consumer
fact, not a repo fact" framing creates a new testable obligation. It does not, and the reason is
the right one rather than a convenient one: the state under test (record absent → full run) is
what FSPEC EC-17 already specifies and what TSPEC §3.2 already covers; the erratum changed *why
the record is absent*, and "why an untracked consumer-local file is absent" is not a property this
repo's suite can or should assert. TSPEC §1.2 correctly routes this to §6.3 as a documentation
matter rather than inventing an untestable oracle for it. That restraint was right at v2 and is
still right at v1.7.

**Coverage and gate strategy — untouched.** §5.8's `npm run test:coverage` as the last wave's
`postWaveCommand` (RT-7, the 85% per-file branch floor) and RT-5's `implementation.postWavePathspecs`
obligation for `pdlc/workflows/dist/` are both unmentioned by the delta.

No test-strategy finding.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | §6.3's errata ledger is written as a live list ("Raised, not fixed here; each is emitted as an `ERRATUM:` line in this dispatch's final message"), but items 2 and 4 have now been actioned upstream by this very round. Should the section carry a per-item disposition column (`open` / `landed in REQ v1.7`) so a later reader — or Phase DOD — can tell which errata are still outstanding without diffing REQ? This is the mechanism behind F-01/F-02 and would prevent the same lag recurring on the next erratum round. Non-blocking; a Phase P or authoring-time nicety. |
| Q-02 | §6.3 item 2 (FSPEC OB-F1 says BL-04 is "discharged at FSPEC authoring") is now the **only** document in the set still asserting BL-04 discharged: REQ §5 and §10 both say unmet, and TSPEC says unmet. Does that FSPEC erratum still have a route to landing, given FSPEC is byte-unmoved and its approvals are recorded? Flagging for the orchestrator's routing, not as a finding against TSPEC — TSPEC states the discrepancy correctly and is not the document that owes the fix. |

## Positive Observations

- **The document predicted its own upstream fix.** Both items this erratum round landed were
  raised by this TSPEC's §6.3 (items 2 and 4), with the correct diagnosis in each case. A
  downstream document that reads its upstream closely enough to name the upstream's defects, and
  is then vindicated by the upstream adopting its wording, is the strongest available evidence
  that the compression was faithful in the first place.
- **TSPEC was already at the stricter reading of BL-04.** §1.1 and OB-F1 asserted "unmet" with
  re-derivable evidence (`git rev-list --count HEAD..origin/main` → 1637, `grep -n WAVE_STATE_PATH`
  returning nothing, the baseline file absent) at a time when REQ §5 read neutrally. The erratum
  moved REQ to TSPEC's position, not the reverse.
- **The worktree characterisation converged from both ends.** TSPEC §1.2 called the worktree
  fail-open "a consequence of consumer-local state, not any rule this TSPEC adds"; REQ v1.7 now
  says the include list is "consumer-local — untracked on the default branch, so a consumer fact
  and not a repo fact". Independent arrival at the same framing.
- **Restraint where a new oracle would have been fake.** The erratum sharpened *why* a worktree
  lacks the ledger without changing the observable state, and TSPEC does not manufacture a test for
  an untracked consumer-local file's absence. That is the correct call, and it survives the delta.

## Recommendation

**Approved with minor changes**

TSPEC still holds as approved against REQ at HEAD (v1.7, `sha256:17e83bfc…`). No High finding is
open; the delta contradicts no TSPEC claim, invalidates no oracle, and changes no obligation's
disposition — it strengthens the upstream anchor under AT-14's rebase sequencing precondition.

The two Low findings are both bookkeeping lag confined to §6.3, the errata hand-off section: item
4 now describes an upstream defect that this round fixed, and the section's preamble names the REQ
at HEAD as v1.6 when it is v1.7. Per DEC-ERR-01 these are the demoted class — false statements in
a hand-off section with no downstream test, oracle, assertion, or obligation reading from them.
Neither gates. Both are one-line edits that a later authoring touch on this document should absorb;
neither warrants a round of its own.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | nonlocal | §6.3 item 4 raises as an open erratum that "REQ OB-1's worktree conclusion rests on `.worktreeinclude` listing only `.claude/workflows/`, but that file is not tracked on the default branch". REQ v1.7 has landed exactly that correction — OB-1 now labels the include-list evidence consumer-local and untracked rather than resting on it — so the item now narrates a defect that no longer exists upstream. The conclusion TSPEC drew is unaffected; only the ledger entry is stale. Resolve by marking item 4 landed in REQ v1.7 (or striking it), not by changing any claim in the body. | TSPEC §6.3 Errata raised upstream, item 4 |
| F-02 | Low | delta | nonlocal | §6.3's items 1–2 state "the REQ at HEAD is **v1.6**"; REQ at HEAD is now **v1.7**. The content claims attached to that version cell remain true (v1.6's rescoping of REQ-WVR-08 to the implementation wave loop is still recorded in REQ's amendment history, and item 2's verbatim quotation of REQ §10 — "**open and unmet** — not discharged at FSPEC authoring" — still matches byte-for-byte at v1.7). Only the version number is stale. Resolve by updating the two version references. | TSPEC §6.3 Errata raised upstream, items 1–2 preamble |

FINDING: Low | delta | nonlocal | TSPEC §6.3 Errata raised upstream, item 4 | The erratum against REQ OB-1's worktree evidence is recorded as open, but REQ v1.7 landed that exact correction this round; the item now describes a defect that no longer exists upstream. Bookkeeping only — the conclusion and every dependent claim in §1.2/§3.2 are unaffected, and no test or oracle reads this section.
FINDING: Low | delta | nonlocal | TSPEC §6.3 Errata raised upstream, items 1–2 preamble | "the REQ at HEAD is v1.6" is stale; REQ at HEAD is v1.7. The attached content claims and item 2's verbatim quotation of REQ §10 still hold exactly, so this is a version-cell refresh, not a fidelity break.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
