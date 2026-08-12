# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.5)
**Date:** 2026-08-11
**Iteration:** 4

**Scope:** Delta re-review only. `git diff 4c89a75a..HEAD` on the document shows the v1.4 and
v1.5 change notes, DEC-ENG-03's authority paragraph and both deferred bullets, DEC-ENG-05's
predicate blockquote and its new structural-scoping paragraphs, DEC-ENG-10's new paired-direction
paragraph, DEC-ENG-13's new boundary paragraph, and four §7/§8 rows. Round-3 findings are
dispositioned below; unchanged sections already approved are not re-litigated. Every claim is
grounded at HEAD on `feat-pdlc-headless-engine` with `file:line`.

## Round-3 disposition

| Prior finding | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 (§8's blocked-on-upstream row not re-synced after C-11 landed) | Medium | **Resolved** | The row is rewritten to "No longer blocked — every upstream authority has landed and PLAN inherits a settled shape", citing C-11, BR-GUARD-6, rung 4a, EC-START-10/11 and TSPEC §7.8 (`DECISIONS:930`). Each citation re-derived: `REQ:284-298` v0.10; BR-GUARD-6 at `FSPEC:921-943`; the rung-4a ladder row at `FSPEC:307`; EC-START-10/11 at `FSPEC:416-417`; `AT-ENG-11a` at `FSPEC:977`; the C-11 traceability row at `FSPEC:1386`. The paragraph's own falsifiable claim — "every earlier version reported zero hits for `python|interpreter` in FSPEC; at HEAD the same grep returns eleven" — is exactly right: `grep -icE "python\|interpreter"` over `FSPEC-pdlc-headless-engine.md` returns `11`. |
| F-02 (containment quantifier over-scoped; `meta.name` literals collide) | Medium | **Resolved in direction, superseded in detail** | The predicate is now structural, and the two collisions are handled by scoping rather than exemption: `name: "orchestrate-dev"` (`orchestrate-dev.js:3316`), `name: "orchestrate-queue"` (`orchestrate-queue.js:45`) and the reviewer-role map (`orchestrate-dev.js:6229-6231`) all verified at HEAD, all outside the four classes. The quantifier no longer scores red on correct code for *that* reason. It scores red for a new one — see F-01 below. |
| F-03 (filtered-run skip had no positive counterpart) | Medium | **Resolved** | DEC-ENG-10 gains a paired-direction paragraph (`DECISIONS:676-685`): an unfiltered run must assert step 4 *ran*, "carrying a pass rather than a skip and not silence", with `npm test` named as the unfiltered case. This is a positive assertion on the same path as the negative one, not an absence-only restatement — it is what the round-3 finding asked for. |
| F-04 (no scheduling clause for the interpreter probe's PROPERTIES rows) | Low | **Resolved** | Recorded as discharged rather than imposed: "the erratum landed at FSPEC v1.7, and the probe's PROPERTIES rows can be written against `AT-ENG-11a` and TSPEC §7.8's two fixtures now" (`DECISIONS:930`). Both fixtures exist (`TSPEC:2171`+). |

All four round-3 findings are closed. The new High below is not a carry-forward: it is introduced by
this round's DEC-ENG-05 edit, which was written against TSPEC v1.7 and landed ten minutes after
TSPEC v1.8 superseded the rule it transcribes.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DEC-ENG-05's re-synced predicate transcribes TSPEC v1.7's rule and census, both of which TSPEC v1.8 replaced *before* this edit landed — a test written from DECISIONS is red on correct code at HEAD, which is the F-40 defect one layer down.** Two concrete divergences, both test-side literals. (a) **The unresolvable-site rule.** DECISIONS' blockquote states "A site the extractor cannot resolve to a literal or a module-level constant is a **failure**, never a skip" (`DECISIONS:414-421`). TSPEC v1.8's F-44 entry retires exactly that rule: classes 3 and 4 now require a literal or module-level constant, and **indirect dispatch (parameter, local, or member expression) is neither a site nor a failure** (`TSPEC:26-36`, `TSPEC:579-591`), because "the derivation already governs those values at their source". Eleven indirect positions exist at HEAD — `skill: reviewers[0]`/`[1]` (`orchestrate-dev.js:5909`, `:5910`), `skill: authorSkill` (`:9288`), `skill: dispatch.creator` (`:9528`), and seven variable-argument dispatches (`:5573`, `:5579`, `:5585`, `:5876`, `:7124`, `:7463`, `:9244`). Under DECISIONS' rule as written, all eleven are failures, so the guard is **permanently red on correct code** — the precise failure mode TSPEC's F-44 identifies and this entry's own v1.4 change note claims to have escaped. (b) **The census.** DECISIONS asserts "7 / 28 / 1 / 11 = 47 sites at HEAD after the edit, **enumerated in TSPEC §3.3**" (`DECISIONS:435-437`). TSPEC §3.3 at HEAD enumerates **7 / 28 / 1 / 12 = 48 direct plus 11 indirect** (`TSPEC:570-579`), the twelfth direct site being `_agent(ADVISORY_RUNG_SKILL, …)` (`orchestrate-dev.js:1841`), "which obeys the rule and was previously absent from the eleven". The census is explicitly "a test-side transcription" (`TSPEC:591`) — an implementer transcribing 47 from DECISIONS and 48+11 from TSPEC has two literals for one assertion and no way to tell which is the spec. This is not a stale pin; the ordering is checkable: TSPEC v1.8's §3.3 rescope committed at `a9e17ee2` (17:00:04) and the DECISIONS re-sync at `a8626ee2`/`449d49e2` (17:11–17:13). **Fix:** re-sync the blockquote's third sentence to TSPEC's three-outcome rule (site / indirect / failure), correct the census to `7 / 28 / 1 / 12 = 48` direct plus 11 indirect, and move the upstream pin to TSPEC v1.8. The decision itself does not change — only the numbers and the rule a test copies. | DEC-ENG-05, §7 row, header pin |
| F-02 | Medium | Local | **The §7 row's site-class enumeration lists five members under the label "four enumerated site classes" — a set-equality failure in the row that this round re-synced.** `DECISIONS:934` reads: "every skill identifier appearing at one of **four enumerated site classes** — a `DISPATCHABLE_SKILLS` member declaration, a module-level `SKILL_*`/`ADVISORY_RUNG_SKILL` constant, a `PHASE_DISPATCH` role field, a `skill:` object field, or the skill argument of a dispatch call". That is five items; the entry body and TSPEC §3.3 both carry four (constant declaration, `PHASE_DISPATCH` role field, `skill:` field, dispatch-call argument — `DECISIONS:415-419`, `TSPEC:522`). The extra "`DISPATCHABLE_SKILLS` member declaration" belongs to no census class: class 1's count of 7 is `SKILL_*` constants plus `SKILL_TRIAGE` (`TSPEC:572-573`), not union members. A reviewer checking the row against the body by set-equality — the check this row exists to make possible — gets a mismatch, and the re-evaluation trigger ("a fifth site class appears") reads as already fired. Strike the first item, or state why it is a class and give it a census figure. | §7 collated table, DEC-ENG-05 |
| F-03 | Medium | Local | **DEC-ENG-13's new boundary paragraph exempts the suite runner's diagnostics from the catalogue, but the exemption is stated by author rather than by predicate, and its worked example is the one string a test must match on.** The rule given is "a string is a catalogue member if it can be read by an operator who never runs the suite" (`DECISIONS:823-826`) — sound and usable. The worked case, though, is DEC-ENG-10's filtered-run skip reason *and its paired step-4-ran line*, and DEC-ENG-10 now obliges a test to assert that the unfiltered run "carries a pass rather than a skip" (`DECISIONS:682-684`). Something must assert against those two lines, so they are un-catalogued *and* oracle-bearing at once. That is defensible but unstated: nothing says where the expected text for those two assertions is pinned, so PLAN can write the assertion against a string literal duplicated in the test, and the next reflow of the runner's output silently drops the only proof that the detector is falsifiable in both directions. One sentence — the runner's two diagnostics are pinned in `_run-suite.mjs` and asserted by exact match, catalogue-free — closes it. | DEC-ENG-13, DEC-ENG-10, §7 |
| F-04 | Low | Local | **The v1.5 change note says "the upstream pin moves to FSPEC v1.7" and is silent on TSPEC, while the header table pins TSPEC v1.7 and §0 opens "TSPEC v1.7 fixes the mechanism" (`DECISIONS:9`, `:72`).** TSPEC is at v1.8 at HEAD (`TSPEC:16`), and v1.8 is not a cosmetic round — it carries the F-44 rescope this review's F-01 turns on, plus §7.8's EC-START-11 branch now asserting rung 5 positively with `state === "pass"` rather than `state !== "skipped"` (`TSPEC:37-40`), which is an oracle change DECISIONS' §7.8 citation inherits. Fold the pin correction into F-01's edit rather than treating it as separate bookkeeping. | Header table, §0, change note v1.5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | When the census is corrected per F-01, should DECISIONS carry the figures at all, or cite TSPEC §3.3 as their sole home? Two documents holding the same test-side transcription is how this round's divergence happened; a single citation cannot desync. The decision (census as a second conjunct) survives either way. |
| Q-02 | Carried from rounds 2–3, still open, still not blocking: whether a mis-built hook path yields an explicit `allow` verdict or an execution error (DEC-ENG-11's mis-built-configuration arm), and whether DEC-ENG-04's red fixture reads the running platform/transport pair from the process or from fixture data. Both become unavoidable when the PROPERTIES rows are written; neither changes a decision here. |

## Positive Observations

- **DEC-ENG-03's landing paragraph is the strongest thing in this revision, and it is honest about
  its own history.** It does not quietly delete the "zero hits" claim it made twice — it states that
  the claim was true in v1.2, half-corrected in v1.3, and is now false in its other half, then
  replaces it with five citations that all re-derive at HEAD (`FSPEC:307`, `:416-417`, `:921-943`,
  `:977`, `:1386`). I re-ran the grep it stakes itself on and got eleven, the number it predicts.
- **The two deferred bullets were resolved rather than deleted, and the entry says why.** Keeping
  "recorded here as resolved rather than deleted, so the next reader can see the decision did not
  grow to cover what it had deferred" (`DECISIONS:255-257`) is the right instinct: a decision that
  silently absorbs what it once deferred is indistinguishable from one that never deferred anything.
- **The rung-4a resolution is credited to upstream as a third option neither side named.** The entry
  had hedged between "rung 6" and "rung 5 redefined"; FSPEC chose 4a, and DECISIONS records the
  choice as better than its own two, with the cost it anticipated landing on the type
  (`RUNG_ORDER` at `TSPEC:1029`, "cannot express `4a`" at `:1039`, "always all seven" at `:1022` —
  all three line citations exact). Reviewers rarely get to check three line numbers and find three
  hits.
- **DEC-ENG-10's new paragraph is a properly falsifiable pair, not a restatement.** "One direction
  proves the detector fires when it should; the other proves it does not fire when it should not"
  (`DECISIONS:685`) is the shape an absence-only oracle finding is supposed to produce, and the
  positive half names a concrete observable (a pass in the run summary under bare `npm test`),
  not a mood.

## Recommendation

**Needs revision**

One High. The decisions in this document are sound and unchanged — nothing here contests a choice.
The blocker is that DEC-ENG-05's re-synced text transcribes a rule and a census that TSPEC v1.8
retired ten minutes before this edit committed, and both are literals a test copies: the
unresolvable-site rule turns eleven correct HEAD sites into failures, and the census says 47 where
TSPEC §3.3 says 48 direct plus 11 indirect. PLAN and PROPERTIES read this document for exactly those
numbers, so the divergence ships a red-on-correct-code guard or an arbitrary choice between two
specs. The fix is mechanical and does not reopen the decision: adopt TSPEC's three-outcome rule
(site / indirect / failure), correct the census figures, and move the pin to TSPEC v1.8.

The three non-gating findings are one-sentence edits: reconcile the §7 row's five-item list with the
four-class body (F-02), say where the suite runner's two diagnostics are pinned given they are
un-catalogued but oracle-bearing (F-03), and fold the TSPEC pin correction into F-01's edit (F-04).

No upstream erratum is filed this round. The divergence is DECISIONS trailing TSPEC, not TSPEC being
wrong: TSPEC v1.8's §3.3 is the correct version of the rule, and §3.3 already states "DEC-ENG-05
moves with it" (`TSPEC:567`).

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}

