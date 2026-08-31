# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.6, 2026-08-31)
**Date:** 2026-08-31
**Iteration:** 8

## 1. Scope of this round

Delta re-review. Base of comparison: `af78b8c4e` (the commit carrying v1.5, which I reviewed in
`CROSS-REVIEW-test-engineer-REQ-v7.md`). One commit touches the REQ since —
`1847dd9c0` "REQ v1.6 — withdraw harvested halt state, restore `0`" — 22 insertions, 17 deletions
across five sites: the changelog line, §3 NG-6, §4 REQ-STATS-02's harvested enumeration,
§5 REQ-STATS-05, and §6 R-6.

Per the delta protocol I re-read only those five sites plus the surfaces they cross-reference
(REQ-STATS-03, REQ-STATS-04, REQ-STATS-06, O-1), and I re-verified every existing-behavior claim the
edit makes against HEAD rather than against the previous round's text.

## 2. Prior finding — status

**F-01 (Medium, v7) — resolved, by withdrawal rather than by the clause I suggested.**

My v7 finding was that REQ-STATS-05's *harvested* halt state was satisfied by "no post-mortem was
ever written" as readily as by "harvest deleted them", and that two real archives
(`docs/completed/pdlc-merge-phase/`, `docs/completed/pdlc-loop-economics/`) sit in the second case
and would have been relabelled `harvested` while being genuine zeros. I asked for one acknowledging
clause. The author went further and removed the state.

v1.6's REQ-STATS-05 (`REQ-pdlc-stats.md:189-194`) now reads: "Where no
`POSTMORTEM-{phase}-{feature}.md` file is present, halts report `0`. No harvested state is drawn
here… A `0` therefore means only that no halt evidence is on disk, and deliberately does not
distinguish a feature that never halted from one whose post-mortem files are gone; R-6 records that
accepted residual."

Judged against my own bar, this resolves the finding on all three counts I raised it for:

- **The oracle is a measured value again, and it is falsifiable in both directions.** A fixture with
  one `POSTMORTEM-T-{feature}.md` must report one entry for phase T; delete the file and the same
  fixture must report `0`. There is no discriminator input (LEARNINGS presence) feeding the halts
  metric any more, so the test needs exactly one file-system fact and the expected value is a literal
  transcription of the AC. Under v1.5 the same test needed a two-input truth table whose second input
  did not causally determine the answer.
- **No archive is now reported as something its own LEARNINGS contradicts.** I re-checked the two
  I named: `docs/completed/pdlc-merge-phase/` (`LEARNINGS-pdlc-merge-phase.md:12`, `:16` — "no
  POSTMORTEM was written") and `docs/completed/pdlc-loop-economics/`
  (`LEARNINGS-pdlc-loop-economics.md:16`). Both report `0`; both LEARNINGS say `0` is the truth.
  The pair that motivated v1.5 (`docs/completed/pdlc-advisory-tier/`,
  `docs/completed/pdlc-consolidation-agent/`) now report `0` where their LEARNINGS names deleted
  post-mortems — but the REQ no longer claims otherwise, and R-6 (`:263-267`) states the union
  out loud: "REQ-STATS-05 reports `0`, which unions 'never halted' with 'post-mortem files no longer
  on disk'. A consumer baselining halts over `docs/completed/` must not read `0` as evidence a
  feature ran clean." A named, documented residual is a testable contract; a silent one is not.
- **The propagation is complete.** I re-derived it mechanically rather than trusting the changelog:
  `grep -n "03/04/05/06" docs/pdlc-stats/REQ-pdlc-stats.md` returns nothing, and every surviving
  enumeration reads `REQ-STATS-03/04/06` — REQ-STATS-02 (`:146`) and R-6 (`:262`). O-1 (`:270-272`)
  still says "every metric's not-available / harvested tokens", which stays correct because three
  metrics still carry the token. No site was left behind.

## 3. What the delta changed, checked

### 3.1 REQ-STATS-05 (§5) — the AC itself: sound

The new AC states a single file-system predicate and a single reported value, with no derived input.
I applied the "write the test right now" check at black-box altitude: given a fixture directory with
zero post-mortems, the command prints `0` for halts; given one `POSTMORTEM-D-{feature}.md`, one entry
tagged per C-5's `RESOLVED:` rule. Nothing in either expectation is derived from the implementation,
and both directions can fail. The marker rule is still delegated to C-5 rather than restated
(`:186-189`), so there remains exactly one place where case, duplicate markers and fenced placement
are decided — I re-confirmed that clause survived the edit unchanged.

### 3.2 R-6 (§6) — the residual is stated where a consumer will read it: sound

R-6 (`:261-267`) now splits: mitigated for REQ-STATS-03/04/06 via the harvested state,
**accepted, not mitigated** for halts. That is the honest framing, and it is the one that keeps the
downstream FSPEC/TSPEC from inventing a mitigation the REQ never asked for. It also gives the test
author the right instruction for the fixture set: a `0`-halts fixture is deliberately ambiguous by
design, so no later reader "fixes" it into a harvested token.

### 3.3 NG-6 (§3) — one over-claim about existing behavior (F-01, Medium)

NG-6 (`:75-77`) now reads: "The harvested states cover the two families `harvest-learnings`
removes — cross-reviews and DoD reviews; an absent post-mortem is reported as REQ-STATS-05's
measured `0`."

The scoping decision is fine. The justification for it — that post-mortems are not a family
`harvest-learnings` removes — is a claim about existing behavior, and I could not verify it at HEAD;
the evidence runs both ways:

- **For the claim:** the skill's normative instructions name exactly two families. Step 3 of its Git
  Workflow (`pdlc/skills/harvest-learnings/SKILL.md:28`) and step 8 (`:59`) both say delete
  "`CROSS-REVIEW-*` and `CODE_REVIEW-*` files"; the two quality-checklist lines (`:128`, `:129`) say
  the same. `POSTMORTEM-*` appears in the *inventory* step (`:34`) and the *read* checklist (`:122`)
  but not in any delete instruction.
- **Against the claim:** the LEARNINGS metadata template in that same file
  (`pdlc/skills/harvest-learnings/SKILL.md:77`) specifies the row as
  `| Harvested from | {list of CROSS-REVIEW + CODE_REVIEW + POSTMORTEM files, now deleted} |`, and
  `pdlc/OPERATIONS.md:296` defines the row as "the record of which `CROSS-REVIEW-*` /
  `CODE_REVIEW-*` / `POSTMORTEM-*` files harvest deleted". Authors follow the template: at
  `docs/completed/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md:11` the row names
  `POSTMORTEM-T-pdlc-advisory-tier.md` and `POSTMORTEM-PR-pdlc-advisory-tier.md` among "82 files,
  deleted by this harvest", and neither file is on disk (`ls docs/completed/pdlc-advisory-tier/`
  returns eight documents, no `POSTMORTEM-*`). `docs/completed/pdlc-consolidation-agent/` is the
  same shape.

So the upstream mechanism is genuinely self-contradictory at HEAD, and NG-6 resolves the
contradiction by asserting one side of it as fact. **This does not affect any oracle**, which is why
it is Medium and not High: REQ-STATS-05 no longer depends on the claim — it reports what is on disk
either way, and R-6 already names the union. The finding is that the *rationale* is falsifiable by
two archives in the corpus, and a downstream author or reviewer who checks it will re-open a question
this round was meant to close — for the third time.

The fix is a wording change with no mechanism behind it: state the two-family scope as **this REQ's
own scoping choice** ("this REQ draws harvested states only for cross-reviews and DoD reviews")
rather than as an observed property of `harvest-learnings`, and let R-6 carry the consequence as it
already does. That phrasing is true regardless of which side of the upstream contradiction later
wins, which is exactly the property the last two rounds were missing.

### 3.4 The mirror case in REQ-STATS-03 (F-02, Low, inherited)

NG-6's new sentence characterises the harvested states as being about *removal*. For cross-reviews
that is not universally true either: `docs/completed/pdlc-loop-economics/` holds a LEARNINGS and zero
`CROSS-REVIEW-*` files, and its LEARNINGS states positively that none ever existed — the feature used
direct authoring, with `HANDOFF-PROMPT.md` explicitly scoping out cross-review round files
(`docs/completed/pdlc-loop-economics/LEARNINGS-pdlc-loop-economics.md:71`). Under REQ-STATS-03
(`:164-168`, unchanged bytes I approved in v5) that feature reports `harvested` for every document
type, though nothing was ever harvested from it.

I am not re-opening REQ-STATS-03 — its bytes did not move and the delta protocol says I do not
re-litigate it. I record this only because the same one-sentence fix in 3.3 covers it: if the
harvested states are described as this REQ's scoping choice rather than as an inference about what
harvest removed, both families are described accurately and no further edit is needed.

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
