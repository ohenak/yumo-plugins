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

RESOLVED: yes

Resolution (2026-08-11, operator-directed): Step 1's checks re-derived against TSPEC v1.5 at
HEAD before flipping. PM F-01 — §4.1's `DispatchDescriptor` carries `outcome` (§4.2's member,
stamped at settlement) and `errorText` (verbatim, never parsed); §7.0 appends **one line per
attempt at settlement** into the append-only accumulator, with a composed-but-never-executed
dry-run dispatch appended at composition carrying `outcome: null, errorText: null`; §7.4 row 4's
pair `(F, B)` reads settlement lines whose every conjunct is a recorded field, pinning the exact
member `transport-contract-violation` and discriminating on `promptHash` plus the recorded
failure, not `seq` adjacency. PM F-02 — the fifth suite-wide row is `no record with
`corpusRun != null` and `phase === null``, with `corpusRun` scoping the assertion to run-shaped
tests. PM F-03 — that predicate is stated over records; `byPhase["(no phase)"]` is kept only as
a reader-facing gloss. No section was re-authored; round 6 is the confirmation round over v1.5.
Per §Step 4: if round 6 raises a *new* High in §7.4, stop and escalate rather than spending
rounds 7–10.

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

**The TSPEC was asked to specify an executable oracle over a runtime it does not own, and an
executable oracle is only correct at the last rung — but the review loop's budget is spent per
rung, not per defect.**

The chain:

1. AC-3.3 and FSPEC BR-MODEL-3 require a witness that the advisory fallback re-dispatches on
   `opus` after a `fable` model-resolution failure — a property of `pdlc/workflows/orchestrate-dev.js`,
   which §8.3 forbids this feature from modifying beyond declared exports. The TSPEC therefore had
   to design an assertion over data the engine *already* emits, with no freedom to add a stamp
   where one was missing.
2. Under that constraint the only degrees of freedom are the recorded shape (§4.1's
   `DispatchDescriptor`), the observation seam (§7.0's accumulator) and the predicate (§7.4's row).
   A row is executable only when all three agree. Each round fixed one and left the other two at
   the previous round's assumptions — v1.4 is the clearest instance: the field was added to the
   descriptor (§4.1) and the predicate was written against it (§7.4), but the seam's write timing
   (§7.0) was never revisited, so the field is never on the record the predicate reads.
3. Both reviewers are strong falsifiers — they open the cited spans and trace control flow rather
   than reading the document as self-certifying. That is exactly the behaviour the oracle-quality
   clauses ask for, and it is why every rung was caught. It also guarantees no rung is ever missed
   *late*: a weaker reviewer would have approved v1.2 and the false green would have shipped into
   PLAN.
4. `MAX_REVIEW_ROUNDS = 5` is a budget on rounds, and a three-surface oracle converging one surface
   per round consumes it at exactly one round per rung. The phase ran out with the ladder finished
   and unread.

Two contributing factors, neither sufficient alone:

- **Severity, not substance, decided round 5.** TE scored the identical defect Medium on the
  explicit reasoning that a false *red* is loud and self-announcing. Under the High-only bar, PM's
  High is what failed the round. If the two lenses had scored it the same way — either way — round
  5 would have ended differently, and there is no shared rubric that says which is right for a
  "correct design, unsatisfiable as written" defect.
- **No credit carries across a re-opening revision.** PM's round-3 approval was real and was spent.
  A design that must satisfy two lenses over interlocking surfaces will re-open one approver every
  time it satisfies the other, and nothing in the loop distinguishes "re-opened because the fix
  touched my area" from "never approved".

## Recommendation

**Verify that v1.5 answers the three PM items, flip the marker, and re-invoke Phase T. Do not
re-author the TSPEC and do not re-open any section no round-5 finding named — round 5's revision is
already on the branch, and the re-run's first act is a review of it, not another revision.**

`MAX_REVIEW_ROUNDS` is a **per-invocation budget**, not a lifetime cap: `endIndex = startIndex +
MAX_REVIEW_ROUNDS - 1` (`orchestrate-dev.js:6431`), and `deriveRoundWindow` will read the ten
existing cross-review basenames and set `startIndex = 6`. A re-invocation therefore gets rounds
6–10, and iteration 6 dispatches **reviewers first** (`:5952-5975`) against the document at HEAD —
which is v1.5. The re-run is a confirmation round, not a fresh authoring pass.

### Step 1 — Verify v1.5 against round 5, in the document, before flipping anything

| Finding | Severity | Where v1.5 answers it | What to check |
|---|---|---|---|
| PM `F-01` | High | §4.1 (`085101fc`), §7.0 (`12e4e8c7`), §7.4 (`99dd1fef`, `a7ce620e`) | All three surfaces say the same thing: **one line per dispatch attempt, appended when the attempt settles**, carrying that attempt's `outcome`/`errorText`; a composed-but-never-executed dispatch (inert transport behind `--dry-run`) is appended at composition with both `null`. Confirm §7.0's append-only statement and §7.4's row-4 `F` are not still in tension anywhere in the file |
| PM `F-02` | Medium | §7.4 (`31b24f0b`) | The fifth suite-wide row names `corpusRun != null` as the filter that scopes it to run-shaped tests |
| PM `F-03` | Low | §7.4 (`99dd1fef`, `a7ce620e`) | The fifth row's predicate is stated over **records** (`phase === null`), with `byPhase["(no phase)"]` kept only as the reader-facing gloss |
| TE `F-30`/`F-31`/`F-32` | Medium | §4.1/§7.0, §3.4/§4.6/§8.3, §7.4 | Settlement timing (same as PM F-01); `bin/pdlc.mjs:173` = `emitDryRun`'s inert surface, `:205` = `liveAdapter`'s run path, `doctor` constructs no adapter; row 4 pins the exact member `transport-contract-violation` |
| TE `F-33`/`F-34`/`F-35` | Low | §7.4 (`99dd1fef`, `31b24f0b`, `2e736bc6`) | Lead sentence says **three** accumulators; run i's zero-`haiku` assertion names its second site `orchestrate-dev.js:7454`→`:7463`; fifth row's seam and assertion columns name the same field |

Re-derive each cited `file:line` from HEAD rather than from the changelog. The whole phase is a
record of what happens when a surface is fixed on the strength of the previous round's reading.

### Step 2 — One consistency sweep, no new content

The only edit this halt authorises is a contradiction sweep over the three surfaces PM F-01 spans
(§4.1, §7.0, §7.4) plus §8.3's edit-surface row. If the sweep finds nothing, write nothing —
touching the document to "show progress" before a confirmation round costs a round for nothing.

### Step 3 — Flip the marker and re-invoke

Set `RESOLVED: yes` in this file **only after** Step 1's checks are done against HEAD, and commit
the flip with whatever Step 2 produced. Then:

```
/pdlc:orchestrate-dev { "reqPath": "docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md", "forcePhases": "T" }
```

`forcePhases: "T"` overrides the recorded approval state for Phase T only; it does not clear this
POSTMORTEM, which is why the marker has to be flipped first.

### Step 4 — If round 6 raises a *new* High in §7.4, stop and escalate rather than spending 7–10

Five rounds on one row is already the signal. A sixth rung means the oracle as scoped cannot be
specified against an unmodifiable `orchestrate-dev.js`, and the right move is an operator decision
on the alternative — narrow AC-3.3's witness, or lift §8.3's no-modification constraint far enough
to stamp what the assertion needs — not another revision.

### Durable countermeasures (route to LEARNINGS at harvest; not blocking this halt)

1. **An executable oracle spans surfaces; review it as one unit.** Row 4 needed §4.1's recorded
   shape, §7.0's write timing and §7.4's predicate to agree. Each round fixed one. A reviewer
   finding a defect in a multi-surface oracle should be asked to name **all** surfaces the fix must
   touch, and the author should re-derive every one of them — the "one hop from executable" verdict
   is what burned this budget.
2. **Severity needs a rubric for "correct design, unsatisfiable as written".** PM scored it High,
   TE Medium, and both gave sound reasons. Under a High-only bar that split is decisive. Worth a
   project-level decision: a false *red* on correct code that has an obvious weakening repair is —
   or is not — a High.
3. **A re-opening revision should carry its own scope statement.** When a fix for reviewer A's
   finding edits a predicate reviewer B approved, the changelog should say so explicitly, so B's
   next round is scoped to the re-opened surface rather than re-deriving the section. Rounds 4 and
   5 were both, in effect, B re-reading a section B had already cleared.
4. **The round budget is per invocation — say so in the halt path.** The halt reads as terminal but
   is not: re-invocation grants rounds 6–10 and reviews the document at HEAD. Every future
   POSTMORTEM for a budget exhaustion should state which document version the re-run will actually
   review, because when the last revision landed after the last review, the answer is "one nobody
   has seen".
