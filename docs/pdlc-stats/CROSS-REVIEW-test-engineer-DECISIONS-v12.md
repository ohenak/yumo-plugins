# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.7)
**Date:** 2026-08-31
**Iteration:** 12

## Context

**Delta re-review under DECISION FREEZE.** v11 was an upstream-cascade confirmation over
byte-unchanged bytes (`sha256:48522bf9…`, `REVIEWED-COMMIT: 930d65c49`). This round the document
*did* move: three commits — `39d7d46f7`, `82a2f8ec7`, `f3ab46e72` — land v1.7 at
`sha256:ca3f7219…`, +43/−8 across four hunks and nothing else.

The delta is scoped exactly to the four items I carried in v11 and nothing beyond them:

| v11 finding | What v1.7 does | Hunk |
|---|---|---|
| F-01 (Medium) — K-3's divergence clause cites TSPEC text TSPEC no longer says | K-3 replaced with *"Upstream divergence resolved in TSPEC v1.7 — no longer owed (retires TE F-05, PM F-01)"* | `DECISIONS:623` |
| F-02 (Medium) — v1.6 grounding attestation stale by three REQ versions | v1.6 entry marked *"(Version-scoped: pins in this entry state upstream as it stood at v1.6, not HEAD)"*; new v1.7 entry re-grounds on HEAD | `DECISIONS:14–46`, `:74` |
| F-03 (Low) — site-table preamble said "Four hold; five pin" against its own 5+4+1 | preamble now reads **"Five** hold enumerations; **four** pin"* | `DECISIONS:243` |
| F-04 (Medium) — non-resolving `UPSTREAM-STATE` TSPEC pins | v1.7 entry records it as a workflow-side defect routed to harvest, states no conclusion rests on it, and that every affected round re-grounded against HEAD per `DEC-ERR-03` | v1.7 changelog |

Upstream at branch HEAD, measured, not taken from the document:

| Doc | HEAD sha256 | HEAD version | v1.7 changelog claims | Match |
|---|---|---|---|---|
| REQ | `f75c348f…` | v1.7 (`REQ:18`) | v1.7, `f75c348f…` | yes |
| FSPEC | `a493133f…` | v1.8 (`FSPEC:16`) | v1.8, `a493133f…` | yes |
| TSPEC | `f32d9cb5…` | v1.8 (`TSPEC:16`) | v1.8, `f32d9cb5…` | yes |

All three pins in the new changelog entry resolve to real revisions at HEAD — the first round in
four where the document's own upstream statement is verifiable end to end.

## Options Considered

How I disposed of this round, and what I rejected:

| Option | What it would mean | Disposition |
|---|---|---|
| Re-open the K-3 arithmetic now that implementation exists on the branch | Treat `c8.include` measuring **eight** at branch HEAD as falsifying K-3's *"seven at HEAD"* | **Rejected.** The design's measurement basis is the pre-feature tree. `git show main:pdlc/workflows/package.json` has exactly seven `c8.include` entries and `main:…/coverageInstrumentation.test.js:264` still prints *"exactly the six modules"* — K-3's `4 + 1 + 2` = seven and "this feature makes it eight" are both true against that basis. Nothing in the delta is falsified. |
| Raise High on the branch's implementation mis-sizing the P9-02 title | The landed test title reads *"seven"* while the literal it asserts holds eight | **Rejected as a DECISIONS finding.** It is a code defect in `pdlc/workflows/__tests__/coverageInstrumentation.test.js:264`, not a defect of this document — and it is the *exact* failure K-3 predicted. Recorded as `DEFERRED` for the implementation phase, not folded into this verdict. |
| Re-derive the whole site table from scratch | Treat a moved preamble as licence to re-audit all ten rows | **Rejected.** Delta protocol: the preamble hunk changed two count words; I verified those two words against the table and the sweep, and the sweep command itself, and stopped there. |
| Confirm the four repairs landed, carry the residue as non-gating notes | Approve v1.7; record the measurement-basis and pin-recurrence observations | **Chosen** |

One thing I deliberately did not do: accept "the changelog says it re-grounded" as evidence that it
re-grounded. Every hash and version word in the new entry was measured against the files at HEAD
(table in **Context**), and the two repaired count words were re-derived from the table below them.

## Decision

**All four v11 findings are resolved and the delta introduces no defect. Approved with minor changes.**

### F-01 — K-3's divergence clause (resolved)

TSPEC HEAD now states the same move this document has carried since v1.3:
`TSPEC-pdlc-stats.md:131` — *"wrong on HEAD's measurement and is corrected to seven → eight at
v1.7"* — and `:272`'s row reads *"the title moves **seven → eight** (printed `six` → `eight`)"*.
`TSPEC:33` independently re-states *"derives **ten** co-change sites and the seven → eight
`REQUIRED_INCLUDES` move stands"*. K-3's replacement clause claims exactly this and routes nothing
upstream. `grep -n "owed upstream" DECISIONS` returns two hits, both inside historical changelog
entries (`:81`, `:109`) and both now carrying an explicit discharge marker (`:74`, `:109`), so no
live erratum route survives.

### F-02 — grounding attestation (resolved)

`DECISIONS:74` scopes the v1.6 paragraph to its own version, and the v1.7 entry re-grounds against
measured HEAD. The failure mode I named in v11 — a later round reading a stale attestation and
concluding re-grounding is unnecessary — is closed by construction: the version-scoped marker makes
the pin non-live and the v1.7 entry is the live statement.

### F-03 — site-table preamble (resolved, and now internally checkable)

`DECISIONS:243` now reads *"**Five** hold enumerations; **four** pin"*. Re-derived against the
table and *What the sweep found*: five holders — `pdlc/engine/scripts/prepack.mjs` (`MODULE_NAMES`),
`publish-preflight.mjs` (`WORKFLOW_MEMBERS`), `fixture-machine.mjs` (`WORKFLOW_MODULE_NAMES`),
`__tests__/_tspec-packed-set.mjs`, `pdlc/workflows/package.json` (`c8.include`) — four pinners —
`loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`,
`learningsPremises.test.js` — plus `pdlc/README.md` as the tenth, pinned by nothing. 5 + 4 + 1 = 10,
matching K-1's partition. All nine files exist at HEAD.

The sweep command is reproducible and still true:
`git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` returns **25 files**, the number
`DECISIONS:261` states — on both `main` and branch HEAD.

### F-04 — non-resolving upstream pins (dispositioned as far as this document can)

I enumerated every TSPEC revision on the branch: none hashes to `512a9fcf…`, `235fd3dd…` or
`f2261510…`, so the observation stands for a fourth round (v11's own appended trailer repeated
`f2261510…`). But this is a workflow-side defect, not a defect in these bytes, and v1.7 records it
that way — routed to harvest, with the explicit statement that no conclusion here rests on it. That
is the correct disposition; I carry it below as Low rather than re-escalating.

## Consequences

### What the delta did not disturb

Scanned only the changed sections, per the delta protocol. K-3's *arithmetic* is byte-identical
either side of the edit — only the bookkeeping paragraph moved — so the obligation is not re-sized,
no new falsifier is owed, and the K-3 task decomposition ("two conjuncts, one live one new") is
untouched. `DEC-STATS-01/02/03`, the option table, every verdict and every re-evaluation trigger are
outside the four hunks and unchanged. No `BR-`, `E-` or `AC-` row is added, so nothing downstream
(PLAN, PROPERTIES) is re-pointed by this round.

### An observation the freeze puts out of scope, worth stating because it is load-bearing later

The v1.7 changelog is the first in this document's history whose upstream pins all resolve. That
matters beyond bookkeeping: for three rounds the cascade's baseline was recovered only because a
reviewer noticed the trailer disagreed with the body and chose the body. A mechanism whose
correctness depends on reviewer attention is not a check. v1.7 says so in the document itself and
routes it to harvest — which is the right place for it, and is why I am not re-escalating F-04.

### The prediction K-3 made, and the branch state that confirms it

K-3 warned: *"An implementer who follows this row literally lands a passing test whose title
misstates its own assertion by two."* At branch HEAD that has now happened —
`pdlc/workflows/__tests__/coverageInstrumentation.test.js:264` reads *"exactly the seven modules"*
while the literal it asserts holds eight members (`:267–272`), and `:260–261`'s comment still says
"six-member" / "three entries" against a four-entry `REQUIRED_INCLUDES` (`:37–45`). The count word
was moved by one from the *printed* number instead of onto the *measured* one — the precise error
K-3 named. Neither string is load-bearing on an assertion, so nothing is red; it is a documentation
defect inside a test file, for the implementation phase to close. It is not a defect of this
document, and under DECISION FREEZE it is not a blocking finding here. Recorded as `DEFERRED`.

### Positive observations

- **The repairs are repairs, not restatements.** F-01 was discharged by moving the *upstream*
  document onto this document's measurement, not by softening the clause — the two documents now
  state one move, and the disagreement bookkeeping is retired rather than hidden.
- **Version-scoping beats rewriting.** Marking the v1.6 entry version-scoped, and leaving its
  `file:line` forms intact, keeps the changelog an honest record of what was believed when, while
  making the live statement unambiguous. That is the right shape for a document whose upstream
  churns faster than it does.
- **Every count word in the delta is mechanically re-derivable.** 5 + 4 + 1 = 10 against the table;
  25 files against a stated `git grep`; `4 + 1 + 2` = 7 against `main`'s `package.json`. A reviewer
  can falsify each without trusting a single sentence of prose.

## Delta-Confirmation Findings

## Verdict
