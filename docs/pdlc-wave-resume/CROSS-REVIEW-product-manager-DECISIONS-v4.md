# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4 (upstream-cascade confirmation, round 4)
**Scope:** Upstream-cascade confirmation. DECISIONS' own bytes are unchanged since the v2 approval
(`sha256:37b3684d…`); TSPEC moved underneath it a fourth time. One question is answered: **is
DECISIONS still a faithful compression of TSPEC as TSPEC now stands?** Product lens only.

## Context

**What moved.** My v3 confirmation re-took the approval against TSPEC `sha256:458e9ec6…`, commit
`b4a628b8`. TSPEC at HEAD is `sha256:5ed76227…`. The round-4 erratum range `b4a628b8..HEAD` is three
commits over one file — 9 insertions, 4 deletions, all of it in two places plus the version header:

| # | TSPEC edit | Where |
|---|---|---|
| 1 | Version bumped `1.2` → `1.3`, with a revision-history row recording the round-4 erratum | `TSPEC:7`, `TSPEC:20` |
| 2 | §5.8's coverage floor re-assigned from "the last implementation wave's `postWaveCommand`" to the **last implementation task** (PLAN T-10, RK-2), with the reason stated: V-13 closes the config surface at four keys with a single *global* `postWaveCommand`, so a per-wave-scoped setting is not expressible, and a global one would run `test:coverage` after every wave | `TSPEC:846`–`:852` |
| 3 | §6.4's RT-7 mitigation rewritten to match, same substitution and same reason, backstop retained verbatim | `TSPEC:918` |

REQ (`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) match what my v2 approval pinned and what v3
re-confirmed. Neither moved. Nothing in this confirmation concerns them.

**What DECISIONS did not do.** `shasum -a 256` over `DECISIONS-pdlc-wave-resume.md` at HEAD returns
`37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46` — byte-identical to the
`APPROVAL-HASH` recorded in my v2 cross-review and re-affirmed in v3. The document under review has
not been touched for three rounds. Every question here is about whether text changed *underneath*
it.

**Does DECISIONS lean on what moved?** This is the whole confirmation, so it was answered
mechanically before anything else. `grep -n -i "postWave\|coverage\|85\|RT-7\|5\.8\|V-13\|four
keys\|T-10\|RK-2"` over DECISIONS at HEAD returns exactly **two** lines, and neither is a citation
of the moved text:

| DECISIONS line | What it says | Status against TSPEC at HEAD |
|---|---|---|
| `:153` | The invalid-value notice is emitted by a key-generic loop "shared verbatim by every `implementation` key (`testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave`)" | Holds. `TSPEC:63` (V-13) and `TSPEC:561` both still close the surface at exactly those four keys; the erratum *reaffirms* V-13 rather than changing it |
| `:472` | "Any wave whose tasks touch the module must name the dist path in `implementation.postWavePathspecs`; the post-wave command runs before the gate" | Holds. `TSPEC:916` (RT-5) still states both halves, and RT-5 was not in the erratum range |

**The shape of the answer.** DECISIONS never cited §5.8, never cited RT-7, and never took a position
on where the coverage floor is enforced — that is a test-strategy and sequencing question, which is
why it lives in TSPEC and PLAN and not here. The one config fact DECISIONS *does* rely on —
`postWaveCommand` is one of four recognised `implementation` keys, and it is global — is the fact the
erratum leaned on to make its correction. Upstream moved toward this document's premise, not away
from it. This is a clean cascade with no product surface touched.

## Options Considered

Not the document's options — mine. A cascade confirmation has a narrow catalogue of verdicts, and
naming the ones I rejected is what makes the one I chose auditable.

**(a) Confirm with no findings, since the delta does not touch anything DECISIONS cites.** Tempting,
and the grep in Context supports the first half of it. Rejected — not because the cascade analysis is
wrong, but because DEC-ERR-03 makes this round's scope *this document measured against its upstream
at HEAD*, not *this document measured against the delta*. Two Medium findings from v3 and two Lows
from v2 are still open in bytes that have not changed. Dropping them because this particular edit did
not touch them would quietly retire findings that were never addressed, and would make the v4 record
read as if the document had improved when it has not moved at all.

**(b) Escalate the two open Medium stale-erratum notes to High, on the grounds that they have now
survived two rounds.** Rejected. Severity is calibrated to user impact, not to age. Both sentences
are still parentheticals inside `## Options Considered` narrative, both still have TSPEC as their
grammatical subject rather than this feature, and striking either one entirely still moves no
acceptance criterion, no constraint row, no re-evaluation trigger and no downstream obligation. The
DEC-ERR-01 demotion that applied in v3 applies unchanged — a false statement in a hand-off or
bookkeeping section is demoted, not promoted, and persistence does not convert bookkeeping into
load-bearing content. Inflating severity to attract attention is exactly what the Scope tags exist to
make unnecessary.

**(c) Raise a finding that DECISIONS should have absorbed the round-4 coverage-floor correction.**
Rejected as out of lens and factually wrong. PLAN already owns this: `PLAN:286` records "Coverage
floor | **T-10**, not `postWaveCommand`" with the erratum it raised, and `PLAN:377` carries it as
RK-2. The correction travelled REQ→FSPEC→TSPEC→PLAN and landed where the obligation is executed.
DECISIONS is a compression of the *decisions taken for this feature*; where a test gate runs is not
one of them, and asking DECISIONS to grow a section for it would be scope creep into a sibling
document.

**(d) Confirm, carrying the two open Mediums and two open Lows forward unchanged, all tagged
`inherited`.** Chosen. It is the only reading that is honest in both directions: the cascade is
clean, and the document's four known defects are still there. Tagging them `inherited` is what keeps
them non-gating and routes them to the owning phase rather than halting this one — which is the
correct disposition for findings that this edit neither introduced nor was asked to fix.

## Decision

**DECISIONS still holds as approved against TSPEC as it now stands.** Confirmed. No new finding is
raised by this round's delta; four findings are carried forward, all `inherited`, none gating.

Edit by edit, against TSPEC at HEAD:

**Edit 1 — the version header and revision-history row (`TSPEC:7`, `TSPEC:20`).** Bookkeeping.
DECISIONS pins no TSPEC version number anywhere — `grep -n "TSPEC v1"` over DECISIONS returns
nothing, so the bump cannot falsify a citation. Worth noting for its own sake: the new row states
"Corrections only; no decision re-litigated and no scope change", and the diff bears that out — the
floor itself, its 85% threshold and its backstop are carried through unchanged. That is the erratum
mechanism behaving as designed, and it is what makes this confirmation cheap.

**Edit 2 — §5.8's coverage floor re-assigned to the last implementation task (`TSPEC:846`–`:852`).**
The substitution is `the last implementation wave's postWaveCommand` → `the last implementation task
(PLAN T-10, RK-2)`, with the reason now stated inline. DECISIONS says nothing about §5.8, the
coverage floor, the 85% branch threshold, T-10 or RK-2 — verified by grep, reported in Context. The
one adjacent fact DECISIONS does assert is `:153`'s enumeration of the four `implementation` keys,
and the erratum's own justification quotes that same four-key surface (V-13) as its premise. Both
documents now say, independently, that `postWaveCommand` is a single global key. **The compression is
faithful and got no less faithful.** No finding.

**Edit 3 — RT-7's mitigation rewritten to match (`TSPEC:918`).** Same substitution, same reason,
backstop preserved word for word ("the per-arm unit coverage of §5.3 and the generative suite of §5.7
are designed to cover the added branches directly, and the risk degrades to a PUB-time finding rather
than a silent one"). DECISIONS' own risk material is in `## Consequences` and in the measured-surface
table; neither cites RT-7. The nearest neighbour is DECISIONS `:472`, which cites the *post-wave
command runs before the gate* fact that RT-**5** owns — and `TSPEC:916` still states it verbatim,
outside the erratum range. No finding.

**What is still open, and unchanged.** Four findings, none introduced by this round:

- **Medium (was v3 F-01, now F-01).** DECISIONS `:205`–`:207` quotes TSPEC §3.1 as saying "four of
  the seven reasons interpolate" and reports the correction as an outstanding erratum. `git grep -n
  'four of the seven'` over TSPEC at HEAD returns **no hits**; `TSPEC:426`–`:428` reads "Three of the
  seven reasons interpolate run-specific values … carrying four interpolated values between them",
  which is DECISIONS' own count, adopted. The substantive sentence above the parenthetical
  (`:200`–`:204`) is correct and should not change; only the parenthetical's tense and attribution
  are stale.
- **Medium (was v3 F-02, now F-02).** DECISIONS `:167`–`:169` asserts "TSPEC §2.4's announcement
  table omits the invalid-pointer notice entirely rather than excluding it by rule; that is an
  upstream gap". §2.4 at HEAD closes the catalogue by rule, states the `iff` criterion, and gives the
  excluded notice its own table row with an exclusion reason. The gap the sentence reports no longer
  exists.
- **Low (was v2 F-01, v3 F-03, now F-03).** DECISIONS `:44`'s measured-surface row calls
  `pdlc/workflows/dist/pdlc-cli.mjs` "a *generated* artifact built from the module below"; the
  artifact's own header names `orchestrate-dev.js` **and** `cli.mjs` as inputs. Re-verified at HEAD;
  still open.
- **Low (was v2 F-02, v3 F-04, now F-04).** DEC-WVR-05's `*(observable)*` re-evaluation trigger
  depends on a contiguity property that no assertion in its Consequences row owes, so the trigger has
  no detector. Untouched this round; still open.

## Consequences

**For this document.** Nothing new is owed by this round. The two Medium corrections named in v3 are
still owed and are still one-line edits inside parentheses, neither touching a decision clause:

- `:205`–`:207` — re-attribute the quoted count to the TSPEC version that said it ("TSPEC v1.1 §3.1
  said…") and record that the erratum landed in v1.2, rather than reporting it as outstanding. Keep
  the substantive count sentence above exactly as written.
- `:167`–`:169` — same shape. §2.4 now closes the catalogue by the rule DECISIONS supplied, so the
  note should record the repair rather than assert the gap. Keep the O-5 argument above untouched.

The general form is worth restating once, because it recurs every time an erratum round succeeds: **a
document that flags a defect in its upstream acquires a maintenance obligation the moment that defect
is fixed.** A flag written in the present tense about a file that is about to change is a sentence
guaranteed to go stale on success. The durable fix is not to stop flagging — flagging upstream
defects instead of silently propagating them is exactly right, and DECISIONS did it twice — but to
write the flag so that landing the erratum does not falsify it: attribute it to a version, or state
the correction without a claim about what upstream currently says. Tagged `Process` in v3 for the
same reason it stays `Process` here: it is a property of the erratum mechanism, not of this feature.
This round is the second consecutive confirmation in which the observation recurs, which is itself
the signal that it belongs in process learnings at harvest rather than in this file.

**For downstream phases.** None. PLAN and PROPERTIES consume DECISIONS' decision clauses, constraint
rows and obligations; all are unchanged and all still match TSPEC at HEAD. Specifically re-checked
against this delta: the seven-code set equality (DEC-WVR-06), the three-shipped-assertion count and
the announcement set-equality oracle with its enumerated exclusions (DEC-WVR-03), the 48-line
extraction and its "no new `main()` parameter" constraint (DEC-WVR-02), the plan-absolute high-water
mark (DEC-WVR-05) and AT-16 (DEC-WVR-07). None is touched by a coverage-floor reassignment, and the
one config fact any of them leans on — the four-key `implementation` surface — is reaffirmed by the
edit rather than moved. **PLAN already carries the correction** (`PLAN:286`, `PLAN:377`/RK-2), so the
erratum has landed where the obligation is executed; no downstream document is left citing the
superseded wording.

**For the approval record.** My v3 confirmation was taken against TSPEC `458e9ec6…`, which no longer
exists. This confirmation re-takes it against `5ed76227…`. REQ and FSPEC are unmoved from what v2
pinned. DECISIONS' own bytes are unchanged at `37b3684d…`, so the v2 `APPROVAL-HASH` still describes
the approved artifact exactly and is re-appended below unchanged.

**Residual risk accepted.** I verified the two stale notes by grep against TSPEC at HEAD (`four of
the seven` → no hits; §2.4's excluded-notice table row → present) and verified the two cascade-facing
citations at `:153` and `:472` against `TSPEC:63`, `:561` and `:916`. I did **not** re-derive the
byte counts in DECISIONS' measured-surface table against `origin/main`; I re-derived them at v2,
DECISIONS' bytes have not changed since, and both documents pin `345ae358`. That is a bounded, stated
gap, not an unexamined one.

## Positive Observations

- **The erratum corrected upstream without disturbing this document's premises.** The round-4 edit
  had to justify itself against the config surface, and the surface it invoked — V-13's four keys,
  with `postWaveCommand` global — is the same fact DECISIONS `:153` relies on for an unrelated
  argument about the key-generic validation loop. Two documents reasoning independently from the same
  shipped constant, arriving at consistent conclusions, is what a faithful compression looks like
  from the outside.
- **The correction landed where the obligation is executed.** TSPEC states the floor; PLAN's T-10 and
  RK-2 run it. Reassigning the floor from a wave-level config key to a named task moved the
  requirement to the artifact that can actually discharge it, rather than leaving a gate specified in
  terms of a setting that cannot express it. From the product lens, the 85% floor is what users of
  this pipeline get; where it runs is an implementation detail, and it is now stated in a way that is
  executable rather than aspirational.
- **The backstop survived the rewrite verbatim.** RT-7's fallback — per-arm unit coverage plus the
  generative suite, with the risk degrading to a PUB-time finding rather than a silent one — is
  carried through the edit word for word. Erratum rounds are where mitigations quietly get lost; this
  one did not lose it.
- **Three consecutive rounds of upstream churn, zero product surface touched.** DECISIONS has been
  byte-stable across v2, v3 and v4 while TSPEC moved three times. No P0 or P1 requirement has been
  narrowed, dropped or reinterpreted by any of it, and no re-evaluation trigger has fired. That
  stability is evidence the decisions were compressed at the right altitude.

## Recommendation

**Approved with minor changes.**

DECISIONS remains approved against TSPEC at `sha256:5ed76227…`. No High findings, and none carried.
This round's delta touches §5.8, §6.4's RT-7 row and the version header; DECISIONS cites none of the
three, and the one config fact it does rely on (V-13's four-key `implementation` surface, DECISIONS
`:153`) is reaffirmed by the edit rather than moved. Every decision clause, alternative disposition,
constraint row, reversibility claim, re-evaluation trigger and downstream obligation in the document
remains a faithful compression of upstream at HEAD. No P0 or P1 requirement is narrowed, dropped or
reinterpreted, and no re-triggered cascade is owed.

Four findings are carried forward, all `inherited` and all non-gating — no round has yet addressed
them, and this edit was not asked to:

1. **F-01** (Medium) `:205`–`:207`: parenthetical quotes TSPEC §3.1 saying "four of the seven reasons
   interpolate" and reports the erratum as outstanding. Re-attribute to TSPEC v1.1; record that it
   landed in v1.2.
2. **F-02** (Medium) `:167`–`:169`: parenthetical asserts §2.4 "omits the invalid-pointer notice
   entirely rather than excluding it by rule". §2.4 now excludes it by rule and names it. Same fix.
3. **F-03** (Low) `:44`: measured-surface row names one build input where the artifact header names
   two.
4. **F-04** (Low): DEC-WVR-05's `*(observable)*` trigger has no detector owed in its Consequences
   row.

None blocks Phase P.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | O-8's closing parenthetical quotes TSPEC §3.1 as saying "four of the seven reasons interpolate" and reports the correction as an outstanding erratum. `git grep -n 'four of the seven'` over TSPEC at HEAD returns no hits; `TSPEC:426`–`:428` states three reasons carrying four interpolated values — DECISIONS' own count. Carried from v3 F-01, unresolved; the round-4 edit did not touch §3.1 or this text. Fix: re-attribute to TSPEC v1.1, record that the erratum landed in v1.2, leave the substantive count sentence unchanged. | `## Options Considered` → O-8 (`DECISIONS:205`–`:207`) |
| F-02 | Medium | inherited | nonlocal | O-5's closing parenthetical asserts "TSPEC §2.4's announcement table omits the invalid-pointer notice entirely rather than excluding it by rule; that is an upstream gap". §2.4 at HEAD closes the catalogue by rule, states the `iff` criterion, and gives the notice its own table row with an exclusion reason. The gap the sentence reports no longer exists. Carried from v3 F-02, unresolved; untouched by the round-4 edit. Same tense/version re-attribution fix; the O-5 argument above it stands. | `## Options Considered` → O-5 (`DECISIONS:167`–`:169`) |
| F-03 | Low | inherited | nonlocal | The measured-surface row calls `dist/pdlc-cli.mjs` "a *generated* artifact built from the module below"; the artifact's own header names `orchestrate-dev.js` **and** `cli.mjs` as inputs. Carried from v2 F-01 and v3 F-03, unresolved; TSPEC RT-1 makes no competing claim, so this is document-local drift, not cascade. | `## Context` → measured-surface table, largest-file row (`DECISIONS:44`) |
| F-04 | Low | inherited | nonlocal | DEC-WVR-05's `*(observable)*` re-evaluation trigger relies on a contiguity property that no assertion in its Consequences row owes, so the trigger has no detector and cannot fire. Carried from v2 F-02 and v3 F-04, unresolved; untouched this round. | `## Decision` → DEC-WVR-05 Consequences/trigger (`DECISIONS:331`–`:356`) |

FINDING: Medium | inherited | nonlocal | O-8 parenthetical, DECISIONS:205-207 | Quotes TSPEC §3.1 as saying "four of the seven reasons interpolate" and reports the correction as an outstanding erratum; §3.1 at HEAD says three reasons carrying four values and the quoted string is absent from TSPEC. Carried from v3 F-01, unresolved, not touched by the round-4 edit. Re-attribute to TSPEC v1.1 and record that the erratum landed in v1.2; the substantive count sentence above it does not change.
FINDING: Medium | inherited | nonlocal | O-5 parenthetical, DECISIONS:167-169 | Asserts TSPEC §2.4's announcement table omits the invalid-pointer notice entirely rather than excluding it by rule, and calls that an upstream gap; §2.4 at HEAD closes the catalogue by rule and gives the notice its own row with an exclusion reason. Carried from v3 F-02, unresolved, not touched by the round-4 edit. Tense/version re-attribution; O-5's argument stands.
FINDING: Low | inherited | nonlocal | measured-surface table largest-file row, DECISIONS:44 | Calls `dist/pdlc-cli.mjs` a generated artifact built from the module below; its own header names `orchestrate-dev.js` and `cli.mjs` as inputs. Carried from v2 F-01 and v3 F-03, non-gating, still unresolved.
FINDING: Low | inherited | nonlocal | DEC-WVR-05 Consequences/trigger, DECISIONS:331-356 | The `*(observable)*` re-evaluation trigger depends on a contiguity property that no assertion in the Consequences row owes, so no detector exists to make the trigger fire. Carried from v2 F-02 and v3 F-04, non-gating, untouched this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
APPROVAL-HASH-NORMALIZED: sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
REVIEWED-COMMIT: 18c629a879bb48cdf052e97aebf7440a10afbe94
UPSTREAM-STATE: REQ sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f
UPSTREAM-STATE: FSPEC sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e
UPSTREAM-STATE: TSPEC sha256:5ed76227d8e4cb5b37681421d30a3c50d29e755a7334d37e5ef09c996832234a
