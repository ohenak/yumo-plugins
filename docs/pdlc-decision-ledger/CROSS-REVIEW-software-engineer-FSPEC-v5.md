# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.3)
**Upstream dispatch:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (sha256:ce6b133f…, verified against the working tree)
**Date:** 2026-08-28
**Iteration:** 5 (erratum confirmation, not a re-review)

## Scope

The erratum round landed in **two** commits, and only one of them touched this document:

- `514dccd67` — FSPEC **v1.3**: E-7 and AT-14 extended to `maxBytes` `0`, the `Upstream` pin advanced
  to REQ **v1.9**, and a v1.3 changelog paragraph added (addresses `CROSS-REVIEW-test-engineer-FSPEC-v3`
  F-03, not a finding of mine).
- `4f03479e1` — **upstream only**, 1 insertion / 1 deletion in each of two files, none in the FSPEC:
  `REQ-pdlc-decision-ledger.md:36` and `docs/_constraints/pdlc-decision-corpus-baseline.md:6`.

Both of my round-4 findings were `Low`, both pointed at upstream text rather than at FSPEC bytes, and
both were routed as absorbed-upstream. That routing is what `4f03479e1` executes, so the item list for
this round is: *nothing remains in the FSPEC to fix.* Confirmed below — but confirming the item list is
necessary, not sufficient. The question I answer is whether the FSPEC is **still a faithful compression
of the upstream as the upstream now stands**, so I re-read every REQ and Baseline site this document
leans on at the dispatch hash (`sha256:ce6b133f…`, which matches the working tree) rather than diffing
the item list.

## Delta-Confirmation Findings

**Round-4 items — both absorbed upstream, verified at the text, not at the commit message.**

- **F-01 (Low, round 4) — resolved.** The v1.8 changelog's cascade pointer used to aim the erratum at
  FSPEC §3.3, which carries no bound literal. `REQ:36` now reads "FSPEC's recitals of the default
  cascade — §3.1's defaults sentence and §7 A-1, not §3.3, which carries no bound literal". That names
  the two sites the edit actually touched (`FSPEC:127`, `FSPEC:562`) and says out loud why §3.3 is not
  one of them. The correction is in the REQ's own changelog prose, which is where the mis-aim lived;
  nothing in the FSPEC needed to move, and nothing did.
- **F-02 (Low, round 4) — resolved in its gating half, one residue left.** The Baseline's `Cited by`
  list (`baseline:6`) now ends "…§6 AT-01, §7 O-5, **§7 Assumptions A-1**", so the citation minted into
  `FSPEC:562` (`M-7b`/`M-7c`) is on the propagation path the file's own rule requires — "a new citation
  is added here in the same edit that mints it". The second half of that finding, the change-control
  paragraph's `§1–§8` / `§1–§7` mismatch, was not taken; it is re-raised below at unchanged severity.

**Fidelity re-check at the current upstream.** Every site where the FSPEC compresses upstream text, read
against the dispatch REQ and Baseline v1.2 as they now stand:

| FSPEC site | Upstream it compresses | Status |
|---|---|---|
| `FSPEC:9` `Upstream … **v1.9**` | `REQ:20` `Version 1.9` | Pin resolves. REQ v1.9 moved no measured value — it corrected two stale Baseline pins in the REQ's own body (`REQ:22-27`) — so the FSPEC advancing the pin and following nothing from it is the correct response, and its v1.3 changelog says exactly that |
| `FSPEC:11` `Baseline … **v1.2**` | `baseline:7` `Version 1.2` | Pin resolves. The Baseline's only change this round is the `Cited by` line; `git diff` confirms no `M-*` fact moved, so every id the FSPEC cites still resolves at the pinned version |
| `FSPEC:127` defaults `70` / `12500` | `REQ:181-182` C-5 | Verbatim on both literals, and both are cited-by-id rather than re-derived, as C-5 requires |
| `FSPEC:562` §7 A-1 | `REQ:386-389` §7 A-1 | Faithful: measured once against the Baseline's named commit, `maxEntries` (70) from `M-6b`/`M-6c`, `maxBytes` (12500) from `M-7b`/`M-7c`, operator-revisable before FSPEC authoring. The retired "unmeasured `learningsInjection` analogy" rationale appears in neither |
| `FSPEC:331` E-7, `FSPEC:473-481` AT-14 | `REQ:181-182` (both keys **non-negative**), `REQ:295-299` O-8 | Sound. REQ types both keys non-negative, so `maxBytes` `0` is a valid operator value and the FSPEC owes it an outcome; the FSPEC does not invent one, it derives it (E-8 then E-6, since every line exceeds `0`) and says so inline. REQ's own bounds sentence at `:298` still enumerates only `maxEntries` `0`, but that is the REQ stating an outcome, not withholding one — the FSPEC completing the axis is FSPEC-altitude work, not a divergence |
| `M-*` ids cited across the FSPEC | `baseline:101-112` and §1–§7 | All resolve at v1.2: `M-1d`, `M-2e`, `M-3a`/`M-3c`, `M-4a`/`M-4b`/`M-4d`/`M-4e`, `M-5a`/`M-5c`, `M-6b`/`M-6c`, `M-7b`/`M-7c` |

Nothing I approved in round 4 was disturbed: flows, business rules, the rest of §5, and §6 apart from
AT-14 are byte-identical, and the one edited edge case widens a stated outcome rather than replacing it.

One residual finding, `Low` and inherited, in a file that is not this document:

FINDING: Low | inherited | nonlocal | `docs/_constraints/pdlc-decision-corpus-baseline.md:23-24` | The change-control paragraph still says `REQ-pdlc-decision-ledger` owns "every section of this file — §1–§8 entire", then bounds the non-interleaving rule at "never interleaved into §1–§7". The file has eight sections and the same sentence pair claims both extents, so a successor author reading it literally may treat §8 as interleavable. One-word fix, no `Version` bump owed since no fact moves. Raised in round 4 as the second half of F-02 and not taken; re-raised at unchanged severity, non-gating, and it does not touch the FSPEC's own bytes.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried unchanged from round 4, and still not a finding against this document: `12500` is now the C-5 default in the REQ and in the FSPEC, but `TSPEC-pdlc-decision-ledger.md` still carries the retired `8000` at ten sites, several inside executable-adjacent blocks that assert shipped defaults. The branch is therefore mid-cascade, with two documents stating different C-5 defaults. That is the TSPEC round's work, not the FSPEC's — I raise it only so this approval is not read as "the cascade is complete". Is the TSPEC re-derivation already queued behind this confirmation? |
| Q-02 | `M-7d` is explicit that substance bytes exclude every separator, prefix and newline, and that the line format "belongs to the consuming TSPEC" (`baseline:112`), while the FSPEC's BR-12 scopes `maxBytes` to the rendered index text as it appears in the prompt, framing included. The two reconcile only if `M-7c`'s 50-bytes-per-record allowance covers whatever framing the TSPEC picks. REQ C-5's rationale cell now says this out loud (`REQ:182`), so the FSPEC staying silent is defensible — but the obligation currently rides in a rationale cell rather than on an `O-*` obligation binding the TSPEC's line format. Deliberate? |

## Positive Observations

- **The one FSPEC edit this round is the good kind of erratum edit.** v1.3 widens E-7 and AT-14 to the
  `maxBytes` axis and touches nothing else. It did not reopen a settled section to do it, and it does not
  invent an outcome: it states the outcome, then shows the derivation already available from E-8 and E-6,
  so a reader can check it without leaving the table. That makes O-8's bounds property total over either
  bound, which is what the round-3 finding was actually about.
- **An advancing pin with nothing following from it is spelled out rather than left ambiguous.** The v1.3
  changelog says REQ v1.9 moved no measured value and that the pin therefore advances alone. That is the
  sentence a later reader needs when they diff `v1.8 → v1.9` and expect a cascade; without it the pin bump
  looks like an incomplete edit.
- **The upstream fixes went where the defect was.** Both of my round-4 findings named upstream text — a
  changelog aimed at the wrong FSPEC section, a `Cited by` list missing a site it had just minted — and
  both were fixed there in one insertion each, with no compensating edit in the FSPEC. Fixing a
  mis-pointing changelog by adjusting the document it mis-points at is the tempting wrong move, and it
  was not made.

## Recommendation

## Verdict
