# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 3 (upstream-cascade confirmation, round 3)
**Scope:** Upstream-cascade confirmation. DECISIONS' own bytes are unchanged since my v2 approval
(`sha256:37b3684d…`, matching the `APPROVAL-HASH` recorded there). TSPEC moved underneath it. The
single question answered here: is DECISIONS still a faithful compression of TSPEC **as TSPEC now
stands**? Product lens only.

## Context

**What moved.** My v2 approval of DECISIONS recorded `UPSTREAM-STATE: TSPEC sha256:3cd713c0…`,
which is TSPEC as of commit `0c70e900` ("TSPEC §2.2/§2.3/§3.2 — outcome-qualified lazy-probe").
TSPEC at HEAD is `sha256:458e9ec6…`, commit `b4a628b8`. The erratum round is therefore the range
`0c70e900..b4a628b8` — four commits, 26 insertions and 7 deletions in one file. REQ
(`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) match the hashes my v2 approval pinned; neither
moved, so nothing in this confirmation concerns them.

**What DECISIONS did not do.** `shasum -a 256` over `DECISIONS-pdlc-wave-resume.md` at HEAD returns
`37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46` — byte-identical to the
`APPROVAL-HASH` in my v2 cross-review. The document under review has not been touched. Every
finding below is about DECISIONS' *fidelity to text that changed underneath it*, not about a new
edit to DECISIONS.

**The five substantive upstream edits, and the DECISIONS material each one bears on:**

| # | TSPEC edit (`0c70e900..b4a628b8`) | DECISIONS material that leans on it |
|---|---|---|
| 1 | §3.1 "Why codes and not strings": **four** of the seven reasons interpolate → **three**, carrying **four** interpolated values | O-8 (`:200`–`:207`), DEC-WVR-06 Context (`:359`–`:360`) |
| 2 | §2.4: announcement catalogue **closed by rule**; the excluded invalid-`startWave` notice named in its own table with its exclusion reason | O-5 (`:139`–`:169`), DEC-WVR-03 Consequences row |
| 3 | §6.1 DEC-WVR-02 alternative (b): rejection re-grounded — extraction adds a `main()` parameter and one more adapter binding, **not a host capability** | O-3 (`:91`–`:105`), DEC-WVR-02 Alternatives (`:267`–`:269`) |
| 4 | §6.4 RT-1: `orchestrate-dev.js` is the largest tracked **source module** (734,711 B) and the second-largest tracked file, behind generated `dist/pdlc-cli.mjs` (738,924 B) | Context's measured-surface table, largest-file row (`:44`) |
| 5 | §3.2: duplicated clause ("on the decision on the decision") removed | Nothing in DECISIONS quotes that sentence |

**The shape of the answer.** Edits 3, 4 and 5 move TSPEC *toward* DECISIONS: on the seam-versus-
capability distinction and on the file-size ranking, DECISIONS was already the more careful of the
two documents, and this round brought its upstream into line. Edits 1 and 2 also land the substance
DECISIONS argued for — but they land it in a way DECISIONS could not anticipate, because DECISIONS
does not merely *state* the corrected facts, it states them **alongside a claim about what TSPEC
says**. Those two claims are the whole of this confirmation's findings: they are quotations of and
assertions about upstream text that upstream no longer contains.

## Options Considered

Not the document's options — mine. A cascade confirmation has a narrow catalogue of verdicts, and
naming the ones I rejected is what makes the one I chose auditable.

**(a) Confirm on item-landing alone.** The routed items all landed: §3.1 says three, §2.4 closes by
rule, §6.1 (b) says seam-not-capability, RT-1 gives both file sizes. If the bar were "did the
erratum land", this would be a clean re-approval with no findings. Rejected — DEC-ERR-03 is explicit
that landing is necessary, not sufficient, and the bar is whether *this* document is still a
faithful compression of upstream **at its current version**. Two of DECISIONS' sentences are now
false as statements about TSPEC precisely *because* the items landed. Confirming on item-landing
would ratify a document that misdescribes its own upstream, and would do it in the one round
designed to catch exactly that.

**(b) Raise the two stale erratum notes as High and halt.** Both sentences make an assertion about
upstream that is now untrue, and one of them puts a verbatim quotation in TSPEC's mouth
(`TSPEC §3.1 says "four of the seven reasons interpolate"`) that no longer appears anywhere in the
file — `git grep -n 'four of the seven'` over `docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` at
HEAD returns nothing. Rejected on severity calibration, not on charity. Severity here is measured in
product impact, and I applied three tests:

1. **Does the substantive position change?** No. DECISIONS' own count is *three reasons carrying
   four interpolated values* — which is now, word for word, what §3.1 says. Its own account of the
   §2.4 boundary is the exclusion rule "a notice carries a provenance token iff the resume decision
   emits it about a resolved start point" — which is now, word for word, the rule §2.4 states. On
   the facts that flow downstream into PLAN, PROPERTIES and implementation, DECISIONS and TSPEC are
   in exact agreement. The compression is faithful; the *annotation about the compression* is stale.
2. **Is any P0/P1 requirement narrowed, dropped or reinterpreted?** No. Neither sentence sits in a
   decision clause, a constraint row, a re-evaluation trigger, or a downstream obligation. Both are
   parentheticals in the Options Considered narrative whose grammatical subject is TSPEC, not this
   feature. No acceptance criterion moves if they are struck entirely.
3. **Is this the DEC-ERR-01 shape?** Yes — a delta-confirmation finding that is a false statement in
   a hand-off/bookkeeping section rather than in load-bearing content is demoted, per
   `docs/_decisions/DECISIONS-review-severity-bars.md`. An erratum-tracking parenthetical is
   bookkeeping about the review process by construction: its entire job was to hand an item to the
   round that has now completed.

**(c) Confirm, with the two stale notes recorded as Medium and the two open v2 Lows carried
forward.** Chosen. The defect is real, cheap to fix, and worth naming — a reader of DECISIONS at
HEAD is told that TSPEC contains two defects it does not contain, and told that two errata are
outstanding when both have shipped in TSPEC v1.2. That misdirects the next reader of this document,
which is why it is not a nit. But it gates nothing: no High, so no halt, and the round routes on.

## Decision

**DECISIONS still holds as approved against TSPEC as it now stands.** Confirmed, with two Medium
findings that are corrections to two parenthetical sentences and change no decision.

Section by section, against upstream at HEAD:

**Edit 1 — §3.1's count (O-8, DEC-WVR-06).** TSPEC §3.1 at HEAD (`:425`–`:428`) reads "Three of the
seven reasons interpolate run-specific values — `feature-mismatch`, `head-unreachable` and
`over-count` — carrying four interpolated values between them", and the §6.1 DEC-WVR-06 row now
reads "three of the seven interpolate run-specific values (four values in total, §3.1)". DECISIONS
O-8 says "of the seven disregard reasons, **three** interpolate run-specific values", names the same
three by their rendered sentences, and adds "The other four are fixed sentences"; DEC-WVR-06's
Context says "There are seven, three of which interpolate run-specific values". **The counts agree
exactly, including the reason/value split that was the substance of the erratum.** What does not
agree is DECISIONS' trailing parenthetical (`:205`–`:207`), which quotes TSPEC as saying "four of
the seven reasons interpolate" and describes the correction as "raised as an erratum, not silently
propagated here". The quoted string is gone from TSPEC and the erratum is landed. **F-01.**

**Edit 2 — §2.4's catalogue closure (O-5, DEC-WVR-03).** TSPEC §2.4 at HEAD now carries "The
catalogue is closed by rule, not by omission", states the rule as "A notice carries a provenance
token **iff** the resume decision emits it about a *resolved start point*", and gives the excluded
notice its own table row with the exclusion reason ("emitted by config validation, *before* any
resume decision… about a **rejected value**, not a resolved start point"). DECISIONS O-5 reaches the
same rule by the same mechanical route — `parseImplementationConfig` has already replaced the
rejected value, so `explicitPointer` is false, so FSPEC BR-07's "full run reached by an operator
pointer" does not describe the run. Both documents also land on the same consequence: TSPEC's "the
shipped assertions that do change remain exactly three" and DECISIONS' "The count therefore stays
**three**, and it stays three by a rule a test can apply rather than by an omission". **This is the
strongest agreement in the delta** — the upstream now states the rule DECISIONS supplied. The stale
sentence is again the parenthetical (`:167`–`:169`): "TSPEC §2.4's announcement table omits the
invalid-pointer notice entirely rather than excluding it by rule; that is an upstream gap, raised as
an erratum rather than repaired here." §2.4 no longer omits it and no longer leaves it to inference.
**F-02.**

**Edit 3 — §6.1 DEC-WVR-02 alternative (b).** The old TSPEC row rejected extraction because it "adds
a `main()` parameter and a runtime capability… contradicting REQ C-3's 'no new capabilities'".
DECISIONS O-3 (`:99`–`:100`) had declined to follow that framing, writing instead: "It is a new
*seam over an existing capability*, not a new host capability (the adapter's `rtGit` already answers
`merge-base`)". The erratum round rewrote the TSPEC row to say exactly this — "the probe already
runs through the existing `_git` seam, which `runtime-adapter.js` binds as `rtGit` for both bundles,
so extraction would add a `main()` parameter and one more adapter binding, not a host capability."
**Fidelity improved without DECISIONS moving.** DEC-WVR-02's Alternatives row (`:267`–`:269`) and
its Constraints row survive intact: the constraint it cites, TSPEC §3.4's "the diff adds no
parameter to `main()`", is present verbatim at `TSPEC:556` and was not touched by this round. No
finding.

**Edit 4 — §6.4 RT-1's file-size ranking.** TSPEC RT-1 now says "the largest tracked *source module*
in the repo (734,711 B) and the second-largest tracked file of any kind — the generated
`pdlc/workflows/dist/pdlc-cli.mjs` is larger at 738,924 B (`git ls-tree -r -l origin/main` at
`345ae358`)". DECISIONS' measured-surface row (`:44`) carries the identical two byte counts, the
identical command, and the identical `345ae358` baseline. **Same numbers, same method, same
provenance.** My v2 F-01 remains open against DECISIONS' extra clause "a *generated* artifact built
from the module below" — the artifact header names `orchestrate-dev.js` **and** `cli.mjs` as
inputs — but that clause has no counterpart in TSPEC to have drifted from, so it is inherited, not
cascade. **F-03 (carried).**

**Edit 5 — §3.2's duplicated clause.** Cosmetic, and DECISIONS quotes no sentence from §3.2. No
finding.

**Nothing else in DECISIONS cites changed text.** `grep -n 'TSPEC'` over DECISIONS returns fifteen
citations. Four are to §2.4's three-assertion enumeration (`:132`, `:303`, `:433`, `:458`) — the
edit reaffirmed that count rather than disturbing it. Two are to §3.4 (`:103`, `:270`), untouched.
The remainder are id-mapping (`:232`), OB-F1/OB-F4 and RT-6 (`:446`–`:448`), all outside the diff.
No decision, alternative disposition, constraint, reversibility claim, re-evaluation trigger or
downstream obligation in this document depends on text the erratum round altered.

## Consequences

## Delta-Confirmation Findings

## Recommendation

## Verdict
