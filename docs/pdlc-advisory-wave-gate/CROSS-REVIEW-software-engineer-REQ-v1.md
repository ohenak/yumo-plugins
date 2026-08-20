# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.11)
**Date:** 2026-08-20
**Iteration:** 1

## Review basis

Every claim below was re-measured in this working tree at `9cf48051` (branch tip, identical to
`origin/feat-pdlc-advisory-wave-gate`) and, where the claim is about shipped baseline behaviour, at
`origin/main` `11420461`. Commands are given inline so each finding is re-runnable.

Branch hygiene checked before review: `git rev-parse --abbrev-ref HEAD` → `feat-pdlc-advisory-wave-gate`;
local tip equals its remote (no stale base).

Size budget (C-5): the REQ measures 636 lines / 51,165 bytes against
`pdlc/hooks/scripts/check-req-size.sh` limits `LINE_LIMIT=700` / `BYTE_LIMIT=61440` — inside budget on
both axes. No finding.

**Maturity note (DEC-FRZ-01).** This document carries eleven authored versions and a long prior
approval history, and the feature it specifies is merged. I have therefore held myself to the
blocking bar DEC-FRZ-01 names for a matured document: a finding blocks only where it is a defect a
revision introduced, or a factual contradiction with the repository at HEAD. I filed no
restructuring, altitude-taste or wording findings, and I re-opened no settled decision. The one High
below is squarely in class (ii) — it is a contradiction with HEAD, not a preference.


## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | The REQ's `ready: false` frontmatter and QUEUE row 19's `pending` status both contradict HEAD — the feature is merged — and the stale row mechanically blocks two dependent queue rows | frontmatter; §9 BL-05 |
| F-02 | Medium | Cross-Feature | M-WG-8, cited as load-bearing by AC-1.1 and R-5, is false at today's `origin/main`; the baseline is pinned at a commit whose own re-verification rule has fired | §6 AC-1.1, §7 R-5 |
| F-03 | Low | Process | AC-1.2's inline raw `file:line` anchor does not resolve at HEAD and violates both DEC-DOC-01 and the REQ's own C-5 measured-fact discipline | §6 AC-1.2 |
| F-04 | Low | Local | §1's runtime-drift claim is not reproducible by the repository's drift-check tooling; the drift that does exist is gitignored and machine-local | §1 |

### F-01 (High, Cross-Feature) — control-plane state contradicts HEAD, and blocks successors

The REQ's frontmatter carries `ready: false`
(`docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` frontmatter), and `docs/_queue/QUEUE.md`
row 19 carries status `pending`. Both are false at HEAD:

- `git merge-base --is-ancestor HEAD origin/main` succeeds; `git log origin/main --oneline --grep=advisory-wave-gate`
  shows `bb4d36fb Merge pull request #66 from ohenak/feat-pdlc-advisory-wave-gate`.
- The feature's deliverables are on the default branch:
  `git show origin/main:pdlc/workflows/orchestrate-dev.js | grep -n "ADVISORY_SEAMS = "` →
  `1952: export const ADVISORY_SEAMS = Object.freeze(["A1", …, "A6"]);`, and `ENVELOPE_DEFAULTS` at
  `:1942` carries `E-5`/`E-6`.

This is not cosmetic. `pdlc/workflows/orchestrate-queue.js:881-884` blocks any row whose declared
dependency is present in the queue with a non-`done` status
(`if (match && match.status !== "done") … reason: \`dependency ${dep} is ${match.status} in queue (not done)\``).
QUEUE row 20 (`pdlc-wave-resume`) and row 6 (`pdlc-engineering-loop`) both declare
`pdlc-advisory-wave-gate` as a dependency, so both are permanently unpickable by `/pdlc:orchestrate-queue`
while row 19 reads `pending`. Independently, `ready: false` means "not pickable" by design
(`orchestrate-queue.js:257`, `:1341` — `Skip … REQ not marked ready: true (still a draft)`), so the
document that governs a shipped feature still describes itself as a draft.

**What must change:** flip QUEUE row 19 to `done`, and settle the REQ's frontmatter to match shipped
reality (either `ready: true` if the row is to remain queue-visible, or relocate the feature's docs to
`docs/completed/pdlc-advisory-wave-gate/`, which is the convention BL-05 itself cites for
`pdlc-consolidation-agent` and the Upstream row cites for `pdlc-advisory-tier`). Note the REQ's own
Upstream row points at `docs/completed/pdlc-advisory-tier/…`, a path that does exist — so the
relocation convention is established and this feature is the one that has not followed it.


### F-02 (Medium, Cross-Feature) — M-WG-8 is false at today's default branch

C-5 and §9 BL-06 pin every shipped-behaviour fact to `docs/_constraints/pdlc-wave-gate-baseline.md`
**v1.1**, whose header states `Verified at | §1–§2 at default-branch commit c8aa22a4` and whose
re-verification rule reads: *"A later default-branch commit is a fresh check, not an inherited one."*
`origin/main` is now `11420461`, so that rule has fired.

At that commit, M-WG-8 — *"The advisory seam catalogue is closed at five and transcribed"* — is false:
`ADVISORY_SEAMS` is a six-member frozen list (`pdlc/workflows/orchestrate-dev.js:1952`), and every
transcribed set-equality now reads six, not five:

- `pdlc/workflows/__tests__/advisoryEnvelope.test.js:317` → `toEqual(["A1","A2","A3","A4","A5","A6"])`
- `pdlc/workflows/__tests__/advisoryHarvest.test.js:580`, `advisoryRecord.test.js:496` → same six
- `advisoryEnvelope.test.js:284` → `ENVELOPE_DEFAULTS` `toEqual(["E-1",…,"E-6"])`

AC-1.1 rests on M-WG-8 for its oracle (*"carries six rows where it carried five"*) and R-5 rests on it
for the non-additivity risk. Neither is checkable as written against HEAD any more — the "five" side of
both is gone.

**Why Medium, not High:** the REQ's *requirement* is correct and demonstrably satisfied; what has gone
stale is the pre-change baseline it cites, and the fact went stale precisely *because this feature
shipped*. The fix belongs in the constraints file (a §4 recording the post-A6 catalogue at
`11420461`, plus a version bump), not in this REQ's acceptance criteria. Recording it here so the
next reader of AC-1.1 is not left grepping for a five-member list that no longer exists.

### F-03 (Low, Process) — AC-1.2's raw line anchor does not resolve

AC-1.2 carries the inline anchor `` `orchestrate-dev.js:12331-12343` `` for the claim that the post-wave
command runs exactly once and its failure halts immediately. At HEAD, `sed -n '12331,12343p' pdlc/workflows/orchestrate-dev.js`
returns `defaultReadFile` — the PLAN-DAG file reader — not the post-wave path. The behaviour claimed is
still true; its site is now around `pdlc/workflows/orchestrate-dev.js:15340-15346`
(`` `\`${implConfig.postWaveCommand}\` did not pass` `` and the `Wave ${waveNum} post-wave:` emit).

Two rules converge on the same fix. `DECISIONS-review-severity-bars.md` DEC-DOC-01 puts raw `file:line`
anchors in new feature documents at Low/`Process` unless the position itself is the claim, which it is
not here. Separately, the REQ's own C-5 commits to holding shipped-behaviour facts as `M-WG-*` ids in
the constraints file rather than restating them inline — so the altitude-correct fix is to relocate this
claim as a measured fact (symbol-anchored, per BL-06's own reissue-in-symbol-form instruction), not to
repair the line numbers. This is the exact bookkeeping cost DEC-DOC-01 was recorded to prevent, observed
inside a document that otherwise honours the rule throughout.

### F-04 (Low, Local) — §1's drift claim is not reproducible

§1 states that the consumer runtime copy under `.claude/workflows/` is out of sync and that "the drift
check exits non-zero, three rows stale one missing". The repository's drift check disagrees:
`node pdlc/workflows/build-runtime.mjs --check` prints `in-sync  pdlc/workflows/dist/pdlc-cli.mjs` and
exits `0`. A real divergence does exist — `cmp .claude/workflows/pdlc-cli.mjs pdlc/workflows/dist/pdlc-cli.mjs`
differs, and `.claude/workflows/` additionally carries two `*.bundle.js` files with no source counterpart
— but that directory is gitignored (`.gitignore:40`), so no other reviewer can reproduce the row counts.

v1.11 already did the right thing for the sibling claim, re-measuring `.claude/pdlc-wave-state.json` as
untracked and working-tree-only, which I confirm: `git check-ignore -v` → `.gitignore:41`, `git ls-files`
returns nothing, and the local file reads
`{"version":1,"feature":"pdlc-advisory-wave-gate",…,"lastGreenWave":7,…}`. The drift sentence deserves the
same treatment: name it a working-tree observation and drop the unreproducible "three rows stale one
missing" count, or cite the command that produces it.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is `ready: false` deliberate — a permanent "never auto-pick, this is a completed feature" marker — or leftover draft state? If deliberate, the QUEUE row still needs `done` (F-01), and the convention deserves a line in `pdlc/OPERATIONS.md` so the next reviewer does not file F-01 again. |
| Q-02 | Should this feature's docs move to `docs/completed/pdlc-advisory-wave-gate/` now that PR #66 is merged, matching `pdlc-advisory-tier` and `pdlc-consolidation-agent`? Every cross-document citation into this feature would need the same relocation, so this is a decision, not a cleanup. |
| Q-03 | Who owns the post-ship refresh of `pdlc-wave-gate-baseline.md` (F-02)? Its change-control note says this REQ owns §1–§2 entire, which reads as an obligation on a feature that is already done. |


## Positive Observations

- **The acceptance criteria are oracle-grade, and unusually so for a REQ.** AC-4.4 specifies gate
  re-invocation as an *ordered sequence* equality — `[post-wave, test, post-wave, test]` for one
  attempt — and explicitly rejects set equality with the reason it fails (*"it collapses the duplicates
  and admits a resolution declared on one invocation"*). That is a completeness-by-set-equality
  argument made correctly, including the case where the weaker relation would pass a defect.
- **No absence-only oracles.** AC-4.1 converts an unbounded prohibition into three positive conjuncts,
  each on a run of its own, and names conjunct (iii) as unreachable on an ordinary run with a mutated
  control-flow fixture to reach it. AC-4.5 then generalises the rule: *"each such test asserts the
  corresponding positive outcome on the same path … because a negative assertion alone is satisfied by
  accident."* This is the discipline stated as a requirement rather than left to the test author.
- **No implementation echoes in the enumerations.** Every catalogue the REQ constrains — the seam list,
  the envelope members, the config keys — is required to be transcribed literally into tests, and
  M-WG-9/BL-06 enumerate the transcription sites so a catalogue change reds a known set. The transcriptions
  are real: `advisoryEnvelope.test.js:284,317`, `advisoryHarvest.test.js:580`, `advisoryRecord.test.js:496`.
- **Altitude is held throughout, deliberately.** §8's O-1/O-4/O-5/O-8 push restoration mechanism, owned-path
  computation, classification derivation and commit-path extension to the TSPEC rather than deciding them
  here. C-2 declares every threshold with a default and a named owner (repo operator) — verified shipped:
  `enabled: false` `:1945`, `attemptBudget: 3` `:1946`, `seamBudgetMinutes: 10` `:1947`,
  `waveBudgetPerRun: 1` `:1948` in `pdlc/workflows/orchestrate-dev.js`. There is no undeclared threshold
  in this document, which is the failure mode I most expect to find and did not.
- **The document is honest about its own weaknesses.** R-3 states plainly that a per-run knob bounds drift
  within a run only; R-4 concedes the seam treats a symptom; §1's v1.11 changelog *withdraws* a stronger
  claim v1.2 had made after re-measurement. Findings F-02 and F-04 are both about evidence going stale
  around a document that has been consistently careful with evidence.


## Recommendation

## Verdict
