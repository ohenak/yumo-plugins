# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.9)
**Date:** 2026-08-13
**Iteration:** 4
**Scope:** Testing lens, delta only. Round-3 findings re-checked against HEAD code, not against the
REQ's account of the fix. Only sections changed since `c00dcced` scanned for new issues.

## Round-3 disposition

All three round-3 findings resolved. Verified in the working tree, not from the changelog:

| Prior | Resolution in v0.9 | Verified at HEAD |
|---|---|---|
| F-01 (Medium) AC-3.4's second set-equality did not say how the rendered set is obtained — two candidate carriers at two test levels | AC-3.4 now names the carrier explicitly: read the authored `name:` strings **and expand the declared matrix axes locally**, "decidable offline, without a PR, a network or credentials, as at AC-1.3", with the GitHub-observation carrier ruled out in the AC itself because "that check cannot run inside the gate it asserts on". The expected set moved to the FSPEC, seeded from M-ENG-10; T-7 and C-5 repointed consistently | AC-3.4 (REQ:317-329), T-7 (:224), C-5 (:192-194), O-B (:67) all now say the same thing; matrix axes are where M-ENG-10 says they are — `pr-tests.yml:40-41` (unit-tests `os`×`node`) and `:87` (engine `os`, no node axis) |
| F-02 (Low) O-5's line window `handshake.mjs:130-133` was off by one and excluded the line holding the cited token | Citation is now by **symbol** — the `REMEDY` const — with the drift reason stated | `pdlc/engine/lib/handshake.mjs:131` declares `REMEDY`; its text names `PDLC_PLUGIN_ROOT` at `:134`; consumed at `:164` and `:177`. Symbol citation is stable across edits above it |
| F-03 (Low, Cross-Feature) M-ENG-11's `private` row still asserted a publish-failure ordering that O-8 disclaims | Baseline row rewritten: "`npm publish` refuses outright; no ordering against the licence or credential blockers is claimed, none was measured" | `docs/_constraints/pdlc-engine-baseline.md:220`. A test written from O-8 and a test written from M-ENG-11 now assert the same thing |

Also spot-checked the compression pass (v0.9 trimmed NG-1, R-1, R-4, O-1, O-3, O-4 while adding
material). The only deletion carrying testable content was O-1's rejected-channel reasoning, and it
survives upstream in full: `docs/_decisions/DECISIONS-plugin-distribution.md:126-127` still holds
both rejection rows. Nothing load-bearing was lost to the byte bound.

## Findings

No High findings. Nothing the revision changed broke a previously-approved section. Two Mediums and
one Low, all inside text written this round.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **The change-control point moved, but its cited authority still claims to be it — two tests, two different expected sets.** T-7 and AC-3.4 now make the **FSPEC's** expected check set authoritative and demote M-ENG-10 to "a point-in-time observation, not a gate". M-ENG-10 itself still closes with "Both columns are authoritative; a change to either is a change to this fact first" (`docs/_constraints/pdlc-engine-baseline.md:209`). An implementer reading the baseline writes the equality against M-ENG-10's table; one reading the REQ writes it against the FSPEC's set. Both are green today (the sets are equal by construction) and they silently diverge on the first matrix edit that updates one and not the other — the exact failure mode M-ENG-10 was written to prevent. Fix is one sentence in the baseline row, pointing change control at the FSPEC set and keeping the measurement label. | T-7; AC-3.4; M-ENG-10 |
| F-02 | Medium | Local | **AC-6.2's surviving conjunction is non-discriminating, and the only discriminating conjunct is absence-shaped.** Dropping the false write-root conjunct was correct — verified: nothing in the runtime writes `.claude/workflows/`; the writers are `sync-workflows.sh` and the SessionStart hook (`pdlc/hooks/scripts/lib/pdlc-drift.sh:1562` writes `.claude/workflows/.pdlc-drift-state.json`, `:1153` the sync manifest). But what remains is (1) "the run completed and emitted its own named output artifacts", which an engine run also satisfies, and (2) "that output carries no engine provenance block", which is the only separator and is a negative. The AC states the interim precondition in prose ("only on a machine whose installed channels are known independently"); it does not state it as a **fixture obligation**, so a test can be written that installs the bundle channel alone, asserts (1)+(2), passes, and proves nothing about load root. Ask: make the precondition part of the criterion — the observed run's installed-channel state must be asserted by the test setup, not assumed — so the AC cannot be discharged by a fixture that never distinguishes anything. | AC-6.2; O-9 |
| F-03 | Low | Local | **Nothing checks that "locally expanded" equals "what GitHub renders".** AC-3.4's rendered-column equality is now computed by re-implementing GitHub's matrix-expansion and interpolation rule locally. That is the right level for a gate, and it is what M-ENG-10's rendered column was itself derived from — which means the local rule is compared only against another application of the same local rule. If the rule is wrong (interpolation spacing, axis ordering, a single-value axis GitHub omits), both sides are wrong together and Phase PUB's poll is what breaks. Suggest FSPEC record a one-time, non-gating cross-check of the expected rendered set against the names one real PR run reported, with the observation dated — provenance for the seed, not a second gate. | AC-3.4; T-7 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | O-9 now owns three carriers of the same shape (AC-4.2's version pair, AC-4.5's authored-file enumeration, AC-6.2's load root). Is one design decision expected to discharge all three, or may TSPEC answer them separately — and if separately, does the *Blocking for* line need to split too, so a partial answer can release the part it covers? |
| Q-02 | Round-3's Q-01 stands unanswered and is still not blocking: AC-1.3's "no test corpus in the packed set" is an outcome that implies either a `files` field or an `.npmignore`, since `pdlc/engine/__tests__/` is inside the package root and M-ENG-11 records `files` as absent. Confirming it is deliberately FSPEC's/O-10's call, not an omission here. |

## Positive Observations

- The AC-6.2 correction is the best kind: the revision did not defend the previous wording, it
  discovered that the third conjunct was **factually false** (no run writes `.claude/workflows/`),
  deleted it, and then said plainly that removing it leaves the oracle unable to distinguish the
  channels — rather than keeping a comfortable-looking three-conjunct test that asserted something
  untrue. A weaker but honest oracle with the gap routed is worth more than a strong false one.
- AC-3.4 ruled a carrier *out* in the AC text, with the reason ("that check cannot run inside the
  gate it asserts on"). Naming the rejected option is what stops it being re-litigated in TSPEC.
- O-9's widening kept the three carriers' shared shape explicit ("a fact the running layer does not
  carry today"), which is what makes them one design decision rather than three wording fixes.
- The `REMEDY`-by-symbol citation fixed the specific finding *and* the class of finding — line
  windows in a REQ drift on any edit above them. Worth generalising to other REQs.
- v0.9 grew AC-3.4, AC-6.2 and O-9 substantially and still came out shorter, with the compression
  taken from superseded changelog entries and from prose duplicated upstream. Verified rather than
  assumed for the one deletion that mattered (O-1 → DEC-DIST-05).

## Recommendation

**Approved with minor changes**

Every round-3 finding is resolved at the source, verified against code rather than against the REQ's
account of the fix: AC-3.4 names an offline carrier and rules the online one out; O-5 cites `REMEDY`
by symbol at a line that really holds it; the baseline's unmeasured ordering clause is gone. The
revision broke nothing previously approved. No High finding is open, and the document is testable at
REQ altitude — the two admitted gaps (AC-4.2, AC-6.2) are named as gaps with an owner, not papered
over.

The two Mediums are one sentence each: point M-ENG-10's change-control claim at the FSPEC set it was
just demoted in favour of, and turn AC-6.2's interim precondition into a fixture obligation so the
criterion cannot be discharged by a test that distinguishes nothing. The Low asks the FSPEC to record
where the expected rendered names were seeded from, since the local expansion rule is currently
checked only against itself.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}


APPROVAL-HASH: sha256:84aa3990c6f37c9cdc4e6a1f2446250562ac3676b14c69e4142da253f44c83c0
APPROVAL-HASH-NORMALIZED: sha256:aa12d7fb9acceca14e05d8afba3b4d2e59b43ca78e39e73178e84d1359f4abc0
REVIEWED-COMMIT: 2a1f910d835a15426352a68dac22744df190106e
