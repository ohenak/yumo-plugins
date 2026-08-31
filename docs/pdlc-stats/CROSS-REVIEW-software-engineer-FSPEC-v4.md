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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **Flow C3 now routes a refusal that Flow A never raises.** C3's outcome column gained "and single-feature unreadable-feature paths", and BR-20, BR-29, BR-30, EC-11 and D-10 all agree the path exists and exits 1. Flow A does not produce it: A2 branches on root readability ("the refusal renders through Flow C"), A3 branches on directory existence (same clause), and A4 — "List the artifact files directly in the resolved directory" — has decision point `—` and outcome `A5`, i.e. listing cannot fail. So §3 describes a single-feature run in which the third `reason` value is unreachable, while §5 and §6 assert it. An implementer building from the flow table (the section written to be built from) ships two `reason` values and passes every test but AT-27's new leg. The other two refusal paths were each given a branch in this same edit; A4 is the one that did not get one. Give A4 a decision point ("Is the resolved directory readable?") with the EC-11 / `unreadable_feature` outcome, in the phrasing A2 and A3 now share. | §3.1 A4, Flow C3, EC-11, D-10 |
| F-02 | Low | Local | **AT-27's new `unreadable_feature` leg asserts containment where its three sibling legs assert set-equality.** The root-failure legs assert stdout "parses as BR-30's error object with top-level keys exactly `schemaVersion`, `error`, `feature`", and AT-23 asserts "three, no more" plus `error` carrying exactly `reason` and `message`. The new leg asserts only that stdout "parses as BR-30's error object, `error.reason` exactly `unreadable_feature`, `feature` the supplied name". An implementation that leaks a fourth key (a partial `metrics` object left over from the aborted computation — plausible precisely on this path, since it is the only refusal raised *after* metric computation begins) passes this leg and fails none. Reuse the sibling clause verbatim: "top-level keys exactly `schemaVersion`, `error`, `feature`". | AT-27 (`unreadable_feature` leg), AT-23, BR-30 |
| F-03 | Low | Local | **AT-20's new leg asserts a path Flow B does not describe.** The leg says "B5's read failure and EC-21's catch-all are different paths: only this leg fails an implementation whose guard is around the read alone" — a good distinction, and EC-21's row supports it ("*any* unexpected failure while computing one feature's metrics"). But B5's decision point is the read alone: "Could the directory not be **read** (permissions, or it is not a readable directory)? Yes → a gap row… No → a normal row". Under the flow as written, a metric computation that throws in A5–A8 has no defined outcome; under EC-21 and AT-20 it is a gap row at exit 0. Same shape as F-01 and the same one-clause fix: B5's Yes-branch should read "could not be read **or** its metrics could not be computed (EC-21)". | §3.2 B5, EC-21, AT-20 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Carried from v1–v3, unchanged and still cheap.) BR-13 names lexicographic collation and AT-14b pins `P, PR` as the case that depends on it. Byte-wise, or locale-sensitive? AT-14b's literals are stable either way for these inputs, so no test catches the difference, but a locale-sensitive comparison is the run-to-run instability BR-13's stability claim is about. One clause in BR-13 ("byte-wise, locale-independent") retires it. |
| Q-02 | (Carried from v3, now with three values at stake.) BR-30 calls the error object "a released shape under REQ R-5" governed by BR-24's increment rule. This round added a `reason` value. Did that bump `schemaVersion`, or does the enum grow freely until a *key* changes? If the success document and the error object share one counter, adding `unreadable_feature` is a version event a consumer of the success document reads; if they do not, `schemaVersion` means two things. TSPEC material, but the answer is BR-24's wording. |
| Q-03 | AT-27's new leg induces "a feature directory that cannot be read", and AT-20's new leg induces "computing its metrics fails unexpectedly". The first is a mode bit; the second needs either a fault seam or a fixture that provokes a real throw. Is there an intended shape for the second (a file the metric readers choke on, rather than injected failure), or is that left to TSPEC? Asking because a leg with no inducible fixture tends to be quietly deleted rather than written. |

## Positive Observations

- **The round found a false code claim I had confirmed the wrong half of and fixed it unasked.**
  v1.2's AT-24 said `--dry-run` "is in no command's list". It is in `dev`'s row
  (`pdlc/engine/bin/cli.mjs:169`) and in `queue`'s (`:174`). I verified `doctor`'s row three rounds
  running and never checked the universal claim beside it. The new text says the true and narrower
  thing — "which `doctor`'s row does not carry" — which is also the only thing AT-24's rationale
  needs. A spec correcting a code claim its reviewer had waved through is the behaviour that keeps
  §6 trustworthy.
- **F-01 was answered by enumerating the product instead of choosing four cells.** I asked the
  author to say which four runs AT-27 covers. The document instead ran all eight and named the axes
  inline, so the leg cannot silently shrink: a future author dropping a cell has to delete a stated
  factor rather than reinterpret a count word. Same instinct as BR-20's always-but-one rewrite two
  rounds ago — fix the shape, not the instance.
- **D-10 is the decision the round actually needed, and it refuses the cheap answer.** The
  alternative — a second BR-20 exception for the unreadable-feature path — was available and
  smaller. D-10 rejects it in one sentence with the right reason: "a second exception would make
  BR-20's guarantee path-by-path again — the rot it was rewritten to prevent". The document is now
  defending an invariant it established, against itself, one round later.
- **AT-27's `feature`-name conjunct carries its own falsifier.** "D-9's carve-out turns on that
  name, so hardcoding `null` on every root failure must fail here" states the implementation the
  assertion exists to kill. That sentence is what stops the conjunct being simplified away by
  someone who reads `null` as the obvious value for an error document.
- **AT-14 grew to four features rather than adding a second test.** Absent, duplicated and
  unparseable markers plus the no-file case are asserted in one run, with the risk ranked in the
  text. EC-14's matrix row went from over-claiming to exactly true without a new AT number and
  without touching the assertion form.

## Recommendation

**Approved with minor changes**

Both v3 Mediums and all three Lows are closed, two of them more thoroughly than asked: AT-27 runs
the full eight-cell product rather than a chosen four, and AT-14 covers all three of EC-14's
conditions in one fixture. The round's own new material — a third `reason` value, `unreadable_feature`,
recorded at D-10 and threaded through BR-20, BR-29, BR-30, EC-11, AT-27 and the BR-29/BR-30 coverage
rows — is coherent everywhere I checked it, and the one existing-code claim it touched was corrected
against HEAD rather than repeated.

What remains is one Medium and two Lows, all of the same kind and none behavioural: §3's flow tables
lag the paths §5 and §6 now assert. F-01 — Flow C3 routes a single-feature unreadable-feature
refusal that Flow A's A4 cannot raise, so an implementer building from the flow ships two `reason`
values, not three. F-03 — the same gap at B5 for EC-21's catch-all, which AT-20's new leg explicitly
distinguishes from the read failure B5 does branch on. F-02 — AT-27's new leg asserts key containment
where its three siblings assert set-equality, and the leaked-key risk is realest on exactly this
path, the only refusal raised after metric computation starts. Each is one clause.

No High finding is open, old or new, and nothing in a section I had approved regressed.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
