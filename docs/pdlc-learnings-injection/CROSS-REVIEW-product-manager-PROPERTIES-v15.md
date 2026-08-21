# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 15 (delta re-review under DECISION FREEZE — PROPERTIES moved v0.9 → v1.0)

## Overview

**What moved.** PROPERTIES went **v0.9 → v1.0** in five commits — `bc28ad0a` (header pin claim
narrowed), `bb2d45f1` (§C.4's P-A-6 fallback restated), `9c945683` and `9e9a79e5` (§G.2 gap 5's
count re-derived, then the two "eighteens" distinguished), `de2443f8` (§G.3's routed manifest item
struck). The whole delta is **56 insertions, 29 deletions in one file**
(`git diff --stat cb09985d HEAD -- docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`).
It exists to land my v14 findings F-01…F-06 and SE v14 F-01…F-04.

**The diff, hunk by hunk, and what each one closes:**

| Hunk | Location | Change | Closes |
|---|---|---|---|
| 1 | Header `Upstream` cell (line 11) | The v0.9 blanket *"every ruling this document cites is still present at v1.3"* is replaced by a claim **scoped to the rulings re-checked** (P-A-7's three cases and their windows), plus a v1.0 paragraph naming P-A-6 as the ruling PLAN **did** move | F-01 limb 3 |
| 2 | Version row (line 18) | `0.9` → `1.0` | — |
| 3 | §C.4 fixture inventory row (line 1091) | `Added by 744311f7` now reads *"subtree added; the `PIPELINE-NON-AUTHORING-PROMPTS/` arm of 18 files and the `MANIFEST.json` re-capture arrived later, at `2fc6fcd3` — two landing events"* | F-06 |
| 4 | §C.4 case-C quotation (line 1131) | PLAN quotation extended through *"— which PROPERTIES §C.4 records as discharged"* | SE v14 |
| 5 | §C.4 P-A-6 passage (lines 1178–1192) | The amend-into-the-ledger route is replaced by **P-A-7's governing case C** (green-at-landing, red is a real defect owed a fix before batch 14), with PLAN's rewritten P-A-6 quoted verbatim; *"byte-unchanged at v0.8"* becomes *"whose fallback route PLAN rewrote at **v1.1**"* | **F-01** |
| 6 | §G.2 gap 5 (lines 1280–1310) | The count is re-derived: **seventeen** workflows-side files plus an **eighteenth** engine-side; the raw-`ls-files` 39/22 decomposition is shown; the inventory-table eighteen and the tracked-file eighteen are explicitly distinguished; `helpers/learningsComposition.js` is recorded as unnamed-but-executed on PROP-ORDER-05's path; PLAN's closure recorded | **F-03, F-04** |
| 7 | §G.3 (lines 1348, 1365, 1379–1394) | The *Newly routed this round* bullet is struck into the *Also answered* list citing PLAN v1.2 items (3)/(4) and v1.3 item (1); the case-C paraphrase *"after batch 13"* becomes *"in batch 13 or later"* | **F-02, F-05** |

`## Properties` (87–607), `## Oracles` (608–808), `## Fixtures` (809–917) and §C.1/§C.2/§C.3
(918–1051) are **byte-untouched** — every changed line sits in the header, §C.4 Reconciliation or
§G. The header's claim *"No property, oracle, fixture, AT mapping or coverage row moves at v1.0
either"* is true against the diff, checked against line ranges rather than against the sentence.

**All six of my v14 findings are resolved, and every quotation the delta introduces verifies.** I
fixed-string grepped each new quotation against PLAN at HEAD (v1.3, `PLAN-pdlc-learnings-injection.md:18`):

| Quotation the delta now carries | Hits in PLAN at HEAD |
|---|---|
| P-A-6's rewritten fallback, *"…the amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12"* | **1** (`PLAN:663`) |
| *"they owe green — which PROPERTIES §C.4 records as discharged"* | **1** (`PLAN:561`) |
| *"the tracked `learnings*` test-side set is eighteen files"* | **1** (`PLAN:310`) |
| PLAN v1.1's changelog attribution for the P-A-6 rewrite (TE F-03) | **1** (`PLAN:682`) |
| PLAN v1.2 items (3)/(4); v1.3 item (1)'s **nineteen-row** §Post-batch remediation | present (`PLAN:683`, `:684`); the subsection at `PLAN:244` carries **19** data rows, counted |

**The product question this round asks.** v14's High was that a re-pin had converted a
dated-but-true instruction into a current-and-false one: an implementer landing this document's own
PROPERTIES suite red was directed to amend a PLAN ledger that no longer exists. The only question
that matters now is whether the fix states the *live* obligation, and whether closing it broke
anything adjacent. It does, and it did not. No finding.

## Properties

**No property text, no property status, and no coverage count moved.** `## Properties` (87–607) is
outside every changed line range, and §C.3's accounting rows (`Tasks owning ≥1 property | 21`,
`Properties with **no** owning task | 0`, `Fail-open arms | 12`) sit at 1008–1010, also outside it.
So the property-side question is the same narrow one as at v14: does the restated P-A-6 make any
status claim about a property false, or change what a property owes?

**It does not, and it fixes the one live instruction that was wrong.** Lines 1180–1186 now read that
the PROPERTIES suite *"may be committed as soon as it is green — or, if it lands red, its rows are
handled under **P-A-7's governing case**, which at HEAD is **case C**: no ledger remains to amend
into, the obligation is green-at-landing, and a red landing is a real defect owed a fix **before
batch 14 runs**"*, and then quotes PLAN's rewritten rule verbatim. That is character-exact against
`PLAN-pdlc-learnings-injection.md:663`, which reads *"the PROPERTIES **suite** lands in one commit
once green, or else its rows are handled under **P-A-7's governing case** — which at HEAD is case C,
where no ledger remains to amend into and the obligation is green-at-landing; the
amend-into-the-ledger-by-name route is case B's, and case B closed at batch 12 (TE v11 F-03)"*
(1 fixed-string hit). PLAN's v1.1 changelog row confirms the rewrite was deliberate and attributes it
to TE F-03 (`PLAN:682`, 1 hit). **F-01 is closed on all three limbs** it named: the route (line
1180), the *"byte-unchanged at v0.8"* currency claim (line 1192, now *"whose fallback route PLAN
rewrote at **v1.1**, restated above"*), and the header's blanket sentence (line 11, now scoped).

**The fix did not over-reach in the direction that would have cost something.** The restatement
carries the *"a red landing is a real defect owed a fix before batch 14 runs"* limb through from
PLAN's own case-C text rather than dropping the failure obligation while retiring the ledger route —
which is the failure mode a "no ledger remains" edit invites. The document's standing distinction is
preserved verbatim: *"the conclusion that **no property of this document changes either way** is
unaffected; what changes is only when its cases may land and which case of the table governs them"*
(line 1188), and the two-mechanism paragraph still separates P-A-7 case C (landed implementation
suites) from P-A-6 (this document's own suite) at line 1190–1193.

**The green measurement underneath the case-C statuses still reproduces at HEAD.** Re-run in
`pdlc/workflows` with the package's `--experimental-vm-modules` runner (`npx jest` directly fails to
parse the ESM suites, so the package script is required):

```
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
```

`grep -c 'test\.skip\|describe\.skip'` is `0` on both `learningsBlock.test.js` and
`learningsSelect.test.js`. Nothing in this delta disturbed the measurement its statuses rest on, and
the *"**unexercised**, not waived"* failure limb is unchanged.

**The extended case-C quotation at line 1131 is verbatim, not a paraphrase folded into quote marks.**
The delta moves the closing quote from after *"they owe green"* to after *"— which PROPERTIES §C.4
records as discharged"*. I checked this specifically, because extending a quotation to swallow a
downstream clause is exactly how an implementation echo enters a document: PLAN at `:561` carries
*"under case C they owe no ledger row, and they owe green — which PROPERTIES §C.4 records as
discharged"* as one continuous sentence (1 fixed-string hit). The extension is PLAN's own text.

**Nothing was added to or dropped from the property set.** `Properties with **no** owning task | 0`
is byte-unchanged, and gap 5's new `helpers/learningsComposition.js` clause is careful to say the
file is *"unnamed but not unexercised"* — it changes what the prose discloses, not what any property
asserts.

## Oracles

**No oracle row, AT mapping, level or red/green owner changed.** §O.1–§O.10 (608–808) are outside
every changed line range; the delta adds no commit anchor and retires none. What it touches on the
oracle side is the upstream ruling each case-C status is read against, plus §G's routing state — and
this round both sweeps are complete.

| Oracle-side dependency | Delta effect | Verified at HEAD |
|---|---|---|
| **P-A-6 → this document's own PROPERTIES suite** | **Swept** — case-B ledger route replaced by case C's green-at-landing obligation; the v0.8 currency claim re-dated to v1.1 | `PLAN:663` verbatim (1 hit); `PLAN:682` attributes the rewrite to v1.1 / TE F-03 (1 hit) — **v14 F-01 closed** |
| **§G.3's "Newly routed — one item"** | **Swept** — struck into the *Also answered* list, citing PLAN v1.2 items (3)/(4) and v1.3 item (1) | `PLAN:683` carries items (3) and (4); `PLAN:684` carries v1.3 item (1); the §Post-batch remediation subsection at `PLAN:244` has **19** data rows, counted — **v14 F-02 closed** |
| PROP-BOUND-03/05/07/08 → P-A-7 case C | Quotation extended, still verbatim | `PLAN:561` (1 hit) |
| Case-C paraphrase in the struck §G.3 bullet | `after batch 13` → `in batch 13 or later` | Matches `PLAN:561`'s case header *"batch 13 or later, the case that is live at HEAD"* — **v14 F-05 closed** |
| PROP-ORDER-05's two-process oracle | Now disclosed as running through an unowned helper | `helpers/learningsComposition.js:2–3` and `learningsDispatchSet.test.js:42/47/528/531` — see below, **v14 F-04 closed** |
| PROP-CONFIG-09 ↔ LI-12's three-case `LI-AT-30` | Untouched | Unchanged since v13 |

**F-04's clause is not just added, it is accurate to the code.** Gap 5 now states that
`helpers/learningsComposition.js` *"is unnamed but not unexercised"*, quoting its header as *"the
AC-2.5 / PROP-ORDER-05 composition, in one place so it can be driven from TWO SEPARATE NODE
PROCESSES (CODE_REVIEW v1 F8)"*. That is verbatim across
`pdlc/workflows/__tests__/helpers/learningsComposition.js:2–3` (the capitalisation is the file's
own). The wiring claim checks out at the level the finding asked for — this is a production-path
question, not a builder-in-isolation one: `learningsDispatchSet.test.js:42` imports
`composeAuthoringPrompts` from it, `:47` binds `COMPOSITION_CHILD_PATH` to the same file, `:528`
calls the import in-process and `:531` `spawnSync`s the file as a child. So the two-process oracle
genuinely **executes through** the unowned helper, in both processes, exactly as the new clause
says. The clause is also correctly bounded: *"the oracle does not move and is not weakened by the
file's unowned status; the gap is one of manifest completeness, not of oracle fidelity"*.

**The struck §G.3 bullet reports PLAN's choice, and PLAN made that choice.** The strike says *"PLAN
chose the third of the three options this item left open — a remediation subsection outside the
ladder, not task rows"*. `PLAN:244` is headed *"### Post-batch remediation (CODE_REVIEW v1) — outside
the batch ladder"*, its rows carry a `Landing commit` column and no `Owner` cell, and `PLAN:310`
excludes them from the ladder arithmetic *"by construction"*. Third option, as reported. The
*"Still open — one item"* list below is untouched and still carries exactly one item, so striking
the routed bullet did not silently empty a routing channel.

**DEC-DOC-01: no finding.** The delta adds no bare `file:line` anchor. Its two new anchors
(`PLAN`, P-A-6 and §The arithmetic) travel with verbatim quotations, so the quotation is the claim
and the id is convenience.

## Fixtures

**§F.1–§F.3 (809–917) are byte-untouched.** The delta's two fixture-adjacent edits are both in §C.4's
inventory and §G.2's gap 5, and both are counting/attribution claims. I re-derived every number from
the tree at HEAD rather than reading them.

| Claim the delta now makes | Command | Result | Holds? |
|---|---|---|---|
| *"**seventeen** `learnings*` files under `pdlc/workflows/__tests__`"* | `git ls-files pdlc/workflows/__tests__ \| grep -E '(^\|/)learnings' \| grep -v fixtures/` | **17** | Yes |
| *"the ladder's thirteen (twelve suites plus `helpers/learningsFixtures.js`)"* | same listing minus `2fc6fcd3`'s adds | 12 suites + 1 helper = **13** | Yes |
| *"plus `2fc6fcd3`'s four added test-side files"* | `git show --name-status 2fc6fcd3 \| grep ^A` | `helpers/learningsBaselineScenarios.js`, `helpers/learningsComposition.js`, `learningsDisclosure.test.js`, `learningsErratumBinding.test.js` = **4** (13+4=17) | Yes |
| *"an **eighteenth** engine-side, `pdlc/engine/__tests__/learnings-config-example.test.js`"* | `git ls-files pdlc/engine/__tests__ \| grep learnings` | exactly that one file, added `A` at `2fc6fcd3` | Yes |
| *"a raw `git ls-files pdlc/workflows/__tests__ \| grep learnings` returns **39 paths**, of which **22** are that subtree's fixture files"* | both commands | **39** and **22** (39−22=17) | Yes |
| *"the same convention and the same number PLAN §The arithmetic now states"* | fixed-string grep | `PLAN:310` — *"the tracked `learnings*` test-side set is eighteen files"*, 1 hit | Yes |
| *"§C.4's inventory table also totals **eighteen**, but counts a different set"* | count `^\| \`` rows in the table | **18** rows | Yes |

**v14 F-03 is closed, and closed in the stronger direction.** I asked only that the prose stop
claiming eighteen files where the tree holds seventeen. The delta does that and then reconciles the
two eighteens against each other and against PLAN's — *"the two eighteens agree by coincidence of
arithmetic, not by naming the same entities"* — which is exactly the ambiguity I had filed as a
DEFERRED at v14. The decompositions are consistent across documents rather than merely both landing
on 18: PLAN's *"the ladder's thirteen … plus `2fc6fcd3`'s five added files"* counts the engine-side
file among the five; PROPERTIES' 17 + 1 splits the same set by directory. Same eighteen entities,
two groupings, and both documents now say which grouping they mean.

**v14 F-06 is closed.** §C.4's `fixtures/learnings-baseline/` row now reads `744311f7` *"(subtree
added; the `PIPELINE-NON-AUTHORING-PROMPTS/` arm of 18 files and the `MANIFEST.json` re-capture
arrived later, at `2fc6fcd3` — two landing events, recorded as PLAN §Post-batch remediation's P-A-5
second-owner rows)"*. Against the tree: `744311f7` adds `MANIFEST.json`,
`PHASE-F-AUTHORING-PROMPT/0.txt` and `PHASE-R-REVIEW-PROMPTS/{0,1}.txt` and **no**
`PIPELINE-NON-AUTHORING-PROMPTS/` path; `2fc6fcd3` adds all 18 `PIPELINE-NON-AUTHORING-PROMPTS/*.txt`
and carries `MANIFEST.json` as `M`. Both landing events, correctly attributed, and PLAN's
corresponding second-owner row exists (`PLAN:244` subsection, the
`fixtures/learnings-baseline/ (incl. MANIFEST.json; +18 PIPELINE-NON-AUTHORING-PROMPTS/*.txt)` row).

**The fixture-side facts I measured at v13/v14 still hold at HEAD**, and the delta touches none of
them: §C.4's fixture enumeration matches `git ls-files`; `.baseline-worktree` is still non-ignored
(`git check-ignore -v` exits 1 against `.gitignore:13`'s `/.baseline-worktree/`); PROP-BOUND-07's
hand-computed byte literals are still transcribed beside the AT-11 fixture at
`learningsBlock.test.js:174/:194/:235`, none derived from the code under test; §F.1's corpus
fixtures still read from an unchanged `helpers/learningsFixtures.js`.

**Nothing falsifies PROP-META-04.** No digest, manifest row or fixture path moved this round — the
delta's fixture-side changes are attribution and counting prose only.

## Findings

**No findings.**

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | *No High, Medium or Low finding is raised this round.* | — |

All six of my v14 findings are closed, each verified against the repository rather than against the
document's own account of itself:

| v14 finding | State at HEAD | Evidence |
|---|---|---|
| **F-01 (High)** — re-pin asserted a fidelity the document lacked; P-A-6's retired amend-into-the-ledger route still offered | **Closed**, all three limbs | Line 1180 states case C's obligation; line 1192 re-dates P-A-6 to v1.1; line 11 scopes the pin claim to the rulings re-checked and names P-A-6 as one PLAN moved. PLAN's rule quoted verbatim (`PLAN:663`, 1 fixed-string hit); v1.1 changelog attribution present (`PLAN:682`) |
| **F-02 (Medium)** — §G.3 still routed an item PLAN answered | **Closed** | Bullet struck into *Also answered*, citing PLAN v1.2 items (3)/(4) and v1.3 item (1); `PLAN:244`'s §Post-batch remediation carries **19** data rows, counted; the *Still open* list still carries its one item |
| **F-03 (Medium)** — gap 5's "eighteen" not reproducible | **Closed**, plus the DEFERRED it implied | 17 / 39 / 22 / engine-side-file all re-derived from `git ls-files`; the inventory-row eighteen and the tracked-file eighteen are now distinguished in the text; PLAN's `§The arithmetic` quotation is verbatim (`PLAN:310`) |
| **F-04 (Medium)** — `learningsComposition.js` on PROP-ORDER-05's path, undisclosed | **Closed** | New clause quotes the file header verbatim (`helpers/learningsComposition.js:2–3`) and the wiring holds: `learningsDispatchSet.test.js:42` imports, `:47` binds the child path, `:528` calls in-process, `:531` spawns the child |
| **F-05 (Low)** — *"after batch 13"* residual | **Closed** | Now *"in batch 13 or later"*, matching `PLAN:561`'s case header |
| **F-06 (Low)** — fixture row attributed two capture events to one commit | **Closed** | Row names both `744311f7` (subtree) and `2fc6fcd3` (the 18-file arm and the `MANIFEST.json` re-capture); confirmed against `git show --name-status` on both commits |

**Nothing in the changed sections is broken, and nothing outside them moved.** Against the freeze's
two blocking criteria: **(i)** no defect is introduced — the one edit with real breakage potential,
the extended PLAN quotation at line 1131, is verbatim in PLAN (`PLAN:561`, 1 hit) rather than a
paraphrase pulled inside quote marks; **(ii)** no claim in the changed sections contradicts the
repository at HEAD or an upstream document — I re-derived all seven counting claims from `git
ls-files` / `git show --name-status`, all five quotations by fixed-string grep against PLAN at v1.3,
and the 26-passed / 0-skipped measurement by re-running the suites.

**No upstream erratum this round.** Both items I routed at v13 landed in PLAN v1.2/v1.3, and the
one this round would have raised — PLAN's manifest under-count — is the item PLAN already closed.

## Deferred

Observations that are improvements, not defects. Under DECISION FREEZE none of these blocks, and
none reopens a decision:

DEFERRED: The header's v1.0 paragraph now scopes its pin claim correctly, but still states the scope in prose; a two-column table of "ruling cited → version re-checked at → moved?" would make the next re-pin's sweep auditable at a glance instead of by reading.
DEFERRED: v14's sweep-mechanism DEFERRED still stands and is now cheap to adopt — grep the pinned document for every `P-A-n` / `DoD n` id this document cites and diff each across the version range being crossed, rather than sweeping only the quotations a reviewer named.
DEFERRED: §Overview's HEAD measurement pin is `09c7c62f` while HEAD is `9e9a79e5`; correct as a snapshot label, but "measured at `09c7c62f`, document at v1.0" would spare the next reader the reconciliation.
DEFERRED: Gap 5 is now three paragraphs doing four jobs (count derivation, convention reconciliation with PLAN, the composition-helper scope clarification, and the record of where PLAN closed it); splitting it into a "count" and a "disposition" bullet would keep it readable as it accretes.
DEFERRED: The header says "no coverage row moves at v1.0" while line 1091 — a row in §C.4, which sits under `## Coverage Matrix` — did move; the document's usage of "coverage row" plainly means §C.1/§C.2/§C.3's AT/property rows, which are byte-untouched, but naming that scope once would remove the apparent tension.
DEFERRED: §G.3's *Also answered* heading now reads "by PLAN v0.6/v0.7/v0.8 and, for the last item, v1.2/v1.3, all of which moved after the round whose reviews raised them" — accurate but load-bearing on ordering; a per-bullet version attribution would survive the next insertion into that list.

## Positive Observations

- **Every one of my six findings is closed, and closed by mechanism rather than by wording.** F-01
  did not merely delete the offending clause: it restated the live obligation *including the failure
  limb* (*"a red landing is a real defect owed a fix **before batch 14 runs**"*), which is the part a
  minimal fix would have dropped while retiring the ledger route. That is the difference between
  removing a wrong instruction and supplying the right one.
- **The riskiest edit in the delta is the one that verifies most exactly.** Extending a quotation's
  closing quote mark past *"they owe green"* to swallow *"— which PROPERTIES §C.4 records as
  discharged"* is precisely how a document's own conclusion gets laundered into an upstream citation.
  I grepped it expecting a finding; PLAN carries the whole sentence (`PLAN:561`). Fetching the extra
  clause from PLAN rather than writing it was the right call.
- **F-03's fix went past the finding into the DEFERRED behind it.** I asked for seventeen instead of
  eighteen. The delta re-derived the count, showed the 39/22 raw decomposition so the number is
  reproducible from a command rather than trusted, distinguished the inventory-row eighteen from the
  tracked-file eighteen, and reconciled both against PLAN's — retiring the ambiguity I had only
  flagged as worth retiring someday.
- **F-04's clause is bounded as tightly as the fact warrants.** *"Unnamed but not unexercised"*, with
  the header quoted and both call sites implied, then: *"the oracle does not move and is not weakened
  by the file's unowned status; the gap is one of manifest completeness, not of oracle fidelity"*.
  A completeness gap recorded as a completeness gap, with no inflation into a fidelity claim.
- **The strike convention paid off a second time.** §G.3's routed item is struck with its answer
  attached — PLAN v1.2 items (3)/(4), v1.3 item (1), nineteen rows, and *which of the three options
  PLAN chose*. I verified that last claim in one command against `PLAN:244`. Deleting the bullet
  would have cost that audit trail; striking it preserved it.
- **The blast radius stayed honest under a five-commit round.** 56 insertions, 29 deletions, and
  `## Properties`, `## Oracles`, `## Fixtures` and §C.1/§C.2/§C.3 byte-untouched — six findings
  landed without a single property, oracle, fixture, AT mapping or coverage row moving.

## Recommendation

**Approved.**

Zero High, zero Medium, zero Low. All six of my v14 findings — the High (F-01) and the five
non-gating ones — are closed and verified against the repository at HEAD, not against the document's
own account of the fix.

Against the freeze's two blocking criteria:

- **(i) a defect this revision introduced.** **No.** Every claim the delta adds was re-derived from
  the tree or fixed-string grepped against PLAN at v1.3: the seven counting claims (17 / 13 / 4 / 1
  engine-side / 39 / 22 / 18 inventory rows), the five quotations (`PLAN:663`, `:561`, `:310`,
  `:682`, `:684`), the nineteen-row count of PLAN's §Post-batch remediation subsection, and both
  commits' name-status for the fixture-row attribution. The one edit that could plausibly have
  broken something — the extended quotation at line 1131 — is verbatim in PLAN.
- **(ii) a factual contradiction with the repository or an upstream document.** **No.** The
  contradiction that blocked at v14 is the one this delta removed: line 1180 now states P-A-6's rule
  as `PLAN:663` states it, and the header no longer generalises over rulings it did not check.

Everything else re-measured clean: `## Properties`, `## Oracles`, `## Fixtures` and §C.1/§C.2/§C.3
are byte-untouched, §C.3's accounting rows (`21` / `0` / `12`) are unchanged, and the 26-passed /
26-total, 0-skipped run over `learningsBlock.test.js` and `learningsSelect.test.js` reproduces at
HEAD via the package's `--experimental-vm-modules` runner.

Six DEFERRED items are recorded above. None is a defect, none blocks, and none reopens a settled
decision — they are readability and future-sweep suggestions for whichever round next touches those
lines. No upstream erratum is emitted: the two items I routed at v13 landed in PLAN v1.2/v1.3, and
the manifest under-count this document routed is the one PLAN closed at v1.2/v1.3.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:5eb02c76c4fab5c73919541db30a4ee9e01d6f44e135384473980f830d394aef
APPROVAL-HASH-NORMALIZED: sha256:07907354c1bf4373cf5b4ea81552a163236a7a1cb21f659935f47d21923891e7
REVIEWED-COMMIT: 9e9a79e5cb81b35d552c1fd560db0aecaec24f26
UPSTREAM-STATE: REQ sha256:32cb8b7d4f4072d18772c7efeeb846460083dfea1959cd1159ac625a057fafeb
UPSTREAM-STATE: FSPEC sha256:ef2301995af6ab2b0d722339a15d07da1eeec8ce28b501a92155064d660b5e56
UPSTREAM-STATE: TSPEC sha256:1ddfdbc340d9078efc98930df625cc4f8f0dd6d3d9b24070fdee08af8ff44a95
UPSTREAM-STATE: DECISIONS sha256:87ec8ebca294ebbdd45eb0fdebe939740fc968c8b91dcaf964dbc87ca299b193
UPSTREAM-STATE: PLAN sha256:d6a0b45c5c1753b91752d4fe60a42a700ef441f532a26d9a4535e88c1857673a
