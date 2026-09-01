# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 7 (upstream-cascade confirmation — PLAN erratum round 5)
**Scope:** Local

## Overview

Upstream-cascade confirmation, not a re-review. PROPERTIES' own bytes are unchanged since my v6
approval — `sha256:02fc6fbf76cb68d3510e0cf2a58ffbb9ddcb8b75c858312ae9ce5addc72f1531`, byte-identical
to the `APPROVAL-HASH` v6 recorded. The single question in front of me: does PROPERTIES still hold
against PLAN as it now stands?

**What moved.** My v6 pinned `UPSTREAM-STATE: PLAN sha256:6ab4d081…`, which is PLAN at `e6f18c5a1`
(v1.3). PLAN at HEAD is `sha256:64d8f1c5…` (v1.4) across two commits, `5d1c6e27e` and `b8a2a3230`.
`git diff e6f18c5a1..HEAD -- docs/pdlc-stats/PLAN-pdlc-stats.md` is **+7 / −2**, confined to three
places: the version header and a new v1.4 changelog paragraph; the §Batches preamble; and the T-10
row. No batch moved, no dependency edge moved, and the File Ownership Manifest is untouched.

**A pin I have to account for before answering.** My v6 also pinned
`UPSTREAM-STATE: TSPEC sha256:7b119eb7…`, but TSPEC at HEAD is `sha256:f32d9cb5…` (v1.8). That is
not this round's edit — `git diff --stat e6f18c5a1..HEAD` over TSPEC is empty, so TSPEC moved
*before* the PLAN I approved against, and my v6 pin was already stale when the workflow stamped it
from a stale dispatch snapshot. PLAN v1.4's own changelog states this in the open and re-grounds on
it, and its characterisation checks out: TSPEC v1.8 only closes the REQ-STATS-06-versus-BR-16
erratum, moving no `BR-`, `E-` or `AC-` row and no vocabulary. REQ (`f75c348f…`) and FSPEC
(`a493133f…`) match this dispatch's pins exactly. So the TSPEC drift is real but immaterial to
PROPERTIES, and I raise no finding on it. I record it because a reader comparing my v6 pins to HEAD
would otherwise conclude two upstreams moved unremarked.

**Answer.** PROPERTIES still holds. The erratum touched exactly one thing PROPERTIES leans on — PLAN
T-10, cited by PROP-RATIO-05 and PROP-CLI-05/-06 — and it moved T-10's *justification* rather than
its content. Three Mediums below, one delta and two inherited; no High, nothing gating. The notable
result is an inversion worth stating plainly: on the one point where PLAN v1.4's new text and
PROPERTIES now disagree, I measured the shipped oracle at HEAD and **PROPERTIES is the accurate
document**. The correction is owed upstream, not here.

## Properties

I re-read every PROPERTIES row that cites PLAN T-10 — the only PLAN section the erratum rewrote —
and the §PLAN tasks section, against T-10's current text rather than the version I approved.

| PROPERTIES row | Cites | Still faithful to PLAN v1.4? |
|---|---|---|
| PROP-RATIO-05 | `TSPEC §2.4, §3.1; PLAN T-10` | Partly — see F-01, F-02 |
| PROP-CLI-05 | `BR-01; TSPEC §3.4; PLAN T-10/T-17` | Yes — `FLAGS_BY_COMMAND.stats` set-equality and `VALUE_FLAGS` non-membership are untouched by the erratum |
| PROP-CLI-06 | `BR-29; TSPEC §3.5; PLAN T-09/T-10` | Yes — exit-code conjunct untouched |
| PROP-DRIFT-01…-04, PROP-RO-05, PROP-NEG-07 | T-10 (via §PLAN tasks) | Yes — parser-identity, classifier purity, construction-site count and no-write capability conjuncts are verbatim unchanged across the diff |
| §PLAN tasks table | PLAN task ids and statuses | Yes, and strengthened — see Positive Observations |

**What actually changed inside T-10.** The conjunct itself is unchanged: `statsIo().fileSize`'s body
names `lstatSync`, and `bin/cli.mjs`'s whole source matches `/(?<![A-Za-z])statSync\s*\(/` zero
times, whole-file, no "in the `stats` seam" qualifier. Both the old and the new row call that matcher
**normative, not illustrative**. What moved is the *reason* the row gives for the whole-file scope.
v1.3 justified it on a baseline property — that `bin/cli.mjs` "contains neither `statSync` nor
`lstatSync` anywhere", with a raw `:262` line anchor. That baseline expired when T-17 landed. v1.4
re-grounds the justification on the matcher's two anchors instead, and adds a sentence concluding
that "comment- or string-masking of the source is **not** owed."

**Why this is good news for PROPERTIES.** PROP-RATIO-05 already justified the whole-file scope on the
anchor — "because the anchor already excludes the correct `lstatSync` and the naive
`source.includes("statSync")` could never red." PLAN v1.3's expired baseline reasoning was the
weaker of the two, and my v6 recorded it as a DEFERRED item ("PLAN T-10's stale pre-implementation
baseline note"). The erratum resolves that deferred item and moves PLAN onto the reasoning PROPERTIES
was already using. The two documents are *closer* after this edit than before it.

The residue is one clause, and it is F-01.

## Oracles

Every claim below was re-measured this round against HEAD, not carried from v6.

| Check | Command | Result |
|---|---|---|
| PROPERTIES bytes unchanged | `shasum -a 256 docs/pdlc-stats/PROPERTIES-pdlc-stats.md` | `02fc6fbf…` — equals v6's `APPROVAL-HASH` ✅ |
| PLAN moved from my v6 pin | `git show e6f18c5a1:…/PLAN-pdlc-stats.md \| shasum -a 256` | `6ab4d081…` = v6's `UPSTREAM-STATE: PLAN` ✅; HEAD is `64d8f1c5…` |
| Erratum blast radius | `git diff e6f18c5a1..HEAD -- …/PLAN-pdlc-stats.md` | +7 / −2; header, changelog, §Batches preamble, T-10 row only ✅ |
| Manifest untouched | same diff | no `File Ownership Manifest` hunk ✅ |
| TSPEC did not move in this window | `git diff --stat e6f18c5a1..HEAD -- …/TSPEC-pdlc-stats.md` | empty ✅ (drift predates the approved PLAN) |
| REQ / FSPEC match dispatch pins | `shasum -a 256` | `f75c348f…`, `a493133f…` ✅ |
| Masking language is new in PLAN | `git show e6f18c5a1:…/PLAN-pdlc-stats.md \| grep -i mask` over T-10 | absent in v1.3, present in v1.4 → F-01 is delta ✅ |
| "normative, not illustrative" is **not** new | same grep | present in both v1.3 and v1.4 → F-02 is inherited ✅ |
| Shipped oracle **does** mask | `sed -n '525,530p' pdlc/engine/__tests__/stats-cli-structure.test.js` | `const masked = maskNonCode(source)` then `fsSyncCallNames(masked)` ✅ |
| Shipped oracle is a call-name **set**, not PLAN's regex | `grep -n "A-Za-z" …/stats-cli-structure.test.js:262` | `/\b([A-Za-z_$][A-Za-z0-9_$]*Sync)\s*\(/g` + `calls.has("statSync") === false` → F-02 ✅ |
| T-17 landed; token now present both ways | `grep -n statSync pdlc/engine/bin/cli.mjs` | `:1288` doc-comment prose, `:1302` `nodeFs.lstatSync(absPath).size` ✅ — PLAN v1.4's re-measurement is correct |
| PLAN's old `:262` anchor is stale | same grep | no `statSync` at `:262`; v1.4 drops the anchor ✅ |
| PROPERTIES does not lean on PLAN's Status ticks | `grep -n "⬚\|✅\|Status column" …/PROPERTIES-pdlc-stats.md` | no matches ✅ — the §Batches preamble change cannot reach PROPERTIES |
| Inherited v6 F-01 still open | `sed -n '154,210p' …/PLAN-pdlc-stats.md \| grep -c "\| new \|"` | `17` `new` rows vs PROPERTIES' "all sixteen" (lines 22, 535) → F-03 ✅ |

**The measurement that decided F-01.** PLAN v1.4 asserts masking is "not owed". I did not stop at the
document — I read the oracle that ships. `pdlc/engine/__tests__/stats-cli-structure.test.js:525-530`
is the whole-file conjunct, and it masks: it builds `maskNonCode(source)` and runs the call-name set
over the masked text. PROP-RATIO-05's phrase "over the comment- and string-masked source the
structural oracle reads" is a **correct description of the shipped oracle**. PLAN v1.4's new sentence
is the one that does not match what is on disk.

To be fair to PLAN, "not owed" is a claim about *falsifiability*, not a prohibition, and on that
narrow reading it is defensible: at HEAD the `:1288` occurrence is prose not followed by `(`, so
`\s*\(` rejects it with or without masking, and both oracles yield zero. But the row states it as a
settled design conclusion about T-10's oracle, and T-10's oracle masks. An implementer reading v1.4
and building the unmasked variant would ship something PROP-RATIO-05 no longer describes, and would
lose the protection masking gives against a future `statSync(` appearing inside a comment or string.

## Fixtures

No fixture, generator or test-data row in PROPERTIES is reachable from this erratum, and I checked
rather than assumed.

- §Fixtures' **test doubles** (PLAN T-02, `statsDoubles.js`) — the erratum does not touch T-02, and
  T-10's equivalence conjunct ("T-02's `realStatsIo()` uses the identical four-call set") survives
  the rewrite verbatim. `fakeStatsIo`'s stated inability to distinguish `lstat` from `stat`, which
  PROP-RATIO-04 depends on, is unaffected.
- §Fixtures' **constructed fixtures** over `fakeStatsIo` — untouched; the erratum moves no metric,
  no grammar and no `BR-` row.
- §Fixtures' **real-path fixtures, measured at HEAD, 2026-08-31** — this is the block most exposed to
  upstream drift, since it pins live repository paths. The erratum changes no path and no count, and
  the TSPEC v1.8 movement discussed in §Overview closes an erratum item without moving a real-path
  literal. I re-confirmed the block's dating still matches the day of measurement.
- §Fixtures' **process-level harness** — PROP-RATIO-11 and PROP-CLI-02…-08 run through
  `main([...])`. T-10 is a source-structural task and contributes no fixture here.

One consequence of F-01 worth naming in fixture terms: the disagreement is about the *input* the
structural oracle reads (masked versus raw source), not about any fixture on disk. No fixture needs
to change under either reading, which is part of why F-01 is Medium and not High.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | PLAN T-10 v1.4 newly concludes "comment- or string-masking of the source is **not** owed", while PROP-RATIO-05 states the conjunct holds "over the comment- and string-masked source the structural oracle reads". The shipped oracle at `pdlc/engine/__tests__/stats-cli-structure.test.js:525-530` **does** mask. PROPERTIES is the accurate document; the correction is owed in PLAN T-10, not here. | PROP-RATIO-05 / PLAN T-10 |
| F-02 | Medium | inherited | local | PROP-RATIO-05 pins the literal regex `/(?<![A-Za-z])statSync\s*\(/` as the oracle, but the shipped conjunct is a call-name **set** — `/\b([A-Za-z_$][A-Za-z0-9_$]*Sync)\s*\(/g` plus `calls.has("statSync") === false`. PLAN v1.4 now rests its whole falsifiability argument on that regex's two anchors, so a divergence I deferred in v6 has become more load-bearing without being introduced by this round. | PROP-RATIO-05 |
| F-03 | Medium | inherited | nonlocal | The §PLAN tasks preamble's quantifier "every new file the manifest declares is tracked — all sixteen" is wider than the set it enumerates: PLAN's File Ownership Manifest declares **seventeen** `new` rows, the seventeenth being `docs/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md` (batch 11, T-26). Unchanged since my v6 F-01; PROPERTIES' bytes did not move. | §PLAN tasks, preamble |

FINDING: Medium | delta | local | PROP-RATIO-05 requires a comment- and string-masked oracle input; PLAN T-10 v1.4 newly declares masking not owed. Shipped oracle masks, so PROPERTIES is accurate and PLAN T-10 carries the correction.
FINDING: Medium | inherited | local | PROP-RATIO-05 pins a literal regex as the oracle; the shipped T-10 conjunct is a call-name set. Deferred in v6, now load-bearing under PLAN v1.4's anchor-based justification.
FINDING: Medium | inherited | nonlocal | §PLAN tasks preamble says "all sixteen" new manifest files; the manifest declares seventeen `new` rows, the extra being MUTATION-EVIDENCE-pdlc-stats.md.

**No High, and I want to be explicit about why F-01 is not one.** It is delta-introduced and local,
so the gating limb is available to me. I am declining it on materiality. The disagreement changes no
metric, no fixture, no trace and no property *outcome*: at HEAD both the masked and the unmasked
reading of the matcher yield zero matches, because the sole non-call occurrence is prose not followed
by `(`. It is a divergence about oracle input hygiene, and it resolves by editing one sentence in
PLAN T-10 — the document that moved — rather than by touching PROPERTIES at all. Halting the phase
to correct an upstream sentence that makes the downstream document *look* wrong when it is in fact
right would be the wrong trade.

**And I want to be explicit about what I did not do.** I did not take the erratum's own item list as
the boundary. F-01 appears on no list: it is a consequence the edit created in a document nobody
asked me to compare it against, which is exactly what DEC-ERR-03 tells me to surface. I also checked
the two changes I could most easily have waved through — the §Batches Status declaration and the
TSPEC pin drift — and confirmed by measurement that neither reaches PROPERTIES.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v5 and v6, still open and still not a PROPERTIES defect: now that wave 9 has landed, is PROP-RATIO-11 expected to arrive as an amendment to T-09's already-shipped `stats-cli.test.js` rather than as part of the first red wave? A sequencing question for the orchestrator, not a document finding. |
| Q-02 | New, and the reason F-01 is worth one sentence upstream rather than silence: PLAN v1.4 argues falsifiability "rests on the two anchors". The shipped oracle does not use those anchors — it uses a call-name set over masked source (F-02). Should PLAN T-10 be re-grounded a second time onto the mechanism that actually ships, so the row's justification and the test agree? I am not asking PROPERTIES to change; PROP-RATIO-05 already describes the shipped oracle's input correctly. |

## Positive Observations

- **The erratum retired a stale baseline I had deferred rather than filed.** My v6 recorded PLAN
  T-10's pre-implementation baseline note as a DEFERRED item — the row justified its whole-file scope
  on `bin/cli.mjs` containing neither token, which T-17 had already falsified. v1.4 found it without
  a reviewer naming it, re-measured HEAD honestly (`nodeFs.lstatSync(absPath).size` at `:1302`, bare
  `statSync` in prose at `:1288`), and said plainly that the old baseline "was only ever an incidental
  property". Self-correcting a justification that still reached the right conclusion is harder than
  fixing a wrong conclusion, and it is the kind of thing that usually rots for several rounds.
- **The re-grounding moved PLAN onto PROPERTIES' reasoning, not the other way round.** PROP-RATIO-05
  had justified the whole-file scope on the anchor from the start. PLAN now does too. The documents
  converged on the stronger argument.
- **The §Batches Status declaration is the right call, and it protects a DoD reviewer from
  PROPERTIES too.** Declaring the column a planning-time ledger and naming the branch's
  `feat(pdlc-stats): T-NN` commits authoritative is better than a hand-sync that goes stale on the
  next commit. It also happens to ratify what PROPERTIES' §PLAN tasks table already does — that table
  carries commit anchors (`2fc6d9b57`, `df1441b76`, `9a3a70fd9`) rather than ticks, so it was already
  reading the record PLAN has now named authoritative. Two documents agreeing on provenance without
  having coordinated is a good sign.
- **The changelog declared its own upstream drift instead of hiding it.** v1.4 states that the
  dispatch pinned TSPEC `7b119eb7…` while HEAD carried `f32d9cb5…`, and characterises the delta. I
  verified the characterisation and it holds. A changelog that volunteers "my dispatch snapshot was
  stale" is what let me clear the TSPEC pin question in minutes rather than re-reading TSPEC v1.8.

## Recommendation

**Approved with minor changes**

PROPERTIES still holds against PLAN v1.4. Its bytes did not move, the erratum touched exactly one
section it leans on (T-10), and that section's *conjunct* is unchanged — only its justification was
re-grounded, onto the reasoning PROPERTIES was already using. No property, oracle, fixture or trace
needs to change.

Three Mediums, none gating. The one delta finding (F-01) is a disagreement PLAN created and PLAN
should close: PLAN T-10 says comment- and string-masking is not owed, PROP-RATIO-05 says the oracle
reads masked source, and the oracle that ships masks — so the sentence to edit is upstream. F-02 and
F-03 are inherited, both recorded in v6, neither touched by this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 0}

APPROVAL-HASH: sha256:02fc6fbf76cb68d3510e0cf2a58ffbb9ddcb8b75c858312ae9ce5addc72f1531
APPROVAL-HASH-NORMALIZED: sha256:63fc8529055ba49ade526ef8be0a64ab8af3f26c2fa4e2a9cd2d17778ff04f48
REVIEWED-COMMIT: f7e1c55ece74c9328d2c8daddc5802529cb9c85b
UPSTREAM-STATE: REQ sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
UPSTREAM-STATE: FSPEC sha256:a493133f67150b27020b10d05cd676a505e172f0b89082a208ce8198a3137f5d
UPSTREAM-STATE: TSPEC sha256:7b119eb7fa68475db641e2c244a3b9c10b742b2310d0079ccbb137d9e6d3e85e
UPSTREAM-STATE: DECISIONS sha256:ca3f7219e1acaefe3024bb3a6da78d844b7c1d992213af3f84e4086437b7b5cc
UPSTREAM-STATE: PLAN sha256:64d8f1c5365bf95a3666dae0da22e3c42c2a1fb1e170cf0f959c494ad3c1ecc9
