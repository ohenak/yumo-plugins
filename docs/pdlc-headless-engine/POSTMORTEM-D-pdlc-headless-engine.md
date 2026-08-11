# POSTMORTEM — Phase D, pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `DECISIONS` → **POSTMORTEM-D** |
| Downstream | operator decision; `LEARNINGS-pdlc-headless-engine.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{1,2}.md` (4 files); `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v8.md` (erratum delta, 2 files) |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted — awaiting operator resolution | Claude (se-author) | 1.0 | 2026-08-11 |

RESOLVED: no

## Phase

**Phase D (DECISIONS Creation + Review) converged and was then halted by the erratum protocol.**
The DECISIONS document itself is not in dispute: it converged in round 2 and its approval anchors
are recorded. The halt came afterwards, in the erratum wave Phase D routed upward to `REQ` — and it
came with **both delta-confirmation files on the branch carrying approving verdicts**.

| | |
|---|---|
| Documents | `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.2, **converged**, anchors `sha256:bce4becb…` recorded in `96b8671a`); upstream `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (edited to v0.10 in `6ff9871a`) |
| Branch | `feat-pdlc-headless-engine` |
| Halt reason reported | *ERRATUM-PROTOCOL: the REQ delta confirmation was non-approving: `[se-review]`* |
| Erratum items routed to REQ | (1) *se-author:* no constraint authorises requiring a working interpreter on an unattended host — DEC-ENG-03's startup refusal turns a host that previously ran with the guard silently inert into one that cannot run at all; `grep -in "python\|interpreter"` over REQ returned zero hits. (2) *pm-review:* the REQ must state the precondition — a working Python interpreter of the kind probed at `guard-harvest-before-delete.sh:14-21` is required on the host running the engine unattended |
| Round budget | **not exhausted.** `MAX_REVIEW_ROUNDS` is 5; DECISIONS converged in round 2. The binding bound was `MAX_ERRATUM_ROUNDS_PER_DOC = 1` (`orchestrate-dev.js:5644`) — and even that was not exceeded |
| Erratum window | `96b8671a` (DECISIONS approval anchors) → `6ff9871a` (targeted REQ edit, v0.9 → v0.10, `+31/−28`) → `2d125f41` (se delta confirmation) → `23a1a614` (te delta confirmation) |
| Terminal state | **the halt contradicts the artifacts on the branch.** Both confirmation files end `VERDICT: Approved with minor changes` with `{"high": 0, "medium": 1, "low": 1}`; under the High-only bar (`isPassResult`, `orchestrate-dev.js:5230-5233`) each is a pass. Nothing in the repository records a non-approving se-review |
| Collateral | the phase's **second** erratum — the FSPEC EC-row / rung-placement item DEC-ENG-03 also depends on — was never dispatched. `ERRATUM_DOC_TYPES` orders `REQ` before `FSPEC` (`:5613-5617`), and the REQ halt threw out of the routing loop before FSPEC's round ran. `grep -inE "python|interpreter"` over FSPEC still returns zero hits at HEAD |

## Iterations

| Round | Document | Version | pm-review | te-review | Outcome |
|---|---|---|---|---|---|
| 1 | DECISIONS | v1.1 | Needs revision (`f084bdbc`) | Needs revision (`c98fcb05`) | six commits of targeted repair (`a4bd72bc` … `07bb1b0a`): DEC-ENG-03 dropped its EC-GUARD-4 message contract and rung-5 pin and cited upstream authority; DEC-ENG-04 re-cited BR-GUARD-5/O-2; DEC-ENG-05 corrected HEAD measurements |
| **2** | DECISIONS | **v1.2** | **Approved with minor changes** (`ca212254`) | **Approved with minor changes** (`9938f3f8`) | **converged.** Anchors recorded in `96b8671a`. Both reviewers re-emitted the two DEC-ENG-03 errata; pm-review filed the open dependency as `Q-01`, not as a finding, "because it is upstream's state, not this document's" |
| **E1** | **REQ (erratum)** | **v0.10** | *(not a REQ approver)* | — | targeted edit `6ff9871a`; delta confirmation by REQ's own approvers below — **the halt** |
| E1 | REQ (erratum) | v0.10 | `se-review`: **Approved with minor changes** `{0, 1, 1}` (`2d125f41`) | `te-review`: **Approved with minor changes** `{0, 1, 1}` (`23a1a614`) | files approve; **the run reported `se-review` non-approving** |
| — | FSPEC (erratum) | v1.5 | — | — | **never dispatched.** Pre-empted by the REQ halt |

The erratum edit is small and squarely inside the protocol's scope: `+31/−28` lines, one new
constraint **C-11** at `REQ:284-298`, the version row, and a change-note block (the 0.8/0.9 notes
compressed into one paragraph to hold the REQ size budget). `git diff` shows no `AC-`, `BR-`, goal,
non-goal or risk text touched. C-11 declares the engine's ability to execute the shipped guard a
**declared host precondition**, observed once at startup, whose absence is a fail-closed startup
refusal — and explicitly leaves *which* interpreters satisfy it, how the observation is made, the
refusal string, and the check's position among the startup rungs to FSPEC and TSPEC.

## Reviewers

| Reviewer | Verdict in file | Findings | Substance |
|---|---|---|---|
| `se-review` (software-engineer) | **Approved with minor changes** `{0, 1, 1}` | `F-01` Medium: C-11 claims the same footing as C-10 but has no AC of AC-3.2's shape; `F-02` Low: REQ now 695 lines / 54,685 bytes against a 700-line / 60 KB budget | Verified both erratum items cleared, re-ran the author's own grep (`REQ:23`, `:25`, `:285-298`), re-checked the `guard-harvest-before-delete.sh:14-21` citation line-by-line at HEAD, and audited four places the new refusal could contradict standing text (AC-4.1's closed catalogue, AC-2.1's first-match table, C-8's string catalogue, NG-1) — all intact |
| `te-review` (test-engineer) | **Approved with minor changes** `{0, 1, 1}` | `F-04` Medium carried forward to FSPEC/TSPEC review; `F-05` Low process note | "The delta resolves both errata and breaks nothing previously approved: the AC set is byte-stable at 26, the constraint set gains only C-11, the guard citation holds at HEAD, and NG-1 is preserved explicitly" |

Neither reviewer raised a High. Neither asked for a re-edit. `se-review` closed with the opposite
of a rejection: "neither is gating and neither should trigger a re-authoring round."

Two further facts about these two files matter for recovery:

- **They carry no approval anchors.** `grep -c "APPROVAL-HASH\|REVIEWED-COMMIT"` returns `0` for
  both REQ v8 files, and `2` for the DECISIONS v2 files. The anchor append runs *after* the
  confirmation gate (`orchestrate-dev.js:9357` onward); the halt threw first. So REQ's recorded
  approval still points at v0.9's bytes even though its approvers confirmed v0.10.
- **`se-review` left a note for the DECISIONS author**, explicitly not a finding against REQ:
  DEC-ENG-03 still reads that `grep -in "python\|interpreter"` over REQ and FSPEC "returns **zero
  hits in both**" and still describes its authority as pending (`DECISIONS:183-196`). That sentence
  is now half false — the REQ half by design, as the downstream half of this same erratum wave.

## Pattern of Disagreement

**There is none.** This is the first halt in this feature's history with no disagreement of any
kind to record — not between reviewers, not between reviewer and author, not between document and
HEAD.

- The two DECISIONS approvers agreed with each other in round 2 and approved.
- The two REQ approvers agreed with each other in round E1 and approved.
- The erratum author did what both erratum items asked, at the altitude both asked for, and both
  confirming reviewers said so in their Positive Observations.
- The only open items on the branch are one Medium and one Low per reviewer, all four explicitly
  non-gating and routed to the next time the document is opened.

Prior halts in this feature turned on real substance: POSTMORTEM-T on a claim duplicated at a
search-resistant second site, POSTMORTEM-F on a reviewer re-deriving a cell another did not.
This one turns on nothing a participant said. **The disagreement is between the run report and the
branch.** The report names `se-review` as non-approving; `se-review`'s file, committed in
`2d125f41` before the halt was written, ends:

```
VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
```

That is a pass under every rule the workflow states: the value is in the closed catalogue, the
counts parse, `high === 0` clears the High-only bar. Two records of one reviewer's judgement
disagree, and the one that decided the phase is the one no longer in existence.

## Best-Guess Root Cause

## Recommendation
