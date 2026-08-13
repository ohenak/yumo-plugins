# POSTMORTEM — Phase F — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → **POSTMORTEM-F** |
| Downstream | operator decision; `LEARNINGS-pdlc-headless-engine.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..5}.md`, `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{1,2}.md` (14 files) |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (pm-author) | 1.0 | 2026-08-11 |

RESOLVED: yes

Resolution (2026-08-11, operator-directed): the three M-ENG-06 cells in
`docs/_constraints/pdlc-engine-baseline.md` were corrected per §Recommendation Step 1, each
state re-derived from HEAD before writing — AC-4.4 restated partially green (`AuthPolicyError`
at `transport.mjs:23`/`:100`/`:204`, retry exclusion at `adapter.mjs:291`, test at
`__tests__/transport.test.js:50`/`:63`; run-stops assertion and AC-4.1's catalogue naming
remain the named unasserted half), AC-4.1 moved out of the green row to its own partially-green
row (no catalogue strings anywhere in `pdlc/engine/`, no set-equality assertion in
`pdlc/engine/__tests__/`), and AC-2.3's evidence cell now cites `__tests__/transport.test.js:170`
(F-27). AC-4.4 dropped from REQ §1.2a's "Red at HEAD" list (Step 2); the REQ ends the round
smaller. TE's two Mediums are test-authoring notes routed to TSPEC, not taken into the REQ
(Step 3).

## Phase

**Phase F — FSPEC authoring and cross-review. The halt is not a review-round exhaustion: both
documents converged. Phase F halted on the ERRATUM-PROTOCOL step that runs *after* convergence —
the delta confirmation of the REQ erratum round.**

| | |
|---|---|
| Documents | `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.1, converged) and its upstream `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.8) |
| Branch | `feat-pdlc-headless-engine` |
| Halt reason as reported | *delta confirmation for the REQ erratum round did not pass — non-approving: `[se-review]`* |
| Round budget | **not exhausted.** `MAX_REVIEW_ROUNDS = 5`; FSPEC converged in 2 rounds. The binding limit was the erratum bound: **one erratum round per upstream document per phase** |
| Erratum window | `765d2909` (FSPEC approval anchors, 01:08) → `afe0351f` (non-approving delta confirmation, 01:19) — **11 minutes** wall clock |
| Terminal state | ten of eleven errata confirmed resolved; one confirmed-but-wrong (`F-25`, High) plus one contradiction it exposed in an unchanged neighbouring row (`F-26`, Medium). No second erratum round is available, so the phase halted |

The distinction matters for the fix: nothing here says the specs are unconverged. It says one
factual cell, written *by* the erratum round, states the opposite of what HEAD does.

## Iterations

| Round | Document | Version reviewed | SE verdict | TE verdict | Note |
|---|---|---|---|---|---|
| R1–R4 | REQ | v0.4 → v0.7 | — | — | Phase R; converged. Size discipline (pm-author §5e) moved the measured facts to `docs/_constraints/pdlc-engine-baseline.md` as `M-ENG-06`/`M-ENG-07`/`M-ENG-08`, cited from REQ §1.2a by id |
| F1 | FSPEC | v1.0 | Needs revision (3 High) | Needs revision | `cb3ab14e` answers both |
| F2 | FSPEC | v1.1 | Approved with minor changes `{high:0, medium:2, low:3}` | Approved with minor changes | Converged. Anchors recorded in `765d2909` |
| **E1** | **REQ (erratum)** | **v0.8** | **Needs revision `{high:1, medium:1, low:1}`** | Approved with minor changes `{high:0, medium:2, low:1}` | Delta confirmation of the erratum round — **the halt** |

Eleven errata were routed into E1 (two defects raised independently by both reviewers, nine
distinct edits), landed as four content commits plus the version note:

| Commit | Errata carried |
|---|---|
| `0664b6e6` | AC-1.2(c) dev-path read-set attribution; AC-1.3 `--loop` iteration bound |
| `53f07115` | AC-2.1 rows 2/4/5 named logged-in evidence; `pdlc doctor` surface authority |
| `b707edde` | AC-3.5 dispatchable skill-set equality; AC-4.5 transport identity and report delivery |
| `a10bd21d` | `M-ENG-06` declared total over the ACs (adds AC-2.3, AC-4.4 rows); `M-ENG-08` refusal case narrowed |
| `ba92cb92` | REQ v0.8 change note, §1.2a totality sentence |

Ten confirmed. The eleventh — the `M-ENG-06` totality edit — is where the round failed.

## Reviewers

| Role | E1 verdict | Blocking finding | Character of the review |
|---|---|---|---|
| `se-review` (software-engineer) | **Needs revision** | `F-25` (High): the `M-ENG-06` row created for AC-4.4 declares it *red — open work*; the reviewer re-derived it at HEAD and found it partially green, with the cited lines refuting the claim they are cited for | Re-derived every changed statement against HEAD rather than reading the edit as self-certifying (DEC-ERR-03), and recomputed both counting claims — AC-3.5's dispatchable set (10 identifiers / 12 prompt files / 5 operator-invoked) and `M-ENG-06`'s totality (26 criteria, one row each) — from the modules, not from the REQ |
| `te-review` (test-engineer) | Approved with minor changes | none | Confirmed the same ten errata; its two Mediums are test-authoring notes, not gates |

The two reviewers did **not** disagree with each other. Both read the same erratum round; only one
re-derived the specific cell that was wrong. Under the High-only convergence bar, a single open
High from either reviewer is sufficient to fail delta confirmation, and with the erratum bound at
one round per document per phase, failure is terminal for the phase.

## Pattern of Disagreement

Three shapes, in order of how much they cost.

**1. The disagreement is with HEAD, not between people.** Every other halt in this repo's history
has been two roles holding different views of what the document should say. This one is a factual
dispute between a document and the code it describes: `M-ENG-06`'s new AC-4.4 row says no
`auth-failure` member exists and stop-without-retry is unasserted; the reviewer opened the cited
spans and found the member defined and thrown, the retry loop already excluding it, and a test
already asserting it. Only the third clause (run-stops, plus AC-4.1's closed catalogue naming) is
genuinely open. There is no judgement call to arbitrate — one side is checkable and wrong.

**2. The wrong state is red-for-green, which is the exact error the section exists to prevent.**
§1.2a was added in round 2 because SE v1 F-07 and TE v1 F-07 both found the REQ silent about
whether a test written today starts red or re-asserts green. A row that says *red* about a green
criterion sends a planner to write a failing-first test that passes on the first run — the wasted
round §1.2a was created to eliminate. `F-26` is the mirror image and the more expensive one:
AC-4.1 is declared *green* while its set-equality half is unasserted, and a false green gets no
test written at all.

**3. The erratum edit widened its own review surface.** The edit did not just add two rows; it
declared the table **total** over the REQ's criteria — "every criterion appears in exactly one row;
a criterion without a row is a defect in fact". That sentence converts previously-unchanged rows
into load-bearing content. `F-26` says so explicitly: the reviewer would normally leave an
unchanged row alone under the delta protocol, but a table that claims single authority over start
states cannot carry two rows that disagree. A totality claim is the one kind of edit for which
"delta-scoped" is not a real narrowing.

## Best-Guess Root Cause

**Relocated measured facts are load-bearing for approval but sit outside every review loop, and
the erratum round is the first step that asks them to be exactly right.**

The chain:

1. The REQ approached its size budget, so pm-author §5e did what it is supposed to do: relocate the
   measured facts to `docs/_constraints/pdlc-engine-baseline.md` and cite them by id
   (`M-ENG-06`, `M-ENG-07`, `M-ENG-08`). REQ §1.2a now carries a pointer where it used to carry a
   table.
2. `docs/_constraints/` is **not a pipeline artifact**. It has no docType, no round window, no
   cross-review file, and it is not a member of the erratum routing set (REQ, FSPEC, TSPEC,
   DECISIONS, PLAN, PROPERTIES). Its rows were never read by a reviewer whose job was to falsify
   them; they were read as citations.
3. Rounds R1–R4 and F1–F2 approved the REQ and FSPEC while the relocated facts went effectively
   unaudited — approvable, because the criteria text that reviewers *do* review was sound.
4. The erratum round then asked the relocated file for exactly the property nobody had checked:
   totality and per-row accuracy over all 26 criteria. Two of the eleven errata (`M-ENG-06`
   missing rows, `M-ENG-08` over-broad refusal claim) are themselves defects in relocated content —
   evidence that this was already the weak surface before E1 opened.
5. The author, writing the fix, filled the two missing rows from the same reading of HEAD that
   produced the surrounding text rather than re-deriving the AC-4.4 state from the modules. The
   reviewer did re-derive it, and the round failed on the gap between those two methods.

Two contributing factors, neither sufficient alone:

- **The erratum bound is one round.** That bound is right for its purpose — it stops upstream
  churn from reopening settled documents — but it gives a factual edit no chance to be corrected in
  channel. A finding whose fix is "three cells and one word" costs a phase halt.
- **`F-25`'s fix does not live in the REQ.** The reviewer notes this and correctly declines to
  emit an erratum upward: the larger half of the fix is in `docs/_constraints/`, which has no owner
  document to route to. The protocol has no lane for "the defect is in a cited constraints file",
  so it surfaces as a non-approving verdict on the REQ instead.

## Recommendation

**Clear the halt with one evidence-backed edit, then re-run Phase F. Do not re-open the REQ's
criteria text — no reviewer asked for a change there, and no approved decision reopens.**

### Step 1 — Correct the three cells (one commit, `docs/_constraints/pdlc-engine-baseline.md`)

| Row | Change | Evidence to re-derive first |
|---|---|---|
| `M-ENG-06` AC-4.4 | *red — open work* → **partially green**, naming the unasserted half: the run-stops assertion, and the closed-catalogue naming that AC-4.1 owns | `transport.mjs:23`, `:100`, `:204` (`AuthPolicyError` defined, classified first, thrown); `adapter.mjs:291` (non-rate-limit rethrow, so never retried); `__tests__/transport.test.js:50`, `:63` |
| `M-ENG-06` AC-4.1 | *green* → **partially green**: individual classifications asserted, set-equality over the catalogue unasserted | absence of the catalogue strings in `pdlc/engine/`; no set-equality assertion in `pdlc/engine/__tests__/` |
| `M-ENG-06` AC-2.3 | add `__tests__/transport.test.js:170` to the evidence cell (`F-27`, Low, free while the file is open) | the row's state description is already right; this is citation hygiene |

Re-derive each from the modules before writing the cell. The whole failure is one cell written from
the document's own reading rather than from HEAD; repeating that method reproduces the halt.

### Step 2 — One word in the REQ (`§1.2a`)

Drop `AC-4.4` from §1.2a's "Red at HEAD" list. Nothing else in §1.2a changes, and the totality
sentence stays — it is correct and worth keeping now that the rows behind it are.

Both steps are inside the feedback-only bound: the REQ ends the round smaller, not larger.

### Step 3 — Take the two TE Mediums and SE's `F-27` in the same pass if they cost no bytes

They are test-authoring notes, not gates. Do not let them grow the REQ; if any needs more than a
clause, route it to TSPEC rather than writing it here.

### Step 4 — Flip the marker and re-invoke

Set `RESOLVED: yes` in this file **only after** the three cells are corrected on the branch and
each new state has been checked against HEAD, and commit that flip alongside the evidence. Then:

```
/pdlc:orchestrate-dev { "reqPath": "docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md", "forcePhases": "F" }
```

FSPEC v1.1 already carries both approvals and its anchors (`765d2909`); the re-run is confirming
the corrected erratum round, not re-authoring the spec.

### Durable countermeasures (route to LEARNINGS at harvest; not blocking this halt)

1. **Relocated measured facts need a review lane.** When pm-author §5e moves content to
   `docs/_constraints/`, the relocated rows should be reviewed with the citing document — either
   named in the citing section's review scope, or given a periodic re-derivation obligation. As it
   stands, relocation moves content out of the budget *and* out of the audit.
2. **A totality declaration is not a delta-scoped edit.** Any edit that claims a table is complete
   over some set re-opens every row in it. Either make the claim in a round with a full review
   window, or add the missing rows without the claim and declare totality separately.
3. **`M-ENG-*` states want three values, and now have them.** "Partially green" is doing real work
   here: both `F-25` and `F-26` are cases where a binary red/green forced a wrong answer. Keep the
   three-state vocabulary and require every partially-green row to name its unasserted half.
