# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 20 (delta re-review of the v2.4 sweep)
**Scope:** Delta only — the five commits `c93f5032..b2156952` that produced v2.4 (`546a7ee2` version bump/erratum note, `cdb5542c` guard-family re-anchor, `f784d06a` `build-runtime.mjs` re-anchor, `57ee7126` all-unreadable status + reason code, `b2156952` epoch-preamble cadence). Untouched sections not re-reviewed. Anchors re-verified against HEAD `b2156952`.

## What I examined

`git diff c93f5032..HEAD -- REQ-…md`: epoch preamble now states the re-measurement cadence and makes the role name the durable locator; v2.4 erratum note replaces v2.1–v2.3; six anchors re-measured with roles named; §4b now names the terminal status **and a reason code** for a wholly-unreadable corpus; AC-1.4 gains a third cause; AC-5.3 and AC-5.5 populations updated to "first or third cause". Every re-measured anchor read at HEAD; the new reason code diffed against the vocabulary file and the shipped module catalogue.

## Prior findings (v19) — disposition

| v19 | Status | Evidence at HEAD |
|---|---|---|
| F-01 High — five stale `orchestrate-dev.js` anchors | **Resolved** | `:936` `export function effectiveGuardPaths`; `:1126-1127` the resolver/verdict call pair inside `decideMerge`; `:2370` the advisory-envelope `guardVerdict` call; `:61` `mergeMode: "off"`; `:1065` guard-1 test, `:1070` `reason: "mergeMode is off"`; `:1659` the phase early return; `:9424` `export async function gitWithLockRetry`. All eight resolve, each with its role named |
| F-02 Medium — all-unreadable terminal status unnamed | **Resolved as to the status** | §4b (REQ:624-625) names `no-op` and routes it through AC-1.4's third cause; no status added, AC-7.1's six-member set unchanged. But the *reason code* half introduces F-01 below |
| F-03 Medium — `build-runtime.mjs:465` stale | **Resolved** | REQ:401 now cites the artifact table's fourth row, `pdlc-cli.mjs`, `:564-567`; HEAD `:564` `file: "pdlc-cli.mjs"`, `:567` `id: "pdlc-cli"` — the row spans `:563-569`, the cited range lands inside it and the role name resolves |
| F-04 Medium — permanent-unreadable loop indistinguishable | **Addressed, but by a means that is not yet legal** — see F-01 |
| F-05 Low — measured facts belong in a constraints file with `M-*` ids | **Answered in substance** | The v2.4 preamble makes the role the locator and the number the convenience, and fixes the cadence at review rounds. That is the durable half of the ask without the `M-*` machinery. Not re-raised |
| Q-01 — is staleness tolerated after the pinned epoch? | **Answered** | REQ:20-22: re-measured at review rounds, not per commit; a shifted number is a defect only where the named role no longer resolves |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **`corpus-unreadable` is a new enumerated value with no row in the vocabulary file, which the REQ's own symmetric set-equality oracle makes a defect — and the shipped catalogue does not carry it either.** §4b (REQ:625-626) has an all-unreadable pass "carry the reason code `corpus-unreadable`". §4b's oracle (REQ:603-608) is set-equality over `docs/_constraints/pdlc-consolidation-vocabularies.md` §1 **at `Version` 1.4**, symmetric: "a value used here with no row there **and** a row there naming a value this REQ never uses being equally defects". §1 of that file at `Version` 1.4 enumerates **twelve** reason codes (`pdlc-consolidation-vocabularies.md:47-58`) and `corpus-unreadable` is not among them; the shipped `REASON_CODES` freeze is the same twelve (`pdlc/workflows/consolidate-learnings.js:95-107`), and `consolidationReport.test.js:283-300` asserts that set-equality in four legs over `REASON_CODES` among others. So as written the REQ is in breach of its own oracle at the moment it is read, and the AC-7.1 requirement that a reason code be "drawn from §4b's enumeration, and paired only as §4b permits" (REQ:517-518) has nothing to draw from — no permitted-status set is stated for the new code, so the composition rule (`:82-88` of the vocabulary file) cannot be applied to it. Two legal exits, author's choice: **(a)** add the row (`corpus-unreadable` \| reason code \| `no-op` — and state whether `failed` is still reachable after the read, per the composition rule), bump the file to `Version` 1.5, and move **every** pin — REQ:95, :111, :214, :256, :436, :596, :605, :613, plus TSPEC:124 and PROPERTIES:132, :404, :784, :1145, :1244 — and the shipped catalogue and its doubles transcription; **(b)** drop the code and meet v19-F-04's liveness need with values already enumerated: an AC-7.1 report whose *LEARNINGS consumed by basename* is empty while the un-consolidated set is non-empty already distinguishes "ran, read nothing" from a quiet week, and needs no vocabulary row. (b) is much the cheaper fix and keeps §4b's standing promise below intact. | §4b (REQ:625-626) vs REQ:603-608, AC-7.1 (REQ:517-518) |
| F-02 | Medium | Local | **§4b now contradicts itself within one paragraph.** REQ:618 still states, of exactly this unreadable-corpus case, that "Omission needs **no new field, no new reason code** and no vocabulary row" — and REQ:625-626, eight lines later, adds a new reason code for it. Whichever exit F-01 takes, one of these two sentences must change: under (a) the v2.1 sentence must be amended to say the *omission* needs no new field while the *terminal row* gains a code; under (b) the new sentence goes. Leaving both standing makes the section unimplementable by reading — a reader cannot tell which clause governs. | §4b (REQ:618 vs :625-626) |
| F-03 | Low | Process | **The delta's substantive addition arrived without the enumeration check the same section mandates.** Every prior round's anchor work has been mechanised (grep over the REQ, this round correctly so — F-01/F-03 of v19 both cleared). The value-level analogue is not: adding an enumerated value is exactly the change §4b's symmetric oracle exists to catch, and a one-line diff of the REQ's enumerated values against `pdlc-consolidation-vocabularies.md` §1 and `REASON_CODES` would have caught it before authoring. Worth a checklist row wherever the anchor-grep discipline is recorded, so both halves of §4b's contract are checked mechanically rather than one of them. | §4b (REQ:592-608) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Under exit (a), is `corpus-unreadable` reachable with `failed`? The corpus read precedes AC-3.5's and AC-1.6's failure points, so by the composition rule as stated for the AC-6.1 codes it arguably is — but a pass that read nothing and then failed carries little information in that pairing. Deciding it explicitly avoids the pairing being derived twice, differently, at TSPEC and in the module. |

## Positive Observations

- **The anchor discipline has converged, and this time by the right mechanism.** All eight re-measured coordinates resolve at HEAD on first read, and each carries a role name — `decideMerge`'s resolver/verdict call pair, guard-1's refusal, the lock-retry wrapper — so the next shift is self-repairing. The citation set was re-derived by grep rather than from my finding list, which is precisely the fix v19-F-03 asked for.
- **The epoch preamble is now a real convention, not a timestamp.** "The role name is the durable locator; the number is the convenience", plus re-measurement at review rounds and a defect rule keyed on role resolution, answers v19-Q-01 in the honest direction and stops a future DOD round re-opening the sweep.
- **§4b's status decision is exactly right, and cheap.** Routing the all-unreadable pass through the existing `no-op` member rather than minting a seventh status keeps AC-7.1's six-member set and the shipped `TERMINAL_STATUSES` untouched, and the AC-5.3/AC-5.5 edits to "first or third cause" keep the streak populations keyed on consumed-set emptiness rather than on the label — the invariant those ACs were written to protect.
- **AC-1.4's three-cause sentence stays decidable.** "The first and third consume nothing, the second consumes" makes the streak population derivable from the text without a table lookup.

## Recommendation

**Needs revision**

One High, and it is narrow: the round's substance — the status choice, the AC-1.4 third cause, the streak-population edits, the whole anchor sweep — is correct and lands cleanly. The single defect is that the fix for v19-F-04 minted a thirteenth reason code without the vocabulary row, the version bump and the pin cascade that §4b's own symmetric oracle requires, and left the contradicting v2.1 sentence in place beside it.

Concretely, pick exit (b) unless the code earns its cascade: delete `corpus-unreadable` from REQ:625-626 and state the distinguishability in terms already enumerated — a terminal row whose consumed-by-basename list is empty while the un-consolidated set is non-empty. That closes F-01 and F-02 in one edit, touches no pin, and needs no change to `pdlc-consolidation-vocabularies.md` or to the shipped catalogue. If instead the code is wanted, take exit (a) whole — row with its permitted-status set, `Version` 1.5, all fourteen pins, module and doubles — a partial (a) is worse than either.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
