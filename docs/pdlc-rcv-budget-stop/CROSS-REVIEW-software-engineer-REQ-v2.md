# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.2, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 2
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. Baseline reviewed at v1 was the REQ as of `624054c`; this review
covers `624054c..fa83925` on that file. Sections unchanged since v1 were not re-litigated.

## 1. Disposition of the v1 findings

All nine v1 findings are **closed**. Each was checked against the revised text, not against the
commit message that claims it.

| v1 id | Sev | Status | Where it closed, and what was checked |
|---|---|---|---|
| **F-01** | High | ✅ closed | AC-1.5(4) now carries *"The answering line is written, and confirmed, before the window opens"*: the loop re-reads the file, confirms the line is present **in the region, at the end, before any round of that entry is dispatched**, and on failure takes a named fail-closed exit (no window, `W` keeps its prior value, no dispatch, phase refused on step 4's path). The obligation is in §8 as **O-12**, the granting-path counterpart to O-5. The "mints no new S-16 reason" clause is the right call — the enum is closed at three in catalogue §2 and an unconfirmable write is a loop IO fault, not a region state. The *"Consequence an operator will meet"* paragraph additionally pins the write-first ordering and its justification, which is what makes the one-shot property hold in both directions. |
| **F-02** | High | ✅ closed | AC-1.5(4) step 4 now states the placement outright — **after** `phaseGate`'s `{ skip: true }` exit, before any round opens — and O-6 restates it. I re-verified the skip exit at HEAD: `freshness === "FRESH"` → `checkPostmortem` *for reporting only* → `recordPhase(phaseId, label, "⏭", …)` → `return { skip: true }` (`pdlc/workflows/orchestrate-dev.js:4211`–`:4226`). The cost analysis now enumerates **three** entry classes (skipped / exhausted / mid-window) rather than two, and the skipped row is argued rather than asserted: no round to gain, no clearance to spend. |
| **F-03** | Medium | ✅ closed *(with a residue — F-01, F-02 below)* | AC-1.5(4) now fixes the ❌ row as `Refused — reset region corrupt at {path} ({reason})`, states that `postmortemStatus` is **not** `unresolved`, and replaces the shipped generic recovery line with one naming the sanctioned repair. §6 declares both as operator-facing renders of S-16 that are explicitly **not** catalogue ids. The decision I asked for was made. The two new findings below are about *anchoring* that decision, not about reopening it. |
| **F-04** | Medium | ✅ closed | AC-1.2 gained *"What changes at `windowEnd` and what does not"*: `W` is resolved **before** `deriveRoundWindow` and passed as an ordinary resolved decimal integer, so the function keeps its documented *synchronous, total, takes no seam* contract; the async `_readFile` lives in the caller; **"Any FSPEC or TSPEC that gives either function a seam violates this clause."** O-12 carries the obligation. That is exactly the shape I asked for and it preserves the invariant `CLAUDE.md` documents as load-bearing. |
| **F-05** | Medium | ✅ closed | AC-1.5(1) now carries *"`forcePhases` does not grant a window; the clearance is the only route past the cap"*, states the resulting behaviour cell by cell (no rounds, budget halt, post-mortem, row C, queue row `halted`, a second force changes nothing at `A = H`), names it a deliberate change to a documented operator entry point, and gives it an oracle in O-10 (*"a **forced** phase on an exhausted document halting rather than re-reviewing"*). |
| **F-06** | Medium | ✅ closed | AC-1.4 gained *"The scope of 'every halt'"*, quantifying the rule over **halts that write `POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase**, explicitly excluding creator-agent failure, the branch guard, listing failure, Phase PUB/CI and Phase DOD (none of which writes a post-mortem at HEAD, and N-4 forbids making them), and restating §4.1's `H` sentence to match. The pairing argument survives the narrowing, as I expected it would. |
| **F-07** | Medium | ✅ closed | AC-1.3 now states that `iterations` is the **budget** (matching the shipped site at `orchestrate-dev.js:1984`, `iterations: MAX_REVIEW_ROUNDS`) and that the post-mortem's Iterations section **additionally** states the rounds this entry ran — `0` on the zero-round halt — so the two are never conflated where the operator reads them. O-10 asserts both **over the constant**. |
| **F-08** | Low | ✅ closed | Both sites now read *"reached its minimum at round 2, **held it at round 3**, and rose thereafter (11, 6, 6, 7, 9)"* (§1 bullet 2; §5 REQ-RCV-01 preamble). Note for the family, not for this REQ: `docs/_constraints/pdlc-rcv-baseline.md` §3's `MAX_REVIEW_ROUNDS` Derivation cell still carries the uncorrected *"minimum at round 2 and rose thereafter"*. Not filed — it is that document's row, not this one's. |
| **F-09** | Low | ✅ closed | §9 **R-13** names the migration case, gives the render an operator will meet (`rounds 1..3 of 3` with five rounds on disk), calls it correct-and-expected rather than a defect, and confirms the escape is the ordinary clearance. No migration script, no back-fill — the right disposition. |

## 2. Disposition of the v1 questions

| v1 id | Answered where | Adequate? |
|---|---|---|
| **Q-01** (skip placement) | AC-1.5(4) step 4, O-6 | Yes — see F-02 above. The REQ picked one and justified it. |
| **Q-02** (unbounded S-11 repetition) | §9 **R-12** | Yes. Accepted, bounded by the operator rather than the loop, with the argument stated (every iteration costs one hand-written `RESOLVED: yes`, so it is never unattended) and a revisit trigger. I agree with the disposition. |
| **Q-03** (grant that dies before dispatching) | AC-1.5(4), *"Consequence an operator will meet"* | Yes, and it is now load-bearing rather than incidental: it is the reason the answering line is written first. |
| **Q-04** (durability between dispatch and re-apply) | **O-5**, final sentence | Yes. Both crash outcomes land fail-closed (`W` = 1, or S-16 plus a sanctioned repair), `H` understating the halts by at most the lost lines, recovery is the next halt re-creating the region. |
| **Q-05** (unreadable-but-present post-mortem) | §4.1, row *"That the post-mortem is readable at all"* | Yes. `checkPostmortem` reads it as `status: "none"` (M-7a) ⇒ empty region ⇒ `H = A = 0`, `W = 1`; named as the conservative direction, with the halt-gate half left as the shipped reader's under N-4. |

## 3. Findings

Scanned the changed sections only. **No High finding.** Two Medium, both on the same seam — the two
new operator-facing strings the v1 F-03 fix minted are declared but neither *registered* nor
*testable*, so the fix as it stands cannot fail.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The two new operator-facing strings have no PROPERTIES obligation, so the fix to v1 F-03 is unfalsifiable — an implementation that emits the shipped misleading strings passes every oracle this REQ states.** §6 declares two renders this REQ owns: the ❌ phase-row text `Refused — reset region corrupt at {path} ({reason})`, and a recovery text that *"names the sanctioned repair for `{reason}`"*. Neither appears in **O-10**. O-10's nearest clauses are about a different surface: *"**row B** asserted character for character"* is the **run-report row** (`round`, `panel-shape`, `blocking`, `growth-bytes`, `classification`, `notice` — catalogue §3), and *"the counts-mismatch refusal and its **recovery leg**"* means the repair-then-proceed leg, not the recovery *string*. The ❌ row is `recordPhase`'s detail argument and the recovery text is the halt reason carried to the run report — two surfaces no stated property touches. Concretely: an implementation that reuses step G's shipped `Refused — unresolved POSTMORTEM at ${gate.path}` (`orchestrate-dev.js:4246`) and the shipped `Recover: set the ${featureName} row in docs/_queue/QUEUE.md back to pending, then re-run the queue` (`:4926`) satisfies row B, satisfies the queue-row-`halted` leg, satisfies the byte-unchanged leg, and satisfies the ratchet test — while telling the operator both of the two things §6 exists to stop it saying, including the one that reproduces the refusal on every queue iteration. Required: one O-10 clause asserting both strings, and the same for `postmortemStatus` (see F-04). | §6 rows *Refusal phase-row text* / *Refusal recovery text*; O-10 |
| F-02 | Medium | Cross-Feature | **§6 declares three rows against a shared table that does not contain them, and its own preamble makes that a defect.** §6 opens *"The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. This REQ **owns** six of its rows and reads two more … a threshold used here and absent there is a defect."* Baseline §3 does own exactly six RCV-01 rows — `MAX_REVIEW_ROUNDS`, `## Reset Region`, `HALT-REASON:`, `WINDOW-START:`, `WINDOW-RESUMED:`, `reset-region-corrupt:` — so the count is right. But §6's table then lists **nine** rows marked `owned`. The three extra — `budget-exhausted: …` and the two refusal-text rows — are in baseline §3 **nowhere**, and baseline §3's own preamble is the stronger of the two rules: *"A threshold used by a child REQ and not in this table … is a defect."* The two refusal-text rows are the material case: they are genuinely new configured operator-facing values, owned by this REQ, registered in neither shared file (§4 already says they are not catalogue ids), and therefore invisible to any family-level consistency check — the same nonexistent-authority shape that has shipped repeatedly in this lineage. Resolve by either amending baseline §3 with the two rows, or stating in §6 that renders fixed in catalogue §2 and non-catalogue operator strings are deliberately outside baseline §3's scope. Do not leave the preamble asserting a rule the table below it breaks. | §6 preamble and rows 7–9 |
| F-03 | Low | Local | **§4's count sentence contradicts the table directly beneath it.** §4 says *"This REQ **owns** five catalogue ids and **reads** three"*; the table marks **six** owned (S-12, S-13, S-14, S-15, S-16, **S-4**) and **two** read-only (S-11, S-3). S-4 was moved from read to owned — correctly, catalogue §2's S-4 row assigns it to budget-stop — and the prose was not updated. Same mechanically-checkable class as v1 F-08, and §4's ownership claim is exactly what a reviewer of the *catalogue* will check this document against. Fix: "owns six catalogue ids and reads two". | §4 preamble |
| F-04 | Low | Local | **`postmortemStatus` is specified only negatively on the refusal path.** AC-1.5(4) and §6 both say it is *"not `unresolved`"* and stop there. It is a machine-readable field of the final report (`CLAUDE.md`, Phase PUB / post-mortem lifecycle), and the REQ was otherwise careful to pin what this path emits. Leaving the positive value to FSPEC on a field whose *negative* the REQ felt obliged to state is an asymmetry, and `resolved` vs. absent are observably different to anything consuming the report. One clause: it reads `resolved` (which is true — the operator did clear it), or it is not set. | AC-1.5(4) fourth bullet; §6 *Refusal phase-row text* |
| F-05 | Low | Local | **AC-1.2's "one arithmetic site" is true only because every production caller passes `endIndex` explicitly; the dormant defaults still compute the pre-`W` window.** `reviewLoop`'s parameter default is `endIndex = windowEnd(startIndex)` (`orchestrate-dev.js:1830`) and `checkConverged` falls back to `windowEnd(first)` (`:1772`). I checked all seven production call sites (`:4386`, `:4424`, `:4467`, `:4520`, `:4561`, `:4599`, `:4721`) — every one passes `endIndex: {phase}Window.endIndex`, so neither default fires today. But once `deriveRoundWindow` computes `windowEnd(W)`, those two defaults compute a **different, wider** window whenever `W ≠ startIndex` — i.e. after every reset (`W = 4`, `startIndex = 5` ⇒ derived 6, default 7). They are a live trap for exactly the maintainer AC-1.2 addresses. One sentence in AC-1.2 — `windowEnd`'s sole argument in production is `W`, and any remaining `windowEnd(startIndex)` default must be removed or made unreachable — closes it. | AC-1.2, *"What changes at `windowEnd`"* |
| F-06 | Low | Process | **The document has 548 bytes of headroom against the ceiling it argues from.** 497 lines / **60,892 bytes**, against `check-req-size.sh`'s 700-line / 61,440-byte (60 KiB) hard ceiling — 99.1% of the byte budget. §10's own argument is that v1.0 at 83 KB was *"beyond what the loop converges on"*, and this REQ is the family's head, so it will be revised again by this very review. Any addition larger than ~half a table row breaches. This is not a defect in the document's content; it is a note that the next revision must be a **net-neutral or shrinking** edit (F-01 and F-03 are both cheap; F-02 is one sentence either way), and that a further split is the only remaining lever if it is not. | whole document; §10 |

## 4. Questions

| ID | Question |
|----|---------|
| Q-01 | AC-1.5(4) step 2 validates a `WINDOW-START:` value against *"one past the highest round on the branch"*, and AC-1.2 requires `W` to be resolved **before** `deriveRoundWindow` is called. So the resolver needs the doc-type-scoped highest-round derivation that today lives *inside* `deriveRoundWindow` (`result.docType !== docType` ⇒ `continue`, then `Math.max(...indices) + 1`, `orchestrate-dev.js:2407`, `:2431`). That means the filter is either factored out and shared, or re-implemented in the resolver — and a re-implementation that drifts from `parseReviewFilename`'s round-1 spelling rules would validate against a different listing than the loop windows over. O-12 covers how `W` reaches `deriveRoundWindow`; should it also cover the reverse direction — that the resolver reads the *same* doc-type-scoped derivation, not a second one? No REQ change needed if the answer is "O-12 already implies it"; I would rather it were said. |
| Q-02 | The order of two checks inside step 4 is not stated, and it is observable. Step 2 validates values against *"one past the highest round on the branch"*; step 3 validates the counts. Consider a region with `H = 2`, `A = 1`, a `WINDOW-START: 99` on a branch at highest round 2, and a hand-deleted `HALT-REASON:` making `H − A = 2`. Both a value fault (`invalid-window-start`) and a counts fault hold. Step 4 says `{reason}` is *"the **first failing line** in document order, and `counts-mismatch` only when every line passes step 2"* — which does settle it in favour of the value reason. I read that as deliberate and correct (the value reason has the non-destructive repair). Confirming: is a region with **both** faults always reported as the value reason, so the operator performs the in-place correction, is refused again on the surviving counts fault, and only then performs the destructive whole-section deletion? That is two operator round-trips, which seems right but is worth being intended. |
| Q-03 | AC-1.5(4)'s skip analysis says that on a `{ skip: true }` exit *"`W` is not resolved, no answering line is written, no refusal is raised"*. A phase can be approved-and-fresh **while** its post-mortem still carries an unconsumed clearance and a corrupt region — harvest has not run, so the file is still there, and the shipped skip path already surfaces `pm.status === "unresolved"` into the ⏭ detail string for reporting only (`orchestrate-dev.js:4221`–`:4224`). On a step-4-corrupt region the skip path reports nothing at all. Is a *reporting-only* notice on the skip path worth having (the operator learns the region is corrupt on the first invocation after approval rather than on the next halt), or is deliberate silence there part of "a skipped phase reviews nothing"? I lean to the latter and am not filing it; I want the choice recorded. |

## 5. Positive Observations

- **Every v1 finding closed on its merits, and two of them closed better than I asked.** F-01 was
  asked to state a confirmation; the answer states the confirmation, the fail-closed exit, *and* the
  write-first ordering with the derivation of why writing last would be wrong — which subsumes Q-03
  and turns a hole into a stated invariant. F-02 was asked to pick a placement; the answer picks one,
  justifies it as fail-closed-not-costless, and enumerates all three entry classes with the cost of
  each. Neither is the minimum edit that would have made the finding go away.
- **The refusal's cost is now stated as a positive control with a named synthetic fixture.** The
  mid-window branch is identified as the only branch on which honouring step 4 and falling back are
  distinguishable, is bound to O-10, *and* is flagged as **hand-built** until the successor ships
  (X-05) rather than being quietly asserted as reachable. That is the honest version of a claim most
  documents would have left ambiguous, and §3.1's *fully determined* vs. *reachable in production*
  distinction is the right way to say it.
- **AC-1.2's seam clause is stated as a prohibition on downstream documents, not as an aspiration.**
  *"Any FSPEC or TSPEC that gives either function a seam violates this clause"* is enforceable text.
  It preserves the `deriveRoundWindow` contract `CLAUDE.md` documents as load-bearing while still
  letting `W` reach the arithmetic, which is the narrow path between the two options I flagged.
- **`forcePhases` was resolved in the direction that costs the REQ something.** The easy answer was
  to let a force grant a window; instead the REQ states that it does not, accepts that this makes a
  documented operator entry point weaker after round 3, says so explicitly, and gives it an oracle.
  A REQ that names the cost of its own decision is reviewable; one that omits it is not.
- **The two count errors (F-03) are the only mechanically-checkable defects I found in the changed
  text.** I re-verified the code citations the revision added — the `phaseGate` skip exit at
  `orchestrate-dev.js:4211`–`:4226`, Phase CR's `docType: null` at `:4721`–`:4724`, and AC-1.1's
  chain of reasoning that `docType: null` ⇒ no basename matches ⇒ `startIndex = 1` ⇒ a second CR
  clearance fails step 2's strictly-increasing check (confirmed: `if (result.docType !== docType)
  continue;` at `:2407`, `startIndex = indices.length ? Math.max(...indices) + 1 : 1` at `:2431`).
  All resolve. The N-7 exclusion is now argued from a real failure mode rather than asserted.

## 6. Recommendation

**Needs revision**

No High finding remains. Both v1 Highs are closed, and closed properly. What is left is two Medium
findings that are, in substance, **one gap wearing two hats**: the v1 F-03 fix minted two new
operator-facing strings, and neither was registered in the family's shared threshold table (F-02)
nor given a PROPERTIES oracle (F-01). Either omission alone would be survivable; together they mean
the fix cannot fail — an implementation that keeps the shipped, actively misleading strings passes
every leg O-10 states, and no family-level consistency check would notice.

What must change, in the order I would do it:

1. **F-01** — add one O-10 clause asserting the ❌ phase-row text and the recovery text on a step-4
   refusal, alongside `postmortemStatus` (F-04). This is the load-bearing one: the recovery string
   is the difference between an operator who repairs the region and one who resets the queue row to
   `pending` and reproduces the refusal on every iteration.
2. **F-02** — reconcile §6's preamble with §6's table. One sentence either way: register the two
   refusal-text rows in `docs/_constraints/pdlc-rcv-baseline.md` §3, or state that catalogue-§2
   renders and non-catalogue operator strings sit outside baseline §3's scope. Leave the preamble
   asserting a rule its own table breaks and the next reviewer files this again.
3. **F-03**, **F-04**, **F-05** — three sentences, no design content.

**F-06 is a constraint on how you make those edits, not a finding against the content:** the
document is at 60,892 of 61,440 bytes. F-01 and F-03 are cheap, F-02 is one sentence, F-04 and F-05
are one clause each. If the revision cannot land inside the ceiling, prefer trimming a justification
paragraph over dropping a criterion — §4.1 and §10 both contain prose that could shrink without
losing an obligation.

Nothing in this round contests the mechanism. The window, the anchored one-shot clearance, the
ordered receive-side algorithm and its fail-closed defaults are, after one revision, stated at a
level of precision where the remaining work is registration and oracles rather than design. That is
the right place for a REQ to be at the end of round 2.

## Verdict

Both v1 High findings are closed. Two Medium findings are open, both on the anchoring of the two new
operator-facing strings — no PROPERTIES oracle, and no row in the shared threshold table §6 cites as
their authority. Four Low findings accompany them. Per the approval rule, an open Medium means the
document is not yet approved.

VERDICT: Needs revision
