# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.2)
**Date:** 2026-08-21
**Iteration:** 5 (round 3 erratum — delta confirmation)
**Scope:** Local
**Erratum edit under confirmation:** `0c70e900..b4a628b8`

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v4; a targeted erratum
edit has since landed (four commits, `0c70e900..b4a628b8`, +26/-7 lines in the TSPEC). I read the
diff, re-derived every factual claim it touches against `origin/main` at `345ae358`, and re-read the
upstream text the changed sections now lean on at its current version.

Upstream integrity check first (DEC-ERR-03). Both upstream hashes in the dispatch match the bytes on
this branch:

| Upstream | Dispatch hash | Measured `shasum -a 256` | Match |
|---|---|---|---|
| `REQ-pdlc-wave-resume.md` | `17e83bfc…` | `17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f` | yes |
| `FSPEC-pdlc-wave-resume.md` | `9a6be7b5…` | `9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e` | yes |

Every routed item landed. Two of the landings are exact and independently re-measured (the file-size
claim in RT-1; the seam-cost claim in DEC-WVR-02); two are correct in substance but carry a residual
imprecision of their own, and those are this round's two findings — both **Low**, both **delta**,
both **local**, neither gating.

Routed-item ledger:

| # | Routed item | Landed | Verified how |
|---|---|---|---|
| 1 | §3.1 / §6.1 "four of the seven interpolate" off-by-one | yes | Re-derived from the shipped renderers on `origin/main`; see §Data Model. Residual: F-01. |
| 2 | §6.4 RT-1 "the single largest file in the repo" | yes | `git ls-tree -r -l origin/main \| sort -k4 -nr` — byte counts match to the digit. |
| 3 | §2.4 announcement table omits the invalid-`startWave` notice | yes | Exclusion row added and named. Residual: F-02. |
| 4 | §2.4 catalogue closed **by rule**, not by omission | yes | Rule stated as a blockquote before the exclusion row. Residual: F-02. |
| 5 | §6.1 DEC-WVR-02 alternative (b) "adds a runtime capability" | yes | `_git: rtGit` binds in **both** adapter bundles on `origin/main`. |
| 6 | §3.2 duplicated clause "on the decision on the decision" | yes | Clause removed; no other occurrence remains in the TSPEC. |

Nothing I previously approved is broken. The edit is additive prose plus three corrected sentences;
it touches no interface, no type, no acceptance test, no oracle, and no batch or ownership claim.

## Architecture

### §2.4 — the announcement catalogue, closed by rule (routed items 3 and 4)

The edit adds the rule and one exclusion row. I confirmed the mechanics the row asserts, against
`origin/main` rather than against the document:

- The notice text is quoted correctly. `orchestrate-dev.js:15185-15189` emits
  `` `Notice: implementation.${key} in ${MERGE_CONFIG_PATH} is not a valid value — using the default.` ``
  for every member of `implParsed.invalidKeys`, and `parseImplementationConfig` (`:235-242`) pushes
  `"startWave"` when the value is not an integer `>= 1`.
- The **ordering** claim holds, and it is the load-bearing half of the exclusion. The
  `invalidKeys` loop runs at wave-mode entry, immediately after `parseImplementationConfig`; the
  resume-pointer chain (`:15228` onward) and the ledger chain (`:15297` onward) both run strictly
  later. So this notice is genuinely emitted by config validation *before* any resume decision
  exists, exactly as the row says.
- The **assertion-count** claim holds, and this is what I care about most, because it is the claim
  the implementation wave will be measured against. The one shipped assertion that pins this notice
  is inside `it("an invalid pointer degrades to wave 1 and is named in the run's notices")`
  (`waveExecution.test.js:2169-2188`), and it is `expect(logs).toContain(<exact string>)` — array
  element equality. Since the notice gains no suffix, that assertion stays green untouched, so
  "the shipped assertions that do change remain exactly three" survives the addition of this row.
  The same fixture drives a run with `git: makeGit([])` and no ledger, i.e. the silent IG-6 path,
  which is precisely the "ordinary automatic run" the row's last sentence describes. Good.
- The neighbouring negative at `:2164` — `expect(logs.some(m => m.includes("implementation.startWave"))).toBe(false)` —
  belongs to the *absent-key* test, whose run emits no resume announcement at all, so the appended
  suffix cannot reach it either. The v4 enumeration of unaffected matchers is unchanged.

Where the edit is imprecise is the **rule itself**, and only in its second conjunct. The rule reads:

> A notice carries a provenance token **iff** the resume decision emits it about a *resolved start
> point* — the wave this run actually begins at, and where that start point came from.

Applied to the table's own first row — the past-the-end pointer notice, which *does* carry
`(provenance: operator-set)` — the second conjunct does not discriminate. That pointer is rejected
and clamped (`startWave = 1`, `:15237-15242`) just as the invalid value is rejected and defaulted;
both runs then begin at wave 1. The Why column leans on exactly that non-discriminating half ("it is
about a **rejected value**, not a resolved start point"), which would exclude the past-the-end
notice too if a reader applied it mechanically. The conjunct that actually does the work is the
first one — *the resume decision emits it* — and it settles both rows correctly, including the
un-named `sectionMalformed` notice, which is why I read the catalogue as genuinely closed and file
this as **Low** rather than as a gap in the closure. It is a wording fix in the Why column, not a
change to any row, any token, or any count. **F-02.**

### §6.1 DEC-WVR-02 — the seam-cost claim (routed item 5)

Re-measured and correct as revised. On `origin/main`, `runtime-adapter.js` defines `rtGit` at
`:1003` and binds `_git: rtGit` at **both** `:1162` and `:1202` — the two bundle option objects — so
the ancestry probe already runs through an existing, already-bound seam. Extracting it would widen
`classifyWaveLedger`'s signature and add one adapter binding; it would not add a host dependency.

This is also the more faithful reading of upstream. REQ C-3 (`REQ:214-216`) constrains the work to
"the workflow runtime's existing capability envelope (injected-seam IO, no new host dependencies)".
The pre-edit text claimed the alternative *contradicted* C-3 — which was too strong, since a new
`main()` parameter on an already-bound seam is not a new host dependency. The revised text drops
that contradiction and rests the rejection on cost-without-benefit against §3.4's structural
discharge instead. §3.4's own table already lists `_git … resolved through branchGuardTransport` as
pre-existing and asserts "the diff adds no parameter to `main()` and no capability to the runtime
adapter", so the two sections are now consistent where before one overstated the other.

## Interfaces

No interface changed in this edit, and I confirmed that rather than assuming it.

- §3.1's exported catalogues (`RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `WAVE_IGNORE_REASONS`) and the
  `WaveIgnoreCode` union are byte-identical across the diff. The edit rewrote only the prose
  paragraph beneath the code block. The seven codes, and the comment attributing three of them to
  IG-1's arms, are unchanged — so the OB-F5 set-equality transcription obligation is untouched.
- §3.2's return shape, `ReasonContext`, and the classification order table are unchanged apart from
  the deleted duplicated clause. The clause deletion is a pure prose repair: the surrounding
  sentence still names `lastGreenWave`'s reader and still points at §5.4 AT-01 as the assertion that
  pins the per-wave skip line for every `k < N`. The reader-existence argument — a field with no
  reader would be unfalsifiable — survives intact, which is the part I approved.
- §3.4's seam table is unchanged, and its "no new seam is introduced" claim is now the sole home of
  the C-3 discharge, with DEC-WVR-02 deferring to it rather than re-arguing it. That is the right
  direction of dependency.
- §3.5 still closes the configuration surface at four keys including `startWave`, which matches
  `parseImplementationConfig`'s post-edit shape on `origin/main` (`testCommand`, `postWaveCommand`,
  `postWavePathspecs`, `startWave`). AT-08's set-equality over recognised keys is unaffected.

## Data Model

The record shape (§4.1, four-or-five fields) is untouched by this edit. The one data-model-adjacent
claim the edit rewrote is §3.1's interpolation count, and it is where my first finding sits.

I re-derived the renderers from the shipped chain on `origin/main` (`:15297-15316`) and from
`parseWaveLedger` (`:12277-12294`):

| Code | Shipped renderer | Interpolated values |
|---|---|---|
| `unreadable-json` | `it is not readable JSON` | 0 |
| `not-an-object` | `it is not a JSON object` | 0 |
| `wrong-shape` | `its fields are not the shape this workflow writes` | 0 |
| `feature-mismatch` | `it records feature "${recorded.feature}", not "${featureName}"` | **2** |
| `plan-changed` | `the PLAN's wave layout has changed since it was written` | 0 |
| `head-unreachable` | `the commit it records (${String(recorded.head).slice(0, 12)}) is not an ancestor of HEAD — …` | 1 |
| `over-count` | `it records ${recorded.lastGreenWave} wave(s) green and this plan has only ${waves.length}` | 2 |

The corrected headline — **three** of the seven interpolate, and they are exactly
`feature-mismatch`, `head-unreachable`, `over-count` — is right, and it is the figure the
DEC-WVR-06 rejection argument actually needs. The routed off-by-one is resolved.

The *replacement* figure is now off by one in the other direction. The edit says those three carry
"four interpolated values between them (the recorded feature name, the recorded commit's short sha,
and the recorded and actual wave counts)". The `feature-mismatch` sentence interpolates **two**
values, not one: the recorded feature *and* the run's own `featureName`. The document cannot exclude
the second on the grounds that the test knows it, because it applies the opposite rule one clause
later — it counts `over-count`'s `waves.length`, which the test knows just as well, and says so
explicitly ("both of which the `over-count` sentence names"). Counted consistently, the total is
**five**. §6.1's DEC-WVR-06 row repeats the same figure ("four values in total, §3.1"), so the fix
is two edits, as the original off-by-one was.

This is **Low** and non-gating: the argument DEC-WVR-06 rests on is "some reasons interpolate, so
set equality over rendered sentences asserts fixture data", and that argument is carried entirely by
the *reasons* count, which is now correct. No oracle, no catalogue, no assertion depends on the
value count. I file it because this erratum round exists to retire exactly this class of arithmetic
claim, and leaving a fresh one in the sentence that fixed the old one is worth one line. **F-01.**

## Test Strategy

The testing lens is what this confirmation is for, so I checked the edit against the three things
that could have quietly moved a test obligation. None did.

1. **The "three shipped assertions that do change" count is still exact.** §2.4's subsection names
   three whole-string-equality assertions (`:2137-2141` past-the-end notice, `:2652-2657` the
   four-member `it.each` ignored-record notice, `:2117-2118` the `phaseDetail` equality). The
   invalid-`startWave` notice added to the discussion in this edit is pinned by a fourth
   whole-string assertion at `:2186` — and that one does *not* change, because the exclusion means
   no suffix reaches it. Had the erratum resolved the other way (token on that notice), the count
   would have become four and RT-3's residual-risk argument would have needed rewriting. It didn't,
   and it doesn't. This is the single most consequential thing the edit could have broken, and it
   is intact.
2. **No matcher is relaxed and no oracle weakened.** The three constraints beneath §2.4's table
   ("no matcher is relaxed", "no other assertion in the ledger `describe` changes", "the diff is one
   task") are unchanged bytes. The four prefix matchers and two `startsWith(...) === false`
   negatives enumerated there remain unaffected by an appended clause, which I re-checked against
   the current test file at `origin/main`.
3. **AT-01/AT-03/AT-11's oracles are untouched.** The §3.2 clause deletion did not disturb the
   sentence naming AT-01 as `lastGreenWave`'s falsifying reader, and DEC-WVR-08's lazy-probe
   rejection argument — including the observation that the shipped ancestry test asserts
   `toContainEqual`, i.e. containment, so an extra `merge-base` call would be unfalsifiable — is
   unchanged, as is RT-2's reliance on AT-03/AT-11's call-count equality oracles. The falsifiability
   posture I approved at v4 is preserved exactly.

One positive worth recording: the DEC-WVR-02 rewrite makes the rejected alternative's cost
*testable* rather than rhetorical. "Adds a runtime capability" was a claim no test could ever red;
"widens the classifier's signature and its fake surface" is a claim a reviewer can check against
the seam table. That is the direction reviewer-facing prose should move.

## Open Questions

None. No question from v4 is reopened by this edit, and the two findings below are wording repairs
with no downstream obligation — neither changes PROPERTIES, the PLAN's task set, or any batch edge.

Assumption stated for the record: this confirmation measures the TSPEC against `origin/main` at
`345ae358`, which is what the document's own citations are pinned to. The working tree on this
branch is behind that base (the tree's `orchestrate-dev.js` predates `implementation.startWave`
entirely), so every code claim above was re-derived from `git show origin/main:…`, never from the
checked-out file. That is RT-1's rebase risk showing up in review, exactly as RT-1 predicts; it is
not a defect in the document.

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
