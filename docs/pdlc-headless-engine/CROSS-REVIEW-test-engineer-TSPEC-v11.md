# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.9)
**Date:** 2026-08-11
**Iteration:** 11

**Scope:** delta confirmation of the Phase-T erratum round against v1.8, the revision approved in
round 10 (`REVIEWED-COMMIT: ed0e0eec`). This is not a fresh review: the question answered here is
whether the three erratum items routed to this document are discharged, and whether the targeted
edit broke anything that was previously approved. Unchanged sections were not re-reviewed.

Diff read: `git diff ed0e0eec..HEAD -- docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md`
(+70/−41), across five commits (`f1d68757`, `316a5a6f`, `8e2b9c70`, `1d136daa`, `03d28fc6`).
Every anchor below was re-read at HEAD on `feat-pdlc-headless-engine` against the committed blob,
not the working tree.

## Erratum disposition

| Erratum item | Disposition | Verification at HEAD |
|---|---|---|
| **1 — TSPEC v1.8 still pins FSPEC v1.6** (`TSPEC:20`, `:54`) | **Discharged.** The lineage header now reads `FSPEC-pdlc-headless-engine.md` **v1.7** (`TSPEC:9`) and the v1.9 changelog states the pin move explicitly (`TSPEC:19`). The two surviving "FSPEC v1.6" strings are inside the **v1.8 and v1.7 changelog entries** (`TSPEC:42`, `:76`), which record the pin in force when those revisions were written; the document says so in as many words (`TSPEC:36-38`). That is the correct handling — rewriting a historical changelog line to a version that did not exist when the entry was written would make the changelog a worse record, not a better one. The pin in force *now* is unambiguous and appears in exactly the two places a reader looks: the lineage table and the current entry. | `TSPEC:9`, `:19`, `:36-38`; FSPEC version row at HEAD is `1.7` (`FSPEC:16`) |
| **2 — pre-insertion rung-4a anchors** (`FSPEC:299` at `TSPEC:1034`, `FSPEC:406` at `TSPEC:2179`) | **Discharged, and each anchor lands on the text it claims.** Re-read against the HEAD blob, not the worktree: `FSPEC:307` is the `\| 4a \| **guard executable (C-11)** \|` ladder row; `FSPEC:416` is EC-START-10 ("no accepted interpreter on the host"); `FSPEC:417` is EC-START-11 (the `PATH`-present-but-not-runnable stub); `FSPEC:300-308` spans the rung table head through rung 5, which is what the `RUNG_ORDER` code comment now cites (`TSPEC:1050`); `FSPEC:928-931` is BR-GUARD-6's candidate-set bullet and `:932-933` its "observed by **running**" rule; `FSPEC:977` is AT-ENG-11a. A grep of the live body for every superseded anchor (`:299`, `:302`, `:406`, `:918`, `:922`, `:967`, and "FSPEC §5") returns **no live-body hit** — the only survivors are the `old → new` pairs inside the v1.9 changelog (`TSPEC:27-29`) and one historical v1.6 changelog line (`:124`), both of which are meant to name the superseded value. §4.3's "FSPEC §5's ladder" is corrected to **§4.1** (`TSPEC:1050`). | `FSPEC:307`, `:416-417`, `:300-308`, `:928-931`, `:932-933`, `:977`; `TSPEC:1050`, `:1055-1056`, `:2201-2202`, `:2236`, `:2241` |
| **3 — BR-START-1 "no probe of any kind"** (`TSPEC:9`, `:21`, `:2448-2452`) | **Discharged, and discharged in the strongest available form: quoted verbatim from the landed upstream text.** FSPEC v1.7 at HEAD reads "No model call, and no *billable* probe of any kind, is made while the ladder is running", and adds the clause that settles the question — "Local checks the ladder performs on the host's own bytes are not probes in this sense and are not dispatches — rung 4a observes interpreter availability by running a candidate (BR-GUARD-6), which bills nothing" (`FSPEC:310-313`). §7.8 no longer *infers* the billable reading from BR-START-1's "zero tokens billed" justification; it quotes the qualifier now in force (`TSPEC:2248-2252`). §9.3's entry moves from "raised, outstanding" to `**resolved in FSPEC v1.7**` (`TSPEC:2474-2480`), and §7.8 records the discharge (`TSPEC:2256`). | `FSPEC:310-313`; `TSPEC:21-22`, `:2248-2256`, `:2474-2480` |

The third item is worth naming precisely, because it is the one that could have been discharged
badly. The cheap discharge was to narrow §7.8's design until it fit the un-qualified prose — drop
the `spawnSync` observation, or downgrade rung 4a to a `PATH` lookup. That would have satisfied the
letter of BR-START-1 and broken EC-START-11, whose entire content is that presence is not
executability. The document instead held the design, raised the erratum upstream in round 9, and
this round records that upstream adopted it. §7.8's tests are byte-identical across the erratum
round, which is the observable signature of a correctly-routed erratum: the finding moved, the
design did not.

## Regression check on the previously approved design

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
