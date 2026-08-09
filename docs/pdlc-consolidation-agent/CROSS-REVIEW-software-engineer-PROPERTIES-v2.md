# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.1)
**Date:** 2026-08-09
**Iteration:** 2
**Scope:** Delta re-review under the round-2 protocol. Diffed `fdeb3650..HEAD` on the document
(344 insertions, 186 deletions), read my own v1 findings first, and judged only (a) whether each
v1 blocking finding is resolved and (b) whether the revision broke anything. Unchanged sections
were not re-litigated.

## 1. Round-1 findings — disposition

| v1 finding | Severity | Disposition | Evidence re-measured at HEAD |
|---|---|---|---|
| F-01 PROP-COR-12's `git show HEAD:` baseline is self-invalidating | High | **Resolved** | §4.3 (`:407-425`) repoints the baseline at a checked-in `pdlc/workflows/__tests__/fixtures/nudge-consolidation.pre-widening.sh` and adds a fixture-validity conjunct (the fixture's glob declaration must still reach `docs/*/` only), which closes the opposite rot direction I did not ask for. §13.3 erratum 3 routes PLAN T04's text upstream rather than editing it — correct layer discipline; PLAN T04 does still specify the `git show HEAD:` copy (`PLAN:249`), so the erratum is real |
| F-02 four same-level PROP-TRG / PROP-PASS collisions | High | **Resolved as duplication, but re-homed onto the wrong side** — see F-01 below | §5.1 (`:477-494`) retires PROP-TRG-01/02/04/05 into PROP-PASS-01/02/05 with an explicit retirement table and does not reuse the ids. The duplication is genuinely gone |
| F-03 §12.2 / §12.3 disagree with the body's trailers | High | **Resolved** | I extracted every `File` / `Task` trailer from §§2–11 mechanically and diffed against §12.2 and §12.3: they now agree row for row. Every one of the 114 minted ids appears in §12.2, §12.3 **and** §12.4 (set difference empty in both directions) |
| F-04 PROP-PASS-07's home contradicts §12.2/§12.3 and PLAN | Medium | **Resolved** | §9.2 now reads `consolidationRung.test.js · T06 → T11/T31` (`:1332`), matching PLAN T06's two blocks (`PLAN:251`) and TSPEC §12.3's `consolidationRung.test.js` row (AT-M7, AT-M8, AT-M10). PROP-PASS-06 moved with it, correctly — PLAN T06's `T31 — AT-M7/AT-M8` block owns exactly that |
| F-05 PROP-COR-07's hook set has a silent-pass channel | Medium | **Resolved** | §4.3 (`:382-395`) names `PDLC_CONSOLIDATION_DEBUG=1`, makes "a `PDLC_PENDING:` line was observed on stderr" a per-row precondition that **fails** rather than empties the row, and folds it into PROP-FIX-03's `executed` counter |
| F-06 §1 cites `PROP-RUN-*`, an id the document never mints | Medium | **Resolved** | `:56-57` now cite PROP-PASS-06 / PROP-PASS-07. §3's five dangling ids were re-keyed in the same pass, which I did not ask for and which was also wrong |
| F-07 PROP-CFG-02 / PROP-COR-07 pin hook facts by line index | Low | **Resolved** | Both now locate by name (`:452-455`, `:392-395`) |

Claims re-measured independently, all exact at HEAD:

| Claim | Verdict |
|---|---|
| Stated count **114** | 114 distinct `PROP-*` ids minted in §§2, 4–11, no id minted twice |
| `PDLC-CONSOLIDATION-PASS` at vocabularies §4, `Version` 1.4, `:170` (PROP-PR-11) | exact — `pdlc-consolidation-vocabularies.md:170`, `Version` cell `1.4 · 2026-08-06` at `:7` |
| FSPEC BR-24 (PROP-PR-10, PROP-PR-11) | exact — `FSPEC:2619`, and it does carry the branch name and the trailer |
| §12.1's whole re-key against **REQ v2.1** | exact on all 27 rows I checked against `REQ:161-546` — AC-1.1 cadence, AC-1.2 volume, AC-1.3 marker, AC-1.4 no-op, AC-3.4 both carriers, AC-3.5 fallback, AC-3.6 PR-only, AC-4.2/4.3, AC-7.1/7.2, NFR-1…5. v1.0's labels were off by one across three families; this is a large correction and it lands |
| PROP-PASS-11's AC-1.4 reading ("which streaks it advances is decided by consumed-set emptiness, never by the `no-op` label") | verbatim REQ AC-1.4, `REQ:220-222` |
| PROP-PR-10's AC-3.6 reading ("not deleted by the pass") | verbatim, `REQ:286-287` |
| PROP-RPT-09's NFR-5 `<!-- pdlc:consumed {passId} -->` block | exact, `REQ:547-548` |
| §12.2's justification for moving AT-Q into `consolidationRoute.test.js` | correct — `PLAN:265` enumerates AT-Q1…AT-Q13 across T21's `T30` and `T31` blocks, and TSPEC §12.3 assigns the AT-Q family to that file |
| Q-01 (who owns the `await` mutation check) | answered — §12.2's helper row names T31 as the green owner, matching `PLAN:287` ("This row owes the mutation check … observe T23's case RED") |

## 2. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The F-02 retirement collapsed the AT-C family onto the file that does not own it, and the document now contradicts TSPEC §12.3 — the very table PROP-TRC-01 asserts set-equality against.** TSPEC §12.3's `consolidationPass.test.js` row reads "L2 · AT-C1, **AT-C1b**, AT-C2, AT-C3, AT-C4, AT-C5, AT-C6, AT-C7, AT-C8, AT-M1 … AT-M11", and `PLAN:264` writes the same block into T20 (`T31 — pass lifecycle`: AT-C1, AT-C1b, AT-C2 … AT-C8, AT-M1 … AT-M9, AT-M11) in `pdlc/workflows/__tests__/consolidationPass.test.js`. PLAN T23 (`:267`) is explicitly "**lifecycle (L2), two cases, no register id**" — the `await` discipline and release-across-terminal-statuses, nothing else. v1.0 satisfied that authority by accident: PROP-TRG-01/02/04/05 carried AT-C1/C1b/C2/C4/C8 in `consolidationPass.test.js` / T20. v1.1 retired **exactly those** and left the AT-C ids only on PROP-PASS-01…05 in `consolidationLifecycle.test.js` / T23 (`:1255`, `:1265`, `:1272`, `:1280`, `:1291`), so no property now places any AT-C id in the file TSPEC and PLAN put it in. Two consequences, both concrete: (i) an implementer working from PLAN writes the AT-C cases into T20's file while PROPERTIES says T23's, and T05's traceability oracle — "every register id has **exactly one** file" (`PLAN:250`) — is checked against TSPEC §12.3, so the divergence is invisible to the suite and surfaces as two half-written blocks in Phase I; (ii) the document contradicts itself: §2.2's PROP-FIX-02 trailer still reads "*`consolidationPass.test.js` · Task: T20 · Source: FSPEC §13.1 AT-C1, AT-C1b*" (`:158`), which was PROP-TRG-01's home and was not re-keyed with the retirement. §12.2's own stated rule — "a trailer placing them in `consolidationPass.test.js` would put them in a file no RED task creates them in" (`:1640`) — is the right rule, applied to AT-Q and then not applied to AT-C, where it yields the opposite answer. **A second arm of the same defect:** PROP-TRG-03 and PROP-TRG-06 are kept in `consolidationParse.test.js` carrying **AT-C5, AT-C6, AT-C7** (`:501`, `:507-508`) while PROP-PASS-03 and PROP-PASS-04 carry the same three ids in `consolidationLifecycle.test.js` (`:1272`, `:1280`) — one register id, two files, which is the invariant PROP-TRC-01 exists to enforce. The L1-vs-L2 layering §5.1 invokes is sound as *coverage*, but the register citation must sit in one file: the L1 rows should cite the TSPEC obligation, not the AT id. **Fix:** re-key PROP-PASS-01…05 (and PROP-PASS-11, which travels with them) to `consolidationPass.test.js` · T20 → T28/T31; leave PROP-PASS-09 and PROP-PASS-10 on `consolidationLifecycle.test.js` · T23, which is what PLAN T23 actually owns; drop the AT-C5/C6/C7 citations from PROP-TRG-03/06 in favour of their TSPEC §7.2/§8.1 obligation; re-key §2.2's PROP-FIX-02 trailer; then re-derive §12.2, §12.3 and §12.4's AT-C row from the corrected trailers. | §5.1 (`:477-508`), §9.1 (`:1244-1310`), §2.2 (`:153-158`), §12.2 (`:1611-1642`), §12.4 (`:1684`) |
| F-02 | Medium | Local | **PROP-COR-12's new baseline fixture is a file PLAN §5's ownership manifest gives to no task, and Phase I commits only owned paths.** §4.3 (`:411-413`) says the pre-widening copy at `pdlc/workflows/__tests__/fixtures/nudge-consolidation.pre-widening.sh` is "written by T04", but `PLAN:307` gives T04 exactly one path — `pdlc/workflows/__tests__/consolidationHookParity.test.js` — and no row in the §5 manifest names anything under `pdlc/workflows/__tests__/fixtures/` (a directory that does exist at HEAD and is shared). Phase I's wave gate commits each task's work **pathspec-scoped to that task's owned files, never `-a`**, so the fixture would be written to the tree, never committed, and would then be the one input PROP-COR-12 and PROP-COR-13 cannot find on a fresh checkout — a red suite whose cause is an ownership row rather than any code. §13.3 erratum 3 already routes the baseline change to PLAN T04 and even names the path, so the fix is cheap: extend erratum 3 to ask for the fixture path in **T04's ownership-manifest row** as well as in its task text, and say so in §4.3 so the two documents cannot drift. | §4.3 PROP-COR-12 (`:407-425`), §13.3 erratum 3 (`:1775-1783`) |
| F-03 | Low | Local | **PROP-FIX-03 is listed against two tasks in §12.3 without the "spans two" convention §12.2 states for files.** §12.2 introduces "a property spanning two files appears in both rows" (`:1613`) and applies it consistently; §12.3 then lists PROP-FIX-03 under both `T01 doubles` and `T04 → T09/T25` with no equivalent sentence, and §12.2 homes it only in `consolidationHookParity.test.js`. The substance is right — the counter is declared in T04's file over T01's harness — but a reader deriving "which task owes this" from §12.3 gets two answers. One clause extending the spanning convention to the task axis settles it. | §12.2 (`:1613`), §12.3 (`:1650`, `:1653`) |

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-PR-09 asserts the PR URL is **string-equal** between the log row's `pr:` field and the proposal file body, on the `promoted-degraded` Given. Erratum 4 correctly routes the vacuous happy-path half to REQ. If REQ comes back with "in each carrier that exists", does PROP-PR-09 keep its Given, or does it gain a second arm asserting that a fully-`promoted` pass writes **no** proposal file (which is already PROP-RTE-06(a))? Worth deciding now so the erratum's landing does not silently widen this property. |
| Q-02 | PROP-PR-10(b) requires the branch `consolidation/{passId}` to be **still present on the remote** after a half-failed pass. The PR seam is doubled (§2), so "present on the remote" is an observation on the git double's recorded state. Is that state modelled — i.e. does the double track refs, or is the oracle really "no `delete-branch` verb was issued plus a `push` was"? The latter is what §11.3(a)'s spy can see, and the property's own text says a verb bound alone is insufficient. |

## 4. Positive Observations

- **The §12 rebuild is mechanically true, not merely plausible.** I extracted every per-property
  `File` / `Task` trailer from §§2–11 with a parser and set-differenced it against §12.2 and §12.3:
  no disagreement, and every one of the 114 ids appears in §12.2, §12.3 and §12.4 with the reverse
  direction empty too. That is the strongest form F-03 could have been closed in, and the stated
  discipline — "each property row is the set of properties whose §§4–11 trailer names that file" —
  is what made it checkable.
- **The §12.1 re-key against REQ v2.1 is a bigger correction than either round-1 review asked for.**
  v1.0 had AC-1.1/AC-1.2 transposed, AC-1.3 and AC-1.4 shifted, and AC-4.2/AC-4.3 swapped; all 27
  rows now match `REQ:161-546` exactly. Re-reading the source rather than patching the transcription
  is the reason the errors came out as a family rather than one at a time.
- **PROP-COR-12's fix closed the direction I did not name.** I asked only that the baseline stop
  being a git query. The revision added the fixture-validity conjunct — the baseline's glob
  declaration must still reach `docs/*/` only — which fails the case when someone "repairs" a red
  suite by refreshing the fixture from the edited hook. That is the rot direction a checked-in
  fixture introduces, and catching it in the same edit is the difference between fixing a finding
  and fixing the class.
- **Errata 3, 4 and 5 are all real and all correctly filed upstream.** I verified each against HEAD:
  `PLAN:249` does specify the self-invalidating `git show HEAD:` baseline; `REQ:267-270` does require
  the URL in a proposal file that FSPEC §5.3 only writes on a cause; `PLAN:265` does enumerate
  AT-R1…AT-R5 and AT-R7 while omitting AT-R6 and AT-R6b. None was folded into the document under
  review, and none was silently patched in an upstream file.
- **PROP-PASS-11 is written from REQ's sentences rather than around them.** AC-1.4's third and
  fourth sentences say the streak population is decided by consumed-set emptiness and never by the
  `no-op` label; the property asserts the two causes **apart** for exactly that reason and says which
  defect pooling them would hide. That is a property derived from the requirement's own warning.

## 5. Recommendation

**Needs revision**

One High, and it is the shadow of a fix rather than a new problem: F-02 of round 1 was the right
call, the duplication is genuinely gone, but the surviving copy was placed in the file TSPEC §12.3
and PLAN T20 do not assign the AT-C register to. Everything else in the round-1 list is closed,
several beyond what was asked, and the §12 rebuild is verifiable rather than assertable.

Concretely, the next revision needs:

1. **F-01** — move PROP-PASS-01…05 and PROP-PASS-11 to `consolidationPass.test.js` · T20 → T28/T31;
   leave PROP-PASS-09/10 on T23; drop the AT-C5/C6/C7 citations from PROP-TRG-03/06 in favour of
   their TSPEC obligation; re-key §2.2's PROP-FIX-02 trailer; re-derive §12.2, §12.3 and §12.4's
   AT-C row from the corrected trailers. No property should move file without §12 moving with it —
   the round-1 fix already proved that derivation works.
2. **F-02** — extend §13.3 erratum 3 to ask for the fixture path in PLAN T04's **ownership-manifest**
   row, and note the dependency in §4.3.
3. **F-03** — one clause extending §12.2's spanning convention to §12.3's task axis.

No new erratum is warranted from this pass: the conflict in F-01 is PROPERTIES conforming to an
already-approved TSPEC §12.3, not a defect in it.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
