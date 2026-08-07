# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 7

**Scope:** Delta re-review. Baseline `c8c5760` (the bytes v6 reviewed) → HEAD; 16 insertions, 6
deletions across five commits, all in §7.3, §10.3 row 4a, §12.2, §12.3, §13.1 row 5 and §13.3.
Two passes: (1) each of v6's three findings and two questions, verified at the mechanism rather
than at the revision's account of it; (2) the changed text only, read for new issues. Unchanged
sections already approved are not re-litigated. The approval bar is unchanged.

## Disposition of v6 findings

All three resolved; both questions answered.

| v6 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | Medium | **Resolved** | §12.2 gains a new unnumbered `(no FSPEC AT)` row, **an empty marker resolves `free`**, and it is the discriminating pair I asked for, not a restatement: one fixture whose `docs/_decisions/.consolidation-lock` is `""` asserts a normal terminal status and the **absence** of `reclaimed-stale-lock`, **in the same case, paired against AT-M3's non-empty unparseable fixture, which does record it**. I re-ran the discrimination against the doubles rather than trusting the prose: `fakeFs.checkFile` returns `{ok:false, reason:"file_empty"}` for an own property that trims to `""` (`__tests__/helpers/seams.js:292-299`), while `fakeFs.readFile` returns that `""` — not `null` — because it keys on `hasOwnProperty` (`:254-257`). So the shipped decision routes the fixture to `free` and the forbidden `_readFile(...) !== null` derivation routes it to `reclaim`, and the pair reds on exactly one of them. §10.3 row 4a now names the row as its falsifier and states what is lost without it; §12.3 places the conjunct inside the AT-M3 case with the reason (the pairing *is* the oracle, and the non-empty half is already there), mints no id and no file, so §12.3's set equality is undisturbed; §13.3 records it as task-neutral — a conjunct inside a case the file's single owning task already writes, ownership manifest unchanged |
| F-02 | Low | **Resolved** | §12.2's release row now states which `refused` it keys on: the observed-fresh-marker arm (§10.3 row 5, AT-M1), with §10.3 row 5a's failed-take `refused` named as row 5a's own obligation and its `{taken: true, released: false}` pair spelled out. That is the one-clause repair, and it names the failure direction (red on correct code) rather than only the fix |
| F-03 | Low | **Resolved** | BR-15 now cited as `FSPEC-…:2502`. Verified: `:2502` is BR-15 ("Every marker-holding terminal arm releases the marker — `failed` included"), `:2500` is BR-13 |

**Questions.** Q-01 is answered, and answered more precisely than I asked. The release row no longer
keys on §6.1's `TerminalStatus` — the revision points out that it is a `ts`-fenced type with no
runtime existence in these plain ES modules (`TSPEC-…:461`) — but on §6.4's frozen
`TERMINAL_STATUSES` array (`:574-580`), and it cites §11.3(b) as the pin that makes ranging over a
constant of the module under test legitimate. I verified that chain rather than the citation: §11.3(b)'s
fourth leg parses the authority file's §1 table and asserts **three-way** set equality — module
catalogue ≡ doubles' transcription ≡ `docs/_constraints/pdlc-consolidation-vocabularies.md` §1 —
in both directions, plus a `Version` 1.4 cell pin (`TSPEC-…:2111-2125`), with the two-copies argument
stated explicitly. So a maintainer who deletes a status reds there before this table can shrink with
it, and the implementation-echo reading is closed. Q-02 is answered in §7.3: the call-order prefix
`["check", "read", "write", "read"]` is now explicitly **authoring guidance only**, superseded on the
right ground — the empty-marker row falsifies the forbidden derivation by behaviour rather than by
call shape, which fails on any implementation reaching the wrong verdict however it ordered its calls.

## Findings

None. No High, no Medium, no Low. Every citation added this round verifies; the changed sections
introduce no new obligation without an owner.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | (none) | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §12.2's empty-marker row states conjunct (i) as "the terminal status is a normal one, **not** `refused`" — my own v6 wording, so this is not a finding against the revision. Noting for the PLAN reader only: (i) does not discriminate (the forbidden derivation sends the fixture down `reclaim`, which also does not terminate `refused`), so the whole oracle rests on (ii) and its AT-M3 pairing. If the implementer wants (i) to carry weight, the fixture's other inputs should fix a single expected status literally rather than a class. Nothing in the document blocks that; it needs no edit here. |

## Positive Observations

- **The Medium was closed by adding the falsifier, not by re-arguing the decision.** Three rounds
  running, the shape of my finding was "decided correctly in prose, with the one assertion that would
  falsify it not written down". This round the assertion is written down, in the sanctioned pair form,
  in a case that already existed, with the double's behaviour checked rather than assumed — and the
  row states the divergence input in one sentence ("the two diverge on exactly one input — a marker
  file that exists and is empty — and no case constructed one") so a later reader can see why the
  fixture is not decoration.
- **The fix was propagated to every place that priced the gap, not just to the row.** §10.3 row 4a
  names its falsifier and says what is lost without it; §12.3 states why the conjunct sits inside the
  AT-M3 case rather than in one of its own; §13.3 records it as adding no task and no file so the
  ownership manifest is provably unchanged; §7.3 marks the call-order oracle superseded. Four
  locations, one obligation, no drift left for the PLAN to discover.
- **Q-01 was answered by finding a real defect in my own premise.** I asked whether ranging over
  `TerminalStatus` should cite §11.3(b). The revision cites §11.3(b) *and* corrects the target — the
  type has no runtime existence, so the case must range over §6.4's frozen array. A reviewer's
  suggested repair that gets improved on the way in is the best available signal that the author read
  the mechanism rather than the request.
- **F-02's clause names the failure direction.** "Keying on the status alone without that clause makes
  the row red on correct code for an implementer who reaches for the row-5a fixture" — the document
  records not only which arm it models but what happens to someone who picks the other. That is what
  keeps a disambiguating clause from being deleted as redundant in six months.

## Recommendation

**Approved**

Every finding I have raised across v5, v6 and this round is closed at the mechanism. The round-6
Medium — §7.3 decision 2 and §10.3 row 4a having no fixture that could tell the shipped
implementation from the one they forbid — is resolved by a discriminating pair I verified against
`seams.js`'s actual `checkFile`/`readFile` behaviour, not against the document's account of it; the
release row's `refused` ambiguity is disambiguated by arm; the BR-15 citation is corrected; and the
one implementation-echo risk I flagged as a question is closed by a three-way set equality against a
version-pinned authority file that I read. No new High, Medium or Low arises in the changed text.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
