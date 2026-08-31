# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.4, bytes unchanged)
**Upstream that moved:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1 → v1.3, erratum rounds 3–4)
**Date:** 2026-08-31
**Iteration:** 6 (upstream-cascade confirmation, not a re-review)

## Context

`DECISIONS-pdlc-stats.md` was approved at v5 (`CROSS-REVIEW-test-engineer-DECISIONS-v5.md`,
*Approved with minor changes*, one Low open). Its own bytes have not moved since. What moved is the
upstream this document compresses: `TSPEC-pdlc-stats.md` went v1.1 → v1.3 across erratum rounds 3
and 4, so the v5 approval was taken against a TSPEC that no longer exists. My v5 anchor records
`UPSTREAM-STATE: TSPEC sha256:db285ea2…`; HEAD is `sha256:c270fc5c…`.

This is a cascade confirmation, not a re-review. I did not re-open DEC-STATS-01/02/03's verdicts,
the option tables, K-1's partition, or anything v1–v5 settled. The single question is whether
DECISIONS is still a faithful compression of the TSPEC as it now stands. Per DEC-ERR-03 I read the
current upstream text this document leans on rather than working an item list, so findings below
are not confined to the four routed items.

**The delta I read.** `git diff 42cf8850..HEAD -- docs/pdlc-stats/TSPEC-pdlc-stats.md` (the v5
approval commit to HEAD): §2.1's co-change set nine → **ten** with `pdlc/README.md` added as a row,
the sweep restated as a 24-candidate set plus one stated filter; the `loop-distribution.test.js` row
gaining an eighth assertion edit; the `coverageInstrumentation.test.js` row naming a title count;
§6.4 growing five oracles → seven and splitting the classifier-purity conjunct by return type;
§7.3, RK-1 and §8.4 carrying the ten; §8.3 dropping three now-closed FSPEC errata; §4.3/§6.1
re-grounding on FSPEC v1.4.

**What I verified at HEAD rather than reading off either document**, because three of the findings
below turn on a number and one turns on a type:

| Claim | Command / source | Result |
|---|---|---|
| DECISIONS' sweep, 25 files | `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` | **25** — reproduces |
| TSPEC's new sweep, 24 candidates | `git grep -l "lib/loop-session.mjs" -- . ':!docs/'` | **24** — reproduces, but only with `dist/` *included* |
| `deriveDodRoundIndex`'s return type | `pdlc/workflows/orchestrate-dev.js:12384` | returns `max + 1`, a **`number`** |
| `c8.include`'s size at HEAD | `pdlc/workflows/package.json` | **seven** entries |
| `REQUIRED_INCLUDES`'s size at HEAD | `coverageInstrumentation.test.js:37-46` | **four** entries |
| P9-02's title count at HEAD | `coverageInstrumentation.test.js:264` | says **six** |

§8.3's three closed errata (FSPEC BR-11, BR-16, BR-25) and §4.3/§6.1's AT-12/AT-17 re-grounding
touch nothing in DECISIONS: `grep -n "BR-16\|BR-11\|BR-25\|AT-12\|AT-17"` over the document
returns nothing. Those parts of the delta are confirmed clean and are not discussed further.

## Options Considered

For a cascade confirmation the options are dispositions, not designs. Three were live, and the
choice between them is what the findings below encode.

**(1) Confirm unchanged — the delta is numeric bookkeeping.** Defensible on the strongest of the
divergences: the *work* named by DECISIONS and by TSPEC §2.1 is the same work. DECISIONS already
names `pdlc/README.md:231`, already owes its edit, and already assigns it to K-9; TSPEC now calls
that same edit a tenth table row. No file goes unedited under either reading, so no coverage is
lost and no test goes unwritten. I rejected this because it mistakes the finding. The two documents
do not merely print different totals — they apply *different membership rules to the same table*.
DECISIONS states, with both reviewers' agreement recorded, that the site table is a table of
falsifiers and that `pdlc/README.md` is therefore not a row. TSPEC has now made it a row while
conceding in the same cell that it is "**Pinned by no oracle**". A reader cannot satisfy both, and
the reconciliation is a decision about what the table means, not a re-count.

**(2) Confirm with Medium findings — route the numbers, do not halt.** Attractive, and correct for
three of the six items below. It fails for the purity conjunct, because that one is not a
bookkeeping divergence at all: DECISIONS names a detector that, applied as written to a *correct*
implementation, goes red. A specification that prescribes a false-failing test is not a counting
error, and a round that lets it through hands an implementer a broken oracle with the document's
authority behind it.

**(3) Non-approving confirmation, findings tagged by provenance and locality.** Chosen. Two High,
three Medium, one Low. All six are `delta` — every one of them is a divergence the TSPEC edit
opened, none was present in the bytes I approved at v5 — so none is tagged `inherited`, and I have
not reached for that tag to keep a finding non-gating. Where the correct repair belongs upstream in
TSPEC rather than in DECISIONS (F-03, F-04), the finding says so explicitly rather than asking the
DECISIONS author to absorb an upstream error.

I also considered and rejected filing the tenth-site question as a finding against TSPEC alone. The
verdict channel here is DECISIONS'; a divergence between two documents is a property of the pair,
and DECISIONS is the one carrying five now-unfaithful restatements of the number.

## Decision

**DECISIONS does not still hold as written against the TSPEC now at HEAD.** Non-approving
confirmation. Two High findings, both `delta`, both local to what the erratum touched.

### F-01 (High) — the site count, and the rule the site table runs on

DECISIONS says **nine** in five load-bearing places: DEC-STATS-01's option-A cell ("**nine** edit
sites (sweep-derived, see below)"), the site table's own heading ("**Option A's nine sites**"), the
sweep paragraph ("So the co-change set is **nine sites**"), *Reversibility: hard* ("amending all
nine sites"), K-1 ("The **nine** co-change sites in DEC-STATS-01's table"), and *Standing costs
accepted* ("costs **nine** edit sites"). TSPEC §2.1, §7.3, RK-1 and §8.4 now all say **ten**.

The number is the smaller half. DECISIONS resolves `pdlc/README.md:231` deliberately, and records
the reasoning as jointly reached: *"It is not a tenth row of the site table, and the two reviewers
agree on the reason from opposite directions: the table is a table of falsifiers, every row of
which reds on a partial edit, and nothing pins this line."* I verified that premise at v5 and it
still holds — `documentOracles.test.js` reads `pdlc/README.md` at `:316` and `:672` but pins
`workflows/dist/` and the absence of seam-count prose, never the member list. TSPEC v1.3 has now
added the row anyway, marking it "**Pinned by no oracle** — RK-1's residue".

This is the finding, in testing terms. A site table whose rows are falsifiers is a table an
implementer can *run*: every row reds on a partial edit, so the table is self-checking and a
missed row is a red, not a review miss. Admitting one un-oracled row silently converts it into a
checklist, where nine rows red and the tenth is caught only by a human. That is a real change to
what the artifact is worth, and it is the distinction DECISIONS' *Residuals* section exists to
preserve. Whichever way it is settled, both documents must settle it the same way — the two tables
are cited interchangeably as "§2.1" and "DEC-STATS-01's table", and PLAN reads both.

Repair, either direction, is cheap: TSPEC drops the row back to RK-1's residue where DECISIONS
already carries it, or DECISIONS adopts ten and restates the table's membership rule as
"falsifiers, plus named un-oracled residue" so the two un-oracled rows (`pdlc/README.md` and
`PK-26`'s existence row) are visibly a different kind of row. I have no stake in which; I have a
stake in the documents agreeing, and in the falsifier/checklist distinction surviving the merge.

### F-02 (High) — DECISIONS names a purity detector that reds a correct implementation

DEC-STATS-03's *Re-evaluation trigger, and its detector* specifies the detector as: *"a purity
conjunct on the four exports — call each classifier twice with the same input in a fresh module
instance and assert deep-equal, **non-aliased** results."* All four. TSPEC v1.3 has now split that
conjunct by return type, and the reason it gives is correct — I confirmed it at the source rather
than taking it: `pdlc/workflows/orchestrate-dev.js:12384`, `deriveDodRoundIndex` returns
`max + 1`, a primitive `number`. Two equal numbers are `===`. A non-aliasing assertion over a
`number` therefore reds against a *wholly correct, wholly pure* implementation.

So DECISIONS, as written, prescribes a test that fails on green. That is the "a test that only
passes is not yet a test" bar inverted — a test that only fails is worse, because an implementer
who follows K-6's routing and writes the conjunct as DECISIONS specifies it gets a red they cannot
fix without contradicting the document. TSPEC has fixed this upstream; DECISIONS still carries the
unsound form, and it is DECISIONS that K-6 makes authoritative for the conjunct's shape.

There is a second, quieter half. The *Residuals* table disposes of "The driver exports gaining
state" as **"Closed by erratum**: the purity conjunct named in DEC-STATS-03's trigger, routed to
TSPEC §6.4." Upstream now qualifies that closure explicitly: `deriveDodRoundIndex` gets A-B-A
instead, and TSPEC states plainly that *"a memo table is invisible to this — a correct memo returns
the right number"*. A memo is one of the three state shapes DEC-STATS-03's own trigger names ("a
closure over configuration, **a cache**, a module-level mutable"). So for one of the four exports
the trigger is now closed against accumulating state but **not** against a cache, which is exactly
the residual's stated concern. "Closed by erratum" overclaims what upstream delivers. The honest
restatement is that the residual is closed for the three object-returning classifiers and narrowed
— not closed — for `deriveDodRoundIndex`, with the memo-shaped remainder named. A residual table
exists so PLAN and the DoD reviewer inherit known gaps rather than discovering them; a gap recorded
as closed is the one gap they will not look for.

## Consequences

## Delta-Confirmation Findings

## Verdict
