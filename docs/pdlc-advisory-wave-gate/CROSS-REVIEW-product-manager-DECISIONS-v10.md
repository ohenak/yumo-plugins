# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.8, bytes unchanged)
**Upstream re-measured:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (sha256:1531143c…)
**Date:** 2026-08-19
**Iteration:** 10 (upstream-cascade confirmation)

## Context

DECISIONS was approved at round 9 against `REVIEWED-COMMIT: 9a1934db` with
`UPSTREAM-STATE: TSPEC sha256:4a092e85…`. Its own bytes have not moved since (`d0b7d308`, v1.8 —
the relocation of the sizing block into `SIZING-pdlc-advisory-wave-gate.md`). What moved is TSPEC:
commit `1f2a4fbf` ("size PROP-SWEEP-2(b) residue in 1.3 and route it to PLAN (Phase P erratum)"),
+18/−1, which takes TSPEC to sha256:1531143c… . REQ (sha256:817b6745…) and FSPEC
(sha256:82f74a2d…) are byte-identical to the anchors on my v9, so only the TSPEC edge needs
re-measuring.

The edit does two things, both inside §1.3 ("What is deliberately not additive") and its changelog
mirror:

1. The v1.10 changelog paragraph gains a `**Phase-P erratum (this dispatch):**` sentence recording
   that §1.3's repository-hygiene note had sized the `e3b9d5a3` residue as the tracked
   `.pdlc-backups/*.bak` blobs alone, which under-states it and names no owner.
2. §1.3 gains a new paragraph, *"Sizing the hygiene residue, and where it is owned"*, stating
   `PROP-SWEEP-2(b)`'s measured residual as **28 tracked paths in three classes** at PLAN's dated
   2026-08-19 measurement — 14 `.bak` blobs, four consumer-runtime artifacts, and this feature's own
   tracked documents — of which untracking the `.bak` class closes 14; and routing the partition,
   the owners and the figures to **PLAN's Overview HEAD-drift note and A6-00's Edit 1**.

No design claim moves, and the sentence DECISIONS actually leans on is untouched in substance: the
choice of remedy for the early-landed transcription "is PLAN's and Phase I's to make, not this
document's".

The single question for this round: is DECISIONS still a faithful compression of TSPEC as it now
stands?

## Options Considered

Three readings of the cascade were available, and I measured rather than assumed which applies.

**(a) The edit lands entirely in prose DECISIONS never cites — confirmation is a formality.**
Rejected as an assumption: DECISIONS does cite §1.3 by name. Line 333 reads *"TSPEC §5.1's status
caveat and §1.3 are the carriers of repo state for this feature, and whether the early-landed edits
are reverted or PLAN's batches are re-derived around them is PLAN's call."* That sentence points
straight into the edited section, so the edge had to be re-read at HEAD, not waved through.

**(b) The edit re-homes repo-state ownership away from §1.3 to PLAN, falsifying DECISIONS' "§1.3 is
a carrier" clause.** Checked and rejected on the bytes. The new paragraph says TSPEC "states the
size only so that no reader of this paragraph mistakes the `.bak` blobs for the whole residue" —
it *adds* repo-state to §1.3, and defers only the **partition, owners, disposition and figures** to
PLAN. DECISIONS' clause claims §1.3 carries repo state and that the remedy choice is PLAN's. Both
halves are now more true than at v9, not less: TSPEC's own changelog sentence still ends "is PLAN's
and Phase I's to make, not this document's, and is routed there as an erratum."

**(c) The edit introduces figures that collide with figures DECISIONS still carries.** Checked and
rejected. The only number DECISIONS still states in its own bytes is column (1)'s **four**
(three production constants plus `advisoryRecord.test.js`'s five-member seam literal). TSPEC's new
figures — 28, three classes, 14 closable — are a different measurement (the retirement sweep's
tracked-path residue) on a different surface. `grep -n "28\|\b14\b\|bak\|backup"` over DECISIONS
returns exactly one hit, `FSPEC E-28`, which is a requirement id and not a count. There is no
double-carriage of the new figures, which is precisely the POSTMORTEM-D §6 step 1 discipline v1.8
adopted: DECISIONS restates none of the short-shelf-life totals.

I also re-ran the underlying oracle rather than trusting TSPEC's stated number, since DECISIONS'
credibility on this edge depends on the upstream figure being reproducible. Assembling L-2's seven
terms against `git ls-files` and subtracting A-1's frozen glob list returns **33** paths at HEAD,
not 28 — which *agrees* with TSPEC rather than contradicting it: TSPEC dates its figure to PLAN's
2026-08-19 measurement and states in the same sentence that the document class "grow[s] by one per
*committed* cross-review file". Five cross-review files have committed since. The three classes and
the 14/14 split reproduce exactly: 14 `.bak` blobs, four consumer-runtime artifacts
(`.pdlc-drift-state.json`, both `*.bundle.js`, `pdlc-cli.mjs`), and this feature's tracked documents.
`SIZING-pdlc-advisory-wave-gate.md` — the appendix DECISIONS v1.8 created and now leans on — is
**not** in the residue, because it quotes none of L-2's seven terms; TSPEC's enumeration of the
document class is therefore complete at HEAD despite not naming it.

## Decision

**DECISIONS still holds as approved against TSPEC at HEAD.** Reading (a) above is the outcome, but
only after (b) and (c) were falsified on the bytes rather than on the commit message.

Edge-by-edge, the four claims DECISIONS makes that touch the changed upstream text:

| DECISIONS claim | Upstream at HEAD | Holds? |
|---|---|---|
| `:333` — "TSPEC §5.1's status caveat and §1.3 are the carriers of repo state for this feature" | §1.3 now carries *more* repo state (the 28/3-class residue), §5.1's status caveat untouched by this edit | Yes — strengthened |
| `:334` — "whether the early-landed edits are reverted or PLAN's batches are re-derived around them is PLAN's call" | TSPEC changelog v1.10, verbatim at HEAD: "is PLAN's and Phase I's to make, not this document's, and is routed there as an erratum" | Yes — verbatim agreement |
| `:373-375` — short-shelf-life totals live in `SIZING-…`, "cited from PLAN's Overview HEAD-drift note; this entry deliberately restates none of them" | TSPEC's new paragraph routes its own figures to the *same* carrier, "PLAN's Overview HEAD-drift note and A6-00's Edit 1" | Yes — same routing target, no competing carrier introduced |
| `DEC-A6-01`…`DEC-A6-04` bodies, citing TSPEC §1.1/O-8, §2.5, §3.2, §3.6, §5.1, §5.2, §6 OQ-2/5/7 | None of those sections is touched by `1f2a4fbf`; `git show 1f2a4fbf` is confined to the changelog and §1.3 | Yes — outside the delta |

The four decision entries remain byte-identical to bytes approved on substance in earlier rounds,
and none of them compresses the §1.3 text this edit changed. The one place DECISIONS reaches into
§1.3 reaches for its *role* ("carrier of repo state", "PLAN's call"), not for any figure — the exact
compression shape that survives an upstream re-measurement. That is the v1.8 relocation paying off
one round after it landed: had the three-column sizing block still lived in DECISIONS, an upstream
edit re-sizing a residue would have had to be diffed against a competing set of counts here.

One genuine, non-gating consequence of the edit does reach this document, recorded as F-01 below:
TSPEC's bytes changed while its version label stayed at **1.10**, and DECISIONS cites "TSPEC v1.10"
by label in five places (`:40`, `:105`, `:345`, and the surrounding prose at `:44`, `:349`). Those
citations still resolve to the right sections and the right claims — nothing they assert was edited
— but the label now names two byte states, which is the ambiguity `UPSTREAM-STATE` hashes exist to
resolve and version labels do not. It is a Low, and it belongs to TSPEC's changelog discipline, not
to DECISIONS' compression.

## Consequences

- **No document edit is owed by DECISIONS for this cascade.** Its bytes stay at v1.8. The single
  finding is Low and lands on TSPEC's changelog/version discipline, not here; addressing it does not
  require reopening any decision entry.
- **The v9 approval anchor should be re-stamped, not inherited.** My v9 carried
  `UPSTREAM-STATE: TSPEC sha256:4a092e85…`, which no longer exists. This round's anchors record
  `sha256:1531143c…`, so the next reader can tell that the TSPEC edge was re-measured rather than
  assumed — that is the whole product of an upstream-cascade round.
- **Product fidelity is unchanged.** Nothing in the delta touches the four decisions' product
  content: the no-op-by-default guarantee (`ADVISORY_DEFAULTS.enabled` stays `false`), the
  `waveBudgetPerRun: 0`-vs-`enabled: false` observable distinction (REQ C-2, FSPEC E-33), the
  operator-facing example-config obligation, or the E-6 repair/O-8 ordering. No P0/P1 requirement
  changes its mapping.
- **The routing target is now shared, which is a mild concentration risk worth naming for Phase P.**
  Both DECISIONS (`:373-375`) and TSPEC §1.3 now point at *PLAN's Overview HEAD-drift note* as the
  owner of measured, short-shelf-life figures — and DECISIONS additionally points at
  `SIZING-…md`, itself cited from that same note. That is one owner with three inbound pointers,
  which is the correct shape (one measurer, many pointers) and the shape my v9 F-01 asked for. It
  only stays correct if PLAN's note actually absorbs TSPEC's 28/3-class figures rather than leaving
  a second copy in TSPEC; that is PLAN's confirmation to make, not this document's, and I raise it
  as Q-01 rather than as a finding against DECISIONS.
- **Round economics.** This is the tenth DECISIONS round and the first in which the answer was
  reached without asking the author for an edit. The relocation at v1.8 is what made a cascade
  confirmation cheap: with no measured totals in the document, the only surface exposed to an
  upstream re-measurement was four role-level citations, all of which held.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
