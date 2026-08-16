# Cross-Review: product-manager — PROPERTIES (round-6 delta re-review, decision freeze)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.8)
**Date:** 2026-08-16
**Iteration:** 6
**Scope:** Product lens only. Delta against the commit I last reviewed (`a4b12eb7`, v0.6, approved
with two Lows in v5). Frozen round: only a delta-introduced defect, or a load-bearing claim false
against the repository at HEAD, may block.

## 1. What changed

`git diff a4b12eb7..HEAD -- …/PROPERTIES-…md` — 10 insertions, 5 deletions across two commits
(`59548390`, `3a5ca4b6`). Five edits, none of them to an assertion:

| # | Site | Change |
|---|---|---|
| a | Version cell (`:11`) | 0.6 / 2026-08-14 → **0.8** / 2026-08-16 |
| b | Changelog (`:22-23`) | the 0.6 row moved **below** 0.5 — the table now reads 0.1…0.8 monotonically |
| c | Changelog (`:24-25`) | two new rows, 0.7 (CODE_REVIEW v2 §1 citation sweep) and 0.8 (round-4 findings) |
| d | PROP-PUB-1 (`:150`) | premise "§5.1's **five-row** required-check set" → "§5.1's required-check set — the whole set as §5.1's table stands, whatever its row count" |
| e | PROP-GATE-5 (`:233`) | "outside FSPEC §5.1's frozen set" → "outside PROP-PUB-6's `pr-tests.yml`-scoped set", naming §5.1 **row 6** explicitly |
| f | §4 prose (`:322-326`) | PROP-LAUNCH-4's state (b) no longer says the triple "is AT-1.6's"; it names the three members and states AT-1.6's carrier is PROP-LAUNCH-5 alone |

No property added, removed or re-scoped; no Category, Level, Traces or carrier cell moved; §4's 35
`AT-` rows, §5's coverage accounting and §7's counts (89 properties, column sum 95, Unit 74 —
verified at `:425-431`) are byte-unchanged.

## 2. Prior findings

**F-08 (Low, carried from v4/v5) — RESOLVED.** The changelog is monotonic: `grep -n '^| 0\.'`
returns 0.1…0.8 in order at `:17-25`. One-row swap, no text change in either row, as claimed.

**F-09 (Low, v5) — still open, unchanged.** The Upstream cell (`:5`) still pins
`PLAN-pdlc-engine-distribution.md` **(v0.8)**; the PLAN on branch is now **v0.15** (`PLAN:12`),
having moved a further six versions since I raised this. Restated below as F-09 (same finding, same
number, so harvest sees one defect with a three-round life).

## 3. Delta verification against HEAD

Each of the three substantive edits (d, e, f) makes a claim about repository or upstream state. All
three check out.

**(d) PROP-PUB-1's count-free premise is correct and was necessary.** FSPEC §5.1's table at HEAD
carries **six** rows (`FSPEC:709-714`), row 6 being `fixture-machine.yml`'s rendered check, added
2026-08-16 per CODE_REVIEW v1 §3-1 (`FSPEC:703-705`). The retired "five-row" wording named a set
that no longer exists. The replacement names the table as it stands, so a further widening cannot
re-open the defect — the right shape of fix for a premise, not a narrowing.

**(e) PROP-GATE-5's re-scoping is true of the shipped oracle.** The claim is that PROP-PUB-6's two
set-equalities range over `pr-tests.yml`'s rows alone, so the two properties cannot both be
satisfied by editing one file. At HEAD the carrier is per-file: `EXPECTED_GATE` maps
`"pr-tests.yml"` and `"fixture-machine.yml"` to disjoint job-id sets
(`pdlc/engine/__tests__/ci-arrangement.test.js:65-66`); the pr-tests set-equality asserts "the FSPEC
§5.1 gate jobs **that belong to this file**" and says outright that "§5.1's sixth row belongs to
fixture-machine.yml and is asserted" elsewhere (`:250`, `:284`); the row-6 membership, trigger and
authored-alphabet equality live in a separate test (`:492-519`) with a rename-mutation control
(`:546`). The discrimination PROP-GATE-5 was written for therefore survives the widening intact,
and BR-7.1's file-scope derivation (`FSPEC:735-745`) is consistent with the per-file grouping.

**(f) §4's AT-1.6 sentence is now consistent with §4's own table.** §4's AT-1.6 row lists
**PROP-LAUNCH-5** and nothing else (`PROPERTIES:287`), and FSPEC's AT-1.6 *(AC-1.4)* entry pins
exactly the three members the prose now names — engine version, declared range, installed plugin
version (`FSPEC:719-722`). The prior wording ("the triple it reports there is AT-1.6's") sat close
enough to a carrier paragraph that a DoD reader could read a second carrier out of it; the new
wording states the shape claim and denies the carrier claim in the same breath. Prose and table
give one answer.

**Nothing regressed.** The `pr-tests.yml`-scoped "five rendered job names" in PROP-PUB-6 (`:158`),
PROP-REGR-2 (`:240`) and PROP-NEG-16 (`:269`) were deliberately left alone and remain correct —
that file still has five jobs. Oracle quality on the touched rows is unchanged: PROP-PUB-1 still
asserts a publish count `=== 1` plus the recorded version rather than "a publish happened";
PROP-PUB-2 and PROP-REGR-2 still carry their positive conjuncts against the absence-only form; no
edited expectation derives a value from the code under test.

**Product criteria: nothing lost.** No P0/P1 requirement lost a carrier and no carrier changed
hands. AC-3.1/AC-3.4's carriers (PROP-PUB-1, PROP-PUB-6) still trace, DoD items 14/15 still resolve
through PROP-GATE-1…-5, and AC-1.4 still resolves to PROP-LAUNCH-5.

## 4. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-09 | Low | Local | Upstream cell (`PROPERTIES:5`) pins `PLAN-pdlc-engine-distribution.md` **(v0.8)**; the PLAN at HEAD is **v0.15** (`PLAN:12`). This round re-grounded the citations that CODE_REVIEW v2 §1 named, but not the pin itself. I walked the property/carrier surface again and found no content drift: no property lost a carrier, no task id in §4/§5 is unknown to the PLAN, and §7's counts stand. Provenance drift, not content drift; not gating. When the document is next opened for any reason, bump the cell and add a changelog line recording that re-grounding found no substantive delta — v0.5 did exactly that for the FSPEC v0.6→v0.7 / PLAN v0.7→v0.8 move, and the difference between "re-checked, nothing moved" and "never re-checked" is worth one line. | — (upstream anchor hygiene; DEC-ERR-01) |
| F-10 | Low | Local | PROP-GATE-5's carrier cell (`:233`) reads `T50 → .github/workflows/fixture-machine.yml`, but the assertion the property now describes — row 6's membership, its `on: pull_request` trigger and its authored-alphabet set-equality — is executed in `pdlc/engine/__tests__/ci-arrangement.test.js:492-546` (T17), which the cell does not name. The property is genuinely carried and genuinely red-able; the cell just under-names where. Non-gating, and out of scope to change under freeze. | DoD item 14, C-5, BR-7.5 |

No High and no Medium findings. Both Lows are bookkeeping on a document whose substance I verified
against FSPEC v0.7, the PLAN and the shipped `ci-arrangement.test.js` this round.

DEFERRED: PROP-GATE-5's carrier cell should name `ci-arrangement.test.js` (T17) alongside T50, since row 6's set-equality is asserted there — F-10, next time the document is opened.

## Questions

None. The one question this round posed — whether widening §5.1 to six rows invalidated anything
PROPERTIES asserts — is answered mechanically in §3: it invalidated exactly the two citations the
edit fixed, and nothing else.

## Positive Observations

- **The fix to PROP-PUB-1 is count-free, not re-counted.** Replacing "five-row" with "six-row" would
  have bought one release of correctness and re-opened on the next widening. Naming the table as it
  stands retires the defect class. That is the more expensive edit to write and the cheaper one to
  own.
- **PROP-GATE-5 keeps its discrimination while telling the truth.** The easy fix — delete the
  "outside the frozen set" clause — would have silently dropped the reason the property exists (that
  it and PROP-PUB-6 cannot both be satisfied by editing one file). Re-scoping to PROP-PUB-6's
  `pr-tests.yml` set preserved the discriminating power and matches the shipped per-file oracle
  exactly.
- **The v0.7 changelog row names its own blind spot.** It records that the defect was invisible to
  CI because PROP-PUB-1's carrier drives a stub that configures its own gate members rather than
  reading §5.1. A changelog that says why the machine could not have caught this is worth more to
  the next reader than one that only says what changed.
- **Two rounds of presentational findings closed without touching an assertion.** F-08 and SE F-02
  both landed as prose/ordering edits with the counts, carriers and set-equalities provably still.
  That is the discipline that lets a frozen round be a short one.

## Recommendation

**Approved with minor changes.**

The revision broke nothing. Every delta claim is true at HEAD: §5.1 carries six rows, row 6 is
`fixture-machine.yml`'s, PROP-PUB-6's set-equalities are per-file and pr-tests-scoped in the shipped
carrier, §4's AT-1.6 row lists PROP-LAUNCH-5 alone, and FSPEC's AT-1.6 pins the three members the
prose names. The changelog is monotonic again, closing F-08. No property, carrier, level, trace or
count moved.

Two Lows remain open, both bookkeeping: F-09 (Upstream cell still pinned at PLAN v0.8, now seven
versions behind) and F-10 (PROP-GATE-5's carrier cell under-names its test file). Neither gates,
neither costs a user anything, and both close in one edit whenever the document is next opened.

No High findings are open in this document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
