# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** Technical lens — feasibility, implementability, existing-code claim verification.
**Base verified:** branch `feat-pdlc-wave-resume` @ `d1ebb22f`; claims cross-checked against `main` @ `345ae358`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | This branch is 1637 commits behind `main`, and the REQ it authors is a from-scratch **regression of a document that already exists on `main` at v1.2** (410 lines, amendments dated 2026-08-13). Landing it re-introduces every staleness `main` already corrected. | Whole document |
| F-02 | High | Local | The "exists at HEAD" claims in §1 and BL-01/BL-03 are **false at this branch's HEAD** and misdescribe where the mechanism lives: it is merged to `main`, not sitting on the `pdlc-consolidation-agent` branch. | §1 ¶4–5, §5 BL-01/BL-03 |
| F-03 | High | Local | REQ-WVR-05 ("no resume state survives") **contradicts shipped behaviour**, which deliberately *retains* the complete ledger so a post-Phase-I re-invocation can skip Phase I. As written the AC mandates deleting state the shipped design depends on. | §7 REQ-WVR-05, §2 G-4 |
| F-04 | High | Local | REQ-WVR-06's absolute "does not consult commit presence" **forbids the shipped `head` ancestry corroboration**, which is exactly the control R-1 (history rewrite) relies on. The AC over-generalises OF-2 from *task commits as completion evidence* to *any git observation*. | §7 REQ-WVR-06, §8 R-1 |
| F-05 | Medium | Cross-Feature | BL-02's baseline file already exists on `main` and already carries `M-WG-1…M-WG-14`, including the three facts OF-1..3 restate. OF-1..3 are inline measured facts in a REQ where the bar is **cited `M-*` ids**; OB-2's promotion obligation is already discharged. | §4 OF-1..3, §5 BL-02, §9 OB-2 |
| F-06 | Medium | Local | The AC set is **not set-equal to the shipped/intended outcome catalogue**: there is no acceptance criterion for the "all waves recorded green ⇒ skip Phase I entirely" outcome, which is a distinct operator-visible resume outcome with its own announcement and its own report row. | §7 (REQ-WVR-01..07) |
| F-07 | Medium | Local | OQ-1 leaves the escape-hatch *form* open although the shipped mechanism already ships and announces one (delete the ledger file), and `startWave: 1` provably cannot express "force a full run". Leaving it open invites a second, divergent hatch. | §9 OQ-1, §7 REQ-WVR-04 |
| F-08 | Low | Local | C-1 (consumer-local untracked state) is already satisfied at HEAD-of-`main` by an anchored `.gitignore` entry; the constraint should cite it rather than state it as an unmet requirement. | §4 C-1 |
| F-09 | Low | Process | OF-1..3 are asserted "dated and reproducible from the cited run" but carry no reproducible anchor — no commit sha, run-report path, or POSTMORTEM id. As written they cannot be re-verified by a reviewer. | §4 preamble |

### F-01 — the document already exists on `main` at v1.2 (High, Cross-Feature)

Verification:

- `git rev-list --count HEAD..main` → **1637**; `git rev-list --count main..HEAD` → 5.
- `git merge-base --is-ancestor HEAD main` → false; merge-base is `c8aa22a4`.
- `git show main:docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md | wc -l` → **410** lines, `Version | 1.2`,
  carrying two dated amendment blocks (2026-08-13) and inline `**Correction, 2026-08-13.**` paragraphs
  that fix precisely the staleness F-02, F-03 and F-07 report below.
- The queue row and the traceability rows this branch adds already exist on `main`
  (`main:docs/_queue/QUEUE.md:95`; `main:docs/requirements/traceability-matrix.md:133-136`),
  so four of the five commits on this branch are re-additions.

This is not a merge-conflict nit: the v1.0 text on this branch *asserts* things v1.2 explicitly
records as corrected. Whichever way the merge resolves, a reviewer downstream cannot tell which
statement is current. **Required change:** rebase this branch onto `main` and continue from the
existing v1.2 document (an amendment round), or state in writing why v1.2's amendments are being
reverted. Do not proceed to FSPEC from the v1.0 text.

### F-02 — HEAD claims are false on this branch and mislocated on `main` (High, Local)

§1 ¶4 says "A manual resume pointer now exists (`implementation.startWave`…)" and BL-01/BL-03
say the pointer and the interim mechanism "exist at HEAD", gated on "`pdlc-consolidation-agent`
PR merged".

- At **this branch's HEAD** neither exists: `grep -c startWave pdlc/workflows/orchestrate-dev.js` → **0**
  (this tree's `orchestrate-dev.js` is 11,003 lines).
- On **`main`** both exist, and the gating condition is already satisfied — the mechanism merged in
  `87d9c6ad` ("feat(pdlc): consolidation agent … (#50)"), and the feature is archived at
  `main:docs/completed/pdlc-consolidation-agent/`. `main:pdlc/workflows/orchestrate-dev.js` is
  16,336 lines and carries:
  - `WAVE_STATE_PATH = ".claude/pdlc-wave-state.json"` at `:12214`, under a block comment headed
    `INTERIM: the wave ledger…` at `:12196`;
  - `parseWaveLedger` at `:12267`, `formatWaveLedger` at `:12325`, `computePlanHash` above them;
  - the read/resolve site at `:15228-15346` and the per-wave write at `:15590-15605`.
- §1 ¶5 places the interim mechanism "at HEAD of the pdlc-consolidation-agent branch". It is on
  `main`. BL-01/BL-03's gating logic ("Must exist at HEAD before FSPEC authoring") is therefore
  already met, and this feature's `ready: false` on those two prerequisites is stale.

**Required change:** rebase (F-01), then restate §1 ¶4–5 and BL-01/BL-03 against `main`, and
re-evaluate `ready:` in the frontmatter against the merged prerequisites.

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

### F-03 — REQ-WVR-05 contradicts the shipped retention decision (High, Local)

REQ-WVR-05 requires that after a Phase I that completes all waves, "no resume state survives for a
later fresh run of any feature to inherit; a subsequent invocation behaves as if no halted run ever
existed." G-4 restates it as "self-clearing lifecycle".

Shipped behaviour is the opposite, and deliberately so. `main:pdlc/workflows/orchestrate-dev.js:15607`
opens the post-wave block with the comment *"Every implementation wave is green and committed. The
record is KEPT"* — because the last per-wave write already records `lastGreenWave === waves.length`,
and the read path at `:15318-15334` uses exactly that shape to **skip Phase I entirely** on a later
invocation that halted downstream (CR, DOD, PUB). That is a load-bearing outcome, not an oversight:
it is what turns a DOD-phase halt into a minutes-long re-entry instead of a re-dispatch of every wave
over an already-finished tree. Invalidation is carried by `planHash` (a PLAN change re-derives the
hash and the ledger is ignored, `:15302-15306`) and by `feature` (`:15294-15298`), not by deletion.

As written, REQ-WVR-05 is an instruction to delete that record and lose that behaviour, and no
Non-Goal or Risk acknowledges the trade. This is the single most likely place for the FSPEC to
implement a regression while believing it is satisfying the REQ.

**Required change:** restate REQ-WVR-05 as **retention with invalidation** — a leftover record must
never *warp* a later run (wrong feature, changed plan, non-ancestor head ⇒ ignored with an announced
reason), which is the property G-4's second clause already asks for — and drop the "no state
survives" clause, or record explicitly that the phase-skip behaviour is being withdrawn and why.
`main`'s v1.2 amendment already resolves it this way ("REQ-WVR-05 is restated as **retention with
invalidation**"), which is further evidence this branch is reverting settled ground (F-01).

### F-04 — REQ-WVR-06 over-generalises OF-2 and forbids a shipped safety control (High, Local)

REQ-WVR-06's Then clause: "the determination does not consult commit presence or commit messages".

OF-2's actual observation supports the narrow claim — *a completed task may produce no commit, so
the presence of a task commit is not usable as completion evidence*. The AC generalises that to *any*
git observation, and the shipped mechanism makes a different, sound git observation that the AC as
written forbids:

- the ledger record carries an optional `head` field — the commit that carried the recorded wave's
  work (`main:…orchestrate-dev.js:12296-12304` on read, `:12325-12333` on write);
- the read path corroborates it by asking the tree whether that sha is an **ancestor of HEAD**
  (`headCorroborated`, `:15280`, applied at `:15307`), and ignores the ledger with an announced
  reason when it is not — "branch was reset or re-cut since it was written, so the work it records
  is not in this tree".

That is not commit-presence-as-completion-evidence; it is falsification of a record the pipeline
otherwise has no way to distrust, and it is precisely the mitigation R-1 (§8) claims for
"stale record after history rewrite" — R-1 currently attributes that mitigation only to
REQ-WVR-03/-02, which is a weaker story than what already ships.

**Required change:** narrow REQ-WVR-06 to what OF-2 supports — *completion is never inferred from
the presence, absence, or message of a task's commit; a task that completes with nothing staged
never causes its wave to be treated as incomplete* — and add an explicit allowance (or a separate
AC) for ancestry corroboration of a recorded commit, then update R-1 to cite it. Leaving the
absolute wording in place sets up a contract-fidelity conflict the TSPEC cannot resolve without
either regressing the control or contradicting the REQ.

### F-05 — OF-1..3 duplicate measured facts that already exist as `M-WG-*` ids (Medium, Cross-Feature)

BL-02 lists `docs/_constraints/pdlc-wave-gate-baseline.md` as a prerequisite "available for
citation", and OB-2 owes its promotion. Both are already discharged: the file exists on `main`
(`git ls-tree main docs/_constraints/`) and carries `M-WG-1 … M-WG-14`, including the three facts
OF-1..3 restate in prose:

| REQ fact | Existing measured fact on `main` |
|---|---|
| OF-1 (re-invocation re-enters wave 1, re-dispatches completed waves) | `M-WG-6` |
| OF-2 (a completed task may produce no commit / nothing committed on a red gate) | `M-WG-4` |
| OF-3 (the halted wave's own work is uncommitted at the halt) | `M-WG-4`, with `M-WG-12` on the commit loop's pathspec scoping |
| §3 Non-Goal "absence of a POSTMORTEM on wave halts" | `M-WG-5` |
| §3 Non-Goal "the halt's queue-row recording" | `M-WG-7` |

Per the REQ altitude bar, a REQ carries shipped-behaviour facts as **cited `M-*` ids from the
constraints file**, not as inline observations. **Required change:** after the rebase (F-01),
replace OF-1..3 with citations to the existing `M-WG-*` ids, add any genuinely new observation to
the baseline file rather than to the REQ, and close OB-2 as already satisfied. Two independent
statements of the same measured fact will drift.

### F-06 — the acceptance-criteria set is not set-equal to the resume outcome catalogue (Medium, Local)

There are three operator-visible resume outcomes, and the REQ enumerates two. Missing: **all waves
already recorded green ⇒ Phase I is skipped in full**, announced as its own message and recorded as
its own phase row (`main:…orchestrate-dev.js:15318-15334`, `allWavesRecorded` at `:15327`; the
`⏭` phase row at `:15615-15620`). No AC in §7 covers it: REQ-WVR-01 covers resuming *at a wave*,
REQ-WVR-05 covers what is left behind, and neither states what a run does when the record says
everything is done. That gap matters more than usual here, because this is the one outcome where
the pipeline **runs no wave gate at all** in Phase I — so REQ-WVR-03's "the full test suite verifies
the whole tree before any new commit lands" is vacuously true rather than actively satisfied, and
the REQ never says so.

**Required change:** add an AC for the all-green outcome, stating its announcement, its report row,
and explicitly how REQ-WVR-03's verification guarantee is discharged when no wave executes. State
the outcome catalogue as a closed set so a deleted case is detectable downstream, rather than
leaving the enumeration open-ended.

### F-07 — OQ-1 is open against a hatch that already ships and is already announced (Medium, Local)

OQ-1 asks whether the REQ-WVR-04 escape hatch should be a config value, a record-removal action, or
both. At HEAD-of-`main` it is a record-removal action, and it is announced in both resume messages:
"Delete `.claude/pdlc-wave-state.json` to force a full run" (`:15331` and `:15341-15342`).
The config alternative is provably not expressible today: the manual override is honoured only when
`startWave > 1` (`const explicitPointer = startWave > 1`, `:15236`), so `startWave: 1` is
indistinguishable from the default and cannot mean "ignore the ledger"; every value that *is*
distinguishable skips waves.

Leaving the form open invites the FSPEC to add a second knob whose semantics overlap the deletion
hatch — precisely the interim/final divergence R-4 warns about. **Required change:** resolve OQ-1 to
record deletion (with the announcement wording pinned as a requirement, and owned as an exact string
by the lowest layer that pins it — TSPEC/PROPERTIES, not the REQ), or state the config knob's
semantics precisely enough that it cannot collide with `startWave`.

### F-08 — C-1 is already satisfied and should cite its evidence (Low, Local)

C-1 requires the record to live in consumer-local untracked state. That is already true and
anchored: `main:.gitignore:41` carries `/.claude/pdlc-wave-state.json` (root-anchored, alongside
`/.claude/workflows/`, with the comment at `:24-32` explaining why the anchor matters for the
checked-in fixture tree). Cite it so the FSPEC does not re-litigate the location.

### F-09 — OF-1..3 carry no reproducible anchor (Low, Process)

§4's preamble promises facts "each dated and reproducible from the cited run", but the entries cite
only "the pdlc-consolidation-agent run of 2026-08-09" — no commit sha, run-report path, or
POSTMORTEM id. A reviewer cannot re-derive them. The `M-WG-*` rows in the baseline file show the bar:
each carries an executable re-verification command. Subsumed by F-05 if OF-1..3 are replaced by
citations.
