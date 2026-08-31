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

### F-03 (Medium) — the erratum re-introduces a title count DECISIONS had already corrected

TSPEC §2.1's `coverageInstrumentation.test.js` row now names *"its test title ('the include set is
exactly the **six** modules the feature owns' → seven)"*. DECISIONS K-3 says the opposite, and
DECISIONS is right. I re-measured all three numbers at HEAD:

- `pdlc/workflows/package.json` → `c8.include` holds **seven** entries.
- `REQUIRED_INCLUDES` (`coverageInstrumentation.test.js:37-46`) holds **four**, not the three its
  neighbouring comment at `:261` claims.
- P9-02's title at `:264` says **six** — already wrong by one at HEAD.

Adding `lib/stats.mjs` makes the include set **eight**. K-3 states this exactly: *"`REQUIRED_INCLUDES`
holds **four** entries, so the literal is seven, not six. This feature makes it eight."* TSPEC's
"six → seven" reproduces the off-by-one instead of repairing it, and it does so in the row an
implementer will read while editing the file. K-3's own warning names the failure mode precisely:
*"An implementer who follows this row literally lands a passing test whose title misstates its own
assertion by two."* Following TSPEC's row lands one that misstates by one.

Medium rather than High for one reason, on which both documents already agree: the title carries no
assertion, so nothing reds either way. The cost is a misleading test title, not a broken oracle.
**The repair belongs in TSPEC, not here** — DECISIONS carries the correct arithmetic and should not
be edited to match an upstream that is wrong.

### F-04 (Medium) — the sweep's scope diverges from the rule K-9 promotes repo-wide

Both sweeps reproduce; they are not the same sweep. I ran both:

- DECISIONS: `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` → **25**.
- TSPEC: probe `lib/loop-session.mjs`, `docs/` excluded, `dist/` **included** → **24**.

The probe change is legitimate and anticipated — K-9's promoted rule already says to *"re-pick the
probe when the class changes"*. The scope change is not. DECISIONS excludes `*/dist/*` in the query
it ships; TSPEC's derivation counts `pdlc/workflows/dist/pdlc-cli.mjs` as a candidate and drops it
in the filter, naming it among the fourteen consumers. Same answer, different route — and with
`dist/` excluded as DECISIONS' query does, the arithmetic TSPEC prints (`24 − 14 = 10`) does not
reproduce.

This matters more than an internal inconsistency because K-9 promotes that query *with its scope*
to `docs/_constraints/DOMAIN-CONSTRAINTS.md` as a repo-wide rule. A future feature applying the
promoted rule to check TSPEC §2.1's stated derivation gets a different candidate count than §2.1
prints, and TSPEC's whole point in restating the sweep this round was to make the number
"re-runnable rather than asserted". Pick one scope, state it in both places, and let the promoted
rule and the derivation that cites it agree. Tagged `Cross-Feature`: the artifact affected is a
standing constraint, not this feature's document.

### F-05 (Medium) — K-8's assertion-edit total no longer matches upstream

DECISIONS K-8 says *"**Seven** assertion edits in all"* and itemises them `(3 + 2 + 1 + 1)`, then
adds the `vendoredClassWord` ternary separately as *"**Plus** the word map K-7 depends on"*. TSPEC's
`loop-distribution.test.js` row now folds that ternary in and says *"**Eight** assertion edits"*.

The edit *sets* are identical — this is a partition disagreement, not a missing edit, and no work is
lost under either reading. But "in all" is now false against upstream, and K-8's own subject matter
is the hazard of stale restatements travelling with values; the row is the document's argument for
K-6. Either fold the ternary into the count and say eight, or keep the split and say "seven
assertion edits plus the word-map edit" so "in all" is not claimed. Medium, not Low, because K-8's
falsifier is the required `Engine tests (ubuntu-latest)` check and an implementer working the row to
a checklist count will stop one edit early — the ternary being, by TSPEC's own account, the edit
that *"left behind, reds against an otherwise checklist-complete edit"*.

### F-06 (Low) — the re-evaluation trigger's list count

DEC-STATS-01's re-evaluation trigger enumerates *"**fifteen** hand-written lists across **nine**
files"* and closes with *"This count and the site table are now derived from the same sweep, so they
cannot disagree again."* With upstream at ten sites, the site table and this count disagree again —
`pdlc/README.md:231` is a hand-written member list in a tenth file, whether or not it earns a table
row. Low: the trigger's actual detector is `MODULE_NAMES.length` exceeding five, which no reading of
this changes, so nothing mechanical depends on the sentence. It is flagged because the sentence
makes an explicit durability claim about itself that the cascade has falsified.

### Positive observations

- **The erratum found a real unsoundness and repaired it precisely.** Splitting the purity conjunct
  by return type is the right fix and the reasoning is right: non-aliasing over a primitive is
  vacuous-or-wrong, and deleting the conjunct would have removed DEC-STATS-03's only mechanical
  detector. TSPEC then does the thing that makes it trustworthy — it states what A-B-A *does not*
  falsify (a correct memo) instead of implying full coverage. That is the discipline this review
  asks for, applied without being asked. F-02 exists only because DECISIONS has not caught up to it.
- **§7.3 and RK-1 moved with §2.1.** Where a count changed, every downstream restatement inside
  TSPEC changed with it — §2.1, §6.4's vendoring row, §7.3, RK-1, §8.4. The intra-document
  discipline is complete; what is missing is only the cross-document half.
- **RK-1's residue is now itemised and task-owned.** Two un-oracled items, each named with its
  owning task and each labelled as accepted residue rather than implied coverage. That is the
  correct shape for a co-change obligation no test can pin, and it is precisely the shape F-01 asks
  the site table's membership rule to acknowledge explicitly.
- **§8.3's closed errata were removed, not left standing.** BR-11, BR-16 and BR-25 are dropped and
  §4.3 restates each as specified behaviour. I confirmed the blast radius is nil for this document.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | High | delta | local | Site count nine (DECISIONS, 5 places) vs ten (TSPEC §2.1/§7.3/RK-1/§8.4), and the two documents now apply different membership rules to the same table: DECISIONS says the site table holds only falsifiers and excludes `pdlc/README.md` for that reason; TSPEC adds it as a row marked "Pinned by no oracle" | DEC-STATS-01 option table, site table, sweep paragraph, Reversibility, K-1, Standing costs |
| F-02 | High | delta | local | DEC-STATS-03's named detector prescribes a non-aliasing conjunct over all four exports; `deriveDodRoundIndex` returns a `number` (verified at `orchestrate-dev.js:12384`), so as written it reds a correct pure implementation. TSPEC §6.4 split it by return type; DECISIONS still carries the unsound form. Residuals also record the trigger "Closed by erratum" when upstream states A-B-A is blind to a memo — a cache being one of the three state shapes the trigger names | DEC-STATS-03 Re-evaluation trigger and its detector; Residuals row 2 |
| F-03 | Medium | delta | local | TSPEC §2.1 states P9-02's title moves "six → seven"; measured at HEAD `c8.include` is seven and `REQUIRED_INCLUDES` is four, so the post-feature count is eight, as DECISIONS K-3 already states. The erratum reproduces the off-by-one K-3 diagnosed. Repair belongs in TSPEC, not in DECISIONS | K-3 vs TSPEC §2.1 `coverageInstrumentation.test.js` row |
| F-04 | Medium | delta | local | Sweep scope diverges: DECISIONS' query excludes `*/dist/*` (25 files); TSPEC's derivation includes `dist/` as a candidate and filters it (24 − 14 = 10). Both reproduce, but TSPEC's arithmetic does not reproduce under the query K-9 promotes verbatim to `docs/_constraints/DOMAIN-CONSTRAINTS.md`. Cross-Feature: a standing constraint is the affected artifact | K-9 promoted constraint; sweep paragraph; TSPEC §2.1 derivation |
| F-05 | Medium | delta | local | K-8 says "Seven assertion edits in all" and carries the `vendoredClassWord` ternary separately as "Plus the word map"; TSPEC now folds it in and says eight. Same edit set, but "in all" is false against upstream, and a reader working the row to a checklist count stops one edit short of the edit TSPEC says reds an otherwise-complete change | K-8 |
| F-06 | Low | delta | nonlocal | DEC-STATS-01's re-evaluation trigger says "fifteen hand-written lists across nine files" and claims the count and the site table "cannot disagree again"; at upstream's ten sites they do. The trigger's actual detector (`MODULE_NAMES.length` exceeding five) is unaffected | DEC-STATS-01 Re-evaluation triggers |

FINDING: High | delta | local | DEC-STATS-01 site table and K-1 | Site count nine vs upstream ten, and the site table's membership rule (falsifiers only) is contradicted by TSPEC adding an explicitly un-oracled `pdlc/README.md` row; the two documents must settle this the same way because PLAN reads both.
FINDING: High | delta | local | DEC-STATS-03 detector and Residuals | The named purity detector asserts non-aliased results for all four exports, but `deriveDodRoundIndex` returns a `number`, so the conjunct as specified reds a correct implementation; TSPEC has split it by return type and DECISIONS has not followed, and the Residuals row records the trigger as closed when upstream leaves the memo-shaped half open.
FINDING: Medium | delta | local | K-3 vs TSPEC §2.1 | TSPEC's new "six → seven" title count contradicts K-3's verified seven → eight; measured at HEAD, `c8.include` is seven and `REQUIRED_INCLUDES` is four. Repair belongs upstream in TSPEC; DECISIONS carries the correct arithmetic.
FINDING: Medium | delta | local | K-9 promoted constraint and sweep scope | DECISIONS' promoted query excludes `*/dist/*` while TSPEC's derivation counts `dist/` as a candidate it then filters, so TSPEC's `24 − 14 = 10` does not reproduce under the rule K-9 promotes repo-wide.
FINDING: Medium | delta | local | K-8 | "Seven assertion edits in all" is false against upstream's eight; the `vendoredClassWord` ternary is held outside the total in one document and inside it in the other.
FINDING: Low | delta | nonlocal | DEC-STATS-01 Re-evaluation triggers | "Fifteen hand-written lists across nine files" and its claim that the count and the site table "cannot disagree again" no longer hold against upstream's ten sites.

## Verdict

DECISIONS does **not** still hold as written against the TSPEC now at HEAD. Two High findings, both
`delta`. F-02 is the one I would fix first: it is the only finding where following the document
produces a failing test rather than a wrong sentence. F-01 is the one that needs a decision rather
than an edit — the site table is either a table of falsifiers or a checklist with named residue, and
both documents have to say the same thing. F-03 and F-04 are repairs owed upstream in TSPEC; F-05
and F-06 are restatements in DECISIONS that the cascade has left behind.

Nothing in DEC-STATS-01/02/03's verdicts, the option tables, K-1's partition or the settled material
of v1–v5 is re-opened here, and the four Positive Observations above stand: the erratum's
return-type split is a genuine repair, and its residue accounting is the right shape.

VERDICT: Needs revision
{"high": 2, "medium": 3, "low": 1}
