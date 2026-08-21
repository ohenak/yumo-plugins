# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6)
**Date:** 2026-08-20
**Iteration:** 2

Delta re-review. Base last reviewed: `9f5299ae` (FSPEC v1.5). Delta under review:
`106ec502`, `3d0fd378`, `0d4215bd`, `33634b3d`, `9f80247a`. Scope of attention: the v1 findings
and the changed sections only.

## Prior-Finding Disposition

| v1 ID | Severity | Status | Evidence in the delta |
|-------|----------|--------|------------------------|
| F-01 | High | **Resolved** | BR-9 now pins both boundaries the oracle was missing. **Domain:** "the path-to-content-hash map over tracked files and **non-ignored** untracked files", with `.gitignore`d paths declared outside restoration's reach in both directions. **Observation point:** "taken immediately after restoration completes and **before** the record and escalation writes BR-13 requires". AT-05-1 carries both verbatim, adds the absent-not-reset conjunct for repair-created files, and AT-05-2 excludes an ignored generated output from its case. E-23 now admits the halt's own writes — record, escalation entry, and the `halted` queue row (M-WG-7) — as the halt's, not a restoration defect. That is the exact conflict I flagged: with the observation point ahead of `terminate`'s step-7 RECORD append (`pdlc/workflows/orchestrate-dev.js:4026`, called after `doRevert` at `:4244`/`:4251`), AT-05-1 and AT-06-1 can now both hold. |
| F-02 | High | **Resolved** | Both literals now live spec-side. BR-5 transcribes the exclusion order `X-a`, `X-e`, `X-d`, `X-b`, `X-c` — byte-for-byte the shipped `ADVISORY_EXCLUSIONS` (`orchestrate-dev.js:2459`) and its evaluation comment (`:2456-2458`), including the deliberate non-alphabetical order. BR-15 transcribes the eight reasons in shipped order — `prohibited-action`, `revert-on-test-touch`, `out-of-envelope`, `post-action-verification-failed`, `record-write-failed`, `malformed-verdict`, `low-confidence`, `budget-exhausted` — matching `ADVISORY_REFUSAL_REASONS` (`:2445-2456`) exactly. AT-03-7 and AT-03-8 now compare against *those* literals rather than "its transcribed literal", so the comparand no longer has to be copied out of the module under test. AT-03-2 goes further and names the resolved reason `revert-on-test-touch`, which is what `classifyEnvelope`'s `X-a` branch returns (`:2564-2566`) ahead of `X-d`'s `out-of-envelope` (`:2573-2578`) — the precedence claim is now falsifiable from the spec alone. |
| F-03 | Medium | **Resolved** | §2's new "Where 'before' is measured" paragraph anchors the three red-before oracles: A6 merged at `bb4d36fb` (verified: merge of PR #66, 2026-08-20), post-change readings at `11420461` (PR #67), before-readings at `c8aa22a4` (2026-08-09), which is exactly the base `pdlc-wave-gate-baseline.md:70` names for M-WG-8's five-member reading. "A green result for one of those three at any later base is a vacuum, not a pass" is the sentence the implementer needed. AT-04-5's companion now carries the anchor inline. |
| F-04 | Medium | **Resolved** | E-34 added beside E-28 with a *distinct* observable — no repair proposed, none applied, wave halts on its own red gate, wave agents' work untouched, escalation names the capture as the cause — and §7.1 O-1 now reads "failure modes are E-28 (restoration fails) and E-34 (capture fails)". The two rows are no longer collapsed onto one behaviour. |
| F-05 | Medium | **Resolved** | AT-07-1 moves BR-4 across the partition: "**Proposable, asserted here:** … BR-4 (E-5's scope rule and E-6's two halves, the arms the *Given* names first)", and BR-4 is struck from the not-proposable list, which now reads "BR-1, BR-9…BR-16". The *Given* and the partition name the same rule ids. |
| F-06 | Low | **Resolved** | AT-03-7's *When* now reads "compared by **ordered-sequence** equality against the eight-member literal BR-15 transcribes"; both halves name one oracle unit. |
| F-07 | Low | **Resolved** | AT-04-1's closing sentence restated: "The three assertions share this one run; it is AC-4.1's *conjuncts* that are split one per run across AT-04-1/-1a/-1b." No longer self-contradicting. |
| F-08 | Low | **Resolved** | AT-02-9's *Given* now pins "`advisory.seamBudgetMinutes` pinned high enough that no window can exhaust it", so the shared `budget-exhausted` literal (E-24/E-25, `budgetExceeded` at `orchestrate-dev.js:2363-2365`) can only have come from attempt exhaustion. |

All eight v1 findings are resolved, both Highs among them. Nothing in the delta reopens a section
I approved at v1.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §3.2 step 9 delegates the disposition vocabulary's closed assertion to "the tier's own suite", but no such set-equality exists there — a deleted disposition fails nothing | §3.2 step 9 |
| F-02 | Medium | Local | §6's new transcribed-literal paragraph names M-WG-3 as the source of the pre-A6 halt-reason literal; M-WG-3 carries no string, so the only reachable source is the code under test | §6 preamble, AT-01-3, AT-04-1, AT-05-3 |
| F-03 | Medium | Local | AT-05-1's *When* is "each terminates" while its oracle is measured mid-run, before the record writes; no obligation carries the mid-run observation seam to the TSPEC | AT-05-1, §7.1 O-1 |
| F-04 | Low | Local | E-08b's fixture defeats only one earlier branch of BR-2's chain; the arm that would false-green is the #2-only case, and no AT pins it | E-08b, AT-02-1 |

### F-01 (Medium, Local) — the disposition set-equality has no owner

Step 9 gained: "The vocabulary is the tier's, not A6's, and its closed assertion belongs to the
tier's own suite — the same division AT-06-1 makes for the record shape; A6 adds no disposition, and
no AT here re-asserts the set." The division is the right instinct — A6 genuinely adds no
disposition — but the suite it delegates to does not perform the assertion. The tier's coverage of
the vocabulary is `test.each(["resolved", "escalated", "no-action"])`
(`pdlc/workflows/__tests__/advisoryRecord.test.js:292`), which is per-value iteration, and
`expect(["escalated", "no-action"]).toContain(...)`
(`pdlc/workflows/__tests__/advisoryDriver.test.js:278`), which is containment. Neither is
set-equality, and there is no frozen `ADVISORY_DISPOSITIONS` constant to range over — the values
appear only as a JSDoc union (`orchestrate-dev.js:2243`) and as string literals at the return sites
(`:3965`, `:4251`). Delete a disposition and the tier suite goes green on the two that remain.

This is the same completeness bar §6 holds itself to everywhere else — the enumerated contract needs
one set-equality so a deleted case fails. Not gating, because the FSPEC is right that the gap is the
tier's rather than A6's. *Resolution:* either drop the claim that the closed assertion already
exists (state instead that no suite owns it and route it as an obligation in §7.1), or add one
sentence to §7.1 making the closed disposition assertion a TSPEC obligation on this feature's suite.
This is the same shape as v1's Q-03 on AT-06-1, which the delta did not address.

### F-02 (Medium, Local) — the pre-A6 halt-reason "literal" is not transcribed anywhere reachable

§6's new paragraph is the right rule stated in the right place: "a comparand re-derived from the code
under test compares the pipeline against itself and passes unconditionally." Its sourcing does not
hold up for one of the three comparands. M-WG-7 does supply a literal — the queue row value `halted`
(`pdlc-wave-gate-baseline.md:46`). M-WG-3 does not: it is a prose claim that the gate "halts the run
with the command line and a tail of the output" (`:34`), whose evidence column is a `sed` line
citation, not a string. A fixture author following the paragraph to M-WG-3 finds no halt-reason
string and has exactly one remaining source: the shipped template `` `Error: Wave ${waveNum} test
gate failed — \`${implConfig.testCommand}\` did not pass. Output tail:\n...` ``
(`orchestrate-dev.js:15360-15361`) — the module the test asserts over. That is the implementation
echo the paragraph exists to forbid, reached by following the paragraph.

The created-file set for AT-01-3/AT-01-4 has the same problem in weaker form; the halt reason is the
sharp one because it is a formatted template, not a bare token. *Resolution:* transcribe the
halt-reason template into §6 (or into BR-14 beside the queue-row literal), with `{waveNum}` and
`{testCommand}` marked as the fixture's substitutions, so the comparand exists spec-side once. One
sentence, and the rule the paragraph states becomes followable.

Separately, and not a finding against this FSPEC: M-WG-3's `sed -n '10249,10259p;10321,10332p'`
citation no longer lands on the gate at this branch's HEAD — those lines are now re-mint prompt
text. The line drift is in the constraint doc, not here.

### F-03 (Medium, Local) — AT-05-1 measures at termination but the oracle is defined mid-run

BR-9's observation point resolves v1 F-01, and AT-05-1 correctly inherits it. The residue is that
AT-05-1's *When* is still "each terminates", while its *Then* compares a map "taken immediately after
restoration completes and before the record and escalation writes". Those are different moments, and
by E-23's own admission the tree at termination differs from the tree at the observation point by
the record entry, the escalation entry and the rewritten `halted` queue row. A test author with only
this AT has two incompatible readings: instrument a mid-run capture, or compare at termination with
the three carriers excluded. Both are writable; they are not the same test, and the FSPEC picks
neither.

§7.1 O-1 routes "the point at which the pre-A6 tree state is captured" to the TSPEC, but that is the
*pre*-A6 capture; nothing routes the *post*-restoration observation seam AT-05-1 now needs.
*Resolution:* either restate AT-05-1's *When* as "when restoration completes" and add the
observation seam to O-1, or keep the termination framing and name the three carriers excluded from
the comparison at that point. Not gating — the oracle is now unambiguous about domain and about what
is compared, which was the blocking half.

### F-04 (Low, Local) — E-08b's arm does not defeat every earlier branch

AT-02-1's second arm pins the #1-and-#2 case to `plan-ordering-defect`, which makes the order
load-bearing exactly as the *Then* claims. The precedence chain has a second direction the pair does
not cover: an implementation that hard-codes `plan-ordering-defect` for any multi-match, or one that
simply always prefers #1, passes this arm. The falsifying companion is the #2-only fixture — a
failure inside the wave's own owned paths naming no later-scheduled symbol — asserted to class
`wave-internal-defect`, which also pins the E-5-not-E-6 envelope branch E-08b's row mentions but no
AT asserts. Low, because AT-03-x already exercises E-5-scoped proposals; adding the arm to AT-02-1
is one clause.

## Questions

## Positive Observations

## Recommendation

## Verdict
