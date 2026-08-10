# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.4)
**Date:** 2026-08-10
**Iteration:** 20
**Scope:** Local (per-finding below)
**Delta base:** `c93f5032` (the tree I reviewed at v19) → HEAD

This is a delta re-review of the v2.4 round. The revision answers v19's F-64 and se's
F-01…F-04 and Q-01. The delta question is the usual pair: **did the claimed moves actually
land, and did the revision break anything previously approved?** Every anchor the delta
touches was re-measured at HEAD.

## What changed

Five commits (`546a7ee2`…`b2156952`), one document, 21 insertions / 14 deletions. Version
moves `2.3 · 2026-08-10` → `2.4 · 2026-08-10`. Three substantive edits:

1. **The anchor-epoch preamble gains a re-measurement cadence** (`:22-26`): "the role name is
   the durable locator; the number is the convenience… anchors are re-measured at review
   rounds, not on every commit, so a number that has shifted is a defect only where the named
   role no longer resolves." This is the answer to se Q-01 and it is the right shape — it
   converts an unbounded editorial obligation into a decidable one.
2. **The `orchestrate-dev.js` guard family and `build-runtime.mjs` are re-anchored with roles
   named** (`:307-311`, `:333`, `:401`) — the exact gap v19's F-64 named.
3. **§4b names a terminal status and a reason code for an all-unreadable corpus** (`:624-627`),
   and AC-1.4 carries it as a third cause (`:223-232`), with AC-5.3 (`:454`) and AC-5.5
   (`:479`) updated from "first cause" to "first or third cause".

I re-measured every anchor the delta moved. All eleven resolve, and each lands on the line
its named role claims:

| REQ claim (v2.4) | HEAD state | Correct |
|---|---|---|
| `effectiveGuardPaths` "the guard-path resolver" `:936` | `:936` `export function effectiveGuardPaths(configured)` | yes |
| `guardVerdict` `:959` | `:959` `export function guardVerdict(changed, guardPaths)` | yes |
| Phase MERGE's ladder, "`decideMerge`'s resolver/verdict call pair", `:1126-1127` | `:1126` `effectiveGuardPaths(config.guardPaths)`, `:1127` `guardVerdict(record.o5, …)` — adjacent, exactly a pair | yes |
| advisory-envelope check `:2370` | `:2370` `guardVerdict({ ok: true, files: paths }, …)` | yes |
| `mergeMode` default `:61` | `:61` `mergeMode: "off"` | yes |
| `decideMerge`'s guard-1 refusal `:1065`, reason string `:1070` | `:1065` `config.mergeMode === "off"`, `:1070` `reason: "mergeMode off"` | yes |
| the phase's early return `:1659` | `:1659` `if (config.mergeMode === "off") return skippedOutcome(2, "mergeMode off", …)` | yes |
| `gitWithLockRetry` "the lock-retry wrapper" `:9424` | `:9424` `export async function gitWithLockRetry(argv, { … })` | yes |
| `build-runtime.mjs` fourth artifact row, `pdlc-cli.mjs`, `:564-567` | `:564` `file: "pdlc-cli.mjs"`, `:567` `id: "pdlc-cli"` | yes |

I also re-derived the reachability claim rather than trusting it: `grep -n "guardVerdict("`
returns the declaration plus exactly two call sites (`:1127`, `:2370`), both about that run's
own PR. `effectiveGuardPaths` has a third caller at `:3443` (`guardPaths:
effectiveGuardPaths(undefined)`), which seeds the advisory context the `:2370` check reads —
it does not open a route to an inbound PR, so the sentence's "reachable only from" stays true
as written (it is scoped to `guardVerdict` over `effectiveGuardPaths`, not to the resolver
alone).

v19's F-64 is **resolved**, in full and in the manner F-64 asked for: coordinates fixed *and*
roles named, so the next round can re-find them without a grep.

## Findings

**One High**, introduced by this delta. Two Lows carried and re-measured.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-65 | High | Local | **The new `corpus-unreadable` reason code breaches this REQ's own set-equality oracle, and contradicts the sentence three lines above it.** v2.4 introduces a reason code at `:226` (AC-1.4's third cause) and `:625-626` (§4b). It exists nowhere else: `grep -rn corpus-unreadable docs/ pdlc/` returns those two REQ lines and nothing more — **no row in `docs/_constraints/pdlc-consolidation-vocabularies.md` §1**, whose table ends at `:68` with `credential:`, and whose version is still `1.4 · 2026-08-06` (`:7`). Three ways this bites, all mechanical: **(a)** §4b at `:604-607` states the downstream oracle as "**set-equality** over every enumerated row this REQ owns — §1, §2 and §4 …, entire, at `Version` 1.4" and makes the rule *symmetric* — "a value used here with no row there **and** a row there naming a value this REQ never uses being equally defects". The governed file says the same in its own words at `:38-39` ("adding a value to the REQ without a row here is a defect"). A value used in the REQ with no row in the pinned enumeration is therefore a defect **by the REQ's own definition**, not by my preference. **(b)** The oracle is now *unsatisfiable*, which is the testing cost: PROPERTIES `:132` pins the doubles module to "the literal transcription of vocabularies §1 at `Version` 1.4", and the set-equality property built on it has two authorities that disagree — transcribe §1@1.4 and the property goes red on a conforming implementation that emits `corpus-unreadable`; transcribe the REQ's used-value set and the transcription no longer matches the pinned file. There is no expected value a test author can write down. **(c)** AC-7.1 (`:517-518`) requires reason codes be "drawn from §4b's enumeration, and paired only as §4b permits" — `corpus-unreadable` has no permitted-status join, so the pairing rule is undefined for the one code the delta added. **Second limb, same fix:** the v2.1 erratum sentence at `:618` still reads "Omission needs no new field, **no new reason code** and no vocabulary row" — three sentences before `:625-626` adds one. The two are arguably scoped differently (per-entry omission vs whole-pass status), but nothing in the text says so, and this paragraph is exactly where v18's F-62 found two definitions disagreeing. **The fix is mechanical and small:** add one row to vocabularies §1 — `` | `corpus-unreadable` | reason code | `no-op` | AC-1.4, §4b | `` — bump that file's `Version` to `1.5` (a value change, unambiguously version-bumping under its own `:28-32` rule, which exempts only `file:line` re-measurement), re-pin the REQ's eight `Version 1.4` citations (`:95`, `:111`, `:214`, `:256`, `:436`, `:596`, `:605`, `:613`) — note §2/§3/§4 pins move too, since the file carries one version — and qualify `:618`'s clause to the omission mechanism it is about. | REQ `:226`, `:618`, `:625-626`, `:604-607`, `:517-518`; `pdlc-consolidation-vocabularies.md:7`, `:38-39`, `:42-68`; PROPERTIES `:132` |
| F-56 | Low | Local | **Open — re-measured, worse again.** `wc -l -c` at HEAD: **695 lines / 66,758 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`). That is 5,318 bytes over the byte budget (up 767 from v19's 65,991) and **five lines** of line-budget headroom left, down from 13. Five rounds, one direction. `check-req-size.sh` is PostToolUse and warns rather than blocks, and no oracle reads either number, so this is still Low — but the line budget is now close enough that the *next* round's edit can cross it without anyone intending to. F-65's fix is roughly byte-neutral (one row moves to the constraints file, eight pins change digit); the compaction has to come from somewhere else. | REQ file; `check-req-size.sh:41-42` |
| F-54 | Low | Cross-Feature | **Open — re-measured, unchanged.** `docs/_constraints/pdlc-advisory-corpus-baseline.md:7` still reads `Version \| 1.0 · 2026-08-06` and the REQ still pins `1.0` at `:232`/`:504`. Self-consistent, so not gating; carried only so the pin stays deliberate. | REQ `:232`, `:504`; `pdlc-advisory-corpus-baseline.md:7` |

### Prior findings — resolution verified

| Prior ID | Status | Evidence at HEAD |
|---|---|---|
| F-64 (Medium) | **Resolved** | All four stale guard coordinates fixed and re-verified line-by-line at HEAD: `709 → 936`, `899-900 → 1126-1127` (not `1064-1065` as I predicted — the author measured the resolver/verdict *call pair* rather than the surrounding block, which is the better anchor), `2143 → 2370`, `838 → 1659`, plus `:1065`/`:1070` added for the guard-1 refusal. Every one names its role, as the preamble promises. |
| F-60 / Q-05 (Process) | **Partly answered, structurally** | The preamble's new cadence clause (`:22-26`) supplies the missing half: it defines *when* a shifted number is a defect ("only where the named role no longer resolves"), which is what made the old obligation unbounded. The grep-shaped mechanical check Q-05 asked for is still not specified anywhere, but the obligation it would enforce is now decidable, which is the harder half. Carried to Q-05 below, non-blocking. |
| F-57 follow-on (§4b termination) | **Resolved and then some** | v2.3 established that an all-unreadable corpus still fires and still terminates; v2.4 names the observable — status `no-op`, reason `corpus-unreadable` — which is what a test can assert on. The *shape* of this fix is right; F-65 is about the enumeration it was not registered in, not about the decision. |

## Questions

| ID | Question |
|----|---------|
| Q-06 | **New, and it is the generalisation of F-65.** F-65 is not a spelling mistake; it is a *class*. Any future round that names a new status, reason code, verdict, state or field in the REQ can breach the same set-equality without anyone noticing, because the only thing checking today is a reviewer grepping by hand. The check is mechanical and cheap: extract every `` `backticked-kebab-value` `` the REQ uses in a reason-code/status position, extract §1's `Value` column at the pinned version, assert **set-equality both ways**, and fail naming the offending value and direction. That is the same oracle §4b already specifies for downstream consumers — it just is not run against the REQ itself. Worth a PROPERTIES row (or a DoD-time script alongside `consolidationSkillAnchors.test.js`, which already mechanises the anchor half of this problem). Process-scoped; non-blocking on its own, but F-65 is what it would have caught. |
| Q-05 | **Carried from v19, half-answered.** The preamble now decides *when* a shifted anchor is a defect, which was the open half. The remaining half is still mechanical: a grep over `` `path:NN` `` in `docs/{feature}/*.md` that resolves each at HEAD and fails where the line is blank, is a comment, or does not contain the named role token. The v2.4 preamble makes this implementable for the first time — the role token is now promised to be present beside every number, so the check has something to match against. Non-blocking. |
| Q-03 | Carried, still non-blocking, still PROPERTIES-layer. AC-3.4's "on this path no proposal file exists to record into" (`:276-277`) is absence-shaped; a fixture asserting `not exists(CONSOLIDATION-PROPOSAL-…)` would pass on any accidental early exit. Pair it with a positive conjunct on the same path (which artifact *is* written, and its terminal row). |
| Q-02 | Carried unchanged from v15–v19: the hook's enumeration and the pass's enumeration deserve one generator-driven **set-equality** property over a synthetic `docs/` tree (tracked, untracked, gitignored, staged-but-deleted, nested, `docs/discarded/`). REQ-CONS-01 step 1 states two mechanisms that must agree; the expected set is transcribable from the spec, never derived from either implementation. Containment cannot see the failure mode that matters (one enumeration dropping a basename the other keeps). |

## Positive Observations

- **The re-measurement cadence clause is the best thing in this delta, and it generalises past
  this feature.** "The role name is the durable locator; the number is the convenience …
  re-measured at review rounds, not on every commit" (`:22-26`) does something F-60 asked for
  across four rounds and no previous revision achieved: it makes the anchor obligation
  *decidable*. Before it, every round could reopen every anchor and no answer was ever final.
  After it, an anchor is defective only when its named role stops resolving — a condition a
  script can evaluate. That is a Process-scoped win worth carrying to harvest even though I
  have filed it as a question rather than a finding.
- **F-64 was fixed better than I specified it.** I predicted `899-900 → 1064-1065`; the author
  measured `:1126-1127` instead — `decideMerge`'s resolver/verdict *call pair*, which is the
  line pair that actually constitutes "Phase MERGE's ladder reaches the guard", where my
  coordinates would have pointed at the surrounding conditional. The revision did not take the
  reviewer's number on trust, which is exactly the discipline the preamble asks for.
- **§4b's new sentence turns the last soft spot into an oracle.** "Terminal status is `no-op`
  … its row carries the reason code `corpus-unreadable`" replaces "reports its terminal row
  with nothing consumed" with two literal values a test can assert, and it explicitly refuses
  to mint a seventh status ("taken from the six-member set above, so no status is added"),
  which keeps AC-7.1's closed set closed and PROP-PASS-09's set-equality over statuses intact.
  The decision is right; only its registration is missing.
- **The three-cause propagation was done as a set, not paragraph by paragraph.** Adding a third
  cause to AC-1.4 obliged matching edits wherever "AC-1.4's first cause" was quoted; both sites
  moved (`:454` AC-5.3, `:479` AC-5.5), each to "first or third cause", and each is
  substantively correct — causes one and three consume nothing, cause two consumes. The
  consumed-set-emptiness invariant that both streaks key on survives the change unbroken, which
  is the thing I most expected a third cause to break.

## Recommendation

**Needs revision** — 1 High, 0 Medium, 2 Low.

The delta question was whether v2.4's claimed moves landed and whether the revision broke
anything previously approved. Both halves have answers, and they differ.

- **v19's blocking finding is resolved.** F-64's four stale guard coordinates are fixed, each
  re-verified at HEAD rather than from a commit message, each carrying the role name the
  preamble promises. `build-runtime.mjs` and `gitWithLockRetry` are re-anchored the same way.
  Eleven of eleven moved anchors resolve. I have no anchor finding this round.
- **Nothing previously approved regressed in substance.** The reachability claim about
  `guardVerdict` is still true at HEAD (declaration plus exactly two callers, both about the
  run's own PR); `mergeMode` still ships `off`; the three-cause propagation into AC-5.3 and
  AC-5.5 is correct in both places and leaves the consumed-set-emptiness invariant intact.
- **But the revision introduced one new blocking defect.** F-65: `corpus-unreadable` is used
  twice in the REQ and registered nowhere. This is High rather than Medium on the grounds this
  review has applied consistently — unlike a stale line number, **a test oracle keys on this
  one**. §4b commissions a set-equality property over vocabularies §1 at `Version` 1.4, and
  PROPERTIES `:132` already pins the doubles module to that literal transcription. With the
  value in one authority and not the other, there is no expected set a test author can write
  down that is correct against both: the property is unsatisfiable rather than merely
  inaccurate. The REQ also convicts itself here — §4b `:604-607` and the governed file
  `:38-39` both state that a value used without a row is a defect — and the paragraph still
  carries the v2.1 sentence "no new reason code and no vocabulary row" three lines above the
  code it adds.

The fix is small, mechanical, and fully specified in F-65: one row in vocabularies §1, one
version bump to `1.5`, eight re-pins in the REQ, one clause qualified at `:618`. No AC
semantics change, no decision is reopened, and the §4b decision the row registers is one I
have recorded as a Positive Observation. I expect this to close in a single edit.

Pair it with a compaction if any is available: at 695 lines the document has five lines of
line-budget headroom (F-56), and F-65's edit is roughly byte-neutral.

**No upstream defects.** REQ is the root document; nothing upstream of it is wrong, so no
ERRATUM lines are emitted. Note for the downstream author, not for this round: PROPERTIES
`:132` (`Version` 1.4 transcription) and PROP-PASS-08 at `:1355-1365` ("pins the two causes")
both go stale once F-65 lands, and should be swept in Phase PR rather than rediscovered.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}
