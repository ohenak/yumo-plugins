# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 4 (upstream-cascade confirmation — PROPERTIES bytes unchanged)

## Overview

**Question this round answers, and only this one:** does PROPERTIES still hold against REQ as it now
stands? PROPERTIES' own bytes did not change — `shasum -a 256` over
`docs/pdlc-stats/PROPERTIES-pdlc-stats.md` at HEAD is
`7baf9b336f04c0e1848ff370878646f7c08f0ccccabf13eb8aaba312bbbecab6`, byte-identical to the
`APPROVAL-HASH:` recorded in my v3 approval. The upstream that moved is REQ.

**The upstream delta is exactly one commit.** Walking the blob hashes of `REQ-pdlc-stats.md` back
through its history: my v3 `UPSTREAM-STATE: REQ` pinned `5f3e80519b982f29…` (commit `1847dd9c0`,
v1.6); HEAD is `f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`, matching this
dispatch's stated sha, and the only commit between them is `e12b78fd8` — "REQ v1.7 erratum — decide
REQ-STATS-06 out-of-catalogue basename as harvested". The other upstreams are unmoved: FSPEC at HEAD
is `c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d`, identical to my v3
`UPSTREAM-STATE: FSPEC` pin and to this dispatch's sha.

**What the edit did.** It withdrew one clause from REQ-STATS-06. v1.6 read "The predicate is
set-membership over C-4's grammars, so a grammatical basename outside the driver's document-type
catalogue is a **survivor** even where REQ-STATS-03 reports it malformed." v1.7 replaces it with:
the predicate "is evaluated over exactly the file set whose bytes the process side sums," so an
unrecognised basename "contributes no process bytes and counts as no file of its family remaining: a
feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**." Plus the
version bump 1.6 → 1.7 and its changelog paragraph. Nothing else in REQ changed.

**This is the resolution of my own v3 F-02.** I raised that clause as an upstream defect and
explicitly declined to fold it into the PROPERTIES verdict, because REQ-STATS-06 v1.6 contradicted
FSPEC BR-16 v1.7 and inverted PROP-RATIO-08's fourth leg while PROP-RATIO-08 cited REQ-STATS-06 as
its authority. The erratum decided the dispute in the direction PROPERTIES, FSPEC and TSPEC §4.3 had
all independently taken. So the cascade question has an unusually clean answer: the upstream moved
**toward** this document, not away from it. I re-derived that below rather than assuming it — an
edit landing on your side can still land in different words, and the words are what PROPERTIES
compresses.

## Properties

I re-read REQ-STATS-06 at HEAD in full, then re-read every property whose Traces column cites it,
asking of each whether PROPERTIES is still a faithful compression of the sentence it leans on.

| PROPERTIES pin | What REQ v1.7 now says | Still faithful? |
|---|---|---|
| **PROP-RATIO-08** — `state: "harvested"` when `LEARNINGS-{feature}.md` is present **and at least one** of the two families is entirely absent, "over exactly the file set the numerator sums"; leg 4 = `CODE_REVIEW` intact alongside only out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames | "evaluated over exactly the file set whose bytes the process side sums"; unrecognised basename "counts as no file of its family remaining"; such a feature "reports **harvested**" | **Yes — and now positively supported.** The property's own qualifier and REQ's new qualifier are the same sentence. Leg 4's expected value is the value REQ now states. |
| **PROP-RATIO-06** — a grammatically-failing `CROSS-REVIEW-` basename contributes to **neither** side: listed as malformed, "sized as nothing" | unrecognised basename "contributes no process bytes", and is "the same one REQ-STATS-03 reports malformed (C-5)" | **Yes — strengthened.** v1.6 was the version in tension with this (a "survivor" that is nonetheless malformed); v1.7 states both halves the property asserts. |
| **PROP-RATIO-07** — spec total zero ⇒ `state: "unavailable"`, `ratio: null`, both byte totals still reported, exit 0 | unchanged: "when spec bytes total zero, it reports the ratio as not-available rather than dividing by zero or crashing" | **Yes.** Untouched by the edit. |
| **PROP-RATIO-09** — harvested test evaluated **before** the zero-denominator test | REQ still states no precedence; the ordering is BR-16/EC-13 material, and the property traces it there | **Yes.** The edit adds no precedence claim, so nothing new to reconcile. |
| **PROP-RATIO-01, -02, -03** — the two byte-total sets and the removal probe | C-3/C-4 set definitions unchanged by the edit | **Yes.** |
| **PROP-NEG-04**, §Traceability row `REQ-STATS-06 → PROP-RATIO-01…10, PROP-NEG-04` | REQ-STATS-06 keeps its identity, scope and P0 priority | **Yes.** |

**The citation that was false is now true.** My v3 F-02's concrete complaint was that PROP-RATIO-08's
Traces column reads `REQ-STATS-06, BR-16, AT-17` while REQ-STATS-06 at that HEAD contradicted leg 4 —
citing as authority a document that said the opposite. At this HEAD REQ-STATS-06 supports leg 4
verbatim, so the Traces column is accurate as written. **No edit to PROPERTIES is required to
resolve F-02**; the upstream edit resolved it. That is the right outcome — the defect was upstream,
and I said so at the time rather than patching the symptom here.

**The §Gaps row I proposed is now correctly absent.** v3 suggested a `G-8` recording the
REQ-versus-FSPEC dispute as provisional, on the G-1 pattern. G-1's pattern is for a rule that is
*still* unsettled; this one is settled. Adding G-8 now would record a live dispute that no longer
exists, and would have to be withdrawn again. PROPERTIES' §Gaps table (G-1…G-7) is correct
unchanged.

**Nothing in PROPERTIES leaned on the withdrawn clause.** I checked this directly rather than by
inspection of the diff alone: `grep -n "set-membership\|survivor\|v1\.6"` over
`PROPERTIES-pdlc-stats.md` returns nothing. The document never transcribed v1.6's set-membership
framing, and pins no REQ version number, so the withdrawal removes no support from any property.
The one place C-4 membership is cited — the §Traceability row `C-4 process-artifact set →
PROP-RATIO-01, PROP-RATIO-02, PROP-RATIO-06` — is about the numerator's composition, which C-4 still
defines and which the edit did not touch; it is not the harvested predicate's basis.

## Oracles

Checks actually executed this round, so a later reader can re-run them rather than trust this file.

| Check | Command | Result |
|---|---|---|
| PROPERTIES bytes unchanged since approval | `shasum -a 256 docs/pdlc-stats/PROPERTIES-pdlc-stats.md` | `7baf9b33…` = v3 `APPROVAL-HASH:` ✅ |
| REQ delta is exactly the erratum | blob hash per commit over `git log -- REQ-pdlc-stats.md` | `5f3e8051…` (v1.6, `1847dd9c0`) → `f75c348f…` (v1.7, `e12b78fd8`), one commit ✅ |
| REQ HEAD matches the dispatch sha | `shasum -a 256 docs/pdlc-stats/REQ-pdlc-stats.md` | `f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862` ✅ |
| FSPEC did not move | `shasum -a 256 docs/pdlc-stats/FSPEC-pdlc-stats.md` | `c7d2c832…` = v3 `UPSTREAM-STATE: FSPEC` and dispatch sha ✅ |
| REQ v1.7 and FSPEC BR-16 now agree on the same file | read both at HEAD | BR-16: "evaluated over exactly the file set BR-14's numerator sums… a basename failing a grammar contributes no bytes to the process side and counts as no file remaining… reports `harvested`". REQ-STATS-06 v1.7 states the same rule in the same terms ✅ |
| No PROPERTIES text depends on the withdrawn clause | `grep -n "set-membership\|survivor\|v1\.6"` over PROPERTIES | no matches ✅ |

**On the three-document agreement.** The reason this confirmation is short is that the erratum
collapsed a three-against-one into a four-way agreement on one file, `CROSS-REVIEW-{role}-REVIEW-v{N}.md`:
REQ-STATS-06 v1.7, FSPEC BR-16, TSPEC §4.3 and PROP-RATIO-08 leg 4 now all say the same thing about
it — no process bytes, no file remaining, `harvested` rather than a silently-undercounting measured
ratio. PROP-RATIO-06 supplies the other half (the same basename is simultaneously reported malformed),
which REQ v1.7 now names explicitly via C-5. There is no longer a document in this feature that
reads that file differently, which is the condition F-02 said had to hold before the phase could
converge believing leg 4 settled.

**What I did not re-do.** I did not re-derive the archive measurements (62 `CROSS-REVIEW-*`, 4
`-REVIEW-v{1,2}.md`, 58) or the PLAN trace resolution; both were re-derived at HEAD in v3, and the
only upstream movement since is a REQ paragraph that touches neither. G-6's staleness caveat on
those literals stands as written.

## Fixtures

One fixture carries the whole of this round's exposure, so I re-read it against REQ v1.7 directly.

**`F-HARVEST-FOUR`** (§Fixtures): "four directories, each with `LEARNINGS-{f}.md`: cross-reviews
intact / no `CODE_REVIEW`; `CODE_REVIEW` intact / no cross-review; neither, and no spec documents;
`CODE_REVIEW` **intact** plus only out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames",
serving PROP-RATIO-08 and PROP-RATIO-09.

Each leg against REQ-STATS-06 v1.7:

- **Legs 1–3** exercise the disjunction REQ states unchanged ("either… or… or neither"), each with
  `LEARNINGS-{feature}.md` present as REQ's gate requires. Untouched by the erratum.
- **Leg 4** is the leg the erratum decided. Under v1.6 this fixture asserted `harvested` while REQ
  called the same basename a survivor — the fixture would have been asserting against its own cited
  authority. Under v1.7 the fixture's expected value is what REQ states: the only `CROSS-REVIEW-`
  basenames present are unrecognised, so they contribute no process bytes and count as no file of
  that family remaining, and the directory reports `harvested`. **The fixture body needs no edit.**
- **Leg 3 doubles as PROP-RATIO-09's discriminator** (harvested *and* zero spec bytes), which the
  erratum does not touch, since REQ still states no precedence between the harvested and
  zero-denominator tests.

The `LEARNINGS-{f}.md` present in all four directories is load-bearing and remains correct: REQ v1.7
keeps the harvested state gated on that file's presence, and the new sentence adds a condition on
the *family-absence* half only, not on the gate.

**No other fixture is reached.** The erratum's sentence is scoped to the ratio's harvested predicate.
The real-path fixtures (PROP-RR-05's archive table), the halt fixtures, and the spec-side removal
probe (PROP-RATIO-02's nine-file fixture) take no input from it. PROP-RATIO-06's out-of-catalogue
fixture shares the basename shape but asserts the *byte* consequence, which REQ v1.7 now states
explicitly rather than in tension.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | PROP-RATIO-03's transcription of AT-15's neither-list, and the §Traceability AT-15 / BR-16 rows, are stale against FSPEC v1.7 — carried unresolved from my v3 F-01, untouched by this round's REQ edit. PROP-RATIO-03 lists `LEARNINGS-*.md`, `MUTATION-EVIDENCE-*.md`, `SIZING-*.md`, `HANDOFF-PROMPT.md`, but not the `CROSS-REVIEW-{role}-REVIEW-v{N}.md` member FSPEC added to AT-15's list; §Traceability's AT-15 row stops at PROP-RATIO-01…04 without naming PROP-RATIO-06, which does cover the new member; BR-16's row predates FSPEC routing BR-16 to AT-15. Bookkeeping only — no behaviour is unasserted, since PROP-RATIO-06 pins the added member at the same level and in the same task. | §Properties → PROP-RATIO-03, PROP-RATIO-06; §Traceability → AT-15, BR-16 |

FINDING: Medium | inherited | nonlocal | §Properties → PROP-RATIO-03; §Traceability → AT-15 / BR-16 rows | AT-15 neither-list transcription and the AT-15/BR-16 trace rows are stale against FSPEC v1.7; carried from v3 F-01, untouched by this round's edit, non-gating bookkeeping.

**Provenance `inherited`, not `delta`:** F-01 sits in pre-round PROPERTIES bytes and was raised in v3;
this round's edit is confined to REQ-STATS-06 and neither introduced it nor left it unlanded.
**Locality `nonlocal`:** it sits nowhere near the edited section — the edit touched REQ's harvested
predicate, F-01 touches AT-15's neither-list bookkeeping. Tagging it `inherited` is deliberate and
material: it routes the item back to the owning revision loop rather than treating it as this
erratum's residue.

**v3's F-02 is resolved and is not re-raised.** It was an upstream defect — REQ-STATS-06 v1.6
contradicting FSPEC BR-16 on `CROSS-REVIEW-{role}-REVIEW-v{N}.md` while PROP-RATIO-08 leg 4 cited
REQ-STATS-06 as authority — and commit `e12b78fd8` withdrew the contradicting clause. The citation is
now accurate, and the §Gaps row I proposed for it is correctly absent (see §Properties). Nothing in
PROPERTIES needs to change to close it.

## Recommendation

**Approved with minor changes**

PROPERTIES still holds against REQ as it now stands. The erratum moved REQ **toward** this document:
REQ-STATS-06 v1.7 states the harvested predicate in the same terms PROP-RATIO-08 already used ("over
exactly the file set the numerator sums"), and reaches the same verdict on the same file that leg 4
asserts. Every property tracing REQ-STATS-06 was re-read against the current sentence, not against my
v3 record; none became false, and two (PROP-RATIO-08 leg 4, PROP-RATIO-06) went from being asserted
against a dissenting upstream to being positively supported by it.

No High finding, none inherited and none new. One inherited Medium (F-01) remains, unchanged in
substance from v3: three line edits to AT-15/BR-16 bookkeeping that assert no new behaviour. It did
not gate v3 and does not gate here.

I opened no new question and re-litigated no settled section. The confirmation is narrow by design:
the upstream delta was one clause, and its whole reach into this document was the leg my own prior
round had already flagged as contested.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
