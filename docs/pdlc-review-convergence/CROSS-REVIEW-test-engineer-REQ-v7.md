# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 7
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v6.md` (baseline `fb9ac66`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `db9b544`, clean.

## 1. Delta scan

```
git rev-parse fb9ac66:docs/.../REQ-pdlc-review-convergence.md → 97682c5…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → b0af913…
git diff --stat fb9ac66 HEAD -- …/REQ-…md → 304 insertions(+), 84 deletions(-)
bytes: 209,953 → 241,698   (+31,745)
```

The revision is v1.4 → v1.5 and it answers round 6 from both panels, across twelve commits
(`5174e21` … `db9b544`). Changed sections, and the only ones scanned below: the header (Cross-Reviews
row, the v1.5 revision note), §5 (*reset region*, three durability rows, the catalogue lead-in now
**sixteen**, the kind ordering, the `HALT-REASON:` lead-in paragraph, S-12 rewritten, new **S-15** and
**S-16**, S-13/S-14's append rule, the `notice` sentence), AC-1.4 (clause 1 restated over **every**
halt, clause 2 scoped to **unfenced** markers, the new *why the first halt is stated* paragraph),
AC-1.5(4) (the gate's third conjunct, three new paragraphs — append, non-consumption, sanctioned
repair — the five-step algorithm with its new **step 3**, the `H − A ≤ 1` paragraph, the
listing-time-validity paragraph), AC-1.5(5) (the three-row table and its new justifying paragraph),
AC-1.5's closing re-wrap, AC-2.6 (table header and four *When*/pair/fire cells restated over `W`, plus
the new justifying paragraph), AC-2.7 (numbered, read-in-order table with new **row 3**, the trailing
space, the new row-3 trace paragraph), AC-3.2 (*Given* gains the dispatched range, clause 1 restated,
new justifying paragraph), AC-3.4 step 1, AC-4.7 (`notice` cell, new precedence row 8, new S-16
paragraph), §6 (three rows amended, one added), O-3, O-5, O-9(c), O-10 (seven new bullets), §10.9's
heading and lead-in, and new §10.10. Sections that did not change — §1–§4, AC-1.1–1.3, AC-2.1–2.5,
AC-2.8, AC-3.1, AC-3.3, AC-3.5–3.7, AC-4.1–4.6, AC-5, AC-6, §7–§9 — are not re-litigated, except where
a changed section is stated *over* one of them: AC-1.1's *"admitted no rounds and halts immediately"*
and AC-1.5(3)'s clearance gate are read below as the receivers of AC-1.5(4)'s new refusal branch.

Growth into this round is +31,745 bytes — `new-mechanism` under AC-4.2, and under AC-3.1 that would
escalate **this** round to the full panel, which is what it got. That is now four consecutive
`new-mechanism` rounds on a document whose own AC-2.6 target regime is `incremental`; I note it under
R-9 rather than as a finding, because every one of those bytes was requested by a reviewer.

## 2. Disposition of round-6 findings

Three of mine were open (1 High, 1 Medium, 1 Low). **All three are resolved**, each checked against the
document rather than against §10.10's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-1.4 clause 1 is restated over *"**every** halt, without exception"*, with the creating halt named explicitly: *"creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own"*. The two cases are unified through O-5's read-modify-write — *"the captured region of a file that does not exist is the **empty region**"* — which is the right place to put the unification, because it is one implementation rule rather than two ACs. The consequence I asked for is now stated where the accounting reads it: *"`H` … is **exactly the number of halts this document has taken**, on every path"*, repeated in §5's durability row and in S-12. §6's `## Reset Region` row no longer delegates into a clause that does not fire — it names the creating halt itself. And O-10 gains the fixture the v1.4 text did not entitle a PROPERTIES author to, *with* the reason the existing test does not cover it (*"written against a fixture that already has a region and passes under both readings"*) — that sentence is what stops the bullet being folded back into the neighbouring test. |
| F-02 | Medium | **Resolved** | All three halves are answered. (a) Validation is now the third conjunct of clause 4's gate — *"a `RESOLVED: yes`, `A < H`, **and the region validates**"* — so a corrupt region writes nothing, exactly the direction I recommended. (b) The sanctioned repair is stated as an operator action rather than left implicit, and §5's *"machine-written and machine-maintained"* is qualified to match. (c) The notice gains **S-16** (`reset-region-corrupt: {reason}`, closed three-member enum), an AC-4.7 precedence-8 slot with a stated row shape for the admits-no-round case, and a §6 row — so a PROPERTIES author can now assert the operator-visible half. F-01 below is about what happens on the entry *after* the refusal, not about the refusal itself. |
| F-03 | Low | **Resolved** | AC-1.5(5)'s table drops *absent* and the paragraph beneath states the unreachability argument in the same terms I filed it (`A < H` ⇒ `H ≥ 1` ⇒ a last line exists), then relocates the real absent case *"one level up, at the region"* with S-12 named as its one home. §5's S-12 row carries it. A dead fixture is removed and the live one keeps exactly one authority. |

Mechanical fixes MF-12 (AC-2.6's cells restated over `W`, `W+1`, `W+2` — and the new paragraph
explaining that the absolute-index reading is off by `W − 1`, which is the part a test author needs),
MF-13 (AC-2.7 numbered and read in order, with rows 5–7 scoped to *"exactly one `VERDICT: ` line"*),
MF-14 (re-wrap) and MF-15 (*"never **counted**, wherever in the file it sits"*) are all applied.
Q-09 is answered by the new `H − A ≤ 1` paragraph — and, better, *validated* by step 3 rather than
asserted. Q-10 is answered by the listing-time-validity paragraph, which states the predicate is
deliberately re-evaluated on every read and names harvest's paired deletion as the reason the ordinary
path never reaches it. MR-03, MR-04 and MR-06 are carried and correctly recorded as non-blocking.

I record one thing about the *shape* of this round's answers, because it bears on F-01 below. Six of
the seven round-6 findings were answered by adding a new conjunct, a new step, or a new input to a
mechanism that already existed. Every one of those additions is locally correct. The failure mode that
remains is the same one round 6 found and round 5 found before it: a new branch is stated, and the
**path the system takes after that branch** is not re-traced against the ACs that own it.

## 3. Findings

Every finding below is **new** and lies in text this revision changed. All four ids are fresh; none is
a re-file. Three of the four are consequences of one structural move — v1.5 added a *refusal* branch to
AC-1.5(4) (a clearance that is observed but not granted) without stating what the entry does next, and
the entry does something: it halts.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **A refused clearance is not inert. The entry is admitted, immediately halts on the budget path, and that halt appends a `HALT-REASON:` and strips the marker — so the clearance does *not* survive, `H − A` ratchets to 2, and the sanctioned repair then fails step 3 permanently.** The dead end F-02 of round 6 closed is re-opened by the new step 3, through a different door. See §3.1. | AC-1.5(4)'s *"an invalid region is inert … the operator's clearance survives for a later entry"*, AC-1.5(4) step 3, AC-1.5(1), AC-1.4 clauses 1–2, O-10's v1.5 bullet 3 |
| F-02 | Medium | Local | **The sanctioned repair is undefined for one of S-16's three reasons.** The repair is *"the operator deletes or corrects the offending line named in the report — and nothing else"*. `counts-mismatch` names **no line** — S-16 carries *"the pair `H`/`A`"* for that reason — and repairing it requires *adding* an answering line or *removing* a `HALT-REASON:`, both of which the *"and nothing else"* clause forbids and the second of which contradicts *"leaving `H` equal to the number of halts the document has taken"*. O-10's counts-mismatch bullet accordingly asserts *"**no** window granted on that entry **or any later one**"* — a permanent halt with no exit — while the sibling bullet for the invalid-value reason asserts a repair does work. One third of a closed enum is fail-closed with no stated way out. See §3.2. | AC-1.5(4)'s sanctioned-repair paragraph, step 3, S-16, O-10 bullets 2–3 |
| F-03 | Medium | Cross-Feature | **The verifier's dispatched round range is a new boundary-crossing input with no grammar, no catalogue id and no total receive side — the exact DC-01 defect the paragraph that introduces it cites DC-01 to justify.** AC-3.2's *Given* now requires *"a dispatch that names the window: the loop passes the verifier the inclusive round range `{W … N−1}` … as an explicit input"*, and clause 1's required `## Disposition` row set is a function of it. But: §5's catalogue is declared closed at **sixteen** and this input is not among them, so its rendering is unfixed (`{W … N−1}`? `4..6`? `rounds 4–6`?) while AC-6.4 elsewhere fixes a *range separator* precisely because ranges are ambiguous; AC-3.2's *Then* states no behaviour for an absent, empty or unparseable range; and the only statement of that behaviour lives in **O-9(c)** — *"a verifier given no range does not guess … it reports the missing input"* — which is an FSPEC/implementation obligation, not an AC, and names no report slot, no notice id and no loop-side response. AC-3.2's completeness check is an approval gate, so a verifier that receives a garbled range emits the wrong row set and refuses approval for the wrong reason — which is SE v6 G-16's failure relocated into the seam, not removed from it. A PROPERTIES author can write the happy-path range test (O-10 bullet 6 asks for exactly that) and has nothing assertable for any other input. This is the third consecutive round in which a new loop→agent value shipped without a receive side (v1.4's `HALT-REASON:` → TE v5 F-06; v1.5's S-16 → TE v6 F-02); the recurrence is why I tag it `Cross-Feature`. | AC-3.2 *Given* and clause 1, its new justifying paragraph, §5 catalogue lead-in, O-3, O-9(c), O-10 bullet 6 |
| F-04 | Low | Local | **AC-2.7's new row 3 assigns *malformed* to an input that §5 defines as *unavailable*, and §5 is not amended.** §5: *"**unavailable** — a quantity that no reader can obtain from the branch — distinct from **malformed**, which is a quantity that was read and could not be parsed."* Row 3 is a `## Verdict` section carrying **no `VERDICT: ` line at all**: no quantity was read, so §5's own words classify it *unavailable*. Row 4 explicitly appeals to that definition to justify itself (*"which is §5's definition of *malformed* exactly"*), so the definition is load-bearing in the same table. The classification row 3 asserts is correct against HEAD and the trace is verified — I am not contesting the value. But a test author who reasons from §5 rather than from the row gets the opposite answer, and the document's own convention is that §5's definitions are the authority the ACs are stated over. Fix: amend §5's *malformed* entry to cover the structurally-absent-trailer case explicitly (e.g. *"…or a `## Verdict` section that structurally should carry the quantity and does not — see AC-2.7 row 3, which is stated over `parseVerdict`'s `malformed: true` fallback"*), or add one sentence to row 3 saying it is a deliberate exception to §5's split and why. | AC-2.7 row 3, §5 *unavailable* / *malformed* definitions, AC-2.3 |

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict
