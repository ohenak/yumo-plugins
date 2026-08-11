# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.7)
**Date:** 2026-08-11
**Iteration:** 9

**Scope:** delta re-review of v1.7 against v1.6, the revision I reviewed in round 8.
`git diff 3feae567~1..HEAD -- docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` is
+251/−53 across: the v1.7 changelog, §3.3 (guard rescoped by site, census, transcription
conjunct), §4.3 (rung 4a pointer), §5.3 (catch marked as added; return-site citation),
§6.4 (rung 4a vs EC-GUARD-4), §6.5 (Q-19), §7.4 row 4, §7.5 (Q-18), **new §7.8**,
§8.1/§8.2/§8.3 (C-11 row, `startup.mjs`, `run.mjs`), §9.2 and §9.3. Unchanged sections
were not re-reviewed. Every claim below is grounded in HEAD source on
`feat-pdlc-headless-engine`, cited `file:line`.

## Prior findings disposition

All four v8 findings and both v8 questions were addressed. I re-verified each repair against
HEAD rather than against the changelog's account of it.

| v8 | Disposition | Verification at HEAD |
|---|---|---|
| F-40 (High) — the no-bare-literal guard's "skill-identifier shape" predicate was unwritable | **Direction resolved, predicate not yet.** Scoping by *site* rather than by string shape is the right repair and the reasoning is now airtight: the reviewer-role map's keys and values are indeed syntactically indistinguishable on the same three lines, and the map is none of the four classes so it needs no exemption. The census answers the ∅-extraction hole I raised, and class 2's figure re-derives exactly. But classes **3 and 4 as defined select strictly more sites than the census counts**, and the "cannot resolve ⇒ failure" rule makes those extra sites red on correct code — see F-44. | `orchestrate-dev.js:6229-6231`; `:3316`, `orchestrate-queue.js:45`; `PHASE_DISPATCH` `:3338-3436` |
| F-41 (High) — rung 4a arrived with no oracle, no seam, no traceability row | **Resolved, in full and in the shape asked for.** New §7.8 declares `GUARD_INTERPRETERS` + `probeGuardInterpreter({runProbe})` on `lib/startup.mjs`, names why neither §7.0/§7.1's bootstrap nor `_runCommand` reaches the startup path, and specifies both branches as hermetic `runProbe`-injected tests. "Nothing dispatched" became the positive conjunct I asked for (`accumulator.length === 0` plus a dispatching control in the same file). §8.2 carries the C-11 row, §8.1 names the two constraint-borne obligations that have no AC row, §6.4 and §8.3's `startup.mjs` row now separate EC-GUARD-4 from rung 4a. `GUARD_INTERPRETERS`'s three names match the shipped script exactly. | `guard-harvest-before-delete.sh:15`; `FSPEC:299`, `:406-407`, `:918-924`, `:967`; TSPEC §7.8, §8.2 |
| F-42 (Medium) — derivation test recomputed from the same imported data | **Resolved.** The ten identifiers are transcribed test-side as a second conjunct, and the asymmetry with §7.4 is stated rather than left implicit: BR-START-4 forbids a *production-side* declaration, not a test-side assertion of what production must derive. I checked the ten against HEAD — `PHASE_DISPATCH`'s eight rows yield `pm-author, se-author, te-author, pm-review, se-review, te-review, dod-verify, se-implement`, plus `ship-pr` (`:8008`, `:8112`) and `harvest-learnings` (`:10448`, `:10542`) = 10, exactly the transcribed list. | `orchestrate-dev.js:3338-3436`, `:8008`, `:8112`, `:10448`, `:10542` |
| F-43 (Low) — §5.3 cited the consumption site as the return site | **Resolved.** §5.3 now reads "constructed and returned at `orchestrate-dev.js:1847` and `:1857`; the caller reads it at `:3143-3149`", matching §7.4 row 4. | `orchestrate-dev.js:1847`, `:1857`, `:3143` |
| Q-18 (corpus scoping asserted, not merely supplied) | **Answered as a sixth conjunct**, set-equality over the five named configurations — not containment, so both an unnamed sixth configuration and a configuration that recorded nothing are red. §8.3's `_assert-suite-wide.mjs` row was updated in step. | TSPEC §7.5, §8.3 |
| Q-19 (what the M-ENG-09 gate asserts about the row) | **Answered with the one clause I asked for**, and the answer is the load-bearing one: presence **and** consistency between the recorded `denyFired` value and the shipped mechanism, so `denyFired: no` with the hook carrier still shipped is red. | TSPEC §6.5 |

The PM-side repairs also land: `run.mjs` at HEAD really does contain no `catch` clause — only
`withCwd`'s `try` at `:159`, paired with `finally` — so marking §5.3's top-level catch as *added*
(`runDev` `:187`, `runQueue` `:228`) corrects a claim that read as observation. §9.2's sweep onto
the one-platform matrix matches `pr-tests.yml:40` (`os: [ubuntu-latest]`).

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
