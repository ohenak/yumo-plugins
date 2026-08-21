# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation, round v3)

## Overview

**Scope of this round.** An upstream-cascade confirmation. PROPERTIES' own bytes have not moved
since my v2 approval (`REVIEWED-COMMIT: 32a459ef`). What moved is **REQ**: `0cef7148..30d8bf7b`
took it v1.15 → v1.16 (`sha256:c62cfc35…` → `sha256:f97f4f66…`, +12/−2 lines), landing DEC-A6-03's
operator-facing halt-message obligation into **AC-6.3**. DECISIONS also moved since my v2 anchor
(`sha256:84deee10…` → `sha256:ef59893d…`, `3143290a` reconciling the v1.10 note with v1.11's
re-grounding); FSPEC (`91ef2557`), TSPEC (`3fa21acf`) and PLAN (`f7de7fc…`) are byte-identical to
the versions I approved against.

**The one question, answered:** **no** — PROPERTIES no longer holds as approved. It is still a
faithful compression of everything REQ said at v1.15, and I re-litigate none of it. But AC-6.3 at
HEAD carries a **second, independently falsifiable conjunct** that did not exist when I approved:

> Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture (DEC-A6-03).

That conjunct has **no property home anywhere in this document**, and — because FSPEC, TSPEC and
PLAN did not cascade — no home downstream either. §G-4 still closes with "None. Every REQ acceptance
criterion and NFR yielded at least one falsifiable property (matrix C-1)", which was true at v1.15
and is now true only at AC granularity, not at conjunct granularity. That is F-01, High.

A second, narrower consequence follows from where the warning could physically go: both candidate
carriers are already pinned by properties I approved (F-02, Medium). And the document's own grounding
pins name REQ v1.15 (F-03, Low).

**What I did not do.** I did not re-read the 40 property rows, the oracle catalogue or the fixture
table from scratch, and I raise nothing about them beyond what the REQ delta touches. My v2 findings
(F-01/F-02 PLAN task-id drift, F-03 PROP-ENV-13's routed run-level conjuncts) are unchanged by this
edit and are not re-filed here — they remain open, non-gating, in the v2 record.

## Properties

### The delta, read at REQ HEAD

REQ v1.16 adds to AC-6.3 (REQ §"AC-6.3", the `*(US-02.)*` bullet):

> Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture — so an operator who intends to
> inspect it preserves it first, rather than losing it to the ordinary next action after a halt
> (DEC-A6-03).

This is a genuine new observable, not a restatement. DECISIONS DEC-A6-03 §"Known gap in the remedy's
reach (PM F-05)" is explicit that it was **not** landed before this round: "at REQ v1.15 and FSPEC
v1.6, `a6-snapshot`, 'copy the ref' and 'overwrit' match nothing in either document, so FSPEC E-28
and AT-05-5 still require only that the halt name the failed restoration". The REQ erratum closes
that gap on the REQ side only.

### Coverage of the new conjunct in this document — none

Matrix C-1's row is unchanged: `| AC-6.3 | PROP-REC-05, PROP-REST-08 |`. Neither reaches the
conjunct:

- **PROP-REC-05** (§F) asserts the halt report carries *the diagnosis and the root-cause class* in
  its `advisory` fields. That is AC-6.3's first half. It says nothing about the capture, the ref, or
  the re-run consequence, and its Traces cell (`AC-6.3, AT-06-4, BR-14, TSPEC §4.5`) points only at
  material that predates the erratum — AT-06-4 at FSPEC HEAD is "halt report following an escalation
  carries the root-cause class" (TSPEC §5.6 row), which is the same first half.
- **PROP-REST-08** (§E) is the `captureTreeSnapshot === null` path — E-34's observable, where *no
  capture exists*. AC-6.3's new conjunct is antecedent-guarded on "where the halt report points the
  operator at a captured pre-A6 tree state", so on PROP-REST-08's fixture the conjunct is vacuous by
  construction. It cannot be this obligation's home even in principle.

No other property in §§A–H mentions the ref name, the capture's operator-facing description, or a
re-run warning; `grep -n "overwrit|re-running|preserve"` over PROPERTIES matches nothing outside the
changelog. So the obligation ships with zero falsifiable coverage in the document whose stated job is
to leave every AC with at least one falsifiable property. **F-01, High.**

Downstream cannot absorb it either, and I checked rather than assumed: FSPEC at `91ef2557` and TSPEC
at `3fa21acf` are the bytes I approved against, and PLAN at `f7de7fc…` mints no task for it — the
same `overwrit`/`a6-snapshot` grep over FSPEC returns nothing operator-facing, and TSPEC's only
matches (§2.5 lines 522–541, §6 OQ-2) are the *design record* of the cost, explicitly noted there as
what wave-scoping "does **not** buy". Nothing between this document and the implementation will mint
a test for AC-6.3's second half.

### Nothing I approved is contradicted outright — but two carriers are pinned

I looked for the opposite failure mode too: a property I approved that the new AC now falsifies.
There is none, and that is worth stating so a later reader does not re-derive it. There is, however,
a real slot problem, which is why F-02 is filed rather than waved through:

- If the warning is carried on the **halt reason string**, it falsifies **PROP-REST-09**, which
  asserts that on a wave A6 did not resolve "the halt reason string must **equal** the reason the
  pre-A6 pipeline emits for the same gate failure" (Traces `AC-5.2, AT-05-3, BR-14, E-23, M-WG-3`).
  Equality, not containment. AC-6.3's antecedent — a halt pointing at a captured tree state — is
  exactly PROP-REST-09's case, so the two are in direct tension on that carrier.
- If it is carried in the **`advisory` halt fields**, TSPEC §4.5's object is the four-member
  `{rootCause, diagnosis, repairApplied, repairPaths}` (TSPEC §"Call shape" row, line 1308), and
  TSPEC §6 OQ-13 has already decided that `diagnosis` "stays the fixed, transcribable sentence" —
  "a variable tail would make that oracle untestable". So the warning cannot ride `diagnosis`, and a
  fifth field is a TSPEC edit, not a PROPERTIES one.

Neither carrier is available without an upstream decision. That is a Medium finding against this
document only in the sense that it constrains how F-01 can be resolved — the decision itself is
FSPEC/TSPEC's, and I say so in the finding rather than pretending PROPERTIES can fix it alone.

## Oracles

The document's oracle catalogue (§"Oracles", O-A…O-H) is unchanged by this delta and I re-read only
the two entries the new AC-6.3 conjunct would land in.

**No oracle exists for the new conjunct.** The halt-report oracles in §Oracles pin three literals —
the pre-A6 gate-failure literal (`Error: Wave {N} test gate failed — \`{testCommand}\` did not pass.
Output tail:\n{tail}`, Fixtures §"Pre-A6 baseline"), the capture-failure `diagnosis` sentence
(`snapshot capture failed (snapshot-unavailable); no repair was proposed and none was applied`), and
§4.5's four advisory fields. An operator-facing warning string is a fourth literal with no owner. Per
this document's own convention — exact user-facing strings are owned by the lowest layer that pins
them — the warning's text would be TSPEC's or this document's to pin, and neither does.

**The oracle shape F-01's fix needs, stated so the next round does not have to derive it.** The
conjunct is antecedent-guarded ("*where* the halt report points the operator at a captured pre-A6
tree state"), so its oracle needs a fixture on which a capture **succeeded** and the wave then
halted — the applied-repair/red-re-gate run (PROP-GATE-05's case) or the refusal-after-capture run,
not PROP-REST-08's `captureTreeSnapshot === null` run, where the antecedent is false and any
assertion passes vacuously. A property written on the E-34 fixture would be a green test that proves
nothing, which is the specific mistake worth naming in advance.

**Containment, not equality, is the right form for it** — and that observation is what makes F-02
resolvable without reopening PROP-REST-09. If the upstream slot decision puts the warning in a new
advisory field, the oracle is a literal equality on that field and PROP-REST-09's reason-string
equality survives untouched. If it puts the warning in the reason string, PROP-REST-09's `must
equal the reason the pre-A6 pipeline emits` has to become a containment assertion on that path, and
that is a change to a property I approved — it cannot be made silently in an erratum.

One thing the existing catalogue does get right and I am not asking to change: Oracle H's honesty
about prompt-only territory. The re-run warning is **not** prompt-only — it is a fixed string emitted
by the workflow script at a known call site, so NFR-1's "every boundary enforced by the script, never
only by prompt" applies to it and PROP-NFR-03's partition reasoning is the precedent to follow.

## Fixtures

*(pending)*

## Delta-Confirmation Findings

*(pending)*

## Recommendation

*(pending)*
