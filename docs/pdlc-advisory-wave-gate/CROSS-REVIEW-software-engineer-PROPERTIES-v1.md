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

**O-C, extended header (`-01, -02, -03, -10`) and the new two-conjunct paragraph.** Measured against
FSPEC BR-9 v1.6, AT-05-1/-05-2, REQ AC-5.1 and TSPEC §5.2: faithful, and it does the right job for
an oracle section — it states *why* each conjunct is positive rather than restating the property.

- *Domain half.* "the fixture must carry a `.gitignore`d file the wave added and assert it **present**
  afterwards … an implementation that ran `clean -fdx` fails it" matches TSPEC §5.2 case 4 and §2.5's
  "`clean -fd`, not `clean -fdx` — and the boundary is upstream's, now decided".
- *Vacuity guard.* "A fixture whose only generated output is `.gitignore`d tests nothing at all here
  (AT-05-2), so PROP-REST-02's rewritten path must be a non-ignored one" is FSPEC AT-05-2's own
  sentence ("whose generated output is `.gitignore`d tests nothing here, since BR-9 puts it outside
  the map"). Good catch to propagate it into the oracle rather than leaving it in the AT.
- *Observation-point half.* "a map observed after them differs from the pre-A6 map by exactly the
  bytes BR-13 mandates, so a correct restore would read as red" is BR-9's own reasoning, and E-23
  supplies the third carrier (the `halted` queue row, M-WG-7) that BR-9's sentence names only as
  "the record and escalation writes". The document is right to enumerate all three: REQ AC-5.1 does.
- O-D's counted-quantity rule (`commit-tree === 1`) is untouched by this delta and still matches
  TSPEC §5.2's capture-failure block.

**Falsifiability close.** The edit demotes PROP-REST-03 from the weak list with a one-sentence
history rather than deleting it — the right shape: a reader of v1.2 can still follow the trail, and
the "no longer weak" claim is now true because the property carries transcribed expected values on
both halves.

**Oracle-level effect of F-01.** The attempt-consumption conjunct lives in PROP-ENV-13's row, not in
an oracle, so no oracle text needs to change with it — the fix is one clause in one row (and,
optionally, an explicit `attempts` observable, since asserting `attempts` *unchanged* here is a real
and worthwhile discriminator against an implementation that charges the wave for a refusal).

## Fixtures

**Hazard 2, rewritten (the four-class restore fixture).** The rewrite replaces a pending-marker
instruction with a fixture composition, which is the stronger artifact. Measured against TSPEC §5.2
cases 1–5 and PLAN A6-10's former-A6-09 red step:

| Fixture class named | Upstream anchor | Result |
|---|---|---|
| tracked file the wave modified | §5.2 case 1 | matches |
| non-ignored untracked file the wave added, asserted **absent** after restore | §5.2 case 3; BR-9 ("absent afterwards, not merely reset") | matches |
| `.gitignore`d file the wave added, asserted still **present** | §5.2 case 4; §2.5's `clean -fd` bullet | matches direction; the added "byte for byte" is stronger than upstream — F-03 |
| non-ignored generated output the re-run post-wave command rewrites over an already-dirty path | §5.2 case 2; FSPEC AT-05-2 | matches, and the "substituting an ignored path makes AT-05-2 vacuous" note is AT-05-2's own reason |

**Pending-marker discipline.** "no case in A6-09 ships with a pending marker of either kind" agrees
with PLAN A6-10's red step ("No `test.todo`, and (as always here) never `test.skip`") and with TSPEC
§6 OQ-9's *moot* disposition. Keeping the `orchestrate-dev.js` skip-guard regex
(`/\b(describe|test|it)\.skip\s*\(/`) in the hazard after the `test.todo` case disappeared is
correct, not residue: the guard still governs the file, which is exactly how PLAN A6-10 phrases it.

**Real-repo shape.** Unchanged and still right: `mkdtempSync` + `execFileSync("git", …)` with a
`_git` adapter, the shape `advisoryDodSeams.test.js` already ships (TSPEC §5.2, TE F-04). No
injected-double substitution has crept into the new rows — PROP-REST-10 stays Integration (real
repo), PROP-ENV-13 is Integration on the seam-op fixture, which is the correct level for an `apply`
observation.

**No fixture is owed by F-01.** The ignored-path-only fixture PROP-ENV-13 needs is TSPEC §5.5's, and
it exists there with final expected values; only the attempt conjunct is wrong.

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
