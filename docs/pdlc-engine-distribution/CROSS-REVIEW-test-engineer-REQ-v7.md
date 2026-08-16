# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 7

**Scope:** delta re-review under decision freeze. Diff is `9406be12..89105eba` on the REQ —
twelve added lines, one sub-bullet under NG-5, nothing else touched. Re-grounded against
`pdlc/skills/se-implement/SKILL.md` HEAD, `pdlc/.claude-plugin/plugin.json` HEAD, the
`engine-v0.1.0` tag, the published npm manifest, and `CODE_REVIEW-…-v1.md` §3 row 3.

## Delta

The delta is a single **recorded exception to NG-5** (`REQ:176-187`), written in response to
CODE_REVIEW v1 §3 row 3, whose required fix was literally "either revert the SKILL.md edit …
bump `plugin.json`'s version and re-record the pairing, **or note the NG-5 exception in the
REQ**". Both halves the note claims were actually done, and every factual claim in it holds at
HEAD. I checked each one against code rather than against the note:

| Claim in the note | Grounding at HEAD | Holds |
|---|---|---|
| `se-implement/SKILL.md` gained the red/green skip discipline in Step-1 items 5–7 and two DoD checklist rows | `SKILL.md:73` (item 5, `.skip` titled with the owning task id, re-run to exit 0), `:74` (item 6, un-skip your own committed blocks first), `:232-233` (two checklist rows). Landed across `93390246` and `6c6f0d1d` | ✅ |
| It is an authoring-role instruction, not a phase-graph / review-bar / completeness / queue / report change | Both commits touch `SKILL.md` prose and `waveImplementPrompt` text only; no phase constant, no `REQUIRED_HEADINGS`, no queue lifecycle, no report key | ✅ |
| It was forced by this feature's own Phase I — the wave gate runs the full suite | `SKILL.md:233` states the mechanism ("one un-skipped failing test halts the wave gate for the whole pipeline"); this matches the wave-gate design the feature shipped | ✅ |
| Plugin version of record bumped 0.23.0 → 0.23.1 | `pdlc/.claude-plugin/plugin.json:4` = `0.23.1`, bumped in `89105eba` — the same commit as this REQ edit | ✅ |
| …inside the engine's declared `^0.23.0` | `pdlc/engine/package.json:18` = `"pdlcPluginCompat": "^0.23.0"`; 0.23.1 satisfies it | ✅ |
| The `engine-v0.1.0` pairing records `pluginVersionAtTag: 0.23.0` and is immutable | `git show engine-v0.1.0:pdlc/.claude-plugin/plugin.json` = `0.23.0`; `npm view @kaneho/pdlc-engine@0.1.0 pdlcPairing` returns `pluginVersionAtTag: '0.23.0'`, tag `engine-v0.1.0` | ✅ |
| That skew is R-3's axis | `REQ:495-502` — R-3 is exactly "skills edited between releases skew against the installed plugin's copy" | ✅ |

I also ran `node pdlc/workflows/build-runtime.mjs --check` (exit 0, five rows in sync), because
the bump commit also rewrote `distribution-manifest.json`: the version stamped in the manifest
moved with the plugin, so the bump did not leave the generated-artifacts gate red.

Nothing outside the NG-5 bullet moved. Document is 625 lines / 52,627 bytes — inside the
700-line / 60 KB REQ budget, so `check-req-size` stays quiet.

## Findings

No High findings. The delta introduced no defect in any acceptance criterion or oracle; it adds
no criterion at all, and it contradicts nothing at HEAD. `F-01` is a documentation-integrity gap
the delta itself introduced, but it is not load-bearing for any mechanism (approval staleness is
computed from byte hashes and `UPSTREAM-STATE`, never from the `Version` cell), so it does not
gate. `F-02`…`F-05` are carried from v5/v6, re-verified untouched by this delta, and re-recorded
so a targeted round does not quietly retire them. None are re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The delta landed without a version bump or changelog line, so the header now dates the document before its own newest content.** The metadata row (`REQ:18`) still reads `0.11 | 2026-08-14`, while the added bullet is dated `2026-08-16` in its own first words. Every prior substantive edit in this document opened a changelog paragraph (`REQ:20-25` for 0.11, `:27-32` for 0.10) — that is the document's own convention and DEC-ERR-01's accounting expectation. Nothing mechanical breaks (anchors pin bytes, not the cell), but a reader diffing "what changed since the version I approved" is told nothing changed. One row bump to `0.12 | 2026-08-16` plus a one-sentence changelog paragraph naming CODE_REVIEW v1 §3-3 as the cause closes it. | Metadata row; changelog |
| F-02 | Low | Local | **"Step-1 items 5–7" over-names the changed range by one item.** Item 7 (`SKILL.md:75`, "Update task status in the PLAN to 🔴") was only *renumbered* by `93390246`, never rewritten; the skip discipline lives in items 5 and 6. The REQ is faithfully transcribing CODE_REVIEW v1 §3-3's own `:70-77` line range, so this is inherited, not invented — and as a line range it is accurate. Worth a word only because someone auditing "which instruction changed" will read item 7 looking for a change that is not there. | NG-5 exception |
| F-03 | Medium | Local | **Carried from v5 F-01 / v6 F-02, unchanged at HEAD: NG-6's load-bearing half — that install and upgrade *read* nothing in a consumer project — still has no falsifiable carrier.** C-2 (`REQ:196-198`) and AC-2.3 observe only that the working tree and index are unchanged; a read leaves both clean, so an install that quietly parsed `.claude/pdlc.config.json` passes. One clause in NG-6 or AC-2.3 naming the locus turns an unassertable promise into a structural one. | NG-6; C-2; AC-2.3 |
| F-04 | Medium | Local | **Carried from v5 F-02 / v6 F-03, unchanged at HEAD: AC-3.5's positive half — "the release is cut" — still names no observable, and the downstream carrier is a stub.** FSPEC AT-3.5 is a stub-channel publish with a sentinel credential; that proves the workflow authenticated *to the stub*, and cannot falsify a mis-wired real secret name. Either state the observable in AC-3.3's existing vocabulary ("the published bytes for version N exist and the run's own output names N"), or accept it as discharged by the stub and say so. | AC-3.5(a); C-8; FSPEC AT-3.5 |
| F-05 | Low | Local | **Carried from v5 F-03 / v6 F-04, unchanged at HEAD: AC-3.5(b) states a stronger obligation than the downstream carries.** "Fails the publish step **naming the missing secret**" requires a preflight guard; an unset GitHub secret expands empty and `npm publish` fails with a registry auth error that names no secret at all. The REQ is at the right altitude; the movement belongs in FSPEC E-18 and AT-3.5. | AC-3.5(b); FSPEC E-18, AT-3.5 |
| F-06 | Low | Cross-Feature | **Carried from v6 F-05, unchanged at HEAD: T-7 cites M-ENG-10 as if it were a gate.** `docs/_constraints/pdlc-engine-baseline.md:188` is a point-in-time measurement; nothing asserts it. One sentence in the baseline row marking it seed-only and non-authoritative fixes it wherever a REQ cites it. | T-7; AC-3.4; M-ENG-10 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The note says "the next engine tag records 0.23.1" — true if the next tag is cut from a commit at or after `89105eba`, which `publish-preflight.mjs:389` reads live from `plugin.json`. Is anything in Phase PUB's own checklist required for that, or is it automatic by construction? I read it as automatic; recording the reading so nobody later treats the sentence as an unowned obligation. |
| Q-02 | Carried from v6 Q-01/Q-02, still open and now three rounds old: FSPEC §5.2's closing paragraph quotes REQ AC-1.3 back in wording that no longer exists (`FSPEC:524-525`), and FSPEC F-3 step 5 (`FSPEC:171-172`) still ends "NG-6's own wording is an erratum for the REQ, not fixed here" — REQ v0.10 fixed it. Both are stale quotations, not contradictions. Can they be picked up in FSPEC's own next pass? |

## Positive Observations

- **The exception is recorded where an exception is falsifiable, not where it is convenient.**
  NG-5 says "this feature moves bytes, not behaviour"; a SKILL.md edit is behaviour. Putting the
  admission inside NG-5 itself means a future reader auditing NG-5 meets the exception in the
  same breath as the rule, instead of discovering it as an unowned diff — which is precisely
  what CODE_REVIEW v1 §3-3 flagged.
- **Both halves of the remedy landed together, in one commit.** `89105eba` carries the REQ note
  *and* the `plugin.json` bump *and* the regenerated `distribution-manifest.json`. A note
  claiming a bump that had not happened would have been the worse failure mode; here the claim
  and the fact share a commit, and `build-runtime.mjs --check` is green on the result.
- **The immutability sentence is exactly right and easy to have got wrong.** The tempting move
  is to "fix" the published `pluginVersionAtTag: 0.23.0`. The note instead says the published
  pairing remains an accurate record of what the tag was cut against, and lets the next tag
  carry 0.23.1. That is the only reading that keeps provenance honest, and I verified both the
  tag tree and the npm manifest still say 0.23.0.
- **The round stayed a round.** Twelve added lines, one bullet, no AC touched, no criterion
  invented, no adjacent wording opportunistically improved. Under a decision freeze that is the
  behaviour that makes convergence possible.

## Summary

The delta does one thing and does it accurately: it records the NG-5 exception CODE_REVIEW v1
§3-3 required, and it records that the plugin's version of record was bumped alongside the
skill edit so changed bytes no longer ship under a version number that already named different
bytes. I checked every factual claim in the note against code, the tag tree and the published
npm manifest rather than against the note's own narrative; all seven hold. No acceptance
criterion was added, weakened or made unsatisfiable, and nothing outside the NG-5 bullet moved.

No High finding is open. `F-01` is a Medium the delta itself introduced — a substantive edit
without the version bump and changelog paragraph the document's own six prior revisions all
carried — but nothing mechanical reads that cell, so it is recorded, not gating. `F-02` is a
one-item over-naming inherited verbatim from the upstream finding. `F-03`…`F-06` are carried,
re-verified untouched, and about assertability rather than correctness.

DEFERRED: bump the metadata row to `0.12 | 2026-08-16` and add the matching changelog paragraph naming CODE_REVIEW v1 §3-3 as the cause.
DEFERRED: narrow "Step-1 items 5–7" to "items 5–6" if the NG-5 note is ever revised for another reason.
DEFERRED: give NG-6's read half a structural carrier (F-03) and let FSPEC's own pass move E-18/AT-3.5 up to AC-3.5(b)'s strength (F-04, F-05).
DEFERRED: mark M-ENG-10 seed-only in `docs/_constraints/pdlc-engine-baseline.md` (F-06).
DEFERRED: refresh FSPEC §5.2's and F-3 step 5's stale quotations of superseded REQ wording (Q-02).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 3}
