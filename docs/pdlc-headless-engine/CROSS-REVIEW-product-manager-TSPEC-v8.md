# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.6)
**Upstream read:** `REQ-pdlc-headless-engine.md` (v0.10 — AC-3.1, AC-3.3, AC-3.5, C-9, C-11), `FSPEC-pdlc-headless-engine.md` (v1.6 — BR-MODEL-3 `:680-684`, §5 ladder `:293-301`, BR-SKILL-3 `:562-564`)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v7.md` (0 High, 2 Medium, 1 Low)
**Diff reviewed:** `68810c41..HEAD` — TSPEC +329/−109 across nine sections
**Date:** 2026-08-11
**Iteration:** 8
**Scope:** delta re-review — disposition of v7's three findings, and the changed sections only

## 1. Disposition of prior findings

All three are resolved, and the two Mediums are resolved at the root rather than papered over.

| Prior | Disposition |
|---|---|
| **F-01 (Medium)** — the `--dry-run` "composed but never executed → both terminal fields `null`" branch has no producer, and contradicts FSPEC v1.4/v1.5's corrected BR-MODEL-3 | **Resolved by deletion, in the direction upstream took.** All five sites named in v7 are gone and replaced by the stronger rule *every recorded line is a settlement line*: §4.1 (`:821-838`), §7.0 (`:1512-1518`), §7.4 row 4 (`:1634`), §7.4's corpus preamble (`:1863-1873`), §8.3's `adapter.mjs` row (`:2054`). I re-grounded the replacement rather than reading it: `composePrompt` is a separate entry point at `adapter.mjs:259`, exported at `:373`; the dispatch seam `_agent` is at `:271`; `emitDryRun` calls `adapter.composePrompt(skill, …)` directly at `bin/pdlc.mjs:190` and never `_agent`. The design's claim and HEAD agree. The `null`-terminal wording that survives at `:52-53` is the **v1.5 changelog entry**, explicitly annotated *"superseded in v1.6"* — history, not a live clause, which is the right way to keep a changelog honest. |
| **F-02 (Medium, Process)** — five `FSPEC:{line}` citations rotted past the erratum's insertions | **Resolved, and I checked all five against HEAD, not against the change note.** `:601`→`FSPEC:215-217` ✓ (the "no transport selector" paragraph); `:792`→`FSPEC:680-684` ✓ (BR-MODEL-3, quoted verbatim and correctly); `:999`→`FSPEC:1203-1213` ✓ (§12.2's field table — nine rows, matching "six AC-4.5 + three FSPEC-added"); `:1153`→`FSPEC:737` ✓ and `REQ:522` ✓ (`agent-reported-failure`'s meaning); `:1873`→`FSPEC:210` ✓ (the `--dry-run-skill` flag row). The two §9.3 errata anchors are also live: `FSPEC:562-564` ✓ and `REQ:502-506` ✓. |
| **F-03 (Low)** — row 4's pinned outcome depends on an injection point row 4 did not name | **Resolved with more than I asked for** (`:1795-1806`). The bullet now names `queryFn` and §7.1's `createTransport({ queryFn })` construction rule, *and* adds the second obligation I had not spotted: the injected rejection must simultaneously map to `TransportError` (`transport.mjs:123` ✓ — the unrecognised arm of `classifyThrown`, `:98` ✓) and satisfy `MODEL_ERROR_RE` (`orchestrate-dev.js:1780-1781` ✓, via `isModelResolutionError` `:1791` ✓) or no `B` exists to pair. Both failure modes are named. |

## 2. What else changed, and what I checked it against

This round is not only my findings — v1.6 also folds in TE F-36/37/38/39 and Q-15/16/17 and answers
four questions in the design. I re-grounded the new material against HEAD rather than reading it:

- **§3.3's scanner measurement** (`:377-395`) — rewritten from "three of ten identifiers" to "five of
  ten". I checked all eleven cited sites individually: `ship-pr` `orchestrate-dev.js:8008` ✓ `:8112` ✓;
  `dod-verify` `:8035` ✓ (a bare literal in a multi-line call, as claimed); `se-implement` `:8064` ✓
  `:10028` ✓ `:10068` ✓ `:10142` ✓ `:10251` ✓; `se-author` `:9964` ✓ and `orchestrate-queue.js:1216` ✓;
  `harvest-learnings` `:10542` ✓ and the non-call-site `skill:` field `:10448` ✓; `ADVISORY_RUNG_SKILL`
  `:1797` ✓ dispatched at `:1841` ✓; the reviewer-role map keys `:6229-6231` ✓. Every number is right.
- **§4.3's rung 4a** — FSPEC v1.6 does insert *4a — guard executable* between 4 and 5 at `FSPEC:299` ✓,
  authorised by REQ C-11 (`REQ:284`) ✓. `RUNG_ORDER` as string labels is the correct reading, and the
  "renumbering is forbidden" argument is right for the reason given: the upstream vocabulary names the
  numbers.
- **§6.5's M-ENG-09 obligation split** — the previous "gate and first rows land in the same task" rule
  was genuinely unsatisfiable and the two-row table now says who discharges what. No AC moves.
- **§7.6's CI matrix correction** — verified: `pr-tests.yml:40` is `os: [ubuntu-latest]` ✓, dropped in
  `410f3a07` ("ci: drop macos-latest from the unit-test matrix") ✓, and the surrounding comment does
  still describe the two-platform intent ✓. The document is right, and right to say the comment is stale.
- **§8.3's new `.claude/pdlc.config.json` row** — verified: `testCommand` at line 3 is
  `cd pdlc/workflows && npm test …` and nothing else ✓. The conclusion follows.
- **§7.5's live-test exception** and **§7.4's `corpusRun != null` essentiality** — both consistent with
  §7.0's `--import` bootstrap and with the settlement-only rule.

## 3. Findings

All three are in sections this round changed. Nothing previously approved regressed.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§7.6's CI-matrix correction did not sweep §9.2, which still reasons from a two-platform matrix.** §7.6 now states the matrix is one platform — "the matrix is one platform, not two … `os: [ubuntu-latest]` (`pr-tests.yml:40`)" (`:1935-1940`), which I verified at HEAD (`410f3a07`). But all three CI-related open questions still carry the old premise: O-ENG-T1 says "§7.6 adds a fifth job on **the same two-platform matrix**" and asks whether the suite "runs on both platforms every PR, or ubuntu-only with macos on merge" (`:2114-2119`) — a question §7.6 has now settled as ubuntu-only-today; O-ENG-T4 glosses `process.platform` as "**two values, matching §7.6's matrix**" (`:2136-2137`), which is now false in both halves (the matrix has one value, and `process.platform` has more than two); O-ENG-T5 says "**On the two platforms §7.6's matrix runs**, that is exactly right" (`:2144-2145`), whose premise no longer exists — the M-ENG-09 gate is unmeasured by CI on macOS, which is the maintainer's own platform. This matters beyond tidiness because §9.2 is where a PLAN author reads what is still open: O-ENG-T5's whole framing ("a contributor on a *third* platform") assumes two are covered, and the honest current statement is that CI covers one and every other platform is the maintainer's hand-measurement (§6.5's own second row). This is the same second-site class of miss the FSPEC erratum hit two rounds ago and that §7.6's own correction was careful about — one sweep short. No AC moves and no constraint is violated: I checked C-9 (`REQ:268-271`, "the supported platform set is stated and each claim is measured on each member"), and §6.5's hand-measurement row plus `process.platform` keying satisfies it — C-9 requires measurement per platform, not measurement *by CI*. Which is precisely why §9.2 should say so rather than imply CI does it. **Fix (one edit, three sentences):** re-state O-ENG-T1's premise as "a fifth job on the existing one-platform matrix; whether to add `macos-latest` back is the CI-minutes question", drop O-ENG-T4's "two values, matching §7.6's matrix" gloss, and re-base O-ENG-T5 on "the one platform CI runs". | C-9, AC-6.1 |
| F-02 | Medium | Local | **§5.3's engine-fatal reconciliation is grounded in the present tense on a catch that does not exist at HEAD.** The new paragraph (added this round for TE F-37) says "§5.3's catch sits at the top of `runDev`/`runQueue` (`run.mjs:187`, `:228`)" (`:1813`), and §5.3's earlier prose says "Mechanically: the engine **catches** at the top level of `runDev`/`runQueue` (`run.mjs:187`, `:228`)" (`:1253`), with the traceability table repeating the anchor for AC-4.4 (`:2025`). At HEAD those two lines are the **declarations** — `export async function runDev({` (`run.mjs:187`) and `export async function runQueue({` (`:228`) — and `pdlc/engine/lib/run.mjs` contains **no `catch` at all**; its only `try` is `withCwd`'s `try/finally` at `:159`, which has no catch clause. So this is designed behaviour written in the same citation grammar the document uses everywhere else for *observed* behaviour, and the document is otherwise scrupulous about that distinction (§8.3's rows say "extended"/"changed", §3.3 says "measured at HEAD"). The product cost is concrete because this claim is load-bearing twice over: it is the sole reconciliation between §5.3's "engine-fatal → exit `1`" and §7.4 row 4's "an `F` carrying `transport-contract-violation` followed by a `B` **in the same run**", and a fixture author who checks the citation finds a function signature and cannot tell whether the escape semantics are already true or are this feature's work. §8.3's `run.mjs` row does carry "exit mapping", so the work is in the edit surface — the defect is the tense, not an omission. **Fix (one edit):** mark it as introduced — "the engine will catch at the top of `runDev` (`run.mjs:187`) and `runQueue` (`:228`), which at HEAD have no catch; §8.3's `run.mjs` row carries it" — at `:1253` and `:1813`. | AC-1.4, AC-4.4, BR-EXIT-1…3 |
| F-03 | Low | Local | **§5.3 anchors a producer claim at the consumer's line.** "the non-model-resolution case is returned to the caller as a `{ kind: "dispatch-error" }` value (`orchestrate-dev.js:3143`), never rethrown" (`:1261-1262`). At HEAD `:3143` is `if (raced.kind === "dispatch-error") {` — the caller *reading* the value. The producers are `:1847`, `:1857` (`if (!isModelResolutionError(err)) return { kind: "dispatch-error", err };`) and `:1867`. §7.4's parallel bullet gets this right, citing `:3143-3149` for consumption ("the caller consumes as a loop continue", `:1818`) and `:1856`→`:1861` for the fallback arm — both of which I verified. So one of the two twinned passages has the anchor the other one earned. **Fix:** cite `:1857` for the return, keeping `:3143-3149` for the consumption half. | AC-4.4 |

## 4. Questions

| ID | Question |
|----|---------|
| Q-01 | §3.3's no-bare-literal guard moved from set-equality-with-allow-list to **containment** (DEC-ENG-05, `:441-460`). I checked whether that weakens AC-3.5 and concluded it does not: AC-3.5's set-equality lives in the *derivation* test (`DISPATCHABLE_SKILLS` ≡ the union recomputed from `PHASE_DISPATCH` + the named constants), which is unchanged and still a set-equality over the full enumeration; the containment guard is a second, weaker net whose only job is catching a new dispatch site naming an identifier the exports do not carry — and it does catch that, because such a literal is by construction not a member. The allow-list version was unwritable against HEAD's eleven bare-literal sites, so this is the honest repair rather than a loosened oracle. Recording my reasoning so a later reviewer does not have to re-derive it; no answer needed unless you read AC-3.5 as reaching the guard too. |
| Q-02 | Carried from v7 and now **answered** (`:1910-1922`): the two live tests do inherit §7.0's writer, and what keeps §7.5's claim honest is `corpusRun === null` plus a scratch directory recreated per run. That is a better answer than the one I expected — it names the residue instead of denying it. No further question. |

## 5. Positive Observations

- **The fix I asked for was taken at the root, and the sweep was complete this time.** v7's F-01 named
  five sites; v1.6 deleted the branch at all five and replaced it with a *stronger* positive rule —
  "every recorded line is a settlement line" — grounded in the seam (`adapter.mjs:271` vs `:259`,
  `bin/pdlc.mjs:190`) rather than asserted. The replacement is not an absence claim dressed up: it says
  what the dry-run surface *does* write (nothing) and what would happen if `_agent` were called on that
  adapter instead (`inertTransport().dispatch()` throws, which settles as an error outcome — still a
  settlement line). That is the positive-conjunct discipline applied to the design's own prose.
- **§8.3's `.claude/pdlc.config.json` row is the best thing in this revision, and it is not a review
  finding — the author found it.** `testCommand` runs `cd pdlc/workflows && npm test` and nothing else,
  so every Phase I wave of this feature would have gone green without one `pdlc/engine/` test running,
  and the suite this document designs would first execute at Phase PUB. Catching that in the TSPEC
  rather than at the PR gate is worth more to this feature than any of my three findings.
- **§7.6's matrix correction is a document choosing accuracy over its own earlier argument.** The
  previous text used "matching the existing matrix" as a *reason*; the correction keeps the mechanism,
  drops the reasoning that no longer holds, and states plainly that per-platform coverage is not
  something CI delivers. It even flags that the YAML comment is stale about the value — a reader is
  told which of two disagreeing sources to trust. My F-01 is only that this honesty stopped at §7.6.
- **Row 4's fixture contract is now something a fixture author can actually discharge.** Five witness
  properties became seven, and the two added ones carry the injection point and the escape scoping —
  the second stated in *both* §5.3 and §7.4 deliberately, "so it is findable from both sides". That is
  the right instinct about how a reader arrives at a contradiction.

**Traceability:** AC-3.3's two directions are unchanged and remain decidable from the recorded file.
AC-3.1's dry-run surface is unchanged in intent and its oracle set is now stated in full (§7.4,
`:1874-1878`) rather than re-derived. AC-3.5's set-equality survives DEC-ENG-05 intact (Q-01). C-11's
new rung 4a is carried into `RUNG_ORDER` and into §8.3's `startup.mjs` row, so an implementer cannot
build the six-rung ladder by accident. No scope creep, no P0/P1 requirement dropped, and no product
decision taken inside a technical section.

## 6. Recommendation

**Approved with minor changes**

Every v7 finding is resolved, two of them at the root and one with more than I asked for. The new
material this round — the scanner measurement, rung 4a, the CI matrix, the M-ENG-09 obligation split,
the config-file catch — is grounded in HEAD wherever it claims to be, and I checked roughly thirty
citations individually rather than sampling. Nothing previously approved regressed. From the product
lens the document is done: every P0/P1 requirement traces, AC-3.3's two directions are decidable, and
the one place the design contradicted approved upstream text is now the place it agrees with it.

No High finding is open. Three edits to fold into the next touch of the file, in priority order:

1. **F-01 (Medium)** — sweep §9.2's O-ENG-T1/T4/T5 to the one-platform matrix §7.6 now states.
2. **F-02 (Medium)** — mark §5.3's top-level catch as introduced by this feature (`:1253`, `:1813`);
   `run.mjs` has no catch at HEAD.
3. **F-03 (Low)** — anchor the `{ kind: "dispatch-error" }` *return* at `orchestrate-dev.js:1857`.

F-01 and F-02 are both one-edit, single-paragraph changes and neither blocks Phase P. If the author
takes only one, take F-02: a fixture author acting on a false present tense costs more than a stale
open question does.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

