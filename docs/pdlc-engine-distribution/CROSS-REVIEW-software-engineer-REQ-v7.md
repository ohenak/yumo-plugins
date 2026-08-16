# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 7 (delta re-review, frozen round)
**Scope:** Delta only. Diff base `01c27ee4` (the commit v6 reviewed) → HEAD.
`git diff 01c27ee4..HEAD -- REQ` is **+12 / -0**: one new sub-bullet under NG-5 recording the
`se-implement` SKILL.md exception and the plugin version bump. Nothing else in the file moved.
Engineering lens only: are the delta's factual claims true at HEAD.

## Delta claim verification (every claim in the new bullet, checked against HEAD)

| Claim in the new NG-5 sub-bullet | Verdict at HEAD | Evidence |
|---|---|---|
| `pdlc/skills/se-implement/SKILL.md` gained red/green skip discipline at Step-1 items 5–7 | **True** (items 5 and 6 are new text; item 7 is the pre-existing "status → 🔴" renumbered — the changed hunk is exactly `5–7`) | `pdlc/skills/se-implement/SKILL.md:73-76`; `git diff $(git merge-base main HEAD)..HEAD -- pdlc/skills/se-implement/SKILL.md` = +5 / -3 |
| "and two DoD checklist rows" | **True** — one row rewritten (`zero skipped` → sanctioned-skip predicate), one row added | `SKILL.md:232-233` |
| It is an authoring-role instruction, not a phase graph / review bar / completeness criterion / queue lifecycle / report-shape change | **True as stated for SKILL.md.** The enforcement half, `checkWaveUnskips`, is **not** new on this branch — it is present in the merge-base and on `main` (from #50), so no gate was added here | `git show $(git merge-base main HEAD):pdlc/workflows/orchestrate-dev.js \| grep -c checkWaveUnskips` → 2; same on `main` |
| Forced by this feature's own Phase I: the wave gate runs the full suite | **True** — the wave gate is unconditional full-suite green; a later-owned red block would halt it | `pdlc/workflows/orchestrate-dev.js:9597-9600` (doc comment on `waveImplementPrompt`) |
| `pdlc/.claude-plugin/plugin.json` 0.23.0 → 0.23.1 | **True**, and it is the branch's own commit | `pdlc/.claude-plugin/plugin.json:4` = `0.23.1`; commit `89105eba` |
| …inside the engine's declared `^0.23.0` | **True** — 0.23.1 satisfies `^0.23.0` | `pdlc/engine/package.json:18` = `"pdlcPluginCompat": "^0.23.0"` |
| The pairing published in `engine-v0.1.0` records `pluginVersionAtTag: 0.23.0` | **True** — the tag's tree carries plugin 0.23.0, and the field is read from that manifest | `git show engine-v0.1.0:pdlc/.claude-plugin/plugin.json` → `0.23.0`; `pdlc/engine/scripts/publish-preflight.mjs:385-392` (`buildPairingRecord(manifest, pluginVersion, …)`) |
| …and is immutable; the next engine tag records 0.23.1 | **Consistent** — the record is tag-time-derived, so the next tag reads plugin.json at that time | same, `publish-preflight.mjs:380-389` |
| "that skew is R-3's axis" | **True** — R-3 is exactly "skills edited between releases skew against the installed plugin's copy… the plugin version itself is not bumped by the edit" | `REQ:495-503` |
| Routed item provenance: CODE_REVIEW v1 §3-3 asked for "bump `plugin.json`'s version and re-record the pairing, and note the NG-5 exception in the REQ" | **Satisfied** — both halves landed | `CODE_REVIEW-pdlc-engine-distribution-v1.md` §3 row 3 |

Nothing in the delta is false at HEAD. The routed CODE_REVIEW item is discharged in the
document, not merely promised.

## Findings

Two Medium, both introduced by (or adjacent to) this delta; neither blocks. Carried Lows
unchanged and unre-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-30 | Medium | Local | **The delta added 12 lines of substantive text under version 0.11 without bumping the Version cell or adding a changelog entry.** The header still reads `0.11 \| 2026-08-14` (`REQ:18`) while the new bullet is dated 2026-08-16, and the 0.11 changelog paragraph ends "No other change" (`REQ:25`) — a sentence the delta falsifies. Every prior round of this document bumped-and-recorded. This is the document-level instance of the very skew the new bullet argues against for the plugin: one version number now names two different byte sets. Approval staleness is byte-hash-based so nothing breaks mechanically, but `DEC-ERR-01`'s upstream re-grounding step diffs the `Version` cell to detect movement, and that signal is now silent for this edit. One-line fix on the next pass: bump to 0.12 with a one-sentence changelog entry naming the NG-5 exception; no other text needs to move. | Header table `REQ:16-18`, changelog `REQ:20-25`, NG-5 `REQ:173-186` |
| F-31 | Medium | Cross-Feature | **The recorded exception names one file; the same convention also landed in the workflow runtime's dispatch prompt in the same commit, and that half is unrecorded.** Commit `93390246` changed `waveImplementPrompt` in `pdlc/workflows/orchestrate-dev.js:9603-9628` (new `PLAN:` line, new `SKIPS:` clause stating both halves of the convention), rebuilt the bundles, and bumped plugin 0.22.7 → 0.22.8. Its character is identical to the SKILL.md half — agent-facing instruction text, no new gate (`checkWaveUnskips` predates the branch) — so the note's reasoning holds for it verbatim; what does not hold is the phrase "**One** recorded exception". CODE_REVIEW §3-3 cited only `SKILL.md:70-77,229-233`, so the delta fully discharges the item as routed and I am not re-opening it here. Remedy when the document next moves: extend the same bullet with "and `waveImplementPrompt`'s dispatch text (`orchestrate-dev.js:9603-9628`)". | NG-5 exception `REQ:173-186` |
| F-29 | Low | Local | *(carried from v6, untouched by this delta)* AC-1.3's per-class counts are "stated in FSPEC", but the licence class is `0` or `1` depending on an operator decision recorded in a third document (`FSPEC:503`, `:509-511`; O-8(3)/N-2). Naming the discriminator where PROPERTIES/TSPEC will read it avoids a surprise at PF-4 fixture time. | AC-1.3 |
| F-25 | Low | Local | *(carried from v4)* AC-3.4's local-expansion claim binds `matrix.os` × `matrix.node`; owner is FSPEC §5.1, not REQ. | AC-3.4 |
| F-27 | Low | Local | *(carried from v5)* AC-3.5(b)'s "naming the missing secret" needs a deliberate preflight step; `npm publish` without `NODE_AUTH_TOKEN` names the registry, not the secret. FSPEC F-5's cost note, not a REQ edit. | AC-3.5 |
| F-28 | Low | Local | *(carried from v5, now two rounds staler)* `FSPEC:172-173` still says NG-6's wording is an erratum against REQ; NG-6 was fixed in REQ v0.10. One-line deletion on FSPEC's next pass. | FSPEC-side |
| F-26 | Low | Local | *(carried from v4)* `pdlc-engine-baseline.md:209`'s change-control sentence inside M-ENG-10 is unchanged. Constraints-file fix; nothing wrong in REQ. | Constraints |

DEFERRED: bump the Version cell to 0.12 with a changelog line for the NG-5 exception (F-30) on the document's next authored pass.
DEFERRED: extend the NG-5 exception bullet to name `waveImplementPrompt`'s dispatch-text half in `pdlc/workflows/orchestrate-dev.js` (F-31).

## Questions

| ID | Question |
|----|---------|
| Q-05 | *(carried, unanswered; no text changed on it this round — and now partly self-answering)* This delta is the first observed instance of the cadence question: a plugin **patch** bump inside `^0.23.0` needed no engine republish. The open half is still the **minor** case — a prompt-only plugin minor would put the installed engine outside `pdlcPluginCompat` and trip AC-1.1's refusal until an engine republish lands. Is "republish the engine on a plugin minor" the accepted operating cost, or is O-6's per-release range-widening the intended relief? |
| Q-06 | *(carried)* AC-5.6's `PDLC_PLUGIN_ROOT` / `REMEDY` dev-mode plugin-root behaviour. |
| Q-08 | *(carried)* O-9's carrier for the bundle-side load-root observation. |

## Positive Observations

- **The note records the exception where the exception is enforceable, not where it was
  convenient.** NG-5 is the claim the SKILL.md edit falsified, and the exception now sits
  as a child bullet of NG-5 itself rather than in a changelog line a future reader of §3
  would never reach. A non-goal that carries its own exception list stays a usable gate;
  one whose exceptions live elsewhere quietly stops being one.
- **The version bump is the substantive half, and it is real.** The cheap resolution of
  CODE_REVIEW §3-3 was prose — "we acknowledge the skew". Instead `plugin.json` moved
  0.23.0 → 0.23.1 (`89105eba`), which is the only action that actually restores the
  invariant that a plugin version names one byte set. The bump also lands *inside* the
  engine's declared `^0.23.0`, so it costs no engine republish and cannot trip AC-1.1 —
  the cheapest point in the version space at which the fix was available.
- **It resisted rewriting history.** The note states the published `engine-v0.1.0` pairing
  is immutable and remains an accurate record of what the tag was cut against, rather than
  claiming the skew never happened. That is the correct reading of a provenance record: a
  tag-time observation, not a running assertion about current bytes.
- **The reasoning is checkable, and it checks out.** Every load-bearing sentence in twelve
  new lines resolves to a file I could open: the compat range, the tag's plugin version, the
  pairing field's source, the SKILL.md hunk boundaries, R-3's text. `checkWaveUnskips`
  predating the branch is the load-bearing fact behind "not a completeness criterion", and
  the note is right about it.

## Recommendation

**Approved with minor changes.**

The delta is +12 lines of prose under NG-5. Every factual claim in it is true at HEAD:
plugin 0.23.1 inside `^0.23.0`, `engine-v0.1.0` cut at plugin 0.23.0, the SKILL.md hunk as
described, `checkWaveUnskips` pre-existing so no gate was added, R-3 as the named skew axis.
The routed CODE_REVIEW v1 §3-3 item is discharged in full, both halves. No High finding is
open, old or new. Two Mediums (F-30 document version-cell/changelog omission, F-31 the
unrecorded runtime-prompt half of the same convention) are recorded as DEFERRED for the
document's next authored pass — neither falsifies a requirement, breaks an oracle, or was in
this round's routed item set, and the freeze forbids opening them as blockers. Five carried
Lows are unchanged and none requires a REQ edit.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 5}
