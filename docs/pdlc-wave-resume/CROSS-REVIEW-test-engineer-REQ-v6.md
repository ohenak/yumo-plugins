# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.7)
**Date:** 2026-08-21
**Iteration:** 6 (delta confirmation, Phase T erratum round)
**Scope:** Local
**Previously reviewed at commit:** 7660f1ed7a554cdf51dbb05e5c60c15c61f713fc (v5, Approved with minor changes)
**Delta under review:** 1ec391c1, ea43a474, 5753de27 (13 insertions, 4 deletions, one file)

## Routed Items

Four routed items, three of which are the same observation raised by two reviewers. Both
distinct items landed.

| Item | Raised by | Landed? | Evidence |
|---|---|---|---|
| OB-F1: §10 records BL-04 "open and unmet — not discharged at FSPEC authoring", while §5's row read as discharged | pm-review, se-author | **Yes** | §5's BL-04 row (line 231) now opens "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)". §10 (line 558) is unchanged and says the same thing. The two sites now agree on both the check and its outcome. |
| OB-1's worktree conclusion cites `.worktreeinclude`, untracked on the default branch; conclusion holds, evidence is consumer-local | pm-review, se-author (×3 phrasings) | **Yes, but the replacement evidence is itself wrong** — see F-01 | The literal filename is gone; OB-1 now reads "the worktree include list that carries `.claude/workflows/` into a worktree is consumer-local — untracked on the default branch, so a consumer fact and not a repo fact". The `git ls-tree -r origin/main` fact is correctly stated; the *reason* attached to it is not. |

The v1.7 erratum note in the header describes exactly these two edits and claims "nothing else
changed"; `git diff 7660f1ed..HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md` confirms it —
the only other hunks are the `Version | 1.7` cell and the erratum note itself. Nothing I approved
in v5 was disturbed: §1's mechanism inventory, REQ-WVR-01..10, §5's other blockers, the acceptance
criteria and the risk table are byte-identical.

The one v5 finding that was **not** in this round's routed list is my F-01 (the header base-note's
"owed before FSPEC authoring" versus §10's "owed before implementation"). §5's edit narrows the gap
— the outcome of the FSPEC-authoring check is now stated everywhere — but the header note's
*deadline* wording is untouched, so the two-deadline reading survives. It is inherited and
non-gating; carried below as F-03.

## Upstream Re-Grounding (DEC-ERR-03)

I re-read the upstream this REQ leans on at its **current** default-branch state
(`origin/main`, fetched this round), not at the version the earlier rounds cited. Three checks
matter, and the third is where this round's edit goes wrong.

**1. The shipped ledger contract OB-1 compresses is intact.** Every symbol §1 and OB-1 cite by
name still exists on `origin/main` in `pdlc/workflows/orchestrate-dev.js`: `WAVE_STATE_PATH`
(still literally `".claude/pdlc-wave-state.json"`), `computePlanHash`, `parseWaveLedger`,
`formatWaveLedger`, `writeWaveLedger`, `explicitPointer`, `headCorroborated`, `allWavesRecorded`.
`pdlc/workflows/__tests__/waveExecution.test.js` still carries the ledger coverage OB-1 points
TSPEC at — `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")` and
`describe("computePlanHash — the ledger's plan fingerprint")`, alongside the `startWave` block.
The "ratify or revise this shipped contract, not invent one" instruction to TSPEC is still a
faithful compression. The branch-base note's "1,637 commits behind" is also still exact
(`git rev-list --count HEAD..origin/main` = 1637), so that inherited number has not gone stale.

**2. `.claude/pdlc-wave-state.json` really is consumer-local — and upstream now says so in a
better place than this REQ cites.** `origin/main:.gitignore` carries an explicit block headed
"Machine-local pdlc consumer runtime + wave ledger — never shared", anchoring both
`/.claude/workflows/` and `/.claude/pdlc-wave-state.json`, with the rationale spelled out in
comments. That is a tracked, default-branch, repo fact — exactly the kind of grounding the routed
item was asking for, and stronger than anything OB-1 currently cites for the same claim.

**3. The replacement reason is not what upstream says.** `.worktreeinclude` is absent from
`origin/main` not because it was ever consumer-local, but because it was a **tracked repo artifact
that `pdlc-plugin-retirement` deleted**: `origin/main:docs/_constraints/pdlc-retirement-baseline.md`
lists it as retirement class **M-11j** ("`.worktreeinclude` (single row `.claude/workflows/`); ...")
and counts it in the sweep tables at §132–§142. It is still tracked on *this* branch, 1,637
commits back, which is precisely why the header base-note's rule — verify substance against the
default branch — matters here. So the new sentence trades a true-but-branch-local citation for a
true fact ("untracked on the default branch") welded to a false explanation ("consumer-local ...
a consumer fact and not a repo fact"). That is F-01.

The same paragraph closes "consistent with the **D-DIST-07 deferral**". Upstream no longer says
deferral. `origin/main:docs/_decisions/DECISIONS-plugin-distribution.md:209` records that
"D-DIST-07 dissolves with the consumer copy that `pdlc-plugin-retirement` removes, re-opening
against queue row 6 only if retirement does not land", and `origin/main:docs/_queue/QUEUE.md:230`
records that "D-DIST-07 closes by construction". Retirement **has** landed — `.claude/workflows/`
has zero tracked entries on `origin/main`, and `pdlc/workflows/dist/` is down to `pdlc-cli.mjs`.
The REQ is therefore citing a closed decision as an open deferral. That is F-02; it predates this
edit, so it is inherited, but it sits in the sentence the edit rewrote.

**What survives all three checks: OB-1's conclusion.** A Claude-created worktree has no ledger and
fails open to a full run. The evidence at HEAD is now *stronger* than when OB-1 was written — there
is no include list of any kind on the default branch to carry `.claude/` state into a worktree, and
the ledger path is explicitly gitignored as never-shared. Nothing about the fail-open behaviour, the
"worst case is a full run" argument for G-2, or TSPEC's obligation to state it explicitly is
affected. Both findings are about *why the document says it is true*, not *whether it is true* —
which is why neither is High under `docs/_decisions/DECISIONS-review-severity-bars.md` DEC-ERR-01
(a false statement in a hand-off section, conclusion unaffected, demotes in a delta confirmation).

**Testing lens, unchanged by this round.** OB-1 still hands TSPEC a testable worktree obligation,
and the fail-open claim is now provable from a tracked artifact: a test can assert the ledger path
is gitignored on the default branch and that no include mechanism exists to copy it, rather than
asserting the absence of a file. That is an improvement in falsifiability, and it is the phrasing
I would like the follow-up edit to reach for.

## Questions

| ID | Question |
|----|---------|
| Q-01 | OB-1's worktree sentence now needs only one more pass to be right at HEAD: would you rather ground it on `origin/main:.gitignore`'s "never shared" block (which names both `/.claude/workflows/` and `/.claude/pdlc-wave-state.json`) and drop the include-list clause entirely, or keep the include list and attribute its absence to retirement class M-11j? The first is shorter and cites a live artifact; the second preserves the causal story. Either resolves F-01. |
| Q-02 | With D-DIST-07 recorded closed-by-construction upstream, is there anything left for TSPEC to *coordinate* on worktrees, or is the whole obligation now "state that a worktree fails open, and test it"? If the latter, OB-1's closing clause can shrink to that, which also resolves F-02. |

## Positive Observations

- The erratum is exactly as scoped as it claims. The v1.7 note says "Two items, nothing else
  changed", and the diff bears that out: two content hunks, one version cell, one note. Reading
  the diff was sufficient to confirm the round — that is what a well-behaved erratum edit looks
  like, and it made this confirmation cheap.
- BL-04 is now stated identically in both places that carry it. §5's row no longer reads as a
  discharged check, §10 no longer stands alone in saying it is unmet, and both name the same
  consequence. The routed OB-F1 contradiction is fully gone.
- §10's readiness reasoning stayed coherent through the edit: BL-04 is unmet, is owed before
  implementation, and is explicitly **not** a pickup gate — which is why `ready: true` in the
  frontmatter is still the right value. I re-checked the frontmatter against that sentence; they
  agree.
- The edit correctly refused to cite `.worktreeinclude` from this branch's tree. The file *is*
  tracked at this branch's HEAD, and citing it would have been the easy, wrong move under the
  base-note's own rule. Reaching for a default-branch check instead was the right instinct — the
  remaining problem is only the explanation attached to the result.
- Nothing I approved in v5 regressed. The mechanism inventory, the requirement set, the ignore
  catalogue and the risk table are byte-identical across the delta.

## Recommendation

**Approved with minor changes**

Both routed items landed, and the document is not broken anywhere I previously approved. The two
Medium findings are grounding defects in OB-1's hand-off prose — a wrong reason attached to a right
fact (F-01) and a decision cited as deferred that upstream now records as closed (F-02) — plus one
inherited wording mismatch on BL-04's deadline (F-03). None changes a conclusion, a requirement, or
a testable outcome, so none blocks Phase T. All three are one-sentence edits; the natural place to
land them is the next revision of this document rather than another erratum round.

## Delta-Confirmation Findings

## Verdict
