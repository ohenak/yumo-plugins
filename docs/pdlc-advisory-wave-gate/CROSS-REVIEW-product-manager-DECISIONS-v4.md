# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.12)
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review of the v1.12 revision)

## Context

**What this round is.** At v3 I returned this document non-approving on one High (F-01), one Medium
(F-02) and one Low (F-03) — all three about upstream-dependent prose in `DEC-A6-03` that REQ v1.16
had falsified. The author has since landed three commits on this file (`5f35bd8f`, `a147c9cf`,
`279d38a2`). `git diff 3143290a HEAD` on the document is 75 insertions / 22 deletions across four
places: the header `Upstream` cell, the v1.9 re-grounding note, a new `On v1.12` changelog
paragraph, `DEC-A6-03` (Reversibility, the gap subsection, re-evaluation triggers) and one
Consequences bullet.

**Scope of this pass.** Delta protocol: I verified my three prior findings against upstream at HEAD
and read only the changed hunks for new issues. I did not re-open `DEC-A6-01`, `DEC-A6-02`,
`DEC-A6-04`, `## Options Considered`, `DEC-A6-03`'s "Constraints that forced the shape", or any
settled option table. Nothing in the diff touches them.

**How I grounded it.** Every factual claim the revision adds is a claim about upstream or about the
shipped tree, so I checked each one rather than reading it:

- Header pins — `REQ sha256:f97f4f66…` v1.16, `FSPEC sha256:d602c440…` v1.7, `TSPEC sha256:1f6ea486…`
  v1.15: all three recomputed at HEAD and all three match, versions included.
- `REQ v1.16 AC-6.3` carries the overwrite conjunct and cites `DEC-A6-03` by id.
- `FSPEC v1.7 BR-14` states co-location as the observable in the words the record quotes; `AT-06-4`
  carries conjunct (3), `AT-06-4b` is the no-capture negative arm, and `E-34` requires no warning.
- `TSPEC v1.15 §4.5` carries the `Snapshot-overwrite notice` row rendered by
  `renderSnapshotOverwriteNotice(snapshotRef)` into halt-report `notices`, on every A6-touched halt
  with non-`null` `snapshotRef` and never on `null`.
- The "still owed" claim — `overwrit` matches nothing in `PROPERTIES-pdlc-advisory-wave-gate.md`
  (0 hits), `PROP-REC-05` asserts only the diagnosis and the root-cause class, and no test in
  `pdlc/workflows/__tests__/` asserts any overwrite string; `renderSnapshotOverwriteNotice` has no
  definition or caller anywhere under `pdlc/` yet.
- The Reversibility claim's cheap half — the ref name is computed at exactly one site,
  `pdlc/workflows/orchestrate-dev.js:12603` (`update-ref refs/pdlc/a6-snapshot-${waveNum}`); the
  only other occurrences are four test assertions in `advisoryWaveGate.test.js`. "Computed in one
  function" is true of the shipped code, not just of the design.

Every one of those holds. The revision did not paper over the cascade; it re-checked upstream and
found the split had moved two hops further than either reviewer saw.

## Options Considered

Three readings of the revision were open. The choice between them is the substance of this round.

**Reading A — the three findings are addressed, so approve clean.** F-01's stale negative claim is
gone and replaced with a three-level landing statement, each level verified accurate at HEAD; F-02's
remedy bullet now names `AC-6.3` as its upstream and says the warning is a required element of the
halt report; F-03's trigger is marked "**fired at REQ v1.16 and is spent**" and replaced with a
narrower live one. On this reading the round closes with no findings.

*Rejected.* The revision is larger than the three fixes — it adds a compression of `TSPEC v1.15
§4.5` and a compression of `PROPERTIES`' current coverage, and both compressions are new
upstream-dependent claims that did not exist when I approved at v2. New claims are in scope for a
delta re-review even when the findings they replace are resolved. Two of them are imprecise against
the documents they compress.

**Reading B — the findings are resolved; the new compressions carry non-gating defects.** The three
prior findings are closed on the evidence above, and nothing in the diff broke anything I had
previously approved. What the diff introduces is two descriptions of the landed contract that
disagree with `TSPEC §4.5` / `FSPEC BR-14` in ways a reader could act on: the Reversibility
paragraph places the pointer and the warning on two different surfaces and calls that co-location,
and the "still owed" note enumerates one of the two properties `PROPERTIES` maps to `AC-6.3`.
Neither drops an acceptance criterion — the entry states `AC-6.3`'s obligation correctly twice
elsewhere in the same section — so neither is High.

*Accepted.* This is what the evidence supports, and it is narrow: three findings, all inside the
`DEC-A6-03` hunks, none gating.

**Reading C — the Reversibility misstatement is High, because it reinterprets an acceptance
criterion.** `FSPEC BR-14` makes co-location the falsifiable observable ("a pointer in the halt
report and the warning in a runbook does not satisfy it"), and a decision record that describes the
satisfying arrangement as *field plus adjacent notice* describes an arrangement `TSPEC §4.5` does
not accept.

*Rejected, on the calibration my own persona rules demand.* Severity tracks user impact, and the
impact here is bounded by the fact that the same entry, eleven lines below, states the oracle
correctly and in stronger terms than FSPEC does: "the oracle asserts the ref pointer and the
overwrite statement on the **same rendered report field**, and must go RED both when the warning is
deleted and when it is emitted somewhere other than beside the pointer." A reader who reaches the
normative half is not misled; a reader who stops at the Reversibility aside is. That is a real
defect worth fixing, but it is an internal inconsistency in a rename-cost aside, not an AC narrowed
in the record's operative text. Medium, and it does not gate.

## Decision

**All three of my v3 findings are resolved, and the revision broke nothing I had previously
approved. Verdict: Approved with minor changes** — two Medium, one Low, none gating.

### Prior findings — resolution, verified against upstream

**F-01 (High) — RESOLVED.** The passage "**The routing has not landed** … `overwrit` match nothing
in either document" is deleted. Its replacement, "**The gap in the remedy's reach, and how it
closed**", states the landing at three levels and each statement checks out at HEAD: `REQ v1.16
AC-6.3` (the warning "in the same place", citing `DEC-A6-03`); `FSPEC v1.7 BR-14` (co-location as
the observable, `AT-06-4` conjunct (3), `AT-06-4b` as the negative arm, `E-34` requiring no warning);
`TSPEC v1.15 §4.5` (the notice row and its non-`null` / `null` quantifier). The revision goes
further than my finding asked: I described the residual gap as "FSPEC-only", and the author's
re-grounding found FSPEC had moved to v1.7 and TSPEC to v1.15 since my snapshot, so the gap is not
FSPEC's at all — it is a properties-and-tests gap. That is the right correction, made against
upstream rather than against my review, and it is exactly the convention the dates note commits to.

**F-02 (Medium) — RESOLVED.** The Consequences bullet now leads with "no longer documentation the
operator has to already know about", names **`REQ v1.16 AC-6.3`** as making the warning a required
element of the halt report, cites `FSPEC v1.7 BR-14` / `AT-06-4` conjunct (3) and `TSPEC v1.15 §4.5`,
and states the product consequence I asked for: preserving the capture is an action the operator can
take *at halt time from the halt report alone*. It also carries the open obligation forward rather
than closing the loop silently.

**F-03 (Low) — RESOLVED.** The trigger is now written as spent — "**fired at REQ v1.16 and is
spent** (PM v3 F-03)" — with the replacement trigger stated narrowly: revisit if the conjunct is
still unasserted by any property or test when Phase I closes. A spent trigger and a live trigger are
now distinguishable, which was the whole of the finding.

### What I asked to be preserved, and was

The two rationale sentences I flagged under Positive Observations at v3 both survive: "an uncited
in-flight routing is indistinguishable from a dropped one" is retained (re-purposed as the reason
the close was possible), and "What an overwrite costs is inspectability of a pre-repair tree, never
content" is untouched in the Consequences block. Nothing was deleted along with the stale claim.

### What the revision adds beyond the fixes

Three additions are new since my v2 approval and are therefore in scope: the header `Upstream` cell
now pins all three upstream hashes (verified correct — this is a genuine improvement, since pinning
TSPEC alone is what let the REQ cascade go unnoticed); the v1.9 note's hashes are date-scoped rather
than reading as current pins; and an `On v1.12` changelog paragraph records the round and the durable
lesson. I checked the changelog's factual claims — FSPEC v1.6 → v1.7, TSPEC v1.11 → v1.15, both now
carrying the obligation — and both are true at HEAD. No decision moved; no option table reopened; I
diffed `DEC-A6-01`, `DEC-A6-02`, `DEC-A6-04` and `## Options Considered` and they are byte-identical
to the state I approved.

### What is still imprecise

Three findings, all inside the `DEC-A6-03` hunks, none touching the decision itself: the
Reversibility aside describes co-location as holding *between* the halt field and the notice (F-01,
Medium); the "still owed" note names one of the two properties `PROPERTIES` maps to `AC-6.3`,
leaving the negative arm invisible (F-02, Medium); and the four-literal-set sentence attributes the
halt-field widening to the notice rather than to the fifth field `snapshotRef` (F-03, Low). Details
and the exact fix for each are in `## Findings`.

## Consequences

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | `DEC-A6-03` Reversibility places co-location *between two surfaces* — "the halt field that names the ref, and, adjacent to it, the overwrite notice … co-located by contract". `TSPEC v1.15 §4.5` puts the ref pointer and the overwrite sentence **inside one `notices` string**; `snapshotRef` in `haltError.fields` is a separate channel and is not what satisfies `BR-14`. The same entry states the oracle correctly eleven lines below, so the record contradicts itself on the falsifiable half of the AC. | AC-6.3, FSPEC BR-14, TSPEC §4.5 |
| F-02 | Medium | Local | The "What is still owed" note says "`PROPERTIES` covers AC-6.3 through `PROP-REC-05`". `PROPERTIES` at HEAD maps `AC-6.3` to **two** properties — `PROP-REC-05` *and* `PROP-REST-08`, the `E-34` no-capture arm. `PROP-REST-08` is where `FSPEC AT-06-4b`'s "no warning, because no capture" conjunct will have to live, and it is equally unasserted today. Naming one of two leaves the negative arm invisible to the test author the note is written for. | AC-6.3, FSPEC AT-06-4b, E-34 |
| F-03 | Low | Local | "the halt-field contract is no longer the closed four-literal set `{rootCause, diagnosis, repairApplied, repairPaths}`: **it adds a snapshot-overwrite notice** … into the report's `notices`" conflates two channels. What widened the halt-**field** set is a fifth field, `snapshotRef` (`TSPEC §4.5`, and the typed `haltFields` shape); the notice is an addition to a different surface. As written, a reader can conclude the notice is a halt field. | AC-6.3, TSPEC §4.5 |

**F-01 — evidence and fix.** The record reads: *"It is printed in two places as of the routing above
(TE v3 F-02): the halt field that names the ref, and, adjacent to it, the overwrite notice
`renderSnapshotOverwriteNotice(snapshotRef)` renders — co-located by contract."* `TSPEC v1.15 §4.5`
says the notice is "**one string carrying the ref pointer and the overwrite statement adjacent**",
rendered "from a non-`null` value, both halves together and adjacent **inside one string**: the ref
name, and the sentence that re-running this feature overwrites that capture". `FSPEC v1.7 BR-14`
makes co-location the observable, and `AT-06-4`'s oracle is explicit that it is "**co-location within
one string on one named surface**", failing a run "in which the two halves land on two different
notices". So the pairing the record calls co-located is at best a different pairing from the one
`BR-14` requires, and at worst reads as licence for the arrangement `AT-06-4` is written to redden.
*Fix:* state that the ref name and the overwrite sentence are co-located **within the single
`notices` string**, and that `haltError.fields.snapshotRef` is the separate field the notice is
rendered from. The rename-cost point survives untouched — one computation
(`pdlc/workflows/orchestrate-dev.js:12603`) and one rendered string — which is all the paragraph
actually needs to say.

**F-02 — evidence and fix.** `PROPERTIES` §Traceability maps `AC-6.3 | PROP-REC-05, PROP-REST-08`,
and `PROP-REST-08`'s Traces cell lists `AC-6.3, E-34`. `PROP-REST-08` is `E-34`'s only property home
and asserts the no-capture halt's field values; it says nothing about the *absence* of an overwrite
warning, which is precisely the paired positive-and-negative oracle `AT-06-4b` exists to supply. The
record's own standard here is right — "the falsifiable half is co-location, not presence" — and it
should extend to the negative arm: a warning that is always emitted passes a presence check, and only
`PROP-REST-08`'s arm can falsify that. *Fix:* name both properties and say what each still owes —
`PROP-REC-05` the co-location conjunct, `PROP-REST-08` the paired "and no overwrite notice on the
`null` arm" conjunct.

**F-03 — evidence and fix.** `TSPEC §4.5`'s Halt-fields row reads
`{rootCause, diagnosis, repairApplied, repairPaths, snapshotRef}`, and the typed shape carries
`snapshotRef: string | null`. *Fix:* one clause — the field set gained `snapshotRef`, and *separately*
the halt report's `notices` gained the rendered overwrite notice.

**Citation convention (DEC-DOC-01).** Clean. Every citation the revision adds is by spec id, version
or section (`AC-6.3`, `BR-14`, `AT-06-4`, `AT-06-4b`, `E-34`, `§4.5`) — no raw `file:line` anchors
were introduced. The v3 instruction on this was followed.

## Questions

## Positive Observations

## Recommendation

## Verdict
