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

Per DEC-ERR-03 I re-read the upstream text this FSPEC leans on, at its current version, rather than
only the routed list.

**Pin.** The header's Upstream field reads `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.4), and the file
on disk is v1.4 with the dispatched hash. The pin is current.

**Sites the edit touched, each checked against REQ v1.4:**

| FSPEC site | Claim about upstream | Upstream on disk | Faithful? |
|---|---|---|---|
| §1 fidelity anchor | C-5 carves post-mortem *discovery* out of fidelity because the driver classifies no `POSTMORTEM-*` basename | C-5 says exactly that, in those terms | Yes |
| BR-06 | REQ-STATS-03 names those basenames and settles the label; a third bucket is an independent rule C-5 forbids | REQ-STATS-03, final clauses | Yes |
| BR-12 | Post-mortem matching is this command's own, carved out by the constraint itself | C-5 carve-out sentence | Yes |
| BR-27 | Quotes REQ-STATS-07 on the zero-state row; gap branch reserved for unreadable directories | REQ-STATS-07 verbatim | Yes |
| EC-09 | REQ-STATS-09's *Given* scopes to a present, readable root and names root failure separately | REQ-STATS-09 *Given* | Yes |
| D-8 | REQ v1.4 accepted the malformed label for pipeline-authored names | REQ-STATS-03 | Yes |
| D-9 | REQ v1.4 carries the carve-out; behaviour unchanged | REQ-STATS-09 | Yes |

**Behaviour re-check.** I diffed the erratum commit range for any rule, exit code or acceptance-test
change. There is none: every changed hunk is rationale prose or the §7.3 record. Exit codes at
EC-09 (1), EC-11 (0/1), EC-03 (0) are byte-identical to the approved version, and no AT body, no
BR→AT trace row and no EC→AT trace row moved. The oracle set I approved at v7 is intact, so the
approved testability position is undisturbed.

**Two residual imprecisions**, both inside the new §7.3 table, neither behavioural:

1. **E-5 cites the wrong oracle.** Its "FSPEC sites that stand unchanged" column reads
   "BR-27, AT-19". AT-19 is *the exclusion set is asserted, not assumed* — it pins BR-23/BR-26/EC-10,
   not the zero-state row. The oracles that actually stand behind E-5's subject are **AT-26** (the
   FSPEC's own EC-03 trace row maps EC-03 → AT-26) and **AT-20** (gap rows are rows), which is also
   what §8's BR-27 row says: `BR-27 | AT-20, AT-26, AT-27`. A reader auditing "which test proves the
   empty directory is a row, not a gap" is sent to a test that does not prove it. Fix is one token
   swap in the E-5 row; nothing else moves.
2. **The two "remaining" Low findings read as settled upstream.** §7.3's closing paragraph says
   REQ-STATS-02's state enumeration over-distributes and REQ-STATS-08's conjunct (b) lost its list
   separator, "remain recorded but route nowhere". On REQ v1.4 both read as repaired: REQ-STATS-02
   now distributes malformed/unmeasurable to REQ-STATS-03 and harvested to REQ-STATS-03/04/06, which
   is the intended reading; REQ-STATS-08 conjunct (b) carries its separators ("…, issues no network
   request, and runs no `git` write command"). This is the same staleness class the round was opened
   to remove, one paragraph below where it was removed.

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
