# Cross-Review: product-manager — PROPERTIES (round-5 delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 5 (delta re-review of v0.6 against the tree as it now stands)
**Scope:** Product lens only. Delta from the commit I last reviewed (`a4b12eb7`, v0.6, approved with
one Low in v4). The document itself is byte-unchanged; the branch around it is not, so this round
asks the only question a delta re-review can ask here — did the tree's movement stale anything the
document claims?

## 1. What changed

`git diff a4b12eb7..HEAD -- docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md`
returns **empty**. The document under review has not moved one byte since I approved it in v4. There
is no revision to re-review, so there is nothing that can have been broken *inside* the document, and
every unchanged section stays as approved.

What did move is the material the document derives from and the code it points at:

| Site | Change | Bearing on PROPERTIES |
|---|---|---|
| `PLAN-pdlc-engine-distribution.md` | v0.8 → **v0.9** (`PLAN:12`), seven one-passage round-6 edits | The Upstream cell (`PROPERTIES:5`) still pins PLAN **v0.8** — §2 below |
| `pdlc/engine/__tests__/preflight-baseline.test.js` (new, 115 lines) | T01 shipped | Named by PLAN T01, not by PROPERTIES — no claim to check |
| `pdlc/engine/__tests__/_doubles.mjs` (new, 489 lines) | T03 shipped | §8's engine-side S-1…S-7 row and the three generators — §3 |
| `pdlc/workflows/__tests__/helpers/provenanceDoubles.js` (new, 191 lines) | T04 shipped | §8's module-side row — §3 |
| `docs/_decisions/DECISIONS-plugin-distribution.md` | +26 lines | Project-level record; no PROPERTIES row cites it |

The seven PLAN edits, read from `git diff a4b12eb7..HEAD -- …/PLAN-…md`, are: (a) §4's red-interval
paragraph no longer licenses landing `scripts/fixture-machine.mjs` ahead of T50; (b) T59 gains both
arms of T50's capability discriminator as named legs; (c) DoD items 14/15 narrow "hermetic carriers"
for AT-2.1; (d) the item-12 gloss corrected; (e) §2.1's AT-3.8a label restated as two-sided;
(f) AT-3.8a's discharge re-attributed to FSPEC v0.3; (g) v0.6 changelog scope claim and T50's
"pinned `ubuntu-latest`" wording corrected. **Batch arithmetic, the ownership manifest and §2.1's
set-equality are byte-unchanged**, and no row was added, removed, re-batched or re-scoped — so the
task-side accounting PROPERTIES §4/§5/§8 hangs on is structurally untouched.

## 2. Prior findings

One Low was open from v4, and the author has not revised the document, so it stands unchanged rather
than unresolved-on-the-merits. I re-state it rather than re-litigate it.

**F-08 (Low, v4) — changelog rows out of order — still open.** `grep -n '^| 0\.'` returns `:18` 0.1,
`:19` 0.2, `:20` 0.3, `:21` 0.4, `:22` **0.6**, `:23` **0.5**. Unchanged, still a one-row swap, still
non-gating. It is carried forward below as F-08 rather than renumbered, so the harvest sees one
finding with a two-round life, not two findings. The software-engineer reviewer raised the identical
row in `CROSS-REVIEW-software-engineer-PROPERTIES-v4.md:73` and tagged it `Low / Local`; my tag
matches, so the two reviews do not ship conflicting scope for one defect.

Also still open and **not mine to re-raise**: SE F-02 (`:74`, §4's "is AT-1.6's" wording). It is a
Low in the same non-revised document; I record it here only so a reader of this file does not
conclude the SE round closed clean.

The two Lows I closed in v4 (F-06, PROP-LAUNCH-1's AC-5.5 trace; F-07, §4's observation site) remain
closed — the passages at `PROPERTIES:86` and `:316-323` are byte-identical to what I verified then.

## 3. Did the surrounding movement break anything

A document that does not change can still go stale under one that does. I checked each PLAN v0.9 edit
against the PROPERTIES row it could touch, and each new file against the §8 row that names it.

**PLAN (b), T59's discriminator legs — PROPERTIES already said it, and said it better.**
`PROP-GATE-1` (`PROPERTIES:227`) already states the discriminator as the probe process's exit status,
both arms positively: *"a probe that executes and exits non-zero ⇒ capability absent ⇒ registered
skip; a probe that cannot execute at all — spawn error, `ENOENT`, timeout … ⇒ unprobeable ⇒ workflow
failure"*, carried by `T50 → scripts/fixture-machine.mjs; T59 → fixture-machine.test.js`. PLAN v0.9
moved *toward* this row, not away from it. No property is now uncarried, and no PLAN task named in
§4/§5 lost its carrier.

**PLAN (g), T50's runner wording — no PROPERTIES edit implied.** PROP-GATE-4 (`:230`) already reads
"On the GitHub-hosted `ubuntu-latest` runner", which is exactly the phrasing PLAN v0.9 corrected
itself to; PROP-NEG-15 (`:266`) uses the same frame. PROPERTIES never claimed an image pin, so the
loose word PLAN retired was never inherited here.

**PLAN (c), AT-2.1's hermetic residue — consistent, checked in both directions.** PLAN now says
T14's real-spawn and signalled-child legs are themselves `real-spawn`-gated. PROP-LAUNCH-6 (`:91`)
says the same thing in property form — descriptor assertions against the S-3 double, *"the
pass-through and signal legs run against a **real spawn**"* — is levelled `Unit + Machine`, and §7's
Machine row (`:428`) counts "PROP-LAUNCH-6's real-spawn half" among the twelve. §4's AT-2.1 row
(`:286`) still lists T11, T14, T41, T46, T53, T34, T50. Nothing to reconcile.

**PLAN (a), (d), (e), (f) are plan-internal.** (a) is a §4 prose licence, (d) a DoD gloss, (f) a
provenance attribution; none is quoted by PROPERTIES. (e) restates AT-3.8a's label as two-sided —
members from TSPEC §5.4, classes and counts from FSPEC §5.2 — which is the ownership PROPERTIES v0.5
already recorded for PROP-PACK-1/-2 (`:22`'s v0.5 row). Convergent, not divergent.

**§8's T03/T04 rows now have shipped code behind them, and it matches.** This is the first round where
these are checkable rather than planned:

- Engine-side S-1…S-7 doubles: `pdlc/engine/__tests__/_doubles.mjs:7` declares the S-1…S-7 mapping and
  the file exports the seam fakes (`fakeStoreReader:48`, `configAbsent:89`, `fakeLauncher:121`,
  `fakePublishChannel:164`, `fakeProvenance:211`, `fakeDeps:249`) — §8's "the engine-side doubles
  S-1…S-7 are T03's" holds.
- §8's three bounded generators for PROP-VER-16 exist and are the three named shapes:
  `genVersionString:353` (version strings), `genConfigShape:394` (config shapes), `genQueueTable:448`
  (queue tables), with hygiene rule 1's explicit seed as `seeded:289` / `resolveSeed:331` — not a
  clock-seeded run.
- Module-side half: `pdlc/workflows/__tests__/helpers/provenanceDoubles.js` ships
  `makePopulatedProvenance:49`, `makeRecordingGit:80` (the `_git` argv recorder PROP-PROV-7 asserts
  on), `makeRecordingFileSeams:116` (`_readFile`/`_appendFile`, with the `=== 0` append-count case
  PROP-PROV-4 needs at `:110-111`), and `PROVENANCE_QUEUE_FIXTURES:167` carrying exactly §8's three
  table shapes — `no-columns:169`, `Evidence`-only`:179`, both-columns`:187`. §8 names the file, not a
  directory, so its landing under `pdlc/workflows/__tests__/helpers/` contradicts no stated path.

**Oracle quality re-checked on the rows the new code touches.** The recorded-call doubles assert on
what *was* recorded (`calls`, `.reads`, `.appends`), so PROP-PROV-4's zero-append conjunct sits beside
positive call-order assertions rather than standing alone; PROP-INSTALL-4's byte-identity still pairs
with §8's non-empty baseline fixture; no expectation in either new file derives an expected value
from the code under test — the doubles are literal data. §4's 35 `AT-` rows and §5's requirement
accounting are byte-unchanged and were set-equality-verified in v3/v4 against a FSPEC that has not
moved since (`FSPEC:16` still v0.7).

**Product criteria: nothing lost.** No P0/P1 requirement lost a carrier, because no carrier cell
changed. Every REQ row in §5 still resolves, and the two shipped double modules strengthen rather
than weaken the properties that depend on them.

The one thing the movement *did* stale is bookkeeping: the Upstream cell's PLAN pin. That is F-09.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
