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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-34 | Low | Local | **Inherited, unaddressed: one stale banner count survives in §2.** `REQ:100` still reads "the release checklist, the skills, **two** live workflow modules and the instructional docs", while `REQ:481` (R-2), `REQ:91`–`:92` (§1.2's M-11o gloss), C-5 (`REQ:226`) and O-5 (`REQ:559`–`:560`) all now say three. Three identical banners exist in the tree — `pdlc/workflows/orchestrate-queue.js:5`–`:6`, `orchestrate-dev.js:5`–`:6`, `consolidate-learnings.js:5`–`:6` — so "two" is the one uncorrected copy of a count the rest of the document already fixed. Fix: "three". | §2 (dependent-set paragraph, `REQ:100`) |
| F-35 | Low | Local | **Inherited, unaddressed: M-11h names `CLAUDE.md` without the disambiguating clause it uses for `orchestrate-dev.js`.** `pdlc-retirement-baseline.md:63` still says the retired wave-gate literals are "documented in CLAUDE.md", while `:66` assigns `CLAUDE.md` to M-11k as one of its four swept paths. M-11h already carries the right sentence pattern for the other shared path — "`orchestrate-dev.js` is owned by **M-11o** … and named here only as the mechanism's location, so no path has two owners" (`:63`) — but no counterpart for `CLAUDE.md`. Measurement backs M-11k (per-row line `:115` gives M-11h 3, M-11k 4) and reports zero multi-owned paths, so this is prose only. Fix: one clause in M-11h saying `CLAUDE.md` is named as the values' documentation site and owned by M-11k. | `docs/_constraints/pdlc-retirement-baseline.md:63` / `:66` |
| F-36 | Low | Local | **Inherited, unaddressed: AC-1.2's set-equality is stated over artifact names, the normative command over alternations, and the two do not map 1:1.** `REQ:289`–`:295` states the term set as nine named things (three retired scripts, three retired bundles, `distribution-manifest`, the drift-state record, `distribution.checkEnabled`), and requires the FSPEC to transcribe "both the literal term list and the literal expected-empty command". The command it must transcribe (`pdlc-retirement-baseline.md:182`) carries **seven** alternations, because the three bundles are reached by the single generic `\.bundle\.js`. An FSPEC author transcribing the prose literally as `orchestrate-dev.bundle.js\|orchestrate-queue.bundle.js\|consolidate-learnings.bundle.js` writes a nine-alternation command that is *not* the measured one, and the 134/empty result is only re-derivable under the seven-alternation form. Fix: one sentence in AC-1.2 saying the nine names are the set's *membership* and the seven alternations are its *expression*, the three bundles collapsing into `\.bundle\.js`. | AC-1.2 (`REQ:289`–`:303`) |

FINDING: Low | inherited | nonlocal | §2 dependent-set paragraph (`REQ:100`) | "two live workflow modules" is the last uncorrected copy of a count the rest of the document moved to three; three identical banners exist at `orchestrate-{dev,queue}.js:5`–`:6` and `consolidate-learnings.js:5`–`:6`
FINDING: Low | inherited | nonlocal | `pdlc-retirement-baseline.md:63` / `:66` | the per-row reassignment of `CLAUDE.md` from M-11h to M-11k landed in M-11k's text only; M-11h still names `CLAUDE.md` without the "named here only as the location" clause it already gives `orchestrate-dev.js`
FINDING: Low | inherited | nonlocal | AC-1.2 (`REQ:289`–`:303`) | set-equality is stated over nine artifact names while the normative command carries seven alternations (three bundles → one `\.bundle\.js`), so a literal transcription of the prose yields a command that is not the measured one

## Questions

| ID | Question |
|----|---------|
| Q-01 | The REQ is unchanged since round 6 and carries no open High across two consecutive rounds. Is a further REQ review round intended, or should F-34/F-35/F-36 be routed as errata alongside FSPEC authoring, as round 6 recommended? |

## Positive Observations

- **The empty-remainder pin was tested by accident this round and held.** Two
  cross-review commits pushed A-1's feature-directory glob from 12 files to 14
  and the sweep total from 132 to 134. Every pinned *total* in the baseline is
  now stale; the REQ's stated expectation is not, because `REQ:106`–`:108`
  pinned the closure property rather than the number. That is the difference
  between a criterion that survives its own review process and one that does not.
- **The lower-bound framing keeps doing work.** §1.2's insistence that the sweep
  is a lower bound, not the definition of the dependent set (`REQ:109`–`:113`),
  is what makes a growing total harmless: M-11c and `.worktreeinclude` return
  zero sweep hits and are still inventory rows, so the inventory does not track
  the sweep's arithmetic in either direction.
- **The superset-only band is stable.** The four paths the eight-alternation
  recipe reaches and the seven-term set does not are the same four the baseline
  names, unchanged across three rounds of measurement. Nothing has drifted into
  the band where a retired *value* could be mistaken for a retired *name*.

## Recommendation

**Approved with minor changes**

The REQ did not change since round 6, and its measured claims re-derive at the
moved HEAD: the seven-term search returns 134 with an empty remainder, the
superset recipe returns 138 with the same four-path delta, and the two paths
added since `fb6e58cf` are this feature's own round-6 cross-reviews, both owned
by A-1. No High finding is open, and none has been open since round 5. The three
Lows carried forward are one stale word, one missing disambiguating clause and
one prose/command mapping — none blocks FSPEC authoring, and all three land more
cheaply as errata than as another REQ round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

APPROVAL-HASH: sha256:2ace5ac89e8b95905b901cdf564c1053e7c0708d865e1c7ad8cdcb1a9ece942d
APPROVAL-HASH-NORMALIZED: sha256:7a9dae39edbc72085f05c1917a4af59044b9030d18a2b78e46246e99383731c5
REVIEWED-COMMIT: 2a782ec29612fffef24936ccb7cfbeb0d7744955
