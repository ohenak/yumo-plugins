# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 8
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v7.md` (baseline `db9b544`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `af5359c`, clean.

## 1. Delta scan

```
git rev-parse db9b544:docs/.../REQ-pdlc-review-convergence.md → b0af913…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → f86d9a1…
git diff --stat db9b544 HEAD -- …/REQ-…md → 239 insertions(+), 48 deletions(-)
bytes: 241,698 → 268,264   (+26,566)
```

The revision is v1.5 → v1.6 and it answers round 7 from both panels, across nine document commits
(`232fedb` … `9bc94d1`). Changed sections, and the only ones scanned below: the header (Cross-Reviews
row, the v1.6 revision note, the v1.5 note's seven → eight correction), §5 (*reset region* and the two
durability rows, the catalogue lead-in now **seventeen**, the kind list now **six** kinds with the S-16
and S-9 rows moved, the S-16 render, the new **S-17** row, the amended *unavailable* / *malformed*
definition), AC-1.4 (the new *"every halt is exactly that, and an entry refused by AC-1.5(4) is not
one"* paragraph), AC-1.5(1) clause 1 (the not-reached note), AC-1.5(4) (the new *refusal is not a halt*
paragraph and its four bullets, the per-reason repair table, the *why counts-mismatch is repaired by
deletion* paragraph, step 3's hand-edit note, step 4's refusal sentence, the invariant paragraph's
refusal clause), AC-1.5(5) clause 5's re-wrap, AC-2.7's row-3 paragraph, AC-3.2 (*Given* and clause 1
restated over S-17, the new *the range is a boundary-crossing value* paragraph and its two bullets, the
loop-side-response paragraph), AC-4.7 (row A / row B split, row B's six-cell table and its justifying
paragraph, precedence row 8 trimmed), §6 (the `WINDOW-START:` row's scoped prohibition, the S-16 render
row, the new S-17 row), O-3, O-9(c), O-10 (six new or amended bullets), §10.10's lead-in and its TE F-02
row, and new §10.11. Sections that did not change — §1–§4, AC-1.1–1.3, AC-2.1–2.6, AC-2.8, AC-3.1,
AC-3.3–3.7, AC-4.1–4.6, AC-5, AC-6, §7–§9 — are not re-litigated, except where a changed section is
stated *over* one of them: AC-3.2's `## Disposition` receive-side table (`:1413-1424`, unchanged) is
read below as the receiver of the new S-17 refusal, because the new text explicitly delegates to it.

Growth into this round is +26,566 bytes — `new-mechanism` under AC-4.2 (S-17 is a new catalogue member
and AC-4.7 row B is a new report row), which under AC-3.1 escalates round 8 to the full panel, which is
what it got. That is five consecutive `new-mechanism` rounds; R-9 already carries the observation and I
do not re-file it, but the trajectory note in §8 says what the shape of it now is.

## 2. Disposition of round-7 findings

Four of mine were open (1 High, 2 Medium, 1 Low). **All four are resolved**, each checked against the
document rather than against §10.11's claim that it was answered.

| Prior id | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | v1.6 took the reading I recommended and took it at the altitude the contradiction lived at. AC-1.5(4)'s new *refusal is not a halt* paragraph states the four consequences separately and each one is an assertion a test can make: no halt is taken and no budget is evaluated; the marker is **left in place**, so `checkPostmortem` still reads `resolved`; the file is **byte-unchanged**; the phase is *"refused, not halted — the same shape as step G's refusal"*. Step 4 carries the same sentence at the point of decision, so the algorithm and its prose cannot drift. Critically, the fix does **not** except anything from AC-1.4: the new AC-1.4 paragraph says so explicitly (*"this REQ deliberately adds no exception to them … What it does instead is stop one path from reaching a halt at all"*), which preserves `H` = the number of halts exactly and keeps the round-6 fix intact. AC-1.5(1) clause 1 gains the not-reached note, so the halt side and the refusal side agree. §5's durability row carries *"the entry refuses the phase and returns without taking a halt, so the marker survives and neither count moves"*, and the invariant paragraph adds *"the refusal path does not disturb it"*. O-10 gains the ratchet fixture I asked for — *"the entry that follows a refusal, and the refusal's own entry"*, with the mutation criterion stated (*"fails against any implementation that lets AC-1.5(1)'s budget halt run after step 4"*). That last clause is what makes it a test rather than a description. |
| F-02 | Medium | **Resolved** | The repair is now a per-reason table, and the `counts-mismatch` row says **delete the whole `## Reset Region` section**. The justifying paragraph does the work I could not do myself when I filed it: it shows that both line-level repairs are forbidden elsewhere (§6's *"never by a human"*, AC-1.4 clause 1's `H` guarantee), that section deletion contradicts nothing because S-12 already reads an absent heading as the empty region, and it states the price in full — *"one further halt … and the loss of the halt history"*. §6's `WINDOW-START:` row is scoped to **authoring** rather than left contradicting the sanctioned deletion, which is the right direction: the prohibition now names the harm it exists to prevent (banking an unpaid window) instead of a syntactic class of edit. §5's *reset region* row carries the per-reason split. One residue remains and it is in O-10, not in the AC — F-01 below. |
| F-03 | Medium | **Resolved** | Both halves. The emitted form is **S-17**, `REVIEW-SCOPE-ROUNDS: {W}..{N−1}`, with the separator justified against S-4's existing `rounds {first}..{last}` render and the wrong renderings named and excluded (*"an en dash, a hyphen or the set notation `{4 … 6}` is **not** this line"*), a §5 catalogue row, a §6 row, and the catalogue count moved to seventeen. The receive side is total over four enumerated inputs — absent, empty, unparseable, inverted — under one behaviour, and the behaviour lands in an **already-enumerated** loop-side case (`## Disposition` absent ⇒ approval refused, `disposition-missing` in the run report, not a halt) rather than inventing a notice. O-3 and O-9(c) are both restated over S-17 and both now say the rendering and the receive side are **not** open to FSPEC. O-10 gains a bullet asserting all four inputs. I checked the delegated case is real and not assumed: AC-3.2's `## Disposition` receive-side table (`:1417`) does state the absent case as a fail-closed refusal with a run-report signal, so the delegation resolves. |
| F-04 | Low | **Resolved** | §5's *malformed* now reads *"a quantity that was read and could not be parsed, **or that the structure carrying it says should be there and is not**"*, and *unavailable* is scoped to an absent **carrier** — which is the split I asked for, stated once and in the place the ACs are stated over. AC-2.7's row-3 paragraph points at the amended definition and adds that rows 1 and 2 are the *unavailable* cases by the same split, so the table and the definition now agree in both directions rather than only where the finding touched. |

Mechanical fixes MF-16 (re-wrap), MF-17 (the S-16 render fixed in §5 and §6), MF-18 (*"which only a
hand-edit produces"* added to step 3) and MF-19 (§10.10's seven → eight, and the v1.5 revision note
corrected in the same pass) are all applied — MF-17 with one residue, F-02 below. Q-11 and Q-12 are both
answered in §10.11 and both answers are the ones a PROPERTIES author needs: co-occurring S-14 and S-4
is a **pass**, and the creating halt places `## Reset Region` at **end of file**, asserted positionally
by O-10's first-halt fixture. MR-07 is carried and correctly recorded as non-blocking.

The shape of this round's answers is different from the last two, and it is worth recording because it
is the reason the count below is what it is. Round 7's answers did not add a conjunct to an existing
mechanism — they **removed a path**. The refusal no longer reaches the halt; it returns. That is a
smaller surface than the round-6 answers presented, and correspondingly fewer edges came with it. The
two findings below are both in the *carriage* of those answers (a test obligation and a render), not in
the mechanisms, which is the first round of this review in which that has been true.

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict
