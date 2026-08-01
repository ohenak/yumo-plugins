# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 5
**Scope:** REQ-pdlc-review-convergence v1.3, delta re-review against the v1.2 tree reviewed at iteration 4 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

- Baseline: `087d5d6` (*"docs(pdlc-review-convergence): SE REQ v4 — verdict"*), the commit carrying my
  v4 cross-review. `git diff 087d5d6 HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
  is **+328 / −105** across 9 commits (`7084517` … `4f5be4f`), tree clean.
- The version row reads **1.3**, there is a *Revision note (v1.3)*, and **§10.8** maps every round-4
  finding from both panels to where it is answered.
- Scanned sections: the header Cross-Reviews row, §5 (*round growth*, the new *current window* row,
  *zero-delta*, the durability table's five changed/added rows, the two-writer table, the catalogue
  lead-in, the new `HALT-REASON:` paragraph, S-4 and S-10), **AC-1.4's new preservation paragraph**,
  AC-1.5(1), **AC-1.5(4) rewritten**, **AC-1.5(5) new**, AC-2.1's window scoping, AC-2.2, AC-2.6's
  table, AC-2.7's rows 4–5 and their commentary, **AC-2.8 rewritten**, AC-3.1, **AC-3.4's reader
  algorithm**, **AC-4.1 rewritten**, AC-4.2, AC-4.5, AC-4.7's schema, halt-row paragraph and precedence
  table, §6's `DOC-SHA256:` row, O-5, O-9, O-10, O-12, R-9, §9.3, §10.7, §10.8. Unchanged sections I
  approved earlier are not re-litigated.
- Verification pass this round: v1.3 adds **one** new existing-code citation (the post-mortem write
  prompt) and restates the `sha256Hex` family. I checked both against the declared citation baseline
  `9486c81` in a single pass, and additionally checked the two shipped functions the new AC-1.4 / AC-1.5(4)
  mechanism must coexist with — `parseResolvedMarker` and `extractFileVerdict` — which the REQ does not
  cite. Results are in G-07, G-09 and MF-1.

## Round-4 disposition

**All five prior findings are closed.** Each was checked at the surface it named, not at the revision
note or §10.8 row that claims it.

| Prior finding | Sev | Disposition | Evidence |
|---|---|---|---|
| G-01 — AC-2.2 and AC-4.7 contradict each other on S-3/S-4 co-occurrence | High | **closed** | AC-4.7's precedence table now gives S-3 and S-4 **two rows** (3 and 4 of seven) and the "at most one of the two can appear on a round" clause is gone; row 3 states the co-occurrence explicitly and names the case AC-2.2 constructs. AC-2.2 additionally binds the render to the `HALT-REASON:` line (*"the same `; `-joined string"*), answering Q-07's second half, and a new paragraph states that S-11 never co-occurs with either — which is the correct consequence of deciding S-11 at round-open. O-10 gains the two-halt row. |
| G-02 — AC-2.8's S-11 notice has no report row | Medium | **closed** | Both AC-2.8 (*"What the run report shows for the undispatched round"*) and AC-4.7 (*"The AC-2.8 halt row is the one row with no dispatch behind it"*) state the row: `round` = N, four cells **empty**, `notice` = S-11 alone. Stated twice on purpose and identically. O-10 asserts it. The reasoning — empty cells say "not run", the mechanical derivation would report an authoring failure as a reviewer crash — is right. One residue in the *justification*, not in the prescribed cells: G-12. |
| G-03 — `DOC-SHA256:` does not digest the bytes `DOC-BYTES:` counts | Medium | **closed**, and closed the way I recommended | AC-4.1's heading is now *"…from the same read — but not over the same bytes"*; the digest is `sha256Hex`'s over `canonicaliseForDigest`'s output, cited at `pdlc/workflows/orchestrate-dev.js:848`, `:767` and JSDoc `:752-759`; the "same bytes" claim is withdrawn in terms. AC-2.8 gains *"Which bytes are digested, precisely"* and derives the line-endings-only consequence in the safe direction. §6's row and §5's S-10 row both carry the provenance and the bare-vs-prefixed rendering difference against `approvalHashOf` (`:950`). All four citations verify at `9486c81`. |
| G-04 — the reset anchor is not protected from the halt path | Medium | **closed as asked, and the chosen fix has a new consequence** | AC-1.4 gains the preservation paragraph; O-9 gains clause (d) (prompt amendment); O-5 gains the write confirmation. This is option (a) of the two I offered, and it is the right one at REQ altitude. It also puts a preserved `RESOLVED: yes` in front of a shipped reader neither AC cites — see **G-07**, which is a new finding against the new mechanism, not a re-raise of G-04. |
| G-05 — AC-3.4 and AC-2.7 define the trailer reader as two different total functions | Medium | **closed in substance** (two residues, G-08 and G-09) | AC-3.4 now states one five-step algorithm; AC-2.7's row 4 is restated as *"contains **nothing but anchor lines**"*; the anchor set is given **by reference** to §5's catalogue and enumerated nowhere else, which closes MF-2 with it. The two clauses now classify the same observations. The algorithm's own internal statement is not yet single-valued (G-08) and omits one branch the shipped reader already returns (G-09). |
| G-06 — a count-only fixed point cannot see finding turnover | Low/Cross-Feature | **closed as recorded signal** | **R-9** is new and states the mechanism, the demonstration (10, 5, 5, 5), the disagreement with AC-4.2's classification of the same round, and why it is accepted rather than fixed; §9.3 gains a binding row to the calibration successor, which gains a fourth question. That is exactly what a Low/Cross-Feature finding is for. |

Also closed: **MF-1** (§5's S-4 now shows the format string plus two specimens, including a reset
window's), **MF-2** (folded into G-05's fix), **MF-3** (§5's catalogue lead-in names the four kinds in
row order), **MF-4** (the header's Cross-Reviews row carries round 4 and declares itself per-round
maintenance, so it is not re-raised).

The findings below are **all new in v1.3** — every one is in text this revision added, and every one
except G-12 is in the three mechanisms v1.3 introduced to close G-04, G-05 and TE F-04. None
re-litigates a section I approved.

## Findings

Ids continue the `G-` series so they cannot be confused with the closed `F-01…F-08` or `G-01…G-06`.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-07 | High | Local | **AC-1.4's preserve-the-reset-region rule breaks the shipped POSTMORTEM gate, in the fail-open direction, and AC-1.5(4)'s counting rule is unimplementable against it.** Both clauses are new in v1.3 and neither cites the reader they must coexist with. `parseResolvedMarker` (`pdlc/workflows/orchestrate-dev.js:953`) collects **every** unfenced `RESOLVED:` line in the file and returns `{ok: false, reason: "duplicated"}` when there is more than one (`:961`); `checkPostmortem` (`:2440`) maps `ok && resolved` ⇒ `resolved` (`:2446`) and everything else ⇒ `unresolved` (`:2447`). Two consequences, both fatal to the mechanism as written. **(a)** A halt that preserves a single prior `RESOLVED: yes` writes a *new* post-mortem that already reads `resolved`, so step G never refuses and **the second halt does not halt anything** — the phase re-runs immediately on the next invocation. That inverts the repo's core fail-closed gate. **(b)** For the counting rule to grant a second reset the operator must add a **second** `RESOLVED: yes` line (the REQ's own O-10 asks for a test over "a region carrying two `RESOLVED: yes` lines"), which `parseResolvedMarker` reads as `duplicated` ⇒ permanently `unresolved` ⇒ the phase can never be re-entered again. (a) and (b) are the only two reachable states, and they are opposite failures. | AC-1.4 (preservation paragraph), AC-1.5(4), §5 durability rows 3–4, O-5, O-9(d), O-10 |
| G-08 | Medium | Local | **AC-3.4's new reader algorithm is not single-valued about how many candidates it has.** Step 2 defines *the* candidate as "the **first** non-empty line that is not an anchor line" — a scan that stops, so there is at most one. Steps 4 and 5 then speak of "**two or more parsing candidates** ⇒ *malformed*" and "**exactly one** parsing candidate", which presuppose a scan that collects. The two readings give different answers on a real input — `VERDICT:` → a prose line → a valid count trailer — where the stopping reading yields *malformed* and the collecting reading yields a readable count. This is the same defect shape as G-05, now inside the single algorithm written to close it, and AC-2.7's table classifies the algorithm's outputs, so it inherits whichever reading is chosen. | AC-3.4 second bullet, steps 2/4/5; AC-2.7; O-10 |
| G-09 | Medium | Local | **A duplicated `VERDICT:` line has no classification anywhere in the REQ, though the shipped reader already returns one.** AC-3.4 step 1 says the reader "locates the `## Verdict` section and its **single** `VERDICT:` line — absent ⇒ *unavailable*" and stops there; AC-2.7's observation table has rows for absent file, no `## Verdict` heading, nothing after `VERDICT:`, anchors-only, and an unparsing candidate — and **no row for two `VERDICT:` lines**. `extractFileVerdict` (`pdlc/workflows/orchestrate-dev.js:888`) counts trailers in the section and returns `{ok: false, reason: "duplicated"}` at `:904`, and the repo's documented file contract states a second `VERDICT:` line is read fail-closed. So AC-2's operand has a third failure mode that maps to neither *unavailable* nor *malformed*, on a document whose own bar (DC-01) is a receive side that is total **before** FSPEC authoring. | AC-3.4 step 1, AC-2.7 observation table, AC-2.3, M-2e |
| G-10 | Medium | Local | **AC-1.5(5)'s "S-11 does not consume the reset" leaks a free window to the next convergence halt.** After an S-11 halt is cleared, `R > S` holds and — by design — no `WINDOW-START:` is written, so the unconsumed reset **persists indefinitely**. The next S-3 or S-4 halt then meets an entry that observes `R > S` with a last `HALT-REASON:` of `fixed-point:`/`budget-exhausted:`, and clause 4 grants and consumes a fresh three-round window — using a `RESOLVED: yes` the operator wrote to clear an *unrelated, earlier* authoring halt. No human ever cleared the convergence halt. That is one free window per S-11 event, which is the unbounded-review behaviour AC-1.1 exists to abolish and the exact failure clause 4 was added to prevent. The rule needs the reset to be *scoped to the halt it cleared*, not merely uncounted. | AC-1.5(5) table row 1, AC-1.5(4), AC-1.1, AC-2.8 |
| G-11 | Medium | Local | **"The last `HALT-REASON:` line" is not determined by AC-1.4's write rule.** AC-1.5(5) reads the **last** `HALT-REASON:` line to decide whether the reset is consumed. AC-1.4 says the halt preserves the reset region — including "every `HALT-REASON:` line already in the file, in document order, under a heading the halt path does not touch" — and "writes its own new content **around** that region". *Around* admits both before and after, so the new halt's own `HALT-REASON:` may land **above** the preserved region, making the document-order-last line the **previous** halt's reason. The decision it drives is which of two opposite outcomes occurs — reset consumed, or window resumed. Nothing states that each halt appends its reason to the end of the region (nor that the halt's reason is inside the region at all, though AC-1.4 preserves prior ones as if it were). | AC-1.4, AC-1.5(5), §5 *"Which halt a POSTMORTEM records"* row |
| G-12 | Low | Local | **AC-4.7's justification for the AC-2.8 halt row is false of two of its four empty cells.** Both AC-2.8 and AC-4.7 argue the cells are empty because "none of the five non-`round` columns has a source". `growth-bytes` and `classification` do have one: AC-4.1 step 1 computes `growth = bytes(t0) − DOC-BYTES(N−1)` at round-open from the same read AC-2.8 tests, and on an S-11 halt that growth is **exactly 0** ⇒ `incremental`, both derivable without any file at round N. The *prescribed* cells are unambiguous (empty), so a test author is not blocked and this does not gate; but the stated reason is wrong, and the relative order of AC-4.1 step 1 and AC-2.8's test at round-open is left unstated, which is the thing FSPEC actually has to decide (O-12). | AC-2.8 *"What the run report shows"*, AC-4.7 halt-row paragraph, AC-4.1 step 1, O-12 |

## Findings in detail

### G-07 (High) — the preserved `RESOLVED:` line collides with the gate that reads it

Verified at the declared citation baseline `9486c81`:

- `parseResolvedMarker(fileText)` (`pdlc/workflows/orchestrate-dev.js:953`) pushes **every** unfenced
  line matching `/^\s*RESOLVED:\s*(\S*)\s*$/` into `values`, then: `values.length === 0` ⇒
  `{ok: false, reason: "absent"}`; **`values.length > 1` ⇒ `{ok: false, reason: "duplicated"}`**
  (`:961`); otherwise `yes`/`no`.
- Its JSDoc (`:939-947`) states the marker is "positionally unconstrained — a `RESOLVED:` line
  **anywhere** outside a fenced region counts".
- `checkPostmortem` (`:2440`) reads the file, and returns `{status: "resolved"}` when
  `marker.ok && marker.resolved` (`:2446`), `{status: "unresolved", …}` otherwise (`:2447`).
- The refusal is at step G (`:3895-3899`), which is the single point every phase-running exit converges
  on: `status === "unresolved"` ⇒ *"Phase {id} refused: unresolved POSTMORTEM …"*.

Now run AC-1.4's new rule against that. The post-mortem path is fixed, so a document that halts twice
has one file, and AC-1.4 requires the second halt's rewrite to preserve "every `RESOLVED:` line …
already in the file".

| State after halt #2 rewrote the file | `parseResolvedMarker` | `checkPostmortem` | Effect |
|---|---|---|---|
| exactly one preserved `RESOLVED: yes` (AC-1.4 obeyed literally) | `{ok: true, resolved: true}` | `resolved` | **step G does not refuse.** The halt has no durable effect: the phase re-runs on the next invocation as if nothing happened |
| the operator adds a second `RESOLVED: yes` to clear halt #2 (what AC-1.5(4)'s counting rule requires, and what O-10 asks for a test of) | `{ok: false, reason: "duplicated"}` | `unresolved` | **the phase can never be re-entered.** No edit to the region can ever produce `R > S` *and* a readable marker |

Those are the only two reachable states, and they are opposite failures — one fails open on the halt
this REQ's whole first AC is about, the other bricks the escape hatch. There is no third: the counting
rule *is* the requirement that the file accumulate one `RESOLVED:` per clearance, and the reader *is*
the function that rejects exactly that.

This is not a re-raise of G-04. G-04 said `WINDOW-START:` had no protection; v1.3 protected it by
making the region durable, which is correct. The new fact is that `RESOLVED:` was never a countable
datum — it is a **single-valued, human-owned, fail-closed marker** whose duplication is already an
error at HEAD — and AC-1.5(4) reinterprets it as a counter without amending the reader, while AC-1.4
guarantees the duplication.

**Required change.** Separate the two roles; do not overload `RESOLVED:`. The smallest version that
keeps every property v1.3 wanted:

1. keep AC-1.4's preservation obligation for `WINDOW-START:` and `HALT-REASON:` only, and require the
   halt path to **remove or supersede** any prior `RESOLVED:` line when it rewrites the file, so the
   new post-mortem is unresolved on arrival (fail-closed, and `parseResolvedMarker` still sees at most
   one line); **and**
2. restate one-shot over a datum that *may* repeat. `count(WINDOW-START:)` vs `count(RESET-GRANTED:)`,
   or — cheaper — pair each `WINDOW-START:` with the `HALT-REASON:` it cleared, so "has this clearance
   been spent?" is answered without counting a marker whose reader forbids repetition.

Either way, state explicitly that `parseResolvedMarker`'s duplicated-⇒-fail-closed behaviour
(`pdlc/workflows/orchestrate-dev.js:961`) is a constraint the mechanism must satisfy, and cite it —
N-4 currently claims the human-written `RESOLVED: yes` marker is "untouched", which v1.3 makes untrue.

### G-08 (Medium) — one candidate, or all of them?

AC-3.4's step 2 defines the candidate by a stopping scan:

> scans forward for the **candidate**: the first non-empty line that is **not an anchor line**.

Steps 4 and 5 quantify over a set:

> two or more parsing candidates ⇒ *malformed*; … exactly **one** parsing candidate ⇒ that is
> `blocking`'s source.

Under step 2 the set has cardinality ≤ 1, so "two or more" is unreachable and "exactly one" is
vacuous — but the clause was clearly written to preserve v1.2's "exactly one trailer per file; two or
more … is *malformed*", which is a *collecting* rule. The two readings differ on the input
`VERDICT:` → prose line → valid trailer: stopping yields *malformed*, collecting yields a readable
count. R-7 makes that input reachable during the transition, since a lagging SKILL writes whatever
prose it likes under `## Verdict`.

**Required change:** pick one and say it in step 2. Recommended: keep the stopping scan (it matches
`parseVerdict`'s "first non-empty line after `VERDICT:`" and is the cheaper reader), delete "two or
more parsing candidates ⇒ *malformed*" from step 4, and move the duplicate-trailer concern to where it
belongs — a second *parsing* trailer later in the section is not observed by a stopping reader and
therefore is not a case at all.

### G-09 (Medium) — the third failure mode

`extractFileVerdict` (`pdlc/workflows/orchestrate-dev.js:888`, verified at `9486c81`) scopes its scan
to the trailing `## Verdict` section, counts lines beginning `VERDICT: `, and returns
`{ok: false, reason: "duplicated"}` when `trailers > 1` (`:904`) — *before* `parseVerdict` ever runs.
So AC-2's operand can be `duplicated`, and this REQ classifies it nowhere: AC-3.4 step 1 presumes "its
**single** `VERDICT:` line" and enumerates only *absent*, and AC-2.7's table has no row for it.

That matters because AC-2.7's table is the operator-facing classifier and AC-2.3/AC-2.7 are the two
chain-breaking outcomes. A round whose file carries two `VERDICT:` lines is neither, so the run report
cell is underivable and — worse — an implementer reading only this REQ has no reason to keep the
existing fail-closed behaviour.

**Required change:** one row in AC-2.7's table (*"the `## Verdict` section carries two or more
`VERDICT:` lines ⇒ …"*) and one clause in AC-3.4 step 1. *Malformed* is the right answer: the quantity
was read and could not be resolved, which is exactly §5's definition, and it keeps the shipped
`duplicated` return mapped onto a chain break rather than onto silence.

### G-10 (Medium) — the unconsumed reset outlives the halt it was written for

AC-1.5(5)'s first row is the new rule:

> begins `no-revision:` (S-11) ⇒ the halt is cleared and the **interrupted window is resumed** — no
> `WINDOW-START:` is written, `W` is unchanged, and the reset is **not** consumed.

The intent is right — an authoring failure should not cost the operator's escape hatch. The
consequence is that `R > S` **stays true forever after**, because nothing else ever consumes it. Trace
it:

| Step | Region state | What the loop does |
|---|---|---|
| S-11 halt, operator writes `RESOLVED: yes` | R=1, S=0 | entry sees `R > S`, last reason `no-revision:` ⇒ resume, write nothing |
| the phase runs on and later halts at the fixed point (S-3) | R=1, S=0 | — |
| next invocation, **no operator action at all** | R=1, S=0 | entry sees `R > S`, last reason `fixed-point:` ⇒ clause 4 grants and consumes a **fresh three-round window** |

The convergence halt is cleared by a marker the operator wrote to clear a different, earlier halt.
One free window per S-11 event, unattended. That is precisely the "silently restores the budget
AC-1.1 exists to abolish" failure, arriving by a new route.

The root cause is that clause 4's `R > S` is a *global* predicate over the file while clause 5's
decision is *per halt*. A reset must be scoped to the halt it cleared.

**Required change:** make the S-11 path consume-and-restore rather than not-consume. Concretely: on an
S-11 clearance the loop writes a `WINDOW-START:` line **equal to the current `W`** — so `R = S` again
(one-shot holds), the origin is unchanged (the window resumes, which is the behaviour AC-1.5(5)
wants), and no free window survives. That requires relaxing AC-1.5(4)'s "strictly increasing ⇒ else
fail-closed" row to admit a repeat that equals its predecessor, which is a one-cell change and is
distinguishable from the corrupt case the row was written against. Alternatively, pair each
`RESOLVED:` with the `HALT-REASON:` it cleared and make the predicate per-pair — but that reopens
G-07's counting problem.

### G-11 (Medium) — which `HALT-REASON:` is last

AC-1.5(5) reads "the **last** `HALT-REASON:` line". AC-1.4 fixes the fate of the *prior* lines —
preserved verbatim, in document order, under a heading the halt path does not touch — and says the
halt "writes its own new content **around** that region". Nothing says where the halt's **own**
`HALT-REASON:` goes. If it is written above the preserved region (a natural reading of "around", and
the natural output of an agent told to write the standard sections first), the document-order-last
`HALT-REASON:` is the **previous** halt's, and clause 5 decides on the wrong halt — turning a
convergence halt into a resumed window or vice versa. Both directions are wrong and one of them
(reading an old `no-revision:` when the real halt was `budget-exhausted:`) declines to consume a reset
that should have been consumed, compounding G-10.

**Required change:** one sentence in AC-1.4 or AC-1.5(5): the halt's own `HALT-REASON:` line is
**appended to the end of the reset region**, so document order is halt order and "last" means "most
recent". Say it where the region is defined, since the region's ordering is what makes every counting
and last-value rule in AC-1.5 well defined.

### G-12 (Low) — two of the four "sourceless" cells have sources

AC-2.8 and AC-4.7 both justify the halt row's empty cells with "none of the five non-`round` columns
has a source". For `panel-shape` and `blocking` that is true — they are derived from files round N
never wrote. For `growth-bytes` and `classification` it is not: AC-4.1 step 1 takes the round-open
read and computes `growth = bytes(t0) − DOC-BYTES(N−1)` **before** the dispatch, and AC-2.8's halt
condition is precisely `bytes(t0) = DOC-BYTES(N−1)`, so the growth is 0 and the classification is
`incremental` on every S-11 row, derivable with no round-N file in existence.

Leaving the cells empty is still the right presentation — "not run" is what happened, and a `0` there
invites the reader to think a round was measured. But the argument should be *"we choose not to report
a measurement for a round that never ran"*, not *"there is no source"*, and the choice exposes an
ordering question O-12 should carry: does AC-4.1 step 1 run before or after AC-2.8's test at
round-open? Nothing turns on it for correctness (the read is shared, per TE Q-06), but an implementer
needs to know whether a classification is computed and discarded or never computed.

## Questions

Q-07, Q-08 and Q-09 from v4 are **closed** by v1.3 (AC-2.2/AC-4.7, AC-2.8/AC-4.7, AC-4.1/§6
respectively) and are not restated. Three new, each the fastest route into the finding beside it.

| ID | Question |
|----|---------|
| Q-10 | After AC-1.4's preservation rule runs, how many `RESOLVED:` lines does the post-mortem carry, and what does `parseResolvedMarker` (`pdlc/workflows/orchestrate-dev.js:953`) return for that file? If the answer is "one, `yes`", the second halt does not refuse; if it is "two", the file is `duplicated` and the phase never runs again. Which was intended? (G-07) |
| Q-11 | On the input `VERDICT:` → a prose line → a valid count trailer, does AC-3.4's reader return *malformed* (step 2's stopping scan) or the count (steps 4–5's collecting scan)? (G-08) |
| Q-12 | After an S-11 halt is cleared under AC-1.5(5), what ever makes `R = S` again — and if nothing does, what stops the next fixed-point halt from consuming that same reset without any operator action? (G-10) |

## Positive Observations

- **Every open finding from round 4 is closed, and closed at the mechanism.** Three of the five (G-01,
  G-02, G-05) are closed exactly as recommended; G-03 is closed the better of the two ways I offered,
  with all four citations verifying; G-06 became R-9 plus a §9.3 binding row plus a fourth question on
  the calibration successor, which is more than a Low deserved. Round 4's four mechanical fixes are all
  applied.
- **TE F-01's growth-boundary fix is the most valuable change in v1.3, and it is mine to have missed.**
  v1.2 measured `DOC-BYTES(N) − DOC-BYTES(N−1)` and selected round **N+1's** panel from it. I reviewed
  that formula twice and read it as correct because it removed the circularity I had filed at F-01 —
  and it does, but it classifies the revision the *previous* panel already read, and it makes round 2
  permanently unclassifiable for want of a `DOC-BYTES(0)`, so the target-regime rows of AC-2.6 were
  unreachable in every run. AC-4.1's single round-open read, with the later endpoint live and only the
  earlier one durable, is the right shape: minimum durability, and the classified revision is the one
  the cold reader must actually read. AC-4.1's new round-1 paragraph (*"an absent measurement that was
  never owed is not an unmeasurable one"*) is the correct corollary.
- **The one-read-shared-by-AC-4.1-and-AC-2.8 constraint is stated in three places and carried into
  O-12.** Two ACs deriving different quantities from the same instant is the classic place a
  time-of-check race enters an otherwise pure design; naming the read as singular in §5, AC-2.8,
  AC-4.1 and the obligation is exactly the discipline that prevents it.
- **AC-4.7's precedence table now splits S-3 from S-4 and carries the co-occurrence in the row that
  needs it**, and the new "S-11 never co-occurs" paragraph derives that from *when* each halt is
  decided rather than asserting it. Deriving the exclusion rather than declaring it is what makes the
  table checkable.
- **AC-2.7's row 4 restated as "nothing but anchor lines" is the right shape of the G-05 fix** — the
  table now classifies outputs of the algorithm rather than competing with it — and giving the anchor
  set **by reference** to §5's catalogue, "enumerated nowhere else, so it has exactly one membership",
  is the general form of the lesson, not the local patch. That sentence is worth harvesting.
- **§10.8 exists and is honest about the shape of round 4** — first round with no carried finding,
  every finding in text v1.2 added. A revision note that says which of its own predecessors' text was
  wrong is much cheaper to re-review than one that only says what is now true.
- **The `sha256Hex` / `canonicaliseForDigest` / `approvalHashOf` citations all verify at `9486c81`**
  (`:848`, `:767`, JSDoc `:752-759`, `:950`), including the JSDoc quotation, which is reproduced
  accurately. Citation discipline continues to hold under revision.

## Mechanical fixes

Not findings. Apply without discussion; none affects the recommendation.

| id | Where | Fix |
|---|---|---|
| MF-1 | AC-1.4's new paragraph, and O-9(d) | The post-mortem prompt is cited as `pdlc/workflows/orchestrate-dev.js:1912-1918`, `writePostmortem`. Both halves are wrong at the declared citation baseline. At `9486c81` that prompt is at **`:1723-1730`**, and its enclosing symbol is **`reviewLoop`** — there is **no `writePostmortem` symbol** in the file at `9486c81` or at this branch's HEAD. `:1912-1918` is the range at *this branch's HEAD*, where the same literal sits after ~190 lines of drift; at `9486c81`, `:1912-1918` is `approvalAnchorPreCount`'s JSDoc. The distinctive literal (*"Write docs/…/POSTMORTEM-…"*) is what saves the citation, exactly as the header's drift convention intends — but a fabricated enclosing symbol defeats that convention, so it is worth correcting in both places rather than only re-baselining the number. |
| MF-2 | §5, the `HALT-REASON:` paragraph | It says the line "is a **rendering** of the three strings above, not a twelfth catalogue member". Since it has a grammar, an emitter, a receiver (AC-1.5(5)) and a fail-closed receive side — all four columns of the catalogue — the distinction is doing no work and costs a reader one lookup. Either give it S-12 or say why a rendering with its own receiver is not a member. |
| MF-3 | AC-2.7, commentary under the table | "The fourth row is new in v1.2 and is the operator-facing half of AC-3.4's placement rule; v1.3 restates it…" — the row is now the fourth of *five* in a table whose rows shifted, and it is no longer new. Restate as "the anchors-only row". |
| MF-4 | §10.7, TE F-04 row | "a precedence table (six rows in v1.2, seven since v1.3 split S-3 from S-4 — §10.8)" — correct, but §10.7 is the round-2/3 map and now carries a v1.3 parenthetical. Consider a convention: earlier maps are frozen and later changes are recorded only in the latest §10.x, or the maps accrete edits every round. |
| MF-5 | O-10 | The v1.3 additions are a single ~700-byte sentence carrying eight distinct test obligations. It is derivable but not scannable; a bulleted sub-list would cost nothing and PROPERTIES has to enumerate them individually anyway. |

## Recommendation

## Verdict
