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

### G-14 (Medium) — the counting rule assumes an invariant it never checks

I traced the new state machine before filing this, because the counting rule is otherwise sound and I
want to be precise about where it stops being sound.

On every reachable path the invariant `H − A ∈ {0, 1}` **does** hold, and that is a real achievement:

| Event | Precondition the document guarantees | Effect on the counts |
|---|---|---|
| a halt | the entry passed step G, so `RESOLVED: yes` was readable, so clause 4 already answered any outstanding clearance ⇒ `A = H` | `H += 1`, and AC-1.4 strips `RESOLVED:` ⇒ the next entry is refused |
| an entry with `RESOLVED: yes` and `A < H` | only one halt can be outstanding, by the row above | `A += 1` ⇒ `A = H` |
| an entry with `RESOLVED: yes` and `A = H` (a stale, already-spent marker) | — | nothing written, nothing granted |

So one operator clearance buys exactly one window, which is what G-10 asked for.

The gap is that **nothing enforces the precondition in column 2**, and the algorithm that exists to be
total over an arbitrary region does not test it. Its four steps collect the answering lines, validate
each *value*, fail closed on any invalid value, and otherwise take the greatest. A region reading

```
## Reset Region
HALT-REASON: budget-exhausted: rounds 1..3 of 3
HALT-REASON: fixed-point: blocking(6)=5 ≥ blocking(5)=5
```

passes all four steps vacuously — there is no answering line to invalidate — and yields `H = 2`,
`A = 0`, `W = 1`. With a live `RESOLVED: yes` in the file, entry *n* observes `A < H` and grants
`WINDOW-START: 7`; `A = 1`, still `< H`. The phase runs its three rounds, or the invocation ends for any
other reason. Entry *n+1* re-reads the same file: `RESOLVED: yes` is still there (only a **halt** strips
it, and no halt occurred), `A(1) < H(2)` still holds, and the loop grants **another** fresh three-round
window with no operator action at all. The general statement is: **the number of windows handed out
beyond the one the operator paid for is exactly `H − A − 1`**, and the document places no bound on that
quantity — the algorithm that was rewritten to be total over an arbitrary region does not look at it.

How it arises without malice: the region sits in a human-facing post-mortem whose `RESOLVED:` line the
operator is instructed to write, immediately below machine lines the operator has every reason to
believe are stale after a clearance. Delete one `WINDOW-START:` and the budget becomes advisory. A
partially-completed read-modify-write (O-5's seam) or a hand-merged post-mortem does the same.

**Required change:** one step in AC-1.5(4)'s algorithm. After collection, if `A > H` **or** `A < H − 1`,
the region is corrupt in its counts ⇒ `W` = 1, no grant, and the run report names the file and the two
counts — the same fail-closed treatment step 3 already gives a corrupt value. Then state `H − A ≤ 1` as
the invariant clause 4 relies on, so the "exactly one answering line" rule has a stated domain. This
also gives O-10 a negative case it currently lacks (`A < H − 1` ⇒ no grant, not `H − A − 1` grants).

### G-13 (Medium) — where the answering line goes

AC-1.4 clause 1 fixes the position of `HALT-REASON:` because AC-1.5(5) reads *the last* one. The two
lines AC-1.5(4) reads are positional in exactly the same way, and their position is stated nowhere:

> 2. **validates every one of them.** A `WINDOW-START:` value is valid iff it is … strictly greater than
>    every `WINDOW-START:` value **before it** … A `WINDOW-RESUMED:` value is valid iff it is … equal to
>    the greatest `WINDOW-START:` value **before it**, or to 1 if there is none;

`W` itself is order-free (*"the greatest value present"*). Validity is not. Under append the region is
consistent by construction; under any other placement it is not, and the failure is absorbing: a region
that once fails validation is preserved verbatim by every subsequent halt (AC-1.4 clause 1), so `W` = 1
forever, AC-1.1 admits no rounds on a branch that already carries three, and each new clearance produces
one more immediate halt. There is no operator action that repairs it short of hand-editing the machine
region — which is the thing §6's `## Reset Region` row is proud of having made unnecessary.

**Required change:** one clause where the lines are defined — the loop **appends** its answering line to
the end of the reset region, exactly as a halt appends its `HALT-REASON:`, so document order is event
order for every line in the region. Say it in §6's S-13/S-14 rows or in clause 4; §5's durability row
already says it for `HALT-REASON:` and can carry it for both.

### G-16 (Medium) — the verifier is asked for a window it cannot see

AC-3.2 clause 1's required rows are now *"every prior blocking finding **of the current window**"*. The
row set is therefore a function of `W`. Everything else the verifier needs is on the branch in a form an
agent can read directly — prior `CROSS-REVIEW-{role}-{doc}-v{N}.md` files, their findings tables, their
ids. `W` is not: it is in `POSTMORTEM-{phase}-{feature}.md`'s `## Reset Region`, behind a four-step
validation whose last clause needs the directory listing (*"no greater than one past the highest round
on the branch"*), and the document nowhere tells the verifier to go there.

The consequence is not a cosmetic one. AC-3.2(1)'s `## Disposition` completeness check refuses approval
when rows are missing, and the paragraph that justifies the scoping says the point of it is that *"the
required content [is] derivable from the branch on every round on which a verifier runs at all"*. That
is true of the branch; it is not true of the **party required to derive it**, which is where DC-01
places the obligation.

**Required change:** state that the loop supplies the window to the verifier in its dispatch — the
origin `W`, or better the explicit inclusive round range `{W … N−1}` whose findings are in scope — and
route the wording into O-9(c) (the verifier's disposition-check contract) and O-3. One sentence in
AC-3.2, one clause in O-9(c). This keeps `W`'s single reader in the loop, which is the property
AC-1.5(4) was restated to preserve.

### G-15 (Medium) — the section with no `VERDICT:` line

AC-3.4's rewritten step 1:

> locates the trailing `## Verdict` section and counts the `VERDICT:` lines in it. No section, or **no
> `VERDICT:` line** ⇒ *unavailable*; two or more `VERDICT:` lines ⇒ *malformed*

AC-2.7's table classifies AC-3.4's outputs and asserts it does so exhaustively (*"in exactly these
cases, and in no others"*). Its six rows cover: absent file; no `## Verdict` heading; **a `VERDICT:`
line with nothing after it**; anchors-only after `VERDICT:`; a non-parsing candidate; two or more
`VERDICT:` lines. Every one of the last four presupposes a `VERDICT:` line exists. The heading-present /
line-absent case has no row.

Verified at `9486c81`, the shipped path for that input is not the one AC-3.4 names:

- `extractFileVerdict` finds the heading, counts `trailers === 0` (`:900-903`; the predicate is
  `line.trim().startsWith("VERDICT: ")`), skips the `> 1` return at `:904`, and falls through to
  `return { ok: true, ...parseVerdict(section, roleSlug) }` at `:906`;
- `parseVerdict` scans the section in reverse for a `VERDICT: ` line (`:415-422`), finds none, and
  returns the fallback at `:424-428` — `{verdict: "Needs revision", 0, 0, 0, **malformed: true**}`
  (`:394-400`);
- that is a different object from the truncated-output path AC-2.7 row 3 correctly cites, which returns
  `{verdict: rawVerdict, high: 0, medium: 0, low: 0}` with **no** `malformed` flag (`:451`). M-2c draws
  exactly this distinction, so the REQ already knows the two are different.

R-7 makes the input reachable: a lagging SKILL writes the heading (it is in the existing file contract)
without the trailer the amendment adds.

**Required change:** one row in AC-2.7 and one word in AC-3.4 step 1. *Malformed* is the answer that
matches HEAD; if *unavailable* is preferred on the grounds that no trailer was written, say so and say
that the `malformed: true` flag is deliberately not honoured here, so an implementer does not read the
REQ and the code as agreeing when they do not.

### G-17 (Low) — one scoping rule, not two

Clause 2 reads *"any `RESOLVED:` line already in the file is stripped, **wherever it sits**"*. Every
other reader in this REQ — `parseResolvedMarker` (`:953-958`), the reset region (§5), S-12, the `##
Reset Region` §6 row — is scoped *outside any fenced block*, via `scanLines` (`:569`). A fenced
`RESOLVED: yes` is invisible to the gate, so stripping it changes no decision; not stripping it changes
no decision either. The only difference is whether the halt path edits prose inside a human's code
fence. Scope the strip to unfenced lines and the document has one rule instead of two.

## Questions

Q-10, Q-11 and Q-12 from v5 are **closed** by v1.4 (AC-1.4's strip — the answer is *"none"*; AC-3.4's
stopping scan — *malformed*; `WINDOW-RESUMED:` respectively) and are not restated. Three new, each the
fastest route into the finding beside it.

| ID | Question |
|----|---------|
| Q-13 | On a region with two `HALT-REASON:` lines, no answering line, and a readable `RESOLVED: yes`, how many windows does the loop grant before it stops — and what in AC-1.5(4) bounds that number? (G-14) |
| Q-14 | Does the loop append its `WINDOW-START:` / `WINDOW-RESUMED:` line to the end of the reset region, and where is that said? If it may write elsewhere, what does step 2's *"before it"* mean? (G-13) |
| Q-15 | How does the verifier at round N learn `W`, so that *"every prior blocking finding of the current window"* names a determinate set of rows? (G-16) |

## Positive Observations

- **All six round-5 findings are closed at the mechanism, and the High is closed the better of the two
  ways I offered.** Separating the human's marker from the loop's accounting — `H` against `A` rather
  than `RESOLVED:` against `WINDOW-START:` — is the correct decomposition, not a patch: it leaves
  `parseResolvedMarker`'s single-valued contract exactly as shipped, makes the halt path fail closed on
  arrival, and gives both counted quantities a legal reason to repeat. The state machine that results
  is right on every path I could reach; G-14 is about a precondition it never checks, not about the
  decomposition.
- **`WINDOW-RESUMED:` is a better answer than the one I recommended.** I suggested a repeated
  `WINDOW-START:` equal to `W`, which needed AC-1.5(4)'s strictly-increasing row relaxed. A distinct
  literal needs no relaxation, is self-describing in the file, and — as the AC says — gives the S-11
  path a *positive* artifact, where the absence of a `WINDOW-START:` was indistinguishable from an
  unimplemented clause. That last observation is the general lesson and is worth harvesting: **a rule
  whose correct behaviour is "write nothing" cannot be tested apart from its own absence.**
- **The citation baseline claim was made universal and it survives testing.** Every one of the nine
  changed or added sites resolves at `9486c81`, including the JSDoc quotation reproduced verbatim, and a
  19-row sample of the untouched §4 rows resolves there too. v1.3 mixed two baselines and invented a
  symbol; v1.4 does not merely re-base the five bad rows, it states in the header *why* mixing baselines
  is worse than drift (it falsifies the universal claim the row makes). That is the right altitude for
  the fix.
- **R-9's demonstration is now derivable, and I checked it against the files.** `blocking(N)` read as §5
  defines it: rounds 1 and 2 carry no trailer in either file; round 3 has one only in the SE file
  (`3+2`) so the round is *unavailable*; round 4 is `(1+4) + (2+2) = 9`; round 5 is `(1+4) + (3+3) = 11`.
  Every figure matches the trailers on the branch. v1.3's "10, 5, 5, 5" was a panel-private series
  presented as the document's; replacing it with the series AC-2 would actually read — three of five
  rounds *unavailable*, exactly as R-7 predicts — makes the risk self-demonstrating in the mechanism's
  own terms.
- **The window boundary is now one boundary.** AC-2.1, AC-2.8, AC-3.1, AC-3.2, AC-4.1 and AC-4.5 all
  turn on `N > W`, §5's *current window* states it once, and AC-2.8's row 4 and AC-3.1's new paragraph
  each derive the same consequence from opposite directions. v1.3 had two ACs scoped to the window and
  three to the round index, which is precisely the shape that let a lone verifier approve a document a
  panel had rejected. Fixing it by moving every AC onto the same boundary — rather than by adding a
  special case at the one place the hole was visible — is the durable form.
- **AC-1.5(4)'s receive side became an ordered algorithm.** Replacing a table of independent rows with
  *collect → validate all → any failure ⇒ fail closed → else the greatest* is the correct answer to a
  totality-without-single-valuedness defect, and *"a corrupt region is never partially believed"* is a
  sentence worth keeping. G-14 is a request to extend the same principle from values to counts.

## Mechanical fixes

Not findings. Apply without discussion; none affects the recommendation.

| id | Where | Fix |
|---|---|---|
| MF-1 | AC-2.6, table header and body | The lead-in is restated over windows (*"read over the three rounds of a window (rounds `W`, `W+1`, `W+2`)"*), but the table it introduces still reads `| Reachable sequence (rounds 1, 2, 3) |` and every cell names absolute indices — *"the growth into round 2"*, *"(1,2) and (2,3)"*, *"round 2 **or** round 3"*. The mapping is obvious, but this is the one table whose whole purpose is that *"a test author can derive the expected fire-sites"*, and a test author who resets a window derives them off by `W − 1`. Restate the header as `rounds W, W+1, W+2` and the cells as `W+1` / `(W, W+1)`. |
| MF-2 | AC-3.4 step 1; AC-2.7's new row | Both say *"`VERDICT:` lines"*. The shipped counter is `line.trim().startsWith("VERDICT: ")` (`pdlc/workflows/orchestrate-dev.js:902`) — **with the trailing space** — so `VERDICT:Approved` is not a `VERDICT:` line to `extractFileVerdict`, and `parseVerdict` does not see it either (`:417`). The commentary under the table gets this right (*"counts lines beginning `VERDICT: `"*); the normative clauses do not. Write the space into both. |
| MF-3 | AC-1.4, lead-in to clauses 1–2 | The clauses are conditioned on *"every halt that finds an **existing** post-mortem"*, so the **creating** halt — the common case — is governed only by AC-1.5(5)'s *"each halt appends … to the end of the reset region"*, and nothing says who first writes the `## Reset Region` heading. O-5's read-modify-write covers it if the captured region of a non-existent file is read as empty; say that, in one clause, where the region is defined. |
| MF-4 | §5, `HALT-REASON:` paragraph, and S-12's row | S-12's *Exact string* cell now carries two different things — the `## Reset Region` heading **and** the `HALT-REASON:` grammar — while S-13 and S-14 are one literal each. Since §6 already gives `HALT-REASON:` its own row, give it its own catalogue id too (S-15) rather than nesting it; the lead-in's *"five kinds"* sentence already describes it as a member (*"the `HALT-REASON:` render inside S-12's row"*), which is the last residue of v1.3's "not a member" framing. |
| MF-5 | §10.9, last row | *"TE MR-05 — Carried, and **taken off the critical path**"* is correct, but MR-05 is a **measurement request**, and §10.9 is headed *"Round-5 finding → where it is answered"*. Its final two rows carry questions and a measurement request, not findings; the heading's *"all thirteen findings below"* counts only the rows above them. Retitle or split, as §10.7 does. |

## Recommendation

**Needs revision** — four Medium findings, **all new in v1.4**, plus one Low. **No High.** Every
finding from rounds 1–5 is closed, five of the six exactly as this reviewer recommended and one
(`WINDOW-RESUMED:`) better than recommended.

### What must change to close this out

Four clauses, each a single sentence or a single algorithm step. None requires a new mechanism.

1. **G-14** — add a counts check to AC-1.5(4)'s algorithm: `A > H` or `A < H − 1` ⇒ the region is
   corrupt ⇒ `W` = 1, no grant, reported — and state `H − A ≤ 1` as the invariant clause 4's "exactly
   one answering line" relies on. This is the only finding this round whose failure direction is
   **open**.
2. **G-13** — state that the loop **appends** its `WINDOW-START:` / `WINDOW-RESUMED:` line to the end of
   the reset region, so step 2's *"before it"* is well defined for the same reason AC-1.4 made *"the
   last `HALT-REASON:`"* well defined.
3. **G-16** — state that the loop passes the verifier its window (the origin `W`, or the inclusive round
   range `{W … N−1}`), and carry it into O-9(c).
4. **G-15** — one AC-2.7 row and one clause in AC-3.4 step 1 for a `## Verdict` section with **no**
   `VERDICT:` line, matching whichever of *malformed* (what HEAD returns) or *unavailable* the author
   intends, and saying which.

G-17 and MF-1 … MF-5 do not block.

### On the stopping rule

Read as the REQ itself now defines `blocking(N)` — the sum over the round's files, by
`extractFileVerdict` — the series is: rounds 1–3 **unavailable**, round 4 = **9**, round 5 = **11**.
`blocking(5) ≥ blocking(4)`, both rounds available, reliable and same-shape: **AC-2.1's condition held
at round 5**, and this round exists because the operator cleared the post-mortem rather than because
the rule said continue. My own panel-private series is 10, 5, 5, 5, 5, **4** — the first decrease in
four rounds, and the first round in six with **no High finding**.

I set myself a test at round 4 and applied it at round 5. Here is what round 6 actually shows, stated
plainly because it points the other way from rounds 4 and 5:

- **The findings are getting smaller and the mechanisms are getting right.** Round 5's High was the
  document contradicting shipped code on the repo's central gate. Round 6 has no High. Two of the four
  Mediums (G-13, G-14) are *one step short* on an algorithm that is otherwise correct — not a wrong
  mechanism, a mechanism missing a guard. Two (G-15, G-16) are a missing table row and a missing
  dispatch input.
- **The new-defect rate per unit of new mechanism fell.** v1.4 added more mechanism than v1.3 (a named
  region, two new literals, an ordered algorithm, a window-scoped panel rule across six ACs) and drew
  fewer and lighter findings. That is the first round of which that is true.
- **It is still true that every finding is in new text.** R-9's regime has not been escaped; it has
  been attenuated.

My read, offered to the operator rather than asserted, and consistent with the standing advice recorded
in `POSTMORTEM-R-pdlc-review-convergence.md` §Recommendation clause 2: **land G-14 and G-13 — they are
two clauses inside one AC — and carry G-15, G-16 and G-17 into FSPEC as inputs rather than opening
round 7.** G-16 is naturally an FSPEC concern (it is about what the loop puts in a dispatch), G-15 is a
table row FSPEC has to restate anyway, and G-17 is one word. G-14 is the one I would not defer: it is a
fail-open hole in the budget mechanism this whole REQ exists to make absolute, and a fail-open defect
carried into FSPEC tends to be re-derived rather than inherited.

If the operator prefers the mechanical route, the same outcome with a record is: apply G-14 and G-13,
re-resolve the POSTMORTEM, and treat the phase as converged rather than opening a seventh review round.

### Explicit non-findings (carried and extended)

Recorded so a later round does not re-raise them: I do not contest any of the six decisions; I do not
file R-5's known unenforceability of AC-5, AC-4.6 or AC-3.2(2); I do not file R-6's mixed-panel
integration risk; I do not contest AC-2.8's fail-open posture, AC-1.5(4)'s fail-closed posture, N-7's
widening to Phase DOD, AC-4.1's live later endpoint, the S-3/S-4 co-occurrence ordering, the AC-2.8 halt
row's empty cells, or R-9's decision to record rather than fix. **New this round:** I do not contest
the `H`/`A` decomposition itself, the choice of a distinct `WINDOW-RESUMED:` literal, AC-1.4's strip as
the fail-closed choice (including its interaction with clause 3's prohibition, which the amended N-4
states correctly), the window-scoping of AC-3.1/AC-3.2/AC-4.1/AC-4.5, AC-3.4's stopping scan, or the
decision to map a duplicated `VERDICT:` to *malformed*. I have no blocking finding against REQ-RCV-05 or
REQ-RCV-06. I raised no `## Measurement Required` items.

## Verdict

**Needs revision.** v1.4 (+342/−131, 14 commits) **closes every one of my six round-5 findings**, five
of them exactly as recommended and one better: AC-1.4 now **strips** the spent `RESOLVED:` line so the
file never carries two and every halt is unresolved on arrival, and AC-1.5(4) restates one-shot over
`H` (`HALT-REASON:` lines) against `A` (`WINDOW-START:` + `WINDOW-RESUMED:`), which leaves
`parseResolvedMarker`'s single-valued contract exactly as shipped (G-07); the S-11 path writes
`WINDOW-RESUMED: {W}` so a clearance is always answered and no free window is banked (G-10); every halt
**appends** its `HALT-REASON:` to the end of the named `## Reset Region`, so *"the last"* means *"the
most recent"* (G-11); AC-3.4's scan stops and step 4's collecting clause is deleted (G-08); a duplicated
`VERDICT:` line has an AC-2.7 row ⇒ *malformed* (G-09); and the AC-2.8 halt row's empty cells are
justified as a choice with the ordering question carried into O-12 (G-12). All five mechanical fixes are
applied, and the header's new universal citation claim survives testing: all nine changed or added
sites, plus a 19-row sample of the untouched ones, resolve at `9486c81`.

Four new findings, all in text v1.4 added, **no High**. AC-1.5(4)'s ordered algorithm validates every
line's value but never the counts relation the mechanism rests on, so a region with `A < H − 1` — two
`HALT-REASON:` lines and no answering line passes all four steps — hands out `H − A − 1` fresh
three-round windows with no operator action, which is verbatim the failure the AC's own justification
names (G-14, the only fail-**open** finding this round). The write position of the two answering lines
is unstated while step 2's validation is order-sensitive (*"strictly greater than every `WINDOW-START:`
before it"*), and a non-appending writer locks `W` = 1 permanently, because the region is preserved
verbatim by every later halt — the same defect v1.4 fixed for `HALT-REASON:` and did not fix for the
lines it newly made positional (G-13). AC-3.2's new *"of the current window"* scoping makes the
verifier's `## Disposition` row set a function of `W`, and nothing in AC-3.2, O-3 or O-9(c) gives the
verifier `W`, which lives behind AC-1.5(4)'s validation in the post-mortem (G-16). And a `## Verdict`
section carrying **no** `VERDICT:` line is enumerated by AC-3.4 step 1, has no row in AC-2.7's
self-declared exhaustive table, and is classified there as *unavailable* where HEAD returns the
`malformed: true` fallback (`:906` → `:424-428`), not the genuine `0/0/0` truncated-output path
(`:451`) — G-09's shape one case over (G-15). One Low: AC-1.4's strip reaches inside fenced blocks,
which no other reader in this REQ does (G-17).

On the stopping rule, honestly: read as §5 defines `blocking(N)`, rounds 1–3 are *unavailable*, round 4
is 9 and round 5 is 11, so AC-2.1's condition **held at round 5** and this round exists by operator
clearance. But round 6 is the first round with **no High**, the first decrease in my own series
(10, 5, 5, 5, 5, 4), and the first in which v1.4 added *more* mechanism than its predecessor and drew
*fewer and lighter* findings. Two of the four Mediums are one guard short of an otherwise correct
algorithm. My recommendation to the operator is to land G-14 and G-13 — two clauses inside one AC — and
carry G-15, G-16 and G-17 into FSPEC rather than open a seventh round.

VERDICT: Needs revision
{"high": 0, "medium": 4, "low": 1}
