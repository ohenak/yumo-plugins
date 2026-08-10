# CODE REVIEW — pdlc-consolidation-agent (v4)

| Field | Detail |
|---|---|
| Feature | pdlc-consolidation-agent |
| Branch | `feat-pdlc-consolidation-agent` |
| Reviewer role | dod-verify (evaluator — documents findings, fixes nothing) |
| Review version | v4 (delta re-verification) |
| Date | 2026-08-10 |
| HEAD reviewed | `167bb5f9` |
| Prior round | `CODE_REVIEW-pdlc-consolidation-agent-v3.md` (committed `c8d6e0a2`) |
| Remediation under review | `167bb5f9` — "close DOD v3 H1/H2 — widen the SKILL-anchor warranty to every citer" |
| Verdict | **Findings** |
| Branch coverage (lowest new module) | 87.25% (unchanged) |
| Requirements traced | 34/34 — 0 gaps (carried from v2/v3) |

**Version reconciliation.** This round was dispatched as "v3", but `CODE_REVIEW-pdlc-consolidation-agent-v3.md` is already
committed at `c8d6e0a2`, and its remediation commit (`167bb5f9`) landed after it. Per the dod-verify version rule — next
unused integer — this is **v4**. Writing to the v3 path would have destroyed the round-3 record this round's disposition
table depends on. **The dispatcher's version argument has now been one behind for three consecutive rounds.** v2 and v3 each
recorded the same reconciliation; three in a row is no longer a coincidence worth a footnote, it is a defect in whatever
computes the argument, and it is the one process item in this review that outlives the feature.

**Scope:** Local + Cross-Feature (per-finding tags below).

---

## §1 Code Quality Findings

### Disposition of the v3 findings

| v3 | Summary | Status at HEAD | Evidence |
|---|---|---|---|
| **H1** | The anchor sweep and its warranty covered two of four citers | **Resolved** | All three named anchors re-measured true at HEAD: `TSPEC:179` and its twins now cite `:56`/`:62` (SKILL `:56` = `1. **Find the boundary.**`, `:62` = the `DECISIONS-{topic}.md` route); `vocabularies.md:167` now cites `:70`, the line stating the shipped `{passId}` name. A repo-wide `git grep` for `consolidate-learnings/SKILL.md:[0-9]` over tracked `*.md`, review artifacts excluded, returns **no** surviving `:35`/`:41`/`:49`. The warranty is genuinely derived, not re-transcribed: `deriveCiterPaths()` (`consolidationSkillAnchors.test.js:91-104`) shells `git grep -l -F` and the literal `KNOWN_CITERS` is used only as a non-vacuity **floor**. Probes A, C, E, F below all red |
| **H2** | `REQ:41` still quoted the `{date}` name after G3 corrected the SKILL | **Resolved** | `REQ:41` now reads `CONSOLIDATION-PROPOSAL-{passId}.md`. The obligation was also generalised as v3 recommended: `it.each(citerPaths)` (`:358-365`) asserts **no citing document** names a proposal filename `proposalPathFor` cannot produce, and it runs over all seven derived citers (CLAUDE.md and PROPERTIES included). Probe B reds |

Both prior findings are closed on measurement, not on the commit message. The commit also went beyond its brief in the way
v3 asked for: widening the document set surfaced a **third anchor form** neither v2 nor v3 had enumerated — the file named in
one table cell with the anchors following as bare `` `:NNN` `` — and with it two further stale citers (`FSPEC:2451`,
`PLAN:318`) carrying the same `:35`/`:41` pair. That is the round finding its own blind spot, which is the behaviour these
rounds are supposed to produce.

### Mutation probes — the widened oracle is load-bearing, and its reach really did widen

The claim under test is that the citer set is derived rather than transcribed. Six probes, each reverted (`git status`
clean afterwards, no tracked modifications):

| Probe | Mutation | Result |
|---|---|---|
| A | `TSPEC:179`'s cell anchor `` `:56` `` → `` `:35` `` — H1's own defect, in the document the old oracle could not see | **RED** — 1 failure |
| B | `REQ:41` `{passId}` → `{date}` — H2's own defect | **RED** — 1 failure |
| C | `vocabularies.md:167` `:70` → `:49` — H1's Cross-Feature instance | **RED** — 2 failures (blank-line conjunct + totality) |
| D | `PLAN:318` `{passId}` → `{date}` | *(invalid — line 318 carries no `CONSOLIDATION-PROPOSAL-{…}` slot; the edit was a no-op. Not evidence either way)* |
| E | A **brand-new** citer file `docs/_constraints/zz-probe-citer.md` anchoring `SKILL.md:49` (a blank line), `git add`ed | **RED** — 2 failures, and the run reports **33** tests rather than 32: the derived set picked the new file up. This is the conjunct H1 was actually about |
| F | One blank line inserted at `SKILL.md:30` — the original G1 regression class | **RED** — 17 of 32 failures |

Probe E is the one that settles H1: the previous suite would have been blind to a citer that did not exist when it was
written, and this one is not. Worth recording precisely because it is a limit as well as a pass — `git grep` searches
tracked files, so the same probe left **untracked** passes green. That is the correct scope for a warranty about committed
documents (CI sees only tracked files) and I raise it as a note, not a finding.

### Findings open at v4

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| J1 | 6(a) adjacent-surface falsification | medium | `docs/_constraints/pdlc-consolidation-vocabularies.md:85`; `TSPEC:180`; `FSPEC:1498`, `:2454`; `REQ:626`; `PLAN:319` | The **harvest** SKILL's anchor family is stale at HEAD, in exactly the shape G1/H1 took for the consolidate SKILL. This branch's T08 inserted `Phases exercised` at `harvest-learnings/SKILL.md:78`, pushing `DoD rounds` from `:78` to `:79` and the metadata table from `:70-78` to `:70-79`. Six citers still cite the pre-insertion range. `vocabularies.md:85` is the sharp instance: it enumerates seven fields **ending in `DoD rounds`** and anchors them at `:70-78` — the field it names last now sits outside its own cited range — while asserting the table "carries no phase field", though `:78`, inside that range, is now `Phases exercised`. The round's new warranty is scoped to the consolidate SKILL and cannot see any of this | Re-measure the six ranges (`:70-78` → `:70-79`, `TSPEC:180`'s `:72-78` → `:72-79`) and correct `vocabularies.md:85`'s enumeration to name the field set it actually describes; then widen `consolidationSkillAnchors.test.js` from one SKILL to **both** bundled-SKILL families, which is a change to `SKILL_REL` and the grep literal, not to the machinery | Cross-Feature (`docs/_constraints/`), Local (TSPEC/FSPEC/REQ/PLAN) |

#### J1 — the warranty was widened across citers, but not across the sibling SKILL, and that sibling is stale

H1 was stated as "the document set is narrower than the family". The commit widened the *document* axis completely and
correctly. It did not widen the *subject* axis: `consolidationSkillAnchors.test.js` still pins `SKILL_REL` to
`pdlc/skills/consolidate-learnings/SKILL.md` (`:68`) and greps for that path alone (`:97`). This feature edits **two**
shipped prompt files — TSPEC §3.2 rows 6 and 7 name both, and FSPEC §12.2 assigns both the same four-verbatim-conjunct
obligation. One of the two now has a mechanised anchor warranty. The other has none, and is stale.

Measured at HEAD, and against `main` to establish causation:

| | `main` | HEAD | Effect |
|---|---|---|---|
| `harvest-learnings/SKILL.md` metadata table | `:70-78` | `:70-79` | T08 inserted `Phases exercised` at `:78` |
| `Harvested from` | `:77` | `:77` | unmoved — the citations that name *this* row are still true |
| `DoD rounds` | `:78` | `:79` | **moved out of every cited range** |

The citations, all unchanged since before the insertion:

| Citing site | Anchor | Status at HEAD |
|---|---|---|
| `docs/_constraints/pdlc-consolidation-vocabularies.md:85` | `:70-78` | **False twice over** — see below |
| `TSPEC:180` | `:72-78` (+ `:77`) | Range one row short; `:77` true |
| `FSPEC:1498`, `FSPEC:2454` | `:70-78` | Range one row short; the `Phases exercised` referent at `:78` is inside, so the sentence's subject still resolves |
| `REQ:626` | `:70-78` | Same |
| `PLAN:319` | `:70-78` (+ `:77`) | Same; `:77` true |

`vocabularies.md:85` is why this is medium rather than low. It reads:

> A LEARNINGS at HEAD carries no phase field: its metadata table is `Feature` / `REQ` / `Date Completed` /
> `Total Iterations` / `Upstream` / `Harvested from` / `DoD rounds` (`pdlc/skills/harvest-learnings/SKILL.md:70-78`)

On `main` that sentence was exact: seven fields, `:70-78`, no phase field. On this branch both halves broke in the same
edit — the range now stops one row short of the last field it enumerates, and the line it newly *includes* (`:78`) is the
very phase field the sentence says the table does not carry. A reader resolving the coordinate finds the sentence
contradicted by its own citation.

Three things make this a finding rather than a nit, and they are the same three v3 used to grade H1 medium:

1. **It is Cross-Feature and outlives the feature.** `docs/_constraints/` is read by `pm-author` and `se-author` on every
   future feature. v3 argued exactly this about `vocabularies.md` and the operator accepted it; the argument does not
   change because the stale anchor points at a different SKILL.
2. **`TSPEC:180` sits in the file-ownership manifest** — the same §3.2 table whose row 6 v3 called load-bearing because
   Phase P validates it and Phase I partitions waves by it. Row 7 is not less load-bearing than row 6.
3. **This branch caused it.** Unlike v3's `vocabularies.md:163`, which was already stale on `main`, every instance here was
   true on `main` and was falsified by this feature's own T08 edit. It is a straightforward adjacent-surface
   falsification by the diff, in the sense criterion 6(a) defines — it has simply been carried, unnoticed, since Phase I.

**v2 and v3 both missed it, and I want to be precise about how**, because the same move would miss it again. Both swept the
harvest family and declared it clean; v3's clean-scan says so in terms — "`vocabularies.md:81` → `:70-78`, with
`Harvested from` at `:77` and `Phases exercised` at `:78`". Every one of those spot-checks is *true*. The sweep verified
that the named referents fall inside the range and never checked the converse: that the range still spans the table it
claims. Set-containment where the obligation is set-equality — the exact oracle-quality failure this repo's review clauses
name, committed by the reviewer rather than the author.

The `:103-108` Open-Items anchor (`FSPEC:1525`) is unaffected and true at HEAD (`:103` `## 5. Open Items for Consolidation`,
`:106-108` the `failure-mode-id` fence). `CLAUDE.md:49` names the file with no line anchor. Neither is in scope.

### Clean scans

- **Criterion 1 (stubs).** `167bb5f9` touches seven paths: five `.md`, one test file, and the v3 review record. **No
  production JavaScript or shell changed** (`git diff --name-only a731c101..167bb5f9 | grep -vE '\.md$|__tests__/'` → empty).
  The one `TODO`/`FIXME` string added anywhere in the diff is inside v3's own prose describing the absence of such markers.
  **0 findings.**
- **Criterion 2 (unwired integrations).** Nothing added. The test file's one new integration is `execFileSync("git", …)`,
  which is wired, reached on every run, and load-bearing (probe E). **0 findings.**
- **Criterion 3 (mock/fake data).** No hardcoded sample data added. `KNOWN_CITERS` is a literal but is explicitly a
  non-vacuity floor asserted *alongside* the derived set, not a substitute for it — the suite fails if the derivation
  returns less than the floor, and covers more than the floor when the repo does. **0 findings.**
- **Criterion 4 (coverage).** Re-measured at HEAD, unchanged and above floor — see §3.
- **Append-only review history.** `167bb5f9` shows `CODE_REVIEW-…-v3.md` as added only because the diff range spans two
  commits; the file was created by `c8d6e0a2` and **is not modified** by the remediation. No round record was rewritten.
- **Regressions from the fixes.** The diff edits four spec documents and one constraints file. TSPEC:2462's four verbatim
  conjuncts are located by heading, not line index, and `consolidationBuild.test.js` is green. `consolidationPreflight`'s
  `Version cell reads 1.4` pin (`:184`) is green — see the note below. **0 regressions.**
- **Deferral binding (criterion 6b).** Unchanged and still bound: `D-CONS-*` names `pdlc-engineering-loop`, which has a
  queue row (`docs/_queue/QUEUE.md:41`, Order 6, `pending`) and a REQ file. **No unbound deferral.**

### The un-bumped `Version` cell — checked, and correct

The commit deliberately did not bump `vocabularies.md`'s `Version` cell while editing the file, and added a paragraph
(`:28-32`) stating the rule it relied on: a row's *enumerated value* is what the bump rule governs, and re-measuring a
`file:line` coordinate inside a row's gloss is not a bump-worthy change. I verified the premise rather than accepting it:
`consolidationPreflight.test.js:184` does pin the cell to `1.4`, `consolidationDoubles.js:162` exports
`VOCABULARY_VERSION = "1.4"`, and consumers cite the file at its version across the corpus. A bump would have reded a
shipped pin and falsified every consumer citation for no semantic delta. The judgment is right, and stating the rule in the
document rather than leaving the divergence silent is the right way to make it.

One observation, not a finding: the sibling constraints file `pdlc-advisory-corpus-baseline.md:19-20` still carries the
stricter unqualified form ("a **content change** … is itself a defect"). The two files now state different change-control
rules. Neither makes the other false — they are independently versioned files governing different corpora — so this is an
operator note about eventual convergence, not a defect.

### Environment observations (not findings)

- `node pdlc/workflows/build-runtime.mjs --check` → **exit 0**. Correct: the diff changed no bundled source, so no rebuild
  was owed.
- `pdlc/hooks/scripts/sync-workflows.sh --check` → **exit 0**.
- Full gate `npm test` → 102 of 103 suites, **4247 passed / 70 skipped / 1 failed**. The single failure is
  `documentOracles.test.js` AT-22. I checked rather than assumed: `git ls-files --error-unmatch` fails on every path it
  reports (`.tokensave/tokensave.db`, `.serena/cache/…`, `.claude/workflows/orchestrate-dev.js`), i.e. all untracked.
  `CLAUDE.md` documents this false-red explicitly. **Not a defect.**
- Consolidation suites: **19 passed, 610 tests, 0 skipped**. The anchor suite alone: **32 passed**. No unconditional skips.

---

## §2 Requirements Traceability

`167bb5f9` touched no implementation and no AC-bearing test — the only test changed is the documentation-anchor oracle. §2
is therefore **carried forward from v3 unchanged**, all 34 rows carrying both an implementation path and a failing-test
path, re-verified only where the diff could have disturbed it:

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Sev | Scope |
|---|---|---|---|---|---|---|---|
| 1–34 | — | Carried from `CODE_REVIEW-…-v3.md` §2 | unchanged | unchanged | No | — | — |
| 16 ▲ | REQ AC-3.5 | Proposal-file fallback | `consolidate-learnings.js:2168` `proposalPathFor`, `:2425` `renderProposalFile` | `consolidationOperatorChannels.test.js`; `consolidationSkillAnchors.test.js:349-365` now compares the SKILL **and every citing document** against `proposalPathFor`'s own output | No | — | — |
| 22 ▲ | REQ AC-5.1 | `failure-mode-id` convention | `:1504`, `:787` | `consolidationIdentity.test.js`; the SKILL prose pin re-verified at `SKILL.md:62` after the citing rows moved | No | — | — |

**`req_gaps: 0`.** J1 is a documentation-coordinate defect under criterion 6. Every acceptance criterion still traces to a
production path and to a test that fails if that path breaks; none of the six ACs J1 touches is *undelivered* — `Phases
exercised` is in the shipped prompt at `:78`, which is precisely why the citations moved.

---

## §3 Criterion-by-Criterion

**Criterion 1 — No stubs in production code.** Clean. The diff contains no production code of any kind. I read the changed
hunks in full rather than pattern-matching them: five documentation edits and one test file. *0 findings.*

**Criterion 2 — No unwired integrations.** Clean. The `git grep` subprocess the new derivation adds is reached on every run
and is proven live by probe E, where a newly tracked file changed the executed test count. *0 findings.*

**Criterion 3 — No mock/fake data in production.** Clean, and the guard strengthened: the proposal filename is now compared
against `proposalPathFor`'s output across seven documents rather than one, so no citer can drift back to a transcribed
name. *0 findings.*

**Criterion 4 — Branch coverage ≥ 85% and property-based testing.** Passes, unchanged:

```
node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage \
  --collectCoverageFrom='consolidate-learnings.js' --testPathPattern='consolidation'

Statements   94.26%  |  Branches   87.25%  |  Functions   93.65%  |  Lines   96.14%
Test Suites: 19 passed · Tests: 610 passed, 0 skipped
```

Identical to v2 and v3, as expected: the diff adds test and documentation over documentation surfaces and touches no module
code, so it can neither raise nor lower module coverage. Property-based testing remains present. *0 findings.*

**Criterion 5 — Requirements delivered.** Passes. All 34 rows carry both halves. No writer was added, removed or reordered,
so no AC's final operator-visible artifact is disturbed; v2's single-writer trace for the report body (`renderReportBody`,
one production caller, no later re-render) is untouched by a documentation-only diff. *0 findings.*

**Criterion 6 — Integration-boundary integrity.** One finding; the criterion is closer to closed than in any prior round but
is not closed.

*(a) Adjacent-surface falsification.* H1 and H2 are both genuinely closed, and closed at the level of mechanism rather than
of instance: the citer set is derived from the repo, a third anchor form was discovered and claimed, the `{passId}`
obligation now ranges over every citing document, and six probes red including one that adds a citer the suite had never
seen. What remains is **J1** — the same class, one file over. The warranty widened across documents but not across the two
shipped SKILLs this feature edits, and the un-warranted one is stale in six citers because T08's insertion moved a row that
five of those citers' ranges were measured against.

*(b) Sibling-surface omission.* This is J1's other face and the reason it is filed as one finding rather than two: the
family is "the shipped prompt files this feature edits", it has exactly two members, one is now mechanically guarded and
the other is neither guarded nor correct. No REQ text scopes the harvest file out — REQ:638's out-of-scope list does not
mention it, and TSPEC §3.2 row 7 puts it squarely in scope as a production edit.

*(c) Deferral binding.* Clean. `D-CONS-*` names `pdlc-engineering-loop`, which has both a queue row and a REQ file. No
prose-only successor.

**boundary_gaps: 1** (J1).

---

## §4 Recommendation

Two rounds ago this feature had six requirement gaps and a broken PR route. It now has none, 34 ACs tracing end to end,
87.25% branch coverage, a full gate green but for a documented untracked-file false-red, and a derived anchor oracle that
reds on every regression I could invent for it — including one it had never seen. The remaining work is one commit of
documentation coordinates plus a two-line change to that oracle's subject.

The pattern across rounds 2, 3 and 4 is worth naming for harvest, because it is the same defect three times and it has not
been the *same file* twice: an edit moves lines in a shipped prompt, and the coordinates in the documents that ground on it
are not re-measured. G1 was the consolidate SKILL's citers. H1 was the citers the G1 fix did not read. J1 is the *other*
SKILL, moved by an edit two waves earlier and never swept at all. Each fix has been correct and each has been scoped to the
instance it was handed. The oracle built in round 3 is the right answer to the class — it just needs to range over the
class, which is both SKILL files this feature ships, not one.

1. **J1, in one commit.** Re-measure the six ranges (`:70-78` → `:70-79`; `TSPEC:180`'s `:72-78` → `:72-79`), and fix
   `vocabularies.md:85`'s sentence properly rather than only its range — as written it enumerates a field set that no longer
   matches the table and denies the existence of a row inside its own citation. Then widen
   `consolidationSkillAnchors.test.js` from `SKILL_REL` to both bundled SKILLs. The machinery already handles multiple
   citers, multiple anchor forms and range anchors; what it does not handle is a second subject file, and that is the
   change worth making because it is what stops a fourth round of this.
2. **Consider a range conjunct while widening.** Every instance of this class in three rounds has been a *range* that stopped
   short of the block it names, or a point anchor onto a line that moved. The suite already rejects blank cited lines; the
   assertion that would have caught J1 is that a range cited as "the table" ends at the table's last row. That is derivable
   from the SKILL exactly as the point anchors already are.
3. **The dispatcher's version argument is one behind for the third consecutive round.** Not a code finding, but three in a
   row is a mechanism, not an accident, and each occurrence risks a round overwriting its predecessor's record. Worth an
   operator glance before the next dispatch.

J1 cannot produce a wrong artifact at runtime — the module owns every write, no AC is undelivered, and the sentences are
true about the SKILL's *content*. It misleads readers and the agents that ground on `docs/_constraints/`, which in this
repo is the failure mode the pipeline exists to catch. One more round should close it.

## §5 Verdict

VERDICT: Needs revision

---

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 87.25, "req_gaps": 0, "boundary_gaps": 1}
