# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 4
**Scope:** product lens — delta re-review of the v1.2→v1.3 revision; REQ traceability, scope compliance, acceptance-criteria fidelity
**Base reviewed at v3:** `fd4bced` · **Head reviewed here:** `08925cf`

## Prior findings — disposition

My v3 pass carried exactly one finding, a Low. It is **not resolved** — the revision did not touch
§2.1.

| v3 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | Low | **Open** — carried forward as F-02 below | §2.1 still reads "`__tests__/fixtures/` is already excluded from jest's collection (PLAN §2.2, `A-00`)" (`PROPERTIES:167`; the line moved from `:163` only because the v1.3 changelog block added four lines to the header). `A-00` is still not a task: `grep -n "^| A-00" PLAN-pdlc-advisory-tier.md` returns nothing, and the only three occurrences of the string in the PLAN are its deletion record (`PLAN:451`, `:1019`, `:1020`). The `git diff fd4bced..08925cf` on this document touches the header, `§12.3`'s one owner cell and `§13.1` item 5 — 10 insertions, 11 deletions — and nothing in §2.1. Unchanged severity, unchanged fix. |


## Findings

Scope of this pass: the changed sections only (`git diff fd4bced..08925cf` on the document — 10
insertions, 11 deletions across the header changelog, §12.3's `scanFixtures.js` owner cell and §13.1
item 5). No property was added, removed or re-levelled: `grep -c '^| PROP-'` still returns **183**, so
§1's and §12.3's 195 / 148 / 40 / 7 / 0 stand without recomputation, and the changelog's own claim
("no property, oracle, or count changed") is true as written.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§13.1 now routes four errata that are already closed upstream, and its own preamble arithmetic contradicts the edit that was just made.** The revision closed item 5 (`PROPERTIES:1130-1134`) but left the section header's count untouched: it still reads "Six items … **Five are emitted as `ERRATUM:` lines** … the remaining one (item 2) was resolved upstream" (`PROPERTIES:1095-1097`). With item 5 closed the true split is four-and-two, so the list contradicts itself in print. That alone would be a Low. What makes it Medium is that the same PLAN changelog row the author cited for item 5 closes **two more** items in the same breath, and four of the six are in fact stale: (a) **item 1** asserts "TSPEC §5.5 and §6.3 both declare A1's `verifyGate` as `async () => ({ passed: true })`" — TSPEC:740 now reads "`null` — A1 declares no gate … **Not a passing stub** (§5.5)", and TSPEC:865 the same for A3; PLAN v1.6 records the resolution "in favour of `null`" (`PLAN:1024`) and PLAN:869 states it in both mutation directions. (b) **item 3** asserts "PLAN §6.5 states P-4's closure as `ADVISORY_REFUSAL_REASONS` — eight reasons"; PLAN:779 now states the three-member `{"prohibited-action","revert-on-test-touch","out-of-envelope"} ∪ {null}` form and PLAN:257's A-06 row was aligned to match. (c) **item 4** asserts `waitMs` "has no declared reporting surface on `SeamOps`"; TSPEC:424 now states "Nine members, **`waitMs` deliberately not tenth**" and TSPEC:428 names the surface — the `waitMs` argument the driver passes `budgetExceeded` — which is precisely the resolution item 4 asked for. (d) **item 6** asserts TSPEC §11.1's grep-for-`advisory.enabled` claim; TSPEC §11.1 now reads "a grep for the token `advisory.enabled` finds one site, not three … the assertion is a source-text scan for `/\.enabled\b/`" (`TSPEC:1265-1269`), i.e. the document already transcribes the corrected matcher. Only item 1's DECISIONS-side wording is arguable; a, b, c, d are all closed at branch head. This is a product finding, not a style one: §13.1 is the routing contract the orchestrator reads, one erratum round per upstream doc per phase is all that is available, and a second batch halts the phase to a POSTMORTEM — this phase already carries `POSTMORTEM-PR-pdlc-advisory-tier.md`. Re-emitting four resolved items spends that round on nothing and risks a halt on a document whose properties are fine. **Fix:** rewrite items 1, 3, 4 and 6 in the same closure form item 5 now uses (state the closure, cite the upstream line that carries it, keep the item only as a do-not-re-raise record), and restate the preamble as "Six items … **none is emitted as an `ERRATUM:` line`** — all six are now closed upstream and are listed so a reviewer does not re-raise them", or with whatever count survives your own re-check. | §13.1 routing contract; AC traceability unaffected |
| F-02 | Low | Local | **Carried from v3 F-01, unaddressed: a citation points at a PLAN task that no longer exists.** §2.1's `scanFixtures.js` rationale reads "`__tests__/fixtures/` is already excluded from jest's collection (PLAN §2.2, `A-00`)" (`PROPERTIES:167`). `A-00` was deleted in PLAN v1.2 — "**A-00 deleted** and its work restated as the §2.4 **operator pre-flight step**" (`PLAN:1020`) — and PLAN:451 records the consequence ("A-00's removal empties nothing: layer 1 is now the single task A-01"). The substance survives: jest's configured `testPathIgnorePatterns` does list `/__tests__/fixtures/` (`PLAN:140`), and keeping the wave gate's command from replacing it is exactly what the §2.4 pre-flight step protects. So this remains a pointer defect, not a coverage defect — one wasted lookup into a task table with no such row, on the *only* thing keeping the new fixture module from being collected as an empty suite. **Fix (unchanged):** `(PLAN §2.2, enforced by the §2.4 operator pre-flight step)`. | PLAN §2.4 / §2.2 self-consistency |


## Questions

I had no open questions at v3 and have none now. F-01 is stated as a finding rather than a question
because I checked each of the four items against branch head myself; there is nothing I need the
author to tell me before the fix can be made.

## Positive Observations

- **The item-5 closure is accurate, and it was verified rather than asserted.** §12.3's owner cell
  now reads "`A-01` (PLAN §4 manifest row, since PLAN v1.6)" (`PROPERTIES:1049`) and §13.1 item 5
  records the closure with the contract check that proves it. Both halves check out at branch head:
  PLAN §4's manifest row for A-01 lists `pdlc/workflows/__tests__/advisoryPreflight.test.js`,
  `pdlc/workflows/__tests__/fixtures/scanFixtures.js` (`PLAN:308`), the §3 task row carries the same
  two files (`PLAN:252`), and PLAN v1.6's changelog names the assignment and its reason — "a batch-1
  shared test prerequisite per batch-safety rule 4, required because the Phase I wave commit stages
  only `task.files`" (`PLAN:1024`). I re-derived the bijection the item quotes instead of taking it:
  the PLAN carries **36** `| A-NN |` task rows and **36** manifest rows, so `validatePlanContract`'s
  task↔row check has nothing left to fail on. The gap I called out at v3 — a file no task owned, which
  the wave gate would have declined to commit — is genuinely closed, at the exact owner this document
  proposed.

- **The routing worked end to end, and that is worth recording separately from F-01.** At v3 this was
  an item the PROPERTIES author found, declined to fix in someone else's document, and handed
  upstream with the owner named and the decision left with the PLAN author. The PLAN author made
  exactly that assignment one version later. This is the erratum channel doing its job — a
  Phase-I-time "no task owns this file" failure converted into an authoring-time edit — and the
  behaviour to keep is the author writing the closure back into their own document rather than
  leaving the reader to discover it. F-01 asks for *more* of this, not less: four sibling items
  deserve the same treatment item 5 just received.

- **The revision is honestly scoped and says so.** The v1.3 changelog block claims "no property,
  oracle, or count changed" (`PROPERTIES:17-19`), and the diff bears that out — 10 insertions, 11
  deletions, none of them inside a property statement. I re-counted the property table rows (**183**,
  unchanged from v3) so §1's and §12.3's 195 / 148 / 40 / 7 / 0 level budget needs no recomputation.
  No acceptance criterion gained or lost an obligation in this round, and §12.1's AC→property matrix
  is untouched. A revision whose changelog understates nothing is a revision a reviewer can
  delta-scope safely.

## Recommendation

**Needs revision** — zero High, one Medium, one Low.

To be clear about what is and is not at stake: **the properties themselves are in good shape and this
round did not disturb them.** 183 table rows, unchanged; §12.1's AC→property matrix, untouched; the
level budget, unrecomputed because nothing moved. No acceptance criterion was narrowed,
reinterpreted or dropped in this revision, no scope was added that the REQ does not carry, and the
one substantive edit — item 5's closure — is correct, verified, and exactly what I asked for at v3.
If §13.1 were a prose appendix I would be approving this.

It is not: §13.1 is the routing contract the orchestrator reads to dispatch errata, and it is now
four-sixths stale. Items 1, 3, 4 and 6 each assert an upstream defect that branch head has already
repaired — A1/A3's `verifyGate` is `null` in both TSPEC and PLAN (`TSPEC:740`, `:865`, `PLAN:869`),
P-4's closure is stated over the three-member enum (`PLAN:779`), `waitMs`'s reporting surface is named
and `SeamOps` is explicitly held at nine members (`TSPEC:424`, `:428`), and §11.1 already transcribes
the `/\.enabled\b/` scan (`TSPEC:1265-1269`). The preamble's "five are emitted" (`PROPERTIES:1096`)
was already falsified by this revision's own edit to item 5. One erratum round per upstream document
per phase is the whole budget, a second batch halts the phase, and this phase is already carrying a
POSTMORTEM — so spending that round re-routing four closed items is a real risk, taken for no gain,
on a document that is otherwise ready.

The fix is mechanical and stays inside §13.1:

1. Rewrite items **1, 3, 4 and 6** in the closure form item 5 now uses — state the closure, cite the
   upstream line that carries it, keep the item only as a do-not-re-raise record. The four citations
   above are the ones I verified; please re-check them yourself rather than transcribing mine.
2. Restate the §13.1 preamble's arithmetic to match whatever survives that re-check. On my reading
   nothing is left to emit, so the sentence becomes "Six items … none is still open; all are listed
   so a reviewer does not re-raise them."
3. Fold in F-02 while you are in the document: §2.1's `(PLAN §2.2, `A-00`)` ⇒ `(PLAN §2.2, enforced
   by the §2.4 operator pre-flight step)`. Same one-clause fix I asked for at v3.

Neither finding touches a property, an oracle, a level, or an acceptance-criterion mapping, so I
expect the next revision to be small and the next pass to be short.

No errata from me. Every upstream item I checked in the course of this review was already closed
upstream — which is the substance of F-01, and belongs to this document to record, not to me to
re-route.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 1}
