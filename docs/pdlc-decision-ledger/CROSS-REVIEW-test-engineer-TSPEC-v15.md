# Cross-Review: test-engineer — TSPEC (erratum delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v1.4, 2026-09-01)
**Date:** 2026-09-01
**Iteration:** 15 (delta confirmation, round v15)
**Prior round:** `CROSS-REVIEW-test-engineer-TSPEC-v14.md` (Approved with minor changes; REVIEWED-COMMIT `1c0881daeb296436090656d3a816439271eae78e`)

## Scope of this round

Delta confirmation only (DEC-ERR-03). I previously approved TSPEC v1.3 at `1c0881dae`. Three
commits have touched the document since — `d494517d9` (§1.2/§2.1/§2.3/§2.4), `d91409aca`
(§4.4/§4.5), `d822ec8db` (v1.4 changelog and version bump). I read the diff of those three, the
edited sections in place, and the shipped code they now describe. The question I answer is the
erratum question: does the delta land its two self-correction items without breaking anything
already approved, and is the corrected text faithful to the code it claims to be catching up to?

Both items are **self-corrections against this document**: the code is authoritative here and was
not touched. That inverts the usual erratum direction, so my check is a fidelity check — does the
spec now say what `orchestrate-dev.js` at HEAD actually does — rather than a "did the fix land"
check.

## Upstream re-grounding: unmoved, verified mechanically

The changelog claims nothing was absorbed. I verified rather than trusted it, two independent ways:

| Upstream | Header pin | Changelog's cited hash | Measured at HEAD | Since my v14 anchors |
|---|---|---|---|---|
| REQ | v1.10 | `5efd4fd3…` | `git hash-object` = `5efd4fd3e35ae2e0fb671872d755bc23fc7b4b1d` — exact | sha256 `9bc8bc32…05f10d`, identical to my v14 `UPSTREAM-STATE` |
| FSPEC | v1.4 | `cccaae60…` | `git hash-object` = `cccaae60604a9dcb8770056b1b9919aa28770813` — exact | sha256 `48691453…a11256`, identical to my v14 `UPSTREAM-STATE` |
| Baseline | v1.2 | — | unchanged | unchanged |

`git diff 1c0881dae..HEAD -- docs/pdlc-decision-ledger/{REQ,FSPEC,TSPEC}` reports **one** changed
file, the TSPEC itself (105 insertions, 22 deletions). No `BR-`, `E-`, `AC-`, `M-` or `O-` id is
minted, retired or re-scoped; no threshold, byte literal or measured value moves. The
"nothing absorbed, header pin stands" claim is true, and the changelog's cited hashes are real
authorities, not decorative digests.

## Item 1 — the widened `_injectDecisionLedger` payload: faithful at all five loci

The pre-delta document declared the seam as `(args: { feature: string }) => Promise<string>` while
§5.1's `DecisionLedgerDispatchRecord` already declared `phaseId: string | null`,
`docType: string | null`, `round: number`. That was an internal contradiction, and the code
resolved it in the shipping direction. I re-derived each locus against
`pdlc/workflows/orchestrate-dev.js` at HEAD:

| Locus | Now says | Shipped code | Match |
|---|---|---|---|
| §2.1, injector return node | `injectDecisionLedger({feature, phaseId, docType, round})` | closure returned by `buildDecisionLedgerInjector` | ✅ |
| §2.1, per-round call node | same four fields | `orchestrate-dev.js:9995` region | ✅ |
| §4.4, `buildDecisionLedgerInjector` return type | `feature` required, `phaseId?`/`docType?`/`round?` optional | closure copies the three onto the record; renderers tolerate absence | ✅ |
| §4.5, `_injectDecisionLedger` seam type | same four-field object | `reviewLoop`'s optional seam, defaulting `null` | ✅ |
| §4.5, call-site snippet | `await _injectDecisionLedger({ feature, phaseId: phase, docType: roundDocType, round: iteration })` | verbatim the shipped production call site | ✅ |

The three bindings the snippet names are real. `roundDocType` is
`docType === undefined ? docTypeFromPath(doc) : docType` (`:9686`), so §4.5's added prose —
"`null` on the Phase CR dispatches, which carry no document type" — is a statement about a real
code path, not an assumption. The `reviewerPrompt` call one line below uses `reviewFileType`
(`roundDocType || "REVIEW"`, `:9687`), a *different* binding; the document correctly names
`roundDocType` for the injector and does not conflate the two. That distinction is easy to get
wrong and was got right.

The optional-vs-required typing is the right call for testability, not just for tidiness: it lets
the unit-level rendering tests exercise `renderDecisionLedgerBlock` through the injector without
fabricating a phase context, while §4.5's prose states plainly that the production site supplies
all four. §5.1 was already correct and is untouched — the contradiction is resolved by moving the
narrower statement, not by loosening the record. Nothing in this item touches an oracle, an AT, a
threshold or a byte literal.

## Item 2 — the stale ninth `reviewerPrompt` parameter: the locus is now stated where it lives

This is the more consequential of the two, and it is the one that matters to testing, because a
spec naming a *deleted* delivery locus is how a later implementer re-introduces dead code to
satisfy the document. Verified against HEAD:

- `reviewerPrompt` (`:11906`) takes **eight** parameters, ending `findingGrammar = false`. There is
  no ninth. §4.5 now declares it "UNCHANGED — no ledger parameter (§2.4)". ✅
- `wrapped = (skill, basePrompt, targetPath, dispatchKind, sessionKey, ledgerBlock = "")` (`:9759`)
  and `runWrapped` with the identical trailing argument (`:9785`), forwarding to `wrapped`
  (`:9788`). §2.1's new diagram hop and §4.5's prose match this argument order exactly. ✅
- `dispatchAndVerify` takes `ledgerBlock = ""` as a **destructured option** (`:11485`), and §2.1
  writes it as `dispatchAndVerify({..., ledgerBlock})` — option form, not positional. ✅
- The concatenation (`:11616`) is
  `` `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}${learningsBlock}${ledgerBlock}` ``.
  §2.4's new sentence — appended last "after the pacing-contract clause, the opener and
  `learningsBlock`" — is a term-by-term transcription of that expression, in order. ✅

The argument §2.4 gives for the hop is also correct and worth preserving: a builder-side append
would sit *before* the wrapper's own pacing-contract/opener suffix, so "appended last" would have
been true of `reviewerPrompt`'s return value and false of the delivered prompt. That is exactly the
distinction that makes the §7.2 composition-root oracle ("flag-on prompt **ends with** the rendered
block") falsifiable rather than vacuous — and that oracle is asserted against the delivered prompt,
so it still holds unchanged at the new locus. No test-strategy surface moves as a result of this
item.

The parenthetical in §2.4 recording that v1.0–v1.3 specified the ninth parameter, that it was
unreachable, and that it was removed in the Phase CR round (TE F-02) is the right shape for an
erratum: it leaves an audit trail so the next reader does not read the correction as a redesign.
§2.5's and §9.1 D-2's re-wording from "attaches to `reviewerPrompt`" to "attaches to the review-loop
reviewer dispatch" is the same scope stated at the hop that carries it — the delta-confirmation and
finding-restatement prompts remain excluded, so D-2's decision content is unchanged and the
byte-identity surface is unchanged.

## What the delta did not disturb

§3 (recognition), §5 (data model), §6 (error handling), §7 (test strategy) and §8 (traceability)
are byte-identical — confirmed from the diff, not from the changelog's assurance. Concretely, the
things I approved in earlier rounds and re-checked are intact:

- §7.3's declaration-anchored census pin: fourteen-member owned list, the six ∪ eight partition,
  the 1,200-byte wiring reserve, the sentinel-bounded slice contract. Untouched.
- §6.1's F-13 row keeps its positive terminal-state conjunct (block is exactly `""`), not an
  absence-only `!= error`. Untouched.
- §7.6's AT-14 keeps its positive byte-identity assertion over FSPEC E-7's three cases. Untouched.
- The AT budget and traceability rows: no AT lost an owner, no AC lost an AT, no count moved.
- No new component, no new parameterisable surface, and therefore no new property-based-testing
  obligation and no new coverage-floor obligation. The strategies and the ≥85% branch floor
  approved at v1.2 apply unchanged.

## Testability of what the delta newly asserts

Two gaps are worth recording. Neither is caused by this delta and neither is gating; both are
tagged so the workflow routes them rather than halts on them.

**The four-field payload has no §7 oracle that a transposition would fail.** §4.5 now asserts, in
prose, that the production call site supplies all four fields and that this "is what makes §5.1's
`DecisionLedgerDispatchRecord` fields carry real values rather than `undefined`". §7 contains no
occurrence of `phaseId`, `docType` or `round` — I grepped the whole §7 range. The only production-path
oracle that exists is shipped, not specified: `decisionLedgerMain.test.js:604–620`, which asserts
`expect(record.phaseId).not.toBeUndefined()` and two siblings. That is an absence-shaped oracle in
the sense §7's own DC-07 discipline warns about — it passes for `null`, for a wrong phase string,
and, decisively, for a **transposed** call site (`phaseId: roundDocType, docType: phase`), which is
precisely the defect class §5.4's composition-root reasoning was written to catch. A value-equality
assertion (phase id equal to the round's phase, round equal to the iteration ordinal) would cost
three lines and be falsified by transposition. I hold this at **Medium**, not High, deliberately:
these fields are report-side telemetry, the block's *presence* and *last-ness* in the delivered
prompt are separately and positively pinned by §7.2's live composition-root arm, and no
user-visible behaviour can false-green on it. The record contract predates v1.4 and §7 was not
edited in this delta, so I tag it `inherited` / `nonlocal`.

**PROPERTIES PROP-WIRE-08 now contradicts this document.** `PROPERTIES:344` still reads "appended
**last**, after `oraclePart` and `findingGrammarPart`, on **both** the iteration-1 and the
iteration-≥2 return paths `reviewerPrompt` already has (`orchestrate-dev.js:11483` and `:11506`)".
After this delta, TSPEC §2.4/§4.5 say the opposite, and both line anchors point at code that
appends nothing. This matters more in PROPERTIES than it did in TSPEC, because PROPERTIES is the
document tests are derived from: a property naming a deleted locus is a property that cannot be
written as stated. It is already routed — `CROSS-REVIEW-test-engineer-REVIEW-v2.md` F-02/Q-01 and
`CODE_REVIEW-pdlc-decision-ledger-v1.md` row 34 both route it — and it is still open at HEAD. I
record it so the routing is visible from this round too; `inherited` / `nonlocal`, owned by the
PROPERTIES phase, not by this document.

## Observations

- §2.1's diagram shows the `wrapped(…, ledgerBlock)` hop but not `runWrapped`, which is the actual
  call site in `reviewLoop` and the name §4.5's prose uses. Both names are correct and the two
  sections together are unambiguous; a reader working only from the diagram has one indirection to
  discover. Not worth a finding, worth a line on the next touch.
- The code comment at `orchestrate-dev.js:11914` cites "§2.6's 'last'", but §2.6 is *Freshness* —
  the last-ness requirement lives in §2.4. Stale cross-reference in code, not in this document;
  noting it so whoever next edits that comment can re-point it. The same comment also still says
  "TSPEC §4.5 and PROP-WIRE-08 still name this builder as the locus and are routed as errata" —
  half of that is now discharged by this delta.
- Q-01 from v14 (changelog paragraphs reciting a sibling document's version and list size, a class
  of staleness that recurs) does not recur here: v1.4's changelog cites upstream by hash and
  version but makes no claim about PLAN's or PROPERTIES' internal contents. The advice was taken.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Do you want the value-equality upgrade to `decisionLedgerMain.test.js:604`'s three assertions (phase id, doc type, round equal to the round's own bindings, rather than merely not-`undefined`) folded into the PROP-WIRE erratum that PROP-WIRE-08 already owes, so the oracle and the property land in one edit? I have not raised it as a code finding this round because the code is not under review here. |

**Assumptions carrying forward, unchanged from v13/v14:** §7.3 remains the single home of the
owned-declaration count; the freeze is in force, so Medium and Low findings are recorded and
non-gating; erratum-round scope is the delta plus upstream fidelity, not a full re-read.

## Recommendation

**Approved with minor changes**

Both self-correction items land cleanly and are faithful to the shipped code at every locus I could
check — the five payload sites transcribe the real call site's bindings, and the four threading
sites transcribe the real argument order and the real concatenation expression, in order. The
document no longer contradicts itself (§4.4/§4.5 now agree with §5.1) and no longer names a deleted
parameter as the delivery locus. Upstream is verifiably unmoved by two independent hash families,
so "nothing absorbed" is earned. Nothing previously approved is disturbed: §3, §5, §6, §7 and §8
are byte-identical, no id moves, no measured value moves, no oracle changes shape.

The two findings below are both `inherited` and `nonlocal` — an oracle that this delta's newly
stated contract deserves but §7 does not yet specify, and a downstream property that this delta has
now put visibly out of step. Neither is caused by the delta and neither gates it.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | §4.5's newly stated four-field contract has no oracle in §7 that a transposed call site would fail. §7 contains no occurrence of `phaseId`/`docType`/`round`; the only production-path check is shipped-not-specified (`decisionLedgerMain.test.js:604–620`, `not.toBeUndefined()`), which passes for `null`, for a wrong value, and for `phaseId`/`docType` swapped — the DC-07 defect class §5.4 exists to catch. Value-equality against the round's own `phase`/`roundDocType`/`iteration` bindings would be falsified by transposition. Held at Medium: report-side telemetry only; block presence and last-ness stay positively pinned by §7.2's live arm. | §7 (untouched), §4.5, §5.1 |
| F-02 | Medium | inherited | nonlocal | `PROPERTIES:344` (PROP-WIRE-08) now contradicts this document: it still pins the append to `reviewerPrompt`'s two return paths at `orchestrate-dev.js:11483`/`:11506`, both dead anchors, while §2.4/§4.5 now correctly name `dispatchAndVerify`. PROPERTIES is the test-derivation document, so the property cannot be written as stated. Already routed (`CROSS-REVIEW-test-engineer-REVIEW-v2.md` F-02/Q-01, `CODE_REVIEW` v1 row 34), still open at HEAD; recorded here so the routing is visible from this round. | PROPERTIES PROP-WIRE-08 vs TSPEC §2.4/§4.5 |

FINDING: Medium | inherited | nonlocal | §4.5's four-field seam contract has no §7 oracle; the only production-path check (decisionLedgerMain.test.js:604–620) asserts not-undefined and cannot detect a transposed phaseId/docType, the DC-07 class §5.4 targets. Value-equality against the round's phase/roundDocType/iteration is the fix. Non-gating: report-side telemetry, block presence and last-ness stay pinned by §7.2's live composition-root arm.
FINDING: Medium | inherited | nonlocal | PROPERTIES PROP-WIRE-08 (PROPERTIES:344) still names reviewerPrompt's deleted parameter and the dead anchors orchestrate-dev.js:11483/:11506 as the append locus, now in direct contradiction with TSPEC §2.4/§4.5 after this delta. Owned by the PROPERTIES phase, already routed as an erratum, still open at HEAD.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}

APPROVAL-HASH: sha256:b8dcac11a521bc199d223a0547d3bd7d672640f5f6598d5b6103b2031246db6d
APPROVAL-HASH-NORMALIZED: sha256:6970093e3d880f7169d8f73a76bee4f5030adfa7f570fb30e68520c940e5c164
REVIEWED-COMMIT: 648a05255df3be3806bc279420a84a82f60f9dbe
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
