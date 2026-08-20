# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.8)
**Date:** 2026-08-19
**Iteration:** 9 (delta re-review)

## Scope

Delta re-review of the four commits landed on the document since the `8412569e` bytes I reviewed at
v8: `17bf0e92` (re-derive the already-migrated site count to twelve, PM v8 F-01), `9e81ad0d` (cite
PLAN by task row, name `S-5`, add the early-green drift signal, PM v8 F-03/F-04/Q-02), `31d9105b`
(run the published recipe over its whole surface, column (3) to twenty-five, PM v8 F-02) and
`d0b7d308` (v1.8 — relocate the sizing block whole to `SIZING-pdlc-advisory-wave-gate.md` per
POSTMORTEM-D §6 steps 1–2).

The net effect on the document under review is −158/+28: the `## Consequences` sizing block that
generated a finding in each of five consecutive rounds is **gone from DECISIONS**, replaced by one
bullet carrying a pointer and column (1)'s four, plus a front-matter note recording why. The four
decision entries `DEC-A6-01`…`DEC-A6-04` are byte-identical to the bytes I approved on substance
rounds ago and are out of scope per POSTMORTEM-D §6 step 4.

Method: I did not review the relocation on the strength of the commit message. I verified column
(1)'s four against the tree — `orchestrate-dev.js:1942` (`ENVELOPE_DEFAULTS`), `:1944`
(`ADVISORY_DEFAULTS`), `:1951` (`ADVISORY_SEAMS`), and a repo-wide grep for the five-member seam
literal excluding `"A6"`, which returns `__tests__/advisoryRecord.test.js:496`'s
`expect(rows.map((r) => r.seam)).toEqual(["A1" … "A5"])` and nothing else under `__tests__/`. I read
the relocated block in `SIZING-pdlc-advisory-wave-gate.md` to confirm the content survived the move
in the corrected form my v8 findings asked for rather than being carried over stale, and I confirmed
the pointer's target actually exists and is actually cited where the pointer says it is
(`PLAN:178-185`, PLAN revision row 1.6).

## Prior-Round Disposition

| ID | Finding | Disposition at HEAD |
|----|---------|---------------------|
| v8 F-01 (High) | "Seven sites … need no edit" bullet's new parenthetical asserted ten ⊆ seven — two counts that cannot both be right, the reconciliation clause inheriting the staleness of the half not re-run | **Resolved, and resolved by removal rather than rewording.** The bullet and its parenthetical no longer exist in DECISIONS. `17bf0e92` first landed exactly the fix I asked for — the population re-derived as **twelve**, stated as one enumeration read two ways (ten oracles red at HEAD, two green inputs) — and `d0b7d308` then moved the whole block out. `SIZING:87-92` carries that corrected form, and its §"Why this is not in DECISIONS" adds the standing rule *"no clause reconciles one column against another"*, which retires the defect class rather than the instance. My blocking finding is closed. |
| v8 F-02 (Medium) | Column (3)'s "twenty" falsified by the record's own published recipe; at least twenty-five | **Resolved and re-derived to the number.** `SIZING:178` reads twenty-five, decomposed **seventeen seam prose + eight envelope/defaults** — arithmetic checks. The seventeen include the three production-side sites I named in `orchestrate-dev.js` and the two generated `it` titles TE v8 F-01 found; the eight are unchanged and correct. |
| v8 F-03 (Low) | Claims cited against superseded "PLAN v1.3" while verified at PLAN v1.4 | **Resolved.** `grep -n "PLAN v1\.[0-9]"` matches **zero** times in both DECISIONS and SIZING; claims are now cited by task row (`A6-05`) without a version, which is what I asked for. |
| v8 F-04 (Low) | `advisoryQueueSeams` member cited the inline comment id `S-1`, not the test name that fails | **Resolved.** `SIZING:132-133` names `S-5` as the test the runner prints and keeps `S-1` explicitly labelled as the trailing comment on the assertion. |
| v8 F-05 (Low, Process) | Half-re-derived enumerations recur; needs a rule narrower than "re-derive" | **Actioned, and promoted past what I asked for.** POSTMORTEM-D §6 step 3 adopts it as a standing authoring check — *"if this sentence names two counts, re-run both"* — and `SIZING`'s rationale section states it as a corollary the appendix is bound by. Still a harvest item, now with a landing site. |
| v8 Q-01 (fold the failing seam) | Editorial question | **Answered by doing more than the question asked.** The seam was not re-welded; the block was relocated and the reconciliation clause deleted. |
| v8 Q-02 (early-green drift signal) | Editorial question | **Answered** in `9e81ad0d`, which landed in the block now resident in SIZING. |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **Column (1)'s four now lives in three documents with no declared owner.** The relocation fixed the within-sentence reconciliation defect, but the number itself is now stated in DECISIONS (`## Consequences`, "The number an implementer must not get wrong is **four**"), in `SIZING:69` ("Column (1) — gate-demanded edits: **four**") and in `PLAN:180-181` ("column (1), the **four** gate-demanded edits"). All three agree at HEAD — I checked each against `orchestrate-dev.js:1942/:1944/:1951` plus `advisoryRecord.test.js:496`, and all three name the same four members — so this is not a live contradiction. It is the same failure *shape* one level up: three copies of an integer, updated by three different authors on three different cadences. `SIZING:31` half-solves it by naming SIZING the measuring document and DECISIONS the carrier, but PLAN's restatement is outside that sentence's reach. Cheapest fix, if the author wants one: have PLAN's Overview cite the appendix for the number instead of restating it, so the tree has one measurer and two pointers. Deliberately **not** raised higher — column (1) is the one number in the block chosen precisely because it is stable (it moves only if a production constant is added or the last test-side literal migrates), and POSTMORTEM-D §6 step 1 explicitly directs that DECISIONS keep it. | POSTMORTEM-D §6 step 1 |
| F-02 | Low | Process | **The traceability chain now contains a cycle, and no artifact class covers it.** DECISIONS' header declares `REQ → FSPEC → TSPEC → **DECISIONS**` with `Downstream: PLAN, PROPERTIES, IMPL`, while `SIZING`'s header declares `TSPEC → DECISIONS → **PLAN** → SIZING`. The new Consequences bullet therefore points from an upstream artifact to a downstream one, and the pointer is load-bearing prose ("Those totals are enumerated and re-measured in `SIZING-…md`"), so a rename or a PLAN-scoped cleanup silently dangles it. The relocation was the right product call and I would make it again — a decision record should not carry a measurement of the working tree — but the pipeline has no artifact class for "measurement appendix", which is why the fix had to be expressed as a backwards edge. This is a process observation for harvest, not something to solve inside this feature: the durable item is that the pipeline needs either a first-class evidence-appendix class or an explicit rule that upstream artifacts may cite downstream appendices by path. | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The relocation is recorded as a front-matter prose note, not as a fifth decision entry. POSTMORTEM-D §6 step 6 reserves `DEC-A6-05` for the case where round 9 returns a sixth High — which it does not — so a prose note is within the letter of the guidance. But "sizing evidence lives with the plan that consumes it, not with the record that motivates it" reads like a genuinely reusable decision with a reversibility rating and a re-evaluation trigger, and it is the one claim in the document a future reader is most likely to want to cite. Worth promoting to `DEC-A6-05` anyway, on its merits rather than as a fallback? Editorial, not blocking. |
| Q-02 | `SIZING`'s Cross-Reviews cell reads *"(none — relocated content, reviewed as `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v1…v8.md`)"*. That is honest about provenance today, but it means the appendix's counts carry review history under a document name whose phase has closed. If the counts are re-measured at Phase I — and §"Measurement vintage" says they will need to be — is the intent that the re-measurement is reviewed at all, or is the appendix explicitly outside review from here? Either answer is fine; the record should say which, since the appendix is the artifact PLAN's batch sizing now depends on. |

## Positive Observations

- **The right fix was to move the block, not to correct it a ninth time.** Five rounds of my own
  findings — and four of TE's — were all the same defect wearing different integers: a document
  whose truth conditions move with every commit cannot converge in a review loop whose premise is
  that approved bytes stay approved. v1.8 names that diagnosis in its own front matter ("It is a
  measurement of the working tree, not a consequence of a decision") and acts on it. That is the
  structural read I should have offered at round 5 instead of a fifth membership correction, and it
  came from the author's side.
- **The relocation is lossless, which is the part that could easily have gone wrong.** I checked for
  the failure mode where a "move" quietly drops the contested material: it does not. Column (2)'s
  twelve, column (3)'s twenty-five with its 17+8 decomposition, the excluded false positives, the
  `dist/pdlc-cli.mjs` disposition and — most importantly — the published re-derivation recipe all
  survive in `SIZING`, in their corrected form. POSTMORTEM-D §6 step 1's instruction "keep the
  published re-derivation recipe with it — the recipe is the durable artifact, the totals are not"
  was followed exactly.
- **The two rounds before the relocation still did the work.** `17bf0e92` and `31d9105b` landed my
  F-01 and F-02 in full before the block moved, so the content that relocated was correct content.
  A weaker sequence would have moved the block first and let the relocation absorb the open
  findings; this one closed them and then moved.
- **Column (1)'s four reproduces exactly, by grep rather than by reading.** Three `export const`
  declarations at `orchestrate-dev.js:1942`, `:1944`, `:1951`, and exactly one surviving test-side
  five-member literal at `advisoryRecord.test.js:496`. The claim "a grep for the five-member literal
  excluding `"A6"` returns that one hit and no other" is reproducible as written — I ran it.
- **The `## Consequences` section reads better than it has since v1.2.** What remains is four
  decisions, a no-op-by-default claim, one sizing pointer and the shared-double co-movement argument
  — and that last one is correctly identified as "a decision-shaped claim [that] stays here; its
  sizing does not". The section now contains only things that stay true while the tree moves, which
  is what a decision record is for.

## Recommendation

**Approved with minor changes.**

No High findings. My v8 blocking finding (F-01) is resolved, and so are F-02, F-03 and F-04; F-05
has been promoted into POSTMORTEM-D §6 step 3 as a standing authoring check. The four decision
entries `DEC-A6-01`…`DEC-A6-04` are byte-identical to bytes already approved on substance and remain
a faithful compression of TSPEC v1.10. The one number DECISIONS still carries — column (1)'s four —
reproduces exactly against the tree.

Neither remaining finding needs a document edit before Phase P:

1. **F-01 (Low)** — optional: have `PLAN:180-181` cite the appendix for column (1)'s four rather
   than restate it, leaving one measurer and two pointers. All three copies agree at HEAD.
2. **F-02 (Low, Process)** — harvest item only. The pipeline lacks an artifact class for a
   measurement appendix; the fix here had to be expressed as an upstream→downstream pointer.

Nothing in the changed bytes blocks. Recommend proceeding to Phase P.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:25f8e9542816737d16ee043bcce0555ce67c21296cfb2052c014840592e7464d
APPROVAL-HASH-NORMALIZED: sha256:25f8e9542816737d16ee043bcce0555ce67c21296cfb2052c014840592e7464d
REVIEWED-COMMIT: 9a1934db2f55f77300dc64709b90fd803c5540f9
UPSTREAM-STATE: REQ sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:4a092e85e8f3b58740dd02b09831a056a0dc7d28b1b13786f5ba8a664994ced3
