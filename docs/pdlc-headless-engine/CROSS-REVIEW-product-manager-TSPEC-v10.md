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

No High or Medium finding is open. Both entries below are in the new §7.8 material only.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **The probe mapping's three rows do not cover every `spawnSync` return, and the uncovered ones produce operator-facing nonsense.** The table (`:2205-2210`) enumerates `error.code === "ENOENT"` ⇒ `"not found"`, `status !== 0` ⇒ `` `found but exited ${status}` ``, and `status === 0` ⇒ `"ran"`. Two real host states fall outside all three: a non-`ENOENT` spawn error (`EACCES` on a non-executable file on `PATH`, `EPERM` under a sandbox) and a child killed by a signal — in both, `status` is `null`, so the second row matches and the refusal reads **"python3: found but exited null"**. That is a phrase an operator cannot act on, and EC-START-10's product promise is a refusal naming "the candidates tried, **what each yielded**, and the remedy" (`FSPEC:300`, `:406`). The design is right; the enumeration is one row short. This is a Low rather than a Medium because the failure mode degrades a message rather than a verdict — the candidate is still rejected and the ladder still refuses correctly, so C-11's product outcome holds either way. **Fix:** add a catch-all row — any other `error`, or `status === null` — mapping to `false` with an outcome that quotes the error code or signal (e.g. `"present but not executable (EACCES)"`), so the phrase stays actionable for every branch the refusal can reach. | C-11, EC-START-10 |
| F-02 | Low | Local | **EC-START-10's fixture asserts a distinctness the mapping cannot produce on the host state the case is named for.** The row reads "`runProbe` returns `{ran: false}` for all three, with a distinct `outcome` each" (`:2244`), and the assertion is that the refusal contains "each of the three candidate names and its own outcome phrase". Under the mapping now fixed in the same section, the case EC-START-10 is titled for — "no accepted interpreter on the host" (`FSPEC:406`) — most often means all three absent, i.e. `"not found"` **three times**, not three distinct phrases. The oracle is still the right one (it proves the refusal pairs each name with its own phrase rather than printing one summary), but a fixture author reading the row literally may conclude distinct phrases are a property of the system rather than a device for making the pairing observable, and a later reader may take the fixture as evidence of a host state that never occurs. **Fix:** one clause — say the distinct outcomes are chosen to make per-candidate pairing falsifiable, not because a real all-absent host yields three different phrases, and (optionally) name the realistic all-`"not found"` shape as the case the same assertion also covers. | EC-START-10 |

## 4. Questions

| ID | Question |
|----|---------|
| Q-01 | I independently verified §9.3's BR-START-1 erratum against FSPEC HEAD and concur, so I re-emit it in my own dispatch message. If the orchestrator's one-erratum-per-upstream-doc-per-phase bound treats the two as one item, that is the intended reading — the concurrence is evidence, not a second request. |
| Q-02 | The census asserts the **count** of indirect positions (11), not their identity. Two simultaneous edits — one direct site made indirect, one new direct site added — would move both counts consistently and stay green. Is a per-position transcription (line-anchored, as the direct classes effectively are) worth it here, or is the count the deliberate stopping point given indirect values are governed at their source anyway? No finding: the count already catches the single-edit case, which is the realistic one, and this is a test-design judgement I leave to the test-engineer lens. |

## 5. Positive Observations

- **The rescope fixed the class I named and one I had not measured.** I raised class 3's four
  uncounted `skill:` fields; the revision found seven more in class 4 (`:5573`, `:5579`, `:5585`,
  `:5876`, `:7124`, `:7463`, `:9244`) and rescoped both classes together. My finding was the visible
  half of the defect. Widening the sweep to the whole dispatch surface — rather than patching the one
  class a reviewer happened to check — is the second time in three rounds this document has done that.
- **"Indirect dispatch" is a third outcome with a stated reason, not an exemption.** The distinction
  that makes it sound is provenance: an indirect argument's value "originates in a class-2 role field
  or in a class-4 direct site upstream of the call", so scoring it again "would demand the extractor
  evaluate the program" (`:547-551`). That keeps DEC-ENG-05's no-exemptions rule intact while making
  the guard green on correct code — the failure mode I flagged as blocking Phase I is gone, and it
  went away by sharpening the definition rather than by loosening the bar.
- **The withdrawal in §9.3 is the honest version.** Round 8's incidental note about FSPEC's script
  citation was wrong; the revision re-measured, said so plainly — "FSPEC's range spans exactly
  initialisation through fail-open and is correct. The off-by-one was this document's, in §7.8"
  (`:2444-2447`) — and corrected the stale anchor in the v1.7 changelog line as well as in §7.8. A
  document that retracts its own upstream complaint in writing is one whose remaining upstream
  complaints are worth routing, which is exactly what makes this round's BR-START-1 erratum credible.
- **BR-START-1 vs BR-GUARD-6 was escalated, not designed around.** The easy move was to narrow rung
  4a until it fit BR-START-1's literal words. Instead §7.8 states the reading an implementer should
  build to and pushes the missing "billable" qualifier upstream where the product decision lives
  (`:2233-2241`). That is the correct routing under the errata contract: a product-level ambiguity
  belongs in FSPEC, not resolved silently inside a technical section.

**Traceability:** C-11 still reaches its owning component (`lib/startup.mjs`, §7.8) with two
falsifiable branches, and this round strengthened one of them (EC-START-11's rung-5 pass). AC-3.5's
set-equality survives the site-class rescope in both directions — deletion of a direct site now moves
a count rather than shrinking a set silently. Every P0/P1 requirement I traced last round still
traces; no requirement was narrowed or dropped by this revision; no scope was added — the new
material is entirely oracle and citation work on ground already claimed. No product decision was
taken inside a technical section: the one that arose (BR-START-1's scope) was routed upstream.

## 6. Recommendation

## Verdict
