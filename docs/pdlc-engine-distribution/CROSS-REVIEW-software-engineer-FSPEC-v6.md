# Cross-Review: software-engineer — FSPEC (delta confirmation, round 6)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 6
**Scope:** Erratum delta confirmation over commit `73e664bb` (v0.5 → v0.6, 17 insertions / 7
deletions). Only the changed regions — the 0.6 changelog, §8's `Q-1` row, AT-1.1, AT-1.4, AT-1.6 —
were re-read line by line, plus the upstream re-grounding DEC-ERR-03 requires. Sections settled in
rounds 1–5 were not re-litigated.

## 1. Erratum items — disposition

Both raised items are the same defect seen from two seats: the FSPEC pinned a user-facing string
the shipped code does not emit.

| Item (raiser) | Resolved? | Evidence |
|---|---|---|
| AT-1.6 quoted `"none"` where `checkCompat` reports `not found` (pm-review) | **Yes** | AT-1.6 (`:672-674`) now reads "installed plugin version (the literal `not found` when none is installed)". The literal matches HEAD exactly: `handshake.mjs:146` maps a null/empty plugin version to `"not found"`, `:164` puts `version found: not found` in the refusal reason, `:209`/`:211` render it in the triple, and `handshake.test.js:113` pins `out.pluginVersion === "not found"`. PROP-LAUNCH-5 (`PROPERTIES:87`) and PROP-LAUNCH-9 (`:91`) already transcribed that literal, so FSPEC was the odd document out and is now the aligned one. |
| AT-1.6/AT-1.1 pin the wrong user-facing string a verifier would transcribe (se-review) | **Yes** | AT-1.1 (`:655-658`) replaces "states none is installed" with "reports the plugin version as the literal `not found`", which is true of the refusal text at `handshake.mjs:164`, not merely of the banner. `Q-1` (`:596`) — the content obligation a verifier reads for the triple — carries the same literal. |

Two consequential edits were made beyond the item list, both correct and both in scope:

- **AT-1.4's discriminator was repointed rather than left dangling.** It previously discriminated
  the unparseable-manifest refusal from "the 'none installed' message"; with that phrase deleted
  the citation would have named nothing. It now reads "**not** AT-1.1's `not found` message"
  (`:664-666`), which is an id-anchored reference rather than a second copy of the literal — the
  right shape, since only AT-1.1 should own the string.
- **The changelog records the round honestly** (`:19-24`): it names both raisers, cites
  `lib/handshake.mjs` and `handshake.test.js:113`, states that PROP-LAUNCH-5/-9 already held the
  value, and closes with "Literal alignment only: no criterion changed, no scope moved."

I diffed the whole commit, not just the quoted regions: nothing else moved. No `AC-` trace, no
`BR-`, no `E-`, no expected-set arithmetic, no §5.2 cell was touched. Nothing previously approved
is broken by this edit.

## 2. Upstream re-grounding (DEC-ERR-03)

The item list is necessary, not sufficient: I re-read REQ at HEAD to ask whether this FSPEC is
still a faithful compression of it.

**REQ moved under this document between rounds.** REQ is now **v0.11** (`01c27ee4`, 2026-08-13
22:07 — *before* the FSPEC erratum commit at 23:28). That version discharged both errata my v5
review routed upstream:

- **AC-1.3 was re-worded to the ownership split this FSPEC already holds** — the expected packed
  set's "**classes and per-class member counts are stated in the FSPEC**" and its "**member names
  are stated downstream in the TSPEC**" (`REQ:264-274`). That is exactly §1's ownership paragraph
  (`FSPEC:59-63`) and §5.2's "the member *count* is owned here, per class and in total …
  TSPEC §5.4's `PK-*` table says which files" (`FSPEC:509-517`). **Absorbed, not contradicted** —
  the substance needed no FSPEC edit.
- **`REQ:22`'s run-side `engine.*` pin citation** now reads FSPEC **F-4 step 2**, matching where
  the flow actually lives. No FSPEC-side consequence.

I also re-checked the two REQ criteria this erratum touches. AC-1.1 requires a refusal "naming the
declared range and what — if anything — is installed" and AC-1.4 requires the plugin version "(or
that none is installed)" (`REQ:253-278`). REQ deliberately states no literal — that is FSPEC
altitude — so pinning `not found` **narrows without contradicting**, and it narrows to the value
the shipped code and the already-approved PROPERTIES both carry. The compression is faithful.

**What did not follow the upstream move:** the header's Upstream cell still pins
"`REQ-…md` (v0.10, re-grounded 2026-08-13 erratum round)" (`:9`), and the 0.6 changelog records
only the literal alignment, so nothing in this document records that REQ v0.11 was read and its
AC-1.3 change absorbed. §5.2 also still quotes REQ AC-1.3 as "*expected set stated in the FSPEC*"
(`:522-523`) — a phrase REQ no longer carries verbatim, though what it now carries is strictly
better aligned with §5.2's split. Bookkeeping, not a false statement of behaviour: F-02 below.

## Findings

No High findings. F-01 is the one that matters and it is **not against this document** — this
document is now the correct one; three already-approved downstream documents are not.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Medium | Cross-Feature | **The deleted literal is still live downstream, where it is now unimplementable.** With `"none installed"` gone from the FSPEC, three approved documents still discriminate against it by name: `PLAN:146` T15(e) ("the assertion pins that it is **not** the 'none installed' message"), `PLAN:458` step 5, and `PROP-LAUNCH-3` (`PROPERTIES:85`). An implementer reading T15(e) writes an assertion against a string that appears nowhere in `lib/handshake.mjs` and nowhere in the FSPEC — the same class of defect this erratum just fixed, one layer down. Fix is one string in three places: point them at AT-1.1's `not found` message, as AT-1.4 now does. Medium **here** only because the FSPEC is correct; against PLAN and PROPERTIES this is High, and it blocks T15. | AT-1.4 (`:664-666`), `PLAN:146`, `PLAN:458`, `PROPERTIES:85` |
| F-02 | Medium | Process | **The Upstream cell and changelog do not record the REQ v0.11 re-grounding.** The cell still pins REQ v0.10 (`:9`) although REQ v0.11 landed before this commit and discharged the AC-1.3 erratum this FSPEC raised. Per DEC-ERR-01 an erratum round re-reads its immediate upstream at HEAD and records what it absorbed; the content check passes (see §2) but the paper trail does not, so the next reader cannot tell the FSPEC was measured against current REQ. Fix: bump the cell to v0.11 and add one absorption sentence to the 0.6 changelog. Optionally restate §5.2's quotation (`:522-523`) in REQ v0.11's words. | Header (`:9`), changelog (`:19-24`), §5.2 (`:522-523`) |
| F-03 | Medium | Local | **v5 F-01 carried forward, unaddressed** (this round was scoped to the literal, so this is not a regression): §5.2's **CLI entry** and **Engine modules** rows still read "named in TSPEC §5.4" with no `PK-*` anchors (`:503-504`), while the other five rows anchor ids. AT-3.8a asserts *per-class* counts, and TSPEC partitions differently (4+15+3+1 at `TSPEC:386-389` vs §5.2's 1+1+2+15+3+1), so the implementer must invent the PK→class mapping. Remedy is still two cells: `(PK-4, PK-4b)` and `(PK-5…PK-19)`. | §5.2 (`:503-504`, `:509-511`), AT-3.8a (`:733-739`) |
| F-04 | Medium | Local | **v5 F-02 carried forward:** the CLI-entry row's ownership sentence — "how many files carry that entry is a decomposition question TSPEC §5.4 decides, not this document" (`:503`) — contradicts the paragraph two lines below, which owns "CLI entry 2" (`:510`) and §1's cardinality co-change rule (`:59-63`). As written a future author can move `bin/` from two files to three with no FSPEC edit, defeating the change-control point the per-class count exists to create. | §5.2 (`:503`, `:509-511`), §1 (`:59-63`) |
| F-05 | Low | Local | **v5 F-03 carried forward:** AT-3.8a's count conjunct is still stated in the disclaiming direction ("asserted against the **transcribed** `PK-*` list, never the tarball's own length", `:735-737`). The intended assertion is the positive one — the transcribed list's length, and each class's slice of it, must equal §5.2's 23/24 and per-class numbers. Same content, one re-read cheaper. | AT-3.8a (`:735-739`) |
| F-06 | Low | Local | **v5 F-04 carried forward:** the workflow-module class is named "Workflow modules" and AT-3.8b says "its workflow **modules** are enumerated" (`:507`, `:757`), but `PK-22` is `vendor/workflows/VENDOR-MANIFEST.json` (`TSPEC:357`) — a JSON manifest, not a module. TSPEC's own "three vendored workflow **members**" (`TSPEC:388`) is the careful phrasing. A verifier who reads "modules" literally enumerates two and fails a correct package. | §5.2 (`:507`), AT-3.8b (`:756-758`) |

## Questions

| ID | Question |
|----|----------|
| Q-01 | AT-1.1 now says the refusal "reports the plugin version as the literal `not found`". At HEAD the refusal reason renders it as `version found: not found` (`handshake.mjs:164`) while the triple renders `plugin: pdlc vnot found` (`:209`). Both contain the literal, so both satisfy AT-1.1 as written — is that intended latitude (substring obligation, rendering owned downstream), or should AT-1.1 say substring explicitly so a verifier does not read it as an exact-equality obligation on the whole field? Recording only; the current wording is defensible. |

## Positive Observations

- **The erratum was resolved at the source of truth, not by splitting the difference.** The
  document adopted the value the code emits and the tests pin, rather than asking the code to
  match the spec or leaving two literals in play. Every citation in the new changelog checks out
  against the tree — `lib/handshake.mjs` really does map null → `"not found"` at `:146`, and
  `handshake.test.js:113` really is the pin.
- **AT-1.4 was noticed and repaired.** A narrow literal swap would have left AT-1.4 discriminating
  against a phrase no longer present anywhere in the document — a dangling reference of exactly
  the kind rounds 3 and 5 already caught elsewhere. Repointing it at AT-1.1 by id, rather than
  copying the literal a second time, keeps one owner for the string. That is the harder half of
  this edit and it was done unprompted.
- **The blast radius was correctly bounded upward and only missed downward.** The changelog's
  "literal alignment only: no criterion changed, no scope moved" is verifiable from the diff, and
  nothing settled in rounds 1–5 moved. F-01 is the mirror of that discipline: the same sweep run
  over PLAN and PROPERTIES would have caught the three remaining occurrences.

## Recommendation

**Approved with minor changes**

The two erratum items are resolved, correctly and at the right altitude, and the document remains
a faithful compression of REQ at HEAD (v0.11) — its AC-1.3 change was already absorbed in
substance. Nothing previously approved is broken. No open High findings, so this document is not
blocked.

Two items should land before Phase I dispatches T15, and neither costs a review round:

1. **F-01 is the one with teeth.** `PLAN:146` (T15 e), `PLAN:458` and `PROP-LAUNCH-3` still name
   the `"none installed"` message this erratum deleted. Left alone, the implementer of T15 writes
   an assertion against a string that no longer exists in the spec or the code. Routed as an
   erratum on PLAN and PROPERTIES, not held against this FSPEC.
2. **F-02** is two lines of bookkeeping: bump the Upstream cell to REQ v0.11 and record the
   absorption in the 0.6 changelog.

F-03…F-06 are the v5 Mediums/Lows, unchanged and still non-gating; they can ride along with the
next optimizer touch on §5.2.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 2}

