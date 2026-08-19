# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 5 (delta re-confirmation — TSPEC moved v1.7 → v1.8)
**Scope:** Whether the v4 approval of PLAN still holds against TSPEC as it now stands. PLAN's own
bytes are unchanged. No re-litigation of settled PLAN decisions.

## Overview

The v4 approval anchored `UPSTREAM-STATE: TSPEC sha256:c0ee14a4…`, which is TSPEC at commit
`61a9605d` (v1.7). HEAD is `a349767b` (v1.8), a single-commit erratum round: 43 insertions, 3
deletions, all of them the version-table row, the v1.8 changelog entry, and prose added to §3.1.
No signature, no AT, no §5.1 row, no §5.5 fixture and no batch-relevant obligation moved.

What §3.1 now says that it did not say at v1.7:

1. `ADVISORY_SEAM_PHASES` is explicitly marked *(module-private)*, so its absence from the §3.1
   export block is licensed by §3's preamble rather than being a gap.
2. The behavioural oracle for the sixth row is named as the **written escalation entry**, with the
   `unknown`/`unknown` fallback at `orchestrate-dev.js:3338` as the negative control, and
   PROP-REC-07's file home is stated to be `advisoryEscalationLog.test.js`, "already on §5.1's
   edited-files list for AC-6.2", whose owning PLAN task is named as **A6-17**.
3. Phase P is instructed in as many words to "transcribe the sixth row and leave the `const`
   unexported"; a PLAN task adding `export` here is declared outside the TSPEC's interface surface.

All three are checks *on* PLAN rather than changes PLAN must absorb, so the confirmation question is
whether PLAN is still a faithful compression of §3.1 as it now reads. It is, on every load-bearing
point, and each point was verified against PLAN's bytes rather than against the item list:

| §3.1 (v1.8) now requires | PLAN at HEAD | Verdict |
|---|---|---|
| Sixth row transcribed, `const` left unexported | A6-05 (`:99`) owns `ADVISORY_SEAM_PHASES.A6 = {id: "I", outcome: "halted"}` in `orchestrate-dev.js` and says nothing about exporting it; no other task adds an export | Holds |
| No unit test may import the constant | A6-02's constant-surface RED list (`:97`) enumerates `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_ROOT_CAUSES`, `A6_PROHIBITIONS`, `ADVISORY_REFUSAL_REASONS`, `ADVISORY_EXCLUSIONS`, `ADVISORY_DEFAULTS` — `ADVISORY_SEAM_PHASES` is absent, so no import-based oracle is planned | Holds |
| PROP-REC-07 lands on `advisoryEscalationLog.test.js`, owner A6-17 | A6-17 (`:111`) declares exactly that test file, and the ownership manifest (`:152`) gives the file a single owning task, A6-17 | Holds |
| No new file, no new owner minted | PLAN's task table and manifest are unchanged; no row was needed | Holds |
| A6-17's ordering still works for an oracle that observes a GREEN-landed row | A6-17 is batch 11 on dep A6-14; the `A6` row lands in A6-05 (batch 2) and the escalation write in A6-18 (batch 12) — the red-then-green span is intact and the batch column re-derives correctly (`max(dep batch) + 1 = 11`) | Holds |

PLAN also already models the export/module-private distinction the erratum turns on: A6-00 (`:94`)
excludes `pathsCollide` from the pre-flight import list for precisely this reason — it is a bare
`function` at `orchestrate-dev.js:4726` with no `export` — so the v1.8 marking lands on a document
that treats unexported symbols correctly by habit, not by luck.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **A6-05 does not carry the "leave it unexported" instruction TSPEC v1.8 now addresses to Phase P.** The row (`:99`) heads its work "constants and vocabularies (TSPEC §3.1)" and then lists `ADVISORY_SEAM_PHASES.A6` in the same breath as `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_ROOT_CAUSES` and `A6_PROHIBITIONS` — every one of which §3.1's code block shows with a leading `export`. Nothing in PLAN contradicts the new instruction, and no task adds an export, so this is not a defect in the compression: an implementer following the row literally edits a bare `const` and adds no export, which is the required outcome. But the row is the only place an implementer looks, and the one distinction §3.1 spends a paragraph on is invisible there. Half a clause — "the table stays module-private; do not add `export`" — makes the guarantee local to the task that could break it. Not gating; fold into any later edit that touches A6-05. | §Batches, A6-05 (`PLAN:99`) |

FINDING: Low | delta | nonlocal | §Batches, A6-05 (`PLAN:99`) | A6-05 lists `ADVISORY_SEAM_PHASES.A6` alongside four exported constants without restating TSPEC v1.8's new "leave the `const` unexported" instruction; PLAN plans no export anywhere, so the outcome is already correct — the instruction is simply not local to the task that owns the edit.

No High and no Medium findings. Specifically, the three failure modes this cascade could have
produced were each checked and none is present:

- **A stale citation.** PLAN cites TSPEC §3.1 in A6-05 and A6-02 only for the constant surface. The
  §3.1 code block is byte-unchanged across the erratum; only prose beneath it grew. Neither citation
  points at text that no longer says what PLAN leans on.
- **An orphaned oracle.** If PLAN had homed PROP-REC-07's assertion on the constant (an import-based
  unit oracle), v1.8 would have stranded it — the constant is now permanently unexported by
  decision, not by accident. PLAN never did: A6-02's import list omits the table, and A6-17 owns the
  integration file §3.1 now names. The document was already written to the resolved shape.
- **A batch-column desync introduced by re-homing.** No re-homing occurred, and A6-17's declared
  batch 11 still equals `max(batch(A6-14)) + 1 = 10 + 1`. The escalation-write GREEN (A6-18, batch
  12) still follows its RED, so PROP-REC-07's oracle is red for the reason batch 11 declares.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Not blocking, and repeated from the PROPERTIES round rather than raised anew: PROP-REC-07's negative control needs a seam id absent from `ADVISORY_SEAM_PHASES`, and once A6-05 lands all six catalogued seams have rows, so the fixture must use a synthetic non-catalogue id. A6-17's row does not name that fixture shape. It is a test-authoring detail inside a task PROPERTIES already scopes, so I am not filing it as a finding against PLAN — recording it only so the batch-11 author does not reach for a catalogue seam and find the arm unreachable. No answer needed this round. |

## Positive Observations

- The erratum resolved in the direction PLAN had already taken. A6-02's import list and A6-17's file
  home were written before v1.8 existed and match its instruction exactly; the round cost PLAN
  nothing because the compression was faithful to the *behaviour* rather than to the export block.
- §3.1's new paragraph makes explicit the reason PLAN was right: an oracle that imports a frozen
  literal and asserts it contains the row it was just edited to contain restates the diff. Having
  that reasoning in the upstream document protects A6-02 from a future round trying to "complete"
  the constant surface by adding the table back.
- A6-00's exclusion of `pathsCollide` (`:94`) shows the same discipline applied a round earlier:
  PLAN distinguishes exported from module-private symbols before planning an import-based assertion,
  which is precisely the check that would have caught the v1.7 gap upstream.
- The verification map (`:295`–`:298`) still routes AT-06-3/-5/-6 through A6-17 RED to A6-18 GREEN,
  so the escalation entry's field values are proved on the production write path, not on a builder.

## Recommendation

**Approved with minor changes**

The v4 approval holds against TSPEC v1.8. The erratum was a clarification of §3.1's visibility
grammar plus a statement of where PROP-REC-07's oracle lives; PLAN was already compressed to that
shape, so no task, no batch, no dependency edge, no ownership-manifest row and no verification-map
row needs to change. The single Low (F-01) asks for half a clause in A6-05 restating that the table
stays module-private — desirable locality, not a correctness gap, and not worth a round of its own.
Fold it into any later edit touching A6-05. Phase I may proceed on this PLAN.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f
APPROVAL-HASH-NORMALIZED: sha256:ec835eb6623d8fd50edb4cdfd2134def0edb8e7083ae04eee5fb1c1c62c0d2f3
REVIEWED-COMMIT: 4ecf9c72890e4568ae33338a414b694616ad7de8
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:79777fa6310e87180c6901e9d1b87ddcb9f926147fefb9f07c52720d0c5ff8d6
UPSTREAM-STATE: DECISIONS sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
