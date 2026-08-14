# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.3)
**Date:** 2026-08-13
**Iteration:** 3
**Scope:** Delta re-review. Product lens only — traceability, scope compliance, acceptance-criteria
fidelity. Diffed `b8b7b2c9..HEAD` on the PLAN (88 insertions, 26 deletions: §1.2, ten §2 rows, four
§2.1 rows and its closing prose, §4 kind-1 and kind-5, §5 points 1 and 4, §6 Rule 3, §7 items 2, 4,
14 and the not-in-scope paragraph).

## Round-2 findings disposition

| Round-2 | Severity | Status | Evidence in v0.3 |
|---|---|---|---|
| F-01 preservation floors understated | High | **Resolved, and measured rather than counted** | Every number I asked for is now in the document and every one of them is right. I re-ran the runner at HEAD: `run.test.js` → `# tests 21`; `skills-composition.test.js` → `# tests 32` from 14 `test(` call sites (twelve top-level plus the two `for … of DISPATCHABLE_SET` sweeps at `:82` and `:166`, ten members each: 12 + 20 = 32); `engine-config.test.js` → `# tests 9`. §5.1 and DoD item 2 now carry exactly those, and item 2 states the floor as "≥ 32 tests from ≥ 14 call sites", which is the form that survives the deletion it guards. |
| F-02 §2/§2.1 disagree in seven rows | Medium | **Resolved on 34 of 35 rows; one declared carve-out** | I re-derived the transpose of §2's trailing lists mechanically and compared it to §2.1: 34 ids match exactly in both directions. The seventh row was fixed at the right end in five of six cases. The remaining delta is T31 under AT-3.8a, which §2.1 declares as a deliberate asymmetry — see F-04, and F-02 for the one case I think was closed at the wrong end. |
| F-03 AC-4.4's narrowing undeclared | Medium | **Resolved as offered** | I asked for either automation or an honest declaration; the plan chose the declaration and argued it. §1.2 gains a paragraph naming the reason (folding a P0 criterion into T50's capability-gated legs puts it behind a gate that can legitimately skip), T56's cell states the limit the way T51 states AT-6.2's, and §7's not-in-scope paragraph names AC-4.4 alongside AC-6.2. |
| F-04 `run.test.js:45-79` anchor spans three tests | Low | **Resolved, more precisely than I stated it** | §5 point 4 now anchors C-4 at `:51-65` and the other two at `:41-49` and `:67-79`. Read at HEAD: the C-4 test opens at `:51` and its closing `});` is `:65` — the plan's `:51-65` is right and my `:51-64` was one line short. |

All four are closed. Everything below is new and confined to text this round added.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **DoD item 14's answer to round-2 Q-01 makes every acceptance criterion of P0 REQ-EDIST-02 satisfiable without ever being observed, and the sentence that is supposed to catch that is false against item 15.** Item 14 now rules that a capability-gated leg which skips concludes `success`, so "the required check is green with recorded skips" — then says: "What the DoD then requires is item 15's evidence: the legs that skipped in CI are the ones the `[manual]` records cover." Item 15 enumerates exactly three evidence files, `EVIDENCE-AT-6.2.md`, `EVIDENCE-AT-4.4.md` and `EVIDENCE-BR-3.9.md`, covering AT-6.2, AT-4.4 and AT-3.1. The capability-gated legs are T50's: **AT-2.1, AT-2.3, AT-2.4, AT-2.5 and AT-2.6** — every criterion of REQ-EDIST-02 (`REQ:276`, *P0, Phase 1; US-01, US-02; G-2, C-2*) plus AT-2.5's below-floor leg. **Not one of them has an evidence file, and no other DoD item requires them to have run.** Item 12 states them as behaviour ("the fixture machine installs and upgrades recording two distinct pairs … runs the two-repo leg …"), but names no observation site whose absence is a failure; item 14 has just declared the only site green-when-absent. The composition is: `fixture-machine.yml` runs, every leg reports "capability unavailable", the check is green, items 12 and 14 are both satisfiable on paper, and AC-2.2's "both runs execute N+1 with no command executed inside either repo", AC-2.3's byte-identical tree and AC-2.4's below-floor refusal were never observed anywhere. REQ itself takes the opposite position on precisely this shape in AC-3.2: "a skipped or green-but-inert run is a defect, because it is indistinguishable from success" (`REQ:319`). So does this plan, one round ago and in its own voice: §1.2's new paragraph declines to fold AT-4.4 into T50 because that "would put a P0 criterion behind a gate that can legitimately skip, where a skipped run reads as 'not observed' rather than 'failed'. A dated document at least cannot silently skip." That reasoning is correct, and it indicts items 12/14 for five P0 criteria it was applied to protect one. *Fix:* make the observation obligation explicit rather than implied — either (a) DoD item 12 requires a named fixture-machine run in which the recorded-skip set for AT-2.1/2.3/2.4/2.5/2.6 is **empty**, cited by run URL, or (b) item 15 gains the dated evidence record that covers whichever of those legs skipped, and T50's cell names it as an output the way T51/T52/T56 name theirs. Either closes it; item 14's current sentence asserts (b) exists when it does not. | AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.5 (P0, REQ-EDIST-02) |
| F-02 | Medium | Local | **The §2/§2.1 reconciliation was closed at the wrong end for AT-3.1: a P0 criterion lost its red carrier and is now test-first nowhere.** §2.1's rule is sound — "an `AT-` id appears in a row's `Carried by` cell **iff** that task's trailing list names it", reconciling from §2 into §2.1 — and five of the six drops are right, because those tasks genuinely claim narrower sets. AT-3.1 is the exception. T58 was dropped from AT-3.1's carriers "because their own rows claim narrower sets", leaving `T49, T52`. But T49's own prose names the file that carries AT-3.1 and it is T58's file: "**AT-3.1** the green-gate publish, recorded by the S-5 stub — `publish-channel.test.js`". T58 is that file's `[red]` author at batch 2 (§3: `T58 | pdlc/engine/__tests__/publish-channel.test.js`); T49 is `[green]` at batch 5 and also lists the file in §3, so after this edit the AT-3.1 assertion is authored by the same task that implements `publish.yml` — the one arrangement §6 Rule 3 exists to forbid, on the criterion that *is* REQ-EDIST-03's headline (`REQ:312`, P0). The reconciliation rule did its job by surfacing the disagreement; the direction chosen turned a table defect into a coverage defect. Note the contrast with T18, where the same round fixed the disagreement by **adding** the trailing claim rather than deleting the row. *Fix:* close AT-3.1 the T18 way — add the **AT-3.1** leg to T58's enumeration (green gate over the S-5 stub ⇒ published, recorded, no human step; it sits naturally beside AT-3.2's red-member conjugate, which T58 already owns) and restore T58 in §2.1's AT-3.1 row. | AC-3.1 (P0, REQ-EDIST-03) |
| F-03 | Medium | Local | **The floor rule was applied to three of the five extended files, and §5.1 claims all five.** §5.1 now reads "All five numbers were measured with `node --test __tests__/<file>` at HEAD, not counted by eye" — but only three numbers appear: `engine-config.test.js` (`# tests 9`), `run.test.js` (`# tests 21`), `skills-composition.test.js` (`# tests 32` / 14 sites). `ci-arrangement.test.js` (T17) and `seam-contract.test.js` (T48) are listed with a task id and no count, and DoD item 2 likewise names floors for three files and none for those two. Measured at HEAD just now: `ci-arrangement.test.js` reports `# tests 6`, `seam-contract.test.js` reports `# tests 12`. Both are extended by tasks that change their subject matter substantially — T17 "absorbs V-19's older overlapping matrix assertions" and T48 rewrites the two hand-maintained key lists that `seam-contract.test.js:47,57` compare by `deepEqual` — which is exactly the profile where a whole-file rewrite deletes passing assertions and leaves the suite green. The defect class F-01 identified is unchanged; two of its five instances are still open, under a sentence saying they are not. *Fix:* state `≥ 6` for `ci-arrangement.test.js` and `≥ 12` for `seam-contract.test.js` in §5.1 and in DoD item 2, or drop the "all five" claim to the three it covers. | AC-3.4, AC-5.3 |
| F-04 | Low | Local | **§2.1's `iff` is stated as a rule and then exempted by prose, so the one check it was added to enable still fails mechanically.** I transposed §2's trailing lists and diffed against §2.1: 34 of 35 ids agree exactly, and the 35th is T31 under AT-3.8a, which §2.1 declares as "one deliberate asymmetry … a pointer, not a claim". The declaration is honest and the reason is real — T31's trailing cell reads `(AT-2.2, and REQ AC-1.5 for the pairing line — FSPEC carries AC-1.5's verifier test as AT-3.8a, which T16 owns)` — but the consequence is that anyone re-running the reconciliation the section describes gets one hit and has to read prose to learn it is intended, which is the same cost the table was added to remove. *Fix:* move the pointer out of the trailing parentheses into T31's description body so the trailing list is `(AT-2.2, AC-1.5)`, and the `iff` becomes literally true with no carve-out to remember. | AC-1.5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Round-2 Q-02 is still open and it is the one item that can stall Phase I from outside the plan. T05 is atomic and DoD item 16 requires the licence in `docs/_decisions/DECISIONS-plugin-distribution.md`, but the choice itself is an operator act, and nothing in the PLAN records where that obligation is tracked before batch 4 arrives. Is it a queue row, an escalation line, or is the intended answer simply "T05 blocks, the wave halts, the operator is asked then"? One sentence in §4's T05 note settles it either way — and if the answer is the third, saying so is fine. |

## Positive Observations

- **Every number this round asserts, I could reproduce, and each one is stated in the form that
  survives the deletion it guards.** 21, 32-from-14, 9, and the `:41-49` / `:51-65` / `:67-79`
  anchors all check out against HEAD. More than that, §5.1 now says *why* "three tests" and "twelve
  tests" were the wrong statements — "a rewrite keeping three `run.test.js` tests and deleting
  eighteen … satisfies the loose floor while doing exactly what it exists to prevent". That is the
  finding restated as a rule the next author can apply without me.
- **T18's pathspec tightening is the strongest single edit in the round, and it is measured.** I ran
  the new pathspec: 23 tracked files, and the three `claude plugin install` occurrences are all
  inside it (`README.md`, `pdlc/README.md`). The un-tightened form did admit fixture markdown,
  because `:(exclude)docs/` is root-anchored and never reaches
  `pdlc/engine/__tests__/fixtures/consumer-ac12/docs/`. The row states the false-red it prevents in
  product terms — a sample line in a corpus is not documentation drift — rather than just narrowing
  the glob.
- **§2.1's closing paragraph names a direction of authority, not just a fix.** "A row's trailing
  parenthesised list is the machine-readable claim, this table is its transpose, and reconciliation
  runs from §2 into §2.1" is a rule that survives the next seven disagreements. It also states which
  end each of the six drops was fixed at and why no acceptance test lost its last carrier — the
  check I would otherwise have had to do by hand. F-02 above is a disagreement about one of those
  six directions, not about the rule.
- **§1.2's AC-4.4 paragraph is a model of how to declare a narrowing.** It states the choice, the
  reason (a P0 criterion behind a legitimately-skippable gate reads as "not observed", not
  "failed"), the cost in one bolded sentence, the exact task list a hardcoded constant would slip
  past (T20, T27, T29, T35, T36, T38, T39, T42, T44), and the follow-on that would close it. A DoD
  reader now learns from the plan what they would otherwise have had to infer from an evidence file.
- **T44's round-2 correction went further than the question asked.** It does not merely record the
  `postWavePathspecs` precondition; it establishes that the key is already satisfied at HEAD, says
  the task therefore *verifies* rather than *adds* it, and draws the right consequence — the config
  file leaves the task's file set and §3 does not list it. I read `.claude/pdlc.config.json` at HEAD:
  `"postWavePathspecs": ["pdlc/workflows/dist/"]` and `"postWaveCommand": "node
  pdlc/workflows/build-runtime.mjs"` are both there, as stated.
- **§6 Rule 3's re-derivation now holds mechanically.** I checked every `[green]` row in §2 against
  §4's kind-1 table, allowing for the multi-green cells (T16 → T25/T33, T21 → T36/T39, T22 →
  T30/T35): every green task has a named red predecessor except T19 and T57, which are the two
  declared `[standing guard]` carve-outs. The T47 → T48 row that round 2 found missing closes the
  last gap.

## Recommendation

**Needs revision.**

All four round-2 findings are closed, and the two Highs across rounds 1 and 2 are closed for good.
The one blocking finding this round was introduced by the round itself: answering Q-01 in favour of
"a loud skip is green" removed the only pressure that made T50's legs run, and the sentence written
to compensate points at evidence files that do not cover them.

To close:

1. **F-01 (High) — make the fixture-machine observation obligation explicit.** Either DoD item 12
   requires a named run whose recorded-skip set for AT-2.1/2.3/2.4/2.5/2.6 is empty, or item 15
   gains a dated evidence record covering the legs that skipped and T50 names it as an output.
   Item 14's "the legs that skipped in CI are the ones the `[manual]` records cover" must not stand
   as written — item 15 covers AT-6.2, AT-4.4 and AT-3.1, and none of those is a T50 leg.
2. **F-02 (Medium) — restore AT-3.1's red carrier** by adding the AT-3.1 leg to T58 and putting T58
   back in §2.1's AT-3.1 row, rather than by leaving `T49, T52`.
3. **F-03 (Medium) — state the two missing floors**, `≥ 6` for `ci-arrangement.test.js` and `≥ 12`
   for `seam-contract.test.js`, in §5.1 and DoD item 2, or narrow the "all five numbers" claim.
4. **F-04 (Low) — remove the `iff` carve-out** by moving T31's AT-3.8a pointer out of its trailing
   citation list.

No erratum is raised this round: nothing in the changed text turns on a defect in an upstream
document, and §7's three open errata still gate Phase I as written.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
