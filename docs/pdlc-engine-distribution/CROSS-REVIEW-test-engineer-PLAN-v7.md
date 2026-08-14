# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.8)
**Date:** 2026-08-14
**Iteration:** 7
**Scope:** Delta confirmation of the Phase-F erratum edit (`870251c6`, `8ad7b831`, `6030d7e3`) against the previously approved PLAN v0.7, plus re-grounding on upstream at HEAD (DEC-ERR-01/DEC-ERR-03). Not a whole-document re-review.

## 1. Raised items

Both raised items were **already discharged at HEAD before this round opened**, and the item list
arrived stale. `8980ffe7` (PLAN v0.7) repointed both passages; the FSPEC edit that re-raised them
(`a57e0547`) landed one commit later. Verified against the current file, not against the changelog's
claim:

| Raised item | State at HEAD | Evidence |
|---|---|---|
| T15(e) (`PLAN:146`, now `:148`) pins the deleted `"none installed"` message | **Discharged** | The cell reads "the assertion pins that it is **not** AT-1.1's `not found` message". That is FSPEC AT-1.4's own discriminator verbatim (`FSPEC:688-689`), and the string it now discriminates against is emitted at `pdlc/engine/lib/handshake.mjs` and pinned by `handshake.test.js:113`. |
| §5 step 5 (`PLAN:458`, now `:460`) same | **Discharged** | "the unparseable-manifest refusal is not AT-1.1's `not found` message". Same source, same literal. |
| Residue: §2.1's AT-1.1 trace row still *titled* "refusal, none installed" (se-review FSPEC v7 `F-04`) | **Fixed by this edit** | Row now reads "AT-1.1 *(AC-1.1)* refusal, plugin reported `not found`" (`:203`). That matches FSPEC AT-1.1, which says the message "reports the plugin version as the literal `not found`". The `AT-1.1` id and its `Carried by` cell (`T15, T14, T46`) are byte-unchanged, so §2.1's set-equality against §2 is untouched. |

`grep -n "none installed"` over the PLAN now returns exactly one hit — the v0.5 changelog row's
historical quotation of the retired literal — and no assertion text, no task cell, no trace-row
title. The discriminator an implementer of T15(e) would transcribe is a **paired positive pin plus
`notEqual`**, not an absence oracle, which is what made the original finding a testability defect
rather than a wording one. That property survives the edit.

## 2. Upstream re-grounding at HEAD

Lineage cell checked against the version cell of each upstream document as it stands now, not as the
changelog reports it:

| Upstream | PLAN's cell | HEAD | |
|---|---|---|---|
| REQ | v0.11 | v0.11 (`:18`) | ✅ |
| FSPEC | v0.7 | v0.7 (`:16`) | ✅ re-pinned by this edit |
| TSPEC | v0.12 | v0.12 (`:12`) | ✅ |
| DECISIONS | v0.3 | v0.3 (`:12`) | ✅ |

FSPEC v0.7's three decisions, each checked against what the PLAN now leans on:

- **(a) class rename to "Workflow members"** (`FSPEC:5.2`, because `PK-22` is a JSON manifest and not
  a module; FSPEC AT-3.8b now says "three members and **not three modules**"). T16's sub-assertion
  sentence adopts the new name and states the membership is unchanged. Correct, and it does not
  disturb the oracle: T16 reads member names from TSPEC §5.4 and classes/counts from FSPEC §5.2, so
  a class *label* change moves nothing an implementer transcribes. One label elsewhere in the PLAN
  did not get the sweep — F-01 below.
- **(b) `PK-4`/`PK-4b` and `PK-5`…`PK-19` anchored in §5.2's rows; the CLI-entry note no longer calls
  its cardinality a downstream-only choice** (`FSPEC:5.2` now: "the class holds the **2** members
  counted below, and moving that number is an FSPEC edit"). The PLAN nowhere claims CLI-entry
  cardinality is downstream-only — grepped, no hit — so there is nothing stale to correct, and the
  absorption's "changes nothing it transcribes" is accurate.
- **(c) AT-3.8a's count conjunct stated positively** (`FSPEC:768-772`: the **transcribed** `PK-*`
  list's length **and each class's slice of it** equal §5.2's total and per-class numbers; never the
  tarball's own length). T16 already carried this form and still does: count asserted against the
  transcribed list, explicitly not against the tarball length (tautology once set-equality passes,
  and a self-derived expectation BR-8.1 forbids), red when the transcription has drifted from §5.2.
  The per-class dimension is present in T16 as "classes and per-class member counts are FSPEC
  §5.2's". Arithmetic re-derived: 1 + 1 + 2 + 15 + 3 + 1 + (0 | 1) = **23 before N-2, 24 after** —
  the number T16 and §7 both carry. No divergence.

Nothing else in the PLAN cites FSPEC text that has moved. §7's erratum paragraph still reports **two**
open errata (T45's below-floor emission, T50's fixture-machine home), both against TSPEC, which is
unchanged at v0.12 — so both are correctly still open and the count is right.

**Blast radius of the edit:** 5 insertions, 4 deletions in one file — header lineage cell, version
bump, one changelog row, one sentence inside T16, one §2.1 row title. The task table's ids, batches,
dependency edges, file cells and the ownership manifest are byte-unchanged; I re-checked that §2.1's
row *count* and the `Carried by` cells are untouched, so the set-equality gate I approved in round 6
is the same gate. No batch arithmetic to re-derive.

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The class-rename sweep missed one §2.1 label, and the changelog asserts it did not.** The v0.8 changelog says T16's sentence "is the only place this PLAN names the class". It is not: §2.1's trace row is titled "AT-3.8b *(AC-1.3)* packed workflow **modules** equal §5.2's class" (`:223`) — the exact wording FSPEC v0.7 retired, since `PK-22` is a JSON manifest and AT-3.8b now reads "three members and not three modules". This is the same shape as the AT-1.1 residue this very edit swept, one row down the same table. It is not an oracle: no implementer can write a trace-row title into a test, T16 and TSPEC §5.4 own the expected set, and `PK-20`…`PK-22` are unambiguous — so Low, not Medium, and it blocks nothing. But an inaccurate "only place" claim in a changelog is the thing that lets the next reviewer stop looking. *Fix, one string:* "packed workflow **members** equal §5.2's Workflow-members class", and drop or narrow the "only place" clause. While there: `:222`'s AT-3.8a row still says "equals §5.2's **writable** classes", which no longer matches FSPEC AT-3.8a's own framing (§5.2 owns classes and count, TSPEC §5.4 owns member names) — same sweep, same severity. | `PLAN:223`, `:222`, changelog `:25` |

## 4. Questions

None. Nothing in the delta required clarification.

## 5. Positive Observations

- **The changelog reports a stale item list as stale, rather than re-applying the fix.** It names the
  two commits and their order (`8980ffe7` before `a57e0547`), states what it verified at HEAD, and
  makes exactly the one edit that was genuinely left over. That is the right handling of an erratum
  that overtook itself, and it leaves an auditable record instead of a no-op diff.
- **The one substantive change is an index label, and the row says so.** The `AT-1.1` id and its
  `Carried by` cell are untouched, which is what keeps §2.1's set-equality from moving — the
  cheapest possible edit that removes the last occurrence of the retired literal.
- **The discriminators that matter stayed falsifiable.** T15(e) pins a positive on each refusal text
  plus `notEqual` between them; it never became "the text does not contain X", which would be the
  absence-only oracle this whole erratum chain existed to prevent.
- **The `PK-22`-is-not-a-module distinction is carried into T16 with its reason.** A future
  implementer reading T16 learns why the class is named for members rather than modules, so a
  three-modules transcription is unlikely to reappear.

## 6. Recommendation

**Approved with minor changes.**

The delta resolves both raised items — which were in fact already resolved at HEAD — and the residual
label fix is faithful to FSPEC AT-1.1. The PLAN is re-grounded on FSPEC v0.7 and is a faithful
compression of it: all three absorbed decisions are correctly reflected, the 23/24 arithmetic
re-derives, the two open TSPEC errata are correctly still open, and nothing I approved in round 6 —
task ids, batches, dependency edges, ownership manifest, §2.1 set-equality — moved. F-01 is a
one-string label sweep with no bearing on any oracle; it can ride the next touch of this document and
does not warrant a round of its own.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
