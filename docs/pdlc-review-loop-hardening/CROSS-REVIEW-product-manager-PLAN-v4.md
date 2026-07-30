# Cross-Review: product-manager — PLAN (round 4, delta)

**Reviewer:** product-manager
**Documents reviewed:**
- `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.3, 163,882 B)
- `docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.7, 188,664 B) — **the §8.5
  amendment and its §0 changelog entry only**; the rest of the TSPEC is approved and was not reopened.

**Scope:** Delta review. Verification of my six round-3 findings (1 High, 2 Medium, 3 Low) and my two
questions; a verdict on the TSPEC v1.7 amendment **including the author's decision to take a third clause
beyond the two I authorised**; a scan of the sections v1.3 changed — §1 header, §4's `RLH-22`/`RLH-26`/
`RLH-31` rows, §4.1's two await rows, §7.3 rows 1 / `RLH-LOOP-01` / `RLH-LOOP-03`, §7.5, §9.2, §11.4 `H-q`,
§11.5, §12.2, §12.3, §14 version table, §14.1's annotations, §14.2 `F-01`, §14.3 — and a direct judgement
on whether §14 is inert or load-bearing. Not reviewed: REQ v1.6, FSPEC v1.8, unchanged TSPEC sections,
unchanged PLAN text passed at v1.0–v1.2, technical design choices, test-strategy adequacy as engineering.
**Date:** 2026-07-30
**Iteration:** 4
**Diff base:** `f1e16fc` (PLAN v1.2, TSPEC v1.6) → `83a5c1e` (HEAD, `feat-pdlc-review-loop-hardening`).
**Measured, not inferred (DC-02).** I re-derived the await-scan site set **independently**, by
implementing §9.2 item 3's algorithm rather than by reading §4.1 — masked strings/templates/regex/comments,
scan set = the thirteen names + `main()`-destructured aliases + fixed-point named wrappers, awaited iff
`\bawait\s*$` over the joined source. Result below. Also measured at HEAD: occurrences of
`MAX_REVIEW_ROUNDS - 1`, of `Promise.race|any|allSettled`, `reviewLoop(` / `checkConverged` call-site
counts, `pdlc/workflows/package.json`'s declared dependencies, and the syntactic context of
`orchestrate-dev.js:1865–1872`.
**R-6 respected:** no citation or `file:line` drift is filed at any severity. Line numbers below are
evidence for a *count* or a *classification*, which is the assertion.

---

## 1. The independent measurement, stated before anything that depends on it

I did not verify the author's five. I ran the predicate and compared afterwards.

| File | Scan-set call sites | Not `await`ed |
|---|---|---|
| `orchestrate-dev.js` | **27** | 4 — `_agent`@615, `_agent`@616, `rawAgentFn`@1569, `agentFn`@1867 |
| `orchestrate-queue.js` | **8** | 1 — `rawAgentFn`@524 |
| **Total** | **35** | **5** |

Identical to §4.1's advisory row, site for site, including the split (27/8) and including
`orchestrate-queue.js` having **one, not none**. Every one of the five matches a §8.5 ruling: `:615`/`:616`
awaited-combinator-argument, `:1569`/`:1867`/`queue:524` returned-promise. **Zero unclassified.**

Two collateral confirmations, because they are premises of new content:

- `MAX_REVIEW_ROUNDS - 1` occurs **zero** times in `orchestrate-dev.js` at HEAD, so `RLH-LOOP-03` is a
  genuine red-then-green and not a green-on-arrival tautology, exactly as §11.5 claims.
- `pdlc/workflows/package.json` declares **`jest` alone**, so §9.2 item 3's "no parser, `H-n` would halt on
  a new dependency" argument is true and not rhetorical.
- `Promise.race` / `Promise.any` / `Promise.allSettled`: **zero** occurrences in either source, so v1.7's
  withdrawal reclassifies nothing shipped.

I note the fifth distinct number this set has produced (three, five, four, five) — the author's own
line-local first pass returned four and missed `:1867`. That the author *published the failed pass* in
§14.3 rather than only its corrected result is what makes the derivation checkable, and it is the reason
I could reproduce it: the method is written down, so the number is re-derivable rather than trusted.

---

## 2. Verification of round-3 findings

| # | Sev (v3) | Disposition | Evidence (measured at HEAD) |
|---|---|---|---|
| **N-01** | **High** | **Fixed by deletion — the remedy my acceptance condition named, and the count is now a premise of no gate** | §4.1 carries **two** rows. The **blocking** row asserts total classification and nothing else: "*That total classification is the whole of the blocking assertion*… **A site that is correctly exempt never fails this gate, whatever the total is**: a future correct arrow wrapper adds one to the number and nothing else." The **advisory** row is explicitly "recorded not asserted… **so a drift is a report rather than a halt** — the assertion above is what halts", and carries the five-of-35 with both prior corrections annotated in place ("v1.1 stated one site, v1.2 stated three and said the queue had none; **both were wrong, and in the same way**"). The three former copies are gone as normative statements: §7.3 row 1 reads "every non-`await`ed thirteen-list call site is classified by one of TSPEC §8.5's three rulings — the rule is §8.5's and the observed site set is §4.1's advisory row; **neither is restated here**"; §12.3's `RLH-AT-19` row reads "**This row asserts the classification, not a count**… a correctly-exempt site that did not exist at authoring time does not fail this row"; §9.2 item 1 cites §4.1. §14.3 cites rather than repeating ("The five sites… are recorded in §4.1's advisory row, which owns them; they are not repeated here") — no fifth copy. **I traced every gate that could read a number and none does.** |
| **N-01, second half** — §9.2 item 2's misclassification | — | **Fixed, and by explicit withdrawal** | The check I asked for specifically. v1.2's "a fourth site … is blocking work" converted two shipped correct sites into a spec-amendment demand. Item 2 is now "**An *unclassified* site is blocking work; a *correctly exempt* one never is**", names `orchestrate-dev.js:1569` and `orchestrate-queue.js:524` as shipped, correct and exempt, states that v1.2's text "told an implementer who scanned correctly that they were blocking work", and marks it **Withdrawn and restated**. Same standard the author applied to the `npx jest` claim at v1.2. |
| **N-02** | Medium | **Fixed, and the choice is sound on its merits — not merely consistent** | I checked the direction, not just the agreement. §7.3 reads `RLH-LOOP-01 \| RLH-22 (3) \| **batch 9** \| **batches 3–8** \| **RLH-27**`; §11.5's Oracles paragraph now says "green from batch **9**, by `RLH-27`"; §11.5's ownership table and §4's `RLH-27` row already said it. Four statements, one content. **The rejected alternative is right to have been rejected:** folding the destructuring into `RLH-23` (batch 7) would put `reviewLoop`'s gate on an `endIndex` that no call site supplies until `RLH-26` at batch 8 — `iteration > undefined` is always false, i.e. a live loop with **no termination gate**, in a window where twenty-plus assertions are green. §11.5 records exactly that reason. The accepted interim is the mirror image and is genuinely inert: `reviewLoop` is destructured-object-parameterised (`export async function reviewLoop({` at `:532`), so batch 8's two extra properties are ignored and the pre-feature `if (iteration > 5)` stands for one batch. Stating it in §11.5 rather than leaving it to be discovered is the right disclosure. |
| **N-03** | Medium | **Fixed in the owning section, as the property rather than the membership** | TSPEC §8.5's discriminant is now "a **promise combinator that awaits every element of the array**. That property, not a name, is the test", with `_parallel`/`parallel`/`Promise.all`/`Promise.allSettled` as *instances* and `race`/`any` named only to be excluded, with the concrete false negative spelled out (`await Promise.race([_agent(…), _sleep(MS)])` — and `_sleep` is indeed an injected parameter of `main()`, so the example is reachable, not hypothetical). A future `race` is now an unmatched site, i.e. blocking work. This is the prescription I gave, taken in full. |
| **L-01** | Low | **Fixed** | Alias row now reads "the local name **in addition to** the `_`-prefixed one", annotated with what v1.6 said and why the widened catch-all overrides it. The row's real prohibition — scanning the `_` spelling *alone*, which passes vacuously for an aliased seam — is preserved as such. The contradiction with the catch-all is gone. |
| **L-02** | Low | **Fixed** | §4's `RLH-26` row writes **all three** new `checkConverged` arguments — "`feature`, then `startIndex`, then `endIndex`, positionally after `recordPhase` — because it cannot write arguments 6 and 7 without writing argument 5"; §11.5's ownership table row 1 names `feature`. Consistent with the source: `checkConverged(loopResult, phaseId, phaseLabel, recordPhase)` at `:496` has four parameters, so the new ones are 5/6/7. `RLH-27` retains the *parameter list*. The seven argument lists now have one owner for all three values. |
| **L-03** | Low | **Fixed by restoration, honouring the audit's own method** | §14.1's TE F-08 entry reads "**five** runs of one HEAD (v1.1 wrote 'three'; §2.3 records five, so **'three' → 'five', corrected at v1.3** — v1.2 made this correction by *deleting* the word rather than annotating it, which is outside the audit's own stated method and is PM round-3 `L-03`; the resulting sentence was true, the method was not)". Annotate-never-delete, applied to the one place it had not been. |
| **Q-01** | — | **Answered, and the answer is blocking-but-on-classification** | "It is blocking, but what it blocks on has changed: the assertion is *classification*, not a count. A correct scan of a correctly-exempt codebase passes it unconditionally. The advisory row that carries the number blocks nothing." That is the resolution my question was pointing at and it is better than the advisory-and-recorded option I floated, because it keeps the batch-1 pre-flight diagnosis without keeping a count in a gate. |
| **Q-02** | — | **Answered as a decision, and the surrounding property is stronger than the answer** | §11.5: "`H-q` **deliberately does not name this rule**… `H-q`'s shapes are *interface* decisions a later task could renegotiate, and this is a local naming choice with no interface consequence — shadowing changes which binding the gate reads, which `RLH-LOOP-01` already reds on… The omission is a decision, not an artefact of drafting order." I asked for exactly that. §11.4 additionally now states that **every clause of `H-q` has a named oracle** — `RLH-LOOP-01` (field shape and gate), `RLH-LOOP-02` (return shape, positional order, rendered window), `RLH-LOOP-03` (the single computation). The last one did not exist at v1.2, which means `H-q` was carrying an unfalsifiable clause; closing that was TE's finding and the fix serves my question too. |

**Verdict on the round-3 backlog: six of six findings and both questions resolved**, none by silent
deletion, and the High resolved by the deletion route rather than the repair route. Nothing from rounds
1–3 remains open.

---

## 3. Verdict on the TSPEC v1.7 amendment — including the third-clause scope call

**Sound, and approved. All three clauses, including the one beyond the brief.**

| Clause | Origin | Direction | My verdict |
|---|---|---|---|
| Combinator ruling restated as the **property** "awaits every element"; `race`/`any` withdrawn | PM `N-03` / TE `F-02` | narrows | **Approved.** My prescription, taken in full, including stating the property rather than shortening the list. |
| Alias row: local name **in addition to** the `_`-prefixed one | PM `L-01` | corrects a contradiction | **Approved.** Deleted the exclusive absolute, kept the real prohibition. |
| Returned-promise row: an **anonymous** arrow has no name to inherit, so the obligation is inherited by nobody | TE `F-06` | narrows what inheritance reaches | **Approved — see the ruling below.** |

### The scope call, judged strictly

The author took a third clause beyond the two I authorised, and I have been strict about exactly this.
I ran the same four tests I have run on every amendment to this approved spec.

1. **Forced by evidence, or preference?** Forced. §14.1's Q-02 claim cited an answer that §9.2 deleted at
   v1.2 and that was never added to the section it was deleted *into*. That is a dangling normative
   pointer, demonstrated, not a stylistic want.
2. **In the section that owns the rule?** Yes, and the rule was **created by the same row being amended**:
   v1.6's returned-promise row expressed inheritance wholly in terms of a name, which has no referent for
   an anonymous arrow. Repairing a clause in the row that produced it is not scope expansion; it is
   finishing the previous amendment.
3. **Does it reclassify any shipped site?** No. `orchestrate-dev.js:1867` was already matched by the
   row's own shape predicate — "the call is the entire body of an arrow function" — which is silent on
   naming. I verified the site: it is `batch.map((task) => agentFn(…))` inside
   `await parallelFn(batch.map(…))` (`:1865`), so it is in fact awaited, and note it is **not** covered by
   the combinator ruling, which requires an *array literal* and `batch.map(…)` is not one. The
   returned-promise row is the correct and only classifier for it, before and after v1.7.
4. **"Narrows nothing and widens nothing" — is the author's own claim true?** Very nearly, and the
   inaccuracy runs in the safe direction. Strictly, v1.6 left the anonymous case *undetermined*: one
   reading exempts it with an unresolvable inheritance, the other declines to cover it at all and drops it
   to the catch-all, which would **red on shipped correct source** — the precise defect §8.5 exists to
   prevent. v1.7 settles the ambiguity toward the reading §8.5 was written to produce. So it does not widen
   the exempt *shape* set; it removes an ambiguity, and it narrows inheritance. I accept the claim with
   that qualification.

**Ruling: within scope, and I would have authorised it had it been asked.** The two constraints in play —
"do not exceed the authorised amendment scope" and "an owning section beats a restatement" — were in
direct conflict here, because the only alternative was answering `F-06` in the PLAN, which reinstates the
exact restatement `N-01` exists to remove. The author picked the constraint that serves the document's
organising principle and **disclosed the choice twice** (in the `F-06` disposition row with its reason,
and again in §14.3's scope table with its direction labelled). An undisclosed third clause would have been
a finding on process regardless of its merit; a disclosed one, in the owning row, that narrows, is not.

One residual I record rather than file: the new clause honestly states that for an anonymous arrow "the
awaiting is the consuming combinator's, **which this assertion does not verify**." That is true and it is
a real blind spot — but it is the *pre-existing* one. `_parallel` is not a member of the thirteen-name
set, so the outer `await parallelFn(…)` was never within AT-19's reach, at v1.6 or before. The
thirteen-name set is FSPEC-approved and out of surface (R-5). Routed to Harvest below.

---

## 4. Is §14 inert, or has it become load-bearing?

**Inert — I directed a trim and, having tested it, I am clearing it. The byte count is not filed.**

I ran the concrete test I set: can an implementer holding only this PLAN find the one authoritative
statement of each rule **without opening §14 at all**? I checked every rule v1.3 touched:

| Rule | Owning statement outside §14 | Reachable from |
|---|---|---|
| Await-scan blocking premise + observed set | §4.1's two rows | §7.3 row 1, §9.2 item 1, §12.3 all cite it |
| Scan mechanism + `RLH-SCAN-01` | §9.2 item 3 | §4's `RLH-31` row names it as the decider |
| Window ownership / `endIndex` computed once | §11.5's ownership table | §4 `RLH-26`/`RLH-27`, §7.3, §11.4 `H-q` |
| `feature` at the seven `checkConverged` sites | §4's `RLH-26` row + §11.5 table row 1 | §11.4 `H-q` |
| `RLH-LOOP-03` and what it falsifies | §11.5 | §4 `RLH-22`, §7.3, §12.3, §11.4 |
| Skip-is-not-a-green | §12.2 step 2 | §12.3's matching DoD row |
| `H-q` has an oracle per clause | §11.4 | §11.5's Oracles paragraph |
| Edit-3 relocation authority (TE Q-01) | §11.5 body | §13.1 `P-Q-02` |
| Anonymous-arrow inheritance | TSPEC §8.5 | §9.2's citation, which now resolves |

**Nothing's only clear statement lives in a disposition row.** §14 is skippable for execution, and I found
no rule that becomes ambiguous when it is skipped. My round-3 hypothesis — that §14.3 duplicates the six
committed `CROSS-REVIEW-*` files — I now judge **wrong, and I withdraw it**: those files carry *findings*,
not *dispositions*; §14.3 is the author's side of the record and is the only place it exists. What §14.3
does duplicate is the **owning sections**, and only in summary. So the trim I directed is not warranted on
the ground I proposed, and it is not warranted on navigation, which I have now tested twice.

The one true cost, and I state it as an observation rather than a finding: §14 is now the document's
largest restatement surface, and **two of its restatements have already drifted from their owning sections
in the same round they were written** (see the non-blocking observations). That is a slow leak, not a
blocker, because every one of them is a summary of a rule stated correctly elsewhere and pointed at from
the point of work. It is Harvest signal about where disposition prose should live, not a reason to hold
this PLAN.

---

## 5. New findings

**None.** Scanned surfaces: the sections listed under **Scope**.

I considered and declined three candidates, each of which I would have filed in round 1 or 2 and none of
which an implementer would hit. They appear as non-blocking observations below with my reason for
declining. I record the declines explicitly so the decision is visible rather than looking like an
omission.

---

## 6. Non-blocking observations (route to Harvest, not to another round)

1. **§9.2 item 1's absolute is self-falsified six lines later.** It states the observed site set and its
   size "live in **§4.1's advisory row and nowhere else in this document**", then writes "(five at HEAD,
   §4.1)" in the same item, and item 2 names `orchestrate-dev.js:1569` and `orchestrate-queue.js:524`.
   *Why not a finding:* the number carries its citation and agrees with §4.1; the two line numbers are
   inside an explicit withdrawal of v1.2's wrong text, which is the annotate-never-delete method working
   as intended. Only the word "nowhere" is wrong, and no gate reads §9.2. `Scope: Local`.
2. **§14.3's TE `F-03` row describes a different `RLH-SCAN-01` from the one §9.2 item 3 decides.** §14.3:
   "asserts the walk classifies **each of the five derived sites**"; §9.2 item 3 (the owning decision):
   "drives the walk over **inline literal source fixtures** — one per ruling, plus a masked-delimiter case,
   plus a shape matching no ruling". Following §14.3 would tie the mechanism's own oracle to the five real
   sites, which is the one route by which the count could creep back into an assertion. *Why not a
   finding:* §4's `RLH-31` row sends the implementer to §9.2 item 3 by name and says it "implements rather
   than re-invents" it, so the reader is never routed to §14.3 for this. `Scope: Local`.
3. **§14.3's PM `Q-02` row names the wrong oracles.** It says a shadowing violation "is caught by
   `RLH-SCAN-01` and `RLH-AT-19`, which fail loudly." Those are the await-scan assertions; they cannot see
   a shadowed local binding inside `reviewLoop`. §11.5 — the owning section — states it correctly:
   `RLH-LOOP-01` is what reds. *Why not a finding:* the rule and its correct oracle sit adjacent in §11.5,
   which is where an implementer reads it. `Scope: Local`.
4. **AT-19's structural blind spot, for the constraints file.** Both the combinator exemption and the
   anonymous-arrow exemption discharge the obligation onto an `await` of a callee (`_parallel` /
   `parallelFn`) that is **not** in the thirteen-name set — so if that outer `await` were ever dropped,
   nothing in AT-19 would catch it. v1.7 discloses this honestly. It is pre-existing (v1.6 and earlier),
   the thirteen-name set is FSPEC-approved, and R-5 says prefer deleting an over-broad clause to adding a
   reconciling one — so it is not this PLAN's to fix. Worth recording as a durable note: *an exemption that
   delegates an obligation to a call outside the guarded set moves the risk rather than removing it.*
   `Scope: Cross-Feature`.
5. **Process: how to handle a collision between an authorised amendment scope and the ownership rule.**
   The author's move — take the clause, put it in the owning section, disclose it as beyond the brief,
   label its direction, and state the alternative it avoided — is the protocol I want to see repeated. It
   is what let me approve a third clause I had not authorised in under a page. `Scope: Process`.
6. **Process: publish the failed derivation pass, not only the corrected result.** §14.3's admission that
   the author's own first line-local pass returned four and missed `:1867` is why I could reproduce the
   five independently: it forced the method into the document. A count that has been wrong four times is
   made trustworthy by a written method, not by a fifth assertion. `Scope: Process`.

---

## 7. Positive Observations

- **The High was closed by deleting three of four copies, not by correcting four.** That is the remedy I
  named as my acceptance condition, and it is the remedy that also makes the fifth wrong number harmless:
  the count is now advisory evidence in one place, and a correct new arrow wrapper adds one to a number
  that no gate reads. The class of defect that produced two consecutive round-opening Highs is structurally
  gone, not patched again.
- **The premise was re-derived, not adopted — including from the reviewers who agreed.** §14.3 states
  outright that it "adopts **no** number from any review — including the ones both round-3 reviewers agree
  on", because "a count of three that happens to be a count of the *wrong* three is still three." I ran
  the algorithm independently and got 35/5 site-for-site. That is the difference between two people
  agreeing and a number being true.
- **§14.2's `F-01` row was re-opened and marked overstated, against the author's own earlier audit.** The
  v1.2 disposition is annotated as wrong *and left unedited beneath the annotation*, with the root cause
  named as verification-in-place-of-derivation. An audit that corrects its own previous audit, in place,
  is the strongest evidence I have seen in four rounds that the changelog is a record rather than a claim.
- **`H-q` no longer has an unfalsifiable clause.** `RLH-LOOP-03` closes the one violation no behavioural
  oracle could see — a recomputation inside `reviewLoop` yields an identical value — using the grep
  construction §12.3 already ships for `selectMode`, and it genuinely reds at HEAD (I measured zero
  occurrences). An enforced-by-eyeball halt row in a feature whose subject is enforced-by-eyeball review
  loops was the right thing to notice.
- **The `N-02` resolution went to the option that is correct rather than the option that is cheaper.**
  Resolving toward §7.3 would have been one cell; resolving toward §11.5 was four statements and an
  argument. The argument is right: the alternative leaves a live loop with no termination gate for a whole
  batch.
- **The TSPEC amendment shrank an exemption.** Three clauses, all narrowing or contradiction-correcting,
  zero widenings, zero shipped sites reclassified, and the mechanism deliberately kept *out* of the TSPEC
  with §0 saying so, so a later reader does not read the omission as a gap. This is the fourth consecutive
  round in which the reflex has been to state the rule once in the owning section; it is now the
  document's habit rather than its correction.

---

## 8. Is the PLAN executable as written?

**Yes.**

- **Coverage:** every FSPEC AT and every TSPEC §9.1 obligation still has exactly one owning task; the task
  count (31), batch count (13), DAG, `Deps` edges, ledger arithmetic and file-ownership manifest are
  unchanged for the second consecutive round and were re-derived clean by both reviewers in rounds 2 and 3.
  v1.3 adds two assertions, not two tasks: §7.5's fifteen = 1 + 3 + 1 + 1 + 9, and §12.3's checklist row
  names all fifteen.
- **No task is loose enough to license divergence:** the four decisions v1.3 makes — the scan mechanism,
  the window's greening batch, `feature`'s owner, the skip criterion — each name an owning section and an
  owning task, and each has an oracle that reds on the wrong choice.
- **No task contradicts the TSPEC:** the one place it could — §7.1 edit 3 anchoring the arithmetic inside
  `reviewLoop` while §11.5 relocates it to the gate — is answered in §11.5 from §3.9, §10.3 `T-Q-02` and
  §13.1 `P-Q-02`, which hand the channel to implementation. No §7.1 amendment was taken and none is owed.
- **Every deferral names a successor surface (DC-08):** §10.2 → `QUEUE.md` Order 9, unchanged.
- **No claim asserts an artefact or oracle that does not exist:** `RLH-SCAN-01` and `RLH-LOOP-03` are both
  registered in §4, §7.3, §7.5 and §12.3; `H-q`'s three oracles all exist; the §8.5 citations all resolve
  now that v1.7 restored the anonymous-arrow answer to the owning row. The only oracle *misattribution* I
  found is in a §14.3 disposition row (observation 3), not in a normative section.

The blocking premise the last two rounds died on is now a predicate, and I have executed that predicate
myself against the tree. That is the property that had to hold, and it holds.

---

## 9. Recommendation

**Approved**

Zero High, zero Medium, zero Low. The six observations in §6 are **explicitly non-blocking** and are
routed to Harvest — none of them is a condition of this approval and none should trigger another round.
The TSPEC v1.7 amendment is approved as a whole, **including its third clause**, which I judge within
scope on the reasoning in §3.

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
