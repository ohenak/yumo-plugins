# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.4, `sha256:64d8f1c5…`)
**Date:** 2026-08-31
**Iteration:** 7 (delta confirmation, erratum round 5)

## Overview

Scope of this round: the targeted erratum edit `e6f18c5a1..HEAD` on `PLAN-pdlc-stats.md`
(7 insertions, 2 deletions) and whether it resolves the routed item without breaking anything
previously approved — plus the standing `DEC-ERR-03` obligation to re-measure every upstream
claim this PLAN leans on against upstream's **current** bytes, whether or not it appears in the
routed list.

One item was routed to this round:

- T-10's premise "HEAD's `bin/cli.mjs` contains neither `statSync` nor `lstatSync` anywhere" was
  false at HEAD (`lstatSync` at the `fileSize` call site, a bare `statSync` in the doc comment
  above it), so the whole-file zero-match assertion needed its falsifiability restated on the
  matcher's own anchors — or comment/string masking stated normatively.

**Resolved.** The row no longer rests on the expired baseline property. It records the token's two
present occurrences at HEAD, then grounds the zero-match result on the matcher's two anchors:
`(?<![A-Za-z])` rejects the `lstatSync` call site, `\s*\(` rejects the comment occurrence, which is
not a call. The raw `:262` line anchor — a `DEC-DOC-01` misuse in its own right, and off by five at
HEAD — is gone. See §Verification for the re-measurement.

A second edit landed alongside it, not from the routed list: the `Status` column is declared a
planning-time ledger, explicitly not maintained during implementation, with the branch's
`feat(pdlc-stats): T-NN` commits named as the authoritative record. I checked it for collateral
damage rather than re-litigating it — see §Dependencies.

Two findings, both non-gating: one Medium (inherited, nonlocal) and one Low (delta, local).
No open High, so the confirmation approves.

## Batches

The edit touches exactly one row, `T-10`, and the section preamble above the task table. Nothing
else in §Batches moved, so the batch DAG, the `[Fake first]` ordering, the red-before-green
predecessors and the same-new-file authoring guard are all untouched and stay as approved at v6.
Re-derived nothing beyond confirming the diff is confined to prose inside T-10's `Task` cell: the
`Batch` (`2`), `Deps` (`T-01, T-02`), `Test File` and `Source File` cells are byte-identical.

**T-10's conjunct is unchanged, and that is the right call.** The assertion is still whole-file,
still carries no "in the `stats` seam" qualifier (the undelimited qualifier removed at v1.2 for
te F-02 has not crept back into the row), and still names the boundary-anchored matcher. What
changed is only the *justification*: from a baseline property of the file ("contains neither token
anywhere") to a property of the matcher itself. That is the stronger of the two groundings — a
baseline property expires the moment a task in this very PLAN edits the file, which is exactly what
T-17 did, whereas the anchors hold for any source that calls `lstatSync` and mentions `statSync` in
prose. The row now also says masking is not owed and says *why*, so an implementer reading it has a
decision rather than an unstated assumption.

**Falsifiability survives.** The conjunct can still go red for the reason it exists: a
`statSync(` call anywhere in the file's source matches both anchors. The one residual is a
false-**red** — prose writing `statSync(` with the paren inside a comment would match — which is
the safe direction for a guard oracle and is not worth an edit.

**The `Status` column declaration.** T-01, T-08 and T-16 carry `✅`; the row count matches the
"three `✅` ticks" the new paragraph claims. Nothing in this document derives a gate, a batch edge
or a Definition-of-Done checkbox from that column — I grepped §Definition of Done, §Batch gates and
§Verification for a `Status` dependency and there is none — so declaring it unmaintained removes an
authority claim without removing an obligation. Given T-02…T-20 have landed on this branch while
most rows still read `⬚`, the declaration makes the document honest rather than making it weaker.

## Dependencies

Upstream re-grounded against current bytes before reading the delta, per `DEC-ERR-03`. Measured at
HEAD:

| Upstream | HEAD `sha256` | Dispatch pin | Verdict |
|---|---|---|---|
| REQ | `f75c348f…` | `f75c348f…` | same bytes |
| FSPEC | `a493133f…` | (unpinned) | v1.8, matches the PLAN's own re-grounding note |
| TSPEC | `f32d9cb5…` | (unpinned) | v1.8 |
| DECISIONS | `ca3f7219…` | (unpinned) | unmoved |

TSPEC moved v1.7 → v1.8 since the round-4 revision. I diffed `bf496d9aa..HEAD` over
`TSPEC-pdlc-stats.md`: the move is confined to the changelog, §4.3's contested paragraph, BR-16's
version pin and §8.3. **None of the sections T-10 leans on moved** — §2.4 (`lstat`, not `stat`),
§2.5 (the parser bundle and its wiring oracle) and §6.4's seven-oracle table are byte-identical
across the move, so the delta's justification is measured against live upstream text.

Two second-order checks on the move, because the PLAN carries claims about it:

- **§8.3's count word.** TSPEC §8.3 at HEAD opens "**One remains open** — BR-26/EC-10's
  unclassified predicate". The PLAN's residual-risk row calls BR-26/EC-10 "the **only** erratum
  TSPEC §8.3 still carries open" and its companion row marks the REQ-STATS-06-versus-BR-16
  disagreement discharged, sourced to "§8.3 (second bullet at TSPEC v1.7, removed at v1.8)". Both
  agree with upstream's current bytes, including the version at which the bullet went away.
- **T-04's AT-17 fourth leg.** TSPEC §4.3 now states the settled BR-16 reading — an unrecognised
  basename contributes no process bytes and counts as no file of its family remaining. T-04 names
  that leg, records it discharged at REQ v1.7 / absorbed at FSPEC v1.8 in BR-16's favour, and says
  no expected value moves. Faithful; no re-stamp owed and none claimed.

The `lstat`-not-`stat` conjunct's own upstream anchor, TSPEC §3.1's
`fileSize(absPath: string): number; // lstat().size — never follows a link (§2.4)`, is present at
HEAD verbatim, so T-10's parenthetical citation still resolves.

No ordering edge, integration point or prior-phase baseline in §Dependencies was touched by the
delta.

## Verification

Every factual claim the delta makes was re-measured at HEAD rather than taken on the document's
word. Commands and results:

**1. The matcher yields zero matches over the whole source.**

```
node -e 'const s=require("fs").readFileSync("pdlc/engine/bin/cli.mjs","utf8");
         console.log((s.match(/(?<![A-Za-z])statSync\s*\(/g)||[]).length)'
→ 0
```

**2. Both occurrences the delta names are present, and are the only ones.** Every line of
`pdlc/engine/bin/cli.mjs` matching `/statSync/i` at HEAD:

- `pdlc/engine/bin/cli.mjs:1288` — `* \`lstatSync\`, never \`statSync\` — a symbolic link
  contributes its own size,` (doc comment above `statsIo()`)
- `pdlc/engine/bin/cli.mjs:1302` — `return nodeFs.lstatSync(absPath).size;` (the `fileSize` body)

Exactly the two the row describes, in the two roles it assigns them. The anchor analysis holds
mechanically: `1302`'s token is preceded by `l`, which `(?<![A-Za-z])` rejects; `1288`'s token is
followed by `` ` `` and an em-dash, which `\s*\(` rejects. So the zero at (1) is produced *by the
anchors*, not by the file happening to be free of the token — which is precisely the claim the
delta now makes and the old text could not.

**3. The withdrawn `:262` anchor.** `fs.existsSync` sits at `pdlc/engine/bin/cli.mjs:267` at HEAD,
five lines off the retired citation, and a second `nodeFs.existsSync` now exists at `:1308` that
the old "its only `fs` predicate" phrasing did not contemplate. Removing the anchor rather than
re-stamping it is the right repair: a raw line anchor over a file this feature's own tasks edit is
a `DEC-DOC-01` misuse that would expire again on the next wave.

**4. The shipped T-10 test is green against the row's semantics.** `T-10` has landed
(`df1441b76`). Its whole-file conjunct in `pdlc/engine/__tests__/stats-cli-structure.test.js`
extracts every `<word>Sync(` call name from the masked source and asserts `statSync` is not a
member, which yields the same zero as (1) for the same two reasons. The row and the landed test
therefore agree in effect. They do not agree in *form* — see F-02.

**5. Test-strategy surface unchanged.** The AT coverage table, the anti-drift and property-coverage
table, the mutation obligations and the `--branches 85` floor in §Definition of Done are all
byte-identical across the delta. No AT lost an owner, no oracle lost a falsifier, no red row lost
its green successor.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | §Verification's "Claims verified against the tree while writing this PLAN" carries three bullets that are false at HEAD, and they fail in exactly the shape this round just repaired for T-10 and declared for the `Status` column: a tree measurement stated in the present tense that this PLAN's own tasks have since invalidated. At HEAD `pdlc/workflows/lib/` holds **four** modules, not three — `stats.mjs` exists (22 KB, landed by T-12/T-13/T-14/T-15/T-16) — so "**`stats.mjs` does not exist**; every row naming it declares it new" reads false to anyone checking today; `prepack.mjs`'s `MODULE_NAMES` has **five** entries, not four, and `package.json`'s `c8.include` has **eight** `**/`-anchored entries, not seven. No task, oracle or expected value is wrong because of this — T-21's obligation rationale (`document-oracles.mjs` is in neither list, so directory membership is not what obliges the co-change) is still sound — but the section is the one a DoD reviewer reads for tree evidence, and a stale count there misreads as authoritative, which is the harm the new `Status` paragraph names in its own last sentence. Cheapest repair, no re-measurement needed: give the section the same one-line scoping the `Status` column just received — state that these are **pre-implementation** measurements taken while the PLAN was written, not maintained, with the branch's `feat(pdlc-stats): T-NN` commits as the current record. | §Verification → "Claims verified against the tree while writing this PLAN", bullets 2 and 3 |
| F-02 | Low | delta | local | T-10 now calls `/(?<![A-Za-z])statSync\s*\(/` "normative, not illustrative" and, in the same breath, states that comment- or string-masking is "**not** owed". The landed test satisfies neither literally: it masks comments and strings, then extracts whole `<word>Sync(` call names and asserts set non-membership of `statSync`. That is equivalent-or-stronger — whole-identifier extraction cannot mis-attribute `lstatSync`, so it yields the same zero for the same anchors — and "not owed" is permissive rather than prohibitive, so nothing is contradicted. But a DoD reviewer diffing the shipped oracle against a matcher the PLAN calls normative has to re-derive that equivalence. One clause on the row — that any whole-identifier extraction with the same two anchors satisfies the conjunct, and that masking is permitted though not required — closes it. | §Batches → T-10, the `lstat`-not-`stat` seam conjunct |

FINDING: Medium | inherited | nonlocal | §Verification "Claims verified against the tree while writing this PLAN" — three bullets stale at HEAD (`lib/` holds four modules and `stats.mjs` exists; `MODULE_NAMES` has five entries; `c8.include` has eight), the same expired-tree-measurement shape the round repaired for T-10; scope the section as pre-implementation, unmaintained, per the `Status` column's own treatment
FINDING: Low | delta | local | §Batches T-10 — the matcher is called "normative" while masking is "not owed", but the landed conjunct masks and extracts whole `<word>Sync(` call names; equivalent-or-stronger, so nothing breaks, but the row should admit whole-identifier extraction explicitly

## Questions

| ID | Question |
|----|---------|
| Q-01 | None this round. |

## Positive Observations

- The repair re-grounds the conjunct on the matcher's own anchors rather than on a property of the
  file, which is the durable form: it survives every future edit to `bin/cli.mjs`, including the
  ones this PLAN's remaining tasks will make. The weaker repair — re-measuring the baseline and
  re-stating it — would have expired again on the next wave.
- The row states masking as a *decision* ("not owed", with the reason) rather than leaving it
  unstated. Even though the implementation chose to mask anyway, an implementer reading the row
  knows which way the choice was made and why, which is what the routed item asked for.
- The raw `:262` line anchor was removed rather than re-stamped — the `DEC-DOC-01`-correct repair
  for a citation into a file under active edit.
- Declaring the `Status` column an unmaintained planning-time ledger, with the `feat(pdlc-stats):
  T-NN` commits named as the authoritative record, retires a false authority instead of
  hand-reconciling one that would go stale on the next commit. The "three `✅` ticks are
  incidental" claim is accurate — T-01, T-08, T-16, and no others.
- Upstream was re-grounded before the delta was written, TSPEC's v1.7 → v1.8 move was checked
  against the sections this document actually leans on, and §8.3's count word ("one remains open")
  matches the PLAN's residual-risk table on both rows.

## Recommendation

**Approved with minor changes**

No open High finding: the routed item is resolved on stronger ground than it was raised on, and the
delta breaks nothing previously approved. F-01 is inherited and nonlocal — it predates this edit and
sits outside the sections it touched — and F-02 is a clarity clause on the edited row. Neither gates.
Both are cheap enough to fold into whatever edit this document takes next.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
