# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.0, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 6
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v5 was the REQ as of `73de2de` (the tree at
`668cec6`); this review covers `668cec6..HEAD` on that file — the v2.0 altitude split, commits
`05a0838`, `b3a0918`, `b473f2e`, `437b2ad`, `72b333c`, `04b359f`, `8d77618`. Sections unchanged since
v5 were not re-litigated.

## 1. Disposition of the v5 findings

**All four v5 findings are closed, and two of the four were closed at a different altitude than I
asked for — better than the fix I proposed.** Both v5 Highs were about this document specifying the
behaviour of shipped code it does not own; v2.0's answer was to stop doing that here at all. I
verified the relocations rather than accepting them: a finding is not closed by being moved unless
the new home actually carries it.

| v5 id | Sev | Status | Where it closed, and what was checked |
|---|---|---|---|
| **F-01** | **High** | ✅ closed, and at the root | I asked the REQ to choose between suppressing the unconditional recovery emit and admitting it. v2.0 does something better: it (a) promotes the control-flow facts into the shared baseline as **`M-8a`–`M-8j`** — `M-8b` states the two channels are disjoint and that *"a criterion that says one channel replaces text on the other is naming a substitution the module has no seam for"*, `M-8d` states the emit is unguarded and fires on every halt class — and (b) moves the criterion that needed them to `REQ-RCV-07`, where **O-6** specifies the *suppression seam* explicitly, **NR-3** scopes it to the two row-B variants, **R-14** names the widened-seam regression, and **O-10** carries the control leg (suppressed line **absent** on each refusing entry, **present** on a control halt of another class). That is option (i) of the two I offered, with the seam, the scope and the regression test that option needed. Nothing of it remains in this document, which now mints no operator string at all (§6). |
| **F-02** | **High** | ✅ closed by relocation, and the sequel leg exists | The torn-write residue and its sequel moved to `REQ-RCV-07` **AC-7.5** (byte confirmation, the value-tear analysis, *act 1*) and **AC-7.4** (the sanctioned repairs). The leg I asked for is there verbatim in that REQ's O-10: *"their sequel, asserted positively — from that residue, the next entry **after act 1** finds `A < H`, the clearance unspent … while the next entry **after act 1 was skipped** finds `A = H`, `W` = 1 and the clearance gone: **the pair**, because that entry is where the clearance is actually lost"*. That is the finding, answered as a mutation pair. What this REQ keeps is only the confirmation *obligation* and its fail-closed disposition, which is the right residue at this altitude. |
| **F-03** | Low | ✅ closed | §3.1 now reads *"`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`, and `pdlc-rcv-panel-topology` depends on the two of them."* The antecedent is restored and the deleted *why* clause came back with it, which also retires half of Q-02's evidence problem. |
| **F-04** | Low/Process | ✅ closed, and **mechanised** | The document is now **477 lines / 52,052 bytes** against the 700 / 61,440 ceiling — 85% of the byte budget, from 99.995%. More durably, the finding was turned into a tool: `pdlc/hooks/scripts/check-req-size.sh` gained a **soft threshold at 90%** (630 lines / 55,296 bytes) whose message is precisely the lesson (*"Relocate shared baselines, thresholds and catalogue rows to `docs/_constraints/` now, before the next review round — do not fund the next revision by compressing this document."*), with `pdlc/workflows/__tests__/hookCompatibility.test.js` pinning it. A Process finding that ends as an executing check is the best available outcome. Both split halves sit under the soft threshold (477/52,052 and 505/52,627). |

**Independent re-verification of the split, since a relocation is only as good as its citations.**

- **Every `M-*` id this REQ cites exists in the baseline.** Cited: `M-1a`–`M-1e`, `M-2f`, `M-7a`,
  `M-7b`, `M-7d`, `M-7e`. All ten are defined rows in `docs/_constraints/pdlc-rcv-baseline.md` §2. No
  dangling id.
- **NB-4 holds mechanically.** A scan for `.js:` and for bare line references across the whole
  document returns **zero hits**. The claim *"this document now carries no line citation and no claim
  about shipped control flow"* is true as written, not aspirational.
- **Every `REQ-RCV-07` cross-reference resolves.** AC-7.1, AC-7.2, AC-7.3, AC-7.4, AC-7.5, AC-7.6,
  §6, O-6, O-10, O-12, R-10, R-11 all exist in
  `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md`. The two *step-level* citations are exact:
  AC-1.1's *"the strictly-increasing check on `WINDOW-START:` values (AC-7.1 step 2)"* matches step 2's
  *"strictly greater than every `WINDOW-START:` value before it"*, and §4/§6's *"its sole emitter and
  its `{reason}` selection are AC-7.1 step 4's"* matches step 4's *"exactly one S-16 notice … `{reason}`
  belongs to the first failing line in document order"*.
- **The catalogue delegation is sound.** Catalogue §2's S-13/S-14 rows do say *"AC-1.5(4)'s ordered
  algorithm"* and its S-16 producer cell says *"AC-1.5(4) step 4"*; §4's one-sentence substitution rule
  plus §4's own S-16 row cover both forms, and the catalogue is genuinely untouched.
- **The `N-13` collision claim is true.** `pdlc-rcv-fixed-point-stop` §7 N-13 is *"Re-specifying the
  round budget…"*; `pdlc-rcv-finding-quality` §7 N-13 is *"Deciding, mechanically, whether a reviewer
  applied AC-5.1's test correctly."* Two different non-goals under one id. The `NB-*` namespace is
  justified by evidence, not by taste — see F-03 below for the id class it did **not** cover.

## 2. Disposition of the v5 questions

| v5 id | Status | Note |
|---|---|---|
| **Q-01** (does this REQ intend to change the shipped *one recovery act per halt* invariant into *one per halt class*?) | ✅ answered, and by the split | The question is no longer this document's: the suppression seam is `REQ-RCV-07` O-6's, and it answers exactly what I asked — *"on the two row-B variants the refusal's own recovery text stands in its place, and **every other halt class keeps that line unchanged**"*, with that REQ's R-14 naming the widened-seam regression and its O-10 testing both sides. The generalisation is stated once, in the document that owns the seam, rather than as a per-row exception in a §6 table. |
| **Q-02** (is `W` guaranteed absent from every operator- and downstream-visible surface on a refusing entry?) | ⚠️ still open, but the evidence is back and the question is now **`REQ-RCV-07`'s** | The §3.1 clause that names why the successor depends on this REQ (*"both its tests are stated over `W`"*) was restored (F-03 closed). The refusing entry itself is now AC-7.2/AC-7.6 material, so the question belongs with row B's cells. Carried, **not re-filed here** — filing it against this document would ask it to specify a surface it deliberately no longer owns (NB-3). |
| **Q-03** (was a single in-entry retry of the confirmation read considered and rejected?) | ✅ no longer this document's | The byte confirmation is `REQ-RCV-07` AC-7.5. Carried there. |

## 3. Findings

Scanned the changed sections only — the v2.0 header, §1's successor pointer, §3.1's X-06 row and
sequencing paragraph, §4's delegation note, §6's preamble and two rows, §7's `NB-*` preamble and
NB-3/NB-4, §8's O-10/O-12, §9's R-10/R-14 and §10's split mapping. **One High.** It is not about
anything the split moved out; it is about the **new clause that says what an implementer does in the
interval the split created**. The split introduced a production stub, and the two places that
describe it — X-06 and R-14 — describe it in a way that would take the review loop down for a whole
queue row.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Cross-Feature | **The prescribed fail-closed stub is a *constant*, and AC-1.5(4)'s false-branch refuses the phase unconditionally — so "stub it invalid" does not degrade the reset, it refuses every document-typed review phase in the repo, including on branches with no post-mortem at all.** X-06 says an implementation of this REQ alone *"must stub it **fail-closed** (invalid ⇒ refuse). A stub returning *valid* is the fail-open AC-1.5(4) exists to close."* R-14 repeats it and calls it settled: *"a stub returning *invalid* refuses rather than grants and is safe by construction."* `REQ-RCV-07` R-16 says the same thing from the other side. Trace it against this document's own clauses. AC-1.5(4)'s third-conjunct bullet is stated over the **predicate**, not over the gate: *"when it is **false**, fail-closed and in all four respects at once: **`W` = 1**; the clearance is not consumed …; the run report emits exactly one `reset-region-corrupt: {reason}` notice; and the entry **refuses the phase** rather than halting, terminating the invocation on step G's path (M-7a, M-7b) with the feature's queue row written `halted`."* The predicate is evaluated on **every** entry — `W` must be resolved whether or not a clearance exists (§4.1's `W` row), and `REQ-RCV-07` AC-7.3 makes the resolution *"unconditional"* inside the phase body, after `phaseGate`'s skip exit and before any round opens. So with the predicate stubbed to the constant *invalid*: **every** entry of R/F/T/D/P/PR, on **every** feature, on a branch that has never halted and whose reset region does not exist, emits S-16 and refuses the phase, terminating the invocation with the queue row `halted`. That is not a narrowed window; it is the review loop refusing to review anything. Note what makes it certain rather than arguable: AC-1.5(4) itself declares the empty region **valid** (*"The empty region satisfies it vacuously — an empty region is valid, not corrupt"*), which is exactly the input a constant-`invalid` stub gets wrong, and there is no clause anywhere that gates the refusal on a region existing, on `H ≥ 1`, or on a clearance being present. The blast radius is concrete and self-inflicted: per `docs/_queue/QUEUE.md` the net pickup order is **10 → 12 → 18**, so `pdlc-rcv-finding-quality` (row 12) runs its **entire** pipeline — Phase R, F, T, P, PR, each a document-typed review loop — after row 10 merges and before row 18 lands the real algorithm; and row 18's own Phase R would be refused by the code row 10 shipped, so the stub blocks the delivery of its own replacement. **The fix is one sentence, and it is a mechanism sentence, not wording.** *Fail-closed* for a **total predicate** is not a constant; it is the predicate's stated meaning with every undecidable case resolved against the caller. State the stub's required **shape**: the interim implementation returns **true on the empty region and false on any non-empty one** (equivalently: it implements step 3's count comparison and treats any answering line as unvalidatable), so it refuses exactly the entries that would otherwise consume a clearance under an unverified region, and refuses nothing else. That is genuinely safe by construction — it cannot grant a window, it cannot open one on an unvalidated region, and it leaves every branch with no reset region behaving exactly as it does today. The alternatives are worse but must be named if chosen: give this REQ a **`depends-on` edge** on `pdlc-rcv-reset-region` and co-deliver (which contradicts §3.1's *"deliverable alone"*), or state that the FSPEC may not wire the conjunct into the gate until AC-7.1 exists (which makes AC-1.5(4) partly unimplemented rather than stubbed, and needs saying out loud). Whichever is chosen, **R-14's disposition and X-06's *Behaviour until it ships* cell must carry the same words**, and O-10's *"driven from a **stub or double**"* leg must assert the stub's shape — today it asserts only that the gate legs are exercised, which a constant-`invalid` stub satisfies while bricking production. | §3.1 X-06; AC-1.5(4) *"The third conjunct, as a named predicate"*, second bullet; §9 R-14; §8 O-10; `REQ-RCV-07` AC-7.3, R-16; `docs/_queue/QUEUE.md` |
| F-02 | Low | Local | **"Queued immediately behind it" is false against `docs/_queue/QUEUE.md`, and it is stated twice as the mitigation for F-01's risk.** §3.1's *Consequence for sequencing* says *"`pdlc-rcv-reset-region` is queued immediately behind it"*; R-14's disposition says *"The queue orders `pdlc-rcv-reset-region` immediately behind this row"*. The queue at HEAD has row 10 `pdlc-rcv-budget-stop`, row **12** `pdlc-rcv-finding-quality`, row **18** `pdlc-rcv-reset-region`, and its own note states the resulting pickup order explicitly: **"Net pickup order: 10 → 12 → 18 → 17 → 11"**. One full feature is picked up between them, and it is a feature whose five review-loop phases all run under the stub — which is why this is worth filing rather than letting slide as a rounding error in prose: it is the load-bearing half of R-14's *"sequencing is the mitigation"*. Either repoint both sentences at the fact (*"queued two rows behind it, with `pdlc-rcv-finding-quality` between"*) or change the queue. Note `REQ-RCV-07` §3.1 X-07 carries the same wording and would need the same correction. | §3.1 *Consequence for sequencing*; §9 R-14; `docs/_queue/QUEUE.md` rows 10/12/18 and its *Why `Order 18`* note |
| F-03 | Low | Cross-Feature | **The split minted a namespace for the id class that had already collided and left two classes colliding across the very pair it just created.** §7 argues the case well — *"the family has minted colliding `N-1x` ids (`N-13` differs between `pdlc-rcv-fixed-point-stop` §7 and `pdlc-rcv-finding-quality` §7) — so this document's own non-goals use a **per-REQ namespace, `NB-*`**"* — and I verified the collision is real. But the same day's split produced **`O-10`, `O-11`, `O-12` in both documents with different content** (this REQ's O-12 is `W`-as-resolved-value; `REQ-RCV-07`'s O-12 is the answering-line append and confirmation) and **`R-10` and `R-14` in both with different content** (this REQ's R-14 is *the step-4 conjunct is not implementable until `REQ-RCV-07` ships*; that REQ's R-14 is *the suppression seam is a change to shipped behaviour*, while its **R-16** is this REQ's R-14 restated). Every cross-document citation I checked is namespace-qualified — *"that REQ's R-10"*, *"`REQ-RCV-07` O-12's"*, *"**its** O-10"* — so nothing is currently ambiguous, and that discipline is why this is Low rather than Medium. It is filed because the next reader will be an FSPEC/TSPEC author writing *"per O-12"* in a document that consumes both, and because the lesson generalises: **when a REQ is split, the id classes that must be namespaced or globally allocated are all of them (`N`, `O`, `R`, `X`), not just the one that has already bitten.** Cheapest fix consistent with §7's own reasoning: give the obligations and risks the same treatment (`OB-*` / `RB-*`, or allocate never-reused numbers across the family the way `docs/_queue/QUEUE.md` allocates `Order`). | §7 preamble; §8 O-10/O-11/O-12; §9 R-10/R-14 against `REQ-RCV-07` §8, §9 |
| F-04 | Low | Local | **X-06's *Direction* cell says *"owed to"* where the thing crossing is inbound.** X-05's cell reads *"**read from** `pdlc-rcv-fixed-point-stop`"* and describes something this REQ consumes. X-06's reads *"**owed to** `pdlc-rcv-reset-region`"* and also describes something this REQ consumes — the ordered validation algorithm behind its own predicate. Two opposite labels for the same direction in adjacent rows of one table. Compounding it, §3.1's opening sentence — *"This REQ is the **head of the family** — nothing it needs is owed by a sibling, which is why `depends-on` is empty"* — is contradicted one row later by X-06, a decision procedure it needs and a sibling owes. The paragraph rescues itself with *"This is a **forward** edge, not a `depends-on`"*, but the flat claim above it is the stated justification for `depends-on: []`, and F-01 is what that justification costs. Suggest: label X-06 *"read from"* like X-05, and qualify the head-of-family sentence to *"nothing it needs **at requirements altitude** is owed by a sibling"* — the true claim, and the one §10 actually argues. | §3.1, X-05/X-06 table and the paragraph above it |

## 4. Questions

| ID | Question |
|---|---|
| Q-01 | F-01 assumes the conjunct is **wired into the gate** from the moment row 10 ships, with only the decision procedure stubbed. Is that the intent, or is the intent that row 10 ships AC-1.5(4)'s counts-and-marker gate with the third conjunct **not yet present**, and row 18 adds it? Both are defensible; they differ in what an implementer builds and in what O-10 can assert, and X-06's *"must stub it fail-closed"* only makes sense under the first. Say which, in X-06's *Behaviour until it ships* cell. |
| Q-02 | Does anything in the family require the two split halves to land in the **same release** of the plugin, as opposed to the same queue sweep? The distribution story is per-commit (`pdlc/workflows/dist/` rebuilt in the same commit, O-11), so a consumer who installs between row 10 and row 18 gets the stub whatever the queue does. If co-release is required, that is a constraint on `pdlc/RELEASE-CHECKLIST.md`, not on the queue, and it is currently stated nowhere. |
| Q-03 | Carried from v3–v5, now `REQ-RCV-07`'s: is `W` guaranteed absent from every operator- and downstream-visible surface on a refusing entry? Recorded here only so the trail is unbroken when harvest reads these files; **not** a finding against this document. |

## 5. Positive Observations

- **The split is the right cut, and it is the first one in this family that separated *altitude*
  rather than *topic*.** The v1.1 split reduced size and not altitude; v2.0's own §10 says so in the
  postmortem's words and then acts on it. The test of the cut is stated and it holds: everything that
  stayed — §1–§4.1, AC-1.1–AC-1.4, AC-1.5(1)–(3) and (5), O-5, O-9, O-11 — is exactly the material
  that drew no blocking finding after round 2, and everything that generated the last three rounds of
  findings went across. I checked the *What moved* table row by row against
  `REQ-pdlc-rcv-reset-region.md` and every clause has a real home, not a forwarding address.
- **Both of my v5 Highs were closed by promoting facts into the baseline instead of arguing them in
  the REQ.** `M-8a`–`M-8j` are the best answer available to the failure mode that produced five
  rounds: `M-8b` (*the two channels are disjoint; a criterion that says one replaces text on the other
  names a substitution the module has no seam for*) is my v5 F-01 turned into a measured fact any
  sibling can cite, and `M-8h` (*`No POSTMORTEM was written.` is not emitted on the class where the
  write actually failed*) is a trap nobody had found yet, stated before it cost anyone a round. That
  is the durable output of this Phase R.
- **NB-4 is a rule the document actually obeys, and it is checkable in one grep.** Zero line
  citations, ten `M-*` ids, all ten resolving to real baseline rows. A discipline stated in §7 and
  verifiable mechanically is worth more than the same discipline stated in prose and enforced by
  reviewer attention — which is what the last five rounds tried.
- **The Process finding became a tool.** `check-req-size.sh`'s new 90% soft threshold, with a message
  naming the correct remedy (*relocate to `docs/_constraints/` — do not fund the next revision by
  compressing this document*) and a test pinning it, converts my v5 F-04 from advice into an
  executing check that will fire on the next REQ before it reaches 3 bytes of headroom. Both halves of
  the split now sit under it.
- **The delegation is stated once and made mechanical.** §4's *"read *AC-1.5(4)'s ordered algorithm* as
  *AC-7.1* wherever the catalogue says it"* is the right shape for a cross-document repoint: one
  substitution rule, catalogue untouched, ownership unchanged, seventeen ids still closed. I checked
  the catalogue rows it quotes and they say what it says they say.

## 6. Recommendation

**Needs revision**

All four v5 findings are closed, two of them at a better altitude than I asked for, and the split
itself is sound: every relocated clause has a real home, every `M-*` id resolves, every `REQ-RCV-07`
cross-reference resolves including the two step-level ones, NB-4 holds mechanically, and nothing that
stayed regressed. If F-01 were not present I would approve this document.

What reopens the round is **one High, and it is on the clause the split created rather than on
anything it moved**:

1. **F-01** — X-06 and R-14 prescribe stubbing *the region validates* as the **constant** *invalid*
   and call that *"safe by construction"*. It is not. AC-1.5(4)'s false-branch **refuses the phase**,
   the predicate is resolved on every entry (§4.1's `W` row; `REQ-RCV-07` AC-7.3's *unconditional*),
   and this REQ itself declares the **empty region valid** — the exact input a constant stub gets
   wrong. So the prescribed interim implementation refuses every document-typed review phase on every
   feature, including branches that have never halted, until row 18 ships. Per `docs/_queue/QUEUE.md`
   the pickup order is **10 → 12 → 18**, so a whole feature runs its five review phases in that
   interval — and row 18's own Phase R would be refused by the code row 10 shipped, so the stub blocks
   the delivery of its own replacement. **State the stub's shape, not its value:** valid on the empty
   region, invalid on any non-empty one — which cannot grant a window, cannot open one over an
   unvalidated region, and leaves every branch with no reset region behaving as it does today. Put the
   same words in X-06's *Behaviour until it ships* cell and in R-14's disposition, and give O-10's
   *stub or double* leg an assertion about the stub's shape (a constant-`invalid` stub satisfies
   today's leg while bricking production). If the intended answer is instead a `depends-on` edge and
   co-delivery, say that — but then §3.1's *"deliverable alone"* must go with it.

Three Lows accompany it and none of them is the reason for the verdict: **F-02**, *"queued
immediately behind it"* is off by one feature against the queue's own stated pickup order, and it is
R-14's mitigation, so it should move with F-01; **F-03**, `O-10/O-11/O-12` and `R-10/R-14` now collide
across the two halves of a split whose §7 mints `NB-*` precisely because id collisions have already
bitten this family — every current citation is qualified, so this is hygiene, not ambiguity; **F-04**,
X-06's *Direction* cell labels an inbound edge *"owed to"* where X-05 labels the same direction *"read
from"*, and §3.1's *head of the family* sentence needs the qualifier the rest of the paragraph
already implies.

Size is no longer a constraint on how the fixes are paid for: 477 lines / 52,052 bytes, under the new
90% soft threshold, with room for the sentences F-01 needs.

The durable signal from this round is one line, and it belongs in
`docs/_constraints/DOMAIN-CONSTRAINTS.md` if it recurs: **a "fail-closed stub" of a total predicate is
a *shape*, not a constant — a constant that always fails closed does not degrade the feature the
predicate gates, it denies every surface the predicate is evaluated on.** The v2.0 split is otherwise
the model for how this family should have been cut in the first place.

## Verdict

All four v5 findings are closed. Both v5 Highs were closed at the root rather than patched: the
control-flow facts they turned on were promoted into `docs/_constraints/pdlc-rcv-baseline.md` as
`M-8a`–`M-8j`, and the criteria that needed them moved to `REQ-RCV-07`, where O-6 specifies the
suppression seam, NR-3 scopes it, R-14 names the regression and O-10 carries both the control leg and
the torn-write sequel pair I asked for. I re-verified the split independently: all ten `M-*` ids
cited here resolve to real baseline rows, all twelve `REQ-RCV-07` cross-references resolve including
the two step-level ones, NB-4's *no line citation* claim is true in a grep, the catalogue delegation
quotes the catalogue accurately, and the `N-13` collision it cites is real. The v5 Process finding
was mechanised into `check-req-size.sh` as a 90% soft threshold with a test.

One High is open, on text v2.0 added rather than on anything it moved: X-06 and R-14 prescribe
stubbing *the region validates* as the **constant** *invalid* and call it *"safe by construction"*,
but AC-1.5(4)'s false-branch **refuses the phase**, the predicate is resolved on every entry, and the
empty region is declared valid — so the prescribed stub refuses every document-typed review phase on
every feature until `REQ-RCV-07` ships, and the queue's own stated pickup order (10 → 12 → 18) puts a
whole feature, and row 18's own Phase R, inside that interval. The fix is to state the stub's shape
rather than its value. Three Low findings accompany it: an *"immediately behind"* sequencing claim
that the queue contradicts, `O-*`/`R-*` id collisions across the two halves of the split, and a
mislabelled direction cell in §3.1. Per the approval rule, an open High means the document is not
approved.

VERDICT: Needs revision
