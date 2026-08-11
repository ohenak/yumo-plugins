# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.2)
**Date:** 2026-08-09
**Iteration:** 3
**Scope:** Delta re-review under the round-3 protocol. Diffed `93e5d75b..HEAD` on the document (97
insertions, 41 deletions), read my own v2 findings first, and judged only (a) whether the v2 blocking
finding is resolved and (b) whether the revision broke anything. Unchanged sections not re-litigated.

## 1. Round-2 findings disposition

| v2 finding | Severity | Disposition | Evidence re-measured at HEAD |
|---|---|---|---|
| F-01 the AT-C register was homed on `consolidationLifecycle.test.js`/T23, which neither TSPEC §12.3 nor PLAN T20 gives it | High | **Resolved** | PROP-PASS-01…05 and PROP-PASS-11 now trail `consolidationPass.test.js` · T20 → T31 (`:1294`, `:1303-1304`, `:1313`, `:1322`, `:1330`, `:1349`); that is the file TSPEC §12.3 gives AT-C1…AT-C8 (`TSPEC:2497`) and the file PLAN T20's `T31 — pass lifecycle` block enumerates them in (`PLAN:264`). PLAN T23 states "two cases, no register id" (`PLAN:267`) and the document's §12.2/§12.3 rows for T23 now carry exactly PROP-PASS-09 (release across the terminal statuses), PROP-PASS-10 (await discipline) and PROP-DBL-03 — a one-to-one match with T23's two declared blocks plus its hygiene rule. The L1 arms PROP-TRG-03/PROP-TRG-06 now cite the TSPEC §7.2 obligation instead of AT-C5/C6/C7 (`:534-539`, `:546-551`), and the inline AT-C6 claim in PROP-TRG-06's body was dropped in a follow-up commit (`05c07075`) rather than left as a second citation channel |
| F-02 PROP-COR-12's baseline fixture path is owed to PLAN §5's ownership manifest, not only to T04's task text | Medium | **Resolved** (with one false claim in the new prose — F-02 below) | §4.3 (`:429-436`) and §13.3 erratum 3 (`:1836-1841`) now carry both halves. Re-measured: `PLAN:307` names only `pdlc/workflows/__tests__/consolidationHookParity.test.js`, and `grep -n "fixtures/" PLAN-*.md` returns **nothing** — no §5 row names any path under `pdlc/workflows/__tests__/fixtures/`. The consequence stated (authored but uncommitted under a pathspec-scoped wave commit) follows |
| F-03 §12.2 stated the spanning convention on the file axis only; §12.3's task axis was underivable | Medium | **Resolved** | §12.2 now states the convention on **both** axes and adds the per-block green rule (`:1653-1666`); §12.3's T01 row spells out why PROP-FIX-03 is filed under T04 on both axes (`:1701`), which is the case that made the two axes look inconsistent |
| F-07 (v1) hook facts pinned by name, not line index | Low | Still resolved | unchanged |

Claims I re-measured independently at HEAD, not taken from the document:

| Claim | Verdict |
|---|---|
| "the id set is byte-identical to v1.1's 118" (changelog `:25`) | **Exact.** Distinct `PROP-*` ids in `93e5d75b`'s blob and at HEAD are both 118, with an empty symmetric difference — no property was added, removed or renumbered. 118 − the 4 retired PROP-TRG ids = the 114 claimed at `:100` |
| PLAN T23 carries no register id | **Exact** — `PLAN:267` says so in its own heading, and its two blocks are the await-discipline case (T-13) and the release-across-terminal-statuses set-equality case |
| TSPEC §12.3 gives `consolidationPass.test.js` AT-C1, AT-C1b, AT-C2…AT-C8, AT-M1…AT-M6b, AT-M9, AT-M11 | **Exact** (`TSPEC:2497`) |
| AT-P7 is TSPEC-assigned to `consolidationHookParity.test.js` (PROP-COR-07's trailer) | **Exact** — that row carries AT-P7 plus two `(no FSPEC AT)` cases |
| **AT-P6 and AT-P10 are TSPEC-assigned to `consolidationPredicate.test.js`** | **Exact — and the document trails both to `consolidationPass.test.js`.** F-01 below |
| `pdlc/workflows/__tests__/fixtures/` "does not exist at HEAD" (`:432`) | **False.** F-02 below |

## 2. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The single-file rule the v1.2 fix asserts is violated by two more register ids, in trailers this revision touched: AT-P6 and AT-P10.** §12.4's new AT-C cell states the invariant globally — "so each id is claimed in exactly one file" (`:1735`) — but PROP-COR-10 trails `` `consolidationPass.test.js` · T20 → T31 · AC-1.1 · AT-P10 `` (`:384`) and PROP-COR-11 trails `` … · NFR-5, AC-2.4 · AT-P6 `` (`:391`), while **TSPEC §12.3 gives both ids to `consolidationPredicate.test.js`** (its L1 row carries AT-P1…AT-P6, AT-P8…AT-P11) and **PLAN T14 enumerates them there too** (`PLAN:258`, block `T25 — corpus and predicate`). This is the identical defect shape to v2's F-01 — a register id claimed in a file the approved TSPEC does not give it — at two ids the earlier fix did not sweep. Both trailers are **changed lines in this revision** (their green owners went `T25/T31` → `T31`), so this is not an unchanged section: the revision re-derived §12.2/§12.3/§12.4 from these trailers and propagated the wrong home into all three tables while adding a sentence claiming the property being violated. Concretely: an implementer working from PROPERTIES writes the AT-P6 and AT-P10 cases into T20's file; an implementer working from PLAN writes them into T14's; one of the two is duplicated work and the other leaves the register id with a case nobody planned. **The substance is on PROPERTIES' side, which is why this is a routing defect, not a re-home:** AT-P6's Then is *"the consumed pair is still appended, empty, before any other record"* (`FSPEC:2119`) and AT-P10's is *"the §10.4 report names the collision explicitly"* (`FSPEC:2123`) — neither is reachable from `classifyCorpus`, which TSPEC declares pure and whose return value carries `basenameCollisions` but performs no append and renders no report (`TSPEC:674`, `:750-770`). **Fix, in the shape §13.3 already uses for the same class:** keep the L2 homes, add a sixth §13.3 erratum routing AT-P6/AT-P10's §12.3 row and PLAN T14's block upstream (erratum 5 is the precedent — it routes exactly this for AT-R6/AT-R6b), and qualify §12.4's invariant sentence to name the pending erratum rather than assert a property that does not yet hold. The alternative — cite the obligation as PROP-TRG-03/06 now do — costs more: it leaves AT-P6 and AT-P10 with **no** property discharging them at T14, since PROP-COR-01/04/05/06 cover only AT-P1…P5, P8, P9, P11, so it would also owe two new L1 arms. I have emitted both errata in this response so the choice is not blocked on a second review round. | §12.4 (`:1735`), §4.2 (`:380-391`), §12.2 (`:1682`), §12.3 (`:1714`), §13.3 (`:1810-1850`) |
| F-02 | Medium | Local | **A false existing-code claim inside the newly written erratum-3 prose: the fixtures directory does exist at HEAD, and is tracked.** §4.3 (`:432`) says no §5 row names anything under `pdlc/workflows/__tests__/fixtures/` — "a directory that does not exist at HEAD". `git ls-files pdlc/workflows/__tests__/fixtures/` returns 20+ tracked files at HEAD (`completeness/`, `covered-violations/`, `cross-reviews/`, `planParse/`, `queue-goldens/`, `digest-vectors.js`, `tmpGitFixture.js`), and `git check-ignore` reports the target path is not ignored. The **remedy is unaffected** — the manifest half of erratum 3 stands exactly as written, since the missing thing is the manifest row, not the directory — but this sentence travels upstream into PLAN through erratum 3, and a PLAN author acting on it would be reasoning from a false premise about the tree. Delete the parenthetical, or replace it with the true and more useful fact: the directory exists and is tracked, so only the **file** is new and only the manifest row is missing. | §4.3 (`:429-436`), §13.3 item 3 (`:1836-1841`) |
| F-03 | Medium | Local | **PROP-PASS-11 now lands in a file whose PLAN block text excludes it, and the exclusion is explicit.** The re-home puts PROP-PASS-11 (AC-1.4's no-op pass, `(no FSPEC AT)`) on `consolidationPass.test.js`/T20 (`:1349`) — correct as to file, since it is a whole-pass property — but PLAN T20's `T31 — pass lifecycle` block says its unregistered obligations are exactly two, and that after AT-M11's assignment "(i) below **is the only remaining unregistered obligation** in this row" (`PLAN:264`), (i) being the unreadable-corpus-entry case that PROP-COR-09 owns. PLAN T23 declares "two cases" and neither is the no-op pass (`PLAN:267`), so **no PLAN block declares AC-1.4's no-op case at all** — before or after this revision. The v1.1 homing hid the gap behind a file that was wrong anyway; the corrected homing exposes it. Same class as §13.3 erratum 5 and same fix: route it, do not absorb it. Erratum emitted in this response. | §9.1 PROP-PASS-11 (`:1333-1350`), §12.2 (`:1682`), §12.3 (`:1714`) |

Not raised, checked and clean: the §12.2/§12.3 re-derivation. I re-extracted the file names from the
§§2–11 trailers and compared against the two tables; the `consolidationPass.test.js` row (`:1682`)
and the `T20 → T28/T31` row (`:1714`) carry exactly the properties whose trailers name that file and
that task, the `consolidationLifecycle.test.js`/T23 rows shrank to precisely the three that remain,
and the T25 drop from the pass-file green lists matches PLAN §5. The derivation held under the move,
which is the part of a re-home most likely to rot.

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | My v2 Q-01 (PROP-PR-09's second arm) is **answered**, and answered better than the question deserved: §13.1 (`:1832`) now argues that the reconciled REQ wording is the property as written, that the "no proposal file on a fully-`promoted` pass" half is already PROP-RTE-06(a)'s, and that duplicating it here would re-home that invariant. I accept it; nothing owed. |
| Q-02 | My v2 Q-02 (PROP-PR-10(b)'s "still on remote") — is the answer at `:1213` intended to mean the git double records refs, or that the oracle is the verb pair (`push` issued, `delete-branch` not)? If the latter, the property's own sentence still reads as an observation of remote state, and an implementer will look for a seam that cannot see it. One clause naming the observable would close it; not gating. |

## 4. Positive Observations

- **The re-home was done as a derivation, not as a search-and-replace.** The thing that usually
  breaks when five properties change file is the summary tables, and they did not break: §12.2's
  file row, §12.3's task row and §12.4's family row all moved together and all still match the
  trailers I re-extracted independently. The v1.1 round proved the derivation worked; this round
  proved it survives a move, which is the stronger claim.
- **The revision fixed the *class*, not just the instance, in the direction it could see.** I asked
  for PROP-PASS-01…05 and PROP-PASS-11; the revision also converted PROP-TRG-03/06's L1 arms to cite
  the TSPEC §7.2 obligation instead of AT-C5/C6/C7, and then a follow-up commit (`05c07075`) removed
  the inline AT-C6 claim left in PROP-TRG-06's *body* — a second citation channel that would have
  quietly re-broken the single-file rule while the trailer looked clean. That the two remaining
  violations are in a different AT family (F-01) is a reasonable place for the sweep to have stopped.
- **§5.1's new paragraph pre-empts the question the retirement table invites.** It states that
  PROP-TRC-01's parser ranges over the `AT-…` token grammar and not over `PROP-…` ids, so the four
  retired ids need no exclusion rule. That is checkable and I checked it: `PLAN:250` describes T05's
  parser exactly that way. Answering "why does this dead id not break the traceability property"
  before a reviewer asks is what makes a spec cheap to review twice.
- **Erratum 3's second half is the right kind of upstream finding.** It is not a documentation nit:
  it names a mechanism (Phase I commits pathspec-scoped to the manifest), a consequence (the fixture
  is authored and dropped) and an observable (two properties red on correct code), and it routes the
  fix to both halves of PLAN T04 rather than to the one that is easier to write.

## 5. Recommendation

**Needs revision**

One High (F-01), and it is narrow: two register ids, AT-P6 and AT-P10, are still claimed in a file
TSPEC §12.3 and PLAN T14 do not give them, while §12.4 now asserts in new text that no such case
exists. Everything I raised in round 2 is closed, and the §12 tables survived the move intact.

The next revision needs:

1. **F-01** — add a §13.3 erratum routing AT-P6/AT-P10's TSPEC §12.3 assignment and PLAN T14's block
   upstream (erratum 5 is the template), keep PROP-COR-10/PROP-COR-11 at L2 where their conjuncts
   are reachable, and qualify §12.4's "each id is claimed in exactly one file" to name the pending
   erratum. Both errata are emitted in this response, so the routing is already in flight.
2. **F-02** — delete or correct §4.3's "a directory that does not exist at HEAD"; the directory is
   tracked at HEAD and only the fixture file and the manifest row are new.
3. **F-03** — add the erratum for PLAN T20's block text, which declares (i) as its only unregistered
   obligation while PROPERTIES homes AC-1.4's no-op case (PROP-PASS-11) in the same file. Emitted in
   this response.

No property needs to move and no id needs to be reassigned inside this document — the three fixes
are one erratum entry each plus one sentence of prose.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}
