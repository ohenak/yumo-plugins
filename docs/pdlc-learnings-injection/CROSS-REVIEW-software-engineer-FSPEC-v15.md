# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.13)
**Date:** 2026-08-20
**Iteration:** 15 (delta confirmation of the v0.13 erratum)

## Overview

Delta confirmation of the v0.13 erratum (commits `eeafa236` … `cfb3d4d6`) against the v0.12 bytes
I approved at v14. Three decisions were asked for: BR-6's byte-accounting basis, the
`maxBytesPerDocument: 0` edge, and an owner for the section-heading recognition rule. All three
land, and each lands in the direction the routed items asked for.

Per DEC-ERR-03 I re-read the upstream this FSPEC now leans on at its current version. REQ at HEAD
is `sha256:ff605dd…` — matching the dispatch — and its version cell reads `0.9`, so the erratum
note's "re-grounded on REQ v0.9 at HEAD, unchanged — no upstream decision to absorb" is accurate,
and the header `Upstream` row's `(v0.9)` is not stale. The two upstream sentences the new text
leans on hold verbatim:

- REQ AC-2.3 (`:291-295`) bounds **"the material taken from it"** — not the rendered block — so
  BR-6's new material-only basis is a faithful compression, and the parenthetical
  `(REQ AC-2.3, which bounds "the material taken")` quotes upstream correctly.
- REQ AC-4.4 (`:371-374`) covers "zero documents **or zero bytes**" without naming which byte
  threshold, so deciding the third zero as an enabled, empty-selection run is inside AC-4.4's
  stated outcome rather than an FSPEC invention over it.

What the delta did not do is carry the zero decision back into the two places that restate BR-6 in
summary form — §Behavioral Flow step 15 and decision D-9. Those now describe a different outcome
for `maxBytesPerDocument: 0` than BR-6, E-36 and AT-30 do (F-01). That is a compression drift
inside one document, not an undecided outcome — BR-6 is the normative locus and it is unambiguous
— so it is Medium, not gating.

## Linked Requirements

Trace rows checked for the delta only.

| Row | State after the erratum | Verdict |
|---|---|---|
| `AC-2.3 → BR-6` | Unchanged; BR-6 still owns both byte bounds, now on a material-only basis | Accurate against REQ `:291-295` |
| `AC-4.4 → BR-5, BR-14 → AT-30` (`:178`) | The `maxDocuments: 0` and `maxTotalBytes: 0` zeros trace through BR-5/BR-14; the third zero is decided in **BR-6**, which the row does not name | Incomplete — F-03 (Low) |
| `E-36 → AT-30` (`:775`) | Present, and AT-30 now carries the third fixture | Resolved |
| Coverage sentence (`:988`) | Now reads `E-01 … E-36, less retired E-05` | Resolved — the new row is inside the counted range |
| `D-12 → AT-28` (`:993`) | D-12's question was reworded to "yields material"; the AT mapping is unchanged and AT-28 still exercises the no-priority-section branch, while AT-30 now exercises the zero-bound branch of the same decision | Serviceable; AT-30 is not listed against D-12, but D-12's outcome is reached by both — folded into F-01 rather than filed separately |

The header `Cross-Reviews` row still reads `…-FSPEC-v{N}.md — every round present on this branch,
not hand-enumerated`, so v15 does not stale it — the v14 fix holds.

## Behavioral Flow

**The one substantive gap this round leaves (F-01).** The erratum edited BR-6, BR-9, D-12, E-36
and AT-30, but not the numbered flow. Step 15 (`:255-258`) still reads:

> Drop any eligible document **carrying none of BR-6's priority sections**, with
> `RSN-NO-MATERIAL` — it consumes no slot — then take the first
> `learningsInjection.maxDocuments` of the rest in BR-4's order …

and step 16 applies the per-document bound only *after* that drop and *after* the count cut. Run
`maxBytesPerDocument: 0` against the flow as written, with §4.1's default `maxDocuments: 5`:

1. Step 15 drops nothing — every corpus document carries priority sections.
2. Step 15 takes the first five in BR-4's order; the remaining 84 are dropped with **`RSN-COUNT`**,
   not `RSN-NO-MATERIAL`.
3. Step 16 extracts zero bytes from each of the five and — under D-9 and BR-6's unqualified
   "Either way the document's row carries the **bounded** flag" — flags them **bounded** and
   **selected**, i.e. five BR-8 rows with `bytes injected: 0`.

BR-6's new carve-out (`:495-498`), E-36 (`:775`) and AT-30 (`:944-948`) all say the opposite:
no document yields material, **every** one carries `RSN-NO-MATERIAL`, none consumes a slot, and
the selection is empty. Two readings of the same configuration now exist in the document, and
they differ in exactly the observable AT-30 asserts (`RSN-COUNT` rows and five bounded selected
rows vs. 89 `RSN-NO-MATERIAL` rows and an empty selection).

Why this is Medium and not High: BR-6 is the normative locus for both bounds, the carve-out there
is explicit and unambiguous, and §Behavioral Flow is declared a summary of the business rules
rather than a competing normative text. An implementer following BR-6 gets AT-30 right. The fix is
one clause in step 15 — drop any eligible document that **yields no material** (none of BR-6's
priority sections, *or* a zero per-document bound admits none) — plus the matching qualifier on
D-9's branch (`:294`), so that D-12 is reached before D-9 flags a zero-byte take as `bounded`.

Nothing else in §Behavioral Flow was disturbed. Steps 16–17 remain consistent with the
material-only basis: step 17's "Accumulate contributed bytes" now accumulates material only, which
is what BR-6 and TSPEC §D.5 both say, and step 19's assembly of preamble/delimiters is now
explicitly outside the byte accounting rather than inside it.

## Business Rules

### BR-6 byte-accounting basis — resolved

The routed item was a contradiction with TSPEC §D.5, which charges **material only** and leaves
framing charged to nothing. BR-6 (`:479-490`) now states the same rule from the behavioural side:
contributed bytes are "the section headings and bodies taken from it, and nothing else"; the
identification line, per-document delimiters, source-path label and block preamble "count toward
none of the three quantities".

Checked against TSPEC §D.5's three-pool table (`:770-773`): **Material** is bounded by
`maxBytesPerDocument` per document and `maxTotalBytes` over the sum; **Per-document framing** and
**Block framing** are bounded by nothing. The two documents now agree pool for pool, and the
direction of the fix is the right one — the FSPEC moved to the accounting the implementation can
actually produce (`extractInjectableMaterial` bounds `Buffer.byteLength(material)` and the renderer
adds framing afterwards, TSPEC `:778-781`), rather than obliging the renderer to feed framing back
into the bound.

Two consequences I checked rather than assumed:

- **BR-8 stays coherent.** `bytes injected` is "the document's contributed bytes, as BR-6 defines
  them" and the per-dispatch scalar is "the sum of the rows' contributed bytes" (`:537-540`).
  Under material-only accounting the sum identity still holds exactly, and it is now *simpler* to
  hold: no preamble constant has to be excluded from a sum of rows that never included it.
- **The "computable from a fixture alone" claim survives and improves.** Previously it required
  knowing the delimiter and identification-line bytes, which are F-O-2's (TSPEC's) to settle — so
  the old basis made an FSPEC-level expected byte count depend on an unresolved obligation. The new
  basis removes that dependency. The added clause "a document is never abridged to pay for the
  annotation that says it was abridged" is a genuine behavioural argument, not decoration.

BR-5's measured claim (`:425-433`) is unaffected: it was already stated over *injectable material*
(13,278 bytes average, max 41,180, 87 of 89 over `maxBytesPerDocument`), which is the quantity the
new basis measures. Had it been stated over whole-document bytes the erratum would have invalidated
it; it was not.

### BR-6 zero per-document bound — resolved at the normative locus

`maxBytesPerDocument: 0` is now decided (`:495-498`): no material is admissible, each document
yields nothing, is dropped before the total bound with `RSN-NO-MATERIAL`, consumes no slot, and the
run is BR-14's enabled empty-selection run. That is the reading most consistent with the rest of the
document — it makes the zero bound behave like BR-6's existing "yields nothing" drop rather than
inventing a fourth outcome — and it is inside REQ AC-4.4's "zero bytes" clause.

One wording residue (F-02): the paragraph states the general rule unconditionally — "If the
**first** section alone exceeds the bound, it is taken up to the bound and cut. **Either way** the
document's row carries the **bounded** flag" — and only then introduces "Where the bound is
**zero**". A zero bound *is* a bound the first section exceeds, so the general sentence covers the
zero case before the carve-out withdraws it. Precedence is recoverable from reading order and from
the carve-out's explicitness, so this is Low, but "Either way" wants a qualifier ("Either way,
**for a non-zero bound**, …").

### BR-9 — resolved

The `RSN-NO-MATERIAL` catalogue entry (`:560`) now reads "yields no material — it carries none of
BR-6's priority sections, or the per-document bound is zero and admits none", and D-12 (`:297`) is
restated as "Does the document yield any material?". Widening the reason id rather than minting a
new one is the right call: it keeps BR-9's catalogue closed (DC-01's completeness test over the
reason set is unchanged, and no new id needs catalogue registration under F-O-3), and the operator
reading a report sees one reason for one observable — the document contributed nothing.

### F-O-1 ownership — resolved

BR-6 (`:373-376`) delegates "which heading forms count as which section" to F-O-1, and F-O-1
(`:1009`) now explicitly owns **two** rules on the same terms — the document-shape predicate for
BR-3, **and** the rule by which a heading counts as one of BR-6's named sections, "whether the
numbered form, the bare title or a prefix of it is matched" — both bounded by the same two
requirements the FSPEC fixes (bytes only, no model call). The delegation now names a real owner
with the alternatives enumerated, which is what the routed item asked for and what makes the
obligation dischargeable rather than open-ended. The consequence for TSPEC §D.3 is Q-01, below;
it is a downstream catch-up, not a defect of this FSPEC.

## Edge Cases and Error Scenarios

E-36 (`:775`) is new and sits with the other two zeros:

| Row | Text | Verdict |
|---|---|---|
| E-24 | `maxDocuments: 0` → enabled run, empty selection, BR-8 rows present and empty → AT-30 | Unchanged |
| E-25 | `maxTotalBytes: 0` → same → AT-30 | Unchanged |
| **E-36** | `maxBytesPerDocument: 0` → no document yields material; every one carries `RSN-NO-MATERIAL` and consumes no slot; enabled run, empty selection, BR-8 rows present and empty → AT-30 | Lands; matches BR-6's carve-out word for word in outcome |

The third zero is no longer reachable-but-undecided. E-36 is strictly more specific than E-24/E-25
— it pins the reason id as well as the run shape — which is correct, because the reason id is the
only thing that distinguishes it from a corpus that legitimately carries no priority sections.

Rows I re-checked for collateral damage from the accounting change, since they are all stated over
byte quantities:

- **E-15** (`:756`) "One document exceeds `maxBytesPerDocument` → material cut to the bound; row
  flagged **bounded**; document still contributes" — still correct; under material-only accounting
  the trigger is the document's material exceeding the bound, which is what BR-5's measurement
  already reports for 87 of 89 documents.
- **E-16** (`:757`) first priority section alone exceeds the bound → taken up to the bound and cut
  — unaffected; the cut point is a material offset either way.
- **E-18** (`:759`) a single document's **bounded material** alone exceeds `maxTotalBytes` →
  dropped whole with `RSN-BYTES` — already phrased over bounded *material*, so the erratum makes it
  more exactly true, not less.
- **E-33** (`:762`) document carrying none of BR-6's priority sections → `RSN-NO-MATERIAL`,
  consumes no slot → AT-28 — unchanged and still distinct from E-36 (document-shaped cause vs.
  configuration-shaped cause, same reason id).

No edge row was invalidated by the new basis, and no row now double-counts framing.

## Acceptance Tests

**AT-30** (`:944-948`) gains the third fixture: `maxDocuments: 0`, separately `maxTotalBytes: 0`,
and separately `maxBytesPerDocument: 0`, all three asserting the enabled empty-selection run —
BR-8 rows present and empty, not the absent key of a disabled run, no refusal — plus, for the
third, "every corpus document carries `RSN-NO-MATERIAL` (E-36)". The extra conjunct is what makes
the third case falsifiable rather than a restatement of the first two: it pins *why* the selection
is empty, so a build that reached emptiness by some other route — dropping the corpus on a parse
error, say, or recording `RSN-COUNT` for everything past `maxDocuments` — is red rather than green.

This is the AT the F-01 flow drift bites. Written against BR-6, AT-30's third case passes; written
against §Behavioral Flow step 15, it fails — the implementer sees 84 `RSN-COUNT` rows and 5 bounded
selected rows. The test author needs one normative locus to write the oracle from, and today the
document offers two. That is why F-01 is worth a bounded follow-up round even at Medium.

Other byte-count ATs re-checked under the new basis:

- **AT-11** (`:855-859`) — expected byte count is "a **literal integer**, recomputed by hand when
  the fixture changes, never derived in the test". Under the old basis that literal had to include
  delimiter and identification-line bytes whose wording is F-O-2's, i.e. not fixed at FSPEC time;
  under material-only accounting the literal is computable from the fixture's section bodies alone.
  The erratum makes this AT *more* writable, and TSPEC `:790-796` reaches the same conclusion for
  AT-12's oracle ("contributed bytes ≤ bound, **equal** only when …").
- **AT-12** (`:865-866`) — "contributed bytes equal the bound, a fixture literal" — unaffected in
  form, now unambiguous in referent.
- **AT-13** (`:873`) — total-bound drop over bounded material — unaffected.
- **AT-17/18** (BR-8 rows) — the per-dispatch total is the sum of row bytes; with framing excluded
  from both sides, the identity the completeness test asserts is unchanged.

The DC-05 coverage paragraph (`:988-993`) still resolves: `E-01 … E-36, less retired E-05`, every
AT in the reverse trace, and D-12 exercised by AT-28. See the Linked Requirements table for the
one thing I chose not to file separately (AT-30 is not listed against D-12 even though it now
exercises that decision's no-material branch through a second cause).

## Open Questions

**F-O-1 is now correctly scoped, and that is what makes TSPEC §D.3 incomplete.** F-O-1 (`:1009`)
owns two heading-recognition rules; TSPEC's discharge at §D.3 (`:699-706`) supplies only the
document-shape predicate, `LEARNINGS_HEADING_RE = /^#\s+LEARNINGS\b/`, and TSPEC's F-O-1 row
(`:1165`) is written over that one rule. The matcher inside `extractInjectableMaterial`
(`:102`, `:526`) is still unspecified: nothing downstream says whether
`## 3. Rejected Proposals (with rationale)` is matched on the numbered form, the bare title, or a
prefix of it — the very three alternatives F-O-1 now enumerates.

I am **not** filing that as a finding of this confirmation. My scope is this FSPEC measured against
its upstream at HEAD, and against REQ v0.9 the FSPEC is faithful; the gap is a downstream document
failing to discharge an obligation that this round has only just stated properly. It belongs to the
TSPEC's own round, where it is now well-posed rather than ownerless. It is recorded here as Q-01 so
the orchestrator can route it rather than lose it.

The remaining FSPEC obligations are untouched by this erratum and were approved at v14: F-O-2 (the
preamble wording and delimiters — now cleanly outside the byte accounting, which slightly reduces
its blast radius), F-O-3 (serialised record forms and catalogue registration — unchanged, since no
new reason id was minted), F-O-4 (the `consolidate-learnings.js` corpus pin), F-O-7 (REQ O-8's
count-cut fixture).

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-O-1 now owns two rules; TSPEC §D.3 discharges one. Does the TSPEC re-open for the `extractInjectableMaterial` matcher (numbered form / bare title / prefix), and does the choice need pinning against the corpus BR-6 measured — where the conventional `## N. Title` form is what the harvest skill writes but at least one HEAD document deviates? Not a finding against this FSPEC; routing question only. |
| Q-02 | TSPEC `:786` describes `totalBytesInjected` as "framing constant plus one opener/closer pair per selected document". If that is the *report scalar* rather than a realised-prompt-growth estimate, it contradicts BR-8's "sum of the rows' contributed bytes" under the newly agreed material-only basis. I read it as the latter and did not file it; worth one sentence of confirmation in the TSPEC round. |

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
