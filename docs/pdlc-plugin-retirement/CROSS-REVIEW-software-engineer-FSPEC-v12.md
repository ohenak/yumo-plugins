# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.9)
**Date:** 2026-08-18
**Iteration:** 12 (delta confirmation)

## Scope of this round

Delta confirmation, not a full re-review. At v11 I filed one High finding (F-01):
the class-10 correction said `postWaveCommand`/`postWavePathspecs` survive, but
REQ C-5, REQ AC-1.2's rationale, and baseline M-11h still said the opposite, with
no upstream erratum open. Since v11 the fix wave landed on both sides — commit
`76591d1e` (REQ/baseline erratum 5), `134fec23` (REQ/baseline erratum 3),
`c14048ed` (FSPEC v0.9 closing v11), plus a REQ-only round (`224bee64`, REQ
v0.16) that landed after FSPEC v0.9 was written. The question this round answers:
does FSPEC v0.9 plus the upstream errata resolve F-01, and does the FSPEC↔REQ
contradiction chain stay closed all the way to REQ HEAD (v0.16), not just to the
REQ version FSPEC v0.9 was written against (v0.15)?

Diffed `c5907f3c..HEAD` over FSPEC, REQ, and the baseline. Scanned only the
sections that diff touched, plus every place those sections cite a REQ version
number, for staleness against REQ HEAD.

## F-01 verification (closed)

**Resolved.** All three legs of the contradiction now agree with the codebase and
with each other:

- FSPEC §3.1 class 10 (`FSPEC:162`) now reads "**Prose only**... values stay on
  the branch that retains `pdlc/workflows/dist/`" — matches HEAD's
  `.claude/pdlc.config.example.json` (`postWaveCommand: node
  pdlc/workflows/build-runtime.mjs`, `postWavePathspecs: ["pdlc/workflows/dist/"]`)
  and TSPEC TT-5 (`TSPEC:742`).
- REQ C-5 and AC-1.2's rationale were corrected at REQ v0.13 (verified in
  `REQ-pdlc-plugin-retirement.md:229`, changelog at `REQ:20`ish — the "0.13"
  entry): "the reduced build step still emits M-9 into `pdlc/workflows/dist/`
  under O-3."
- Baseline M-11h (`docs/_constraints/pdlc-retirement-baseline.md:75`) carries the
  matching 2026-08-18 erratum-correction note and the corrected row text; no path
  or count changed.
- FSPEC §7.2 row 4 (`FSPEC:861`) records the REQ v0.13 resolution explicitly, and
  §7.2's lead-in (`FSPEC:849`–`:851`) now states "where an erratum reversed a
  claim, the REQ and measured baseline carry the same reversal rather than being
  left contradicting this document" — the exact hedge F-01 asked for.

The related delta-confirmation findings from v11 (F-02 open erratum-10 row,
F-03 consolidate-learnings performer clause, F-04 v0.11→v0.15 version sweep,
F-05 held-class transitive note, F-06 cross-review list) are also all closed —
verified at `FSPEC:874`–`:876` (erratum 10 now an explicit open row), `FSPEC:199`–`:203`
(SKILL.md rewrite names the human-performed pass, not the dead module),
`FSPEC:9,75,814,829` (all read v0.15, consistent with each other), `FSPEC:159`–`:161`
(transitive-hold sentence present), and `FSPEC:11` (cross-review list runs through v11).

## New finding: F-01's pattern recurs one level down (REQ v0.16 vs. FSPEC v0.15 pin)

REQ moved to v0.16 in commit `224bee64`, after FSPEC v0.9 was written, correcting
C-9's framing: `REQ:288`–`:291` now reads "toward a *hand-modified expected* entry
is deliberately outside the constraint **by scope decision**: the cleanup judges
**presence, not provenance**" — replacing the prior "no post-sweep artifact
records the hashes that would let anything tell a modified copy from an
original" (an impossibility claim the REQ changelog at `REQ:20` explicitly calls
out as what v0.16 moved away from).

FSPEC's downstream text was not part of this round's diff and still carries the
pre-v0.16 impossibility framing verbatim, plus a stale version pin:

- `FSPEC:540`–`:542` (BR-CLN-3a): "a file with an expected *name* and
  hand-modified *content* is removed like any other expected entry, **because no
  post-sweep artifact can distinguish it**."
- `FSPEC:606` (E-16a): "no post-sweep artifact can detect the modification...
  REQ AC-4.3 and C-9 **(v0.15)**, which place a hand-modified expected entry
  outside the refusal predicate."
- `FSPEC:543` also cites "REQ AC-4.3 (v0.15)".

This is the same shape of defect F-01 was: an upstream correction landed (REQ
v0.16, "impossibility claim" → "scope decision"), and the downstream document
still asserts the superseded rationale with no erratum recorded, plus a version
pin one release behind REQ HEAD. The *behavior* BR-CLN-3a and E-16a describe
(hand-modified expected entries are still removed, not refused) is unchanged and
correct — this is not a behavioral regression — but the FSPEC's stated *reason*
for that behavior now contradicts REQ C-9's own stated reason, and a reader
following the FSPEC's citation to "REQ C-9 (v0.15)" lands on a REQ version that
no longer exists at HEAD.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | *(inherited, nonlocal — pre-existing text this round's diff did not touch, but newly contradicted by REQ v0.16 which landed inside this round's window)* BR-CLN-3a (`FSPEC:540`–`:542`) and E-16a (`FSPEC:606`) both give "no post-sweep artifact can distinguish/detect the modification" as the reason a hand-modified expected entry is removed rather than refused. REQ C-9 was corrected at v0.16 (`REQ:288`–`:291`) to state this is a **scope decision** ("the cleanup judges presence, not provenance"), not an impossibility. Both FSPEC passages also cite "REQ AC-4.3 (v0.15)" — REQ HEAD is v0.16. **Fix (cheap, no behaviour change):** restate BR-CLN-3a and E-16a's rationale to match REQ C-9's scope-decision framing ("the cleanup judges presence, not provenance, by C-9's scope decision" or equivalent), and bump both version pins to v0.16. Tagged Local because the fix is confined to this document; the underlying constraint (REQ version pins drift whenever REQ moves without a corresponding FSPEC touch) is the same one F-01 already surfaced as Cross-Feature at v11 — no new cross-feature signal to add. |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is there a process gap here worth naming for harvest: REQ rounds that land *after* FSPEC has already closed its own upstream-erratum ledger (§7.2) don't automatically trigger a "does FSPEC still cite REQ HEAD correctly" pass. F-01 (this round) and the original F-01 (v11) are the same failure mode at two different points in the document. Not blocking this round's fix, but worth a Process-scope note at harvest time. |

## Positive Observations

- The core F-01 fix is substantively correct and independently verified against
  the codebase (`.claude/pdlc.config.example.json`, TSPEC TT-5,
  `consolidationPreflight.test.js`), not just against the REQ text.
- §7.2's lead-in now explicitly commits to the invariant that erratum reversals
  are always reflected upstream, not left as downstream-only patches — the right
  fix for the class of defect this document keeps surfacing.
- The erratum-10 open row (§7.3) is honestly scoped as open rather than folded,
  which is exactly what F-02 asked for.
- §3.3 step 4's rewrite of the consolidate-learnings capability disposition
  correctly names the human-performed pass as the one true performer and does
  not leave a sentence pointing at a module nothing loads (F-03 resolved
  cleanly).

## Recommendation

**Needs revision** — one High (F-01, this round's finding; distinct from and
narrower than v11's F-01, which is fully closed).

v11's F-01 is closed: the class-10/C-5/AC-1.2/M-11h chain agrees end to end and
§7.2 records it correctly. But the same failure mode reappeared one section over:
REQ moved to v0.16 correcting C-9's rationale, and FSPEC's BR-CLN-3a/E-16a text —
untouched by this round's diff — still states the superseded impossibility
framing and cites a stale REQ version. Exactly one change closes it: restate the
two rationale clauses to track REQ C-9's "scope decision, presence not
provenance" framing and bump the two "(v0.15)" citations to "(v0.16)". No
behavioral change, no TSPEC/PLAN impact — BR-CLN-3a's behavior (remove, don't
refuse) is already correct and unchanged.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}
