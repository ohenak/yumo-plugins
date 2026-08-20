# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.2)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v3.md` (v1.1, TSPEC v1.5 pin)
**Delta reviewed:** `c05f497f..9a569157` (six commits, DECISIONS only)
**Date:** 2026-08-19
**Iteration:** 4

## Context

v3 was an upstream-cascade confirmation: the four decisions held, but four passages described an
upstream state that had stopped existing, two of them in the shape "no test falsifies this" about
regressions the erratum round had just made falsifiable. I raised two High, two Medium, one Low.

This round's delta is the revision I asked for, and it is bigger than the one I scoped: upstream
moved further while it was being written (TSPEC v1.6 → v1.10), and the author re-grounded against
v1.10 rather than the version my findings cited. Two of my citations are consequently stale in the
document's favour — the engine-channel expectation no longer lives where TSPEC v1.6 put it
(`ci-arrangement.test.js`), and v1.10 re-homed it to a purpose-named new file. The revision tracks
that move rather than transcribing my v3 text.

Scope held to the delta: six commits touching this file only, no decision line altered, plus a
re-check of every upstream anchor the delta newly cites. I did not re-read unchanged sections
except where the delta cites them.

## Decision

**All five v3 findings are resolved, none by weakening a claim.** Each anchor re-verified at HEAD:

| v3 finding | Resolution | Verified at |
|---|---|---|
| F-01 (High) — `0`-vs-`enabled: false` collapse recorded as unfalsifiable | Bullet now reads "The collapse is falsified upstream at TSPEC v1.10" and reproduces the landed fixture, keeping the present-and-zero conjunct as the separating assertion | `TSPEC:1427-1436` — enabled tier, `waveBudgetPerRun: 0`, red gate ⇒ `escalated` / `reason: "budget-exhausted"`, zero `_agent` calls, snapshot still taken, advisory summary key **present** with sixth-row counters zero |
| F-02 (High) — DEC-03 fixed-name rejection recorded "stated but not falsifiable" | Paragraph now records the closed loop: rejection is falsifiable, with the two-wave set-equality quoted | `TSPEC:1225` (§4.5 row qualified "asserted on §5.2's two-red-wave run"); `TSPEC:1437-1444` (set-equal `{a6-snapshot-1, a6-snapshot-2}`, two distinct targets each written once) |
| F-03 (Medium) — DEC-A6-02 quoted an O-8 row that no longer exists | Paragraph rewritten to "Upstream now states this shape, and cites this entry for the rejection"; the new quote is verbatim, and "two pieces" is correctly reduced to one | `TSPEC:262` — "**One further `commitPaths` call** … the owning task's own commit keeps its own pathspec, unwidened", naming "the rejected option A of … DEC-A6-02". FSPEC BR-8's permissive clause does still stand (`FSPEC:196`) |
| F-04 (Medium) — engine-channel routing status stale | Rewritten past my own citation: the expectation is owned by a **new** file, not `ci-arrangement.test.js`, and the "no AT covers it" phrasing is replaced by a deliberate-allocation statement | `TSPEC:1330` (§5.1 map: `pdlc/engine/__tests__/advisory-config-example.test.js`, new file); `TSPEC:1174-1182` (§4.4's rationale); the named required check `Engine tests (ubuntu-latest)` exists (`.github/workflows/pr-tests.yml:88`) |
| F-05 (Low) — stale upstream pin, cross-review list | Upstream re-pinned to TSPEC v1.10 in both the metadata table and §Context's opener; Cross-Reviews cell now lists all three PM/TE pairs | Metadata table, `DECISIONS:5,11` |

**v2's carried findings are discharged in the same pass, as Q-01 asked.** v2 F-01 (the `-m`-less
`commit-tree` failure mode) is corrected rather than carried: DEC-A6-01 now says the failure is
silence, not a block. I re-measured the corrected claim rather than accepting it — `defaultGit`
does run `execFileSync("git", args, { stdio: "pipe", encoding: "utf8" })` with no `input`
(`pdlc/workflows/orchestrate-dev.js:11658-11667`), and against real git `git commit-tree {tree} -p
HEAD </dev/null` exits `0`, prints an object id and yields an **empty** commit message. The
document's account now matches measurement, and the operator-facing consequence it draws (an
unlabelled snapshot commit) is the right one. v2 F-03 (seventh transcription site) is folded in too.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The re-enumerated envelope-literal sites misattribute one of the six.** The delta expands "six more" into a named list: "`advisoryEnvelope`'s `ENVELOPE_DEFAULTS` set-equality, two in `advisoryDisabled`, one in `advisoryHarvest`, and two in `helpers/advisoryDoubles.js`". Five check out verbatim — `advisoryDisabled.test.js:136` and `:623`, `advisoryHarvest.test.js:203`, `advisoryDoubles.js:325` (frozen shape) and `:423` (generator shuffle). The sixth does not: `advisoryEnvelope.test.js:284` asserts `[...ENVELOPE_DEFAULTS].sort()` equals `["E-1" … "E-6"]` — the **six-member** post-A6 value, already migrated ahead of production, which still exports the four-member literal (`orchestrate-dev.js:1942`). TSPEC records exactly this asymmetry as a live drift row: "`advisoryEnvelope.test.js` already asserts `{E-1 … E-6}` \| production default still four members" (`TSPEC:303`, and `TSPEC:323`). So the four-member literal has five test-side transcription sites plus its production definition, not six test-side ones. The total the bullet is arguing for — seven hand-sync surfaces — survives either way, and the sequencing conclusion is unaffected; but a PLAN or PROPERTIES reader who takes the list literally will go to `advisoryEnvelope.test.js` expecting a four-member literal to edit and find a six-member assertion that is already at its target value. Naming that site as the already-migrated one, or dropping it and counting `ENVELOPE_DEFAULTS`' own definition instead, makes the list match HEAD | "What follows for the whole feature", envelope-literal bullet |
| F-02 | Low | Local | **Version 1.2 is dated earlier than version 1.1.** The metadata table reads `| pdlc | Draft | Claude | 1.2 | 2026-08-19 |`; v1.1 carried `2026-08-20`. Upstream TSPEC v1.10 also carries `2026-08-19` (`TSPEC:12`), so the new date is the consistent one and v1.1's was the outlier — but as it stands the revision history reads as moving backwards in time, which is the one thing a date column exists to prevent. Not gating, and not worth a round of its own | Metadata table |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The revision re-grounded against TSPEC v1.10 while my v3 findings cited v1.6, and in the engine-channel case that meant landing somewhere other than where my finding pointed (new purpose-named file, not `ci-arrangement.test.js`). That is the right call and I want to say so explicitly rather than have it read as a deviation. Is there a convention for marking "resolved against a later upstream than the finding cited"? A one-clause note in the changelog line would have saved me a re-derivation, and would save the next reader one |

## Positive Observations

- **Both High findings were closed by pointing at a landed oracle, not by hedging the prose.** The
  `0`-collapse bullet and the DEC-03 rejection paragraph now each end on a positive statement about
  what fails if the regression returns — "a future 'simplification' collapsing `0` into
  `enabled: false` now fails the suite rather than passing it"; "a fixed-name regression writes one
  target twice and fails on both conjuncts". Those are falsifiability claims a reader can check
  against `TSPEC:1427-1444` in one hop, and I did. The instruction-shaped sentence I flagged in v3
  ("Until it lands, a future simplification … passes the suite") is gone, so nothing here can be
  read as a standing work item by a PROPERTIES author.
- **The `commit-tree` correction is the strongest edit in the delta.** v1.1 asserted a loud failure
  that does not happen; the honest version is worse for the operator and the document says so —
  a valid, unlabelled snapshot commit that defeats the point of capturing it. It also keeps the
  original testing conclusion intact (an argv-sequence oracle over a double cannot catch the
  omission, so the literal belongs in the task's argv, not its judgement). Correcting a mechanism
  claim while preserving the coverage conclusion that rested on it is the harder of the two moves.
- **The revision tracks upstream rather than my finding text.** My F-04 named
  `ci-arrangement.test.js` because TSPEC v1.6 did; by the time the edit landed, v1.10 had re-homed
  the expectation and given a scope-hygiene reason for it (a config-schema assertion parked in a
  CI-arrangement file lets an unrelated example edit redden a delivery-blocking required check).
  The bullet reproduces that reason instead of my stale anchor. That is the behaviour I want from
  an author under cascade.
- **"Two pieces" correctly became one, not zero.** FSPEC BR-8's permissive clause is still standing
  at `FSPEC:196`, and the paragraph still says so. The easy error here was to declare the whole
  supersession discharged once the O-8 row moved.

## Consequences

- **Nothing blocks PLAN or PROPERTIES.** No decision line moved in this delta; the four decisions
  are unchanged and now rest on upstream text that exists. F-01 touches a sizing enumeration in the
  whole-feature section, not a decision, and its conclusion (sequence the shared-double edits
  together) is unaffected by the misattribution.
- **F-01 is worth folding into whatever edit next touches this file rather than a round of its own.**
  Same for F-02. If nothing else opens this document, both can ride the next version bump; if the
  envelope literal migrates to six members during implementation, the bullet needs revisiting anyway
  and the correction lands for free.
- **One durable observation for the harvest.** Both this round and the last were spent re-grounding
  a record against upstream that moved underneath it — v1.5 → v1.6 → v1.10 across two review rounds,
  with citations in this document going stale each time without any edit to it. The document's own
  set-equality warning ("a partial edit reddens tests … with a failure reason the record cannot
  predict") applies to itself, as v3 noted. What this round adds: the cost is not one-off. A record
  that transcribes upstream *coverage status* re-expires on every upstream erratum, and two of the
  four v3 findings existed only because DECISIONS chose to state what upstream did not yet have.
  The cheaper shape is to cite the owning section and let it carry the status.

## Recommendation

**Approved with minor changes.**

Both v3 High findings are resolved, both Medium findings are resolved, the Low is resolved, and the
two v2 findings Q-01 asked about are discharged in the same pass. No open High finding, old or new.
The two findings recorded here are non-gating: one misattributed entry in a sizing enumeration whose
conclusion holds regardless, and a date-column regression. Neither needs a round; both should ride
the next edit that opens this file.

## Verdict
