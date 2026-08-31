# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.5)
**Date:** 2026-08-30
**Iteration:** 6
**Round type:** delta re-review under DECISION FREEZE
**Last reviewed commit:** `6b328e16a29bfc9a1d8fa16c01f1e2974d81fc49` (v5)
**Reviewed at:** `420edb564f4e0453c216f15d91fd8dd36f83307c`

## Context

**What moved in the document.** `git diff 6b328e16..HEAD` over the document is 50 insertions /
12 deletions across four commits (`29cd33a64`, `63f205e89`, `106531d42`, `420edb564`), all of
them DEC-DECLEDGER-16 and its header: the version bump to **v1.5** plus its changelog entry, the
narrative restatement of the provenance rule, the `## Decision` row, the PROPERTIES
`## Consequences` row, and the DEC-DECLEDGER-16 re-evaluation trigger. Nothing else in the file
moved — no other decision row, no other consequence, no risk, no trigger.

That is exactly the scope round 5 asked for, from both reviewers: my v5 F-02 (carried from v4)
and `pm-review`'s matching Medium said the ceiling rule was stated **positionally** ("only on the
larger side of an inequality") and so could not be run as a mechanical authoring check. The edit
answers that finding and declines to open anything else, which is what the freeze requires.

**What moved upstream.** Between `6b328e16` and HEAD, `TSPEC-pdlc-decision-ledger.md` advanced
eight commits from **v0.9** to **v1.2** (`452d72c07` erratum v1.0 homing the census constants,
`933fab196`, `36889291d`, `224d0bff1`, `54b17bf84` v1.1, `d7aee41ec`, `a3715ae0e`, `3a17387d6`
v1.2). REQ and FSPEC did **not** move: HEAD digests are `sha256:ce6b133f…3c7b7c` and
`sha256:2bd5c3ef…5aed39`, byte-identical to the `UPSTREAM-STATE` anchors v5 recorded. TSPEC's
digest is now `sha256:fc57bc56…c27504`.

So this round has two jobs, not one: check that the delta lands its own finding without breaking
an approved section, and check that a three-version upstream move has not silently falsified a
claim the document makes about TSPEC. The second is the larger risk — the delta's new prose is
unusually specific about what TSPEC HEAD contains, and the census-constant erratum (v1.0) changed
the very §7.3 machinery the document's DEC-DECLEDGER-09 row points at.
