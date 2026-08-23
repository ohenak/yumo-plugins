# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md (v1.1, bytes unchanged)
**Date:** 2026-08-23
**Iteration:** 5
**Scope:** upstream-cascade confirmation — does DECISIONS still hold as approved against TSPEC v1.4 at HEAD? Not a re-review of DECISIONS.

## Context

My approval of DECISIONS v1.1 was last confirmed in `CROSS-REVIEW-test-engineer-DECISIONS-v4.md`
(*Approved with minor changes*, 0 High / 3 Medium / 4 Low), recorded against
`REVIEWED-COMMIT: 2eb5e237` with `UPSTREAM-STATE: TSPEC sha256:5ed76227…` (TSPEC v1.3). TSPEC is now
`sha256:4b5f7f5b…` (v1.4). REQ (`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) are byte-identical
to the versions all three prior approvals were taken against, so this confirmation is again entirely
about the TSPEC delta. DECISIONS' own bytes have not changed since `a0cb8d32`.

**The delta, measured rather than described.** `git diff 2eb5e237..HEAD --
docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` is 68 insertions / 37 deletions across eight hunks —
a materially larger round-5 erratum than the round-4 one I confirmed last time:

| TSPEC hunk | What changed | Touches a DECISIONS claim? |
|---|---|---|
| Header + revision history | Version 1.3 → **1.4**, with a round-5 erratum row enumerating the eight corrections below. | No |
| §1.3 / §6.3 item 4 | REQ OB-1's worktree framing re-grounded: the `.worktreeinclude` evidence bullet is retired because REQ v1.7 landed the consumer-local framing. | No |
| **§2.4, excluded-notice row** | The exclusion is re-argued: **the discriminating conjunct is now the first one — “the resume decision emits it”** — and the row states explicitly that the second conjunct (“about a resolved start point”) does **not** discriminate, because a past-the-end pointer is also a rejected value, is clamped, and still carries a token. Credited `(TE)`. | **Yes — O-5, DEC-WVR-03** |
| §2.5 / §3.4 interaction note | “One interaction FSPEC does not state, **routed upstream**” → “One interaction FSPEC **now states**, ratified here”: FSPEC §3.4 at HEAD carries the operator-pointed-run record clause verbatim, so the erratum is discharged, not open. | No |
| **§3.1 and §6.1 DEC-WVR-06** | Still **three** interpolating reasons, but the value count moves **four → five** (`feature-mismatch`'s renderer names *both* the recorded feature and the run's). | **Yes — O-8, DEC-WVR-06** |
| §5.4 AT-05 | Gains a **write-side conjunct** (PM): `ledgerWrites` non-empty, written `lastGreenWave` plan-absolute. | Yes — reinforces DEC-WVR-04 |
| §5.5 mutation 5 | New mutation: suppressing the record write while `explicitPointer` is true, killed only by AT-05's new write-side conjunct. | Yes — reinforces DEC-WVR-04 |
| §5.7 / §5.8 | `numRuns: 500` pinned rather than left to fast-check's default; `c8.include` grows to four entries with `allow-external`. | No |
| §6.2 OB-F1; §6.3 | OB-F1's re-raise retired — the REQ §10 / FSPEC OB-F1 characterisation inconsistency is closed at HEAD; all four §6.3 errata are marked landed and no `ERRATUM:` line is re-emitted. | No — and it *confirms* DECISIONS' Open row |

**What I checked, beyond the item list (DEC-ERR-03).** The items landing is necessary, not
sufficient, so I went at this from the DECISIONS side rather than the diff side: I grepped the
document for every surface the delta could have moved under it — `interpolat`, `four`, `five`,
`§3.1`, `DEC-WVR-06`, `§2.4`, `resume decision`, `rejected value`, `OB-F1`, `OB-F4`, `RT-1`, `RT-5`,
`postWave`, `V-13`, `§3.4`, `lastGreenWave`, `numRuns`, `coverage`, `85`, `1,637` — and re-read each
hit against TSPEC at v1.4. Two of those surfaces moved:

| DECISIONS site | What it asserts | TSPEC v1.4 at HEAD | Verdict |
|---|---|---|---|
| O-8 (lines 201–207); DEC-WVR-06 (line 360) | “three interpolate run-specific values … **four** interpolated values”, and separately that §3.1 “says *four of the seven reasons* interpolate” | §3.1: three reasons, “carrying **five** interpolated values between them”, because `feature-mismatch` names both the recorded feature and the run's; §6.1 DEC-WVR-06 restates “five values in total” | **Stale — F-01 (delta), F-04 (inherited)** |
| O-5 (line 161); DEC-WVR-03 criterion (lines 146–148, 288) | The past-the-end notice is on the token side “because it is emitted **inside** the resume decision”; the criterion is stated as a two-conjunct biconditional | §2.4 has **adopted the code-location discriminant** as *the* discriminating conjunct and demoted the second — resolving my v4 F-06 in DECISIONS' favour, while leaving DECISIONS' criterion carrying a conjunct upstream now says does not discriminate | **Faithful but over-specified — F-03 (delta)** |

Everything else re-read clean and byte-for-byte unchanged: RT-1's two figures (734,711 B / 738,924 B
at `345ae358`) behind DECISIONS' rebase-churn bullet; RT-5's `M-WG-2` ordering behind the
generated-artifacts bullet (line 472); §3.4's “the diff adds no parameter to `main()`” and the
“no new IO” claim behind O-3, DEC-WVR-02 and DEC-WVR-08 (lines 103, 113, 270, 413); §2.4's “the
shipped assertions that do change remain exactly **three**” behind line 132 and DEC-WVR-03;
V-13's four-key `implementation` surface behind O-5's key-generic-loop argument (line 153); and the
Open table's OB-F1 / OB-F4 / RT-6 rows (lines 446–448). DECISIONS makes **no claim at all** about the
85% floor, `c8.include`, `numRuns`, or the FSPEC §3.4 ratification — those four hunks pass it
without contact.

## Options Considered

Three dispositions were available. I record the rejected two because the interpolated-value drift
makes at least one of them look reachable this round.

### C-1 — Escalate the value-count drift to High and halt the phase *(rejected)*

This round is the first of the four confirmations where the delta actually landed on a DECISIONS
claim rather than passing it by. O-8 and DEC-WVR-06 assert “three reasons carrying **four**
interpolated values”; TSPEC §3.1 at HEAD says **five**. An approved document now contradicts its
upstream on a counted fact, and DEC-ERR-01 is exactly about approved documents asserting things
upstream no longer says. So: is this High?

No, and the test is the one that decides every severity call in my lens — *does a downstream oracle
transcribe the wrong number?*

- **DEC-WVR-06's oracle is over codes, not values.** Consequences (line 436) prescribes “Three
  frozen catalogues, transcribed into a test literal so an addition or deletion reds the
  assertion”, and the decision body (line 361) closes the catalogue as the **code** set —
  `unreadable-json`, `not-an-object`, `wrong-shape`, `feature-mismatch`, `plan-changed`,
  `head-unreachable`, `over-count`. Seven codes. That count is untouched by the delta and is the
  only number the oracle reads. The interpolated-value count appears solely in the *rejected*
  alternative's rationale — it is the reason O-8 loses, not a quantity any assertion pins.
- **Nothing downstream transcribed it.** I grepped PLAN and PROPERTIES for `interpolat`. PLAN's
  only hit is T-07's instruction that the provenance suffix is appended “never interpolated” —
  a different subject. PROPERTIES' only hit (line 512) is the same suffix-never-rebuilt point. No
  fixture, oracle or literal anywhere downstream carries “four” or “five”. The drift is confined to
  a rationale sentence in a rejected alternative.
- **The direction of the correction is DECISIONS-favourable.** §3.1 v1.4 did not overturn
  DECISIONS' position; it refined a count *inside* the position DECISIONS won. Three reasons
  interpolate — the number DECISIONS held against TSPEC v1.1's “four reasons” — is now settled and
  unchanged. Only the value tally moved, and it moved because `feature-mismatch`'s renderer names
  two features, which DECISIONS' own enumeration (line 202, `it records feature "X", not "Y"`)
  visibly contains but counts as one.

A High here would halt Phase D over a parenthetical arithmetic error in a rejected alternative that
no test reads. Rejected: Medium is the honest severity, and Medium routes rather than halts.

### C-2 — Approve with zero findings, since the two settled errata now favour DECISIONS *(rejected)*

Tempting this round in a way it was not last round: the delta actually *resolved* one of my standing
findings. §2.4's re-argument adopts the code-location discriminant, which is precisely what my v4
F-06 (and v3 F-06, v2 F-03) asked for — I filed it three rounds running, upstream has now agreed,
and I retire it below. That is a real reduction in the open set.

But it does not empty the set. Six findings from earlier rounds remain unresolved in DECISIONS'
unchanged bytes, and this round adds two of its own. The erratum machinery reads `FINDING:` lines,
not review history: an open finding that stops being re-filed stops existing, and a non-approving
confirmation carrying zero `FINDING:` lines fails closed and halts the phase. Rejected: it would
launder six live defects through a round that had nothing to do with them.

### C-3 — Approve; re-file every still-open finding as `inherited`, file this round's two as `delta`, retire the one upstream resolved *(chosen)*

Chosen. It states the confirmation's actual answer — DECISIONS still holds, with two claims now in
need of a one-line correction — while keeping the open set honest in both directions: the count
goes down by the finding upstream fixed and up by the two this delta created.

## Decision

**DECISIONS still holds as approved against TSPEC v1.4.** No decision it takes was overturned, no
oracle a downstream author transcribes from it changed, and the one substantive move upstream made
in territory this document occupies — §2.4's discriminant — moved *toward* DECISIONS, not away. Two
sentences are now factually stale against upstream and need a one-line correction in the next
revision; neither is load-bearing on a test. No High finding, so this confirmation approves.

### The one finding this delta resolves

My v2 F-03 / v3 F-06 / v4 F-06 said: O-5 discriminates the past-the-end notice by **code location**
(“emitted inside the resume decision”), while TSPEC §2.4's adopted rule discriminated by **subject
matter** (“about a resolved start point”), and the upstream discriminant was the weaker of the two
because it does not survive contact with a clamped past-the-end pointer. TSPEC v1.4 now says exactly
that, in its own words:

> **The discriminating conjunct is the first one — *the resume decision emits it*.** … The second
> conjunct does **not** discriminate here and is not what excludes it (TE): a past-the-end
> `implementation.startWave` is also a rejected value, is clamped, and still yields a start point
> that carries ` (provenance: operator-set)` in the table above — so “about a rejected value rather
> than a resolved start point” would exclude a row that is in fact included.

Credited to TE, and it is the mechanism DECISIONS argued at line 161. **F-06 is retired**, and the
open count drops accordingly. This is the payoff of the confirmation channel working as designed:
the raise lived three rounds, upstream honoured it, and this round is where it stops being re-filed.

### The full fidelity re-read, not just the changed hunks

DEC-ERR-03's bar is faithfulness at HEAD, not item-list arithmetic, so I re-read every TSPEC passage
DECISIONS leans on at v1.4 — the same six citation families my v3 and v4 passes enumerated, plus the
two the delta newly implicates:

| DECISIONS site | TSPEC dependency | State at v1.4 |
|---|---|---|
| O-3; DEC-WVR-02; DEC-WVR-08 (lines 103, 113, 270, 413) | §3.4's “the diff adds no parameter to `main()`”; the “no new IO” claim (§3.4 line 565, §6.1 DEC-WVR-08 line 899) | Untouched — **faithful**. The §3.4 hunk edited the FSPEC-interaction paragraph, not the seam table. |
| O-5 (line 161); DEC-WVR-03 criterion (146–148, 288) | §2.4's exclusion rule and its discriminating conjunct | **Re-argued in DECISIONS' favour** — faithful on the mechanism, over-specified on the criterion (F-03) |
| O-5 closing parenthetical (line 167) | §2.4's announcement table | Still names the excluded notice in a one-row table — the parenthetical's “omits it entirely … an upstream gap” is **doubly stale** now (F-02) |
| O-5 key list (line 153) | V-13's four-key `implementation` surface | Untouched — **faithful** |
| DEC-WVR-03; line 132 | §2.4's “the shipped assertions that do change remain exactly **three**” | Untouched, and the v1.4 re-argument explicitly re-derives the count as three — **faithful and reinforced** |
| O-8 (201–207); DEC-WVR-06 (360) | §3.1's interpolating-reason and interpolated-value counts | **Three reasons faithful; four-vs-five values stale** (F-01, F-04) |
| DEC-WVR-04 Consequences (line 434) | §5.4 AT-05, §5.5 mutation 5 | AT-05 gained a write-side conjunct and mutation 5 kills write-suppression — **faithful and newly reinforced**; the `head`-conjunct defect (F-06 below) is untouched by it |
| Risks, rebase-churn bullet (line 30) | §6.4 RT-1's two byte figures and their `git ls-tree` provenance | Untouched — **faithful** |
| Risks, generated-artifacts bullet (line 472) | §6.4 RT-5 (`M-WG-2` ordering) | Untouched — **faithful** |
| Open table (446–448) | §6.2 OB-F1, OB-F4; §6.4 RT-6 | OB-F1's re-raise was retired upstream, but its **substance** — BL-04 open and unmet, AT-14 red until rebase, PLAN sequencing precondition — is restated verbatim at v1.4. DECISIONS cites the substance, not the re-raise. **Faithful and reinforced.** |

### Where the delta *does* land, and why it is not a finding here

Four of the eight hunks (§2.5/§3.4 ratification, §5.7's pinned `numRuns: 500`, §5.8's four-entry
`c8.include`, §6.3's landed-errata rewrite) address documents that are not this one. The FSPEC
ratification discharges an erratum FSPEC has already honoured; the `numRuns` pin and the coverage
config are TSPEC-and-PLAN obligations that this DECISIONS never compressed — it holds no position on
run counts or the branch floor, and PROPERTIES transcribes both from PLAN T-08 and T-10, not from
here. They pass this document without contact, exactly as RT-7 did last round.

## Consequences

**For Phase D.** DECISIONS as approved stands. Eight findings are open: two raised this round
(`delta`) and six carried (`inherited`), four Medium and four Low, none gating. They route back to
Phase D's ordinary revision loop, not to a halt. One prior finding (v4 F-06, the O-5 discriminant)
is **retired** — upstream adopted DECISIONS' position.

**For the PROPERTIES author, concretely.** Nothing to change. I checked each of the three oracles a
PROPERTIES author transcribes from this DECISIONS against the delta:

- the announcement **set-equality** oracle (DEC-WVR-03 Consequences, line 433) — transcribed from
  TSPEC §2.4's six announcing rows plus the two enumerated exclusions. The v1.4 re-argument changed
  *why* the config-validation notice is excluded, not *whether* it is, and did not add or remove a
  row. The oracle is byte-identical either way. The **criterion prose** around it is what F-03
  flags: a transcriber who builds a filter on “about a resolved start point” rather than on the
  enumerated literals will wrongly exclude the past-the-end row, which upstream now says explicitly.
  DECISIONS' own Consequences already prescribe the literal enumeration, so the safe path is the one
  already written — but the prose invites the other, and that is worth one sentence in the revision.
- the write-side **key-set equality** for the wave-state record (DEC-WVR-04, line 434) — still
  carrying the `head`-presence conditional flagged as F-06, and now *adjacent* to new upstream
  material: TSPEC AT-05 gained a write-side conjunct and §5.5 gained mutation 5 (suppress the write
  while `explicitPointer` is true). Those strengthen the same seam DECISIONS prescribes and do not
  touch the `head` defect. A PROPERTIES author writing strict key-set equality still needs the two
  admissible key-sets, not one.
- the seven-code **catalogue closure** (DEC-WVR-06, lines 360–361, 436) — unchanged at seven codes,
  three interpolating reasons. The value tally moved four → five upstream, but no oracle reads it
  (F-01), and I confirmed by grep that neither PLAN nor PROPERTIES transcribed either number.

**For the next DECISIONS revision.** The correction list is shorter than v4's in one place and
longer in another. Delete O-5's closing parenthetical (line 167) — the “upstream gap” it raises has
been closed since TSPEC v1.2 and is now doubly false, since v1.4 not only excludes by rule but
credits TE with sharpening the rule. Update O-8's value tally from four to five, or drop the tally
and keep only the reason count of three, which is the number the argument actually needs; and delete
O-8's closing parenthetical (lines 205–207), whose characterisation of §3.1 has been wrong for three
versions. Strike or footnote the second conjunct in DEC-WVR-03's criterion (lines 146–148, 288),
citing §2.4 v1.4. Then the three carried items unchanged from v4: state DEC-WVR-04's `head` conjunct
as two admissible key-sets, add the Consequences observer that DEC-WVR-05's trigger needs, and give
the v1.1 revision-history row a truthful downstream-obligation line.

**For harvest.** The observation I filed as `Process` in v3 and v4 now has a positive instance to
sit beside its negative ones, and the pair is sharper than either alone. **Negative:** an erratum
raise written into the durable document body (O-5's and O-8's closing parentheticals) has no expiry
— nothing in the pipeline retires it when upstream honours the raise, and both have now survived
four confirmations as stale text, one of them acquiring a *second* way of being wrong this round.
**Positive:** a raise kept in the disposable cross-review (my F-06, re-filed each round) was
retired the moment upstream adopted it, cleanly and by the same mechanism that carried it. Same
pipeline, same reviewer, same three rounds — the only variable is where the raise was written. That
is the durable lesson: **file errata in the cross-review, and state only the position taken in the
document body.** Tagged `Process` below (F-05).

A second, smaller harvest note: this is the fourth upstream-cascade confirmation for this document,
and the first where the delta actually reached a claim it makes. Three rounds of “non-interacting”
did not predict the fourth — which is the concrete argument for why a confirmation's finding set
cannot be derived from the delta alone, and why the round must re-read the cited upstream text at
its current version rather than diffing the item list.

## Delta-Confirmation Findings

## Verdict
