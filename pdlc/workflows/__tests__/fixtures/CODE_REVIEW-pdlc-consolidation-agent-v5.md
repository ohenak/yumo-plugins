# CODE REVIEW — pdlc-consolidation-agent (v5)

| Field | Detail |
|---|---|
| Feature | pdlc-consolidation-agent |
| Branch | `feat-pdlc-consolidation-agent` |
| Reviewer role | dod-verify (evaluator — documents findings, fixes nothing) |
| Review version | v5 (delta re-verification) |
| Date | 2026-08-11 |
| HEAD reviewed | `c2e0b6b2` |
| Prior round | `CODE_REVIEW-pdlc-consolidation-agent-v4.md` |
| Remediation under review | the harvest-SKILL anchor sweep + oracle widening (J1), and `eb2a0e44` "consumed carries only readable members (AT-K3b, TSPEC §12.2 v2.8)" with its rebuild `a193af11` |
| Verdict | **Findings** |
| Branch coverage (lowest new module) | 87.33% (`consolidate-learnings.js`, measured this round) |
| Requirements traced | 32/34 — **2 gaps**, both new since v4 |
| Boundary gaps | 1 |

**Version reconciliation — fourth consecutive round, and this one would have been destructive.** This
round was dispatched as **"v1"**. `CODE_REVIEW-…-v1.md` through `-v4.md` are all committed on this
branch. Writing to the v1 path would have destroyed four rounds of record, including the disposition
tables v2–v4 chain through. Per the dod-verify version rule — next unused integer — this is **v5**.
v2, v3 and v4 each recorded a one-behind argument; this one is not one behind, it is reset to the
start, which is a different and worse failure of whatever computes it. **Scope: Process.** It is the
one item in this review that outlives the feature, and it now has four occurrences.

**Scope:** Local + Cross-Feature + Process (per-finding tags below).

---

## §1 Code Quality Findings

### Disposition of the v4 finding

| v4 | Summary | Status at HEAD | Evidence |
|---|---|---|---|
| **J1** | The harvest SKILL's anchor family was stale in six citers, and the round-3 oracle could not see that SKILL at all | **Resolved, on measurement and on mutation** | See below |

**J1 — measured, not taken on the commit message.** The subject file's family at HEAD:
`| Field \| Detail |` at `:70`, `Harvested from` at `:77`, `Phases exercised` at `:78`, `DoD rounds`
at `:79`, `## 6. Approval Record` at `:110`. Every citer v4 named now agrees:
`vocabularies.md:86-89` (`:70-79`, `:78`, `:77`, and `:110` for the Approval Record — the sentence was
rewritten, not merely re-ranged, so it no longer denies the existence of a row inside its own
citation), `TSPEC:343` (`:72-79`, `:77`), `FSPEC:1524` and `FSPEC:2481` (`:70-79`), `REQ:641`
(`:70-79`), `PLAN:386` (`:70-79`, `:77`). A repo-wide `git grep` for `harvest-learnings/SKILL.md:`
over tracked `*.md`, review artifacts excluded, returns **no** surviving `:70-78` or `:72-78`.

**The subject axis was widened, and the widening is load-bearing.** `consolidationSkillAnchors.test.js:392-472`
adds a second subject family whose anchors are measured from the SKILL at run time (`soleHarvestLine`,
which throws rather than guesses when a claim is not unique) and whose citer set is derived by
`git grep`, not transcribed. v4's second recommendation — the *range* conjunct — landed too: "no
tracked citer's range stops inside the metadata table" is set-equality against the table's last row,
which is precisely the converse the v2 and v3 sweeps never checked. Five probes, each reverted
(`git status` clean afterwards):

| Probe | Mutation | Result |
|---|---|---|
| A | `vocabularies.md` `:70-79` → `:70-78` — J1's own defect, in J1's own sharpest instance | **RED** — 1 failure |
| B | One blank line inserted inside the harvest metadata table (`SKILL.md:76`) | **RED** — 3 failures (contiguity, vocabularies span, citer ranges) |
| C | A **brand-new tracked** citer `docs/_constraints/zz-probe-harvest.md` citing `:70-78`, `git add`ed | **RED** — 1 failure; the derived set picked up a file the suite has never seen |
| C2 | The same file left **untracked** | green — the documented `git grep` limit, correct for a warranty about committed documents, recorded as a note not a finding |
| D | `TSPEC:343` `:72-79` → `:72-78` | **RED** — 1 failure |

Probe C is the one that settles J1 as a *class* fix rather than an instance fix. Baseline: 35 passed.

### Findings open at v5

Both are new, both were introduced by `eb2a0e44` (after v4's reviewed HEAD), and both share one root:
the AT-K3b fix narrowed a **local** (`readableBasenames`, `consolidate-learnings.js:649`) instead of
narrowing `state.consumed` (`:586`), so exactly one of the four surfaces that render a pass's consumed
set was changed and the other three were left behind — and separately, the step-10 gate it added is
broader than the erratum that motivated it.

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| **K1** | 5 (requirement not delivered) | **high** | `pdlc/workflows/consolidate-learnings.js:723` | `no-advisory-corpus` / `advisory-corpus-empty` are now minted **only when `readableBasenames.length > 0`**. AC-6.1's absent-file row, FSPEC BR-38 / E-30 / S-13 / AT-A1 and TSPEC §10.3 row 15 all state the code unconditionally. On this repo's **shipping default** — `docs/_queue/ESCALATIONS.md` is absent at HEAD, which AT-A1's Given calls "the state at HEAD" — every quiet-week `no-op` pass now silently loses the reason code AC-6.1 requires it to record | Narrow the gate to the condition AT-K3b actually names (a corpus that enumerated ≥1 basename and could read none), or, if the broad withholding is wanted, raise it as an **ERRATUM** against REQ AC-6.1 / FSPEC BR-38 — it is an upstream decision, not a code detail. Either way the reason-code half of AT-A1 needs an oracle: none exists at any level today | Local |
| **K2** | 5 (requirement not delivered) + 6(a) | **high** | `consolidate-learnings.js:586`, `:2303`, `:2348`, `:2445` | `state.consumed` still carries unreadable basenames. Three surfaces therefore contradict the consumed pair: the **durable terminal row** writes `consumed: A, B` into the same log file whose `<!-- pdlc:consumed -->` block for the same pass is empty; report item 3 — which **is** AC-7.1's *LEARNINGS consumed by basename* — names both; and the PR trailer `PDLC-CONSOLIDATION-SOURCES` would attribute provenance to a LEARNINGS the pass never read. REQ §4b, `FSPEC:2210` (AT-K3b) and `TSPEC:2243` (§10.3 row 1b, which says in terms "**`state.consumed` is empty**") all state the opposite | Narrow `state.consumed` itself (or introduce the readable set as the state field every renderer reads), so the four surfaces agree; then extend AT-K3b's carrier to assert the AC-7.1 conjunct and the terminal row, not only the pair block | Local; the log self-contradiction and the PR trailer are the criterion-6(a) half |

---

#### K1 — the erratum's gate is wider than the erratum

`eb2a0e44` wrapped step 10's two reason codes in `if (readableBasenames.length > 0)`. Its commit
message states the intent precisely: *"so an all-unreadable corpus resolves no-op with an empty reason
set instead of minting no-advisory-corpus for a run that consolidated nothing."* The predicate it
chose does not say that. `readableBasenames` is empty on **two** input states, not one:

| Input state | AT-K3b's subject? | Reason code at HEAD | Reason code required |
|---|---|---|---|
| Corpus enumerated ≥1 basename, none readable (TSPEC §10.3 row 1b) | yes | none | none (per AT-K3b) |
| **Corpus empty — the ordinary quiet week** (AC-1.4's *first* cause) | **no** | **none** | `no-advisory-corpus` (AC-6.1, BR-38, E-30) |

Measured, not inferred. Driving `main()` with an empty corpus listing, an absent `ESCALATIONS.md` and
`direct: true`:

```
QUIET WEEK status= no-op reasons= []
1. status: no-op
reason: none
…
7. advisory: corpus absent; over-escalating: none; widening candidates: none
```

Item 7 still reports the real corpus state, exactly as the code comment claims — but the **reason
code** AC-6.1's table obliges ("records reason code `no-advisory-corpus` in the AC-7.1 report") is
gone. Causation is established against the parent commit: restoring `eb2a0e44^`'s
`consolidate-learnings.js` and re-running the identical probe yields
`reasons= ["no-advisory-corpus"]`. This is a regression introduced after v4, on the branch's own diff.

**Why no suite caught it, and why that is itself the finding.** `no-advisory-corpus`'s register
carrier is AT-A1 (`consolidationAdvisory.test.js:21`). Its *title* names the reason code; its
*assertions* are `corpusState === "absent"`, `entryCount === 0`, and the three seam-proposal
negatives. The reason code is asserted **nowhere in the repository** — not at L1, not through
`main()`. The pass-level suite deliberately avoids it: `consolidationPass.test.js:686` supplies a
present, non-empty `ESCALATIONS.md` specifically "so step 10 adds neither `no-advisory-corpus` nor
`advisory-corpus-empty`". So the one conjunct that could have failed was excluded from the one fixture
that would have reached it. A reason code named in a test title is not a tested reason code.

**And the over-broad gate was *driven* by an over-scoped oracle.** AT-K3b's fixture
(`consolidationPass.test.js:875-911`) omits `ESCALATIONS.md`, so its corpus is absent and BR-38 applies
to it — yet the fixture asserts `expect(Array.from(result.reasons ?? [])).toHaveLength(0)`, reading
AT-K3b's "no reason code is minted **for the condition**" as "no reason codes at all". The
implementation was then bent to satisfy that reading, and BR-38 broke everywhere. The sibling fixture
one block earlier shows the correct move: give the fixture a present, non-empty corpus so the reason
set can be asserted empty *outright* without deciding a rule the row is not about.

#### K2 — one pass, one log file, two different consumed sets

TSPEC §12.2 v2.8's decision is that an unreadable entry **is not consumed at all** — TSPEC:1057-58
says so in terms, answering the `unread:` field question "by removing the premise rather than by
declining the field: the entry is not consumed at all". The implementation applied that to
`renderConsumedPair`'s argument and to nothing else. `state.consumed` (`:586`) is still
`predicate.unconsolidated` in full.

Driving the AT-K3b fixture (two enumerated basenames, both unreadable) through `main()` and dumping
both appends the pass makes to `docs/_decisions/.consolidation-log.md`:

```
APPEND 0 -> docs/_decisions/.consolidation-log.md
<!-- pdlc:consumed 2025-01-01-1 -->
<!-- /pdlc:consumed -->

APPEND 1 -> docs/_decisions/.consolidation-log.md
pass: 2025-01-01-1
status: no-op
consumed: LEARNINGS-feat-a.md, LEARNINGS-feat-b.md
```

Same file, same pass, two records, opposite claims. Before `eb2a0e44` they agreed. vocabularies §3
requires the pair to name *exactly* the consumed set (NFR-5); at HEAD the log carries two answers to
"what did pass `2025-01-01-1` consume?" and nothing in the file says which is authoritative.

The report body is the second surface, and it is the one a requirement names directly:

```
3. consumed: LEARNINGS-feat-a.md, LEARNINGS-feat-b.md
unread: LEARNINGS-feat-a.md, LEARNINGS-feat-b.md
```

REQ §4b (`REQ:625-631`) makes this list the **discriminator** that separates an all-unreadable pass
from a quiet week: *"AC-7.1's LEARNINGS consumed by basename is empty while the un-consolidated set is
non-empty, whereas a quiet week has both empty."* `FSPEC:2210` repeats it as AT-K3b's Then, and
`TSPEC:2243` states the mechanism — "`state.consumed` is empty". At HEAD the list is **non-empty and
names both unreadable files**, so the stated pairing is false: the discriminator REQ §4b relies on
does not exist in the artifact, and the pass reports having consumed two LEARNINGS it could not open.

The third surface is `renderPrBody`'s `PDLC-CONSOLIDATION-SOURCES` trailer (`:2445`), which
vocabularies §4 defines as "sorted consumed LEARNINGS basenames — pass provenance". On a mixed corpus
it would name an unreadable member as the provenance of a promotion that member contributed nothing
to. Unreached in this round's fixtures because no promotion is derived, but it reads the same
`state.consumed` and needs no new decision — only the same narrowing.

**Why AT-K3b's oracle passes anyway: it asserts a different artifact.** The fixture reads
`seams.fs.appends[0].text` — the consumed *pair block* — and asserts its basename list is empty. That
is the one surface the fix changed. It never reads `result.consumed`, never reads the terminal row
(`appends[1]`), and never reads report item 3, which is the surface AT-K3b's Then actually names. The
register id is discharged against the builder's output rather than the operator-visible artifact.
PROPERTIES:472-475 shows where the drift entered: it restates the obligation as "the **rendered
pair's** basename list is empty", quietly dropping the AC-7.1 conjunct that REQ and FSPEC state.

---

## §2 Requirements Traceability

Carried forward from v4's 34/34 (unchanged rows abbreviated to their status, per the delta rule); only
the rows this round's remediation touched are re-traced in full.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1–31 | REQ / FSPEC / PROPERTIES | the 31 criteria v4 traced and this round's diff does not touch | as v4 | as v4 | No | — | — |
| 32 | REQ AC-6.1 (absent-file row); FSPEC BR-38, E-30, S-13; TSPEC §10.3 row 15 | An absent `ESCALATIONS.md` records reason code `no-advisory-corpus`; the rest of the pass proceeds normally | `consolidate-learnings.js:723-727` — **gated on `readableBasenames.length > 0`**; the code is not recorded on a quiet-week pass | `consolidationAdvisory.test.js:21` asserts `corpusState`/`entryCount`/seam negatives only — **the reason code is asserted nowhere** | **YES** | high | Local |
| 33 | REQ §4b; `FSPEC:2210` (AT-K3b); `TSPEC:2243` (§10.3 row 1b) | On an all-unreadable corpus, AC-7.1's *LEARNINGS consumed by basename* is **empty** while the un-consolidated set is non-empty (`state.consumed` empty) | `consolidate-learnings.js:586` unchanged ⇒ `:2348` renders both unreadable basenames; `:2303` writes them to the durable terminal row | `consolidationPass.test.js:875-911` asserts the consumed **pair block** only — a different artifact from the one the criterion names | **YES** | high | Local |
| 34 | TSPEC §12.2 v2.8, conjunct (2); PROP-COR-09 | On a mixed corpus, `renderConsumedPair`'s list is set-equal to `{readable}` | `:658` | `consolidationPass.test.js:860-873` — set equality, both directions, with a readable control | No | — | — |
| 35 | v4 J1 (criterion 6(a)) | The harvest SKILL's anchor family is true at HEAD and mechanically warranted | `harvest-learnings/SKILL.md` unchanged; six citers re-measured | `consolidationSkillAnchors.test.js:392-472`; probes A–D red, C proves derivation | No | — | — |

Rows 32 and 33 are the two `req_gaps`. Row 35 is v4's finding, closed.

---

## §3 Criteria 1–4, and one note

- **1 — Stubs.** Clean. The delta since v4 (`git diff 87d9c6ad..HEAD -- pdlc/workflows/consolidate-learnings.js`)
  introduces no `TODO`/`FIXME`/`NotImplementedError`/placeholder/coverage pragma; the added block at
  `:634-655` is real logic, read in full.
- **2 — Unwired integrations.** Clean. `readableBasenames` is wired at `:658` and `:723`; the step-8
  dispatch gate is deliberately left on the raw corpus listing and the code says so and why.
- **3 — Mock/fake data.** Clean in production code. All fixtures are under `__tests__/`.
- **4 — Coverage.** `consolidate-learnings.js`: **87.33% branch** (94.31% stmts, 93.84% funcs, 96.19%
  lines), measured this round. Above the 85% bar. Property-based obligations are carried by
  `consolidationProperties.test.js` as in prior rounds.
- **Gate.** `npm test`: 106 of 107 suites pass, 4316 passed / 70 skipped. `build-runtime.mjs --check`:
  all five artifacts in-sync. `sync-workflows.sh --check`: exit 0.
- **Note, not a finding — the documented untracked-file false-red.** `documentOracles.test.js`
  AT-22 reds locally with three paths: `.serena/cache/typescript/document_symbols.pkl`,
  `.serena/cache/typescript/raw_document_symbols.pkl`, `.tokensave/tokensave.db`. All three are local
  tool state, none is tracked, and CI on a fresh clone has none of them. This is the class CLAUDE.md
  names explicitly. It is the same false-red v4 recorded, with a different tool's cache in it.

---

## §4 Recommendation

The J1 remediation is the best of the four rounds: it fixed the instance, widened the oracle to the
class v4 named, *and* added the range conjunct v4 only suggested — and a brand-new tracked citer now
reds a suite that has never seen it. That thread is closed.

The two open findings come from the other commit in the delta, and they are one mistake plus one
consequence of it. `eb2a0e44` was asked to make the consumed pair carry only readable members. It
introduced a local for that and left `state.consumed` alone, so the pass now tells one story in the
`<!-- pdlc:consumed -->` block and a different one in the terminal row two appends later, in the same
durable file — and the surface REQ §4b actually names, AC-7.1's consumed-by-basename list, still
reports two LEARNINGS the pass could not open. Then, to satisfy an oracle that over-read "no reason
code for the condition" as "no reason codes at all", it withheld `no-advisory-corpus` on a predicate
that also catches the ordinary quiet week — which on this repo's shipping default (`ESCALATIONS.md`
absent) is every quiet week there is.

1. **K2 first, because it is one line of intent.** Decide where "consumed" is narrowed — `state.consumed`
   at `:586`, or a `state.readable` that `:658`, `:2303`, `:2348` and `:2445` all read — and make the
   four surfaces agree. Then extend AT-K3b's carrier to the artifact its Then names: `result.consumed`
   and report item 3, and the terminal row beside the pair. Asserting `appends[0]` alone is set
   containment where the obligation is agreement across a file.
2. **K1 second, and decide it upstream if the broad gate is wanted.** The narrow gate is "enumeration
   returned ≥1 basename and none was readable". If instead the intent is that no pass which consolidated
   nothing should flag the advisory corpus's state, that contradicts AC-6.1's table, BR-38, E-30, S-13
   and TSPEC row 15 — five upstream statements — and belongs in an `ERRATUM: REQ:` round, not in a
   step-10 conditional.
3. **Give the reason code an oracle either way.** `no-advisory-corpus` is named in a test title and
   asserted nowhere. Whichever way K1 resolves, one `main()`-level fixture with an absent
   `ESCALATIONS.md` and an explicit expectation on `result.reasons` is what stops this recurring — and
   the same shape covers `advisory-corpus-empty`, which the same gate withholds identically.
4. **The dispatcher's version argument, fourth round running, now resets to v1.** One-behind risked
   overwriting one record; "v1" would have destroyed four. This needs an operator glance before the
   next dispatch, and it is a Process finding for harvest.

Neither finding can corrupt a promotion or ship wrong code into a consuming repo — the module still
owns every write, and the mixed-corpus conjunct that v4's erratum was really about is correctly
implemented and correctly asserted. What they corrupt is the pass's own record of what it did, which
for a feature whose entire output is a durable audit trail is the wrong thing to get wrong.

## §5 Verdict

VERDICT: Needs revision

---

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 87.33, "req_gaps": 2, "boundary_gaps": 1}
