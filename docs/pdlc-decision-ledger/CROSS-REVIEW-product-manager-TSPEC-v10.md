# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.9)
**Date:** 2026-08-29
**Iteration:** 10 (delta confirmation — round 9's findings, frozen round)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…3c7b7c`, FSPEC v1.3 `sha256:2bd5c3ef…5aed39`

## Scope

I approved this TSPEC at v0.7 and again, with two minor citation findings, at v0.8. This round is a
**delta confirmation** against a frozen decision set: I read my own v9 findings, ran
`git diff cc2c09e53..HEAD` over the TSPEC, and re-measured the upstream the changed sections lean on.

Upstream is byte-unmoved at exactly the pins v0.9's changelog re-states: `REQ-pdlc-decision-ledger.md`
hashes `sha256:ce6b133f0c1d…0d3c7b7c` and `FSPEC-pdlc-decision-ledger.md` hashes
`sha256:2bd5c3ef055f…735aed39`, both matching the document's recital digit-for-digit, and neither has
been touched since the commits that produced those versions. So the changelog's "nothing is absorbed
and no pin advances" is true as measured, not merely asserted.

The diff is 95 insertions / 14 deletions confined to the changelog, §5.4, §7, §7.2 and §7.3 — exactly
the section list the changelog declares. The four corpus literals (6,305 / 10,859 / 12,059 / 441) are
untouched, §7.6's AT rows are untouched, and no approved product decision is re-opened. My check
therefore reduces to: did my two findings land, did TE's three High/Medium items land without
breaking anything I approved, and is every new factual claim true at HEAD?

Answer: both my findings landed, and landed on the right referent rather than by deleting the
sentence. Every new repository-grounded claim I checked is true at HEAD except one precedent
citation, which under-describes the extension the cited helper needs — Medium, non-gating.

## Design

**My F-01 (Medium) landed, and landed as a strengthening rather than a retraction.** v0.8's §7.2
conjunct 3 asserted the flag-off `report` key set was "set-equal to §7.4's committed recording" — a
referent that holds no `report` keys at all. v0.9 replaces it with the arm's **own paired runs**: the
`report` object *the flag-off `main()` run itself returns* must have a key set whose symmetric
difference from the flag-on run's key set is exactly `{decisionLedger}`, "asserted as a set equality
in both directions so a spuriously added or dropped key on **either** arm fails".

Two things make this better than what I asked for. First, it is a two-sided oracle: v0.8's form could
only catch a missing key on one arm, whereas a symmetric difference reddens on a stray key added to
the flag-off arm as well — that is the completeness-by-set-equality shape rather than containment.
Second, it is not an absence-only oracle: `"decisionLedger" not in report` is now paired with a
positive statement of what the flag-off run *does* return. REQ C-2's disabled-path byte-identity is
the requirement this serves, and it is now provable by a test that fails for the right reason.

The document also does the thing I value most in a correction: it states the trap rather than merely
avoiding it. §7.2 now carries an explicit "note the referent split, because it is easy to get wrong"
paragraph explaining that §7.4 is cited for the **prompt** conjunct only. I verified that
justification against §7.4 itself at HEAD, which says in its own words that "a whole-`main()`
recording would red on this feature's own intended additions (the new notices, the new report field)".
The two sections now agree, and the reason they must differ is written down where a future editor
will hit it.

**My F-02 (Low) landed, and with it Q-01.** §7.3's claim that "§7.6's AT rows assert its presence and
shape on the flag-on path" is gone, replaced by "§7.6's AT rows are **not** a home for it: no AT row's
Notes column mentions `report.decisionLedger`". I re-checked §7.6: still true, no AT row names the
field. §7.2's arm is now named as the sole home in both directions, and — this is Q-01, which I raised
as explicitly non-gating — §5.4 now carries the forward pointer: "Deleting that arm deletes the
field's only evidence." That closes the failure mode I was worried about, where a future editor
deletes the live arm as redundant without seeing what it discharges.

**TE's two High items landed, and the repair is general rather than another exception.** This is the
part I checked hardest, because a member-by-member patch to an unsatisfiable census is how these
defects recur. v0.9 subtracts the body of **every** declaration the feature introduces, held in a
frozen `DECISION_LEDGER_OWNED_DECLS`, and states the satisfiability predicate itself — *a token is
unsatisfiable exactly when a conforming implementation mentions it in the scanned remainder* — as a
test to apply to any future member **before** it is added. Writing down the predicate, not just the
repaired list, is what stops round 12 from re-raising round 9's finding on a new token.

I checked the partition arithmetic, since "exact partition" is a claim that either holds or does not.
`DECISION_LEDGER_OWNED_DECLS` as §7.3 enumerates it is fifteen members: §4.1/§4.2/§4.4's six functions
plus nine top-level constants (`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`,
`DECISION_LEDGER_DEFAULTS`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, §5.2's three
catalogues, and `DECISION_LEDGER_CENSUS_TOKENS` itself). `DECISION_LEDGER_CENSUS_TOKENS` holds six;
`DECISION_LEDGER_CENSUS_EXEMPT` as enumerated holds nine. 6 + 9 = 15, with no member in both — the
partition is exact and disjoint as stated, and §5.2's third catalogue (`DECISION_LEDGER_NOTICES`)
correctly sits on the exempt side with a stated reason while the two data-carrying catalogues sit in
the token set. It closes, and it closes with a reason per exempt member rather than a bare list.

I also verified the justification for freezing the owned list rather than deriving it by name pattern.
§7.3 claims a `/Decision/i` rule would wrongly exclude shipped code, naming five declarations; all
five exist in `pdlc/workflows/orchestrate-dev.js` at HEAD — `MERGE_MAX_DECISION_STEPS` (:88),
`renderDecisionEntry` (:4640), `escalationDecision` (:4738), `erratumGateDecision` (:6914),
`parseDecisionsWarranted` (:7044). The claim is measured, not remembered, and it is the right reason:
a name-derived list would blind the census against unrelated shipped code, which is precisely the
failure the census exists to prevent.

## Interfaces

The delta touches no public seam, no notice id, no config key and no rendered-output contract. The
`decisionLedger` config block's three C-5 keys, the omission-reason catalogue, the `NTC-DECLEDGER-*`
ids, §4.3's line format and §5.3's example-file disclosure are all byte-unchanged from the versions I
approved at v0.7. §7.6's AT rows did not move, so no acceptance criterion's meaning drifted under this
edit — I re-read AT-14's row (still all three of FSPEC v1.3's cases) and AT-01/AT-02/AT-18's notes.

One interface-adjacent addition is worth pinning because it is new public-ish surface, even though it
is test-facing: §7.3's owned-declaration list now includes `DECISION_LEDGER_CENSUS_TOKENS` on the
grounds that "the token strings live inside its own declaration, so the census would otherwise red on
its own literal". That is only coherent if the constant ships **inside** `orchestrate-dev.js` rather
than test-side. It does: PLAN T-18's production edit list says "Add `DECISION_LEDGER_CENSUS_TOKENS`"
against `pdlc/workflows/orchestrate-dev.js`. So design and plan agree on where the operand lives, and
the self-exclusion clause is necessary rather than defensive. Worth noting it diverges from the
precedent it cites — `loopEconomicsAnchorGuard.test.js` keeps its `FROZEN_CENSUS` in the test file —
but that divergence predates this round and is deliberate, so it is not mine to re-open here.

## Data structures

§5.4 gains one paragraph and no type. It states that `report.decisionLedger` is written only when the
injector is non-null (the shipped `learningsInjectionField` conditional-spread discipline), that it is
deliberately not a census token, and that §7.2's live arm is its whole proof. This is the forward
pointer Q-01 asked for, and it is placed at the *field's* definition rather than only in the test
section — which is where a future editor deleting the arm would actually be reading. No state shape,
no key, and no lifecycle changed; §5.5's "the one thing the driver never holds" is untouched.

§7.3's scanned-source operand is the only real structural change, and its guard is stated in the
positive: `DECISION_LEDGER_OWNED_DECLS` is frozen and "each member must resolve to **exactly one**
top-level declaration at HEAD, so a rename or a deletion reddens rather than silently shrinking the
exclusion", with the non-empty-slice assertion retained so the census cannot go vacuous. Both are
positive assertions guarding an absence oracle, which is the right pairing: the census asserts zero
occurrences, and these two assertions are what stop that zero from being achieved by an over-wide
exclusion or an empty one.

## Verification

The two smaller TE items are transcriptions, and both check out at HEAD.

**TE F-04 — the per-file denominator.** §7 now reads "the **18,509** lines of shipped code the file
measures at HEAD" in place of "~17k". `wc -l pdlc/workflows/orchestrate-dev.js` returns exactly
18,509. The figure is measured, and re-measuring it was the right response to a remembered number: the
whole point of that paragraph is that this feature's fourteen failure rows are swamped by the
denominator, and a stale denominator would eventually be a stale argument.

**TE F-05 — the superseded recital.** The v0.6 changelog entry's `12,059 ≤ 12,500` reading is now
marked "*superseded in v0.7*" inline, with the pointer to §7.3's 10,859 index pin and the note that
the v0.6 text "is history, not a live reading of the section". The v0.8 entry likewise gains a
superseding note for its two clauses that v0.9 overtook (the set-equality-against-all-exports form,
and §7.6 as a home for the report field). Marking superseded recitals *in place* rather than
rewriting them keeps the changelog an accurate record of what each round believed — which is what
makes a delta confirmation cheap for the next reviewer.

**The precedent citation for slicing is where I found this round's one issue.** §7.3 says the
declaration bodies are "sliced the precedent's way: from a declaration's own line to the **next
top-level declaration of any name**, boundaries taken from *all* of the module's top-level
declarations rather than from the owned subset, which is `loopEconomicsAnchorGuard.test.js`'s `bodyOf`
over `allTopLevelDecls`". The design statement in its own words is correct and satisfiable. The
citation is not: the shipped helper's `allTopLevelDecls` is built from
`DECL_RE = /^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/`
(`pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:60-67`), which matches **function
declarations only**. Nine of the fifteen members of `DECISION_LEDGER_OWNED_DECLS` are top-level
`const`s. Cloned as shipped, the helper would not treat a `const` as a boundary or as a sliceable
body, and a constant such as `DECISION_LEDGER_OMIT_REASONS` could land in the scanned remainder — the
same "red on a conforming implementation" class TE F-01 raised. The design intent is unambiguous, so
this is a citation that under-describes a required extension rather than an unsatisfiable design, and
PLAN T-11 owns the census. Recorded as F-01, Medium, non-gating. See also the DEFERRED line below.

**Property coverage is unchanged and still sound.** §7.5's three properties (O-8's bounds invariant,
P-REC's recognition invariant, P-LINE's one-physical-line invariant) are byte-untouched by this
delta, and each still carries its falsifying mutation and O-8's independent-model discipline — the
model transcribes §4.3's format rather than importing the production renderer, so no property echoes
the code under test. The new §7.2 conjunct likewise takes its expected value from the two runs' own
key sets rather than from any production constant.

## Risks and Questions

| ID | Question |
|----|---------|
| Q-01 | §7.3 now freezes a fifteen-member owned list whose members must each resolve to exactly one top-level declaration. That is the right guard, but it means the census test and the wiring task (PLAN T-18) must land the declarations in agreement on spelling. Is it worth T-11's acceptance stating that the owned list is transcribed from §7.3 by hand rather than derived, so a rename in T-18 reddens loudly? Not gating — the "exactly one declaration" assertion already produces that redness, this is only about the error being legible. |

The one risk I would repeat for the implementer, unchanged from v9 and still the sharpest edge in the
document: the delta-coverage gate is **fail-closed on empty ranges**, and PLAN T-18's per-wave manual
run is the only thing standing between a wave-3 mistake and a batch-8 discovery.

## Positive Observations

- Both of my round-9 findings were fixed on the referent rather than by deleting the sentence, and the
  fix for F-01 came back **stronger** than the finding asked for: a two-sided symmetric-difference
  assertion that reddens on a stray key on either arm, not just a missing key on one.
- §7.3 now states the *satisfiability predicate* rather than only the repaired operand list. That is a
  durable fix — it tells a future editor how to test the next census member before adding it, which is
  the difference between fixing a defect and fixing the class.
- Every new repository-grounded number and symbol in this delta is measured rather than remembered:
  18,509 lines is exact, the five `/Decision/i` false-positive declarations all exist, and the two
  upstream digests match the recital digit-for-digit. The one exception is a precedent's capability,
  not a value — F-01.
- Superseded changelog recitals are annotated in place instead of rewritten, so each round's entry
  still records what that round believed while pointing at what overtook it.

DEFERRED: PLAN T-11 still carries §7.3's pre-v0.9 operand wording (three sliced bodies, set equality against exported names) and needs the ordinary downstream re-pin against v0.9 — the TSPEC's own changelog already names this, and PLAN is downstream, so it is not an erratum against this document.
DEFERRED: §7.3's "roughly a dozen" decision-ledger declarations reads low against the fifteen its own partition enumerates; a later editor may want the exact figure.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §7.3's scanned-source cell grounds the widened slicing in `loopEconomicsAnchorGuard.test.js`'s `bodyOf` over `allTopLevelDecls`, but that helper's `allTopLevelDecls` is derived by a function-only regex (`pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:60`, `/^(?:export\s+)?(?:async\s+)?function\s+…/`), while nine of the fifteen `DECISION_LEDGER_OWNED_DECLS` members are top-level `const`s (`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, §5.2's three catalogues, `DECISION_LEDGER_CENSUS_TOKENS`). Cloned as shipped, the precedent treats no `const` as a boundary or as a sliceable body, so a constant's own declaration can sit in the scanned remainder and red the census on a conforming implementation — the class TE F-01 raised. The design sentence itself is right ("boundaries taken from *all* of the module's top-level declarations"); what is missing is one clause saying the cloned `DECL_RE` must be widened to `const`/`let` declarations, so an implementer copying the precedent verbatim does not reintroduce the defect. Non-gating: PLAN T-11 owns the census and the "each slice non-empty" plus "exactly one declaration" guards make the failure loud rather than silent. | §7.3 (Scanned source cell, slicing precedent) |
| F-02 | Low | delta | local | §7.3's forbidden-token cell justifies dropping the all-exports set equality on the ground that §3.1/§4.1/§4.2/§4.4/§5.2 "declare roughly a dozen" decision-ledger names; the partition the same cell then states enumerates fifteen (six tokens plus nine exempt). The argument is unaffected — fifteen makes the point better than twelve — but the exact figure is available and the cell is otherwise precise. | §7.3 (Forbidden token set cell) |

FINDING: Medium | delta | local | §7.3 Scanned source cell, slicing precedent | The widened const-body slicing is grounded in `loopEconomicsAnchorGuard.test.js`'s `bodyOf`/`allTopLevelDecls`, whose `DECL_RE` (:60) matches `function` declarations only, while nine of the fifteen owned declarations are top-level `const`s; add the clause that the cloned regex must cover `const`/`let` so a verbatim clone cannot leave a catalogue's own declaration in the scanned remainder.
FINDING: Low | delta | local | §7.3 Forbidden token set cell | "roughly a dozen" decision-ledger declarations reads low against the fifteen the same cell's partition enumerates (six tokens plus nine exempt); the exact figure is available and strengthens the argument.

## Recommendation

**Approved with minor changes**

Both of my round-9 findings landed on the correct referent, and the F-01 fix is stronger than the
finding asked for. TE's High items landed as a general repair with a stated satisfiability predicate
rather than another exception, and the partition arithmetic closes exactly. Nothing I approved at v0.7
or v0.8 was disturbed: no section outside the declared five moved, no corpus literal moved, no AT row's
meaning drifted, and upstream is byte-unmoved at the pins the changelog recites — verified by hashing
both files at HEAD. The decision freeze held; this round decided nothing new.

The two findings are both inside §7.3's newly-written cells, both are precision defects rather than
design defects, and the obligations behind them are owned by PLAN T-11. Neither gates the phase. Fix
them the next time §7.3 is opened, alongside the downstream re-pin the changelog already flags.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
