# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 4
**Scope:** Local (unless a finding row says otherwise)
**Delta base:** `fd4bced` (the commit my v3 review was written against, per the v3 `REVIEWED-COMMIT`
anchor) → `08925cf` (`docs(properties): R-3 — close the scanFixtures.js open erratum`; v1.2 → v1.3).
`git diff fd4bced HEAD -- docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md` is one commit
touching three places: the header block, §12.3's `scanFixtures.js` owner cell, and §13.1 item 5.

The delta window also moved two **upstream** documents this one cites by line — TSPEC to v1.3 (five
erratum commits, `77f81ca` … `2e8227e`) and PLAN to v1.9. Citation re-grounding against those two is
in scope for this round, because the bytes the citations point at changed after my v3 pass.

## Disposition of v3 findings

Two of the three are closed. One is still open verbatim, and the upstream erratum round has since
made it worse rather than stale — it is re-filed at a higher severity as v4 F-01, not carried at Low.

| v3 | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | Low | **Open, and superseded by v4 F-01** | §6.5 is byte-identical: line 534 still reads "Two conjuncts, both required", and conjunct 2 (line 546) still reads "Replacing the gate with `async () => ({ passed: true })` must make the case fail" with no A1/A3 carve-out. In v3 this was Low because the closing paragraph ("neither has a post-action gate to stub") let a careful implementer infer the right thing. That inference is no longer sufficient: TSPEC v1.3 turned A1's and A3's `verifyGate` into a normative **`null`** and named the passing stub as a shape that "must not appear as a shipped implementation" (`TSPEC:655`, `:657`), and PLAN v1.7's §8.2 T-03-6 row now requires the **opposite** mutation direction at those two seams — install the stub, and the case must fail. See F-01. |
| F-02 | Low | **Half resolved** | (b) **Resolved, by the upstream fix.** §12.3's preamble ("all three non-collected rows … created by the 🔴 task named in PLAN §4's manifest", `PROPERTIES:1026-1028`) is now a true sentence: `helpers/advisoryDoubles.js` → A-02, `fixtures/created-files-26c3f1c.json` → A-15, and `fixtures/scanFixtures.js` → A-01 since PLAN v1.6 (`PLAN:308`). No qualifier is needed any more. (a) **Open.** §2.1 line 167 still cites "PLAN §2.2, `A-00`" for the jest exclusion; A-00 remains deleted (PLAN v1.2 changelog, `PLAN:1020`) and PLAN §2.2 is still `BL-PREREQ — the baseline symbols A-01 asserts` (`PLAN:85`). Re-filed as F-04. |
| F-03 | Low | **Resolved** | §13.1 item 5 was rewritten to a closure record and the misattribution is gone — the sentence "the manifest row must exist before Phase I, since `validatePlanContract` is what enforces it" no longer appears anywhere in the document. What replaced it is checkable and I checked it by executing the parsers over the amended PLAN rather than trusting the number: `parsePlanTasks` → 36 tasks, `parsePlanOwnership` → 36 rows, `validatePlanContract` → `{"ok":true}`, and A-01's row is `{"taskId":"A-01","files":["pdlc/workflows/__tests__/advisoryPreflight.test.js","pdlc/workflows/__tests__/fixtures/scanFixtures.js"]}`. The PLAN side states the real enforcer correctly too — `PLAN:252` gives both mechanisms, the wave commit staging only `task.files` (`orchestrate-dev.js:8143-8159`) for the *file* and `validatePlanContract` for the *row*, which is the accurate split. |

## Findings

One Medium, four Low. The Medium is not a defect this revision introduced — it is a defect the
**upstream erratum round opened underneath this document** while §6.5 stayed still, which is exactly
the class a delta re-review exists to catch. Nothing else in the changed text is contested.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **PROP-GATE-01 and -03 (A1, A3) now have no mutation control at all, so the one shape TSPEC forbids passes the property set.** For A2/A4/A5 §6.5 keeps conjunct 2 — replace the gate with `async () => ({ passed: true })` and the case must fail. For A1/A3 the closing paragraph replaces both conjuncts with "`resolved` is unreachable on **every** path, and each path terminates in `escalated` or `no-action` with its own O-1 triple" (`PROPERTIES:570-572` — the exact lines PLAN A-07 cites back) and states "neither has a post-action gate to stub". Conjunct 1's substitute is fine — it is a positive assertion, not an absence-only oracle. Conjunct 2 has **no** substitute, and since TSPEC v1.3 that gap is load-bearing: A1's §5.5 row now reads "**`null`** — … Deliberately **not** `async () => ({ passed: true })`: that is the trivially-passing stub FSPEC T-03-6(b) treats as a falsifying mutation, so it must not appear as a shipped implementation" (`TSPEC:655`), A3's row is the same shape (`TSPEC:657`), and §4.3 makes it a type-level commitment — `@property {null \| (() => Promise<…>)} verifyGate` (`TSPEC:416`), "Those two seams also supply **`verifyGate: null`**" (`TSPEC:434`). A build that ships `verifyGate: async () => ({ passed: true })` at A1 is behaviourally indistinguishable at runtime (with `permittedActions: []` step 6 is unreachable, `TSPEC:438-439`), so **no** behavioural property can catch it — only a structural one. PLAN already requires that structural one and cites this document for the rationale: §8.2's T-03-6 row says "for A1 and A3, which declare none, the mutation is to **install** the stub, and the case must fail when installed. Both gateless rows assert `verifyGate === null`", and A-07's cell cites `PROPERTIES:570-572` (`PLAN:258`, `PLAN:869`). So PLAN's test author is told to write a case whose oracle PROPERTIES does not define, and PROPERTIES' own §6.5 still tells them the mutation control is the replace direction. **Fix:** in §6.5's A1/A3 paragraph, state the two conjuncts PLAN and TSPEC now agree on — (i) `seamOps.verifyGate === null` asserted directly, per seam, and (ii) installing `async () => ({ passed: true })` at A1 or A3 must fail the case (which conjunct (i) discharges) — and scope the "Two conjuncts, both required" opener to A2/A4/A5, which is the v3 F-01 clause folded in. | §6.5, PROP-GATE-01 / PROP-GATE-03 |
| F-02 | Low | Local | **§6.5's three TSPEC quotations no longer appear in TSPEC, and none of the three line numbers resolves.** All were correct when I verified them in v3; the TSPEC v1.3 erratum round (`77f81ca` … `2e8227e`, all inside this delta window) moved and rewrote them. (a) "(A1, A3) supplies `permittedActions: []` and an `apply` that is never reached — the §5.1 gate refuses first" cited as `TSPEC:423` is now at `TSPEC:432-433`; the text survives, only the line moved. (b) "A1's `verifyGate` as `permittedActions: []` means the gate is unreachable anyway (`TSPEC:638`)" — that string no longer exists in TSPEC at any line; A1's §5.5 row is now `TSPEC:655` and reads `null` (see F-01). (c) A3's "unreachable (`permittedActions: []`)" cited as `TSPEC:640` is likewise gone; A3's row is `TSPEC:657`, "**`null`** — same shape as A1". `TSPEC:638`/`:640` today fall inside §5.4's prohibition prose, not the gate table (`TSPEC:648-660`). The conclusion §6.5 draws from these quotes is unchanged and is now *better* supported than before — I am not contesting the substance, only that an implementer following the citation lands in the wrong section. `PLAN:274` (A-23's "A3's `permittedActions: []` with throwing `apply`/`revert` stubs") still resolves exactly. **Fix:** re-quote from `TSPEC:432-433`, `:655`, `:657`. | §6.5 |
| F-03 | Low | Local | **§2.1's closing sentence contradicts the two places v1.3 updated.** Lines 177-179 still read "`fixtures/scanFixtures.js` is a new file this feature must create, and **it has no PLAN ownership row — routed upstream as an erratum (§13.1 item 5), not absorbed**." v1.3 closed exactly that erratum: §12.3's cell now reads "A-01 (PLAN §4 manifest row, since PLAN v1.6)" and §13.1 item 5 is a closure record. The revision updated the two sections it set out to update and left the third statement of the same fact behind. Nothing downstream reads §2.1 for ownership, which is why this is Low — but it is the sentence a Phase-I author hits first, and it tells them a row they need is missing. **Fix:** replace the clause with the closed form: owned by A-01, `PLAN:308`. | §2.1 |
| F-04 | Low | Local | **Carried from v3 F-02(a), unchanged: the jest-exclusion citation still does not resolve.** §2.1 line 167: "`__tests__/fixtures/` is already excluded from jest's collection (PLAN §2.2, `A-00`)". The fact is true — `pdlc/workflows/package.json:18-22` lists `"/node_modules/"`, `"/__tests__/helpers/"`, `"/__tests__/fixtures/"` under `testPathIgnorePatterns` — but A-00 was deleted in PLAN v1.2 (`PLAN:1020`) and PLAN §2.2 is `BL-PREREQ` (`PLAN:85`). The exclusion is explained in PLAN §2.4 at `PLAN:138-141`. **Fix:** cite `pdlc/workflows/package.json` directly — it is the primary source and cannot go stale under a PLAN revision — with `PLAN:138-141` as the secondary. | §2.1 |
| F-05 | Low | Local | **§13.1 item 6 reports an upstream defect that the same erratum round already fixed.** The item closes "TSPEC §11.1's own sentence still needs the same correction, and the choice of matcher there should match" (`PROPERTIES:1140-1141`). TSPEC v1.3 made that correction and chose the same matcher this document did: `TSPEC:1263-1270` now reads "The three sites do not share a literal spelling … so a grep for the token `advisory.enabled` finds one site, not three. The assertion is a **source-text scan for `/\.enabled\b/`**", over the same two-module file set, excluding `dist/*.bundle.js`, "and it must return **exactly three** matches" with the same enumerated three. Item 6 is now the only open-erratum row in §13.1 that is not actually open, which will cost the next reader the same verification it cost me. **Fix:** convert it to a closure record the way item 5 was, citing `TSPEC:1263-1270`. The same rewrite should re-ground item 6's other four TSPEC line numbers (`:1245`, `:1241`, `:286`, `:1113`), which the v1.3 erratum round moved along with the sentence. | §13.1 item 6 |

## Questions

v3's Q-08 was not touched by this revision, which is reasonable — it asked about a *future* fourth
`.enabled` read on the queue side, and §10.1 already states the procedure for handling one if it
appears. I carry it forward unanswered rather than re-file it, and it blocks nothing. One new
question, from the erratum round rather than from this revision.

| ID | Question |
|----|---------|
| Q-08 (carried) | PROP-DIS-06 counts `/\.enabled\b/` over both modules and expects three, while TSPEC §3.2's C-3 row says `readAdvisoryConfigSafely` is "called once in each `main()`". If the queue's run report is ever expected to carry the C-2 substitution notice, its emit gate is a fourth read and the expected total becomes four. Is the queue's silence on the substitution notice a deliberate D-5 consequence, or the gap that produces the "legitimate fourth read" §10.1 tells Phase I how to handle? |
| Q-09 | TSPEC §4.3 now types `verifyGate` as `null \| (() => Promise<{passed: boolean, detail?: string}>)` (`TSPEC:416`) and asserts "the driver reaches `verifyGate` only on a seam whose `permittedActions` is non-empty, so the nullable member is never invoked as `null`" (`TSPEC:438-439`). That is a driver invariant, not a `SeamOps` one, and today only A1/A3 exercise it. Does the property set want one case pinning it directly — a seam constructed with `verifyGate: null` **and** a non-empty `permittedActions` must not throw a TypeError at step 6 but take a defined path — or is it deliberately left to F-01's structural `verifyGate === null` assertion plus PROP-LIFE-*'s step ordering? Either answer is fine; I ask because the invariant is the one thing standing between `null` and a crash if a later seam is added with a permitted action and no gate. |

## Positive Observations

- **The closure was recorded, not deleted.** The easy edit was to strike §13.1 item 5 now that the
  PLAN row exists. Instead the item was rewritten in place as "Closed — … Kept only as a closure
  record so no later reviewer re-raises it", which is the version that pays off: the next reviewer
  reads one sentence instead of re-deriving whether a fixture module needs an owner. That is the
  pattern F-05 asks item 6 to follow, so the document has already demonstrated the fix it needs.
- **The claim carries its own verification, and the verification holds.** "`validatePlanContract`
  passes over the amended manifest (36 tasks, 36 rows, `{"ok":true}`)" is a statement I could check
  mechanically rather than by reading, and I did — `parsePlanTasks`/`parsePlanOwnership`/
  `validatePlanContract` executed over `PLAN-pdlc-advisory-tier.md` return exactly those three
  values, with `scanFixtures.js` on A-01's row. It is also the *right* claim to make now: it no
  longer offers `validatePlanContract` as the thing that enforces the **file**, which was v3 F-03.
- **The erratum was routed and then closed by the upstream author, end to end.** §13.1 item 5 asked
  for an A-01 assignment without making it; PLAN v1.6 made exactly that assignment, with the batch-1
  shared-prerequisite justification (batch-safety rule 4) and both real mechanisms cited —
  `orchestrate-dev.js:8143-8159` for the file, `validatePlanContract` for the row (`PLAN:252`). The
  round-trip is the erratum channel working as designed, and it is worth naming as a positive
  precedent for the remaining open items.
- **The revision changed nothing it did not have to.** The header note says "no property, oracle, or
  count changed", and the diff bears that out: three hunks, none touching a property statement, and
  §12.3's level totals line (148 Unit / 40 Integration / 7 both / 0 E2E) is byte-identical. A
  closure edit that silently re-levels a property or perturbs a count is how a converged document
  un-converges; this one did not.

## Recommendation

**Needs revision**

> Any High or Medium finding → Needs revision. 0 High, 1 Medium, 4 Low.

The v1.3 edit itself is correct and I would have approved it on its own: both v3 findings it set out
to close are closed on the substance, the one number it asserts is one I re-executed rather than
read, and it perturbed no property, oracle or count. What forces revision is not this edit but what
moved underneath the document while it was being made — TSPEC v1.3's five erratum commits landed
inside the same delta window and turned A1's and A3's `verifyGate` into a normative `null` with the
passing stub explicitly named as a shape that must not ship. §6.5 was written against the previous
TSPEC and has not been re-read since.

Four things close this round, and none of them is a design change:

1. **F-01 (Medium) — give A1/A3 a mutation control.** With `permittedActions: []`, a passing-stub
   `verifyGate` at A1 is behaviourally invisible (`TSPEC:438-439`), so only a structural assertion
   can catch it. Assert `seamOps.verifyGate === null` per gateless seam, state that installing
   `async () => ({ passed: true })` must fail the case, and scope the "Two conjuncts, both required"
   opener to A2/A4/A5. PLAN §8.2's T-03-6 row and `PLAN:258` already specify this and cite
   `PROPERTIES:570-572` for the rationale; the oracle just has to exist where the test author looks
   for it. This also subsumes v3 F-01, so it is one edit, not two.
2. **F-02 (Low) — re-quote §6.5's three TSPEC citations** at `TSPEC:432-433`, `:655`, `:657`. Two of
   the three quoted strings no longer exist in TSPEC at any line. `PLAN:274` still resolves exactly
   and needs no change.
3. **F-03 / F-04 (Low) — two sentences in §2.1.** Strike the "no PLAN ownership row … not absorbed"
   clause (closed at `PLAN:308`), and repoint the jest-exclusion citation from the deleted `A-00` to
   `pdlc/workflows/package.json:18-22`, which is the primary source and cannot go stale.
4. **F-05 (Low) — close §13.1 item 6** the way item 5 was closed: TSPEC §11.1 now carries the
   `/\.enabled\b/` matcher and the counted set of three (`TSPEC:1263-1270`), so the item records a
   closure rather than an open defect, and its four other TSPEC line numbers get re-grounded in the
   same pass.

All four are text edits to two sections; no property statement, level, count or traceability row
moves. I expect this to converge in the optimizer pass. **No errata are emitted this round** — the
two I routed in v3 (TSPEC §11.1's grep assertion, PLAN §4's missing `scanFixtures.js` ownership row)
have both been fixed upstream and verified here, and every finding above is a defect of this document
rather than of one it derives from.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 4}
