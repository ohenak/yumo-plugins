# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.12)
**Upstream measured against:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` v0.9 (sha256 `ff605dd3…d92e84dd`, confirmed at HEAD)
**Date:** 2026-08-20
**Iteration:** 14 (delta confirmation)

## Overview

Scope of this round: the v0.12 erratum (commits `3f21bd3b` … `c1d7218e`) against
FSPEC v0.11, plus a re-check of every claim this document makes about REQ v0.9 at HEAD
(DEC-ERR-03). The REQ hash in the dispatch matches HEAD, so no upstream text moved under
this document since the v13 fidelity pass; the fidelity re-check below is therefore narrow,
covering only the sentences the erratum newly wrote or newly cited.

**All three routed items landed.**

| Routed item | Landed at | Verdict |
|---|---|---|
| Header `Cross-Reviews` row re-stales every round (Low, delta, local) | `:13` | Resolved — the row now reads `…-FSPEC-v{N}.md — every round present on this branch, not hand-enumerated`, so it cannot go stale again |
| Overview `:70`, D-2 `:265`, A-2 `:995` restate only the authoring conjunct (Low, delta, nonlocal) | `:79`, `:274`, `:1009` | Resolved in substance — all three now defer to BR-1's rule whole; one wording residue at A-2 is filed as F-01 below |
| D-2 asks the one-conjunct question, so the discriminating branch is unnamed and untested (Medium, inherited, nonlocal) | `:274`, `:798-802`, `:971` | Resolved — D-2 now enumerates three branches, AT-02 gains the authoring-classified/non-C-1-target fixture, AT-03 quantifies over that dispatch, and the DC-05 coverage paragraph names all three branches |

Nothing I approved in v11/v13 was broken by the edit. Two Low wording findings and one Low
citation finding are raised below; none is gating.

**Positive observations.**

- The complement is now carried through *consistently* — BR-11 (`:604`), AT-03 (`:800`) and
  AT-29 (`:924`) all quantify over "dispatches outside BR-1's rule" rather than over
  "non-authoring" ones. That is the widest of the three readings and the one REQ AC-1.2
  actually decides; the FSPEC is now stricter than REQ AC-4.3's and AC-6.1's own
  "non-authoring" shorthand, which is the right direction of divergence.
- AT-02's new fixture is stated with its own falsification condition — "so reverting BR-1's
  second conjunct reds this test". That is exactly the property a conjunct-coverage fixture
  needs, and it is asserted, not implied.
- The header row fix removes a per-round maintenance cost rather than paying it once more.

## Linked Requirements

Re-verified against REQ v0.9 at HEAD; only rows the erratum touched are listed.

| FSPEC text (v0.12) | Upstream at HEAD | Verdict |
|---|---|---|
| D-2 `:274` — "authoring-classified **and** a target document among the six C-1 types" | REQ C-1:151-154 — `dispatchKind: "authoring"` **whose target document is** REQ, FSPEC, TSPEC, PLAN, DECISIONS or PROPERTIES | Accurate; both conjuncts, six-member list intact |
| D-2 third branch — "authoring-classified, target none of the six → no block" | REQ AC-1.2:259 — "any dispatch the pipeline tags authoring whose target is none of C-1's six document types — the code-review phase's optimizer at HEAD" | Accurate; the FSPEC branch is AC-1.2's outside-set clause verbatim in substance |
| BR-11 `:604` / AT-29 `:924` — "every dispatch prompt **outside BR-1's rule** … byte-identical" | REQ AC-1.2:256-261 (wide outside-set); REQ AC-4.3:367 and AC-6.1:412 use the narrower "non-authoring" shorthand | Faithful to AC-1.2, which is the deciding criterion; the shorthand elsewhere in REQ is a REQ-side inconsistency the FSPEC correctly does not inherit (see Q-01) |
| Overview `:79` — "to exactly the dispatches BR-1's rule names, and to no others" | REQ C-1:151, AC-1.1:250-255 | Accurate |
| A-2 `:1009` — "the authoring classification and the dispatch's target document type … consumed rather than restated" | REQ C-1:156-157 — "a rule over the taxonomy that already exists rather than a hand-counted set of six" | Accurate as to the two inputs; the exclusion clause that follows is imprecise (F-01) |
| BR-15 `:690-692` — "compared as **sets of paths**, not as counts … (REQ AC-5.2)" | REQ AC-5.2:397-401 — "the corpus paths touched are exactly the reads of the documents AC-3.1 and AC-3.2 name" | Compatible, not stated; AC-5.2 is silent on repeat opens, so the duplicate-open tolerance is an FSPEC-local instrument decision carrying an upstream citation (F-03) |
| Header `Upstream` row `:12` — REQ v0.9 | REQ:18 version cell reads `0.9` | Accurate; the dispatch sha matches HEAD |


## Behavioral Flow

**D-2 (`:274`).** The row now reads as a three-branch decision: both conjuncts hold → block;
not authoring-classified → no block; authoring-classified with a target outside the six →
no block. Because `:286` makes this table the DC-05 branch catalogue, naming the third
branch is what gives it a required AT, and `:971` now spends that obligation explicitly
("D-2 — all three branches, the authoring-classified non-C-1 target included — by
AT-02/03"). The te-review item is fully discharged: the branch has a name, a rule (BR-1),
and two ATs.

**Step 0, item 5 (`:204`).** Untouched by this erratum and still phrased "If the dispatch is
**not** one C-1 names as authoring, the flow stops here with no record (BR-1)". It defers to
C-1, which *is* the two-conjunct rule, so the behaviour is right; but "names as authoring"
reads standalone as the single classification conjunct — the same residue the routed item
removed at `:79`, `:274` and `:1009`, left in the one place the erratum did not sweep. Wording
only, no behavioural divergence (F-02).

The "runs **once per authoring dispatch**" cadence sentences at `:185` and `:82` are not the
same defect: they describe when the flow is entered, and Step 0 item 5 is the gate that then
stops it. No finding.

## Business Rules

**BR-1 (`:291-313`).** Unchanged by this erratum and still the two-conjunct statement approved
at v13, with AC-1.2's own "(the code-review phase's optimizer round at HEAD)" parenthetical
preserved at `:298`. The erratum's other edits are all downstream consumers of it, and each now
quotes it rather than paraphrasing one conjunct.

**BR-11 (`:601-606`).** The rewrite is the substantive one: the byte-identity claim now
quantifies over "every dispatch prompt **outside BR-1's rule** — whether it fails the
authoring conjunct or the C-1 target-document conjunct". Both failure modes are named, so
the claim is no longer readable as covering only the classification conjunct. This is the
complement BR-1 needs to make its set equality total over the dispatch universe.

**BR-15 (`:680-695`).** Two changes. The observed set drops "file-open calls" for "the paths
under `docs/` the run opens" and the expected set drops "**exactly** one open attempt for
every corpus document" for "the corpus documents the report names" — both moves from a
count instrument to a path-set instrument, which is what makes the equality transcribable.
`RSN-SELF` exclusion and the "corpus enumeration contributes **no** member" clause survive
intact, so nothing v13 approved is disturbed. The added sentence attributing duplicate-open
tolerance to REQ AC-5.2 overstates the citation (F-03): AC-5.2 constrains which *paths* are
touched and is silent on how many times each is opened, so the tolerance is this document's
decision to make — it is a sound one, it just is not upstream's.

## Edge Cases and Error Scenarios

The E-01 … E-35 table is untouched by this erratum, and the coverage paragraph at `:967-973`
still asserts that every row names an AT. The discriminating branch D-2 gained needs no new
E-row: it is a decision branch, not a corpus or configuration edge state, and DC-05's
obligation is discharged through the D-table → AT mapping, which `:971` now states for all
three branches. I checked that the erratum did not silently orphan an E-row by re-quantifying
AT-03: E-29/E-30 (`:764-765`) name AT-01/AT-02, both of which still exist and both of which
gained fixtures rather than losing them. No finding.

Fail-open states re-checked against REQ at HEAD, since AT-24 asserts byte-identity for a
state BR-12 (`:619`) calls "empty block": REQ AC-4.1:354-357 requires that on an empty corpus
"every authoring dispatch is composed exactly as it is today", so "empty block" means no
block region in the prompt, and AT-24's byte-identity claim is upstream-faithful. This was
approved before and remains so.

## Acceptance Tests

**AT-02 (`:790-799`).** The universe under inspection was already "the whole dispatch
universe, not only those already classified authoring"; the erratum adds the missing fixture —
"a run containing an authoring-classified dispatch whose target is none of the six C-1
document types — so reverting BR-1's second conjunct reds this test". With that fixture the
set-equality oracle can distinguish the one-conjunct rule from the two-conjunct rule, which
it could not before. This is the mutation-sensitivity the Medium item was asking for.

**AT-03 (`:800-802`).** Now compares "the prompt of each dispatch **outside BR-1's rule** —
including the authoring-classified dispatch with no C-1 target". Matches BR-11's quantifier
word for word in substance; the two no longer disagree about which set is being held
byte-identical.

**AT-29 (`:918-924`).** The trailing conjunct moved from "every non-authoring dispatch prompt"
to "every dispatch prompt outside BR-1's rule". Consistent with BR-11 and AT-03; the
five-way set equality it precedes is unchanged.

**AT-33 (`:948-955`).** Reads on BR-15's expected set, which is now a path set. The AT text
already said "that observed set **equals** BR-15's expected set", so the AT needed no edit and
correctly did not receive one — the instrument changed underneath it, not the assertion.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | REQ AC-4.3 (`:367`) and AC-6.1 (`:412`) still say "non-authoring dispatch prompts" / "non-authoring byte-identity", while AC-1.2 (`:256-261`) decides the wider outside set this FSPEC now uses. The FSPEC is faithful to the deciding criterion, so nothing is blocked here — but the REQ's own shorthand will re-seed the one-conjunct reading in any document authored from AC-4.3 rather than AC-1.2. Worth a REQ-side erratum in a later round, or a harvest note; not this document's defect. |
| Q-02 | BR-15's duplicate-open tolerance (F-03) is a deliberate instrument choice. Does the TSPEC's filesystem observation harness in fact deduplicate by path, or does it record an ordered read log? If the latter, the TSPEC is the place the set projection has to be pinned, and BR-15's sentence is the requirement it will be pinned against. |

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | A-2's exclusion clause says a future dispatch "that satisfies **neither** conjunct … yet is authoring in spirit" is excluded by construction. BR-1 excludes a dispatch that fails **either** conjunct, not only one that fails both — the very case the erratum was written for (authoring-classified, target outside the six) satisfies one conjunct and is still excluded, so A-2 read standalone describes a narrower default than BR-1 implements. Wording only; BR-1 is normative and correct. Fix: "satisfies neither" → "does not satisfy both". | `### Assumptions` → A-2 (`:1009`) |
| F-02 | Low | inherited | nonlocal | `## Behavioral Flow` Step 0 item 5 still reads "If the dispatch is **not** one C-1 names as authoring" — the single-classification-conjunct phrasing the erratum removed from the Overview, D-2 and A-2, surviving in the one prose site the sweep did not reach. It defers to C-1, which is two-conjunct, so no behavioural divergence; but this is now the only place in the document where a reader can pick up the superseded reading. Fix: "not one C-1's rule names" or restate both conjuncts as D-2 does. | `## Behavioral Flow` → Step 0, item 5 (`:204`) |
| F-03 | Low | delta | local | BR-15's new sentence — "compared as **sets of paths**, not as counts, so a document opened more than once neither adds a member nor changes the verdict (REQ AC-5.2)" — cites AC-5.2 for a tolerance AC-5.2 does not state. AC-5.2 constrains which corpus *paths* are touched and is silent on repeat opens; the set projection is a sound FSPEC-local instrument decision, but the parenthetical presents it as upstream's. Fix: drop the citation, or split it — cite AC-5.2 for the path-set equality and state the duplicate-open tolerance as this document's decision. | `### BR-15 — Filesystem footprint` (`:690-692`) |

FINDING: Low | delta | local | `### Assumptions` → A-2 (`:1009`) | A-2 says a future dispatch satisfying "neither" conjunct is excluded by construction; BR-1 excludes a dispatch failing either conjunct, so A-2 standalone states a narrower default than BR-1 implements — wording only, BR-1 normative and correct
FINDING: Low | inherited | nonlocal | `## Behavioral Flow` → Step 0, item 5 (`:204`) | Step 0 item 5 still says "not one C-1 names as authoring", the single-conjunct phrasing removed elsewhere this round; defers to C-1 so behaviour is right, but it is now the only site reproducing the superseded reading
FINDING: Low | delta | local | `### BR-15 — Filesystem footprint` (`:690-692`) | The duplicate-open tolerance ("a document opened more than once neither adds a member nor changes the verdict") is cited to REQ AC-5.2, which constrains paths touched and is silent on repeat opens; the tolerance is a sound FSPEC-local instrument decision, not an upstream claim

## Recommendation

**Approved with minor changes.** All three routed items landed, the delta breaks nothing
previously approved, and the document remains a faithful compression of REQ v0.9 at HEAD.
The three Low findings are wording and citation precision — none changes behaviour, none
gates. F-01 and F-02 are worth folding into any later touch of this document; F-03 is worth
resolving before the TSPEC's filesystem harness is designed against BR-15 (Q-02).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
