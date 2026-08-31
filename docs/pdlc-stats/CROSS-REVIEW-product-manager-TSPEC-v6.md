# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 6 (erratum round 4 continuation — delta confirmation)
**Scope of this round:** the erratum delta only, plus a re-grounding of every claim this
document makes about upstream **as upstream reads at HEAD** (DEC-ERR-03). Not a re-review.

## What was checked

The dispatch reports the routed item as **absorbed upstream at HEAD**, with nothing left to
confirm from the item list. Per DEC-ERR-03 that makes the item list necessary but not
sufficient, so this round is scoped to two questions:

1. Does the delta that did land resolve cleanly without breaking anything previously approved?
2. Is the TSPEC still a faithful compression of REQ and FSPEC **as they read now**?

The second question is the live one this round. Between my v5 reviewed commit (`e952268bd`) and
HEAD, **FSPEC moved v1.4 → v1.5** (`0b8864d6…` → `25af3c47…`, 109 lines). My v5 prose stated the
upstream was unchanged; the anchors the workflow stamped on that file already carried the v1.5
hash. So a real upstream move sits between my last substantive reading and this one, and I
re-derived it rather than trusting either statement.

REQ is unchanged at `60a516fb…`, matching the dispatch and my v5 anchor.

## Upstream re-grounding (DEC-ERR-03)

I read FSPEC v1.5 in full at HEAD and diffed it against the v1.4 bytes I last reviewed. Every
hunk is rationale and framing; no rule cell, exit code, edge-case outcome or acceptance test
changed. TSPEC v1.4's changelog claims about that move are accurate, and I verified each rather
than reading it:

| TSPEC v1.4 claim about FSPEC v1.5 | Verified |
|---|---|
| §7.3 is now a settled record of five closed errata, E-1…E-5 | Yes — the table is headed "all closed" and each row names FSPEC sites that **stand unchanged** |
| Stale "live disagreement" framing corrected at §1, BR-06, BR-12, BR-27, EC-09, §7.1 D-8/D-9 | Yes — those are exactly the hunks in the diff, and they are the only prose hunks outside §7.3 |
| No behavioural change to any rule, exit code or acceptance test | Yes — I checked the decision columns of D-8/D-9 and the outcome cells of EC-09/EC-10/EC-11 byte-for-byte; unchanged |
| Nothing in TSPEC §3–§6 needs re-deriving | Yes, and for the stated reason: this document never narrated those six sites as live divergences |
| §4.3 already states BR-11/BR-16 as specified behaviour | Yes (absorbed at v1.2). BR-11, BR-16, AT-12 and AT-17 are untouched by v1.5 — the only diff lines naming them are inside §7.3 itself, so §4.3's citations "at v1.4" remain true statements at v1.5 |
| §5's `no_docs_root` row already carries D-9/BR-30 | Yes — TSPEC §5's row matches FSPEC EC-09's current text (one message, naming the root and which condition; BR-30's object on stdout under `--json`) |
| E-2's C-5 carve-out for post-mortem *discovery* leaves §4.3's halt matcher untouched | Yes. FSPEC now says C-5 "carves the discovery of *which* phases have a post-mortem out of fidelity"; the basename form and the fail-closed `RESOLVED:` reading are unchanged, and TSPEC reaches post-mortems by that same documented basename form. §4.3's matcher and its `open`-on-throw behaviour still trace |
| §8.3's one remaining open erratum (FSPEC BR-26/EC-10) is not among E-1…E-5 and stands | Yes. FSPEC EC-10 at HEAD still reads "in neither the exclusion set nor recognizable as a feature" — no positive recognition predicate. The two Low items FSPEC §7.3 records as routing nowhere are REQ-STATS-02's enumeration and REQ-STATS-08's separator; neither is this one |
| E-5's now-settled zero-state row is what §8.3's EC-03/AT-26 argument rests on | Yes, and TSPEC cites the right anchors: FSPEC EC-03 makes a readable-but-empty directory a normal measured row and AT-26 is the test that pins it (EC-03 ↔ AT-26 in FSPEC's own matrix) |

**Verdict on re-grounding:** the document is still a faithful compression of REQ v1.4 and
FSPEC v1.5. No acceptance criterion is narrowed, broadened, reinterpreted or dropped, and
nothing the TSPEC cites has stopped saying what the TSPEC says it says.

## The delta

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
