# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.9, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 7

**Scope:** Delta round over `fb6e58cf..2a782ec2`. **The REQ did not change.**
`git diff fb6e58cf..HEAD -- docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`
is empty; the whole branch delta is the two round-6 cross-review files
(`7f7fdae0` SE, `2a782ec2` TE, 238 insertions, docs only). The REQ is still at
v0.9 (`165fcf7d`), the version round 6 approved with 0 High. This round therefore
re-derives the document's measured claims against the moved HEAD rather than
re-reading unchanged prose, and re-states the three round-6 Lows that no revision
has yet addressed.

## Round-6 disposition

| Round-6 ID | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-31 (§2's dependent-set sentence still says "two live workflow modules") | Low | **Still open** — no revision landed | `REQ:100` still reads "the release checklist, the skills, two live workflow modules and the instructional docs"; `REQ:481` (R-2) already says "three live workflow modules". Non-gating, carried forward as F-34. |
| F-32 (`CLAUDE.md` moved M-11h→M-11k without M-11h gaining the disambiguating clause) | Low | **Still open** | `pdlc-retirement-baseline.md:63` (M-11h) still says the retired literals are "documented in CLAUDE.md" with no "named only as the documentation site" clause, while `:66` (M-11k) claims `CLAUDE.md` as one of its four swept paths. Ownership recoverable from M-11k's side only. Carried forward as F-35. |
| F-33 (AC-1.2's set-equality stated over nine artifact names, command carries seven alternations) | Low | **Still open** | `REQ:289`–`:295` names three scripts + three bundles + manifest + drift-state + config key; the baseline's normative command at `pdlc-retirement-baseline.md:182` carries seven alternations, the three bundles collapsing into one `\.bundle\.js`. Carried forward as F-36. |

No round-6 finding was High, so nothing was gating; none was retracted either.
All three remain correct at HEAD and all three are still cheap to land as errata
alongside FSPEC authoring.

## Re-derivation at HEAD (`2a782ec2`)

**AC-1.2's seven-term search.** The baseline's normative command
(`pdlc-retirement-baseline.md:182`) run verbatim over `git ls-files` returns
**134** paths at HEAD, against 132 at `fb6e58cf`. The delta is exactly two:
`CROSS-REVIEW-software-engineer-REQ-v6.md` (4 term hits) and
`CROSS-REVIEW-test-engineer-REQ-v6.md` (5 term hits), both inside
`docs/pdlc-plugin-retirement/**` and therefore both owned by A-1's
feature-directory glob (`pdlc-retirement-baseline.md:96`, `:118`). The
unclassified remainder stays **empty** and no path gains a second owner.

**The eight-alternation superset recipe.** The baseline's wider recipe
(`pdlc-retirement-baseline.md:157`, eighth alternation `postWavePathspecs`)
returns **138** at HEAD against 136 at `fb6e58cf` — the same two files. Its
delta over the seven-term set is unchanged at exactly four paths, the four the
baseline names: `.claude/pdlc.config.example.json`,
`pdlc/workflows/__tests__/waveExecution.test.js`,
`pdlc/workflows/__tests__/consolidationPreflight.test.js` (M-11h) and
`pdlc/workflows/dist/consolidate-learnings.bundle.js` (M-10). No new path
entered the superset-only band.

**The empty-remainder pin earned its keep this round.** A-1's feature directory
holds **14** swept files at HEAD, against 12 at `b73fb4de` and 9 at `0e86f11a`.
Every pinned *total* in the baseline (133, 136) is now stale by construction,
exactly as `REQ:106`–`:108` predicted — "A-1's feature-directory glob grows by
one file per cross-review, so the total moves while closure does not." Had
round 5 kept a pinned total as the criterion, this round's two cross-review
commits would have falsified the REQ without any defect existing. The document's
own stated expectation (empty remainder) survives the move untouched.

**Nothing else moved.** `git diff --stat fb6e58cf..HEAD` touches two files, both
under `docs/pdlc-plugin-retirement/`, both new cross-reviews, zero code and zero
constraint files. The engine-suite figure recorded in round 6 (842/840/0/2) has
no diff that could disturb it.
