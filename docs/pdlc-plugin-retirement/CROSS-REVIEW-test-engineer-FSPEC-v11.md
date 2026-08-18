# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.8, 2026-08-18)
**Upstream re-read:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` v0.12; measured surface `docs/_constraints/pdlc-retirement-baseline.md`
**Date:** 2026-08-18
**Iteration:** 11 (delta confirmation on the erratum edit `8c5847a6`…`1eccc97c`)

## Overview

Not a re-review. The FSPEC was approved at v0.7 and has since taken a targeted erratum edit
folding in TSPEC §6.1 errata 3 and 5, plus a held-class ledger and a REQ v0.12 re-pin. This
round answers one question: **does the delta resolve its routed items without breaking anything
previously approved?**

Method: `git diff 638413b4..HEAD` on the FSPEC, then re-read the FSPEC against upstream **at
HEAD** (DEC-ERR-03) — REQ v0.12 §A-1 and NG-1/NG-3/AC-3.3, and the measured-surface rows
`docs/_constraints/pdlc-retirement-baseline.md` M-11h, M-11n, M-11o — not just the dispatch
list. Where the delta makes a claim about the repo (a host surviving, a value staying valid,
an assertion tightening), I checked the repo rather than the prose: `pdlc/skills/consolidate-learnings/SKILL.md`,
`pdlc/engine/scripts/publish-preflight.mjs`, `pdlc/engine/package.json`,
`pdlc/workflows/__tests__/consolidationPreflight.test.js` and `.claude/pdlc.config.example.json`.

**Answer: no — three High findings.** Two of the four routed items land as text but do not hold
against HEAD (F-01, F-03); one lands in a form that contradicts its own upstream without routing
the contradiction (F-02). The other two routed items — the held-class ledger and the transitive
closure over classes 7–12 — land cleanly and are recorded under Positive Observations.

## Routed-item ledger

| Routed item | Landed? | Holds? |
|---|---|---|
| Class 11 / §3.3 step 4 — capability disposition for `consolidate-learnings` | Yes (:163, :193–:199) | **No** — F-01, F-02 |
| Class 10 (:162) — prose only, values stay | Yes | **No** — F-03, F-04 |
| Class 10 — `consolidationPreflight.test.js` tightened to set-equality | Yes (:162) | **No** — F-03 |
| §3.1 held-class set recorded (class 6, classes 7–12) | Yes (:167–:170) | Yes |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The stated edit does not produce the stated outcome: after deleting only the `:11` bundle reference, `consolidate-learnings/SKILL.md` still advertises a dead host.** §3.3 step 4 promises "no SKILL.md advertises a dead host" and that the skill is "still operator-invocable in session". But baseline M-11n scopes the class-11 edit to the bundle reference **at `:11`**, and the lines the sweep does *not* touch are the load-bearing ones: `SKILL.md:8-13` reads "This skill **delegates to a workflow script**. It does not run the pass itself. The pass is performed in code by `pdlc/workflows/consolidate-learnings.js`", followed by "Performing the pass by hand **bypasses the machinery** the skill exists to drive: the `.consolidation-log.md` boundary, deterministic `failure-mode-id` derivation, NFR-4 duplicate suppression, the AC-3.1 guard-set PR route, the AC-1.3 in-progress marker." After class 5 (`sync-workflows.sh`) and class 7 (M-10's bundle), nothing loads that module: the engine vendors **only** `orchestrate-dev.js` and `orchestrate-queue.js` (`pdlc/engine/scripts/publish-preflight.mjs:221-222`; `pdlc/engine/package.json` `files: ["vendor/workflows/"]` filled by `scripts/prepack.mjs`). So the post-sweep skill points at a module with no loader — the dead-host advertisement the step promises to prevent — and "operator-invocable in session" resolves to exactly the hand-run its own text calls a bypass of the log boundary, duplicate suppression and in-progress marker. Either widen the class-11 edit to the delegation contract (`:8-13`) and state what the in-session pass now *is*, or state plainly that the unattended capability retires **and its machinery-backed guarantees with it**. As written the claim "no user-visible way to run consolidation is lost" is false at the granularity the skill itself documents. | §3.3 step 4 (:193–:199); §3.1 class 11 (:163); baseline M-11n |
| F-02 | High | Cross-Feature | **Class 11's "deleted, not rewritten" contradicts upstream at HEAD, and the contradiction is filed as a *downstream* erratum instead of being routed upstream.** REQ v0.12 §A-1 (:332) states the sweep edits `consolidate-learnings/SKILL.md`, "a human-invoked skill NG-1 keeps, **by rewriting its bundle reference to name the surviving execution path**". `docs/_constraints/pdlc-retirement-baseline.md` M-11n (:69) says the same and is explicit: "the reference is **rewritten** to name the surviving execution path, not allow-listed **and not deleted**". The FSPEC now says the opposite, and §7.3 records it under **downstream errata accepted** — the section for TSPEC-raised defects folded into *this* document — with no matching row in §7.2 (upstream errata) and no REQ or baseline edit. The FSPEC is very likely *right* on the facts (see F-01: no host survives), which is precisely why this must travel upstream: today an implementer reading REQ A-1 or the measured-surface row writes a rewrite, one reading FSPEC class 11 deletes, and no oracle distinguishes them (AC-1.2's L-2 term `\.bundle\.js` goes empty under either). Raise erratum 3 against REQ §A-1 and the baseline M-11n row, and record it in §7.2 once REQ moves. | §3.1 class 11 (:163); §7.3 (:850–:852); REQ §A-1 (:332); baseline M-11n (:69) |
| F-03 | High | Local | **Class 10's tightened assertion cannot fail in the gate, and the class row names the wrong file for it.** The row says `.claude/pdlc.config.**example**.json`'s values stay and that `consolidationPreflight.test.js`'s two assertions survive "with `postWavePathspecs` tightened from containment to set-equality (C-6)". The test does not read the example file: `pdlc/workflows/__tests__/consolidationPreflight.test.js:197-210` (T00) reads `.claude/pdlc.config.**json**` — the operator's **untracked** config — and branches on `existsSync`, with the file's own comment naming the else arm "File absent (fresh CI clone)". In CI the tracked repo has no `.claude/pdlc.config.json`, so the arm carrying `expect(postWavePathspecs).toContain("pdlc/workflows/dist/")` never executes there. Tightening `toContain` to set-equality therefore buys **no** gate strength: the tightened oracle is unfalsifiable in the required-check set, and its only live effect is on operator machines, where an operator who legitimately adds a second pathspec (the generic facility explicitly permits it — baseline M-11h) now goes red for a config choice this feature does not govern. If C-6 wants the pinning, pin it where it is tracked and always evaluated — the **example** file the class row actually names — and leave the presence-gated consumer-config assertion at containment. | §3.1 class 10 (:162); `consolidationPreflight.test.js:197-210` |
| F-04 | Medium | Local | **Class 10's "values stay" silently binds a decision §1.2 leaves to the TSPEC.** The row justifies retention with "(they still regenerate the surviving probe CLI)", which is true only under the AC-1.1 branch that **keeps** `pdlc/workflows/dist/`. §1.2 (:50–:52) routes the probe CLI's post-sweep home to the TSPEC ("the single surviving path TSPEC names"), and §4.1 (:329) keeps the other branch live: "the directory is gone and the probe CLI lives at the single surviving path TSPEC names". Under that branch the retained `postWavePathspecs` value `["pdlc/workflows/dist/"]` and the `postWaveCommand` output path are stale, and F-03's tightened set-equality turns stale into red. TSPEC TT-5 currently pins `dist/`, so nothing is broken today — but the FSPEC now carries an unstated dependency on a downstream choice it declares undecided, inverting the altitude. One clause fixes it: "values stay **on the branch that retains `dist/`**; if the TSPEC names a different home, class 10 re-points both values and the assertion follows the new path." | §3.1 class 10 (:162); §1.2 (:50–:52); §4.1 (:329) |
| F-05 | Medium | Local | **The capability claim added by the delta has no oracle anywhere, and its only upstream oracle is one the FSPEC deliberately declines to assert.** §3.3 step 4 now asserts the skill "survives, still operator-invocable in session". REQ AC-3.3 (:430–:436) requires that each skill in the set "**loads and runs when invoked**"; FSPEC §6.3's AT-3.3 (:718–:720) asserts set-equality of the fifteen names and states outright that "loads and runs when invoked" is *not* asserted, "no observation short of running the skill". That trade was fine while step 4 promised only a text rewrite — it is not fine now that the delta puts a behavioural survival claim on the same file. Give the claim a black-box oracle at REQ/FSPEC altitude: post-sweep `consolidate-learnings/SKILL.md` names a path that exists at HEAD **and** contains no reference to a retired host — falsifiable by inspection, no skill execution needed, and it is the check that would have caught F-01. | §3.3 step 4 (:196–:198); §6.3 AT-3.3 (:718–:720); REQ AC-3.3 |
| F-06 | Medium | Local | **The held-class ledger records the class-6 hold but leaves the contested text uncorrected.** §3.1's new paragraph says "Class 6 waits on TSPEC §6.1 erratum 6". Erratum 6 is a *membership* correction: TSPEC §6.1 item 6 states 20 of M-8's modules are deleted and `hookCompatibility.test.js` is **reduced, not deleted**, plus the `SKIP_INVENTORY` count. Class 6's row still reads "M-8's 21 `*.test.js` … deleted (never skipped)". Recording the hold is honest and correct; it does not stop a reader from taking the uncorrected 21 as the disposition. Add "(count and `hookCompatibility.test.js`'s disposition contested by erratum 6; not yet corrected here)" inline in the row, so the contested literal carries the flag rather than a paragraph four rows away. | §3.1 class 6 (:154) and held-classes paragraph (:167–:170) |
| F-07 | Low | Process | **§7.3's header count and the erratum table are now out of step with §7.2's provenance.** §7.3 says "Three TSPEC §6.1 errata are folded in here (v0.8)" and lists errata 3, 5 and 9 — but erratum 3's row ("Disposed in §3.3 step 4; class 11 amended") describes an edit that contradicts upstream (F-02), which is an upstream erratum in downstream clothing. Once F-02 routes, this table should show erratum 3 as *raised upstream*, not *folded in here*, and §7.2's closed-errata table gains the row. Keeping both tables truthful is what lets a later reader reconstruct which document decided what. | §7.2 (:833–:844); §7.3 (:847–:855) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is the retirement of the *unattended, machinery-backed* consolidation pass an accepted capability loss, or is re-hosting it under the engine a **blocking** predecessor? §3.3 step 4 says re-hosting "is successor work (REQ NG-5)" while also claiming nothing user-visible is lost. Those two sentences can both be true only if the in-session hand-run is considered equivalent to the module run — which the skill's own `:8-13` denies. Answering this decides whether F-01 closes with a prose widening or with a REQ-level scope decision. |
| Q-02 | Does `pdlc/workflows/consolidate-learnings.js` itself survive the sweep as source with no loader (M-11o edits its banner, so it is not in M-8), and is that intended? A surviving, unreachable, still-tested module is a maintenance surface the sweep was meant to remove; if it is meant to survive for the successor re-hosting, say so in class 11 so the next reader does not file it as an oversight. |
| Q-03 | Carried from v10, still open: does §7.3's SE-v8 F-04 routing oblige TSPEC §5.5 to answer whether the sink comparator pins a join, or may it close as "no join, C2 agreement suffices"? |

## Positive Observations

- **The held-class ledger is the right instrument and lands correctly.** The transitive closure
  is right: AC-1.1's `dist/` set-equality is discharged by class 7, and classes 8–12 all carry
  "after class 7" ordering obligations, so the gated set is exactly {6, 7–12} as recorded.
  Naming class 6's separate dependency (erratum 6) rather than folding it into one blanket hold
  keeps the two release conditions independently checkable.
- **"A held class leaves AC-1.1 unsatisfied — not a C-7 red, never registered as a tolerated
  failure" is exactly the distinction REQ v0.12's new C-7 subsection draws,** and it is stated
  in the FSPEC's own vocabulary rather than quoted. This is the sentence that stops an
  implementer from reaching for a skip-list when a held class makes a check red, and it closes
  v10's Q-01 without an oracle being invented for an unobservable state.
- **Erratum 5's reasoning is factually correct where it can be checked.** `build-runtime.mjs`
  survives reduced (M-7), `dist/` is not an L-2 term, and `waveExecution.test.js`'s parser
  coverage is genuinely untouched by a value change — so "the generic facility is not touched"
  holds. F-03 and F-04 are about *where the pinning lives* and *which branch it assumes*, not
  about the retention decision itself, which reads as correct.
- **The provenance refresh from v10's F-02 landed in full** — header pin, §7.2's traced version
  and the Cross-Reviews field, now compressed to a range rather than a stale enumeration.
- **§7.3's erratum-9 row absorbed SE v9 F-01's conjunct** without widening the FSPEC clause past
  its upstream; the "present and passing" conjunct is now explicitly preserved for re-homed hosts.

## Recommendation

**Needs revision.** The delta lands all four routed items as text, but three of them do not
survive contact with HEAD: class 11's disposition promises an outcome its own scoped edit cannot
produce (F-01), states it in terms that contradict REQ §A-1 and the measured baseline without
routing the contradiction upstream (F-02), and class 10's tightened assertion is pinned to a
branch that never runs in CI and to a file the class row does not name (F-03).

Concretely, to close: (1) widen class 11 / §3.3 step 4 to the delegation contract at
`SKILL.md:8-13` and say what the in-session pass now is, or record the capability retirement
honestly; (2) raise erratum 3 against REQ §A-1 and baseline M-11n and move its row from §7.3 to
§7.2; (3) re-point the tightened pin at the tracked example file, leaving the presence-gated
consumer-config assertion at containment. F-04 through F-07 are one clause each and can ride the
same revision.

Nothing previously approved is broken by the delta's *held-class* work, and no finding here
reopens a section the erratum did not touch.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 1}
