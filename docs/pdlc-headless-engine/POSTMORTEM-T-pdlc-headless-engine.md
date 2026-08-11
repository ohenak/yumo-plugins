# POSTMORTEM — Phase T — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → **POSTMORTEM-T** |
| Downstream | operator decision; `LEARNINGS-pdlc-headless-engine.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1..5}.md` (10 files) |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 1.0 | 2026-08-11 |

RESOLVED: no

## Phase

**Phase T — TSPEC authoring and cross-review. The halt is a round-budget exhaustion, not a
deadlock: `MAX_REVIEW_ROUNDS = 5` was consumed and iteration 6 was refused at the loop top
(`orchestrate-dev.js:5862`).**

| | |
|---|---|
| Document | `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` — **v1.5 at HEAD** (`2e736bc6`), 2 000 lines |
| Branch | `feat-pdlc-headless-engine`, HEAD = `origin/feat-pdlc-headless-engine` = `2e736bc6` |
| Reviewers | `pm-review` (product-manager), `te-review` (test-engineer) |
| Halt reason | round budget exhausted at round 5 with one open High (`pm-review` F-01) |
| Round 5 verdicts | PM **Needs revision** `{high:1, medium:1, low:1}`; TE **Approved with minor changes** `{high:0, medium:3, low:3}` |
| Wall clock | `3f4f22bf` (skeleton, 08:30) → `2e736bc6` (v1.5 complete, 10:10) — **100 minutes**, 5 rounds |
| Terminal state | **v1.5 already answers every round-5 finding.** The revision that closes PM F-01 was authored and committed after the round-5 reviews landed; the budget ran out before any reviewer could read it |

The distinction matters for the fix. No reviewer is holding a position the author rejects, and no
two reviewers disagree with each other. The document at HEAD is one unreviewed revision ahead of
the last verdict recorded against it, and that verdict is stale by construction.

## Iterations

| Round | Version reviewed | PM verdict | TE verdict | Both-clean? | Lead finding |
|---|---|---|---|---|---|
| 1 | v1.0 | Needs revision `{4, 2, 1}` | Needs revision `{7, 7, 2}` | no | broad first pass — 11 Highs across both lenses, spread over §3.3/§3.4/§4.5/§6.3/§7/§8.1 |
| 2 | v1.1 | Needs revision `{2, 1, 1}` | Needs revision `{2, 2, 1}` | no | **§7.4** — PM F-01 "asserts over a key the run cannot produce"; TE F-17 "restates AC-3.3 as an oracle that cannot be written at HEAD" |
| 3 | v1.2 | **Approved** `{0, 1, 2}` | Needs revision `{1, 1, 2}` | no | **§7.4** — TE F-22, rows 1/2 red on correct HEAD (V-wave announced under a different phase than it is pinned by) |
| 4 | v1.3 | Needs revision `{2, 0, 1}` | Needs revision `{1, 1, 2}` | no | **§7.4 row 4** — PM F-01 and TE F-26, same finding: v1.3's replacement discriminator is backed by no recorded field, so the witness is a false green |
| 5 | v1.4 | Needs revision `{1, 1, 1}` | **Approved** `{0, 3, 3}` | no | **§7.4 row 4** — PM F-01 and TE F-30, same finding: the descriptor carries the terminal fields but the record is written at composition, so the row is unsatisfiable |
| — | **v1.5** | *not reviewed* | *not reviewed* | — | authored `085101fc`..`2e736bc6`; **budget exhausted before dispatch** |

Round 5's findings were all addressed before the halt. The nine commits behind v1.5:

| Commit | Findings carried |
|---|---|
| `085101fc` | §4.1 pins the record-append point at settlement, one line per attempt (PM F-01, TE F-30) |
| `12e4e8c7` | §7.0 states the append timing its append-only accumulator forces (PM F-01, TE F-30) |
| `99dd1fef` | §7.4 table — accumulator count, settlement lines, pinned outcome member, fifth-row fields (TE F-32/F-33/F-35, PM F-02/F-03) |
| `a7ce620e` | §7.4 prose — exact outcome member, record-level fifth-row predicate, settlement timing (TE F-32/F-35, PM F-01/F-02/F-03, Q-13/Q-14) |
| `31b24f0b` | §4.1/§7.4 name the `corpusRun` scope and run i's second `haiku` site at `:7463` (PM F-02, TE F-34) |
| `f02870e5` | §3.4/§4.6/§8.3 correct the two `createAdapter` sites; `doctor` builds none (TE F-31) |
| `2c8546d8` | v1.5 header, changelog, §7.5's no-accumulator note (PM Q-01) |
| `94fc5b84` | §8.3 edit surface carries the settlement append and the pre-phase predicate |
| `2e736bc6` | §7.4 witness bullet count follows the two added bullets |

PM F-01 asked for one of two named shapes — (a) one line per dispatch appended at settlement, with
composed-but-never-executed dispatches appended at composition carrying `outcome: null`, or (b) two
lines joined on `(corpusRun, seq, attempt)`. v1.5 takes shape (a) verbatim, in §4.1, §7.0 and §7.4
together. The remaining round-5 items (PM F-02/F-03, TE F-31/F-32/F-33/F-34/F-35, Q-01/Q-13/Q-14)
are each one- or two-sentence edits and all are landed; TE's own recommendation says none of them
needs a review round to confirm.

## Reviewers

| Role | R5 verdict | Blocking finding | Character of the review |
|---|---|---|---|
| `pm-review` (product-manager) | **Needs revision** `{1, 1, 1}` | `F-01` (High): §7.4 row 4's new conjuncts are stamped on the descriptor, but §7.0's accumulator is append-only and §7.4 still writes the line at composition — so `F.outcome`/`F.errorText` do not exist on the record the harness reads, and the row is red on correct code | Product lens held on one question for four rounds: does AC-3.3 / BR-MODEL-3 still have a witness after each revision? Re-derived every citation against HEAD (`adapter.mjs:215`/`:224`/`:225`/`:266-268`/`:278-281`, `bin/pdlc.mjs:173`/`:205`, `orchestrate-dev.js:1780`/`:1791`/`:1844`/`:9968`/`:10248`) and named both acceptable repair shapes rather than only the defect |
| `te-review` (test-engineer) | Approved with minor changes `{0, 3, 3}` | none | Same lead finding as PM, filed as `F-30` Medium rather than High because "the failure is loud, not silent — row 4 goes permanently red". Verified the v1.4 fix by hand-falsification: deleted `:1851`→`:1861` in thought, traced `_state.resolved` still `null` at `:3132`, confirmed the re-dispatch arm `:3143-3157` produces no `opus` sibling with a matching `promptHash`, so the row genuinely goes red |

The two reviewers **agree on the substance and differ only on severity**. TE's F-30 and PM's F-01
are the same defect with the same one-clause fix; TE scored it Medium (a false red, loud), PM
scored it High (a false red that invites a repair-in-the-dark loosening back to the residue
predicate v4 already rejected). Under the High-only convergence bar a single High from either
reviewer fails the round, so the severity call — not any disagreement about the design — is what
made round 5 non-converging.

The same near-miss shape occurred in round 3 with the roles reversed: PM approved v1.2 with
`{0, 1, 2}` while TE held one High (`F-22`). In three of the five rounds exactly one reviewer was
clean. The two never both cleared in the same round, and never both held Highs on *different*
defects after round 1.

## Pattern of Disagreement

Three shapes, in order of how much they cost.

**1. Four of five rounds were spent on one table row's mechanisation ladder.** §7.4 exists because
PM v1 `F-03` found AC-3.3's both-directions set-equality with no owning mechanism. Every round
since has been the same row descending one rung toward being executable, each rung revealed only
once the one above it was fixed:

| Round | Rung reached | Finding that opened the next rung |
|---|---|---|
| 2 | the harness exists and asserts both directions (`66a384c8`) | PM `F-01` / TE `F-17` — it asserts over a key the run cannot produce |
| 3 | keyed on the `_phase` seam, not `opts.label` (`59a789fd`) | TE `F-22` — rows 1/2 red on correct HEAD; TE `F-23` — row 4's `seq`-adjacency is flaky |
| 4 | adjacency dropped, predicate re-framed (`cf434c48`) | PM `F-01` / TE `F-26` — the replacement discriminator is backed by no recorded field |
| 5 | `outcome` + `errorText` recorded on the descriptor (`3020cca8`) | PM `F-01` / TE `F-30` — the record is written before those fields exist |
| — | the record is written at settlement (`085101fc`, `12e4e8c7`) | *unreviewed* |

Nobody was wrong at any rung. Each fix was correct and each next finding was real. What the loop
had no way to do was see the whole ladder at once: a delta-scoped reviewer judges the revision in
front of it, and "this is right but still one hop from executable" is exactly the verdict that
consumes a round without converging.

**2. The disagreements are between a document and HEAD, not between roles.** After round 1 there is
no instance of PM wanting X and TE wanting not-X. Both reviewers re-derive claims from the modules
and report where the text and the code differ — PM's F-01 lineage and TE's F-17/F-22/F-26/F-30
lineage are the *same* lineage, discovered independently each round. This is the loop working: two
lenses converging on one defect is strong evidence the defect is real. It is also why the round
count is uninformative about disagreement — five rounds of agreement still spends five rounds.

**3. Revisions that fixed a High opened the next one in the same section.** v1.3's fix to TE F-22
and F-23 is what produced PM v4's two Highs; v1.4's fix to those produced PM v5's F-01. Round 3 is
the sharpest case: PM had *approved* v1.2 with zero Highs, and the very next revision — which
touched only what TE asked for — re-opened PM's lens with two. A revision that edits the predicate
a previous approver validated re-opens that approver, and under a both-must-be-clean bar there is
no credit carried forward for an approval whose subject just changed underneath it.

## Best-Guess Root Cause

## Recommendation
