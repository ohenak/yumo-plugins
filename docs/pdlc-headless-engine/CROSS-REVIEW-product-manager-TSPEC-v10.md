# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.8)
**Upstream read:** `REQ-pdlc-headless-engine.md` (C-11 `:284-286`), `FSPEC-pdlc-headless-engine.md` (ladder row 4a `:300`, BR-START-1 `:302-303`, EC-START-10/11 `:406-407`, BR-GUARD-6 `:918-925`)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v9.md` (0 High, 2 Medium, 1 Low)
**Diff reviewed:** `71a5b949..HEAD` — TSPEC +151/−29 across four commits (`a9e17ee2`, `d1d42fda`, `f4819dbf`, `ed0e0eec`)
**Date:** 2026-08-11
**Iteration:** 10

**Scope:** delta re-review. Disposition of v9's three findings, then the changed sections only.

## 1. Disposition of prior findings

All three resolved, and each verified against HEAD rather than against the revision's own prose.

| Prior finding | Disposition |
|---|---|
| **F-01 (Medium)** — §3.3's class 3 selected five `skill:` sites at HEAD, not one, and the "cannot resolve ⇒ failure" rule therefore specified a permanently red guard | **Resolved** (`a9e17ee2`). Classes 3 and 4 now require "a string literal or an identifier bound to a module-level constant" (`:535-537`), and a third outcome — **indirect dispatch**, "neither a site nor a failure" (`:543-553`) — absorbs the parameter/local/member-expression forms. Re-measured at HEAD: `grep -n "skill:" orchestrate-dev.js` returns exactly the five the document names — `:5909`, `:5910` (`reviewers[0]`/`[1]`), `:9288` (`authorSkill`), `:9528` (`dispatch.creator`), `:10448` (`"harvest-learnings"`) — so 1 direct + 4 indirect is right. The four uncounted sites that made the guard red are now classified, not exempted. |
| **F-02 (Medium)** — §7.8's two script anchors were off, and §9.3's note wrongly alleged an off-by-one in FSPEC | **Resolved** (`d1d42fda`, `f4819dbf`). Measured at HEAD: `PY_BIN=""` is `:14`, the candidate loop `for cand in python3 python py; do … done` is `:15-20`, the fail-open `[ -z "$PY_BIN" ] && exit 0` is `:21`, and the probe `"$cand" -c "import sys"` is `:16`. §7.8 now cites `:16` for the probe (`:2200`) and `:15-20` / `:21` for the loop and fail-open (`:2229`); §9.3 **withdraws** the note in its own voice — "The off-by-one was this document's, in §7.8" (`:2443-2447`) — rather than quietly deleting it, and the v1.7 changelog line carries the correction inline (`:72-73`) so the superseded `:15` is not left standing in history. Exactly the sweep discipline I asked for last round, applied to the document's own error. |
| **F-03 (Low)** — the census was labelled "at HEAD" while class 1's figure was a post-edit projection | **Resolved.** §3.3 now reads "**Classes 2 and 4's figures are measured at HEAD** … **class 1's 7 is counted after the edit** — only `ADVISORY_RUNG_SKILL` (`orchestrate-dev.js:1797`) exists today" (`:582-586`), and the v1.7 changelog line carries the same qualifier plus a supersession pointer (`:63-65`). Verified: `:1797` is `const ADVISORY_RUNG_SKILL = "se-review";` and no `SKILL_*` constant exists in either module at HEAD. |

## 2. What else changed, and what I re-grounded

Four commits: §3.3's site-class rescope and census (F-44 / my F-01), §7.8's rung-5 assertion, script
anchors and probe mapping (F-45, F-46, Q-20/21), §9.3's withdrawal plus the BR-START-1 erratum, and a
cross-round consistency pass. I re-measured every load-bearing claim in the changed text against HEAD.

- **The new census closes over the whole dispatch surface, and I checked that independently.** §3.3
  claims **7 / 28 / 1 / 12 = 48 direct plus 11 indirect** (`:570-581`). Enumerating every dispatch
  call in both modules at HEAD (`_agent` / `agentFn` / `_sessionAgent` first arguments) returns
  nineteen: the eleven literal-argument sites the v1.7 census listed, plus
  `_agent(ADVISORY_RUNG_SKILL, …)` at `:1841` — verified, and it does resolve to a module-level
  constant exactly as the rule prescribes — plus the seven variable-argument sites at `:5573`,
  `:5579`, `:5585`, `:5876`, `:7124`, `:7463`, `:9244`. 12 + 7 = 19, with nothing left over. Add
  class 3's 4 indirect `skill:` fields and the indirect total is 11 ✓. The partition is exhaustive at
  HEAD, which is what makes "neither a site nor a failure" safe rather than an escape hatch: no
  dispatch position falls outside all three buckets.
- **The third outcome is justified by provenance, not by convenience.** "Such an argument carries a
  value the derivation already governs at its own source: it originates in a class-2 role field or in
  a class-4 direct site upstream of the call" (`:547-550`). Spot-checked: `:9244` is
  `agentFn(PHASE_DISPATCH[phaseId].optimizer, …)` — a class-2 field read at the point of use; `:5876`
  is `_agent(optimizer, …)` and `:7463` `_agent(reviewer, …)`, both threaded from the same table.
  The claim holds for the cases I traced. And the count of indirect positions is itself asserted, so
  a direct site rewritten to dispatch through a variable "moves one count out of the direct 12 and
  into the indirect 11 rather than vanishing from both" (`:589-591`) — the deletion-goes-red property
  AC-3.5 asks for survives the rescope in both directions.
- **§8.3's edit-surface row was reconciled with the new arithmetic, not just re-worded.** It now says
  literals are replaced "at their **direct** dispatch sites (the eleven class-4 literals and the one
  class-3 `skill:` literal §3.3 enumerates; the eleven indirect-dispatch positions are untouched)"
  (`:2320`). Eleven, not twelve, is correct: `:1841` already dispatches through a constant. The five
  distinct literal skill names across those eleven sites (`ship-pr`, `dod-verify`, `se-implement`,
  `se-author`, `harvest-learnings`) match the "five `SKILL_*` constants" the same row declares —
  internally consistent, and I could not find an off-by-one anywhere in the chain.
- **The probe mapping (Q-21) is fixed in the spec because the oracle needs it.** The new table
  (`:2205-2210`) maps `spawnSync`'s three shapes to `{ran, outcome}`, with the stated reason that
  "EC-START-10's oracle asserts each candidate's own outcome phrase and a fixture author cannot write
  those expectations without it" (`:2203-2204`). That is the right place to settle it — the phrases
  are operator-facing refusal text, so they are a product surface, not a plan detail. The
  EC-START-11 fixture was updated to match (`{ran: false, outcome: "found but exited 9009"}` /
  `{ran: true, outcome: "ran"}`, `:2245`), so table and fixture now agree; they did not before.
- **The script-conjunction note is accurate.** §7.8 says the script's test is `command -v "$cand"`
  **and** `"$cand" -c "import sys"` while `spawnSync` collapses absence into `ENOENT`, so the two
  "agree on every accept/reject verdict" and the mapping keeps them agreeing on the phrase
  (`:2212-2215`). Line 16 at HEAD is exactly that conjunction ✓, and the verdict-equivalence
  reasoning is sound: `command -v` failing and `ENOENT` are the same host condition.
- **EC-START-11's rung-5 assertion is now positive (F-45).** "rung 5's record exists with
  `state === "pass"` under a green billing posture … since `RungRecord.state` is three-valued (§4.3)
  and `state !== "skipped"` would be satisfied by a rung-5 *failure* as readily as by a pass"
  (`:2245`). Checked against FSPEC's ladder: row 5 is billing posture (`FSPEC:301`), and EC-START-11's
  product promise is "the next candidate decides" (`FSPEC:407`) — a rung-5 pass is the faithful
  operational reading of that, and the weaker form could have gone green on a broken ladder.
- **The BR-START-1 erratum is correctly filed upstream rather than absorbed.** §9.3 (`:2449-2457`)
  raises it through the erratum channel and §7.8 states the reading an implementer should build to
  (`:2233-2241`) without narrowing the design. Verified upstream: `FSPEC:302-303` does say "No model
  call, and no probe of any kind, is made while the ladder is running … zero tokens billed", and
  `FSPEC:922-924` does require rung 4a observe availability "by **running** a candidate". The
  contradiction is real and is FSPEC's, not this document's. I concur and re-emit it (§4, Q-01).

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
