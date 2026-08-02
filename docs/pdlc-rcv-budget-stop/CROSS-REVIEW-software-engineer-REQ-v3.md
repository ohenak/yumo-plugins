# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v3.0, 403 lines / 60,753 bytes)
**Date:** 2026-08-01
**Iteration:** 3 (delta re-review of v3.0 against the v2.9 I reviewed at v2; base commit `524dd2f`)
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Not product strategy, not test-pyramid choices, not fixture construction.

## Disposition of v2's findings

Both blockers are closed, and both Lows and all three Questions were answered as well. I checked each
against the changed bytes and against the two paired documents, not against the commit messages.

| v2 | Severity | Status | Evidence in v3.0 |
|---|---|---|---|
| F-01 | High | **Closed** | The refusal now has a named, in-force operator surface. AC-1.4's new *ordering and its report* paragraph fixes it as **row B's *unconfirmable-append* variant**, `notice` **empty**, catalogue §4's two-act recovery, and states why it waits on nothing: the render is the **catalogue's**, not `REQ-RCV-07`'s to ship. The paired edit is real and in this revision, both ends: `docs/_constraints/pdlc-rcv-catalogue.md` §4's ❌ cell now reads **`Refused — region line unconfirmed at {path}`** with the generalisation dated and its two sources named, act 1 generalised to *the unconfirmed region line — the answering line, or the halt's `HALT-REASON:`*; and `REQ-RCV-07` AC-7.6's *Given* now names `REQ-RCV-01` AC-1.4 as a third **source** (explicitly not a third variant) with its ❌ cell updated to match. §4, NB-3, §5's row-B paragraph and §10 all carry the same statement, and §10's "v2.9 carries no change to that edge" is amended to "**v3.0 does change that edge, and carries the change here**". That was exactly option (i) of the two I offered, taken whole. |
| F-02 | Medium | **Closed** | Both named relocations happened: the three-line v2.9/v2.8/v2.6 revision narrative is one line, §4.1's harvest paragraph is a cross-reference to NB-5, and NB-6, O-10, O-13 and §8's four/three-leg paragraphs were compressed or relocated to split §5.4 on top. Headroom went from **1 byte to 687** (60,753 of 61,440). Not comfortable — see F-03 — but the constraint no longer determines how a finding may be closed, which is what the finding was about. |
| F-03 | Low | **Closed** | AC-1.5(2) now reads "the later of the two, **never below `W`**"; the three words that invited a clamp are gone, and split §5.4 leg 4's `W = 4` / highest 6 / start 7 control is no longer contradicted by the AC that governs it. |
| F-04 | Low | **Closed** | NB-6 now says "HEAD's prompt and **HEAD's section list** (M-7e)" instead of enumerating the sections itself, so the claim about shipped code is carried by the fact id rather than restated. |
| Q-01 | — | **Answered** | The clause order is now declared — **3 → 1 → 2** — and the answer is the one that preserves `A ≤ H`: the strip runs last, so no `RESOLVED:` marker is spent against a halt that left no line. Split §5.4 leg (iii) asserts it as a test leg. The half of Q-01 the new paragraph does **not** reach is F-01 below. |
| Q-02 | — | **Answered** | O-5 now explicitly receives the halt path's *present-in-the-region* confirmation and the clause order, so the seam is no longer implicit in `REQ-RCV-07` O-12's exclusion. |
| Q-03 | — | **Answered** | O-13(a) now names the feasibility inline — `stripModuleSyntax` removes the `export ` prefix from a module-scope `const` — so TSPEC does not re-derive it. |

## Findings

One blocking, and it is inside the paragraph v3.0 added to close v2's F-01. Nothing in the unchanged
body is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The new clause order gives clauses 3 and 1 a confirmation obligation and a fail-closed disposition and gives clause 2 neither — and an unconfirmed strip is a *fail-open* that defeats the cap this REQ exists to impose.** The paragraph opens "each loop write confirmed before the next runs: **3 → 1 → 2**", then dispositions only two of the three: "An unconfirmed write of **3 or of 1** ends the entry there". Clause 2 is last, so "confirmed before the next runs" is vacuous for it, and no sentence anywhere in the document says what happens when the strip is attempted and does not land. Grep confirms it: the five other `strip` sites (AC-1.4 clause 2, §5.6's routing, AC-1.5(1)'s second-force paragraph, O-5, split §5.4 leg (iii)) all describe the strip **succeeding**. **Trace the fail-open.** Take a re-halt reached the ordinary way, `H = h`, `A = h`, the operator's `RESOLVED: yes` present. Clause 3 lands, clause 1 lands (`H = h+1`), clause 2's write fails. The file now carries `H = h+1`, `A = h`, **and a readable unfenced `RESOLVED: yes`**. On the next entry AC-1.5(4)'s three conjuncts are `A < H` ✅, marker readable ✅, region validates ✅ (and the third is not even in force before row 18, X-06) — so the loop appends an answering line and **grants a window the operator never cleared**. One marker, two windows; and because the marker is only ever removed by clause 2, a persistent write fault (permissions, read-only FS) re-grants on **every** subsequent halt — the cap is defeated for that document for as long as the fault lasts, silently. That directly contradicts the invariant O-10 asserts as a test leg — *one clearance granting **exactly one** window* — and it is the same class of terminal-and-silent failure the clause-1 confirmation was added to close, left open on the one clause of the three that was not given one. **It is not closable by cross-reference to O-5**, which is the obvious escape: O-5 owns *region* maintenance, and clause 2 states in terms that a `RESOLVED:` line is **never** a region line — "the two rules quantify over disjoint sets" — so O-5's "a region lost or unwritable is reported fail-closed" does not reach the strip. **Cheap fix, and REQ-altitude because it fixes an outcome, not a mechanism:** one clause in *the ordering and its report* saying either (a) the strip carries the same confirmation and the same fail-closed disposition, so an unconfirmed strip refuses through the same row B — in which case say what `H` and `A` are left at, since clause 1 has already landed and the halt **is** recorded, unlike the 3/1 cases; or (b) that the strip cannot be observed to fail independently because clauses 1 and 2 are one read-modify-write of the same file, in which case "each loop write confirmed before the next runs" over an explicit **three**-step order is the wrong statement of it and should say so. Split §5.4 leg (iii) then needs the matching leg or the matching sentence. | AC-1.4 *the ordering and its report*, AC-1.4 clause 2, O-5, split §5.4 leg (iii) |
| F-02 | Low | Cross-Feature | **The catalogue §4 paired edit generalised the ❌ text and act 1 but not the *Residue disposition* cell, which still reasons only about a torn answering line.** That cell is the one that explains *why* act 1 exists, and every example in it is a `WINDOW-START:` value-tear: "`WINDOW-START: 12` landing as `WINDOW-START: 1` validates on the next entry, balances the counts, moves the origin down". A torn **`HALT-REASON:`** line — now a second thing this row reports — has a different residue: it carries no origin, so nothing moves down; what it can do is leave a line that still parses as S-15, **over-counting `H`**, which makes `A < H` permanently true and hands the next readable marker a window per entry. Same direction as F-01, different cause. The REQ routes partial writes to `REQ-RCV-07` AC-7.5 via NB-3, so the *disposition* is deferred by design and I am not asking for it here; what is off is that a cell claiming to enumerate the residue of this row was left describing one of its two sources. One sentence in the catalogue cell, or an explicit "the `HALT-REASON:` tear's residue is AC-7.5's, act 1 is the same". | `docs/_constraints/pdlc-rcv-catalogue.md` §4 *Residue disposition*; REQ NB-3, AC-1.4 clause 1 |
| F-03 | Low | Cross-Feature | **Headroom is 687 bytes of 61,440 (98.9% full).** Real relief against v2's 1 byte, and I am keeping my v2 pre-commitment not to block on it again. Recording it because the family will keep paying it: F-01's fix is prose that must be *added*, and one more round at this fill rate returns the document to the state where the ceiling decides how a finding may be closed. The two mechanical targets left are the same shape as the ones just taken — AC-1.5(1)'s `forcePhases` paragraph restates M-7a's step-G refusal that §5.6 also carries, and R-14's residual (ii) restates the row-17/row-18 ordering that §3.1 states. Author's discretion; not a blocker, now or next round. | header line 25, AC-1.5(1), R-14 |

## Questions

| ID | Question |
|---|---|
| Q-01 | **On a creating halt, does clause 3 running before clause 1 ever place the Iterations heading below `## Reset Region`?** I worked it and I believe not — at clause 3 time the region does not exist yet, so the not-found path falls to "at the end of the file when there is none", and clause 1 then creates the region after it. That is the right order, but it holds *because* of the clause order, and clause 3's not-found rule is written as if the region's presence were the interesting case. One parenthetical ("on a creating halt the region does not yet exist, so the section lands at the end and clause 1 appends below it") would stop an implementer reading the two clauses in the order they are numbered and producing a file whose region is not last. Not a finding — the outcome is already determined. |
| Q-02 | **Is a torn `HALT-REASON:` line inside R-14's residual ledger?** R-14 registers two residuals time-boxed to row 18: the hand-edited-region fail-open, and row-17 `WINDOW-RESUMED:` lines landing in regions nothing validates. This REQ starts writing region lines at **row 10**, and NB-3 routes a torn one to `REQ-RCV-07` AC-7.5 — which ships at row 18. So there is an eight-row interval in which this REQ writes lines whose tear has no disposition, and R-14's "(ii) … *not* covered by that, since HEAD writes no region lines" is the argument that would apply to it too. Either it belongs in R-14 as residual (iii) or R-14 should say why it does not. I did not file it because the mechanism predates this round and I did not flag it at v2; it is cheap to settle while F-01's sentences are being written. |

## Positive Observations

- **The paired edge was carried in the same revision, at both ends, and I checked both ends rather than the claim.** `docs/_constraints/pdlc-rcv-catalogue.md` §4 and `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` AC-7.6 are both changed in this branch's working tree alongside the REQ, the generalisation is **dated and attributed** in the catalogue cell, and AC-7.6's *Given* distinguishes a third **source** from a third **variant** — which is the distinction that keeps the row's cell table from forking. §10's own "v2.9 carries no change to that edge" was amended rather than left standing. This is the first time in this document's history the paired-edge rule has been exercised for real, and it was exercised correctly.
- **The refusal's timing objection was answered with a mechanism, not a promise.** My v2 F-01(b) was that the refusal is live at row 10 while every render it could borrow ships at row 18. The answer — the ❌ text and the recovery are **catalogue §4's**, a shared constraint file readable at row 10, and only AC-1.5(4)'s *region validates* conjunct is X-06-gated — is correct and is the reason the objection dissolves rather than being deferred. NB-3's new "one exception, stated not deferred: its *condition* is here, its bytes are catalogue §4's" states the ownership split in one line and keeps §4's no-refusal-string rule true as written.
- **Q-01's ordering was answered in the direction that preserves the invariant.** `3 → 1 → 2`, with the strip last, is the only order of the three that makes "no `RESOLVED:` marker is ever spent against a halt that left no line" true by construction rather than by care. The accepted cost is stated explicitly and in the right direction — a creating halt whose append fails needs a second `RESOLVED: yes` — rather than being hidden. F-01 is about the *third* clause, not about this choice.
- **AC-1.4 clause 3's render is now a single target.** "§6's render is that **heading's own text**, `## ` followed by the render, replacing whatever the heading carried (M-1c): one line, not a heading plus a body line" removes the last ambiguity in O-10 leg (i)'s equality — under the previous wording an implementer could satisfy the heading anchor and write the render to a body line, and the oracle would have had two candidate targets. It is also idempotent under its own anchor rule, since the rewritten heading still begins `Iterations`.
- **The insertion rule got more total, not less.** "Immediately **above** `## Reset Region` wherever that section sits, or at the end of the file when there is none" is stronger than v2.9's "at the end of the file and above `## Reset Region` if that section is last" — it no longer depends on the region being last, which is a property no clause guarantees.
- **The relocations to split §5.4 and the new §5.7 are honest.** Every one carries the relocation stamp and the round, and I diffed the destinations: the property obligation, the four kept legs, the three added legs, the enumerated points and AC-1.2's three excluded site classes all arrive intact, with leg (iii) *widened* in the move and the widening declared in the stamp itself ("leg (iii) widened in the same revision to cover both halt-path writes, nothing else changed meaning in the move"). That is the right way to state a move that is not byte-neutral.
- **Blocking count is decreasing and the residue is churn, not plateau.** v1: 1 High + 4 Medium. v2: 1 High + 1 Medium. v3: 1 High. Every prior finding closed, all three prior Questions answered, and the one blocker is a hole in prose that did not exist before this round.

## Recommendation

**Needs revision** — one High (F-01), no Medium. Both v2 blockers, both v2 Lows and all three v2
Questions are closed.

**On my own v2 pre-commitment, because it applies and I want to be held to it.** I wrote that "a v3.0
doing these two things and nothing else clears my side". The author did both, in the order I asked
(relocate first), and took option (i) of the two I offered whole. F-01 is not a re-opening of either
item: it is a hole in the paragraph *written to close* v2's F-01, on the one clause of the three that
paragraph did not disposition. Had the ordering been stated for all three clauses, this review would
have been an approval. I would rather say that plainly than pretend the round was contested.

**Why F-01 is a blocker and not a Low.** The consequence is not cosmetic and it is not a missing
oracle. An unconfirmed strip leaves a **readable clearance the operator already spent**, and
AC-1.5(4)'s gate reads the marker plus `A < H` — both of which then hold — so the loop grants a window
nobody cleared, and re-grants on every subsequent halt while the fault lasts. That inverts the single
outcome this REQ exists to deliver (an absolute cap only an operator resets) and it does so silently:
no notice, no ❌ row, nothing in the run report. It is also the exact failure class the clause-1
confirmation was added for, so the document already agrees this class must be dispositioned; F-01 is
that the third clause was not included.

**Why it cannot be routed downstream.** §8's obligations "may not vary an outcome the ACs fix", and
here no AC fixes one — AC-1.4 clause 2 states the strip's *effect* and nothing about its failure, and
O-5 is explicitly scoped to region lines, which a `RESOLVED:` line is stated never to be. A TSPEC that
invented a disposition would be inventing an operator-visible outcome. So it is REQ-altitude, and it
is two sentences.

**Plateau or churn (§9's third bullet), stated rather than assumed.** **Churn.** Blocking count
5 → 2 → 1, every prior finding closed each round, and this round's single blocker is a consequence of
this round's edit. **My v2 escalation pre-commitment stands and is not triggered**: the count
decreased. I renew it in the same form — if a v3.1 addressing the item below does not close it, or if
the next round is non-decreasing, I will say so and recommend the operator halt by hand rather than
open a fifth.

**Exactly what must change — this is the whole list, and I pre-commit that a v3.1 doing this one thing
and nothing else clears my side:**

1. **F-01:** in AC-1.4's *the ordering and its report*, disposition **clause 2**. Either give the strip
   the same confirmation obligation and the same fail-closed refusal — and say what `H` and `A` are
   left at, since unlike clauses 3 and 1 the halt **is** recorded by then — or state that clauses 1 and
   2 are one read-modify-write and cannot fail independently, and reword "each loop write confirmed
   before the next runs" over an explicit three-step order accordingly. Whichever, carry the matching
   sentence (or leg) to split §5.4 leg (iii), which currently asserts "no `RESOLVED:` line is stripped,
   clause 2 never running" for the 3-and-1 cases only.

F-02 and F-03 are routable at the author's discretion and I will not raise either as a blocker. Q-01
and Q-02 touch sentences near (1) and are free to answer while there; neither is a finding.

## Verdict

VERDICT: Needs revision
