# Cross-Review: software-engineer — FSPEC (round 17, delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 17
**Scope:** Delta only. Prior review: `CROSS-REVIEW-software-engineer-FSPEC-v16.md`
(`Approved with minor changes`, `REVIEWED-COMMIT: 76476315`). Delta reviewed:
`76476315..HEAD` (`48631bc6`) — 23 insertions, 14 deletions, all in the FSPEC.
Unchanged sections were not re-reviewed.

## 1. What changed

`git diff 76476315..HEAD -- FSPEC` spans four commits (`a731c101`, `167bb5f9`,
`39001869`, `48631bc6`) and lands in seven hunks:

| # | Site | Change | Class |
|---|---|---|---|
| 1 | header (`:12-22`) | version `11.5` → `11.6`, date → `2026-08-10`, plus a Round-15 note recording te L-01, the te L-02 acceptance, and the two re-derived self-locators | provenance (my v16 F-02) |
| 2 | §3.1 (`:387`) | `consolidate-learnings/SKILL.md` anchor `:35` → `:56`, cell reworded to "was … a **date** boundary" | citation re-anchor |
| 3 | §4.3 self-locator (`:530`) | `:557-558` → `:566-567` | self-locator |
| 4 | §5.2 (`:661-708`) | `SKILL.md` anchors `:40`→`:61`, `:41`→`:62` (twice), `:38`→`:59`, `:43`→`:64` | citation re-anchor |
| 5 | §5.3 (`:759`) | `SKILL.md:54` → `:75` | citation re-anchor |
| 6 | §8.4 (`:1501`), §15.3 (`:2465`) | harvest `SKILL.md:70-78` → `:70-79` | citation re-anchor |
| 7 | §13.5 AT-Q7 (`:2176`), AT-P7 (`:2124`) | AT-Q7's containment clause gains "**as recorded at the implementing layer**" + the DEC-LAYER-01 union; AT-P7's §15.3 self-locator `:2449` → `:2459` | oracle-bound alignment (te L-01) + my v16 F-01 |

Zero AC, BR, NFR, E-row or fixture-body changes. AT-Q7 is the only oracle text
touched, and only to restate a bound AT-Q7c already carried since v11.5.

## 2. Both v16 findings are resolved — verified, not accepted

**F-01 (AT-P7's self-locator drifted one line).** Fixed exactly, and the fix survived
the further +9-line drift this delta introduced. At HEAD `:2459` is the
`nudge-consolidation.sh` row of §15.3's register itself — the row AT-P7 names for the
`:28` glob widening and the `:41` re-scope — not the separator and not a neighbouring
row. Re-derived, not trusted: `:2455` is `### 15.3`, `:2457` the header, `:2458` the
separator, `:2459` the nudge row.

**F-02 (header did not record the `76476315` edit).** Fixed. Header now reads `11.6` /
`2026-08-10` and the new note names what the round changed, what it declined (te L-02,
accepted-as-recorded), and explicitly supersedes the two self-locator values the v11.5
note below it still records — which is the right form, since the v11.5 note is
append-only history and rewriting it would erase the record.

**The §4.3 self-locator is exact at HEAD.** `:566-567` reads "it runs at step 16 after
the terminal row is appended", precisely the release-ordering claim §4.2's producers
table cites it for. Both self-locators verified against the file, not against the note.

## 3. Did the revision break anything?

**AT-Q7's new clause does not weaken the oracle.** The bound moved from §6.5's frozen
literal to "§6.5's obliged ∪ permitted columns ∪ every widening TSPEC has recorded under
DEC-LAYER-01". Checked at TSPEC `:1737` and `:1756-1758`: the three recorded widenings
are `read-object` (`git cat-file -e`), `read-remote` (`git remote get-url`) and
`read-index` (`git ls-files`) — all non-mutating, none a merge or branch verb, so
AT-Q7's own "which alone falsifies every merge verb" survives the widening verbatim.
TSPEC `:1760-1767` records *why* they are three verbs and not folded, which is the
property that keeps a later `git remote add` from passing containment. AT-Q7's assertion
(2) — the obliged column present — is byte-identical across the diff, so the row still
fails a pass that makes no calls at all. AT-Q7 and AT-Q7c now state one bound in one
form; that was the entire te L-01 ask, and nothing beyond it moved.

**The re-anchored SKILL citations are correct at HEAD.** Line-checked, all six:
`:56` is step 1 ("in scope when its basename is un-consolidated per the block/legacy
predicate"), `:59` step 4's pattern-vs-coincidence bar, `:61` the DOMAIN-CONSTRAINTS
route, `:62` the `DECISIONS-{topic}` route carrying `{topic} = failure-mode-id`, `:64`
step 6's log record, `:75` the four-column proposal table header. Harvest's `:70-79` is
the whole metadata table (`:70` `| Field | Detail |` … `:79` `| DoD rounds |`), with
`Phases exercised` at `:78` inside it — a widened but still-exact span, and §8.4's
sibling `:103-108` §5 citation is unchanged and still exact.

**No AC, BR, NFR, E-row or AT fixture changed meaning.** Confirmed from the diff, not
asserted: outside the seven hunks above the document is byte-identical, including
§8.3's set-equality obligation, §8.4's four-step table, §6.5's seam table (`:1040`) and
every AT-P/AT-Q oracle body other than AT-P7's one self-locator.

## 4. What the sweep missed — one asymmetry

This round re-anchored every `consolidate-learnings/SKILL.md` and
`harvest-learnings/SKILL.md` citation to HEAD. It did not re-anchor the third shipped
file, `pdlc/hooks/scripts/nudge-consolidation.sh`, whose edits have **also already
landed** at HEAD. Measured, not remembered:

| FSPEC claim | HEAD |
|---|---|
| §3.1 `:386`: "`nudge-consolidation.sh:41` — `pending = [p for p in learnings if os.path.basename(p) not in logtext]`, bare substring over the whole file (read at `:36-37`)" | `:41` is `start = rest.find("<!-- pdlc:consumed", pos)` inside `region_split`; `pending` is bound at `:73-75` and is already the two-region test; `:36-37` are `legacy = logtext[:idx]` / `rest = logtext[idx:]` |
| §15.3 `:2459`: "predicate at `:41` scoped to the two regions; corpus glob at `:28` widened to include `docs/completed/*/`" | `:28` is a comment line; the corpus globs are `CORPUS_GLOBS` at `:60-61` and already include `docs/completed/*/LEARNINGS-*.md` |
| AT-P7 (`:2124`): block at `:36-41`, glob `:28`, `pending` bound at `:41`, early-exit `:29-30`, `THRESHOLD` gate at `:25`, comparison at `:43` | only `THRESHOLD = 5` at `:25` still holds; the file is 88 lines and the block is no longer a `:36-41` span |

This is not a contract defect — the end state the three rows describe is exactly what
HEAD implements, AT-P7 carries its own "every line number here is a locator that will
drift with the edit" disclaimer, and no oracle changes. It is an internal
inconsistency the round created by re-anchoring two of three files: §3.1's table is
headed **"File:line at HEAD | Shipped behaviour"**, and after this delta one of its two
rows locates HEAD while the other locates a pre-edit file. Both findings below are
Medium, non-gating, and fixable in one pass over three sites.

A related tense point (Low): §3.1's middle column is headed "Shipped behaviour" but the
consolidate row now reads "**was** … a date boundary", because `SKILL.md:56` already
carries the post-feature predicate (landed `9823d2cc`, re-anchored `a731c101`). The
wording is honest; the column heading is what is now stale. Renaming the column to
"Pre-feature behaviour" makes both rows readable without touching either cell.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §3.1's shipped-files table is headed "File:line at HEAD", but the `nudge-consolidation.sh` row's anchor and behaviour cell describe the pre-edit file: `:41` at HEAD is `start = rest.find(…)` inside `region_split`, and the `pending` binding — already the two-region test — is at `:73-75`. The sibling row in the same table was re-anchored this round, so the table is now internally asymmetric. Fix: re-anchor to `:73-75` (predicate) / `:60-61` (globs), or state once that the row records pre-feature state | §3.1 (`:384-387`) |
| F-02 | Medium | Local | §15.3's register row still names "predicate at `:41`; corpus glob at `:28`" for `nudge-consolidation.sh`; at HEAD `:28` is a comment and the globs are `CORPUS_GLOBS` at `:60-61`. AT-P7 (`:2124`) cites the same dead anchors (`:36-41`, `:28`, `:29-30`, `:43`) — of its six, only `:25` survives. AT-P7's own drift disclaimer keeps this from being an oracle defect, but the register is the one place an implementer looks to find the edit site. Fix: re-anchor both, or replace the numbers with the binding names (`CORPUS_GLOBS`, `pending`), which do not drift | §15.3 (`:2459`), §13.5 AT-P7 (`:2124`) |
| F-03 | Low | Local | §3.1's column heading "Shipped behaviour" no longer matches its own consolidate-learnings cell, which now reads "was … a date boundary" because HEAD already carries the post-feature text at `SKILL.md:56`. Renaming the column to "Pre-feature behaviour" resolves it without touching a cell | §3.1 (`:384`) |

Prior-round findings: v16's F-01 and F-02 are both **closed** (§2 above, verified at
HEAD). No prior finding re-opened.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is the intent that §3.1 and §15.3 record the **pre-feature** file state permanently (a change register read against the feature's start commit), or that they track HEAD? This round answered "track HEAD" for two files and "pre-feature" for the third; either policy is fine, but the document should hold one, and the answer decides whether F-01/F-02 are re-anchors or a heading change |

## Positive Observations

- **Both v16 findings were fixed at the source, not papered over.** The self-locator was
  re-derived rather than nudged: it survived a further +9-line shift in the same round
  and lands on the named row, which is what a re-derivation buys over an increment.
- **The header note supersedes rather than rewrites.** The v11.5 note's now-stale
  locator values are left standing and explicitly superseded above them, keeping the
  change history append-only — the same discipline the log-region rules ask of the
  feature itself.
- **te L-02 is recorded as accepted, not silently dropped.** A declined finding with a
  stated reason ("a known drift point already governed by the shape rule beside it") is
  strictly better than an unexplained non-fix, and it matches AT-Q7c's own argument that
  the *shape* of the bound is the invariant, not the literal.
- **AT-Q7's alignment was checked against the implementing layer, not asserted.** The
  three DEC-LAYER-01 widenings really are non-mutating at TSPEC `:1737`/`:1756-1758`, so
  the widened containment bound still falsifies every merge and branch verb — the
  property AC-3.7 depends on.
- **Scope held.** 23 insertions across a 2,743-line document, zero AC/BR/NFR/E-row/AT
  fixture changes. Verified from the diff.

## Recommendation

**Approved with minor changes.**

Both findings I raised in v16 are closed and verified at HEAD. The revision's one
substantive edit — AT-Q7's containment bound — moves the row into agreement with
AT-Q7c without weakening it, and the widenings it now admits are non-mutating at the
implementing layer, so the oracle still falsifies exactly what AC-3.7 needs it to. Six
re-anchored SKILL citations are exact at HEAD, line-checked individually. Nothing
previously approved changed meaning.

Three non-gating findings, all one class: the citation sweep covered two of the three
shipped files it touches, leaving §3.1, §15.3 and AT-P7's `nudge-consolidation.sh`
anchors pointing at a pre-edit file (F-01, F-02) and §3.1's column heading out of step
with its own cell (F-03). No High finding. My v16 approval stands, extended to
`48631bc6`.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:fcbe2e85f40fb77df54439985cd6497c95cb3d655bdb7828d6f7f3ddededbe25
REVIEWED-COMMIT: 48631bc661d04b3e810c7e49d4710c23723241cc
