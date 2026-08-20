# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 8

## Scope of this round

**Delta re-review, frozen round.** The TSPEC did **not** move since the round I approved at
iteration 7: its content hash is `sha256:eff5a19b…`, byte-identical to the `APPROVAL-HASH` recorded
in `CROSS-REVIEW-product-manager-TSPEC-v7.md`, and `git log ccc739d1..HEAD --
TSPEC-pdlc-learnings-injection.md` returns no commits. There is therefore no revision-introduced
defect to find in this document — freeze criterion (i) is empty by construction.

What moved is upstream and the repository:

- **FSPEC** — `sha256:256537d8…` (recorded at v7) → `sha256:764414d0…` at HEAD, via `523e2df9`
  ("v0.9 follow-through — AC-6.2 row heading, revision-history order"). The delta is +7/−4 lines:
  the v0.9 revision-history entry is moved below the v0.8 erratum entry and re-worded, and the
  AC-6.2 traceability row's target is corrected from `§Acceptance-test preamble` to
  `§Acceptance Tests preamble`. No rule, edge case, AT text or AC mapping changed.
- **REQ** — `sha256:ff605dd3…`, byte-identical to v7. Unmoved.
- **Production code** — `pdlc/workflows/orchestrate-dev.js` gained +154/−13 lines since
  `ccc739d1` (the erratum-protocol / finding-grammar work, unrelated to this feature), which
  shifts line positions in the file this TSPEC anchors into.

So this round asks two questions only: does the FSPEC delta falsify anything load-bearing in the
TSPEC, and does the moved repository state falsify any of the TSPEC's claims about current
behaviour? I checked both against HEAD, by content rather than by position.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 (v7) `OQ.2` and `ERR-4` point at §I.3 for the gate that lives in §I.2 | Low | **Open, unchanged** | The document did not move, so the pointer did not move. `TSPEC:1237` still reads "§I.3's gate", `TSPEC:1277` still reads "§I.3 and §D.2 are written on the answer", while the corrected gate paragraph is at `TSPEC:441-448` inside §I.2 Configuration (`TSPEC:417`) and §I.3 (`TSPEC:486`) is the pure selection core with no gate in it. Non-gating, carried forward. |
| F-02 (v7) §A.5's closing sentence cites §T.2 for the per-dispatch loci; §T.2 is the doubles table | Low | **Open, unchanged** | `TSPEC:359-361` unchanged; §T.2 (`TSPEC:799`) is still the `fakeGit`/`fakeFs`/scripted-`_agent` table and the per-dispatch assertions still live in §T.6's `DIVERGENT-CORPUS` (`TSPEC:987-992`). Non-gating, carried forward. |
| F-03 (v7) `OQ.2`'s bare-repository note is stale against the AT-32 mapping | Low | **Open, unchanged** | `TSPEC:1241-1244` unchanged; `FSPEC:719` still maps E-21 to AT-32 and `TSPEC:952-958` still assigns it to `learningsConfig.test.js`. Non-gating, carried forward. |

None of the three was resolved, because no revision was attempted — this round was dispatched on
upstream movement, not on an author edit. All three remain Low, all three remain precisely
enough named to close in one pass whenever the document is next opened.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | Inherited from v7, unchanged: `OQ.2` (`TSPEC:1237`) and `ERR-4`'s closure (`TSPEC:1277`) attribute the corrected gate to §I.3, but the gate paragraph is at `TSPEC:441-448` inside §I.2 Configuration (`TSPEC:417`); §I.3 (`TSPEC:486`) is the pure selection core and contains no gate. **Fix:** restore "§I.2" at both sites. | REQ AC-5.1a, AC-5.1b |
| F-02 | Low | Local | Inherited from v7, unchanged: §A.5's closing sentence (`TSPEC:359-361`) cites §T.2 for where the per-dispatch loci are asserted; §T.2 (`TSPEC:799`) is the doubles table and the per-dispatch assertions live in §T.6's `DIVERGENT-CORPUS` (`TSPEC:987-992`). **Fix:** cite §T.6 and §D.2. | REQ AC-3.2, AC-3.3 |
| F-03 | Low | Local | Inherited from v7, unchanged: `OQ.2`'s bare-repository note (`TSPEC:1241-1244`) is stale against the AT mapping — FSPEC maps E-21 to AT-32 (`FSPEC:719`) and §T.5 assigns AT-32 to `learningsConfig.test.js` (`TSPEC:952-958`). **Fix:** drop or re-point the note. | REQ G-1, AC-1.1, AC-5.1a |
| F-04 | Low | Process | **New this round, caused by repository movement, not by an edit.** `orchestrate-dev.js` gained +154 lines since `ccc739d1`, so the TSPEC's raw `file:line` anchors into it above roughly line 12000 have drifted by ~40–140 lines: `main`'s destructure is now `orchestrate-dev.js:12022` (TSPEC §P-1 area cites `:11982`), `_recordQueueRow`'s defaulted recorder now `:12053` (cited `:12013`), `wrapperSeams` now `:12421` (cited `:12381`), the erratum author now `:12861` and the land-proof retry now `:12955` (P-2a cites `:12821`, `:12915`), the `converge` phase creator now `:13657` (P-2a cites `:13515`), Phase CR's `docType: null` call now `:14698` (cited `:14551-14556`), and `buildFinalReport`'s conditional advisory spread now `:15309` (P-10 cites `:15167`). **Every underlying claim is still true at HEAD by content** — I re-verified each by symbol, not position (`grep -n '"authoring"'` returns exactly the four sites P-2a names; `...(advisory ? { advisory } : {})` exists once; `dispatchAndVerify` is unmoved at `:8862`; `parseAdvisoryConfig`'s malformed reading is unmoved at `:1980-1983`; `roundDocType = docType === undefined ? …` unmoved at `:7306`). Per DEC-DOC-01 a raw `file:line` anchor is a `Process`-scope Low, and drift is exactly the failure mode that decision anticipates. **Fix (whenever this document is next opened, not as a gate):** re-anchor on symbol names — `main`, `_recordQueueRow`, `wrapperSeams`, `dispatchAndVerify`, `buildFinalReport` — rather than positions. | REQ AC-1.1 (P-2a/P-3/P-10 grounding claims) |

No High findings. Nothing in the FSPEC v0.9 follow-through delta falsifies a TSPEC claim: E-21/E-22/E-23/E-34 still map to AT-32/AT-31/AT-32/AT-32 (`FSPEC:719-725`), matching the TSPEC's four-row config-state table and its two-AT ownership claim (`TSPEC:464-469`); AC-3.2→BR-9→AT-19/20/21 and AC-3.3→BR-10→AT-22 are unchanged (`FSPEC:136-137`); AT-20 and AT-22 still carry the "two completeness tests, one per locus" and "AT-18's changing-corpus run" halves (`FSPEC:852-865`) that §D.2's split BR-10 rows (`TSPEC:645-648`) and §T.5's L3 assignment (`TSPEC:943`) are written on. The one substantive FSPEC edit — `§Acceptance-test preamble` → `§Acceptance Tests preamble` on the AC-6.2 row — is a heading-name fix inside FSPEC and has no TSPEC-side referent.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v7, still open and still not a finding: §D.1 makes the run-level mirror a fourth field domain with its own membership test (`TSPEC:588-594`), while §D.2 says an implementation that omits `runMirror` entirely still conforms (`TSPEC:607-610`). Both are true and consistent — a membership test over an absent field is vacuously green — but it means one of the four domain tests can pass without ever observing a value. That is the P-phase author's call to make (three domains plus a documented non-oracle, or four with the vacuity noted); REQ permits either (`REQ:325-330`, "if carried"). |
| Q-02 | FSPEC's header still lists `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1,2,3,4,5,6,7,8,9}.md` (`FSPEC:12`) although v10 and v11 exist on this branch for both reviewers. The v0.9 revision-history entry claims "Header Cross-Reviews row … corrected", so the intent was there and the row is simply behind. That is an FSPEC defect, not a TSPEC one — routed as an ERRATUM rather than folded into this verdict. |

## Positive Observations

- **The frozen round held.** The TSPEC is byte-identical to the state I approved at v7. When an
  upstream document moves and the downstream one does not need to move with it, not moving is the
  correct behaviour, and it is the behaviour that keeps a freeze meaningful. There is no
  opportunistic edit riding along with an upstream-triggered round.
- **The TSPEC cites upstream by version and spec id, not by line.** `grep "FSPEC:[0-9]"` over the
  document returns nothing; every upstream reference is "FSPEC v0.9 BR-9/BR-10", "E-21…E-34",
  "AC-3.2/AC-3.3" (`TSPEC:326`, `:469`, `:1275`, `:1295`). That is precisely why the FSPEC's +7/−4
  line shift could not break a single downstream citation. The same discipline applied to the
  `orchestrate-dev.js` anchors would have made F-04 impossible too — the contrast is the argument
  for DEC-DOC-01, visible inside one document.
- **Every code claim I re-checked is still true at HEAD, by content.** Four `dispatchKind:
  "authoring"` sites (`orchestrate-dev.js:7663`, `:12861`, `:12955`, `:13657`), the single
  conditional advisory spread (`:15309`), `dispatchAndVerify`'s seam destructure (`:8862`),
  `parseAdvisoryConfig`'s present-and-not-a-plain-object reading (`:1980-1983`) and the
  `roundDocType` null-survival line (`:7306`). The feature's product-facing grounding — key absent
  when disabled, fail-open with a notice when malformed — rests on precedent that still exists.
- **The FSPEC delta was scoped honestly.** Its own revision-history entry says "Locus corrections
  only; no new behaviour", and the diff bears that out: a moved paragraph and one heading-name fix.
  An upstream edit that says what it did and did only that is what makes a cheap downstream
  confirmation like this one possible.

## Recommendation

**Approved with minor changes**

Four Low findings, no High, no Medium. Three are inherited pointer nits carried from v7; the fourth
is line-anchor drift caused by unrelated commits to `orchestrate-dev.js`, where every underlying
claim remains true by content. Under the freeze, neither criterion for a blocking finding is met:
the document was not revised, so nothing was broken (i), and no load-bearing claim is contradicted
by the repository at HEAD or by FSPEC v0.9's follow-through delta (ii).

Product lens satisfied, unchanged from v7: the feature ships **on** in a repository that says
nothing (G-1, AC-1.1), disablement is an explicit act that removes the report key (AC-5.1a), a
malformed section fails open with `NTC-MALFORMED` (AC-5.1b), a wrong-typed key fails open with
`NTC-KEYTYPE` (AC-5.1c), and reproducibility is claimed per dispatch at the two loci AC-3.3 names,
with one set-equality test each. No P0 or P1 requirement is omitted or narrowed, and nothing outside
the REQ's scope has appeared.

DEFERRED: re-anchor the `orchestrate-dev.js` citations on symbol names rather than line positions (F-04), next time this document is opened.
DEFERRED: close F-01/F-02's §I.3-for-§I.2 and §T.2-for-§T.6 pointers and F-03's stale bare-repository note in a single editorial pass during PLAN authoring.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | inherited | nonlocal | `OQ.2` and `ERR-4` say "§I.3's gate"; the gate is in §I.2 | §OQ.2 / §ERR-4 |
| F-02 | Low | inherited | nonlocal | §A.5's closing sentence cites §T.2 for the per-dispatch loci; they are asserted in §T.6 | §A.5 |
| F-03 | Low | inherited | nonlocal | `OQ.2`'s bare-repository note is stale against E-21 → AT-32 | §OQ.2 |
| F-04 | Low | inherited | nonlocal | Raw `file:line` anchors into `orchestrate-dev.js` drifted ~40–140 lines as HEAD moved; all claims still true by symbol | §Premises P-1/P-2a/P-10 |

FINDING: Low | inherited | nonlocal | §OQ.2 / §ERR-4 | `OQ.2` (TSPEC:1237) and `ERR-4` (TSPEC:1277) attribute the corrected gate to §I.3; it is at TSPEC:441-448 inside §I.2, and §I.3 (TSPEC:486) contains no gate
FINDING: Low | inherited | nonlocal | §A.5 | §A.5's closing sentence (TSPEC:359-361) cites §T.2 for the per-dispatch loci; §T.2 (TSPEC:799) is the doubles table and the assertions live in §T.6's DIVERGENT-CORPUS (TSPEC:987-992)
FINDING: Low | inherited | nonlocal | §OQ.2 | `OQ.2`'s bare-repository note (TSPEC:1241-1244) is stale against FSPEC's E-21 → AT-32 mapping (FSPEC:719) and §T.5's assignment of AT-32 to learningsConfig.test.js (TSPEC:952-958)
FINDING: Low | inherited | nonlocal | §Premises P-1/P-2a/P-10 | Raw file:line anchors into orchestrate-dev.js drifted as HEAD moved (main now :12022, wrapperSeams :12421, erratum author :12861, land-proof retry :12955, converge creator :13657, advisory spread :15309); every claim remains true by symbol, so this is DEC-DOC-01 Process-scope, not a behavioural defect

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 4}

APPROVAL-HASH: sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3
APPROVAL-HASH-NORMALIZED: sha256:91726204b43da70f7025bd7e0423498212e5dea7f4ecf377de823f5868c6d7af
REVIEWED-COMMIT: 7a1d132ad707535a643cf35b34054ff375824746
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:764414d0d049480ae616dd04fdc5fc44a70f268674d704766d0b191189c492e0
