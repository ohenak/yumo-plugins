# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.9)
**Date:** 2026-08-17
**Iteration:** 9
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## v8 findings disposition

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v8.md`. Base `34215001..HEAD` on the TSPEC
(101 insertions / 34 deletions, one file, five commits `ea98e22d`…`3b7003e6`); only changed sections were
scanned for new issues. Unchanged, already-approved sections were not re-litigated.

| v8 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §5.5 part 1 now states two invocations with separate file sets (TSPEC:948–962): green child = the swept-surface table minus the host (six modules, named), red child = that list ∪ `__tests__/fixtures/skipJoinFalsifier.js`, "the fixture is never a member of the green child's file set, so the green join is satisfiable". The spawn-argument assertion is pinned as **set-equality** against a **literal path list transcribed from §5.5's table**, not a re-derived value — no implementation echo, and a dropped or added member reds (TSPEC:957–962). The green/red split is carried through the falsifiability paragraph too (TSPEC:998–1008). |
| F-02 | High | **Resolved** | Part 3 is now paired both ways (TSPEC:975–995): the absence assertion sits beside (a) content non-empty **and** containing TT-1b's `itOrSkip(` call site, proving the path resolved and comment-stripping did not eat the file, and (b) the same scanner pointed at the falsifier fixture **reporting a hit**. The self-matching hazard is handled by assembling tokens at runtime from fragments. Both positives are on the same path as the negative, which is what the standard asks. TT-1b's registered skip is real: `itOrSkip` exists at `pdlc/workflows/__tests__/helpers/driftCapabilities.js:324`. |
| F-03 | Low | **Resolved** | §6.1's lead now reads "Ten claims and open surfaces…" (TSPEC:1150) against the ten enumerated items. |
| Q-01 | — | **Answered** | Sentinel is read from the child's env copy only; the parent's own `process.env` never reds the outer run (TSPEC:970–974). |
| Q-02 | — | **Answered** | Both children run `--runInBand` over explicit lists; cost expectation recorded for review visibility (TSPEC:1010–1015). |

The round's other substance — the erratum-10 widening, the pinned child `globalTeardown`
(`__tests__/fixtures/skipJoinTeardown.js`, matching the real config `globalTeardown` at
`pdlc/workflows/package.json` `jest.globalTeardown` → `helpers/skipSinkTeardown.js`), and the class-3 row
that now carries the new fixture — checks out against the tree. The two new High findings below both sit
inside the surface the widening itself created.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The widened swept surface misses a module the sweep itself edits — `consolidationHookParity.test.js` — while the section claims the enumeration is complete.** §5.5's new membership rule is *every surviving `*.test.js` module under `pdlc/workflows/__tests__/` that this sweep edits at all* and states "the table below enumerates every module the rule names" (TSPEC:815–818), and the out-of-domain paragraph closes with "No other `*.test.js` module this sweep edits is out of the domain" (TSPEC:854–855). But §5.2's AT-3.3 clause 2 row places one of the sweep's two new hook assertions in a module the table never names: "`nudge-consolidation.sh`'s new assertion lands in `consolidationHookParity.test.js`, beside the parity corpus" (TSPEC:745). That module survives the sweep (`pdlc/workflows/__tests__/consolidationHookParity.test.js`) and is *added assertions to* — squarely in-surface under the rule the same section just widened. The omission is not cosmetic in two ways. (1) It is exactly the gap erratum 10 exists to close: a bare `it.skip` added there by this sweep is invisible to AT-1.3, and the six-member green-child list plus the set-equality spawn assertion (TSPEC:948–962) would *lock in* the omission — the assertion passes with the module absent. (2) The module already carries four **bare, unregistered** conditional skips — `(canRunDifferential ? test : test.skip)` at `consolidationHookParity.test.js:203`, `:227`, `:343` and `(hasBash ? test : test.skip)` at `:382` — the same shape as `hookCompatibility.test.js`'s ten sites the sweep converts to `itOrSkip` (§2.9 class-6). So admitting it to the surface also carries conversion work and `SKIP_INVENTORY` rows that no class row currently budgets, and *not* admitting it leaves the sweep's own new assertion unwatched. Fix: add the module to §5.5's table with its "in-surface because" reason (AT-3.3 clause 2 assertion, §5.2), to the domain list (TSPEC:901–910), and to the green/red child lists (making them seven/eight modules, with §5.5's cost sentence updated); and state in §2.9 whether its four bare conditional skips are converted in the same commit or dispositioned out with a stated reason. | REQ AC-1.3, AC-3.3, C-8; FSPEC AT-1.3, AT-3.3, BR-SWEEP-6; TSPEC §5.5, §5.2 |
| F-02 | High | Local | **The green child's join is absence-only: nothing asserts the child actually collected and ran the six modules.** The green invocation passes when both directions of the join come out empty (TSPEC:952–954), and the only thing asserted about the child besides that is the *argument vector* handed to `spawn` (TSPEC:957–962). Arguments are not observations: if a listed path stops matching a collected file — a module renamed by a later PLAN task, a `testPathIgnorePatterns` interaction, a child that exits early on a config error — the child reports no pending entries and no sink records, and the empty-set join reports **pass**. The red child does not cover this: its file list is the green list ∪ the fixture, so the fixture's leaf title is reported even when none of the six real modules is collected, and both invocations look healthy while four of the six domain modules are unobserved. This is the same defect class as the v8 F-02 finding the round just fixed for the host scan ("an oracle that silently matched two empty things passes forever", TSPEC's own words), left open for the join itself — and it is materially larger this round, because the widening took the child from two modules to six. Fix, at the same cost as part 3's pairing: assert the child's `--json` output positively — the set of `testResults` file paths **set-equals** the literal file list transcribed from §5.5's table (set-equality, not containment, so a silently uncollected module reds), and the child's exit status is the expected one for each invocation. | REQ AC-1.3, C-8; FSPEC AT-1.3, BR-SWEEP-6; TSPEC §5.5 |
| F-03 | Medium | Local | **The out-of-domain enumeration claims exhaustiveness but names two of the four edited test modules outside the domain.** TSPEC:847–855 opens "Two edited modules are deliberately outside the join's domain" and names `pdlc/engine/__tests__/ci-arrangement.test.js` (class 1) and `guardMatrix.test.js`. §2.9's class-2 row edits two further `*.test.js` modules — `pdlc/engine/__tests__/smoke.test.js` and `fs-observation.test.js` (TSPEC:295) — both of which exist in the tree and both of which are out of the domain for the *same* structural reason already given for `ci-arrangement.test.js` (they live in the `pdlc/engine` package). No obligation is lost, so this is not gating; but the paragraph is the one a later reader uses to confirm the domain is closed, and as written its count word and its list are both wrong. Fix: say "the `pdlc/engine` package's edited modules (`ci-arrangement.test.js`, `smoke.test.js`, `fs-observation.test.js`) and `guardMatrix.test.js`", or state the exclusion as a rule over the package rather than a two-item list. | FSPEC AT-1.3; TSPEC §5.5, §2.9 |
| F-04 | Low | Local | **The new cost paragraph splits the falsifiability bullet list.** "Cost of the join, stated so it stays visible." (TSPEC:1010–1015) is inserted between the two bullets of the "two naming and configuration points" list (TSPEC:1002 and the `*.test.js`-naming bullet that follows it), so the second of the two points reads as orphaned prose after an unrelated paragraph. Content is fine and the answer to Q-02 is welcome; move the paragraph below the second bullet. | TSPEC §5.5 |

FINDING: High | delta | local | §5.5 swept-surface table + domain list + child file lists (TSPEC:815–818, :847–855, :901–910, :948–962) | `consolidationHookParity.test.js` receives an AT-3.3 assertion (TSPEC:745) and carries four bare conditional skips (`:203`, `:227`, `:343`, `:382`) yet is absent from the enumeration that claims to name every edited module
FINDING: High | delta | local | §5.5 part 1, green invocation (TSPEC:948–962) | green join is absence-only — spawn arguments are asserted but child collection is not, so an uncollected module yields an empty join that passes forever; red child cannot detect it
FINDING: Medium | delta | local | §5.5 out-of-domain paragraph (TSPEC:847–855) | "Two edited modules" plus "no other" claim omits class-2's `smoke.test.js` and `fs-observation.test.js`
FINDING: Low | delta | local | §5.5 cost paragraph (TSPEC:1010–1015) | inserted between the two bullets of the falsifiability list, orphaning the second point

## Questions

| ID | Question |
|----|---------|
| Q-01 | The green child now runs `documentOracles.test.js`, whose `coveredViolations` walks the whole tree skipping only `.git/` and `node_modules/` (`pdlc/workflows/lib/document-oracles.mjs:77`, `:149`) — §5.3 already names this as a hazard sensitive to untracked local files. The child is spawned from inside `consumerCleanup.test.js`, whose own constructions build temp trees (`mkdtempSync`, TSPEC:708). If any construction lands under the repo root rather than the OS temp dir, the child reds for a reason unrelated to skips. Is it worth one sentence pinning the host's fixtures outside the repo root, so the join's failures always mean what they say? |
| Q-02 | With the surface now defined as "every module the sweep edits at all", the literal child file list becomes a thing every PLAN task that touches a test module must remember to extend. Does the PLAN carry that as an explicit per-task obligation, or is the set-equality red (TSPEC:961–962) the only reminder? A one-line pointer from §5.5 to the PLAN task rule would keep the two from drifting. |

## Positive Observations

- **The v8 F-01 split is exactly the repair asked for, and it is stated in oracle terms rather than prose.** Green child = table minus host; red child = that list ∪ the fixture; expected side a literal transcription, assertion set-equality, "once per invocation" (TSPEC:948–962). Verified the six named modules all exist in `pdlc/workflows/__tests__/`, and that none of the four newly admitted ones carries a bare pending marker today (`pipelineWiring.test.js`, `consolidationPreflight.test.js`, `orchestrateDevSkill.test.js` have none; `documentOracles.test.js`'s only skips are registered `itOrSkip` sites at `:340` and `:572`) — so the green join is satisfiable as written, which is what F-01 was about.
- **Every anchor the round added is real.** Spot-checked against the tree: the `DEV_META` source-text reader in `pipelineWiring.test.js` (`:543`–`:560`), the wave-gate config assertions in `consolidationPreflight.test.js` (`:205`–`:208`, `postWavePathspecs` / `postWaveCommand`), D-1/D-2 in `documentOracles.test.js` (`:735`, `:747`), and `orchestrateDevSkill.test.js:93`'s `expect(content).toContain(".claude/workflows/orchestrate-dev.bundle.js")` — quoted verbatim in TSPEC:828. `ci-arrangement.test.js` is indeed in `pdlc/engine/__tests__/`, so the package-boundary reason for excluding it holds.
- **Answering "which direction resolves the four-member table" with the *wider* rule was the right product call.** The reasoning given — that an assertion-*deleting* edit is the likeliest place to park a broken assertion behind a bare `it.skip` (TSPEC:818–821) — is a user-facing argument, not an engineering preference, and it protects AC-1.3's promise on the sweep's most edit-heavy surviving modules. Erratum 10's requested FSPEC wording now matches that rule and stays a strict superset of the approved domain (TSPEC:1271–1284), so nothing approved is at risk while it is pending.
- **The child `globalTeardown` pin closes a real race rather than papering over it.** The rejected alternative is named with its reason (the copy would race the child's `rmSync` with no observable synchronisation point), and the note that the inherited teardown "would not have caught the falsifier anyway" is correct — a bare `it.skip` writes no sink record. Confirmed the inherited config it overrides: `pdlc/workflows/package.json` `jest.globalTeardown` → `<rootDir>/__tests__/helpers/skipSinkTeardown.js`.

## Recommendation

**Needs revision** — two High findings, both inside the block this round rewrote (§5.5's widened surface and
the green/red split), both mechanically closable. Both v8 High findings and the v8 Low are resolved, and no
previously approved section was reopened. The round's direction — wider membership rule, two invocations,
paired host scan, pinned teardown — is right and is not in question.

Required to approve:

1. **F-01 (High)** — Admit `consolidationHookParity.test.js` to §5.5's table, the domain list and both child
   file lists (AT-3.3 clause 2 puts a new assertion there, TSPEC:745), and state in §2.9 what happens to its
   four bare conditional skips (`:203`, `:227`, `:343`, `:382`) — converted like `hookCompatibility.test.js`'s
   ten, or dispositioned out with a reason. As written the enumeration claims completeness it does not have,
   and the set-equality spawn assertion would freeze the omission in place.
2. **F-02 (High)** — Pair the green join with a positive observation of the child: the `testResults` file-path
   set from the child's `--json` **set-equals** the literal file list, and the child's exit status is asserted
   per invocation. Otherwise an uncollected module produces an empty join that passes forever, and the red
   child cannot detect it.

Recommended, not gating:

- **F-03 (Medium)** — Restate the out-of-domain exclusion as a package rule, or name class-2's
  `smoke.test.js` and `fs-observation.test.js` alongside `ci-arrangement.test.js`.
- **F-04 (Low)** — Move the cost paragraph below the second bullet of the falsifiability list.
- **Q-01 / Q-02** — one sentence each on host fixture location and the PLAN's obligation to extend the child
  file list; neither changes an acceptance criterion.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
