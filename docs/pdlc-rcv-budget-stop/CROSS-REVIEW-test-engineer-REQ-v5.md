# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.5, 502 lines / 61,437 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v4 finding is closed, plus a scan of the text added or rewritten since v4 for new issues. Sections unchanged since v1…v4 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `bdf893e..fc3410e` (4 commits touching the REQ)
**Date:** 2026-08-01
**Iteration:** 5

## Disposition of v4 findings

All five are **closed**, and two of them (F-22, F-24) by taking the harder of the two options I
offered rather than the cheaper one. Every citation the changed text carries was re-checked against
HEAD, line by line.

| v4 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-22 | High | **Closed** | The option taken is *name `written` and state the mechanism*, which is the one the shipped code produces unaided. AC-1.5(4) now reads *"`postmortemStatus` reads **`written`** on **both** row-B variants, and by a named mechanism: the refusal sets no `gatePostmortem` and attaches none to its thrown halt, so the halt catch's third branch (`orchestrate-dev.js:4890`–`:4901`) probes `POSTMORTEM-{haltPhase}-{feature}.md`, the file this refusal is *about*, which exists by the path's premise."* I re-derived the whole chain at HEAD: `haltPhase` is `failedRow.phase` (`:4870`–`:4871`) and `recordPhase` stores `phase: phaseId` (`:4105`–`:4106`), so `haltPhase` is the phase **id** — the same token every post-mortem path is built from (`:1767`, `:1935`, `:2696`, `:4891`), so the candidate path resolves to the file the refusal read. Branch 1 is false (no `gatePostmortem`), branch 2 is false (nothing attached to the thrown error — now an explicit obligation of the REQ, not an accident), branch 3 runs, `confirmation.ok` holds, `postmortemStatus = "written"` (`:4899`). Both v4 citations are gone; the two that replaced them are the deciding lines. The clause also survives the extension to the **unconfirmable-append** variant, which I checked separately: that path likewise fires only on a readable post-mortem carrying `RESOLVED: yes`, so the probe finds the same file. The honesty objection is met head-on rather than waved at — *"That is the probe's sense — *this phase has a post-mortem* — not a claim this run wrote one, which the ❌ text carries."* |
| F-23 | Medium | **Closed** | Dissolved by F-22's answer, and then *asserted* rather than left implicit — which is more than I asked for. AC-1.5(4): *"`none` is **rejected, not merely unreachable**: `:4922` emits `No POSTMORTEM was written.` on `none` alone, beside a ❌ row naming the post-mortem the operator hand-resolved; O-10 asserts that line **absent**."* Verified at HEAD: `:4922` is `if (postmortemStatus === "none") {`, guarding the emit on the next line — the guard, not a comment, and the line that makes the emit conditional. §6's *Refusal phase-row text* row carries the same statement (*"so the shipped `No POSTMORTEM was written.` line (`orchestrate-dev.js:4922`) does **not** appear beside this row"*) and O-10 now carries the leg (*"the shipped `No POSTMORTEM was written.` line asserted **absent** from the report"*). Expected-or-forbidden is now decided, in the direction that makes the report true. |
| F-24 | Medium | **Closed** | The Q-04 route, which is the one that removes text. The confirmation is now *"a **byte comparison, not a presence check**: the loop re-reads the file, re-runs steps 1–3 on the region, and requires it to end with the answering line **exactly as written**"*, and the outcome enumeration collapses from three to **two** — *"the line landed whole and confirms ⇒ `A = H` … **anything else** — nothing landed, a truncated key or value, a lost newline — fails the confirmation ⇒ this refusal, on the entry that wrote it."* The sub-case I derived is named explicitly rather than absorbed (*"The tear that would otherwise be **silent** is one inside the *value* … well-formed, so it validates, balances the counts and moves the origin **down** — spending the clearance on a window the operator never bought"*), O-12 carries the byte comparison to the TSPEC, and O-10's leg is now the parameterised property I said the clause invited: *"its **torn-write legs**, parameterised over the truncation offset: every offset — inside the key, inside the value, newline lost — fails the byte confirmation and refuses on **this** entry, the well-formed `WINDOW-START: 1` case included, and no offset opens a round."* An author who parameterises the offset now writes a property the implementation can satisfy. What the round did **not** settle is the state the refusal leaves behind on that one offset — see **F-27**, which is a residue of this fix, not a re-opening of it. |
| F-25 | Low | **Closed** | The string is pinned to its shipped bytes, once, with the disambiguating citation: *"pinned as the shipped bytes, prefix and terminator included: `Recover: set the {feature} row in docs/_queue/QUEUE.md back to pending, then re-run the queue.` (`orchestrate-dev.js:4928` — not `:1795`'s different recovery string)"*. Both verified at HEAD verbatim, including the `Recover: ` prefix and the terminating period, and `:1795` is indeed a different string. The three redundant quotations are gone: §6's two rows and O-10 now refer to *"AC-1.5(4)'s pinned bytes"* / *"the pinned queue-reset string"* rather than re-quoting, so there is exactly one place the bytes are written down and both O-10 legs assert the same ones. |
| F-26 | Low | **Closed as filed, re-filed as F-28** | The document is inside both limits (502 of 700 lines, 61,437 of 61,440 bytes) and this round landed four behavioural changes at net **+114 bytes**, which is a real result for the content added. The constraint itself is not merely unchanged but tighter — **3 bytes** of headroom — so it is restated as F-28 rather than dropped, because it now governs how F-27 can be made. |

Q-04 is **answered** and closed — see the Questions section. Q-05 is carried unchanged for a fourth
round; it is still not load-bearing for any finding.

## Findings

Three, all in text added or rewritten since v4. **No High.** F-27 is the residue of F-24's fix — one
sub-case of the new two-outcome clause — and F-28/F-29 are one line each.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-27 | Medium | Local | **The byte comparison catches the silent value-tear on the entry that wrote it, but the refusal it raises tells the operator nothing about it and offers a recovery act that spends the clearance anyway — so the "unexplained budget halt later" the clause exists to prevent is still reachable, one entry later, by following the instruction the run report prints.** AC-1.5(4) now says of the value-tear (`WINDOW-START: 12` landing as `WINDOW-START: 1`): *"Comparing bytes is what makes it announce itself here rather than as an unexplained budget halt later; its residue is the operator's sanctioned in-place **correction**, like any other bad value."* Trace what the operator actually receives on that entry. The refusal is row B's **unconfirmable-append variant**, whose cells this REQ fixes exactly: `notice` **empty**, **no S-16**, no S-4; ❌ text `Refused — answering line unconfirmed at {path}` — no reason token, no repair named; recovery text the **shipped generic** *"set the `{feature}` row in `docs/_queue/QUEUE.md` back to pending, then re-run the queue."* Nothing in that report names the reset region, the torn line, or the correction. Now follow it: the torn line persists on disk — nothing removes it, and §6's *"Deleting a single answering line is forbidden at every `H − A`"* forbids removing it — so the next entry reads a region of one `HALT-REASON:` and one `WINDOW-START: 1`. Step 2 passes (`1` is a decimal ≥ 1, no earlier `WINDOW-START:` to be non-increasing against, and `1 ≤` the highest round reached), step 3 passes (`H − A = 0`), step 4 does not fire, step 5 gives `W = 1`. On the branch this whole mechanism is for — a document already past round 3 — that is an **immediate row-C budget halt with `budget-exhausted: rounds 1..3 of 3`**, on a document the operator just cleared, with the clearance gone and no S-16 anywhere in the run's history. That is the unexplained budget halt, and it is reached *through* the sanctioned recovery act, not by ignoring it. The justification the REQ gives four lines above for reusing the generic string is what breaks: *"the fault is transient, nothing is hand-repairable, and step 4 has already written that row `halted`, so resetting it is the whole repair"* — true for *nothing landed*, true for a tear leaving an *invalid* line (the next entry refuses loudly with S-16 and a named repair), and **false for exactly this offset**, where the fault is durable, something *is* hand-repairable, and resetting the row is not the repair. **The testability half is independent of the truth half and is the reason this is not a Low.** O-10's new leg asserts the unconfirmable-append class's recovery text is *"— deliberately, on this class alone — the shipped generic queue-reset string"*, and asserts the torn-write legs *"parameterised over the truncation offset: every offset … refuses on **this** entry"*. Composed, those two say the parameterised property asserts the generic recovery string on **every** offset — including the offset whose prose disposition is a hand correction the generic string does not mention. A property author has two incompatible readings of the same entry's report and no rule for choosing, and whichever they pin, the other reading is untested. Three ways out, in ascending cost: (i) state that the unconfirmable-append refusal's recovery text names **two** acts on this class — check the region's trailing answering line and correct it if it is present, *then* reset the row — and give O-10 the leg; (ii) let the refusal distinguish *nothing landed* from *something partial landed* (it re-read the region, so it knows) and give the second one its own recovery text; (iii) close it at the source by having the confirmation failure leave the region in a state the next entry must refuse — which conflicts with §6's deletion prohibition and is the expensive option. (i) is the cheapest and is one clause. Whichever is chosen, O-10 needs the **sequel** leg the v4 text had and this round dropped: after a value-tear refusal, the next entry's disposition asserted positively — because that entry is where the clearance is actually lost. | AC-1.5(4) *"Two outcomes, because the confirmation compares bytes"*, §5 row B, §6 *Unconfirmed-append text*, O-10 torn-write legs, `orchestrate-dev.js:4928` |
| F-28 | Low | Local | **Three bytes of headroom, carried from F-26.** 61,437 bytes against `pdlc/hooks/scripts/check-req-size.sh`'s `BYTE_LIMIT=61440` (`:41`); lines remain comfortable (502 of 700). Not a defect in the content — this round added a mechanism paragraph, an emit-suppression clause, a byte-comparison rule and two O-10 leg rewrites for **+114 bytes**, which is disciplined. Filed because it is now effectively **zero** slack and F-27's fix lands in exactly the three places that are already dense (AC-1.5(4), §6, O-10), so the fix has to be paired with a compression pass rather than appended. The remaining genuinely restated material I can still see: AC-1.5(4)'s *"Consequence:"* paragraph re-derives the write-line-first argument that the sentence above it already makes, and O-10 restates the mid-window fixture's provenance that AC-1.5(4) step 4, §3.1 and R-11 each state. | whole document, `pdlc/hooks/scripts/check-req-size.sh:40`–`:41` |
| F-29 | Low | Local | **A compression deletion left a dangling referent in §3.1.** The sentence *"`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`"* was removed, leaving *"…once the successor ships (AC-1.5(4) step 4, O-10). `pdlc-rcv-panel-topology` depends on both."* — where **"both"** now has no plural antecedent in its own sentence or the one before it. The meaning is recoverable (this REQ and the `pdlc-rcv-fixed-point-stop` named in the X-05 row above), and the dependency edge itself survives in §10 (*"the ordering argument (`W` before AC-2.1/AC-2.8/AC-2.6) kept as a `depends-on` edge"*), so no obligation was lost and nothing untestable was introduced — this is a readability residue, not a content one. Flagged only so the next compression pass does not read it as intentional. **Do not spend bytes on it** unless the F-28 pass frees some; *"depends on both of these"* → *"depends on this REQ and its successor"* is +9 bytes. | §3.1 *Consequence for sequencing*, §10 |

## Questions

Q-04 is answered and closed after three rounds of carrying. Q-05 is carried unchanged for a fourth
and remains genuinely optional — no finding depends on it.

| ID | Question |
|----|---------|
| Q-04 | **Answered.** v1.5 chooses the validating form: *"a **byte comparison, not a presence check**: the loop re-reads the file, re-runs steps 1–3 on the region, and requires it to end with the answering line **exactly as written**"*, carried to the TSPEC by O-12 (*"re-read and confirm it **by byte comparison against what was written**, re-running steps 1–3"*). That is the answer that collapses the outcome enumeration to two and closes the silent well-formed truncation on the writing entry. F-27 is what is left over: the answer is right about *detection* and the round did not follow it through to *what the operator is then told*. |
| Q-05 | *(carried from v2, v3 and v4, unanswered)* Can a single entry both **grant** and **halt** — grant `W` = `N`, then take some other halt path before round `N` opens? If so, `H − A` still lands in {0, 1}, but the **order** of the appended `WINDOW-START:` and `HALT-REASON:` lines decides step 2's `WINDOW-RESUMED:` check on the following entry, and the document fixes the order only for lines written by *different* entries. The new byte comparison narrows this rather than answering it: the confirmation requires the region to **end** with the answering line, so a `HALT-REASON:` appended by the *same* entry must land strictly after the confirmation, never between the append and the re-read. Worth one clause in the TSPEC even if the REQ leaves it alone. |

## Positive Observations

- **Both Mediums were answered by taking the option that removes text, not the one that adds it.**
  F-24's cheapest fix was the Q-04 route and the author took it: the three-outcome enumeration
  becomes a two-outcome one, the sub-case I derived is named in a single clause rather than
  enumerated as a table, and O-12 carries the obligation onward. F-22's two options were "name
  `written`" and "state an implementation obligation"; the author took the first — the one that
  matches what the shipped code does unaided — and then spent the saved bytes on saying *why* the
  value is honest (*"That is the probe's sense — *this phase has a post-mortem* — not a claim this
  run wrote one, which the ❌ text carries"*). That sentence is the review's answer to the objection,
  not a restatement of the value.
- **F-23 was closed by asserting the negative, not by noting it was unreachable.** The natural fix
  once `postmortemStatus` reads `written` is to say nothing further — `:4922` simply does not fire.
  Instead AC-1.5(4) says *"`none` is **rejected, not merely unreachable**"* and O-10 gains a leg
  asserting `No POSTMORTEM was written.` **absent** from the report. That is the difference between
  a property that happens to hold and one an implementation cannot regress silently: an
  implementation that reverts to `none` fails a named leg rather than merely producing a slightly
  odd report.
- **O-10's torn-write leg is now a real property, and it names its own hardest case.** *"parameterised
  over the truncation offset: every offset — inside the key, inside the value, newline lost — fails
  the byte confirmation and refuses on **this** entry, the well-formed `WINDOW-START: 1` case
  included, and no offset opens a round."* v4 asked for a clause that a property-based author could
  satisfy; this is one, with the universally-quantified conjunct (*no offset opens a round*) that
  makes the parameterisation load-bearing rather than decorative. F-27 asks for its sequel, not for
  its retraction.
- **The dispatch oracle is now per-variant.** O-10's call-count leg reads *"exactly **0** dispatches
  on **each** refusing entry (both row-B variants)"* — previously one refusing entry stood for both.
  Since the two variants reach the refusal by different routes (validation failure at step 4 versus
  confirmation failure after a write), an implementation that opens a round on one of them is now
  caught by a leg rather than by luck.
- **Every citation in the changed text re-derived at HEAD, and all of them hold.** `:4890`–`:4901`
  is the third branch as described, `:4899` is the `written` assignment, `:4891` builds the candidate
  path; `haltPhase` = `failedRow.phase` (`:4870`–`:4871`) is the phase **id**, which is exactly the
  token every post-mortem path uses (`:1767`, `:1935`, `:2696`), so the probe cannot miss the file;
  `:4922` is the `none` guard; `:4928` is the shipped recovery string, byte-for-byte as quoted
  including prefix and terminator, and `:1795` is indeed a different one. The `:5035`/`:5054`
  citations v4 objected to are gone.
- **A deleted test sentence did not delete its coverage.** AC-1.2's *"Test: no `## Reset Region` is
  created by a CR or DOD halt"* was compressed away, but the leg survives verbatim in O-10 (*"a
  **Phase CR halt creating no `## Reset Region`**"*) and the AC now cites O-10 in its place. I
  checked each of this round's deletions the same way: the removals are restated justification
  (`R-13`'s escape narration, `R-10`'s residual restatement, `§10`'s cut-seam re-derivation, the
  *"self-healing on the second"* and *"absorbing"* asides) and one referent that should have stayed
  (F-29). No AC clause, no §5/§6 cell, no oracle leg and no citation was traded for room.

## Recommendation

**Needs revision**

All five v4 findings are closed, the High among them by naming the value the shipped code actually
produces and citing the branch that decides it, and the two Mediums by the options that *shorten* the
document. There is **no High this round**. What blocks approval is a single **Medium**, and it is the
tail of the fix that closed F-24 rather than a new area of the document.

1. **F-27 (Medium)** — the byte comparison detects the silent value-tear on the entry that wrote it,
   which is the right call and the reason F-24 is closed. But the refusal it raises is row B's
   unconfirmable-append variant, whose cells this REQ fixes as `notice` **empty**, **no S-16**, no
   reason token in the ❌ text, and the shipped generic *"set the row back to pending, then re-run the
   queue"* as its recovery text. On the value-tear offset that recovery act does not repair anything:
   the torn `WINDOW-START: 1` persists (§6 forbids deleting an answering line), the next entry reads
   a region that validates with `H − A = 0`, step 4 does not fire, `W` resolves to 1, and on the
   branch this mechanism exists for that is an immediate row-C `budget-exhausted: rounds 1..3 of 3`
   with the clearance gone and no S-16 anywhere. The "unexplained budget halt later" is reached
   *through* the sanctioned recovery, one entry later. The clause's own aside — *"its residue is the
   operator's sanctioned in-place correction"* — is the right disposition and is not on any
   operator-facing surface. Cheapest fix: name **two** acts in the unconfirmable-append recovery text
   (check and correct a partial trailing answering line, then reset the row), one clause.

   The testability half is what makes it a Medium rather than a Low, and it needs an answer even if
   the prose half were waved through: O-10 asserts the generic recovery string for the whole
   unconfirmable-append class *and* parameterises the torn-write legs over every truncation offset,
   so the property asserts one recovery text on an offset whose stated disposition is a different
   one. Pick the reading, and restore the **sequel** leg v4 had and this round dropped — after a
   value-tear refusal, what the *next* entry does, asserted positively. That entry is where the
   clearance is actually lost, and nothing currently tests it.

The two Lows are one line each and neither needs a byte spent on it unless the compression pass frees
one: three bytes of headroom against the 61,440 ceiling, which constrains where F-27 can land (F-28),
and a dangling *"depends on both"* left by a compression deletion in §3.1, whose dependency edge
survives intact in §10 (F-29).

**On room.** F-28 is the sharpest it has been — 3 bytes — and F-27's fix lands in AC-1.5(4), §6 and
O-10, the three densest surfaces. The pairing I would make: AC-1.5(4)'s *"Consequence:"* paragraph
re-derives the write-line-first argument the sentence above it already makes, and O-10 restates the
mid-window fixture's provenance that AC-1.5(4) step 4, §3.1 and R-11 each state independently.
Either buys the clause.

Explicitly **not** filed, per §8 and DC-09: fixtures, seams, test levels and oracle wiring — O-10 and
O-12 own them and, F-27's sequel leg aside, name the conjuncts that matter. Also not filed: anything
in §1, §2, §4, §5, §7 or §9, approved earlier and changed here only by the compression the
disposition table records; §6's rows beyond the two the closed findings touched; and the
`postmortemStatus` mechanism, which I re-derived from the shipped source and which is correct in
every branch, including its extension to the second row-B variant. Nothing in this review contests
user need, priority, phasing, the choice of three rounds, the reset-region design, or the decision to
confirm by byte comparison — which is the right call and closes a real fail-open.

## Verdict

VERDICT: Needs revision

{"high": 0, "medium": 1, "low": 2}
