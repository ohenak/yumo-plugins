# POSTMORTEM — Phase D (FSPEC erratum delta confirmation) — pdlc-plugin-retirement

**Date:** 2026-08-18
**Phase:** D (delta confirmation on the FSPEC erratum round)
**Failure class:** ERRATUM-PROTOCOL
**Document at halt:** `FSPEC-pdlc-plugin-retirement.md` v0.8 (`1eccc97c`)
**Non-approving confirmers:** se-review, te-review

RESOLVED: yes

*Resolution evidence (2026-08-18).* Recommendation item 1 landed as `76591d1e` (upstream
erratum 5 — REQ v0.13 C-5/AC-1.2 + baseline M-11h now state the postWave values survive) and
`134fec23` (upstream erratum 3 — REQ v0.14 §A-1 + baseline M-11n: reference deleted, not
rewritten; capability question routed to new O-8). O-8's deferral was then bound as
`0a5e6a15` + `a5cb6322`: successor `pdlc-consolidation-rehost` raised (queue Order 24,
`ready: false` draft REQ) per the recorded 2026-08-08 operator direction and NG-5, REQ v0.15.
Item 2 landed as `c14048ed` (FSPEC v0.9): SE F-01–F-06 and TE F-01–F-07 each addressed —
§7.2 rows 4–5 for the upstream errata, §3.3 step 4 rewritten at host granularity with the
black-box oracle, class-10 pin re-pointed to the tracked example file, erratum-10 open row,
label sweeps. Item 3 (delta re-confirmation scoped `1eccc97c..HEAD`) is the re-run this
marker clears. Item 4's two protocol fixes (erratum reach check, fail-closed `FINDING:`
lint) are deferred to `/pdlc:consolidate-learnings` as the postmortem proposed.

## Phase

Phase D was not an authoring phase. FSPEC v0.7 was approved (SE v9 / TE v9 "minor changes",
re-confirmed unchanged in the v10 upstream-cascade round, approval anchors `638413b4`). Four
items were then routed to FSPEC through the TSPEC §6.1 erratum channel, and three commits
(`8c5847a6`, `76e40b98`, `1eccc97c`) landed them as a targeted versioned edit producing v0.8.
Phase D asked the one question a delta round asks: **does the delta resolve the routed items
without breaking anything previously approved?** Both confirmers answered no, and the phase
halted with the erratum edit landed but its contract chain inconsistent.

The routed items were:

| # | Routed item | Landed in v0.8? | Confirmation outcome |
|---|---|---|---|
| 1 | Erratum 3 — class 11 must state the *capability* disposition for `consolidate-learnings`, not merely "delete the bundle reference" | Yes (`FSPEC:163`, `:192`–`:199`) | Contradicts REQ §A-1 and baseline M-11n; rests on a claim false at module granularity (SE F-03, TE F-01/F-02) |
| 2 | Erratum 5 — `postWaveCommand` / `postWavePathspecs` **values** survive; class 10 is prose-only | Yes (`FSPEC:162`, `:347`) | Landed downstream only; REQ C-5, REQ AC-1.2's rationale and baseline M-11h still say the opposite (SE F-01) |
| 3 | Tighten `consolidationPreflight.test.js`'s `postWavePathspecs` assertion from containment to set-equality | Yes (`FSPEC:162`) | Names the wrong file; the assertion it tightens never executes in CI (TE F-03) |
| 4 | Record the held-class accounting over §3.1's thirteen classes (TSPEC §6.4 T-5) | Yes (`FSPEC:167`–`:170`) | Accepted by both confirmers as the delta's one clean landing |

Item 4 is the shape a good erratum has: it changed a downstream document only, and nothing
upstream had a competing sentence. Items 1–3 each carried an upstream obligation the erratum
did not discharge, which is the failure this phase records.

## Iterations

One. Phase D opened and halted on a single confirmation round; there was no author/review
oscillation to trace.

| Round | Document | SE verdict | TE verdict | Outcome |
|---|---|---|---|---|
| 11 | FSPEC v0.8 (`1eccc97c`) | Needs revision (1 High / 3 Medium / 2 Low) | Needs revision (3 High / 3 Medium / 1 Low) | Halt — non-approving confirmation |

Context for the count: FSPEC had already consumed ten rounds (v1, v3–v5, v7–v11 SE; v1–v11 TE)
and was approved at v0.7. The erratum round was expected to be a two-commit touch-up. It cost a
fresh High-bearing round instead, and the four Highs raised are all *new* — none reopens a
section the erratum did not touch, and both confirmers say so explicitly. That is the diagnostic
signal: the halt is not review fatigue or re-litigation, it is the erratum edit itself creating
contradictions that did not exist at v0.7.

## Reviewers

| Reviewer | Lens | Round | Verdict |
|---|---|---|---|
| software-engineer | Feasibility, contract-chain consistency, delta-vs-approved-baseline | 11 | Needs revision (1H / 3M / 2L) |
| test-engineer | Oracle falsifiability, testability of the delta's new claims | 11 | Needs revision (3H / 3M / 1L) |

Both reviewers re-read upstream at HEAD per DEC-ERR-03 rather than against the version FSPEC was
last approved against, and both grounded their Highs in repo facts they executed rather than in
document prose — SE against `.claude/pdlc.config.example.json` and `TSPEC:742`, TE against
`consolidationPreflight.test.js:197-210`, `pdlc/engine/scripts/publish-preflight.mjs:221-222`
and `pdlc/skills/consolidate-learnings/SKILL.md:8-13`. No High was withdrawn or disputed.

One process defect belongs to the round itself rather than to the document: **the te-review
confirmation carried no parseable `FINDING:` line.** TE's seven findings live only in the
findings table; SE emitted six machine-readable `FINDING:` lines alongside its table. The
dispatcher fail-closed on the unparseable confirmation, recording a synthetic
High / delta / nonlocal item. TE's substance was sound and independently gating (three genuine
Highs), so the fail-closed default did not change the halt decision — but it would have masked
an *approving* TE confirmation just as readily, and that is worth fixing before the next
erratum round.

## Pattern of Disagreement

Not author-versus-reviewer, and not reviewer-versus-reviewer. SE and TE agree on every point of
overlap and their Highs interlock: SE F-01 (erratum 5 landed downstream only) and TE F-02
(erratum 3 must travel to REQ §A-1 and baseline M-11n) are the same defect on two different
errata, and SE F-03 and TE F-01 are the same defect on one claim. The disagreement is
**author-versus-upstream**, mediated by reviewers who checked the chain.

Three recurring shapes:

1. **Downstream-only landing of a decision whose contract spans three documents.** Erratum 5
   decided that `postWaveCommand` / `postWavePathspecs` *values* survive. FSPEC v0.8 says so;
   REQ C-5 (`REQ:229`) still enumerates those values as retired, REQ AC-1.2's term rationale
   (`REQ:319`–`:321`) still rests on their retirement, and the measured baseline's M-11h row
   (`docs/_constraints/pdlc-retirement-baseline.md:63`) still records them as removals. The
   substance is right — SE verified the reduced builder still emits into `pdlc/workflows/dist/`
   — but a correction that lands on one of three documents leaves the chain worse than before
   the erratum, because two documents now contradict a third that used to agree with them.
   Erratum 3 has the identical shape against REQ §A-1 and baseline M-11n.

2. **Prose disposition written at the wrong granularity.** Erratum 3's disposition rests on
   "no host survives the rewrite to name" (`FSPEC:194`). True of *execution* hosts; false of
   modules — `consolidate-learnings.js` survives as a module and only loses its execution host
   (`TSPEC:70`), and the SKILL.md sentence being disposed of names the module *and* the bundle.
   TE pushed the same observation further: the skill's own `:8-13` says the pass is performed
   by the workflow script and that hand-running bypasses the log boundary, duplicate suppression
   and the in-progress marker — so "still operator-invocable in session" is false at the
   granularity the skill itself documents. A one-word granularity slip turned a bookkeeping
   erratum into an undeclared capability retirement.

3. **Assertion tightening that cannot fail where the gate runs.** Class 10's tightened
   containment→set-equality edit names `.claude/pdlc.config.example.json`, but the test it
   tightens (`consolidationPreflight.test.js:197-210`) reads the operator's untracked
   `.claude/pdlc.config.json` behind an `existsSync` branch. In CI that arm never executes, so
   the tightened oracle is unfalsifiable in the required-check set and its only live effect is
   to red an operator machine that legitimately adds a pathspec the baseline permits. This is
   the same "oracle stated in English, never executed against the tree" defect Phase T recorded
   (POSTMORTEM-T, pattern 2), recurring inside an erratum round.

## Best-Guess Root Cause

**Proximate:** the erratum channel was used as if every routed item were downstream-only. Items
arrived as TSPEC §6.1 errata addressed *to FSPEC*, and were discharged by editing FSPEC. But two
of the four carried decisions whose contract lives in REQ and in the measured baseline as well,
and the erratum protocol has no step that asks, before writing the fix, *which other documents
assert the sentence I am about to reverse?* The author answered the item as posed rather than
tracing the claim to every document that states it, so the round produced three-document
disagreement out of one-document agreement. FSPEC §7.2's lead-in then compounded it by asserting
"no criterion relaxed" — a completeness claim the same commit had falsified.

**Contributing:** the erratum ledger's own bookkeeping encouraged this. §7.3's "three TSPEC §6.1
errata folded in (v0.8); no other erratum edits this document" reads as a completeness assertion
about the whole erratum surface, while TSPEC §6.1 item 10 (`TSPEC:1335`, landed `34215001`) was
open against this document at the time. A ledger that says "folded in" for an item that actually
needs to be *raised upstream* (TE F-07) makes the downstream-only habit look complete on paper.

**Also contributing (process, not content):** the confirmation-round contract has one machine
requirement — a parseable `FINDING:` line — and no lint enforces it at write time. TE emitted a
well-formed findings table and no `FINDING:` lines, which the dispatcher can only treat as
fail-closed. The role definition states the trailer rule for revision dispatches; the confirmation
finding-line rule has no equivalent mechanical check.

**Not the cause:** reviewer severity inflation (four Highs, all repo-verified, none withdrawn);
scope creep (no finding reopens untouched sections — both reviewers state this); upstream churn
(REQ v0.12 was stable through the round, and the erratum edit's own v0.12 re-pin landed in two of
the three places it names, SE F-04). Nor was iteration budget the binding constraint: this halted
on the first round of the phase, not the fifth.

## Recommendation

Do **not** restart Phase F. The erratum substance is correct in every case — what is missing is
the upstream half of two errata and three clause-level corrections. The cheapest correct path is
one upstream erratum round followed by one FSPEC revision and one delta re-confirmation.

1. **Raise the two upstream errata first (pm-author owns REQ and the baseline).**
   - *Erratum 5 upstream:* amend REQ C-5 (`REQ:229`), REQ AC-1.2's term rationale
     (`REQ:319`–`:321`) and baseline M-11h (`:63`) to state that `postWaveCommand` /
     `postWavePathspecs` values survive because the reduced build step still emits M-9 into
     `pdlc/workflows/dist/` under O-3; M-11h becomes a prose-and-assertion edit, not a value
     retirement.
   - *Erratum 3 upstream:* amend REQ §A-1 (`:332`) and baseline M-11n (`:69`) so the
     `consolidate-learnings` disposition is a single decided outcome, not a rewrite-vs-delete
     choice an implementer resolves by which document they read.
   - Both must be answered as a **product decision**, not an engineering one: Q-01 in both
     reviews asks whether losing the unattended, machinery-backed consolidation pass is accepted
     capability loss under REQ NG-5, or whether re-hosting blocks retirement. FSPEC cannot decide
     this; routing it back is the correct move and should happen before any FSPEC edit.

2. **Then revise FSPEC once, addressing all seven remaining points in one pass.** SE F-01 and TE
   F-02 become §7.2 *open* erratum rows (with §7.2's "no criterion relaxed" lead-in softened);
   TE F-01/F-05 widen §3.3 step 4 to state what an in-session pass actually is and give the
   capability claim a black-box oracle (post-sweep `SKILL.md` names a path that exists at HEAD and
   no reference to a retired host — inspection only, no skill execution); TE F-03/F-04 re-point
   the tightened pin at the tracked example file and leave the presence-gated consumer-config
   assertion at containment, plus one clause naming the branch assumption; SE F-02 adds the open
   row for TSPEC §6.1 erratum 10 and narrows §7.3's completeness sentence to "folded in *here*";
   SE F-03 fixes the host-granularity clause; SE F-04/F-05/F-06 and TE F-06/F-07 are label sweeps
   (two remaining v0.11 pins, the transitive-hold clause, the v10 cross-review range, the
   contested-count flag on class 6, and the §7.3→§7.2 row move).

3. **Re-run one delta confirmation on the result, scoped `1eccc97c..HEAD`.** Both reviewers named
   the exact edits they want; the next round should be confirmation, not negotiation.

4. **Two protocol fixes to carry beyond this feature** (candidates for
   `/pdlc:consolidate-learnings`):
   - *Erratum reach check.* Before writing an erratum fix, grep the claim being reversed across
     REQ, FSPEC, TSPEC and `docs/_constraints/`; every document that asserts the old form is part
     of the erratum, or the erratum is not done. A downstream-only landing of a multi-document
     claim should be a self-caught defect, not a reviewer finding.
   - *Confirmation lint.* A non-approving confirmation with no parseable `FINDING:` line should be
     rejected at write time rather than fail-closed at dispatch time. The reviewer roles' output
     contract needs the same mechanical treatment the revision trailer already has.

If the operator accepts, flip `RESOLVED: no` to `RESOLVED: yes` once the upstream errata land, and
re-run Phase D for a single delta round on the revised FSPEC.

**Provenance**
- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: unresolved (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
