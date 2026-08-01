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

## Questions

## Positive Observations

## Recommendation

## Verdict
