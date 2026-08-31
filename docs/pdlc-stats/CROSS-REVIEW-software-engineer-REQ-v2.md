# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 2

**Delta base:** `fed7325de` (the commit carrying v1 of this review) → `HEAD`. Reviewed by
`git diff fed7325de..HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md` (166 insertions, 159 deletions);
unchanged sections already accepted in v1 were not re-litigated.

## Prior-finding disposition (v1)

| v1 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | REQ-STATS-03 now names the outcome — "the highest round index present on disk for that document type, taken across all roles" — instead of equating the count to the driver's *round window*. No off-by-one is left to inherit from `deriveRoundWindow`'s `{startIndex, endIndex}` upcoming-budget pair (`pdlc/workflows/orchestrate-dev.js:10192`). |
| F-02 | High | **Resolved** | C-2 no longer attributes the two-location preference to `CLAUDE.md`; it claims the order as this REQ's own decision and re-points the archive evidence at `pdlc/OPERATIONS.md:146` ("`docs/*/LEARNINGS-*.md` and `docs/completed/*/LEARNINGS-*.md`") — verified verbatim — plus `docs/completed/REQ-completed.md`, which exists. `CLAUDE.md` still contains zero occurrences of `completed`, exactly as C-2 now states. |
| F-03 | High | **Resolved** | REQ-STATS-07 declares the exclusion set "fixed, this-REQ-owned" rather than citing `CLAUDE.md`/`pdlc/OPERATIONS.md` for directories they never name. |
| F-04 | High | **Resolved** | `docs/completed/` is now in the exclusion set and typed correctly as a *container* — traversed for children, never itself a row — which is the precise fix for the phantom `completed` feature. The added "directories only" rule also covers the loose file I flagged: `docs/PLAN-pdlc-integration-boundary-gates.md` is still the only `.md` at the `docs/` root and is now unambiguously not a feature. Checked against the live tree: the eight excluded names are set-equal to the non-feature directories actually present under `docs/`. |
| F-05 | Medium | **Resolved** | C-5 is widened from round counts to *every* parsing rule the command re-reads, and REQ-STATS-05 now defers marker matching wholesale instead of restating `RESOLVED: yes`. The fenced-block qualifier I asked for is inherited rather than duplicated — the better fix (see F-03 below for a small factual wrinkle in how C-5 describes it). |
| F-06 | Medium | **Resolved** | REQ-STATS-03 fixes aggregation explicitly: one number per document type, not per role, max across roles, with a worked example (5 and 3 report `5`). |
| F-07 | Medium | **Resolved** | The refusal state is now specified as **unmeasurable**, naming the colliding role — which matches what the driver actually returns: `{ok: false, reason: "malformed_round_one_duplicate", role}` (`pdlc/workflows/orchestrate-dev.js:10225-10231`), so the role is available to report. |
| F-08 | Low | **Resolved** | Malformed reporting is now scoped to basenames that begin `CROSS-REVIEW-`, with ordinary artifacts explicitly "neither counted nor called malformed" — matching `parseReviewFilename`'s `not_cross_review` short-circuit (`pdlc/workflows/orchestrate-dev.js:10135-10137`) versus its four genuine grammar rejections. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | REQ-STATS-04's new malformed clause has no driver-side classification to defer to, so it breaches C-5 and specifies a divergence. It says a basename "beginning `CODE_REVIEW-` that fails the version grammar (C-5) is excluded and reported malformed, on REQ-STATS-03's terms." But the pipeline's only DoD basename parser is `deriveDodRoundIndex` (`pdlc/workflows/orchestrate-dev.js:12384-12396`), whose single regex is built at `:12387` and whose loop does `if (!match) continue;` — a name starting `CODE_REVIEW-` that fails the pattern is skipped **identically** to any unrelated file. There is no `bad_round`/`trailing_junk` equivalent on the DoD side; the rich reason catalogue exists only for cross-reviews (`parseReviewFilename`, `:10133-10163`). Two consequences: (a) implementing "reported malformed" requires inventing a new parsing rule — the exact thing C-5's last-but-one sentence forbids ("This REQ defines no new, separate parsing rule for any of them"); (b) "on REQ-STATS-03's terms" imports the cross-review round grammar's strictness, which the DoD grammar does not share — cross-review rounds are `[1-9][0-9]*` (`:10095`, leading zeros are `bad_round`) whereas the DoD pattern is `v(\d+)` (`:12387`), which **accepts** `v0` and `v01`. So `CODE_REVIEW-{feature}-v01.md` is a legitimate round to the driver and "malformed" to `pdlc stats` — a reported classification diverging from the driver's on the same bytes, which is precisely what C-5 exists to prevent. Fix (either direction, both cheap): drop the malformed clause from REQ-STATS-04 and state that a non-matching `CODE_REVIEW-*` name simply does not contribute (matching the driver), **or** keep the clause and have C-5 acknowledge that the DoD malformed notion is this REQ's own addition, with the round-token rule named as the driver's `\d+` rather than "REQ-STATS-03's terms". | REQ-STATS-04, C-5 |
| F-02 | Medium | Local | REQ-STATS-06's harvested rationale is factually wrong about what harvest deletes, and the error is load-bearing for a P0 metric. It says the ratio is "reported harvested, not measured — its numerator was deleted." Harvest deletes only cross-reviews and DoD reviews: `pdlc/skills/harvest-learnings/SKILL.md:28` ("delete the `CROSS-REVIEW-*` and `CODE_REVIEW-*` files"), repeated at `:59`, `:128`, `:129`. POSTMORTEM files are read and distilled but never deleted — `:77`'s metadata row loosely lists them as "now deleted", yet no step deletes them, and this REQ's own REQ-STATS-05 correctly assumes they survive (it defines no harvested state). So for a harvested feature that halted, the C-4 numerator retains real post-mortem bytes and the C-3 denominator is fully intact: a genuine, if partial, number exists. Suppressing the ratio may still be the right call (the deleted cross-reviews make it incomparable to a live feature's), but the stated reason is not the true one, and R-6 leans on it for the whole `docs/completed/` baseline. Fix: keep the harvested outcome, restate the reason as "the numerator is *partially* deleted — cross-reviews and DoD reviews are removed at harvest while post-mortems survive — so the value would silently undercount rather than being absent". | REQ-STATS-06, R-6, C-4 |
| F-03 | Low | Local | C-5's closing sentence mis-describes one of the three properties it makes binding: "the `RESOLVED:` marker's case-insensitivity". In `parseResolvedMarker` (`pdlc/workflows/orchestrate-dev.js:7601-7614`) only the *value* is case-folded (`values[0].toLowerCase()`, `:7611`); the marker keyword itself is matched by `/^\s*RESOLVED:\s*(\S*)\s*$/` (`:7604`) with no `i` flag, so `Resolved: yes` is not a marker at all. The other two properties check out exactly as written — single-marker (`values.length > 1` ⇒ `duplicated`, `:7609`) and outside-a-fenced-block (the scan runs through `scanLines`, `:7602`). Because C-5 defers the rule wholesale rather than restating it, no implementation diverges from this; the sentence is a descriptive aside, which is why this is Low and not High. Fix: "the `RESOLVED:` marker's case-insensitive *value* matching". | C-5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ-STATS-04 says "REQ-STATS-03's harvested state is reported here too, rather than `0`". Read strictly, "rather than `0`" scopes the harvested state to the case where no `CODE_REVIEW-*` file is found — which is the sane reading. But harvest's ordering (`pdlc/skills/harvest-learnings/SKILL.md:28`) deletes cross-reviews and DoD reviews in the *same* commit, so a tree interrupted between them (or a hand-edited archive) can have `LEARNINGS` present, zero cross-reviews and a surviving `CODE_REVIEW-{feature}-v2.md`. Does the harvested state win, or does the measurable `2` win? One clause in REQ-STATS-04 settles it; otherwise FSPEC will pick. |
| Q-02 | REQ-STATS-02 requires the JSON top-level key set to be "set-equal to REQ-STATS-01's printed metric set plus one schema-version field". REQ-STATS-01 names four metrics, but REQ-STATS-03/04/07 also require malformed, unmeasurable, harvested and gap-flagged *states* to be reported. Are those states carried inside the four metric values (so the key set really is 4 + 1), or are they separate top-level keys (so the set-equality oracle needs a longer enumeration)? The set-equality framing is the right instinct — it just needs to name the set it is equal to unambiguously. |
| Q-03 | REQ-STATS-08 conjunct (b) requires the tree "set-equal before and after by path and modification time". `docs/` is inside a git working tree; does this include ignored/untracked paths (a `node_modules/`, a tool cache)? Cheap to answer now, and worth answering: this repo has already been bitten by a document oracle walking untracked files (see `CLAUDE.md`'s debugging note on `coveredViolations`). |

## Positive Observations

- The v1 fixes landed as *outcome* statements rather than as mechanics, which is the harder discipline. REQ-STATS-03's "highest round index present on disk for that document type, taken across all roles" plus a worked example (5 and 3 report `5`) is implementable without a single line of TSPEC, and it does not smuggle in `deriveRoundWindow`'s upcoming-budget semantics.
- REQ-STATS-07's exclusion set was re-derived, not just patched. I checked it against the live tree: the eight excluded names are exactly the non-feature directories present under `docs/` today, `docs/completed/` is typed as a container rather than an exclusion (a distinction that matters — excluding it outright would have hidden thirteen archived features), and "directories only" retires the loose-file case without needing to name the file.
- The **unmeasurable** state (F-07's fix) is better than what I asked for. I asked for *some* stated outcome; the REQ names the state, requires the colliding role be printed, and that role is exactly what the driver already hands back (`orchestrate-dev.js:10225-10231`). An operator gets a fixable message rather than a blank cell.
- The **harvested** state (new in v2, with R-6) is a genuine find the review round did not ask for. `docs/completed/` is where the baseline corpus lives and it is almost entirely harvested; reporting a measured `0` there would have made the first baseline look like the pipeline never reviewed anything. Distinguishing it from `0` is the difference between a usable measurement tool and a misleading one. F-02 above is a correction to one sentence of its rationale, not to the state itself.
- C-5's widening (F-05's fix) is the strongest edit in the diff. Naming the three re-read rules explicitly and then declining to restate any of them — verified against `parseResolvedMarker`, whose fenced-block and single-marker behaviour C-5 now inherits for free — means the measurement tool cannot drift from the thing it measures without someone editing the driver. F-01 is precisely a case where an AC slipped out from under that constraint, which is why it is worth fixing rather than waiving.

## Recommendation

**Needs revision** — on one High finding, with a narrow and mechanical path to approval.

All eight v1 findings are resolved, and four of them (the Highs) are resolved well: the two
nonexistent-authority citations are repaired against files I re-read, the `docs/completed/` phantom
feature is closed by typing the directory as a container, and REQ-STATS-03 now states an outcome
rather than borrowing the driver's round window. The revision also went past its brief in a way
that improves the feature — the harvested state and R-6 are new, correct, and they are what make a
baseline over `docs/completed/` mean anything.

F-01 is the one blocker, and it is a single clause. REQ-STATS-04 acquired a malformed-basename
requirement this round that has no counterpart in the pipeline's DoD parser: `deriveDodRoundIndex`
skips a non-matching `CODE_REVIEW-*` name exactly as it skips an unrelated file, and its `v(\d+)`
accepts the leading-zero forms that "REQ-STATS-03's terms" would call malformed. Either drop the
clause (a non-matching name simply does not contribute — this matches the driver and costs nothing,
since DoD reviews are engine-written and the malformed case is close to hypothetical) or keep it and
have C-5 own it as this REQ's own addition with the round token named as `\d+`. Both are one-sentence
edits; I have no preference between them.

F-02 is a Medium worth taking in the same pass because it is one sentence in the same neighbourhood:
keep REQ-STATS-06's harvested outcome, but state the true reason — harvest deletes cross-reviews and
DoD reviews while post-mortems survive, so the ratio would undercount rather than be absent. F-03 is
a three-word correction to C-5's closing aside. The three Questions do not gate; Q-01 and Q-02 are
each one clause if the author would rather settle them here than let FSPEC pick.

No structural rework is needed and nothing in the v1-approved material regressed. I expect v3 to
converge on the first read.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
