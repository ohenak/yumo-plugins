# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2

## Verification

Delta re-review. Base for the diff is `792f94a2d` (the commit carrying my v1); the document moved
under eight commits, `5df246e30`…`128b9cfb4`, 220 insertions / 62 deletions. I re-checked every
prior finding and read only the changed sections for new ones. Every new existing-code and
repository-path claim was checked against HEAD in one pass.

| v1 finding | Disposition |
|---|---|
| F-01 High — empty directory had two behaviours | **Resolved.** B5 narrows the gap branch to *unreadable*, BR-27 rewrites to match, EC-03 stands, and AT-26 pins the empty case in both modes. See F-04 below for the one loose end. |
| F-02 High — no carrier for an unclassified directory in JSON | **Resolved.** BR-23 takes a third top-level key `unclassified`, sibling to `features`, with the right rationale (an entry inside `features` would assert what BR-26 denies). AT-19 asserts the key set is exactly three and set-equality of the array. |
| F-03 High — halts asserted a driver classification that does not exist | **Resolved, and well.** §1's new paragraph names the boundary exactly where it lies, BR-12 states the basename match as this command's own, and the REQ's C-5 enumeration is raised as an erratum instead of being silently widened. |
| F-05 Medium — derived oracles in AT-10, AT-13 | **Resolved.** AT-10 reads `13`, AT-12 reads `4`, AT-13 reads `{phase: "PR", resolution: "resolved"}` as literals, plus a `RESOLVED: no` companion so a constant-returning implementation fails the pair. §6's preamble states the literal-not-derivation rule generally. |
| F-06 Medium — fleet human mode dropped information | **Resolved.** BR-18 carries a malformed count and `{n} ({r} resolved)`; D-7 records the reduction as exactly two; AT-06's fleet half pins it as exactly two. |
| F-07 Medium — BR-07 asserted nowhere | **Resolved.** AT-25. |
| F-08 Medium — AT-15 was containment, not set-equality | **Resolved.** Six spec types, three process families, distinct sizes, and a removal probe per member. |
| F-09 Medium — eight edge cases untested, no EC matrix | **Resolved.** §6.11 carries an EC-to-test table covering EC-01…EC-21, and AT-26/27/28 supply the missing oracles. One mapping is weak (F-05 below). |
| F-10, F-11, F-12, F-13, F-14 Low | **All resolved.** BR-05's near-miss note; EC-05 names the out-of-catalogue case; EC-19 names the non-dereferencing stat; EC-09 has one spelling; BR-13 names lexicographic collation. |

New claims checked against HEAD:

| New claim | Where checked | Result |
|---|---|---|
| The driver's basename parse rejects doc types outside a six-type catalogue as `bad_doc_type` (BR-06, BR-09, EC-05, D-8) | `REVIEW_DOC_TYPES`, `orchestrate-dev.js:10105-10112` — exactly `REQ, FSPEC, TSPEC, PLAN, PROPERTIES, DECISIONS`; rejection at `:10144` | Confirmed |
| Phase CR writes `CROSS-REVIEW-{role}-REVIEW-v{N}.md` (BR-06, D-8) | `orchestrate-dev.js:9245` (`const reviewFileType = roundDocType \|\| "REVIEW"`); the mechanism is documented at `:10051-10063` | Confirmed |
| Four such files sit in `docs/completed/pdlc-advisory-wave-gate/` (BR-06, AT-09) | Directory listing: `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` | Confirmed — exactly four |
| That directory's TSPEC row reads `6` (AT-09) | Listing: `product-manager` and `test-engineer` TSPEC cross-reviews both run `-v1`…`-v6` | Confirmed |
| The driver holds no phase-id catalogue this command could lean on; `POSTMORTEM-I-pdlc-headless-engine.md` exists (BR-12) | `docs/completed/pdlc-headless-engine/` carries `POSTMORTEM-{D,F,I,T}-…`; force-phase tokens omit `I` (`:7416`) | Confirmed |
| The driver constructs the post-mortem path and never parses a listing (§1, BR-12) | `orchestrate-dev.js:8618`, `:9402`, `:15293`; the only content rule is `parseResolvedMarker` `:7601` | Confirmed — this is the v1 F-03 gap, now stated rather than papered over |
| `pdlc doctor --dev` is accepted while a copied flag list is the trap (BR-01) | `FLAGS_BY_COMMAND.doctor = ["plugin-root","cwd","allow-api-key-billing","dev"]`, `pdlc/engine/bin/cli.mjs:184`; `validateFlags` `:198` | Confirmed — see F-03 |
| `docs/pdlc-halt-hardening/` carries only a PLAN (AT-18, EC-17) | Directory listing: `PLAN-pdlc-halt-hardening.md` only | Confirmed |
| The exclusion set is still set-equal to the non-feature directories at the `docs/` root (AT-18, BR-25) | `find docs -maxdepth 1 -type d`: `_constraints, _decisions, _queue, completed, design, discarded, ideas, requirements` — eight, matching BR-25's eight | Confirmed |
| AT-10's and AT-13's literals (AT-10, AT-13) | `CROSS-REVIEW-software-engineer-TSPEC-v13.md` is the sole survivor; `POSTMORTEM-PR-pdlc-wave-resume.md:3` is a line-leading `RESOLVED: yes` | Confirmed — both literals are correct measurements |
