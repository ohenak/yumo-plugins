# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 6
**Scope:** REQ-pdlc-review-convergence v1.4, delta re-review against the v1.3 tree reviewed at iteration 5 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

- Baseline: `fe448f3` (*"docs(pdlc-review-convergence): SE REQ v5 — verdict"*), the commit carrying my
  v5 cross-review. `git diff fe448f3 HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
  is **+342 / −131** across 14 commits (`ea47626` … `6b41d61`), tree clean.
- The version row reads **1.4**, there is a *Revision note (v1.4)* with six numbered changes, and
  **§10.9** maps all thirteen round-5 findings from both panels to where they are answered.
- Scanned sections: the header *Cross-Reviews* and *Citation baseline* rows, §5 (*current window*, the
  new *reset region* definition, *zero-delta*, five durability rows, the catalogue lead-in and its
  count, the `HALT-REASON:` paragraph, the new **S-12 … S-14** rows), **AC-1.4 rewritten**,
  **AC-1.5(4) rewritten** (counts + ordered algorithm), **AC-1.5(5) rewritten** (`WINDOW-RESUMED:`),
  AC-2.1's window clause, AC-2.6's lead-in, **AC-2.7's new duplicated-`VERDICT:` row** and commentary,
  AC-2.8's row 4 / halt-row paragraph, **AC-3.1 rewritten over windows**, **AC-3.2's *Given* and
  clause 1**, **AC-3.4 steps 1–5 rewritten**, AC-4.1 step 1 and its first-round paragraph, AC-4.5,
  AC-4.7's schema and halt-row paragraph, §6's four new rows, N-4, O-5, O-9(d), O-10, O-12, R-9,
  §10.8's new convention note, §10.9. Unchanged sections I approved earlier are not re-litigated.
- Verification pass this round: v1.4 makes a **new universal claim** — *"v1.4 re-verified every citation
  this document makes against `9486c81` itself, line by line"*. I tested it rather than accepting it. All
  nine citation sites the revision touches or adds resolve at `9486c81`
  (`sha256Hex` `:696`, `canonicaliseForDigest` `:615` + JSDoc `:600-614`, `approvalHashOf` `:797`,
  `postmortemPrompt` `:1725-1730` inside `reviewLoop` `:1623`, `extractFileVerdict` `:888` / `:904`,
  `parseResolvedMarker` `:953` / `:961`, `checkPostmortem` `:2440` / `:2446-2447`, the step-G refusal
  `:3895-3901`), and a 14-row sample of the untouched §4 rows (`:52`, `:56`, `:393`, `:451`, `:569`,
  `:1436`, `:1466`, `:1574`, `:1623`, `:1697`, `:1710`, `:1915`, `:1934`, `:1975`, `:2151`, `:2279`,
  `:2358`, `:2490`, `:2824`) resolves there too, including the quoted JSDoc literal. The claim holds on
  every row I checked. I also read `parseVerdict` (`:393-451`) end to end, because AC-3.4's rewritten
  step 1 asserts a mapping onto it — see G-15.

## Round-5 disposition

**All six prior findings are closed**, each checked at the surface it names rather than at the revision
note or §10.9 row that claims it.

| Prior finding | Sev | Disposition | Evidence |
|---|---|---|---|
| G-07 — the preserved `RESOLVED:` line collides with `parseResolvedMarker` in both directions | High | **closed**, and closed the better of the two ways I offered | AC-1.4 clause 2 has the halt path **strip** any prior `RESOLVED:` line, so the file carries at most one and every halt is unresolved on arrival; AC-1.5(4) restates one-shot over `H` (`HALT-REASON:` lines) and `A` (`WINDOW-START:` + `WINDOW-RESUMED:`), so nothing counts the human's marker any more. §5 gains a durability row citing `:953`/`:961`/`:2440`/`:2446-2447`; N-4 is amended to say the marker's **lifecycle** changed; O-10 asserts the unresolved-on-arrival case. I traced the resulting state machine over halt → strip → refuse → clear → grant and the invariant `H − A ∈ {0, 1}` holds on every reachable path — see G-14 for the one path where it does not, which is a new finding against the counting rule, not a re-raise. |
| G-10 — an unconsumed reset outlives the S-11 halt it was written for | Medium | **closed exactly as recommended, modulo the literal** | AC-1.5(5) writes `WINDOW-RESUMED: {W}` (S-14) instead of writing nothing: `A = H` is restored, `W` does not move, spent rounds stay spent. I recommended a repeated `WINDOW-START:` equal to `W`; a distinct literal is strictly better — it needs no relaxation of the strictly-increasing rule and it distinguishes *resumed* from *reset* in the file. The stated motivation (the path gains a positive artifact O-10 can assert on, where absence of a `WINDOW-START:` is also what an unimplemented clause produces) is the right reason. |
| G-11 — "the last `HALT-REASON:`" is not determined by AC-1.4's write rule | Medium | **closed** | AC-1.4 clause 1: the halt **appends its own `HALT-REASON:` to the end of that region**, *"Nothing is written above the preserved lines and nothing between them"*; AC-1.5(5) and §5's *Which halt a POSTMORTEM records* row both restate it. Document order is now halt order by construction. The same question for the **answering** lines is not answered — G-13. |
| G-08 — AC-3.4's step 2 stops but steps 4–5 collect | Medium | **closed as recommended** | Step 2 now reads *"scans forward and **stops** at the first non-empty line that is not an anchor line — that line is *the* candidate, and there is at most one"*; step 4's *"two or more parsing candidates"* is deleted; step 5 states that a second parsing trailer *"is not observed and is therefore not a case"*. The duplicate concern moved up to step 1, over the datum a duplicate actually appears in, which is the correct level. |
| G-09 — a duplicated `VERDICT:` line is classified nowhere | Medium | **closed as recommended** | AC-2.7 gains the row (*two or more `VERDICT:` lines ⇒ malformed*) and AC-3.4 step 1 gains the clause, both citing `extractFileVerdict` (`:888`, count at `:904`). The reasoning — *malformed* because the quantity was read and could not be resolved — matches §5's definition. One case adjacent to it is still unclassified: G-15. |
| G-12 — two of the four "sourceless" cells have sources | Low | **closed** | AC-2.8 and AC-4.7 both now say `growth-bytes` / `classification` *"**do** have one"* and are withheld **by choice**; O-12 carries the round-open ordering question verbatim. |

Also applied: **MF-1** (all five drifted citations re-based to `9486c81`, the fabricated
`writePostmortem` symbol replaced by `reviewLoop` / local `postmortemPrompt`), **MF-2** (the
`HALT-REASON:` line is a catalogue member with a §6 row), **MF-3** (*"the anchors-only row"*),
**MF-4** (§10.8's freeze convention), **MF-5** (O-10 bulleted, one obligation per bullet).

Every finding below is **new in v1.4** — each lies in text this revision added, and four of the five
lie in the two mechanisms it introduced to close G-07/G-10/G-11 (the reset region's accounting) and
G-08/G-09 (the trailer reader). None re-litigates a section I approved.

## Findings

## Findings in detail

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict
