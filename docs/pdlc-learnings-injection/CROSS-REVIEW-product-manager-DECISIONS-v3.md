# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 3 (upstream-cascade confirmation; DECISIONS bytes unchanged)
**Scope:** Local

## Context

I approved DECISIONS at v2 (`Approved with minor changes`, 0 High / 1 Medium / 1 Low) against
`REVIEWED-COMMIT: d140fbee`, with `UPSTREAM-STATE: FSPEC sha256:57b71e0c…` — that is FSPEC **v0.7**,
commit `fa229bde`. FSPEC at HEAD is `sha256:a4f775bd…` (`9a4b7593`, **v0.10**). DECISIONS' own bytes
have not moved since my approval; the question is only whether it is still a faithful compression of
upstream as upstream now stands.

The upstream delta I actually re-read is the whole span `fa229bde..9a4b7593`, not just the last
commit, because my approval was recorded against the older blob:

| FSPEC round | What it changed |
|---|---|
| v0.8 (`a6b42bae`) | Erratum note only: re-grounded on REQ v0.9, recorded the `present && config.enabled && !sectionMalformed` gate item as TSPEC-scoped. No behavioural text moved. |
| v0.9 (`cbb0a63e`, `523e2df9`) | **Substantive.** BR-9's corpus-level catalogue and BR-10's ordering-key values move from **run-level** to **per authoring dispatch**; §4.1 thresholds stay run-level; BR-10 now closes at **two loci with one completeness test each**; a run-level mirror is "additive, not the oracle — nothing asserts on it". Step 0(21), AT-20, AT-21, AT-22 restated on that locus. AC-6.2 traceability row corrected. |
| v0.10 (`9a4b7593`) | Header only: Cross-Reviews row `v{1…9}` → `v{1…11}`, version 0.9 → 0.10. |

I also re-read the two other upstream documents at the shas named in this dispatch. REQ
(`ff605dd3…`) is byte-identical to the one my v2 approval was taken against, so nothing DECISIONS
draws from REQ has shifted. TSPEC is **not** identical: my approval carried
`TSPEC sha256:72712bd8…`, and HEAD is `eff5a19b…` — TSPEC has since moved from v0.5 to v0.6 and
closed `ERR-4` and `ERR-6`. That matters here because DECISIONS makes several load-bearing
assertions *about* TSPEC's current contents, and those are exactly the kind of citation DEC-ERR-03
puts in scope for this confirmation.

So the confirmation runs on three questions: (1) does any DECISIONS entry transcribe an FSPEC rule
that v0.9 restated; (2) does any entry describe upstream's open questions as open when upstream has
closed them; (3) do the entries' binding decisions themselves survive.

## Options Considered

Three readings of the cascade were live before I checked the text, and the evidence had to pick one.

**Reading A — the delta is cosmetic, confirm and move on.** The dispatch describes the erratum as a
header correction, and the last commit really is header-only. If the only thing that moved were the
Cross-Reviews enumeration and a version label, the confirmation would be a formality: DECISIONS
cites no cross-review filenames. **Rejected as the whole story.** My approval was recorded against
FSPEC v0.7, not v0.9, so the span I own includes the v0.9 locus change. Confirming on the last
commit alone would have approved DECISIONS against two FSPEC rounds I never read.

**Reading B — the v0.9 locus change breaks a DECISIONS transcription, halt.** BR-9 and BR-10 changed
where the record lives and how many completeness tests close it. If a DECISIONS entry had
transcribed the run-level record as a binding constraint — the way DEC-LI-07 transcribes BR-14's
five-state table — the transcription would now be wrong, and wrong in the direction that produces a
red or, worse, an oracle asserted on a mirror FSPEC now says "nothing asserts on". **Rejected on the
evidence.** I traced every DECISIONS mention of `BR-8`/`BR-9`/`BR-10`/`E-32`/`AC-3.2`/`AC-3.3`. The
binding entries are all *per-dispatch* already and get stronger, not weaker, under v0.9: DEC-LI-06's
no-cache argument rests on "selection is per-dispatch over the state that dispatch observed", and
`D-O-6`'s call-count oracle is specified per injecting dispatch, including the case where
enumeration succeeds at dispatch 1 and fails at dispatch 5. FSPEC v0.9 moved *toward* those, not
away.

**Reading C — the decisions hold, but the document'sstatements *about* upstream have gone stale.**
This is what the text shows. The staleness is concentrated in two places that are not decisions:
the "Decisions deliberately NOT taken here" row for AC-3.3's locus, which still describes the
question as routed-and-open with TSPEC "keeping the run-level record", and DEC-LI-07's divergence
paragraph, which still tells the reader that TSPEC v0.5 carries `OQ.2`/`ERR-4` open and disagrees
with this document in writing. Both were true when written and are not true at HEAD. Neither
changes what DECISIONS decides; both change what a downstream author is told to believe about
upstream, which is the product risk worth naming.

I also considered whether to raise the version pins (`FSPEC v0.7`, `TSPEC v0.5` in the header and
the upstream version note) separately or fold them into Reading C's findings. Separately, at Low:
the pin is a distinct defect from the prose, it is a one-token edit, and folding it in would hide it
behind a Medium that a revising author might address narrowly.

## Decision

**DECISIONS still holds as approved against FSPEC at HEAD.** No decision it takes is contradicted by
FSPEC v0.8–v0.10, and no binding transcription in it has gone wrong. Three statements it makes about
upstream have gone stale and are filed below as non-gating findings.

### What I re-verified against upstream at HEAD, clause by clause

| DECISIONS claim | Upstream at HEAD | Holds? |
|---|---|---|
| DEC-LI-06: "it contradicts FSPEC E-32: selection is per-dispatch over the state that dispatch observed" | FSPEC E-32 unchanged by the delta; BR-9/BR-10 moved *toward* per-dispatch recording | Yes — strengthened |
| DEC-LI-06 constraints: "FSPEC E-32 (per-dispatch observation), REQ NG-4 and `BR-15`" | `BR-15` untouched by the delta; still "no index, cache or state file" | Yes |
| DEC-LI-06 trigger: "FSPEC relaxes E-32 to a run-scoped observation (the per-dispatch call-count oracle of `D-O-6` reds)" | E-32 not relaxed; v0.9 tightened the recording locus in the same direction | Yes |
| `D-O-6`: counts equal the number of injecting dispatches; enumeration failing at dispatch 5 records `RSN-UNLISTABLE` at 5 | FSPEC AT-20/AT-21 now state exactly this per dispatch, and AT-22 adds the changing-corpus reproduction case | Yes — upstream now names the same scenario |
| DEC-LI-07's five-state configuration table, "transcribed from FSPEC `BR-14`" | `BR-14` bytes untouched across `fa229bde..9a4b7593` | Yes |
| DEC-LI-07: "there is no second gate beyond this key (G-1)" attributed to REQ, with FSPEC `BR-14` carrying it | FSPEC v0.8's erratum note restates precisely this ("no second gate beyond that key", REQ v0.9 AC-5.1a) | Yes |
| DEC-LI-05 / DEC-LI-04: block content and position owned by `BR-7`; unconditional fail-open owned by `BR-12` | Neither rule touched by the delta | Yes |
| Non-decision row: "The ordering key, the section subset, and the eligibility rule → FSPEC `BR-4`, `BR-6`, `BR-3`" | Those rules unchanged; BR-3's reason ids unchanged | Yes |
| Non-decision row: AC-3.3's locus is open, routed to REQ via TSPEC `ERR-6`; "TSPEC keeps the run-level record (last-write-wins)"; "which locus the completeness test asserts over is a contract decision" | **Closed upstream.** FSPEC BR-10 fixes two loci and *two* completeness tests; BR-9/BR-10 make the run-level mirror "additive, not the oracle"; TSPEC v0.6 records `ERR-6` **CLOSED** and asserts on the per-dispatch locus only | **No** — F-01 |
| DEC-LI-07: "TSPEC v0.5 still builds the injector on `present && config.enabled && !sectionMalformed` (§I.3) and still carries `OQ.2` and `ERR-4` open… TSPEC and DECISIONS now disagree in writing" | TSPEC v0.6 records `ERR-4` **CLOSED, resolved by REQ v0.9**, gates on `config.enabled` alone, and lists the provisional gate as the rejected alternative | **No** — F-02 |
| Header/upstream note pins: TSPEC v0.5, FSPEC v0.7 | TSPEC v0.6, FSPEC v0.10 | **No** — F-03 |

### Why F-01 and F-02 are Medium and not High

Both sit in prose *about* upstream, not in a decision, and both fail in the direction of telling a
downstream author that a question is open when upstream has settled it — the reader is sent to
FSPEC/TSPEC and finds a clear answer there. Neither would survive contact with the documents an
author actually writes PROPERTIES from.

F-01 is the closer call. Its second clause — "TSPEC keeps the run-level record (last-write-wins)" —
is now an affirmative statement that would, if believed, point a PROPERTIES author at the run-level
mirror, which FSPEC BR-9/BR-10 and TSPEC §D both say **nothing asserts on**. That is a vacuous-green
shape, and it is why I would not leave it unrecorded. It stops short of High because DECISIONS
disclaims the row in its own heading ("Decisions deliberately NOT taken here", "it is not re-raised
here"), and because the two documents PROPERTIES is authored from are unambiguous and mutually
consistent at HEAD: FSPEC BR-10's two loci, TSPEC's "oracle locus is the dispatch row; the run-level
mirror is carried but unasserted", and TSPEC §T.6's `DIVERGENT-CORPUS` fixture asserting nothing
about the mirror. The gap is a misleading pointer, not a competing contract.

F-02 is Medium for the same reason with less risk: it advertises a divergence that no longer exists.
Its concrete ask — DEC-ERR-01 against TSPEC, "close `OQ.2`, retire `ERR-4` as settled upstream, drop
the `present` and `sectionMalformed` conjuncts from §I.3, align `LEARNINGS_DEFAULTS` with REQ §4.1's
bare `true`" — has been landed in full by TSPEC v0.6. The paragraph now understates the health of
the pipeline rather than overstating it.

## Consequences

**For this round.** The confirmation is approving. FSPEC v0.8–v0.10 absorbed nothing that DECISIONS
re-decides, and the one substantive upstream move — BR-9/BR-10 from run-level to per-dispatch —
lands on the same side of the argument DEC-LI-06 and `D-O-6` already made. The three findings are
citation defects, all fixable in a single authoring pass of a few sentences; none of them blocks
PLAN or PROPERTIES from being authored today, because both are authored from FSPEC and TSPEC, which
now agree with each other at HEAD.

**For the next authoring pass of DECISIONS**, the edits I would make are exactly:

1. Replace the AC-3.3 locus row in "Decisions deliberately NOT taken here" with the settled answer:
   the locus is fixed by FSPEC `BR-10` at two loci — ordering key values per authoring dispatch,
   §4.1 thresholds once per run — with one completeness test each, and any run-level mirror additive
   and unasserted. Keep the row (it is still a question DECISIONS does not own), but state it as
   *closed upstream* rather than *routed and open*. (F-01)
2. Rewrite DEC-LI-07's divergence paragraph in the past tense: the `DEC-ERR-01` ask was landed by
   TSPEC v0.6, `ERR-4` is closed, §I.3 gates on `config.enabled` alone. The decision itself is
   unchanged; only the standing-notice framing is retired. `D-O-5` can stay as an IMPL-side
   protection on its own merits. (F-02)
3. Repin the header and the upstream version note: TSPEC v0.6, FSPEC v0.10 (REQ v0.9 is correct as
   written). (F-03)

**For the pipeline.** Two durable signals are worth naming beyond this feature, and both are the
reason F-01 and F-02 exist at all rather than being invisible bookkeeping. First, a document whose
value is *placing* questions — "not decided here, owned there" — carries a maintenance obligation
that a document of decisions does not: when the named owner answers, the pointer becomes a false
statement about the state of the pipeline, and nothing mechanically detects it. Second, DECISIONS is
the one artifact in this pipeline that deliberately narrates the *state* of its siblings ("TSPEC
still carries `ERR-4` open"), which is a genuinely useful thing to do and also the thing that
guarantees staleness the moment the sibling moves. Both are `Process`-flavoured observations for
harvest rather than findings against this author, who wrote each sentence accurately at the time.

**On the confirmation itself.** The item list handed to me was the header erratum; the two findings
that matter came from re-reading upstream at HEAD across the whole span since my recorded
`UPSTREAM-STATE`, which is what DEC-ERR-03 asks for. Confirming on the named item alone would have
returned a clean approval over two stale citations.

## Positive Observations

- **The decision that had most to lose from this delta gained from it.** DEC-LI-06 rejected caching
  because "selection is per-dispatch over the state that dispatch observed", and `D-O-6` demanded a
  positive call-count oracle plus the enumeration-fails-at-dispatch-5 case. FSPEC v0.9 then moved
  BR-9/BR-10's recording to exactly that locus and added AT-20/AT-22's changing-corpus conjuncts.
  The entry was written against the constraint rather than against the wording, which is why the
  wording moving cost it nothing.
- **The document's habit of naming which sibling owns a question is what made this confirmation
  cheap.** Every claim I had to re-check was already labelled with the rule that owns it
  (`BR-14`, `BR-3`/`BR-4`/`BR-6`, `BR-12`, E-32), so verification was a diff against named rules
  rather than a re-read. The same habit is what produced F-01 and F-02 — worth keeping, with the
  pins refreshed each round.

## Recommendation

**Approved with minor changes**

DECISIONS still holds as approved against FSPEC at HEAD. No High finding: no decision is
contradicted by FSPEC v0.8–v0.10, no binding transcription (notably DEC-LI-07's `BR-14` table) has
gone wrong, and the one substantive upstream move — BR-9/BR-10 to a per-dispatch locus — reinforces
DEC-LI-06 and `D-O-6` rather than undermining them. Three citation defects are recorded: F-01 and
F-02 describe upstream questions as open that upstream has closed, F-03 is a version pin. All three
are single-passage edits and belong in the next authoring pass of this document; none blocks
PLAN or PROPERTIES, which are authored from FSPEC and TSPEC and find those two documents consistent
with each other at HEAD.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | "Decisions deliberately NOT taken here" still describes AC-3.3's record locus as open and routed to REQ via TSPEC `ERR-6`, and states "TSPEC keeps the run-level record (last-write-wins)". FSPEC v0.9 `BR-10` settled it: two loci (ordering keys per authoring dispatch, §4.1 thresholds once per run), two completeness tests, and any run-level mirror "additive, not the oracle" with nothing asserting on it; TSPEC v0.6 records `ERR-6` CLOSED and asserts on the per-dispatch locus only. The second clause would point a PROPERTIES author at the unasserted mirror. Restate the row as closed upstream, citing `BR-10`'s two loci. | `## Decisions deliberately NOT taken here`, AC-3.3 locus row |
| F-02 | Medium | inherited | nonlocal | DEC-LI-07's divergence paragraph still asserts "TSPEC v0.5 still builds the injector on `present && config.enabled && !sectionMalformed` (§I.3) and still carries `OQ.2` and `ERR-4` open… TSPEC and DECISIONS now disagree in writing", and raises `DEC-ERR-01` asking for edits TSPEC v0.6 has since landed in full (`ERR-4` CLOSED, gate on `config.enabled` alone, the provisional gate listed as the rejected alternative). Rewrite in the past tense; the decision itself is unaffected. | `## DEC-LI-07`, "The divergence from TSPEC is a recorded erratum" |
| F-03 | Low | delta | nonlocal | Upstream version pins are stale: the header Upstream row and the "Upstream version note" cite TSPEC v0.5 and FSPEC v0.7, and DEC-LI-07 cites "FSPEC v0.7 `BR-14`". At HEAD these are TSPEC v0.6 and FSPEC v0.10 (REQ v0.9 is correct). The cited `BR-14` text is unchanged, so this is a pin defect only, not a content defect. | Header `Upstream` row; `**Upstream version note**`; DEC-LI-07 |

FINDING: Medium | delta | local | Decisions deliberately NOT taken here — AC-3.3 locus row | Describes AC-3.3's record locus as open and routed via TSPEC ERR-6, and says TSPEC keeps the run-level record (last-write-wins); FSPEC v0.9 BR-10 settled it at two loci with two completeness tests and a run-level mirror that is additive and unasserted, and TSPEC v0.6 closed ERR-6
FINDING: Medium | inherited | nonlocal | DEC-LI-07 — "The divergence from TSPEC is a recorded erratum" | Asserts TSPEC still carries OQ.2/ERR-4 open and the present && config.enabled && !sectionMalformed gate, and raises DEC-ERR-01 for edits TSPEC v0.6 has already landed in full
FINDING: Low | delta | nonlocal | Header Upstream row; Upstream version note; DEC-LI-07 | Upstream version pins stale — TSPEC v0.5 and FSPEC v0.7 cited where HEAD is TSPEC v0.6 and FSPEC v0.10; the cited BR-14 text itself is unchanged

## Verdict
