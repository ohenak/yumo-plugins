# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.14)
**Date:** 2026-08-20
**Iteration:** 4 (delta confirmation, erratum round)

## Problem / Context

This is a **delta confirmation**, not a fresh review. I approved this REQ at v1.13 (round v3). A
targeted erratum has since landed in three commits, all on `feat-pdlc-advisory-wave-gate`:

| Commit | Scope |
|---|---|
| `75e5e13c` | lineage header (Upstream / Downstream / Cross-Reviews rows), `Status` field, v1.14 changelog |
| `524913ed` | AC-1.1 and R-5 name `c8aa22a4` as the pre-A6 measurement base |
| `c58fd61d` | AC-5.1's observation point, record-carrier exclusion, ignored-path boundary, failed-capture outcome |

The diff read for this round is `git diff 53fe0b73..HEAD -- docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
— 21 insertions, 9 deletions, touching exactly three regions (header block, AC-1.1, AC-5.1, R-5).
Sections outside those regions were approved at v3 and are not re-litigated here.

Per DEC-ERR-03 the scope is this REQ measured against its **upstream at HEAD**, not against the
routed item list. I therefore re-measured every upstream claim the erratum leans on, at its current
version, rather than trusting the v3 readings:

- `docs/_constraints/pdlc-wave-gate-baseline.md` at **v1.2** (header `Version | 1.2 · 2026-08-20`),
  whose `Verified at` row reads `§1–§2 at default-branch commit c8aa22a4; §3 at 1efb9a3b; §4 at 11420461`.
- `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` at its shipped version, for the
  eight `REQ-pdlc-advisory-tier` ids this REQ cites.
- The shipped workflow at HEAD, for the "HEAD already carries A6" claim.

Branch verified `feat-pdlc-advisory-wave-gate` by `git rev-parse --abbrev-ref HEAD` immediately
before each commit of this file. No `git checkout` was run in the shared tree.

## Goals

Answer one question: **does the delta resolve the routed items without breaking what I previously
approved, and is the document still a faithful compression of its upstream at HEAD?**

Concretely, this round set out to:

1. Confirm each of the eight routed items landed in the bytes, not merely in the changelog.
2. Re-measure every upstream fact the new text asserts — the base commit `c8aa22a4`, the
   post-change facts M-WG-13 / M-WG-14, M-WG-3 and M-WG-7, and the eight upstream-tier ids — at the
   current version of the cited authority.
3. Check the new AC-5.1 clauses for composition damage against criteria I already approved:
   AC-5.2, AC-6.1, AC-2.4 and O-1.
4. Check the rewritten lineage header against how sibling REQs in `docs/completed/` carry the same
   rows, and against what actually exists on the branch today.

## Non-Goals

- Re-reading unchanged sections. §1–§5, §6's REQ-AWG-02/03/04/06/07 and §7's R-1…R-4 were approved
  at v1/v2/v3 and are untouched by this erratum; nothing below re-opens them.
- Re-litigating findings already dispositioned. SE F-01 (C-5's soft threshold) and SE F-02 (v1.12's
  queue-block attribution) were resolved at v3 and stay resolved; SE Q-01 and Q-02 remain open by
  design and are not converted into findings here.
- Product, UX or test-pyramid judgement. Whether `approved (shipped)` is the right *product* status
  vocabulary and whether the file relocates to `docs/completed/` are pm-author's and SE Q-02's
  respectively; I record only the engineering consequence.

## Non-Goals

## Constraints

Constraints this confirmation was measured under, and what each one implied:

- **The baseline is cited at its `Version`.** `pdlc-wave-gate-baseline.md` states that "a consumer
  cites this file **at its `Version`**; a content change unaccompanied by a version bump is itself a
  defect." The REQ's v1.14 changelog and AC-1.1 both cite **baseline v1.2 §4**, and the file's header
  reads `Version | 1.2 · 2026-08-20`. Version-pinned citation holds.
- **The baseline's re-verification rule.** "Every fact below was read at `c8aa22a4`. A later
  default-branch commit is a fresh check, not an inherited one." §4's facts are stamped
  `Measured at origin/main 11420461`. I checked that the rule has *not* fired again this round:
  `git rev-parse --short origin/main` → `11420461` (`Merge pull request #67`), the same base §4 names.
  So M-WG-13 / M-WG-14 are still readings at the current default branch, not stale ones.
- **DC-02 / the pm-author altitude rule.** A REQ may not carry file/line-cited internals; shipped
  behaviour enters as measured-fact ids from the constraints file. The erratum adds two commit
  SHAs and two `M-WG-*` ids — no file:line anchors, no signatures, no mechanics. AC-5.1's new
  sentences stay on observables and explicitly re-route mechanism to O-1 ("The mechanism of
  restoration is TSPEC's to choose"). The altitude bar is respected; I file no altitude finding.
- **DEC-DOC-01.** No raw `file:line` anchor was introduced into the document by this delta. The two
  new anchors are commit SHAs used as *measurement bases*, which is exactly the runtime-measured
  evidence carve-out — position is the claim under test.
- **C-5's own size budget.** The document's own constraint names 700 lines / 61,440 bytes hard and
  630 lines / 55,296 bytes soft. Post-delta the file measures **668 lines / 54,045 bytes** — over the
  soft line bound, under both hard bounds and under the soft byte bound. See F-04.

## Acceptance Criteria

What this confirmation had to satisfy before it could approve — the routed items, each
re-measured rather than read off the changelog.

| # | Routed item (raiser) | Landed? | Evidence re-measured this round |
|---|---|---|---|
| 1 | AC-1.1 / R-5 argue from the pre-A6 catalogue; name `c8aa22a4` (te-review) | **Yes** | AC-1.1 now reads "The five-member 'before' this argues from is the reading at base commit `c8aa22a4`; HEAD already carries A6 (baseline v1.2 §4, M-WG-13)." R-5 gains "The pre-change readings are measured at `c8aa22a4`; M-WG-13/M-WG-14 are the post-change ones." Both verified against `pdlc-wave-gate-baseline.md:70`, which names `c8aa22a4` as exactly the base at which M-WG-8's five-member reading is true and this base false. `git show c8aa22a4` resolves. |
| 2 | AC-5.1's "observably identical" contradicted by AC-6.1's append and M-WG-7's queue write (te-review) | **Yes** | AC-5.1 now pins "The observation point is the moment restoration completes" and excludes "AC-6.1's record append and AC-5.2's queue-row write (M-WG-7)". Both carriers verified: AC-6.1 does mandate an append on any invocation; AC-5.2 does carry the `halted` queue-row write and cites M-WG-7, whose baseline row reads "The halt is recorded in the queue... rewrites the feature's queue row to `halted`". Pinning *and* excluding is belt-and-braces, which is the right call here — see Positive Observations. |
| 3 | Ignored-path boundary on AC-5.1 (pm-author) | **Yes** | "So are paths ignored by `.gitignore`, which are operator files A6 never wrote and never restores over." This closes the destructive reading (a tree-wide restore that also cleans ignored paths) without naming a mechanism, so it stays inside the altitude rule. |
| 4 | No observable for a failed **capture** of the pre-A6 state (pm-author) | **Partially** | The control-flow half landed: "Given the pre-A6 state cannot be captured at all, Then no repair is proposed, none is applied, and the wave halts on its own gate (AC-5.2) — a different outcome from a failed restoration." The **operator-visible** half did not. See F-01. |
| 5 | `Downstream` row names a feature, not the artifacts fed (pm-author) | **Yes** | Row now reads "FSPEC, TSPEC, PLAN, PROPERTIES (all in this directory)". All four verified present in `docs/pdlc-advisory-wave-gate/`. |
| 6 | `Upstream` row carries a path, not the ordered chain (pm-author) | **Yes, with a regression** | Row now reads "`pdlc-advisory-tier` REQ (the five-seam tier this extends) → **REQ**" — ordered, terminal, this doc bold, matching the chain form every sibling non-REQ artifact uses. But the resolvable path was dropped in the process. See F-02. |
| 7 | `Cross-Reviews` row reads `—` (pm-author) | **Yes, but now inaccurate** | Row now reads "harvested into `LEARNINGS-pdlc-advisory-wave-gate.md`", which is the routed text verbatim and true of the 116 harvested rounds. It is not true of the rounds now on the branch. See F-03. |
| 8 | `Status` is `draft` although row 19 is `done` and PR #66 merged (pm-author) | **Yes** | Header reads `| pdlc | approved (shipped) | Claude | 1.14 | 2026-08-20 |`. Verified: `docs/_queue/QUEUE.md:81` is `| 19 | done | pdlc-advisory-wave-gate | ... |`; the baseline names PR #66 (`bb4d36fb`) as the merge. The changelog correctly records that relocation to `docs/completed/` remains SE Q-02's and is not taken here, so the Status flip does not silently pre-empt an open question. |

**Upstream fidelity re-check (DEC-ERR-03), beyond the item list.** Every id this REQ borrows from
its named upstream was resolved against the upstream file at its current version, not against my v3
reading:

- `REQ-pdlc-advisory-tier` **AC-1.6, AC-2.2, AC-3.4, AC-3.6, AC-9.2, BL-01, NFR-1** — all eight
  citation sites resolve to a defined criterion in
  `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`. No nonexistent-authority citation.
- The Upstream row's characterisation "**the five-seam tier this extends**" is faithful to upstream
  *as a document*: it still enumerates "the five seams A1–A5" and its per-seam report criterion still
  reads "listed for **all five seams A1–A5**". The five/six tension is a shipped-code fact, not an
  upstream-text drift, and AC-1.1's new sentence is precisely what keeps the two readings apart.
- "HEAD already carries A6" measured directly, not inferred:
  `grep -n "ADVISORY_SEAMS = " pdlc/workflows/orchestrate-dev.js` →
  `:1952  export const ADVISORY_SEAMS = Object.freeze(["A1", "A2", "A3", "A4", "A5", "A6"]);`.
  Six members at the tree this review runs on, consistent with M-WG-13.

## Risks

Composition risks the new AC-5.1 text creates or leaves standing. None of these is a High; I record
them because they are what the TSPEC has to honour, and because two of them are the reason F-01 is
Medium rather than Low.

- **The exclusion permits what AC-6.1 forbids, and only AC-6.1's specificity resolves it.** AC-6.1
  makes the record append the *precondition* of an action ("an action taken with no record written is
  a defect, and a failed record write refuses the action" — `REQ-pdlc-advisory-tier` AC-9.2), so on a
  failed repair the entry may well exist *before* restoration begins. AC-5.1 now excludes that entry
  from the tree comparison. Read alone, that permits a restoration which reverts the append and still
  satisfies AC-5.1. It does not license it — AC-6.1 independently mandates the entry, and the
  specific rule wins, exactly as AC-2.1 wins over AC-2.2's unclassifiable case. The composition is
  resolvable, but only by a reader who holds both criteria at once. F-05 records the one sentence
  that would close it.
- **Two overlapping devices guard the same contradiction.** Pinning the observation point at
  restoration-completion *already* excludes anything the run owes afterwards; naming the two carriers
  as well is redundant. Redundancy is the right error to make here — the carriers are named, so a
  TSPEC author who orders the record append *before* restoration is still covered — but a future
  editor who deletes one device believing the other subsumes it would silently change the contract in
  one ordering and not the other.
- **The ignored-path boundary is asserted, not derived.** "operator files A6 never wrote and never
  restores over" is a claim about A6's write set. Nothing at REQ altitude can pin it, and O-1 owns
  the mechanism, so the risk is that a TSPEC-chosen mechanism with wider reach than
  a `git`-tracked restore (anything in the `clean -x` family) would violate the boundary while
  claiming compliance. The criterion is now the right shape to catch that in review; there is no
  oracle at this altitude that catches it automatically.
- **The failed-capture arm is a third disposition in a two-disposition criterion.** AC-5.1 previously
  described one failure mode (restoration failed); it now describes two (capture failed, restoration
  failed) with materially different observables. The per-seam row of AC-2.4 and the record entry of
  AC-6.1 are both keyed to invocation and disposition, and neither has been told which value the new
  arm carries. That is F-01.

## Obligations

- **O-1 is unchanged and still correct.** AC-5.1's added sentences deliberately stop short of the
  mechanism ("The mechanism of restoration is TSPEC's to choose (O-1)"), and O-1's own text already
  reads "The restoration mechanism behind AC-5.1, **and the point at which the pre-A6 tree state is
  captured**, are TSPEC's to specify. This REQ states only the observable outcome." The erratum's
  failed-capture arm is therefore the *observable* half of an obligation O-1 already owns the
  mechanism half of — the two are complementary, not overlapping, and O-1 needs no edit.
- **No new obligation is required by this delta.** The one gap I found (F-01) is a missing observable
  at this altitude, not a mechanism to be deferred; it belongs in AC-5.1's sentence, not in a new
  O-row. Creating an obligation for it would move a requirement into the TSPEC's discretion, which is
  the wrong direction.
- **SE Q-02 stays open and is now load-bearing.** With `Status` flipped to `approved (shipped)`, the
  document asserts a completed state while sitting outside `docs/completed/`. That is a coherent
  intermediate state and the changelog says so explicitly, but it is the last thing standing between
  this file and the relocation Q-02 describes. F-03 and F-04 both dissolve the moment Q-02 is taken.
- **O-2's scope is untouched by this delta.** I re-checked that the new AC-5.1 text does not create a
  durable-counting expectation that would collide with O-2's "resolution counts do not survive the
  run" limit (AC-6.4). It does not: the failed-capture arm produces a halt, and halts are already
  durably countable via the escalation log.

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(carried from v3, still open, still non-gating)* — unchanged by this delta. |
| Q-02 | *(carried from v3, still open)* — relocation of this feature's artifacts to `docs/completed/`. This round raises its priority: see the Obligations note above and F-03/F-04. |
| Q-03 | On the failed-capture arm (F-01): is a capture failure an *A6 invocation* for AC-6.1's purposes? If yes, the record entry is already mandated and the answer is one cross-reference; if no, the arm is invisible to the record and AC-2.4's per-seam row shows a zero that an operator cannot distinguish from "A6 never fired". I do not think this REQ should decide the mechanism, only which of the two observables the operator gets. |
| Q-04 | Was dropping the resolvable upstream path from the lineage header (F-02) deliberate — i.e. is the chain form now the house style for REQ `Upstream` rows, superseding the path form the three sibling REQs in `docs/completed/` use? If so this is a Process signal for harvest rather than a document nit. |

## Questions

## Positive Observations

- **The erratum is genuinely targeted.** 21 insertions, 9 deletions, three regions, zero collateral
  edits. I diffed the whole file, not just the named sections: nothing outside the header block,
  AC-1.1, AC-5.1 and R-5 moved a byte. That is what makes a delta confirmation cheap, and it is not
  the norm — an erratum that touches only what it was routed to touch lets the reviewer spend the
  round on upstream fidelity instead of on scope policing.
- **`c8aa22a4` is the *right* base, not merely *a* base.** The obvious cheap fix would have been to
  name any pre-A6 commit. The one chosen is exactly the base `pdlc-wave-gate-baseline.md:70` already
  names for M-WG-8's five-member reading, so AC-1.1, R-5, the FSPEC's §2 before-base paragraph and
  the baseline now all argue from one commit. Three documents agreeing on a measurement base is worth
  more than any of them being individually right.
- **AC-1.1 keeps M-WG-8 rather than swapping in M-WG-13.** The temptation on an erratum like this is
  to "update" the citation to the current fact, which would have destroyed the criterion's meaning —
  AC-1.1 is *about* the transition. Naming M-WG-8 as the before, M-WG-13 as the after, and the commit
  each is read at, is the reading that survives the next default-branch move. This also honours the
  disposition SE v2 F-02 recorded ("AC-1.1 and R-5 correctly left citing M-WG-8 as the pre-change
  fact") rather than quietly reversing it.
- **AC-5.1's failed-capture arm is written as a product outcome, not a mechanism.** "no repair is
  proposed, none is applied, and the wave halts on its own gate (AC-5.2)" states three observables
  and defers the rest to O-1. A weaker author would have specified where the snapshot lives. The arm
  also names its own contrast — "a different outcome from a failed restoration" — which is the
  sentence that stops a TSPEC author collapsing the two paths into one error branch.
- **The ignored-path boundary was the destructive reading, and it is now closed.** Read literally,
  the pre-erratum AC-5.1 required a restore that would have had to reach operator files A6 never
  touched. Catching that at REQ altitude, before a TSPEC author picked a `clean`-family mechanism to
  satisfy it, is the cheapest possible place to have caught it.
- **The Status flip does not pre-empt SE Q-02.** `approved (shipped)` landed *and* the changelog says
  "relocation still SE Q-02's" in the same sentence. Disposing one field without silently absorbing
  the adjacent open question is exactly right.

## Recommendation

**Approved with minor changes.**

The delta resolves seven of the eight routed items outright and the eighth (item 4) in its
control-flow half. Nothing I previously approved is broken by it: I re-read AC-5.2, AC-6.1, AC-2.4,
O-1 and the eight upstream-tier citations against the new text and against upstream at its current
version, and the document remains a faithful compression of it. No High finding, so this
confirmation approves and the phase proceeds.

What I would change, none of it gating:

1. **F-01 (Medium)** — give the failed-capture arm its operator-visible observable. One clause on
   AC-5.1 naming whether the run reports the arm through the advisory record (AC-6.1) and what the
   per-seam A6 row of AC-2.4 reads, or an explicit statement that the arm is not an invocation and
   therefore carries neither. Either answer is fine; the silence is the problem, because AC-2.4's row
   oracle cannot be written against it as it stands.
2. **F-02, F-03 (Low)** — two lineage-header rows: restore the resolvable upstream path alongside the
   new chain, and qualify the `Cross-Reviews` row so it does not assert harvest over the rounds
   currently on the branch.
3. **F-05 (Low)** — one cross-reference on AC-5.1 making explicit that excluding the record carriers
   from the tree comparison does not license reverting them, AC-6.1 still governing.
4. **F-04 (Low, inherited)** — the 630-line soft budget, which SE Q-02's relocation dissolves.

If the orchestrator prefers to spend no further rounds on this document, every item above is safe to
carry into the FSPEC/TSPEC layer as-is *except* F-01, which should be answered before a test author
writes an oracle over AC-5.1's failure arms.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | The failed-capture arm states control flow but no operator-visible observable: whether it is an A6 invocation for AC-6.1's mandatory record append, and what AC-2.4's per-seam A6 row reads, are both unstated — so the arm is indistinguishable from "A6 never fired" and no oracle can be written over it | §6 AC-5.1 |
| F-02 | Low | delta | local | The `Upstream` row's rewrite to chain form dropped the resolvable path `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`; all three sibling REQs in `docs/completed/` carry the path form, so the reader now has a chain but no way to reach its first link | Lineage header, `Upstream` |
| F-03 | Low | delta | local | `Cross-Reviews` reads "harvested into `LEARNINGS-...`", true of the 116 rounds LEARNINGS §Harvested enumerates but false of the ten `CROSS-REVIEW-*` files on the branch now (this file makes eleven), which are post-harvest erratum rounds and appear in no LEARNINGS table | Lineage header, `Cross-Reviews` |
| F-04 | Low | inherited | nonlocal | The document is 668 lines against C-5's own 630-line soft budget (54,045 bytes, inside the soft byte bound and both hard bounds); the delta added 12 lines to an overage v3 already recorded, and SE Q-02's relocation is what dissolves it | §5 C-5 / whole document |
| F-05 | Low | delta | local | Excluding AC-6.1's record append from the tree comparison, read alone, permits a restoration that reverts the append — AC-6.1's independent mandate is what forbids it, but the composition is left for the reader to assemble from two criteria | §6 AC-5.1 |

FINDING: Medium | delta | local | §6 AC-5.1 | Failed-capture arm gives control flow ("no repair proposed, none applied, wave halts on its own gate") but no operator-visible observable: silent on whether it counts as an A6 invocation for AC-6.1's mandatory record append and on what AC-2.4's per-seam A6 row reads, so the arm cannot be distinguished by an operator from A6 never firing, and AC-2.4's row oracle cannot be written against it
FINDING: Low | delta | local | Lineage header, `Upstream` | Chain-form rewrite dropped the resolvable path `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`; sibling REQs in `docs/completed/` all carry the path form, so the reader gets an ordered chain with no way to reach its first link
FINDING: Low | delta | local | Lineage header, `Cross-Reviews` | "harvested into LEARNINGS-pdlc-advisory-wave-gate.md" is true of the 116 rounds LEARNINGS enumerates but false of the ten CROSS-REVIEW-* files presently on the branch, which are post-harvest erratum rounds carried in no LEARNINGS table
FINDING: Low | inherited | nonlocal | §5 C-5 | Document is 668 lines against C-5's own 630-line soft budget; pre-existing overage recorded at v3, widened by 12 lines this round, dissolved by SE Q-02's relocation
FINDING: Low | delta | local | §6 AC-5.1 | Excluding AC-6.1's record append from the tree comparison, read in isolation, permits a restoration that reverts it; only AC-6.1's independent mandate forbids this, and the REQ leaves that composition for the reader to assemble


## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 4}
