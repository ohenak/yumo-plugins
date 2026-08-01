# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 2
**Scope:** REQ-pdlc-review-convergence v1.1, delta re-review against v1.0 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

Reviewed as a delta against the tree I read for v1 (`main` at `add6947`), through
`git diff add6947..HEAD -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
(+545 / −151, 1250 lines now). Every top-level section changed, so the "scan only what changed"
rule bought little here; what it did buy is that §1, §7 and §10.1–10.5 are substantively unchanged
and are not re-litigated below.

Two verification passes were run before any finding was written, both against `main` at `9486c81` —
the Citation baseline the header now names, which I confirmed **is** an ancestor of `HEAD`:

1. **Every `file:line` row in §4, including the seven new ones** (M-1d, M-1e, M-2e, M-2f, M-2g, and the
   corrected M-1b/M-3f). All 38 distinct line citations resolve — symbol, line and distinctive literal.
   The three SKILL citations in M-2g resolve to the exact quoted sentence. §4 is now clean; the
   drift-proofing convention plus the repo-root-relative normalisation did what it was for.
2. **The three new mechanisms' write paths in `orchestrate-dev.js`** — `appendApprovalAnchors`
   (`pdlc/workflows/orchestrate-dev.js:1934`), its sole call site
   (`pdlc/workflows/orchestrate-dev.js:1845`), `extractFileVerdict`
   (`pdlc/workflows/orchestrate-dev.js:888`) and `parseVerdict`'s trailer adjacency rule
   (`pdlc/workflows/orchestrate-dev.js:440-451`). This pass is where F-01, F-02 and F-04 came from:
   v1.1 gives three quantities a durable home and names one writer for all three, and that writer
   does not run on the rounds the quantities are needed for.

I also confirmed on disk: the three successor REQ stubs exist and are committed (`0b94fee`);
`docs/completed/pdlc-review-loop-hardening/` carries all seven artifacts.

## Round-1 disposition

All twelve of my round-1 findings are **resolved**. Recorded per finding so a later round need not
re-derive it.

| v1 finding | Disposition | Evidence |
|---|---|---|
| F-01 (High) — per-invocation budget | **resolved** | AC-1.1 states the budget is per document and names the change as a second behavioural change; AC-1.5 gives the absolute rule, the append-only start, and the operator reset. M-1d/M-1e now carry `deriveRoundWindow`. |
| F-02 (High) — absent left operand | **resolved** | AC-2.1 sources both operands from the files via `extractFileVerdict` and says why; AC-2.7 adds *unavailable* as a distinct chain-breaking state. §5's durability table generalises the answer. |
| F-03 (High) — growth endpoints not durable | **resolved as specified, but the chosen surface does not work** — see F-01 below. The REQ-altitude answer (a durable in-file anchor) is right; the writer it names cannot write it. |
| F-04 (Medium) — M-1b wrong symbol | **resolved** | M-1b now attributes the default to `pdlc/workflows/orchestrate-dev.js:1632` inside `reviewLoop`, names the `:1574` mis-attribution explicitly, and M-1d adds the second caller. Verified. |
| F-05 (Medium, DC-01) — open catalogue | **resolved** | §5's closed catalogue S-1 … S-9 with a receiver-totality column; AC-3.5(e)'s five `REVIEW-MODE:` cases; AC-4.1's four `DOC-BYTES:` cases; AC-5.5's S-7 rules; AC-6.4's unparseable rule. O-4 and O-6 narrowed to plumbing. This is a genuinely complete discharge. |
| F-06 (Medium, DC-08) — unbound deferrals | **resolved** | Three successor REQ stubs exist on the branch and are cited by path in §9.3; DC-08 names "follow-up REQ" as an accepted binding surface. |
| F-07 (Medium) — BL-01 unevaluable | **resolved** | BL-01 restated over `docs/completed/pdlc-review-loop-hardening/`, which exists with all seven artifacts; §3's closing paragraph retracts the stacked-branch claim. |
| F-08 (Medium) — unreachable baseline | **resolved** | Baseline pinned to `9486c81` on `main`; `git merge-base --is-ancestor 9486c81 HEAD` passes. Header and §3 now agree on one branch. |
| F-09 (Medium) — regime not stated | **resolved** | §2's two-regime table names the pessimistic regime as the expected steady state and attributes the unconditional claim to AC-1 alone; AC-2.6 enumerates every reachable sequence and retracts v1.0's single-fire claim. |
| F-10 (Medium) — trailer grammar | **resolved at the decision level** | AC-3.4 chooses option (a) explicitly, amends N-3, and adds the SKILL change to O-9. The residual is placement, not decision — F-04 below. |
| F-11 (Low) — thresholds without defaults | **resolved** | §6 gives both rows a default (`verifier`, ±25 lines) and states that FSPEC may change but not unset them. |
| F-12 (Low) — check 3 undetermined | **resolved** | AC-6.4 fixes the window's *direction* and §6 gives it a number satisfying both bounds. |

The four Mediums that were staleness or citation defects (F-04, F-07, F-08, F-11) are gone and the
two standing-constraint violations (DC-01, DC-08) are properly discharged. The blocking findings
below are **all new**, and all three Highs come from the same place: the durability answer chose one
writer for three anchors, and that writer runs on exactly one round per phase.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `DOC-BYTES:` cannot be written by the writer AC-4.1 names: `appendApprovalAnchors` runs **only** on the approving terminal round (`pdlc/workflows/orchestrate-dev.js:1844-1845`), and AC-4.1 asks for the anchor when a round *opens*, before that round's files exist. On every failed round — the only rounds AC-4 measures — growth is `no-anchor`, so AC-4.5 escalates every round to the full panel. This is round-1 F-03's failure mode, reintroduced through the chosen surface. | AC-4.1, S-2, §6 `DOC-BYTES:` row, AC-4.2, AC-4.5, §2 |
| F-02 | High | Local | The *crashed* predicate is not computable from the branch, and mis-classifies every **failed** verifier round. `REVIEW-MODE: verification` is written only on an approving round (AC-3.5's own Given), so a failed verifier round is "one file with no marker" = *crashed* — and AC-2.1 only ever compares failed rounds. AC-2 therefore cannot fire in the target regime, contradicting AC-2.6's table. | §5 *crashed* / *panel shape*, AC-2.4, AC-2.6, AC-3.5(a)(e) |
| F-03 | High | Local | AC-3.2(2)'s "not counted" rule has no reader. §5 defines the blocking count as the JSON trailer read by `extractFileVerdict` → `parseVerdict`; nothing can subtract a findings-table row from a single integer. Either AC-2's operand is re-derived from the table (contradicting AC-2.1 and §5) or the exclusion is prompt-borne with no oracle (contradicting S-9's purpose). The halt decision turns on it. | AC-3.2(2), S-9, §5 *blocking count*, AC-2.1 |
| F-04 | Medium | Local | AC-3.4 fixes *that* the count trailer is in the file but not *where*. `parseVerdict` requires the JSON to be the **first non-empty line after** the `VERDICT:` line (`pdlc/workflows/orchestrate-dev.js:440-451`); and because `extractFileVerdict` takes the section to EOF, the anchor block appended after it makes a trailer-less file parse **malformed**, never *unavailable* — falsifying AC-2.7's operator-visible distinction in the normal case. | AC-3.4, AC-2.7, AC-2.3, S-5 |
| F-05 | Medium | Local | AC-1.5(3)'s operator reset has no durable observable. The loop must know which rounds preceded the `RESOLVED: yes` marker to discount them; the POSTMORTEM is a single per-phase path rewritten on each halt, and §5's durability table gives AC-1.5 only the cross-review basenames. The quantity is absent from the table §5 says must be total. | AC-1.5(3), §5 durability table, AC-1.1 |
| F-06 | Low | Local | §4.7 still pins both "unmeasured at" claims to `d11dad5`, which the header itself declares unreachable from `main`. A reader cannot check either claim at the stated baseline. | §4.7 |
| F-07 | Low | Local | §3 calls `7bc559a` a "merge commit"; it is single-parent (`parents=410a43b`), the harvest-deletion commit. BL-01's stated observable is satisfied regardless, so this is a wording defect only. | §3 BL-01, §3 closing paragraph |

### F-01 (High) — `appendApprovalAnchors` runs once per phase, so `DOC-BYTES:` is never written on a round that fails

AC-4.1 gives the growth endpoints a durable home and names its writer:

> *"writes it into every cross-review file of round N as a `DOC-BYTES: {n}` anchor line (S-2), in the
> same anchor block and by the same writer as `APPROVAL-HASH:` / `REVIEWED-COMMIT:` and
> `REVIEW-MODE:` (M-4a, M-4b)"*

S-2's Emitter column and §6's `DOC-BYTES:` row say the same thing: `appendApprovalAnchors` (M-4a).
That function has exactly one call site, and it is inside the approval branch:

- `pdlc/workflows/orchestrate-dev.js:1844-1845` — `if (gatePass) {` then `await appendApprovalAnchors({`,
  followed at `:1856` by `return { converged: true, … }`.
- Its `paths` argument is `[reviewTargetPath(reviewers[0], iteration), reviewTargetPath(reviewers[1], iteration)]`
  — the **approving** round's files only.
- The FAIL path (`// (g) Invoke optimizer (FAIL path)`, `pdlc/workflows/orchestrate-dev.js:1864`) never
  touches the anchor block at all.

So `appendApprovalAnchors` fires at most **once per phase**, on the round that converges. Every round
that fails — which is every round AC-4 measures growth across, and by AC-2.1's own scoping every round
AC-2 compares — writes no anchor. Reading AC-4.1's own receive-side table, both endpoints are
`no-anchor` ⇒ growth *unmeasurable* ⇒ AC-4.5 ⇒ **full panel, every round, every phase**.

There is a second, independent impossibility in the same AC: **ordering**. AC-4.1 says the loop writes
the anchor *"When round N is opened"*, but round N's cross-review files are written by round N's
reviewers, i.e. they do not exist when the round opens. `appendApprovalAnchors` is explicit about what
it does with an absent path — `if (existingText == null) { emit("… is absent. The round yields no
approval."); return; }` at `pdlc/workflows/orchestrate-dev.js:1954-1956`. And AC-4.2 needs
`DOC-BYTES(N+1)` to select round N+1's panel, which is a value living in files that only exist after
round N+1 has been dispatched. As stated the dependency is circular.

**Why this is REQ-altitude and not DC-09-routable.** The observable consequence is which panel is
dispatched — the same externally observable behaviour my round-1 F-03 named, and the REQ agrees it is
REQ-altitude (AC-4.1 devotes three paragraphs to it). v1.1's diagnosis is right and its instinct — put
the number in the anchor block — is right; what is wrong is the identification of `appendApprovalAnchors`
as the writer, which makes §2's *target* regime and AC-2.6's rows 2–4 unreachable at ship time. The
document currently claims the pessimistic regime is expected *by prompt behaviour* (AC-4.6 not biting);
as specified it is forced *structurally*, which is a different and stronger statement the document does
not make.

**Required change.** Name a writer that runs on every round and a moment at which the round's files
exist — the natural one is "after round N's reviewers return and before AC-2 is evaluated", appending
to the same anchor block in the round's own files, with `appendApprovalAnchors` extended or a sibling
appender named. State the growth formula over the endpoints that are then actually available
(`DOC-BYTES(N)` and `DOC-BYTES(N−1)`, both in the past), so AC-4.2's panel selection for round N+1 reads
only anchors that already exist. Either that, or say plainly that growth is structurally unmeasurable
and AC-3 never takes its single-verifier path — but then AC-3 and §2's target regime should be
withdrawn rather than specified.

### F-02 (High) — a failed verifier round reads as *crashed*, so AC-2 cannot fire in the regime it was designed for

§5 defines:

> **crashed** round — *"A round whose file set is a strict subset of the panel that opened it — one
> file with no `REVIEW-MODE: verification` marker, or zero files."*

and AC-2.4 makes a crashed round *"neither a trigger nor a baseline"*. But `REVIEW-MODE: verification`
is appended by `appendApprovalAnchors` (AC-3.5(a), S-1, §6), whose Given in AC-3.5 is *"round N ≥ 2
dispatched a single verifier **which approved**"* — and whose only call site is the `gatePass` branch
(F-01). A verifier round that **did not** approve therefore leaves exactly one file carrying no marker.

Compose that with AC-2.1, which is scoped to *"a failed round N ≥ 2"*. Every round AC-2 ever compares
is a failed round; under AC-3.1 every failed round N ≥ 2 in the target regime is a verifier round;
every such round is *crashed* by §5's definition; and a crashed round is never comparable and never a
baseline. **AC-2 cannot fire in the `dual, verifier, verifier` regime at all** — which is precisely the
regime AC-2.6's second table row says it fires in at round 3, and the regime §2 calls the target.

The definition also has a self-reference the document does not resolve. *crashed* is defined against
*"the panel that opened it"*, and §5 states two paragraphs earlier that panel shape is *"**not** the
set of roles dispatched: nothing records a dispatch"*. So the predicate's own reference quantity is
declared unrecorded, and the marker is the only proposed substitute. It cannot be, per the above.

Worth noting the discriminator the REQ already has and does not use: §6 fixes the verifier's slug at
**`verifier`**, disjoint from `software-engineer` / `test-engineer`. A lone file whose slug is
`verifier` is a verifier round on its face; a lone file whose slug is a panel role is a crashed dual
round. That distinction is durable, is written by the existing path derivation (M-3b) on *every* round
including failed ones, and needs no marker. The marker is still justified for the *approval* path
(M-3d reads records, and AC-3.5(b)'s fail-closed posture is right), but AC-2.4's comparability test
must not be stated over it.

**Required change.** State the comparability test over a quantity every round produces: the on-disk
role-slug set alone, with `{verifier}` and `{software-engineer, test-engineer}` as the two canonical
shapes and anything else (a strict subset of a canonical shape, or the empty set) *crashed*. Then
either drop the marker from §5's *crashed* definition, or say explicitly that the marker is required
on **every** verifier round's file, not only an approving one — which is a different writer again
(F-01) and would need AC-3.5's Given widened accordingly.

### F-03 (High) — AC-3.2(2)'s "not counted" has no reader, and it moves AC-2's halt threshold

AC-3.2(2) closes with:

> *"A blocking finding with an empty or absent `New-mechanism:` field is **not counted** in the
> `high`/`medium` totals of AC-2 and is reported as a malformed finding in the run report."*

§5 defines that total as:

> *"The sum of `high` + `medium` … **read from the file** by `extractFileVerdict` → `parseVerdict`
> (M-2e), not from the agent response."*

Those two cannot both be executed by the same reader. `parseVerdict` returns the integers from a single
JSON object (`pdlc/workflows/orchestrate-dev.js:454-470`, keys validated to be exactly
`{high, medium, low}`); it never sees the findings table, and there is no stated mechanism to subtract
a row from an integer. Three readings are available and the REQ does not choose:

1. **AC-2 re-derives counts from the findings table.** This contradicts AC-2.1's *"both operands are
   read from the cross-review files … by `extractFileVerdict` → `parseVerdict`"* and §5's definition,
   and would need its own closed grammar for the findings table (which row is a blocking finding? which
   column is `New-mechanism:`?) — none of which exists in the catalogue.
2. **The verifier is told to exclude such findings from the trailer it writes.** Then the rule is
   prompt-borne with no oracle, which is exactly what S-9 was introduced to fix (TE F-05's complaint,
   answered in v1.1 by naming a structural artifact). A trailer that disagrees with the table would be
   undetectable, and the REQ's claim that S-9 makes clause 2 falsifiable would be false.
3. **Nothing excludes anything and the sentence is aspirational.** Then AC-3.2(2)'s consequence clause
   is dead text.

This is not a mechanism question routable under DC-09: `blocking(N)` is the operand of a halt, so the
choice changes whether the pipeline stops on a given round — externally observable, and observable
differently depending on which of the three readings an implementer picks.

Note the neighbouring rules do **not** have this problem, which is what makes the gap visible: AC-5.2's
`## Measurement Required` items and AC-6.5's citation fixes are never filed as blocking findings in the
first place, so nothing has to be subtracted. AC-3.2(2) alone asks for a filed finding to be discounted
after the fact.

**Required change.** Pick reading 1 or reading 2 and say so in AC-3.2(2). If 1: add the findings-table
row grammar to §5's catalogue as S-10 and restate §5's *blocking count* and AC-2.1 over it. If 2: say
the verifier's trailer excludes such findings, drop "not counted in the totals of AC-2" in favour of
"the verifier does not count it", and record in R-5 that this half of S-9 is directive rather than
enforced — which is honest and cheap, and leaves the run report's malformed-finding notice as the only
mechanical half.

### F-04 (Medium) — the in-file trailer's *placement* is unspecified, and the anchor block turns "no trailer" into *malformed*, not *unavailable*

AC-3.4 makes the right decision (my round-1 F-10 asked for exactly this) but stops one clause short of
the shipped parser. Two consequences, both operator-visible:

**(a) Adjacency.** `parseVerdict` does not search the section for a JSON object. It takes the **first
non-empty line after** the `VERDICT:` line and `JSON.parse`s it:

- `pdlc/workflows/orchestrate-dev.js:440-451` — `// Find next non-empty line after the VERDICT line`,
  then the loop from `verdictLineIndex + 1`, then `if (nextNonEmpty === null) return { verdict:
  rawVerdict, high: 0, medium: 0, low: 0 };`
- `pdlc/workflows/orchestrate-dev.js:454-462` — `JSON.parse(nextNonEmpty)`, and on throw it returns the
  `malformed: true` fallback.

AC-3.4 says only *"inside that same section, after the `VERDICT:` line"*. Every `## Verdict` section in
this repo today — including both round-1 cross-reviews of this document — puts prose **before** the
`VERDICT:` line and ends the file there. A reviewer that follows AC-3.4 literally and writes a
sentence between the verdict and the JSON produces a *malformed* file. This is a grammar the REQ is
now declaring, so the adjacency constraint belongs in it.

**(b) The anchor block is inside the section.** `extractFileVerdict` takes the section from the last
`## Verdict` heading **to EOF** (`pdlc/workflows/orchestrate-dev.js:898`, `const section =
lines.slice(headingIndex).join("\n")`). `appendApprovalAnchors` appends its block to the end of the
file (`pdlc/workflows/orchestrate-dev.js:1975`), i.e. inside that section and after the `VERDICT:`
line. So for any file carrying anchors, a *missing* trailer means the next non-empty line is
`APPROVAL-HASH: …` (or, once AC-4.1 lands, `DOC-BYTES: …`), `JSON.parse` throws, and the result is
**`malformed: true`** — not the truncated-output `0/0/0` path, and therefore not AC-2.7's *unavailable*
state at all.

AC-2.7 says the two states *"are different states and are reported differently on purpose"*, and S-5's
enum carries both `malformed-count` and `unavailable-count`. If AC-4.1 puts an anchor on every round's
files (its intent), `unavailable-count` becomes unreachable for any file that has a `## Verdict`
section, and every lagging-SKILL round (R-7's scenario, measured at 3 of 10 files on the predecessor)
is reported as `malformed` instead. The halt behaviour is unaffected — both break the chain — but the
distinction the REQ built for the operator inverts.

**Required change.** In AC-3.4, state that the trailer is the **first non-empty line following the
`VERDICT:` line**, and that the `## Verdict` section ends with `VERDICT:` then the trailer, with the
anchor block following. In AC-2.7, restate the *unavailable* case over what is actually observable —
no `## Verdict` section, or a section whose post-`VERDICT:` content is an anchor line rather than a
trailer — or fold the two reasons into one and say why.

### F-05 (Medium) — AC-1.5(3)'s operator reset has no durable observable

AC-1.5 clause 3:

> *"the rounds recorded **before** that marker do not count against the budget of the window opened
> after it."*

The loop must therefore compute an offset: the highest round index at the moment the operator wrote
`RESOLVED: yes`. Nothing on the branch records it.

- The POSTMORTEM is one path per phase — `` const postmortemPath = `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md` `` at
  `pdlc/workflows/orchestrate-dev.js:1569` — rewritten on each halt, so a second halt overwrites the
  first and no history survives.
- §5's durability table gives AC-1.5 exactly one row: *"Highest round reached for a document … Same
  basenames"*. The basenames give the highest round; they do not say which of them preceded the marker.
- §5 states its own bar: *"An AC stated over a row marked in-process only is a defect in this
  document."* This quantity is not in the table at all, which is the same defect one step earlier.

The consequence is the observable AC-1.5 exists to fix: after an operator resolves a halt, how many
rounds does the loop admit? Clause 1 says a branch with 3 existing rounds is admitted **none**; clause 3
says the operator's reset grants a fresh window. Which wins is determined by a quantity nobody can read.
On the current relative arithmetic the answer happens to be "rounds 4…6", i.e. exactly the
per-invocation behaviour AC-1.1 is replacing.

**Required change.** Name the durable surface — the natural candidate is the POSTMORTEM itself: it is
already the thing the operator edits, it already records its window (`` const window = `rounds ${first}..${last}` ``,
`pdlc/workflows/orchestrate-dev.js:1575`), and a `RESOLVED: yes` marker sitting beside a recorded
`rounds 1..3` is a complete offset. Add the row to §5's durability table so the invariant that section
asserts stays true.

### F-06 (Low) — §4.7's two "unmeasured at" claims are pinned to a commit the header declares unreachable

§4.7 still reads *"Unmeasured at `d11dad5`; recorded as unmeasured by the predecessor REQ's §4a A-8."*
The header row now states that `d11dad5` *"is not an ancestor of `main` and therefore not reachable
from where this document is reviewed"*, and the whole point of moving the baseline to `9486c81` was
that a reviewer can check every claim from where they stand. These two claims cannot be checked there.
They are also the two facts §4.7 exists to make checkable. Low because the claims are almost certainly
still true and nothing depends on them; the fix is to restate them at `9486c81` or to drop the sha.

### F-07 (Low) — `7bc559a` is not a merge commit

§3 twice calls `7bc559a` the merge commit for `pdlc-review-loop-hardening`. It is single-parent
(`parents=410a43b`) and its subject is *"docs(harvest): delete 53 harvested CROSS-REVIEW/CODE_REVIEW
artifacts"*. BL-01's Resolution form is stated over the **directory**, which does exist, so the gate is
evaluable and passes; only the parenthetical is wrong. Low, and adjacent to P-4's class — a claim about
the repo stated in passing and not checked.

## Mechanical fixes (AC-6 class — not findings)

Applied without discussion; these do **not** contribute to the counts above and do not block approval.

| # | Location | Fix |
|---|---|---|
| MF-1 | §4.7 | `d11dad5` → the current baseline, or drop the sha (raised as F-06 rather than left here, because the header makes reachability a stated property of every claim). |
| MF-2 | §3 | "merge commit `7bc559a`" → "`7bc559a`" (raised as F-07 for the same reason). |
| MF-3 | §4.3 M-3d | The row cites `pdlc/workflows/orchestrate-dev.js:2478` as "function `tier1ApprovalRecord`"; the declaration is `function tier1ApprovalRecord(...)` — **not** `async`, unlike M-3f's neighbour which is. Both resolve; naming the difference would stop a reader inferring symmetry. |
| MF-4 | §5 S-4 | The halt reason interpolates `{MAX_REVIEW_ROUNDS}` by name inside a user-facing string while AC-1.5's example renders it as `rounds 1..3 of 3`. Show the rendered form only, so the catalogue entry and the example cannot disagree. |

All 38 distinct `file:line` citations in §4, and the three SKILL citations in M-2g, resolved exactly —
symbol, line and distinctive literal — at `9486c81`. §4 is the cleanest it has been; nothing else in it
needs a fix.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Which writer appends `DOC-BYTES:` on a **failed** round? `appendApprovalAnchors` has one call site and it is inside `if (gatePass)`. If the answer is "extend that function and call it unconditionally", does the round's no-approval emit path (`existingText == null`, unequal hash, `≥ 2` anchors) still mean "no approval", or does it now only mean "no anchor"? |
| Q-02 | Is `DOC-BYTES(N)` written into round N's files (which do not exist when round N opens), or into round N−1's files (which do)? AC-4.2's panel selection for round N+1 needs both endpoints to pre-exist the dispatch. |
| Q-03 | Given the verifier's slug is `verifier` and is disjoint from the panel slugs, what does `REVIEW-MODE:` add to the **comparability** test that the slug does not? I can see what it adds to the approval test (M-3d reads records, not slugs) — is that the whole of its job? |
| Q-04 | For AC-3.2(2): does AC-2's blocking count come from the trailer the verifier writes (so the exclusion is the verifier's own arithmetic) or from the findings table (so the loop re-derives it)? The document reads both ways in different places. |
| Q-05 | After an operator writes `RESOLVED: yes`, what does the loop read to know which rounds preceded it? If the answer is the POSTMORTEM's recorded window, should that be a §5 durability row? |

## Positive Observations

- **The durability answer is the right answer, and it is generalised rather than patched.** §5's
  durability table with its stated invariant — *"An AC stated over a row marked in-process only is a
  defect in this document"* — converts my three round-1 Highs from three fixes into one property of
  the document. Three of my four new findings are about *which surface* the property is discharged on,
  not about the property. That is a materially better place to be arguing from.
- **§5's closed catalogue is a complete DC-01 discharge.** Nine strings, each with emitter, receiver
  and a receiver-totality justification; AC-3.5(e)'s five cases and AC-4.1's four cases are stated as
  tables with an approval/notice column, all fail-closed. O-4 and O-6 are correctly narrowed to
  plumbing. I raised DC-01 as a Cross-Feature Medium last round; there is nothing left of it.
- **§9.3 discharged DC-08 by the hardest available route.** Three real stub REQ files on the branch,
  each `ready: false`, cited by path — not a queue row the authoring agent is forbidden to write, and
  not a prose promise. The third stub exists precisely because POSTMORTEM R-3's successors were never
  created, and the document says so.
- **AC-2.6's reachable-sequence table is a model of how to retract a claim.** It enumerates all four
  panel-shape sequences, states which regime each belongs to, and says outright that v1.0's figure was
  true of one regime only. §2's two-regime table does the same for the cost claim and names the
  pessimistic regime as expected. This is the finding I was least confident would be answered honestly.
- **AC-3.2's two named literals are exactly the right instrument.** `## Disposition` and
  `New-mechanism:` turn two prose obligations into artifacts a reader can check, on the same principle
  as `Scope:` and `## Verdict`. F-03 is a gap in *who reads* one of them, not a criticism of the move.
- **AC-6.4's evidence-driven grammar.** Measuring v1.0's own citations (3 C-1, 13 bare basenames, 14
  bare `:NNN`) and concluding that the checker as first specified would have been blind or
  false-positive on ~82% of its corpus is the best piece of self-verification in the document — and the
  normalisation of all 38 citations to C-1/C-2 is why my §4 pass this round found nothing.
- **AC-1.5 answers a question I only half-asked.** I asked whether the budget was per invocation or per
  document; AC-1.5 also worked out that an absolute cap without an operator escape hatch is a dead end,
  and bound the reset to the existing `RESOLVED: yes` marker rather than inventing one. F-05 is about
  its missing observable, not its design.

## Recommendation

**Needs revision** — three High and two Medium findings, all new; all twelve round-1 findings resolved.

### What changed in the shape of the disagreement

Round 1: three Highs about *whether* cross-round state is durable, plus two standing-constraint
violations and four staleness defects. All nine of those are gone. Round 2's three Highs are about
*which existing writer* can carry the durable state, and they are narrower in the same direction:

- **F-01 and F-02 share one root cause.** Both `DOC-BYTES:` and `REVIEW-MODE:` were assigned to
  `appendApprovalAnchors` because it is the repo's existing durable-marker writer — a good instinct.
  But that function is called from exactly one place, inside `if (gatePass)`, so it runs on the round
  that *approves* and on no other. Every quantity AC-2 and AC-4 need is needed on rounds that
  **failed**. One sentence naming a writer that runs per round, plus AC-3.5's Given widened, closes
  both.
- **F-03 is a single unresolved choice** between two readings the document already contains, and the
  cheaper reading (the verifier's own arithmetic, recorded as directive in R-5) costs three sentences.
- **F-04 and F-05** are each one missing clause: an adjacency rule in AC-3.4, and a durability row in
  §5 for the reset offset.

None of the five requires new mechanism, and none contests a decision. If the trajectory the preamble
asks the operator to watch is what matters: blocking count 10 → 5, Highs 3 → 3, and the *content* of
the Highs moved from "the ACs are stated over state that does not exist" to "the ACs name a writer that
does not run at that moment". Every round-1 finding was resolved and none recurred.

### Why this is not an "approve and route downstream" round under DC-09

I applied DC-09's test to each finding before filing it, and again declined to file the several "this
has no fixture / no test yet" observations I had — §8's O-1 … O-11 discharge them.

The three Highs survive because each names an **externally observable behaviour that the document's own
mechanism cannot produce**:

- **F-01** — which panel is dispatched. As specified, `no-anchor` on every failed round forces the full
  panel every round, so AC-3's single-verifier path and §2's target regime are unreachable *by
  construction*, not by AC-4.6 failing to bite. The document claims the opposite reason.
- **F-02** — whether AC-2 can fire at all. In the target regime every comparable pair is two failed
  verifier rounds, both *crashed* by §5's own definition. AC-2.6's table says the rule fires at round 3
  there.
- **F-03** — whether the loop halts on a given round, since `blocking(N)` is the operand and AC-3.2(2)
  changes it by an amount no named reader can compute.

**F-04 and F-05** are Medium: F-04 inverts an operator-facing distinction (AC-2.7) the document
deliberately built and leaves a declared file grammar underspecified against the parser that reads it;
F-05 leaves an AC's stated behaviour undetermined on the state it exists to handle. Both are internal
inconsistencies, which the preamble puts explicitly in scope.

**F-06 and F-07** are Low and are citation-class defects — recorded, not blocking.

### Explicit non-findings

Recorded so a later round does not re-raise them:

- I do **not** contest any of the six decisions, and did not last round either.
- I do **not** file R-5's known unenforceability of AC-5 and AC-4.6; R-5 invites it as Low and I accept
  the disposition.
- I do **not** file AC-3.5(c)/(d) or R-6's mixed-panel integration risk as a finding. It is the
  highest-risk part of the change, it is correctly identified as such, and O-1/O-2/O-4/O-10 discharge
  it downstream.
- I have **no** blocking finding against REQ-RCV-06 or REQ-RCV-05. AC-6.1 … AC-6.8 are implementable as
  written against `pdlc/workflows/lib/` today; AC-5's mechanical half is a section extraction and its
  prompt half is honestly labelled.
- REQ-RCV-01 is approvable **but for F-05**; REQ-RCV-02, REQ-RCV-03 and REQ-RCV-04 are not, pending
  F-01, F-02, F-03 and F-04.
- I raised **no** `## Measurement Required` items. Every finding above was settled by reading the tree.

### Trajectory note (preamble stopping rule)

Round 2 of 5 under the current behaviour. Blocking count 5, down from 10 — **decreasing**, so the
preamble's fixed-point test does not fire on my side. Recorded for the operator's hand-applied
trajectory table. Four of the five are closable by naming a writer, choosing between two readings the
document already contains, or adding one clause; none needs a new mechanism.

## Verdict

**Needs revision.**

All twelve round-1 findings are resolved and none recurred; the two standing-constraint violations
(DC-01, DC-08) are fully discharged and §4's 38 citations now resolve exactly. Three new High findings
and two new Mediums block: `DOC-BYTES:` and `REVIEW-MODE:` are assigned to `appendApprovalAnchors`,
which runs only on the approving round, so both anchors are absent on precisely the failed rounds AC-2
and AC-4 read (F-01, F-02); AC-3.2(2)'s "not counted" rule has no reader that can execute it (F-03);
AC-3.4's in-file trailer has no placement rule against the parser it names, which also inverts AC-2.7's
operator-facing distinction (F-04); and AC-1.5(3)'s reset offset has no durable observable (F-05).
REQ-RCV-05 and REQ-RCV-06 are approvable as written.

VERDICT: Needs revision
