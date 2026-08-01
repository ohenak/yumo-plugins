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

Ids continue the `G-` series so they cannot be confused with the closed `F-01…F-12` or `G-01…G-12`.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-14 | Medium | Local | **AC-1.5(4)'s ordered algorithm validates every line's *value* and never the *relation* the whole mechanism rests on, and the unvalidated case fails open.** The new one-shot rule is `A < H` ⇒ grant, and the loop *"writes exactly one answering line"* per entry that observes it. That is correct only under the unstated invariant `H − A ≤ 1`. On any region where `A < H − 1`, one entry restores only one answer, `A < H` is **still** true on the next entry, and — because `RESOLVED:` is stripped only by a **halt** (AC-1.4 clause 2), not by a grant — the operator's single `RESOLVED: yes` is still readable, so the loop grants **another** fresh three-round window, and another, on every subsequent invocation until the counts equalise. That is verbatim the failure AC-1.5(4)'s own justification names (*"a persistent file state that re-grants a fresh window on **every** subsequent invocation — which silently restores the per-invocation budget AC-1.1 exists to abolish"*), reachable through the one input the ordered algorithm was written to be total over: an arbitrary region. The algorithm rejects a bad *value* (⇒ `W` = 1, fail-closed) but a region with two `HALT-REASON:` lines and no answering line passes every one of its four steps. The region lives in a file operators are **told** to edit — writing `RESOLVED: yes` there is the escape hatch — so "a human deleted a line that looked stale" is the normal way this arises, not an exotic one. | AC-1.5(4) clause 4 and its ordered algorithm; §5 durability row *Whether a clearance is still unanswered*; AC-1.1 |
| G-13 | Medium | Local | **The write position of the two answering lines is unstated, and AC-1.5(4)'s validation is order-sensitive.** v1.4 fixed exactly this for `HALT-REASON:` (G-11) — *"appended to the end of that region"*, stated in AC-1.4, AC-1.5(5) and §5 — and did not state it for the lines it newly made order-sensitive. Step 2 requires each `WINDOW-START:` to be *"strictly greater than every `WINDOW-START:` value **before it**"* and each `WINDOW-RESUMED:` to equal *"the greatest `WINDOW-START:` value **before it**, or 1 if there is none"*; §6's S-13/S-14 rows and clause 4 say only *"in the reset region"* / *"writes exactly one answering line"*. A loop that prepends — a natural implementation of "write into a named section", and the same reading of *around* that produced G-11 — puts `WINDOW-RESUMED: 4` ahead of `WINDOW-START: 4`, which fails validation ⇒ `W` = 1 for the rest of the document's life, because the region is preserved verbatim by every later halt. AC-1.1 then admits **no rounds** on a branch that already has three, so the phase halts immediately on every entry and no clearance can ever repair it. Fail-closed, but permanently. | AC-1.5(4) steps 1–2, clause 4; §6 `WINDOW-START:` / `WINDOW-RESUMED:` rows; §5 S-13/S-14 |
| G-16 | Medium | Local | **AC-3.2 scopes the verifier's required output to `W`, and nothing gives the verifier `W`.** Clause 1 now demands *"every prior blocking finding **of the current window**"*, one `## Disposition` row each. The emitter is an agent; `W` exists only in the POSTMORTEM's `## Reset Region`, and obtaining it means re-running AC-1.5(4)'s four-step validation — including *"no greater than one past the highest round on the branch"*, which needs the directory listing too. Nothing in AC-3.2, AC-3.7, O-3 or O-9(c) says the loop passes the window origin (or the explicit round range) to the verifier, and no clause tells the verifier to read the post-mortem. A verifier that keeps v1.3's reading emits rows for a previous window's findings — precisely the *"content is underivable"* failure v1.4 says it closed, relocated from the document into the agent — and AC-3.2(1)'s completeness check makes the row set an approval gate, so the error is not cosmetic. The REQ's own standard here is DC-01's: a receive side stated once, with exactly one membership. | AC-3.2 *Given* and clause 1; the *"Why 'of the current window'"* paragraph; O-3, O-9(c) |
| G-15 | Medium | Local | **A `## Verdict` section carrying *zero* `VERDICT:` lines is classified by AC-3.4 and by no row of AC-2.7 — and the classification AC-3.4 gives it disagrees with the shipped reader.** AC-3.4 step 1 is new in v1.4 and enumerates three outcomes: no section, **no `VERDICT:` line**, and ≥ 2 lines. AC-2.7's table — which states *"A count is *unavailable* in exactly these cases, and in no others"* — has rows for an absent file, an absent `## Verdict` heading, no non-empty line **after** the `VERDICT:` line, anchors-only, an unparsing candidate, and (new) ≥ 2 `VERDICT:` lines. It has **no row for a section with no `VERDICT:` line at all**; every existing row presupposes one. This is G-09's defect shape one case over, in the clause written to close G-09. It also mis-states the shipped behaviour: `extractFileVerdict` with `trailers === 0` falls through to `parseVerdict` (`:906`), which finds no `VERDICT: ` line and returns the **`malformed: true`** fallback (`:424-428`, the object at `:394-400`) — *not* the genuine `0/0/0` truncated-output path (`:451`) that AC-2.7 row 3 correctly cites for its own case. So AC-3.4 maps to *unavailable* what HEAD reports as malformed, on an input R-7 makes reachable during the SKILL transition. | AC-3.4 step 1; AC-2.7 observation table; M-2c |
| G-17 | Low | Local | **AC-1.4 clause 2 strips `RESOLVED:` *"wherever it sits"*, which is broader than the reader it exists to serve and breaks this REQ's own fenced-block discipline.** `parseResolvedMarker` counts only **unfenced** lines (`:953-958`, via `scanLines` `:569`), and §5's *reset region* definition, S-12 and the `## Reset Region` §6 row all scope reading to *"outside any fenced block"* on purpose. Clause 2 is the one rule in the document that reaches inside a fence — and it does so to delete a line from a human-authored narrative. A post-mortem for **this** feature will quote `RESOLVED: yes` in a fenced example; the file at `docs/pdlc-review-convergence/POSTMORTEM-R-pdlc-review-convergence.md` already discusses the marker in prose. No fail-open follows (a fenced marker is invisible to the gate either way), so this does not block; it is a one-word fix that keeps one scoping rule in the document instead of two. | AC-1.4 clause 2; §5 *reset region*; §6 `## Reset Region` |

## Findings in detail

## Questions

## Positive Observations

## Mechanical fixes

## Recommendation

## Verdict
