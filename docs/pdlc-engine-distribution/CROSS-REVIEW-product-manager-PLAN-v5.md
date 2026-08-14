# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.5)
**Date:** 2026-08-14
**Iteration:** 5 (delta confirmation — erratum round, not a full re-review)
**Scope:** Delta confirmation of the FSPEC AT-3.8a erratum discharge. Product lens only. Diffed
`d377dbc7..HEAD` on the PLAN (lineage header, changelog row 0.5, T16, §7's erratum paragraph).
Re-grounded against upstream at HEAD per DEC-ERR-03: REQ v0.11, FSPEC v0.5, TSPEC v0.12,
DECISIONS v0.3.

## Raised item — disposition

**Item: the FSPEC AT-3.8a erratum is discharged; T16's block should lift.** **Confirmed resolved.**

Verified against upstream, not against the item text:

- **FSPEC AT-3.8a at HEAD** (`FSPEC:730-745`) no longer restates a member list. It states that the
  enumerated members equal the expected set member-for-member; that the member count equals §5.2's
  (**23 before N-2's licence decision is recorded, 24 after**, and §5.2's per-class counts); that
  the count conjunct is asserted against the **transcribed** `PK-*` list, never the tarball's own
  length (BR-8.1's self-derived-expectation ban); that its **classes and count are §5.2's** and its
  **member names are downstream in TSPEC §5.4's `PK-*` table**, the single source the verifier
  transcribes; and that AT-3.8a is the authoritative whole-set assertion with AT-3.8b a
  sub-assertion over one class. The four-member divergence the erratum named is gone.
- **The ownership split is upstream law, not a PLAN reading.** REQ v0.11's AC-1.3 (`REQ:264-273`)
  states it in the AC itself — classes and per-class counts in the FSPEC, member names downstream
  in the TSPEC — and TSPEC v0.12's changelog records the reciprocal co-change obligation.
- **The arithmetic closes on both sides.** FSPEC §5.2's per-class counts (manifest 1, package
  README 1, CLI entry 2, engine modules 15, workflow modules 3, install script 1, licence 0/1)
  sum to 23/24. TSPEC §5.4's `PK-*` rows enumerate `PK-1`, `PK-2`, `PK-4`, `PK-4b` (four
  manifest-adjacent/`bin/`), `PK-5`…`PK-19` (fifteen `lib/*.mjs`), `PK-20`…`PK-22` (three
  vendored), `PK-23` (install script), plus `PK-3` (licence, conditional) — the same 23/24,
  derived from its own rows rather than copied. T16's two-sided statement is faithful to both.
- **T16 now transcribes and defers to nothing** (`PLAN:137`), naming members from TSPEC §5.4,
  classes and counts from FSPEC §5.2, and the transcribed-list rule for the count conjunct. That
  is the correct reading of AT-3.8a at HEAD, including the `TE round-4 F-03` conjunct FSPEC added.
- **§7 drops to two open errata** and both are still genuinely open upstream: `node.below-floor`
  is still registered in TSPEC §10.3's catalogue set (`TSPEC:1752`) against §9.3's import-free
  guard, and §12.1's fixture-machine legs (`TSPEC:1645-1647`) still name no workflow file that
  runs them. Neither was silently discharged, so the Phase-I bar the PLAN keeps is honest.

## Regression check on previously approved content

- **§2.1's set-equality survives the upstream move.** The AT-id set in FSPEC at HEAD (35 ids) is
  set-equal to the AT-id set appearing in the PLAN, in both directions — transposed mechanically,
  zero rows either way. FSPEC v0.3–v0.5 added and removed no acceptance-test id.
- **No task row was added, removed, re-batched or re-scoped**; the diff touches four regions only.
  Batch arithmetic, ownership manifest and the dependency graph are untouched.
- **FSPEC v0.5's `[blocked on O-10]` drop has no PLAN consequence** — the PLAN cites O-10 nowhere,
  and T11/T33/T41's vendored-member work already reads `PK-20`…`PK-22` as named members.
- **REQ v0.11 changed only AC-1.3's wording** (plus a prose citation in the v0.10 changelog). The
  PLAN absorbed AC-1.3 ahead of the raised item, as DEC-ERR-01 requires. FSPEC v0.3's other
  changes — the `AT-7.x` → **AT-6.2** citation fix and AC-3.5's two positives folded into AT-3.5 —
  are both already carried: no `AT-7` id appears in the PLAN, and §2.1's AT-3.5 row and DoD item 11
  both name the two positives.
- **Scope is unchanged.** Nothing in the delta adds product behaviour, and no round-4 cross-review
  finding is pre-empted here.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §2.1's AT-3.8a row still paraphrases the criterion as "packed set equals §5.2's **writable** classes; pairing record present". The word `writable` no longer appears anywhere in FSPEC at HEAD, and the paraphrase predates the ownership split: at HEAD, §5.2 owns classes and per-class counts while TSPEC §5.4 owns member names, and the criterion carries a **count conjunct** the cell omits. No transcription consequence — §2 is declared the source of truth and T16 states both halves correctly — but the traceability table now summarises upstream text that no longer reads that way. Suggest: "packed set equals the expected set member-for-member (members from TSPEC §5.4, classes and counts from FSPEC §5.2), count conjunct against the transcribed list; pairing record present". | AC-1.3, AT-3.8a |
| F-02 | Low | Local | The discharge is attributed to the wrong FSPEC version in two places. §7's paragraph and the v0.5 changelog say the erratum's wording "read … at v0.3" and that "**FSPEC v0.4/v0.5 removed that literal**". FSPEC **v0.3** removed it (`FSPEC:39-44`: "the packed-member enumeration … no longer restates a member list of its own"); v0.4 and v0.5 added the class rows, the member count as the FSPEC-side change-control point, the authoritative/sub-assertion split and the transcribed-count rule. The discharge itself is correct at HEAD; only the provenance is off by one version, which would mislead anyone auditing when the divergence actually closed. Suggest: attribute the literal's removal to v0.3 and the ownership/count work to v0.4/v0.5. | AT-3.8a |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DoD item 10 states the packed set equals TSPEC §5.4's `PK-*` table in both directions but says nothing about the count conjunct against FSPEC §5.2's per-class counts, which is now the change-control point that catches a missed co-change. T16 carries it. Is the intent that DoD item 10 remains a set-equality-only gate, with the conjunct verified by T16's own red/green, or should item 10 name it too? Not raised as a finding: item 10 is true as written and was approved at v0.4. |

## Positive Observations

- The upstream re-grounding is done in the right order and in the open: all four lineage versions
  corrected, the absorbed decisions enumerated in `AC-`/`BR-`/`PK-` vocabulary **before** the raised
  item, and the raised item stated as the only substantive change. This is DEC-ERR-01 followed
  literally rather than gestured at.
- T16's rewrite states *why* the two-sided source is safe — members from one document, classes and
  counts from the other, non-overlapping — instead of merely deleting the block. An implementer now
  knows which document to reopen when either half moves.
- §7's paragraph keeps the discharged erratum's history rather than deleting it, so the record of
  what was wrong by four members and how it closed survives into harvest.
- The claim "no row was added, removed, re-batched or re-scoped" is exactly true of the diff.
  Erratum rounds are where scope quietly grows; this one did not.

## Recommendation

**Approved with minor changes.**

The raised item is resolved, and the resolution is faithful to upstream at HEAD rather than to the
item list alone. Nothing previously approved is broken: the AT-id set-equality, the task table, the
batch arithmetic and the ownership manifest all hold, and the two remaining errata are genuinely
still open. F-01 and F-02 are prose-fidelity nits with no transcription consequence and need not
gate Phase I; fold them into the next revision of this document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:a59bb90cbf90d3df2a0425a4e2f7e8f732e3305ed0301a70e18a9e3a7b0719aa
APPROVAL-HASH-NORMALIZED: sha256:9659b0b277e1229a919e7660b5989a59b4e12b1201ffda6889fddf4c12730f61
REVIEWED-COMMIT: 4097aec7db2db9f3554c8ff4e4f048d06fad2822
