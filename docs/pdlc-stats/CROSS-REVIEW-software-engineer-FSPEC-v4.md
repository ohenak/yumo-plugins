# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.3)
**Date:** 2026-08-31
**Iteration:** 4

## Verification

Delta re-review against `c3ee2c0ef` (the commit carrying the bytes I reviewed at v3). The document
moved under one commit, `32a23e013`, 42 insertions / 29 deletions. I re-checked each v3 finding,
scanned only the changed sections for new issues, and re-verified at HEAD every repository claim the
round touched.

| v3 finding | Disposition |
|---|---|
| F-01 Medium — AT-27's root leg said "all four runs" while naming three axes | **Resolved, by stating the full product rather than picking four.** The leg now reads "over the eight root-failure runs — {absent, unreadable} × {single-feature, fleet} × {human, `--json`}" and says which conjunct holds where: stderr clauses on all eight, the error-object shape in the four `--json` runs. Nothing is left to an implementer's guess, and EC-09's own "both modes and both conditions" claim is now covered rather than partly covered. |
| F-02 Medium — BR-30's non-null `feature` on a single-feature root failure had no oracle | **Resolved, with the failure mode named.** AT-27 now asserts `feature` is "the supplied name in the single-feature runs and `null` in the fleet runs", and states why it is the conjunct that matters: "D-9's carve-out turns on that name, so hardcoding `null` on every root failure must fail here". That is exactly the implementation slip I described — the root failure raised before the feature argument is read. |
| F-03 Low — §7.3's intro said "two" over three bullets | **Resolved.** The intro is now "Three more bullets follow… the first two against criterion *wording*…, the third collecting two wording findings no FSPEC behaviour turns on", and three bullets follow it. The count and the grouping now both parse. |
| F-04 Low — EC-14 marked covered while two of its three conditions lost their oracle | **Resolved at full width.** AT-14's Given carries absent, duplicated **and** unparseable markers, all four features asserted in one run, and the test text names which condition carries the risk ("absent is the one a naive implementation reads as `resolved`"). EC-14's matrix row can now be believed. |
| F-05 Low — BR-29's exit-1 enumeration named only the unreadable half of the root failure | **Resolved, and extended.** BR-29 now reads "unknown feature, missing or unreadable `docs/` root, unreadable feature directory in single-feature mode" — the third clause is this round's new path, added to the catalogue in the same edit that created it, and BR-29's coverage row gained AT-27. |

Claims introduced or moved this round, checked at HEAD:

| Claim | Checked against | Result |
|---|---|---|
| AT-24: `--dry-run` is a token "which `doctor`'s row does not carry" (v1.2 said "in no command's list") | `pdlc/engine/bin/cli.mjs:169`, `:174`, `:184` | **The correction was needed and is right.** `--dry-run` *is* in `dev`'s row (`:169`) and in `queue`'s (`:174`); it is absent from `doctor`'s (`:184`). The old wording was false; the new one is true and still carries AT-24's teeth, since the copied-`doctor`-row failure mode is what the test exists to catch. Caught without being asked. |
| BR-12's fail-closed reading covers an absent marker, so AT-14's new absent leg has a rule to assert against | FSPEC BR-12 ("an unreadable or absent marker classifies as `open`") | Confirmed — the new leg pins a rule the document already states, not a new one. |
| `docs/completed/pdlc-headless-engine/` still carries exactly `POSTMORTEM-{D,F,I,T}-…` (AT-14b, unchanged this round) | directory listing | Still four, no fifth. |
