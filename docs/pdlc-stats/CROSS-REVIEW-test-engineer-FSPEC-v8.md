# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.5)
**Upstream at dispatch:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.4 (sha256:60a516fb…a8f1c9, verified on disk)
**Date:** 2026-08-31
**Iteration:** 8 (delta confirmation, not a full re-review)
**Scope:** Local

## Routed Items

The round routed two stale §7.3 entries (raised by pm-review): the REQ-STATS-09 no-`docs/`-root
entry and the REQ-STATS-07 zero-state-row entry, both still framed as open errata whose documents
"disagree on a P1 path", when REQ v1.4 already carries both carve-outs.

| Item | Landed? | Evidence |
|---|---|---|
| §7.3 REQ-STATS-09 entry stale | **Yes** | The open-erratum bullet is gone; §7.3 is now a settled-record table and E-4 states the closure. Verified against REQ-STATS-09's *Given* on disk, which reads "in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure". The FSPEC's paraphrase at EC-09 and at D-9 is faithful to that sentence. |
| §7.3 REQ-STATS-07 entry stale | **Yes** | E-5 closes it, and BR-27 now quotes REQ-STATS-07 verbatim — "is not a gap but a normal row whose metrics report their zero states" — which is exactly the criterion's text on disk. The old "so the wording is raised as an erratum" clause is gone. |

The edit went further than the routed pair and closed the other three entries (E-1, E-2, E-3) after
re-grounding on REQ v1.4. I checked each closure against the REQ rather than taking the claim:

- **E-1** — REQ-STATS-04 scopes its harvested test to "no `CODE_REVIEW-{feature}-v{N}.md` file
  matching the version grammar remains"; REQ-STATS-06 names C-4's two basename grammars explicitly.
  Bare globs are gone upstream, so BR-11/BR-16 and their oracles AT-12/AT-17 stand.
- **E-2** — C-5 now carries the carve-out in its own words: "Discovering *which* phases have a
  post-mortem is carved out … That listing is this REQ's own (REQ-STATS-05); fidelity binds the
  `RESOLVED:` marker, not the discovery." §1 and BR-12 now cite that carve-out instead of arguing
  for it. Faithful.
- **E-3** — REQ-STATS-03 now names the out-of-catalogue form the pipeline writes
  (`CROSS-REVIEW-{role}-REVIEW-v{N}.md`) and settles it: "one label stands: a third bucket would be
  an independent rule C-5 forbids". BR-06 and D-8 reproduce that reasoning without softening it.
  AT-09 still pins the disposition on the real `docs/completed/pdlc-advisory-wave-gate/` directory,
  so the label change upstream did not orphan its oracle.

No routed item is left unlanded.

## Upstream Fidelity Re-check

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
