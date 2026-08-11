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

## Pattern of Disagreement

## Best-Guess Root Cause

## Recommendation
