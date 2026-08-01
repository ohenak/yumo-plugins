---
feature: pdlc-rcv-panel-topology
ready: true
depends-on: [pdlc-rcv-budget-stop, pdlc-rcv-fixed-point-stop]
---

# REQ — pdlc-rcv-panel-topology

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the non-convergence analysis, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-*`. **Read it first.** Facts are cited by id (`M-3a`) and are not restated here. |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2) and the run-report row schema (§3). Terms and ids are used by reference and never restated. |
| Predecessor | `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8 (**superseded 2026-08-01**) — this REQ carries its REQ-RCV-03 and REQ-RCV-04 unchanged in substance. |
| Siblings | `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (REQ-RCV-01) and `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02) — **the two dependencies**; `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root cause 3 and recommendation R-6; operator direction of 2026-07-29 |
| Downstream | `FSPEC-pdlc-rcv-panel-topology.md` |
| Targets | `pdlc/workflows/orchestrate-dev.js`; the three review SKILLs (`pm-review`, `se-review`, `te-review`) and a verifier SKILL; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. Citations are repo-root-relative and name the enclosing symbol and a distinctive literal. Re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-01 |

## 1. Problem

This REQ carries the **review-surface** half of the shared baseline's P-1 — the half about *who reads a revision, and how big the revision is*.

Two facts from baseline §1.3 motivate the first change. The two reviewers **never disagreed**: at round 5 both independently filed the same defect, their disposition tables agreed, and
both approved the large majority of each revision. And rounds 2–5 had a ~100% finding-resolution rate. Later rounds were therefore *disposition checks* that also happened to manufacture
a fresh crop of findings in the new text written to answer them, and two agents doing a disposition check independently is a duplicated disposition check at double the
finding-manufacture rate. Round 1 is different: it is the only round that reads the document cold, and breadth of lens is worth paying for exactly once.

The second change answers baseline root cause 3 directly: nothing in the loop distinguishes "this round tightened 1 KB" from "this round added a new 25 KB mechanism", and the iteration
counter treats both as one round. The panel rule stops the verifier from *mining* small revisions for new findings; the revision-size bound stops a genuinely large revision from
slipping past a verifier that is not equipped to read it cold. **The two must ship together** — see §10.

Sibling `pdlc-rcv-budget-stop` carries the stop (round budget, fixed-point halt, zero-delta halt); `pdlc-rcv-finding-quality` carries P-3 and P-4.

## 2. Users and value

| ID | User story |
|---|---|
| **US-02** | *As the operator*, I want a bounded, predictable cost per reviewed document, so that a queue of ten features does not become a 3 MB corpus of specs nobody can read. |
| **US-05** | *As a reviewing agent*, I want to know whether I am opening a document for the first time or checking the disposition of my own prior findings, so that I do not manufacture a fresh crop of findings in text that was written to answer me. |

**Value.** This REQ is what moves a run from the baseline §1.4 **pessimistic** regime (3 rounds, 6 dispatches, ~40% saving) to its **target** regime (3 rounds, 4 dispatches, ~60%
saving). The move is contingent — the only run measured lands in the pessimistic regime, where every round's growth exceeded 12,000 bytes and the exception re-escalates every round to
the full panel — so **this REQ does not claim the target figure**; it claims the mechanism that makes the move possible and the per-round measurement (AC-4.7) that shows, in bytes,
whether it happened.

**Operator-visible surfaces.** Cross-review files with a distinct role slug and a `REVIEW-MODE:` marker; a per-round growth figure and classification in the loop's report.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | Directory `docs/completed/pdlc-review-loop-hardening/` exists on the default branch with that feature's artifacts. **Satisfied at `9486c81`**. | Must hold at HEAD before FSPEC authoring |
| **BL-03** | Per-round cross-review state is refreshed from the branch inside the loop, and `selectMode` computes an episode's mode from that state | Symbols `refreshReviewState`, `selectMode` present (M-3e, M-3c) | Must exist at HEAD — AC-3's panel-shape decision is taken at the same seam |
| **BL-04** | Approval anchors (`APPROVAL-HASH:` / `REVIEWED-COMMIT:`) are appended to cross-review files on the terminal round | Symbol `appendApprovalAnchors` present (M-4a), with the pre-count semantics of M-4b | Must exist at HEAD — AC-3.5's verifier marker and AC-4.1's round anchors are written into the same block under the same rules |
| **BL-08** | `sha256Hex` canonicalises inside the digest function (M-7c), and the loop already reads the reviewed document through an injected reader on the seam AC-4.1 needs (M-5c) | Symbols present | Must exist at HEAD — AC-4.1 adds no new IO primitive and no second canonicalisation |
| **BL-09** | **Feature `pdlc-rcv-budget-stop` merged.** Its AC-1.5 defines the window origin `W` and the reset region. | The feature's artifacts on the default branch, and `MAX_REVIEW_ROUNDS === 3` in `pdlc/workflows/orchestrate-dev.js` | **Hard dependency.** Every AC below that says "round `W`" or "the current window" is stated over that REQ's definitions. Shipping this REQ first would leave the panel rule stated over a window nothing defines. |
| **BL-13** | **Feature `pdlc-rcv-fixed-point-stop` merged.** Its AC-2.7(b) fixes the count-trailer reader AC-3.4's trailer is read by; its AC-2.8 consumes the anchors AC-4.1 writes and shares AC-4.1's single round-open read; its AC-2.1 is the evaluation `appendRoundAnchors` must precede. | The feature's artifacts on the default branch | **Hard dependency.** AC-4.1's write ordering and AC-4.7's row A are stated over those criteria. |

**Nothing here re-specifies a dependency's mechanism.** Where this REQ needs a family term — *current window*, *panel shape*, *crashed*, *phase refusal*, *approval refusal*,
`blocking(N)` — it uses the definition in `docs/_constraints/pdlc-rcv-catalogue.md` §1 and does not restate it, so they cannot drift into two meanings.

## 4. Definitions and the catalogue ids this REQ owns

Every term this document uses with a family meaning — *panel shape*, *crashed* round, *current
window* / round `W`, *blocking count*, *unavailable*, *malformed*, *phase refusal*, *approval
refusal* — is defined in `docs/_constraints/pdlc-rcv-catalogue.md` §1 and is **not** restated here,
so the family cannot drift into two meanings. The same file's §2 holds the closed catalogue
`S-1 … S-17` — **FSPEC may not add an eighteenth** — and its §3 the run-report row schema this
REQ extends.

**Round growth** *into* round N is defined **here**, by AC-4.1:
`bytes(t0 of round N) − DOC-BYTES(N−1)` — the byte length of the reviewed document as **round N's**
reviewers are about to be given it, minus the durable anchor of round N−1. The **earlier** endpoint
is durable and in the past; the **later** endpoint is read at round N's open, in the single read
AC-4.1 shares with `pdlc-rcv-fixed-point-stop` AC-2.8. It therefore selects **round N's own**
panel: the revision a cold reader must actually read is the revision that is classified. Stating
both endpoints as past anchors would classify the *previous* revision and leave round 2 permanently
unclassifiable, since there is no `DOC-BYTES(0)`.

This REQ **owns** six catalogue ids — **S-1** `REVIEW-MODE: verification` (AC-3.5(a)), **S-2**
`DOC-BYTES:` and **S-10** `DOC-SHA256:` (AC-4.1), **S-6** `growth-unmeasurable:` (AC-4.1's enum),
**S-8** `## Disposition` (AC-3.2), **S-9** `New-mechanism:` (AC-3.2(2)) and **S-17**
`REVIEW-SCOPE-ROUNDS:` (AC-3.2's dispatch input) — and **reads** S-11 and the report row schema.
Their grammars and receive sides are in the catalogue; the criteria that produce them are below.

The **two anchor writers** the catalogue names are deliberately different functions:
`appendApprovalAnchors` (M-4a), unchanged, runs on the approving terminal round only, inside the
existing `gatePass` branch; **`appendRoundAnchors`** — new, named by AC-4.1 — runs after **every**
round's reviewers return, whatever verdict they returned, and **before**
`pdlc-rcv-fixed-point-stop` AC-2.1 is evaluated (not "before AC-2": that REQ's AC-2.8 fires at
round-open, *before* this writer runs for that round), writing into each of the round's files
**that exist** — zero on a wholly crashed round, one on a partly crashed one.

Assigning all five lines to `appendApprovalAnchors` is the defect this split exists to prevent:
that function has one call site and it is inside `if (gatePass)`, so on a failed round none of the
five would be written — and a failed round is the only kind the fixed-point rule compares and the
only kind AC-4 measures. The split is REQ-altitude because it decides which panel gets dispatched.

**Durability.** Every quantity this REQ's criteria read has a durable on-branch home, because the
loop re-derives its state from the branch on every invocation (M-1d, M-2f): panel shape from the
role slugs in the cross-review basenames; the verifier marker from `REVIEW-MODE:` in the file; the
growth's earlier endpoint from `DOC-BYTES:` in the file; the prior rounds' finding ids from the
prior rounds' cross-review files. **No criterion here is stated over in-process state.** The anchor
block exists because the in-memory endpoint does not survive an invocation: with both endpoints
in-process, every round's growth on a resumed phase — the normal case — would be unmeasurable,
AC-4.5 would fire, and AC-3.1's single-verifier path would be dead on every resumed run with no
operator-visible signal that this was structural.


## 5. Acceptance criteria

Two requirements. Every acceptance criterion is in Who / Given / When / Then form and is stated over an in-band observable named in the shared baseline §2.

---

### REQ-RCV-03 — Round 1 is dual-adversarial; later rounds are a single verifier

**Priority:** P0 · **Source:** US-05, US-02 · **Depends on:** BL-01, BL-03, BL-04, BL-09

**AC-3.1 — Panel by round.**
*Who:* the review loop. *Given:* a review-loop phase other than Phase CR. *When:* it dispatches round N. *Then:* **round `W`** — the first round of the current window, which is round 1
when no reset has been granted — dispatches the **full reviewer panel** (today: `se-review` and `te-review`, in parallel, as now), and every round `N > W` dispatches a **single
verifier** — unless AC-4 classified **the growth into round N** as `new-mechanism` or `unmeasurable`, in which case round N dispatches the full panel again.

**The rule is over windows, not over round indices.** The first round of a reset window is `N ≥ 2` by construction, yet it has no comparable predecessor *exactly as round 1 has none*.
Stated as "every round N ≥ 2", the consequence is concrete: an operator who resets **without revising** gets growth 0 ⇒ `incremental` ⇒ a single verifier, and that one agent could
approve the byte-identical document a two-reviewer panel had just rejected — with the one mechanism that detects "the document did not change" switched off for that round (`pdlc-rcv-fixed-point-stop`
AC-2.8 deliberately does not evaluate on a window's first round). Scoping the panel rule to the window closes it outright, at the cost of one round of one panel per operator reset — a
price an operator who has just spent their escape hatch has already signalled willingness to pay.

The classified revision is the one round N's reviewers are about to read, not the one round N−1 already read: AC-4.1 measures it from the same round-open read that dispatches the round,
so the escalation and the revision that triggers it belong to the same round. Round `W` is the only round with no classification, and it is dual regardless, so the exception is total
over rounds `N > W`.

**AC-3.2 — What the verifier is asked to do, and the artifact that proves it did.**
*Who:* the verifier. *Given:* a round `N > W` on a document whose round N−1 findings have been addressed, **and a dispatch that names the window**: the loop passes the verifier the
inclusive round range whose findings are in scope, as an explicit input, not as something the verifier derives, on one line rendered `REVIEW-SCOPE-ROUNDS: {W}..{N−1}` (**S-17**).
*When:* it reviews. *Then:* it works in **disposition-check mode**:

1. it verifies that **every** prior blocking finding **of the round range it was given** (S-17) — the current window's rounds — is resolved, and states a per-finding disposition **in a
   section headed exactly `## Disposition` (S-8)**, one row per such finding, carrying that finding's **id exactly as the prior round wrote it** (`F-03`), its round, its role, and one
   disposition from the closed set `{resolved, partially-resolved, not-resolved, withdrawn}`;
2. it may raise a **new blocking finding only in text that adds new mechanism** — a clause that changes what the system does. Text that restates, tightens, retracts, cites, or records a
   risk is not new mechanism and is not a place a new blocking finding may be raised. **Every blocking finding a verifier raises carries a `New-mechanism:` field** in its findings-table
   row, naming the section or clause of the revision it judged to be new mechanism. A blocking finding with an empty or absent `New-mechanism:` field **must be excluded by the verifier
   from the `high`/`medium` numbers it writes into its own count trailer** (AC-3.4), and recorded as a Low instead. **The loop performs no subtraction and parses no findings table.**
   `blocking(N)` has exactly one definition across this family — the `high` + `medium` operand of the count trailer read by `extractFileVerdict` → `parseVerdict` — and this clause changes
   *what the verifier writes into it*, never how it is read. Like AC-4.6 it is a **prompt-directive** clause: it binds the verifier, is unenforceable by the loop, and is stated here so the
   obligation has one owner rather than two readings;
3. it may raise Low findings and `## Measurement Required` items (`pdlc-rcv-finding-quality` REQ-RCV-05) anywhere, without restriction.

Restriction 2 is the direct answer to P-1. It is a rule about *where* a blocking finding may be raised, not about what is true; a verifier that believes a non-mechanism clause is wrong
records it as Low or as a Measurement Required item.

**Why *"of the current window"*, and why no verifier is ever asked to disposition a discharged finding.** A window's first round is a full-panel cold read (AC-3.1), so no verifier ever
opens on a round `N = W`, and the findings of a *previous* window were not addressed by an optimizer episode at all — the operator discharged them by writing `RESOLVED: yes`. "Every
prior blocking finding from every prior round" would therefore ask the first verifier after a reset for rows whose content is underivable, on a precondition that is false there. Scoping
both the *Given* and clause 1 to the window makes the required content derivable from the branch on every round on which a verifier runs at all.

**And the window is given, not derived, because the verifier cannot derive it.** Everything else clause 1 needs is on the branch in a form an agent reads directly — the prior
`CROSS-REVIEW-{role}-{doc}-v{N}.md` files, their findings tables, their ids. `W` is not: it lives in `POSTMORTEM-{phase}-{feature}.md`'s `## Reset Region`, behind `pdlc-rcv-budget-stop`
AC-1.5(4)'s clearance gate and the ordered algorithm that decides it (`pdlc-rcv-reset-region` AC-7.1), whose step 2 additionally needs the directory listing. Leaving the verifier to find it would relocate the "content is underivable" failure from the document
into the agent, and clause 1's completeness check is an approval gate, so a verifier that silently kept the whole-history reading would emit a row set that refuses approval for the
wrong reason. DC-01 puts the obligation on the party that can discharge it: **`W`'s single reader stays the loop**, and the verifier receives the resulting range in its dispatch.

**The range is a boundary-crossing value, so it has a rendering and a total receive side.** Both halves are fixed:

- **the emitted form** is S-17, `REVIEW-SCOPE-ROUNDS: {W}..{N−1}` — one line, two decimal integers ≥ 1, the two-character `..` separator this family already uses for a round range;
- **the receive side is total, and it is one behaviour for all four non-canonical inputs.** *When* the line is **absent**, **empty**, **unparseable** (anything that is not two decimal
  integers ≥ 1 around a `..`), or carries endpoints with `{W}` **greater than** `{N−1}`, *then* the verifier **does not guess and does not fall back to the whole branch history**: it
  **omits the `## Disposition` section entirely** and states, in its findings table, which input was missing or unreadable. It reviews normally otherwise, and writes its count trailer as
  usual.

The **loop-side response needs no new mechanism**, which is why this receive side was chosen over a new notice: a cross-review with no `## Disposition` section is already an enumerated
case — clause 1's completeness check fails, so **approval is refused and the phase does not halt** — an *approval refusal*, not a phase refusal. A garbled range is therefore visible in
the verifier's own file rather than silently producing the wrong row set and refusing approval for a reason the operator cannot see. Guessing is forbidden for the same reason `W` is not
derived here: a fallback would be a fabricated scope, and a fabricated scope that happens to be right is indistinguishable from one that is wrong.

**What a garbled range costs is a sequence, not a round.** S-17's emitter is the **loop**, so a deterministic defect in the render recurs on *every* round of the phase. The sequence
spans **three rounds and one operator clearance**, not two, because the middle round is not dispatched at all: round `k` emits the garbled line, the verifier omits `## Disposition` and
approval is refused (**dispatch 1**); the optimizer answers feedback that names no defect in the document, and a plausible response is a byte-identical revision; **round `k+1` opens**
and halts at `pdlc-rcv-fixed-point-stop` AC-2.8's round-open read *before any reviewer is dispatched*, so it carries S-11 `no-revision:` and **no** second `disposition-missing`; the
operator clears, `pdlc-rcv-budget-stop` AC-1.5(5) writes `WINDOW-RESUMED:` with `W` unchanged, and round `k+1` re-opens with the same garbled dispatch (**dispatch 2**).

Dispatch 2 is reachable **only if some byte of the document moved** between the two. If nothing did — and by hypothesis there is nothing in the document for the author to change — the
anchors are unchanged and the round halts again: the pathology's real shape is **absorbing at the zero-delta halt**, worse than a cycle of garbled dispatches, which is why O-10's fixture
must supply the byte change explicitly. Two things make it survivable: the diagnostic reaches the operator under two **alternating** names — `disposition-missing` on the dispatched
rounds, S-11 on the rounds between them — so the alternation is itself the signal that the defect is the loop's and not the author's; and every iteration costs an **operator
interaction**, which the operator sees repeat. The bound is the **operator**, not a cap.

**Both clauses have an oracle, because without one neither did.** A verifier that obeyed clause 2 and one that ignored it would produce byte-identical artifacts, and clause 1's
disposition would be prose no reader could check against the prior rounds' finding ids. The two named literals — `## Disposition` and the `New-mechanism:` field — are the structural
artifacts that make each clause falsifiable, named on the same principle as `Scope:` and `## Verdict`: an exact string, in the file, machine-locatable.

**Receive side (DC-01 totality) for `## Disposition` (S-8):**

| Input | Behaviour |
|---|---|
| Section absent on a verifier round's file | The verifier's **approval is refused, fail-closed** — the round is treated as not approving; the run report says `disposition-missing` and names the round and role. It is not a halt: the loop opens the next round normally. |
| Section present, but a prior round's blocking finding id has no row | Reported in the run report as an **unmatched id**, naming the id and its round. Never fatal, never a halt — an id the verifier did not see is evidence about the verifier, not about the document. |
| A row whose id matches no prior finding | Reported the same way and ignored. |
| A row whose disposition value is outside the closed four-member set | Read as `not-resolved` (fail-closed) and reported. |
| Section present on a **dual** round's file (round `W`, or a re-escalated round) | Permitted and ignored. AC-3.2 binds the verifier; a full-panel reviewer that also states dispositions is not in error. |

The prior rounds' finding ids are read from the prior rounds' cross-review files on the branch. Nothing here reads in-process state.

**AC-3.3 — Phase CR keeps the full panel every round.**
*Who:* the pipeline. *Given:* Phase CR, the final codebase review. *When:* any round runs. *Then:* the full panel is dispatched, every round. Phase CR's optimizer changes **code**, not
the reviewed document, so the growth AC-4 measures does not exist there and the "new text is unreviewed text" mechanism this AC is designed around does not apply. Applying the verifier
rule to a phase whose growth is unmeasurable would be applying it blind.

**Phase DOD is out of scope for the same reason.** It runs its own evaluator→optimizer loop — `dod-verify` writing `CODE_REVIEW-{feature}-v{N}.md`, `se-implement` remediating — under
its own three-round budget. Its optimizer changes **code**, so `DOC-BYTES:` has no subject there; and its artifacts are not `CROSS-REVIEW-{role}-{doc}-v{N}.md`, so `deriveRoundWindow`'s
basenames, the panel-shape read and the dependency's window are all stated over a naming convention Phase DOD does not use. **This REQ's AC-3 and AC-4, and the dependencies' AC-1 and AC-2,
therefore apply to `reviewLoop` phases only** — the phases that review a document (N-7).

**AC-3.4 — The file grammar gains a required count trailer, and this REQ says so.**
*Who:* every reviewer — verifier and full panel alike. *Given:* any round. *When:* it finishes. *Then:* it writes `CROSS-REVIEW-{role-slug}-{doc}-v{N}.md` with a trailing `## Verdict`
section written last, carrying exactly **one** `VERDICT:` line **and, inside that same section, the machine-readable `{"high": N, "medium": N, "low": N}` count trailer**. The verifier
uses the same grammar under its own slug; the loop's existing path derivation already composes the path from the role slug and the round (M-3b), so no parser changes there.

**This is a file-grammar change, and it is the only one this family makes** (N-3). Today the three review SKILLs require the trailer in the reviewer's **response**, and the repo's
documented **file** contract is the `## Verdict` section and its single `VERDICT:` line — a correctly written file may carry no trailer at all (M-2g). Because `pdlc-rcv-fixed-point-stop` AC-2.1 reads
both its operands from files, a file without the trailer would take `parseVerdict`'s truncated-output path and return **genuine `0/0/0`** (M-2c), i.e. read as a perfect, comparable
round. So:

- the trailer is **required in the file**, in the `## Verdict` section, and its **placement is exact**: immediately after the `VERDICT:` line, **before any anchor line**, which is what
  `parseVerdict` requires. Fixing only *that* the trailer is in the file, and not *where*, leaves a compliant-looking file that `parseVerdict` rejects;
- **the reader is one algorithm, stated once, in `pdlc-rcv-fixed-point-stop` AC-2.7(b)** — the stopping scan that skips anchor lines, and its four outcomes (*unavailable*, *malformed*, a count). This
  REQ does not restate it and may not contradict it: one reader, one skip-set, the anchor set being §4.2's catalogue plus the M-4a approval anchors **by reference**. The skip rule is what
  keeps *unavailable* reachable, because the anchors AC-4.1 appends land in this same section, *after* the trailer;
- the corresponding review-SKILL amendment is O-9(a);
- the trailer stays in the response too. Nothing about the in-process path (M-2a) changes; the fixed-point rule simply stops depending on it.

The completeness criterion for a cross-review is unchanged in *kind* — a trailing `## Verdict` section with exactly one `VERDICT:` line — and now also requires the trailer inside it.
`## Measurement Required` remains outside the criterion.

**AC-3.5 — A verifier-round approval is recorded, and a crashed dual round still is not.**

This is the load-bearing integration constraint, and it exists because three separate places in `orchestrate-dev.js` currently encode "two reviewers" as an invariant. All four
constraints must be satisfied.

*Who:* the review loop. *Given:* round `N > W` dispatched a single verifier — **whatever verdict it returned**. *When:* the round's file exists, i.e. after the verifier returns. *Then:*

- **(a) A durable, in-file marker distinguishes a verifier round from a crashed dual round, and it is written on every verifier round.** The loop appends `REVIEW-MODE: verification` to
  the verifier's cross-review file, in the same anchor block, with the same idempotence and ambiguity rules as M-4b. Its writer is the **unconditional sibling writer of AC-4.1**, not
  `appendApprovalAnchors`: the marker describes the round's *panel shape*, which is a fact about the round, not about its verdict. Writing it only on an approving round would leave every
  **failed** verifier round as one file with no marker — indistinguishable from a crashed dual round, and the fixed-point rule compares only failed rounds, so it could never fire in the
  `dual, verifier, verifier` regime AC-4/AC-2.6 says it fires in. The marker is **in the file**, not in memory, because the reader that needs it (M-3d) runs on a later invocation with
  nothing but the branch to read.
- **(b) A lone cross-review file at the candidate round WITHOUT the marker remains fail-closed.** The existing role-asymmetry rule (M-3d) exists to refuse approval when one reviewer of a
  dual round crashed, and that refusal must survive intact. Only the marker converts "one file" from *evidence of a crash* into *evidence of a verifier round*.
- **(c) Same-round approval is evaluated against the roles dispatched at that round.** `selectMode` rule 2 today requires every role in `present` to approve at the same round, and
  `present`'s role set is accumulated across **all** observed rounds (M-3c). Unchanged, a branch carrying `{software-engineer, test-engineer}` at round 1 and `{verifier}` at round 2 would
  require all three roles to approve at round 2, which is unsatisfiable — every round would read as still owed an authoring pass, and the loop would never terminate on approval. The rule
  must be evaluated against the roles dispatched **at the round being judged**.
- **(d) The reviewer list is per-round.** `reviewLoop` currently hardcodes two reviewers in three places: two named result bindings, positional `reviewers[0]`/`reviewers[1]` dispatch, and
  a two-element `lastResults` construction on the halt path (M-3a). A round's panel must be a list whose length the round determines, and every one of those sites must read from it.
- **(e) The marker's reader is a total function — all six cases, at REQ altitude.** `REVIEW-MODE:` is a machine-read string crossing a component boundary (S-1), and DC-01 requires the
  receiving side to be total *before* FSPEC authoring; deferring the rest to an FSPEC obligation is the deferral DC-01 forbids, because each case below decides whether an approval is
  granted, which is externally observable behaviour. The rule is **fail-closed throughout**, matching M-3d's role-asymmetry posture and M-4b's `≥ 2` ambiguity posture:

  | Case on the candidate round's file(s) | Reading | Approval |
  |---|---|---|
  | **Absent** on a lone file | crashed dual round | **no approval** — the existing M-3d rule, intact |
  | Exactly **one** line, exactly `REVIEW-MODE: verification` | verifier round | approval honoured, if the verdict approves |
  | Exactly one line, **any other value** | unrecognised mode; the catalogue S-1 is closed and has one member | **no approval**; run report notice names the file and the value found |
  | **Two or more** `REVIEW-MODE:` lines in one file | history ambiguous — the same state M-4b calls `≥ 2` | **no approval**, by the same rule and for the same reason |
  | Marker present on **more than one file of the same round** | contradiction: a verifier round has one file by construction, so this is a dual round claiming to be a verifier round | **no approval**; the round's panel shape is *crashed* and therefore not comparable under `pdlc-rcv-fixed-point-stop` AC-2.4 either |
  | Marker present on a **dual** round's file alongside a second unmarked file | the same contradiction seen from the other side | **no approval**; same notice |

  In every refusing row the loop does **not** halt: it records the **approval refusal**, the round remains owed an authoring pass, and the window proceeds under AC-1. An approval refusal
  is the absence of an approval, not an error, and it is exactly what M-3d does today. It is **not** the *phase refusal* of `pdlc-rcv-reset-region` AC-7.2, whose defining property is the
  opposite — that the phase is never entered and the invocation terminates.

**AC-3.6 — Tier 2 may remain dual-only, and says so.**
*Who:* the harvest step. *Given:* a feature whose approving round was a verifier round. *When:* the LEARNINGS approval record (tier 2, M-3f) is written. *Then:* it is acceptable for
tier 2 to record no approval row for that round, **provided the limitation is documented** in the LEARNINGS file and in the run report — i.e. the absence is reported as a known
limitation, not left as a silent gap. Tier 2 is a best-effort record and is already explicitly excluded from the completeness criterion; extending it is not in scope (N-5). R-3 binds
the residue.

**AC-3.7 — The verifier's lens is named, and it is not a third opinion.**
*Who:* the operator. *Given:* the verifier role. *When:* they ask what lens it applies. *Then:* the verifier applies the **union** of the panel's lenses in disposition-check mode, not a
new lens. It is not a tie-breaker between the two round-1 reviewers, because baseline §1.3 measured that they do not disagree. Its slug is **`verifier`**, declared with a default in §6
— leaving it unfixed would leave the panel-shape set equality comparing sets of an undefined string. Its skill file, and whether it is a new SKILL or a mode of an existing review SKILL,
remain FSPEC decisions (O-3); FSPEC may rename the slug only by amending §6's row, and may not leave it unset. What matters to the mechanisms is that there is **one stable slug**,
because it is the key the file path, the approval marker and the panel-shape comparison are all stated over.

**Observability.** Which files exist, under which role slug, at which round; whether a file carries `REVIEW-MODE: verification`; which round `selectMode` reports as owed. All on disk,
all readable on a later invocation.

---

### REQ-RCV-04 — Revisions are measured, and a large revision re-escalates the panel

**Priority:** P0 · **Source:** US-02, US-05 · **Depends on:** BL-01, BL-04, BL-08, BL-09, AC-3

**AC-4.1 — Growth is measured per round, from a durable in-file anchor.**
*Who:* the review loop. *Given:* a review-loop phase other than Phase CR. *When:* round N is opened. *Then:* the loop takes **one** read of the reviewed document through the injected
reader (M-5c) at that instant `t0` — the same read `pdlc-rcv-fixed-point-stop` AC-2.8 tests, and the same instant at which the document is captured for `APPROVAL-HASH:` — and from it derives `n =
bytes(t0)` and `h = sha256Hex(t0)`. It then, in order:

1. **if `N > W`** — round N is not the first round of the current window — computes `growth = n − DOC-BYTES(N−1)` and classifies it under AC-4.2, **selecting round N's own panel**
   (AC-3.1). At `N = W` nothing is measured: that round's panel is fixed full by AC-3.1;
2. dispatches round N's reviewers;
3. after they return — **before `pdlc-rcv-fixed-point-stop` AC-2.1 is evaluated**, and regardless of the round's verdict — writes `DOC-BYTES: {n}` (S-2) and `DOC-SHA256: {h}` (S-10) into each of round
   N's cross-review files that exists (`appendRoundAnchors`; zero files on a wholly crashed round, one on a partly crashed one).

**The read instant and the persist instant are deliberately different.** `n` and `h` describe the bytes the round's reviewers were actually given, so they must be read before the
dispatch; the round's files do not exist until it returns, so they cannot be written until after. Collapsing the two into "when round N is opened" asks for a write into files that do
not yet exist.

**Only the earlier endpoint has to be durable, and that is the whole point of the anchor.** Making *both* endpoints durable — `DOC-BYTES(N) − DOC-BYTES(N−1)`, selecting round **N+1's**
panel — classifies the revision round N's reviewers had *already* read rather than the one round N+1 must read cold, defeating this AC's purpose; it also leaves round 2 unclassifiable
in every run, because there is no round 0 and therefore no `DOC-BYTES(0)`, so `no-anchor` ⇒ unmeasurable ⇒ AC-4.5's full panel would make `dual, dual, …` the opening of every run and
the target-regime sequences unreachable. With the live later endpoint, round 1 is the only unclassified round and it is dual by AC-3.1 anyway.

**The writer runs on every round, and it is a named, separate function.** `appendApprovalAnchors` is the *approving-round* writer — it runs only inside the gate-pass branch — and
remains solely responsible for `APPROVAL-HASH:` and `REVIEWED-COMMIT:`, which are properties of an *approval*. Everything that is a property of a *round* is written by
**`appendRoundAnchors`**, an unconditional sibling writer that runs on the failing and approving path alike, appending to the same anchor block in each of the round's files and under
the same idempotence and multi-line rules (M-4a, M-4b). It writes three lines: `DOC-BYTES:` (S-2), `DOC-SHA256:` (S-10) and — on a verifier round — `REVIEW-MODE:` (S-1, AC-3.5(a)).
§4.2's two-writer table is the normative statement of the split. This separation is the whole of the fix: a failing round is the only kind whose growth AC-4 classifies and whose counts
the fixed-point rule compares, so a writer that skips failing rounds writes its anchors exactly when they are never needed and never when they are.

**`DOC-SHA256:` is written at the same instant, by the same writer, from the same read — but not over the same bytes.** It is `sha256Hex`'s digest of the `t0` text, i.e. over
`canonicaliseForDigest`'s output: CRLF and lone CR normalised to LF, exactly one trailing newline, applied inside the function and never by a caller (M-7c). `DOC-BYTES:` counts the
**raw** bytes. Claiming it is "the SHA-256 of the same bytes `DOC-BYTES:` counts" *and* a reuse of the tier-1 hashing cannot hold; only the second is true. The reuse is deliberate — it
inherits the canonicalisation discipline the digest family was built around — and `pdlc-rcv-fixed-point-stop` AC-2.8 conjunction of the two anchors recovers the byte-exactness the canonical form
drops. Rendering differs from `APPROVAL-HASH:` on purpose: that anchor carries the `sha256:{64 hex}` prefixed form produced by `approvalHashOf`, while S-10 is bare 64 hex, because the
receivers differ. It costs one hash of a string the loop has already read.

**Round growth** is measured across the boundary between rounds N−1 and N: `growth = bytes(t0 of round N) − DOC-BYTES(round N−1)`. The **earlier** endpoint is a durable anchor already
on the branch; the **later** endpoint is the round-open read step 1 takes. That is the minimum durability the measurement needs, and it is what lets the classification select the panel
of the round whose revision it measured.

**Receive side (DC-01 totality) for `DOC-BYTES:` (S-2).** Growth is **unmeasurable** — AC-4.5, with the S-6 reason shown — in each of these cases, and in no others. The **later**
endpoint is the live round-open read and is unmeasurable only in the last row's case; the first three rows are observations on round N−1's anchor.

| Input | S-6 reason |
|---|---|
| At round `N > W`: no `DOC-BYTES:` line in any of round N−1's cross-review files | `no-anchor` |
| A line whose value is not a decimal integer ≥ 0 — non-numeric, signed, separators, empty | `unreadable-anchor` |
| Two or more `DOC-BYTES:` lines in one file with **unequal** values | `unreadable-anchor` |
| The phase's target is not a single readable document (Phase CR's directory target) | `non-document-target` |

Two or more `DOC-BYTES:` lines with **equal** values is an idempotent re-write and is read as one value — the same rule M-4b already applies to `APPROVAL-HASH:`. A round whose several
files disagree on the value is `unreadable-anchor`: the anchor is a property of the document at the round, so the files must agree. Negative growth is **measurable and normal** (a round
that shortened the document) and classifies *incremental*; it is not an error.

**The first round of a window is not measured and raises no notice.** At round 1 there is no round 0, and at round `N = W` of a reset window the predecessor belongs to a window whose
findings the operator has discharged, so a growth measured across that boundary would span the operator's intervention rather than an optimizer's revision. In both cases the
`growth-bytes` and `classification` cells are empty (AC-4.7) and **no S-6 notice is raised** — an absent measurement that was never owed is not an unmeasurable one. Round `W`'s panel is
fixed full by AC-3.1 and needs no classification, which is the same treatment `pdlc-rcv-fixed-point-stop` AC-2.1 and AC-2.8 already give that round: **all four ACs share one boundary, and the
boundary is the window, not the round index.**

**AC-4.2 — Classification.**
*Who:* the review loop. *Given:* the growth `g` into round N, measured at round N's open (AC-4.1). *When:* it selects **round N's** panel, before dispatching it. *Then:*

| Condition | Classification | Round N's panel |
|---|---|---|
| `g > 12,000` bytes | **new-mechanism** | full panel (AC-3.1's exception) |
| `g ≤ 12,000` bytes, including zero and negative | **incremental** | single verifier |
| growth unmeasurable | **unmeasurable** | full panel — fail safe |

**AC-4.3 — Why 12,000, and what the number means.**
The threshold is `MAX_AUTHORING_WRITE_BYTES` — **12,000 bytes, one pacing write**, already a constant in the module and already stated verbatim to every wrapped authoring dispatch
(M-5a). It is not a new number and it is not a guessed round number: it is the largest revision an author can emit in a single tool call under the pacing contract, so "more than one
pacing write of growth" is exactly "this revision was too big to be one edit". Its derivation is therefore **the pacing contract's**, not a fresh estimate. For calibration against the
measured run: the predecessor's rounds grew 25.8, 22.3, 25.0, 28.1 and 38.2 KB — every one of the five would have classified new-mechanism, which is the correct reading of a run in
which every round added a new mechanism.

**AC-4.4 — The threshold is a declared, named threshold.**
See §6 and baseline §3: `MAX_AUTHORING_WRITE_BYTES`, default 12,000 bytes, owner the `orchestrate-dev` workflow module. Changing the pacing contract changes this classification with it,
deliberately — they are the same quantity and must not drift apart into two numbers.

**AC-4.5 — Unmeasurable growth fails safe to the full panel, and says which case it was.**
*Who:* the review loop. *Given:* the growth into a round `N > W` is unmeasurable in one of the four ways AC-4.1 enumerates. *When:* round N's panel is selected. *Then:* the **full
panel** is dispatched and the run report carries the **S-6 notice** `growth-unmeasurable: {reason}` with the matching closed-enum reason and the round it applied to. Failing safe here
means failing *toward more review*, which is the direction that cannot lose a finding.

The operator must be able to tell a *structural* unmeasurable — the target is a directory, so growth does not exist there — from an *incidental* one, a missing or unreadable anchor on a
round that should have carried one. The reason enum is what carries that distinction: `non-document-target` is expected and permanent; `no-anchor` and `unreadable-anchor` are defects
worth looking at.

**AC-4.6 — The optimizer is told to revise minimally.**
*Who:* an authoring agent addressing findings. *Given:* a revision dispatch. *When:* it receives its prompt. *Then:* the prompt carries a **minimal-revision clause**: address every
blocking finding, and prefer the smallest edit that does so — a targeted edit over a rewritten section, a corrected clause over a new subsection, a retraction over a retraction plus a
new mechanism. The clause states the consequence plainly: a revision that grows the document by more than one pacing write re-escalates the next round to the full panel. This is a
prompt clause, so it is directive rather than enforced; AC-4.2 is what actually bites, and the clause exists so the author knows the rule it is being measured against. R-5 records that
it is unenforced.

**AC-4.7 — Growth is reported, in the shared row schema.**
*Who:* the operator. *Given:* any completed review-loop phase, converged or halted. *When:* they read the run report. *Then:* the per-round table is the six-column schema fixed in
`docs/_constraints/pdlc-rcv-catalogue.md` §3. **This REQ does not restate that schema and may not contradict it**; it populates three of its parts and fixes their contents here:

| What this REQ fixes | Value |
|---|---|
| `growth-bytes` | the signed integer growth into that round; **empty** for the first round of a window (round 1, or round `W` after a reset — AC-4.1) and for an unmeasurable boundary |
| `classification` | `new-mechanism`, `incremental`, or `unmeasurable` (AC-4.2); **empty** for the first round of a window |
| S-6 `growth-unmeasurable: {reason}` | the closed three-member enum of AC-4.1's table, in the `notice` cell, at the catalogue's precedence position **7** — last of the seven round-scoped notices |

One consequence of that schema bears on cells this REQ populates: on both rows that have no dispatch behind them — row A (a round halted at open by
`pdlc-rcv-fixed-point-stop` AC-2.8) and row B (an entry that refused the phase, `pdlc-rcv-reset-region` AC-7.6) — `growth-bytes` and `classification` are **withheld deliberately**,
even where derivable, because reporting them invites the reader to think a round was measured when none ran. Neither row licenses a new column or a new notice.

**Observability.** Two integers read from two anchor lines on the branch, one comparison against a constant, one row per round in a report. No in-process state.

---

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. This REQ **owns** six of its rows and changes none of the others; a threshold used here and absent there is a defect.

| Name | Default | Note |
|---|---|---|
| Verifier role slug | **`verifier`** | A **key** three mechanisms are stated over — the cross-review file path (M-3b), the approval marker's owning file, and `pdlc-rcv-fixed-point-stop` AC-2.4's panel-shape set equality, which compares *sets of these strings*. Lower-case, hyphenated, no role suffix, matching `software-engineer` / `test-engineer`. FSPEC may rename it **only by amending this row and the baseline's**; it may not leave it unset. |
| `REVIEW-MODE: verification` | as catalogue §2's S-1 row fixes it | Written by **`appendRoundAnchors`** on every verifier round, whatever its verdict (AC-3.5(a)) — not by `appendApprovalAnchors`, which runs only on the approving round. |
| `DOC-BYTES: {n}` | as catalogue §2's S-2 row fixes it | The durable home of the growth measurement's earlier endpoint and of `pdlc-rcv-fixed-point-stop` AC-2.8's byte endpoint. |
| `DOC-SHA256: {64 hex}` | as catalogue §2's S-10 row fixes it | Same writer, same instant, same read. The value is `sha256Hex`'s (M-7c) — over `canonicaliseForDigest`'s output — and therefore **not** a digest of the raw bytes `DOC-BYTES:` counts. |
| `## Disposition` / `New-mechanism:` | those exact literals | S-8 and S-9. Each is the structural artifact that makes one AC-3.2 clause falsifiable; without them a verifier that obeyed the clause and one that ignored it produce identical files. |
| `REVIEW-SCOPE-ROUNDS: {W}..{N−1}` | as catalogue §2's S-17 row fixes it | Emitted by the loop on every verifier dispatch. Because the emitter is the loop, a deterministic bad render recurs every round; AC-3.2 states the three-round sequence that follows and O-10 asserts two garbled dispatches across it. |
| `MAX_AUTHORING_WRITE_BYTES` | **12,000 bytes** (unchanged) | Inherited, not new (AC-4.3). Read here as the classification threshold; this REQ does not change it, and the pacing contract and the classification must not drift into two numbers. |

## 7. Non-goals and out of scope

The shared list is baseline §4; **N-1, N-2, N-4, N-6, N-8, N-9 and N-10 apply unchanged** and are not restated. Four bear directly on this document:

| # | Not in scope | Why |
|---|---|---|
| **N-3** | Changing the cross-review file grammar **beyond the one change AC-3.4 names**. | The filename form, the trailing `## Verdict` section and its single `VERDICT:` line are unchanged. The one change is the count trailer moving from *response-only* into the file. `## Disposition` and the three anchor lines are **additions**, not changes — sections no existing reader looks for, and anchors extending a block that already exists (M-4a). **The findings table is not a parsed data contract**: AC-3.2(2)'s `New-mechanism:` field binds the verifier that writes it and is read by no component of the loop (S-9), so no findings-table grammar is introduced and none is needed. |
| **N-5** | Extending tier-2 (LEARNINGS) approval records to verifier rounds. | AC-3.6 permits the limitation, provided it is documented. R-3 binds the successor. |
| **N-7** | Applying AC-3/AC-4 — or the dependencies' AC-1 and AC-2 — to Phase CR **or to Phase DOD**. | AC-3.3: both phases' optimizers change code, not the reviewed document, so growth is unmeasurable and the mechanism does not apply; Phase DOD additionally writes `CODE_REVIEW-*` artifacts, which none of the round-window, panel-shape or anchor mechanisms is stated over. Extending the convergence mechanism to Phase DOD is a legitimate later question and is not asked here. |
| **N-12** | Re-specifying the round budget, the reset region (BL-09), the fixed-point rule, the zero-delta halt (BL-13) or the report row schema (catalogue §3). | This REQ states only what it **writes for** them (the anchors) and what it **extends** (three parts of the shared row). A finding that this document does not define `W` is **correct and known** — it is defined in the dependency. |

## 8. Downstream obligations

| # | Obligation | Owner |
|---|---|---|
| **O-1** | Specify how the loop threads a **per-round reviewer list** through `reviewLoop`, replacing the two named result bindings, the positional `reviewers[0]`/`[1]` dispatch and the two-element `lastResults` construction (M-3a, AC-3.5(d)). | FSPEC → TSPEC |
| **O-2** | Specify the amended same-round-approval rule: how `selectMode` evaluates rule 2 against the roles dispatched **at the round being judged** rather than the accumulated role set (M-3c, AC-3.5(c)), and what happens on a branch that carries a mixture of dual and verifier rounds. | FSPEC → TSPEC |
| **O-3** | Specify the verifier role's SKILL file and whether it is a new SKILL or a mode of an existing review SKILL (AC-3.7). **Its slug is not open**: §6 fixes it at `verifier`, and a rename is an amendment to §6 and the baseline, not an FSPEC decision. Specify also **where in the dispatch** the `REVIEW-SCOPE-ROUNDS:` line is placed — **not what it says**: AC-3.2 fixes the line's form and the one behaviour for all four non-canonical inputs, and `W`'s single reader stays the loop. | FSPEC |
| **O-4** | Specify the **write path** of `appendRoundAnchors` for the `REVIEW-MODE:`, `DOC-BYTES:` and `DOC-SHA256:` lines: where in `reviewLoop` it is called so that the round's files exist and the fixed-point rule has not yet been evaluated, and how each line composes with the existing anchor pre-count semantics (0 / 1-equal / 1-unequal / ≥ 2 — M-4b) it shares with `appendApprovalAnchors`. **Whether it is a new function or a parameterised extension of `appendApprovalAnchors` is an FSPEC decision; that it runs on every round, whatever the verdict, is not.** Likewise **the meaning of every non-canonical input is not open**: AC-3.5(e) fixes all six `REVIEW-MODE:` rows, AC-4.1 fixes the four `DOC-BYTES:` inputs, and `pdlc-rcv-fixed-point-stop` AC-2.8 fixes the four `DOC-SHA256:` inputs. O-4 specifies the plumbing, not the semantics. | FSPEC → TSPEC |
| **O-9** | Write the SKILL amendments: **(a)** the three review SKILLs — AC-3.4's requirement that the count trailer appear inside the file's `## Verdict` section as well as in the response, placed immediately after the `VERDICT:` line and before any anchor; **(b)** the three author SKILLs — AC-4.6's minimal-revision clause; **(c)** the verifier's disposition-check contract — AC-3.2, including `## Disposition` (S-8), the per-finding `New-mechanism:` field (S-9), **and the statement that the in-scope round range is supplied by the loop's dispatch on a `REVIEW-SCOPE-ROUNDS:` line (S-17) and is not derived by the verifier** — a verifier whose range is absent, empty, unparseable or inverted does not guess and does not fall back to the whole history; it omits `## Disposition` entirely and names the missing input, which refuses approval without halting. | FSPEC → implementation |
| **O-10** | Properties and tests for both requirements, including: the lone-file-without-marker fail-closed (AC-3.5(b)); **all six** `REVIEW-MODE:` rows (AC-3.5(e)); a **failed** verifier round comparing as `{verifier}` and not as *crashed*; a missing `## Disposition` refusing approval **without halting**, and each of AC-3.2's other four disposition inputs; the **four `DOC-BYTES:` inputs and their three reasons** (AC-4.1) with unmeasurable growth **escalating** rather than degrading (AC-4.5); **round `W+1`'s panel selected from the growth into `W+1`**, both classifications, with round `W` raising **no** S-6 notice; the first round of a **reset** window dispatching the full panel, with no growth measurement and no notice, and **not** approving a byte-identical document under a single verifier; a round that **shortened** the document classifying `incremental`; two equal `DOC-BYTES:` lines reading as one value and two unequal ones as `unreadable-anchor`; the anchors written on a **failing** round (the whole of the two-writer split) and **not** written by `appendApprovalAnchors`; and **the garbled-`REVIEW-SCOPE-ROUNDS:` sequence exactly as AC-3.2 states it** — **two** garbled dispatches across **three rounds and one operator clearance**, the middle round undispatched and asserting S-11 `no-revision:` rather than a second `disposition-missing`. The fixture **must make the authoring pass move at least one byte** before the re-opened round, because with the anchors unchanged the sequence is absorbing at the zero-delta halt and dispatch 2 is unreachable. The two assertions are properties of two different rounds, never of one. | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed**. | implementation |

## 9. Risks, assumptions and deferrals

| # | Assumption | If false |
|---|---|---|
| **A-2** | A single verifier in disposition-check mode catches what a second reviewer would have caught on rounds `N > W`. Evidenced by baseline §1.3: across ten reviews the two reviewers converged rather than disagreeing. | AC-3 loses findings on later rounds. **AC-4 is the compensating control** — any revision large enough to contain a genuinely new mechanism re-escalates to the full panel. This is why the two requirements are one delivery (§10). |
| **A-3** | Byte growth is a usable proxy for "this revision added new mechanism". | AC-4 misclassifies. Both directions fail toward *more* review or the same review: a large tightening escalates unnecessarily (costly, safe), and a small new mechanism is read by a verifier who is still instructed to raise blocking findings in new-mechanism text (AC-3.2 clause 2). |

| # | Risk | Disposition |
|---|---|---|
| **R-6** | **A branch carrying a mixture of dual and verifier rounds is a state the existing approval machinery has never seen.** Three separate call sites encode "two reviewers" (M-3a, M-3c, M-3d). | This is the highest-risk part of the family and is why AC-3.5 states four separate constraints rather than one. O-1, O-2, O-4 and O-10 discharge it downstream. |
| **R-3** | **Tier-2 approval records will have gaps** for verifier-approved rounds (AC-3.6). | Accepted, with the limitation documented in LEARNINGS and the run report. Tier 2 is already best-effort and excluded from the completeness criterion. Successor: `docs/pdlc-approval-record-tier2/REQ-pdlc-approval-record-tier2.md` (`ready: false`). |
| **R-5** | **AC-4.6, AC-3.2(2) and AC-3.2's S-17 receive side are prompt clauses, so they are directive rather than enforced.** An agent that ignores them is not detected. The S-17 case differs in kind: a verifier that **fabricates** a range still writes a `## Disposition` section, which passes clause 1's completeness check, and a fabricated **narrower** range is the unsafe direction, because it approves a document whose earlier-round findings are unresolved. | Accepted and stated rather than implied. AC-4.2 and the sibling's AC-2 remain the mechanical controls. The mechanical residue of AC-3.2(2) is that `blocking(N)` keeps **one** definition, so a verifier that ignores the clause produces a *higher* count, which can only make the fixed-point rule halt earlier, never later — a safe failure direction. The residue that keeps the S-17 case Low is that the line is **loop-emitted and therefore always present**, so the case requires a misbehaving agent rather than a missing input. A finding that any of the three is unenforceable is **correct and known** — file it as Low. |
| **R-7** | **AC-3.4's file-grammar change lands before every reviewer emits the trailer in the file.** A review written by an un-amended SKILL carries no in-file trailer, so its round reads *unavailable*. Measured on the predecessor, 7 of 10 files carried a trailer at all. | Accepted and degradation-only by construction: an *unavailable* round breaks the fixed-point chain in both directions and never fires the rule, so a lagging SKILL costs a comparison, never a wrong halt. O-9 amends the three review SKILLs in the same delivery. |

**Deferrals and their binding.** R-3 is bound to `docs/pdlc-approval-record-tier2/REQ-pdlc-approval-record-tier2.md`; the cross-panel comparability question AC-2.4 declines (N-2) is
bound, with `pdlc-rcv-fixed-point-stop`'s R-2 and R-9, to `docs/discarded/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md`. Both stubs are `ready: false`, so neither is
queue-eligible until an operator specifies it and opts it in.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-03 | M-3a … M-3f, M-4a, M-4b, M-2g (the response-only trailer AC-3.4 moves into the file), M-2c/M-2e (the reader it must satisfy) | P-1, baseline §1.3 | US-05, US-02 | O-1, O-2, O-3, O-4, O-9, O-10, O-11 |
| REQ-RCV-04 | M-5a, M-5b, M-5c, M-4a, M-4b (the anchor block `DOC-BYTES:` joins), M-7c | P-1 (root cause 3) | US-02, US-05 | O-4, O-9, O-10, O-11 |

**The one ordering constraint that is not optional: REQ-RCV-04 must not ship after REQ-RCV-03.** AC-3 removes a reviewer from rounds `N > W`, and AC-4 is what puts the panel back when a
revision is large enough to warrant it (A-2). Shipping AC-3 alone would leave large revisions read by a single verifier under a rule (AC-3.2 clause 2) that restricts where it may raise
blocking findings. That is why the two are one REQ and one delivery. Across the family, the constraint is BL-09: this REQ ships **after** `pdlc-rcv-budget-stop`;
`pdlc-rcv-finding-quality` is independent of both.

**Round-by-round history is deliberately not restated here.** The nine review rounds that produced this material live in `docs/discarded/pdlc-review-convergence/CROSS-REVIEW-*-REQ-v{1..9}.md`
alongside the superseded parent; those files remain the record of which finding produced which clause. This REQ traces to the *measured facts*, not to the review history.

**Size discipline — read before revising.** This document sits close to the pm-author ceiling of
700 lines or 60 KB. v1.0 was **over** it at 64 KB and got under by *shrinking* — shared material
moved to `docs/_constraints/pdlc-rcv-catalogue.md`, duplicated narrative condensed. **Answer a
finding by tightening existing text or by moving shared material to the catalogue, never by adding
a paragraph.** If a finding genuinely needs new mechanism, split at the AC-3 / AC-4 seam — a last
resort, because the ordering argument above means the two halves would ship as consecutive
blocking queue rows, not as independent features.
