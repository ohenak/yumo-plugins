# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (bytes unchanged since v2 approval)
**Cascade trigger:** `REQ-pdlc-advisory-wave-gate.md` v1.15 → v1.16 (`sha256:f97f4f66…`)
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation)

## Context

I approved this DECISIONS at v1.11 (`CROSS-REVIEW-test-engineer-DECISIONS-v2.md`, verdict *Approved
with minor changes*, `APPROVAL-HASH: sha256:ef59893d…`, `REVIEWED-COMMIT: 3143290a`). That approval
recorded its upstream state explicitly:

| Upstream | At my v2 approval | At HEAD now | Moved? |
|---|---|---|---|
| REQ | `sha256:c62cfc35…` (v1.15) | `sha256:f97f4f66…` (v1.16) | **yes — the cascade** |
| FSPEC | `sha256:91ef2557…` (v1.6) | `sha256:91ef2557…` | no |
| TSPEC | `sha256:3fa21acf…` (v1.11) | `sha256:3fa21acf…` | no |
| DECISIONS (subject) | `sha256:ef59893d…` (v1.11) | unchanged | no |

**The delta, in full.** `git diff 3143290a..HEAD -- REQ` is two hunks, twelve inserted lines, two
deleted:

1. Version `1.15` → `1.16` plus a v1.16 changelog paragraph (REQ `:15-23`).
2. **AC-6.3 gains a second sentence** (REQ `:533-536`): *"Where the halt report points the operator
   at a captured pre-A6 tree state, it also warns, in the same place, that re-running this feature
   overwrites that capture — so an operator who intends to inspect it preserves it first, rather
   than losing it to the ordinary next action after a halt (DEC-A6-03)."*

Nothing else in REQ moved — AC-5.1, C-2, C-5, BR/NFR text and the O-table are byte-identical, so the
three other places this record leans on REQ (`:98` and `:195` and `:272` on AC-5.1's ignored-path
map; `:503` and `:535-537` on C-2's `waveBudgetPerRun: 0` affordance; `:441` on AC-5.1's operator
files) are unaffected and I re-confirm them without re-litigating them.

**Why this cascade is not a formality.** The edit is not incidental to this document — it is the
landing of an obligation *this document itself routed*, and DEC-A6-03 contains a paragraph and a
re-evaluation trigger whose truth value is defined by whether that landing has happened. The
question this round answers is therefore narrow and sharp: is DEC-A6-03 still a faithful
compression of REQ as REQ now stands?

## Options Considered

Three dispositions were open for this confirmation.

**A. Confirm unchanged — the delta lands an obligation, DECISIONS wanted it landed, nothing to do.**
This is the reading the item list invites: the routed item landed, so the cascade is satisfied.
Rejected. The item landing is necessary, not sufficient (DEC-ERR-03). DEC-A6-03 does not merely
*want* the obligation landed — it makes a **positive factual claim about upstream's current text**
and hangs a documented gap on it (`DECISIONS:357-362`):

> **The routing has not landed** (PM Q-02, TE): at REQ v1.15 and FSPEC v1.6, `a6-snapshot`, "copy
> the ref" and "overwrit" match nothing in either document, so FSPEC E-28 and AT-05-5 still require
> only that the halt name the failed restoration, and an operator still learns the ref's name at
> halt and nothing about the ordinary next action destroying it. … This entry carries the gap until
> it lands.

I re-ran that document's own grep at HEAD. `overwrit` now matches REQ `:23` and REQ `:535`. The
claim's REQ half is false at HEAD, and it is false in the direction that matters: the record says
*no requirement obliges the halt message to warn*, and at HEAD one does. Confirming unchanged would
leave a decision record asserting the absence of a requirement that exists.

**B. File it as an inherited finding — the paragraph was already there before this round.**
Rejected on provenance grounds. The bytes are inherited; the **falsity is not**. At the moment my v2
approval was taken the paragraph was true — I verified it then and said so in v2's `## Decision`
("at REQ v1.15 and FSPEC v1.6 … still match zero lines … the document is right about its own gap").
This round's edit is precisely what made it false. That is the definition of `delta` provenance:
"this round's edit introduced it". Mis-tagging it `inherited` would route it back as a pre-existing
Phase-D defect and understate that the cascade caused it.

**C. Confirm with a delta finding against DEC-A6-03, scoped to the staleness and its oracle
consequence.** Chosen. See `## Decision`.

**A fourth option I explicitly did not take: re-opening the decision.** DEC-A6-03's *decision* —
`refs/pdlc/a6-snapshot-{waveNum}`, wave-scoped, no run discriminator, overwritten on re-run — is
untouched by this cascade and stays exactly where v1.11 leaves it. REQ v1.16 does not contest the
ref's shape; it obliges the halt report to *say* what that shape costs. The finding below is about
the record's description of upstream, never about which side of the option the decision landed on.

## Decision

**DECISIONS no longer holds as approved against REQ at HEAD.** One High, one Medium, one Low; the
High is `delta` and `local` — it sits in DEC-A6-03, the entry that routed the very item this edit
landed.

### F-01 (High) — DEC-A6-03's "the routing has not landed" is false at HEAD, and it is the sentence a test author would rely on

`DECISIONS:357-362` states, as a checked fact with its own grep evidence, that `a6-snapshot`, "copy
the ref" and "overwrit" match nothing in REQ or FSPEC, and concludes that no requirement obliges the
halt message to warn about the re-run overwrite. I re-ran that grep at HEAD:

| Term | REQ at v1.15 (my v2 approval) | REQ at v1.16 (HEAD) | FSPEC v1.6 (HEAD) |
|---|---|---|---|
| `a6-snapshot` | 0 | 0 | 0 |
| `copy the ref` | 0 | 0 | 0 |
| `overwrit` | 0 | **2 — `:23` (changelog), `:535` (AC-6.3)** | 0 |

REQ AC-6.3 now reads *"Where the halt report points the operator at a captured pre-A6 tree state, it
also warns, in the same place, that re-running this feature overwrites that capture … (DEC-A6-03)"*
— and cites this entry by id. So three of the entry's sentences are now wrong in the same breath:

- "**The routing has not landed**" — it has, on the REQ half.
- "at REQ v1.15 and FSPEC v1.6 … match nothing in **either** document" — half false; the version
  pin is also two versions stale.
- "This entry carries the gap until it lands" — combined with the Re-evaluation trigger *"or the
  halt-message obligation the PM is routing to REQ lands, in which case the remedy stops being
  record-only and this entry's known gap closes"* (`:370-371`), the trigger has **fired** and the
  record does not say so.

**Why this is High in my lens rather than a documentation nit.** The sentence is not decorative —
it is a load-bearing negative claim about what is *required*, and the downstream readers of a
DECISIONS entry are the PLAN and PROPERTIES authors. A PROPERTIES author reading DEC-A6-03 at HEAD
is told, in the record's own voice, that "FSPEC E-28 and AT-05-5 still require only that the halt
name the failed restoration" — i.e. **no property is owed for the warning**. At HEAD a property *is*
owed: AC-6.3 carries an operator-visible, black-box-testable conjunct (the halt report contains, in
the same place as the capture pointer, a warning that re-running overwrites it). A record that tells
the test author an obligation does not exist is the exact mechanism by which an AC ships with zero
oracles, and it is worse than silence — silence prompts a check, a checked-looking negative claim
suppresses one.

**Fix (record-only; no decision moves).** Rewrite the Known-gap paragraph to state the split as it
now stands: REQ v1.16 AC-6.3 **has** landed the operator-facing obligation and cites this entry;
FSPEC v1.6 and TSPEC v1.11 have **not** — `a6-snapshot`/`overwrit` still match zero lines in FSPEC,
FSPEC E-28 (`:309`) and AT-05-5 (`:460`) still require only that the halt "name the failed
restoration", and TSPEC's halt-field contract is still the four literals `{rootCause, diagnosis,
repairApplied, repairPaths}` (`TSPEC:715`, `:1274`, `:1285-1290`) with no warning conjunct. Then
update the Re-evaluation trigger to record that its REQ limb has fired and what remains
(FSPEC/TSPEC/AT), so the entry stops advertising a closed routing as open.

### F-02 (Medium) — the newly landed AC-6.3 conjunct has no oracle anywhere, and this entry is where that should be recorded

This is the testing consequence of F-01 and the reason I did not fold it into it. Having established
that REQ now obliges the warning, I traced it downstream at HEAD and found nothing to fail:

- **FSPEC:** no behavior, no error row and no AT mentions the warning. E-28 (`:309`) and AT-05-5
  (`:460`) stop at "the halt names the failed restoration".
- **TSPEC:** §4.5's halt-field table is a **closed enumeration** of four fields at literal values
  (`:1285-1290`), and §2.3/§5.6's oracles assert those four. A warning string is not among them, so
  no assertion can range over it.
- **Suite at HEAD:** the capture-failure and un-skip halt tests assert the four fields; none reads
  the halt text for an overwrite warning.

DEC-A6-03 is the entry whose Reversibility says the name is "computed in one function and printed in
one halt field" — that sentence now understates the entry's obligation surface, because AC-6.3 adds
a *second* thing that must be printed in that same place. **Fix:** in the same repair as F-01, say
which conjunct is asserted and which is specified-not-asserted — exactly the split this document
already applies well at DEC-A6-04's `waveBudgetPerRun: 0` (`:517-530`) — and name the shape the
oracle wants: the halt report's ref-pointer and its overwrite warning asserted **together, on the
same rendered field**, since "in the same place" is the falsifiable half of AC-6.3 (a warning
emitted elsewhere, or a pointer emitted without it, must go RED). An `expect(report).toContain(ref)`
alone cannot fail that.

### F-03 (Low) — the re-grounding provenance line now cites a REQ hash two versions old

`DECISIONS:42` records "Re-grounded on upstream at HEAD before editing: REQ (`sha256:817b6745…`) and
FSPEC (`sha256:82f74a2d…`) are unchanged from the state v1.8 was authored against". As a historical
statement about the v1.9 edit it is fine, but it is the only REQ hash in the document, and it is now
two versions behind HEAD (`f97f4f66…`, v1.16) with no current pin anywhere — the `Upstream` cell
(`:5`) pins TSPEC only. A reader checking whether this record is current against REQ has nothing to
compare. **Fix:** add the current REQ/FSPEC hashes to the `Upstream` cell, or date-scope `:42`'s
sentence so it reads as provenance for v1.9 rather than a current claim.

### What I re-confirmed and am not re-litigating

The other three REQ-dependent limbs are byte-identical upstream and hold unchanged: AC-5.1's
ignored-path map in both directions (`:98`, `:195`, `:272`), AC-5.1's operator-files reading
(`:441`), and C-2's `waveBudgetPerRun: 0` affordance (`:503`, `:535-537`). v2's F-08 (DEC-A6-02
cardinality oracle) and F-09 (packed-set fixture count) remain open as accepted non-gating items;
both are untouched by this cascade and I do not re-file them.

## Consequences

**For this erratum round.** F-01 is `delta` and `local`, so the correct disposition is one bounded
follow-up edit to DEC-A6-03 — not a halt, and not a return to the ordinary DECISIONS revision loop.
The repair is confined to two paragraphs of one entry (Known gap, Re-evaluation triggers), touches
no decision, and can be verified by re-running the entry's own grep. Nothing in `## Options
Considered`, `## Decision`'s other entries, or `## Consequences` of the subject document moves.

**For the PROPERTIES / test author.** Until F-01 lands, do not read DEC-A6-03's Known-gap paragraph
as authority on what is required. REQ AC-6.3 at HEAD carries two conjuncts on the halt path, and the
second is new: (1) the halt report carries the diagnosis and root-cause class — asserted today via
§4.5's four halt fields; (2) where the report points at a captured pre-A6 tree state, it warns **in
the same place** that re-running overwrites it — asserted nowhere. When it is specified downstream,
the falsifiable form is a co-location oracle over a single rendered field, not two independent
containment checks: a fixture whose halt names the ref must go RED when the warning is removed, and
RED again when the warning is emitted somewhere other than beside the pointer. A pointer-only
`toContain(ref)` passes both regressions.

**For FSPEC and TSPEC (upstream of me, not findings against this document).** The obligation has
landed in REQ and stopped there. FSPEC E-28/AT-05-5 and TSPEC §4.5's closed four-field halt contract
do not yet carry it, so AC-6.3's new sentence currently has no behavioral spec and no acceptance
test to descend into a property. That is the next routing hop, and DEC-A6-03 should name it as such
rather than describing the whole routing as unlanded.

**For harvest — the durable item is the shape of this failure, and it is a repeat.** A decision
record that documents a *routed but unlanded* obligation embeds a negative claim about upstream that
its own upstream is expected to falsify. Its truth has an expiry date built in at authoring time,
yet it is written in the same voice as claims that are stable. This is the fourth instance of the
class my v2 named at Q-02 — claims about **failure modes, visibility and impossibility**, none
falsifiable by the grep-shaped check that confirms a count — and this one is the sharpest, because
here the falsifying edit was *solicited by the document itself*. Worth a durable checklist line in
`LEARNINGS-pdlc-advisory-wave-gate.md`: **any "the routing has not landed" / "X matches nothing in
upstream" sentence must carry the upstream version it was checked against and be re-checked on every
upstream cascade — it is a dated observation, not a decision.** (Recorded here as a harvest item,
not as a Scope tag: this round's table carries Provenance/Locality, not the ordinary-round legend.)
The same rule would have caught this before dispatch.

**No decision entry moved, and none needed to.** DEC-A6-01…DEC-A6-04 stand exactly where v1.11
leaves them. REQ v1.16 ratifies DEC-A6-03's remedy at the operator surface; it does not contest the
ref's wave-scoped shape. The finding is that the record has not noticed it won.

## Recommendation

**Needs revision**

One open High (F-01) → Needs revision, mandatory. The verdict is on the record's *description of its
upstream*, not on any decision: DEC-A6-01…DEC-A6-04 stand where v1.11 leaves them, and no option is
reopened. The blocking repair is confined to two paragraphs of DEC-A6-03:

1. **F-01 (High) — `:357-362` and `:370-371`.** Replace "The routing has not landed … match nothing
   in either document" with the split at HEAD: REQ v1.16 AC-6.3 **has** landed the operator-facing
   warning and cites this entry; FSPEC v1.6 (E-28 `:309`, AT-05-5 `:460`) and TSPEC v1.11 (§4.5's
   four-field halt contract) have not. Mark the Re-evaluation trigger's REQ limb **fired**, naming
   what remains.
2. **F-02 (Medium) — same edit.** Add the specified-vs-asserted split for AC-6.3's new conjunct and
   the co-location oracle it wants (pointer and warning on one rendered field, RED on removal and
   RED on relocation).
3. **F-03 (Low) — `:5` / `:42`.** Pin current REQ/FSPEC hashes, or date-scope `:42` as v1.9
   provenance.

F-01 is tagged `delta`/`local`: the staleness was created by this round's REQ edit and sits in the
entry that routed it, so the correct disposition is one bounded follow-up round on DECISIONS, not a
halt and not a return to the ordinary revision loop. v2's F-08 and F-09 remain open, non-gating and
unchanged by this cascade.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | DEC-A6-03's "**The routing has not landed** … at REQ v1.15 and FSPEC v1.6, `a6-snapshot`, "copy the ref" and "overwrit" match nothing in either document" is false at HEAD: REQ v1.16 AC-6.3 lands the operator-facing warning obligation and cites DEC-A6-03 by id (`overwrit` now matches REQ `:23` and `:535`). The Re-evaluation trigger "or the halt-message obligation the PM is routing to REQ lands … this entry's known gap closes" has fired unrecorded. In my lens this is High rather than cosmetic: the paragraph tells a PROPERTIES author, in the record's voice, that no requirement obliges the warning and therefore no property is owed — a checked-looking negative claim suppresses the check that would find the new AC. **Fix:** state the split — REQ landed, FSPEC v1.6 (E-28 `:309`, AT-05-5 `:460`) and TSPEC v1.11 (§4.5's four-field halt contract) have not — and mark the trigger's REQ limb fired. No decision moves. | `DEC-A6-03` → *Known gap in the remedy's reach* `:357-362` and *Re-evaluation triggers* `:370-371` |
| F-02 | Medium | delta | local | REQ AC-6.3's newly landed conjunct has **no oracle at any level**: FSPEC carries no behavior/AT for it, TSPEC §4.5's halt fields are a closed enumeration of four literals (`:715`, `:1274`, `:1285-1290`) with no warning member, and no test at HEAD reads the halt text for it. DEC-A6-03's Reversibility ("computed in one function and printed in one halt field") now understates the obligation surface — AC-6.3 adds a second thing printed in that same place. **Fix:** apply the specified-vs-asserted split this document already models at DEC-A6-04 `:517-530`, and name the oracle shape: pointer **and** warning asserted together on one rendered field, RED when the warning is deleted and RED when it is emitted away from the pointer — "in the same place" is AC-6.3's falsifiable half, and `toContain(ref)` alone cannot fail either regression. | `DEC-A6-03` → *Reversibility* `:355` and the Known-gap paragraph |
| F-03 | Low | delta | nonlocal | `:42`'s "Re-grounded on upstream at HEAD before editing: REQ (`sha256:817b6745…`)" is the document's only REQ hash and is now two versions behind HEAD (`f97f4f66…`, v1.16); the `Upstream` cell `:5` pins TSPEC only, so a reader has nothing to compare this record against for REQ currency. **Fix:** pin current REQ/FSPEC hashes in the `Upstream` cell, or date-scope `:42` as v1.9 provenance rather than a current claim. | Header table `:5` and preamble `:42` |

FINDING: High | delta | local | DEC-A6-03 "Known gap in the remedy's reach" :357-362 and Re-evaluation triggers :370-371 | The entry asserts "The routing has not landed … `a6-snapshot`, "copy the ref" and "overwrit" match nothing in either document" at REQ v1.15/FSPEC v1.6; at HEAD REQ v1.16 AC-6.3 lands the halt-message overwrite warning and cites DEC-A6-03 by id, so the negative claim is false on its REQ half, the version pin is stale, and the fired Re-evaluation trigger is unrecorded — a PROPERTIES author is told no property is owed for an AC that now exists
FINDING: Medium | delta | local | DEC-A6-03 Reversibility :355 / Known-gap paragraph | REQ AC-6.3's new "warns in the same place that re-running overwrites the capture" conjunct has no oracle at any level (no FSPEC AT, not in TSPEC §4.5's closed four-field halt contract, no test at HEAD); the entry should mark it specified-not-asserted and name the co-location oracle it wants, since a pointer-only containment check cannot falsify either the missing warning or a misplaced one
FINDING: Low | delta | nonlocal | Header `Upstream` cell :5 and preamble :42 | The document's only REQ hash (`sha256:817b6745…`, :42) is two versions behind HEAD (v1.16, `f97f4f66…`) and the `Upstream` cell pins TSPEC alone, leaving no current REQ pin to check this record's currency against

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
