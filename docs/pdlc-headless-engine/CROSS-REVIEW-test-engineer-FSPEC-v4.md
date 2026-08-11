# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.3)
**Date:** 2026-08-11
**Iteration:** 4
**Scope:** delta re-review of the v1.2→v1.3 revision (`git diff e1bdbcc0..HEAD`, +102/−51 across
§0, §1, §2, §3.2/§3.3/§3.4/§3.5, §4.1/§4.4/§4.5/§4.6, §6.4, §8.1/§8.6, §9.4, §10.2, §10.3, §11.2,
§12.1, §13.1, §14.1, §17.2, §18.3). Verification of the one High and eight Medium/Low findings of
v3; new-issue scan restricted to those changed sections.

## v3 findings disposition

| v3 | Sev | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 §4.4 kept Direction B as report-not-refuse while REQ v0.8 rescoped AC-3.5 | High | **Resolved** | §4.4 now states equality over the modules-derived dispatchable subset, both directions failing closed; §6.4 ranges over the same set; §13.1 O-ENG-1 restated as "resolved by rescoping, not weakening"; EC-START-7 rewritten as the out-of-set case and EC-START-9 added for the in-set reverse case; AT-ENG-10 now pins all three fixtures |
| F-02 §2's AC-4.1 pointer named §12.4 | Medium | **Resolved** | §2 now cites §8.1, AT-ENG-33 |
| F-03 §14.1 did not trace AC-2.1's diagnostic half; O-ENG-5 cell stale | Medium | **Resolved** | §14.1 AC-2.1 row splits mapping (§5.1) from diagnostic surface (§4.1, §4.6) and adds AT-ENG-09/11/24; BR-START-3 names the three fields; AT-ENG-09 asserts them with zero dispatches; O-ENG-5's cell rewritten to AC-2.1's authority |
| F-04 four in-body references to open errata | Low | **Resolved** | §1 line 77, §10.3 line 1018, §11.2 line 1079 all now read "resolved in REQ v0.8"; §4.4/§6.4's erratum rationale deleted. Remaining `erratum` hits are historical change notes and §13.1's own preamble |
| F-05 rung-0 usage errors vs BR-REP-0's one report line | Medium | **Resolved** | BR-REP-0a added (§12.1) drawing the usage-error/refusal boundary; AT-ENG-05 asserts the split |
| F-06 BR-START-2 silent about rung 0 | Medium | **Resolved** | §4.1 brings rung 0 inside the rule for refusals and outside it for usage errors, `doctor` inheriting both; AT-ENG-06 extended to the rung-0 refusal under `dev` and `doctor` |
| F-07 BR-FAIL-1's forward direction corpus-scoped | Medium | **Resolved** | §8.1 forward direction now accumulates suite-wide through one observed seam, explicitly on BR-MSG-1's device, with the "corpus could never observe a seventh" rationale; AT-ENG-33 carries the third clause |
| F-08 EC-GUARD-4's three message obligations unasserted | Medium | **Resolved** | AT-ENG-43 now names all three (missing capability, fallback named, selection unavailable) |
| F-09 AT-ENG-37 read equality against a jittered cell | Low | **Resolved** | AT-ENG-37 asserts `[d, d+1000]` ms, matching BR-RETRY-3's "jitter of at most 1 s, never subtracted" (§8.2 line 767) |

**Upstream and code claims added this round, checked at HEAD.** Every citation the delta introduced
is exact: `pdlc/engine/bin/pdlc.mjs:62-75` really is `positionals()` skipping any `--` token (so
§3.2's "an unknown flag runs live today" red state is real); `:208-215` is the one-line/last-line
comment and `:235` the `console.log(JSON.stringify(stamped))`; `:251-258` and `:280-286` are the
`dev`/`queue` startup-refusal returns that print to stderr and never reach `emitReport`, so
EC-REP-1's refusal half is red exactly as §12.1 now says; `pdlc/engine/lib/startup.mjs:20` is the
frozen 17-name `EXPECTED_SKILLS` list; `REQ-pdlc-headless-engine.md:493-507` is AC-3.5 with the
rescoping sentence at `:500-503` and the 10/12/5 counts at `:504-506`; `orchestrate-dev.js:6190`
appends `APPROVAL-HASH:`/`REVIEWED-COMMIT:` via `_appendFile` after the `:6113` pre-count, so
BR-PARITY-5's new exception is right. BR-EXIT-3's new "always the last iteration" clause agrees
with BR-LOOP-4's stop-on-refusal row (§11.2 line 1092).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **BR-REP-0a's parenthetical claims HEAD already behaves this way for EC-CLI-1/2/5, but only EC-CLI-1 and EC-CLI-2 are green at HEAD; EC-CLI-5 is red, and the cited range covers neither of the two green paths in full.** At HEAD a value flag with no value does not produce a usage error: `readFlag` returns `argv[i + 1] ?? ""` (`pdlc/engine/bin/pdlc.mjs:51`), so `pdlc dev REQ.md --cwd` silently proceeds with an empty cwd — precisely the "never silently treated as empty" that EC-CLI-5 forbids. The unknown-command path is at `:347-350`, and the missing-positional block is `:244-249`; `:243-247` is neither exactly. Test consequence: a test author reading the parenthetical schedules AT-ENG-05's EC-CLI-5 case as a characterisation test (green, no change needed) when it is a red-to-green task, and the neighbouring §3.2 red note for unknown flags makes the omission look deliberate. Fix: narrow the parenthetical to EC-CLI-1 (`:347-350`) and EC-CLI-2 (`:244-249`), and add one clause marking EC-CLI-5 red at HEAD with `:51` as the evidence — the same treatment §3.2 already gives the unknown-flag gap. | §12.1 (BR-REP-0a), §3.4 |
| F-02 | Low | Local | **EC-CLI-1's no-report-line half is pinned by no acceptance test.** BR-REP-0a ranges over EC-CLI-1/2/5, but AT-ENG-05's enumeration starts at EC-CLI-2 (`EC-CLI-2…EC-CLI-7`), so the unknown-command case — the one a cron wrapper most plausibly hits on a typo'd invocation — has no test asserting usage-on-stderr, exit `1`, and no report line. Either extend AT-ENG-05 to `EC-CLI-1…EC-CLI-7` or name EC-CLI-1 in its parenthetical alongside EC-CLI-2 and EC-CLI-5. | §3.5 (AT-ENG-05), §12.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §14.1's AC-2.1 row now traces AT-ENG-24, which asserts `--dry-run`'s zero-dispatch posture rather than `doctor`'s. AT-ENG-09 already carries "with zero dispatches attempted" for `doctor`, so AT-ENG-24 reads as adjacent evidence rather than AC-2.1 coverage. Is it there to pin the shared "attempted dispatch is a failure" seam both surfaces rely on? If so one clause in the row would stop a later reader from deleting it as a mis-trace. (My v3 finding suggested the trio, so this is my ambiguity to clear, not a defect the revision introduced.) |

## Positive Observations

- The High is resolved the way I hoped rather than the way that was cheapest: §4.4 does not merely
  restate REQ v0.8's words, it derives the two testable consequences — EC-START-9 as a new in-set
  reverse-direction case and EC-START-7 rewritten as the *out-of-set* case — so the distinction a
  test must encode ("membership of the modules-derived set, never a judgement about the file") is
  now stated as a fixture rule. AT-ENG-10's three fixtures are exactly the three the rescoped AC can
  fail on, and §18.3 lists the skill-set equality among the suite's both-directions obligations, so
  the reverse direction can no longer be quietly dropped to containment.
- BR-PARITY-5's approval-anchor exception is the strongest correction in the delta and nobody asked
  for it. The old text told the hermetic double to write everything clauses 1–3 observe, which would
  have made clause 3 assert the fixture's own bytes; the revision traces the anchors to the module's
  `_appendFile` at `orchestrate-dev.js:6190` and tells the double *not* to write them. That is a
  self-caught vacuous oracle — the exact failure mode this document elsewhere spends paragraphs
  guarding against.
- §8.1's forward direction is now falsifiable. "Every classification the suite observes" accumulated
  through one seam, explicitly modelled on BR-MSG-1, with the sentence naming why the corpus-scoped
  version could never observe a seventh member, is a set-equality a mutation could actually break.
- §12.1 volunteers that EC-REP-1's refusal half is red at HEAD, with both return sites cited. The
  revision could have left the section reading as green convention; instead it tells the plan author
  that AT-ENG-68 starts half-red. Same discipline in §3.2 for the unknown-flag gap.

## Recommendation

**Approved with minor changes**

The High is gone, and gone at the root: the FSPEC's §4.4, §6.4, §13.1, §14.1, §18.3 and its two
edge-case rows now say the same thing as REQ v0.8's AC-3.5 — equality over the modules-derived
dispatchable subset, both directions failing closed — and AT-ENG-10 pins the non-refusal only where
the rescoped AC actually permits it. The contract-fidelity divergence and the false-green oracle
attached to it are both closed. All eight remaining v3 findings, including the five carried from v2
that the previous revision had left untouched, are resolved with observable oracles rather than
wording changes: a jitter interval instead of an equality against a jittered cell, three named
message obligations instead of a posture assertion, suite-wide accumulation instead of a corpus.

Nothing in the delta broke a section that was sound in v1.2. Every citation the revision added is
exact at HEAD — I checked each one, including the two that assert *red* states — and the AT set
remains contiguous with the new cases folded into existing enumerations rather than appended.

The two findings left are Medium and Low and gate nothing: one over-broad "HEAD already behaves this
way" claim that bundles a red case (EC-CLI-5) with two green ones, and one edge case (EC-CLI-1)
whose new report-line obligation falls just outside its acceptance test's range. Both are one-clause
fixes in §12.1 and §3.5 and can be carried into TSPEC without re-review.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
