# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.3, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 9
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v8 was the REQ as of `dde2670`; this review
covers `dde2670..HEAD` on that file — commits `27ab566`, `677dc4d`, `0761a09`, `9806894`, `21297cd`
(97 changed lines across the §0 header/changelog, §3.1 X-06, §4's delegation, §4.1's two derivation
rows, §5 AC-1.5(4), §7 NB-3 and the collision pointer, §8 O-10, §9 R-14 and §10) plus the two files
the change reaches outside this document: `docs/_constraints/pdlc-rcv-split.md` (new §5.1, new §6)
and `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` X-07/R-16/O-10 (`3105033`). Sections
unchanged since v8 were not re-litigated.

## 1. Disposition of the v8 findings

**All four Lows are closed, each at the surface the finding named.** Nothing was closed by assertion;
every one was closed by an edit I could diff.

| v8 id | Sev | Status | What was checked |
|---|---|---|---|
| **F-01** (AC-1.5(4) and §4.1 state the conjunct unconditionally, no back-pointer to X-06) | Low | ✅ closed | `0761a09` adds a paragraph immediately after AC-1.5(4)'s false-branch bullet: *"**This conjunct's wiring waits for its decision procedure** (X-06): at this REQ's ship the gate evaluates its **first two conjuncts only**, so the dispositions above — and §4.1's two rows that restate them — are the **target state**, reachable at `REQ-RCV-07`'s commit, not behaviour this REQ's own delivery exhibits."* That is the clause I asked for, and it is placed where the misreading starts. Both §4.1 rows carry the matching qualifier (`W` row: *"the validation guard is unwired until `REQ-RCV-07` (X-06)"*; clearance row: *"**target state; that conjunct is unwired until `REQ-RCV-07` (X-06)**"*), so the two rows now read alike as asked. The one thing the `W` row's qualifier sweeps up is broader than the conjunct it defers — F-01 below, **Medium**, and it is the only reason this is not an approval. |
| **F-02** (the *any interim procedure* trichotomy over-claims) | Low | ✅ closed, and relocated | `21297cd` narrows X-06 to *"a **narrower** one deciding only what this REQ specifies must still disagree with AC-7.1 on ordering and highest round, unclearable in the **refusing** direction until AC-7.4"* — the narrower objection I named, in the terms I named it. The full argument moved to `pdlc-rcv-split.md` **§5.1**, which I read: it states the refusing horn, the granting horn, the narrower procedure (*"escapes both horns, but must still disagree with AC-7.1 on ordering and highest-round analysis"*) and the co-delivery rejection, each once, and says in its own header line that it was relocated *"so both ends of the paired edge cite one copy of the argument instead of restating it; nothing changed meaning in the move."* R-14 now cites §5.1 rather than restating. Carried to both sibling ends: `REQ-RCV-07` X-07 and R-16 both gained the narrower-procedure sentence — but in a **separate commit**, which is F-04 below. |
| **F-03** (the deliberately-unconsulted seam is the shape `dod-verify` flags) | Low | ✅ closed, in NB-3, with the formula I pointed at | `9806894` appends to NB-3: *"So is the *validate* seam being **present and unconsulted in production** at this ship (X-06): a DoD finding that it is an unwired integration is correct and known by construction, `REQ-RCV-07` wires it with AC-7.1, and it is **not** to be remediated by wiring it here."* That is NB-3's existing *correct and known by construction — file it there* pattern extended by one row, which is exactly the cheap fix, and it sits where the verifier reads. The §0 changelog names it too, so it is discoverable from the header. |
| **F-04** (O-10 leg 1 binds `{N}` twice) | Low | ✅ closed with concrete numbers | `27ab566` restates leg 1 as *"a readable `RESOLVED: yes`, and highest round on the branch = `windowEnd(1)` = **3** ⇒ the entry **grants** — exactly one `WINDOW-START: 4` appended at the end of the region"*. Both bindings are now literals, and they are the right two literals: the window that halted is `[1, 3]`, and the clearance opens at 4. The leg is now a fixture body a test can use verbatim, which was the point. |

**Independent re-verification of the new cross-document claims:**

- **`pdlc-rcv-split.md` §5.1 and §6 exist and carry what the REQ now delegates to them.** The file's
  headings are `## 5. Paired edges…`, `### 5.1 Why the validation conjunct is not wired before its
  procedure ships`, `## 6. The catalogue delegation, stated once`. The §0 header row's new citation
  (*"the shared *why the validation conjunct is unwired* argument (§5.1) and the catalogue delegation
  (§6)"*) resolves, as do §4's and R-14's.
- **The relocated catalogue delegation lost nothing.** I diffed the deleted §4 paragraph against
  `pdlc-rcv-split.md` §6 clause by clause: the S-12/S-13/S-14/S-16 receive-side rule, the *rule is
  over the references, not one phrase* justification, catalogue §3's row-schema reach (*"AC-1.5(4)'s
  step-4 path"*, *"fixed by `pdlc-rcv-budget-stop` §6"*) and the *catalogue may say so directly once
  `REQ-RCV-07` ships* closer are all present, with the REQ-relative references re-anchored to
  `REQ-RCV-01`. This is a move, not a compression that dropped a clause.
- **The `O-*`/`R-*`/`X-*` collision rule survived §7's rewrite** as a pointer
  (*"`pdlc-rcv-split.md` §5's rule applies — every cross-document citation names the owning REQ, as
  each here does"*), which is where I said the load-bearing half lives.
- **Sizes are mine, not the document's:** `wc -lc` gives **455 lines / 55,238 bytes** against
  `check-req-size.sh:47-48`'s soft thresholds (630 / 55,296). Headroom is **58 bytes**, down from
  171 — Q-01 below.

## 2. Disposition of the v8 questions

| v8 id | Status | Note |
|---|---|---|
| **Q-01** (is anything observable about the seam at row 10 other than its existence — and should the document say it is *structural only*?) | ✅ answered, and answered better than I asked | v2.3 did not add a *structural only* adjective; it added a **falsifier**. O-10: *"What this REQ owes over the seam is **one contract leg, on the production path**: the injected function's signature, and the interim composition calling it **exactly 0 times** — which falsifies an accidental early wiring and inverts cleanly at row 18."* That converts *the seam is unconsulted* from a claim into a test, and it pairs with NB-3's declaration so DoD reads *known* and PROPERTIES reads *asserted*. It also moved the non-validating legs wholly to `REQ-RCV-07` with a reason I had not made explicit and agree with: *"driving an unconsulted seam here would assert over a call graph this REQ's entrypoint never traverses, and would keep passing if the seam were deleted."* One thing the new leg needs and no document supplies — F-02 below, Low. |
| **Q-02** (does the next revision fit under the size soft threshold, or should §4.1/§6 relocate first?) | ✅ answered by relocating, ⚠️ but the headroom shrank anyway | The round relocated two blocks (§4's delegation → `pdlc-rcv-split.md` §6, X-06's argument → §5.1) and compressed §10 and §7, and still the file grew from 55,125 to **55,238** bytes — headroom 171 → **58**. That is the intended discipline working at the margin: the relocations bought roughly 1.6 KB and the round's new clauses spent slightly more. It is not a finding, but it decides the sequencing of the next revision — Q-01 below. |
| **Q-03** (carried, `REQ-RCV-07`'s `W`-visibility question) | — | Still that REQ's. Recorded only so the trail is unbroken for harvest. |

## 3. Findings

Scanned the changed sections only — §0 header/changelog, §3.1 X-06, §4's delegation pointer, §4.1's
two derivation rows, §5 AC-1.5(4)'s new wiring paragraph, §7 NB-3 and the collision pointer, §8 O-10,
§9 R-14, §10 — plus `pdlc-rcv-split.md` §5.1/§6 and `REQ-RCV-07` X-07/R-16/O-10. **One Medium, three
Low.** The Medium is a gap the round *opened*: a qualifier added to close v8 F-01 defers more than
the conjunct it was meant to defer, and what it sweeps up is decidable at this REQ today and reaches
`deriveRoundWindow`'s stated contract.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **Medium** | Local | **§4.1's new *target state* qualifier on the `W` row defers the whole word *invalid*, but only half of *invalid* is `REQ-RCV-07`'s — the other half is this REQ's own §6 grammar, decidable today, and the interim is now left with no stated answer for it.** The row reads *"Fail-closed: no absent or invalid value ever widens the window — **the validation guard is unwired until `REQ-RCV-07` (X-06)**, so the *invalid* half is target state."* But *invalid* covers two disjoint checks. (i) **Grammar**: §6's own S-13 row fixes `WINDOW-START: {N}` with *"`{N}` a decimal integer ≥ 1"*, so `WINDOW-START: abc`, `WINDOW-START: -2` or `WINDOW-START:` with an empty value violates a rule **this REQ owns**, needs no ordering analysis, no highest-round comparison and no AC-7.1 — it is decidable from one line in isolation at row 10. (ii) **Consistency**: *"consistent with the lines before it and with the highest round on the branch"* plus `H − A ∈ {0, 1}` — genuinely AC-7.1's, genuinely unavailable until row 18, correctly deferred. The qualifier defers both. So at this REQ's ship, what is `W` when the greatest `WINDOW-START:` line's value does not parse? Two readings, and they differ observably: **(a)** a line failing §6's grammar is not a `WINDOW-START: {N}` line, contributes no value, so the set is empty and `W` = 1 — fail-closed, and consistent with the row's own *"If absent"* cell; **(b)** the row means what it now says, the grammar check is target state too, and the implementation reads the greatest *parsed* value — `parseInt("abc")` / `Number("")` — yielding **`NaN`**, which then flows into `windowEnd(W)` and into `deriveRoundWindow`, whose contract AC-1.2 and O-12 pin as *"an ordinary **resolved value** (a decimal integer)"*. Reading (b) violates a contract two other clauses of this REQ state, and produces a window (`[NaN, NaN]`) whose comparisons are all false — which on the natural implementation admits **no** round, on a branch, permanently, with the region preserved by every later halt (AC-1.5(4)'s own prepending argument). This is not covered by the accepted R-10/R-14 residual, which is about a *widened* window an operator caused, nor by any O-10 leg: the interim legs are a well-formed region and no region at all, and the non-validating legs have just been handed to `REQ-RCV-07`, which does not run them on **this** REQ's interim composition. **Fix, one clause plus one leg:** qualify the row as *"the **consistency** half — ordering, the highest round on the branch, and `H − A ∈ {0, 1}` — is target state (AC-7.1); **§6's S-13/S-14 grammar is in force at this ship**, so a line whose value is not a decimal integer ≥ 1 contributes no value and `W` falls back to **1**"*, and add the matching interim leg to O-10 (*a region whose single `WINDOW-START:` value is malformed ⇒ `W` = 1, the ordinary window opens, **no** refusal, **no** S-16, counts unmoved*). That leg is decidable at row 10, survives row 18 like the other two, and is the one that stops `NaN` reaching `windowEnd`. | §4.1 `W` row; §6 S-13/S-14 rows; §5 AC-1.5(4) *This conjunct's wiring waits*; §8 O-10, O-12 |
| F-02 | Low | Local | **O-10's new contract leg is owed over *"the injected function's signature"*, and no document in the family fixes that signature.** I grepped both REQs and `pdlc-rcv-split.md` for a seam name, an arity or a parameter: X-06's *"injected, controllable seam"* and X-07's *"an injected seam the interim composition does not consult"* are the only mentions, and neither names it. AC-1.5(4) does fix the predicate's **domain and codomain** — *"a predicate on the region and the branch listing, **total and single-valued** (DC-01)"* — so a PROPERTIES author can derive *arity 2, returns a boolean*, but not the injection parameter's **name**, which is what a contract leg actually asserts against, and not whether it follows the repo's `_`-prefixed dependency-injection convention (`_agent`, `_readFile`, `_checkFile`, …). O-12 is the natural home — it already owns *how `W` reaches `deriveRoundWindow`* and the seam-free contract of the two pure functions — and it currently says nothing about this seam. Fix: one clause in O-12, *"and specify the **injected validate seam** — its parameter name (per the `_`-prefixed convention), its arity and its boolean return — which the interim composition accepts and does not call; `REQ-RCV-07` AC-7.1 supplies its implementation"*. Without it the leg is written three ways and two of them assert over a name the TSPEC did not choose. | §8 O-10 (*one contract leg, on the production path*), O-12; §3.1 X-06 |
| F-03 | Low | Local | **X-06's *"The call site exists as an injected, controllable seam … but the interim production composition does not consult it"* is self-contradictory on its face, and the contradiction now has a test that fails.** A call site that exists is a call site that is reached; what exists at this ship is the **injection point**, not a call. Under v2.2 this was a harmless imprecision. Under v2.3 it is not: O-10's new leg asserts the interim composition calls the seam **exactly 0 times**, so an implementer who takes *"the call site exists"* literally — evaluating the seam and discarding the result, which is a plausible way to *"replace a stub rather than a call graph"* at row 18 — writes code that reds the leg with no clause telling them which of the two normative sentences wins. The failure mode is a red build, not a shipped defect, which is why this is Low. Fix, one word each way: *"The **injection point** exists — the composition accepts the seam as a parameter — so row 18 adds a call rather than rebuilding a call graph, and **no call site is emitted at this ship**: the interim composition calls it **0 times** (O-10)."* Carry it to `REQ-RCV-07` X-07, which uses the same *"the call site exists as an injected seam"* phrasing, per `pdlc-rcv-split.md` §5. | §3.1 X-06; §8 O-10; `REQ-pdlc-rcv-reset-region.md` X-07 |
| F-04 | Low | Process | **The paired-edge obligation says *revise all four in the same commit*, and v2.3 did not — and cannot, under the authoring pacing contract the same pipeline imposes.** `pdlc-rcv-split.md` §5: *"Revise all four **in the same commit**, in the same words."* §10 asserts compliance: *"any revision to X-06 or R-14 is carried to X-07 and R-16 **in the same commit, in the same words** — v2.2's and v2.3's were."* They were not. X-06/R-14 were revised in `21297cd` and O-10 in `27ab566`, both touching this REQ only; `REQ-RCV-07`'s X-07, R-16 and O-10 were revised in a **separate** commit, `3105033`. **The words do agree at HEAD** — I diffed all six clauses and they carry the same decision, the same narrower-procedure argument and the same `Order 18` / 10 → 12 → 18 distance, which is the load-bearing half — so this is a rule-fidelity finding, not a divergence finding, and Low. But the rule as written cannot be honoured by this pipeline: `SKILL.md`'s pacing contract requires *one top-level section per edit, every write under 12,000 bytes, commit after each section*, so an edit spanning two documents' several clauses is **structurally** more than one commit. A rule the authoring discipline forbids will keep being violated and keep being reported as satisfied, which is worse than a weaker rule that holds. Fix: restate §5's obligation over the unit that is actually atomic here — *"revise all four **within the same revision**, before that revision is submitted for review; the reviewer checks both ends at HEAD, not the commit boundary"* — and drop §10's *in the same commit* claim to match. Worth carrying to harvest: **a cross-document atomicity rule must be stated over a unit the authoring pacing contract can deliver.** | `pdlc-rcv-split.md` §5; §10 *Paired edges must be revised together*; `pdlc/skills/*/SKILL.md` pacing contract |

## 4. Questions

| ID | Question |
|---|---|
| Q-01 | Headroom under the size soft threshold is now **58 bytes** (455 lines / 55,238 against 630 / 55,296). F-01's fix costs roughly 400–500 bytes and F-02's and F-03's another 300–400, so the next revision crosses it unless something relocates first. §4.1's durability table and §6's threshold rows are still the two candidates I named at v8, and `pdlc-rcv-baseline.md` is their natural home. Is the intent to relocate **before** writing the fixes? This is sequencing, not a finding — but it is now the third round in a row where the answer decides whether the hook warns. |
| Q-02 | F-01 asks for §6's S-13/S-14 grammar to be declared **in force at this ship** while the consistency checks are deferred. That splits the *region validates* predicate into a grammar layer this REQ owns and an analysis layer `REQ-RCV-07` owns. Is that split worth naming explicitly in X-06 — *"the predicate's **grammar** layer is §6's and ships here; its **analysis** layer is AC-7.1's and ships at row 18"* — so `REQ-RCV-07`'s AC-7.1 step 2 knows it is re-checking rather than first-checking? If yes it is a paired edge and belongs at both ends per `pdlc-rcv-split.md` §5. |
| Q-03 | Carried, `REQ-RCV-07`'s: is `W` guaranteed absent from every operator- and downstream-visible surface on a refusing entry? Recorded so the trail is unbroken for harvest; **not** a finding against this document. |

## 5. Positive Observations

- **Q-01 was answered with a falsifier instead of an adjective, and that is the round's best move.**
  I asked whether the document should *say* the seam is structural only. v2.3 instead made it
  **checkable**: the interim composition calls the seam *exactly 0 times*, asserted on the production
  path, *"which falsifies an accidental early wiring and inverts cleanly at row 18"*. A claim that
  can go red is worth more than a claim that reads well, and this one closes v8 F-03's DoD hazard
  from the other side — NB-3 tells the verifier the finding is known, O-10 tells the suite what to do
  if someone acts on it anyway.
- **Handing the non-validating legs wholly to `REQ-RCV-07` is the right cut, for a reason I had not
  articulated.** O-10: *"driving an unconsulted seam here would assert over a call graph this REQ's
  entrypoint never traverses, and would keep passing if the seam were deleted."* That is the precise
  objection to a test that injects a value nothing reads — it is not merely redundant, it is
  **unfalsifiable**, and an unfalsifiable leg in a PROPERTIES doc is worse than an absent one because
  it looks like coverage. The sibling's O-10 picked them up in full and says so.
- **The relocation to `pdlc-rcv-split.md` §5.1/§6 is a real de-duplication, not an archive move.**
  Both ends of the paired edge now cite one copy of the interim-procedure argument rather than
  carrying two paraphrases that can drift — which is exactly the failure this feature already had
  twice. §5.1 even records *why* it was relocated and asserts that nothing changed meaning in the
  move, which is the provenance line that makes the next reader trust it. §6 did the same for the
  catalogue delegation, and I checked every clause survived.
- **v8's F-01 fix went in at the surface where the misreading starts, not where the argument lives.**
  The new AC-1.5(4) paragraph names §4.1's two rows as restatements of itself, so the three surfaces
  (criterion, derivation table, forward edge) now point at each other in all directions rather than
  one way outward. F-01 above is a defect *in* that fix, not a rejection of it — the shape is right,
  the scope of one word is too wide.

## 6. Recommendation

**Needs revision**

All four v8 Lows are closed, each at the surface I named, and two of them are closed better than I
asked: the seam's unconsulted status became a falsifiable 0-call leg rather than an adjective, and
the interim-procedure argument was de-duplicated into `pdlc-rcv-split.md` §5.1 so both ends of the
paired edge cite one copy. I re-read `REQ-RCV-07` X-07, R-16 and O-10 at HEAD: they carry the same
decision, the same narrower-procedure objection and the same `Order 18` / 10 → 12 → 18 distance.

**One Medium blocks approval, and it is a defect in the v8 F-01 fix rather than a new disagreement.**
§4.1's `W` row now says the *invalid* half of *"no absent or invalid value ever widens the window"* is
**target state**, deferred to `REQ-RCV-07`. But *invalid* spans two disjoint checks and only one of
them is that REQ's: §6's own S-13 grammar (`{N}` a decimal integer ≥ 1) is decidable from a single
line at row 10 and needs no AC-7.1, while ordering, highest-round and `H − A ∈ {0, 1}` genuinely are
AC-7.1's. Deferring both leaves the interim with no stated `W` for a malformed value, and the two
available readings differ observably: the value contributes nothing and `W` = 1 (fail-closed,
matching the row's own *If absent* cell), or the greatest *parsed* value is taken and `NaN` reaches
`windowEnd` and `deriveRoundWindow` — whose contract AC-1.2 and O-12 pin as *a decimal integer*.
No O-10 leg discriminates them: the two interim legs are a well-formed region and no region at all,
and the non-validating legs have just been handed to `REQ-RCV-07`, which does not run them against
this REQ's interim composition. **What must change:** narrow the §4.1 qualifier to the *consistency*
half, state that §6's grammar is in force at this ship with `W` falling back to 1, and add the
matching interim leg to O-10.

Three Lows accompany it, each a one-clause fix:

1. **F-02** — O-10's new contract leg is owed over *the injected function's signature*, and no
   document names that seam's parameter, arity or convention. Add it to O-12.
2. **F-03** — X-06's *"the call site exists … but the composition does not consult it"* is
   contradictory, and now has a test (the 0-call leg) that a literal reading fails. Say *injection
   point exists, no call site is emitted at this ship*, and carry it to X-07.
3. **F-04** — `pdlc-rcv-split.md` §5's *revise all four **in the same commit*** was not honoured
   (X-06/R-14 in `21297cd`, X-07/R-16 in `3105033`) and cannot be, under the authoring pacing
   contract; the words do agree at HEAD, so restate the rule over the revision rather than the
   commit, and drop §10's compliance claim.

Take F-01 first, and per Q-01 relocate §4.1's durability table or §6's threshold rows before writing
any of them — 58 bytes of headroom does not absorb this round's fixes.

Durable signal from this round, for `docs/_constraints/DOMAIN-CONSTRAINTS.md`:

- **When a criterion is deferred to a successor, defer the *check*, not the *word*.** A qualifier
  like *"the invalid half is target state"* silently defers every rule the word covers, including the
  ones the current REQ owns and can decide today. Name the deferred checks; leave the rest in force.
- **A seam introduced ahead of its consumer should ship with a call-count contract leg, not a
  declaration.** *Called 0 times* is falsifiable, inverts cleanly at the successor's commit, and
  makes the DoD declaration enforceable rather than merely honest.
- **A cross-document atomicity rule must be stated over a unit the authoring pacing contract can
  deliver.** *In the same commit* is unachievable when the pipeline mandates one section per commit;
  state it over the revision and let the reviewer check both ends at HEAD.

## Verdict

The four v8 Lows are all closed at the surfaces they named, and two are closed better than asked:
AC-1.5(4) gained the *target state / not wired at this ship* paragraph and both §4.1 rows the
matching qualifier (F-01); the *any interim procedure* over-claim was narrowed and the whole argument
de-duplicated into `pdlc-rcv-split.md` §5.1, cited by X-06, R-14, X-07 and R-16 (F-02); NB-3 now
declares the unconsulted seam to the DoD verifier in its own *correct and known by construction*
formula, adding *"not to be remediated by wiring it here"* (F-03); and O-10 leg 1 is stated with
literals — `windowEnd(1)` = 3, `WINDOW-START: 4` (F-04). I verified the relocations lost nothing:
`pdlc-rcv-split.md` §6 carries every clause of the deleted §4 delegation, §5.1 carries the three
horns and the co-delivery rejection, and the `O-*`/`R-*`/`X-*` collision rule survived §7's rewrite
as a pointer. `REQ-RCV-07` X-07, R-16 and O-10 at HEAD agree with this REQ's X-06, R-14 and O-10 on
wiring, on the narrower-procedure objection, on `Order 18` / 10 → 12 → 18, and on which end owns the
non-validating legs.

**One Medium remains and it holds the document.** §4.1's new qualifier defers the whole word
*invalid* to `REQ-RCV-07`, but only the consistency half — ordering, highest round, `H − A ∈ {0, 1}`
— is that REQ's; §6's S-13 grammar (`{N}` a decimal integer ≥ 1) is this REQ's own and decidable from
one line at row 10. With both deferred, the interim has no stated `W` for a malformed value, and the
two readings differ observably: fail-closed to 1, or `NaN` into `windowEnd` and `deriveRoundWindow`,
whose contract AC-1.2 and O-12 pin as a decimal integer. No O-10 leg discriminates them now that the
non-validating legs belong to the sibling. Narrow the qualifier to the consistency half, state §6's
grammar as in force, and add the malformed-value interim leg. Three Lows accompany it: the new
0-call contract leg is owed over a seam signature no document fixes (add to O-12); X-06's *the call
site exists … does not consult it* contradicts the 0-call leg and should read *injection point
exists, no call site emitted*; and `pdlc-rcv-split.md` §5's *same commit* rule was not honoured this
round and cannot be under the authoring pacing contract, though both ends do agree at HEAD — restate
it over the revision. Per the approval rule, any Medium → **Needs revision**; take F-01 first and
relocate §4.1's durability table or §6's threshold rows before writing the fixes, since 58 bytes of
headroom under the size soft threshold will not absorb them.

VERDICT: Needs revision
