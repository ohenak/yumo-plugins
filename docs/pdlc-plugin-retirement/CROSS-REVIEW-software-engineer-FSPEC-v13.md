# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.10)
**Date:** 2026-08-18
**Iteration:** 13 (delta confirmation)

## Scope of this round

Delta confirmation only. At v12 I filed one High finding (F-01): BR-CLN-3a
(`FSPEC:540`–`:542`) and the E-16a row (`FSPEC:606`) still stated REQ v0.15's
superseded "impossibility" rationale for C-9 ("no post-sweep artifact can
distinguish/detect the modification") and cited a stale "REQ AC-4.3 (v0.15)"
pin, after REQ v0.16 (`224bee64`) restated C-9's rationale as a scope decision.
Since v12, commit `6c56b3cf` (FSPEC v0.10) made a targeted erratum-style edit.
Question this round answers: does that delta resolve F-01 without introducing
a new High-severity defect, per the round-13 decision freeze.

Ran `git show 6c56b3cf -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
and diffed against REQ HEAD (v0.16) C-9 text (`REQ:288`–`:291`). Scanned only
the changed hunks plus their immediate surrounding prose for new inconsistency.

## F-01 verification (closed)

**Resolved.** Both passages now track REQ C-9's v0.16 scope-decision framing
verbatim:

- BR-CLN-3a (`FSPEC:540`–`:542`): "the cleanup judges presence, not
  provenance — a deliberate scope decision, not an impossibility" — matches
  REQ C-9 (`REQ:288`–`:291`): "the cleanup judges presence, not provenance,"
  correcting the *scope decision*, not impossibility, framing. Citation moved
  from "REQ AC-4.3 (v0.15)" to "REQ AC-4.3 (v0.16)" (`FSPEC:543`).
- E-16a (`FSPEC:606`): "the cleanup judges presence, not provenance, by REQ
  C-9's scope decision" — same framing, and the trailing citation moved from
  "AC-4.3 and C-9 (v0.15)" to "AC-4.3 and C-9 (v0.16)".
- §7.2 gained row 6 (`FSPEC:865`), correctly stating the prior superseded
  wording, citing "SE FSPEC v12 F-01" as the raising review, and recording the
  REQ v0.16 resolution — consistent with the ledger's existing row format
  (rows 1–5).
- Header metadata (`FSPEC:9`) and the changelog line (`FSPEC:864`-adjacent)
  both now read "REQ v0.16" for upstream trace, consistent with the body edit.

No behavioral text changed — BR-CLN-3a's rule (hand-modified expected entries
are removed, not refused) is unchanged, matching the "no behaviour change"
claim in the commit message and in §7.2's row 6.

## New-defect check (delta-local and adjacent)

Checked for anything the edit could have broken:

- The other "(v0.15)" pins remaining in the document — `FSPEC:75` ("Every
  behaviour traces REQ-pdlc-plugin-retirement.md v0.15"), `FSPEC:815` (AC-5.2's
  allowed-difference set), `FSPEC:830` (O-3's manifest-survival settlement) —
  are all outside this round's diff and outside what REQ v0.16 touched (REQ
  v0.16 changed only C-9's rationale text, not AC-5.2 or O-3/AC-1.1). These
  were already verified consistent as of v12 (F-04, closed) and remain so:
  REQ v0.16 gives no reason to bump them. Not a new finding.
- BR-CLN-3a's sentence reads grammatically after the edit (verified full
  paragraph at `FSPEC:537`–`:544`) — no dangling clause or broken cross-
  reference introduced by the insertion.
- E-16a's table row (`FSPEC:606`) still parses as a single pipe-delimited row
  after the text substitution — no stray `|` introduced.

No new High, Medium, or Low finding identified.

## Findings

None.

## Questions

None.

## Observations

- The fix is a clean, minimal, behaviour-preserving erratum edit: it corrects
  only the rationale prose and the two version citations F-01 named, without
  touching BR-CLN-3a's or E-16a's stated rule.
- §7.2 row 6's format matches the ledger's existing convention exactly
  (raised-against / resolution-in-REQ-HEAD columns, review citation), keeping
  the erratum trail auditable the same way rows 1–5 already are.
- This closes the pattern F-01 (v11) and F-01 (v12) both surfaced: a REQ
  correction landing after an FSPEC round closes leaves a stale downstream
  citation. Not a new observation to raise here since v12 already logged a
  Process-scope question (Q-01) about it for harvest; nothing to add this
  round.

## Recommendation

**Approved**

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:5cd899dac04a05b6d7b002a0f0056d7fd5508525cb1399d1dc1f069347e1de23
APPROVAL-HASH-NORMALIZED: sha256:9ab53f3f0071f5e126dfea71f008153ed1aabace6b18a9686585390e65bab11c
REVIEWED-COMMIT: 6c56b3cf21d90c707e90983d7d1a44f5482c867a
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
