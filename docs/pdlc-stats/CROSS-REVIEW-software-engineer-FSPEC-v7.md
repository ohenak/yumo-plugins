# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.4)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.4 (sha256:60a516fb…, re-verified at HEAD)
**Date:** 2026-08-31
**Iteration:** 7 (targeted erratum delta confirmation)

## Overview

This is a targeted erratum delta confirmation carrying **one** routed item. The headline result is
unusual and needs stating plainly up front:

**No edit landed on this FSPEC, and none should have. The routed item is not an FSPEC item.**

The item reads: *"§2.1's co-change table lists only five in-repo sites; the two sibling-feature
document edits (`docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26` and FSPEC §5.2's
per-class count 5 → 6) are missing, so the implementation-visible site list does not match
DEC-STATS-01's K-7."* Every noun in it is real, and every one of them lives somewhere other than
this document:

- **This FSPEC has no co-change table.** `§2.1` is *Acceptance criteria coverage* — a REQ-criterion →
  flow → rules → tests traceability matrix. `grep -in "co-change\|in-repo site\|sites"` over
  `FSPEC-pdlc-stats.md` returns **zero** hits. There is no five-row site list here to extend.
- **The table the item describes lives in `DECISIONS-pdlc-stats.md`**, under *Options Considered* →
  DEC-STATS-01 (`:129`). It is already at **nine** sweep-derived sites, not five, as of the round-3
  and round-4 DECISIONS edits (`e630dd867`, `17ddc28a0`, `a709b1be9`).
- **K-7 already owns exactly the two sibling-feature document edits the item asks for**
  (`DECISIONS-pdlc-stats.md:464`): TSPEC §5.4 gains `PK-26`, its vendored-members note moves five →
  six, and the sibling FSPEC §5.2's per-class count moves five → six, in the same change as
  `_tspec-packed-set.mjs`.

The likely cause of the mis-route is visible in the item's own text: it names **"FSPEC §5.2"**, and
that is `docs/completed/pdlc-engine-distribution/FSPEC-…md` — a *different feature's* completed
FSPEC, at `:583` and `:19`, currently reading "five vendored workflow members". The bare token
`FSPEC` appears to have been resolved to the feature under review rather than to the sibling
document K-7 names.

So the substance of the item is **already discharged**, one document over. Nothing is missing from
the pipeline; one routed slip is addressed to the wrong file. Asking this FSPEC to carry a vendoring
site table would in fact be an **altitude violation** — enumeration co-change sets are TSPEC and
DECISIONS material, not behavioural specification.

Per DEC-ERR-03 I did not stop at the item list. I re-verified the upstream REQ at its current
version and re-walked every FSPEC claim that leans on it. `REQ-pdlc-stats.md` hashes
`sha256:60a516fb…` at HEAD — **byte-identical** to the `UPSTREAM-STATE` anchor on my v6 approval, so
no upstream text has moved beneath this document. `git diff 7ca956d0e HEAD -- FSPEC-pdlc-stats.md`
is likewise **empty**: the document is byte-identical to the bytes I approved at v6, and
`REVIEWED-COMMIT: 6e7985d14` is still its tip.

That byte-identity has one consequence I must record rather than silently drop: the four findings I
left open at v6 are all still open, untouched. They are carried forward below tagged `inherited` so
they route back to the ordinary revision loop rather than vanishing because this round happened to
edit nothing. None is High. Nothing here gates the phase.

## Linked Requirements

The DEC-ERR-03 obligation is to re-read the upstream *as it stands now*, not as the item list
describes it. Method and result:

| Check | Command / anchor | Result |
|---|---|---|
| Upstream REQ identity | `sha256sum docs/pdlc-stats/REQ-pdlc-stats.md` | `60a516fb2ede…f1c9` |
| v6 `UPSTREAM-STATE` anchor | `CROSS-REVIEW-…-FSPEC-v6.md` trailer | `60a516fb2ede…f1c9` — **match** |
| REQ moved since v6? | `git diff 7ca956d0e HEAD -- REQ-pdlc-stats.md` | empty |
| FSPEC moved this round? | `git diff 7ca956d0e HEAD -- FSPEC-pdlc-stats.md` | empty |
| FSPEC tip | `git log -1 -- FSPEC-pdlc-stats.md` | `6e7985d14` = v6's `REVIEWED-COMMIT` |

Both sides of the pin are frozen. There is no upstream drift for this confirmation to catch, and no
delta edit to audit — a materially different situation from v6, where I had a nine-item, three-defect
edit to verify.

§2.1's coverage matrix — the section the routed item names — was therefore re-read on its own terms,
as traceability. All nine REQ criteria (`REQ-STATS-01` … `REQ-STATS-09`) carry a non-empty surface,
rules and acceptance-test cell; no row is empty, which is the property §2.1 declares about itself
("no row is empty; a criterion with no surface would mean the FSPEC under-specifies the command").
`REQ-STATS-09`'s row still carries its `D-9` marker. §2.2's constraint coverage still discharges
`C-1`…`C-5`, and §2.3 still maps `G-1`…`G-4`. Nothing in §2 needs the site list the item asks for,
and nothing in §2 is stale against REQ v1.4.

## Behavioral Flow

Re-read §3.1–§3.4 against REQ v1.4. Flow A (`pdlc stats {feature}`), Flow B (fleet mode), Flow C
(`--json`) and §3.4's read-only flows are unchanged and remain faithful to the criteria they
discharge. The v6 confirmation walked these in detail after a substantive edit; with the bytes
frozen and the upstream frozen, that verification stands unchanged and I do not re-litigate it.

One point worth re-affirming because the routed item brushes against it: nothing in §3 describes how
`lib/stats.mjs` is packaged, vendored or enumerated. That is correct. The flows describe what an
operator observes; the module's placement and its co-change set are DEC-STATS-01's subject and the
PLAN's obligation. The absence the item reports is not an absence in this layer.

## Business Rules

§4.1–§4.5 re-read against REQ v1.4. The three defects closed in the v6 round remain correctly
closed:

- **BR-11** still states the harvested predicate over `CODE_REVIEW-{feature}-v{N}.md`'s *version
  grammar*, matching REQ-STATS-04 at HEAD, and still decides the non-matching leftovers explicitly.
- **BR-16** still states its predicate over the documented basename grammar, agreeing with BR-14's
  numerator and REQ-STATS-06.
- **BR-25** still names both the directory and the loose-file illustration.

Two inherited defects still sit in this section and are carried forward as findings below: **BR-27**
(§4.5) attributes a quoted string to `REQ-STATS-07` when it lives at `G-3`, a goal, and frames its
narrowing as a live erratum that REQ-STATS-07 at HEAD no longer disputes; and **BR-06** (§4.2)
still calls the `-REVIEW-` malformed disposition "a wording defect of the upstream criterion" after
REQ-STATS-03 decided that case in `D-8`'s direction.

## Edge Cases and Error Scenarios

§5 re-read against REQ v1.4. `EC-01`…`EC-09` are unchanged. `EC-09`'s inherited problem persists: it
and `D-9` assert a deliberate departure from `REQ-STATS-09`'s *Given*, but REQ v1.4 added the
no-`docs/`-root carve-out that removes the departure. The behaviour EC-09 specifies is correct and
agrees with the REQ; it is the framing — "we diverge here" — that is now false. Carried forward
below.

No new edge case is opened by this round, because this round edited nothing. The routed item raises
no error-path question: a missing row in an enumeration co-change table is a build-time and
release-gate concern, covered by K-1's `loop-distribution.test.js` red and TSPEC §6.4's vendoring
oracle, not by any runtime error scenario this FSPEC owns.

## Acceptance Tests

§6.1–§6.11 re-read. `AT-01`…`AT-28` are unchanged and still discharge the §2.1 matrix; §6.11's
test-to-rule table still closes the loop from every `BR-*` back to an `AT-*`. The v6 round's
sharpened fixtures — `AT-12` and `AT-17`'s legs over the documented basename grammars, tightened at
`8136d2150` — remain as approved.

On the routed item's testing surface, for the record rather than as a finding: the obligation it
describes **is** oracle-covered where it actually lives. `DECISIONS-pdlc-stats.md:464` names
`loop-distribution.test.js`'s `P7-02`, which reads both sibling documents off disk and matches their
member-count sentences against the class size derived from `tspecPackedCount` at test time — so a
helper amended without the sibling documents goes red. K-7 also records the one gap honestly:
`P7-02` does not cover `PK-26`'s *existence as a row*, which is logged as a residual. That is the
right place for both the obligation and its residual. This FSPEC neither needs nor should acquire an
acceptance test for it.

## Open Questions

§7.1's decisions (`D-1`…`D-9`) and §7.4's assumptions (`A-1`…`A-3`) are unchanged and remain
consistent with REQ v1.4.

§7.2 (open for TSPEC) is unchanged. Note that the routed item's subject matter is squarely §7.2/TSPEC
territory, and the TSPEC has already taken it up — a further confirmation that the FSPEC is not the
document with the gap.

§7.3, *"Upstream errata raised, not folded in"*, remains this document's weakest section and is the
subject of the largest carried-forward finding. It correctly closed and removed the three
harvested-predicate errata in the v6 round. The **five** it still lists as open against the REQ are,
on my re-read of REQ v1.4 at HEAD, **all settled upstream**:

| §7.3 bullet | Claimed open against | Status at REQ v1.4 |
|---|---|---|
| REQ-STATS-05 post-mortem classification vs `C-5` | C-5 enumeration | carve-out landed |
| REQ-STATS-03 malformed swallows `-REVIEW-` files | REQ-STATS-03 wording | decided, `D-8`'s direction |
| REQ-STATS-09 *Given* sweeps no-`docs/`-root | REQ-STATS-09 wording | carve-out landed |
| REQ-STATS-07 "reports it by name as missing" | REQ-STATS-07 wording | criterion states BR-27's rule |
| REQ-STATS-02 / REQ-STATS-08 wording (Low) | both criteria | both corrected |

The section therefore reports **zero** real disagreements as five. No behaviour turns on this — the
FSPEC's behavioural spine agrees with REQ HEAD everywhere I checked, in this round as in the last.
The cost is directional: TSPEC reads §7.3 for intent, and five phantom open errata are a standing
invitation to "fix" agreement back into divergence.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | nonlocal | The routed erratum item did not land, and correctly so: it is addressed to the wrong document. This FSPEC has no co-change table (`§2.1` is acceptance-criteria coverage; zero grep hits for "co-change"/"sites"). The five→nine site table lives at `DECISIONS-pdlc-stats.md:129` and is already at nine; `K-7` (`:464`) already owns both sibling-feature document edits the item names. The item's "FSPEC §5.2" is the *sibling* `docs/completed/pdlc-engine-distribution/FSPEC-…md:583`, not this document — the probable source of the mis-route. No FSPEC edit is warranted; adding a vendoring site table here would be an altitude violation. Process finding against routing, not a document defect. | §2.1 |
| F-02 | Medium | inherited | nonlocal | §7.3 still lists five errata as open against the REQ; all five are settled at REQ v1.4. The section reports zero real disagreements as five, and TSPEC reads it for intent. | §7.3 |
| F-03 | Medium | inherited | nonlocal | BR-27 attributes G-3's wording to REQ-STATS-07 and frames its narrowing as a live erratum; REQ-STATS-07 at HEAD already states BR-27's own rule. Mis-attribution, not a dead quote. | §4.5 BR-27 |
| F-04 | Medium | inherited | nonlocal | EC-09 and D-9 assert a deliberate departure from REQ-STATS-09's *Given*; REQ v1.4 added the no-`docs/`-root carve-out that removes the departure. Behaviour correct, framing false. | §5 EC-09; §7.1 D-9 |
| F-05 | Low | inherited | nonlocal | BR-06 calls the `-REVIEW-` malformed disposition "a wording defect of the upstream criterion"; REQ-STATS-03 now decides that case explicitly, in D-8's direction. | §4.2 BR-06; §7.1 D-8 |

FINDING: Low | delta | nonlocal | §2.1 | Routed item is mis-addressed: this FSPEC has no co-change table; the site table and K-7 live in DECISIONS and already discharge it. No FSPEC edit warranted.
FINDING: Medium | inherited | nonlocal | §7.3 | Five errata listed as open against the REQ are all settled at REQ v1.4; the section reports zero disagreements as five.
FINDING: Medium | inherited | nonlocal | §4.5 BR-27 | BR-27 attributes G-3's wording to REQ-STATS-07 and frames a settled narrowing as a live erratum.
FINDING: Medium | inherited | nonlocal | §5 EC-09 | EC-09 and D-9 assert a departure from REQ-STATS-09 that REQ v1.4's carve-out has removed.
FINDING: Low | inherited | nonlocal | §4.2 BR-06 | BR-06 calls a decided case an upstream wording defect after REQ-STATS-03 settled it in D-8's direction.

All four `inherited` findings are re-raised verbatim from my v6 confirmation. They are not new: this
round edited nothing, so they could not have been resolved. They are tagged `inherited` deliberately
so they stay non-gating and route back to the FSPEC's ordinary revision loop rather than halting the
phase — and so they are not lost to a round that had no delta to attach them to.

The single `delta` finding is tagged `delta` because the round left a routed item unlanded, which is
the protocol's definition. It is Low, not High, because the correct disposition of that item is *"no
change required here"*: the obligation is real, is owned, and is discharged in DECISIONS `K-7`. The
defect is in the routing, not in any document.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Should the orchestrator's erratum router disambiguate bare document-type tokens (`FSPEC`, `TSPEC`) that refer to *sibling completed features*? `K-7`'s text necessarily names another feature's `FSPEC §5.2`, and that appears to be what sent this item here. If other cross-feature obligations are routed the same way, this will recur. |

## Positive Observations

- **DEC-STATS-01's site table is now sweep-derived, and it shows.** Nine sites found by one
  `git grep -l` with documented exclusions, replacing three rounds of per-file reading that found
  five, then six. The DECISIONS text even records *why* the two surviving grep hits fail the
  predicate. That is the blast-radius enumeration discipline done properly, and it is the reason
  this routed item could be adjudicated in minutes rather than argued.
- **K-7 states its own residual.** It names `P7-02` as the oracle and then admits `P7-02` does not
  cover `PK-26`'s existence as a row. An obligation that documents the edge of its own coverage is
  worth more than one that claims completeness.
- **The FSPEC's behavioural spine has now survived two independent re-groundings against REQ v1.4**
  with no divergence found. The document is in good shape; every finding I have left against it is
  about stale *framing* of settled disputes, not about behaviour.
- **The v6 round's edits held.** BR-11, BR-16 and BR-25 are still correct against REQ HEAD.

## Recommendation

**Approved with minor changes**

No High findings, so nothing gates this confirmation. The FSPEC is byte-identical to the bytes I
approved at v6, its upstream REQ is byte-identical to the pinned `UPSTREAM-STATE` anchor, and my
DEC-ERR-03 re-read of the whole document against REQ v1.4 at HEAD found no new divergence.

On the routed item: **no FSPEC edit is required, and none should be made.** The obligation it
describes is real but belongs to `DECISIONS-pdlc-stats.md`, where DEC-STATS-01's table already
carries nine sweep-derived sites and `K-7` already owns both sibling-feature document edits
(`TSPEC §5.4` gaining `PK-26`; the sibling `FSPEC §5.2`'s per-class count moving five → six). I
recommend the orchestrator close the item against DECISIONS rather than re-dispatching it here, and
consider Q-01 on router disambiguation so cross-feature obligations naming another feature's `FSPEC`
are not resolved to the feature under review.

What I would ask of the next ordinary FSPEC revision — none of it urgent, none of it behavioural:

1. **Rewrite §7.3 to report reality (F-02).** All five remaining bullets are settled at REQ v1.4.
   Either close them the way the round-6 edit closed the three harvested-predicate errata, or, if any
   is genuinely still open, say against which current REQ sentence. Five phantom disputes are a
   standing invitation for the TSPEC to reintroduce divergence.
2. **Fix the three in-place erratum notices that echo §7.3** — BR-27's mis-attribution of `G-3`'s
   wording to `REQ-STATS-07` (F-03), EC-09/D-9's claimed departure from `REQ-STATS-09` (F-04), and
   BR-06's "wording defect of the upstream criterion" (F-05). In each case the *behaviour* is right
   and agrees with the REQ; only the surrounding claim that a dispute is live is false. These are
   sentence-level edits.

Doing (1) and (2) together is one coherent pass — they are the same defect, that the document's
record of upstream disagreement was not updated when the upstream agreed.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 2}
