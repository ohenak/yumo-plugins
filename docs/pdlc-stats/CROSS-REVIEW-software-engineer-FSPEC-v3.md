# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.2)
**Date:** 2026-08-31
**Iteration:** 3

## Verification

Delta re-review against `128b9cfb4` (the commit carrying the bytes I reviewed at v2). The document
moved under seven commits, `826d8d6ff`…`c3ee2c0ef`, 107 insertions / 40 deletions. I re-checked each
v2 finding, then scanned only the changed sections for new issues, and re-verified every
repository-path claim the round touched in one pass.

| v2 finding | Disposition |
|---|---|
| F-01 High — `docs/`-root failure had no defined stdout in `--json` mode | **Resolved, and better than asked.** BR-20 is restated as always-but-one ("every path but a usage error"), with the reason the enumeration form was the wrong shape — a later failure path with no stdout decision silently breaks the guarantee. BR-30 grew from prose into a pinned three-key shape (`schemaVersion`, `error`, `feature`) with a two-value `reason` enum (`not_found`, `no_docs_root`), EC-09 names which value it emits, flow step C3 now routes refusals through the serializer explicitly, and AT-27's root leg asserts stdout's *content*, not its non-report-ness. The hole is closed at the rule, the edge case, the flow and the test. |
| F-02 Medium — EC-09 departed from REQ-STATS-09 with neither decision nor erratum | **Resolved.** D-9 records the question, the decision and the reason (§3.1 A2 exits before A3 can resolve a feature; "there is no `docs/` root here" beats a spelling-check invitation), and §7.3 raises the REQ wording as an erratum. The §2.1 coverage row now reads `AT-27 (root leg, per D-9)`, so the divergence is visible from the traceability table rather than only from prose. |
| F-03 Medium — AT-24 tested no token BR-01 actually singles out | **Resolved.** `--dev` and `--plugin-root` are now the leading rejected tokens, with the failure mode named in the test text: a `FLAGS_BY_COMMAND` row copied from `doctor` accepts both and still refuses `--dry-run`. I re-confirmed `doctor`'s row is `["plugin-root","cwd","allow-api-key-billing","dev"]` at `pdlc/engine/bin/cli.mjs:184`. The test can now fail in the one way the rule exists to prevent. |
| F-04 Medium — BR-27's narrowing unreconciled with REQ-STATS-07 | **Resolved.** BR-27 carries the reconciling sentence (missing artifacts are a measured row, only unreadability is a gap, nothing the criterion protects is lost), and §7.3 raises the wording. |
| F-05 Low — EC-21 cited AT-27, which exercises no such failure | **Resolved.** EC-21 now maps to AT-20, and EC-21's own text ("one unreadable feature never suppresses the fleet report") is exactly AT-20's Given. |
| F-06 Low — AT-15's link member made the enumeration probe platform-skippable | **Resolved by the cheaper fix.** Rather than splitting the test, AT-15 now states that the link leg alone may be skipped and that the enumeration and removal-probe legs run with a regular file in that member's place. The set-equality probe survives a platform that cannot carry links, which was the point. |

Claims introduced or moved this round, checked at HEAD:

| Claim | Checked against | Result |
|---|---|---|
| `docs/completed/pdlc-headless-engine/` carries `POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md` — four post-mortems, four distinct phases (AT-14b) | directory listing | Confirmed, exactly four, no fifth |
| `docs/completed/pdlc-wave-resume/` carries exactly one post-mortem, `POSTMORTEM-PR-…` (AT-13) | directory listing | Confirmed — which is why AT-13's move to a copied temp root is right: the second file it needs is added to the copy, never to the repository |
| `doctor`'s flag row is `["plugin-root","cwd","allow-api-key-billing","dev"]` (AT-24) | `pdlc/engine/bin/cli.mjs:184` | Confirmed |
| Lexicographic ascending over `D, F, I, T` yields `D, F, I, T`, and over `P, PR` yields `P, PR` (AT-14b, BR-13) | BR-13's stated collation | Confirmed; the second leg is the one that can fail |
