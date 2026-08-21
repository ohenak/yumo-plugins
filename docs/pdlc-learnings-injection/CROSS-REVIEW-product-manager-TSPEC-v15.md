# Cross-Review: product-manager — TSPEC (delta confirmation, round 15)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 15
**Round type:** delta confirmation (previously approved at v14)
**Scope:** Erratum delta + upstream fidelity at HEAD (DEC-ERR-03)

## Overview

**The routed item is landed, and it landed in the bytes I already approved.** The erratum this
round confirms — Step 5 items 15–16 ordering the structural drop before the count cut and
extraction after it, a sequencing that cannot produce E-36's no-slot zero-bound drop — is recorded
as **ERR-8** in the TSPEC at HEAD, in two places: §D.5's zero-bound bullet (the rule the implementer
follows) and §Open Questions' erratum register (the item addressed to FSPEC's author, with a
suggested fix). Both were present at commit `739fea34`, which is the commit I reviewed and approved
at v14.

**The delta is byte-empty.** Measured at dispatch:

| Quantity | Value | Matches |
|---|---|---|
| TSPEC sha256 at HEAD | `22dee8ce…d562131` | v14's `APPROVAL-HASH` exactly |
| `git diff 739fea34..HEAD -- TSPEC` | empty | no new bytes since my approval |
| REQ sha256 | `ff605dd3…d92e84dd` | dispatch's stated REQ hash, and v14's `UPSTREAM-STATE` |
| FSPEC sha256 | `ae75fa62…64a86a1d` | dispatch's stated FSPEC hash, and v14's `UPSTREAM-STATE` |

So this confirmation asks a question v14 already answered on the same bytes against the same
upstream. That is not a defect — an erratum that was filed rather than folded stays filed — but it
does change what this round can usefully add: not "did the edit break anything" (there was no edit)
but "is the erratum's characterisation of upstream still true at HEAD, and does the TSPEC's stated
rule still serve the REQ's acceptance criteria". I re-verified both from the upstream bytes rather
than from my v14 notes; the sections below record that verification per lens.

**Conclusion up front.** ERR-8's quotation of FSPEC Step 5 is verbatim-accurate at HEAD; its claim
that BR-6/BR-9/D-12/E-36 demand the opposite ordering is accurate at HEAD; the TSPEC's stated
implementer rule is the one that satisfies E-36; and the PLAN's rows do encode that rule, so the
"no PLAN change is owed" half of the routed item is true and verifiable, not asserted. Nothing I
approved at v14 is weakened. One Low finding carries forward, inherited and unchanged.

## Architecture

The product question behind ERR-8 is a user-visible one: at `maxBytesPerDocument: 0`, does the run
report *every* corpus document as `RSN-NO-MATERIAL` (REQ's transparency promise — the operator sees
why nothing was injected), or only the handful that happened to survive a count cut, with the rest
mislabelled `RSN-COUNT`? Those are different operator-facing reports from the same configuration.
So I checked the ordering claim against upstream directly rather than accepting the TSPEC's
paraphrase.

**FSPEC Step 5 at HEAD, items 15–16, verbatim:**

> 15. Drop any eligible document carrying none of BR-6's priority sections, with
>     `RSN-NO-MATERIAL` — it consumes no slot — then take the first
>     `learningsInjection.maxDocuments` of the rest in BR-4's order; the remainder are
>     dropped with `RSN-COUNT` (BR-5, BR-6).
> 16. For each taken document, extract its injectable material per BR-6, bounded by
>     `learningsInjection.maxBytesPerDocument`; a document whose material was cut is flagged
>     **bounded** in its row (BR-6, AC-2.3).

ERR-8's characterisation is exact: the drop at 15 is keyed on the **structural** condition
("carrying none of BR-6's priority sections"), the count cut happens at 15, and extraction — the
only step that can discover a zero bound admits nothing — happens at 16, after it.

**What upstream demands instead, also at HEAD:**

| Upstream locus | Text at HEAD | Consequence |
|---|---|---|
| BR-6, "How the per-document bound binds" | "Where the bound is **zero**, no material is admissible from any document: each yields nothing, is dropped before the total bound with `RSN-NO-MATERIAL` (BR-9) and consumes no slot" | every document, not just count survivors |
| BR-9 catalogue row | `RSN-NO-MATERIAL` = "Eligible, but yields no material — it carries none of BR-6's priority sections, **or** the per-document bound is zero and admits none (BR-6)" | two disjuncts, one reason code |
| D-12 (Step 4 decision table) | "Does the document yield any material? yes / no → `RSN-NO-MATERIAL`" | the question is *yields*, not *carries a heading* |
| E-36 | "`maxBytesPerDocument: 0` — No document yields material: every one carries `RSN-NO-MATERIAL` and consumes no slot; enabled run, empty selection, BR-8 rows present and empty" → AT-30 | "every one" is the operand |

E-36's "**every one** … consumes no slot" is unreachable under Step 5's literal order whenever the
corpus exceeds `maxDocuments`: documents cut at item 15 never reach extraction, so they would carry
`RSN-COUNT`. The gap is real, it is upstream's, and the TSPEC is right that it is procedural prose
versus rule text rather than a behavioural divergence — at any non-zero bound the two predicates
coincide, which is why it survived this long.

**The TSPEC's response is the product-correct one.** §D.5 states the implementer's rule as "extract
for every eligible document, then apply the count and total bounds", and keys the drop on *yields no
material* — BR-9's and D-12's own words — with one branch covering both disjuncts and no zero-bound
special case in the selector. That reading satisfies E-36's "every one" and preserves the operator
report the REQ's transparency criteria promise. The TSPEC does not rewrite upstream to match: it
files ERR-8 against FSPEC with a suggested fix and states the rule it follows meanwhile. That is
the correct disposition for a downstream document that has found a defect in its own upstream.

## Interfaces

The erratum's rule has to be visible at the seam an implementer reads, not only in prose, or the
"rule the implementer follows" claim is unenforceable. It is:

- **`extractInjectableMaterial(text, maxBytes)` JSDoc (§I.3)** carries the short-circuit explicitly:
  "`maxBytes <= 0` short-circuits BEFORE the cut and returns `{material: "", bounded: false,
  bytes: 0, sections: []}` for every `text` — no cut occurs, so `bounded` is false, and **the caller
  drops the document `RSN-NO-MATERIAL`** (E-36, §D.5)." The caller's obligation is stated at the
  callee's contract, which is what makes the ordering rule reach a reader who only opens the
  signature.
- **`selectLearnings` (§D.5)** owns the drop: a document whose extraction returns `sections: []` is
  dropped `RSN-NO-MATERIAL` **before** the count and total bounds, one branch keyed on *yields no
  material*, covering the structural disjunct (E-33) and the zero-bound disjunct (E-36), with no
  zero-bound special case. This is the operative statement of the corrected sequencing.
- **`bounded: false` at a zero bound** is the product-visible half. FSPEC AC-2.3 makes *bounded* the
  operator's signal that a document was **abridged**; at a zero bound nothing was taken, so nothing
  was abridged, and E-36 says such a document is rejected rather than selected. `bounded: true` with
  `bytes: 0` on a selected document would be a false abridgement report. The TSPEC names this
  explicitly as the shape FSPEC v0.13 carves out. Fidelity holds.

**AT-30's operand, checked against FSPEC at HEAD.** §I.2 says "upstream enumerates **three** zeros,
not two: `maxDocuments: 0`, `maxTotalBytes: 0`, and `maxBytesPerDocument: 0`". FSPEC AT-30 at HEAD:

> *Given* thresholds configured to admit nothing — `maxDocuments: 0`, separately `maxTotalBytes: 0`,
> and separately `maxBytesPerDocument: 0` — … *and* in the `maxBytesPerDocument: 0` case **every
> corpus document carries `RSN-NO-MATERIAL`** (E-36).

Three zeros, and the third case's extra conjunct is upstream's own, quoted faithfully. REQ AC-4.4 —
AT-30's requirement of record per FSPEC's traceability table (`AC-4.4 | BR-5, BR-14 | AT-30`) — is
preserved as written: "behaves as an enabled run whose selection is empty — AC-3.1's empty rows, not
AC-5.1a's absent key — rather than treating the configuration as invalid and refusing." §I.2 and
§D.5 both state exactly that trichotomy (enabled-run shape, not the disabled one, not a refusal),
and §I.2 goes further by requiring the third fixture's oracle to be a **set equality over the reject
rows** rather than an empty `selected`, on the reasoning that an implementation selecting documents
at `bytes: 0` satisfies the weaker oracle while violating E-36's no-slot clause. That is the
acceptance criterion tightened toward its intent, never narrowed.

No interface named in the erratum's blast radius has drifted from upstream at HEAD.

## Data Model

The reason-code catalogue is the operator-facing vocabulary of this feature, so contract fidelity
here is a product concern, not a typing one. Re-diffed against upstream at HEAD:

| Element | TSPEC at HEAD | FSPEC/REQ at HEAD | Verdict |
|---|---|---|---|
| `RSN-NO-MATERIAL` meaning | "yields no material", two disjuncts one branch (§D.5, §T.7) | BR-9: "Eligible, but yields no material — it carries none of BR-6's priority sections, **or** the per-document bound is zero and admits none" | faithful, disjuncts and wording |
| `RSN-BYTES` vs zero-on-per-doc-key | §D.5: "Zero on the per-document key is `RSN-NO-MATERIAL`; zero on the total key is `RSN-BYTES`. The two zeros do not share a reason code." | BR-6 "How the total bound binds"; E-25 vs E-36 rows | faithful, and sharper than upstream |
| `bounded` at zero bound | `false` (nothing taken ⇒ nothing cut) | AC-2.3's *bounded* = material was cut; E-36 rejects rather than selects | faithful |
| Slot accounting | drop "consumes no `maxDocuments` slot" | BR-6: "is dropped before the total bound … and consumes no slot"; E-36: "every one … consumes no slot" | faithful |
| Corpus-outcome / reject-reason domains | frozen catalogues, `null` the healthy corpus-outcome value (§D.1, §D.2) | BR-9's three closed catalogues, DC-05 | unchanged since v13, still faithful |

Two details worth naming because they are where a "harmless" simplification would have cost the
operator information:

1. **The two zeros are kept distinct.** `maxTotalBytes: 0` and `maxBytesPerDocument: 0` both produce
   an empty selection, and it would be tempting to collapse them. §D.5 refuses: the total-key zero
   is `RSN-BYTES` (material exists, the running total binds, documents drop **whole**), the
   per-document-key zero is `RSN-NO-MATERIAL` (no material exists at all). An operator debugging a
   silent block reads a different cause from each. Upstream draws the same line (E-25 vs E-36), and
   the TSPEC does not blur it.
2. **The no-slot clause is load-bearing, and the TSPEC says why.** Without it, a zero-bound document
   would occupy a `maxDocuments` slot while contributing zero bytes — "indistinguishable in BR-8's
   rows from a real contribution", as FSPEC BR-6 puts it. That is the transparency failure REQ's
   reporting criteria exist to prevent, and §D.5's ordering rule is what mechanically avoids it.

No enum value, numeric bound, scale or return type in §I.2/§I.3/§D.1–§D.6 diverges from its REQ or
FSPEC definition at the hashes stated in this dispatch.

## Test Strategy

My lens here is narrow: does an acceptance criterion end up with a test that could fail if the
erratum's rule were violated? For ERR-8 the answer is yes, and the ownership is traceable end to
end — which is also what makes the routed item's "no PLAN change is owed" claim checkable rather
than asserted.

**The chain, verified at HEAD:**

- **TSPEC §T.5 / §I.2** put AT-30's third case in `learningsConfig.test.js` at **L3** (seam-driven
  whole run), with the set-equality oracle over reject rows, and name the killing mutation:
  "Reverting §D.5's `maxBytes <= 0` short-circuit to the cut-and-flag path reds that fixture."
- **TSPEC §T.7's arm table** carries the `RSN-NO-MATERIAL` row in its two-disjuncts-one-branch form,
  routing the structural disjunct to AT-28 and the zero-bound disjunct to AT-30's third case.
- **TSPEC T-O-6** hands PROPERTIES a property over `extractInjectableMaterial` whose bound domain
  **includes `0`** with the carve-out stated — so the zero case has a unit-level oracle as well as
  the L3 one, and a property written from the cut-and-flag rule alone cannot red a conforming
  implementation.
- **PLAN LI-16** owns the production half by name: `extractInjectableMaterial`'s `maxBytes <= 0`
  short-circuit **and** `selectLearnings` dropping `sections: []` as `RSN-NO-MATERIAL` "**before**
  the count and total bounds are applied, so the drop consumes no `maxDocuments` slot … one branch
  keyed on *yields no material* … **no** zero-bound special case in the selector (TSPEC §D.5)".
- **PLAN LI-12** owns the red: `LI-AT-30`'s third case with the three-conjunct positive oracle,
  conjunct (iii) being "**no** document carries `RSN-COUNT` — the no-slot conjunct", plus the
  fixture precondition (corpus must exceed the `maxDocuments` in force, ≥ 6 at REQ §4.1's default of
  5) without which (iii) passes for free.

That last precondition is precisely what makes the PLAN a *test* of Step 5's ordering rather than a
restatement of it: with more eligible documents than slots, an implementation following Step 5's
literal item order emits `RSN-COUNT` rows and reds conjunct (iii). So the PLAN does not merely
"already encode the corrected order" — it encodes an oracle that **discriminates** the corrected
order from the literal one. The routed item's "no PLAN change is owed" is true for a stronger reason
than the item states.

**PLAN §Open questions** additionally records ERR-8 as **OPEN with FSPEC's author**, with the same
suggested fix and the note that "a delta-confirmation against a corrected FSPEC finds no PLAN change
owed". The erratum is registered in both documents, consistently, at the same version of upstream.
No test-strategy change is owed by this confirmation, and none was made.

## Open Questions

**Positive observations (what to keep).**

- **The erratum was filed, not folded — and stayed filed.** ERR-8 sits in §Open Questions marked
  OPEN with FSPEC's author, with a concrete suggested fix ("extract for every eligible document at
  item 15, drop on *yields no material*, then apply the count bound"), while §D.5 states the rule
  the implementer follows meanwhile. A downstream document that quietly redefined its upstream would
  have been cheaper and would have lost the signal; this one keeps the defect visible where the
  owner can act on it.
- **The severity call is right.** ERR-8 is a *sequencing gap in procedural prose*, not a behavioural
  divergence: at every non-zero bound the two predicates coincide, and at the zero bound BR-6/BR-9/
  D-12/E-36 already demand the TSPEC's reading. Calling it a divergence would have forced an
  upstream round for no behavioural change; calling it nothing would have let a literal Step 5
  implementation ship. The TSPEC calls it what it is and pins the discriminating oracle.
- **The rule is stated where each reader meets it** — prose (§D.5), the callee's JSDoc (§I.3), the
  arm table (§T.7), the property obligation (T-O-6), and the PLAN's task rows. A rule stated once in
  prose is a rule an implementer skips.

**Open items carried forward (not gating).**

- **F-01 (Low, inherited, unresolved and unchanged since v14).** §D.5 still reads "AT-11's **and
  AT-12's** expected counts are therefore hand-computable … sum of each taken section's normalised
  byte length … plus 2 bytes per join", but AT-12's fixture is by construction the *bounded* case,
  where §D.5's own next paragraph fixes the expected count at the bound exactly. The sum formula
  gives the material's length **before** the cut, which is not AT-12's `bytesInjected`. This
  predates the erratum and this round changed no bytes, so it is inherited. Suggested fix whenever
  the document is next unfrozen: qualify as "the unbounded material's length; where the cut applies
  the bound governs and AT-12's literal is the bound". Tagged Low because a fixture author following
  §D.5 to the letter reads the correcting sentence two paragraphs later.
- **DEFERRED (process, for the owning phase, not this round):** ERR-8 remains open against FSPEC.
  When FSPEC's author lands the item reorder, §D.5's ERR-8 paragraph and §Open Questions' register
  row both need retiring to CLOSED, and PLAN §Open questions' row with them. Nothing is owed until
  upstream moves.

**Question for the orchestrator (not a finding).**

| ID | Question |
|----|---------|
| Q-01 | This dispatch confirms an erratum whose bytes were already present in the commit I approved at v14 (`739fea34`; TSPEC sha256 unchanged, both upstream hashes unchanged). Confirming a byte-empty delta is safe but not free. If the round was dispatched because ERR-8 was *routed* rather than because new bytes landed, the routing predicate may be reading an open erratum register row as an unlanded item — worth checking before the next erratum round. |

## Delta-Confirmation Findings

## Verdict
