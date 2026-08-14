# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.8)
**Date:** 2026-08-14
**Iteration:** 7 (erratum delta confirmation, not a full re-review)

**Scope:** Erratum delta confirmation over PLAN v0.6 → v0.8. Two raised items (T15(e) at
`PLAN:146`, §5 step 5 at `PLAN:458`), plus the DEC-ERR-03 obligation to check the whole document
against upstream **at HEAD** — FSPEC v0.7, REQ v0.11, TSPEC v0.12, DECISIONS v0.3.

**Reviewed against commit:** `6030d7e3`. Previously approved at `df4d1c44`
(`CROSS-REVIEW-product-manager-PLAN-v6.md`, Approved with minor changes).

## 1. Raised items

Both raised items are discharged at HEAD, and the PLAN's account of *when* they were discharged is
accurate rather than convenient.

**T15(e), `PLAN:146`.** Now reads: an unparseable plugin manifest "refuses naming the **root and
the parse failure**, and the assertion pins that it is **not** AT-1.1's `not found` message". That
is FSPEC AT-1.4 verbatim in substance (`FSPEC:687-689`: "refusal names the root and the parse
failure; it is **not** AT-1.1's `not found` message"). The reference no longer dangles: AT-1.1
exists, is named, and its literal is the one the shipped code emits — `handshake.mjs:146,159,164`
constructs and asserts the exact string `not found`. ✅ Resolved.

**§5 step 5, `PLAN:458`.** Now reads "the unparseable-manifest refusal is not AT-1.1's `not found`
message", the same repointing in the DoD-facing prose. ✅ Resolved.

**The item list arrived stale, and the PLAN says so with evidence.** Both edits landed in
`8980ffe7`, which is the commit *before* `a57e0547` (the FSPEC v0.7 round that re-raised them).
I verified the ordering in `git log` and the content in `git diff df4d1c44..HEAD`. The v0.8
changelog states this plainly instead of silently re-applying a fix that was already in place —
the honest version of the record, and the one a future reader can check.

**The residue the item list did *not* name was found and fixed anyway.** §2.1's trace row was
still *titled* "AT-1.1 *(AC-1.1)* refusal, none installed" — the last occurrence of the retired
literal in this document. It now reads "refusal, plugin reported `not found`". This is the right
call and the right severity assessment: it is an index label, no implementer could have written it
into a test (T15(e) and step 5 both pin the correct text), but leaving it would have kept dragging
reviewers back to a settled question. `grep -n "none installed"` over the PLAN now returns only
changelog rows 0.7 and 0.8, where the string appears as the *subject* of the retirement — no
assertion text, exactly as the changelog claims.

## 2. Upstream re-grounding at HEAD (DEC-ERR-03)

I re-read the four upstream documents at HEAD rather than trusting the lineage cell, and diffed
FSPEC across the interval this PLAN was re-grounded over (`7076e771..a57e0547`, v0.5 → v0.7).

**Lineage cell is correct.** REQ v0.11 (sha `abd47bee…`, matching the dispatch), FSPEC **v0.7**,
TSPEC v0.12, DECISIONS v0.3 — all four match the Upstream cell as edited. The FSPEC bump from v0.6
to v0.7 is named, with its commit (`a57e0547`), and the PLAN's own v0.7 → v0.8 sequencing is
consistent with the file history.

**The three absorbed FSPEC v0.7 decisions transcribe correctly, and each is genuinely inert:**

- **(a) Class rename.** `FSPEC:537` now reads `Workflow members`; the count paragraph reads
  "workflow members 3". T16's sub-assertion sentence adopts the new name and states why
  (`PK-22` is a JSON manifest, not a module) and that membership is unchanged. `grep` confirms
  T16 is the only place this PLAN names the class, so the rename is fully propagated.
- **(b) PK anchors on the CLI-entry and engine-module rows.** `FSPEC:534-535` now anchor
  `PK-4`/`PK-4b` and `PK-5`…`PK-19`, and the CLI-entry note drops the "downstream-only choice"
  wording that contradicted its own per-class count of 2. T16 reads member names from TSPEC §5.4
  and classes/counts from FSPEC §5.2, so the anchors change nothing it transcribes — the PLAN's
  claim, and it holds.
- **(c) AT-3.8a's count conjunct stated positively.** `FSPEC:769-773` now asserts that the
  transcribed `PK-*` list's length equals §5.2's total, rather than only forbidding the tarball's
  own length. T16 already carried the positive form ("asserted against the **transcribed** `PK-*`
  list, never the tarball's own length"). Wording match, not an oracle change — confirmed.

**The counts are unmoved.** FSPEC §5.2 still totals 23 before N-2 and 24 after; T16 still
transcribes 23/24; TSPEC §5.4 still derives its total from its own `PK-*` rows. FSPEC v0.7's own
changelog asserts "No criterion, oracle or count changed", and the diff bears that out.

**The AT-1.x literal alignment reaches this document correctly.** FSPEC v0.6 renamed the missing
plugin literal to `not found` in AT-1.1, AT-1.6 and Q-1. PLAN §2.1's AT-1.1 row title, T15(e) and
§5 step 5 all now read `not found`; T15(g)'s three-way triple equality (AT-1.6) is unaffected,
since equality is the right relation for the triple member. One nuance FSPEC v0.6 added did not
reach the PLAN — see F-01, which is Low and not gating.

**REQ v0.11's AC-1.3 ownership split still holds through the chain.** `FSPEC:545` quotes AC-1.3 as
"classes and per-class member counts stated in the FSPEC" (REQ `:268`); TSPEC §5.4 owns member
names; T16 reads both sides and names each owner. No layer claims the other's territory.

## 3. Nothing previously approved is broken

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
