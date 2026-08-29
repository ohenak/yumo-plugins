# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.9)
**Date:** 2026-08-29
**Iteration:** 10 (delta confirmation on round 9's findings)

## Overview

**Upstream: unmoved, and re-checked rather than assumed.** I recomputed both digests at HEAD:
REQ `sha256:ce6b133f…3c7b7c`, FSPEC `sha256:2bd5c3ef…5aed39` — byte-identical to the pins the v0.9
changelog carries and to the ones round 9 approved against. `git diff cc2c09e53..HEAD` over both
upstream paths is empty. Nothing is absorbed, no pin advances, and the four corpus literals
(6,305 / 10,859 / 12,059 / 441) are unchanged, exactly as the changelog states.

**Scope of the round.** The delta is four commits — `1a2d78cba`, `4b28af44a`, `588f4323e`,
`5189b73fb` — +95 / −14 against `cc2c09e53`, the commit I last reviewed. The touched sections are
§5.4, §7, §7.2, §7.3 and the changelog, which is exactly the set the changelog claims; I diffed the
whole file to confirm no section outside that set moved. §§1–4, §6, §7.4–§7.7 are not re-litigated
here.

Both of round 9's blocking findings are landed, and landed by a *general* repair rather than by a
member-by-member exception — which is the harder and better of the two available fixes. The two
Highs are closed. What remains are two precision items on the new text and one placement question,
all non-gating.

## Architecture

The repair changes the shape of §7.3's second operand, so I re-derived it rather than reading it.

**The partition now closes arithmetically.** `DECISION_LEDGER_CENSUS_TOKENS` has six members;
`DECISION_LEDGER_CENSUS_EXEMPT` as enumerated has nine (`parseDecisionLedgerConfig`,
`buildDecisionLedgerInjector`, `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`,
`DECISION_CORPUS_ARGV`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`,
`DECISION_LEDGER_NOTICES`, `DECISION_LEDGER_CENSUS_TOKENS`). `DECISION_LEDGER_OWNED_DECLS` as
enumerated is six functions plus nine top-level constants = fifteen. 6 + 9 = 15, and the two
sub-sets share no member, so the stated partition is satisfiable — unlike v0.8's set equality
against "the module's exported decision-ledger symbol names", which was red by construction. The
six functions also reconcile: four of them sit in the token set, two in the exempt set.

**And the census itself is now satisfiable.** Round 9's failure was that four of six tokens occurred
in the scanned remainder on *correct* code. Under v0.9 every owned declaration's body is subtracted,
so a token's own declaration line and its uses by sibling declarations are all outside the
remainder. Re-running my v9 table against the new operand: `gatherDecisionCorpus` (its own body now
sliced), `DECISION_LEDGER_OMIT_REASONS` / `DECISION_LEDGER_CORPUS_OUTCOMES` (§5.2's catalogues now
sliced), and `recogniseDecisionRecords`'s mention inside `gatherDecisionCorpus` (that body now
sliced) all move out of the remainder. All six tokens can now read zero on a conforming
implementation. F-01 resolved.

The census also does not go vacuous in the process: the non-emptiness assertion per slice is kept,
and the exclusion cannot silently widen because every owned member must resolve to **exactly one**
top-level declaration at HEAD. The paragraph explaining *why* a `/Decision/i` name rule was rejected
is grounded — `MERGE_MAX_DECISION_STEPS` (`pdlc/workflows/orchestrate-dev.js:88`),
`renderDecisionEntry` (:4640), `escalationDecision` (:4738), `erratumGateDecision` (:6914) and
`parseDecisionsWarranted` (:7044) all exist at HEAD and would indeed have been wrongly excluded.

## Interfaces

Every seam the delta newly leans on, checked against HEAD rather than against the spec's prose:

| Claim in the delta | Verified at HEAD |
|---|---|
| §7.3's slicer is "`loopEconomicsAnchorGuard.test.js`'s `bodyOf` over `allTopLevelDecls`", boundaries from *all* top-level declarations | ✅ shape exists — `bodyOf` at `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:123`, `allTopLevelDecls` at :63, and its own comment (:119–121) gives the same reason the spec gives: boundaries come from all declarations, not the census subset, so a sandwiched helper cannot be folded into a neighbour's body. ⚠️ but see F-01: its `DECL_RE` (:61) matches `function` declarations only |
| "`advisoryDisabled.test.js`'s `sourceExcludingParser` slicing `parseAdvisoryConfig`" | ✅ `pdlc/workflows/__tests__/advisoryDisabled.test.js:717`, applied at :740 |
| §7's per-file denominator is "**18,509** lines … the file measures at HEAD" | ✅ `wc -l pdlc/workflows/orchestrate-dev.js` = 18509 exactly. Round 9's F-04 (Low) closed with a transcribed, not remembered, figure |
| §7.2's conjunct 3: §7.4's recording "records one narrow case driving exported `reviewLoop` … never `report` keys" | ✅ §7.4's "Recorded stream, deliberately narrow" bullet: one case `REVIEW-LOOP-REVIEWER-PROMPTS`, driving exported `reviewLoop`, recording reviewer-prompt streams |
| "§7.4 expressly rejects a whole-`main()` recording *because* it would red on this feature's new report field" | ✅ §7.4, same bullet: "A whole-`main()` recording would red on this feature's own intended additions (the new notices, the new report field)". The delta's citation is the section's actual reasoning, not a paraphrase pushed further than the source |
| "no AT row's Notes column mentions `report.decisionLedger`" | ✅ §7.6 carries fourteen AT rows and not one mentions `decisionLedger` or the report field. PM F-02's premise holds, and so does the correction it produced |
| "PLAN T-10a already records that its `report.decisionLedger` assertion is the only one" | ✅ PLAN v0.5 T-10a (`PLAN-pdlc-decision-ledger.md:133`): "This is the home file for T-18's `report.decisionLedger` assertion, which had none" |
| Changelog: PLAN T-11 "transcribes the six-member set and states `decisionLedger`'s deliberate exclusion" | ✅ PLAN:134 transcribes exactly those six names and carries the exclusion rationale. Round 9's F-03 (Medium) is discharged downstream, as claimed |
| Round 9's F-05: v0.6 recital marked superseded | ✅ the v0.6 changelog entry now carries "(*superseded in v0.7*: §7.3 now pins the **10,859** index-byte figure … this v0.6 recital is history, not a live reading of the section)" |

One claim I checked because it is the load-bearing half of the fix rather than because it looked
doubtful: §7.3 asserts the owned-declaration list is frozen and each member "must resolve to exactly
one top-level declaration at HEAD". That is the guard that stops the exclusion silently widening,
and it is the right one — a rename would otherwise shrink the census invisibly, which is the failure
mode a source census exists to prevent.

## Data Model

Two things about the new operand lists are worth writing down, because they are what a future editor
will get wrong.

**Where the three lists live is not stated, and only one placement is consistent.** §7.3 requires
`DECISION_LEDGER_CENSUS_TOKENS` to be an owned declaration *inside the scanned source* — that is the
stated reason it must be sliced ("the token strings live inside its own declaration, so the census
would otherwise red on its own literal"), which only makes sense for a declaration in
`orchestrate-dev.js`. It says nothing about where `DECISION_LEDGER_CENSUS_EXEMPT` and
`DECISION_LEDGER_OWNED_DECLS` live. Working the cases:

| Placement | Consequence |
|---|---|
| All three in the module | `CENSUS_EXEMPT` and `OWNED_DECLS` are then declarations this feature introduces, so they belong in `OWNED_DECLS` and in the partition — they are in neither. Their declaration bodies transcribe four census-token names, and being unsliced those names land in the remainder. Census red on conforming code — round 9's defect, one level up |
| All three test-side | `CENSUS_TOKENS` is then not an owned declaration, so the owned list is fourteen while tokens ∪ exempt is fifteen. Partition red by construction |
| `CENSUS_TOKENS` in the module (as §7.3 states), the other two test-side | Both checks green: owned = 15 = 6 ∪ 9, disjoint; and the two test-side literals are outside the scanned source so their token strings are harmless. This is also the shipped precedent's shape — `FROZEN_CENSUS` and `ANCHOR_TOKENS` are test-file literals in `loopEconomicsAnchorGuard.test.js` |

So a satisfiable reading exists and is the natural one, which is why this is not a blocking finding.
But two of the three readings are red, and the document does not say which it means: one clause in
the operand row ("`DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS` are test-file
literals; only `DECISION_LEDGER_CENSUS_TOKENS` ships in the module") removes the ambiguity. F-03,
Low.

**The exempt list's reasons are per-member and checkable, not a blanket.** Each of the nine carries
its own justification, and the two I would have challenged are the two the spec pre-empts:
`DECISION_LEDGER_NOTICES` is exempt because generic driver code legitimately renders and counts
run-level notice ids — true of the shipped `LEARNINGS_NOTICES` analogue — and `DECISION_LEDGER_DEFAULTS`
because config defaults carry no record data. The partition therefore does what a set equality was
meant to do (a later symbol must be classified or the test reddens) without being red on arrival.

## Test Strategy

### Item-by-item against round 9

| Round 9 item | Landed | Verdict on the form |
|---|---|---|
| **F-01 (High)** — §7.3's census could not go green on a conforming implementation | **Yes, by the general repair** | TSPEC:1297 subtracts the body of *every* owned declaration instead of a hand-picked three; TSPEC:1308–1319 states the satisfiability predicate itself ("a token is unsatisfiable exactly when a **conforming** implementation mentions it in the scanned remainder") and requires future members to be checked against it *before* they are added. That last sentence is the part that matters: it converts a fixed defect into a rule, so the next member does not repeat the round. The token set is now chosen for what it *watches* — data-carrying names — rather than trimmed to whatever survived an exclusion list, which is the right direction of dependency between operand and predicate |
| **F-02 (High)** — companion set equality red by construction | **Yes, and the falsifying power is kept** | TSPEC:1296 replaces "set-equal to all exported decision-ledger symbols" with an exact partition, `CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS`, disjoint, one stated reason per exempt member. This is not a weakening to containment: a symbol added later must be classified into one list or the other or the test reddens, so the escape-by-omission hole the original set equality existed to close stays closed. I re-derived the arithmetic (see **Architecture**) — 6 + 9 = 15, disjoint |
| **F-03 (Medium)** — PLAN T-11 orphaned by the token drop | **Discharged, correctly, without an edit here** | PLAN:134 already transcribes the six-member set and the exclusion rationale, so the specific orphan is gone. The changelog is honest that T-11 still carries *this section's pre-v0.9 operand wording* (three sliced bodies, set equality against exported names) and owes the ordinary downstream re-pin — that is a PLAN-side obligation on the next PLAN round, not a TSPEC defect, and I would rather see it stated than quietly fixed in the wrong document |
| **F-04 (Low)** — "~17k lines" | **Yes** | TSPEC:1046, **18,509**, matching HEAD exactly |
| **F-05 (Low)** — v0.6's superseded recital | **Yes** | v0.6 entry now marks the `12,059 ≤ 12,500` recital as history superseded by v0.7's 10,859 pin |

### The referent split in §7.2's conjunct 3, which is the delta's other real fix

PM F-01 caught the flag-off `report` key set being cited against §7.4's recording. That citation was
wrong in the way that produces a vacuous oracle rather than a red one: §7.4 records reviewer-prompt
streams for one `reviewLoop` case and no `report` key at all, so "set-equal to §7.4's recording"
would have compared against nothing. The repair (TSPEC:1136–1148) names the arm's **own paired
flag-off/flag-on runs** as the referent and asserts the symmetric difference of the two key sets is
exactly `{decisionLedger}`, "in both directions so a spuriously added or dropped key on **either**
arm fails".

Three things I checked about that, because a key-set oracle is easy to make unfalsifiable:

1. **It is not absence-only.** `"decisionLedger" not in report` is paired with a positive on the same
   path — the flag-on run's key set — and the equality is two-directional, so a spurious extra key on
   either arm reddens. This is the set-equality-not-containment form, over the full enumeration.
2. **The referent is not computed by the code under test.** The prompt conjunct still cites §7.4's
   committed merge-base recording, explicitly "never a string computed by subtracting the block from
   the flag-on prompt" — no implementation echo. The key-set conjunct's referent is a second live run
   rather than a recording, which is legitimate here precisely because §7.4 *cannot* supply one, and
   the spec now says so in-line rather than leaving the next reader to rediscover it.
3. **The split is stated where it will be read.** "§7.4's recording is cited for the **prompt**
   conjunct only" sits inside the conjunct, not in a changelog entry that will be skimmed.

§7.2's arm otherwise still carries the three conjuncts DC-07 asks for: the call-count spy on
`gatherDecisionCorpus`'s `_git` seam asserting ≥ 1 invocation on the served flow, the note that a
fake of the outer interface cannot satisfy it, and positive presence ("**ends with** the rendered
ledger block", not "differs from the baseline"). The delta did not disturb any of it.

### The field's sole home is now named in two places, which is the point

PM F-02's correction produced something better than a citation fix: §5.4 (TSPEC:948–953) now carries
a forward pointer stating that §7.2's arm is `report.decisionLedger`'s only evidence and that
deleting the arm deletes the field's proof, and §7.3's closing paragraph says the same from the other
end. A field whose only proof lives in one test file, with no AT row and no census token, is exactly
the thing that gets silently dropped in a later refactor; two cross-pointers make the deletion
visibly a spec change. This is the behavioural-obligation half of item 5 finally landing where it
can be found.

### One precision item on the new slicer citation

§7.3 equates its slicing rule with "`loopEconomicsAnchorGuard.test.js`'s `bodyOf` over
`allTopLevelDecls`". The spec-level rule is unambiguous and implementable — boundaries from the next
top-level declaration *of any name* — but the cited helper does not span the members the new owned
list is mostly made of: its `DECL_RE`
(`pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:61`) is
`/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(/`, i.e. function declarations only,
while nine of the fifteen owned members are top-level `const` declarations. Cloned verbatim,
`bodyOf("DECISION_CORPUS_ARGV")` throws its "No top-level declaration found" error, and — worse for
the census — boundaries derived from functions alone put a constant inside whichever function
precedes it, so whether an owned constant is excluded becomes an accident of source order rather
than a stated rule. The precedent is still the right shape to cite; the citation needs one clause
saying the declaration regex must also match top-level `const` (the shipped module's own
`export const MERGE_MAX_DECISION_STEPS` at `orchestrate-dev.js:88` shows the form). F-01, Medium —
non-gating because the spec's own words ("of any name", "each member must resolve to exactly one
top-level declaration") already require the wider rule.

### One citation slip

The owned list is introduced as "§4.1/§4.2/§4.4's six functions". `renderDecisionLedgerBlock` is
declared in **§4.3** (TSPEC:759), not in any of the three sections named. The list's *content* is
right — the six reconcile exactly with the partition — only the section citation is short by one.
F-02, Low.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | For F-03: are `DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS` intended as test-file literals (the precedent's `FROZEN_CENSUS` / `ANCHOR_TOKENS` shape), with only `DECISION_LEDGER_CENSUS_TOKENS` shipping in the module? That is the only one of the three placements under which both the partition and the census are green, and it is what I assumed when approving. One clause in the operand row settles it |
| Q-02 | Not a finding, an offer: §7.2's conjunct 3 asserts the key-set symmetric difference is exactly `{decisionLedger}`. Would you also want the flag-on run's `report.decisionLedger` **value** shape pinned in the same conjunct (the `dispatches[]` / `thresholds` keys of §5.1's interface) rather than only in the separate presence-and-shape assertion? The two are adjacent and the pairing reads more obviously complete |

## Positive Observations

- **The repair is general, not another exception.** The cheap fix to round 9's F-01 was to add
  `gatherDecisionCorpus` and §5.2's catalogues to the carve-out list and move on — a third
  hand-picked exclusion, red again on the fourth member. Instead §7.3 subtracts every owned
  declaration and then states the predicate that makes the choice checkable. The census's token set
  is now selected for what it watches rather than for what survives; that is the difference between
  a fixed round and a fixed section.
- **The predicate is written down for the next editor, not just applied.** "A token is unsatisfiable
  exactly when a conforming implementation mentions it in the scanned remainder … any future member
  must be checked against that predicate before it is added, not after a round finds it red." Two
  rounds of this feature were spent discovering that fact; it now costs the next one nothing.
- **The set equality became a partition without becoming a containment.** The easy escape from a
  set equality that is red by construction is to relax it to "contains", which silently drops the
  escape-by-omission guard. The partition keeps the guard and states its two halves — a symbol added
  later must be classified or the test reddens.
- **The name-pattern alternative was rejected with evidence, not taste.** Naming
  `MERGE_MAX_DECISION_STEPS`, `renderDecisionEntry`, `escalationDecision`, `erratumGateDecision` and
  `parseDecisionsWarranted` as the shipped declarations a `/Decision/i` rule would wrongly swallow is
  the kind of concrete counter-example that stops the idea being re-proposed. All five exist at HEAD.
- **A vacuous oracle was caught before it shipped.** PM F-01's key-set referent would not have gone
  red — it would have compared against a recording with no `report` keys at all. Fixing it to the
  arm's own paired runs, with the two-directional set equality, replaces a check that could not fail
  with one that can.
- **Round 9's downstream consequence was answered honestly.** The changelog neither claims T-11 is
  fully re-pinned nor ignores it: it states what T-11 already discharges and what it still owes to
  the ordinary PLAN re-pin. Precision about which document owns which residue is what keeps the
  cascade from re-litigating settled ground.

## Recommendation

**Approved with minor changes**

Both of round 9's High findings are resolved, and resolved in the stronger of the two available
forms: the census is satisfiable over its whole token set on conforming code, and the companion
check is an exact partition rather than a comparison that could never go green. F-03 (Medium) is
discharged downstream and correctly attributed; F-04 and F-05 are landed. The delta breaks nothing
that was approved — I re-derived the partition arithmetic, re-checked every seam the new text leans
on against HEAD, and confirmed the upstream digests are byte-identical to the approved pins.

What remains is one Medium precision item on the slicer citation (the cited helper's declaration
regex is function-only while nine of fifteen owned members are constants) and two Lows (list
placement, and a section citation short by one). None of the three changes what the section
requires, and none is a reason to hold the phase.

DEFERRED: PLAN T-11 still carries §7.3's pre-v0.9 operand wording (three sliced bodies, set equality against exported names) and needs the ordinary downstream re-pin against TSPEC v0.9.
DEFERRED: consider pinning `report.decisionLedger`'s value shape inside §7.2's conjunct 3 alongside the key-set difference (Q-02).

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | §7.3 cites `loopEconomicsAnchorGuard.test.js`'s `bodyOf` over `allTopLevelDecls` as the slicer, but that file's `DECL_RE` (:61) matches `function` declarations only, while nine of the fifteen `DECISION_LEDGER_OWNED_DECLS` members are top-level `const`s. Cloned verbatim it throws on a constant; boundaries from functions alone make a constant's exclusion an accident of source order. Add a clause requiring the declaration regex to match top-level `const` too | §7.3, Scanned source operand row |
| F-02 | Low | delta | local | The owned list is cited as "§4.1/§4.2/§4.4's six functions"; `renderDecisionLedgerBlock` is declared in §4.3 (TSPEC:759). Contents are right, the section citation is short by one | §7.3, Scanned source operand row |
| F-03 | Low | delta | local | Placement of `DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS` (module vs test file) is unstated; two of the three readings are red — module-side leaves their token-name literals unsliced in the remainder, all-test-side makes the owned list fourteen against a fifteen-member union. State that only `DECISION_LEDGER_CENSUS_TOKENS` ships in the module | §7.3, both operand rows |

FINDING: Medium | delta | local | §7.3, Scanned source operand row | The cited slicer `loopEconomicsAnchorGuard.test.js`'s `bodyOf`/`allTopLevelDecls` resolves only `function` declarations (its `DECL_RE` at :61), while nine of the fifteen owned members are top-level `const` declarations; the spec's own "declaration of any name" rule is right but the citation needs a clause widening the declaration regex to `const`.

FINDING: Low | delta | local | §7.3, Scanned source operand row | The owned declaration list is cited as "§4.1/§4.2/§4.4's six functions", but `renderDecisionLedgerBlock` is declared in §4.3 (TSPEC:759).

FINDING: Low | delta | local | §7.3, both operand rows | Where `DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS` live is unstated, and only the reading in which they are test-file literals (with `DECISION_LEDGER_CENSUS_TOKENS` alone shipping in the module) leaves both the partition and the census green.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:eef45ef32f0dd394e81abcf3aa5215fa54ba8dbbdc69f9d595c08feece0623c8
APPROVAL-HASH-NORMALIZED: sha256:a70d46775785bf17d5fc5b865c0541cf70c725d49d65c3823dc801a2cd9ac2c5
REVIEWED-COMMIT: 5189b73fb419b3be218aab7b1f833e0b9664f267
UPSTREAM-STATE: REQ sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c
UPSTREAM-STATE: FSPEC sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39
