# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.4)
**Date:** 2026-08-11
**Iteration:** 5
**Scope:** **delta confirmation of one erratum item only** — BR-MODEL-3's dry-run reachability claim
(`FSPEC:654-656` at the time of raising, `:661-665` at HEAD), edited by commit `d98c7e88`. Not a
re-review of the document. The two open non-gating findings of v4 (F-01 Medium on BR-REP-0a's
`:243-247`/EC-CLI-5 parenthetical, F-02 Low on AT-ENG-05's EC-CLI-1 omission) are out of this
round's scope and carry forward unchanged.

## Erratum disposition

| Item | Status | Evidence at HEAD |
|---|---|---|
| BR-MODEL-3 claimed M-ENG-07's model-map corpus is "reachable from dry runs", but the dry-run surface composes one skill's prompt and dispatches nothing | **Partially resolved** — corrected at BR-MODEL-3, contradicted at §6.3 | See F-01 |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The edit corrects BR-MODEL-3 but leaves the identical false claim standing in §6.3 — the very section BR-MODEL-3 now cites as its authority.** §6.3:574-576 still reads: "It is the mechanism by which every claim in §6.2 is checkable without billing a token, **and by which the model map of §7.3 is exercised over descriptors rather than executed calls**" — subject "it" being `--dry-run`, the inspection surface. BR-MODEL-3 at `:663-665` now says the opposite of that second clause ("The dry-run surface is **not** a way to reach it … never the corpus's source") and cites `§6.3, BR-SKILL-5/6` in support. The two sentences cannot both be true, and the surviving one sits in the section that owns the surface — the section a test author building M-ENG-07's corpus reads *first*, and the one whose sentence is unhedged. Verified at HEAD: `pdlc/engine/bin/pdlc.mjs:98-104` is `inertTransport`, whose `dispatch()` throws; `:190` is the single `composePrompt(skill, …)` call, one skill per invocation, matching BR-SKILL-6's "one invocation per member". So the surface exercises at most one map row and §6.3's clause is false as written. **Test consequence** — the exact one the erratum was raised to prevent: a test author who reads §6.3 for the mechanism schedules AT-ENG-29's corpus as a set of `--dry-run --dry-run-skill …` invocations, gets five descriptors that record no module-pinned model for any phase but the one skill printed, and either the set-equality fails for reasons unrelated to the map or (worse) the corpus is quietly narrowed to the rows dry runs can reach and EC-DISP-6's "unreachable row" case never fires. **Fix (one clause, no new content):** delete the second clause of §6.3:574-576 — "and by which the model map of §7.3 is exercised over descriptors rather than executed calls" — or rewrite it to name the property the surface actually demonstrates, e.g. "…without billing a token; the model map of §7.3 is exercised over descriptors recorded by hermetic fixture-driven runs, not over this surface (BR-MODEL-3)". If the intended reading is that the *compose-without-dispatch principle*, not the CLI surface, is the mechanism, that reading is available but is not what the sentence says while its subject is `--dry-run`; naming the principle explicitly costs the same one clause and removes the contradiction either way. | §6.3 (lines 574-576), §7.3 (BR-MODEL-3) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None this round. F-01's fix is mechanical and the erratum item needs no further clarification from me. |

## Positive Observations

- The correction at BR-MODEL-3 is the right one and is stated the strong way rather than the cheap
  way. It does not merely delete "dry runs" from the list of sources; it states the surface's reach
  positively and boundedly ("exercises at most one row"), which is a testable claim a reader can
  falsify against `bin/pdlc.mjs:190`, and it names hermetic fixture-driven runs as the corpus's
  *only* source, which is what AT-ENG-29's fixture set has to be built from.
- The change note is scoped honestly: it names the one item, states the contradiction with §6.3 and
  BR-SKILL-5/6 that motivated it, and records that AT-ENG-29 and EC-DISP-6 are unchanged. I
  confirmed both: `git show d98c7e88` touches exactly two hunks (the version/change-note block and
  BR-MODEL-3), +12/−3, and the oracle rows at `:691` and `:700` are byte-identical to v1.3. Nothing
  previously approved is unsettled by what the delta *changed* — F-01 is about what it did not.
- No decision from v1.0–v1.3 is reopened, and the edit adds no new AC, AT, EC, or BR id.

## Recommendation

**Needs revision**

The erratum item is resolved at the site it named and unresolved document-wide. One clause in §6.3
still asserts precisely what BR-MODEL-3 now denies, and BR-MODEL-3 cites that section as its
support, so the document currently contradicts itself on the one point this round exists to settle.
The fix is a single clause at `:574-576`, no new content, no re-review of anything else.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}
