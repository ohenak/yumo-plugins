# Cross-Review: test-engineer — TSPEC (delta confirmation, erratum round 8)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.8, `sha256:f32d9cb5…`)
**Upstream at HEAD:** REQ `sha256:f75c348f…` (v1.7), FSPEC `sha256:a493133f…` (v1.8)
**Reviewed range:** `bf496d9aa..0d72080f3` (three commits, TSPEC only)
**Date:** 2026-08-31
**Iteration:** 11 (delta confirmation; decision freeze in force)

## Overview

**All four v10 findings are resolved, nothing regressed, and the rule the round settled is green in
production code.** This is the cleanest confirmation round this document has had: the delta is
exactly the re-stamp §4.3 promised it would make when the dispute settled, and I can now check it
against something better than prose — the implementation landed in the meantime, so the settled rule
has a running oracle.

**What the round did** (three commits, TSPEC-only, 41 insertions / 21 deletions):

| Commit | Site | v10 finding it answers |
|---|---|---|
| `bc456b415` | §4.3 — contested paragraph re-stamped to the settled rule; BR-16 pin v1.7 → v1.8; AT-17 fourth-leg narration drops the withdrawn `measured` alternative | F-01, F-03 |
| `1d3976d70` | §8.3 — REQ-STATS-06/BR-16 bullet closed as discharged; count word two → one | F-02 |
| `0d72080f3` | §0 — v1.8 changelog re-grounds on REQ v1.7 / FSPEC v1.8; v1.7's superseded row neutralised in place | F-04 |

**Verification, not acceptance of the changelog's word.** I re-derived every load-bearing claim:

- The REQ text §4.3 now quotes is **verbatim** REQ-STATS-06 at HEAD (`REQ-pdlc-stats.md:207-213`),
  truncated at "reports **harvested**" — no paraphrase, no drift.
- FSPEC BR-16 at HEAD (`FSPEC-pdlc-stats.md:373-383`) states the same rule, and the FSPEC v1.8 diff
  is **11 insertions / 2 deletions confined to the header and changelog** — so §4.3's "FSPEC v1.8
  absorbed the same decision with no rule changed" is measured, not assumed.
- Both grounding hashes in the v1.8 changelog match `sha256sum` at HEAD exactly. F-04's stale pin is
  gone and the replacement is correct.
- §8.3 now carries exactly **one** bullet (BR-26/EC-10), matching its own count word, and
  `TSPEC:155` independently agrees ("only BR-26/EC-10 remains open").

**The new evidence this round affords.** The implementation has landed since v10, so I checked the
settled rule against code rather than documents. `computeByteRatio` (`lib/stats.mjs:277-294`)
filters `crossReviews` through `parsers.parseReviewFilename(b).ok` and fires
`harvested && (crossReviews.length === 0 || dodReviews.length === 0)` — precisely §4.3's sketch. The
AT-17 leg-4 oracle exists (`__tests__/statsMetrics.test.js:389-399`), asserts the positive token
`harvested` plus `ratio === null` over `realParsers()` with `CODE_REVIEW` intact, and **passes**: I
ran the suite (21/21 green). The expected value the dispute could have flipped is now pinned in
three documents and one running test, all reading the same token.

**What is left.** Two Low nits, neither touching an oracle: one wrap-width artefact the
neutralisation edit introduced, one imprecise section attribution in §8.3's closure prose that
predates this round. No High, no Medium. Approved with minor changes.

## Architecture

**F-01 (Medium) — resolved.** §4.3's closing paragraph (`TSPEC:806-818`) previously opened "What the
shape itself yields is contested upstream and is not decided here" and concluded "Both cannot hold".
It now opens **"What the shape itself yields is settled upstream, in BR-16's favour"** and states the
rule. Three things make this a good resolution rather than a wording swap:

1. **The quotation is now current and verbatim.** The paragraph quotes REQ-STATS-06 at v1.7 —
   "evaluated over exactly the file set whose bytes the process side sums … contributes no process
   bytes and counts as no file of its family remaining: a feature whose only `CROSS-REVIEW-`
   basenames are of that shape reports **harvested**". I diffed this against `REQ:207-213`
   character by character. It matches, including the C-5 parenthetical.
2. **The withdrawn reading is recorded in place, not deleted.** "*Record of a withdrawn reading, so
   it is not re-raised:* REQ v1.6 briefly called such a basename 'a survivor'…". This is the v1.3
   precedent I praised at v9 applied again, and it is the right call: a reader who encounters the
   v1.6 wording in an old review or an old test comment can now find out what happened to it
   without re-opening the question. Deleting the history would have invited a good-faith
   re-litigation of exactly the clause that cost this feature two rounds.
3. **The pre-declared re-stamp list is discharged honestly.** §4.3 said three sites would re-stamp;
   the paragraph now says they "re-stamp here" and adds "no type, signature, exit code, oracle or
   expected value moves, because the value they carried was already the settled one". That last
   clause is the accurate description of what happened, and it matches my own v10 finding that two
   of the three sites needed no substantive change.

**F-02 (Medium) — resolved, and the surrounding bookkeeping holds.** §8.3 (`TSPEC:1307-1327`) now
reads "**One remains open** — BR-26/EC-10's unclassified predicate, below", and the discharged
bullet is gone. I checked the closure did not damage its neighbour: the BR-26/EC-10 bullet survives
intact with its circularity argument, its EC-03/AT-26 reasoning and its §4.4 leading-underscore
note. That was the specific risk I flagged in v10 Q-02 — closing by wholesale deletion — and it did
not happen.

The count arithmetic is internally consistent: "Four others this section carried are **closed**"
enumerates BR-16's ambiguity, BR-11's dropped qualifier, BR-25's loose-file illustration (all at REQ
v1.4 / FSPEC v1.4) and the REQ-STATS-06-versus-BR-16 item (REQ v1.7 / FSPEC v1.8) — four, and
"All four are removed" agrees. `TSPEC:155`, in a different section and untouched by this round,
independently states "§7.3 declares closed (BR-16, BR-11, BR-25); only BR-26/EC-10 remains open".
Two independently-authored count claims agreeing is the cheap check that catches a half-applied
closure edit, and it passes.

**F-04 (Low) — resolved, and this is the one I checked hardest.** This document has a history of a
false no-movement attestation (v1.5), so a grounding pin is not something I take on trust. The v1.8
changelog claims REQ `sha256:f75c348f…` (v1.7, commit `e12b78fd8`) and FSPEC `sha256:a493133f…`
(v1.8). `sha256sum` at HEAD returns `f75c348f299ebff8…` and `a493133f67150b27…`. Both correct. The
changelog also correctly records that **FSPEC moved this round too** — v10 grounded on FSPEC
`c7d2c832…`, HEAD is `a493133f…` — which is a movement my own v10 dispatch had not anticipated and
which the author caught and pinned rather than inheriting the old hash. That is the attestation
discipline this document was missing three rounds ago.

**Scope discipline.** The delta touches §0, §4.3's narration and §8.3. It does not touch the §4.3
code sketch, §5's types, §6's levels, §7's tables or §2.1's co-change derivation. I confirmed this
from the diff rather than the changelog's assurance: the three hunks in §4.3/§8.3 and one in §0 are
the entire change set.
