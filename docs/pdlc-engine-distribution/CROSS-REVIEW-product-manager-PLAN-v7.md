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

The whole delta over my last approved base (`df4d1c44..HEAD`) is **five hunks**: the Upstream cell,
the version cell, two appended changelog rows, T15(e)'s clause, T16's sub-assertion clause,
§2.1's AT-1.1 row *title*, and §5 step 5's clause. I checked each load-bearing structure the
earlier rounds settled:

- **Task table:** untouched. No row added, removed, re-batched or re-scoped. The only edits inside
  §2 are prose clauses within T15 and T16's description cells; neither row's `#`, phase, files,
  size, `Deps` or status cell moved.
- **§2.1 set-equality:** intact. The AT-1.1 row's `Carried by` cell (`T15, T14, T46`) and its
  `AT-1.1` id are byte-unchanged; only the human-readable label after the id changed. The
  transposition against §2 therefore still returns zero rows in both directions.
- **Ownership manifest and batch arithmetic:** byte-unchanged, as the changelog claims and the
  diff confirms.
- **§7's erratum ledger:** still declares exactly the two open TSPEC errata (T45's below-floor
  emission, T50's fixture-machine home). TSPEC has not moved from v0.12, so neither is stale.
- **My four v6 findings:** F-01 (Medium, §4's T59 → T50 instruction) and F-02…F-04 (Low) are
  untouched by this erratum round, which is correct — an erratum round is not the place to land
  round-5 cross-review findings, and the changelog says so explicitly. They carry forward below.

## Findings

No new High. F-01 is new to this round; F-02…F-05 are my v6 findings carried forward unchanged,
since an erratum round is correctly not the place to land them. None gates Phase I.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **FSPEC v0.6's contains-vs-equals distinction for the `not found` literal did not reach the PLAN.** `FSPEC:678-681` now separates two surfaces: AT-1.1 pins the **refusal reason text**, which *contains* the literal, while AT-1.6 and Q-1 pin the **version-triple member**, which *equals* it. T15(d) pins each refusal text as "naming the range" and `notEqual` between the two, and T15(g) asserts three-way equality for the triple — the triple half is right. But nothing in T15 or §2.1 records that AT-1.1's own assertion is a **containment** on the refusal text, so an implementer taking `assert.equal` on the refusal text would write a test that is red against correct code. Fix: add "reports the plugin version as the literal `not found` (containment, not equality — the triple member is the equality surface, T15(g))" to T15(b) or T15(d). No requirement is dropped or narrowed; FSPEC AT-1.1 is the authority the implementer also reads, which is why this is Low. | AT-1.1, AT-1.6 (AC-1.1, AC-1.4) |
| F-02 | Medium | Local | **Carried forward from v6, unaddressed by design.** §4's red-interval paragraph (`PLAN:366`) tells the implementer they "may land the comparator's module ahead of T50 … and the plan does not forbid it", but §3 assigns `pdlc/engine/scripts/fixture-machine.mjs` to T50 alone, so the wave gate will reject exactly that. The manifest — which is what the gate reads — is correct; the prose is the defect. Fold before Phase I begins. | AC-2.2, AC-2.5 |
| F-03 | Low | Local | **Carried forward from v6.** §4's T05 note and the v0.6 changelog both gloss DoD item 12 as "the coverage floor"; item 12 is the AT-2 fixture-machine item. The repair's *conclusion* (item 16 carries the licence record) is correct; only the gloss on the superseded pointer is wrong. | — |
| F-04 | Low | Local | **Carried forward from rounds 5–6.** §2.1's AT-3.8a row still paraphrases the criterion as "packed set equals §5.2's **writable** classes" (`PLAN:222`, and the same wording quoted at `:480`). That wording predates the FSPEC ownership split and now also predates v0.7's class rename. No transcription consequence — §2 is the declared source and T16 states both halves — but the trace row reads as an older criterion than the one FSPEC holds. | AC-1.3, AC-1.5 |
| F-05 | Low | Local | **Carried forward from rounds 5–6.** The AT-3.8a erratum discharge is attributed to FSPEC v0.4/v0.5 in three places (`PLAN:22`, `:149`, `:480`); FSPEC's changelog puts the literal's removal at **v0.3**. Discharge correct, provenance off by one version. | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-04 and F-05 have now survived three rounds as "carried forward, unaddressed by design". Both are one-line prose edits in a document that is otherwise converged. Is the intent to fold them with F-02 before Phase I, or to let harvest record them? Either is fine — I would just rather the plan state which, than carry them a fourth time. |

## Positive Observations

- **The stale item list was handled by evidence, not by compliance.** The easy move was to re-apply
  an edit that was already in place and report both items closed. Instead v0.8 shows the commit
  ordering (`8980ffe7` precedes `a57e0547`), states that the item list arrived stale, and pins the
  claim to a `grep` a reader can re-run. That is the more useful record, and it is also the harder
  one to write.
- **The residue was found by reading, not by grepping the item list.** §2.1's row title was not in
  the raised set and no test could have consumed it. Fixing it anyway — with an explicit note that
  it is an index label and why it still mattered — is exactly the judgement DEC-ERR-03 is asking
  for: the item list is necessary, not sufficient.
- **Each absorbed FSPEC v0.7 decision is stated with its reason for being inert.** Not "absorbed,
  no change", but *why* no change: T16 reads names from TSPEC §5.4 and counts from FSPEC §5.2, so
  PK anchors move nothing; the count conjunct was already in the positive form v0.7 adopts. I could
  check every one of those claims against HEAD in a few minutes, and they all held.
- **The class rename was propagated completely and honestly.** T16 adopts `Workflow members`, states
  the reason (`PK-22` is a manifest, not a module) and states that membership is unchanged. `grep`
  confirms it is the only site. A rename is the easiest kind of change to half-apply; this one is
  not half-applied.
- **Eight rounds in, the changelog still states what did *not* change** — task table, batch
  arithmetic, ownership manifest, §2.1's set-equality — and the diff bore it out again. That habit
  is the reason this confirmation took minutes rather than a full re-read.

## Recommendation

**Approved with minor changes.**

Both raised items are discharged at HEAD, and the document is a faithful compression of upstream as
upstream now reads: FSPEC v0.7's three decisions are absorbed and correctly described as inert, the
`not found` literal alignment reaches every assertion site and the one index label that survived,
REQ v0.11's AC-1.3 ownership split holds through FSPEC → TSPEC → T16, and the counts (23/24) are
unmoved on all three sides.

Nothing previously approved is broken. The task table, ownership manifest, batch arithmetic and
§2.1's set-equality are byte-unchanged; the AT-1.1 trace row's id and `Carried by` cell are
untouched, so the §2 ↔ §2.1 transposition still closes in both directions; §7's ledger still
declares the two open TSPEC errata, neither of which has gone stale.

F-01 is new and Low: FSPEC v0.6's containment-vs-equality distinction for AT-1.1's refusal text is
not recorded in T15, and an implementer who reaches for `assert.equal` there would write a
false-red. F-02 (Medium) is the one item I would still like folded before Phase I opens, since it
is an instruction the wave gate will reject. F-03…F-05 are prose nits carried forward. None of the
five gates Phase I.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 4}
