# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 4
**Scope:** frozen delta re-review of `0dc2464..HEAD` — 45 insertions, 0 deletions, two commits
(`9102fb8` answering PM Q-02, `27d3129` answering TE Q-01). Only the two inserted blocks were read
for new issues; the round was approved at v3 and nothing else is re-litigated.

## Delta inventory

| Commit | Section | What landed |
|--------|---------|-------------|
| `27d3129` | §A.2 property 1 (after the "coincidence is an invariant" paragraph, `:172-192`) | Answers TE Q-01: the dispatch-set equality ranges over a `_recordDocType(docType)` probe at the composition site, not over `dispatches[i].docType`; adds two PLAN obligations (full six-phase run; `∪ {null}` at the site vs. bare literal for the accepted set) |
| `9102fb8` | §T.3 capture-script section (`:766-788`) | Answers PM Q-02: `.baseline-worktree` is neither ignored nor `finally`-removed at HEAD; adds two obligations — a root-anchored `.gitignore` rule and `git worktree remove --force` in a `finally` |

## Verification of the delta's repository claims

Every load-bearing factual claim in the two inserted blocks was re-measured at HEAD, not read off
the document's prose:

| Claim in delta | Measured at HEAD | Holds |
|----------------|------------------|-------|
| `git check-ignore -v .baseline-worktree` exits non-zero | exits 1, no output — no rule covers it | ✅ |
| `coveredViolations` walks the whole tree skipping only `.git/`, `node_modules/` | `const WALK_SKIP_DIRS = new Set([".git", "node_modules"]);` `pdlc/workflows/lib/document-oracles.mjs:69`, consumed at `:78` | ✅ (line number exact) |
| `/.claude/pdlc.config.json` is root-anchored in `.gitignore`, the pattern to copy | present, with the "anchored so the fixture's nested `.claude/` tree is untouched" rationale directly above it | ✅ |
| The `_`-prefixed probe idiom is established in the module | `_recordQueueRow` is an existing injected recorder seam (`orchestrate-dev.js:1607`), alongside `_git`/`_agent`/`_now` | ✅ — and `_recordQueueRow` is the closest precedent, a recorder rather than a doer |
| Phase CR reaches `dispatchAndVerify` carrying `docType: null` | `reviewLoop({ doc: "docs/${featureName}/", phase: "CR", docType: null … })` `orchestrate-dev.js:14553-14556`; `roundDocType = docType === undefined ? docTypeFromPath(doc) : docType` (`:7306`) stays `null`; `wrapped` forwards it as `dispatchAndVerify`'s `docType` (`:7343-7358`) | ✅ — so the `∪ {null}` member is real, not hypothetical |
| `dispatches[]` carries no row when `injectHere` is false | the document's own §A.2 `:134` and the §D report schema `:547-558`; internally consistent | ✅ (design claim, not a HEAD claim) |
| `git worktree remove` vs `rm -rf` leaving a stale `.git/worktrees/` entry | correct git behaviour; a subsequent `git worktree add` at the same path reds without `prune` | ✅ |

No claim in the delta contradicts the repository. Both answers are grounded rather than asserted,
and the PM Q-02 answer in particular found a live hazard (the `coveredViolations` walk) that the
question did not ask about.

## Findings

None blocking. Under the frozen-round contract, a finding blocks only if the delta broke something
that worked before or if a load-bearing claim contradicts HEAD; neither applies. The two Mediums
below are completeness gaps inside the new text and are recorded for PLAN, not for the gate.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The `_recordDocType` probe's injection path is unstated, and the seam plumbing at HEAD does not carry it for free — least of all on the arm that produces the `null` member the new assertion requires.** The delta says the probe is "defaulted to a no-op and injected only by this suite, called in `dispatchAndVerify`". At HEAD an L3 suite drives `mainDev({…})`, and seams reach `dispatchAndVerify` through **three explicit whitelists**, none of them a spread of caller-supplied keys: `wrapperSeams` is an object literal enumerating eleven seams (`orchestrate-dev.js:12381-12394`), `dispatchAndVerify` destructures a fixed seven (`:8862-8877`), and — decisively — `reviewLoop`'s `wrapped` closure re-lists seven seams by hand when it calls `dispatchAndVerify` (`:7343-7358`). Phase CR's `docType: null` reaches the composition site **only** through that third path (`:14553-14565` → `reviewLoop` → `wrapped`). So an implementer who adds `_recordDocType` to `mainDev` and `wrapperSeams` alone gets a probe that observes the six `converge` doc types and never `null`, and the `LEARNINGS_TARGET_DOCTYPES ∪ {null}` assertion the delta just made load-bearing fails for a plumbing reason that reads as a product bug — or, worse, is quietly weakened to the bare literal, at which point P-2c's claim is narrated again. One sentence fixes it: name the four edit sites (`mainDev` params → `wrapperSeams` literal → `reviewLoop` params → `wrapped`'s call), and state that the probe defaults to a no-op at each hop so the shipped path is unchanged. | §A.2 property 1 (`:178-192`) |
| F-02 | Medium | Cross-Feature | **Both `.baseline-worktree` obligations are stated as PLAN tasks with no oracle, so neither can red.** The delta correctly argues belt-and-braces — but a `.gitignore` line and a `finally` block are exactly the two things that get dropped in a rebase and never noticed, because the capture script's happy path passes without either. Two cheap oracles exist and neither is named: (a) a guard assertion that `git check-ignore` exits 0 for `.baseline-worktree` at the repo root — the same shape as the existing measurement the delta itself ran, now inverted into an expectation; (b) a capture-script test that forces the script to throw between materialise and remove (a scripted seam failure) and asserts the worktree path is **absent** afterwards *and* that `git worktree list` shows no entry for it — the positive conjunct that distinguishes a real `git worktree remove` from an `rm -rf`, which the delta's own rationale says is the difference that matters. Absent (b) the `finally` is untested; absent (a) the ignore rule is untested. The `coveredViolations` blast radius the delta cites is repo-wide and has bitten this monorepo before (project CLAUDE.md carries the same warning), which is why this is `Cross-Feature` rather than `Local`. | §T.3 (`:766-788`) |
| F-03 | Low | Local | **"written only for dispatches that were *accepted*" collides with the row schema's own use of "rejected".** In §D's report shape, `rejected[]` is a **per-source** list *inside* a `dispatches[]` row (`:552`) — a dispatch can be recorded and still have rejected sources. The delta's "accepted" means "passed `injectHere`", a dispatch-level notion. A PLAN author reading the two together can reasonably build a fixture where an all-sources-rejected dispatch is expected to produce no row, which is not what §A.2 `:134` says. Suggest "for dispatches the injector was actually called for" and drop "accepted". | §A.2 (`:175`) |
| F-04 | Low | Local | **v3 F-03's mis-citation is still present, untouched by the delta.** `:865-866` still reads "on the `advisoryDisabled.test.js` pattern (that file's default export runs the pipeline the same way)". That file has no default export; it imports the default export of `orchestrate-dev.js` (`import mainDev, …`) and calls `mainDev({…})`. Recorded as non-gating carry-forward, not a new finding — the delta did not touch §T.5 and v3 was approved with it. | §T.5 (`:865-866`) |

DEFERRED: v3 F-01 (AT-32's byte-identity operand still unnamed) and v3 F-02 (`RETRY-ITERATION` still has no suite file — `:209` names §T.6 as the owning *case* but no file) remain open, both non-gating and both out of scope for a frozen round; they belong in PLAN's task text.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The probe fires "immediately *before* `injectHere` is evaluated" on both arms. On a retry iteration, `dispatchAndVerify`'s `for(;;)` loop re-composes the prompt — does the probe fire once per **episode** (alongside the injector, before the loop, §A.2 property 2) or once per **iteration**? A per-iteration probe still satisfies set equality (sets absorb duplicates), so nothing reds either way — but the `RETRY-ITERATION` fixture's call-log assertions are counting-shaped, and a reader who puts the probe inside the loop has silently made the two instruments disagree about what one dispatch looks like. One clause placing the probe next to the injector, before the loop, settles it. |

## Positive Observations

- **The Q-01 answer chose the operand that can fail rather than the one that is easy to reach.** Sourcing the set from `dispatches[i].docType` would have needed no new code and would have been green forever — the delta says so in as many words ("a report-sourced set equality stays green through exactly the drift it was written to detect") and pays for a probe seam instead. That is the DC-07 production-path argument applied to a *negative* observation: the only instrument that can see a `docType` the feature declined is one that sits upstream of the decline.
- **`∪ {null}` is the sharpest sentence added this round.** Asserting the composition-site set and the accepted set *separately*, with their difference being exactly the `docType` conjunct's work, converts P-2c from a claim into a two-sided oracle: drop the conjunct and the accepted set gains `null`; widen the literal and the site set stops matching. I checked the `null` is real at HEAD (`:14555`, `:7306`, `:7343-7358`) rather than a defensive flourish — it is.
- **"Never merely that it is contained in it" pre-empts the pass-by-omission failure without being asked.** A scripted matrix short of six phases is precisely how enumerated-contract tests false-green, and the delta names the hazard and the remedy (set equality over a full six-phase run) in the same breath.
- **The PM Q-02 answer went past the question into a shipped gate.** Q-02 asked about `process.chdir` flakiness; the answer measured `git check-ignore` at HEAD, found no rule, and then traced the consequence to `coveredViolations`' whole-tree walk with an exact file:line — an abandoned worktree would present a second copy of every `docs/**` artifact to the oracle. That is a real, repo-wide false-red generator, found by following the hazard rather than closing the ticket.
- **`git worktree remove` over `rm -rf`, with the reason stated.** The stale `.git/worktrees/` administrative entry is the kind of detail that costs an afternoon the first time; writing it into the TSPEC means the PLAN task cannot get it wrong by choosing the obvious command.

## Recommendation

**Approved with minor changes** — no High findings, and nothing in the delta broke or contradicts
HEAD. Both inserted blocks answer their questions with measured evidence and, in both cases, the
answer is the stronger of the two available readings rather than the cheaper one.

F-01 and F-02 should reach PLAN as task text: F-01 because the `∪ {null}` assertion the delta just
made load-bearing is unreachable unless `reviewLoop`'s hand-listed seam forwarding
(`orchestrate-dev.js:7343-7358`) is edited too, and F-02 because two obligations with no oracle are
two obligations that survive exactly until the first rebase. F-03 is a five-word wording change and
F-04 is a carry-forward one-word citation fix.

One erratum remains routed and unamended upstream: **FSPEC BR-1** still reads as consuming the
`dispatchKind` classification without restating membership (D-2, `FSPEC:236`), which the TSPEC's
`docType` conjunct diverges from — already documented as ERR-7 in the TSPEC's own errata section,
re-raised here only because the FSPEC bytes are unchanged at HEAD and AT-02's expected set inherits
the ambiguity.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
