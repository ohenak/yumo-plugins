# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-29
**Iteration:** 6 (delta re-review of v0.6 against v0.5)

## Overview

**Confirmation question:** did v0.6 land the item v5 routed, and did it break anything already approved?

**Answer: both routed items landed, and the re-grounding is faithful to TSPEC v0.9 — but the new
partition material carries one member the design never declares, which reddens T-11 by construction
again.** The root is upstream in TSPEC §7.3, not in the PLAN's transcription; it is routed as an
erratum, and the PLAN-side residue (an owned declaration no task creates) is filed as F-01.

The v5 round reviewed `a408375a6`. Five commits landed on the PLAN since:

| Commit | Subject |
|---|---|
| `8434787a1` | re-pin TSPEC to v0.9 and record the re-grounding pass |
| `f4b582678` | re-ground T-11's census operands on TSPEC v0.9 §7.3 |
| `b7c968be0` | correct the Definition of Done census bullet to TSPEC v0.9's partition |
| `a2bad6db6` | give the two new frozen census lists an owning task in the file-ownership manifest |
| `c937f1a7b` | align T-11's token-set gloss with TSPEC v0.9's declaration-based partition |

The whole diff is 34 insertions / 11 deletions across four sites: the header upstream pin, the
revision-history paragraph, the `T-11` row, the file-ownership manifest row for
`decisionLedgerCensus.test.js`, and the §Definition of Done census bullet. Both v5 findings are
closed on their own terms — the version bump is honest, the digest is re-derived correctly, and the
scanned-source and companion operands now say what TSPEC v0.9 §7.3 says.

What the round did not catch is that TSPEC v0.9's own owned-declaration list contains
`DECISION_LEDGER_CENSUS_TOKENS`, a constant that no TSPEC module-surface section (§3, §4, §5)
declares and that no PLAN green task writes into `orchestrate-dev.js`. Two of T-11's conjuncts —
"each member of `DECISION_LEDGER_OWNED_DECLS` resolves to exactly one top-level declaration at HEAD"
and "each slice asserted non-empty before counting" — both red on that member for a conforming
implementation. This is the same defect class round 9 repaired for `gatherDecisionCorpus` and §5.2's
catalogues, surviving in one place the repair did not reach.

## Batches

### The routed item landed (v5 F-01)

v5 asked for four things. All four are present, and the write-up is consistent across every site:

| Asked | HEAD | Verdict |
|---|---|---|
| Re-ground the scanned source on `DECISION_LEDGER_OWNED_DECLS`, sliced over *all* top-level declarations | `T-11` (PLAN:150): source minus "(a) the body of **every** member of `DECISION_LEDGER_OWNED_DECLS` — not a hand-picked three" and "(b) the `main()` wiring run bounded by the literal … sentinels"; slices "from a declaration's own line to the **next top-level declaration of any name**, boundaries from *all* of the module's top-level declarations … `bodyOf` over `allTopLevelDecls`" | ✅ matches TSPEC:1297 clause for clause |
| Replace exports set-equality with the disjoint partition | `T-11`: "`DECISION_LEDGER_CENSUS_TOKENS` ∪ `DECISION_LEDGER_CENSUS_EXEMPT` = `DECISION_LEDGER_OWNED_DECLS`, the two sub-sets disjoint"; the exports form named as **rejected**, "§7.3 names it red by construction" | ✅ matches TSPEC:1296 |
| Name whichever task declares the two new frozen lists | File-ownership manifest (PLAN:202): `decisionLedgerCensus.test.js` "(also the sole home of the two frozen test-file lists `DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS`, TSPEC §7.3)" → T-11, batch 2 | ✅ owner in the manifest, not only in prose |
| Keep the non-empty-slice conjunct and add v0.9's red-on-rename conjunct | `T-11`: "**Each slice asserted non-empty before counting**" retained; "each member of `DECISION_LEDGER_OWNED_DECLS` resolves to exactly one top-level declaration at HEAD" added | ✅ both present |

The six token members are unchanged from v0.8 to v0.9 and the PLAN still lists exactly those six; the
`decisionLedger`-is-not-a-token rationale survives and now carries the extra v0.9 clause that the
field "is a `report` field rather than a declaration", so it is absent from `OWNED_DECLS` too and the
partition is unaffected in both directions — which is exactly right, and is the conjunct that keeps
the new set-equality from quietly acquiring a sixteenth member.

Two additions I did not ask for and rate as genuine improvements: the token gloss now reads
"top-level declaration names … that carry or produce decision-record **data**" rather than "exported
names" (removing the last trace of the repudiated exports framing), and the row pins that the owned
list is "enumerated, never derived from a `/Decision/i` name pattern", citing five shipped
declarations (`MERGE_MAX_DECISION_STEPS`, `renderDecisionEntry`, `escalationDecision`,
`erratumGateDecision`, `parseDecisionsWarranted`) such a rule would wrongly exclude. I verified those
five exist in `pdlc/workflows/orchestrate-dev.js` at HEAD — they do.

### The partition arithmetic, re-derived

The PLAN asserts 6 ∪ 9 = 15. Re-deriving from TSPEC:1297's definition of `OWNED_DECLS`:

| Group | Members | Count |
|---|---|---|
| §4.1/§4.2/§4.4's six functions | `parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus` | 6 |
| Top-level constants | `DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`, `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT` | 5 |
| §5.2's three catalogues (TSPEC:909) | `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`, `DECISION_LEDGER_NOTICES` | 3 |
| Plus | `DECISION_LEDGER_CENSUS_TOKENS` itself | 1 |
| **Total** | | **15** |

The counts are internally consistent: tokens take 4 functions + 2 catalogues = 6; exempt takes 2
functions + 5 constants + 1 catalogue + `CENSUS_TOKENS` = 9; union 15, intersection empty. The PLAN's
nine-member exempt enumeration matches TSPEC:1296 name for name, and each carries its reason as §7.3
requires. **The set-equality is a real completeness check, not containment** — a symbol added later
must be classified or the test reddens. That is the property v5 asked for and it is correctly stated.

### Where it breaks: the fifteenth member (F-01)

Of the fifteen, fourteen have an owning green task that declares them in `orchestrate-dev.js`: T-13
(`DECISION_LEDGER_DEFAULTS`, `parseDecisionLedgerConfig`, `DECISION_LEDGER_NOTICES`), T-14
(`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `recogniseDecisionRecords`), T-15
(`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, `renderDecisionLedgerBlock`), T-16
(`selectDecisions`), T-17 (`gatherDecisionCorpus`, `DECISION_LEDGER_CORPUS_OUTCOMES`,
`buildDecisionLedgerInjector`) and T-18's wiring run. `DECISION_LEDGER_OMIT_REASONS` sits with the
selection layer. **`DECISION_LEDGER_CENSUS_TOKENS` has no such task.**

It has none because it is not production code. It is the census test's own operand, cloned from the
precedent's `ANCHOR_TOKENS`, which is declared at `pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js:114`
and appears nowhere under `pdlc/workflows/*.js`. TSPEC confirms this by omission: `CENSUS_TOKENS`
occurs seven times in the document, all of them in §7.3 or the changelog, and never in §3, §4 or §5
where the module's declared surface is specified. The PLAN's own manifest edit says the same thing
from the other side — it names `CENSUS_EXEMPT` and `OWNED_DECLS` as test-file constants "as the
precedent's `ANCHOR_TOKENS` is", which is precisely what `CENSUS_TOKENS` is too.

So T-11 as written cannot go green on a conforming implementation, by two independent conjuncts:

1. **Red-on-rename conjunct.** "Each member of `DECISION_LEDGER_OWNED_DECLS` resolves to exactly one
   top-level declaration at HEAD." `CENSUS_TOKENS` resolves to *zero* declarations in
   `orchestrate-dev.js`. Red.
2. **Non-empty-slice conjunct.** "Each slice asserted non-empty before counting." The slice for
   `CENSUS_TOKENS` is empty, there being no declaration to slice from. Red.

TSPEC:1297's stated reason for including it — "the token strings live inside its own declaration, so
the census would otherwise red on its own literal" — is void under the test-file reading: the census
scans `orchestrate-dev.js`, the test file is not scanned, and no self-reddening is possible. The
reason only holds if `CENSUS_TOKENS` were a production declaration, which nothing in the design makes
it. This is a genuine upstream error, and the PLAN transcribed it faithfully.

I am not asking the PLAN to unilaterally drop the member — that would put the PLAN out of contract
with its freshly-pinned upstream, which is the failure mode this round just repaired. The root is
routed as `ERRATUM: TSPEC`. What the PLAN owes on its own account is F-01: no task creates a
declaration its central red test requires to exist, and the manifest that carefully assigns the other
two lists is silent on this one. Once TSPEC settles the member's home, three PLAN sites move
together — the `T-11` row, the manifest parenthetical (which becomes "three frozen test-file lists"),
and the §Definition of Done bullet's **fifteen**/**nine** literals.

## Dependencies

### Upstream pins (v5 F-02 — closed)

Re-measured mechanically with `shasum -a 256` against HEAD:

| Pin | PLAN header | HEAD | Verdict |
|---|---|---|---|
| REQ v1.9 | `sha256:ce6b133f…3c7b7c` | `ce6b133f0c1d…0d3c7b7c` | ✅ |
| FSPEC v1.3 | `sha256:2bd5c3ef…5aed39` | `2bd5c3ef055f…735aed39` | ✅ |
| TSPEC **v0.9** | `sha256:eef45ef3…0623c8` | `eef45ef32f0d…ece0623c8` | ✅ **v5 F-02 closed** |
| DECISIONS | `sha256:13aba061…4fb89a` | `13aba06127b4…bb4fb89a` | ✅ |

All four match to the character. The version label moved v0.8 → v0.9 in the header, and the two
in-body version citations moved with it — `T-11`'s "TSPEC v0.9 §7.3" (twice, once for the token
rationale and once for the scanned source) and the §Definition of Done bullet's "TSPEC v0.9 §7.3"
(twice). `grep -n "v0.8" PLAN` returns no match in any TSPEC citation. The staleness v5 flagged is
fully gone, and the revision-history paragraph is honest that v0.6 "is a re-grounding pass on
upstream movement, not a response to a new defect in v0.5's bytes" — an accurate self-description.

### Batch-DAG re-derivation

The edit touches no `Batch` or `Depends on` column. Re-derived over the tasks the diff names, plus
their neighbours, using `batch == max(dep batch) + 1`:

| Task | Depends on | max(dep batch) | Declared | Verdict |
|---|---|---|---|---|
| T-00, T-01 | — | — | 1 | ✅ |
| T-11 | T-00, T-01 | 1 | 2 | ✅ |
| T-13 | T-02, T-04 | 2 | 3 | ✅ |
| T-14 | T-05, T-13 | 3 | 4 | ✅ |
| T-15 | T-06, T-14 | 4 | 5 | ✅ |
| T-18 | (greens through T-17) | 7 | 8 | ✅ |
| T-19 | T-12, T-18 | 8 | 9 | ✅ |

Acyclic over the touched sub-graph, ids unique, every declared dependency resolves to a real task.
T-11 remains `[red]` in batch 2 with T-18 the `[green]` that depends on it, so the red-before-green
edge is intact — which is exactly why F-01 matters: T-18 cannot un-skip a test that reddens on
correct code.

**Same-batch same-new-file check.** The manifest edit adds no file and no task. `decisionLedgerCensus.test.js`
is still created by T-11 alone, in batch 2; naming it "the sole home" of the two frozen lists is a
clarification of ownership, not a second author. No same-batch collision is introduced. ✅

### Cross-check of other TSPEC-derived rows

TSPEC v0.9's changelog names §5.4, §7, §7.2 and §7.3 as touched. v5 verified §7.5 (`T-05`/`T-06`'s
`P-REC`/`P-LINE` mutation rows) and §7.2's re-homing were unaffected; the v0.6 diff touches neither,
so that clearance stands. `T-10a`'s live composition-root arm is cited from §7.2 and its text is
unchanged in this diff; the `T-11` row's cross-reference to it ("T-10a asserts `report.decisionLedger`
on a real `main()`-driven run, and the flag-off arm pairs its absence with a set-equality on the
report's key set") still matches TSPEC:1332–1335's two named homes. ✅ — and I note approvingly that
this is an absence assertion correctly paired with a positive set-equality on the same path, not an
absence-only oracle.

## Verification

Every claim above is grounded in a command run at HEAD, not in a reading of the documents alone:

| Claim | How verified |
|---|---|
| Delta is exactly five commits, 34+/11− | `git log --oneline a408375a6..HEAD -- …PLAN…`; `git diff a408375a6..HEAD --stat -- …PLAN…` |
| All four upstream digests match the header pins | `shasum -a 256` over the four upstream files, compared character by character |
| No stale `v0.8` citation remains | `grep -n "v0\.8" …PLAN…` → no TSPEC citation |
| Scanned source and companion operands match TSPEC v0.9 | `TSPEC…md:1296` (forbidden token set), `:1297` (scanned source), compared clause by clause with `PLAN…md:150` |
| §5.2 has exactly three catalogues, and their names | `TSPEC…md:909` frozen-catalogue table — `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`, `DECISION_LEDGER_NOTICES` |
| `OWNED_DECLS` decomposes to 15 | Re-derived group by group from `TSPEC…md:1297`; matches the PLAN's **fifteen** |
| Exempt list is 9 and matches TSPEC name for name | `PLAN…md:150` vs `TSPEC…md:1296`, enumerated both ways |
| Union is 15 and the two sub-sets are disjoint | Set arithmetic over the two enumerations; no name appears twice |
| `ANCHOR_TOKENS` is test-file-only in the precedent | `grep -n "ANCHOR_TOKENS" pdlc/workflows/__tests__/loopEconomicsAnchorGuard.test.js` → `:114`; `grep -rn "ANCHOR_TOKENS" pdlc/workflows/*.js` → no match |
| `CENSUS_TOKENS` is never in TSPEC's module surface | `grep -c "CENSUS_TOKENS" TSPEC` → 7; all occurrences at `:32/:36/:37/:89/:1296/:1297/:1300/:1318/:1329`, i.e. §7.3 and changelog only; none in §3/§4/§5 |
| No PLAN green task declares `CENSUS_TOKENS` | `grep -n "CENSUS_TOKENS" …PLAN…` → lines 30, 47, 150, 488 only — the revision history, the `T-11` row and the DoD bullet; no `[green]` production row |
| The other fourteen owned declarations each have an owning task | T-13…T-18 rows at `PLAN…md:151–156`, read against the fifteen-member decomposition |
| The five shipped `/Decision/i` decoys exist | `grep -n` for `MERGE_MAX_DECISION_STEPS`, `renderDecisionEntry`, `escalationDecision`, `erratumGateDecision`, `parseDecisionsWarranted` in `pdlc/workflows/orchestrate-dev.js` |
| Manifest owner and batch | `PLAN…md:202`; batch column re-derived against T-11's declared dependencies |
| No same-batch same-new-file collision introduced | File-ownership manifest read in full; `decisionLedgerCensus.test.js` has one owner |

**Not verifiable at this altitude, and correctly deferred:** the exact fixture shape of
`decisionLedgerCensus.test.js`, the assertion helper `bodyOf`/`allTopLevelDecls` is cloned into, and
whether the fifteen (or fourteen) slices are asserted non-empty individually or in a loop. Those are
TSPEC/PROPERTIES and implementation concerns; the PLAN owes only the operand contract and the
ownership, and it states both.

## Positive Observations

- **The routed item landed at every site it touched, and the round found the sites itself.** v5 named
  four obligations; v0.6 discharged all four and additionally corrected the token gloss from
  "exported names" to "top-level declaration names that carry decision-record data", which nothing
  asked for but which removes the last residue of the framing §7.3 repudiated. Four consistent sites,
  no dangling prose contradicting the new contract.
- **The partition is a real completeness oracle, and it is the right shape.** `CENSUS_TOKENS ∪
  CENSUS_EXEMPT = OWNED_DECLS`, disjoint, is set equality over the full enumeration — a symbol added
  later must be classified into one list or the other or the test reddens. That is strictly stronger
  than the containment check a weaker author would have written, and it preserves the "cannot escape
  by omission" property the repudiated exports form was reaching for, without that form's
  red-by-construction defect.
- **The enumerate-don't-pattern-match pin is a durable piece of test design.** Deriving the owned
  list from `/Decision/i` would have been the obvious shortcut; the row names five shipped
  declarations that rule would wrongly exclude, and I confirmed all five exist. That is the
  difference between an exclusion list that blinds the census and one that documents itself.
- **The `decisionLedger` field's two-sided argument is complete.** It is not a token (unsatisfiable
  in the remainder via `buildFinalReport`) *and* not a declaration (so absent from `OWNED_DECLS`),
  hence the partition is unaffected in both directions — the second half is new in v0.6 and is
  exactly the conjunct that stops the new set-equality acquiring a spurious member. The field's
  obligation is then discharged behaviourally by T-10a's live `main()`-driven arm, with the flag-off
  absence paired to a positive set-equality on the report's key set rather than left as an
  absence-only oracle.
- **The revision history is honest about what kind of pass this was.** It says plainly that v0.6
  responds to upstream movement rather than to a defect in v0.5's bytes, enumerates the three
  consequences, and states that the six token members, the `decisionLedger` rationale and every
  batch/dependency/ownership assignment are unchanged. That is a reviewer's map of the diff, and it
  matched the diff exactly.
- **F-01 was findable because the document states its counts.** Writing **six**, **nine** and
  **fifteen** as literals is what let one decomposition against TSPEC:1297 expose the member with no
  home. A row that had said "the owned declarations" without the arithmetic would have shipped this.

## Recommendation

**Needs revision**

One High finding is open. Both items v5 routed landed cleanly and nothing already approved was
broken — the DAG, the file-ownership manifest, the six token members and every batch assignment
survive the re-grounding unchanged, and all four upstream pins now verify to the character.

What blocks approval is that the new partition names fifteen owned declarations while the design
declares fourteen. `DECISION_LEDGER_CENSUS_TOKENS` is the census test's own operand — the analogue of
the precedent's test-file-local `ANCHOR_TOKENS` — not a declaration in `orchestrate-dev.js`; no PLAN
green task creates it, and TSPEC declares it in no module-surface section. T-11's red-on-rename
conjunct ("resolves to exactly one top-level declaration at HEAD") and its non-empty-slice conjunct
both red on that member for a conforming implementation, which puts a `[red]` row that T-18 depends
on back into the state round 9 repaired for `gatherDecisionCorpus` and §5.2's catalogues.

The root is upstream: TSPEC §7.3:1297 places the member in `DECISION_LEDGER_OWNED_DECLS`, with a
rationale ("the token strings live inside its own declaration") that only holds if the constant were
production code. That is routed as `ERRATUM: TSPEC` — the PLAN should **not** drop the member
unilaterally, which would put it out of contract with the upstream it just re-pinned.

To close F-01 once TSPEC settles the member's home, three PLAN sites move together:

1. **`T-11` (PLAN:150)** — move `DECISION_LEDGER_CENSUS_TOKENS` into the same test-file-constant
   clause that already carries `CENSUS_EXEMPT` and `OWNED_DECLS`, and restate the partition over the
   fourteen production declarations (tokens **six** ∪ exempt **eight** = owned **fourteen**), so that
   every member of `OWNED_DECLS` is a declaration some green task writes.
2. **File-ownership manifest (PLAN:202)** — "the two frozen test-file lists" becomes three, naming
   `DECISION_LEDGER_CENSUS_TOKENS` alongside the other two, so the manifest states where all three
   operands live rather than two of them.
3. **§Definition of Done (PLAN:488)** — the **nine** and **fifteen** literals move to **eight** and
   **fourteen** with the same disjointness and one-declaration conjuncts.

If instead TSPEC's erratum keeps the member by making it a production constant, then the PLAN owes
the mirror-image fix: a `[green]` task that declares `DECISION_LEDGER_CENSUS_TOKENS` in
`orchestrate-dev.js`, an entry for it in the file-ownership manifest, and a dependency edge putting
it before T-11 in batch order. Either resolution is acceptable to this lens; what is not acceptable
is a frozen list whose member no task creates.

No Medium or Low findings this round.

## Delta-Confirmation Findings

## Verdict
