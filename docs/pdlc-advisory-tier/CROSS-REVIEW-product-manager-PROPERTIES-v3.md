# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 3
**Scope:** product lens — delta re-review of the v1.1→v1.2 revision; REQ traceability, scope compliance, acceptance-criteria fidelity
**Base reviewed at v2:** `91439f6` · **Head reviewed here:** `fd4bced`

## Prior findings — disposition

My v2 pass carried exactly one finding, a Low. It is **resolved**.

| v2 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | Low | **Resolved** | PROP-A4-09's trailing parenthetical now reads "no `T-06-7` is invented for it (**§13.2**)" (`PROPERTIES:661`), matching §12.4's own citation of §13.2 for the same fact. The two no longer disagree in print. The revision went one step further than the correction I asked for: §12.4 now pins the declaration's location and multiplicity — "**The declaration lives in PROP-A4-09 and nowhere else**; the id also occurs in this paragraph … a scan finding two occurrences has found the declaration plus this sentence, and a scan finding a third has found a real invented case" (`PROPERTIES:1062`). I ran that: `grep -c "T-06-7"` over the document returns **2**, at `:661` and `:1062` — exactly the two the paragraph declares. The one sanctioned exception to the §12.4 set-equality audit is now mechanically checkable rather than prose-asserted, which is what the audit needed to survive a future edit. |

## Findings

Scope of this pass: the changed sections only (`git diff 91439f6..fd4bced` on the document — 155
insertions, 28 deletions across the header changelog, §2.1, §4.2, §5.2, §6.5, §8.3, §10.1, §10.3,
§12.1, §12.3, §12.4 and §13.1). Unchanged sections approved at v1/v1.1 were not re-litigated. No
property was added, removed or re-levelled in this round — I confirmed the table-row count is still
**183** (`grep -c '^| PROP-'`), so §1's and §12.3's 195 / 148 / 40 / 7 / 0 stand without recomputation.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **A new citation points at a PLAN task that no longer exists.** §2.1's `scanFixtures.js` rationale reads "`__tests__/fixtures/` is already excluded from jest's collection (PLAN §2.2, `A-00`)" (`PROPERTIES:163`). `A-00` was **deleted** in PLAN v1.2 and its work restated as the §2.4 operator pre-flight step — PLAN's own changelog says so in as many words ("**A-00 deleted** and its work restated as the §2.4 **operator pre-flight step**", `PLAN:1017`), and PLAN §5.2 records the consequence ("A-00's removal empties nothing: layer 1 is now the single task A-01", `PLAN:451`). `grep -n "^| A-00 "` over the PLAN returns nothing. The **substance** of the claim survives — jest's configured `testPathIgnorePatterns` does list `/__tests__/fixtures/` (`PLAN:140`), and keeping the wave gate's command from replacing it is exactly what the §2.4 pre-flight step protects — so this is a pointer defect, not a coverage defect, and it costs a reader one wasted lookup into a task table that has no such row. It is worth fixing now rather than later because this is the *only* thing standing between the new fixture module and being collected as an empty suite, so a reader chasing the guarantee should land on the paragraph that owns it. **Fix:** change the parenthetical to `(PLAN §2.2, enforced by the §2.4 operator pre-flight step)`. | PLAN §2.4 / §2.2 self-consistency |

## Questions

Both of my v2 questions are **answered in place**, and neither needs a further response.

- **v2 Q-01** (what happens if Phase I finds a legitimate fourth read of `enabled`) is answered in
  §10.1 with the decision I asked for, stated as a decision rather than an option: "**the fourth read
  is refactored away, not blessed** … Amending TSPEC §11.1's count is the escape hatch of last resort
  and requires an erratum against D-1, not a bumped number." That settles at authoring time what would
  otherwise have been argued at implementation time, and it is the right way round for the product —
  D-1 is a claim about the disabled tier being genuinely inert, so a fourth read is evidence against
  D-1 before it is evidence against the property.
- **v2 Q-02** (whether PROP-A5-20 really belongs at Unit level, since its three probes and its home
  file both smell Integration) is answered in §8.3 with a rule I had not seen stated anywhere:
  "membership in that file is not what levels a property; what the property's own oracle has to observe
  is." The specific grounding checks out — the three probes go through the injected `_git` / `_ghRun`
  seams and are answered by `fakeGit` (`helpers/mergeDoubles.js:189`) and `fakeGhRun` (`:75`), both of
  which exist at branch head at exactly those lines. The level stays Unit and the 148 / 40 / 7 / 0
  totals stand — the number that was attached to the answer did not move.

I have no new questions.

## Positive Observations

- **The A3 carve-out in §6.5 is a narrowing of an oracle that does not narrow an acceptance
  criterion — and the document proves the distinction rather than asserting it.** Conjunct 1 of
  PROP-GATE-01…05 (the stubbed-gate ⇒ `escalated` / `post-action-verification-failed` disposition) now
  applies at A2, A4, A5, with A1 **and** A3 taking the stronger unreachability form. My concern on
  reading the diff was that a seam had quietly lost its AC-4.5/AC-4.6 obligation. It has not: for both
  rows the assertion is that `resolved` is unreachable on *every* path and each path terminates in
  `escalated` or `no-action` **with its own O-1 triple** — a stronger claim than the one it replaces,
  and still a positive one, so it is not an absence-only escape. Every citation holds at branch head:
  TSPEC §4.3's "(A1, A3) supplies `permittedActions: []` and an `apply` that is never reached — the
  §5.1 gate refuses first" (`TSPEC:423`), the §5.5 gate table's A1 row (`TSPEC:638`) and its A3 row's
  literal "unreachable (`permittedActions: []`)" (`TSPEC:640`), and PLAN A-23's matching implementation
  spec (`PLAN:274`). The §12.1 `AC-4.5` and `AC-4.6` rows still carry the full `PROP-GATE-01 …
  PROP-GATE-05` range, so no AC lost a property; only the shape of two of the five changed.

- **§10.1's PROP-DIS-06 rewrite found a real upstream defect by transcribing instead of paraphrasing,
  and I could reproduce the whole argument mechanically.** TSPEC §11.1 asserts "a grep for
  `advisory.enabled` returning exactly three sites" (`TSPEC:1245`) — but that literal token appears at
  exactly one of the three sites it counts, because the driver's test is written `config.enabled ===
  false` (`TSPEC:1241`), the notice gate `advisory.config.enabled` (`TSPEC:286`), and only the §9.3
  distil guard `advisory.enabled` (`TSPEC:1113`). I verified all four line citations verbatim. The
  property now transcribes the matcher it will actually run (`/\.enabled\b/`), enumerates the counted
  set, excludes `parseAdvisoryConfig` **with its own non-empty-slice control** so the exclusion cannot
  silently swallow the whole file, and grounds the baseline: `grep -c '\.enabled\b'` over
  `orchestrate-dev.js` and `orchestrate-queue.js` at branch head returns **0** and **0**, which I ran
  and confirmed, so the expected count is determined entirely by this feature's own sites. That is a
  count an operator can trust because nothing pre-existing can perturb it.

- **The self-inclusive-scan collision was solved by moving the fixtures, and the rejected alternative
  is written down.** PROP-INFRA-01 and PROP-REG-08 both scan files they themselves live in, so a
  forbidden literal written inline is indistinguishable from the violation it proves detectable. §2.1
  moves the control strings into `fixtures/scanFixtures.js`, argues the path is outside **both** globs
  *by construction* rather than by convention ("no naming discipline has to be remembered for it to
  stay outside"), and explicitly rejects the runtime-fragment-assembly alternative with the reason a
  reader would otherwise have to discover — a scan hardened against fragment assembly would match the
  control itself. §10.3 was updated to consume the same module. One convention, two properties, and
  the reasoning survives for the next source-scan oracle someone writes.

- **The new file's missing ownership row was routed upstream instead of being absorbed — and the
  routing is accurate.** §13.1 item 5 states that `fixtures/scanFixtures.js` has no PLAN ownership row
  and names the consequence precisely: `validatePlanContract` is what enforces it and the row must
  exist **before Phase I**. I checked: `grep -n "scanFixtures" PLAN-pdlc-advisory-tier.md` returns
  nothing, PLAN §4's manifest names `fixtures/created-files-26c3f1c.json` (A-15) as its only fixture
  row (`PLAN:322`), and A-01's manifest row lists `advisoryPreflight.test.js` alone (`PLAN:308`). This
  is the failure mode that would otherwise be discovered as a file the wave gate declines to commit
  because no task owns it — caught at authoring time and handed to the PLAN author, with the proposed
  owner named but the decision left where it belongs. §12.3's table carries the same status honestly in
  the row's own Creating-task cell ("**no PLAN ownership row yet**"), so the gap is visible from the
  file inventory too, not only from §13.1.

- **§12.3's inventory arithmetic was re-derived, not restated, and it is right.** The revision changes
  "all fourteen below are new" to "all **fourteen** `*.test.js` files below are new … as are the three
  non-collected rows beneath them (one helper module, two fixtures)". I counted the table: fourteen
  `*.test.js` rows, plus `helpers/advisoryDoubles.js`, `fixtures/created-files-26c3f1c.json` and
  `fixtures/scanFixtures.js` — one helper module and two fixtures, exactly as stated. Adding a row to
  an inventory table whose count is quoted in the prose above it is precisely where a document usually
  drifts; this one did the recount.

- **The two matrix repairs close the audit's last blind spot in the direction that matters.**
  PROP-BUD-03's driver half is now named in the §12.1 `A-07` and `A-22` rows and in `advisoryDriver.
  test.js`'s §12.3 Property-families cell, with the arithmetic half left where it was (A-05). The block
  name matches PLAN A-22's own text, which un-skips "`A-22 — driver lifecycle` only" (`PLAN:274`). A
  property split across two files was previously auditable from one of them; it is now auditable from
  both.

## Recommendation

**Approved with minor changes** — zero High, zero Medium, one Low.

My single v2 Low is resolved, and resolved beyond the correction it asked for: the `T-06-7` exception
to §12.4's set-equality audit is now pinned to one declaration site with a stated occurrence count, and
I reproduced that count (exactly 2, at `PROPERTIES:661` and `:1062`) rather than taking it.

Nothing in this round touches the product surface. No property was added, removed or re-levelled — I
re-counted the 183 table rows myself — so no acceptance criterion gained or lost an obligation, and
§1's and §12.3's level budget is unchanged and still internally consistent. The one oracle change that
*could* have narrowed an acceptance criterion — moving A3 out of PROP-GATE conjunct 1 — replaces it
with the strictly stronger unreachability form asserted positively, keeps AC-4.5 and AC-4.6's full
`PROP-GATE-01 … PROP-GATE-05` ranges in §12.1, and grounds the change in four upstream citations I
verified verbatim (`TSPEC:423`, `:638`, `:640`, `PLAN:274`). No scope was added that the REQ does not
carry, no criterion was reinterpreted, and no settled decision was re-opened.

The two new upstream items were routed rather than absorbed, which is the behaviour I want to keep
seeing: item 5 names the missing `fixtures/scanFixtures.js` ownership row and the gate that will
enforce it, and item 6 names TSPEC §11.1's grep token as falsified by TSPEC's own code shapes. Both are
true as stated — I confirmed item 5 against PLAN §4's manifest and item 6 against all four TSPEC lines
— and in both cases the property was restated at a surface that is correct under either resolution, so
neither blocks Phase I.

F-01 is a one-clause citation correction in §2.1 (`PLAN §2.2, A-00` ⇒ `PLAN §2.2, enforced by the §2.4
operator pre-flight step`, since PLAN v1.2 deleted A-00) and does not gate approval. Please fold it
into the next touch of §2.1.

No new errata from me. The six items §13.1 routes are the author's to emit; I re-confirmed items 5 and
6 against the PLAN and TSPEC at branch head and have nothing to add to them.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
