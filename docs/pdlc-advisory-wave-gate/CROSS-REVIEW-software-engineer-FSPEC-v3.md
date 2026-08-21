# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6, bytes unchanged)
**Upstream re-measured:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.15, sha256:c62cfc35…0611bf7)
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation, DEC-ERR-03)

## Overview

FSPEC's own bytes have not moved since my v2 approval (`REVIEWED-COMMIT: 9f80247a`). What moved is
REQ. My v2 recorded `UPSTREAM-STATE: REQ sha256:8963a0c0…` — that is REQ **v1.13** at `53fe0b73`.
REQ is now **v1.15** at `0cef7148`. So the cascade window is not one erratum round but two: v1.14
(`75e5e13c`, `524913ed`, `c58fd61d`) and v1.15 (`88c3554f`, `f3fbbc7b`, `0cef7148`). I measured the
whole window, `git diff 53fe0b73..HEAD` — 29 insertions, 9 deletions, four hunks — not just the last
round, because my approval was taken against v1.13 bytes and everything after it is unconfirmed.

The question I am answering is the narrow one: is FSPEC v1.6 still a faithful compression of REQ as
it now stands? Not "did the routed items land" — that is necessary, not sufficient (DEC-ERR-03).

**Answer: yes, and the window closed a gap rather than opening one.** Three of the four hunks are
REQ catching up to text FSPEC already carried. My v1 review on FSPEC asked for exactly two things
that REQ has now independently adopted:

- **AC-5.1's observation point and ignored-path domain.** FSPEC BR-9 has pinned both since v1.6
  (the fix for my v1 F-02). REQ v1.14/v1.15 now pins the same observation point and the same
  `.gitignore` exclusion, and v1.15 adds AC-6.2's escalation-log append to the excluded-carrier
  list. FSPEC BR-9's cut — "immediately after restoration completes and **before** the record and
  escalation writes BR-13 requires" — already excluded that carrier. REQ moved toward FSPEC.
- **The pre-A6 measurement base.** FSPEC §2's "Where 'before' is measured" paragraph has pinned
  `c8aa22a4` (before) and `11420461` (post-change) since v1.6. REQ v1.14 named `c8aa22a4` in
  AC-1.1/R-5, and v1.15 replaced AC-1.1's HEAD-relative "HEAD already carries A6" with the
  commit-pinned "the post-change reading, at `11420461`, carries A6" and gave R-5 the same pin.
  Character-identical to what FSPEC §2 already said.

I verified both anchors rather than accepting them: `bb4d36fb` and `11420461` are both ancestors of
this branch's HEAD, and `ADVISORY_SEAMS` at HEAD is the six-member frozen array
(`pdlc/workflows/orchestrate-dev.js:1952`), so the five-member "before" genuinely cannot be
re-measured at HEAD — which is precisely why FSPEC §2's base pin is load-bearing and why REQ
pinning it too is the right correction.

Nothing in the window reopens a decision, changes a branch condition, retires an AC FSPEC compresses,
or renames a literal FSPEC transcribes. The four findings below are a version pin, a rationale
clause narrower than the set it justifies, and two lineage-hygiene items. None is High; none gates.

## Linked Requirements

The upstream hunks in the window, and the FSPEC surface each one lands on. "Faithful?" is the
confirmation verdict for that pair.

| REQ hunk (v1.13 → v1.15) | What upstream now says | FSPEC surface that compresses it | Faithful? |
|---|---|---|---|
| Lineage header: `Upstream` → `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` … → **REQ** | Resolvable path to the tier REQ | FSPEC §1 header cites `REQ-pdlc-advisory-wave-gate.md` only; it never cites the tier REQ by path (it cites `docs/_constraints/pdlc-advisory-corpus-baseline.md` §1–§4 for inherited behaviour) | Yes — nothing to update. Path verified to exist. |
| Lineage header: `Cross-Reviews` scoped to harvested rounds vs post-harvest errata | Rounds through harvest live in LEARNINGS; branch `CROSS-REVIEW-*` files are post-harvest errata in no LEARNINGS table | FSPEC §1 header row reads `Cross-Reviews \| (active)` | Substantively yes; hygiene gap — F-04 |
| Status/Version: `draft` 1.13 → `approved (shipped)` 1.15 | REQ is shipped, two errata on | FSPEC §1 line 52 pins "`REQ-pdlc-advisory-wave-gate` v1.13"; FSPEC Status still `Draft` v1.6 | Pin is now stale — F-02 |
| AC-1.1 + R-5: post-change reading pinned at `11420461` | Replaces the HEAD-relative "HEAD already carries A6" | FSPEC §2 "Where 'before' is measured" (before `c8aa22a4`, post-change M-WG-13/M-WG-14 at `11420461`); AT-07-2 cites `R-5` | Yes — FSPEC said it first. Residual HEAD-relative phrasing — F-03 |
| AC-5.1: observation point, excluded carriers (AC-6.1 record, **AC-6.2 escalation log**, AC-5.2 queue row), ignored paths, failed-capture outcome | The full restoration contract | FSPEC BR-9 (domain + observation point), E-23 (queue-row write is later), E-34 (failed capture), AT-05-1, AT-05-2 | Yes on all four; one rationale clause diverges — F-01 |

**The excluded-carrier check, done explicitly**, because it is the one hunk with oracle consequences.
REQ v1.15 excludes three carriers by enumeration: AC-6.1's record append, AC-6.2's escalation-log
append, AC-5.2's queue-row write. FSPEC BR-9 excludes by **temporal cut** instead of enumeration —
the map is taken "immediately after restoration completes and before the record and escalation
writes BR-13 requires". A temporal cut at that instant is a superset of REQ's enumeration: all three
carriers are written after restoration completes, and FSPEC E-23 states the queue-row half of that
ordering explicitly ("the halt path still appends the record and escalation entries BR-13 requires
and still rewrites and commits the `halted` queue row (M-WG-7)"). So FSPEC's oracle admits nothing
REQ's enumeration excludes, and excludes nothing REQ's admits. AT-05-1 transcribes the same cut. No
finding.

**Traceability table unchanged.** FSPEC §1's FSPEC-AWG-01…07 → REQ-AWG-01…07 concordance still
resolves: no AC id was added, removed or renumbered in the window, so every `AC-x.y` FSPEC cites
still exists and still says what FSPEC says it says. AC-5.1 and AC-1.1 grew text; neither changed
its subject.

## Behavioral Flow

Confirmation scope: does any hunk in the window change the **order** in which A6's observables
become observable — which is what FSPEC §3 owns over REQ?

No. The window touched no branch condition, no trigger, no disposition. Specifically:

- **§3.1/§3.2 step sequence.** AC-1.2's single-trigger clause (script-owned gate non-zero, not
  dispatch-level, not post-wave-command) is untouched in the diff. FSPEC §3.2's step ordering rests
  on it and is unaffected.
- **Step 3b's capture check.** FSPEC §3.2 step 3b tests reversibility before dispatching. REQ v1.14
  added AC-5.1's failed-capture sentence — "Given the pre-A6 state cannot be captured at all, Then
  no repair is proposed, none is applied, and the wave halts on its own gate (AC-5.2) — a different
  outcome from a failed restoration." That is the same branch FSPEC already carries at step 3b and
  in E-34, including E-34's "distinct from E-28" framing. Upstream did not add a step; it stated in
  REQ the step FSPEC had already ordered. Faithful.
- **Step 9's terminal disposition vocabulary** (`resolved` / `escalated` / `no-action`) is untouched
  upstream. The §3.2 step-9 pointer my v2 F-06 closed still stands.
- **Restoration's position in the sequence** is the one ordering claim the window strengthened, and
  it strengthened it in FSPEC's direction: REQ now agrees that restoration completes *before* the
  record and escalation writes, which is exactly the ordering FSPEC §3.2 and BR-9 encode. Nothing
  downstream of the cut moved.

## Business Rules

BR-9 is the only rule the window touches, and it is the rule I want to be most careful about,
because it is the one whose upstream grew the most text.

**BR-9 vs AC-5.1 as it now stands — clause by clause.**

| AC-5.1 clause (v1.15) | BR-9 / neighbour | Verdict |
|---|---|---|
| Tree observably identical to the pre-A6 state | BR-9 opening, plus the content-level (not `git status`) oracle | Faithful, and FSPEC is stricter — the hash-map oracle is FSPEC's addition at the right altitude |
| "the wave's **post-dispatch, pre-commit** tree, with the wave agents' own uncommitted work intact" | BR-9, verbatim in substance | Faithful |
| Observation point = the moment restoration completes | BR-9 "**Observation point**" | Faithful |
| Excluded: AC-6.1 record, AC-6.2 escalation log, AC-5.2 queue row | BR-9's temporal cut + E-23 | Faithful (see §Linked Requirements) |
| Excluded: paths ignored by `.gitignore` | BR-9 "**Domain**" | Set matches; rationale diverges — **F-01** |
| Failed capture → no proposal, no application, halt on own gate | E-34 | Faithful |
| Mechanism is TSPEC's (O-1) | FSPEC §7.1 O-1, "Only the observable" | Faithful — no altitude drift either way |

**F-01, stated here because it is a rules-level divergence.** REQ v1.15's new sentence reads: "So
are paths ignored by `.gitignore`, **which are operator files A6 never wrote and never restores
over**." The normative predicate is "ignored by `.gitignore`" — unambiguous, and it matches BR-9's
domain exactly. The trailing rationale, though, characterises the whole ignored set as *operator*
files. FSPEC BR-9's domain deliberately names a member that is not an operator file: "the run's own
untracked wave ledger", `.claude/pdlc-wave-state.json`, which I confirmed is `.gitignore`d and which
the *run* writes, not the operator. A TSPEC or fixture author reading REQ's rationale rather than
its predicate could conclude the ledger sits **inside** the map — contradicting BR-9 and AT-05-1's
oracle, and turning a legitimate ledger mutation into a spurious restoration defect.

FSPEC is the correct document here; the over-narrow clause is REQ's. I file it against this
confirmation because DEC-ERR-03 makes "upstream no longer says it the same way" my finding whether
or not it is FSPEC's to fix — but the one-clause repair belongs upstream (widen the rationale to
"files outside restoration's reach — operator files and the run's own ignored artifacts alike"),
not in FSPEC. Medium, not High: the predicate governs, so no shipped oracle is presently wrong.

**Every other BR is untouched upstream.** BR-2's vocabulary and first-match rule, BR-5's ordered
exclusion catalogue, BR-11's three budgets, BR-13's record/escalation duty, BR-15's eight refusal
reasons — none of their upstream ACs (AC-2.2, AC-3.2, AC-2.4, AC-6.1/6.2, AC-3.4) appears in the
diff. The literals I character-checked against `orchestrate-dev.js` in v2 are therefore still the
literals both documents point at; I re-confirmed `ADVISORY_SEAMS`'s six frozen members at
`orchestrate-dev.js:1952` and did not re-walk the rest, since no upstream text moved under them.

## Edge Cases and Error Scenarios

Two §5 rows sit under the hunks in this window. Both survive.

- **E-34 (pre-A6 capture fails).** REQ v1.14 added the failed-capture outcome to AC-5.1 *after*
  FSPEC v1.6 shipped E-34. The two agree on all three observables: no repair proposed, none applied,
  wave halts on its own red gate. E-34 adds the two things FSPEC is entitled to add — "the wave
  agents' uncommitted work untouched because nothing ever wrote to the tree", and "the escalation
  names the capture as the cause" — and routes the capture mechanism's failure modes to the TSPEC
  (REQ O-1). Upstream's new sentence and E-34 are the same branch, and REQ's "a different outcome
  from a failed restoration" is E-34's "Distinct from E-28" from the other side. Faithful.
  (My v2 F-02 — that E-34's positive observables carry no AT — is unresolved but **inherited**: it
  was open at approval, this window did not touch it, and it is Medium, not gating. I do not
  re-litigate it here beyond noting it survives.)
- **E-23 (run ends on the wave's own gate halt).** Its clause "'Restored' is BR-9's observation
  point, not the last byte written: the halt path still appends the record and escalation entries
  BR-13 requires and still rewrites and commits the `halted` queue row (M-WG-7)" is what makes
  FSPEC's temporal cut cover AC-5.2's queue-row carrier without enumerating it in BR-9. REQ v1.15
  enumerating that carrier upstream makes E-23 *more* necessary, not redundant. Faithful.
- **E-30 (escalation log cannot be written).** REQ v1.15 now names AC-6.2's escalation-log append in
  AC-5.1's excluded carriers. E-30's rule — a failed escalation-log write never upgrades the
  escalation, never changes the halt — is about a *different* failure axis and is untouched by the
  exclusion. No interaction: a carrier excluded from the restoration map can still fail its own
  write. Both statements hold simultaneously. No finding.

No §5 row cites an AC that the window retired, renumbered, or reworded against it.

## Acceptance Tests

The ATs whose *Given*/*Then* rest on changed upstream text, and whether each still has a live oracle.

- **AT-05-1** (three restoration triggers, tree observably identical). Its *Then* transcribes BR-9's
  domain and observation point — "taken immediately after restoration completes, before the record
  and escalation writes". Against AC-5.1 v1.15 this is still the correct oracle, now with upstream
  agreeing on the cut. The ignored-path exclusion it asserts on both sides matches AC-5.1's
  predicate. **Still falsifiable, still faithful.** (My v2 F-03 — that AT-05-1's *When* says "each
  terminates" while its *Then* pins the restoration-completion instant — remains open and inherited;
  the window makes it slightly more visible, since REQ now also pins the instant, but the two-word
  fix is unchanged and Low.)
- **AT-05-2** (per-path restore must fail). Rests on BR-9's content-level oracle and the ignored-output
  fixture carve-out. Untouched upstream. Live.
- **AT-05-5** (restoration itself fails → halt, no commit reached). Its upstream is AC-5.1/E-28, whose
  text did not change. Live.
- **AT-01-1 / AT-07-2 / AT-04-5's first companion** — the three pre-A6 comparand tests. These are the
  ones the AC-1.1/R-5 hunk bears on. AT-07-2 cites `R-5` directly, and R-5 now carries the base pins
  `c8aa22a4` (pre-change) and `11420461` (post-change). FSPEC §2 already declared the same two bases
  and already declared that "a green result for one of those three at any later base is a vacuum,
  not a pass". Upstream and FSPEC now name identical commits, so the transcribed-comparand
  discipline §6's preamble states is intact on both sides. **Strengthened, not broken.**
- **AT-06-1 / AT-06-6** (record and escalation-log writes). AC-6.1/AC-6.2's own text is untouched;
  only AC-5.1's *reference* to them changed. AT-06-6's contrast — a failed record write refuses the
  action, a failed escalation-log write does not undo the escalation — is unaffected. Live.
- **AT-07-1**'s BR-1…BR-16 partition still lists BR-9 under "not proposable, by construction". The
  window gave BR-9's upstream more text but did not make any part of it agent-proposable: every
  clause added is script-decided before or after a proposal is read. Partition still total, still
  disjoint. Live.

No AT in §6 lost its oracle, and none gained a vacuous one, as a result of this window.

## Open Questions

| ID | Question |
|---|---|
| Q-01 | REQ is now `approved (shipped)` at v1.15 while FSPEC is still `Draft` v1.6 pinned to REQ v1.13. Is the intent that FSPEC's Status follows REQ's on the same erratum sweep, or does FSPEC stay `Draft` until PUB? F-02 asks only for the version pin to be re-grounded; the Status field is a separate call I am not making for you. |
| Q-02 | REQ's `Cross-Reviews` row now distinguishes harvested rounds from post-harvest erratum rounds. Should the sibling artifacts (FSPEC, TSPEC, PLAN, PROPERTIES) adopt the same sentence in this sweep, so a reader of any one of them knows why `CROSS-REVIEW-software-engineer-FSPEC-v2.md` and this v3 appear in no LEARNINGS table? If yes, this is one line per artifact and worth doing once rather than per-document as each is confirmed. |
| Q-03 | AC-5.1's ignored-path rationale (F-01) is REQ's clause to widen. Does the workflow route a confirmation-round finding whose fix lands upstream back to REQ's ordinary revision loop, or does it wait for the next REQ erratum sweep? I have tagged it `delta`/`local` at Medium so it routes rather than halts, but the routing target is the orchestrator's call, not mine. |

## Obligations carried forward, unchanged

FSPEC §7.1's O-1, O-3, O-4, O-5 and O-8 all still route to the TSPEC, and the window touched none of
their upstream text. O-1 in particular ("the restoration mechanism behind BR-9, and the point at
which the pre-A6 tree state is captured") is the obligation AC-5.1's new text explicitly preserves —
REQ still closes with "The mechanism of restoration is TSPEC's to choose (O-1)". Altitude holds on
both sides: upstream added observables, not mechanics.

## Delta-Confirmation Findings

Locality convention for a cascade round: the edit is upstream, so I read "the sections this edit
changed" as the FSPEC surfaces that compress the changed REQ regions — the lineage header, AC-1.1/R-5's
measurement base, and AC-5.1's restoration contract. All four findings sit on those surfaces, so all
four are `local`. All four were introduced by this window, so all four are `delta`. No High.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | REQ AC-5.1's new ignored-path rationale ("which are operator files A6 never wrote") is narrower than the set its own predicate defines, and narrower than FSPEC BR-9's domain, which deliberately includes the run's own `.gitignore`d wave ledger. Fix lands upstream, not in FSPEC. | §4 BR-9 "Domain" / REQ AC-5.1 |
| F-02 | Medium | delta | local | FSPEC §1 pins its upstream as "`REQ-pdlc-advisory-wave-gate` v1.13"; REQ is now v1.15, two erratum rounds on, and both rounds touched text FSPEC compresses (AC-5.1, AC-1.1, R-5). The pin no longer names the version this document is a compression of. | §1, line 52 |
| F-03 | Low | delta | local | FSPEC §2 still reads "the pre-A6 state, which this branch's HEAD no longer carries" — the HEAD-relative form REQ v1.15 deliberately retired in AC-1.1 in favour of the commit-pinned "the post-change reading, at `11420461`". FSPEC pins the commits in the next clause, so the claim is verifiable; the phrasing is the drift-prone one upstream just removed. | §2 "Where 'before' is measured" |
| F-04 | Low | delta | local | FSPEC §1's `Cross-Reviews` row reads only "(active)" while REQ's now states where harvested rounds live and that branch `CROSS-REVIEW-*` files are post-harvest errata in no LEARNINGS table. A reader of FSPEC alone cannot tell why v2 and this v3 appear in no LEARNINGS table. | §1 header, `Cross-Reviews` row |

**Carried from v2, not re-filed here.** My v2 closed `Approved with minor changes` with three open
items — F-01 (BR-2's first-match rule needs a classifier to be falsifiable, §7.1 O-5 still neutral),
F-02 (E-34's three positive observables carry no AT), F-03 (AT-05-1's *When*/*Then* name two
observation points). All three are still open, all three are `inherited` and untouched by this
window, and none is High. They remain in v2's ledger where they were accepted; I do not re-file them
as this round's findings, and nothing in the window made any of them worse.

FINDING: Medium | delta | local | §4 BR-9 "Domain" / REQ AC-5.1 | REQ AC-5.1's new ignored-path rationale calls the ignored set "operator files A6 never wrote", but FSPEC BR-9's domain includes the run's own `.gitignore`d wave ledger `.claude/pdlc-wave-state.json`, which the run writes and the operator does not; the normative predicate still matches, so no shipped oracle is wrong, but the rationale should be widened upstream to cover the run's own ignored artifacts
FINDING: Medium | delta | local | §1 line 52 | FSPEC pins its upstream at "REQ-pdlc-advisory-wave-gate v1.13" while REQ is now v1.15; both intervening erratum rounds edited text this FSPEC compresses (AC-5.1, AC-1.1, R-5), so the pin should be re-grounded to v1.15
FINDING: Low | delta | local | §2 "Where 'before' is measured" | FSPEC still uses the HEAD-relative form "this branch's HEAD no longer carries" that REQ v1.15 retired from AC-1.1 in favour of a commit pin; the adjacent commit pins keep the claim verifiable, so this is phrasing hygiene, not a correctness defect
FINDING: Low | delta | local | §1 header Cross-Reviews row | FSPEC's Cross-Reviews row reads only "(active)" while REQ's now scopes harvested rounds to LEARNINGS and names branch CROSS-REVIEW files as post-harvest errata; adopting the same sentence would tell a FSPEC-only reader why v2 and v3 are in no LEARNINGS table

## Recommendation

_pending_

## Verdict

_pending_
