# CODE REVIEW — pdlc-consolidation-agent (v6)

| Field | Detail |
|---|---|
| Feature | pdlc-consolidation-agent |
| Branch | `feat-pdlc-consolidation-agent` |
| Reviewer role | dod-verify (evaluator documents findings, fixes nothing) |
| Review version | v6 (delta re-verification) |
| Date | 2026-08-11 |
| HEAD reviewed | `dcf708c7` |
| Prior round | `CODE_REVIEW-pdlc-consolidation-agent-v5.md` |
| Remediation under review | `dcf708c7` "consumed set narrows on state, advisory reason codes ungated (K1, K2)" |
| Verdict | **Findings** |
| Branch coverage (lowest new module) | 87.54% (`consolidate-learnings.js`, measured this round) |
| Requirements traced | v5's 2 gaps both closed; 0 open |
| Boundary gaps | 1 |
| Scope | Local + Process (per-finding tags below) |

---

## §0 Dispatch reconciliation — the fifth consecutive round, and the worst one yet

**Scope: Process.** This round was dispatched as **"v2"**, instructed to read
`CODE_REVIEW-…-v1.md` as the prior round, and to write `…-v2.md`.

At HEAD, `-v1.md` through `-v5.md` are all committed on this branch. `-v1.md` through
`-v4.md` were merged to `main` via PR #50 (`87d9c6ad`); `-v5.md` landed in `c5b766d8`.
Writing "v2" would have **destroyed a merged, four-round-old record** and re-verified
against a review whose eight findings (F1–F8) were closed three rounds ago.

Two deviations from the dispatch, both mandatory under the dod-verify rule *"determine
the next unused integer"* and *"the loop refuses to overwrite an existing review file —
review history is append-only"*:

1. This file is **v6**, not v2.
2. The prior round re-verified is **v5**, not v1. v1's findings were checked for
   recurrence anyway (§3) and none has returned.

v5 recorded this same defect as its own Process finding, one round behind; it is now
four rounds behind and has escalated from a stale citation to a destructive write. **The
dispatcher's version argument is computed, not derived from the directory listing.**
`deriveRoundWindow`'s content-addressed discipline exists precisely to prevent this, and
the DOD dispatch path is not using it. This will recur next round unless fixed.

---

## §1 Disposition of v5's findings

Both of v5's findings were introduced by `eb2a0e44` and shared one root: the AT-K3b fix
narrowed a **local** (`readableBasenames`) instead of the **state** (`state.consumed`).
`dcf708c7` moves the narrowing to the state and re-cuts the step-10 gate.

| v5 # | Finding | Disposition at `dcf708c7` |
|---|---|---|
| **K2** | `state.consumed` unnarrowed ⇒ pair, terminal row, report item 3 and PR trailer disagreed | **Closed — verified** |
| **K1** | Both advisory reason codes gated on `readableBasenames.length > 0`, so every quiet week lost `no-advisory-corpus` | **Closed — verified** |

### K2 — closed

`consolidate-learnings.js:672` now assigns `state.consumed = readableBasenames` at step
6.5, ahead of step 7's pair append. All four surfaces read that one field —
`:1298` (`result.consumed`), `:2327` (durable terminal row), `:2372` (report item 3,
which *is* AC-7.1's *LEARNINGS consumed by basename*), `:2465`
(`PDLC-CONSOLIDATION-SOURCES`) — so the four now agree by construction rather than by
four coincident edits.

The un-consolidated count is genuinely untouched, checked rather than taken on trust:
`:591` seeds `state.consumed` with a **copy** (`[...predicate.unconsolidated]`), so the
step-6.5 assignment cannot reach the trigger arithmetic, which reads
`predicate.unconsolidated` (`:1481` `triggerFor`). The unreadable complement stays named
on `state.unread` (`:657`).

**Oracle is load-bearing (probe A).** Deleting line `:672` — i.e. restoring exactly the
pre-`dcf708c7` shape where only the pair is narrowed — turns the suite **RED**, 3
failures across 2 suites:

- AT-K3b Fixture 1 (mixed corpus) — the new conjunct (4) at
  `consolidationPass.test.js:905-914` asserts `result.consumed`, item 3 and the terminal
  row are each set-equal to `{readable}`.
- AT-K3b Fixture 2 (all-unreadable) — `:961-973` asserts all three are empty.
- `T32 — build-runtime.mjs --check is clean` (expected: the probe edits source).

Both new oracles read **located lines** (item 3 by its `3. consumed:` opener, the
terminal row by its own `pass:` opener rather than by append index), so a missing line
fails rather than passing vacuously as an empty list. This is the specific
over-read that v5 faulted, and it is closed correctly.

### K1 — closed

`:744` replaces the readability gate with
`const enumeratedNoneReadable = consumedBodies.length > 0 && readableBasenames.length === 0`,
and `:747` mints on `!enumeratedNoneReadable`. That is the condition AT-K3b actually
names, and nothing wider. The implementer took v5's **narrow-gate** option, so the
`ERRATUM: REQ:` round v5 flagged as the alternative is correctly not raised.

**Both halves of the predicate are pinned (probes B and C).** The new
`describe("step 10 — the advisory-corpus reason codes are minted on the pass, not just
parsed")` block (`consolidationPass.test.js:996-1069`) supplies the oracle that was
missing from the entire repository:

| Probe | Mutation | Result |
|---|---|---|
| **B** | gate back to `readableBasenames.length > 0` (the v5 defect) | **RED** — the quiet-week row: *"an empty corpus with ESCALATIONS.md absent (this repo's shipping default) still records no-advisory-corpus"* |
| **C** | gate removed entirely (`if (true)`) | **RED** — *"AT-K3b's narrow condition … withholds both codes, even with ESCALATIONS.md absent"* |

The positive/negative pair differs **only** in corpus readability against the same absent
`ESCALATIONS.md`, so it localises to the predicate rather than to step 10 as a whole —
which is what makes B and C independently red instead of one mutation reddening both.
v5's recommendation 3 ("give the reason code an oracle either way") is discharged, and
AT-K3b's own fixture now asserts its empty reason set on a **present, non-empty** corpus
(`:924-935`), removing the over-read that bent the implementation in the first place.

PROP-ADV-01b (`PROPERTIES:980-997`) records the property; PROPERTIES §472-484 records
the four-surface obligation. Both were written, not merely claimed.

### Findings open at v6

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| **L1** | 6(a) (adjacent-surface falsification) | **medium** | `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md:425`, `:432` | FSPEC §3.3's consumed-pair table still states Membership = "**exactly** the un-consolidated set computed at step 2 — neither more nor fewer" (sourced to NFR-5), and the following sentence states "The set is **frozen at step 2** and is not recomputed later in the pass". Under TSPEC §12.2 v2.8 the pair is set-equal to the **readable** subset, and as of `dcf708c7:672` `state.consumed` **is** recomputed later in the pass. Both sentences are false at HEAD | `ERRATUM: FSPEC:` — re-anchor §3.3 to v2.8: membership is the readable subset of the step-2 un-consolidated set; the *boundary* is frozen at step 2 while the *consumed set* narrows at step 6.5, still before any promotion work (which is what vocabularies §3's "fixed before any promotion work" actually requires, and that clause remains true) | Local |

#### L1 — the fix is right, its upstream description is now wrong

This is not a defect in `dcf708c7`'s behaviour. It is the adjacent surface the
remediation falsified, and it is exactly the class criterion 6(a) exists to catch.

The two claims have diverged on different schedules, which is why neither round caught it:

| Claim | True before `eb2a0e44` | True before `dcf708c7` | True at HEAD |
|---|---|---|---|
| `:425` pair = **exactly** the un-consolidated set | yes | **no** (pair narrowed to readable) | **no** |
| `:432` the set is frozen at step 2, not recomputed later | yes | yes (`state.consumed` was frozen) | **no** (`:672`) |

So `:425` has been false since `eb2a0e44` and was missed by v5; `:432` is falsified
**by the diff under review**. `dcf708c7` updated the code's own JSDoc (`:224-230`,
"narrowed to the readable members at step 6.5") but not the FSPEC sentence that says the
opposite.

Sweep performed, not assumed. `grep -n "exactly the un-consolidated\|un-consolidated set
computed at step 2\|recomputed later"` over `docs/pdlc-consolidation-agent/*.md` and
`docs/_constraints/*.md` returns **exactly these two lines** — no third surface carries
the claim. The neighbours check out and are deliberately **not** filed as findings:

- **REQ NFR-5 (`REQ:569-571`) is satisfied**, not falsified: it says the block must name
  "exactly the **consumed** set", and under v2.8 an unreadable entry is not consumed at
  all. FSPEC's paraphrase silently substituted "un-consolidated" for "consumed", and
  that substitution is the whole defect. The erratum belongs to FSPEC, not REQ.
- **TSPEC agrees with HEAD**: v2.8's changelog (`TSPEC:55`) states conjunct (2) "is now
  **set equality** against `{readable}`".
- **`docs/_constraints/pdlc-consolidation-vocabularies.md:133-134`** requires the
  consumed set be "fixed before any promotion work". Step 6.5 (`:672`) precedes step 7's
  pair append and step 8's promotion dispatch, so this clause is **still true**.

---

## §2 Requirements Traceability — carried forward

Per the delta rule, v5's table is carried forward unchanged except for the rows its
remediation touched.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1–31 | REQ / FSPEC / PROPERTIES | the 31 criteria traced full at v4, untouched by this round's remediation | as v4 | as v4 | No | — | — |
| 32 | REQ AC-6.1; FSPEC BR-38, E-30, S-13; TSPEC §10.3 rows 15–16 | absent `ESCALATIONS.md` ⇒ `no-advisory-corpus`; present-but-entryless ⇒ `advisory-corpus-empty` | `consolidate-learnings.js:744-750` (`enumeratedNoneReadable` gate) | `consolidationPass.test.js:996-1069`, four rows through `main()` on `result.reasons` | **No — closed** | — | — |
| 33 | REQ §4b; `FSPEC:2210` (AT-K3b); `TSPEC:2243` (§10.3 row 1b) | on an all-unreadable corpus AC-7.1's consumed list is empty while the un-consolidated set is not | `consolidate-learnings.js:672` narrows `state.consumed`; read by `:1298`, `:2327`, `:2372`, `:2465` | `consolidationPass.test.js:905-914`, `:961-973` | **No — closed** | — | — |
| 34 | TSPEC §12.2 v2.8 conjunct (2); PROP-COR-09 | pair set-equal to `{readable}` | `:658` | `consolidationPass.test.js:860-873` | No | — | — |
| 35 | Criterion 6(a) | FSPEC §3.3's description of the consumed pair | — | none | **YES — L1** | medium | Local |

**req_gaps: 0** (rows 32 and 33 both closed; L1 is a criterion-6 finding, not a
traceability gap — the requirement is delivered, its FSPEC description is stale).

---

## §3 Criteria 1–4 over the remediation diff, plus v1 recurrence check

Scope is `git diff c5b766d8..HEAD`, per the delta rule.

- **1 · Stubs.** Clean. The diff introduces no `TODO`/`FIXME`/`HACK`/`NotImplementedError`/
  placeholder identifier/coverage pragma. The added block `:657-672` and the rewritten
  gate `:729-750` were read in full, bodies not signatures: both are real logic.
- **2 · Unwired integrations.** Clean. `state.consumed`'s new value is read by all four
  surfaces enumerated above (`grep -n 'consumed'`, readers at `:1298`, `:2327`, `:2372`,
  `:2465`); `enumeratedNoneReadable` is read at `:747`. Nothing added is dead.
- **3 · Mock/fake data.** Clean in production. The diff's fixture helpers
  (`learningsBody`, `readableCorpus`) are confined to `__tests__/`.
- **4 · Coverage.** `consolidate-learnings.js` measured this round: **87.54% branch**
  (94.41% stmts, 93.84% funcs, 96.19% lines) — above the 85% floor and up from v5's
  87.33%. Property-based obligations carried in `consolidationProperties.test.js`,
  unchanged this round.
- **v1 recurrence check.** F1 (`"unknown/unknown"`), F2 (open-promotion hand-off), F3
  (item 10 population), F4 (dead `authoringFailed`), F6/F7/F8 — none has returned; no
  line of the remediation diff touches those paths.

**Gates.** `npm test`: 106 of 107 suites pass, 4320 passed / 70 skipped.
`build-runtime.mjs --check`: exit 0, all five artifacts in-sync (the bundle was rebuilt
in the same commit). `sync-workflows.sh --check`: exit 0.

**The one red is the documented false-red**, unchanged in character from v4 and v5:
`documentOracles.test.js` AT-22, reporting `.tokensave/tokensave.db` and two `.serena/`
cache paths. All three are untracked local tool state (`git status --porcelain` shows
only `?? .claude/` and `?? .serena/`); a CI clone carries none of them. CLAUDE.md names
this class explicitly. **Not a finding.**

---

## §4 Recommendation

`dcf708c7` is the first remediation in this feature's DoD history that closes its
findings at the class level rather than the instance level, and it does so with oracles
that are demonstrably load-bearing — three independent mutations, three distinct reds,
`git status` clean afterwards. K1 and K2 are properly closed.

One item stands between this feature and Done, and it is cheap:

1. **L1 — `ERRATUM: FSPEC:` on §3.3.** Two sentences at `:425` and `:432` describe a
   consumed pair that stopped existing at `eb2a0e44` and a freeze that stopped existing
   at `dcf708c7`. The code, TSPEC, REQ and vocabularies all already agree with each
   other; FSPEC is the lone dissenter. Re-anchor it and this feature passes.

2. **The dispatcher's version argument (§0), fifth round running.** No longer a
   citation nuisance: this round was instructed to overwrite a merged artifact. Fix the
   DOD dispatch to derive the round index from the directory listing the way
   `deriveRoundWindow` does, before the next round destroys something.

`DOD_STATUS` is `failed` on L1 alone. It is a documentation erratum, not a behavioural
defect — but the standing rule is that an upstream document which contradicts shipped
behaviour is a finding, because the next implementer reads FSPEC §3.3 and not this file.

## §5 Verdict

VERDICT: Needs revision

---

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 87.54, "req_gaps": 0, "boundary_gaps": 1}
