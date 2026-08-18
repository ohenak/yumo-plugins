# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.7)
**Date:** 2026-08-17
**Iteration:** 7
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## v6 findings disposition

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v6.md`; `git diff 09319479..HEAD` on the
TSPEC (131 insertions / 56 deletions, one file, five commits `aab74001`…`5b9410a4`) scanned for new
issues. Unchanged sections already approved are not re-litigated.

| v6 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The "until the edit lands" framing is gone. §5.5 now reads "TT-1b's registered skip is accepted upstream; erratum 9 landed" and states TT-1b "satisfies AT-1.3 as approved" (TSPEC:814–825); §6.1 item 9 is retitled "RESOLVED UPSTREAM, FSPEC v0.7" and says "No action is outstanding on this item; it is retained for lineage" (TSPEC:1093–1109). Verified against FSPEC HEAD: the erratum row records the fold-in (`FSPEC-pdlc-plugin-retirement.md:843`) and AT-1.3 carries the narrowed clause (`FSPEC:622`–`:628`). |
| F-02 | High | **Resolved** | The exemption is restated records-keyed in all three places: TT-1b now reads "exempts a skip that reaches **the run's skip sink as a registered record** … not on `SKIP_INVENTORY` membership" (TSPEC:738), §5.5 carries a dedicated paragraph on the key (TSPEC:826–834), and §6.1 item 9 says "deliberately **not** keyed to `SKIP_INVENTORY` membership" (TSPEC:1102–1104). Matches `FSPEC:285`–`:292` and `FSPEC:622`–`:628` verbatim in substance. |
| F-03 | Medium | **Resolved** | §5.5's opening now scopes the prohibition to the swept surface and names pre-existing state as out of repair scope (TSPEC:807–813), and the oracle gains an explicit **Domain** bullet excluding `guardMatrix.test.js` (TSPEC:859–868). Verified at HEAD: `guardMatrix.test.js:325` is the `it.skip.each(NON_BESPOKE_BLOCK)` row and `:334` the `isLive(...) ? it : it.skip` ternary; `skipSink.js:19`–`:22` independently excludes them from the comparator's domain. |
| F-04 | Low | **Resolved** | The in-test registration branch and its dependence on `useSink`'s redirection are now stated in §5.5 (TSPEC:906–913). Verified: `skipSinkTransport.test.js:63`–`:68` repoints `PDLC_SKIP_SINK`, `:78`–`:82` restores it in `afterEach`. |

All four prior findings are closed. This round's findings are new, and all three arise from the same
place: §5.5 grew three new obligations (ten `hookCompatibility.test.js` conversions, a falsifying
fixture, a nested-run harness) whose ownership and cost are not yet reflected in the enumerations
downstream reads.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§2.9's class table — the enumeration the PLAN derives tasks from — still says "**one** added `SKIP_INVENTORY` entry", while §5.5 now requires eleven plus a new fixture file, and assigns ten of them to a class whose row names neither the file nor the edit.** §2.9's class-3 row reads "one added `SKIP_INVENTORY` entry in `__tests__/helpers/driftCapabilities.js` for TT-1b's root/`chmod 000` gap (§5.5)" (TSPEC:295, class-3 row); the class-6 row lists "20 of M-8's 21 `*.test.js` modules deleted … + `hookCompatibility.test.js` reduction + `driftGenerators.js` reduction" and names no edit to `driftCapabilities.js` (TSPEC:299). §5.5 now states the opposite: "The ten `hookCompatibility.test.js` conversions add ten `\"bash\"` rows to the same inventory; that module is an M-8 member reduced in place, so those rows are owned by its class-6 reduction, not by class 3 — but they land in `driftCapabilities.js`" (TSPEC:937–940), and the falsifying fixture "under `__tests__/fixtures/` is a **new** file … owned by the class-3 commit" (TSPEC:941–943). §5.4's per-commit replay treats an edit not named in its class row as an unowned edit — that rule is the reason §5.5 argues the single TT-1b entry into class 3 at all (TSPEC:925–929). So the document now contains a literal count (`one`) that its own §5.5 falsifies (eleven), and two obligations no class row carries. Product consequence: the PLAN is derived from §2.9, not from §5.5's prose. A PLAN that transcribes §2.9 faithfully omits the ten conversions and the fixture; implementation then reds AT-1.3 on any bash-less runner (the ten `(hasBash ? it : it.skip)(…)` sites at `hookCompatibility.test.js:84, :107, :132, :176, :202, :226, :335, :340, :353, :364` are bare and unregistered) or ships the join oracle with no falsifiability proof — either way an approved acceptance criterion goes unmet through a transcription that looked correct. Fix: update §2.9's class-3 row (drop "one", name the `__tests__/fixtures/` fixture) and its class-6 row (name `driftCapabilities.js` and the ten `"bash"` rows), so the table and §5.5 state the same edit set. | REQ AC-1.3, R-8; FSPEC AT-1.3, BR-SWEEP-6, L-5; TSPEC §2.9, §5.4, §5.5 |
| F-02 | Medium | Cross-Feature | **The ten-row widening breaks `SKIP_INVENTORY`'s own documented derivation rule, and §5.5 does not disposition the helper doc that states it.** `skipSink.js` documents the inventory as spec-derived and says widening it is out of bounds: "`SKIP_INVENTORY` is spec-derived — exactly TSPEC §1.3's table plus PROPERTIES §11.1's two leaves", and "Widening the inventory past the spec to close the gap would misrepresent TSPEC §1.3 and is a spec change, not a test change" (`skipSink.js:38`–`:46`). §5.5 adds one `uid-nonroot` row for TT-1b (TSPEC:925–935) and ten `"bash"` rows for `hookCompatibility.test.js` (TSPEC:937–940) — eleven rows derived from *this* feature's TSPEC, not from the spec that paragraph names. Nothing in the TSPEC says that header paragraph is updated, or why it stays true. Two costs, both product-visible: a surviving helper ships documentation that contradicts the code beside it, and the next maintainer reading that paragraph has a written basis to reject a correct registration. Severity is Medium, not High — no acceptance criterion is lost, and the header is a comment rather than an oracle — but the rule it states is exactly the kind of standing constraint this repo promotes to `docs/_constraints`, hence the Cross-Feature tag. Fix: name the `skipSink.js` header edit in §5.5 alongside the inventory rows, in whichever class owns them, and state the new derivation rule (spec table ∪ registered capability gaps owned by a named TSPEC). | FSPEC AT-1.3, BR-SWEEP-6; TSPEC §5.5, §2.9 |
| F-03 | Medium | Local | **§5.5 puts four modules in the swept surface as "hosts of R-8's re-homed assertions", but §4.4 resolves the re-homes to `consumerCleanup.test.js` alone — and the widening is what buys the ten conversions.** §5.5 enumerates the surviving half of the domain as "`consumerCleanup.test.js`, `hookCompatibility.test.js`, `orchestrateQueue.test.js`, `consolidationBuild.test.js`; §4.4 enumerates the re-homes" (TSPEC:807–810). §4.4 does not: TT-3's mode-bit re-home lands in `consumerCleanup.test.js` (TSPEC §4.4, "the re-home in §5.2's TT-3 is therefore a **widening**"), L-6 row 1 "resolves to **no re-homed assertion**" because `orchestrateQueue.test.js` already asserts the surviving half, and L-6 row 2 is transcribed as "host module retained, no move". `consolidationBuild.test.js` hosts TT-5, an extension of §3.1's emission contract (TSPEC:742), not an R-8 re-home; `hookCompatibility.test.js` hosts AT-3.3 clause 2's strengthening (TSPEC:745), also not an R-8 re-home. FSPEC's approved domain is "M-8's deleted modules and the surviving modules that host R-8's re-homed assertions" (`FSPEC:285`–`:288`, `FSPEC:622`–`:625`). Under §4.4's own resolution the surviving half is one module; §5.5's is four. The direction is safe (over-enforcement, nothing required is lost), but it is not free: it is precisely what pulls `hookCompatibility.test.js`'s ten skips into the surface and generates F-01's and F-02's obligations. The membership question is genuinely open upstream — `hookCompatibility.test.js` is an M-8 *member* that TSPEC retains and reduces (§6.1 erratum 6), so FSPEC's "M-8's **deleted** modules" does not decide it either way (see ERRATUM below). Fix: state in §5.5 which clause admits each of the four modules — M-8 membership for `hookCompatibility.test.js`, R-8 re-home for `consumerCleanup.test.js` — and either drop `orchestrateQueue.test.js`/`consolidationBuild.test.js` or say they are a deliberate TSPEC-side strengthening beyond AT-1.3's domain. | FSPEC AT-1.3, BR-SWEEP-6; REQ R-8; TSPEC §4.4, §5.5 |
| F-04 | Low | Local | **The falsifiability construction's harness needs a third override the TSPEC does not name.** §5.5's red construction "points the nested run at that fixture and asserts the join fails" (TSPEC:887–892), and the nested-run paragraph names two config departures the harness must make — `PDLC_SKIP_SINK` at a fresh temp path, and the nested run's `globalTeardown` "disabled or its sink copied before it deletes the file" (TSPEC:873–886). Verified at HEAD, a third is needed: `pdlc/workflows/package.json`'s jest block lists `"/__tests__/fixtures/"` in `testPathIgnorePatterns` (the same setting §5.5 relies on at TSPEC:941–942 to keep the fixture out of the real suite and out of L-5's count). Jest applies `testPathIgnorePatterns` to CLI path arguments too, so a nested `jest <fixture>` selects nothing and the "join fails" assertion would pass against an empty run — a vacuous red construction, the exact failure mode the paragraph exists to prevent. One clause naming the override (or a nested `--config`) closes it. | FSPEC AT-1.3; TSPEC §5.5 |

FINDING: High | delta | nonlocal | §2.9 class-3 and class-6 rows (TSPEC:295, :299) vs §5.5 (TSPEC:937–943) | table says "one added `SKIP_INVENTORY` entry" and names no `driftCapabilities.js` edit in class 6; §5.5 requires eleven rows plus a new fixture, so the PLAN's source enumeration omits work AT-1.3 needs
FINDING: Medium | delta | local | §5.5 inventory widening (TSPEC:925–940) | eleven new rows contradict `skipSink.js:38`–`:46`'s "spec-derived … widening is a spec change" rule; no helper-doc edit is dispositioned
FINDING: Medium | delta | local | §5.5 swept-surface enumeration (TSPEC:807–810) | names four surviving hosts of "R-8's re-homed assertions"; §4.4 resolves R-8 re-homes to `consumerCleanup.test.js` alone
FINDING: Low | delta | local | §5.5 falsifiability fixture (TSPEC:887–892) | nested run must also override `testPathIgnorePatterns` (`pdlc/workflows/package.json` jest block) or it selects nothing and the red construction is vacuous

## Questions

| ID | Question |
|----|---------|
| Q-01 | The ten `hookCompatibility.test.js` conversions are inert on the gate's own runner — §5.5 says so outright ("On a bash-capable runner … none of the ten fires and the inventory rows are inert but still C3-checked", TSPEC:927–929). Is converting them the cheapest way to satisfy AT-1.3 on the swept surface, or would excluding a reduced-in-place M-8 member from the left set (with erratum 6's membership correction saying so) buy the same product outcome for eleven fewer edits to a shared helper? Either answer is fine; the trade is worth one sentence because it is the only place this feature widens a spec-derived ledger. |
| Q-02 | §6.1's heading still reads "Upstream errata raised (not folded in here)" and the count word is still "Nine claims and open surfaces" with an added "Eight remain open; item 9 is resolved upstream" (TSPEC:996–999). That reads correctly today. Is the intent that the count word stays at nine permanently (a lineage register), so a reader counting open items always reads the second sentence rather than the first? |

## Positive Observations

- **The round did the expensive thing correctly: it re-derived §5.5 from the landed text rather than patching the two sentences v6 quoted.** The old "until that edit lands" hedge is gone from both sites, and the replacement states the landed clause, its key, and its reason in FSPEC's own words — "the exemption is keyed on sink records at run time, not on `SKIP_INVENTORY` membership" (TSPEC:738) matches `FSPEC:288`–`:291` in substance and cites the reason FSPEC gives (inventory not closed over registered skips). §6.1 item 9 was rewritten in past tense with the resolution recorded, not deleted, so the lineage survives.
- **The Domain bullet is the fix F-03 (v6) asked for, and it argues the boundary instead of asserting it.** "`guardMatrix.test.js` is **out of the domain** and stays out … A later reader must not re-widen the left set to the whole run: doing so reds the gate on a defect this sweep did not introduce" (TSPEC:859–868). Verified: `guardMatrix.test.js:325` and `:334` are exactly the rows named, and `skipSink.js:19`–`:22` already excludes them for the comparator's own reason. The instruction to the *next* reader is what keeps this from regressing in a later round.
- **Falsifiability of the oracle is now proven, not asserted — this is the strongest addition in the round.** "an oracle that silently matched two empty sets would pass forever" (TSPEC:890–892) names the vacuous-green trap and spends a fixture to close it. That is the absence-only-oracle bar met from the inside, before review.
- **The nested-run paragraph shows its work on why the obvious placement is impossible.** `globalTeardown` "receives config only, never `assertionResults`" and the sink is deleted before reporting — verified at HEAD: `skipSinkTeardown.js:17` reads the records and `:25` `rmSync`s the directory. Rejecting the cheap placement with a reason a reviewer can check is better than silently choosing the expensive one.
- **The `describeOrSkip` cardinality restriction is stated because it holds by construction, not by guarantee.** "N pending vs 1 record reds the right⊄left direction spuriously … If a `describeOrSkip` call ever enters the swept surface, the join key must move to `fullName`" (TSPEC:897–905). Verified: no surviving module calls `describeOrSkip`. Writing down the condition under which a currently-sound key stops being sound is what makes the oracle survivable by the next author.
- **Every literal I spot-checked this round transcribes the tree.** Ten `(hasBash ? it : it.skip)` sites in `hookCompatibility.test.js`; ten `uid-nonroot` rows in `driftCapabilities.js:94`–`:121`; `KNOWN_CAPABILITY_KEYS` = `["bash", "git", "hash", "uid-nonroot"]` at `skipSink.js:55`; `SKIP_SINK_ENV` at `:52`; `"/__tests__/fixtures/"` in `package.json`'s `testPathIgnorePatterns`. The `consolidationBuild.test.js` header still describes "Seven `describe.skip` blocks", but the blocks are un-skipped at HEAD (one `describe.skip(` token remains, inside that comment) — so admitting that module to the swept surface costs nothing today, which the TSPEC did not have to check but which holds.

## Recommendation

**Needs revision** — one High finding, mechanical and internal to the document. Everything v6 blocked
on is resolved, and no previously approved section is reopened. §5.5's substance is right; what is
missing is that §2.9's class table was not updated to carry the three obligations §5.5 grew.

Required to approve:

1. **F-01 (High)** — Reconcile §2.9 with §5.5. The class-3 row (TSPEC:295) must drop the literal
   "one" and add the `__tests__/fixtures/` falsifying fixture; the class-6 row (TSPEC:299) must name
   `driftCapabilities.js` and the ten `"bash"` rows the `hookCompatibility.test.js` conversions add.
   As written, a PLAN transcribing §2.9 omits work AT-1.3 requires, and §5.4's per-commit replay reads
   those edits as unowned.

Recommended, not gating:

- **F-02 (Medium)** — Disposition `skipSink.js:38`–`:46`'s "spec-derived … widening is a spec change"
  paragraph in the same class as the inventory rows, and state the derivation rule that replaces it.
- **F-03 (Medium)** — State which clause admits each of §5.5's four surviving swept-surface modules
  (TSPEC:807–810); §4.4 resolves R-8's re-homes to `consumerCleanup.test.js` alone.
- **F-04 (Low)** — Name the `testPathIgnorePatterns` override the nested red construction needs
  (TSPEC:887–892), or the fixture run selects nothing.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
