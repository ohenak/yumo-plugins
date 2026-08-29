# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-29
**Iteration:** 5 (delta re-review of v0.5 against my v4)

## Overview

**Confirmation question:** did v0.5 land the item v4 routed, and did it break anything approved?

**Answer: the routed item landed cleanly — and the same round left the document grounded on a
TSPEC that has since been superseded, in the one task that derives from the superseded section.**

My v4 round reviewed `36cd34d4d`. Two commits have landed on the PLAN since:

| Commit | Time | Subject |
|---|---|---|
| `4950ea00c` | 08:50 | PLAN v0.5 operator pass — land erratum items, RESOLVED: yes |
| `a408375a6` | 08:51 | name T-19's terminal `102` control in the file-ownership manifest |

The whole diff is 19 insertions / 12 deletions across seven sites: the header upstream pin, the
revision-history paragraph, `T-00a`, `T-12a`, `T-11`, `T-19`, the file-ownership manifest row for
`documentOracles.test.js`, and two §Definition of Done bullets. Every v4 finding is closed. The
new material is correct on its own terms.

The problem is what happened *around* the edit. `TSPEC-pdlc-decision-ledger.md` advanced from
**v0.8 to v0.9** at 08:44 — six minutes before the PLAN v0.5 commit — and **§7.3 is one of the
five sections v0.9 rewrote**. §7.3 is the section `T-11` is derived from, cited by, and re-pointed
*to* by this very round. v0.5 re-pointed the citation from §5.5 to §7.3 (correctly, closing my
v4 F-02) without re-reading what §7.3 now says. What it now says is that `T-11`'s specified test,
as written in the PLAN, is red on a conforming implementation.

That is a High: the PLAN currently instructs an implementer to write a `[red]` test that can
never go green, and `T-11` is a batch-2 blocker for `T-18`.

## Batches

### The routed item landed — v4 F-01 is closed

v4's High was that no task id owned the terminal `102` count assertion: `T-00a`'s second
acceptance conjunct was quantified over a world state that does not exist at batch 1, and `T-12a`
explicitly disclaimed the count. v0.5 takes shape (2) from my v4 write-up and executes it at four
sites, consistently:

| Site | HEAD text | Verdict |
|---|---|---|
| `T-00a` (line 120) | "Acceptance is **one-sided and evaluable at batch 1**: the exclusion lands and the pre-existing suite is green at `102`." Terminal re-check "is **owned by T-19** (batch 9, the first point at which it is evaluable)" | ✅ evaluable when the task is accepted |
| `T-12a` (line 125) | its namespace census is narrowed to "a **set census** (set equality against the twelve names, not a count)"; the count is handed to T-19 by name | ✅ disclaimer now points at a real owner |
| `T-19` (line 141) | "**Terminal `102` positive control (T-00a's deferred conjunct, owned here):** with all twelve `decisionLedger*` modules on disk, `documentOracles.test.js`'s `*.test.js` census still counts `102`" | ✅ the assertion has an owner |
| file-ownership manifest | `documentOracles.test.js` → `T-19 | 9 (un-skip; also the terminal 102 positive control)` | ✅ traceable from the manifest, not only the prose |
| §Definition of Done | excludes the namespace "(landed by T-00a at batch 1) and still counts `102` with all twelve modules on disk (the terminal positive control, owned by T-19)" | ✅ both halves credited separately |

Batch consistency re-derived: all twelve `decisionLedger*` modules exist from batch 2 (three in
batch 1, nine in batch 2), so T-19 at batch 9 satisfies the "batch ≥ where the twelfth module
lands" constraint with room. The count is evaluable when T-19 is accepted, and it cannot red
mid-feature. Exactly what I asked for.

### F-01 (High, new) — T-11 is specified against TSPEC v0.8 §7.3, which v0.9 replaced

TSPEC v0.9's changelog (`TSPEC-pdlc-decision-ledger.md:26`) opens:

> **TE F-01 (High) — §7.3's census could not go green on a conforming implementation.** Its scanned
> source excluded three function bodies plus the wiring block, leaving `gatherDecisionCorpus`
> (§4.4's sixth function), §5.2's three frozen catalogues, and every intra-feature mention of a
> token inside a sibling declaration in the scanned remainder: **four of the six tokens would have
> occurred there on correct code.**

"Excluded three function bodies plus the wiring block" is a verbatim description of what `T-11`
still instructs (PLAN:134):

> The census's second operand: `orchestrate-dev.js`'s source **minus** four owned regions — three
> sliced by brace-matching from their declarations (`parseDecisionLedgerConfig`,
> `buildDecisionLedgerInjector`, and the
> `selectDecisions`/`recogniseDecisionRecords`/`renderDecisionLedgerBlock` group) and the `main()`
> wiring run bounded by the literal sentinels.

Under that slicing rule, `gatherDecisionCorpus`'s own declaration body is never excluded, so its
name occurs in the scanned remainder — and `gatherDecisionCorpus` is a census token. Same for
`DECISION_LEDGER_OMIT_REASONS` and `DECISION_LEDGER_CORPUS_OUTCOMES`, §5.2's catalogues, whose
declarations are not among the three sliced regions. The task as written produces a test that is
**red by construction on a correct implementation** — the strongest form of the "a test that can
only fail is not yet a test" defect, and it sits on a `[red]` row that batch-2 `T-18` depends on.

TSPEC v0.9 §7.3 (line 1297) repairs this generally rather than by another exception: the scanned
source is now the module minus **the body of every declaration this feature introduces**, a new
frozen list `DECISION_LEDGER_OWNED_DECLS` (§4.1/§4.2/§4.4's six functions plus every top-level
constant — `DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`,
`DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, §5.2's three catalogues, and
`DECISION_LEDGER_CENSUS_TOKENS` itself), sliced `bodyOf`-style over **all** top-level declarations,
plus the sentinel-bounded wiring run. None of `DECISION_LEDGER_OWNED_DECLS` appears anywhere in the
PLAN (`grep -n "OWNED_DECLS" PLAN` → no match).

Second divergence in the same row. `T-11` holds the token set

> to **set equality** against the module's exported decision-ledger symbol names so a later symbol
> cannot escape by omission

TSPEC v0.9 §7.3:1296 explicitly repudiates that comparison —

> Not set equality against *all* of the module's decision-ledger exports — **that comparison is red
> by construction**, since §3.1/§4.1/§4.2/§4.4/§5.2 declare roughly a dozen and only these six are
> data-carrying.

— and replaces it with a **partition** assertion: `DECISION_LEDGER_CENSUS_TOKENS ∪
DECISION_LEDGER_CENSUS_EXEMPT = DECISION_LEDGER_OWNED_DECLS`, the two sub-sets disjoint, with
`DECISION_LEDGER_CENSUS_EXEMPT` enumerated member-by-member with reasons. `grep -n
"CENSUS_EXEMPT" PLAN` → no match. So `T-11`'s companion oracle is the one v0.9 names as red-by-
construction, and the completeness guarantee the PLAN claims from it ("a later symbol cannot escape
by omission") is now delivered by a mechanism the PLAN does not describe.

Note this is a real loss of coverage, not just a citation nit: v0.9's partition is the set-equality
that makes a *newly added* symbol force a classification decision. Dropping it for an
exports-based equality that cannot go green means, in practice, the implementer will weaken or
delete the companion assertion to get to green — and nothing in the PLAN will notice.

**What the revision must state.** Re-ground `T-11` on TSPEC v0.9 §7.3: name
`DECISION_LEDGER_OWNED_DECLS` as the frozen owned-declaration list and the slicing basis (every
owned declaration, boundaries from *all* top-level declarations, the `bodyOf`/`allTopLevelDecls`
precedent already cited); name `DECISION_LEDGER_CENSUS_EXEMPT`; state the companion assertion as
the union-equals-`OWNED_DECLS` partition with disjointness, replacing the exports set-equality;
keep the existing non-empty-slice conjunct (v0.9 keeps it, PLAN:134 already has it) and the
"each member resolves to exactly one top-level declaration" red-on-rename conjunct v0.9 adds. The
six token members are unchanged between v0.8 and v0.9 (v0.9:1296 lists the same six), and the
`decisionLedger`-is-not-a-token rationale survives verbatim (v0.9:1321–1330) — so this is a
scanned-source and companion-oracle edit, not a re-write of the row.

Whether `T-11`'s owned test file also needs a new frozen-list task in batch 1 is the author's
call; `DECISION_LEDGER_OWNED_DECLS` and `DECISION_LEDGER_CENSUS_EXEMPT` are production constants
in `orchestrate-dev.js` under v0.9's reading, so `T-00`/`T-01`'s dependency edge may already cover
them. I flag only that the PLAN must say which task declares them.

### Nothing else in the changed rows moved

`T-19`'s re-pinning budget paragraph, `T-12a`'s derived-not-transcribed set-equality assertions and
its `~:625` confinement conjunct, and `T-00a`'s complement-pin explanation are all byte-identical to
the version I approved structurally at v3. Batch columns for the five touched rows are unchanged
(`T-00a` 1, `T-11` 2, `T-12a` 2, `T-19` 9), dependency edges unchanged, `[red]`/`[green]` labels
unchanged, owned test files unchanged. No new file is introduced into any batch, so the same-batch
same-new-file guard is undisturbed.

## Dependencies

### Upstream pins, re-measured at HEAD

Every digest below is `shasum -a 256` over the file on disk at HEAD, compared against the PLAN
header's transcription:

| Doc | PLAN header pin | On disk at HEAD | Verdict |
|---|---|---|---|
| REQ v1.9 | `sha256:ce6b133f…3c7b7c` | `ce6b133f0c1d…0d3c7b7c` | ✅ |
| FSPEC v1.3 | `sha256:2bd5c3ef…5aed39` | `2bd5c3ef055f…735aed39` | ✅ |
| DECISIONS | `sha256:13aba061…4fb89a` | `13aba06127b4…bb4fb89a` | ✅ **v4 F-03 closed** |
| TSPEC **v0.8** | `sha256:28d25518…32cb49` | `eef45ef32f0d…ece0623c8` (**v0.9**) | ❌ **stale** |

v4's F-03 was the transposed DECISIONS tail (`4bb89f` for `4fb89a`). v0.5 re-derived it
mechanically and it now matches to the character. Closed.

The TSPEC row is the mechanical face of F-01. TSPEC front-matter (line 17) declares **v0.9**;
its changelog names §5.4, §7, §7.2, §7.3 as the touched sections. The PLAN header still asserts
**v0.8** and the v0.8 digest, and `T-11`'s prose cites "TSPEC v0.8 §7.3" by version number in the
row body as well as in §Definition of Done. So the staleness is *self-declared* — the document
says which TSPEC it was derived from, and that TSPEC is two commits behind. That is the anchor
working as designed; the fix is a re-grounding pass, not a repair to the anchor mechanism. I file
it Medium (F-02) separately from F-01 because the pin itself is an honest record; F-01 is the
substantive divergence it points at.

Cross-check that the *other* TSPEC-derived rows are unaffected by v0.9: v0.9's touched sections are
§5.4, §7, §7.2, §7.3. `T-05`/`T-06` derive from §7.5 (`P-REC`/`P-LINE`, TSPEC:1426), untouched by
v0.9, and I verified their mutation-discipline conjuncts name-for-name at v4 — they carry forward.
`T-10a`'s flag-off referent was re-homed by `1a2d78cba` (§7/§7.2), which is worth the author's
glance during re-grounding, but §7.2's re-homing moves the referent *to* `T-02` recording, which
is what `T-10a` already says (approved at v3, `665eb44a8`). I do not file it.

### Batch DAG re-derivation over the changed rows

Re-derived `batch == max(dep batch) + 1` for every row the delta touched:

| Task | Deps | max(dep batch) | Declared batch | Verdict |
|---|---|---|---|---|
| `T-00a` | — | — | 1 | ✅ |
| `T-11` | `T-00`, `T-01` | 1 | 2 | ✅ |
| `T-12a` | `T-00`, `T-01` | 1 | 2 | ✅ |
| `T-19` | `T-12`, `T-12a`, `T-18` | 8 | 9 | ✅ |

Graph still acyclic over the touched sub-graph, ids unique, every dependency resolves to a declared
task. The new T-19 obligation does not add an edge: `documentOracles.test.js` was already in T-19's
owned-test-file list for the un-skip, so crediting the `102` control there introduces no new
concurrency and no new file. ✅

## Verification

Everything I asserted above, and the command that grounds it:

| Claim | How verified |
|---|---|
| Delta is exactly two commits, 19+/12− | `git diff --stat 36cd34d4d..HEAD -- …PLAN…`; `git log --oneline 36cd34d4d..HEAD -- …PLAN…` |
| Four upstream digests | `shasum -a 256` over the four upstream files at HEAD |
| TSPEC is v0.9, not v0.8 | `TSPEC…md:17` front-matter row; `git log --oneline -5 -- …TSPEC…` |
| §7.3 is the section v0.9 rewrote | TSPEC changelog line 23 ("Sections touched: §5.4, §7, §7.2, §7.3") and line 26 (the TE F-01 entry) |
| §7.3 is at TSPEC:1153, §5.5 at :955, §7.5 at :1426 | heading grep over TSPEC |
| T-11's scanned source = three slices + wiring block | `PLAN…md:134`, verbatim quote in §Batches |
| v0.9's scanned source = every owned declaration | `TSPEC…md:1297` |
| v0.9 repudiates the exports set-equality | `TSPEC…md:1296` |
| `OWNED_DECLS` / `CENSUS_EXEMPT` absent from PLAN | `grep -n "OWNED_DECLS\|CENSUS_EXEMPT" PLAN` → no match |
| Six census tokens unchanged v0.8→v0.9 | `TSPEC…md:1296` operand table, compared name-for-name with `PLAN…md:134` |
| T-19 owns the terminal `102` | `PLAN…md:141`; manifest row; §Definition of Done bullet |
| T-00a is now batch-1-evaluable | `PLAN…md:120` |
| Batch columns unchanged for touched rows | re-derivation table above |

**Un-verifiable by me, and not filed:** whether the author intends `DECISION_LEDGER_OWNED_DECLS`
and `DECISION_LEDGER_CENSUS_EXEMPT` to be declared by `T-00` or by a new batch-1 row. That is a
plan-authoring choice, not a defect; F-01 only requires that the PLAN name whichever task declares
them.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | `T-11` specifies the census against TSPEC **v0.8** §7.3, which **v0.9 replaced as red-by-construction**. Scanned source is still "source minus three sliced declarations plus the wiring block", leaving `gatherDecisionCorpus` and §5.2's two catalogue tokens in the remainder on correct code (v0.9 changelog:26 says four of six tokens would occur there); v0.9:1297 requires slicing **every** owned declaration via the frozen `DECISION_LEDGER_OWNED_DECLS`. And the companion oracle is still "set equality against the module's exported decision-ledger symbol names", which v0.9:1296 explicitly repudiates in favour of the `CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS` disjoint partition. Neither `OWNED_DECLS` nor `CENSUS_EXEMPT` appears anywhere in the PLAN. `T-11` is a `[red]` row that batch-2 `T-18` depends on, so an implementer following it writes a test that can never go green. | Batches → `T-11` (PLAN:134); §Definition of Done census bullet |
| F-02 | Medium | delta | local | The header upstream pin still reads `TSPEC-pdlc-decision-ledger.md` **v0.8** `sha256:28d25518…32cb49`; HEAD's TSPEC declares **v0.9** (front-matter:17) and digests `eef45ef3…0623c8`. TSPEC v0.9 landed at 08:44, six minutes before the v0.5 PLAN commit at 08:50, so the round re-derived three pins mechanically and left the fourth on a superseded version. The REQ, FSPEC and DECISIONS pins are all correct — v4's F-03 transposition is fully closed. | Header → Upstream pins |

**On F-01's provenance.** The pre-round bytes carried the same `T-11` text, but they were *correct*
when written: TSPEC was v0.8 at `36cd34d4d`. The divergence came into existence when TSPEC v0.9
landed mid-round, and this round's edit touched `T-11` twice — re-pointing its citation to §7.3 and
restoring its second-operand sentence — without re-reading the §7.3 it re-pointed to. I tag it
`delta` on that basis: the round is the one that could and should have caught it, and the remedy is
a bounded PLAN edit rather than a route back to an earlier phase. `local` because both findings sit
inside sections this edit changed.

**Not filed.** I did not re-open the v3-approved structural approvals (batch DAG, red-before-green
pairings, `[Fake first]` ordering, file-ownership disjointness) beyond re-deriving the four touched
rows, and I did not re-litigate `T-05`/`T-06`/`T-11`'s §7.5 mutation discipline, which v0.9 did not
touch.

## Positive Observations

- **The routed item landed exactly as specified, at every site it needed to.** v4 asked for one
  task id to own the terminal `102` assertion at a batch where it is evaluable. v0.5 named `T-19`
  (batch 9), made `T-00a`'s acceptance one-sided and honest about what it can prove at batch 1,
  narrowed `T-12a`'s disclaimer to the *set* census so it no longer disclaims something nobody
  owns, and credited T-19 in both the §Definition of Done bullet and the file-ownership manifest.
  Four consistent sites, no dangling prose. This is the clean version of the two shapes I offered.
- **v4 F-02 and F-03 both closed and verified mechanically.** The §5.5→§7.3 citation is corrected
  at both sites, and §7.3 is genuinely the enclosing section (TSPEC:1153). The DECISIONS digest was
  re-derived from `shasum -a 256` rather than re-typed, which is why it now matches to the
  character.
- **The staleness that F-01 names is discoverable *because* the header pins versions and digests.**
  The v0.4 pin-table improvement I praised last round is what let this round find F-01 in one
  `shasum` comparison rather than by reading two documents side by side. The anchor did its job.
- **The revision-history paragraph is honest about scope**, naming POSTMORTEM-PR and enumerating
  the five landed items rather than claiming a broader re-grounding than occurred.

## Recommendation

**Needs revision**

One High finding open. To close it, re-ground `T-11` on TSPEC **v0.9** §7.3: replace the
three-slices-plus-wiring scanned source with the frozen `DECISION_LEDGER_OWNED_DECLS` list sliced
over all top-level declarations, replace the exports set-equality with the
`CENSUS_TOKENS ∪ CENSUS_EXEMPT = OWNED_DECLS` disjoint partition, name whichever task declares the
two new frozen lists, and keep the non-empty-slice conjunct already present. Advance the header
TSPEC pin to v0.9 `sha256:eef45ef3…0623c8` and the "TSPEC v0.8 §7.3" version references in the
`T-11` row and §Definition of Done in the same pass (F-02). The six census tokens and the
`decisionLedger`-is-not-a-token rationale survive v0.9 unchanged, so no other row needs to move.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
