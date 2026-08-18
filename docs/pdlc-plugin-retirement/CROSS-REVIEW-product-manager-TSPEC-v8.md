# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.8)
**Date:** 2026-08-17
**Iteration:** 8
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## v7 findings disposition

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v7.md`. `git diff 7c863b9f..HEAD` on the
TSPEC (134 insertions / 26 deletions, one file, five commits `ef36c40b`…`34215001`); only changed
sections were scanned for new issues. Unchanged, already-approved sections were not re-litigated.

| v7 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §2.9's class table now carries the three obligations §5.5 grew. The class-3 row names the `driftCapabilities.js` entry, the `skipSink.js` `WHAT IS NOT ENFORCED, AND WHY` paragraph, and the new fixture `__tests__/fixtures/skipJoinFalsifier.js` (TSPEC:296); the class-6 row names the ten `(hasBash ? it : it.skip)` conversions and the ten `"bash"` `SKIP_INVENTORY` rows they add, plus the serialisation constraint that both commits touch one file (TSPEC:299). A PLAN transcribing §2.9 no longer omits work AT-1.3 requires. |
| F-02 | Medium | **Resolved** | §5.5 now dispositions the helper doc explicitly: the header's rule is restated as spec-derived rows ∪ registered capability gaps a named TSPEC section owns, while keeping C2-not-closure and the "no named owner" prohibition (TSPEC:1011–1026). Quoted text verified verbatim at `pdlc/workflows/__tests__/helpers/skipSink.js:37`–`:46`. |
| F-03 | Medium | **Resolved** | §5.5's swept-surface enumeration is replaced by a four-member table with per-member reasons (TSPEC:815–822); `orchestrateQueue.test.js` is explicitly out with §4.4's L-6 row 1 resolution cited (TSPEC:824–830); the over-wide "four hosts of R-8 re-homes" reading is retracted in the document's own words (TSPEC:829–830); and the FSPEC domain gap is routed as §6.1 erratum 10 rather than decided silently (TSPEC:1204–1216). FSPEC's limb quoted accurately — `FSPEC:285`–`:287`. |
| F-04 | Low | **Resolved** | The child now overrides the inherited config: `--testPathIgnorePatterns=/node_modules/`, dropping the `helpers/` and `fixtures/` exclusions for the child only (TSPEC:955–961). Verified the three inherited patterns at `pdlc/workflows/package.json` (`jest.testPathIgnorePatterns`: `/node_modules/`, `/__tests__/helpers/`, `/__tests__/fixtures/`), and that no `testMatch` override exists, so the TSPEC's claim that jest's default `testMatch` collects any `.js` under `__tests__/` holds. |

All four v7 findings are closed. The findings below are new, and all of them sit inside the
sections this round changed.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The child run's file set is stated two incompatible ways, and the green reading of it cannot pass.** §5.5 part 1 enumerates the child's explicit file list as "swept-surface paths *minus* `consumerCleanup.test.js` — post-sweep, `hookCompatibility.test.js`, `consolidationBuild.test.js` and the falsifying fixture" (TSPEC:923–927), and in the same item asserts that list: "the spawn argument list is compared to the derived surface-minus-host set" (TSPEC:926–927). Those two clauses contradict each other — the falsifying fixture is not a swept-surface member (it appears in neither the four-member table at TSPEC:815–822 nor §4.4's measurements), so a set-equality assertion against surface-minus-host reds on the very list part 1 says to pass. Worse in the product direction: the fixture "carries one bare `it.skip`" (TSPEC:944–945), which is exactly a pending entry with no sink record, so if the fixture is in the *ordinary* child set the left⊄right direction fails on every green run and AT-1.3's oracle can never report pass. The falsifiability paragraph reads as though the fixture belongs to a *separate* red invocation ("Two naming and configuration points make that construction actually run", TSPEC:944–946), which is the coherent reading, but the document nowhere states two file sets. As written, an implementer transcribing §5.5 either builds an oracle that is permanently red or one whose spawn-arg assertion is permanently red. Fix: state the two invocations separately and explicitly — green child = derived surface-minus-host (`hookCompatibility.test.js`, `consolidationBuild.test.js`), red child = that set ∪ `__tests__/fixtures/skipJoinFalsifier.js` — and scope the spawn-argument set-equality assertion to the green invocation only, naming what the red invocation asserts instead (that the join fails, with the fixture's leaf title present in the left set and absent from the right). | REQ AC-1.3, C-8; FSPEC AT-1.3, BR-SWEEP-6; TSPEC §5.5 |
| F-02 | High | Local | **The compensating check over the host is absence-only, and it is the only skip guard over the one module this feature writes from scratch.** Part 3 states it as a pure negative: "no `it.skip`, `test.skip`, `describe.skip`, `it.todo` or `.skip.each` token appears in `consumerCleanup.test.js` outside comments — a static check, not a run-observation" (TSPEC:936–941). No positive assertion on the same path is stated, and no falsifying construction is given. The failure mode is the one this same section spends a fixture to close elsewhere: if the scanner resolves the wrong path, reads an empty string, or its comment-stripping eats the file, it matches nothing and passes forever — and because part 1 removes the host from the join's domain, nothing else in the design observes bare skips in `consumerCleanup.test.js`. The document itself names the trap two paragraphs later ("an oracle that silently matched two empty sets would pass forever", TSPEC:962), so the standard is the document's own, not an imported one. Product consequence: BR-SWEEP-6/AC-1.3's "deleted, never skipped" promise would be unenforced on the sweep's single new test module while appearing green. Fix is cheap and reuses machinery already in §5.5: pair the negative with a positive on the same path — assert the scanner is reading real content (its input is non-empty and contains a known marker, e.g. TT-1b's `itOrSkip(` call site) **and** that the same scanner reports a hit when pointed at `__tests__/fixtures/skipJoinFalsifier.js`, whose bare `it.skip` already exists for the join's red construction. | REQ AC-1.3, C-8; FSPEC AT-1.3, BR-SWEEP-6; TSPEC §5.5 |
| F-03 | Low | Local | **§6.1's lead count word is stale after erratum 10.** The section opens "Nine claims and open surfaces in the upstream documents did not survive a check against the tree at `2cd0d6b1`" (TSPEC:1089) while the list now enumerates ten items (`1.`…`10.`, TSPEC:1093–1216). The very next sentence was correctly updated in this round ("**Nine remain open**", TSPEC:1090–1091), so the two numbers now agree by coincidence and mean different things: ten raised, one resolved, nine open. In a document whose review discipline is count literals, a stale count word is the defect class §2.9 and §4.4 exist to prevent. Fix: "Ten claims … Nine remain open; item 9 is resolved upstream". | TSPEC §6.1 |

## Delta tags

FINDING: High | delta | local | §5.5 part 1 / falsifiability paragraph (TSPEC:923–927, :944–946) | child file set stated both as surface-minus-host (asserted by set-equality) and as that set plus the bare-`it.skip` fixture; the two readings cannot both hold and the fixture-inclusive one can never pass green
FINDING: High | delta | local | §5.5 part 3 compensating check (TSPEC:936–941) | absence-only static assertion, unpaired and with no falsifying construction, is the sole skip guard over `consumerCleanup.test.js` after part 1 carves the host out of the join domain
FINDING: Low | delta | local | §6.1 lead sentence (TSPEC:1089) | says "Nine claims" while the list enumerates ten items after erratum 10 landed

## Questions

| ID | Question |
|----|---------|
| Q-01 | Part 2's sentinel throws when `PDLC_SKIP_JOIN_NESTED` is already set, which reds the child rather than the parent. If the parent's own environment ever carries that variable (a developer re-running a failed child by hand, or a future outer harness exporting it), the parent's spawn helper is the thing that throws — does the design intend the parent to red in that case too, or should the sentinel be read-then-set only on the child's env copy? One sentence either way; it does not change any acceptance criterion, but it decides whether a stray env var reds the gate for a reason unrelated to the sweep. |
| Q-02 | The green child runs `hookCompatibility.test.js` and `consolidationBuild.test.js` in a nested jest process on every outer run of `consumerCleanup.test.js`. §4.4 pins suite size but nothing pins the join's runtime cost. Is that cost bounded enough for the gate as configured, or is it worth a stated expectation (e.g. the child is invoked `--runInBand` over two files) so a later module joining the swept surface makes the cost visible in review rather than in CI wall-clock? |

## Positive Observations

## Recommendation

