# Cross-Review: product-manager — REVIEW (Phase CR, Final Codebase Review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/` — the feature's implementation on `feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 2
**Scope:** Product lens only — requirements traceability (REQ-CONS-01…07, AC-1.1…AC-7.2), scope compliance, acceptance-criteria fidelity. Technical design, test strategy and code quality belong to the SE and TE lenses.

## Method

Delta re-review. I read my own v1 (`CROSS-REVIEW-product-manager-REVIEW-v1.md`), diffed the branch from the commit I reviewed there (`5cb7efc2..HEAD`, HEAD `d779a2ed`), and asked two questions only: is each of my blocking findings closed on the **production** path, and did the revision break anything. I did not re-open sections v1 approved.

Every claim below is cited at `file:line` on HEAD, read on HEAD rather than copied from v1. Where a fix is claimed, I traced **AC → production caller → operator-visible artifact** and read the test that drives that caller.

Suite state: `npm test` in `pdlc/workflows` is 3888 passed / 1 failed. The one failure is `documentOracles.test.js` AT-22, whose received set is entirely untracked local files (`.serena/cache/typescript/document_symbols.pkl`, `.tokensave/tokensave.db`) — the documented false-red in `CLAUDE.md` ("an untracked local file … therefore fails the document oracle for reasons nothing to do with the diff"). Not a branch defect, not a finding. `build-runtime.mjs --check` is green (all five `dist/` rows in sync), so the fixes below are in the shipped artifacts, not only in source.

## Delta: prior findings

| v1 ID | Severity | Status on HEAD | Evidence |
|---|---|---|---|
| F-01 — `deferred:` never carried the deferred | High | **Closed** | Both operator channels render from `state.deferred` (set at `consolidate-learnings.js:928`) through one `renderDeferredEntry` (`:2153-2162`): the terminal row at `:2284-2286`, report item 8 at `:2347-2354`, which also points at the proposal file. `none` is now reserved for the empty case. Driven through `main()` at `consolidationOperatorChannels.test.js:129` with an empty-case control at `:159`. |
| F-02 — AC-6.2/6.3 unreachable, `seamCandidates` unwired | High | **Closed** | `main` step 10 now calls it: `state.seamCandidates = seamCandidates(escalations)` (`:659`), rendered by `renderAdvisoryItem` (`:2178-2210`) into report item 7 (`:2343`) with the corpus state, the candidate or the tie, the widenings, and AC-6.3's consumer-local operator action. Three rows drive `main()` — candidate, tie, absent corpus (`consolidationOperatorChannels.test.js:174`, `:198`, `:212`) — so the candidate row cannot pass by printing one unconditionally. |
| F-03 — no streak could ever reach threshold | High | **Closed** | `parseConsumedBlocks` (`:1300-1330`) reconstructs one entry per prior pass from the log's `<!-- pdlc:consumed -->` blocks; `main` re-reads each pass's corpus through the same listing and folds `[...priorPasses, currentPass]` (`:681-696`). Read at `:540`, **before** the current pass's own block is appended at `:591`, so this pass is not double-counted. `remediationChoice` now has a production caller for exactly the `ineffective` rows, with `headExists` from a real `cat-file -e` probe (`:724-736`). The probe is pinned as a real input by the HEAD-present / HEAD-absent pair at `consolidationOperatorChannels.test.js:417`/`:448`, with a one-counted-pass control at `:478`. I also checked the reachability worry behind Q-01: no seam in this protocol can unlink a file (`:1453`), so a prior pass's corpus is still readable, and a member deleted since contributes no text rather than a false `unmeasurable` streak (`:1727` skips an empty consumed set). |
| F-04 — AC-2.3's bar unstated and unenforced | High | **Closed, with a consequence — see G-01** | The bar and the exact evidence shape are now in the clustering prompt (`:618-630`), and enforced on the production path by `clearsPatternBar` (`:1006-1019`) before any routing (`:791-798`); `renderEvidenceLine` (`:1028-1037`) always emits the AC-3.2(iii) line, `(unmet)` rather than dropped. Both arms and the unrecognised shape are driven through `main()` (`consolidationOperatorChannels.test.js:227`, `:241`, `:258`, `:272`). |
| F-05 — every promotion cited every LEARNINGS | Medium | **Closed, with a precision caveat — see G-03** | `promotionSources` (`:1049-1059`) narrows each section's `source:` to the features its own evidence names, called at `:2390`. Oracle is a discrimination, not a containment (`consolidationOperatorChannels.test.js:301`). |
| F-06 — CR round missed four unwired ACs | Medium (Process) | **Closed** | The sweep is now CR grounding in both lenses' prompts: "name the production caller that assembles it and the test that drives THAT caller, or file a finding. A builder covered only through its own unit tests is not wired" (`orchestrate-dev.js`, commit `a2446b8f`). |
| F-07 — docblock still called the file a SKELETON | Low | **Closed** | `consolidate-learnings.js:21-25` now states the pass is implemented end to end and names the DC-07 rule. |

## Findings

All six blocking findings from v1 are closed on the production path. The three below are new, and all three arise from the F-04 and F-05 fixes themselves — the narrower attention this round is for.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| G-01 | High | Local | **The AC-2.3 diversion mislabels a clean pass `promoted-degraded`.** Status is derived from `deferred.length > 0` (`consolidate-learnings.js:939`), and the new bar rejection pushes into that same `deferred` array (`:791-798`). So a pass that promoted two genuine patterns and correctly rejected one coincidence now terminates `promoted-degraded` — with no reason code — although vocabularies §1's own join reserves that status for an AC-3.5 fallback class. | AC-7.1, AC-2.3, §4b |
| G-02 | Medium | Local | **The proposal file gains a fourth cause REQ does not enumerate.** AC-3.4 states it is written "when, and only when, the pass has something to propose that it does not enact (AC-3.5, AC-5.4, AC-6.3)". A bar rejection is none of the three, yet it writes the file (`:791-798` → `:931-935`) and mixes a rejected coincidence into the same artifact as genuine PR-failure residue. | AC-3.4, AC-2.3, AC-3.5 |
| G-03 | Medium | Local | **`promotionSources` matches feature names by substring, so a PR body can cite a LEARNINGS that did not evidence the promotion.** `String(basename).includes(f.trim())` (`:1055-1057`) makes evidence `["feat-a"]` match `LEARNINGS-feat-alpha.md`. AC-3.2(i) asks each promotion to cite *its* sources by feature name; a prefix collision silently widens the citation the reviewer judges against. | AC-3.2 |

### G-01 — a correctly-rejected coincidence should not read as a degraded run

`docs/_constraints/pdlc-consolidation-vocabularies.md:67` settles the join in one sentence: "A pass that promoted something **and also hit an AC-3.5 fallback class** is `promoted-degraded`, never a bare `promoted`." The next sentence supplies the controlling precedent for a *filter* rather than a failure: a pass "that suppressed one duplicate and landed another is `promoted`" — and FSPEC §6.3 says why, in terms that fit the new bar exactly: `duplicate-suppressed` "is decided per proposal *before* any PR is attempted, fires no fallback, and **is not a failure**" (`FSPEC-pdlc-consolidation-agent.md:898-899`).

The AC-2.3 bar is that same shape. It is decided per proposal at `:791`, before `routeProposal` at `:799`; it fires no §6.3 fallback class; it adds no reason code to `state.reasons`. It is the bar working, not the pipeline failing. But because the rejection lands in `deferred`, `:939` reads it as degradation:

- `state.deferred = deferred` — `:928`
- `state.status = deferred.length > 0 ? "promoted-degraded" : "promoted"` — `:939`

Concretely: a pass whose model returns three clusters, two of which clear the bar and land as constraint promotions, terminates `promoted-degraded`. Per FSPEC §7.3's own gloss the operator reads that as "a degraded run cannot read as an unqualified success" (`REQ:360`) — so the row tells the operator something failed when nothing did. Under NFR-3 this is not the rare case: running on a cadence is expected to surface coincidences, and the prompt now actively instructs the model about them, so the mislabel is the *common* outcome of a healthy pass.

The gap is untested because the existing rows exercise the bar only when it is the sole cluster, where `enacted` is empty and `no-op` is correct either way (`consolidationOperatorChannels.test.js:253`). The mixed pass — one enacted, one bar-rejected — has no row.

Fix: keep bar rejections out of the status derivation. Either track them in a separate list that feeds `state.deferred` for reporting but not `:939`, or key `:939` on the presence of a §6.3 failure class (an item carrying a `reason`), which is what the vocabulary's join actually names. Then add the mixed-pass row: two clusters, one clearing the bar and one not, asserting the status is verbatim `promoted` **and** that report item 8 still names the rejected pair — a positive assertion on the same path as the negative one.

### G-02 — the proposal file's "only when" is a biconditional REQ enumerates

AC-3.4 (`REQ:272-273`) states the proposal file's cause set as a closed list of three: AC-3.5 (the PR could not be opened), AC-5.4 (a propose-only remediation), AC-6.3 (a consumer-local widening). The bar rejection now writes it as a fourth cause (`:931-935`), and `renderProposalFile` renders such an item with `detail:` set and `diff: (unavailable)` (`:2430-2433`) — since a rejected cluster is never authored.

Two product consequences, neither fatal, both worth a decision rather than a default. First, the artifact the operator opens expecting "work this pass could not land" now also contains "work this pass deliberately declined", and the two want different responses. Second, the enumeration in AC-3.4 is stated as *only when*, so shipping a fourth cause makes a REQ sentence false rather than merely incomplete.

I am not asking for the behaviour to be reverted — putting a rejected coincidence in front of a human is a defensible reading of AC-7.1's "what it deferred for human judgment". I am asking that it be either (a) recorded upstream as a fourth cause, or (b) rendered under a heading in the file that separates declined-by-bar items from degraded ones. Filed as an erratum against REQ in this round's hand-off, since the enumeration is REQ's to widen.

### G-03 — substring matching can over-cite a promotion's sources

`promotionSources` narrows correctly for well-separated feature names, which is what the fix was for and what its test pins. The residual is the matcher: `all.filter((basename) => features.some((f) => String(basename).includes(f.trim())))` (`:1055-1057`). Feature names in this repo are prefix-related by convention (`feat-a` / `feat-alpha`, `pdlc-consolidation-agent` / `pdlc-consolidation-agent-v2`), so a promotion evidenced by the shorter name silently cites the longer name's LEARNINGS too.

The reviewer reading the PR is the human control the whole feature rests on (US-02), and this widens the evidence they judge against without saying so. The fallback-to-all arm is honest and should stay; it is the matcher that should be tightened — match the feature name as a whole `[a-z0-9-]`-bounded token of the basename, the same word-boundary discipline the pipeline already applies to heading concepts. A row with two consumed LEARNINGS whose feature names are prefixes of one another would pin it.

## Questions

| ID | Question |
|----|---------|
| Q-01 | v1's Q-01 is now answered by construction — no seam can unlink a file (`:1453`), so prior passes' corpora survive and the streaks are genuinely reachable. The residual: a corpus member that is `.gitignore`d or moved between passes contributes no text, and `:1727` skips an empty consumed set entirely. Should a pass whose reconstruction came back empty be *reported* as such in item 5, so the operator can tell "no promotion has recurred" from "the evidence for those passes is gone"? Both render as no flag today. |
| Q-02 | G-02's routing: is a bar-rejected coincidence a *proposal* for AC-3.4's purposes, or a non-proposal the log should note and the file should not carry? The answer decides whether REQ widens the enumeration or the code stops writing the file for that cause. Product call, not a code one. |
| Q-03 | AC-6.3's operator action is now rendered every pass a widening candidate exists (`:2202-2206`). Under `/loop` that is the same sentence on every tick until the operator edits an untracked config file. Should the log row carry a marker so a later pass can say "already recommended" rather than repeating? Raised in v1 as Q-02 and still open; not a blocker either round. |

## Positive Observations

- **The four unwired ACs are wired the way the ACs describe, not the way the tests wanted.** Each fix put the call in `main()` and left the pure function alone — `seamCandidates` at `:659`, `remediationChoice` at `:735`, `clearsPatternBar` at `:791`, `promotionSources` at `:2390`. That is the honest shape of a DC-07 remediation: the builder was never wrong, the assembly was missing.
- **The new tests drive `main()`, and their controls are real.** `consolidationOperatorChannels.test.js` opens by saying every row drives the default export and reads what the operator reads (`:3-12`), and it holds to it. The AC-6.2 row is paired with a tie row and an absent-corpus row so it cannot pass by printing a candidate unconditionally (`:198`, `:212`); the `ineffective` row is paired with a HEAD-absent probe row and a one-pass row so neither the probe nor the threshold can be a constant (`:448`, `:478`). Negative assertions are paired with positive ones on the same path — the bar-rejection row asserts `records` is empty **and** that the report names the cause (`:252-254`).
- **`parseConsumedBlocks` reads the log before the pass writes into it.** `:540` then `:591` is the ordering that keeps the current pass out of its own prior-pass fold; a reversed read would have inflated every streak by one and made AC-5.3 fire a pass early. The comment at `:673-679` states the deleted-member case explicitly rather than leaving it to be discovered.
- **`renderEvidenceLine` closed the AC-3.2(iii) gap in the direction that favours the reviewer.** The old code dropped the line for an unrecognised shape; the new one emits `(unmet — AC-2.3 bar not cleared)` (`:1036`). A promotion whose evidence the pipeline could not read is now visible in the PR body as exactly that, which is the fact the human reviewer needs most.
- **The pipeline-scope question was taken as a decision, not absorbed silently.** DEC-CONS-08 records that the two mid-phase `orchestrate-dev.js` changes ship on this branch, with the revert cost and the scope reasoning stated (`DECISIONS-pdlc-consolidation-agent.md:58`, §12 at `:1091`). I am not re-litigating it; it is recorded where a later reader will find it.

## Recommendation

<!-- filled next -->

## Verdict

<!-- filled last -->
