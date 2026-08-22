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

_(pending)_

## Data Model

_(pending)_

## Test Strategy

_(pending)_

## Open Questions

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
