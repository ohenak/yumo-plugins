# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 10
**Round type:** upstream-cascade confirmation (FSPEC v0.10 → v0.12)

## Overview

**One question, one answer: does TSPEC still hold as approved against FSPEC at HEAD?**

TSPEC has not moved. Its bytes are `sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3`,
byte-identical to the `APPROVAL-HASH` recorded in `CROSS-REVIEW-product-manager-TSPEC-v9.md`, and
`git log 260f34bc..HEAD -- TSPEC-pdlc-learnings-injection.md` is empty. REQ has not moved either:
`sha256:ff605dd3…` at HEAD, the same bytes this document has been reviewed against since v7.

FSPEC has moved, and this time **not** header-only. It went from `sha256:a4f775bd…` (v0.10, the
`UPSTREAM-STATE` recorded in v9) to `sha256:fb18dbda…` (v0.12) over six commits (`3f21bd3b..c1d7218e`),
+54/−26 lines. The substantive content of that delta is that upstream **adopted the two corrections
this TSPEC itself routed upstream** as ERR-7 and ERR-3:

1. **BR-1 now states REQ C-1's rule with both conjuncts** — authoring-classified **and** target
   document among REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES — and says in terms that the second
   conjunct is "load-bearing, not defensive", naming the code-review phase's optimizer round as the
   dispatch it excludes (REQ AC-1.2, NG-5).
2. **BR-1's complement is carried through** to BR-11, AT-03 and AT-29, which now quantify over
   dispatches "outside BR-1's rule" rather than over "non-authoring" ones; AT-02 gains a fixture
   containing an authoring-classified dispatch with no C-1 target, and D-2 asks the two-conjunct
   question with all three branches named.
3. **BR-15's expected read set** drops the corpus enumeration (which opens no file under `docs/` and
   so contributes no member to that instrument) and is stated as an enumerable set equality, not a
   count; AT-33 follows.
4. The Overview and A-2 stop restating one conjunct when deferring to BR-1, and the header
   Cross-Reviews row stops hand-enumerating rounds.

**The answer is yes, TSPEC still holds — and its central design claim is now stronger, not weaker.**
TSPEC's `injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`
(§A.2) was, at approval, a *divergence* from FSPEC BR-1 that TSPEC honestly refused to resolve
silently in code and routed as ERR-7. Upstream has now agreed. The same design text that was a
routed conflict is, at HEAD, an exact compression of BR-1. No rule, threshold, notice id, config
state, report field or acceptance criterion that TSPEC compresses changed against it.

What the delta *does* leave behind is bookkeeping that upstream has overtaken: two open ERR entries
in TSPEC (ERR-7, ERR-3) that quote FSPEC text no longer at HEAD and describe a conflict that no
longer exists, and one AT-02 fixture obligation FSPEC newly names that TSPEC's fixture inventory
does not yet enumerate. Those are the findings below — Medium, none gating, all inside the material
this delta targeted.

## Architecture

**What this TSPEC leans on upstream, re-read at the current version.** I did not re-read TSPEC from
scratch; I re-read the FSPEC sections it compresses, at `sha256:fb18dbda…`, and checked TSPEC's
transcription against those bytes rather than against my memory of v0.10.

| TSPEC claim | Upstream locus at HEAD | Still says it |
|---|---|---|
| Injection attaches at `dispatchAndVerify`, gated on `dispatchKind === "authoring"` **and** `docType ∈ {REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES}` (§A.2, `TSPEC:131`, `:35-36`) | FSPEC BR-1 (v0.12, two conjuncts), REQ C-1, AC-1.2, NG-5 | **Yes — and newly so.** At v0.10 this was TSPEC's routed divergence; at v0.12 it is upstream's own rule, word for word in substance |
| Phase CR's optimizer round (`docType: null` over a directory target) carries no block, contributes no `dispatches[]` row and no filesystem footprint, and its prompt is byte-identical to the disabled run's (§A.2, `TSPEC:134-137`) | FSPEC BR-1's "load-bearing, not defensive" paragraph; BR-11 and AT-03 as re-quantified over dispatches "outside BR-1's rule" | Yes — upstream now names exactly this dispatch |
| The `docType` conjunct consumes two existing pipeline values rather than restating a call-site membership list (§A.2 property 1) | FSPEC BR-1 "Both conjuncts read the pipeline's own existing values, not a new list maintained by this feature"; FSPEC A-2 as rewritten | Yes — A-2's rewrite is TSPEC's argument, adopted upstream |
| `RSN-SELF` is decided from the path before any read, so a self document is never opened, which is what BR-15's expected-set exclusion requires (§D.6, `TSPEC:777-781`) | FSPEC BR-15 at HEAD (expected set = report-named documents less `RSN-SELF`) | Yes |
| The corpus enumeration is a `git ls-files` call, not an open under `docs/` (§I.1, §A.3) | FSPEC BR-15 at HEAD: "The corpus enumeration … contributes **no** member: it opens no file under `docs/`" | Yes — upstream adopted TSPEC's ERR-3 reading |
| Ordering keys and corpus outcomes are recorded **per dispatch**, at the two loci AC-3.3 names (§A.5, §D.1, §D.2) | FSPEC BR-9/BR-10, AT-19…AT-22 | Yes — untouched by this delta |
| Four config states owned by exactly two ATs, AT-31/AT-32 (§I.2, `TSPEC:464-469`) | FSPEC E-21…E-34 mapping rows | Yes — block byte-identical across the delta |

**The one architectural consequence of the delta is subtractive, not additive.** Nothing in TSPEC's
design has to change to match FSPEC v0.12; what has to change is TSPEC's *account of its own
disagreement*. §A.2's property 1 still closes with "FSPEC BR-1 as written forbids this conjunct
… so the divergence is **routed as ERR-7**, not resolved silently in code" (`TSPEC:155-158`), and
ERR-7 itself (`TSPEC:1297-1311`) quotes BR-1's old single-conjunct sentence verbatim — "the pipeline
classifies it as authoring at the moment it is composed", "consumes the classification, it does not
restate the membership" — as the text TSPEC is in tension with. Upstream no longer contains either
sentence in that form. Per DEC-ERR-03 that is a finding of this confirmation whether or not it was
on the item list: TSPEC cites upstream text upstream no longer says (F-01).

This is a good problem. The routed conflict was resolved in the direction TSPEC argued for, which is
precisely the outcome the routing existed to obtain. What is left is to record the resolution the
same way TSPEC already records ERR-4 and ERR-6 — "**CLOSED**, resolved by FSPEC v0.12" — so that a
PLAN author or implementer reading the erratum log does not go looking for a live contradiction.

## Interfaces

**Product-facing surfaces, re-checked against upstream at HEAD.** The surfaces this feature exposes
to an operator are: the `learningsInjection` config section, the advisory block injected into an
authoring dispatch, the run-report key, and the notice catalogue. The FSPEC delta touched exactly
one of them — *which dispatches* receive the block — and moved it in TSPEC's direction.

- **Which dispatches carry the block.** Upstream now: authoring-classified **and** C-1 target
  document; every dispatch outside that rule byte-identical to the disabled-run baseline (BR-1,
  BR-11, AT-03, AT-29). TSPEC: identical, via `injectHere` (§A.2). The user-visible boundary — a
  code-review-phase optimizer round does **not** get prior-feature learnings pushed at it while it
  is remediating shipped code — is now stated the same way on both sides of the seam. This was the
  one place where a test written to FSPEC could have redded a correct implementation; that hazard is
  gone.
- **Config section.** Absent → enabled on §4.1 defaults (G-1, AC-1.1). Explicit `enabled: false` →
  report key absent (AC-5.1a). Malformed section → fail open + `NTC-MALFORMED` (AC-5.1b).
  Wrong-typed key → fail open + `NTC-KEYTYPE` (AC-5.1c). All four unchanged in FSPEC v0.12; TSPEC's
  §I.2 table transcribes them unchanged.
- **Advisory block.** Eligibility, ordering and bound are still BR-9/BR-10's; TSPEC still transcribes
  rather than re-decides them (`TSPEC:326` says so explicitly, and that self-description remains
  accurate).
- **Run report.** `present`-shaped per dispatch, run-level mirror optional (§D.1/§D.2). Upstream
  still permits an implementation that omits `runMirror` entirely; Q-01 carried, still not a finding.
- **Notices.** `NTC-MALFORMED` / `NTC-KEYTYPE` ids unchanged in FSPEC's catalogue.

**The read-footprint instrument (BR-15/AC-5.2) is now enumerable, and TSPEC already assumed it was.**
Upstream's new wording — expected set is exactly one attempt per report-named document other than the
`RSN-SELF` ones, compared as **sets of paths** not counts, enumeration contributing no member — is
the instrument TSPEC's §D.6 and §T.5 were written against. TSPEC's ERR-3 exists solely to say the old
wording made AT-33's set equality unsatisfiable. It is now satisfiable. ERR-3 should be marked
**CLOSED** for the same reason ERR-7 should (F-02).

**Bookkeeping the delta did not reach.** FSPEC's own header Cross-Reviews row was fixed by replacing
the hand-enumeration with `v{N}` — "every round present on this branch, not hand-enumerated". TSPEC's
equivalent row (`TSPEC:13`) still stops at v6 while v7…v9 exist on the branch, and its Upstream row
(`TSPEC:11`) still pins FSPEC "(v0.9)". Both are inherited, non-behavioural and Low (F-04, F-05) —
but FSPEC has now demonstrated the fix worth copying, which strengthens the `Process` signal I raised
at v9: this row is derivable from the filesystem and should not be maintained by hand in any pdlc
document.

## Data Model

**No type, enum, range or return-type drift.** Diffing every enumerated set TSPEC carries against
upstream at HEAD produces no divergence and no unmarked internal variant:

- **Config states** — four rows (§I.2, `TSPEC:464-469`) against FSPEC E-21/E-22/E-23/E-34 →
  AT-32/AT-31/AT-32/AT-32. Unchanged bytes on both sides.
- **Notice ids** — `NTC-MALFORMED`, `NTC-KEYTYPE`. Unchanged.
- **Corpus outcomes and reason ids** — `RSN-SELF`, `RSN-UNREADABLE`, `RSN-UNLISTABLE` and the
  per-document reason rows. The delta re-worded BR-15's *expected set* around them but changed no id
  and no membership: `RSN-SELF` still excluded, `RSN-UNREADABLE` still a member because the failed
  attempt is the read. TSPEC §D.6 and §T.5 match.
- **`LEARNINGS_TARGET_DOCTYPES`** — the frozen six-element literal (`TSPEC:126-129`). This is the one
  enumeration whose *upstream status* changed: at v0.10 it was TSPEC's own addition over BR-1; at
  v0.12 the same six names are BR-1's second conjunct verbatim (REQ C-1's list). Set equality holds
  in both directions, six for six.
- **Report shape** — `present` predicate, `dispatches[]` rows, `orderKeys`, `corpusDiverged` (with
  its `false`-never-`null` first-dispatch rule), optional `runMirror`. Untouched by the delta; still
  permitted by REQ AC-3.2's "if carried".

**One data-model-adjacent consequence of the delta is worth stating explicitly, because it is the
thing the second conjunct buys the operator.** BR-1's `docType` conjunct is what makes the set in
AC-1.2 a *set equality* rather than a containment: without it the set carrying material is a strict
superset of what C-1 names, and `dispatches[]` acquires rows for a phase the product decided not to
serve. TSPEC said this at approval (`TSPEC:152-155`: "without it AC-1.2's set equality fails against
a strict superset"). Upstream now says it too. The report's row inventory and the product's scope
boundary are, at HEAD, the same statement — which is what makes AC-1.2 mechanically checkable
instead of documentary.

**§A.5's ordering-key walk** (`orderKeys`, dispatch-1-through-dispatch-5, `RSN-UNLISTABLE` at
dispatch 5) still matches FSPEC BR-9/BR-10 exactly. The delta left the per-dispatch locus alone. No
key, no default, no bound moved.

## Test Strategy

Not re-reviewed in substance — the test-engineering lens owns depth, and I do not re-litigate it.
Two product-relevant checks only, both about whether an acceptance criterion still has an owning test
after the delta.

**1. AT ownership is intact.** AT-01/02/03/06/14/23/24/29/31/33/34/35 remain in
`learningsDispatchSet.test.js`, AT-17…AT-22 in `learningsRecord.test.js`, AT-31/AT-32 in
`learningsConfig.test.js` (§T.5, `TSPEC:943-944`). The delta orphaned no AC: AC-1.1, AC-1.2, AC-1.3,
AC-3.2, AC-3.3, AC-5.1a/b/c and AC-5.2 each still have at least one AT, and each AT still has a named
file and layer.

**2. One new upstream fixture obligation is not yet in TSPEC's inventory (F-03).** FSPEC v0.12's
AT-02 now enumerates four fixtures, not three: no-DECISIONS-phase, no-creator Phase R, five optimizer
rounds, **and** "a run containing an authoring-classified dispatch whose target is none of the six
C-1 document types — so reverting BR-1's second conjunct reds this test". AT-03 is correspondingly
re-quantified to compare "the prompt of each dispatch **outside BR-1's rule** — including the
authoring-classified dispatch with no C-1 target".

TSPEC's §T.6 AT-02 paragraph (`TSPEC:978-985`) enumerates the first three, then adds a fourth of its
own (the erratum land-proof retry, ERR-2). It does not name the Phase-CR-bearing fixture, and §T.6
does not restate AT-03's new quantifier. This is a completeness gap against upstream at HEAD, not a
design gap: TSPEC already carries a *different* and arguably stronger oracle for the same boundary —
the `_recordDocType` probe seam sampled on both arms of `injectHere`, set-equal against the
hand-transcribed literal after a full scripted run (`TSPEC:176-190`), explicitly described as "the
only instrument that sees a `docType` the feature declined". So the mutation FSPEC's new fixture is
designed to kill is already killed somewhere in this document's test plan.

I record it Medium rather than High for exactly that reason: no acceptance criterion is left
unprovable, and no P0/P1 requirement is dropped — what is missing is the enumerated fixture in the
AT-02 row, which a PLAN task will be written from. The fix is one clause in §T.6 naming the
Phase-CR-optimizer fixture as AT-02's fourth-and-fifth run shape and AT-03's added arm, with a
pointer to §A.2's probe as the mutation oracle that already covers it. Left unwritten, the PLAN
author reconciling §T.6 against FSPEC AT-02 will find a fixture list that is short by one and no
statement of why.

**Test-strategy claims the delta did *not* disturb:** AT-20 and AT-22 still run over AT-18's
changing-corpus multi-dispatch fixture (`TSPEC:943`); `DIVERGENT-CORPUS` still asserts on the
per-dispatch locus only and nothing about `runMirror`, which upstream still leaves unconstrained;
AT-33/AT-34's paired footprint claim still uses one instrument for both halves (DC-03), and BR-15's
re-wording makes AT-33's expected set easier to write, not different in kind.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v7, v8 and v9; still open, still not a finding. §D.1 gives the run-level mirror its own membership test as a fourth field domain, while §D.2 says an implementation that omits `runMirror` entirely still conforms. Both are true and consistent — a membership test over an absent field is vacuously green — but one of four domain tests can pass without observing a value. The P-phase author's call (three domains plus a documented non-oracle, or four with the vacuity noted); REQ v0.9 permits either ("if carried"). Unmoved by this delta. |
| Q-02 | **Discharged at v9** (FSPEC's Cross-Reviews row), and this round shows the fix generalised: FSPEC v0.12 stopped hand-enumerating the row altogether rather than re-enumerating it. Nothing left open here. |
| Q-03 | Re-raised, with new evidence. Should the header Cross-Reviews row be hand-maintained at all? It went stale in FSPEC twice, and is stale in TSPEC now (F-05). FSPEC v0.12 answered locally by replacing the enumeration with `v{N}` plus "every round present on this branch". That is a fix a hook or a template could make once for every pdlc document instead of each reviewer spending rounds on it. Not a question for this document — routed to harvest, `Process`. |
| Q-04 | New, and the only genuinely open one this round raises. TSPEC's erratum log distinguishes CLOSED items (ERR-4, ERR-6 — each naming the upstream version that resolved it) from live ones (ERR-1, ERR-2, ERR-3, ERR-5, ERR-7). ERR-3 and ERR-7 are now resolved upstream but still read as live (F-01, F-02). Who closes them, and when? My reading: the same editorial pass that bumps the version labels (F-04), owned by the next author round on TSPEC, before PLAN authoring consumes §T.6. It is not this confirmation's job to edit TSPEC, and I am not asking for a revision round to do it — but the closure should not wait until an implementer discovers the log describes a contradiction that no longer exists. |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **ERR-7 quotes FSPEC text that upstream no longer says.** `TSPEC:1297-1311` quotes BR-1 as stating a dispatch carries a block "**if and only if** the pipeline classifies it as authoring at the moment it is composed" and that the rule "consumes the classification, it does not restate the membership", and concludes that "FSPEC BR-1 as written forbids this conjunct", that "AT-02 consequently has two contradictory readings of its expected set", and that "a test written to FSPEC reds a correct implementation". FSPEC v0.12 contains none of that: BR-1 now carries both conjuncts, calls the second "load-bearing, not defensive", and AT-02's expected set is "the subset BR-1's two-conjunct rule names". §A.2's property 1 (`TSPEC:155-158`) repeats the same stale premise. The conflict is resolved in TSPEC's favour; the document still reads as though it were live. **Fix:** mark ERR-7 "**CLOSED**, resolved by FSPEC v0.12" in the form ERR-4 and ERR-6 already use, and strike the "BR-1 as written forbids this conjunct … routed as ERR-7" clause from §A.2 property 1, keeping the design text unchanged. | REQ C-1, AC-1.2, NG-5 |
| F-02 | Medium | Local | **ERR-3 likewise describes a resolved conflict as live.** `TSPEC:1266-1270` says BR-15's expected set is "the corpus-root enumeration, plus one open attempt for every corpus document the report names" and that "as written, AT-33's set equality cannot hold". FSPEC v0.12's BR-15 drops the enumeration from the expected set explicitly ("contributes **no** member: it opens no file under `docs/`") and states membership as a set equality over paths; AT-33 follows. **Fix:** mark ERR-3 "**CLOSED**, resolved by FSPEC v0.11/v0.12", noting that upstream adopted TSPEC's reading, and leave §D.6/§T.5 unchanged — they were already written against the corrected instrument. | REQ AC-5.2 |
| F-03 | Medium | Local | **§T.6's AT-02 fixture inventory is short by upstream's new arm.** FSPEC v0.12 AT-02 requires a fixture containing "an authoring-classified dispatch whose target is none of the six C-1 document types — so reverting BR-1's second conjunct reds this test", and AT-03 now compares every dispatch "outside BR-1's rule, including the authoring-classified dispatch with no C-1 target". TSPEC §T.6 (`TSPEC:978-985`) enumerates three run shapes plus its own ERR-2 fourth, and names neither. The boundary is *not* untested in TSPEC — §A.2's `_recordDocType` probe set equality (`TSPEC:176-190`) already kills the mutation — which is why this is Medium and not High. **Fix:** add the Phase-CR-optimizer run shape to §T.6's AT-02 list and state AT-03's added arm, cross-referencing §A.2's probe as the oracle that covers it, so the PLAN task written from §T.6 matches upstream's fixture count. | REQ AC-1.2, AC-4.3, NG-5 |
| F-04 | Low | Local | **Version labels pin a superseded FSPEC.** `TSPEC:11` pins `FSPEC-pdlc-learnings-injection.md (v0.9)`; in-body citations at `TSPEC:326`, `:469`, `:943`, `:1275`, `:1295` read "FSPEC v0.9 …". HEAD is v0.12. Every referent (BR-9, BR-10, E-21…E-34, AT-18/AT-20/AT-22) is byte-identical across the delta, so nothing is mis-stated — only the label is stale, and it is now two versions behind rather than one. Carried from v9 F-01, re-opened by this delta. **Fix:** bump the five labels and the Upstream row in the next editorial pass. | REQ AC-1.1, AC-3.2, AC-3.3, AC-5.1a |
| F-05 | Low | Local | **TSPEC's own Cross-Reviews row stops at v6** (`TSPEC:13`) while PM/TE TSPEC cross-reviews v7, v8 and v9 exist on the branch (v10 lands with this file). Inherited, bibliographic, non-behavioural. Upstream just fixed the same defect in FSPEC by replacing the enumeration with `v{N}` — "every round present on this branch, not hand-enumerated". **Fix:** adopt FSPEC v0.12's form rather than re-enumerating; see Q-03. | REQ — traceability/bibliographic, no AC |
| F-06 | Low | Local | Inherited from v7/v8/v9, unchanged and unresolved: `OQ.2` (`TSPEC:1237`) and `ERR-4` (`TSPEC:1277`) name the corrected gate as living in §I.3, but the gate is at `TSPEC:441-448` inside §I.2 Configuration; §I.3 (`TSPEC:486`) is pure selection core and carries no gate. **Fix:** re-point both to §I.2. | REQ AC-5.1a, AC-5.1b |
| F-07 | Low | Local | Inherited from v7/v8/v9, unchanged: §A.5's closing sentence (`TSPEC:359-361`) sends the reader to §T.2 for the per-dispatch loci, but §T.2 (`TSPEC:799`) is the layer table; the assertions live in §T.6's `DIVERGENT-CORPUS` (`TSPEC:987-992`). **Fix:** re-point to §T.6 and §D.2. | REQ AC-3.2, AC-3.3 |
| F-08 | Low | Local | Inherited from v7/v8/v9, unchanged: `OQ.2`'s bare-repository note (`TSPEC:1241-1244`) carries a stale AT mapping — FSPEC maps E-21 to AT-32 and §T.5 assigns AT-32 to `learningsConfig.test.js` (`TSPEC:952-958`). **Fix:** drop or re-point the note. | REQ G-1, AC-1.1, AC-5.1a |
| F-09 | Low | Process | Inherited from v8/v9, unchanged: TSPEC's premise rows P-1/P-2a/P-2b/P-10 and §A.2 cite `orchestrate-dev.js` by raw `file:line` (`:13515`, `:7663`, `:12821`, `:12915`, `:14551-14556`, `:7306`, `:7342-7358`, `:13766`…`:13996`). These are not runtime-measured evidence, so DEC-DOC-01 makes them a `Process`-scope Low: re-anchor on symbol names (`converge`, `reviewLoop`, `dispatchAndVerify`) with line numbers as a hint, not the citation. | REQ AC-1.2 (premises supporting it) |

## Positive Observations

- **The routing worked, end to end, and this is the round that proves it.** TSPEC did not resolve
  the BR-1 conflict silently in code. It implemented the two-conjunct gate, said plainly that FSPEC
  as written forbade it, and routed the divergence upstream as ERR-7 rather than letting a
  downstream document quietly overrule its own spec. Two rounds later, upstream adopted exactly that
  rule — including TSPEC's own argument, nearly verbatim, in BR-1's "load-bearing, not defensive"
  sentence and in A-2's rewrite. That is the pipeline's escalation path doing precisely what it
  exists for, and it is worth naming because the cheaper move — patch the code, note nothing — would
  have left AT-02 with two contradictory readings and a test that reds a correct implementation.
- **ERR-3 was the same discipline on a smaller stake.** A one-line observation that a `git ls-files`
  call is not a file open under `docs/`, and therefore that BR-15's expected set could never be
  satisfied as written. Small, precise, provable, and now fixed upstream in the exact terms TSPEC
  used. Findings like this are why "evidence over impressions" is worth the extra sentence.
- **TSPEC did not acquire an opportunistic edit while frozen.** Three upstream cascades in a row now
  (FSPEC v0.9→v0.10→v0.12) and the TSPEC bytes are still `sha256:eff5a19b…`, byte-identical to the
  v7 approval hash. Approval means something because the document holds still, and confirmation
  rounds stay cheap because there is nothing to re-read but the diff.
- **Citing upstream by spec id keeps paying.** FSPEC moved +54/−26 lines across six commits,
  rewrote BR-1, BR-11, BR-15, D-2, A-2, AT-02, AT-03, AT-29 and AT-33 — and I could scope this
  confirmation in one pass because TSPEC references "BR-1", "BR-9/BR-10", "E-21…E-34", "AC-3.3", and
  never a line number in FSPEC. `grep "FSPEC:[0-9]"` over the document still returns nothing. F-09's
  `orchestrate-dev.js` anchors are the counter-example in the same file: the same document
  demonstrates both sides of DEC-DOC-01.
- **The findings this round are the residue of being right, not of being wrong.** Every Medium here
  exists because upstream agreed with TSPEC and TSPEC has not yet noticed. That is a strictly better
  class of defect than the one it replaced.

## Recommendation

**Approved with minor changes**

TSPEC still holds as approved against FSPEC v0.12. The upstream edit was substantive rather than
header-only — BR-1 gained its second conjunct, BR-11/AT-03/AT-29 were re-quantified over its
complement, BR-15's expected set was restated as a path-set equality, D-2 and A-2 were rewritten —
but every one of those changes moved upstream **toward** the design this TSPEC already carries. I
re-read the upstream text this document leans on, at its current version, and the compression is
still faithful: the two-conjunct gate (§A.2), the Phase-CR exclusion, the `RSN-SELF`-before-read
rule (§D.6), the enumeration-contributes-no-member reading (§I.1/§A.3), the per-dispatch ordering
loci (§A.5/§D.1/§D.2) and the four config states (§I.2) each match FSPEC at HEAD one-for-one. No
enum, id, threshold, notice or report field diverged.

Product lens satisfied, unchanged from v7 through v9 and now better supported upstream: the feature
ships **on** in a bare repository (G-1, AC-1.1); explicit disablement removes the report key
(AC-5.1a); malformed fails open with `NTC-MALFORMED` (AC-5.1b) and wrong-typed with `NTC-KEYTYPE`
(AC-5.1c); the set carrying material equals exactly the set C-1's rule names, now as a set equality
both documents state the same way (AC-1.2, NG-5); reproducibility is claimed per dispatch at the two
loci AC-3.3 names. No P0 or P1 requirement is omitted, narrowed or reinterpreted, and no behaviour
outside the REQ's scope has appeared.

Three Medium findings, none gating, all bookkeeping that upstream overtook: ERR-7 and ERR-3 should be
marked CLOSED against FSPEC v0.12 rather than reading as live conflicts (F-01, F-02), and §T.6's
AT-02 fixture inventory should name the authoring-classified non-C-1-target run shape FSPEC now
requires, cross-referencing §A.2's `_recordDocType` probe as the oracle that already kills that
mutation (F-03).

DEFERRED to the next author round on TSPEC, before PLAN authoring consumes §T.6: F-01/F-02 (close
ERR-7 and ERR-3, strike §A.2's stale "BR-1 as written forbids" clause), F-03 (AT-02/AT-03 fixture
arms), F-04 (bump five "FSPEC v0.9" labels and the Upstream row to v0.12), F-05 (Cross-Reviews row —
adopt FSPEC v0.12's non-enumerated form). DEFERRED as a single editorial pass: F-06/F-07's
§I.3-for-§I.2 and §T.2-for-§T.6 pointers, F-08's stale bare-repository note, F-09's raw
`orchestrate-dev.js` line anchors.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | ERR-7 and §A.2 property 1 quote BR-1's single-conjunct text and call the conjunct forbidden; FSPEC v0.12's BR-1 carries both conjuncts, so the conflict is resolved and should read CLOSED | §OQ ERR-7 / §A.2 property 1 |
| F-02 | Medium | delta | local | ERR-3 says BR-15's expected set includes the corpus-root enumeration and that AT-33's set equality "cannot hold"; FSPEC v0.12 drops the enumeration and states a path-set equality | §OQ ERR-3 |
| F-03 | Medium | delta | local | §T.6's AT-02 fixture inventory omits FSPEC v0.12's mandated authoring-classified non-C-1-target run shape, and AT-03's re-quantified arm; §A.2's `_recordDocType` probe already covers the mutation | §T.6 AT-02 |
| F-04 | Low | delta | local | Upstream row and five in-body citations pin FSPEC v0.9; HEAD is v0.12, referents byte-identical | §Header Upstream row / §A.5 / §I.3 / §T.5 / §ERR-4 |
| F-05 | Low | inherited | nonlocal | TSPEC's Cross-Reviews row stops at v6; v7/v8/v9 exist on the branch | §Header Cross-Reviews row |
| F-06 | Low | inherited | nonlocal | OQ.2 and ERR-4 point at §I.3 for a gate that lives in §I.2 | §OQ.2 / §ERR-4 |
| F-07 | Low | inherited | nonlocal | §A.5 points at §T.2 for per-dispatch loci asserted in §T.6's DIVERGENT-CORPUS | §A.5 |
| F-08 | Low | inherited | nonlocal | OQ.2's bare-repository note carries a stale AT mapping for E-21 | §OQ.2 |
| F-09 | Low | inherited | nonlocal | Raw `orchestrate-dev.js` file:line anchors in P-1/P-2a/P-2b/P-10 and §A.2, DEC-DOC-01 | §Premises / §A.2 |

FINDING: Medium | delta | local | §OQ ERR-7 / §A.2 property 1 | ERR-7 (TSPEC:1297-1311) quotes BR-1 as "if and only if the pipeline classifies it as authoring" and "consumes the classification, it does not restate the membership", concludes BR-1 forbids the docType conjunct and that AT-02 has two contradictory readings; FSPEC v0.12's BR-1 states both conjuncts and calls the second load-bearing, so the conflict is resolved in TSPEC's favour and should be marked CLOSED like ERR-4/ERR-6, with §A.2's "routed as ERR-7" clause struck
FINDING: Medium | delta | local | §OQ ERR-3 | ERR-3 (TSPEC:1266-1270) says BR-15's expected set includes the corpus-root enumeration and that AT-33's set equality "cannot hold"; FSPEC v0.12's BR-15 says the enumeration "contributes no member" and states an enumerable path-set equality, adopting TSPEC's reading — ERR-3 should read CLOSED
FINDING: Medium | delta | local | §T.6 AT-02 | FSPEC v0.12 AT-02 requires a fourth fixture — an authoring-classified dispatch whose target is none of the six C-1 types, so reverting BR-1's second conjunct reds the test — and AT-03 now covers every dispatch outside BR-1's rule; TSPEC §T.6 (978-985) names neither, though §A.2's _recordDocType probe set equality already kills that mutation
FINDING: Low | delta | local | §Header Upstream row / in-body FSPEC labels | TSPEC:11 pins FSPEC (v0.9) and TSPEC:326/:469/:943/:1275/:1295 cite "FSPEC v0.9"; HEAD is v0.12 — every referent (BR-9, BR-10, E-21…E-34, AT-18/20/22) is byte-identical, only the label is stale
FINDING: Low | inherited | nonlocal | §Header Cross-Reviews row | TSPEC:13 enumerates PM/TE TSPEC cross-reviews v1…v6 while v7/v8/v9 exist on the branch; FSPEC v0.12 fixed the same defect by dropping the hand-enumeration
FINDING: Low | inherited | nonlocal | §OQ.2 / §ERR-4 | OQ.2 (TSPEC:1237) and ERR-4 (TSPEC:1277) locate the corrected gate in §I.3; it is at TSPEC:441-448 inside §I.2, and §I.3 (TSPEC:486) carries no gate
FINDING: Low | inherited | nonlocal | §A.5 | §A.5's closing sentence (TSPEC:359-361) sends the reader to §T.2 for the per-dispatch loci; §T.2 (TSPEC:799) is the layer table and the assertions live in §T.6's DIVERGENT-CORPUS (TSPEC:987-992)
FINDING: Low | inherited | nonlocal | §OQ.2 | OQ.2's bare-repository note (TSPEC:1241-1244) carries a stale AT mapping: FSPEC maps E-21 to AT-32 and §T.5 assigns AT-32 to learningsConfig.test.js (TSPEC:952-958)
FINDING: Low | inherited | nonlocal | §Premises P-1/P-2a/P-2b/P-10 and §A.2 | Raw file:line anchors into orchestrate-dev.js are not runtime-measured evidence, so DEC-DOC-01 makes them Process-scope Low; re-anchor on symbol names with line numbers as a hint

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 6}

APPROVAL-HASH: sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3
APPROVAL-HASH-NORMALIZED: sha256:91726204b43da70f7025bd7e0423498212e5dea7f4ecf377de823f5868c6d7af
REVIEWED-COMMIT: 0f7d75927d84acd7eb6a80d5d89132b6c9f53cae
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:fb18dbda1cef8497143e931894d09b83871657b9c8108305948cc03566b0727c
