# Cross-Review: software-engineer — PROPERTIES (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation, round v1)
**Round type:** delta confirmation — previously approved, erratum edit landed, re-measured against upstream HEAD (DEC-ERR-03)

## Overview

**Question answered.** The dispatch reports every routed item as ABSORBED against upstream HEAD, so
nothing was owed as an edit. My scope is therefore the whole of DEC-ERR-03: is this PROPERTIES still
a faithful compression of REQ/FSPEC/TSPEC/DECISIONS/PLAN *at the versions named in the dispatch*?

**Grounding verified.** All five upstream digests in the dispatch match the working tree byte for
byte (`shasum -a 256`): REQ `c62cfc35…`, FSPEC `91ef2557…`, TSPEC `3fa21acf…`, DECISIONS
`84deee10…`, PLAN `f7de7fcb…`. The document's Scope line now cites REQ v1.15, FSPEC v1.6
(E-01…E-34, AT-01-1…AT-07-5) and TSPEC v1.11; E-34 exists in FSPEC at HEAD, the AT ceiling is
AT-07-5, the AT count is forty-seven, and NFR-1…NFR-6 and AC-1.1…AC-6.4 are the live id ranges. The
changelog's *"raised item: absorbed, no edit owed"* claim about the lineage `Downstream` row is true
as stated: REQ line 12 reads `FSPEC, TSPEC, PLAN, PROPERTIES (all in this directory)`, this
document's own `Downstream` row reads `IMPL` and its tests, and the single `pdlc-engineering-loop`
mention here is §G-1's owner attribution, not a lineage row.

**Delta reviewed.** `git diff ca06395b..HEAD` on the document: +55/−20 across eight commits
(`fa5d48b1` … `1e297117`) touching the changelog, Scope, §C (PROP-ENV-13, new), §E (PROP-REST-01,
-03 restated; PROP-REST-10, new), Oracle O-C and its new paragraph, the falsifiability close,
Fixtures hazard 2, the coverage matrix, the AT table, the PLAN-task table, and §G-2.

**Bottom line.** The OQ-7 absorption is real, correctly directed, and correctly transcribed almost
everywhere: PROP-REST-01/-03/-10, O-C and Fixtures hazard 2 all read back cleanly against FSPEC BR-9
(v1.6), REQ AC-5.1 (v1.15) and TSPEC §5.2 cases 1–5. One conjunct in the newly minted PROP-ENV-13
contradicts both FSPEC §3.3's refusal row and the shipped driver, and it is a transcribed expected
value that will mint a red test — that is the one blocking item (F-01).

## Properties

Each changed or new property row re-measured against the upstream text it now leans on.

| Row | Upstream measured | Result |
|---|---|---|
| PROP-REST-01 (restated) | FSPEC BR-9 v1.6 (*Domain* / *Observation point* clauses); REQ AC-5.1; TSPEC §5.2 cases 1, 5; §2.5 | **Faithful.** "tracked files and non-ignored untracked files, generated outputs included, `.gitignore`d paths excluded from both sides" is BR-9's domain clause verbatim in substance; "immediately after restoration completes and before the record carriers the run still owes" is AC-5.1's observation point. Citations (`§5.2 (cases 1, 5)`, `§2.5`) resolve. |
| PROP-REST-03 (restated) | FSPEC BR-9 / AT-05-1 / AT-05-2 v1.6; REQ AC-5.1 v1.15; TSPEC §5.2 cases 3, 4; §6 OQ-7 | **Faithful on direction.** OQ-7 *is* closed and answered *no* (TSPEC §6 OQ-7, "Closed upstream, answered *no*"), the REQ quote "operator files A6 never wrote and never restores over" is verbatim at REQ AC-5.1, and dropping `test.todo` is right. One over-assertion: see F-03. |
| PROP-REST-10 (new) | TSPEC §5.2 case 5; REQ AC-5.1; FSPEC E-23, BR-13; §2.5 | **Faithful.** Case 5 asserts the ordering, not only content, in the same words. The closing claim "`restoreTreeSnapshot`'s sequence is therefore complete at `git reset --mixed {head}`" is TSPEC §2.5's own sentence (line 515) and matches the `read-tree --reset -u` → `clean -fd` → `reset --mixed` sequence at §2.5 and PLAN A6-10's green step. AT-06-1 co-trace is legitimate — BR-9's observation-point clause cites AT-05-1 and AT-06-1 together. |
| PROP-ENV-13 (new) | TSPEC §3.3 `apply` row; §5.5 *Ignored-path-only repair*; §6 OQ-11; FSPEC BR-15, §3.3 flow table | **One conjunct diverges — F-01.** `producedPaths() === []`, `{ok:false}`, the literal `post-action-verification-failed`, an escalation entry, and a tree carried no further are all in TSPEC §5.5's row and §3.3's `apply` row, and the positive control is a good addition. But **"one attempt must be consumed" is not upstream and is contradicted by it**: FSPEC §3.3's flow table gives refusals "no attempt consumed", and the shipped driver terminates this path with `attempts` unchanged (`orchestrate-dev.js:4285`, `terminate({… attempts, appliedSuccessfully:false})`, with `attempts` incremented only in the malformed arm `:3994`/`:4174` and the red-re-gate arm `:4316`). PROP-REST-08 in this same document uses `attempts === 0` as the observable for a comparable pre-resolution escalation, so the document's own vocabulary makes the conjunct falsifiable — and false. |

**Traceability of the two new rows.** The coverage matrix adds PROP-ENV-13 under AC-3.4 and
PROP-REST-10 under AC-5.1/-5.2/-6.1/-6.2 with parenthesised roles; the AT table adds PROP-REST-03 /
-10 to AT-05-1 and PROP-REST-10 to AT-06-1; the PLAN-task table adds PROP-ENV-13 to A6-15 and
PROP-REST-10 to A6-09. All consistent. PROP-ENV-13 claims no AT, correctly — TSPEC §5.5 exists
precisely because no AT covers it, so AT set-equality is undisturbed.

**PLAN-home ids.** The rows name PLAN homes `A6-09` and `A6-15`. PLAN v1.3 folded both into A6-10
and A6-18 as named steps and states that references to former ids "denote those steps, not tasks" —
resolvable, but a reader diffing PROPERTIES against PLAN's task table finds no such tasks. Recorded
as F-02 (Low, inherited: the convention predates this round; the two new rows follow it).

## Oracles

_(pending)_

## Fixtures

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
