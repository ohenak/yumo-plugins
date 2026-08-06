# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 3
**Scope:** Local (delta re-review — v2 findings + changed sections only)
**Baseline diffed:** `502e0e0..HEAD` (6 revision commits, +274/−63; REQ v1.1 → v1.2)

## Prior-Finding Disposition

All nine v2 findings, checked against the revision. Nothing below is re-litigated.

| v2 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BL-01 is split. BL-01 now claims only the model ladder (`MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK` `orchestrate-dev.js:1652-1653`, resolver `:1833`) and is correctly **Met**; BL-01a books the escalation corpus as **"Not met, and not expected to be"**, with the `advisoryTierOn` `:9653` / `enabled: false` `:1663` chain and the missing `advisory` key in this repo's config all restated correctly. AC-6.1 gains a three-row corpus-state table whose first row is the shipping state, and AC-6.3 now requires a non-empty corpus **and** at least one *other* seam having escalated — so the day-one "widen all five `ADVISORY_SEAMS` (`:1669`)" firing I flagged is closed by construction. The preamble's "a tier that could not escalate is not a tier whose seams worked" is the exact distinction I asked for. |
| F-02 | High | **Resolved** | AC-5.5 no longer borrows AC-5.3's `counted` population. It defines an **evaluated pass** — non-empty consumed set, any AC-5.2 verdict produced for this promotion — and says plainly why (`counted` "excludes `insufficient-evidence` by construction and would make this state unreachable"). AC-5.3 gains the reciprocal sentence bounding its own population to the `ineffective` streak. `unmeasurable` is now reachable and `consolidation.unmeasurablePasses` has an effect. AC-1.4's parenthetical is rewritten to "restating each prior promotion's **standing** verdict and state", which is the correct weaker claim. (One residue in the rewrite — v3 F-03, a new finding, not this one reopened.) |
| F-03 | Medium | **Resolved as scoped** | AC-3.8's isolation clause is narrowed to branch operations and enumerated (`checkout` / `switch` / `stash` / `reset` / `rebase` / no fetch into its refs), with an assertable observable ("its HEAD must be identical before and after the pass"). AC-3.8b is new and answers the second half: the writes land in the invoking tree, the pass commits them itself once at terminal outcome, pathspec-scoped, never `-a`, never pushed, and the marker is never committed. The contract exists now. Two problems with *how it is specified* are new findings (v3 F-01, F-04), not this one reopened. |
| F-04 | Medium | **Resolved** | §4b is a single enumerated-vocabulary table with a Category column and a "May accompany status" column, and `promoted-degraded` is added as a sixth terminal status. The two joins I named are settled explicitly: promoted + AC-3.5 fallback ⇒ `promoted-degraded`; all-promotions-`duplicate-suppressed` ⇒ `no-op`. I checked the vocabulary for orphans — every backticked lowercase token used as a status, reason code, trigger, route, verdict, state, action or `credential:` value elsewhere in the REQ has a §4b row, and §4b has no row for a token the REQ never uses. Set-equal. |
| F-05 | Medium | **Resolved** | The predicate's corpus is now a delimited `<!-- pdlc:consumed {passId} -->` block, "no other record type may appear inside one", and the feature commits to updating `nudge-consolidation.sh:41` so the hook and the pass keep one predicate. NFR-5 is rewritten against the block and names the three would-be false positives (PR title, `artifact` field, effectiveness row). The mechanism is right; whether it can be *reached* from the file that exists at HEAD is v3 F-02. |
| F-06 | Medium | **Resolved** | The tick order is stated as four numbered steps (enumerate → volume → cadence → `skipped-cadence`), and the enumerate/read distinction I guessed at is made explicit and twice repeated: "Enumeration is basenames only, which is all `nudge-consolidation.sh:41` does", and AC-1.1's "having read **no LEARNINGS body**". AC-1.2 is re-grounded on step 1 rather than asserting availability. |
| F-07 | Medium | **Resolved** | AC-7.2 exempts `skipped-cadence` from the log-row obligation — the option I recommended — and NFR-3a keeps its three-member trigger set with the reason stated rather than a `none` member bolted on. The exemption's second consequence is written down too ("it is that same log the AC-1.1 predicate and the AC-1.1 cadence datum are read from"). |
| F-08 | Low | **Resolved** | Both trailers now point at the REQ-CONS-03 preamble ("Pass identity and artifact naming") — AC-3.7(c) and NFR-4 alike. |
| F-09 | Low | **Resolved** | `nudge-consolidation.sh` `(:47-48, header :4)`. Confirmed: `:47` opens the `print(json.dumps(...))`, `:48` carries `"additionalContext": msg`. |

Nine of nine resolved. The findings below are **new**, and all arise in sections the revision
changed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-3.8b cites `commitPaths` as its precedent; the citation is false about HEAD, and the mechanism it names does not deliver the guarantee the AC makes in the same sentence.** Two errors. (a) The precedent is misidentified: `commitPaths` (`pdlc/workflows/orchestrate-dev.js:8669`) is **Phase I's wave-commit helper** — its only three call sites are the per-task wave commit `:10158`, the `postWavePathspecs` chore commit `:10169`, and the advisory-record commit `:10515`. It is **not** "the pipeline's own queue-row commit". `orchestrate-dev.js` contains no queue-row commit at all: `defaultRecordQueueRow` (`:8751`) returns `{ queueRow: "none" }` and its own doc comment says "row location and row writing stay in orchestrate-queue.js; orchestrate-dev.js never learns the queue's table grammar" (`:8744-8747`). The queue row is committed by `commitQueueRow` (`pdlc/workflows/orchestrate-queue.js:1576`, called at `:1550`). (b) The two shapes are **not** the same discipline, and the difference is exactly what AC-3.8b promises. `commitQueueRow` issues `git add -- {queuePath}` then `git commit -m {msg} -- {queuePath}` (`orchestrate-queue.js:1577`, `:1580-1585`) — the pathspec is on the **commit**, which is why its doc comment can claim isolation. `commitPaths` issues `git add -- ...paths` (`:8670`) and then a **plain `git commit -m message` with no pathspec** (`:8690`). Under `commitPaths`' shape, anything already in the index when the pass runs is swept into the pass's commit — and AC-3.8's shipping configuration is precisely a tree that "may be mid-pipeline on a `feat-*` branch", i.e. one where a staged index is routine. AC-3.8b's "pathspec-scoped to exactly those paths and never `-a`" is therefore not satisfied by the mechanism it cites. Cite `commitQueueRow`, or the advisory-record commit that already "mirrors `commitQueueRow`'s exact two-call shape" (`orchestrate-queue.js:1605`), and require the pathspec on both calls. | AC-3.8b |
| F-02 | High | Local | **`docs/_decisions/.consolidation-log.md` exists at HEAD and is a single-line JSON array — not a row table, with no statuses and no delimited blocks. The REQ specifies neither a migration nor a bootstrap, and both new mechanisms of REQ-CONS-01 read that file.** The file's entire content at HEAD is `[{"LEARNINGS":"…orchestrate-dev-workflow…","Date Completed":"2026-06-02"},{"LEARNINGS":"…pdlc-workflow-distribution…","Date Completed":"2026-07-29"}]`. The REQ describes it throughout as a thing with **rows** carrying a **status** — AC-2.4's pass record, AC-7.2's "the pass's row", AC-1.1's cadence datum "the most recent log row whose status is in the set `promoted` / `promoted-degraded` / `no-op` / `failed`". Zero rows at HEAD satisfy that description, with two consequences the revision created and did not close. (i) **No cadence datum exists**, so whether `cadenceHours` "has elapsed" is undefined on the very first tick of every repo including this one; step 2's volume test does not rescue it, because `docs/*/LEARNINGS-*.md` (the hook's own glob, `nudge-consolidation.sh:28`) matches **2** files here, under the default `volumeThreshold` of 5 — so the tick falls to step 3 with nothing to measure from. (ii) **No `<!-- pdlc:consumed -->` block exists**, so the new predicate reports `LEARNINGS-orchestrate-dev-workflow.md` un-consolidated even though the legacy log records it consumed on 2026-06-02 and `CONSOLIDATION-PROPOSAL-2026-07-29.md` shows the pass ran. It is then re-consumed, and NFR-4's duplicate suppression cannot suppress the resulting promotions because it is keyed on `failure-mode-id` and AC-5.2's own carve-out says a pre-convention LEARNINGS "names no id". So the first pass re-promotes from already-consolidated material — the one thing NFR-4 exists to prevent. The REQ owes a stated migration (seed the blocks from the existing entries, and/or a no-datum rule for AC-1.1's step 3) and a corrected description of what the file is at HEAD. | AC-1.1, NFR-4, AC-7.2 |
| F-03 | Medium | Local | **AC-1.4's broadened `no-op` collides with the two counting populations AC-5.3 and AC-5.5 just had separated.** The revision added a second cause for `no-op`: "because every promotion it would have made was suppressed as a duplicate (NFR-4)". Such a pass has a **non-empty** consumed set. AC-5.5 defines an evaluated pass as "a pass with a **non-empty consumed set** that produced any AC-5.2 verdict for this promotion" — so the duplicate-suppressed `no-op` **is** an evaluated pass and does advance or reset the `unmeasurable` streak. But AC-1.4 asserts flatly "It advances neither AC-5.3's `recurred` streak nor AC-5.5's `insufficient-evidence` streak", and the reason it gives — "with an empty consumed set it is not an evaluated pass" — covers only the *first* cause. AC-5.3 has the mirror-image problem: "an `insufficient-evidence` verdict and an AC-1.4 `no-op` pass are skipped entirely", though a duplicate-suppressed `no-op` pass produces real `prevented` / `recurred` verdicts over a real consumed set. Three ACs now disagree about a reachable case, which is the same defect class as v2 F-02 in a new place. The fix is to qualify all three by **consumed-set emptiness**, never by the `no-op` label — AC-5.5's parenthetical "(empty consumed set)" already does it correctly and should be the model. | AC-1.4, AC-5.3, AC-5.5 |
| F-04 | Medium | Local | **AC-3.8b commits the consuming-repo promotions to the invoking branch and never pushes; the REQ states no route by which they reach the default branch, and one plausible route contradicts REQ-CONS-02's own review model.** AC-3.8b: the writes land "on whatever branch it is already on (AC-3.8 forbids changing it)" and the commit is "never pushed". In the shipping configuration (AC-3.8, same repo) that branch is routinely a mid-pipeline `feat-*`. So `DOMAIN-CONSTRAINTS.md` and `DECISIONS-{topic}.md` promotions become commits on an unrelated feature branch, and reach the default branch only if that feature's PR merges — carrying project-level promotions into a PR raised and reviewed for something else, under a `ship-pr` push the pass did not perform but the pipeline will (Phase PUB). If instead that branch is abandoned or its PR closed, the promotions are silently lost and the AC-1.1 predicate has already marked their LEARNINGS consumed, so no later pass will redo them. Both outcomes are worse than the status quo and neither is stated. The REQ needs one sentence: either the invoking branch is the accepted destination (and say what happens when it is abandoned, and that the promotions ride an unrelated PR), or name a different destination. | AC-3.8b, AC-2.1, AC-2.2 |
| F-05 | Low | Local | **§4b forbids the two corpus-state reason codes on the one status they are most likely to accompany.** `no-advisory-corpus` and `advisory-corpus-empty` are listed as legal only with `promoted` / `promoted-degraded` / `no-op`. But AC-6.1 has the pass record one of them whenever it reads the corpus, §4b's closing rule is "each must be legal for the status it accompanies", and `failed` is reachable *after* the corpus read (§4b sources `failed` from AC-1.6 **and AC-3.5**). A pass that read an absent corpus and then failed can therefore report neither code legally. Add `failed` to both rows, or state that corpus-state codes are dropped on a failed pass. | §4b, AC-6.1 |
| F-06 | Low | Local | **Three citation offsets in the new material.** (a) AC-1.5: `resolveAdvisoryRung` is "exported at `orchestrate-dev.js:1833` and documented **there** as 'the **one** ladder the tier ships'" — the export is at `:1833` (correct) but the quoted doc line is `:1800`; the two are 33 lines apart. (b) AC-1.5: the queue comment "the advisory driver resolves its own model rung" is at `orchestrate-queue.js:1244`, not `:1243` — `:1243` is the first half of that two-line comment — and the dispatch it introduces begins at `:1245`, so the cited `:1244-1251` spans half a comment plus a partial object literal. `:1243-1244` (comment) and `:1245-1256` (dispatch) are exact. (c) AC-5.2's mapping table cites `orchestrate-dev.js:6423` as the **shipped naming** of `CODE_REVIEW-{feature}-v{N}.md`; `:6423` is `artifactClassOf`'s classifier regex, which *recognises* the name but never constructs it. The sibling rows are exact construction sites (`:5799`, `:5429`), so this one row is weaker than the table implies. | AC-1.5, AC-5.2 |
| F-07 | Low | Local | **AC-5.2's undecidable-phase enumeration is incomplete, in a REQ that mandates set-equality elsewhere.** "Any phase the mapping cannot decide for a pre-convention file (I, CR, H, PUB, MERGE) counts as **not** exercised" omits **PT**, a shipped phase id (`orchestrate-dev.js:10030` `"Phase PT: PROPERTIES Tests"`, `:10212`) that the `Harvested from` mapping equally cannot decide. The governing sentence is universal so the rule stays total and no promotion is misclassified — hence Low — but §4b makes enumerated completeness this REQ's own standard, and the phase-id set is never enumerated anywhere in the document. Per CLAUDE.md the shipped set is R, F, T, D, P, PR, I, PT, CR, DOD, H, PUB, MERGE. | AC-5.2 |

## Existing-Code Claim Verification (changed sections)

Every `file:line` claim the revision added or changed, checked against HEAD on
`feat-pdlc-consolidation-agent` in a single pass. v2's 23 rows are not re-checked.

| # | New/changed REQ claim | Section | Verdict | Evidence |
|---|---|---|---|---|
| 1 | `additionalContext` at `nudge-consolidation.sh:47-48` | REQ-CONS-01 | **Confirmed** — v2 F-09 fixed | `:47` opens `print(json.dumps({...}))`, `:48` `"additionalContext": msg` |
| 2 | `resolveAdvisoryRung` is exported at `orchestrate-dev.js:1833` | AC-1.5 | **Confirmed** | `:1833` `export function resolveAdvisoryRung({ _agent, _log, _state, prompt })` |
| 3 | …and documented **there** as "the **one** ladder the tier ships" | AC-1.5 | **Off by 33** (F-06a) — the phrase is real and verbatim, at `:1800` | `:1800` `* \`resolveAdvisoryRung\` — TSPEC §3.4's model-rung ladder, and the **one** ladder the tier ships.` |
| 4 | `orchestrate-queue.js` dispatches through an injected seam with the raw agent and a threaded `rungState` rather than copying literals | AC-1.5 | **Confirmed substantively** — `runAdvisorySeamFn({ …, rungState, _agent: rawAgentFn, … })`, and `runAdvisorySeam` resolves via `resolveAdvisoryRung` (`orchestrate-dev.js:3132`) | `orchestrate-queue.js:1245-1256` |
| 5 | …at `orchestrate-queue.js:1244-1251`, comment at `:1243` | AC-1.5 | **Off by one, both anchors** (F-06b) | comment `:1243-1244`, dispatch opens `:1245` |
| 6 | `MODEL_ADVISORY` `:1652` / `MODEL_ADVISORY_FALLBACK` `:1653` are module-private | AC-1.5, BL-01 | **Confirmed** — restated from v2, still exact, neither carries `export` | `orchestrate-dev.js:1652-1653` |
| 7 | `commitPaths` at `orchestrate-dev.js:8669` is `git add -- <paths>` then a plain `git commit -m` | AC-3.8b | **Confirmed as to the shape** | `:8669` signature, `:8670` `["add", "--", ...paths]`, `:8690` `["commit", "-m", message]` — no pathspec |
| 8 | …and that discipline "already applies to the pipeline's own queue-row commit" | AC-3.8b | **False** (F-01) | `commitPaths`' only call sites are `:10158`, `:10169`, `:10515` (Phase I waves + advisory record). The queue row is `commitQueueRow` (`orchestrate-queue.js:1576`, called `:1550`), whose commit **is** pathspec-scoped (`:1580-1585`); `orchestrate-dev.js` has no queue-row commit — `defaultRecordQueueRow` `:8751` returns `"none"`, comment `:8744-8747` |
| 9 | LEARNINGS metadata table is `Feature` / `REQ` / `Date Completed` / `Total Iterations` / `Upstream` / `Harvested from` / `DoD rounds` at `harvest-learnings/SKILL.md:70-78` | AC-5.2 | **Confirmed, set-equal and line-exact** — `:70` header row through `:78` `DoD rounds` | `harvest-learnings/SKILL.md:70-78` |
| 10 | `Harvested from` is `:77`; `## 6. Approval Record` is `:105` and is keyed by document type, not phase | AC-5.2 | **Confirmed, both** | `:77`, `:105` (columns `Document Type | Round | Role | …`) |
| 11 | `CROSS-REVIEW-{role}-{docType}-v{N}.md` shipped naming at `orchestrate-dev.js:5799` | AC-5.2 | **Confirmed** — the construction site (`reviewTargetPath`) | `:5797-5799` |
| 12 | `POSTMORTEM-{phase}-{feature}.md` at `orchestrate-dev.js:5429` | AC-5.2 | **Confirmed** — the construction site | `:5429` |
| 13 | `CODE_REVIEW-{feature}-v{N}.md` at `orchestrate-dev.js:6423` | AC-5.2 | **Weak** (F-06c) — `:6423` is `artifactClassOf`'s recogniser regex, not a construction site | `:6420-6425` |
| 14 | The docType→phase mapping REQ→R, FSPEC→F, TSPEC→T, DECISIONS→D, PLAN→P, PROPERTIES→PR | AC-5.2 | **Confirmed** against the shipped phase graph | CLAUDE.md "Phase graph and the erratum channel"; `converge()` phases R, F, T, D, P, PR |
| 15 | The undecidable set for a pre-convention file is (I, CR, H, PUB, MERGE) | AC-5.2 | **Incomplete** (F-07) — omits PT | `orchestrate-dev.js:10030`, `:10212` `"Phase PT: PROPERTIES Tests"` |
| 16 | `ADVISORY_SEAMS` at `orchestrate-dev.js:1669` | AC-6.3 | **Confirmed, exact** | `:1669` `export const ADVISORY_SEAMS = Object.freeze(["A1","A2","A3","A4","A5"]);` |
| 17 | `advisoryTierOn` `:9653` resolves from `parseAdvisoryConfig` `:1682`, default `enabled: false` `:1663`; this repo's `.claude/pdlc.config.json` has no `advisory` key | REQ-CONS-06, BL-01a | **Confirmed** — restated from v2 F-01's own evidence, all four still hold | `orchestrate-dev.js:9653`, `:1682`, `:1663`; `.claude/pdlc.config.json` |
| 18 | `docs/_queue/ESCALATIONS.md` does not exist at HEAD or in history | REQ-CONS-06 | **Confirmed** — and the REQ now says so itself, which is the F-01 fix | `docs/_queue/` holds `QUEUE.md` alone; `git log --all -- docs/_queue/ESCALATIONS.md` empty |
| 19 | The AC-1.1 predicate's file is `docs/_decisions/.consolidation-log.md`, read at `nudge-consolidation.sh:32`, matched at `:41` | REQ-CONS-01, NFR-5 | **Confirmed as to the lines** | `:32` path, `:33` `os.path.isfile(log)` guard, `:41` predicate |
| 20 | …and that file is a log of pass **rows** carrying a **status** | AC-1.1, AC-2.4, AC-7.2 | **False as to HEAD** (F-02) | the file exists and its entire content is one JSON array of `{"LEARNINGS","Date Completed"}` objects — no rows, no statuses, no `<!-- pdlc:consumed -->` blocks |
| 21 | `docs/*/LEARNINGS-*.md` is the enumeration glob (`nudge-consolidation.sh:28`) | REQ-CONS-01 step 1 | **Confirmed** — and it matches 2 files here, below the default `volumeThreshold` 5, which is what makes F-02(i) reachable rather than theoretical | `:28`; `docs/orchestrate-dev-workflow/`, `docs/pdlc-advisory-tier/` |
| 22 | `consolidate-learnings/SKILL.md:43` records the pass in `.consolidation-log.md` | AC-2.4 | **Confirmed** | `:43` step 6 |
| 23 | The pass ships as a workflow bundle alongside the skill, a new `build-runtime.mjs` artifact and manifest row | §5 Scope | **Confirmed as a coherent plan** — the `orchestrate-queue` shape it names is real (bundle + skill sharing a name, manifest row per artifact) | CLAUDE.md "Workflow scripts and the runtime build"; answers v2 Q-04 |

## Questions

Only questions arising from the changed sections. v2's Q-01…Q-05 are answered by the revision
(Q-01 by AC-6.1's corpus-state table and BL-01a, Q-02 by AC-5.5's evaluated-pass population,
Q-03 by AC-3.8b, Q-04 by §5's workflow-bundle paragraph, Q-05 by AC-3.8b's "never committed"
ruling on the marker) and are not re-asked.

| ID | Question |
|----|---------|
| Q-01 | For F-02: is the intended migration to **seed** `<!-- pdlc:consumed -->` blocks from the two entries already in `.consolidation-log.md`, or to declare the legacy JSON out of scope and accept one re-consolidation of `LEARNINGS-orchestrate-dev-workflow.md`? The second is defensible at this scale, but it must be *chosen* — and if chosen, NFR-4's idempotence claim needs a sentence saying it does not cover pre-convention LEARNINGS, because `failure-mode-id` cannot key them. |
| Q-02 | Also for F-02: what is the cadence datum on a repo with no qualifying row — treat the interval as elapsed (first tick always runs), or seed it from something observable (the oldest un-consolidated LEARNINGS' `Date Completed`, the log file's own mtime)? The first is simplest and is testable; the second couples the datum to a field `harvest-learnings/SKILL.md:74` already emits. |
| Q-03 | For F-04: is the invoking `feat-*` branch genuinely the intended destination for the AC-2.1/AC-2.2 promotions, accepting that they ride an unrelated feature's PR to the default branch? If yes I have no objection to the mechanism — but the REQ should say it out loud, because a reader of AC-3.6 ("never pushed") will reasonably conclude the opposite. |
| Q-04 | AC-3.8b says the pass commits "exactly once, at its terminal outcome". A `refused` pass (AC-1.3) never takes the marker and does no work — does it commit at all? The AC-1.3 marker table implies not, but "every terminal outcome" and "exactly once at its terminal outcome" read as universal over §4b's six statuses. One row in the AC-1.3 table (a "commits?" column) would settle it against the same enumeration. |

## Positive Observations

- **The revision answered the hardest v2 finding by narrowing the requirement rather than the
  claim.** REQ-CONS-06 could have been saved by asserting that an operator will enable the tier.
  Instead it states flatly that `ESCALATIONS.md` "does not exist at HEAD", books the corpus as
  BL-01a **"Not met, and not expected to be"**, specifies three corpus states with the *shipping*
  one first, and gates AC-6.3 on two conjuncts so the day-one all-five-seams widening cannot fire.
  That is the absent-first design I asked for, and it makes the requirement testable today rather
  than after an opt-in that may never come.

- **AC-1.5 went the other way on the ladder, and was right to.** v2's REQ conceded a restatement and
  called drift "a named risk". The revision found the actual seam — `resolveAdvisoryRung` is
  exported (`orchestrate-dev.js:1833`) and the shipped second consumer threads `rungState` through
  an injected seam rather than copying literals (`orchestrate-queue.js:1245-1256`) — and adopted it.
  Better still, the fallback clause forbids the outcome v2 settled for: a restatement is acceptable
  only with "a named drift observable … A restatement without that observable is not an acceptable
  outcome." Converting a named risk into a failing test is exactly the right move.

- **AC-5.2's phase observable is the strongest new material in the document.** v2's `prevented` arm
  rested on "a feature that exercised the promotion's recorded `phase`" with no field to read it
  from — I did not catch that, and the author did. The revision verified the absence against the
  real metadata table (`harvest-learnings/SKILL.md:70-78`), added the field, **and** supplied a
  total derivation for files predating the convention, with the undecidable case routed to
  `insufficient-evidence` rather than a guessed `prevented`. Three construction sites are cited and
  two of the three are exact. That is how a determinism claim is earned.

- **§4b is the right response to F-04, not the minimum one.** The ask was to reconcile two closed
  sets; the delivery is one table over *every* enumerated vocabulary in the document, with a
  Category column and an explicit legality join, plus the two previously-undetermined joins settled
  in prose beneath it. I checked it for orphans in both directions and it is set-equal against the
  rest of the REQ. Adding `promoted-degraded` as a status rather than leaving degradation in a route
  field is the substantive call, and it is the correct one — an operator reads the status.

- **The tick order made the document cheaper to review, not just correct.** Four numbered steps,
  the enumerate-vs-read distinction stated twice and anchored to what the shipped hook actually
  does, and a named cadence datum with the reason it must exist ("Without this, every tick's own row
  would become 'the last logged pass'"). F-02 is precisely a *bootstrap* gap in that datum — which
  is only visible because the datum was named. The v2 text had the same hole and no way to see it.

## Recommendation

## Verdict
